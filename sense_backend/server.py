"""
Sense AI - Central Backend Server
=================================
RESTful API providing:
1. Fresh Food Analysis endpoint (Gemini Multimodal + Biological Spoilage Kinetics)
2. Telemetry & Simulation endpoints (DHT22 Temp/Humidity, MQ-135 Gas)
3. Hardware ESP32 endpoint (live push from ESP32 box via Wi-Fi)
4. Packaged Food Barcode Lookup (Open Food Facts + Local Store)
5. Package Label OCR parsing (Dates, MRP, Selling Price, Expiry calculation)
6. Demo Barcode Generation (Internal product catalog)
"""

import os
import sys
import json
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Ensure local imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.food_profiles import get_all_food_profiles, get_food_profile
from core.freshness_engine import FreshnessPredictionService
from core.sensor_service import SimulationSensorProvider, SensorReading
from core.history_service import HistoryService
from esp32_service import esp32_hub
from ai_advisor import analyze_fresh_food
from packaged_service import (
    lookup_barcode,
    parse_dates_and_prices_from_text,
    calculate_shelf_life_status,
    generate_demo_barcode,
    DEMO_PRODUCT_STORE,
    extract_bill_or_label_ai,
    extract_barcode_from_image_ai,
)

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Singleton services
sim_provider = SimulationSensorProvider()
freshness_service = FreshnessPredictionService()


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "service": "Sense AI Core Engine",
        "version": "2.0.0",
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")),
    })


# ---------------------------------------------------------
# SENSOR & ESP32 HARDWARE ENDPOINTS
# ---------------------------------------------------------
@app.route("/api/sensors/current", methods=["GET"])
def get_current_sensors():
    """Returns current active telemetry (physical ESP32/Arduino if online, else simulation)."""
    hw_data = esp32_hub.get_status_and_reading()
    hw_status = hw_data["status"]

    if hw_status["is_connected"] and hw_data["reading"]:
        reading = hw_data["reading"]
        return jsonify({
            "source": "ESP32_HARDWARE",
            "is_hardware": True,
            "hardware_status": hw_status,
            "temperature_c": reading["temperature_c"],
            "humidity_pct": reading["humidity_pct"],
            "gas_ppm": reading["gas_ppm"],
            "mq2_ppm": reading.get("mq2_ppm", reading["gas_ppm"]),
            "mq3_ppm": reading.get("mq3_ppm", reading["gas_ppm"]),
            "raw_gas_analog": reading.get("raw_gas_analog"),
            "color_rgb": reading.get("color_rgb", {"r": 76, "g": 175, "b": 80}),
            "color_hex": reading.get("color_hex", "#4CAF50"),
            "color_name": reading.get("color_name", "Vibrant Chlorophyll Emerald"),
            "browning_index": reading.get("browning_index", 12.0),
            "timestamp": reading["timestamp"],
            "device_name": hw_status["device_name"],
            "concurrent_sensors": reading.get("concurrent_sensors", {}),
            "gas_diagnostic_note": reading.get("gas_diagnostic_note"),
        })
    else:
        sim_read = sim_provider.get_current_reading()
        return jsonify({
            "source": "SIMULATION_SENSOR",
            "is_hardware": False,
            "hardware_status": hw_status,
            "temperature_c": sim_read.temperature_c,
            "humidity_pct": sim_read.humidity_pct,
            "gas_ppm": sim_read.gas_ppm,
            "mq2_ppm": round(sim_read.gas_ppm * 1.05, 1),
            "mq3_ppm": round(sim_read.gas_ppm * 0.95, 1),
            "raw_gas_analog": None,
            "color_rgb": {"r": 76, "g": 175, "b": 80},
            "color_hex": "#4CAF50",
            "color_name": "Vibrant Chlorophyll Emerald",
            "browning_index": 12.0,
            "timestamp": sim_read.timestamp.isoformat(),
            "device_name": sim_read.device_name,
            "concurrent_sensors": {
                "temperature": True,
                "gas_mq2": True,
                "gas_mq3": True,
                "color_spectral": True,
                "sync_state": "SIMULATED_BASELINE"
            },
            "gas_diagnostic_note": "Simulation Mode: Calibrated MQ-2 & MQ-3 baseline active.",
        })


