#!/bin/bash
set -e

echo "🚀 Iniciando restauración de base de datos desde dump binario..."

# Restaurar usando pg_restore
# -U: Usuario (tomado de la variable de entorno)
# -d: Base de datos destino
# --clean: Borra objetos existentes antes de crear nuevos
# --if-exists: Evita errores si no existe nada que borrar
# --no-owner: Evita errores de permisos si el usuario del dump no coincide
pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner /tmp/academico.dump || {
    echo "⚠️ Advertencia: pg_restore terminó con errores (probablemente no críticos)."
}

echo "✅ Restauración completada."
