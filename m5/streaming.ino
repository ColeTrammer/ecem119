#include <Arduino_LSM6DS3.h>
#include <WiFiNINA.h>
#include <WiFiUdp.h>

extern char SECRET_SSID[];
extern char SECRET_PASS[];

int status = WL_IDLE_STATUS;          // the Wi-Fi radio's status
int ledState = LOW;                   // ledState used to set the LED
unsigned long previousMillisInfo = 0; // will store last time Wi-Fi information was updated
unsigned long previousMillisLED = 0;  // will store the last time LED was updated
const int intervalInfo = 5000;        // interval at which to update the board information

WiFiUDP Udp;
auto remote_ip = IPAddress(192, 168, 1, 8);

void setup() {
    // Initialize serial and wait for port to open:
    Serial.begin(9600);

    // Initialize IMU
    if (!IMU.begin()) {
        Serial.println("Could not initialize the IMU");
        for (;;)
            ;
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
    if (!IMU.accelerationAvailable() || !IMU.gyroscopeAvailable()) {
        return;
    }

    struct Data {
        uint32_t player;
        float data[6];
    };

    Data data;
    data.player = 2;

    auto& buffer = data.data;

    IMU.readAcceleration(buffer[0], buffer[1], buffer[2]);
    IMU.readGyroscope(buffer[3], buffer[4], buffer[5]);

    Udp.beginPacket(remote_ip, 9999);
    Udp.write((uint8_t*) &data, sizeof(data));
    Udp.endPacket();
}