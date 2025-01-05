from flask import Flask, render_template, request, jsonify, Response
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

@app.after_request
def add_csp(response: Response) -> Response:
    response.headers['Content-Security-Policy'] = "frame-ancestors 'self' https://drive.google.com"
    return response

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
    sensors = list(sensor_collection.find({}, {'_id': 1, 'name': 1}))  
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
    if task['start_date']:
        task['start_date'] = task['start_date'].strftime('%Y-%m-%dT%H:%M')  
    if task['end_date']:
        task['end_date'] = task['end_date'].strftime('%Y-%m-%dT%H:%M')

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
    if process:
     if 'Start_Time' in process:
        process['Start_Time'] = process['Start_Time'].strftime('%Y-%m-%dT%H:%M') if isinstance(process['Start_Time'], datetime) else process['Start_Time']
     if 'finish_time' in process:
        process['finish_time'] = process['finish_time'].strftime('%Y-%m-%dT%H:%M') if isinstance(process['finish_time'], datetime) else process['finish_time']

    process['_id'] = str(process['_id']) 
    return jsonify(process), 200

@app.route('/process_tasks/<process_id>', methods=['GET'])
def get_tasks_in_process(process_id):
    try:
        process_id = ObjectId(process_id)
    except Exception as e:
        return jsonify({"error": "Invalid process ID"}), 400

    process = db.process.find_one({"_id": process_id})
    if process:
        return jsonify({"tasks": process.get("tasks", [])}) 
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
    if 'start_date' in data:
        data['start_date'] = datetime.strptime(data['start_date'], '%Y-%m-%dT%H:%M')
    if 'end_date' in data:
        data['end_date'] = datetime.strptime(data['end_date'], '%Y-%m-%dT%H:%M')
    task_collection.update_one({'_id': ObjectId(task_id)}, {'$set': data})
    return jsonify({"message": "Task updated successfully"}), 200

# Endpoint to return available sensors that are not in the task
@app.route('/available_sensors/<task_id>', methods=['GET'])
def available_sensors(task_id):
    task = task_collection.find_one({'_id': ObjectId(task_id)})    
    if not task:
        return jsonify({"message": "Task not found"}), 404

    existing_sensor_ids = task.get('sensors', [])
    available_sensors = list(sensor_collection.find({'id': {'$nin': existing_sensor_ids}}))

    for sensor in available_sensors:
        sensor['_id'] = str(sensor['_id'])
    return jsonify(available_sensors), 200

# Endpoint for returning available tasks that are not in process
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
    if 'Start_Time' in data:
        data['Start_Time'] = datetime.strptime(data['Start_Time'], '%Y-%m-%dT%H:%M')
    if 'finish_time' in data:
        data['finish_time'] = datetime.strptime(data['finish_time'], '%Y-%m-%dT%H:%M')
    
    if data is None:
        return jsonify({"error": "Invalid JSON"}), 400
    process_collection.update_one({'_id': ObjectId(process_id)}, {'$set': data})
    return jsonify({"message": "Process updated successfully"}), 200
 
# Path to add sensor from task  
@app.route('/add_sensor_task/<task_id>/<sensor_id>', methods=['POST'])
def add_sensor_task(task_id, sensor_id):
    try:
        result = task_collection.update_one(
            {"_id": ObjectId(task_id)},  
            {"$addToSet": {"sensors": int(sensor_id)}}  
        )
        if result.matched_count == 0:
            return jsonify({'error': 'Task not found'}), 404
        
        return jsonify({"success": True, "message": "Sensor added successfully"}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Path to delete a sensor from the task
@app.route('/delete_sensor_task/<task_id>/<sensor_id>', methods=['DELETE'])
def delete_sensor_task(task_id, sensor_id):
    try:
        result = task_collection.update_one(
            {"_id": ObjectId(task_id)}, 
            {"$pull": {"sensors": int(sensor_id)}}  
        )
        if result.matched_count == 0:
            return jsonify({'error': 'Task not found'}), 404
        
        return jsonify({"success": True, "message": "Sensor deleted successfully"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# Path to add a task to a process
@app.route('/add_task_to_process/<process_id>/<task_id>', methods=['POST'])
def add_task_to_process(process_id, task_id):
    try:
        result = process_collection.update_one(
            {"_id": ObjectId(process_id)},
            {"$addToSet": {"tasks": int(task_id)}}
        )
        if result.matched_count == 0:
            return jsonify({'error': 'Process not found'}), 404

        return jsonify({"success": True, "message": "Task added successfully"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Path to delete a task from a process
@app.route('/delete_task_from_process/<process_id>/<task_id>', methods=['DELETE'])
def delete_task_from_process(process_id, task_id):
    try:
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
        required_fields = ['id', 'name', 'status']
        collection = db.sensor 
    elif 'Id' in data:
        required_fields = ['name', 'role', 'team', 'permission','password', 'Id']
        collection = db.user
    elif 'id_task' in data:
        required_fields = ['id_task', 'description', 'name', 'status','team', 'end_date','report_link', 'remarks', 'start_date'] 
        collection = db.task
    elif 'name' in data:
        required_fields = ['name', 'report_link','status','team','Start_Time', 'finish_time', 'client']
        collection = db.process

    if collection is not None:
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        if missing_fields:
            return jsonify({"message": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        if 'id' in data:
            try:
                data['id'] = int(data['id'])  
                if data['id'] < -2147483648 or data['id'] > 2147483647:
                    return jsonify({"message": "ID must be an Int32"}), 400
            except ValueError:
                return jsonify({"message": "Invalid ID format"}), 400
            
        if 'id_task' in data:
            try:
                data['id_task'] = int(data['id_task'])  
                if data['id_task'] < -2147483648 or data['id_task'] > 2147483647:
                    return jsonify({"message": "id_task must be an Int32"}), 400
            except ValueError:
                return jsonify({"message": "Invalid id_task format"}), 400

        date_fields = ['start_date', 'end_date', 'Start_Time', 'finish_time']
        for field in date_fields:
            if field in data:
                try:
                    data[field] = datetime.fromisoformat(data[field].replace("Z", ""))
                except ValueError:
                    return jsonify({"message": f"Invalid date format for {field}. Use ISO 8601 format."}), 400
                   
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
    if isinstance(time_str, str): 
        try:
            time_obj = datetime.strptime(time_str, '%Y-%m-%d %H:%M')
            return time_obj.strftime('%d/%m/%Y %H:%M')
        except ValueError:
            return ''  
    return time_str.strftime('%d/%m/%Y %H:%M') 

@app.route('/dashboard')
def dashboard():
    processes = process_collection.find()

    # Count statuses
    status_counts = {
        'בתהליך': 0,
        'הושלם': 0,
        'בהמתנה': 0
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
            'report_link': process['report_link'],
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