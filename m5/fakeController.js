const dgram = require("node:dgram");
const { Buffer } = require("node:buffer");

const socket = dgram.createSocket("udp4");
// const ip = "127.0.0.1";
const ip = "192.168.1.8";
const port = 9999;
// const ip = "192.168.1.12";
// const port = 2390;
socket.connect(port, ip, () => {
    console.log(`Connected to port ${ip}:${port}`);

    // socket.send("Hello, World\n");

    const values = [1, 2, 3, 4, 5, 6];
    const buffer = Buffer.alloc(4 * values.length);
    for (let i = 0; i < values.length; i++) {
        buffer.writeFloatLE(values[i], 4 * i);
    }

    setInterval(() => {
        socket.send(buffer);
    }, 100);
});

socket.on("message", (msg, rinfo) => {
    console.log(msg);
    console.log(rinfo);
});
