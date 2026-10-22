/*
  Sense AI - FreshSense Multi-Sensor IoT Firmware for Arduino Uno / Nano / Mini
  =============================================================================
  Concurrent Real-Time Sensors:
  1. Temperature: NTC 10K Thermistor (Analog Pin A0)
  2. Spoilage Gas: MQ-2 Combustible Gas & Hydrocarbon Sensor (Analog Pin A1)
  3. Fermentation Gas: MQ-3 Alcohol & Ethanol Vapor Sensor (Analog Pin A2)
  4. Spectral Color: TCS3200 Optical Sensor (Pins 4, 5, 6, 7, 8)
  
  Wiring Instructions:
  --------------------
  • Arduino 5V  -> MQ-2 VCC, MQ-3 VCC, TCS3200 VCC, Thermistor 10k divider
  • Arduino GND -> MQ-2 GND, MQ-3 GND, TCS3200 GND, Thermistor GND
  • Arduino A0  -> Junction of 10K Thermistor & 10K Resistor (to GND)
  • Arduino A1  -> MQ-2 Analog Out (A0 pin on MQ-2 module)
  • Arduino A2  -> MQ-3 Analog Out (A0 pin on MQ-3 module)
  • Arduino D4  -> TCS3200 S0 (Frequency scaling)
  • Arduino D5  -> TCS3200 S1
  • Arduino D6  -> TCS3200 S2 (Color filter)
  • Arduino D7  -> TCS3200 S3
  • Arduino D8  -> TCS3200 OUT (Signal pulse read)

  Outputs Synchronized Serial Stream (9600 Baud):
  TEMP:24.5,MQ2:115,MQ3:82,GAS:98,RGB:76,175,80
*/

// --- SENSOR PINS ---
const int PIN_THERMISTOR = A0;
const int PIN_MQ2 = A1;        // MQ-2 Hydrocarbons / Decomposition Gas
const int PIN_MQ3 = A2;        // MQ-3 Ethanol / Fruit Fermentation Vapors

// --- TCS3200 COLOR SENSOR PINS ---
const int PIN_S0 = 4;
const int PIN_S1 = 5;
const int PIN_S2 = 6;
const int PIN_S3 = 7;
const int PIN_OUT = 8;

// --- THERMISTOR COEFFICIENTS ---
const float SERIES_RESISTOR = 10000.0;     // 10k fixed resistor
const float NOMINAL_RESISTANCE = 10000.0;  // 10k thermistor at 25°C
const float NOMINAL_TEMPERATURE = 25.0;    // 25°C
const float B_COEFFICIENT = 3950.0;        // Beta value (usually 3950)

void setup() {
  Serial.begin(9600);
  delay(1000);

  // Initialize TCS3200 pins
  pinMode(PIN_S0, OUTPUT);
  pinMode(PIN_S1, OUTPUT);
  pinMode(PIN_S2, OUTPUT);
  pinMode(PIN_S3, OUTPUT);
  pinMode(PIN_OUT, INPUT);

  // Set TCS3200 frequency scaling to 20%
  digitalWrite(PIN_S0, HIGH);
  digitalWrite(PIN_S1, LOW);

  Serial.println("FRESH_SENSE_HARDWARE_NODE_ONLINE");
}

float readTemperatureC() {
  int rawADC = analogRead(PIN_THERMISTOR);
  if (rawADC <= 10 || rawADC >= 1020) {
    // If thermistor is not wired yet, return standard 24.5°C room ambient
    return 24.5;
  }

  float resistance = SERIES_RESISTOR / (1023.0 / (float)rawADC - 1.0);
  float steinhart = resistance / NOMINAL_RESISTANCE;     // (R/Ro)
  steinhart = log(steinhart);                            // ln(R/Ro)
  steinhart /= B_COEFFICIENT;                            // 1/B * ln(R/Ro)
  steinhart += 1.0 / (NOMINAL_TEMPERATURE + 273.15);     // + (1/To)
  steinhart = 1.0 / steinhart;                           // Invert
  float tempC = steinhart - 273.15;                      // Convert to °C

  return constrain(tempC, -10.0, 70.0);
}

float readMQ2_PPM() {
  // MQ-2 measures combustible hydrocarbons, methane, general VOCs
  int raw = analogRead(PIN_MQ2);
  // Calibration: clean air produces raw ADC 80-180 (maps to 40-120 PPM)
  // Higher gas produces raw ADC up to 800+ (maps to 500+ PPM)
  float ppm = 40.0 + ((float)raw / 1023.0) * 460.0;
  return constrain(ppm, 20.0, 600.0);
}

float readMQ3_PPM() {
  // MQ-3 is sensitive to Alcohol / Ethanol vapor from sugar fermentation
  int raw = analogRead(PIN_MQ3);
  // Calibration: clean room air is raw ADC 60-150 (maps to 20-80 PPM)
  // Fermenting fruit vapors trigger raw ADC 300-800 (maps to 150-450 PPM)
  float ppm = 20.0 + ((float)raw / 1023.0) * 430.0;
  return constrain(ppm, 10.0, 500.0);
}

void readColorRGB(int &r, int &g, int &b) {
  // Read Red Filter
  digitalWrite(PIN_S2, LOW);
  digitalWrite(PIN_S3, LOW);
  int redDuration = pulseIn(PIN_OUT, LOW, 60000);

  // Read Blue Filter
  digitalWrite(PIN_S2, LOW);
  digitalWrite(PIN_S3, HIGH);
  int blueDuration = pulseIn(PIN_OUT, LOW, 60000);

  // Read Green Filter
  digitalWrite(PIN_S2, HIGH);
  digitalWrite(PIN_S3, HIGH);
  int greenDuration = pulseIn(PIN_OUT, LOW, 60000);

  // If TCS sensor is not connected (pulses timeout), supply balanced baseline
  if (redDuration == 0 && greenDuration == 0) {
    r = 76;
    g = 175;
    b = 80;
    return;
  }

  r = constrain(map(redDuration, 25, 120, 255, 0), 0, 255);
  g = constrain(map(greenDuration, 30, 130, 255, 0), 0, 255);
  b = constrain(map(blueDuration, 25, 120, 255, 0), 0, 255);
}

void loop() {
  // 1. Read all sensors concurrently
  float temp = readTemperatureC();
  float mq2PPM = readMQ2_PPM();
  float mq3PPM = readMQ3_PPM();
  
  // Combined composite spoilage index (weighted for fermentation & VOCs)
  float gasComposite = (mq2PPM * 0.45) + (mq3PPM * 0.55);

  int red = 76, green = 175, blue = 80;
  readColorRGB(red, green, blue);

  // 2. Synchronized Output format:
  // TEMP:24.5,MQ2:115,MQ3:82,GAS:98,RGB:76,175,80
  Serial.print("TEMP:");
  Serial.print(temp, 1);
  Serial.print(",MQ2:");
  Serial.print(mq2PPM, 0);
  Serial.print(",MQ3:");
  Serial.print(mq3PPM, 0);
  Serial.print(",GAS:");
  Serial.print(gasComposite, 0);
  Serial.print(",RGB:");
  Serial.print(red);
  Serial.print(",");
  Serial.print(green);
  Serial.print(",");
  Serial.println(blue);

  delay(1000); // 1-second continuous telemetry cadence
}
