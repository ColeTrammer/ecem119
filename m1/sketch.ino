#include <Arduino_LSM6DS3.h>

constexpr int symbol_space_ms = 200;
constexpr int dot_space_ms = 200;
constexpr int letter_space_ms = 3 * dot_space_ms;
constexpr int dash_space_ms = 3 * dot_space_ms;
constexpr int word_space_ms = 2 * letter_space_ms;

struct MorseCodeTiming {
    bool light_led;
    int space_ms;
};

size_t timing_array_index = 0;

constexpr MorseCodeTiming timing_array[] = {
    // 'H'
    { true, dot_space_ms },
    { false, symbol_space_ms },
    { true, dot_space_ms },
    { false, symbol_space_ms },
    { true, dot_space_ms },
    { false, symbol_space_ms },
    { true, dot_space_ms },
    { false, letter_space_ms },
    // 'E'
    { true, dot_space_ms },
    { false, letter_space_ms },
    // 'L'
    { true, dot_space_ms },
    { false, symbol_space_ms },
    { true, dash_space_ms },
    { false, symbol_space_ms },
    { true, dot_space_ms },
    { false, symbol_space_ms },
    { true, dot_space_ms },
    { false, letter_space_ms },
    // 'L'
    { true, dot_space_ms },
    { false, symbol_space_ms },
    { true, dash_space_ms },
    { false, symbol_space_ms },
    { true, dot_space_ms },
    { false, symbol_space_ms },
    { true, dot_space_ms },
    { false, letter_space_ms },
    // 'O'
    { true, dash_space_ms },
    { false, symbol_space_ms },
    { true, dash_space_ms },
    { false, symbol_space_ms },
    { true, dash_space_ms },
    { false, word_space_ms },
    // I
    { true, dot_space_ms },
    { false, symbol_space_ms },
    { true, dot_space_ms },
    { false, letter_space_ms },
    // M
    { true, dash_space_ms },
    { false, symbol_space_ms },
    { true, dash_space_ms },
    { false, word_space_ms },
    // U
    { true, dot_space_ms },
    { false, symbol_space_ms },
    { true, dot_space_ms },
    { false, symbol_space_ms },
    { true, dash_space_ms },
    { false, word_space_ms },
};

void setup() {
    Serial.begin(9600);

    if (!IMU.begin()) {
        Serial.println("Could not initialize the IMU");
        for (;;)
            ;
    }

    pinMode(LED_BUILTIN, OUTPUT);
}

void read_imu() {
    if (!IMU.accelerationAvailable()) {
        Serial.println("IMU acceleration not available.");
        return;
    }
    if (!IMU.gyroscopeAvailable()) {
        Serial.println("IMU gyroscope not available.");
        return;
    }

    float ax, ay, az, gx, gy, gz;
    IMU.readAcceleration(ax, ay, az);
    IMU.readGyroscope(gx, gy, gz);
    Serial.print("ax=");
    Serial.print(ax);
    Serial.print(" ay=");
    Serial.print(ay);
    Serial.print(" az=");
    Serial.print(az);
    Serial.print(" gx=");
    Serial.print(gx);
    Serial.print(" gy=");
    Serial.print(gy);
    Serial.print(" gz=");
    Serial.print(gz);
    Serial.println();
}

void loop() {
    read_imu();

    auto& timing = timing_array[timing_array_index];
    digitalWrite(LED_BUILTIN, timing.light_led ? HIGH : LOW);
    delay(timing.space_ms);

    timing_array_index++;
    timing_array_index %= sizeof(timing_array) / sizeof(*timing_array);
}
