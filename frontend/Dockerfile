# Etapa 1 – build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Etapa 2 – nginx para servir os arquivos
FROM nginx:stable-alpine

# Copia o build para o nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia config customizada do nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
