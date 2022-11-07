// based on the example on https://www.npmjs.com/package/@abandonware/noble

const noble = require("@abandonware/noble");
const express = require("express");
const fs = require("fs");
const { validateHeaderValue } = require("http");

const WebSocket = require("ws");
const WebSocketServer = WebSocket.WebSocketServer;

const uuid_service = "1101";
const uuid_values = ["2101", "2102", "2103"];

noble.on("stateChange", async (state) => {
    if (state === "poweredOn") {
        console.log("start scanning");
        await noble.startScanningAsync([uuid_service], false);
    }
});

noble.on("discover", async (peripheral) => {
    if (peripheral.advertisement.localName !== "Cole's Nano 33 IoT") {
        return;
    }
    console.log("Connecting to ", peripheral.advertisement.localName);
    await noble.stopScanningAsync();
    await peripheral.connectAsync();
    const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
        [uuid_service],
        uuid_values
    );
    readData("ax", characteristics[0]);
    readData("ay", characteristics[1]);
    readData("az", characteristics[2]);
});

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
    console.log(`Server started @ http://localhost:${port}`);
});

const gameState = {
    objects: [
        { p: [20, 10], w: 20, h: 100, a: [0, 0], v: [0, 0], name: "left" },
        {
            p: [760, 10],
            w: 20,
            h: 100,
            a: [0, 0],
            v: [0, 0],
            name: "right",
        },
        {
            p: [400, 200],
            r: 10,
            a: [0, 0],
            v: [200, 200],
            name: "ball",
        },
    ],
    score: [0, 0],
};

// 60 fps
const timeStep = 16.6666666;

setInterval(() => {
    for (const object of gameState.objects) {
        // Velocity update
        object.v[0] += (timeStep / 1000) * object.a[0];
        object.v[1] += (timeStep / 1000) * object.a[1];

        // Position update
        object.p[0] += (timeStep / 1000) * object.v[0];
        object.p[1] += (timeStep / 1000) * object.v[1];
    }

    // Check for collisions with the ball and the walls.
    const ball = gameState.objects[2];
    if (ball.p[1] - ball.r <= 0) {
        ball.v[1] *= -1;
    } else if (ball.p[1] + ball.r >= 400) {
        ball.v[1] *= -1;
    }
    if (ball.p[0] - ball.r <= 0) {
        ball.v = [200, 200];
        ball.p = [400, 200];
        gameState.score[1]++;
    } else if (ball.p[0] + ball.r >= 800) {
        ball.v = [-200, 200];
        ball.p = [400, 200];
        gameState.score[0]++;
    }

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(
                JSON.stringify({
                    left: gameState.objects[0],
                    right: gameState.objects[1],
                    ball: gameState.objects[2],
                    score: gameState.score.join("-"),
                })
            );
        }
    });
}, timeStep);