@app.route("/api/hardware/esp32/telemetry", methods=["POST"])
def esp32_telemetry_post():
    """Endpoint for ESP32 and Arduino USB multi-sensor concurrent telemetry push (MQ-2, MQ-3, Thermistor, TCS3200)."""
    data = request.get_json(force=True, silent=True) or {}
    temp = data.get("temp", data.get("temperature", 24.0))
    hum = data.get("hum", data.get("humidity", 60.0))
    gas = data.get("gas", data.get("gas_ppm", 115.0))
    mq2 = data.get("mq2", data.get("mq2_ppm", None))
    mq3 = data.get("mq3", data.get("mq3_ppm", None))
    raw_gas = data.get("raw_gas", None)
    rssi = data.get("rssi", -60)
    device_name = data.get("device_name", "Arduino UNO Multi-Sensor Node")

    # Color sensor data (TCS3200 / TCS34725 RGB)
    rgb = data.get("rgb") or {}
    color_r = data.get("color_r", data.get("r", rgb.get("r") if isinstance(rgb, dict) else None))
    color_g = data.get("color_g", data.get("g", rgb.get("g") if isinstance(rgb, dict) else None))
    color_b = data.get("color_b", data.get("b", rgb.get("b") if isinstance(rgb, dict) else None))
    color_hex = data.get("color_hex", data.get("hex", None))
    color_name = data.get("color_name", None)

    client_ip = request.remote_addr

    rec = esp32_hub.record_heartbeat_or_reading(
        temperature_c=temp,
        humidity_pct=hum,
        gas_ppm=gas,
        mq2_ppm=mq2,
        mq3_ppm=mq3,
        ip_address=client_ip,
        rssi_dbm=rssi,
        raw_gas_analog=raw_gas,
        color_r=color_r,
        color_g=color_g,
        color_b=color_b,
        color_hex=color_hex,
        color_name=color_name,
        device_name=device_name,
    )
    return jsonify({"success": True, "message": "Multi-Sensor Telemetry acknowledged", "recorded": rec})


@app.route("/api/hardware/esp32/status", methods=["GET"])
def get_hardware_status():
    return jsonify(esp32_hub.get_status_and_reading())


@app.route("/api/simulation/preset", methods=["POST"])
def apply_simulation_preset():
    """Allows UI to switch simulation scenario presets."""
    data = request.get_json() or {}
    preset_key = data.get("preset_key", "dashboard_mockup")
    sim_provider.apply_preset(preset_key)
    read = sim_provider.get_current_reading()
    return jsonify({
        "success": True,
        "preset_key": preset_key,
        "reading": read.to_dict()
    })


@app.route("/api/simulation/presets", methods=["GET"])
def get_simulation_presets():
    return jsonify({"presets": sim_provider.PRESETS})


# ---------------------------------------------------------
# MODE A: FRESH FOOD ASSESSMENT ENDPOINTS
# ---------------------------------------------------------
@app.route("/api/fresh/catalog", methods=["GET"])
def get_fresh_catalog():
    """Returns biological profiles of all pre-calibrated fresh produce items."""
    hw_data = esp32_hub.get_status_and_reading()
    if hw_data["status"]["is_connected"] and hw_data["reading"]:
        r = hw_data["reading"]
        reading = SensorReading(
            temperature_c=r["temperature_c"],
            humidity_pct=r["humidity_pct"],
            gas_ppm=r["gas_ppm"],
            hours_elapsed=24.0,
            timestamp=sys.modules["datetime"].datetime.now(),
            is_simulated=False,
        )
    else:
        reading = sim_provider.get_current_reading()

    results = freshness_service.analyze_all_foods(reading)
    return jsonify({
        "results": [
            {
                "food_id": res.food_id,
                "food_name": res.food_name,
                "icon": res.icon,
                "category": res.category,
                "freshness_score": res.freshness_score,
                "status": res.status,
                "status_color": res.status_color,
                "status_bg": res.status_bg,
                "estimated_remaining_str": res.estimated_remaining_str,
                "estimated_remaining_hours": res.estimated_remaining_hours,
                "risk_level": res.risk_level,
                "trend_str": res.trend_str,
                "primary_reason": res.primary_reason,
                "recommended_action": res.recommended_action,
                "ai_confidence_pct": res.ai_confidence_pct,
                "temp_status": res.temp_status,
                "humidity_status": res.humidity_status,
                "gas_status": res.gas_status,
            }
            for res in results
        ]
    })


