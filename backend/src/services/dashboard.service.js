const { getFactory } = require("../factories");

class DashboardService {
  constructor() {
    this.reservaDAO = getFactory().createReservaDAO();
    this.userDAO = getFactory().createUserDAO();
    
    if (!this.reservaDAO) {
      throw new Error('ReservaDAO no está disponible');
    }
    if (!this.userDAO) {
      throw new Error('UserDAO no está disponible');
    }
  }

  /**
   * Obtener estadísticas generales de reservas
   * @param {string} timeRange - 'day', 'week', 'month'
   * @returns {Promise<Object>}
   */
  async getReservationStats(timeRange = 'month') {
    try {
      console.log(`[Dashboard] Getting stats for timeRange: ${timeRange}`);
      
      if (!this.reservaDAO || !this.reservaDAO.findAll) {
        throw new Error('ReservaDAO no tiene método findAll()');
      }

      const all = await this.reservaDAO.findAll();
      console.log(`[Dashboard] Retrieved ${all?.length || 0} reservations`);
      
      if (!Array.isArray(all)) {
        throw new Error('findAll() no retornó un array');
      }

      const now = new Date();
      const filtered = this._filterByTimeRange(all, timeRange, now);
      console.log(`[Dashboard] Filtered to ${filtered.length} reservations for ${timeRange}`);

      return {
        total: filtered.length,
        timeRange,
        byDay: this._aggregateByDay(filtered),
        byLab: this._aggregateByLab(filtered),
        byHour: this._aggregateByHour(filtered)
      };
    } catch (error) {
      console.error('Error getting reservation stats:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Obtener top 5 usuarios con más reservas
   * @returns {Promise<Array>}
   */
  async getTopUsers() {
    try {
      console.log('[Dashboard] Getting top users');
      
      const all = await this.reservaDAO.findAll();
      console.log(`[Dashboard] Retrieved ${all?.length || 0} reservations for top users`);
      
      if (!Array.isArray(all) || all.length === 0) {
        return [];
      }

      // Agrupar por userId
      const grouped = {};
      all.forEach(r => {
        grouped[r.userId] = (grouped[r.userId] || 0) + 1;
      });

      // Convertir a array y ordenar
      const sorted = Object.entries(grouped)
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Enriquecer con datos del usuario
      const enriched = await Promise.all(
        sorted.map(async (item) => {
          try {
            const user = await this.userDAO.findById(item.userId);
            return {
              userId: item.userId,
              nombre: user?.nombre || 'Usuario desconocido',
              email: user?.email || '',
              reservations: item.count
            };
          } catch {
            return {
              userId: item.userId,
              nombre: 'Usuario desconocido',
              email: '',
              reservations: item.count
            };
          }
        })
      );

      console.log(`[Dashboard] Top users processed: ${enriched.length}`);
      return enriched;
    } catch (error) {
      console.error('Error getting top users:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Obtener horarios más recurrentes
   * @returns {Promise<Array>}
   */
  async getMostCommonHours() {
    try {
      console.log('[Dashboard] Getting most common hours');
      
      const all = await this.reservaDAO.findAll();
      console.log(`[Dashboard] Retrieved ${all?.length || 0} reservations for common hours`);
      
      if (!Array.isArray(all) || all.length === 0) {
        return [];
      }

      const hourPairs = {};
      all.forEach(r => {
        try {
          const key = `${r.horaInicio}-${r.horaFin}`;
          hourPairs[key] = (hourPairs[key] || 0) + 1;
        } catch (e) {
          console.warn('Error processing hour pair:', e.message);
        }
      });

      const sorted = Object.entries(hourPairs)
        .map(([hours, count]) => {
          const [start, end] = hours.split('-');
          return { horaInicio: start, horaFin: end, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      console.log(`[Dashboard] Common hours processed: ${sorted.length}`);
      return sorted;
    } catch (error) {
      console.error('Error getting most common hours:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  /**
   * Obtener todas las estadísticas combinadas
   * @returns {Promise<Object>}
   */
  async getAllStats(timeRange = 'month') {
    const [stats, topUsers, commonHours] = await Promise.all([
      this.getReservationStats(timeRange),
      this.getTopUsers(),
      this.getMostCommonHours()
    ]);

    return {
      stats,
      topUsers,
      commonHours
    };
  }

  // Helper methods
  _filterByTimeRange(reservations, timeRange, now) {
    if (!Array.isArray(reservations) || reservations.length === 0) {
      return [];
    }

    const start = new Date();
    
    switch (timeRange) {
      case 'day':
        start.setDate(now.getDate() - 1);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
      default:
        start.setMonth(now.getMonth() - 1);
        break;
    }

    return reservations.filter(r => {
      try {
        // Manejar diferentes formatos de fecha (String YYYY-MM-DD o Date)
        let rDate;
        if (typeof r.fecha === 'string') {
          rDate = new Date(r.fecha);
        } else if (r.fecha instanceof Date) {
          rDate = r.fecha;
        } else {
          return false;
        }

        // Validar que sea una fecha válida
        if (isNaN(rDate.getTime())) {
          return false;
        }

        return rDate >= start && rDate <= now;
      } catch {
        return false;
      }
    });
  }

  _aggregateByDay(reservations) {
    const days = {};
    reservations.forEach(r => {
      // Asegurarse de que r.fecha es una string en formato YYYY-MM-DD
      let dateKey = r.fecha;
      if (typeof r.fecha === 'object') {
        // Si es Date, convertir a YYYY-MM-DD
        const d = new Date(r.fecha);
        dateKey = d.toISOString().split('T')[0];
      }
      days[dateKey] = (days[dateKey] || 0) + 1;
    });

    return Object.entries(days)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  _aggregateByLab(reservations) {
    const labs = {};
    reservations.forEach(r => {
      labs[r.laboratorio] = (labs[r.laboratorio] || 0) + 1;
    });

    return Object.entries(labs)
      .map(([lab, count]) => ({ lab, count }))
      .sort((a, b) => b.count - a.count);
  }

  _aggregateByHour(reservations) {
    const hours = {};
    reservations.forEach(r => {
      const hour = r.horaInicio.split(':')[0]; // Extraer solo la hora
      hours[hour] = (hours[hour] || 0) + 1;
    });

    return Object.entries(hours)
      .map(([hour, count]) => ({ hour: `${hour}:00`, count }))
      .sort((a, b) => {
        const aNum = parseInt(a.hour);
        const bNum = parseInt(b.hour);
        return aNum - bNum;
      });
  }
}

module.exports = new DashboardService();
