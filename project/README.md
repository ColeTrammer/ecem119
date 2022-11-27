# M119 Project

There are 2 separate Arduino files:

- controller.ino
- device.ino

The controller code handles the remote, which is wired to 3 separate buttons, each of which controls a different device.

The button for device 1 is mapped to digital pin 2, device 2 is mapped to digital pin 3, and device 3 is mapped to digital pin 4.

Rather than connect the buttons through resistors, we use INPUT_PULLUP to handle the resistor internally (Using this mode makes the button press cause the input to go LOW, instead of HIGH).

The device file has two functions: `turnOn()` and `turnOff()` which are called when the controller's buttons are pushed. Each device also has a DEVICE_NUMBER parameter which is a constant that is supplied in the code. The devices should have numbers 1, 2, or 3.

## Wifi Note

To properly connect to the WIFI, the steps from the Arduino WIFI tutorial need to be followed (specifically the WIFI_SSID secret and WIFI_PASS). Alternatively, should be able to create a `secret.cpp` file with these values defined, as shown in the `secret.cpp.sample` file.

## Simulation

There are also basic python scripts which simulate the network protocol used by the devices.

This allows testing the code for a peripheral device without wiring up the buttons and uploading the controller code to a separate Arduino.

### Controller Example

```bash
python simulatedController 1     # Toggle device 1
python simulatedController 2     # Toggle device 2
python simulatedController 3     # Toggle device 3
```

### Device Example

```bash
python simulatedPeripheral.py 1     # Create fake device 1 process
python simulatedPeripheral.py 2     # Create fake device 2 process
python simulatedPeripheral.py 3     # Create fake device 3 process
```
