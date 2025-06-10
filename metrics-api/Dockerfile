FROM python:3.12-slim

ENV PYTHONPATH="${PYTHONPATH}:/src"

COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./src /src
COPY ./prod.env /.env

EXPOSE 8000

CMD ["python", "./src/main.py"]