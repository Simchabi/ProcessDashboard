from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from datetime import datetime
from pymongo import MongoClient

# פונקציה לקריאת תיאור המשימה ממונגו לפי id_task
def get_task_description(task_id):
    uri = "mongodb+srv://simchab667:GesJiqzTeqyHsdp5@cluster0.yhfpz1v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    client = MongoClient(uri)
    db = client.get_database('MyDB')  # עדכן כאן את שם הבסיס נתונים
    collection = db.get_collection('task')  # עדכן כאן את שם הקולקשין
    task = collection.find_one({'id_task': task_id})
    if task and 'description' in task:
        return task['description']
    else:
        return 'No description found for task_id: {}'.format(task_id)

# פונקציה להדפסת תיאור המשימה
def print_task_description(task_id):
    description = get_task_description(task_id)
    print(description)

default_args = {
    'owner': 'Avi',
    'depends_on_past': False,
    'start_date': datetime(2023, 1, 1),
    'retries': 1,
}

dag = DAG(
    'bait_vagn',
    default_args=default_args,
    description='A process with five tasks Each task prints its description',
   # schedule_interval='@daily',
)

task1 = PythonOperator(
    task_id='task_300',
    python_callable=print_task_description,
    op_args=[300],
    dag=dag,
)

task2 = PythonOperator(
    task_id='task_301',  # עדכן לפי id_task נוסף
    python_callable=print_task_description,
    op_args=[301],
    dag=dag,
)

task3 = PythonOperator(
    task_id='task_302',  # עדכן לפי id_task נוסף
    python_callable=print_task_description,
    op_args=[302],
    dag=dag,
)

task4 = PythonOperator(
    task_id='task_303',  # עדכן לפי id_task נוסף
    python_callable=print_task_description,
    op_args=[303],
    dag=dag,
)

task5 = PythonOperator(
    task_id='task_304',  # עדכן לפי id_task נוסף
    python_callable=print_task_description,
    op_args=[304],
    dag=dag,
)

task1 >> task2 >> task3 >> task4 >> task5


