const dgram = require("node:dgram");
const { Buffer } = require("node:buffer");

const socket = dgram.createSocket("udp4");
socket.connect(9999, () => {
    console.log("Connected to port 9999");

    const values = [1, 2, 3, 4, 5, 6];
    const buffer = Buffer.alloc(4 * values.length);
    for (let i = 0; i < values.length; i++) {
        buffer.writeFloatLE(values[i], 4 * i);
    }

    setInterval(() => {
        socket.send(buffer);
    }, 1000);
});
