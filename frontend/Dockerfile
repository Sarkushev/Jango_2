# Используем официальный образ Node.js версии 18 для сборки
FROM node:18-alpine as build

# Указываем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем файлы с описанием зависимостей
COPY package*.json ./

# Устанавливаем зависимости проекта
RUN npm install

# Копируем все остальные файлы проекта
COPY . .

# Собираем React-приложение для production
RUN npm run build

# Используем легковесный образ Nginx, чтобы отдавать статические файлы
FROM nginx:stable-alpine

# Копируем собранные файлы из папки build в директорию, откуда Nginx отдаёт статику
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем файл конфигурации Nginx (если он у вас есть)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80, который используется Nginx
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]