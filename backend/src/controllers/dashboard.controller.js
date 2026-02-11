const dashboardService = require('../services/dashboard.service');

class DashboardController {
  async getStats(req, res) {
    try {
      const { timeRange = 'month' } = req.query;
      const stats = await dashboardService.getReservationStats(timeRange);
      res.json(stats);
    } catch (error) {
      console.error('Dashboard stats error:', error.message, error.stack);
      res.status(500).json({ error: error.message || 'Error al obtener estadísticas' });
    }
  }

  async getTopUsers(req, res) {
    try {
      const topUsers = await dashboardService.getTopUsers();
      res.json(topUsers);
    } catch (error) {
      console.error('Dashboard top users error:', error.message, error.stack);
      res.status(500).json({ error: error.message || 'Error al obtener usuarios' });
    }
  }

  async getCommonHours(req, res) {
    try {
      const hours = await dashboardService.getMostCommonHours();
      res.json(hours);
    } catch (error) {
      console.error('Dashboard common hours error:', error.message, error.stack);
      res.status(500).json({ error: error.message || 'Error al obtener horarios' });
    }
  }

  async getAllStats(req, res) {
    try {
      const { timeRange = 'month' } = req.query;
      const allStats = await dashboardService.getAllStats(timeRange);
      res.json(allStats);
    } catch (error) {
      console.error('Dashboard all stats error:', error.message, error.stack);
      res.status(500).json({ error: error.message || 'Error al obtener estadísticas' });
    }
  }
}

module.exports = new DashboardController();
