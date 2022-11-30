#include <WiFiNINA.h>
#include <WiFiUdp.h>

// The remote expects this to be 1, 2, or 3.
#define DEVICE_NUMBER 1

extern char SECRET_SSID[];
extern char SECRET_PASS[];

int status = WL_IDLE_STATUS;          // the Wi-Fi radio's status
unsigned long previousMillisInfo = 0; // will store last time Wi-Fi information was updated
unsigned long previousMillisLED = 0;  // will store the last time LED was updated
const int intervalInfo = 5000;        // interval at which to update the board information
char buffer[255];
int state = 0;
int ledPin = LED_BUILTIN;

WiFiUDP Udp;

#include <Stepper.h>

// Defines the number of steps per rotation
const int stepsPerRevolution = 2038;

// Creates an instance of stepper class
// Pins entered in sequence IN1-IN3-IN2-IN4 for proper step sequence
Stepper myStepper = Stepper(stepsPerRevolution, 7, 9, 8, 10);

void doStuff() {
    	// Nothing to do (Stepper Library sets pins as outputs)
  	// Rotate CW slowly at 5 RPM
	myStepper.setSpeed(5);
	myStepper.step(stepsPerRevolution/24);
	delay(100);
	
	//Rotate CCW quickly at 10 RPM
	myStepper.setSpeed(5);
	myStepper.step(-stepsPerRevolution/24);
	delay(1000);
}

void turnOn() {
    digitalWrite(ledPin, HIGH);

    doStuff();
}

void turnOff() {
    digitalWrite(ledPin, LOW);

    doStuff();
}

void setup() {
    Serial.begin(9600);

    // initialize the LED pin as an output:
    pinMode(ledPin, OUTPUT);

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

    Udp.begin(8586);
}

void loop() {
    int packetSize = Udp.parsePacket();
    if (packetSize > 0) {
        Serial.print("Received packet of size ");
        Serial.println(packetSize);
        Serial.print("From ");

        IPAddress remoteIp = Udp.remoteIP();
        Serial.print(remoteIp);
        Serial.print(", port ");
        Serial.println(Udp.remotePort());

        int len = Udp.read(buffer, sizeof(buffer));
        if (len == 4) {
            if (buffer[0] == 2 && buffer[1] == DEVICE_NUMBER) {
                if (state == 0) {
                    turnOn();
                } else {
                    turnOff();
                }
                state = !state;
            }
        }
    }
}
