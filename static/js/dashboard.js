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

function convertToDate(dateStr) {
    if (!dateStr) return null;
    const [day, month, yearAndTime] = dateStr.split('/');
    const [year, time] = yearAndTime.split(' ');
    const isoDate = `${year}-${month}-${day}T${time}:00`;
    return new Date(isoDate);
}

// Data for the processes
const processes = JSON.parse(document.getElementById('process-data').textContent);
const processData = processes.map(process => {
    return {
        ...process,
        start_time: convertToDate(process.start_time),
        finish_time: convertToDate(process.finish_time)
    };
});
// Sort processes by start time
const sortedProcesses = processData.sort((a, b) => a.start_time - b.start_time);

// Create data for the Gantt chart
const graphData = sortedProcesses.map(process => ({
    x: [new Date(process.finish_time) - new Date(process.start_time)],
    y: [process.name],
    base: [new Date(process.start_time)],
    type: 'bar',
    orientation: 'h',
    text: `Start: ${process.start_time.toLocaleString()} | Finish: ${process.finish_time.toLocaleString()}`,
    hoverinfo: 'text',
}));

// Create a Gantt chart for processes
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

document.getElementById('process-chart').on('plotly_click', function (data) {
    const processName = data.points[0].y;
    const process = processes.find(p => p.name === processName);

    if (process) {
        $.get(`/tasks/${process.id}`, function (tasks) {
            const tasksData = tasks.map(task => {
                return {
                    ...task,
                    start_date: convertToDate(task.start_date),
                    end_date: convertToDate(task.end_date)
                };
            });
            // Sort tasks by start time
            const sortedtasks = tasksData.sort((a, b) => a.start_date - b.start_date);
            const taskData = sortedtasks.map(task => ({
                x: [new Date(task.end_date) - new Date(task.start_date)],
                y: [task.name],
                base: [new Date(task.start_date)],
                type: 'bar',
                orientation: 'h',
                text: `Start: ${new Date(task.start_date).toLocaleString()} | Finish: ${new Date(task.end_date).toLocaleString()}`,
                hoverinfo: 'text'
            }));

            // Create a Gantt chart for tasks
            Plotly.newPlot('task-chart', taskData, {
                title: `משימות לתהליך: ${process.name}`,
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

    // Function to convert the date to the desired format
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    // Handling clicking on a row in the table
    document.querySelectorAll("#data-table-section table tbody tr").forEach((row) => {
        row.addEventListener("click", () => {
            const processId = row.dataset.processId;
            const processName = row.querySelector(".process-name").textContent;

            popupTitle.textContent = `המשימות של: ${processName}`;
            fetch(`/process_tasks/${processId}`)
                .then(response => response.json())
                .then(data => {
                    const tasks = data.tasks || [];
                    taskTableBody.innerHTML = "";

                    if (tasks.length === 0) {
                        taskTableBody.innerHTML = "<tr><td colspan='6'>לא נמצאו משימות</td></tr>";
                    } else {
                        tasks.forEach(taskId => {
                            fetch(`/taskID/${taskId}`)
                                .then(response => response.json())
                                .then(task => {
                                    // Create a new row in the table with the task details
                                    const row = document.createElement("tr");
                                    row.innerHTML = `
                                        <td>${task.name}</td>
                                        <td>${task.report_link ? `
                                        <a href="${task.report_link}" target="_blank" 
                                        class="preview-link" 
                                        data-preview="https://drive.google.com/file/d/${task.report_link.split('/')[5]}/preview">
                                        Open Report</a>` : ''}</td>
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
                    // Display the popup window
                    popupContainer.classList.remove("hidden");
                })
                .catch(error => {
                    console.error("Error fetching tasks:", error);
                    taskTableBody.innerHTML = "<tr><td colspan='6'>שגיאה בשליפת משימות</td></tr>";
                });
        });
    });

    // Close the popup window by clicking the close button
    closeButton.addEventListener("click", () => {
        popupContainer.classList.add("hidden");
    });

    // Close the popup window by clicking outside the window
    popupContainer.addEventListener("click", (event) => {
        if (event.target === popupContainer) {
            popupContainer.classList.add("hidden");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const previewPopup = document.createElement("div");
    previewPopup.classList.add("preview-popup");
    document.body.appendChild(previewPopup);

    let previewUrl = "";

    // Show preview window on mouseover
    document.addEventListener("mouseover", (event) => {
        const link = event.target.closest(".preview-link");
        if (link) {
            previewUrl = link.getAttribute("data-preview");
            previewPopup.innerHTML = `<iframe src="${previewUrl}" onerror="this.parentNode.innerHTML='Unable to load preview';"></iframe>`;
            previewPopup.style.display = "block";

            const rect = link.getBoundingClientRect();
            previewPopup.style.top = `${rect.bottom + 10 + window.scrollY}px`;
            previewPopup.style.left = `${rect.left + window.scrollX}px`;
        }
    });

    // Leave a window open when hovering over it
    document.addEventListener("mouseout", (event) => {
        if (!event.relatedTarget || !previewPopup.contains(event.relatedTarget)) {
            previewPopup.style.display = "none";
            previewPopup.innerHTML = "";
        }
    });

    // Clicking on the preview window
    previewPopup.addEventListener("click", () => {
        if (previewUrl) {
            window.open(previewUrl, "_blank");
        }
    });
});
