//const statusCounts = JSON.parse('{{ status_counts | tojson | safe }}');
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
//const processes = JSON.parse('{{ processes | tojson | safe }}');
const processes = JSON.parse(document.getElementById('process-data').textContent);
// המרת הזמנים לאובייקטי Date
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
        //title: 'Date',
        type: 'date',
        tickformat: '%d/%m/%Y %H:%M',
        tickmode: 'array',//auto
        tickvals: sortedProcesses.map(process => new Date(process.start_time)),
    },
    yaxis: {
        //title: 'Processes',
        tickmode: 'array',
        tickvals: sortedProcesses.map((_, index) => index),
        ticktext: sortedProcesses.map(process => process.name),
    }
});

// אירוע לחיצה על תהליך
document.getElementById('process-chart').on('plotly_click', function (data) {
    const processName = data.points[0].y; // שם התהליך שנבחר
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
                    //title: 'Date',
                    type: 'date',
                    tickformat: '%d/%m/%Y %H:%M',
                    tickmode: 'array',//auto
                    tickvals: sortedtasks.map(task => new Date(task.start_date)),
                },
                yaxis: {
                    //title: 'Tasks',
                    tickmode: 'array',
                    tickvals: tasks.map((_, index) => index),
                    ticktext: tasks.map(task => task.name)
                }
            });
        });
    }
});
