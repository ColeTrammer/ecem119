const ctx = document.getElementById("pong").getContext("2d");
const ws = new WebSocket("ws://localhost:8080");

ws.addEventListener("message", (event) => {
    const { left, right, ball, score } = JSON.parse(event.data);

    ctx.fillRect(left.x, left.y, left.w, left.h);
    ctx.fillRect(right.x, right.y, right.w, right.h);

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.font = "32px serif";
    ctx.fillText(score, 400, 30);
});
