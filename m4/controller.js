// based on the example on https://www.npmjs.com/package/@abandonware/noble

const noble = require("@abandonware/noble");
const express = require("express");
const fs = require("fs");

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
            client.send(JSON.stringify({
                name,
                value: value.readFloatLE(0),
                timestamp: new Date().toISOString(),
            }));
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

app.get("/graph.js", (req, res) => {
    res.sendFile(__dirname + "/graph.js");
});

app.listen(port, () => {
    console.log(`Server started @ http://localhost:${port}`);
});

// setInterval(() => {
//     wss.clients.forEach((client) => {
//         if (client.readyState === WebSocket.OPEN) {
//             client.send(
//                 JSON.stringify({
//                     name: ["x", "y", "z"][Math.floor(Math.random() * 3)],
//                     value: (Math.random() - 0.5) * 6,
//                     timestamp: new Date().toISOString(),
//                 })
//             );
//         }
//     });
// }, 100);
