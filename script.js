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

    // Log the calculated slope (m) and y-intercept (c)
    console.log('Slope (m):', m);
    console.log('Y-intercept (c):', c);

    return { m, c };
}

Papa.parse("https://raw.githubusercontent.com/vincentcampanaro/regression/main/Olympic_Swimming_Results_1912to2020.csv", {
    download: true,
    header: true,
    complete: function(results) {
        let processedData = [];
        results.data.forEach(function(row) {
            if (row.Stroke === 'Freestyle' && row.Distance === '100' && row.Gender === 'Male') {
                processedData.push({
                    x: parseInt(row.Year),
                    y: parseFloat(row.Results)
                });
            }
        });

        // Log the processed data
        console.log('Processed Data:', processedData);

        let regression = calculateRegression(processedData);

        let minYear = Math.min(...processedData.map(d => d.x));
        let maxYear = Math.max(...processedData.map(d => d.x));
        let regressionLine = [];
        for (let year = minYear; year <= maxYear; year++) {
            regressionLine.push({ x: year, y: regression.m * year + regression.c });
        }

        // Log the regression line data
        console.log('Regression Line Data:', regressionLine);

        var ctx = document.getElementById('graph').getContext('2d');
        var chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: '100m Freestyle Times (Men)',
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
                }
            }
        });
    }
});
