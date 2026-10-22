"""
Sense AI - Arduino UNO / Mini Multi-Sensor USB Bridge
Auto-detects the Arduino on USB COM port, reads concurrent live telemetry:
- Temperature (NTC Thermistor / DHT)
- Spoilage Gas Sensor (MQ-135 / MQ-4)
- Spectral Color Sensor (TCS3200 / TCS34725 RGB)
and streams all parameters concurrently to the Sense AI server.
"""

import time
import re
import json
import requests
import serial
import serial.tools.list_ports

ENDPOINT = "http://localhost:5005/api/hardware/esp32/telemetry"
BAUD_RATE = 9600


def find_arduino_port():
    ports = list(serial.tools.list_ports.comports())
    for p in ports:
        desc = (p.description or "").lower()
        if any(k in desc for k in ["ch340", "arduino", "usb-serial", "ftdi", "cp210"]):
            return p.device
    if ports:
        return ports[0].device
    return None


def parse_sensor_line(line: str, state: dict) -> dict:
    """
    Parses diverse Arduino serial output formats:
    - Synchronized CSV: "TEMP:24.5,MQ2:115,MQ3:82,GAS:98,RGB:76,175,80"
    - Single line: "TEMP: 24.8" or "MQ2: 120" or "MQ3: 90" or "GAS: 145"
    - JSON: '{"temp": 24.5, "mq2": 115, "mq3": 82, "gas": 98, "r": 80, "g": 170, "b": 65}'
    """
    line = line.strip()
    if line.startswith("{") and line.endswith("}"):
        try:
            data = json.loads(line)
            if "temp" in data: state["temp"] = float(data["temp"])
            if "mq2" in data: state["mq2"] = float(data["mq2"])
            if "mq3" in data: state["mq3"] = float(data["mq3"])
            if "gas" in data: state["gas"] = float(data["gas"])
            elif "mq2" in data or "mq3" in data:
                m2 = state.get("mq2", 115.0)
                m3 = state.get("mq3", 85.0)
                state["gas"] = round((m2 * 0.45) + (m3 * 0.55), 1)
            if "r" in data: state["color_r"] = int(data["r"])
            if "g" in data: state["color_g"] = int(data["g"])
            if "b" in data: state["color_b"] = int(data["b"])
            return state
        except Exception:
            pass

    # 1. Temperature pattern (TEMP: 24.5 or T: 24.5)
    t_match = re.search(r'(?:TEMP|TEMPERATURE|T)[\s:=]*([0-9]+(?:\.[0-9]+)?)', line, re.IGNORECASE)
    if t_match:
        state["temp"] = float(t_match.group(1))

    # 2. MQ-2 Hydrocarbon & Spoilage pattern (MQ2: 115 or MQ-2: 115)
    mq2_match = re.search(r'(?:MQ2|MQ-2)[\s:=]*([0-9]+(?:\.[0-9]+)?)', line, re.IGNORECASE)
    if mq2_match:
        state["mq2"] = float(mq2_match.group(1))

    # 3. MQ-3 Alcohol / Fermentation pattern (MQ3: 85 or MQ-3: 85 or ETHANOL: 85)
    mq3_match = re.search(r'(?:MQ3|MQ-3|ETHANOL|ALCOHOL)[\s:=]*([0-9]+(?:\.[0-9]+)?)', line, re.IGNORECASE)
    if mq3_match:
        state["mq3"] = float(mq3_match.group(1))

    # 4. General Gas pattern (GAS: 135 or VOC: 135)
    g_match = re.search(r'(?:GAS|VOC)[\s:=]*([0-9]+(?:\.[0-9]+)?)', line, re.IGNORECASE)
    if g_match:
        state["gas"] = float(g_match.group(1))
    elif "mq2" in state or "mq3" in state:
        m2 = state.get("mq2", 115.0)
        m3 = state.get("mq3", 85.0)
        state["gas"] = round((m2 * 0.45) + (m3 * 0.55), 1)

    # 5. RGB Color Sensor pattern (RGB: 76, 175, 80 or COLOR: 76,175,80)
    rgb_match = re.search(r'(?:RGB|COLOR)[\s:=]*([0-9]{1,3})[\s,]+([0-9]{1,3})[\s,]+([0-9]{1,3})', line, re.IGNORECASE)
    if rgb_match:
        state["color_r"] = int(rgb_match.group(1))
        state["color_g"] = int(rgb_match.group(2))
        state["color_b"] = int(rgb_match.group(3))

    # 6. Hex Color pattern (HEX: #4CAF50 or #4CAF50)
    hex_match = re.search(r'#(?:[0-9a-fA-F]{6})', line)
    if hex_match:
        h = hex_match.group(0).upper()
        state["color_hex"] = h
        state["color_r"] = int(h[1:3], 16)
        state["color_g"] = int(h[3:5], 16)
        state["color_b"] = int(h[5:7], 16)

    # 7. Humidity pattern (HUM: 58 or H: 58)
    h_match = re.search(r'(?:HUM|HUMIDITY|H)[\s:=]*([0-9]+(?:\.[0-9]+)?)', line, re.IGNORECASE)
    if h_match:
        state["hum"] = float(h_match.group(1))

    return state


