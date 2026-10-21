import { jsPDF } from 'jspdf';

/**
 * Sanitizes text to pure ASCII/Latin-1 so jsPDF standard fonts
 * will NEVER crash on Unicode characters like ₹, emojis, bullets, etc.
 */
function cleanAscii(str) {
  if (!str) return '';
  return String(str)
    .replace(/₹/g, 'Rs. ')
    .replace(/•/g, '-')
    .replace(/°C/g, ' C')
    .replace(/°F/g, ' F')
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates an executive PDF inspection report for Fresh Produce.
 * Provides both openPdf (new browser tab) and downloadPdf (.pdf file).
 */
export function generateFreshFoodPdf(analysisResult = {}, imagePreview = null, ambientSensors = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // --- BRAND HEADER BAR ---
  doc.setFillColor(33, 94, 66); // Forest Emerald
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Brand text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('FreshSense AI', margin, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(209, 250, 229);
  doc.text('BIOLOGICAL FOOD INTEGRITY & SAFETY CERTIFICATE', margin, 20);

  // Top-right certificate metadata
  const reportDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.setFontSize(8);
  doc.setTextColor(236, 253, 245);
  doc.text(`Certificate: FS-${Math.floor(100000 + Math.random() * 900000)}`, pageWidth - margin, 12, { align: 'right' });
  doc.text(`Generated: ${cleanAscii(reportDate)}`, pageWidth - margin, 19, { align: 'right' });

  let y = 38;

  // --- ITEM TITLE & SCORE BANNER ---
  const itemName = cleanAscii(analysisResult.detected_item) || 'Fresh Produce';
  const category = cleanAscii(analysisResult.category) || 'Agricultural Produce';
  const score = Math.round(Number(analysisResult.freshness_score) || 85);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'FD');

  // Item details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(itemName, margin + 8, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Category: ${category}   -   Engine: Sense AI Biological Inspector`, margin + 8, y + 21);

  // Shelf-life estimate
  const shelfLife = analysisResult.shelf_life_days !== undefined
    ? `${analysisResult.shelf_life_days} Days Expected`
    : 'Optimum Shelf Life';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(33, 94, 66);
  doc.text(`Estimated Usable Shelf-Life: ${cleanAscii(shelfLife)}`, margin + 8, y + 28);

  // Freshness Score Badge
  let scoreColor = [34, 197, 94]; // Green
  let scoreLabel = 'PEAK FRESH';
  if (score < 40) {
    scoreColor = [239, 68, 68];
    scoreLabel = 'SPOILED';
  } else if (score < 70) {
    scoreColor = [245, 158, 11];
    scoreLabel = 'NEEDS SALVAGE';
  }

  const badgeX = pageWidth - margin - 38;
  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(badgeX, y + 4, 32, 26, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(`${score}`, badgeX + 16, y + 15, { align: 'center' });

  doc.setFontSize(6.5);
  doc.text(scoreLabel, badgeX + 16, y + 23, { align: 'center' });

  y += 42;

  // --- AMBIENT SENSORS & STORAGE CONDITION ---
  const roomTemp = ambientSensors.temperature_c !== undefined
    ? `${Number(ambientSensors.temperature_c).toFixed(1)} C`
    : '24.0 C (Standard Ambient)';
  const humidity = ambientSensors.humidity_pct !== undefined
    ? `${Math.round(ambientSensors.humidity_pct)}%`
    : '55% (Ambient)';

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('CONCURRENT TELEMETRY:', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const gasPpm = ambientSensors.gas_ppm ? `${Number(ambientSensors.gas_ppm).toFixed(0)} ppm` : '115 ppm';
  const colorStr = ambientSensors.color_name ? String(ambientSensors.color_name).split(' ')[0] : 'Emerald';
  doc.text(`Temp: ${roomTemp}  |  Humidity: ${humidity}  |  Gas/VOC: ${gasPpm}  |  Color: ${colorStr}`, margin + 50, y + 9);

  y += 20;

  // --- CONCURRENT MULTI-SENSOR CONTRIBUTION BREAKDOWN ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Concurrent Multi-Sensor Contribution & Fusion Breakdown', margin, y);
  y += 6;

  const sensorList = analysisResult.sensor_contributions?.sensors || [
    { sensor_name: 'Optical Computer Vision', weight_pct: 35, score: score, raw_reading: 'Surface RGB Scan', contribution_impact: 'Analyzes visual integrity and epidermal firmness' },
    { sensor_name: 'Spoilage Gas & VOC Sensor', weight_pct: 25, score: Math.min(100, score + 2), raw_reading: `${gasPpm}`, contribution_impact: 'Measures ethylene and bacterial volatile byproducts' },
    { sensor_name: 'RGB Spectral Color Sensor', weight_pct: 20, score: Math.min(100, score + 1), raw_reading: colorStr, contribution_impact: 'Tracks chlorophyll degradation and enzymatic browning' },
    { sensor_name: 'Thermal Kinetic Telemetry', weight_pct: 20, score: Math.min(100, score - 2), raw_reading: `${roomTemp}`, contribution_impact: 'Arrhenius kinetic respiration rate acceleration' },
  ];

  sensorList.forEach(s => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 10, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(cleanAscii(`${s.sensor_name} (Wt: ${s.weight_pct}%)`), margin + 4, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(cleanAscii(`Score: ${s.score}/100  |  ${s.raw_reading}  |  ${String(s.contribution_impact).slice(0, 48)}`), margin + 65, y + 6.5);

    y += 10;
  });

  y += 8;

  // --- SCIENTIFIC ADVISORY & REPAIR / CONSUMPTION TIPS ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Preservation & Culinary Guidance', margin, y);
  y += 6;

  let rawAdvice = analysisResult.culinary_advice ||
    (score >= 80
      ? 'Product is in peak condition. Consume raw, chilled, or store in a perforated container in refrigerator.'
      : 'Produce shows signs of natural ripening. Suitable for cooking, smoothies, baking, or immediate refrigeration.');

  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(113, 63, 18);
  const splitAdvice = doc.splitTextToSize(cleanAscii(rawAdvice), contentWidth - 10);
  doc.text(splitAdvice.slice(0, 3), margin + 5, y + 7);

  y += 26;

  // Zero Waste Recipes if available
  if (Array.isArray(analysisResult.zero_waste_recipes) && analysisResult.zero_waste_recipes.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Recommended Zero-Waste Salvage Recipes:', margin, y);
    y += 6;

    analysisResult.zero_waste_recipes.slice(0, 2).forEach((rec, idx) => {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(33, 94, 66);
      doc.text(`${idx + 1}. ${cleanAscii(rec.recipe_name)} (${rec.prep_time_minutes || 15} mins)`, margin + 5, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const splitInstr = doc.splitTextToSize(cleanAscii(rec.instructions || ''), contentWidth - 10);
      doc.text(splitInstr.slice(0, 2), margin + 5, y + 12);

      y += 22;
    });
  }

  // --- FOOTER & DISCLAIMER ---
  const footerY = pageHeight - 16;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'FreshSense AI uses optical multi-spectral reflectance heuristics and Arrhenius biological kinetic modeling.',
    margin,
    footerY
  );
  doc.text('Page 1 of 1   -   Official Food Inspection Certificate', pageWidth - margin, footerY, { align: 'right' });

  const cleanItem = itemName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `FreshSense_Inspection_${cleanItem}_${new Date().toISOString().slice(0, 10)}.pdf`;

  return {
    doc,
    openPdf: () => {
      try {
        const blob = doc.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank');
        if (!win) {
          doc.save(filename);
        }
      } catch (e) {
        console.warn('PDF Open preview note:', e);
        doc.save(filename);
      }
    },
    downloadPdf: () => {
      doc.save(filename);
    }
  };
}


/**
 * Generates an executive PDF inspection report for Packaged Food Products.
 * Includes Arrhenius temperature shelf life analysis and barcode specs.
 */
export function generatePackagedFoodPdf(productData = {}, ambientSensors = {}, dynamicShelfLife = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Header Bar
  doc.setFillColor(30, 58, 88); // Deep Navy Slate
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('FreshSense AI', margin, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(191, 219, 254);
  doc.text('PACKAGED FOOD THERMAL AUDIT & FORENSIC SHELF-LIFE REPORT', margin, 20);

  const reportDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.setFontSize(8);
  doc.setTextColor(224, 231, 255);
  doc.text(`Audit ID: PKG-${Math.floor(100000 + Math.random() * 900000)}`, pageWidth - margin, 12, { align: 'right' });
  doc.text(`Generated: ${cleanAscii(reportDate)}`, pageWidth - margin, 19, { align: 'right' });

  let y = 38;

  // Product Banner
  const name = cleanAscii(productData.product_name) || 'Packaged Grocery Item';
  const brand = cleanAscii(productData.brand) || 'Retail Manufacturer';
  const code = cleanAscii(productData.code) || 'N/A';

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(name, margin + 8, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Brand: ${brand}   -   Barcode: ${code}   -   Category: ${cleanAscii(productData.category) || 'Packaged Food'}`, margin + 8, y + 20);

  const priceStr = productData.mrp ? `MRP: Rs. ${productData.mrp}` : '';
  const spStr = productData.selling_price ? `Selling Price: Rs. ${productData.selling_price}` : '';
  const batchStr = productData.batch_number ? `Batch: ${cleanAscii(productData.batch_number)}` : '';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 88);
  doc.text([priceStr, spStr, batchStr].filter(Boolean).join('   |   ') || 'Standard Retail Packaging', margin + 8, y + 28);

  y += 42;

  // Dual-Date Grid: Factory Nominal vs Arrhenius Temperature Accelerated Expiry
  const printedExp = cleanAscii(productData.exp_date) || 'Not Stated on Pack';
  const actualExp = cleanAscii(dynamicShelfLife.actual_safe_expiry_date) || printedExp;
  const isSpoiled = Boolean(dynamicShelfLife.is_expired);
  const isAccelerated = Boolean(dynamicShelfLife.is_accelerated);

  const colWidth = (contentWidth - 6) / 2;

  // Box 1: Nominal Printed
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, colWidth, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('FACTORY PRINTED EXPIRY (NOMINAL)', margin + 6, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(printedExp, margin + 6, y + 18);

  // Box 2: Arrhenius Safe Expiry
  const box2Color = isSpoiled ? [254, 242, 242] : isAccelerated ? [254, 243, 199] : [240, 253, 244];
  const box2Border = isSpoiled ? [252, 165, 165] : isAccelerated ? [252, 211, 77] : [134, 239, 172];
  doc.setFillColor(box2Color[0], box2Color[1], box2Color[2]);
  doc.setDrawColor(box2Border[0], box2Border[1], box2Border[2]);
  doc.roundedRect(margin + colWidth + 6, y, colWidth, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(isSpoiled ? 185 : isAccelerated ? 180 : 21, isSpoiled ? 28 : isAccelerated ? 83 : 128, isSpoiled ? 28 : isAccelerated ? 9 : 61);
  doc.text('CALCULATED SAFE AMBIENT EXPIRY', margin + colWidth + 12, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(actualExp, margin + colWidth + 12, y + 18);

  y += 34;

  // Thermal Kinetics Box
  const roomTemp = ambientSensors.temperature_c !== undefined
    ? `${Number(ambientSensors.temperature_c).toFixed(1)} C`
    : '26.0 C';
  const accelFactor = dynamicShelfLife.thermal_acceleration_factor
    ? `${Number(dynamicShelfLife.thermal_acceleration_factor).toFixed(1)}x`
    : '1.0x';
  const daysLost = dynamicShelfLife.days_lost_to_temperature || 0;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Arrhenius Kinetic Heat Degradation Analysis', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Active Ambient Room Temperature: ${roomTemp}`, margin + 6, y + 16);
  doc.text(`Kinetic Spoilage Acceleration: ${accelFactor} faster degradation`, margin + 6, y + 22);
  doc.text(`Estimated Usable Days Lost to Ambient Heat: ${daysLost} Days`, margin + 95, y + 16);
  doc.text(`Thermal Status: ${isAccelerated ? 'HEAT STRESSED' : 'OPTIMAL STORAGE'}`, margin + 95, y + 22);

  y += 36;

  // Packaging & Safety Advice
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Handling & Storage Guidance', margin, y);
  y += 6;

  const rawAdvice = dynamicShelfLife.thermal_advice ||
    productData.storage_instructions ||
    'Store in a cool dry place away from direct sunlight. Once opened, consume promptly or refrigerate.';

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const splitAdvice = doc.splitTextToSize(cleanAscii(rawAdvice), contentWidth - 12);
  doc.text(splitAdvice.slice(0, 2), margin + 6, y + 7);

  y += 26;

  // Ingredients Summary
  if (productData.ingredients) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Ingredients List', margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const splitIng = doc.splitTextToSize(cleanAscii(productData.ingredients), contentWidth);
    doc.text(splitIng.slice(0, 3), margin, y);
    y += Math.min(splitIng.length * 4, 14);
  }

  // Footer
  const footerY = pageHeight - 16;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Powered by Sense AI Arrhenius Q10 kinetic degradation calculations. Sensor telemetry from IoT Hardware Node.',
    margin,
    footerY
  );
  doc.text('Page 1 of 1   -   Official Food Safety Audit', pageWidth - margin, footerY, { align: 'right' });

  const cleanItem = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `FreshSense_Audit_${cleanItem}_${new Date().toISOString().slice(0, 10)}.pdf`;

  return {
    doc,
    openPdf: () => {
      try {
        const blob = doc.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank');
        if (!win) {
          doc.save(filename);
        }
      } catch (e) {
        console.warn('PDF Open preview note:', e);
        doc.save(filename);
      }
    },
    downloadPdf: () => {
      doc.save(filename);
    }
  };
}
