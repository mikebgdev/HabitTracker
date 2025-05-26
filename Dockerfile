# Etapa de build
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Etapa de producción: servir con nginx
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Elimina la configuración por defecto y agrega la personalizada
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
