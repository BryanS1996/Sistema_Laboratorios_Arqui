FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar todo el código fuente
COPY . .

# Exponer puertos (para flexibilidad con múltiples instancias)
EXPOSE 5173 5174

# Comando para iniciar el servidor de desarrollo
# --host 0.0.0.0 permite acceso desde fuera del contenedor
# Se puede sobrescribir desde docker-compose command
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
