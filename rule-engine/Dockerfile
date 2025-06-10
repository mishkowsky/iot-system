FROM python:3.12-slim

ENV PYTHONPATH="${PYTHONPATH}:/src"

COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./src /src
COPY ./prod.env /.env

CMD ["python", "./src/rule_engine.py"]