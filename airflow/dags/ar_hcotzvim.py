from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from datetime import datetime
from pymongo import MongoClient

# פונקציה לקריאת סטטוס המשימה ממונגו לפי id_task
def get_task_status(task_id):
    uri = "mongodb+srv://simchab667:GesJiqzTeqyHsdp5@cluster0.yhfpz1v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    client = MongoClient(uri)
    db = client.get_database('MyDB')  # עדכן כאן את שם הבסיס נתונים
    collection = db.get_collection('task')  # עדכן כאן את שם הקולקשין
    task = collection.find_one({'id_task': task_id})
    if task and 'status' in task:
        return task['status']
    else:
        return 'No status found for task_id: {}'.format(task_id)

# פונקציה להדפסת סטטוס המשימה
def print_task_status(task_id):
    status = get_task_status(task_id)
    print(status)
    if status not in ['started', 'finish']:
        raise ValueError(f'Task {task_id} status is not allowed to proceed: {status}')

default_args = {
    'owner': 'Moshe',
    'depends_on_past': False,
    #'start_date': datetime(2023, 1, 1),
    'retries': 1,
}

dag = DAG(
    'ar_hcotzvim',
    default_args=default_args,
    description='A DAG to check task statuses from MongoDB',
    #schedule_interval='@daily',
)

task1 = PythonOperator(
    task_id='task_300',
    python_callable=print_task_status,
    op_args=[300],
    dag=dag,
)

task2 = PythonOperator(
    task_id='task_301',  # עדכן לפי id_task נוסף
    python_callable=print_task_status,
    op_args=[301],
    dag=dag,
)

task1 >> task2
