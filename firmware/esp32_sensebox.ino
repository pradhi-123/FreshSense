/*
 * =========================================================================================
 * Sense AI - ESP32 Physical Food Assessment Chamber Firmware
 * =========================================================================================
 * Board: ESP32 Development Module / NodeMCU-32S
 * Sensors:
 *   - DHT22 (Digital Temperature & Relative Humidity) -> GPIO 4
 *   - MQ-135 (Air Quality / Spoilage VOCs / Ammonia / CO2) -> GPIO 34 (ADC1 Analog)
 * Communication:
 *   - Wi-Fi 802.11 b/g/n -> HTTP POST JSON telemetry to Sense AI Server
 * =========================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// 1. Wi-Fi Configuration
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// 2. Sense AI Backend Server Endpoint (configured to machine IP on port 5005)
// Example: "http://192.168.1.100:5005/api/hardware/esp32/telemetry"
const char* SENSE_AI_ENDPOINT = "http://192.168.1.100:5005/api/hardware/esp32/telemetry";

// 3. Sensor Pin Definitions
#define DHTPIN 4
#define DHTTYPE DHT22
#define MQ135_PIN 34 // ADC1 pin (doesn't conflict with Wi-Fi)

DHT dht(DHTPIN, DHTTYPE);

// MQ-135 calibration curve approximation parameters
// Note: In field use, burn-in of 24h is recommended for MQ-135 oxide layer.
const float RL_VALUE = 10.0; // Load resistance on breakout in kOhms
const float R0_CLEAN_AIR = 76.63; // Sensor resistance in clean air

unsigned long lastTelemetryMillis = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 5000; // Transmit every 5 seconds

void connectWiFi() {
  Serial.print("Connecting to Wi-Fi SSID: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[+] Wi-Fi connected successfully!");
    Serial.print("    IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("    RSSI: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\n[!] Wi-Fi connection timed out. Telemetry will retry.");
  }
}

float readMQ135GasPPM(int rawAnalog) {
  // Convert 12-bit ADC (0 - 4095) to Voltage (0 - 3.3V)
  float sensorVolt = (float)rawAnalog / 4095.0 * 3.3;
  if (sensorVolt <= 0.05) return 20.0; // baseline floor
  
  // Resistance of sensor RS
  float RS = ((3.3 - sensorVolt) / sensorVolt) * RL_VALUE;
  float ratio = RS / R0_CLEAN_AIR;
  
  // Power-law curve estimate: PPM = a * (RS/R0)^b (approximated for mixed VOCs)
  float ppm = 116.6020682 * pow(ratio, -2.769034857);
  return constrain(ppm, 10.0, 1000.0);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("===========================================");
  Serial.println("   Sense AI - ESP32 Hardware Chamber Node  ");
  Serial.println("===========================================");

  dht.begin();
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db); // Full range 0 - 3.3V

  connectWiFi();
}

void loop() {
  // Check Wi-Fi reconnection
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  unsigned long currentMillis = millis();
  if (currentMillis - lastTelemetryMillis >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryMillis = currentMillis;

    // Read DHT22
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    // Read MQ-135
    int rawGasAnalog = analogRead(MQ135_PIN);
    float gasPPM = readMQ135GasPPM(rawGasAnalog);

    // Validate sensor sanity
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("[!] DHT22 reading failed. Check wiring on GPIO 4.");
      return;
    }

    Serial.printf("[Telemetry] Temp: %.1f °C | Humidity: %.1f %% | Gas: %.1f PPM (ADC: %d)\n",
                  temperature, humidity, gasPPM, rawGasAnalog);

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(SENSE_AI_ENDPOINT);
      http.addHeader("Content-Type", "application/json");

      StaticJsonDocument<256> doc;
      doc["temp"] = temperature;
      doc["humidity"] = humidity;
      doc["gas"] = gasPPM;
      doc["raw_gas"] = rawGasAnalog;
      doc["rssi"] = WiFi.RSSI();

      String payload;
      serializeJson(doc, payload);

      int httpResponseCode = http.POST(payload);
      if (httpResponseCode > 0) {
        Serial.printf("[+] Telemetry POST success (HTTP %d)\n", httpResponseCode);
      } else {
        Serial.printf("[!] POST failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
      }
      http.end();
    }
  }
}