@app.route("/api/fresh/analyze-image", methods=["POST"])
def analyze_fresh_image():
    """
    Main Mode A AI Food Analysis Endpoint.
    Accepts multipart image upload or base64 data.
    Correlates image with active environmental telemetry (ESP32 or sensor).
    """
    # 1. Extract image bytes
    image_bytes = None
    if "image" in request.files:
        image_bytes = request.files["image"].read()
    else:
        body = request.get_json(silent=True) or {}
        if "image_base64" in body:
            raw_b64 = body["image_base64"]
            if "," in raw_b64:
                raw_b64 = raw_b64.split(",")[1]
            image_bytes = base64.b64decode(raw_b64)

    if not image_bytes:
        return jsonify({"error": "No image provided. Please upload an image file or provide image_base64."}), 400

    # 2. Get active telemetry
    body = request.get_json(silent=True) if request.is_json else {}
    if not body and request.form:
        body = request.form.to_dict()

    scan_stats = None
    if body and "scan_stats" in body:
        raw_stats = body["scan_stats"]
        if isinstance(raw_stats, str):
            try:
                scan_stats = json.loads(raw_stats)
            except Exception:
                scan_stats = None
        elif isinstance(raw_stats, dict):
            scan_stats = raw_stats

    hw_data = esp32_hub.get_status_and_reading()
    is_hw = hw_data["status"]["is_connected"] and hw_data["reading"] is not None
    if is_hw:
        r = hw_data["reading"]
        temp = r["temperature_c"]
        humidity = r["humidity_pct"]
        gas = r["gas_ppm"]
        mq2_val = r.get("mq2_ppm", gas)
        mq3_val = r.get("mq3_ppm", gas)
        color_info = {
            "r": r.get("color_rgb", {}).get("r", 76),
            "g": r.get("color_rgb", {}).get("g", 175),
            "b": r.get("color_rgb", {}).get("b", 80),
            "hex": r.get("color_hex", "#4CAF50"),
            "color_name": r.get("color_name", "Vibrant Chlorophyll Emerald"),
            "browning_index": r.get("browning_index", 12.0)
        }
    else:
        sim_read = sim_provider.get_current_reading()
        temp = sim_read.temperature_c
        humidity = sim_read.humidity_pct
        gas = sim_read.gas_ppm
        mq2_val = round(gas * 1.05, 1)
        mq3_val = round(gas * 0.95, 1)
        color_info = {
            "r": 76,
            "g": 175,
            "b": 80,
            "hex": "#4CAF50",
            "color_name": "Vibrant Chlorophyll Emerald",
            "browning_index": 12.0
        }

    # Override with scan stats if provided from 30s client scan
    if scan_stats:
        if "avg_temp" in scan_stats:
            temp = float(scan_stats["avg_temp"])
        if "avg_mq2" in scan_stats:
            mq2_val = float(scan_stats["avg_mq2"])
        if "avg_mq3" in scan_stats:
            mq3_val = float(scan_stats["avg_mq3"])
        gas = round((mq2_val * 0.45) + (mq3_val * 0.55), 1)

    # 3. Multimodal Multi-Sensor Analysis (Vision + MQ-2 + MQ-3 + Color + Arrhenius Kinetics)
    assessment = analyze_fresh_food(
        image_bytes=image_bytes,
        temp=temp,
        humidity=humidity,
        gas_ppm=gas,
        sensor_is_hardware=is_hw,
        color_data=color_info,
        mq2_ppm=mq2_val,
        mq3_ppm=mq3_val,
        scan_data=scan_stats
    )

    assessment["telemetry"] = {
        "temperature_c": temp,
        "humidity_pct": humidity,
        "gas_ppm": gas,
        "mq2_ppm": mq2_val,
        "mq3_ppm": mq3_val,
        "color_rgb": {"r": color_info["r"], "g": color_info["g"], "b": color_info["b"]},
        "color_hex": color_info["hex"],
        "color_name": color_info["color_name"],
        "browning_index": color_info["browning_index"],
        "is_hardware": is_hw,
        "source": "Arduino UNO Sensor Array (MQ-2 + MQ-3 + TCS)" if is_hw else "Sense AI Simulation",
        "concurrent_sensors": {
            "camera_vision": True,
            "temperature_arrhenius": True,
            "gas_mq2": True,
            "gas_mq3": True,
            "color_tcs": True
        },
        "scan_stats": scan_stats
    }

    # 4. Generate 48h decay timeline
    timeline = HistoryService.get_food_timeline(
        assessment.get("detected_item", "Produce"),
        assessment.get("freshness_score", 75.0)
    )
    assessment["timeline_48h"] = timeline

    return jsonify({"success": True, "assessment": assessment})


# ---------------------------------------------------------
# MODE B: PACKAGED FOOD ASSESSMENT ENDPOINTS
# ---------------------------------------------------------
@app.route("/api/packaged/barcode/<code_str>", methods=["GET"])
def get_barcode_info(code_str):
    result = lookup_barcode(code_str)
    return jsonify(result)


