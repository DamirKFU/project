FROM python:3.9

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем requirements.txt и устанавливаем зависимости
COPY requirements/prod.txt .
RUN pip install --no-cache-dir -r prod.txt

# Копируем все файлы приложения
COPY . .

# Собираем статические файлы
RUN python manage.py collectstatic --noinput

# Запускаем Django приложение
CMD ["sh", "-c", "cd /app/project && python manage.py migrate && python manage.py init_admin && gunicorn -w 3 -b 0.0.0.0:8000 project.wsgi:application"]
