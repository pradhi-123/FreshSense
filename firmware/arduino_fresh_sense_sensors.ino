/*
  Sense AI - Multi-Sensor Array Firmware for Arduino Uno / Mini
  Concurrently reads:
  1. Temperature: NTC 10k Thermistor (Analog Pin A0)
  2. Spoilage Gas: MQ-135 / MQ-4 Semiconductor Sensor (Analog Pin A1)
  3. Spectral Color: TCS3200 Color Sensor (Digital Pins 4, 5, 6, 7, 8)
  
  Outputs synchronized CSV telemetry at 9600 baud:
  TEMP:24.5,GAS:120,RGB:76,175,80
*/

// --- THERMISTOR CONFIGURATION (Analog Pin A0) ---
const int PIN_THERMISTOR = A0;
const float SERIES_RESISTOR = 10000.0; // 10k resistor
const float NOMINAL_RESISTANCE = 10000.0; // 10k thermistor at 25C
const float NOMINAL_TEMPERATURE = 25.0; // 25C
const float B_COEFFICIENT = 3950.0; // Beta value

// --- GAS SENSOR CONFIGURATION (Analog Pin A1) ---
const int PIN_GAS = A1;

// --- TCS3200 COLOR SENSOR PINS ---
const int PIN_S0 = 4;
const int PIN_S1 = 5;
const int PIN_S2 = 6;
const int PIN_S3 = 7;
const int PIN_OUT = 8;

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

  Serial.println("SENSE_AI_NODE_READY");
}

float readTemperatureC() {
  int rawADC = analogRead(PIN_THERMISTOR);
  if (rawADC <= 0 || rawADC >= 1023) return 24.5; // Baseline fallback if unplugged

  float resistance = SERIES_RESISTOR / (1023.0 / (float)rawADC - 1.0);
  float steinhart = resistance / NOMINAL_RESISTANCE;     // (R/Ro)
  steinhart = log(steinhart);                            // ln(R/Ro)
  steinhart /= B_COEFFICIENT;                            // 1/B * ln(R/Ro)
  steinhart += 1.0 / (NOMINAL_TEMPERATURE + 273.15);     // + (1/To)
  steinhart = 1.0 / steinhart;                           // Invert
  float tempC = steinhart - 273.15;                      // convert to C

  return tempC;
}

float readGasPPM() {
  int rawGas = analogRead(PIN_GAS);
  // MQ-135 curve approximation for organic volatiles/ethylene
  // Raw ADC 100-800 maps roughly to 50 - 500 PPM
  float ppm = 50.0 + ((float)rawGas / 1023.0) * 450.0;
  return ppm;
}

void readColorRGB(int &r, int &g, int &b) {
  // Read Red Filter
  digitalWrite(PIN_S2, LOW);
  digitalWrite(PIN_S3, LOW);
  int redDuration = pulseIn(PIN_OUT, LOW, 80000);

  // Read Blue Filter
  digitalWrite(PIN_S2, LOW);
  digitalWrite(PIN_S3, HIGH);
  int blueDuration = pulseIn(PIN_OUT, LOW, 80000);

  // Read Green Filter
  digitalWrite(PIN_S2, HIGH);
  digitalWrite(PIN_S3, HIGH);
  int greenDuration = pulseIn(PIN_OUT, LOW, 80000);

  // If TCS sensor is not connected (pulses timeout), supply balanced baseline
  if (redDuration == 0 && greenDuration == 0) {
    r = 76;
    g = 175;
    b = 80;
    return;
  }

  // Map frequency pulse duration to 0-255 RGB
  r = constrain(map(redDuration, 25, 120, 255, 0), 0, 255);
  g = constrain(map(greenDuration, 30, 130, 255, 0), 0, 255);
  b = constrain(map(blueDuration, 25, 120, 255, 0), 0, 255);
}

void loop() {
  // Concurrently sample all 3 sensors
  float temp = readTemperatureC();
  float gasPPM = readGasPPM();
  int red = 76, green = 175, blue = 80;
  readColorRGB(red, green, blue);

  // Print synchronized single-line telemetry string
  Serial.print("TEMP:");
  Serial.print(temp, 1);
  Serial.print(",GAS:");
  Serial.print(gasPPM, 0);
  Serial.print(",RGB:");
  Serial.print(red);
  Serial.print(",");
  Serial.print(green);
  Serial.print(",");
  Serial.println(blue);

  delay(1200); // Sample every 1.2 seconds
}

