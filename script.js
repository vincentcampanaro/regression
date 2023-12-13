let globalData = null;
let chart = null;
let userTimeData = null;

function calculateRegression(data) {
    let n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    data.forEach(d => {
        sumX += d.x;
        sumY += d.y;
        sumXY += d.x * d.y;
        sumXX += d.x * d.x;
    });

    let m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    let c = (sumY - m * sumX) / n;

    if (!isFinite(m) || !isFinite(c)) {
        console.error('Invalid regression calculation', { m, c, data });
        return null;
    }

    return { m, c };
}

function parseTime(timeString) {
    timeString = timeString.replace(/[^\d:.]/g, '');
    let totalSeconds = 0;
    if (timeString.includes(':')) {
        const parts = timeString.split(':');
        totalSeconds = parts.reduce((acc, timePart, index) => {
            return acc + parseFloat(timePart) * Math.pow(60, parts.length - index - 1);
        }, 0);
    } else {
        totalSeconds = parseFloat(timeString);
    }
    console.log(`Parsed "${timeString}" to total seconds: ${totalSeconds}`);
    return totalSeconds;
}

function processData(rawData, selectedDistance, selectedStroke, selectedGender) {
    console.log("Processing data...");
    let filteredData = rawData.filter(row => {
        return row['Stroke'] === selectedStroke &&
               row['Distance (in meters)'] === selectedDistance &&
               row['Gender'] === selectedGender;
    });

    console.log(`Filtered data count: ${filteredData.length}`);

    return filteredData.map(row => {
        let year = parseInt(row['Year']);
        let time = parseTime(row['Results']);
        let athlete = row['Athlete'];
        if (isNaN(year) || isNaN(time)) {
            console.error('Invalid data point', { year, time, athlete });
            return null; // Return null for invalid data points
        }
        return { x: year, y: time, athlete: athlete, label: athlete };
    }).filter(d => d !== null); // Remove null entries from the dataset
}

function addUserTime() {
    let timeInput = document.getElementById('timeInput').value;
    let parsedTime = parseTime(timeInput);
    if (isNaN(parsedTime)) {
        alert("Invalid time format. Please enter time as min:sec, e.g., 2:05.30");
        return;
    }

    let currentYear = new Date().getFullYear();
    userTimeData = { x: currentYear, y: parsedTime, athlete: "You", label: "Your Time" };
}

function updateChart() {
    console.log("Updating chart...");
    let selectedDistance = document.getElementById('distanceSelect').value;
    let selectedStroke = document.getElementById('strokeSelect').value;
    let selectedGender = document.getElementById('genderSelect').value;

    // Process user's time
    let timeInput = document.getElementById('timeInput').value;
    let parsedTime = parseTime(timeInput);
    if (!isNaN(parsedTime)) {
        let currentYear = new Date().getFullYear();
        userTimeData = { x: currentYear, y: parsedTime, athlete: "You", label: "Your Time" };
    } else {
        userTimeData = null;
    }

    let processedData = processData(globalData, selectedDistance, selectedStroke, selectedGender);
    let regression = calculateRegression(processedData);

    if (!regression) {
        console.error('Cannot calculate regression.');
        return;
    }

    let startYear = 1960;
    let endYear = 2030;

    let startPoint = { x: startYear, y: regression.m * startYear + regression.c };
    let endPoint = { x: endYear, y: regression.m * endYear + regression.c };

    let regressionLine = [startPoint, endPoint];

    var ctx = document.getElementById('graph').getContext('2d');
    if (chart) {
        chart.destroy();
    }

    let datasets = [{
        label: 'Swim Times',
        data: processedData,
        backgroundColor: 'rgba(0, 123, 255, 0.5)',
        parsing: {
            yAxisKey: 'y',
            labelKey: 'label'
        }
    }, {
        label: 'Regression Line',
        data: regressionLine,
        type: 'line',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        fill: false,
        showLine: true,
        spanGaps: true,
    }];

    if (userTimeData) {
        datasets.push({
            label: 'Your Time',
            data: [userTimeData],
            backgroundColor: 'rgba(50, 205, 50, 0.7)',
            pointRadius: 6,
            parsing: {
                yAxisKey: 'y',
                labelKey: 'label'
            }
        });
    }

    chart = new Chart(ctx, {
        type: 'scatter',
        data: { datasets: datasets },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            const minutes = Math.floor(value / 60);
                            const seconds = value % 60;
                            return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
                        }
                    }
                },
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Year'
                    },
                    min: 1960,
                    max: 2030
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let athleteName = context.raw.label;
                            let xValue = context.parsed.x;
                            let yValue = context.parsed.y;
                            let minutes = Math.floor(yValue / 60);
                            let seconds = (yValue % 60).toFixed(2);
                            return `${athleteName}: (Year: ${xValue}, Time: ${minutes}:${seconds < 10 ? '0' + seconds : seconds})`;
                        }
                    }
                }
            }
        }
    });
}

Papa.parse("https://raw.githubusercontent.com/vincentcampanaro/regression/main/Olympic_Swimming_Results_1912to2020.csv", {
    download: true,
    header: true,
    complete: function(results) {
        console.log("Data loaded, total records:", results.data.length);
        globalData = results.data;
        updateChart(); // Initialize chart with default values
    }
});
