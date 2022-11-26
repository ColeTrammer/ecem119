/*
  Button

  Turns on and off a light emitting diode(LED) connected to digital pin 13,
  when pressing a pushbutton attached to pin 2.

  The circuit:
  - LED attached from pin 13 to ground through 220 ohm resistor
  - pushbutton attached to pin 2 from +5V
  - 10K resistor attached to pin 2 from ground

  - Note: on most Arduinos there is already an LED on the board
    attached to pin 13.

  created 2005
  by DojoDave <http://www.0j0.org>
  modified 30 Aug 2011
  by Tom Igoe

  This example code is in the public domain.

  https://www.arduino.cc/en/Tutorial/BuiltInExamples/Button
*/

#include <WiFiNINA.h>
#include <WiFiUdp.h>

extern char SECRET_SSID[];
extern char SECRET_PASS[];

int status = WL_IDLE_STATUS;          // the Wi-Fi radio's status
unsigned long previousMillisInfo = 0; // will store last time Wi-Fi information was updated
unsigned long previousMillisLED = 0;  // will store the last time LED was updated
const int intervalInfo = 5000;        // interval at which to update the board information

WiFiUDP Udp;
auto remote_ip = IPAddress(255, 255, 255, 255);

const int buttonPins[] = {2, 3, 4};

// variables will change:
int buttonStates[] = {1, 1, 1}; // variable for reading the pushbutton status

void setup() {
    Serial.begin(9600);

    // initialize the pushbutton pin as an input:
    for (auto buttonPin : buttonPins) {
        pinMode(buttonPin, INPUT_PULLUP);
    }

    // attempt to connect to Wi-Fi network:
    while (status != WL_CONNECTED) {
        Serial.print("Attempting to connect to network: ");
        Serial.println(SECRET_SSID);
        // Connect to WPA/WPA2 network:
        status = WiFi.begin(SECRET_SSID, SECRET_PASS);

        // wait 10 seconds for connection:
        delay(10000);
    }

    // you're connected now, so print out the data:
    Serial.println("You're connected to the network");
    Serial.println("---------------------------------------");

    // print your board's IP address:
    IPAddress ip = WiFi.localIP();
    Serial.print("IP Address: ");
    Serial.println(ip);

    // print your network's SSID:
    Serial.println();
    Serial.println("Network Information:");
    Serial.print("SSID: ");
    Serial.println(WiFi.SSID());

    // print the received signal strength:
    long rssi = WiFi.RSSI();
    Serial.print("signal strength (RSSI):");
    Serial.println(rssi);
    Serial.println("---------------------------------------");

    Udp.begin(2395);

    Serial.print("Sending to ip=");
    Serial.print(remote_ip);
    Serial.print(", port=");
    Serial.println(9999);
}

void loop() {
    // read the state of the pushbutton value:

    int oldStates[3];
    for (int button = 0; button < sizeof(buttonPins) / sizeof(*buttonPins); button++) {
        oldStates[button] = buttonStates[button];
        buttonStates[button] = digitalRead(buttonPins[button]);

        // Button press happened.
        if (oldStates[button] == 0 && buttonStates[button] == 1) {
            Serial.print("Toggling device ");
            Serial.println(button);

            Udp.beginPacket(remote_ip, 8586);
            char buffer[] = { 2, (char) (button + 1), 0, 0 };
            Udp.write((uint8_t*) buffer, sizeof(buffer));
            Udp.endPacket();
        }
    }

    delay(30);
}
