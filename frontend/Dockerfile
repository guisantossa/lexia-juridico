# Etapa 1: Build do frontend
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servir com Nginx
FROM nginx:1.28-alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a configuração customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos para o Nginx servir
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
