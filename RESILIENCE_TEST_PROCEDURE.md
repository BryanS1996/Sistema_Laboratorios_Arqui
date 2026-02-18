# Prueba de Resiliencia Redis - Procedimiento Manual

## Script de Ejecución Paso a Paso

### Terminal 1: K6 (Ya corriendo)
```powershell
# YA EJECUTADO
k6 run stress_test_logs_fullstack.js
```

---

## ⏱️ CRONOGRAMA DE ACCIONES

### Minuto 0-1: Warm-up (dejamos correr)
**Acción:** NINGUNA - Solo observar
**Objetivo:** Llenar cache Redis con logs
**Esperado:**
- ✅ Dashboard readers obtienen logs desde BD
- ✅ Cache Redis se llena
- ✅ Métricas: http_req_failed < 5%

---

### Minuto 1-1.5: **TUMBAR POSTGRESQL**

#### Terminal 2 - Ejecutar:
```powershell
# FASE CRÍTICA: Tumbar base de datos
docker-compose stop postgres

Write-Host "💥 PostgreSQL DETENIDO" -ForegroundColor Red
Write-Host "⏳ Observando resiliencia por 30 segundos..." -ForegroundColor Yellow
```

**Resultado Esperado:**
- ✅ **Dashboard readers (escenario 2) siguen funcionando** con cache
- ❌ Log generators (escenario 1) comienzan a fallar (escrituras BD)
- 📊 Tasa de error sube a ~30-50% (solo escrituras)
- ⚡ Lecturas desde cache son RÁPIDAS (< 100ms)

---

### Minuto 1.5-2: Monitoreo de Cache

#### Terminal 3 - Verificar Redis:
```powershell
# Ver cache hits
docker exec gestor_lab_redis redis-cli INFO stats | Select-String "keyspace_hits|keyspace_misses"

# Ver logs cacheados
docker exec gestor_lab_redis redis-cli KEYS "*logs*"

# Monitorear comandos en tiempo real
docker exec gestor_lab_redis redis-cli MONITOR
```

---

### Minuto 2-2.5: Restaurar BD

#### Terminal 2 - Ejecutar:
```powershell
# Restaurar PostgreSQL
docker-compose start postgres

Write-Host "✅ PostgreSQL RESTAURADO" -ForegroundColor Green
Write-Host "⏳ Esperando recuperación completa..." -ForegroundColor Cyan

# Esperar 10s
Start-Sleep 10
```

**Resultado Esperado:**
- ✅ Aplicación recupera funcionalidad completa
- ✅ Escrituras vuelven a funcionar
- ✅ Tasa de error baja a < 5%
- 🎯 **PRUEBA EXITOSA: Redis mantuvo app parcialmente funcional**

---

## Comandos Útiles

### Ver logs del backend durante el test:
```powershell
docker-compose logs -f backend --tail=30
```

### Ver estado de PostgreSQL:
```powershell
docker ps | Select-String "postgres"
```

### Ver métricas finales de k6:
```powershell
# Al final del test, k6 mostrará:
# - http_req_duration por escenario
# - http_req_failed por escenario
# - Comparar log_generators vs dashboard_readers
```

---

## Indicadores de Éxito

### ✅ ÉXITO Total:
1. **Dashboard readers** mantienen < 10% error cuando BD cae
2. **Cache hits** > 50% durante BD caída
3. **Latencia cached** < 100ms vs > 1000ms sin cache
4. **Recuperación** automática al restaurar BD

### ⚠️ ÉXITO Parcial:
1. Dashboard readers fallan al 30-50% (cache ayuda pero no es suficiente)
2. Some cache hits pero no mayoría
3. Latencia mejora pero no tanto

### ❌ FALLO:
1. Dashboard readers fallan 100%
2. Cache hits = 0%
3. Aplicación totalmente caída sin BD

---

## Notas Clave

> **El objetivo NO es que la app funcione 100% sin BD.**
>
> El objetivo ES demostrar **resiliencia parcial**:
> - Las LECTURAS de dashboard siguen funcionando (datos históricos cached)
> - Las ESCRITURAS fallan (normal, son operaciones transaccionales)
> - La experiencia del usuario se degrada pero NO colapsa completamente

**Esto es especialmente importante para el dashboard de logs**, donde:
- Los admins pueden seguir viendo logs recientes (cached)
- Aunque no se generen nuevos logs (BD caída)
- Manteniendo visibilidad del sistema durante problemas

---

## Ejecutar Ahora

**1. K6 ya está corriendo** ✅

**2. Espera 1 minuto** (warm-up cache)

**3. En terminal 2, ejecuta:**
```powershell
docker-compose stop postgres
```

**4. Observa k6 por 30 segundos**

**5. Restaura:**
```powershell
docker-compose start postgres
```

**6. Analiza resultados finales**
