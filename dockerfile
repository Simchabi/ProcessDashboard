FROM apache/airflow:latest
USER root
RUN apt-get update && \
    apt-get -y install git && \
    apt-get clean
USER airflow

# התקנת החבילה כמשתמש airflow
RUN pip install --no-cache-dir apache-airflow-providers-mongo==3.0.0
#RUN pip install python-docx
RUN pip install pydrive
RUN pip install python-docx google-api-python-client google-auth google-auth-oauthlib google-auth-httplib2
