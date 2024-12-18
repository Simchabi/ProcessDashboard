const statusCounts = JSON.parse(document.getElementById('status-data').textContent);
const ctx = document.getElementById('statusPieChart').getContext('2d');
const statusData = {
    labels: ['בתהליך', 'הושלם', 'ממתין'],
    datasets: [{
        label: '',
        data: [
            statusCounts.בתהליך,
            statusCounts.הושלם,
            statusCounts.בהמתנה
        ],
        backgroundColor: ['#ffc107', '#28a745', '#17a2b8'],
        borderWidth: 1
    }]
};

new Chart(ctx, {
    type: 'pie',
    data: statusData,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    }
});
// פונקציה להמיר את השעה לדייט עם תאריך (נשתמש בתאריך של היום)
function convertToDate(dateStr) {
    if (!dateStr) return null;

    const [day, month, yearAndTime] = dateStr.split('/');
    const [year, time] = yearAndTime.split(' ');
    const isoDate = `${year}-${month}-${day}T${time}:00`;

    return new Date(isoDate);
}

// נתונים עבור התהליכים
const processes = JSON.parse(document.getElementById('process-data').textContent);
const processData = processes.map(process => {
    return {
        ...process,
        start_time: convertToDate(process.start_time),
        finish_time: convertToDate(process.finish_time)
    };
});
// מיון התהליכים לפי זמן התחלה
const sortedProcesses = processData.sort((a, b) => a.start_time - b.start_time);

// יצירת נתונים לתרשים גנט
const graphData = sortedProcesses.map(process => ({
    x: [new Date(process.finish_time) - new Date(process.start_time)],
    y: [process.name],
    base: [new Date(process.start_time)],
    type: 'bar',
    orientation: 'h',
    text: `Start: ${process.start_time.toLocaleString()} | Finish: ${process.finish_time.toLocaleString()}`,
    hoverinfo: 'text',
}));

// יצירת תרשים גנט לתהליכים
Plotly.newPlot('process-chart', graphData, {
    title: '',
    barmode: 'stack',
    xaxis: {
        type: 'date',
        tickformat: '%d/%m/%Y %H:%M',
        tickmode: 'array',
        tickvals: sortedProcesses.map(process => new Date(process.start_time)),
    },
    yaxis: {
        tickmode: 'array',
        tickvals: sortedProcesses.map((_, index) => index),
        ticktext: sortedProcesses.map(process => process.name),
    }
});

// אירוע לחיצה על תהליך
document.getElementById('process-chart').on('plotly_click', function (data) {
    const processName = data.points[0].y; 
    const process = processes.find(p => p.name === processName);

    if (process) {
        // שליפת משימות ל-Process ID
        $.get(`/tasks/${process.id}`, function (tasks) {
            // המרת הזמנים לאובייקטי Date
            const tasksData = tasks.map(task => {
                return {
                    ...task,
                    start_date: convertToDate(task.start_date),
                    end_date: convertToDate(task.end_date)
                };
            });
            // מיון משימות לפי זמן התחלה
            const sortedtasks = tasksData.sort((a, b) => a.start_date - b.start_date);

            // המרת זמני התחלה וסיום לפורמט Date (רק תאריכים)
            const taskData = sortedtasks.map(task => ({
                x: [new Date(task.end_date) - new Date(task.start_date)],
                y: [task.name],
                base: [new Date(task.start_date)],
                type: 'bar',
                orientation: 'h',
                text: `Start: ${new Date(task.start_date).toLocaleString()} | Finish: ${new Date(task.end_date).toLocaleString()}`,
                hoverinfo: 'text'
            }));

            // יצירת תרשים גנט למשימות
            Plotly.newPlot('task-chart', taskData, {
                title: `Tasks for Process: ${process.name}`,
                barmode: 'stack',
                xaxis: {
                    type: 'date',
                    tickformat: '%d/%m/%Y %H:%M',
                    tickmode: 'array',
                    tickvals: sortedtasks.map(task => new Date(task.start_date)),
                },
                yaxis: {
                    tickmode: 'array',
                    tickvals: tasks.map((_, index) => index),
                    ticktext: tasks.map(task => task.name)
                }
            });
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const popupContainer = document.getElementById("popup-container");
    const popupContent = document.querySelector(".popup-content");
    const closeButton = document.querySelector(".close-button");
    const taskTableBody = document.getElementById("popup-task-table").querySelector("tbody");
    const popupTitle = document.querySelector(".popup-title");

    // פונקציה להמיר את התאריך לפורמט הרצוי
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    // טיפול בלחיצה על שורה בטבלה
    document.querySelectorAll("#data-table-section table tbody tr").forEach((row) => {
        row.addEventListener("click", () => {
            const processId = row.dataset.processId; 
            const processName = row.querySelector(".process-name").textContent; // נניח שיש עמודה עם שם התהליך

        // עדכון כותרת הפופאפ
        popupTitle.textContent = `המשימות של: ${processName}`;
            // בקשת AJAX לשרת לשליפת המשימות הקשורות לתהליך
            fetch(`/process_tasks/${processId}`)
                .then(response => response.json())
                .then(data => {
                    const tasks = data.tasks || []; 
                    taskTableBody.innerHTML = "";

                    // בדיקה אם נמצאו משימות
                    if (tasks.length === 0) {
                        taskTableBody.innerHTML = "<tr><td colspan='6'>לא נמצאו משימות</td></tr>";
                    } else {
                        // שליפת פרטי כל משימה על ידי ה-IDs של המשימות
                        tasks.forEach(taskId => {
                            // בקשת AJAX נוספת לכל משימה כדי לשלוף את פרטי המשימה
                            fetch(`/taskID/${taskId}`)
                                .then(response => response.json())
                                .then(task => {
                                    // יצירת שורה חדשה בטבלה עם פרטי המשימה
                                    const row = document.createElement("tr");
                                    row.innerHTML = `
                                        <td>${task.name}</td>
                                        <td><a href="${task.report_link}" target="_blank">${task.report_link}</a></td>
                                        <td>${task.status}</td>
                                        <td>${formatDate(task.start_date)}</td>
                                        <td>${formatDate(task.end_date)}</td>
                                        <td>${task.owner}</td>
                                    `;
                                    taskTableBody.appendChild(row);
                                })
                                .catch(error => {
                                    console.error("Error fetching task:", error);
                                    taskTableBody.innerHTML = "<tr><td colspan='6'>שגיאה בשליפת משימה</td></tr>";
                                });
                        });
                    }
                    // הצגת החלון הקופץ
                    popupContainer.classList.remove("hidden");
                })
                .catch(error => {
                    console.error("Error fetching tasks:", error);
                    taskTableBody.innerHTML = "<tr><td colspan='6'>שגיאה בשליפת משימות</td></tr>";
                });
        });
    });

    // סגירת החלון הקופץ בלחיצה על כפתור הסגירה
    closeButton.addEventListener("click", () => {
        popupContainer.classList.add("hidden");
    });

    // סגירת החלון הקופץ בלחיצה מחוץ לחלון
    popupContainer.addEventListener("click", (event) => {
        if (event.target === popupContainer) {
            popupContainer.classList.add("hidden");
        }
    });
});

