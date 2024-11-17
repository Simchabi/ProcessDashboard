FROM apache/airflow:latest
USER root
RUN apt-get update && \
    apt-get -y install git && \
    apt-get clean
USER airflow

# התקנת החבילה כמשתמש airflow
RUN pip install --no-cache-dir apache-airflow-providers-mongo==3.0.0
