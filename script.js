let globalData = null;
let chart = null;

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
        // Handle the case where regression cannot be calculated
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
    return totalSeconds;
}

function processData(rawData, selectedDistance, selectedStroke, selectedGender) {
    return rawData.filter(row => {
        return row['Stroke'] === selectedStroke &&
               row['Distance (in meters)'] === selectedDistance &&
               row['Gender'] === selectedGender;
    }).map(row => {
        let year = parseInt(row['Year']);
        let time = parseTime(row['Results']);
        let athlete = row['Athlete'];
        return { x: year, y: time, athlete: athlete, label: athlete };
    });
}

function updateChart() {
    let selectedDistance = document.getElementById('distanceSelect').value;
    let selectedStroke = document.getElementById('strokeSelect').value;
    let selectedGender = document.getElementById('genderSelect').value;

    let processedData = processData(globalData, selectedDistance, selectedStroke, selectedGender);
    let regression = calculateRegression(processedData);

    if (!regression) {
        console.error('Cannot calculate regression.');
        return;
    }

    let minYear = Math.min(...processedData.map(d => d.x));
    let maxYear = Math.max(...processedData.map(d => d.x));
    let regressionLine = Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
        let year = minYear + i;
        return { x: year, y: regression.m * year + regression.c };
    });

    var ctx = document.getElementById('graph').getContext('2d');
    if (chart) {
        chart.destroy();
    }
    chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
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
                showLine: true, // Ensure this is set to true to show the line
                spanGaps: true, // Connects the line between gaps in data
            }]
        },
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
                    }
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
        globalData = results.data;
        updateChart(); // Initialize chart with default values
    }
});
