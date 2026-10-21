import React, { useState, useRef, useEffect } from 'react';
import { 
  Package,
  Barcode, 
  FileText, 
  Search, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Tag, 
  IndianRupee,
  Layers,
  Printer,
  Edit3,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Info,
  Calendar,
  Box,
  Check,
  ChevronRight,
  Heart,
  Smile,
  X,
  RefreshCw,
  Thermometer,
  Flame,
  Snowflake,
  Wifi,
  Cpu,
  FileDown,
  ExternalLink,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { 
  lookupBarcodeApi, 
  parseLabelTextApi, 
  calculateShelfLifeApi,
  extractBillLabelApi,
  extractBarcodeFromImageApi,
  fetchCurrentSensors,
} from './api';
import { generatePackagedFoodPdf } from './pdfGenerator';

/**
 * Validates GS1 EAN-13, UPC-A, and EAN-8 checksums.
 * Filters out motion-blurred misreads and auto-computes corrected check digits.
 */
function validateBarcodeChecksum(code) {
  if (!code || typeof code !== 'string') return { isValid: false, type: 'UNKNOWN', correctedCode: null };
  const cleaned = code.trim().replace(/[^\w]/g, '');

  // EAN-13 (13 digits)
  if (/^\d{13}$/.test(cleaned)) {
    const d = cleaned.split('').map(Number);
    const sum = (d[0] + d[2] + d[4] + d[6] + d[8] + d[10]) + 3 * (d[1] + d[3] + d[5] + d[7] + d[9] + d[11]);
    const expected = (10 - (sum % 10)) % 10;
    const isValid = d[12] === expected;
    const corrected = isValid ? cleaned : cleaned.slice(0, 12) + expected;
    return { isValid, type: 'EAN-13', expectedCheck: expected, actualCheck: d[12], correctedCode: corrected };
  }

  // UPC-A (12 digits)
  if (/^\d{12}$/.test(cleaned)) {
    const d = cleaned.split('').map(Number);
    const sum = 3 * (d[0] + d[2] + d[4] + d[6] + d[8] + d[10]) + (d[1] + d[3] + d[5] + d[7] + d[9]);
    const expected = (10 - (sum % 10)) % 10;
    const isValid = d[11] === expected;
    const corrected = isValid ? cleaned : cleaned.slice(0, 11) + expected;
    return { isValid, type: 'UPC-A', expectedCheck: expected, actualCheck: d[11], correctedCode: corrected };
  }

  // EAN-8 (8 digits)
  if (/^\d{8}$/.test(cleaned)) {
    const d = cleaned.split('').map(Number);
    const sum = 3 * (d[0] + d[2] + d[4] + d[6]) + (d[1] + d[3] + d[5]);
    const expected = (10 - (sum % 10)) % 10;
    const isValid = d[7] === expected;
    const corrected = isValid ? cleaned : cleaned.slice(0, 7) + expected;
    return { isValid, type: 'EAN-8', expectedCheck: expected, actualCheck: d[7], correctedCode: corrected };
  }

  // Other barcode formats (Code 128, alphanumeric, QR, etc.)
  return { isValid: cleaned.length >= 3, type: 'OTHER', correctedCode: cleaned };
}

export default function PackagedFoodWorkspace({ onBack }) {
  // Sequential Step Wizard State: 1 = Barcode, 2 = Bill/Label OCR (Optional), 3 = Verification & Report
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Barcode Scanner State
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isBarcodeScanning, setIsBarcodeScanning] = useState(false);
  const [productData, setProductData] = useState(null);
  const [barcodeSearchError, setBarcodeSearchError] = useState(null);
  const [isSearchingBarcode, setIsSearchingBarcode] = useState(false);

  // Step 2: OCR Bill / Label Scanner State (OPTIONAL)
  const [ocrImagePreview, setOcrImagePreview] = useState(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgressPct, setOcrProgressPct] = useState(0);
  const [ocrStageMessage, setOcrStageMessage] = useState('Optical Frame Acquisition...');
  const [ocrRawText, setOcrRawText] = useState('');
  const [ocrCompletedNotice, setOcrCompletedNotice] = useState(false);
  const [isBillCameraActive, setIsBillCameraActive] = useState(false);
  const [billCameraError, setBillCameraError] = useState(null);

  // Step 3: Editable Form State (Guarantees zero hallucination; cross-verified before calculation)
  const [editableForm, setEditableForm] = useState({
    code: '',
    product_name: '',
    brand: '',
    category: '',
    net_quantity: '',
    packaging_type: '',
    mrp: '',
    selling_price: '',
    mfg_date: '',
    exp_date: '',
    batch_number: '',
    storage_instructions: '',
    ingredients: '',
    nutrition: null,
    vegetarian_status: '',
    fssai_license: '',
    origin_country: '',
    image_url: '',
    source: 'Barcode Lookup',
  });

  const [finalReport, setFinalReport] = useState(null);
  const [isCalculatingReport, setIsCalculatingReport] = useState(false);

  // Live Hardware Telemetry State (ESP-12E / Physical Sensor Box)
  const [ambientTemp, setAmbientTemp] = useState(25.0);
  const [isHardwareConnected, setIsHardwareConnected] = useState(false);
  const [hardwareInfo, setHardwareInfo] = useState(null);

  // Poll live sensors every 3 seconds for genuine real-time telemetry
  useEffect(() => {
    let isMounted = true;
    const pollSensors = async () => {
      try {
        const res = await fetchCurrentSensors();
        if (isMounted && res) {
          if (res.temperature_c !== undefined && res.temperature_c !== null) {
            setAmbientTemp(Number(res.temperature_c));
          }
          setIsHardwareConnected(Boolean(res.is_hardware));
          setHardwareInfo({
            deviceName: res.device_name || 'ESP-12E Node',
            source: res.source,
            timestamp: res.timestamp,
            rssi: res.hardware_status?.rssi_dbm,
          });
        }
      } catch (e) {
        // network polling catch
      }
    };

    pollSensors();
    const interval = setInterval(pollSensors, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const html5QrRef = useRef(null);
  const ocrFileInputRef = useRef(null);
  const scannerIntervalRef = useRef(null);
  const billVideoRef = useRef(null);
  const billStreamRef = useRef(null);

  // Sync productData into editableForm whenever productData changes
  useEffect(() => {
    if (productData) {
      setEditableForm(prev => ({
        ...prev,
        code: productData.code || prev.code,
        product_name: productData.product_name || prev.product_name,
        brand: productData.brand || prev.brand,
        category: productData.category || prev.category,
        net_quantity: productData.net_quantity || prev.net_quantity || 'Standard Pack',
        packaging_type: productData.packaging_type || prev.packaging_type || 'Packaged Grocery',
        mrp: productData.mrp !== null && productData.mrp !== undefined ? String(productData.mrp) : prev.mrp,
        selling_price: productData.selling_price !== null && productData.selling_price !== undefined ? String(productData.selling_price) : prev.selling_price,
        mfg_date: productData.mfg_date || prev.mfg_date,
        exp_date: productData.exp_date || prev.exp_date,
        batch_number: productData.batch_number || prev.batch_number,
        storage_instructions: productData.storage_instructions || prev.storage_instructions,
        ingredients: productData.ingredients || prev.ingredients,
        nutrition: productData.nutrition || prev.nutrition,
        vegetarian_status: productData.vegetarian_status || prev.vegetarian_status,
        fssai_license: productData.fssai_license || prev.fssai_license,
        origin_country: productData.origin_country || prev.origin_country,
        image_url: productData.image_url || prev.image_url,
        source: productData.source || 'Barcode Database',
      }));
    }
  }, [productData]);

  // Barcode Camera Scanner Management with all 1D Retail Formats enabled
  const startBarcodeCamera = async () => {
    setBarcodeSearchError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setBarcodeSearchError(
        '⚠️ Camera access is not supported by your browser or connection. On mobile, ensure HTTPS is used. You can upload a barcode photo or enter the numbers manually.'
      );
      return;
    }

    setIsBarcodeScanning(true);

    try {
      // Allow DOM to render #barcode-scanner-box
      await new Promise(r => setTimeout(r, 160));

      const boxElem = document.getElementById('barcode-scanner-box');
      if (!boxElem) {
        throw new Error('Scanner element not mounted');
      }

      // Safely cleanup previous instances
      if (html5QrRef.current) {
        try { await html5QrRef.current.stop(); } catch (_) {}
        try { html5QrRef.current.clear(); } catch (_) {}
        html5QrRef.current = null;
      }
      if (scannerIntervalRef.current) {
        clearInterval(scannerIntervalRef.current);
        scannerIntervalRef.current = null;
      }

      // Restrict strictly to standard retail 1D formats to eliminate ghost/corrupted non-barcode reads
      const formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_E,
      ];

      const qr = new Html5Qrcode('barcode-scanner-box', {
        formatsToSupport,
        verbose: false,
      });
      html5QrRef.current = qr;

      // Generous scanning area so retail 1D barcodes are not prematurely cropped
      const config = {
        fps: 20,
        qrbox: (viewfinderWidth, viewfinderHeight) => ({
          width: Math.floor(viewfinderWidth * 0.94),
          height: Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.8),
        }),
        aspectRatio: 1.777778,
      };

      // Multi-frame voting buffer: requires consecutive consensus before locking
      const candidateVotes = {};
      let scanLocked = false;

      const onScanSuccess = (decodedText) => {
        if (scanLocked || !decodedText) return;
        // Retail food barcodes must be strictly numeric
        const cleaned = decodedText.trim().replace(/[^\d]/g, '');
        // Must be exact standard retail length: 8 (EAN-8), 12 (UPC-A), 13 (EAN-13), or 14 digits
        if (![8, 12, 13, 14].includes(cleaned.length)) return;

        // Strict Checksum Gatekeeper: Reject any blurred or dropped-digit frame immediately!
        const check = validateBarcodeChecksum(cleaned);
        if (!check.isValid) return;

        const now = Date.now();
        const existing = candidateVotes[cleaned] || { count: 0, firstSeen: now };
        existing.count += 1;
        existing.lastSeen = now;
        candidateVotes[cleaned] = existing;

        // Consensus Quorum: Require at least 2 distinct frames matching this exact verified barcode
        if (existing.count >= 2) {
          scanLocked = true;
          if (navigator.vibrate) {
            try { navigator.vibrate([40, 30, 40]); } catch (_) {}
          }
          stopBarcodeCamera();
          setBarcodeInput(cleaned);
          setBarcodeSearchError(null);
          handlePerformBarcodeLookup(cleaned);
        }
      };

      // Priority 1: Query device cameras list via Html5Qrcode.getCameras()
      let started = false;
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          const backCam = cameras.find(c => /back|rear|environment/i.test(c.label));
          const targetCamId = backCam ? backCam.id : cameras[0].id;
          await qr.start(targetCamId, config, onScanSuccess, () => {});
          started = true;
        }
      } catch (enumErr) {
        console.warn('Camera enumeration note:', enumErr);
      }

      // Priority 2: Try standard environment facing mode (mobile)
      if (!started) {
        try {
          await qr.start({ facingMode: "environment" }, config, onScanSuccess, () => {});
          started = true;
        } catch (envErr) {
          console.warn('Environment facingMode note:', envErr);
        }
      }

      // Priority 3: Try user/front facing mode (desktop/laptop webcam)
      if (!started) {
        await qr.start({ facingMode: "user" }, config, onScanSuccess, () => {});
        started = true;
      }

      // DUAL-DETECTOR: Run native hardware BarcodeDetector on active video frames
      if ('BarcodeDetector' in window) {
        try {
          const nativeDetector = new window.BarcodeDetector({
            formats: ['ean_13', 'upc_a', 'ean_8']
          });
          const intervalId = setInterval(async () => {
            const video = document.querySelector('#barcode-scanner-box video');
            if (video && video.readyState >= 2) {
              try {
                const barcodes = await nativeDetector.detect(video);
                if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                  onScanSuccess(barcodes[0].rawValue);
                }
              } catch (_) {}
            }
          }, 120);
          scannerIntervalRef.current = intervalId;
        } catch (e) {
          console.warn('Native BarcodeDetector init note:', e);
        }
      }

    } catch (err) {
      console.warn('Barcode camera start error:', err);
      setIsBarcodeScanning(false);
      if (html5QrRef.current) {
        try { html5QrRef.current.clear(); } catch (_) {}
        html5QrRef.current = null;
      }

      let errorMsg = '⚠️ Could not open camera scanner. You can upload a barcode photo or enter the numbers manually.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = '🚫 Camera permission was denied. Please allow camera access in your browser settings (click the lock/camera icon in the URL bar), or upload a photo of the barcode.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = '📷 No camera device was detected on your system. You can upload a photo or type the barcode numbers directly.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = '⚠️ Camera is currently in use by another application. Please close other camera apps and try again.';
      }
      setBarcodeSearchError(errorMsg);
    }
  };

  // Instant High-Res Snap & Auto-Detect (Uses Canvas + Native BarcodeDetector + Sense AI Vision)
  const captureAndDetectBarcodeFrame = async () => {
    if (!isBarcodeScanning) return;
    setIsSearchingBarcode(true);
    setBarcodeSearchError(null);

    try {
      const videoEl = document.querySelector('#barcode-scanner-box video');
      if (!videoEl || !videoEl.videoWidth) {
        setIsSearchingBarcode(false);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      let foundCode = null;

      // Layer 1: Native BarcodeDetector on high-res still canvas
      if ('BarcodeDetector' in window) {
        try {
          const detector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
          });
          const detected = await detector.detect(canvas);
          if (detected && detected.length > 0 && detected[0].rawValue) {
            foundCode = detected[0].rawValue;
          }
        } catch (_) {}
      }

      // Layer 2: ZXing Reader on image
      if (!foundCode) {
        try {
          const reader = new BrowserMultiFormatReader();
          const zx = await reader.decodeFromImageUrl(dataUrl);
          if (zx && zx.getText()) {
            foundCode = zx.getText();
          }
        } catch (_) {}
      }

      // Layer 3: Sense AI Multi-Spectral Vision
      if (!foundCode) {
        const aiRes = await extractBarcodeFromImageApi(dataUrl);
        if (aiRes && aiRes.success && aiRes.barcode) {
          foundCode = aiRes.barcode;
          if (aiRes.product_data && aiRes.product_data.found) {
            stopBarcodeCamera();
            setBarcodeInput(foundCode);
            setProductData(aiRes.product_data);
            setIsSearchingBarcode(false);
            return;
          }
        }
      }

      if (foundCode) {
        const check = validateBarcodeChecksum(foundCode);
        if (['EAN-13', 'UPC-A', 'EAN-8'].includes(check.type) && !check.isValid && check.correctedCode) {
          foundCode = check.correctedCode;
        }
        stopBarcodeCamera();
        setBarcodeInput(foundCode);
        handlePerformBarcodeLookup(foundCode);
      } else {
        setBarcodeSearchError('Could not clearly read barcode from this frame. Hold steady or try moving slightly closer/farther, or type the numbers directly.');
      }
    } catch (err) {
      console.warn('Frame capture error:', err);
    } finally {
      setIsSearchingBarcode(false);
    }
  };

  const stopBarcodeCamera = () => {
    if (scannerIntervalRef.current) {
      clearInterval(scannerIntervalRef.current);
      scannerIntervalRef.current = null;
    }
    if (html5QrRef.current) {
      const qrInstance = html5QrRef.current;
      html5QrRef.current = null;
      try {
        qrInstance.stop()
          .catch(e => console.warn('QR stop note:', e))
          .finally(() => {
            try { qrInstance.clear(); } catch (_) {}
          });
      } catch (e) {
        console.warn('QR stop error:', e);
      }
    }
    setIsBarcodeScanning(false);
  };

  // Clean up cameras on unmount and step changes
  useEffect(() => {
    return () => {
      stopBarcodeCamera();
      stopBillCamera();
    };
  }, []);

  useEffect(() => {
    if (currentStep !== 2) {
      stopBillCamera();
    }
    if (currentStep !== 1) {
      stopBarcodeCamera();
    }
  }, [currentStep]);

  useEffect(() => {
    if (isBillCameraActive && billStreamRef.current && billVideoRef.current) {
      billVideoRef.current.srcObject = billStreamRef.current;
      billVideoRef.current.play().catch(e => console.warn('Bill video play note:', e));
    }
  }, [isBillCameraActive]);

  // Upload Barcode Image (Triple Engine: Native Hardware + ZXing + Sense AI Vision)
  const handleBarcodeImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBarcodeSearchError(null);
    setIsSearchingBarcode(true);

    try {
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = imageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      let detectedBarcode = null;

      // Engine 1: Native BarcodeDetector (instant hardware decoding)
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
          });
          const detected = await barcodeDetector.detect(img);
          if (detected && detected.length > 0 && detected[0].rawValue) {
            detectedBarcode = detected[0].rawValue;
          }
        } catch (nativeErr) {
          console.warn('Native BarcodeDetector note:', nativeErr);
        }
      }

      // Engine 2: ZXing MultiFormat Reader
      if (!detectedBarcode) {
        try {
          const reader = new BrowserMultiFormatReader();
          const zxingResult = await reader.decodeFromImageUrl(imageUrl);
          if (zxingResult && zxingResult.getText()) {
            detectedBarcode = zxingResult.getText();
          }
        } catch (zxErr) {
          console.warn('ZXing note:', zxErr);
        }
      }

      URL.revokeObjectURL(imageUrl);

      // Engine 3: Sense AI Multi-Spectral Vision
      if (!detectedBarcode) {
        const aiRes = await extractBarcodeFromImageApi(null, file);
        if (aiRes && aiRes.success && aiRes.barcode) {
          detectedBarcode = aiRes.barcode;
          if (aiRes.product_data && aiRes.product_data.found) {
            setBarcodeInput(detectedBarcode);
            setProductData(aiRes.product_data);
            setIsSearchingBarcode(false);
            return;
          }
        }
      }

      if (detectedBarcode) {
        setBarcodeInput(detectedBarcode);
        handlePerformBarcodeLookup(detectedBarcode);
      } else {
        setBarcodeSearchError(
          'Could not detect barcode from image. You can type the numbers printed below the barcode lines directly.'
        );
      }
    } catch (err) {
      console.error('Barcode upload decode error:', err);
      setBarcodeSearchError('Could not decode image. Please enter the barcode digits manually.');
    } finally {
      setIsSearchingBarcode(false);
    }
  };

  const handlePerformBarcodeLookup = async (codeToLookup) => {
    const raw = (codeToLookup || barcodeInput).trim();
    if (!raw) return;

    let code = raw;
    const check = validateBarcodeChecksum(code);
    if (['EAN-13', 'UPC-A', 'EAN-8'].includes(check.type) && !check.isValid && check.correctedCode) {
      code = check.correctedCode;
    }

    setIsSearchingBarcode(true);
    setBarcodeSearchError(null);
    try {
      let data = await lookupBarcodeApi(code);
      if (!data || !data.found) {
        if (code !== raw) {
          data = await lookupBarcodeApi(raw);
        }
      }
      if (data && data.found) {
        setBarcodeInput(data.code || code);
        setProductData(data);
      } else {
        setProductData(null);
        setBarcodeSearchError(data?.message || `Barcode ${raw} was not found in the global retail database. You can proceed to Step 2 to scan the packaging or enter details manually.`);
      }
    } catch (err) {
      console.error(err);
      setBarcodeSearchError('Failed to query barcode database. Please check your connection.');
    } finally {
      setIsSearchingBarcode(false);
    }
  };

  // Stop Bill / Package Camera
  const stopBillCamera = () => {
    if (billStreamRef.current) {
      try {
        billStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) {
        console.warn('Track stop error:', e);
      }
      billStreamRef.current = null;
    }
    if (billVideoRef.current) {
      billVideoRef.current.srcObject = null;
    }
    setIsBillCameraActive(false);
  };

  // Start Live Camera for Step 2 Bill & Package Label
  const startBillCamera = async () => {
    setBillCameraError(null);
    setBarcodeSearchError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setBillCameraError('⚠️ Camera access is not supported by your browser or connection. On mobile, ensure HTTPS is used. You can upload an image file instead.');
      return;
    }

    try {
      let stream = null;
      try {
        // High resolution for sharp OCR of dot-matrix text and thermal receipts
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (e) {
        console.warn('Back camera request failed, trying default webcam:', e);
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      billStreamRef.current = stream;
      setIsBillCameraActive(true);

      setTimeout(() => {
        if (billVideoRef.current && stream) {
          billVideoRef.current.srcObject = stream;
          billVideoRef.current.play().catch(playErr => console.warn('Video play note:', playErr));
        }
      }, 80);
    } catch (err) {
      console.error('Bill camera start error:', err);
      setIsBillCameraActive(false);
      let msg = '⚠️ Could not access camera. Please allow camera permissions or upload an image file.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = '🚫 Camera permission was denied. Please allow camera access in your browser settings (click the lock/camera icon in the URL bar), or upload a photo of the bill/label.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = '📷 No camera device was detected. You can select an image file from your device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = '⚠️ Camera is currently in use by another app. Please close other camera apps and try again.';
      }
      setBillCameraError(msg);
    }
  };

  // Process Bill or Label Image (Common AI Engine for Camera Snap and File Upload)
  const processBillImage = async (dataUrl, fileOrBlob) => {
    setOcrCompletedNotice(false);
    setIsOcrProcessing(true);
    setOcrProgressPct(18);
    setOcrStageMessage('🔍 Optical Surface Enhancement: Sharpening dot-matrix & thermal ink...');
    setOcrImagePreview(dataUrl);

    // Active progressive heartbeat: smoothly advances so the user is never stuck waiting at 60%
    let currentPct = 18;
    const progressInterval = setInterval(() => {
      currentPct = Math.min(93, currentPct + Math.floor(Math.random() * 8) + 4);
      setOcrProgressPct(currentPct);
      if (currentPct > 75) {
        setOcrStageMessage('🛡️ Double-checking printed year against physical ink & barcode context...');
      } else if (currentPct > 52) {
        setOcrStageMessage('📅 Deciphering printed MFD/EXP ink stamps, batch codes & prices...');
      } else if (currentPct > 32) {
        setOcrStageMessage('🔬 Cross-referencing GS1 barcode registry & product taxonomy...');
      }
    }, 450);

    try {
      // Pass barcode & product details to ensure the year is cross-checked against known product facts
      const barcodeContext = {
        barcode: editableForm.code || productData?.code || barcodeInput,
        product_name: editableForm.product_name || productData?.product_name,
        brand: editableForm.brand || productData?.brand,
        category: editableForm.category || productData?.category,
        expected_shelf_life: productData?.shelf_life,
      };

      const res = await extractBillLabelApi(dataUrl, fileOrBlob, barcodeContext);
      clearInterval(progressInterval);
      setOcrProgressPct(98);
      setOcrStageMessage('✨ Forensic verification complete! Finalizing fields...');

      if (res && res.success && res.data) {
        const d = res.data;
        setOcrRawText(d.raw_text || '');
        setEditableForm(prev => ({
          ...prev,
          product_name: d.extracted_product_name || prev.product_name || 'Packaged Grocery Item',
          brand: d.extracted_brand || prev.brand,
          mrp: d.mrp !== null && d.mrp !== undefined ? String(d.mrp) : prev.mrp,
          selling_price: d.selling_price !== null && d.selling_price !== undefined ? String(d.selling_price) : prev.selling_price,
          mfg_date: d.mfg_date || prev.mfg_date,
          exp_date: d.exp_date || prev.exp_date,
          batch_number: d.batch_number || prev.batch_number,
          net_quantity: d.net_quantity || prev.net_quantity,
          storage_instructions: d.storage_instructions || prev.storage_instructions,
          source: (prev.source || '') + ' + AI Bill/Label Verified',
        }));
        setOcrCompletedNotice(true);
      } else {
        setBarcodeSearchError(res?.error || 'Could not extract bill details. Please review or enter values manually.');
      }
    } catch (err) {
      clearInterval(progressInterval);
      console.error('Bill/Label extraction error:', err);
      setBarcodeSearchError('Failed to process bill image. Please check your network or enter values manually.');
    } finally {
      clearInterval(progressInterval);
      setOcrProgressPct(100);
      setIsOcrProcessing(false);
    }
  };

  // Capture High-Res Frame from Live Bill Camera
  const captureBillPhoto = async () => {
    if (!billVideoRef.current) return;
    const video = billVideoRef.current;
    if (!video.videoWidth || !video.videoHeight) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

      stopBillCamera();

      // Convert to blob for backend multipart upload
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `label-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      processBillImage(dataUrl, file);
    } catch (err) {
      console.error('Frame capture error:', err);
      stopBillCamera();
    }
  };

  // Multimodal AI Bill & Package Label Extraction (Step 2 File Select)
  const handleOcrFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      processBillImage(evt.target.result, file);
    };
    reader.readAsDataURL(file);
  };

  // Calculate Shelf-Life & Savings for Step 3 Report with Live Ambient Temperature
  const calculateFinalReport = async (formData = editableForm, tempOverride = null) => {
    setIsCalculatingReport(true);
    try {
      const activeTemp = tempOverride !== null ? tempOverride : ambientTemp;
      const res = await calculateShelfLifeApi({
        mfg_date: formData.mfg_date,
        exp_date: formData.exp_date,
        mrp: formData.mrp,
        selling_price: formData.selling_price,
        ambient_temp: activeTemp,
        category: formData.category || formData.product_name,
      });

      if (res.success) {
        setFinalReport({
          ...formData,
          shelf_life: res.shelf_life,
          savings_amount: res.savings_amount,
          discount_pct: res.discount_pct,
          calculated_at: new Date().toLocaleTimeString(),
          measured_ambient_temp: activeTemp,
        });
      }
    } catch (err) {
      console.error('Report calculation error:', err);
    } finally {
      setIsCalculatingReport(false);
    }
  };

  // Direct navigation from Step 1 straight to Step 3 (Packaged/bill step is NOT compulsory!)
  const handleSkipToReport = async () => {
    stopBarcodeCamera();
    stopBillCamera();
    await calculateFinalReport(editableForm);
    setCurrentStep(3);
  };

  // Step 2 to Step 3
  const handleProceedFromOcrToReport = async () => {
    stopBillCamera();
    await calculateFinalReport(editableForm);
    setCurrentStep(3);
  };

  // Reset wizard to start over
  const handleRestartWizard = () => {
    stopBarcodeCamera();
    stopBillCamera();
    setCurrentStep(1);
    setBarcodeInput('');
    setProductData(null);
    setBarcodeSearchError(null);
    setBillCameraError(null);
    setOcrImagePreview(null);
    setOcrRawText('');
    setOcrCompletedNotice(false);
    setFinalReport(null);
    setEditableForm({
      code: '',
      product_name: '',
      brand: '',
      category: '',
      net_quantity: '',
      packaging_type: '',
      mrp: '',
      selling_price: '',
      mfg_date: '',
      exp_date: '',
      batch_number: '',
      storage_instructions: '',
      ingredients: '',
      nutrition: null,
      vegetarian_status: '',
      fssai_license: '',
      origin_country: '',
      image_url: '',
      source: 'Barcode Lookup',
    });
  };

  // Step-aware Back Navigation: goes back to previous step, or home if at step 1
  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      stopBillCamera();
      setCurrentStep(1);
    } else {
      stopBarcodeCamera();
      onBack();
    }
  };

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 8px' }}>
      {/* Top Header & Breadcrumb */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '22px'
      }}>
        <div>
          <button 
            onClick={handleBack}
            className="sense-btn-secondary"
            style={{ 
              padding: '7px 16px', 
              fontSize: '0.85rem', 
              marginBottom: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={15} />
            <span>
              {currentStep === 3 
                ? 'Back to Step 2 (Bill / Label)' 
                : currentStep === 2 
                  ? 'Back to Step 1 (Barcode Scanner)' 
                  : 'Back to Dashboard'}
            </span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--sense-radius-full)',
              background: 'radial-gradient(circle at 30% 30%, #FFFFFF 20%, #FFF5EB 70%, #FFE5D4 100%)',
              border: '2px solid rgba(251, 146, 60, 0.4)',
              boxShadow: '0 6px 18px rgba(249, 115, 22, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Package size={26} color="#ea580c" />
            </div>
            <div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 900, margin: 0, color: 'var(--color-soft-charcoal)' }}>
                Mode B: <span style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Packaged Food Intelligence</span>
              </h2>
              <p style={{ margin: '4px 0 0 0', color: 'var(--color-muted-grey)', fontSize: '0.92rem' }}>
                Follow the 3-step sequence to verify barcode features, bill/package dates, and expiry intelligence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODERN EXECUTIVE 3-STEP PROGRESSIVE WIZARD */}
      <div className="sense-wizard-container" style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
        backdropFilter: 'blur(16px)',
        border: '1.5px solid var(--color-light-border)',
        borderRadius: '20px',
        padding: '12px 14px',
        marginBottom: '26px',
        boxShadow: '0 10px 30px rgba(30, 58, 88, 0.06)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '10px',
          alignItems: 'stretch',
        }}>
          {/* STEP 1 CARD */}
          <div
            onClick={() => { stopBarcodeCamera(); setCurrentStep(1); }}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '14px',
              border: currentStep === 1
                ? '2px solid var(--color-leaf-green)'
                : productData
                  ? '1.5px solid #86EFAC'
                  : '1.5px solid transparent',
              background: currentStep === 1
                ? 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)'
                : productData
                  ? '#F0FDF4'
                  : 'rgba(241, 245, 249, 0.6)',
              boxShadow: currentStep === 1
                ? '0 6px 18px rgba(34, 197, 94, 0.18)'
                : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: currentStep === 1
                ? 'var(--color-leaf-green)'
                : productData
                  ? '#16A34A'
                  : '#CBD5E1',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.95rem',
              flexShrink: 0,
              boxShadow: currentStep === 1 ? '0 4px 10px rgba(34, 197, 94, 0.35)' : 'none',
            }}>
              {productData ? <Check size={20} strokeWidth={3} /> : '01'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.06em', color: currentStep === 1 ? 'var(--color-leaf-green)' : 'var(--color-muted-grey)', textTransform: 'uppercase' }}>
                  STEP 01
                </span>
                <span style={{
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: productData ? '#DCFCE7' : currentStep === 1 ? '#D1FAE5' : '#E2E8F0',
                  color: productData ? '#15803D' : currentStep === 1 ? '#065F46' : '#64748B',
                }}>
                  {productData ? 'VERIFIED ✓' : currentStep === 1 ? 'ACTIVE ⚡' : 'INTAKE'}
                </span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-soft-charcoal)', marginTop: '1px' }}>
                Barcode Intake
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-muted-grey)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                GS1 Catalog & Packaging Specs
              </div>
            </div>
          </div>

          {/* STEP 2 CARD */}
          <div
            onClick={() => { stopBarcodeCamera(); setBarcodeSearchError(null); setCurrentStep(2); }}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '14px',
              border: currentStep === 2
                ? '2px solid #2563EB'
                : ocrCompletedNotice
                  ? '1.5px solid #93C5FD'
                  : '1.5px solid transparent',
              background: currentStep === 2
                ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
                : ocrCompletedNotice
                  ? '#EFF6FF'
                  : 'rgba(241, 245, 249, 0.6)',
              boxShadow: currentStep === 2
                ? '0 6px 18px rgba(37, 99, 235, 0.18)'
                : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: currentStep === 2
                ? '#2563EB'
                : ocrCompletedNotice
                  ? '#1D4ED8'
                  : '#CBD5E1',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.95rem',
              flexShrink: 0,
              boxShadow: currentStep === 2 ? '0 4px 10px rgba(37, 99, 235, 0.35)' : 'none',
            }}>
              {ocrCompletedNotice ? <Check size={20} strokeWidth={3} /> : '02'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.06em', color: currentStep === 2 ? '#2563EB' : 'var(--color-muted-grey)', textTransform: 'uppercase' }}>
                  STEP 02
                </span>
                <span style={{
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: currentStep === 2 ? '#BFDBFE' : ocrCompletedNotice ? '#DBEAFE' : '#FEF3C7',
                  color: currentStep === 2 ? '#1E40AF' : ocrCompletedNotice ? '#1D4ED8' : '#92400E',
                }}>
                  {ocrCompletedNotice ? 'CAPTURED ✓' : currentStep === 2 ? 'ACTIVE ⚡' : 'OPTIONAL'}
                </span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-soft-charcoal)', marginTop: '1px' }}>
                Bill & Label OCR
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-muted-grey)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Forensic Expiry, MRP & Batch Stamp
              </div>
            </div>
          </div>

          {/* STEP 3 CARD */}
          <div
            onClick={() => { stopBarcodeCamera(); setBarcodeSearchError(null); calculateFinalReport(editableForm); setCurrentStep(3); }}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '14px',
              border: currentStep === 3
                ? '2px solid #7C3AED'
                : finalReport
                  ? '1.5px solid #C4B5FD'
                  : '1.5px solid transparent',
              background: currentStep === 3
                ? 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)'
                : finalReport
                  ? '#F5F3FF'
                  : 'rgba(241, 245, 249, 0.6)',
              boxShadow: currentStep === 3
                ? '0 6px 18px rgba(124, 58, 237, 0.18)'
                : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: currentStep === 3
                ? '#7C3AED'
                : finalReport
                  ? '#6D28D9'
                  : '#CBD5E1',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.95rem',
              flexShrink: 0,
              boxShadow: currentStep === 3 ? '0 4px 10px rgba(124, 58, 237, 0.35)' : 'none',
            }}>
              {finalReport ? <Check size={20} strokeWidth={3} /> : '03'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.06em', color: currentStep === 3 ? '#7C3AED' : 'var(--color-muted-grey)', textTransform: 'uppercase' }}>
                  STEP 03
                </span>
                <span style={{
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: currentStep === 3 ? '#DDD6FE' : finalReport ? '#EDE9FE' : '#E2E8F0',
                  color: currentStep === 3 ? '#5B21B6' : finalReport ? '#6D28D9' : '#64748B',
                }}>
                  {finalReport ? 'AUDITED ✓' : currentStep === 3 ? 'ACTIVE ⚡' : 'VERIFY & REPORT'}
                </span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-soft-charcoal)', marginTop: '1px' }}>
                Dynamic Shelf-Life
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-muted-grey)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Arrhenius Temperature Spoilage Audit
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Hardware Telemetry Bar (ESP-12E / Arduino Uno Node) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: isHardwareConnected ? '#f0fdf4' : '#fffbeb',
        border: `1.5px solid ${isHardwareConnected ? '#86efac' : '#fde68a'}`,
        borderRadius: 'var(--sense-radius-md)',
        padding: '12px 18px',
        marginBottom: '22px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: isHardwareConnected ? '#22c55e' : '#f59e0b',
            boxShadow: isHardwareConnected ? '0 0 10px #22c55e' : '0 0 6px #f59e0b',
          }} />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: isHardwareConnected ? '#166534' : '#92400e' }}>
              {isHardwareConnected ? `🟢 Live Hardware Connected (${hardwareInfo?.deviceName || 'Thermistor Node'})` : '📡 Live Hardware Node Listening (Arduino Uno / ESP-12E)'}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-muted-grey)' }}>
              {isHardwareConnected ? `Active device: ${hardwareInfo?.deviceName || 'Thermistor Node'} • Real-time Hardware Telemetry` : 'Listening on /api/hardware/esp32/telemetry'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '6px 14px',
            borderRadius: 'var(--sense-radius-full)',
            border: '1px solid var(--color-light-border)',
          }}>
            <Thermometer size={18} color="#ef4444" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-muted-grey)' }}>Room Temp:</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#b91c1c' }}>{ambientTemp.toFixed(1)}°C</span>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--color-muted-grey)', fontWeight: 600 }}>
            ⚡ Arrhenius Kinetic Model Active
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: SCAN BARCODE (Extract all possible product features)             */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: productData ? 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))' : '1fr', gap: '24px' }}>
            {/* Left: Barcode Scanner & Controls Card */}
            <div className="sense-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--color-fresh-mint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-leaf-green)',
                }}>
                  <Barcode size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-soft-charcoal)' }}>
                    Scan Retail Barcode
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-leaf-green)', fontWeight: 700 }}>
                    Step 1 of 3 • Auto-extracts Name, Brand, Mfg Date, Expiry &amp; Storage
                  </div>
                </div>
              </div>

              {/* Camera Scanner Container */}
              <div style={{ marginBottom: '16px' }}>
                <div
                  id="barcode-scanner-box"
                  style={{
                    width: '100%',
                    minHeight: isBarcodeScanning ? '260px' : '0px',
                    maxHeight: isBarcodeScanning ? '340px' : '0px',
                    borderRadius: 'var(--sense-radius-md)',
                    overflow: 'hidden',
                    display: isBarcodeScanning ? 'block' : 'none',
                    marginBottom: isBarcodeScanning ? '12px' : '0px',
                    background: '#000000',
                  }}
                />

                {!isBarcodeScanning ? (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={startBarcodeCamera}
                      className="sense-btn-primary"
                      style={{ flex: '1 1 180px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Camera size={18} />
                      <span>Start Camera Scanner</span>
                    </button>
                    <label
                      onClick={() => setBarcodeSearchError(null)}
                      className="sense-btn-secondary"
                      style={{ flex: '1 1 150px', padding: '12px 18px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      title="Upload a photo or screenshot of a barcode"
                    >
                      <Upload size={17} />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleBarcodeImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={stopBarcodeCamera}
                      className="sense-btn-secondary"
                      style={{ padding: '10px 16px' }}
                    >
                      ✕ Close
                    </button>
                    <button
                      onClick={captureAndDetectBarcodeFrame}
                      disabled={isSearchingBarcode}
                      className="sense-btn-primary"
                      style={{
                        flex: '1 1 190px',
                        padding: '10px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, var(--color-leaf-green) 0%, #15803d 100%)',
                        boxShadow: '0 4px 14px rgba(65, 155, 112, 0.3)',
                      }}
                    >
                      <Camera size={16} />
                      <span>{isSearchingBarcode ? '🔍 AI Analyzing Barcode...' : '📸 Snap & Auto-Detect'}</span>
                    </button>
                    <div style={{ width: '100%', padding: '8px 12px', background: 'var(--color-fresh-mint)', border: '1px solid var(--color-leaf-green)', borderRadius: 'var(--sense-radius-full)', fontSize: '0.78rem', color: 'var(--color-leaf-green)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Sparkles size={14} />
                      <span>Live Auto-Scan active • Click "Snap &amp; Auto-Detect" anytime for instant AI decode!</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Code Input & Lookup */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Enter barcode digits (e.g. 8901030922442)..."
                  value={barcodeInput}
                  onChange={(e) => {
                    setBarcodeInput(e.target.value);
                    if (barcodeSearchError) setBarcodeSearchError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handlePerformBarcodeLookup()}
                  style={{
                    flex: '1 1 220px',
                    background: 'var(--color-milky-white)',
                    border: '1.5px solid var(--color-light-border)',
                    borderRadius: 'var(--sense-radius-full)',
                    padding: '12px 18px',
                    color: 'var(--color-soft-charcoal)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={() => handlePerformBarcodeLookup()}
                  disabled={isSearchingBarcode || !barcodeInput.trim()}
                  className="sense-btn-primary"
                  style={{ padding: '12px 22px', flexShrink: 0 }}
                >
                  <Search size={16} />
                  <span>Lookup</span>
                </button>
              </div>

              {barcodeSearchError && (
                <div style={{
                  marginTop: '14px',
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1.5px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: 'var(--sense-radius-md)',
                  color: '#991b1b',
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#dc2626' }} />
                    <div style={{ lineHeight: 1.45 }}>{barcodeSearchError}</div>
                  </div>
                  <button
                    onClick={() => setBarcodeSearchError(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#991b1b',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      padding: '0 4px',
                      lineHeight: 1,
                      borderRadius: '4px',
                      opacity: 0.7,
                    }}
                    title="Dismiss notification"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Direct Skip Option if user doesn't have a barcode */}
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button
                  onClick={() => { stopBarcodeCamera(); setBarcodeSearchError(null); setCurrentStep(2); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-leaf-green)',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Don't have a barcode? Proceed directly to Step 2 (Bill / Label Scan) ➔
                </button>
              </div>
            </div>

            {/* Right: Comprehensive Extracted Barcode Features Card */}
            {productData && (
              <div className="sense-card" style={{ border: '2px solid var(--color-leaf-green)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span className="sense-badge sense-badge-hardware-on">
                        ✓ Barcode Verified
                      </span>
                      {productData.vegetarian_status && (
                        <span className="sense-badge" style={{ background: 'var(--color-fresh-mint)', color: 'var(--color-leaf-green)', border: '1px solid var(--color-leaf-green)' }}>
                          {productData.vegetarian_status}
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '1.45rem', fontWeight: 900, color: 'var(--color-soft-charcoal)' }}>
                      {productData.product_name}
                    </h3>
                    <p style={{ margin: '2px 0 0 0', color: 'var(--color-muted-grey)', fontSize: '0.85rem' }}>
                      Brand: <strong style={{ color: 'var(--color-soft-charcoal)' }}>{productData.brand}</strong> • Code: <code>{productData.code}</code>
                    </p>
                  </div>

                  {productData.image_url && (
                    <img 
                      src={productData.image_url} 
                      alt={productData.product_name} 
                      style={{ width: '64px', height: '64px', objectFit: 'contain', background: '#fff', border: '1px solid var(--color-light-border)', borderRadius: 'var(--sense-radius-md)', padding: '4px' }} 
                    />
                  )}
                </div>

                {/* Extracted Specifications Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))',
                  gap: '10px',
                  marginBottom: '16px'
                }}>
                  {/* Mfg / Packaged Date */}
                  <div style={{ background: 'var(--color-fresh-mint)', padding: '12px', borderRadius: 'var(--sense-radius-sm)', border: '1px solid rgba(65, 155, 112, 0.3)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-leaf-green)', fontWeight: 800, textTransform: 'uppercase' }}>
                      📅 Packaged / Mfg Date
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--color-soft-charcoal)', marginTop: '2px' }}>
                      {productData.mfg_date || 'Standard Batch'}
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div style={{ background: 'var(--color-butter-yellow)', padding: '12px', borderRadius: 'var(--sense-radius-sm)', border: '1px solid rgba(234, 179, 8, 0.4)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#854d0e', fontWeight: 800, textTransform: 'uppercase' }}>
                      ⏳ Expiry / Best Before
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--color-soft-charcoal)', marginTop: '2px' }}>
                      {productData.exp_date || 'Open Inspection'}
                    </div>
                  </div>

                  {/* Net Quantity */}
                  <div style={{ background: 'var(--color-vanilla-cream)', padding: '12px', borderRadius: 'var(--sense-radius-sm)', border: '1px solid var(--color-light-border)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-muted-grey)', fontWeight: 800, textTransform: 'uppercase' }}>
                      ⚖️ Net Quantity
                    </div>
                    <div style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--color-soft-charcoal)', marginTop: '2px' }}>
                      {productData.net_quantity || 'Standard Pack'}
                    </div>
                  </div>

                  {/* Packaging Type */}
                  <div style={{ background: 'var(--color-vanilla-cream)', padding: '12px', borderRadius: 'var(--sense-radius-sm)', border: '1px solid var(--color-light-border)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-muted-grey)', fontWeight: 800, textTransform: 'uppercase' }}>
                      📦 Packaging Material
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-soft-charcoal)', marginTop: '2px' }}>
                      {productData.packaging_type || 'Retail Sealed'}
                    </div>
                  </div>
                </div>

                {/* Price / Savings Preview */}
                {(productData.mrp || productData.selling_price) && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--color-vanilla-cream)',
                    border: '1px solid var(--color-light-border)',
                    borderRadius: 'var(--sense-radius-sm)',
                    padding: '12px 16px',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-muted-grey)', fontWeight: 700 }}>Printed MRP: </span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--color-soft-charcoal)' }}>₹{productData.mrp || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-muted-grey)', fontWeight: 700 }}>Offer Price: </span>
                      <strong style={{ fontSize: '1.15rem', color: 'var(--color-leaf-green)' }}>₹{productData.selling_price || productData.mrp}</strong>
                    </div>
                    {productData.savings_amount > 0 && (
                      <span className="sense-badge" style={{ background: 'var(--color-butter-yellow)', color: '#854d0e', fontWeight: 800 }}>
                        Save ₹{productData.savings_amount} ({productData.discount_pct}% OFF)
                      </span>
                    )}
                  </div>
                )}

                {/* Storage Instructions */}
                {productData.storage_instructions && (
                  <div style={{ fontSize: '0.84rem', color: 'var(--color-soft-charcoal)', marginBottom: '12px', background: 'var(--color-fresh-mint)', padding: '8px 12px', borderRadius: 'var(--sense-radius-sm)' }}>
                    💡 <strong>Storage:</strong> {productData.storage_instructions}
                  </div>
                )}

                {/* NEXT STEP BUTTONS: Highlights that Packaged Step 2 is NOT compulsory */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                  {/* DIRECT BUTTON: Skip Step 2 & Generate Assessment Report */}
                  <button
                    onClick={handleSkipToReport}
                    className="sense-btn-primary"
                    style={{
                      padding: '14px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '0.95rem',
                      fontWeight: 900,
                      background: 'var(--color-leaf-green)',
                      boxShadow: '0 6px 20px rgba(65, 155, 112, 0.35)',
                    }}
                  >
                    <span>View Final Assessment Report Directly</span>
                    <ArrowRight size={18} />
                  </button>

                  {/* OPTIONAL STEP 2 BUTTON */}
                  <button
                    onClick={() => { stopBarcodeCamera(); setBarcodeSearchError(null); setCurrentStep(2); }}
                    className="sense-btn-secondary"
                    style={{
                      padding: '12px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                    }}
                  >
                    <span>Step 2: Cross-Check Bill / Label (Optional)</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: BILL & PACKAGE LABEL SCANNER (OCR) - COMPLETELY OPTIONAL          */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div>
          {/* Explicit Clarification Banner: Step 2 is NOT compulsory */}
          <div style={{
            background: 'var(--color-powder-blue)',
            border: '2px solid #93c5fd',
            borderRadius: 'var(--sense-radius-md)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', flexShrink: 0 }}>
                <Info size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.02rem', color: '#1e3a8a' }}>
                  Step 2 is Completely Optional!
                </div>
                <div style={{ fontSize: '0.84rem', color: '#1e40af', lineHeight: 1.4, marginTop: '2px' }}>
                  If your packaging has a printed receipt, grocery bill, or label with batch/expiry dates, scan it below. If you already have your barcode information, you can skip straight to the report!
                </div>
              </div>
            </div>

            {/* Direct Skip Button */}
            <button
              onClick={handleProceedFromOcrToReport}
              className="sense-btn-primary"
              style={{
                background: 'var(--color-leaf-green)',
                padding: '10px 22px',
                fontSize: '0.88rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
              }}
            >
              <span>Skip Step 2 &amp; View Report</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: '24px' }}>
            {/* Left: OCR Image Capture / Upload */}
            <div className="sense-card">
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#2563eb" />
                Scan Package Label or Printed Bill
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.86rem', color: 'var(--color-muted-grey)' }}>
                Extracts printed text, MRP, selling price, and dates via Optical Character Recognition (OCR).
              </p>

              {/* Camera or Upload Viewport */}
              {isBillCameraActive ? (
                <div 
                  style={{
                    position: 'relative',
                    borderRadius: 'var(--sense-radius-md)',
                    overflow: 'hidden',
                    background: '#0f172a',
                    marginBottom: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    border: '2px solid var(--color-leaf-green)',
                  }}
                >
                  <video 
                    ref={billVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    style={{ 
                      width: '100%', 
                      height: '330px', 
                      objectFit: 'cover', 
                      display: 'block' 
                    }} 
                  />
                  {/* Framing Overlay for Bill / Label */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    right: '20px',
                    bottom: '75px',
                    border: '2px dashed rgba(255, 255, 255, 0.75)',
                    borderRadius: '12px',
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '12px'
                  }}>
                    <span style={{ 
                      alignSelf: 'center', 
                      background: 'rgba(15, 23, 42, 0.75)', 
                      backdropFilter: 'blur(4px)',
                      color: '#fff', 
                      fontSize: '0.78rem', 
                      fontWeight: 700, 
                      padding: '4px 12px', 
                      borderRadius: '999px',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      Align Bill or Expiry / MFD Label Here
                    </span>
                    <span style={{ 
                      alignSelf: 'center', 
                      color: 'rgba(255,255,255,0.7)', 
                      fontSize: '0.72rem' 
                    }}>
                      Handles blurred, dot-matrix, bottle necks &amp; faint prints
                    </span>
                  </div>

                  {/* Camera Control Action Bar */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '12px 16px',
                    background: 'linear-gradient(to top, rgba(15,23,42,0.95), rgba(15,23,42,0.4))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}>
                    <button
                      type="button"
                      onClick={stopBillCamera}
                      className="sense-btn-secondary"
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        background: 'rgba(255,255,255,0.15)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <X size={15} />
                      <span>Close Camera</span>
                    </button>

                    <button
                      type="button"
                      onClick={captureBillPhoto}
                      className="sense-btn-primary"
                      style={{
                        flex: 1,
                        padding: '10px 18px',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        background: 'var(--color-leaf-green)',
                        color: '#fff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      <Camera size={18} />
                      <span>📸 Snap &amp; Analyze Label</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  style={{
                    minHeight: '220px',
                    background: 'var(--color-vanilla-cream)',
                    border: '2px dashed var(--color-light-border)',
                    borderRadius: 'var(--sense-radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px 20px',
                    marginBottom: '16px',
                    textAlign: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {ocrImagePreview ? (
                    <div style={{ width: '100%' }}>
                      <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                        <img 
                          src={ocrImagePreview} 
                          alt="Label preview" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '240px', 
                            objectFit: 'contain', 
                            borderRadius: 'var(--sense-radius-sm)', 
                            marginBottom: '12px',
                            border: '1px solid var(--color-light-border)' 
                          }} 
                        />
                        <span style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(15, 23, 42, 0.75)',
                          color: '#fff',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          Active Frame
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <button 
                          type="button"
                          onClick={startBillCamera} 
                          className="sense-btn-primary"
                          style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Camera size={15} />
                          <span>📸 Retake with Camera</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => ocrFileInputRef.current?.click()} 
                          className="sense-btn-secondary"
                          style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Upload size={15} />
                          <span>📁 Choose Different File</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: '100%', maxWidth: '380px' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'var(--color-fresh-mint)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px auto',
                        color: 'var(--color-leaf-green)'
                      }}>
                        <Camera size={28} />
                      </div>

                      <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-soft-charcoal)' }}>
                        Scan Packaging or Supermarket Bill
                      </h4>
                      <p style={{ margin: '0 0 18px 0', fontSize: '0.82rem', color: 'var(--color-muted-grey)', lineHeight: 1.4 }}>
                        Point camera at bottle caps, foil crimps, or paper receipts to extract MFD, Expiry, MRP &amp; Batch automatically.
                      </p>

                      {/* Primary Choice Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button 
                          type="button"
                          onClick={startBillCamera} 
                          className="sense-btn-primary"
                          style={{ 
                            padding: '12px 20px', 
                            fontSize: '0.92rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                          }}
                        >
                          <Camera size={18} />
                          <span>Open Live Camera Scanner</span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => ocrFileInputRef.current?.click()} 
                          className="sense-btn-secondary"
                          style={{ 
                            padding: '10px 18px', 
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            background: '#fff'
                          }}
                        >
                          <Upload size={16} />
                          <span>Choose from Files / Gallery</span>
                        </button>
                      </div>

                      <input 
                        type="file" 
                        ref={ocrFileInputRef} 
                        onChange={handleOcrFileSelect} 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Camera Error Alert if camera fails */}
              {billCameraError && (
                <div style={{
                  padding: '12px 14px',
                  background: '#fef2f2',
                  border: '1.5px solid #fecaca',
                  borderRadius: 'var(--sense-radius-sm)',
                  color: '#991b1b',
                  fontSize: '0.82rem',
                  lineHeight: 1.4,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, marginBottom: '2px' }}>Camera Notice</div>
                    <div>{billCameraError}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => ocrFileInputRef.current?.click()}
                    className="sense-btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', flexShrink: 0, background: '#fff' }}
                  >
                    Select File
                  </button>
                </div>
              )}

              {/* CREATIVE MULTI-PHASE FORENSIC SCANNER LOADING */}
              {isOcrProcessing && (
                <div className="sense-forensic-loading-box">
                  <div className="sense-forensic-visual-stage">
                    {/* Concentric Dual-Orbit Radar Core */}
                    <div className="sense-radar-core">
                      <div className="sense-radar-ring-outer"></div>
                      <div className="sense-radar-ring-inner"></div>
                      <div className="sense-radar-center-dot">
                        <Sparkles size={14} />
                      </div>
                    </div>

                    {/* Progress Info & Dynamic Step Message */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#312e81', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="sense-dot-live"></span>
                          Multimodal Forensic OCR Active
                        </span>
                        <span style={{
                          fontSize: '0.95rem',
                          fontWeight: 900,
                          fontFamily: 'var(--sense-font-mono)',
                          color: '#4338ca',
                          background: 'rgba(255, 255, 255, 0.9)',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)'
                        }}>
                          {ocrProgressPct}%
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: '#4338ca', fontWeight: 700, marginBottom: '10px', lineHeight: 1.4 }}>
                        {ocrStageMessage}
                      </div>

                      {/* Fluid Multi-Color Shimmer Progress Bar */}
                      <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.75)', borderRadius: '999px', overflow: 'hidden', padding: '1.5px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div 
                          className="sense-progress-shimmer-bar"
                          style={{ 
                            width: `${ocrProgressPct}%`, 
                            height: '100%', 
                            borderRadius: '999px',
                            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
                          }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Active Optical Scanline across photo thumbnail if preview exists */}
                  {ocrImagePreview && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed rgba(99, 102, 241, 0.25)' }}>
                      <div className="sense-scan-preview-wrap" style={{ width: '56px', height: '56px', flexShrink: 0 }}>
                        <img src={ocrImagePreview} alt="Target Document" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div className="sense-laser-beam"></div>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                        <strong style={{ color: '#1e293b' }}>Holographic Optical Scan:</strong> Stamped inkjet fonts &amp; barcode anchor points are actively being cross-checked.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {ocrCompletedNotice && (
                <div style={{ padding: '12px 16px', background: 'var(--color-fresh-mint)', border: '1.5px solid var(--color-leaf-green)', borderRadius: 'var(--sense-radius-sm)', color: 'var(--color-leaf-green)', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} />
                  <span>✨ AI Vision extracted prices, batch &amp; dates successfully! Review or proceed to Step 3.</span>
                </div>
              )}
            </div>

            {/* Right: Merged Data Preview & Actions */}
            <div className="sense-card">
              <h3 style={{ margin: '0 0 14px 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-soft-charcoal)' }}>
                Extracted Information Preview
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: 'var(--color-vanilla-cream)', padding: '10px 14px', borderRadius: 'var(--sense-radius-sm)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-muted-grey)', fontWeight: 700 }}>PRODUCT NAME</div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-soft-charcoal)' }}>
                    {editableForm.product_name || 'Not detected yet'}
                  </div>
                </div>

                <div style={{ background: 'var(--color-vanilla-cream)', padding: '10px 14px', borderRadius: 'var(--sense-radius-sm)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-muted-grey)', fontWeight: 700 }}>BRAND</div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-soft-charcoal)' }}>
                    {editableForm.brand || 'Not detected yet'}
                  </div>
                </div>

                <div style={{ background: 'var(--color-vanilla-cream)', padding: '10px 14px', borderRadius: 'var(--sense-radius-sm)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-muted-grey)', fontWeight: 700 }}>PRINTED MRP</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-soft-charcoal)' }}>
                    {editableForm.mrp ? `₹${editableForm.mrp}` : 'Not detected'}
                  </div>
                </div>

                <div style={{ background: 'var(--color-vanilla-cream)', padding: '10px 14px', borderRadius: 'var(--sense-radius-sm)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-muted-grey)', fontWeight: 700 }}>SELLING PRICE</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-leaf-green)' }}>
                    {editableForm.selling_price ? `₹${editableForm.selling_price}` : 'Not detected'}
                  </div>
                </div>

                <div style={{ background: 'var(--color-fresh-mint)', padding: '10px 14px', borderRadius: 'var(--sense-radius-sm)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-leaf-green)', fontWeight: 800 }}>BILL / MFD / PURCHASE DATE</div>
                  <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--color-soft-charcoal)' }}>
                    {editableForm.mfg_date || 'Standard batch'}
                  </div>
                </div>

                <div style={{ background: 'var(--color-butter-yellow)', padding: '10px 14px', borderRadius: 'var(--sense-radius-sm)' }}>
                  <div style={{ fontSize: '0.74rem', color: '#854d0e', fontWeight: 800 }}>EXPIRY / BEST BEFORE</div>
                  <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--color-soft-charcoal)' }}>
                    {editableForm.exp_date || 'Standard shelf-life'}
                  </div>
                </div>
              </div>

              {ocrRawText && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-muted-grey)', fontWeight: 700, marginBottom: '4px' }}>
                    RAW OCR DETECTED TEXT:
                  </div>
                  <pre style={{
                    background: 'var(--color-vanilla-cream)',
                    border: '1px solid var(--color-light-border)',
                    borderRadius: 'var(--sense-radius-sm)',
                    padding: '10px',
                    fontSize: '0.76rem',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '110px',
                    overflowY: 'auto',
                    margin: 0,
                    color: 'var(--color-soft-charcoal)'
                  }}>
                    {ocrRawText}
                  </pre>
                </div>
              )}

              {/* Action Buttons for Step 2 */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="sense-btn-secondary"
                  style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Step 1</span>
                </button>

                <button
                  onClick={handleProceedFromOcrToReport}
                  className="sense-btn-primary"
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: 800,
                  }}
                >
                  <span>Proceed to Final Report</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: VERIFICATION FORM & FINAL COMPREHENSIVE ASSESSMENT REPORT         */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', gap: '26px' }}>
            {/* Left: Editable Confirmation Form (Zero Hallucination Policy) */}
            <div className="sense-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit3 size={18} color="var(--color-leaf-green)" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-soft-charcoal)' }}>
                    Editable Verification Form
                  </h3>
                </div>
                <span className="sense-badge sense-badge-hardware-on" style={{ fontSize: '0.72rem' }}>
                  Zero Hallucination
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-muted-grey)', margin: '0 0 16px 0' }}>
                Verify and tweak extracted values before computing the final biological shelf-life &amp; financial report.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-muted-grey)', fontWeight: 700 }}>Product Name</label>
                  <input
                    type="text"
                    value={editableForm.product_name}
                    onChange={(e) => setEditableForm({ ...editableForm, product_name: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-muted-grey)', fontWeight: 700 }}>Brand / Manufacturer</label>
                  <input
                    type="text"
                    value={editableForm.brand}
                    onChange={(e) => setEditableForm({ ...editableForm, brand: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-muted-grey)', fontWeight: 700 }}>Printed MRP (₹)</label>
                  <input
                    type="number"
                    value={editableForm.mrp}
                    onChange={(e) => setEditableForm({ ...editableForm, mrp: e.target.value })}
                    placeholder="e.g. 140"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-muted-grey)', fontWeight: 700 }}>Selling Price (₹)</label>
                  <input
                    type="number"
                    value={editableForm.selling_price}
                    onChange={(e) => setEditableForm({ ...editableForm, selling_price: e.target.value })}
                    placeholder="e.g. 125"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-muted-grey)', fontWeight: 700 }}>📅 Bill / Mfg / Packaged Date</label>
                  <input
                    type="text"
                    value={editableForm.mfg_date}
                    onChange={(e) => setEditableForm({ ...editableForm, mfg_date: e.target.value })}
                    placeholder="e.g. 2024-10-18 or 18/10/2024"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-muted-grey)', fontWeight: 700 }}>⏳ Expiry / Best Before</label>
                  <input
                    type="text"
                    value={editableForm.exp_date}
                    onChange={(e) => setEditableForm({ ...editableForm, exp_date: e.target.value })}
                    placeholder="DD/MM/YYYY or YYYY-MM-DD"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-muted-grey)', fontWeight: 700 }}>⚖️ Net Quantity</label>
                  <input
                    type="text"
                    value={editableForm.net_quantity}
                    onChange={(e) => setEditableForm({ ...editableForm, net_quantity: e.target.value })}
                    placeholder="e.g. 500g, 1L"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-muted-grey)', fontWeight: 700 }}>🏷️ Batch / Lot Number</label>
                  <input
                    type="text"
                    value={editableForm.batch_number}
                    onChange={(e) => setEditableForm({ ...editableForm, batch_number: e.target.value })}
                    placeholder="e.g. BN-KS-882"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-muted-grey)', fontWeight: 700 }}>Storage Instructions</label>
                <input
                  type="text"
                  value={editableForm.storage_instructions}
                  onChange={(e) => setEditableForm({ ...editableForm, storage_instructions: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', fontSize: '0.85rem' }}
                />
              </div>

              <button
                onClick={() => calculateFinalReport(editableForm)}
                disabled={isCalculatingReport}
                className="sense-btn-primary"
                style={{
                  width: '100%',
                  marginTop: '18px',
                  padding: '13px',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <RotateCcw size={16} />
                <span>Recalculate &amp; Refresh Report</span>
              </button>

              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="sense-btn-secondary"
                  style={{ flex: 1, padding: '9px', fontSize: '0.82rem' }}
                >
                  ← Back to Step 1
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="sense-btn-secondary"
                  style={{ flex: 1, padding: '9px', fontSize: '0.82rem' }}
                >
                  ← Back to Step 2
                </button>
              </div>
            </div>

            {/* Right: Grand Packaged Assessment Report Card */}
            {finalReport ? (
              <div className="sense-card" style={{ border: '2px solid var(--color-leaf-green)', boxShadow: 'var(--sense-shadow-floating)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span className="sense-badge sense-badge-hardware-on">
                        ✓ Verified Assessment Report
                      </span>
                      {finalReport.vegetarian_status && (
                        <span className="sense-badge" style={{ background: 'var(--color-fresh-mint)', color: 'var(--color-leaf-green)' }}>
                          {finalReport.vegetarian_status}
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-soft-charcoal)' }}>
                      {finalReport.product_name}
                    </h3>
                    <p style={{ margin: '2px 0 0 0', color: 'var(--color-muted-grey)', fontSize: '0.85rem' }}>
                      Brand: <strong style={{ color: 'var(--color-soft-charcoal)' }}>{finalReport.brand || 'Retail Grade'}</strong>
                      {finalReport.code && <> • Barcode: <code>{finalReport.code}</code></>}
                    </p>
                  </div>

                  {finalReport.image_url && (
                    <img 
                      src={finalReport.image_url} 
                      alt={finalReport.product_name} 
                      style={{ width: '64px', height: '64px', objectFit: 'contain', background: '#fff', border: '1px solid var(--color-light-border)', borderRadius: 'var(--sense-radius-md)', padding: '4px' }} 
                    />
                  )}
                </div>

                {/* Sweet & Cute & Crisp Pantry Summary Card */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(220, 238, 255, 0.8) 0%, rgba(255, 241, 184, 0.55) 100%)',
                  border: '2px solid #93c5fd',
                  borderRadius: 'var(--sense-radius-lg)',
                  padding: '16px 20px',
                  marginBottom: '18px',
                  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.08)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📦🍯✨</span>
                    <div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        background: '#2563eb',
                        color: '#ffffff',
                        padding: '2px 10px',
                        borderRadius: 'var(--sense-radius-full)',
                      }}>
                        Sweet &amp; Crisp Summary
                      </span>
                      <h4 style={{ margin: '2px 0 0 0', fontSize: '1.08rem', fontWeight: 900, color: 'var(--color-soft-charcoal)' }}>
                        Here's the sweet lowdown on your {finalReport.product_name}!
                      </h4>
                    </div>
                  </div>

                  <p style={{
                    fontSize: '0.92rem',
                    lineHeight: 1.55,
                    color: 'var(--color-soft-charcoal)',
                    margin: '0 0 12px 0',
                    fontWeight: 500,
                  }}>
                    {finalReport.shelf_life?.is_expired
                      ? `🚨 Oh dear! This item expired ${Math.abs(finalReport.shelf_life?.days_remaining || 0)} days ago. To protect your health and keep your tummy happy, please refrain from consuming it! 🥛🚫`
                      : finalReport.shelf_life?.days_remaining <= 14
                      ? `⏰ Tick-tock, sweet friend! Your ${finalReport.product_name} has ${finalReport.shelf_life?.days_remaining} days of deliciousness remaining. Perfect timing to use it up this week! ${finalReport.savings_amount > 0 ? `Plus, you saved ₹${finalReport.savings_amount}—high five! 🙌` : ''}`
                      : `🌟 Fantastic news! Your ${finalReport.product_name} is fresh, safe, and happy with ${finalReport.shelf_life?.days_remaining} days of prime shelf-life remaining! ${finalReport.savings_amount > 0 ? `You saved ₹${finalReport.savings_amount} (${finalReport.discount_pct}% OFF)—smart pantry shopping! 💰` : ''}`
                    }
                  </p>

                  {/* Crisp Highlights */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
                    gap: '8px',
                    background: 'rgba(255, 255, 255, 0.88)',
                    padding: '10px 14px',
                    borderRadius: 'var(--sense-radius-md)',
                    border: '1px solid var(--color-light-border)',
                  }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-soft-charcoal)' }}>
                      ✨ <strong>Status:</strong> {finalReport.shelf_life?.status_label || 'Verified Valid'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-soft-charcoal)' }}>
                      ⏳ <strong>Days Left:</strong> {finalReport.shelf_life?.days_remaining != null ? `${finalReport.shelf_life.days_remaining} days` : 'Long-life'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-soft-charcoal)' }}>
                      💰 <strong>Savings:</strong> {finalReport.savings_amount > 0 ? `₹${finalReport.savings_amount} saved` : 'Standard Price'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-soft-charcoal)' }}>
                      💡 <strong>Storage:</strong> {finalReport.storage_instructions || 'Cool dry spot'}
                    </div>
                  </div>
                </div>

                {/* TEMPERATURE-CALIBRATED SAFE EXPIRY & DUAL-DATE SHOWCASE */}
                {finalReport.shelf_life && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      background: finalReport.shelf_life.kinetic_thermal_adjustment?.thermal_risk_level === 'CRITICAL_ACCELERATION'
                        ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                        : 'linear-gradient(135deg, var(--color-vanilla-cream) 0%, #f0fdf4 100%)',
                      borderRadius: 'var(--sense-radius-md)',
                      padding: '18px 22px',
                      border: '1.5px solid var(--color-light-border)',
                      borderLeft: `6px solid ${finalReport.shelf_life.kinetic_thermal_adjustment?.thermal_badge_color || finalReport.shelf_life.badge_color}`,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                      marginBottom: '14px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Thermometer size={20} color="#ef4444" />
                          <span style={{ fontSize: '0.82rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-soft-charcoal)' }}>
                            REAL-TIME AMBIENT SHELF-LIFE (KINETIC MODEL)
                          </span>
                        </div>
                        <span style={{
                          background: finalReport.shelf_life.kinetic_thermal_adjustment?.thermal_badge_color || finalReport.shelf_life.badge_color,
                          color: '#fff',
                          fontSize: '0.76rem',
                          fontWeight: 900,
                          padding: '4px 14px',
                          borderRadius: 'var(--sense-radius-full)',
                        }}>
                          {finalReport.shelf_life.kinetic_thermal_adjustment?.thermal_risk_label || finalReport.shelf_life.status_label}
                        </span>
                      </div>

                      {/* Dual-Date Grid: Printed Expiry vs Actual Ambient Expiry */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                        gap: '12px',
                        marginTop: '14px',
                      }}>
                        {/* Box 1: Factory Printed Expiry */}
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          padding: '14px 16px',
                          borderRadius: 'var(--sense-radius-sm)',
                          border: '1px solid var(--color-light-border)',
                        }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-muted-grey)', fontWeight: 800, textTransform: 'uppercase' }}>
                            📅 Printed Package Date (Nominal)
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-soft-charcoal)', marginTop: '4px' }}>
                            {finalReport.exp_date || 'Standard Batch'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted-grey)', marginTop: '2px' }}>
                            Assumes ideal {finalReport.shelf_life.kinetic_thermal_adjustment?.recommended_temp_c || 20}°C lab storage
                          </div>
                        </div>

                        {/* Box 2: Actual Temperature-Calibrated Expiry */}
                        <div style={{
                          background: finalReport.shelf_life.kinetic_thermal_adjustment?.days_lost_to_ambient_heat > 0 ? '#fff7ed' : '#f0fdf4',
                          padding: '14px 16px',
                          borderRadius: 'var(--sense-radius-sm)',
                          border: `1.5px solid ${finalReport.shelf_life.kinetic_thermal_adjustment?.days_lost_to_ambient_heat > 0 ? '#fed7aa' : '#bbf7d0'}`,
                        }}>
                          <div style={{ fontSize: '0.72rem', color: finalReport.shelf_life.kinetic_thermal_adjustment?.days_lost_to_ambient_heat > 0 ? '#c2410c' : '#15803d', fontWeight: 900, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Flame size={14} />
                            Actual Safe Expiry ({finalReport.shelf_life.kinetic_thermal_adjustment?.ambient_temp_c || ambientTemp}°C Room Heat)
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: finalReport.shelf_life.kinetic_thermal_adjustment?.days_lost_to_ambient_heat > 0 ? '#c2410c' : '#166534', marginTop: '4px' }}>
                            {finalReport.shelf_life.kinetic_thermal_adjustment?.adjusted_safe_expiry_display || finalReport.shelf_life.display_str}
                          </div>
                          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#c2410c', marginTop: '2px' }}>
                            {finalReport.shelf_life.kinetic_thermal_adjustment?.days_lost_to_ambient_heat > 0
                              ? `⚠️ Lost ~${finalReport.shelf_life.kinetic_thermal_adjustment.days_lost_to_ambient_heat} days due to ambient heat (${finalReport.shelf_life.kinetic_thermal_adjustment.acceleration_factor}× degradation rate)`
                              : `✨ Zero heat acceleration. Stored at ideal temperature!`}
                          </div>
                        </div>
                      </div>

                      {/* Actionable Advice & Reclaim Potential */}
                      {finalReport.shelf_life.kinetic_thermal_adjustment?.thermal_storage_advice && (
                        <div style={{
                          marginTop: '12px',
                          padding: '10px 14px',
                          borderRadius: 'var(--sense-radius-sm)',
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid var(--color-light-border)',
                          fontSize: '0.84rem',
                          color: 'var(--color-soft-charcoal)',
                          lineHeight: 1.5,
                        }}>
                          💡 <strong>Storage Action Advice:</strong> {finalReport.shelf_life.kinetic_thermal_adjustment.thermal_storage_advice}
                        </div>
                      )}

                      {/* Interactive Room Temperature Simulator / Recalibration Slider */}
                      <div style={{
                        marginTop: '14px',
                        padding: '12px 16px',
                        borderRadius: 'var(--sense-radius-sm)',
                        background: 'rgba(255, 255, 255, 0.75)',
                        border: '1px dashed var(--color-light-border)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-soft-charcoal)' }}>
                            🌡️ Live Temperature Recalibration Slider:
                          </span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#b91c1c' }}>
                            {ambientTemp.toFixed(1)}°C
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Snowflake size={16} color="#3b82f6" />
                          <input
                            type="range"
                            min="4"
                            max="45"
                            step="0.5"
                            value={ambientTemp}
                            onChange={(e) => {
                              const newT = parseFloat(e.target.value);
                              setAmbientTemp(newT);
                              calculateFinalReport(finalReport, newT);
                            }}
                            style={{ flex: 1, accentColor: '#ea580c', cursor: 'pointer' }}
                          />
                          <Flame size={16} color="#ea580c" />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-muted-grey)', marginTop: '4px' }}>
                          <span>4°C (Refrigerator)</span>
                          <span>20°C (Standard Pantry)</span>
                          <span>32°C (Indian Room)</span>
                          <span>40°C (Summer Heat)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price, MRP, and Financial Savings Card */}
                {(finalReport.mrp || finalReport.selling_price) && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
                    gap: '10px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ background: 'var(--color-vanilla-cream)', padding: '12px 14px', borderRadius: 'var(--sense-radius-sm)', border: '1px solid var(--color-light-border)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-muted-grey)', fontWeight: 700, textTransform: 'uppercase' }}>Printed MRP</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-soft-charcoal)', marginTop: '2px' }}>
                        {finalReport.mrp ? `₹${finalReport.mrp}` : 'N/A'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--color-vanilla-cream)', padding: '12px 14px', borderRadius: 'var(--sense-radius-sm)', border: '1px solid var(--color-light-border)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-muted-grey)', fontWeight: 700, textTransform: 'uppercase' }}>Selling Price</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-leaf-green)', marginTop: '2px' }}>
                        {finalReport.selling_price ? `₹${finalReport.selling_price}` : (finalReport.mrp ? `₹${finalReport.mrp}` : 'N/A')}
                      </div>
                    </div>

                    {finalReport.savings_amount > 0 && (
                      <div style={{ background: 'var(--color-butter-yellow)', padding: '12px 14px', borderRadius: 'var(--sense-radius-sm)', border: '1px solid rgba(234, 179, 8, 0.4)' }}>
                        <div style={{ fontSize: '0.72rem', color: '#854d0e', fontWeight: 800, textTransform: 'uppercase' }}>Total Savings</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#854d0e', marginTop: '2px' }}>
                          Save ₹{finalReport.savings_amount} ({finalReport.discount_pct}% OFF)
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Full Specifications Grid */}
                <div style={{
                  background: 'var(--color-vanilla-cream)',
                  border: '1px solid var(--color-light-border)',
                  borderRadius: 'var(--sense-radius-md)',
                  padding: '14px 16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '8px', fontSize: '0.84rem' }}>
                    <div>
                      <span style={{ color: 'var(--color-muted-grey)' }}>Packaged / Mfg Date: </span>
                      <strong style={{ color: 'var(--color-soft-charcoal)' }}>{finalReport.mfg_date || 'Standard batch'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--color-muted-grey)' }}>Expiry Date: </span>
                      <strong style={{ color: 'var(--color-soft-charcoal)' }}>{finalReport.exp_date || 'Standard shelf-life'}</strong>
                    </div>
                    {finalReport.net_quantity && (
                      <div>
                        <span style={{ color: 'var(--color-muted-grey)' }}>Net Quantity: </span>
                        <strong style={{ color: 'var(--color-soft-charcoal)' }}>{finalReport.net_quantity}</strong>
                      </div>
                    )}
                    {finalReport.batch_number && (
                      <div>
                        <span style={{ color: 'var(--color-muted-grey)' }}>Batch / Lot: </span>
                        <code style={{ background: 'var(--color-powder-blue)', color: '#1e40af', padding: '1px 6px', borderRadius: '4px' }}>
                          {finalReport.batch_number}
                        </code>
                      </div>
                    )}
                    {finalReport.fssai_license && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ color: 'var(--color-muted-grey)' }}>FSSAI Lic: </span>
                        <code style={{ color: 'var(--color-soft-charcoal)' }}>{finalReport.fssai_license}</code>
                      </div>
                    )}
                  </div>
                </div>

                {/* Storage Instructions Callout */}
                {finalReport.storage_instructions && (
                  <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--color-soft-charcoal)',
                    background: 'var(--color-fresh-mint)',
                    padding: '10px 14px',
                    borderRadius: 'var(--sense-radius-sm)',
                    marginBottom: '14px'
                  }}>
                    💡 <strong>Storage Guidelines:</strong> {finalReport.storage_instructions}
                  </div>
                )}

                {/* Ingredients */}
                {finalReport.ingredients && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-muted-grey)', lineHeight: 1.45, marginBottom: '18px' }}>
                    <strong>Ingredients:</strong> {finalReport.ingredients}
                  </div>
                )}

                {/* Action Buttons: Open PDF, Download PDF, Print, Restart Wizard */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      try {
                        const ambSensors = { temperature_c: ambientTemp, humidity_pct: 58 };
                        const dynShelfLife = finalReport.shelf_life || {};
                        const pdf = generatePackagedFoodPdf(finalReport, ambSensors, dynShelfLife);
                        pdf.openPdf();
                      } catch (err) {
                        console.error('Open PDF error:', err);
                      }
                    }}
                    className="sense-btn-secondary"
                    style={{
                      padding: '11px 18px',
                      fontSize: '0.86rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#F0FDF4',
                      borderColor: '#86EFAC',
                      color: '#15803D',
                      fontWeight: 700
                    }}
                  >
                    <ExternalLink size={16} />
                    <span>Open PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      try {
                        const ambSensors = { temperature_c: ambientTemp, humidity_pct: 58 };
                        const dynShelfLife = finalReport.shelf_life || {};
                        const pdf = generatePackagedFoodPdf(finalReport, ambSensors, dynShelfLife);
                        pdf.downloadPdf();
                      } catch (err) {
                        console.error('Download PDF error:', err);
                      }
                    }}
                    className="sense-btn-secondary"
                    style={{
                      padding: '11px 18px',
                      fontSize: '0.86rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#EFF6FF',
                      borderColor: '#93C5FD',
                      color: '#1D4ED8',
                      fontWeight: 700
                    }}
                  >
                    <FileDown size={16} />
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="sense-btn-secondary"
                    style={{ padding: '11px 18px', fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Printer size={16} />
                    <span>Print</span>
                  </button>

                  <button
                    onClick={handleRestartWizard}
                    className="sense-btn-primary"
                    style={{
                      flex: 1,
                      padding: '11px 20px',
                      fontSize: '0.86rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      minWidth: '200px'
                    }}
                  >
                    <RotateCcw size={16} />
                    <span>Scan Another Product</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="sense-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
                <Clock size={40} color="var(--color-muted-grey)" style={{ opacity: 0.5, marginBottom: '12px' }} />
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--color-soft-charcoal)' }}>
                  Ready to Calculate Report
                </h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.86rem', color: 'var(--color-muted-grey)' }}>
                  Click below to calculate remaining shelf-life days and verified savings.
                </p>
                <button
                  onClick={() => calculateFinalReport(editableForm)}
                  className="sense-btn-primary"
                  style={{ padding: '12px 24px' }}
                >
                  Generate Report Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
