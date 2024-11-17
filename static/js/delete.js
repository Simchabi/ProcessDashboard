function closeModal(modalId) { 
    document.getElementById(modalId).style.display = 'none';
    if (modalId === 'processModal') {
        $('#processSelect').val(''); // איפוס הבחירה
        $('#processSelect').empty().append('<option value="" disabled selected hidden>Select Process</option>'); // איפוס רשימת הבחירות
        $('#processForm').hide(); // הסתרת הטופס
    }else if (modalId === 'taskModal') {
        $('#taskSelect').val(''); 
        $('#taskSelect').empty().append('<option value="" disabled selected hidden>Select Task</option>'); // איפוס רשימת הבחירות
        $('#taskForm').hide(); 
    } else if (modalId === 'userModal') {
        $('#userSelect').val(''); 
        $('#userSelect').empty().append('<option value="" disabled selected hidden>Select User</option>'); // איפוס רשימת הבחירות
        $('#userForm').hide(); 
    } else if (modalId === 'sensorModal') {
        $('#sensorSelect').val(''); 
        $('#sensorSelect').empty().append('<option value="" disabled selected hidden>Select Sensor</option>'); // איפוס רשימת הבחירות
        $('#sensorForm').hide(); 
    }
}

function loadSensors() {
    $('#sensorSelect').empty().append('<option value="" disabled selected hidden>choose sensor</option>');
    $.get('/sensors', function (data) {
        data.forEach(sensor => {
            $('#sensorSelect').append(`<option value="${sensor._id}">${sensor.name}</option>`);
        });
    });
    $('#sensorModal').show();
}

function getSensorDetails(sensorId) {
    if (sensorId) {
        $.get(`/sensor/${sensorId}`, function (data) {
            $('#_id').val(data._id);
            $('#sensorid').val(data.id);
            $('#sensorname').val(data.name);
            $('#sensorowner').val(data.owner);
            $('#sensorstatus').val(data.status);
            $('#sensorForm').show();
        });
    }
}

function deleteSensor() {
    const sensorId = $('#_id').val();
    if (sensorId) {
        $.ajax({
            url: `/delete_sensor/${sensorId}`,
            type: 'DELETE',
            success: function (response) {
                alert(response.message || 'Sensor deleted successfully');
                closeModal('sensorModal');
            },
            error: function (xhr, status, error) {
                alert("Error: " + (xhr.responseJSON ? xhr.responseJSON.error : error));
            }
        });
    } else {
        alert("No sensor ID provided.");
    }
}

function loadUsers() {
    $('#userSelect').empty().append('<option value="" disabled selected hidden>Choose User</option>');
    $.get('/users', function (data) {
        data.forEach(user => {
            $('#userSelect').append(`<option value="${user._id}">${user.name}</option>`);
        });
    });
    $('#userModal').show();
}

function getUserDetails(userId) {
    if (userId) {
        $.get(`/user/${userId}`, function (data) {
            $('#user_id').val(data._id);
            $('#userId').val(data.Id);
            $('#userName').val(data.name);
            $('#role').val(data.role);
            $('#userteam').val(data.team);
            $('#permission').val(data.permission);
            $('#password').val(data.password);
            $('#userForm').show();
        });
    }
}

function deleteUser() {
    const userId = $('#user_id').val();
    if (userId) {
        $.ajax({
            url: `/delete_user/${userId}`,
            type: 'DELETE',
            success: function (response) {
                alert(response.message || 'User deleted successfully');
                closeModal('userModal');
            },
            error: function (xhr, status, error) {
                alert("Error: " + (xhr.responseJSON ? xhr.responseJSON.error : error));
            }
        });
    } else {
        alert("No user ID provided.");
    }
}

function loadTasks() {
    $('#taskSelect').empty().append('<option value="" disabled selected hidden>Choose Task</option>');
    $.get('/tasks', function (data) {
        data.forEach(task => {
            $('#taskSelect').append(`<option value="${task._id}">${task.name}</option>`);
        });
    });
    $('#taskModal').show();
}

function getTaskDetails(taskId) {
    if (taskId) {
        $.get(`/task/${taskId}`, function (task) {
            $('#task_id').val(task._id);
            $('#taskid').val(task.id_task);
            $('#taskName').val(task.name);
            $('#taskdescription').val(task.description);
            $('#taskowner').val(task.owner);
            $('#taskstatus').val(task.status);
            $('#taskteam').val(task.team);
            $('#startDate').val(task.start_date);
            $('#endDate').val(task.end_date);
            $('#link').val(task.link);
            $('#remarks').val(task.remarks);

            // Populate the sensors dropdown
            $('#tasksensorSelect').empty();
            task.sensors.forEach(sensorId => {
                $('#tasksensorSelect').append(`<option value="${sensorId}">${sensorId}</option>`); // Add sensors dynamically
            });
            $('#taskForm').show();
        });
    }
}

function deleteTask() {
    const taskId = $('#task_id').val();
    if (taskId) {
        $.ajax({
            url: `/delete_task/${taskId}`,
            type: 'DELETE',
            success: function (response) {
                alert(response.message || 'Task deleted successfully');
                closeModal('taskModal');
            },
            error: function (xhr, status, error) {
                alert("Error: " + (xhr.responseJSON ? xhr.responseJSON.error : error));
            }
        });
    } else {
        alert("No task ID provided.");
    }
}

function loadProcesses() {
    $('#processSelect').empty().append('<option value="" disabled selected hidden>Choose Process</option>');
    $.get('/processes', function (data) {
        data.forEach(process => {
            $('#processSelect').append(`<option value="${process._id}">${process.name}</option>`);
        });
    });
    $('#processModal').show();
}

function getProcessDetails(processId) {
    if (processId) {
        $.get(`/process/${processId}`, function (data) {
            $('#process_id').val(data._id);
            $('#processName').val(data.name);
            $('#client').val(data.client);
            $('#processdescription').val(data.description);
            $('#owner').val(data.owner);
            $('#status').val(data.status);
            $('#team').val(data.team);
            $('#Start_Time').val(data.Start_Time);
            $('#finish_time').val(data.finish_time);
            // טוען את ה-ID של הטסקים לתיבה נפתחת
            $('#taskIds').empty();
            $.get(`/process_tasks/${processId}`, function (data) {  // יש להשתמש ב-ID של התהליך
                const taskIds = data.tasks;  // מערך של ה-ID של הטסקים
                taskIds.forEach(taskId => {
                    $('#taskIds').append(`<option value="${taskId}">${taskId}</option>`);  // מוסיף את ה-ID לתיבה
                });
            });
            $('#processForm').show();
        });
    }
}

function deleteProcess() {
    const processId = $('#process_id').val();
    if (processId) {
        $.ajax({
            url: `/delete_process/${processId}`,
            type: 'DELETE',
            success: function (response) {
                alert(response.message || 'Process deleted successfully');
                closeModal('processModal');
            },
            error: function (xhr, status, error) {
                alert("Error: " + (xhr.responseJSON ? xhr.responseJSON.error : error));
            }
        });
    } else {
        alert("No process ID provided.");
    }
}