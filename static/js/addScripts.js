let selectedSensors = [];
let selectedTasks = [];
let selectedUsers = '';
let currentEntityType;
function validateForm(entityType) {
    let allFilled = true;
    let requiredFields = [];
    let emptyFields = [];

    switch (entityType) {
        case 'sensor':
            requiredFields = ['id', 'name', 'status'];
            break;
        case 'user':
            requiredFields = ['name', 'role', 'team', 'permission', 'password', 'Id'];
            break;
        case 'task':
            requiredFields = ['id_task', 'description', 'name', 'status', 'team', 'end_date', 'report_link', 'remarks', 'start_date'];
            break;
        case 'process':
            requiredFields = ['name', 'report_link', 'status', 'team', 'Start_Time', 'finish_time', 'client'];
            break;
    }

    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        if (!input.value) {
            allFilled = false;
            emptyFields.push(field); // לאסוף את השדות הריקים
        }
    });

    if (!allFilled) {
        alert(`The following fields are required: ${emptyFields.join(', ')}`); // הצגת רשימת שדות ריקים
    }

    return allFilled;
}

function AddgetSensorDetailsTask(sensorId) {
    if (sensorId) {
        $.get(`/sensor/${sensorId}`, function (data) {
            $('#_addidTask').val(data._id);
            $('#addsensoridTask').val(data.id);
            $('#addsensornameTask').val(data.name);
            $('#addsensorownerTask').val(data.owner);
            $('#addsensorstatusTask').val(data.status);
            $('#addsensorModalTask').modal('show');
        });
    }
}

function AddgetTaskDetailsProcess(taskId) {
    if (taskId) {
        $.get(`/task/${taskId}`, function (data) {
            $('#_addidTaskToProcess').val(data._id);
            $('#addtaskid').val(data.id_task);
            $('#addtaskName').val(data.name);
            $('#addtaskdescription').val(data.description);
            $('#addtaskowner').val(data.owner);
            $('#addtaskstatus').val(data.status);
            $('#addtaskteam').val(data.team);
            $('#addstartDate').val(data.start_date);
            $('#addendDate').val(data.end_date);
            $('#addreport_link').val(data.report_link);
            $('#addremarks').val(data.remarks);
            $('#addtaskModalProcess').modal('show');
        });
    }
}

function AddgetUserDetails(userId) {
    if (userId) {
        $.get(`/user/${userId}`, function (data) {
            $('#_addUserId').val(data._id);
            $('#addUserName').val(data.name);
            $('#addUserRole').val(data.role);
            $('#addUserTeam').val(data.team);
            $('#addUserPermission').val(data.permission);
            $('#addUserModal').modal('show');
        });
    }
}

function openAddForm(entityType) {
    currentEntityType = entityType;
    $('#addModal').modal('show');
    $('#addModalTitle').text(`Let's add ${entityType}`);
    $('#addForm').empty();

    let fields = {
        sensor: [
            { id: 'id', label: 'ID', type: 'number', readonly: false },//טקסט
            { id: 'name', label: 'Name', type: 'text' },
            //    { id: 'owner', label: 'Owner', type: 'text' },
            { id: 'status', label: 'Status', type: 'text' }
        ],
        user: [
            { id: 'name', label: 'Name', type: 'text', readonly: true },
            { id: 'role', label: 'Role', type: 'text' },
            { id: 'team', label: 'Team', type: 'text' },
            { id: 'permission', label: 'Permission', type: 'text' },
            { id: 'password', label: 'Password', type: 'password' },
            { id: 'Id', label: 'ID', type: 'text', readonly: false }
        ],
        task: [
            { id: 'id_task', label: 'ID', type: 'number', readonly: false },//text
            { id: 'description', label: 'Description', type: 'text' },
            { id: 'name', label: 'Name', type: 'text' },
            // { id: 'owner', label: 'Owner', type: 'text' },
            { id: 'status', label: 'Status', type: 'text' },
            { id: 'team', label: 'Team', type: 'text' },
            { id: 'start_date', label: 'Start Date', type: 'datetime-local' },
            { id: 'end_date', label: 'End Date', type: 'datetime-local' },
            { id: 'report_link', label: 'Report_link', type: 'url' },
            { id: 'remarks', label: 'Remarks', type: 'textarea' }
        ],
        process: [
            { id: 'name', label: 'Name', type: 'text' },
            { id: 'report_link', label: 'Report_link', type: 'text' },
            //  { id: 'owner', label: 'Owner', type: 'text' },
            { id: 'status', label: 'Status', type: 'text' },
            { id: 'team', label: 'Team', type: 'text' },
            { id: 'Start_Time', label: 'Start Time', type: 'datetime-local' },
            { id: 'finish_time', label: 'Finish Time', type: 'datetime-local' },
            { id: 'client', label: 'Client', type: 'text' }
        ]
    };
    // Fetching users data to add user select dropdown
    $.get(`/users`, function (data) {
        const userOptions = [
            '<option value="" disabled selected hidden>Select owner to add</option>'
        ]
            .concat(data.map(user => `<option value="${user._id}">${user.name}</option>`));

        const userField = {
            id: 'add_user',
            label: 'Owner',
            type: 'select',
            options: userOptions,
            onchange: "AddgetUserDetails(this.value)"
        };
        if (entityType === 'task') {
            $.get(`/sensors`, function (data) {
                const sensorOptions = [
                    '<option value="" disabled selected hidden>Select sensor to add</option>'
                ]
                    .concat(data.map(sensor => `<option value="${sensor._id}">${sensor.name}</option>`));
                fields.task.push({
                    id: 'add_sensor',
                    label: 'Sensor',
                    type: 'select',
                    options: sensorOptions,
                    onchange: "AddgetSensorDetailsTask(this.value)"
                });
                fields.task.push(userField);
                renderForm(fields[entityType]);
            });
        } else if (entityType === 'process') {
            $.get(`/tasks`, function (data) {
                const taskOptions = [
                    '<option value="" disabled selected hidden>Select task to add</option>'
                ]
                    .concat(data.map(task => `<option value="${task._id}">${task.name}</option>`));
                fields.process.push({
                    id: 'add_task',
                    label: 'Task',
                    type: 'select',
                    options: taskOptions,
                    onchange: "AddgetTaskDetailsProcess(this.value)"
                });
                fields.process.push(userField);
                renderForm(fields[entityType]);
            });
        } else if (entityType === 'sensor') {
            fields.sensor.push(userField);
            renderForm(fields[entityType]);
        } else {
            renderForm(fields[entityType]);
        }
    });
}

