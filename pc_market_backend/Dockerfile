# Берем официальный образ Python версии 3.12 как основу
FROM python:3.12

# Устанавливаем переменные окружения, чтобы Python не создавал файлы .pyc и выводил логи напрямую
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем файл с зависимостями в контейнер
COPY requirements.txt /app/

# Устанавливаем все необходимые пакеты из requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код проекта в контейнер
COPY . /app/

# Указываем порт, который будет слушать приложение внутри контейнера (стандартный для Django)
EXPOSE 8000

# Команда, которая запустится при старте контейнера
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]