function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

document.getElementById('timeSlider').addEventListener('input', function(e) {
    document.getElementById('timeValue').textContent = formatTime(e.target.value);
});

document.getElementById('swimmingForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var gender = document.getElementById('gender').value;
    var userTimeInSeconds = parseFloat(document.getElementById('timeSlider').value);

    // Example data for regression model
    const swimData = {
        'female': [25.69, 55.79, 2 * 60 + 0.89, 4 * 60 + 15.49],
        'male': [22.79, 49.99, 1 * 60 + 49.99, 3 * 60 + 55.59]
    };

    // Simple regression calculation (for demo purposes)
    var predictedTime = swimData[gender].reduce((a, b) => a + b, 0) / swimData[gender].length;

    // Creating the chart
    var ctx = document.getElementById('graph').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Average Professional Time', 'Your Time'],
            datasets: [{
                label: 'Time in seconds',
                data: [predictedTime, userTimeInSeconds],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});
