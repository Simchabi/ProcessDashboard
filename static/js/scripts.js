function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    if (modalId === 'processModal') {
        $('#processSelect').val(''); // איפוס הבחירה
        $('#processSelect').empty().append('<option value="" disabled selected hidden>Select Process</option>'); // איפוס רשימת הבחירות
        $('#processForm').hide(); // הסתרת הטופס
    } else if (modalId === 'taskModal') {
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
    } else if (modalId === 'sensorModalTask') {
        $('#tasksensorSelect').val('');
        $('#sensorModalTask').modal('hide');
    } else if (modalId === 'addsensorModalTask') {
        $('#addSensorSelect').val('');
        $('#addsensorModalTask').modal('hide');
    } else if (modalId === 'addtaskModalProcess') {
        $('#addTaskSelect').val('');
        $('#addtaskModalProcess').modal('hide');
    } else if (modalId === 'taskModalProcess') {
        $('#processtaskSelect').val('');
        $('#taskModalProcess').modal('hide');
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

function loadAvailableSensors(taskId) {
    $.get(`/available_sensors/${taskId}`, function (data) {
        $('#addSensorSelect').empty().append('<option value="" disabled selected hidden>Select sensor to add</option>');
        data.forEach(sensor => {
            $('#addSensorSelect').append(`<option value="${sensor.id}">${sensor.id}</option>`);
        });
    }).fail(function () {
        alert("Failed to load available sensors.");
    });
}

function loadAvailableTasks(processId) {
    $.get(`/available_tasks/${processId}`, function (data) {
        $('#addTaskSelect').empty().append('<option value="" disabled selected hidden>Select task to add</option>');
        data.forEach(task => {
            $('#addTaskSelect').append(`<option value="${task.id_task}">${task.id_task}</option>`);
        });
    }).fail(function () {
        alert("Failed to load available tasks.");
    });
}

function getSensorDetailsTask(sensorId) {
    if (sensorId) {
        $.get(`/sensorID/${sensorId}`, function (data) {
            $('#_idTask').val(data._id);
            $('#sensoridTask').val(data.id);
            $('#sensornameTask').val(data.name);
            $('#sensorownerTask').val(data.owner);
            $('#sensorstatusTask').val(data.status);
            $('#sensorModalTask').modal('show');
        });
    }
}

function AddgetSensorDetailsTask(sensorId) {
    if (sensorId) {
        $.get(`/sensorID/${sensorId}`, function (data) {
            $('#_addidTask').val(data._id);
            $('#addsensoridTask').val(data.id);
            $('#addsensornameTask').val(data.name);
            $('#addsensorownerTask').val(data.owner);
            $('#addsensorstatusTask').val(data.status);
            $('#addsensorModalTask').modal('show');
        });
    }
}

function getTaskDetailsProcess(taskId) {
    if (taskId) {
        $.get(`/taskID/${taskId}`, function (data) {
            $('#_deleteidTaskToProcess').val(data._id);
            $('#deletetaskid').val(data.id_task);
            $('#deletetaskName').val(data.name);
            $('#deletetaskdescription').val(data.description);
            $('#deletetaskowner').val(data.owner);
            $('#deletetaskstatus').val(data.status);
            $('#deletetaskteam').val(data.team);
            $('#deletestartDate').val(data.start_date);
            $('#deleteendDate').val(data.end_date);
            $('#deletelink').val(data.link);
            $('#deleteremarks').val(data.remarks);
            $('#taskModalProcess').modal('show');
        });
    }
}

function AddgetTaskDetailsProcess(taskId) {
    if (taskId) {
        $.get(`/taskID/${taskId}`, function (data) {
            $('#_addidTaskToProcess').val(data._id);
            $('#addtaskid').val(data.id_task);
            $('#addtaskName').val(data.name);
            $('#addtaskdescription').val(data.description);
            $('#addtaskowner').val(data.owner);
            $('#addtaskstatus').val(data.status);
            $('#addtaskteam').val(data.team);
            $('#addstartDate').val(data.start_date);
            $('#addendDate').val(data.end_date);
            $('#addlink').val(data.link);
            $('#addremarks').val(data.remarks);
            $('#addtaskModalProcess').modal('show');
        });
    }
}

function saveSensorChanges() {
    const sensorId = $('#_id').val();
    const data = {
        name: $('#sensorname').val(),
        owner: $('#sensorowner').val(),
        status: $('#sensorstatus').val(),
    };
    $.ajax({
        url: `/update_sensor/${sensorId}`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            alert(response.message);
            //  loadSensors(); // למשל, טען מחדש את ה-sensors
            closeModal('sensorModal');
        },
        error: function (xhr, status, error) {
            alert("Error: " + error);
        }
    });
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

function saveUserChanges() {
    const userId = $('#user_id').val();
    const data = {
        name: $('#userName').val(),
        role: $('#role').val(),
        team: $('#userteam').val(),
        permission: $('#permission').val(),
    };
    $.ajax({
        url: `/update_user/${userId}`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            alert(response.message);
            closeModal('userModal');
        },
        error: function (xhr, status, error) {
            alert("Error: " + error);
        }
    });
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

            $('#tasksensorSelect').empty().append('<option value="" disabled selected hidden>Select sensor to delete</option>');
            task.sensors.forEach(sensorId => {
                $('#tasksensorSelect').append(`<option value="${sensorId}">${sensorId}</option>`); // Add sensors dynamically
            });
            loadAvailableSensors(taskId);
            $('#taskForm').show();
        });
    }
}

