// based on the example on https://www.npmjs.com/package/@abandonware/noble

const noble = require("@abandonware/noble");

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

//
// read data periodically
//
let readData = async (name, characteristic) => {
    const value = await characteristic.readAsync();
    console.log(`${name}: ${value.readFloatLE(0)}`);

    // read data again in t milliseconds
    setTimeout(() => {
        readData(name, characteristic);
    }, 100);
};
