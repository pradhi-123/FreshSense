# ESP32 Food Assessment Chamber — Wiring & Firmware Guide

This hardware guide enables you to build the physical food-assessment box using an ESP32, a DHT22 temperature/humidity sensor, and an MQ-135 gas sensor.

---

## 1. Hardware Bill of Materials (BOM)
1. **ESP32 Dev Module** (ESP-WROOM-32 / NodeMCU-32S, 30 or 38 pin).
2. **DHT22 (AM2302) Sensor**: High-accuracy digital temperature & humidity sensor.
3. **MQ-135 Gas Sensor Breakout**: Sensitive to Volatile Organic Compounds (VOCs), ammonia, CO2, and ethanol.
4. **10kΩ Resistor**: Pull-up resistor for DHT22 DATA line (if using bare sensor without breakout).
5. **Breadboard & Jumper Wires**.
6. **5V / 2A Micro-USB / USB-C Power Supply**.

---

## 2. Pin Wiring Diagram

| Sensor Pin | ESP32 Pin | Function | Notes |
| :--- | :--- | :--- | :--- |
| **DHT22 VCC** | 3.3V or 5V (VIN) | Power | Use 3.3V for clean digital logic |
| **DHT22 GND** | GND | Ground | Common system ground |
| **DHT22 DATA** | **GPIO 4** | Digital Input | Add 10kΩ pull-up to 3.3V if not on module |
| **MQ-135 VCC** | **VIN (5V)** | Heater Power | **Important**: MQ-135 internal heater requires 5.0V |
| **MQ-135 GND** | GND | Ground | Common system ground |
| **MQ-135 AOUT**| **GPIO 34 (ADC1_CH6)** | Analog Voltage | GPIO 34 is on ADC1 (no Wi-Fi interference) |

> [!CAUTION]
> Always use ADC1 pins (GPIO 32, 33, 34, 35, 36, 39) for analog readings on ESP32 when Wi-Fi is active. ADC2 pins cannot be used while the Wi-Fi radio is transmitting.

---

## 3. MQ-135 Calibration & Scientific Interpretation Guidelines

1. **Pre-heat Burn-In**:
   The tin dioxide ($SnO_2$) sensing layer requires an initial 24–48 hour burn-in period before readings stabilize.
2. **Warm-Up Time**:
   Allow 2–5 minutes after powering on the chamber before logging data for assessment.
3. **Sensor Interpretation**:
   * An uncalibrated MQ-135 cannot identify specific molecular species.
   * Readings reflect a combined index of reducing gases (spoilage volatiles, alcohols, amine compounds).
   * Sense AI correlates this index with temperature stress and visual appearance, without claiming pinpoint chemical quantification.

---

## 4. How to Flash the Firmware

1. Install the **Arduino IDE** (or PlatformIO).
2. Install the ESP32 board package:
   * **URL**: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. Install required libraries from Library Manager:
   * `DHT sensor library` by Adafruit
   * `Adafruit Unified Sensor` by Adafruit
   * `ArduinoJson` (v6 or v7) by Benoit Blanchon
4. Open [`esp32_sensebox.ino`](file:///d:/First_project_clgclub/firmware/esp32_sensebox.ino).
5. Update `WIFI_SSID`, `WIFI_PASSWORD`, and `SENSE_AI_ENDPOINT` (e.g., `http://192.168.1.100:5005/api/hardware/esp32/telemetry`).
6. Select Board **ESP32 Dev Module**, choose the COM port, and click **Upload**.

---

## 5. Graceful Disconnection Handling

* When the ESP32 is powered on and connected, Sense AI displays **"● ESP32 Box Connected"** with live RSSI and IP details.
* If disconnected or powered off, Sense AI transitions within 30 seconds to **"Hardware Not Connected"** and activates the simulation engine automatically without crashing.
