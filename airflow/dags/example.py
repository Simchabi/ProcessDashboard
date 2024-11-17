
"""

from airflow import DAG
from airflow.operators.dummy import DummyOperator
from airflow.operators.python import PythonOperator
from airflow.hooks.base import BaseHook
from datetime import datetime, timedelta
import pymongo
from pymongo.errors import ServerSelectionTimeoutError
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2023, 7, 1),
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'mongo_read_dag',
    default_args=default_args,
    schedule_interval=timedelta(days=1),
)

def fetch_data_from_mongo(**kwargs):
    print("Fetching MongoDB connection details")
    mongo_conn = BaseHook.get_connection('mongo_default')
    
    # Construct the URI
    uri = (
        f"mongodb+srv://{mongo_conn.login}:{mongo_conn.password}"
        f"@{mongo_conn.host}/{mongo_conn.schema}?"
        "retryWrites=true&w=majority&tls=true"
    )

    try:
        # Connect to MongoDB
        print(f"Connecting to MongoDB using URI: {uri}")
        client = pymongo.MongoClient(uri, server_api=ServerApi('1'), tlsAllowInvalidCertificates=True)
        db = client[mongo_conn.schema]
        
        collections = ['task', 'user', 'sensor']
        
        for collection_name in collections:
            print(f"Reading data from collection: {collection_name}")
            collection = db[collection_name]
            documents = collection.find()
            print(f"Data from collection {collection_name}:")
            for doc in documents:
                print(doc)
        
        print("Closing MongoDB connection")
        client.close()
    except ServerSelectionTimeoutError as err:
        print(f"Error connecting to MongoDB: {err}")

start = DummyOperator(
    task_id='start',
    dag=dag,
)

fetch_data = PythonOperator(
    task_id='fetch_data_from_mongo',
    python_callable=fetch_data_from_mongo,
    provide_context=True,
    dag=dag,
)

end = DummyOperator(
    task_id='end',
    dag=dag,
)

start >> fetch_data >> end
"""






"""
from airflow import DAG
from airflow.operators.dummy import DummyOperator
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
import pymongo
from pymongo.errors import ServerSelectionTimeoutError
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': datetime(2023, 7, 1),
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'mongo_read_dag',
    default_args=default_args,
    schedule_interval=timedelta(days=1),
)

def fetch_data_from_mongo(**kwargs):
    # URI החדש של MongoDB
    uri = "mongodb+srv://simchab667:GesJiqzTeqyHsdp5@cluster0.yhfpz1v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    
    try:
        # התחברות ל-MongoDB
        print(f"Connecting to MongoDB using URI: {uri}")
        client = pymongo.MongoClient(uri, server_api=ServerApi('1'), tlsAllowInvalidCertificates=True)
        db = client['MyDB']  # הכנס כאן את שם הדאטבייס שלך
        
        collections = ['task', 'user', 'sensor']
        
        for collection_name in collections:
            print(f"Reading data from collection: {collection_name}")
            collection = db[collection_name]
            documents = collection.find()
            print(f"Data from collection {collection_name}:")
            for doc in documents:
                print(f"Document: {doc}")
                print(f"Keys: {list(doc.keys())}")
        
        print("Closing MongoDB connection")
        client.close()
    except ServerSelectionTimeoutError as err:
        print(f"Error connecting to MongoDB: {err}")

start = DummyOperator(
    task_id='start',
    dag=dag,
)

fetch_data = PythonOperator(
    task_id='fetch_data_from_mongo',
    python_callable=fetch_data_from_mongo,
    provide_context=True,
    dag=dag,
)

end = DummyOperator(
    task_id='end',
    dag=dag,
)

start >> fetch_data >> end
"""
