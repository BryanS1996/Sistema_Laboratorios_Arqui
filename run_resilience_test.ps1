# ================================================================
# PRUEBA AUTOMATIZADA DE RESILIENCIA REDIS
# ================================================================
# Este script ejecuta un test de saturación con K6 y tumba PostgreSQL
# automáticamente para demostrar que Redis cache mantiene la app funcionando
# ================================================================

param(
    [int]$WarmupSeconds = 60,
    [int]$DowntimeSeconds = 30
)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      PRUEBA DE RESILIENCIA - Redis Cache Durante BD Caída    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ================================================================
# FASE 0: Verificación inicial
# ================================================================
Write-Host "📋 Verificando prerequisitos..." -ForegroundColor Yellow

# Verificar que k6 está instalado
if (!(Get-Command k6 -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ERROR: k6 no está instalado" -ForegroundColor Red
    Write-Host "   Instalar: choco install k6" -ForegroundColor Gray
    exit 1
}

# Verificar que el test existe
if (!(Test-Path "stress_test_logs_fullstack.js")) {
    Write-Host "❌ ERROR: stress_test_logs_fullstack.js no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar que PostgreSQL está corriendo
$pgStatus = docker ps --filter "name=gestor_lab_postgres" --format "{{.Status}}"
if (!$pgStatus -or $pgStatus -notlike "*Up*") {
    Write-Host "❌ ERROR: PostgreSQL no está corriendo" -ForegroundColor Red
    Write-Host "   Ejecutar: docker-compose up -d postgres" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Prerequisitos OK" -ForegroundColor Green
Write-Host ""

# ================================================================
# FASE 1: Iniciar K6 en background
# ================================================================
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  FASE 1: Iniciando test K6 (warm-up $WarmupSeconds segundos)        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Lanzando K6 con Web Dashboard..." -ForegroundColor Green
Write-Host "   Dashboard estará disponible en: http://127.0.0.1:5665" -ForegroundColor Cyan
Write-Host ""

# Iniciar K6 con web dashboard en background
$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    $env:K6_WEB_DASHBOARD = "true"
    k6 run stress_test_logs_fullstack.js 2>&1
}

Write-Host "✅ K6 iniciado (Job ID: $($job.Id))" -ForegroundColor Green
Write-Host ""

# Esperar un poco para que K6 inicie el dashboard
Write-Host "⏳ Esperando a que el web dashboard inicie..." -ForegroundColor Yellow
Start-Sleep 8

# Mostrar output inicial de K6
Write-Host "📊 Output inicial de K6:" -ForegroundColor Yellow
Receive-Job -Job $job | Select-Object -First 25
Write-Host ""

# Instrucciones para abrir el dashboard
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  🌐 ABRE EL WEB DASHBOARD EN TU NAVEGADOR:                   ║" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║     http://127.0.0.1:5665                                     ║" -ForegroundColor Cyan
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║  Verás gráficas en tiempo real de:                           ║" -ForegroundColor Green
Write-Host "║  • HTTP Requests (log_generators vs dashboard_readers)       ║" -ForegroundColor Gray
Write-Host "║  • Request Duration (latencia)                               ║" -ForegroundColor Gray
Write-Host "║  • Checks (tasa de éxito)                                    ║" -ForegroundColor Gray
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Intentar abrir el navegador automáticamente
try {
    Start-Process "http://127.0.0.1:5665"
    Write-Host "✅ Navegador abierto automáticamente" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Abre manualmente el navegador en: http://127.0.0.1:5665" -ForegroundColor Yellow
}
Write-Host ""

# ================================================================
# FASE 2: Warm-up - Llenar cache Redis
# ================================================================
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  FASE 2: Warm-up - Llenando cache Redis ($WarmupSeconds segundos)    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "⏳ Permitiendo que la aplicación llene el cache..." -ForegroundColor Yellow
Write-Host "   - Dashboard readers consultan /api/logs/recent" -ForegroundColor Gray
Write-Host "   - Redis cachea los resultados" -ForegroundColor Gray
Write-Host "   - Esperando $WarmupSeconds segundos..." -ForegroundColor Gray
Write-Host ""

# Countdown con progreso
for ($i = $WarmupSeconds; $i -gt 0; $i--) {
    Write-Progress -Activity "Warm-up en progreso" -Status "Quedan $i segundos" -PercentComplete ((($WarmupSeconds - $i) / $WarmupSeconds) * 100)
    Start-Sleep 1
}
Write-Progress -Activity "Warm-up completo" -Completed

Write-Host "✅ Warm-up completado - Cache Redis debería estar lleno" -ForegroundColor Green
Write-Host ""

# Verificar cache en Redis
Write-Host "🔍 Verificando cache Redis:" -ForegroundColor Yellow
try {
    $cacheKeys = docker exec gestor_lab_redis redis-cli KEYS "*logs*" 2>$null
    if ($cacheKeys) {
        Write-Host "   ✅ Cache keys encontradas:" -ForegroundColor Green
        $cacheKeys | ForEach-Object { Write-Host "      - $_" -ForegroundColor Gray }
    }
    else {
        Write-Host "   ⚠️  No se encontraron keys de cache (puede ser normal)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   ⚠️  No se pudo verificar Redis" -ForegroundColor Yellow
}
Write-Host ""

# ================================================================
# FASE 3: TUMBAR PostgreSQL
# ================================================================
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║  FASE 3: TUMBANDO PostgreSQL ($DowntimeSeconds segundos)              ║" -ForegroundColor Red
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Red
Write-Host ""

Write-Host "💥 DETENIENDO PostgreSQL..." -ForegroundColor Red
docker-compose stop postgres | Out-Null
Write-Host "❌ PostgreSQL DETENIDO" -ForegroundColor Red
Write-Host ""

Write-Host "🎯 OBJETIVO: Demostrar que Redis cache mantiene app funcionando" -ForegroundColor Yellow
Write-Host "   ✅ Dashboard readers seguirán obteniendo logs (desde cache)" -ForegroundColor Green
Write-Host "   ❌ Log generators fallarán al escribir en BD" -ForegroundColor Red
Write-Host ""

Write-Host "🌐 OBSERVA EL WEB DASHBOARD (http://127.0.0.1:5665):" -ForegroundColor Cyan
Write-Host "   🔴 Gráfica 'log_generators': HTTP failures SUBIRÁN a ~30-50%" -ForegroundColor Red
Write-Host "   🟢 Gráfica 'dashboard_readers': HTTP failures PERMANECEN BAJOS ~5-10%" -ForegroundColor Green
Write-Host "   ⚡ Latencia de dashboard_readers: menor a 100ms (desde cache)" -ForegroundColor Yellow
Write-Host ""

Write-Host "⏳ Observando comportamiento por $DowntimeSeconds segundos..." -ForegroundColor Yellow
Write-Host ""

# Mostrar logs del backend durante la caída
Write-Host "📋 Logs recientes del backend:" -ForegroundColor Yellow
docker-compose logs backend --tail=10 2>$null
Write-Host ""

# Countdown con progreso
for ($i = $DowntimeSeconds; $i -gt 0; $i--) {
    Write-Progress -Activity "BD caída - Observando resiliencia" -Status "Quedan $i segundos" -PercentComplete ((($DowntimeSeconds - $i) / $DowntimeSeconds) * 100)
    Start-Sleep 1
}
Write-Progress -Activity "Período de caída completado" -Completed

Write-Host ""

# ================================================================
# FASE 4: RESTAURAR PostgreSQL
# ================================================================
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  FASE 4: RESTAURANDO PostgreSQL                               ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🔄 INICIANDO PostgreSQL..." -ForegroundColor Green
docker-compose start postgres | Out-Null
Write-Host "✅ PostgreSQL RESTAURADO" -ForegroundColor Green
Write-Host ""

Write-Host "⏳ Esperando 10s para que PostgreSQL esté completamente operativo..." -ForegroundColor Yellow
Start-Sleep 10

Write-Host "✅ Aplicación debería recuperar funcionalidad completa" -ForegroundColor Green
Write-Host ""

# ================================================================
# FASE 5: Finalización y resultados
# ================================================================
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  FASE 5: Esperando finalización de K6                         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "⏳ Esperando a que K6 complete el test..." -ForegroundColor Yellow
Write-Host "   (Puede tomar ~1 minuto más para cool-down)" -ForegroundColor Gray
Write-Host ""

# Esperar a que K6 termine
Wait-Job -Job $job -Timeout 120 | Out-Null

# Obtener resultados de K6
Write-Host "📊 RESULTADOS DEL TEST:" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Receive-Job -Job $job

# Cleanup
Remove-Job -Job $job -Force

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    PRUEBA COMPLETADA                          ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# ================================================================
# ANÁLISIS DE RESULTADOS
# ================================================================
Write-Host "📈 INDICADORES DE ÉXITO:" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ ÉXITO si durante la caída de BD:" -ForegroundColor Green
Write-Host "   • Dashboard readers mantuvieron menor a 30% error" -ForegroundColor Gray
Write-Host "   • Latencia de lecturas cached menor a 100ms" -ForegroundColor Gray
Write-Host "   • Cache hits visibles en Redis" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  PARCIAL si:" -ForegroundColor Yellow
Write-Host "   • Dashboard readers tuvieron 30-50% error" -ForegroundColor Gray
Write-Host "   • Algunos cache hits pero no mayoría" -ForegroundColor Gray
Write-Host ""
Write-Host "❌ FALLO si:" -ForegroundColor Red
Write-Host "   • Dashboard readers fallaron 100%" -ForegroundColor Gray
Write-Host "   • No hubo cache hits" -ForegroundColor Gray
Write-Host ""

# ================================================================
# COMANDOS DE VERIFICACIÓN
# ================================================================
Write-Host "🔍 VERIFICACIÓN ADICIONAL:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ver estadísticas de Redis:" -ForegroundColor Gray
Write-Host "   docker exec gestor_lab_redis redis-cli INFO stats" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Ver logs en PostgreSQL:" -ForegroundColor Gray
Write-Host '   docker exec gestor_lab_postgres psql -U lab -d labdb -c "SELECT action, COUNT(*) FROM audit_logs WHERE created_at > NOW() - INTERVAL ''5 minutes'' GROUP BY action;"' -ForegroundColor DarkGray
Write-Host ""
Write-Host "Ver cache keys:" -ForegroundColor Gray
Write-Host '   docker exec gestor_lab_redis redis-cli KEYS "*"' -ForegroundColor DarkGray
Write-Host ""
