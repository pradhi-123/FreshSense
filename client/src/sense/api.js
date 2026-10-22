/**
 * Sense AI Client API Helper
 * Uses Vite dev-server proxy (/api → Flask :5005) so it works on
 * desktop (localhost) AND mobile (LAN IP via Vite --host).
 * Production: set VITE_API_BASE to absolute URL if needed.
 */

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchCurrentSensors() {
  const res = await fetch(`${API_BASE}/sensors/current`);
  return res.json();
}

export async function fetchFreshCatalog() {
  const res = await fetch(`${API_BASE}/fresh/catalog`);
  return res.json();
}

export async function analyzeFreshFoodImage(imageBase64, file = null, scanStats = null) {
  if (file) {
    const formData = new FormData();
    formData.append('image', file);
    if (scanStats) {
      formData.append('scan_stats', JSON.stringify(scanStats));
    }
    const res = await fetch(`${API_BASE}/fresh/analyze-image`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  }

  const res = await fetch(`${API_BASE}/fresh/analyze-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      image_base64: imageBase64,
      scan_stats: scanStats
    }),
  });
  return res.json();
}

export async function lookupBarcodeApi(code) {
  const res = await fetch(`${API_BASE}/packaged/barcode/${encodeURIComponent(code)}`);
  return res.json();
}

export async function extractBillLabelApi(imageBase64, file = null, barcodeContext = null) {
  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    if (barcodeContext) {
      formData.append('barcode_context', JSON.stringify(barcodeContext));
    }
    const res = await fetch(`${API_BASE}/packaged/extract-bill-label`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  }

  const res = await fetch(`${API_BASE}/packaged/extract-bill-label`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_base64: imageBase64, barcode_context: barcodeContext }),
  });
  return res.json();
}

export async function extractBarcodeFromImageApi(imageBase64, file = null) {
  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/packaged/extract-barcode-image`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  }

  const res = await fetch(`${API_BASE}/packaged/extract-barcode-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_base64: imageBase64 }),
  });
  return res.json();
}

export async function parseLabelTextApi(rawText) {
  const res = await fetch(`${API_BASE}/packaged/parse-label-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_text: rawText }),
  });
  return res.json();
}

export async function calculateShelfLifeApi({ mfg_date, exp_date, mrp, selling_price, ambient_temp, category }) {
  const res = await fetch(`${API_BASE}/packaged/calculate-shelf-life`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mfg_date, exp_date, mrp, selling_price, ambient_temp, category }),
  });
  return res.json();
}

export async function generateDemoBarcodeApi({ product_name, product_id, mrp, exp_date }) {
  const res = await fetch(`${API_BASE}/packaged/generate-barcode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_name, product_id, mrp, exp_date }),
  });
  return res.json();
}

export async function fetchDemoRecordsApi() {
  const res = await fetch(`${API_BASE}/packaged/demo-records`);
  return res.json();
}

export async function applySimulationPresetApi(presetKey) {
  const res = await fetch(`${API_BASE}/simulation/preset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preset_key: presetKey }),
  });
  return res.json();
}

export async function pushEsp32Telemetry(payload) {
  const res = await fetch(`${API_BASE}/hardware/esp32/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
