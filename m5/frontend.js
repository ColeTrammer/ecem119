const ctx = document.getElementById("pong").getContext("2d");
const ws = new WebSocket("ws://localhost:8080");

ws.addEventListener("message", (event) => {
    const { left, right, ball, score } = JSON.parse(event.data);

    ctx.clearRect(0, 0, 800, 400);

    ctx.fillRect(left.p[0], left.p[1], left.w, left.h);
    ctx.fillRect(right.p[0], right.p[1], right.w, right.h);

    ctx.beginPath();
    ctx.arc(ball.p[0], ball.p[1], ball.r, 0, 2 * Math.PI);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.font = "32px serif";
    ctx.fillText(score, 400, 30);
});