@app.route("/api/packaged/parse-label-text", methods=["POST"])
def parse_label():
    """Parses raw text extracted by OCR into structured packaging fields."""
    body = request.get_json() or {}
    raw_text = body.get("raw_text", "")
    if not raw_text:
        return jsonify({"error": "No label text supplied."}), 400

    parsed = parse_dates_and_prices_from_text(raw_text)
    # Calculate shelf life
    shelf_life = calculate_shelf_life_status(parsed["mfg_date"], parsed["exp_date"])
    parsed["shelf_life"] = shelf_life

    # Calculate savings if both MRP and selling price present
    if parsed["mrp"] is not None and parsed["selling_price"] is not None and parsed["mrp"] > 0:
        parsed["savings_amount"] = round(max(0.0, parsed["mrp"] - parsed["selling_price"]), 2)
        parsed["discount_pct"] = round((parsed["savings_amount"] / parsed["mrp"]) * 100.0, 1)
    else:
        parsed["savings_amount"] = None
        parsed["discount_pct"] = None

    return jsonify({"success": True, "data": parsed})


@app.route("/api/packaged/extract-bill-label", methods=["POST"])
def extract_bill_label_endpoint():
    """Multimodal AI extraction of printed bills, receipts, and package labels."""
    image_bytes = None
    if "file" in request.files:
        image_bytes = request.files["file"].read()
    elif "image" in request.files:
        image_bytes = request.files["image"].read()
    else:
        body = request.get_json(silent=True) or {}
        if "image_base64" in body:
            raw_b64 = body["image_base64"]
            if "," in raw_b64:
                raw_b64 = raw_b64.split(",")[1]
            try:
                image_bytes = base64.b64decode(raw_b64)
            except Exception:
                pass

    if not image_bytes:
        return jsonify({"success": False, "error": "No image provided. Please upload an image file or provide image_base64."}), 400

    barcode_context = None
    if "barcode_context" in request.form:
        try:
            barcode_context = json.loads(request.form["barcode_context"])
        except Exception:
            pass
    elif request.is_json:
        barcode_context = (request.get_json(silent=True) or {}).get("barcode_context")

    result = extract_bill_or_label_ai(image_bytes, barcode_context=barcode_context)
    return jsonify(result)


@app.route("/api/packaged/extract-barcode-image", methods=["POST"])
def extract_barcode_image_endpoint():
    """Multimodal AI Barcode Detection from camera snapshots and uploaded images."""
    image_bytes = None
    if "file" in request.files:
        image_bytes = request.files["file"].read()
    elif "image" in request.files:
        image_bytes = request.files["image"].read()
    else:
        body = request.get_json(silent=True) or {}
        if "image_base64" in body:
            raw_b64 = body["image_base64"]
            if "," in raw_b64:
                raw_b64 = raw_b64.split(",")[1]
            try:
                image_bytes = base64.b64decode(raw_b64)
            except Exception:
                pass

    if not image_bytes:
        return jsonify({"success": False, "found": False, "message": "No image provided."}), 400

    result = extract_barcode_from_image_ai(image_bytes)
    return jsonify(result)


@app.route("/api/packaged/calculate-shelf-life", methods=["POST"])
def calculate_shelf_life():
    body = request.get_json() or {}
    mfg = body.get("mfg_date")
    exp = body.get("exp_date")
    mrp = body.get("mrp")
    selling = body.get("selling_price")
    category = body.get("category")
    ambient_temp = body.get("ambient_temp") or body.get("temperature")

    # If ambient temperature not explicitly sent, query active ESP hardware telemetry
    if ambient_temp is None:
        hw_info = esp32_hub.get_status_and_reading()
        if hw_info["status"]["is_connected"] and hw_info.get("reading"):
            ambient_temp = hw_info["reading"].get("temperature_c")

    status = calculate_shelf_life_status(mfg, exp, ambient_temp_c=ambient_temp, category=category)
    savings = None
    discount = None
    if mrp is not None and selling is not None:
        try:
            m = float(mrp)
            s = float(selling)
            if m > 0:
                savings = round(max(0.0, m - s), 2)
                discount = round((savings / m) * 100.0, 1)
        except Exception:
            pass

    return jsonify({
        "success": True,
        "shelf_life": status,
        "savings_amount": savings,
        "discount_pct": discount,
    })


@app.route("/api/packaged/generate-barcode", methods=["POST"])
def generate_barcode_endpoint():
    """Generates internal downloadable barcode and demo product record."""
    body = request.get_json() or {}
    name = body.get("product_name", "Demo Inventory Item")
    item_id = body.get("product_id", "")
    mrp = body.get("mrp", 199.0)
    exp = body.get("exp_date", "")

    result = generate_demo_barcode(product_name=name, internal_id=item_id, mrp=mrp, exp_date=exp)
    return jsonify(result)


@app.route("/api/packaged/demo-records", methods=["GET"])
def get_demo_records():
    """Lists locally saved internal demo barcodes."""
    return jsonify({"records": list(DEMO_PRODUCT_STORE.values())})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5005))
    print(f"[*] Starting Sense AI Backend Server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
