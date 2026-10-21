/*
 * =========================================================================================
 * Sense AI - ESP-12E / NodeMCU Ambient Thermistor Firmware
 * =========================================================================================
 * Board: ESP8266 (ESP-12E / NodeMCU 1.0 / WeMos D1 Mini)
 * Sensor: 10k NTC Thermistor connected to Analog Pin A0
 *
 * CIRCUIT WIRING (10k NTC Thermistor Voltage Divider):
 *
 *     3.3V -----------------+
 *                           |
 *                    [ 10k NTC Thermistor ]
 *                           |
 *          A0 Pin <---------+
 *                           |
 *                    [ 10kΩ Fixed Resistor ]
 *                           |
 *          GND -------------+
 *
 * Note: If using Arduino UNO instead of ESP-12E:
 *   - Same circuit connects to Arduino UNO 5V, GND, and Pin A0.
 *   - Arduino Uno reads A0 and sends "TEMP:<celsius>" over Serial to ESP-12E.
 * =========================================================================================
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

// 1. Wi-Fi Credentials (Replace with your local Wi-Fi / Hotspot name and password)
const char* WIFI_SSID     = "";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// 2. Sense AI Backend Server Endpoint
// Replace YOUR_PC_IP with your computer's local IP address (find with 'ipconfig' in cmd, e.g., 192.168.1.10)
// OR use your Cloudflare Tunnel HTTPS URL (e.g. "https://xxxx.trycloudflare.com/api/hardware/esp32/telemetry")
const char* SENSE_AI_ENDPOINT = "http://192.168.1.10:5005/api/hardware/esp32/telemetry";

// 3. Thermistor Parameters
#define THERMISTOR_PIN       A0       // ESP8266 single analog pin
#define SERIES_RESISTOR      10000.0  // 10k ohm fixed resistor
#define NOMINAL_RESISTANCE   10000.0  // 10k ohm at 25°C
#define NOMINAL_TEMPERATURE  25.0     // 25°C baseline
#define B_COEFFICIENT        3950.0   // Beta value of standard 10k NTC thermistor
#define NUM_SAMPLES          10       // Multi-sampling for smooth, noise-free temperature

unsigned long lastTelemetryMillis = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 3000; // Send reading every 3 seconds

// Steinhart-Hart equation for high-accuracy temperature in Celsius
float readTemperatureCelsius() {
  float adcSum = 0;
  for (int i = 0; i < NUM_SAMPLES; i++) {
    adcSum += analogRead(THERMISTOR_PIN);
    delay(10);
  }
  float adcAvg = adcSum / NUM_SAMPLES;

  // Protect against division by zero
  if (adcAvg <= 0.0) adcAvg = 1.0;
  if (adcAvg >= 1023.0) adcAvg = 1022.0;

  // Calculate thermistor resistance from voltage divider:
  // Vout = Vcc * (R_fixed / (R_thermistor + R_fixed))
  float resistance = SERIES_RESISTOR * ((1023.0 / adcAvg) - 1.0);

  // Steinhart-Hart B-parameter formula:
  // 1/T = 1/To + (1/B) * ln(R/Ro)
  float steinhart = resistance / NOMINAL_RESISTANCE;     // (R/Ro)
  steinhart = log(steinhart);                           // ln(R/Ro)
  steinhart /= B_COEFFICIENT;                           // 1/B * ln(R/Ro)
  steinhart += 1.0 / (NOMINAL_TEMPERATURE + 273.15);    // + (1/To in Kelvin)
  steinhart = 1.0 / steinhart;                          // Invert to Kelvin
  steinhart -= 273.15;                                  // Convert to Celsius

  return steinhart;
}

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n\n=======================================================");
  Serial.println(" Sense AI - ESP-12E Ambient Thermistor Node Booting ");
  Serial.println("=======================================================");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to Wi-Fi SSID: ");
  Serial.println(WIFI_SSID);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(300);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[+] Wi-Fi Connected!");
    Serial.print("    Assigned IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("    Signal Strength (RSSI): ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\n[-] Wi-Fi connection timed out. Check credentials.");
  }
}

void loop() {
  unsigned long now = millis();

  if (now - lastTelemetryMillis >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryMillis = now;

    float currentTempC = readTemperatureCelsius();

    Serial.println("-------------------------------------------------------");
    Serial.print("[Sensor] Live Room Temperature: ");
    Serial.print(currentTempC, 2);
    Serial.println(" °C");

    // Reconnect Wi-Fi if dropped
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("[!] Wi-Fi disconnected. Reconnecting...");
      WiFi.reconnect();
      return;
    }

    WiFiClient client;
    HTTPClient http;

    if (http.begin(client, SENSE_AI_ENDPOINT)) {
      http.addHeader("Content-Type", "application/json");

      // Construct JSON payload matching Sense AI backend expectations
      String jsonPayload = "{";
      jsonPayload += "\"temp\":" + String(currentTempC, 1) + ",";
      jsonPayload += "\"temperature\":" + String(currentTempC, 1) + ",";
      jsonPayload += "\"device_name\":\"ESP-12E Ambient Thermistor Node\",";
      jsonPayload += "\"rssi\":" + String(WiFi.RSSI());
      jsonPayload += "}";

      int httpResponseCode = http.POST(jsonPayload);

      if (httpResponseCode > 0) {
        Serial.print("[Sense AI Server] Response Code: ");
        Serial.println(httpResponseCode);
        String response = http.getString();
        Serial.println("[Sense AI Server] Ack: " + response);
      } else {
        Serial.print("[-] HTTP POST failed, error: ");
        Serial.println(http.errorToString(httpResponseCode));
      }

      http.end();
    } else {
      Serial.println("[-] Unable to connect to Sense AI endpoint.");
    }
  }
}

