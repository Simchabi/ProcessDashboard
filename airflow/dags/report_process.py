from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime
from pymongo import MongoClient
from docx import Document
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from time import sleep
from googleapiclient.errors import HttpError
import os
import pickle
import re


SCOPES = ['https://www.googleapis.com/auth/drive.file']


# פונקציה להתחברות ל-MongoDB
def connect_to_mongo():
    uri = "mongodb+srv://simchab667:GesJiqzTeqyHsdp5@cluster0.yhfpz1v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    client = MongoClient(uri)
    return client
def authenticate_google_drive():
    creds = None
    token_path = '/opt/airflow/dags/token.pickle'  # נתיב קובץ הטוקן

    # בדיקה אם קובץ האסימונים (pickle) קיים
    if os.path.exists(token_path):
        with open(token_path, 'rb') as token:
            creds = pickle.load(token)

    # אם אין קרדנציאלס או שהם לא תקפים
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                '/opt/airflow/dags/credentials.json', SCOPES)
            creds = flow.run_console()  # שימוש באימות דרך מסוף

        # שמירת הקרדנציאלס לקובץ pickle
        with open(token_path, 'wb') as token:
            pickle.dump(creds, token)

    # יצירת חיבור ל-Google Drive API
    return build('drive', 'v3', credentials=creds)


def upload_to_drive(filename):
    service = authenticate_google_drive()
    #file_metadata = {'name': os.path.basename(filename)}
    file_metadata = {
        'name': os.path.basename(filename),
        'parents': ['1MCoZ9GJAkIei61I_m2rRhCW44bLbbMpo']  # הוספת ה-folder_id כאן
    }
    media = MediaFileUpload(
        filename, mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )

    for attempt in range(5):  # ננסה עד 5 פעמים
        try:
            file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
            print(f"הקובץ הועלה בהצלחה ל-Google Drive. File ID: {file.get('id')}")
            return file.get('id')
        except HttpError as error:
            print(f"שגיאה ב-HTTP: {error}")
            if attempt < 4:
                print("ממתינים 5 שניות לפני ניסיון חוזר...")
                sleep(5)  # המתנה של 5 שניות
            else:
                raise

# פונקציה למחיקת קובץ מגוגל דרייב
def delete_file_from_drive(file_id):
    service = authenticate_google_drive()
    try:
        service.files().delete(fileId=file_id).execute()
        print(f"קובץ עם ID {file_id} נמחק בהצלחה.")
    except HttpError as error:
        print(f"שגיאה במחיקת קובץ מגוגל דרייב: {error}")


# פונקציה לבדוק אם התיאור מכיל קישור ל-Google Drive
def extract_drive_file_id(description):
    match = re.search(r"https://drive.google.com/file/d/([a-zA-Z0-9_-]+)/view", description)
    return match.group(1) if match else None



# פונקציה ליצירת קישור שיתוף של הקובץ
def get_drive_share_link(file_id, service):
    permission = {
        'type': 'anyone',  # קישור לשיתוף ציבורי
        'role': 'reader'  # קריאה בלבד
    }
    service.permissions().create(fileId=file_id, body=permission).execute()
    share_link = f"https://drive.google.com/file/d/{file_id}/view?usp=sharing"
    return share_link


