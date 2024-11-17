"""

import os
import json
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.mongo.hooks.mongo import MongoHook
from datetime import datetime, timedelta

def init_mongo_conn(**kwargs):
    try:
        print("Attempting to create MongoHook")
        hook = MongoHook(mongo_conn_id='mongo_default')
        print("MongoHook created, attempting to get connection")
        mongo_client = hook.get_conn()
        print("MongoDB connection obtained")
        
        # Save connection details to XCom
        kwargs['ti'].xcom_push(key='mongo_conn_id', value='mongo_default')
        print("MongoDB connection ID saved to XCom: mongo_default")
        
    except Exception as e:
        print(f"Error connecting to MongoDB -- {e}")

with DAG(
    dag_id="init_mongo_conn_dag",
    schedule_interval=None,
    start_date=datetime(2022, 10, 28),
    catchup=False,
    tags=["init_mongo"],
    default_args={
        "owner": "Rob",
        "retries": 2,
        "retry_delay": timedelta(minutes=5)
    }
) as dag:

    t1 = PythonOperator(
        task_id='init_mongo_conn',
        python_callable=init_mongo_conn,
        provide_context=True,
        dag=dag
    )

    """