function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

document.getElementById('timeSlider').addEventListener('input', function(e) {
    document.getElementById('timeValue').textContent = formatTime(e.target.value);
});

document.getElementById('swimmingForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var gender = document.getElementById('gender').value;
    var userTimeInSeconds = parseFloat(document.getElementById('timeSlider').value);

    const swimData = {
        'female': [25.69, 55.79, 2 * 60 + 0.89, 4 * 60 + 15.49],
        'male': [22.79, 49.99, 1 * 60 + 49.99, 3 * 60 + 55.59]
    };

    var predictedTime = swimData[gender].reduce((a, b) => a + b, 0) / swimData[gender].length;

    var ctx = document.getElementById('graph').getContext('2d');

    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
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
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
});