# פונקציה ליצירת דוחות נפרדים לתהליכים שהושלמו ולהעלאתם ל-Google Drive
# פונקציה עיקרית
def get_process_details():
    client = connect_to_mongo()
    db = client.get_database('MyDB')
    processes_collection = db.get_collection('process')
    tasks_collection = db.get_collection('task')
    sensors_collection = db.get_collection('sensor')



    # עיבוד תהליכים
    all_processes = processes_collection.find()

    for process in all_processes:
        description = process.get('description', '')
        drive_file_id = extract_drive_file_id(description)

        if process['status'] == "הושלם":
            if not drive_file_id:  # אין קישור לדרייב
                # יצירת דוח חדש
                document = Document()
                document.add_heading(f'דוח עבור תהליך: {process["name"]}', level=1)
                document.add_paragraph(f"תיאור: {process['description']}")
                document.add_paragraph(f"בעלים: {process['owner']}")
                document.add_paragraph(f"סטטוס: {process['status']}")
                document.add_paragraph(f"צוות: {process['team']}")
                document.add_paragraph(f"התחלה: {datetime_to_str(process['Start_Time'])}")
                document.add_paragraph(f"סיום: {datetime_to_str(process['finish_time'])}")
                document.add_paragraph(f"לקוח: {process['client']}")


                # הוספת פרטי המשימות
                document.add_heading("משימות:", level=2)
                if 'tasks' in process:
                    for task_id in process['tasks']:
                        task = tasks_collection.find_one({'id_task': task_id})
                        if task:
                            document.add_paragraph(f"משימה: {task['name']}", style='List Bullet')
                            document.add_paragraph(f"תיאור: {task['description']}")
                            document.add_paragraph(f"סטטוס: {task['status']}")
                            document.add_paragraph(f"צוות: {task['team']}")
                            document.add_paragraph(f"התחלה: {datetime_to_str(task['start_date'])}")
                            document.add_paragraph(f"סיום: {datetime_to_str(task['end_date'])}")
                            document.add_paragraph(f"הערות: {task['remarks']}")

                            # הוספת פרטי הסנסורים
                            if 'sensors' in task:
                                document.add_heading("סנסורים:", level=3)
                                for sensor_id in task['sensors']:
                                    sensor = sensors_collection.find_one({'id': sensor_id})
                                    if sensor:
                                        document.add_paragraph(f"סנסור: {sensor['name']}", style='List Bullet')
                                        document.add_paragraph(f"סטטוס: {sensor['status']}")

                #report_path = os.path.join(report_dir, report_filename)
                #document.save(report_path)

                # שמירת הקובץ רק ב-Google Drive
                report_filename = f"{process['name']}.docx"
                temp_report_path = f"/tmp/{report_filename}"  # שמירה זמנית לפני העלאה
                document.save(temp_report_path)

                # העלאה ל-Google Drive
                file_id = upload_to_drive(temp_report_path)
                service = authenticate_google_drive()
                share_link = get_drive_share_link(file_id, service)

                # העלאה לדרייב
                #file_id = upload_to_drive(report_path)
                #service = authenticate_google_drive()
                #share_link = get_drive_share_link(file_id, service)

                # עדכון התיאור עם קישור השיתוף
                processes_collection.update_one(
                    {'_id': process['_id']},
                    {'$set': {'description': share_link}}
                )
                print(f"דוח עבור התהליך {process['name']} הועלה וקישור השיתוף עודכן.")
        else:
            if drive_file_id:  # אם יש קישור לדרייב בתיאור
                delete_file_from_drive(drive_file_id)  # מחיקת הקובץ בדרייב
                processes_collection.update_one(
                    {'_id': process['_id']},
                    {'$set': {'description': ''}}  # הסרת הקישור מהתיאור
                )
                print(f"קישור השיתוף עבור התהליך {process['name']} הוסר.")



# פונקציה להמיר אובייקטי datetime למחרוזת בפורמט של תאריך ושעה
def datetime_to_str(dt):
    if isinstance(dt, datetime):
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    return None

# הגדרת ה-DAG
default_args = {
    'owner': 'Simcha',
    'depends_on_past': False,
    #'start_date': datetime(2023, 1, 1),
    'start_date': datetime(2024, 12, 5),  # תאריך התחלה קרוב
    'retries': 1,
}

dag = DAG(
    'completed_process_report',
    default_args=default_args,
    description='DAG to generate a report for completed processes and upload it to Google Drive',
    #schedule_interval=None,  # ריצה ידנית בלבד
    #schedule_interval="*/5 * * * *",  # ריצה כל 5 דקות
    schedule_interval="0 0 * * *",  # ריצה כל יום ב-12:00 בלילה
    catchup=False,  # ביטול השלמת משימות רטרואקטיביות
)

# משימה ליצירת הדוח והעלאתו לדרייב
generate_and_upload_report_task = PythonOperator(
    task_id='generate_and_upload_report',
    python_callable=get_process_details,
    dag=dag,
)