function saveTaskChanges() {
    const taskId = $('#task_id').val();
     // בודקים אם הסנסורים שונו. אם לא, לא נשלח אותם
     let sensors = $('#tasksensorSelect').val();
     if (!sensors) {
         sensors = undefined;  // לא שולחים את הסנסורים אם לא נבחרו
     }
    const data = {
        name: $('#taskName').val(),
        description: $('#taskdescription').val(),
        owner: $('#taskowner').val(),
        status: $('#taskstatus').val(),
        team: $('#taskteam').val(),
        start_date: $('#startDate').val(),
        end_date: $('#endDate').val(),
        link: $('#link').val(),
        remarks: $('#remarks').val(),
        sensors: sensors  
    };
     // מוודאים שלא נשלחים ערכים לא מעודכנים
     const filteredData = {};
     for (const key in data) {
         if (data[key] !== undefined) {
             filteredData[key] = data[key];
         }
     }
    $.ajax({
        url: `/update_task/${taskId}`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            alert(response.message);
            closeModal('taskModal');
        },
        error: function (xhr, status, error) {
            alert("Error: " + error);
        }
    });
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

            $('#processtaskSelect').empty().append('<option value="" disabled selected hidden>Select task to delete</option>');
            data.tasks.forEach(taskId => {
                $('#processtaskSelect').append(`<option value="${taskId}">${taskId}</option>`); // Add tasks dynamically
            });
            loadAvailableTasks(processId);
            $('#processForm').show();
        });
    }
}

function saveProcessChanges() {
    let tasks = $('#processtaskSelect').val();
    if (!tasks) {
        tasks = undefined;  // לא שולחים את הסנסורים אם לא נבחרו
    }
   // const selectedTaskIds = Array.from($('#taskIds option:selected')).map(option => option.value);
    const processId = $('#process_id').val();
    const data = {
        name: $('#processName').val(),
        client: $('#client').val(),
        description: $('#processdescription').val(),
        owner: $('#owner').val(),
        status: $('#status').val(),
        team: $('#team').val(),
        Start_Time: $('#Start_Time').val(),
        finish_time: $('#finish_time').val(),
        tasks: tasks // selectedTaskIds
    };
    // מוודאים שלא נשלחים ערכים לא מעודכנים
    const filteredData = {};
    for (const key in data) {
        if (data[key] !== undefined) {
            filteredData[key] = data[key];
        }
    }
    $.ajax({
        url: `/update_process/${processId}`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (response) {
            alert(response.message);
            closeModal('processModal');
        },
        error: function (xhr, status, error) {
            alert("Error: " + error);
        }
    });
}

// הוספת סנסור למשימה
function addSensorToTask() {
    const taskId = $('#task_id').val();
    const sensorId = $('#addSensorSelect').val();
    if (sensorId) {
        $.ajax({
            url: `/add_sensor_task/${taskId}/${sensorId}`,
            type: 'POST',
            success: function (result) {
                alert(result.message);
                // עדכון הרשימה - הוספת הסנסור לרשימת הסנסורים של המשימה
                $('#addSensorSelect').append(`<option value="${sensorId}">${sensorId}</option>`);
                getTaskDetails(taskId);
                $('#addsensorModalTask').modal('hide');
            },
            error: function (err) {
                alert('Error adding sensor: ' + err.responseText);
            }
        });
    }
}

// מחיקת סנסור ממשימה
function deleteSensorToTask() {
    const taskId = $('#task_id').val();
    const sensorId = $('#tasksensorSelect').val();
    if (sensorId) {
        $.ajax({
            url: `/delete_sensor_task/${taskId}/${sensorId}`,
            type: 'DELETE',
            success: function (result) {
                alert(result.message);
                // הסרת הסנסור מהרשימה ב-UI
                $(`#tasksensorSelect option[value="${sensorId}"]`).remove();
                getTaskDetails(taskId);
                $('#sensorModalTask').modal('hide');
            },
            error: function (err) {
                alert('Error deleting sensor: ' + err.responseText);
            }
        });
    }
}

// הוספת משימה לתהליך
function addTaskToProcess() {
    const processId = $('#process_id').val();
    const taskId = $('#addTaskSelect').val();
    if (taskId) {
        $.ajax({
            url: `/add_task_to_process/${processId}/${taskId}`,
            type: 'POST',
            success: function (result) {
                alert(result.message);
                // עדכון הרשימה - הוספת המשימה לרשימת המשימות בתהליך
                $('#addTaskSelect').append(`<option value="${taskId}">${taskId}</option>`);
                getProcessDetails(processId);
                $('#addtaskModalProcess').modal('hide');
            },
            error: function (err) {
                alert('Error adding task: ' + err.responseText);
            }
        });
    }
}

// מחיקת משימה מתהליך
function deleteTaskToProcess() {
    const processId = $('#process_id').val();
    const taskId = $('#deletetaskid').val();
    if (taskId) {
        $.ajax({
            url: `/delete_task_from_process/${processId}/${taskId}`,
            type: 'DELETE',
            success: function (result) {
                alert(result.message);
                // הסרת המשימה מהרשימה ב-UI
                $(`#processTaskSelect option[value="${taskId}"]`).remove();
                getProcessDetails(processId);
                $('#taskModalProcess').modal('hide');
            },
            error: function (err) {
                alert('Error deleting task: ' + err.responseText);
            }
        });
    }
}
