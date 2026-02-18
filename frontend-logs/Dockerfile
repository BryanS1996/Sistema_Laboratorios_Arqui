FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto 5174 (App B)
EXPOSE 5174

# Ejecutar en modo desarrollo con hot-reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5174"]
