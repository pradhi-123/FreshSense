# Sense AI — Intelligent Food Freshness & Shelf-Life Assessment Platform

Welcome to **Sense AI**, a modern full-stack web and hardware platform for intelligent food assessment, shelf-life estimation, and zero-waste culinary guidance.

---

## 🌟 Key Capabilities

### 1. Mode A: Fresh Food Analysis (Unpackaged Produce)
* **Camera Capture & Mobile Upload**: Snaps or uploads photos of any unpackaged produce (fruits, vegetables, mushrooms, leafy greens) with preview and retake.
* **Broad Visual Recognition & Biological Kinetics**: Avoids rigid produce restrictions by integrating multimodal vision with biological respiration decay modeling.
* **Remaining Shelf-Life Range**: Estimates remaining shelf life (days or hours) based on physical condition and ambient environmental factors.
* **Deterioration Rate Assessment**: Correlates temperature thermal stress ($T > T_{max}$) and volatile gas levels ($PPM$) into scientific rate assessments (Low, Moderate, Accelerated).
* **Storage Recommendations**: Tailored advice on room-temperature, ventilated pantry, or refrigerated crisper storage.
* **Zero-Waste Culinary Recipes**: Dynamically serves practical culinary dishes matched to the identified food and its current condition.
* **Speed Measurement**: Displays actual elapsed processing duration (benchmarked under 30 seconds).

### 2. Mode B: Packaged Food Analysis (Groceries & Packaged Goods)
* **Option 1: Scan Barcode**:
  * Real-time camera scanner (EAN-13, EAN-8, UPC) powered by `html5-qrcode`.
  * Queries the global Open Food Facts retail database and local verified registries.
  * Displays brand, product category, ingredients, and storage directions.
  * Discloses price info only when an authoritative source provides it.
* **Option 2: Scan Package Label (OCR)**:
  * Client-side OCR powered by `tesseract.js` paired with regex heuristics for Indian packaging.
  * Extracts product name, brand, printed MRP (₹), selling price, manufacturing/packing date (DD/MM/YYYY), and expiry date.
  * **Editable Confirmation Form**: Review and fine-tune extracted fields prior to report calculation to prevent hallucinations.
  * Calculates time remaining until expiry, "Near Date" warnings, expired warnings, and savings between MRP and selling price.
* **More Tools: Generate Internal Barcodes**:
  * Generate downloadable Code128 barcodes for internal demo inventory.
  * Explicitly distinguishes generated demo barcodes from official retail GS1/GTIN barcodes.
  * Allows scanning and instant lookup of generated demo barcodes in the local registry.

### 3. ESP32 Physical Chamber Integration
* Seamless Wi-Fi HTTP telemetry endpoint receiving DHT22 (temperature/humidity) and MQ-135 (VOC gas) data.
* Graceful fallback to simulation engine if hardware is disconnected, with live connection status indicators.
* Comprehensive wiring instructions and Arduino firmware in [`firmware/`](file:///d:/First_project_clgclub/firmware/README.md).

---

## 🚀 Running the Project

### Prerequisites
* **Node.js** (v18+)
* **Python** (3.11 or 3.12)

### 1. Start the Sense AI Backend Server (Port 5005)
```powershell
# From project root
.\scratch\FreshSense-AI\venv\Scripts\python.exe sense_backend\server.py
```
Backend runs on `http://127.0.0.1:5005` (API health check: `http://127.0.0.1:5005/api/health`).

### 2. Start the Frontend Client (Port 5173)
```powershell
# From project root
npm.cmd run dev --prefix client
```
Open `http://localhost:5173/` in your browser.

---

## 🔑 Environment Variables (.env)
Add to your root `.env` or system environment (optional for cloud Gemini, offline fallback works automatically):
```env
GEMINI_API_KEY="your_google_gemini_api_key_here"
PORT=5005
```

---

## 📁 Key File Structure
* [`sense_backend/server.py`](file:///d:/First_project_clgclub/sense_backend/server.py): Flask REST API server.
* [`sense_backend/ai_advisor.py`](file:///d:/First_project_clgclub/sense_backend/ai_advisor.py): Multimodal vision & biological kinetics advisor.
* [`sense_backend/packaged_service.py`](file:///d:/First_project_clgclub/sense_backend/packaged_service.py): Barcode database & OCR label parser.
* [`sense_backend/esp32_service.py`](file:///d:/First_project_clgclub/sense_backend/esp32_service.py): Thread-safe ESP32 hardware hub.
* [`client/src/sense/SenseAIApp.jsx`](file:///d:/First_project_clgclub/client/src/sense/SenseAIApp.jsx): Main landing page with Mode A and Mode B.
* [`client/src/sense/FreshFoodWorkspace.jsx`](file:///d:/First_project_clgclub/client/src/sense/FreshFoodWorkspace.jsx): Mode A camera, analysis & recipe dashboard.
* [`client/src/sense/PackagedFoodWorkspace.jsx`](file:///d:/First_project_clgclub/client/src/sense/PackagedFoodWorkspace.jsx): Mode B barcode & OCR workspace.
* [`client/src/sense/SensorStatusBar.jsx`](file:///d:/First_project_clgclub/client/src/sense/SensorStatusBar.jsx): Real-time ESP32 & telemetry pill.
* [`firmware/esp32_sensebox.ino`](file:///d:/First_project_clgclub/firmware/esp32_sensebox.ino): Complete ESP32 chamber firmware.
