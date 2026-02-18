FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY src ./src
COPY scripts ./scripts

# Exponer puerto
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["node", "src/server.js"]
