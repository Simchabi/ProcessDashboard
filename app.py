from flask import Flask, render_template, request, jsonify, redirect, url_for
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime

app = Flask(__name__)

client = MongoClient('mongodb+srv://simchab667:GesJiqzTeqyHsdp5@cluster0.yhfpz1v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['MyDB']
sensor_collection = db['sensor']
user_collection = db['user']
task_collection = db['task']
process_collection = db['process']

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/edit')
def edit():
    # Get all document IDs for each collection
    sensors = sensor_collection.find({}, {'_id': 1, 'name': 1})
    users = user_collection.find({}, {'_id': 1, 'name': 1})
    tasks = task_collection.find({}, {'_id': 1, 'name': 1})
    processes = process_collection.find({}, {'_id': 1, 'name': 1})
    
    return render_template('edit.html', sensors=sensors, users=users, tasks=tasks, processes=processes)

# Route to fetch all sensors
@app.route('/sensors', methods=['GET'])
def get_sensors():
    sensors = list(sensor_collection.find({}, {'_id': 1, 'name': 1}))  # Adjust the fields as needed
    # Convert ObjectId to string
    for sensor in sensors:
        sensor['_id'] = str(sensor['_id'])
    return jsonify(sensors), 200

# Route to fetch sensor by _ID
@app.route('/sensor/<sensor_id>', methods=['GET'])
def get_sensor(sensor_id):
    sensor = sensor_collection.find_one({'_id': ObjectId(sensor_id)})
    if sensor:
        sensor['_id'] = str(sensor['_id']) 
        return jsonify(sensor), 200
    else:
            return {"error": "Sensor not found"}, 404

# Route to fetch sensor by ID
@app.route('/sensorID/<int:sensor_id>', methods=['GET'])
def get_sensor_id(sensor_id):
    sensor = sensor_collection.find_one({'id': sensor_id})
    if sensor:
        sensor['_id'] = str(sensor['_id']) 
        return jsonify(sensor), 200
    else:
            return {"error": "Sensor not found"}, 404

# Route to fetch task by ID
@app.route('/taskID/<int:task_id>', methods=['GET'])
def get_task_id(task_id):
    task = task_collection.find_one({'id_task': task_id})
    if task:
        task['_id'] = str(task['_id']) 
        return jsonify(task), 200
    else:
            return {"error": "task not found"}, 404
    
# Route to fetch all users
@app.route('/users', methods=['GET'])
def get_users():
    users = list(user_collection.find({}, {'_id': 1, 'name': 1}))
    for user in users:
        user['_id'] = str(user['_id'])
    return jsonify(users), 200

# Route to fetch user by ID
@app.route('/user/<user_id>', methods=['GET'])
def get_user(user_id):
    user = user_collection.find_one({'_id': ObjectId(user_id)})
    user['_id'] = str(user['_id']) 
    return jsonify(user), 200

# Route to fetch all tasks
@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = list(task_collection.find({}, {'_id': 1, 'name': 1}))
    for task in tasks:
        task['_id'] = str(task['_id'])
    return jsonify(tasks), 200

# Route to fetch task by ID
@app.route('/task/<task_id>', methods=['GET'])
def get_task(task_id):
    task = task_collection.find_one({'_id': ObjectId(task_id)})
    task['_id'] = str(task['_id']) 
    return jsonify(task), 200

# Route to fetch all processes
@app.route('/processes', methods=['GET'])
def get_processes():
    processes = list(process_collection.find({}, {'_id': 1, 'name': 1}))
    for process in processes:
        process['_id'] = str(process['_id'])
    return jsonify(processes), 200

# Route to fetch process by ID
@app.route('/process/<process_id>', methods=['GET'])
def get_process(process_id):
    process = process_collection.find_one({'_id': ObjectId(process_id)})
    process['_id'] = str(process['_id']) 
    return jsonify(process), 200

@app.route('/process_tasks/<process_id>', methods=['GET'])
def get_tasks_in_process(process_id):
    # המרת ה-ID של התהליך לאובייקט ID של MongoDB
    try:
        process_id = ObjectId(process_id)
    except Exception as e:
        return jsonify({"error": "Invalid process ID"}), 400

    process = db.process.find_one({"_id": process_id})
    if process:
        return jsonify({"tasks": process.get("tasks", [])})  # מחזיר את המערך של ה-ID של הטסקים
    return jsonify({"error": "Process not found"}), 404

# Update sensor
@app.route('/update_sensor/<id>', methods=['POST'])
def update_sensor(id):
    data = request.get_json()
    if data is None:
        return jsonify({"error": "Invalid JSON"}), 400
    sensor_collection.update_one({'_id': ObjectId(id)}, {'$set': data})
    return jsonify({"message": "Sensor updated successfully"}), 200

# Update user
@app.route('/update_user/<user_id>', methods=['POST'])
def update_user(user_id):
    data = request.get_json()
    user_collection.update_one({'_id': ObjectId(user_id)}, {'$set': data})
    return jsonify({"message": "User updated successfully"}), 200

# Update task
@app.route('/update_task/<task_id>', methods=['POST'])
def update_task(task_id):
    data = request.get_json()
    task_collection.update_one({'_id': ObjectId(task_id)}, {'$set': data})
    return jsonify({"message": "Task updated successfully"}), 200

# Endpoint להחזרת סנסורים זמינים שלא נמצאים בטסק
@app.route('/available_sensors/<task_id>', methods=['GET'])
def available_sensors(task_id):
    # חיפוש הטסק לפי ID
    task = task_collection.find_one({'_id': ObjectId(task_id)})    
    if not task:
        return jsonify({"message": "Task not found"}), 404

    # קבלת רשימת ה-IDs של הסנסורים שכבר נמצאים בטסק
    existing_sensor_ids = task.get('sensors', [])
    # חיפוש כל הסנסורים שלא נמצאים ברשימה הקיימת של מזהי ה-int32
    available_sensors = list(sensor_collection.find({'id': {'$nin': existing_sensor_ids}}))

    for sensor in available_sensors:
        sensor['_id'] = str(sensor['_id'])
    return jsonify(available_sensors), 200

# Endpoint להחזרת משימות זמינות שלא נמצאות בפרוסס
@app.route('/available_tasks/<process_id>', methods=['GET'])
def available_tasks(process_id):
    process = process_collection.find_one({'_id': ObjectId(process_id)})    
    if not process:
        return jsonify({"message": "Process not found"}), 404

    existing_task_ids  = process.get('tasks', [])
    available_tasks = list(task_collection.find({'id_task': {'$nin': existing_task_ids }}))

    for task in available_tasks:
        task['_id'] = str(task['_id'])
    return jsonify(available_tasks), 200

# Update process
@app.route('/update_process/<process_id>', methods=['POST'])
def update_process(process_id):
    data = request.get_json()
    if data is None:
        return jsonify({"error": "Invalid JSON"}), 400
    process_collection.update_one({'_id': ObjectId(process_id)}, {'$set': data})
    return jsonify({"message": "Process updated successfully"}), 200
    
# נתיב להוספת סנסור מהמשימה   
@app.route('/add_sensor_task/<task_id>/<sensor_id>', methods=['POST'])
def add_sensor_task(task_id, sensor_id):
    try:
        # עדכון המשימה על ידי הוספת הסנסור לרשימת הסנסורים
        result = task_collection.update_one(
            {"_id": ObjectId(task_id)},  
            {"$addToSet": {"sensors": int(sensor_id)}}  
        )
        if result.matched_count == 0:
            return jsonify({'error': 'Task not found'}), 404
        
        return jsonify({"success": True, "message": "Sensor added successfully"}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# נתיב למחיקת סנסור מהמשימה
@app.route('/delete_sensor_task/<task_id>/<sensor_id>', methods=['DELETE'])
def delete_sensor_task(task_id, sensor_id):
    try:
        # הסרת הסנסור ממערך הסנסורים במשימה
        result = task_collection.update_one(
            {"_id": ObjectId(task_id)}, 
            {"$pull": {"sensors": int(sensor_id)}}  
        )
        if result.matched_count == 0:
            return jsonify({'error': 'Task not found'}), 404
        
        return jsonify({"success": True, "message": "Sensor deleted successfully"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/add_task_to_process/<process_id>/<task_id>', methods=['POST'])
def add_task_to_process(process_id, task_id):
    try:
        # הוספת המשימה למערך המשימות בתהליך
        result = process_collection.update_one(
            {"_id": ObjectId(process_id)},
            {"$addToSet": {"tasks": int(task_id)}}
        )
        if result.matched_count == 0:
            return jsonify({'error': 'Process not found'}), 404

        return jsonify({"success": True, "message": "Task added successfully"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete_task_from_process/<process_id>/<task_id>', methods=['DELETE'])
def delete_task_from_process(process_id, task_id):
    try:
        # הסרת המשימה ממערך המשימות בתהליך
        result = process_collection.update_one(
            {"_id": ObjectId(process_id)},
            {"$pull": {"tasks": int(task_id)}}
        )
        if result.matched_count == 0:
            return jsonify({'error': 'Process not found'}), 404

        return jsonify({"success": True, "message": "Task deleted successfully"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
##########################
@app.route('/add', methods=['GET'])
def add_page():
    return render_template('add.html')

@app.route('/add_entity', methods=['POST'])
def add_entity():
    data = request.get_json()
    collection = None
    required_fields = []

    if 'id' in data:
        required_fields = ['id', 'name', 'owner', 'status']
        collection = db.sensor 
    elif 'Id' in data:
        required_fields = ['name', 'role', 'team', 'permission','password', 'Id']
        collection = db.user
    elif 'id_task' in data:
        required_fields = ['id_task', 'description', 'name', 'owner', 'status','team', 'end_date','link', 'remarks', 'start_date'] 
        collection = db.task
    elif 'name' in data:
        required_fields = ['name', 'description', 'owner','status','team','Start_Time', 'finish_time', 'client']
        collection = db.process

    if collection is not None:
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        if missing_fields:
            return jsonify({"message": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        if 'id' in data:
            try:
                data['id'] = int(data['id'])  # המרה למספר שלם
                if data['id'] < -2147483648 or data['id'] > 2147483647:
                    return jsonify({"message": "ID must be an Int32"}), 400
            except ValueError:
                return jsonify({"message": "Invalid ID format"}), 400
            
        if 'id_task' in data:
            try:
                data['id_task'] = int(data['id_task'])  # המרה למספר שלם
                if data['id_task'] < -2147483648 or data['id_task'] > 2147483647:
                    return jsonify({"message": "id_task must be an Int32"}), 400
            except ValueError:
                return jsonify({"message": "Invalid id_task format"}), 400
            
        collection.insert_one(data)
        return jsonify({"message": "Entity added successfully"}), 200
    else:
        return jsonify({"message": "Invalid data"}), 400
###########################
@app.route('/delete', methods=['GET'])
def delete_page():
    sensors = sensor_collection.find({}, {'_id': 1, 'name': 1})
    users = user_collection.find({}, {'_id': 1, 'name': 1})
    tasks = task_collection.find({}, {'_id': 1, 'name': 1})
    processes = process_collection.find({}, {'_id': 1, 'name': 1})
    
    return render_template('delete.html', sensors=sensors, users=users, tasks=tasks, processes=processes)

@app.route('/delete_sensor/<sensor_id>', methods=['DELETE'])
def delete_sensor(sensor_id):
    try:
        result = sensor_collection.delete_one({'_id': ObjectId(sensor_id)})

        if result.deleted_count == 0:
            return jsonify({'error': 'Sensor not found'}), 404
        
        return jsonify({'message': 'Sensor deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete_user/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        result = user_collection.delete_one({'_id': ObjectId(user_id)})

        if result.deleted_count == 0:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete_task/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        result = task_collection.delete_one({'_id': ObjectId(task_id)})

        if result.deleted_count == 0:
            return jsonify({'error': 'Task not found'}), 404

        return jsonify({'message': 'Task deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete_process/<process_id>', methods=['DELETE'])
def delete_process(process_id):
    try:
        result = process_collection.delete_one({'_id': ObjectId(process_id)})

        if result.deleted_count == 0:
            return jsonify({'error': 'Process not found'}), 404

        return jsonify({'message': 'Process deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

######################
@app.route('/tasks/<process_id>')
def get_process_tasks(process_id):
    process = process_collection.find_one({'_id': ObjectId(process_id)})
    if process:
        tasks = task_collection.find({'id_task': {'$in': process.get('tasks', [])}})
        task_list = [
            {
                'id': str(task['_id']),
                'name': task['name'],
                'start_date': format_time(task.get('start_date', ''), 'task'),
                'end_date': format_time(task.get('end_date', ''), 'task')
            }
            for task in tasks
        ]
        return jsonify(task_list)
    else:
        return jsonify({'error': 'Process not found'}), 404

def format_time(time_str, time_type):
    if isinstance(time_str, str):  # אם time_str הוא מחרוזת
        try:
            # נניח שהתאריך במבנה של 'YYYY-MM-DD HH:MM'
            time_obj = datetime.strptime(time_str, '%Y-%m-%d %H:%M')
            return time_obj.strftime('%d/%m/%Y %H:%M')
        except ValueError:
            return ''  # במקרה שהתאריך לא תקין
    return time_str.strftime('%d/%m/%Y %H:%M')  # אם time_str כבר אובייקט datetime

@app.route('/dashboard')
def dashboard():
    # Retrieve all data from the 'process' collection
    processes = process_collection.find()

    # Count statuses
    status_counts = {
        'ongoing': 0,
        'completed': 0,
        'pending': 0
    }
    for process in processes:
        status = process.get('status', 'unknown')
        if status in status_counts:
            status_counts[status] += 1

    # Prepare process list with formatted times
    processes = process_collection.find()
    process_list = [
        {
            'id': str(process['_id']),
            'name': process['name'],
            'description': process['description'],
            'status': process['status'],
            'start_time': format_time(process.get('Start_Time', ''), 'process'),
            'finish_time': format_time(process.get('finish_time', ''), 'process'),
            'client': process['client']
        }
        for process in processes
    ]

    # Pass status counts and process list to template
    return render_template(
        'dashboard.html',
        processes=process_list,
        status_counts=status_counts
    )

if __name__ == '__main__':
    app.run(port=5001)