function renderForm(fields) {
    fields.forEach(field => {
        let inputElement;
        if (field.type === 'select') {
            inputElement = `
                <select id="${field.id}" class="form-control" onchange="${field.onchange}">
                    ${field.options.join('')}
                </select>
            `;
        } else if (field.type === 'textarea') {
            inputElement = `<textarea id="${field.id}" class="form-control"></textarea>`;
        } else {
            inputElement = `<input type="${field.type}" id="${field.id}" class="form-control" ${field.readonly ? 'readonly' : ''} autocomplete="off" required>`;
        }

        $('#addForm').append(`
            <div class="mb-3">
                <label for="${field.id}" class="form-label">${field.label}</label>
                ${inputElement}
            </div>
        `);
    });
}
//     fields[entityType].forEach(field => {
//         $('#addForm').append(`
//             <div class="mb-3">
//                 <label for="${field.id}" class="form-label">${field.label}</label>
//                 <input type="${field.type}" id="${field.id}" class="form-control" ${field.readonly ? 'readonly' : ''} autocomplete="off" required>
//             </div>
//         `);
//     });
// }

function addSensorToTask() {
    const sensorId = $('#addsensoridTask').val();  // השגת ה-ID של הסנסור שנבחר
    if (sensorId && !selectedSensors.includes(parseInt(sensorId))) {
        selectedSensors.push(parseInt(sensorId));
        alert(`Sensor ${sensorId} added to the task!`);
    } else {
        alert('This sensor is already added.');
    }
    $('#addsensorModalTask').modal('hide');
}

function addTaskToProcess() {
    const taskId = $('#addtaskid').val();
    if (taskId && !selectedTasks.includes(parseInt(taskId))) {
        selectedTasks.push(parseInt(taskId));
        alert(`Task ${taskId} added to the process!`);
    } else {
        alert('This task is already added.');
    }
    $('#addtaskModalProcess').modal('hide');
}

function addUserToOwner() {
    const userId = $('#_addUserId').val(); // Get user ID from modal
    const userName = $('#addUserName').val();  // קבלת שם המשתמש מתוך המודאל
    if (userId && userName) {
        selectedUsers = userName;  // שמירת שם המשתמש במשתנה
        alert(`User ${userName} added successfully!`);
    } else {
        alert('This user is already added.');
    }
    $('#addUserModal').modal('hide');
}

function saveNewEntity(entityType) {
    if (!validateForm(entityType)) {
        return;
    }
     if (!selectedUsers || selectedUsers.trim() === '') {
        alert('You must select owner!');
        return; 
    }
    const entityData = {};
    $('#addForm input, #addForm textarea').each(function () {
        entityData[$(this).attr('id')] = $(this).val();
    });
    if (entityType === 'task') {
        entityData.sensors = selectedSensors;
        entityData.owner = selectedUsers;
    }
    if (entityType === 'process') {
        entityData.tasks = selectedTasks;
        entityData.owner = selectedUsers;
    }
    if (entityType === 'sensor') {
        entityData.owner = selectedUsers;

    }
    $.ajax({
        url: '/add_entity',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(entityData),
        success: function (response) {
            alert(response.message);
            $('#addModal').modal('hide');
            selectedSensors = [];
            selectedTasks = [];
            selectedUsers = '';
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    });
}

function closeModal() {
    $('#addModal').modal('hide');
}
