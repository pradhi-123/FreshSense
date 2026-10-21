/*
 * =========================================================================================
 * Sense AI - Arduino UNO 10k NTC Thermistor Reader
 * =========================================================================================
 * Board: Arduino UNO R3 / Nano
 * Sensor: 10k NTC Thermistor on Pin A0 with 10kΩ Fixed Resistor
 *
 * CIRCUIT SCHEMATIC:
 *
 *     5V (Arduino) -------------+
 *                               |
 *                        [ 10k NTC Thermistor ]
 *                               |
 *          A0 Pin <-------------+
 *                               |
 *                        [ 10kΩ Fixed Resistor ]
 *                               |
 *         GND (Arduino) --------+
 *
 * =========================================================================================
 */

#define THERMISTOR_PIN       A0
#define SERIES_RESISTOR      10000.0  // 10k ohm fixed resistor
#define NOMINAL_RESISTANCE   10000.0  // 10k ohm at 25°C
#define NOMINAL_TEMPERATURE  25.0     // 25°C baseline
#define B_COEFFICIENT        3950.0   // Beta value of standard 10k NTC thermistor
#define NUM_SAMPLES          10       // 10-sample rolling average

void setup() {
  Serial.begin(9600);
  delay(500);
  Serial.println(F("=================================================="));
  Serial.println(F(" Sense AI - Arduino Uno Thermistor Live Monitor  "));
  Serial.println(F("=================================================="));
}

float readTemperature() {
  float adcSum = 0;
  for (int i = 0; i < NUM_SAMPLES; i++) {
    adcSum += analogRead(THERMISTOR_PIN);
    delay(10);
  }
  float adcAvg = adcSum / NUM_SAMPLES;

  if (adcAvg <= 0.0) adcAvg = 1.0;
  if (adcAvg >= 1023.0) adcAvg = 1022.0;

  // Calculate thermistor resistance (voltage divider)
  float resistance = SERIES_RESISTOR * ((1023.0 / adcAvg) - 1.0);

  // Steinhart-Hart equation
  float steinhart = resistance / NOMINAL_RESISTANCE;     // (R/Ro)
  steinhart = log(steinhart);                           // ln(R/Ro)
  steinhart /= B_COEFFICIENT;                           // 1/B * ln(R/Ro)
  steinhart += 1.0 / (NOMINAL_TEMPERATURE + 273.15);    // + (1/To in K)
  steinhart = 1.0 / steinhart;                          // Invert
  steinhart -= 273.15;                                  // Convert to Celsius

  return steinhart;
}

void loop() {
  float tempC = readTemperature();

  Serial.print(F("TEMP:"));
  Serial.print(tempC, 2);
  Serial.println(F(" C"));

  delay(2000);
}