def main():
    print("==================================================================")
    print(" Sense AI - Arduino Multi-Sensor Live Telemetry Bridge ")
    print(" Concurrent Sensors: Thermistor + MQ-2 + MQ-3 + TCS Spectral Color ")
    print("==================================================================")

    current_state = {
        "temp": 24.5,
        "hum": 58.0,
        "mq2": 115.0,
        "mq3": 85.0,
        "gas": 98.5,
        "color_r": 76,
        "color_g": 175,
        "color_b": 80,
        "color_hex": "#4CAF50",
        "device_name": "Arduino UNO Multi-Sensor Node (MQ-2 + MQ-3)"
    }

    last_post_time = 0

    while True:
        port = find_arduino_port()
        if not port:
            print("[!] No Arduino UNO / Mini detected on USB. Retrying in 3s...", flush=True)
            time.sleep(3)
            continue

        print(f"[*] Detected Arduino on {port}. Connecting at {BAUD_RATE} baud...", flush=True)

        ser = None
        try:
            ser = serial.Serial(port, BAUD_RATE, timeout=2)
            time.sleep(2)  # Reset time
            print(f"\n[SUCCESS] Connected to {port}! Streaming concurrent sensors to Sense AI...", flush=True)

            while True:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if not line:
                    continue

                print(f"  [Arduino Serial] {line}", flush=True)
                current_state = parse_sensor_line(line, current_state)

                now = time.time()
                # Push every ~1.2 seconds to prevent web flooding
                if now - last_post_time >= 1.2:
                    last_post_time = now
                    payload = {
                        "temp": current_state["temp"],
                        "hum": current_state["hum"],
                        "gas": current_state["gas"],
                        "mq2": current_state.get("mq2", 115.0),
                        "mq3": current_state.get("mq3", 85.0),
                        "color_r": current_state["color_r"],
                        "color_g": current_state["color_g"],
                        "color_b": current_state["color_b"],
                        "color_hex": current_state.get("color_hex", f"#{current_state['color_r']:02x}{current_state['color_g']:02x}{current_state['color_b']:02x}".upper()),
                        "device_name": "Arduino UNO Multi-Sensor Node (MQ-2 + MQ-3 + TCS)"
                    }

                    try:
                        resp = requests.post(ENDPOINT, json=payload, timeout=2)
                        if resp.status_code == 200:
                            print(f"  -> [Concurrent Sync OK] Temp: {payload['temp']}°C | MQ-2: {payload['mq2']} PPM | MQ-3 Ethanol: {payload['mq3']} PPM | Color: RGB({payload['color_r']},{payload['color_g']},{payload['color_b']})", flush=True)
                    except Exception as net_err:
                        print(f"  -> [Web Sync Note] {net_err}", flush=True)

        except serial.SerialException as se:
            err_msg = str(se).lower()
            if "permissionerror" in err_msg or "access is denied" in err_msg:
                print(f"[!] {port} is busy. Close Arduino IDE Serial Monitor. Retrying in 2s...", flush=True)
            else:
                print(f"[!] Serial connection issue: {se}. Retrying in 3s...", flush=True)
            time.sleep(2)

        except Exception as e:
            print(f"[!] Unexpected error: {e}. Retrying in 2s...", flush=True)
            time.sleep(2)

        finally:
            if ser and ser.is_open:
                try: ser.close()
                except Exception: pass


if __name__ == "__main__":
    main()
