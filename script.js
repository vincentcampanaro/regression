let globalData = null;
let chart = null;

function calculateRegression(data) {
    let n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    data.forEach(d => {
        sumX += d.x;
        sumY += d.y;
        sumXY += (d.x * d.y);
        sumXX += (d.x * d.x);
    });

    let m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    let c = (sumY - m * sumX) / n;

    console.log('Slope (m):', m);
    console.log('Y-intercept (c):', c);

    return { m, c };
}

function parseTime(timeString) {
    if (timeString.includes(':')) {
        const [minutes, seconds] = timeString.split(':').map(parseFloat);
        return minutes * 60 + seconds;
    }
    return parseFloat(timeString);
}

function processData(rawData, selectedDistance, selectedStroke, selectedGender) {
    let processedData = [];
    rawData.forEach(function(row) {
        let stroke = row['Stroke'] === 'Medley' ? 'Individual medley' : row['Stroke'];
        if (stroke === selectedStroke && row['Distance (in meters)'] === selectedDistance && row['Gender'] === selectedGender) {
            let year = parseInt(row['Year']);
            let time = parseTime(row['Results']);
            let athlete = row['Athlete'];

            if (!isNaN(year) && !isNaN(time)) {
                processedData.push({ x: year, y: time, athlete: athlete });
            }
        }
    });
    return processedData;
}

function updateChart() {
    let selectedDistance = document.getElementById('distanceSelect').value;
    let selectedStroke = document.getElementById('strokeSelect').value;
    let selectedGender = document.getElementById('genderSelect').value;

    let processedData = processData(globalData, selectedDistance, selectedStroke, selectedGender);
    let regression = calculateRegression(processedData);

    let minYear = Math.min(...processedData.map(d => d.x));
    let maxYear = Math.max(...processedData.map(d => d.x));
    let regressionLine = [];
    for (let year = minYear; year <= maxYear; year++) {
        regressionLine.push({ x: year, y: regression.m * year + regression.c });
    }

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
                backgroundColor: 'rgba(0, 123, 255, 0.5)'
            }, {
                label: 'Regression Line',
                data: regressionLine,
                type: 'line',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom'
                },
                y: {
                    beginAtZero: true
                }
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        let athlete = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].athlete || '';
                        return athlete + ': (' + tooltipItem.xLabel + ', ' + tooltipItem.yLabel + ')';
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
