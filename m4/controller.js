// based on the example on https://www.npmjs.com/package/@abandonware/noble

const express = require("express");
const dgram = require("node:dgram");

const WebSocket = require("ws");
const WebSocketServer = WebSocket.WebSocketServer;

const udpserver = dgram.createSocket("udp4");
let currentIMUData = [0, 0, 0, 0, 0, 0];

udpserver.on("error", console.error);

udpserver.on("message", (msg, rinfo) => {
    const values = [];
    for (const offset of [0, 4, 8, 12, 16, 20]) {
        values.push(msg.readFloatLE(offset));
    }

    currentIMUData = values;
});

udpserver.on("listening", () => {
    const address = udpserver.address();
    console.log(`UDP server started @ ${address.address}:${address.port}`);
});

udpserver.bind(9999);

const wss = new WebSocketServer({ port: 8080 });

//
// read data periodically
//
let readData = async (name, characteristic) => {
    const value = await characteristic.readAsync();
    // console.log(`${name}: ${value.readFloatLE(0)}`);

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(
                JSON.stringify({
                    name,
                    value: value.readFloatLE(0),
                    timestamp: new Date().toISOString(),
                })
            );
        }
    });

    // read data again in t milliseconds
    setTimeout(() => {
        readData(name, characteristic);
    }, 300);
};

const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/frontend.js", (req, res) => {
    res.sendFile(__dirname + "/frontend.js");
});

app.listen(port, () => {
    console.log(`HTTP server started @ http://localhost:${port}`);
});

const ARENA_WIDTH = 800;
const ARENA_HEIGHT = 400;

const PADDLE_MARGIN = 20;
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 80;

const BALL_VX_MAG = 220;
const BALL_VY_MAG = 220;
const BALL_V_MAG = Math.sqrt(BALL_VX_MAG * BALL_VX_MAG + BALL_VY_MAG * BALL_VY_MAG);
const BALL_RADIUS = 10;

const AI_VY_MAG = 0.75 * BALL_VY_MAG;

const PLAYER_VY_MAG = BALL_VY_MAG;

const TIME_STEP_MS = 1000 / 104;

const gameState = {
    objects: [
        {
            p: [PADDLE_MARGIN, ARENA_HEIGHT / 2 - PADDLE_HEIGHT / 2],
            w: PADDLE_WIDTH,
            h: PADDLE_HEIGHT,
            a: [0, 0],
            v: [0, 0],
            name: "left",
        },
        {
            p: [ARENA_WIDTH - PADDLE_WIDTH - PADDLE_MARGIN, ARENA_HEIGHT / 2 - PADDLE_HEIGHT / 2],
            w: PADDLE_WIDTH,
            h: PADDLE_HEIGHT,
            a: [0, 0],
            v: [0, 0],
            name: "right",
        },
        {
            p: [ARENA_WIDTH / 2, ARENA_WIDTH / 2],
            r: BALL_RADIUS,
            a: [0, 0],
            v: [BALL_VX_MAG, BALL_VY_MAG],
            name: "ball",
        },
    ],
    score: [0, 0],
};

setInterval(() => {
    const [left, right, ball] = gameState.objects;

    // Update left paddle based on IMU data.
    let sample = currentIMUData[2] - 1;
    if (sample > 0.8) {
        left.v[1] = PLAYER_VY_MAG;
    } else if (sample < -0.8) {
        left.v[1] = -PLAYER_VY_MAG;
    }

    // Implement AI for the paddles.
    for (const paddle of [right]) {
        const cy = paddle.p[1] + paddle.h / 2;
        if (cy <= ball.p[1]) {
            paddle.v[1] = AI_VY_MAG;
        } else {
            paddle.v[1] = -AI_VY_MAG;
        }
    }

    // Game object update
    for (const object of gameState.objects) {
        // Velocity update
        object.v[0] += (TIME_STEP_MS / 1000) * object.a[0];
        object.v[1] += (TIME_STEP_MS / 1000) * object.a[1];

        // Position update
        object.p[0] += (TIME_STEP_MS / 1000) * object.v[0];
        object.p[1] += (TIME_STEP_MS / 1000) * object.v[1];
    }

    // Check for collisions with the ball and the walls.
    if (ball.p[1] - ball.r <= 0) {
        ball.v[1] *= -1;
        ball.p[1] = BALL_RADIUS;
    } else if (ball.p[1] + ball.r >= ARENA_HEIGHT) {
        ball.v[1] *= -1;
        ball.p[1] = ARENA_HEIGHT - BALL_RADIUS;
    }
    if (ball.p[0] - ball.r <= 0) {
        ball.v = [-BALL_VX_MAG, BALL_VY_MAG];
        ball.p = [ARENA_WIDTH / 2, ARENA_HEIGHT / 2];
        gameState.score[1]++;
    } else if (ball.p[0] + ball.r >= 800) {
        ball.v = [BALL_VX_MAG, BALL_VY_MAG];
        ball.p = [ARENA_WIDTH / 2, ARENA_HEIGHT / 2];
        gameState.score[0]++;
    }

    // Check for collisions between ball and paddles.
    // See this article for computing the intersection between a circle and rectangle:
    // https://www.geeksforgeeks.org/check-if-any-point-overlaps-the-given-circle-and-rectangle/#:~:text=In%20order%20to%20check%20whether,that%20both%20the%20shapes%20intersect.
    for (const paddle of [left, right]) {
        const xn = Math.max(paddle.p[0], Math.min(ball.p[0], paddle.p[0] + paddle.w));
        const yn = Math.max(paddle.p[1], Math.min(ball.p[1], paddle.p[1] + paddle.h));
        const dx = xn - ball.p[0];
        const dy = yn - ball.p[1];
        if (dx * dx + dy * dy <= ball.r * ball.r) {
            const effectiveHeight = paddle.h + 2 * ball.r;
            const relativeY = (ball.p[1] - (paddle.p[1] + paddle.h / 2)) / (effectiveHeight / 2);
            const reflectionAngle = (Math.abs(relativeY) * Math.PI) / 2.5;

            if (dx < 0) {
                ball.v[0] = Math.abs(Math.cos(reflectionAngle)) * BALL_V_MAG;
            } else {
                ball.v[0] = -Math.abs(Math.cos(reflectionAngle)) * BALL_V_MAG;
            }
            ball.v[1] = Math.sign(relativeY) * Math.abs(Math.sin(reflectionAngle)) * BALL_V_MAG;
        }
    }

    // Clamp paddle in bounds.
    for (const paddle of [left, right]) {
        const top = paddle.p[1];
        const bottom = paddle.p[1] + paddle.h;
        if (top < 0) {
            paddle.a[1] = 0;
            paddle.v[1] = 0;
            paddle.p[1] = 0;
        } else if (bottom >= ARENA_HEIGHT) {
            paddle.a[1] = 0;
            paddle.v[1] = 0;
            paddle.p[1] = ARENA_HEIGHT - PADDLE_HEIGHT;
        }
    }

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(
                JSON.stringify({
                    left,
                    right,
                    ball,
                    score: gameState.score.join("-"),
                })
            );
        }
    });
}, TIME_STEP_MS);
