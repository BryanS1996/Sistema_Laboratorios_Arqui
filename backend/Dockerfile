FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY src ./src
COPY scripts ./scripts

# Copiar archivo de credenciales de Firebase (si existe)
# IMPORTANTE: Este archivo debe existir en tu máquina local
COPY serviceAccountKey.json ./serviceAccountKey.json

# Exponer puerto
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["node", "src/server.js"]
