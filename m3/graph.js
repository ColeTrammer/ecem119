const xContext = document.getElementById("imu-x").getContext("2d");
const xData = [];
const yData = [];
const zData = [];
const xCol = "rgb(100, 149, 237)";
const yCol = "rgb(233, 116, 81)";
const zCol = "rgb(9, 121, 105)";
const color = Chart.helpers.color;
const chart = new Chart(xContext, {
    type: "line",
    data: {
        labels: ["ax", "ay", "az"],
        datasets: [
            {
                label: "ax",
                backgroundColor: color(xCol).alpha(0.5).rgbString(),
                borderColor: xCol,
                data: xData,
            },
            {
                label: "ay",
                backgroundColor: color(yCol).alpha(0.5).rgbString(),
                borderColor: yCol,
                data: yData,
            },
            {
                label: "az",
                backgroundColor: color(zCol).alpha(0.5).rgbString(),
                borderColor: zCol,
                data: zData,
            },
        ],
    },
    options: {
        scales: {
            x: {
                type: "realtime",
                realtime: {
                    duration: 20000,
                },
            },
            y: {
                stacked: true,
                min: -6.0,
                max: 6.0,
            },
        },
        responsive: true,
    },
});

const ws = new WebSocket("ws://localhost:8080");

ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    const dataset = (() => {
        if (data.name === "ax") {
            return xData;
        } else if (data.name === "ay") {
            return yData;
        } else {
            return zData;
        }
    })();
    dataset.push({
        x: new Date(data.timestamp),
        y: data.value,
    });

    console.log(data);

    chart.update("quiet");
});

// setInterval(() => {
//     let i = 0;
//     console.log(xChart);
//     xData.push({
//         x: Date.now(),
//         y: Math.random(),
//     });

//     xChart.update("quiet");
// }, 1000);
