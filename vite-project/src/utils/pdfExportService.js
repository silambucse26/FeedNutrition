import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CHIMERTECH_LOGO, IHERD_LOGO } from './brandLogos.js';
import { resolveLocationDetails } from './locationHelper';
import { downloadIndicInputDataPDF, downloadIndicFeedingReportPDF } from './indicPdfGenerator';

/**
 * Utility to strip non-ASCII / emoji characters for safe jsPDF text rendering
 */
function cleanText(str) {
  if (str === null || str === undefined) return '';
  // Replace common bullet or special dashes
  const s = String(str)
    .replace(/[•●]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    // Remove emojis and non-standard symbols that break standard PDF fonts
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
    .trim();
  return s;
}

/**
 * Adds branded header banner to the PDF document with Chimertech and iHerd logos
 */
function addHeader(doc, title, subtitle, dateStr, farmName = 'Dairy Unit') {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Top Banner background (30mm height)
  doc.setFillColor(21, 128, 61); // #15803d Dark Green
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Accent thin stripe
  doc.setFillColor(134, 239, 172); // #86efac Light Green
  doc.rect(0, 30, pageWidth, 2, 'F');

  // Logos White Rounded Container on Top-Right (Positioned safely inside the 30mm banner)
  const boxW = 44;
  const boxH = 18;
  const boxX = pageWidth - boxW - 8; // 158mm
  const boxY = 6;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(boxX, boxY, boxW, boxH, 2.5, 2.5, 'F');

  // Chimertech Logo (Square 1:1)
  try {
    doc.addImage(CHIMERTECH_LOGO, 'PNG', boxX + 2, boxY + 1.5, 15, 15);
  } catch (e) {
    console.warn('Could not add Chimertech logo to PDF:', e);
  }

  // Subtle separator line between logos
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(boxX + 19, boxY + 2.5, boxX + 19, boxY + boxH - 2.5);

  // iHerd Logo (Aspect ratio ~1.45:1)
  try {
    doc.addImage(IHERD_LOGO, 'PNG', boxX + 21, boxY + 2.5, 21, 13);
  } catch (e) {
    console.warn('Could not add iHerd logo to PDF:', e);
  }

  // Strictly bound left text width (boxX - 18 = 140mm) to guarantee ZERO overlap with logos
  const textMaxW = boxX - 18;

  // Title: Size dynamically adjusted with maxWidth bounding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(title.length > 36 ? 10.5 : 12);
  doc.setTextColor(255, 255, 255);
  doc.text(cleanText(title.toUpperCase()), 12, 10.5, { maxWidth: textMaxW });

  // Subtitle / Farm Name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(220, 252, 231); // #dcfce7
  doc.text(cleanText(`${farmName}  |  ${subtitle}`), 12, 18, { maxWidth: textMaxW });

  // System & Date metadata
  doc.setFontSize(7.5);
  doc.setTextColor(240, 253, 244);
  doc.text(cleanText(`Generated: ${dateStr}  |  Precision Feed & Nutrition System`), 12, 25, { maxWidth: textMaxW });
}

/**
 * Adds running page footer
 */
function addFooters(doc) {
  const totalPages = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Footer line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Dairy Feed Nutrition & Ration Advisory System  |  Powered by Chimertech & iHerd', 14, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
  }
}

/**
 * EXPORT 1: DOWNLOAD COMPLETE FARM INPUT DATA AS A BEAUTIFUL COLORFUL PDF
 */
export async function downloadInputDataPDF({
  weather,
  selectedBreed,
  heifersData = [],
  pregnantCategory = 'both',
  firstTimeCattle = [],
  repeatCattle = [],
  lactatingData = [],
  dryCowsData = [],
  bullsData = [],
  grazingSystem = 'no_grazing',
  grazingData = {},
  waterVolume = 0,
  waterSource = '',
  waterQuality = '',
  selectedFeeds = [],
  totalHerdWeightKg = 0,
  totalDailyMilkL = 0,
  totalCattleCount = 0,
  currentLang = 'en'
}) {
  if (currentLang === 'ta' || currentLang === 'hi') {
    return await downloadIndicInputDataPDF({
      weather,
      selectedBreed,
      heifersData,
      pregnantCategory,
      firstTimeCattle,
      repeatCattle,
      lactatingData,
      dryCowsData,
      bullsData,
      grazingSystem,
      grazingData,
      waterVolume,
      waterSource,
      waterQuality,
      selectedFeeds,
      totalHerdWeightKg,
      totalDailyMilkL,
      totalCattleCount,
      currentLang
    });
  }
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const locInfo = resolveLocationDetails(weather?.city);
  const farmName = locInfo.farmName;

  addHeader(doc, 'Farm Recorded Input Data', 'Complete Review of Steps 1 to 9', dateStr, farmName);

  let currentY = 36;

  // 1. HERD OVERVIEW & TELEMETRY TABLE
  autoTable(doc, {
    startY: currentY,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 3, textColor: [15, 23, 42] },
    headStyles: { fillColor: [240, 253, 244], textColor: [21, 128, 61], fontStyle: 'bold', fontSize: 9 },
    head: [['OVERVIEW PARAMETER', 'VALUE', 'CLIMATE & WATER', 'VALUE']],
    body: [
      [
        'Selected Cattle Breed:',
        cleanText(selectedBreed?.name || 'Not selected'),
        'Location / City:',
        cleanText(weather?.city || 'Not detected')
      ],
      [
        'Total Recorded Animals:',
        `${totalCattleCount} head`,
        'Ambient Temperature:',
        `${Math.round(weather?.tempC || 30)} °C`
      ],
      [
        'Total Herd Biomass:',
        `${totalHerdWeightKg.toLocaleString()} kg`,
        'Relative Humidity:',
        `${weather?.humidity || 65} %`
      ],
      [
        'Daily Milk Yield:',
        `${totalDailyMilkL} Liters/day`,
        'Daily Water Available:',
        `${waterVolume} Liters/day (${cleanText(waterSource || 'Farm Supply')})`
      ],
      [
        'Herd Composition:',
        `${lactatingData.length} Milking, ${(pregnantCategory === 'firstTime' ? firstTimeCattle.length : pregnantCategory === 'repeat' ? repeatCattle.length : firstTimeCattle.length + repeatCattle.length)} Pregnant, ${heifersData.length} Heifers, ${dryCowsData.length} Dry, ${bullsData.length} Bulls`,
        'Water Quality:',
        cleanText(waterQuality || 'Clean drinking water')
      ]
    ],
    columnStyles: {
      0: { fontStyle: 'bold', width: 45 },
      1: { width: 50 },
      2: { fontStyle: 'bold', width: 45 },
      3: { width: 45 }
    }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // 2. MILKING COWS TABLE (IF ANY)
  if (lactatingData && lactatingData.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Animal Tag / Title', 'Parity', 'Body Weight', 'Lactation Stage', 'BCS Score', 'Milk Yield', 'Milk Fat %']],
      body: lactatingData.map((cow, i) => [
        i + 1,
        cleanText(cow.title || cow.tag || `Milking Cow #${i + 1}`),
        cleanText((cow.lactationType === 'first_lactation' || cow.isFirstLactation) ? '1st Lactation' : '2nd+ Lactation'),
        `${cow.weight || 0} kg`,
        cleanText(cow.stage || 'Mid lactation'),
        `BCS ${cow.bcs ?? 3.0}`,
        `${cow.milkYield || 0} L/day`,
        `${cow.fat || cow.milkFat || 4.2} %`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 2.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 3. PREGNANT CATTLE TABLE (IF ANY)
  const allPregnant = [
    ...firstTimeCattle.map((c, i) => ({ ...c, type: 'First-time Pregnant', index: i + 1 })),
    ...repeatCattle.map((c, i) => ({ ...c, type: 'Repeat Pregnant', index: i + 1 }))
  ];
  if (allPregnant.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Animal Tag / Title', 'Pregnancy Type', 'Weight', 'Gestation Stage']],
      body: allPregnant.map((c, i) => [
        i + 1,
        cleanText(c.title || c.tag || `Pregnant Cattle #${i + 1}`),
        cleanText(c.type),
        `${c.weight || 0} kg`,
        c.inputType === 'days' ? `${c.pregDays || 0} days` : `Month ${c.pregMonth || 1}`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [194, 65, 12], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 2.5 },
      alternateRowStyles: { fillColor: [255, 250, 245] }
    });
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 4. HEIFERS TABLE (IF ANY)
  if (heifersData && heifersData.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Animal Tag / Title', 'Body Weight', 'Age / Category']],
      body: heifersData.map((h, i) => [
        i + 1,
        cleanText(h.title || h.tag || `Heifer #${i + 1}`),
        `${h.weight || 0} kg`,
        cleanText(h.age ? `${h.age} months` : 'Growing heifer')
      ]),
      theme: 'grid',
      headStyles: { fillColor: [101, 163, 13], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 2.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 5. DRY COWS & BULLS (IF ANY)
  if ((dryCowsData && dryCowsData.length > 0) || (bullsData && bullsData.length > 0)) {
    const dryAndBulls = [
      ...dryCowsData.map((c, i) => [
        'Dry Cow',
        i + 1,
        `${c.weight || 0} kg`,
        cleanText(c.dryDays ? `Rest period (${c.dryDays} days)` : (c.reason || 'Rest period'))
      ]),
      ...bullsData.map((b, i) => ['Bull', i + 1, `${b.weight || 0} kg`, cleanText(b.purpose || 'Breeding / Farm work')])
    ];
    autoTable(doc, {
      startY: currentY,
      head: [['Group', '#', 'Body Weight', 'Purpose / Notes']],
      body: dryAndBulls,
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 2.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 6. GRAZING MANAGEMENT TABLE
  const grazingRows = [];
  const catNames = [
    { key: 'lactating', label: 'Milking Cows' },
    { key: 'pregnant', label: 'Pregnant Cattle' },
    { key: 'heifers', label: 'Heifers' },
    { key: 'dry', label: 'Dry Cows' },
    { key: 'bulls', label: 'Bulls' }
  ];
  catNames.forEach(cat => {
    const d = grazingData[cat.key];
    if (d && (d.hours > 0 || d.location === 'outside')) {
      grazingRows.push([
        cat.label,
        d.location === 'outside' ? 'Outside Farm Grazing' : 'Inside Farm Grazing',
        `${d.hours || 0} hours/day`,
        d.location === 'outside' && d.distance ? `${d.distance} km` : '0 km (Stall / Pasture)'
      ]);
    }
  });

  if (grazingRows.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Cattle Category', 'Grazing System', 'Grazing Duration', 'Walking Distance']],
      body: grazingRows,
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 2.5 },
      alternateRowStyles: { fillColor: [240, 253, 244] }
    });
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 7. AVAILABLE FEED INVENTORY TABLE
  if (selectedFeeds && selectedFeeds.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Feed / Fodder Ingredient', 'Category', 'Available Daily Quantity', 'Dry Matter (DM) %']],
      body: selectedFeeds.map((f, i) => [
        i + 1,
        cleanText(f.name || 'Feed ingredient'),
        cleanText(f.category || 'Roughage / Concentrate'),
        `${f.quantityKg || 0} kg / day`,
        `${f.dmPct || 'N/A'} %`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [22, 101, 52], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 2.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });
  }

  addFooters(doc);

  const safeCity = (weather?.city || 'DairyFarm').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Farm_Input_Data_${safeCity}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Multilingual labels dictionary for Feeding Advisory PDF export
 */
const PDF_LANG_MAP = {
  en: {
    titleApproved: 'Herd Precision Feeding & Ration Report (Approved)',
    titleIncomplete: 'Herd Feeding Advisory (PROVISIONAL - Ration Incomplete)',
    titleAdjustment: 'Herd Feeding Advisory (PROVISIONAL - Needs Adjustment)',
    subApproved: 'Approved Scientific Nutritional Plan',
    subIncomplete: 'WARNING: Incomplete Diet - Action Required on Feed Deficit',
    subAdjustment: 'Nutritional Gap Advisory - Adjustment Needed Before Final Adoption',
    alertIncomplete: 'CRITICAL NOTICE: RATION INCOMPLETE. Dry matter intake is below herd requirement. Do NOT use as final production ration.',
    alertAdjustment: 'PROVISIONAL ADVISORY: RATION REQUIRES ADJUSTMENT. Specific nutrient or management gates flagged below before final adoption.',
    part1Header: '1. INDIVIDUAL CATTLE DAILY FEEDING PLAN (PRACTICAL BARN GUIDE)',
    part2Header: '2. SCIENTIFIC DATA CALCULATIONS & NUTRITIONAL AUDIT',
    milkingTitle: 'MILKING COWS - DAILY PRACTICAL FEEDING PLAN',
    pregnantTitle: 'PREGNANT CATTLE - DAILY PRACTICAL FEEDING PLAN',
    heiferTitle: 'GROWING HEIFERS - DAILY PRACTICAL FEEDING PLAN',
    dryTitle: 'DRY COWS - DAILY PRACTICAL FEEDING PLAN',
    bullTitle: 'BREEDING BULLS - DAILY PRACTICAL FEEDING PLAN',
    herdFeedTitle: "TODAY'S HERD FEED RECOMMENDATION & SHORTAGE COMPARISON",
    colsMilking: ['Milking Cow', 'Weight', 'Lactation & BCS', 'Milk Yield', 'Green Fodder', 'Dry Fodder', 'Concentrate Breakdown', 'Mineral Mix', 'Salt', 'Water'],
    colsPregnant: ['Pregnant Cattle', 'Type', 'Weight', 'Gestation Stage', 'Green Fodder', 'Dry Fodder', 'Concentrate Breakdown', 'Mineral Mix', 'Salt', 'Water'],
    colsHeifer: ['Growing Heifer', 'Weight', 'Green Fodder', 'Dry Fodder', 'Concentrate Breakdown', 'Mineral Mix', 'Salt', 'Water'],
    colsDry: ['Dry Cow', 'Weight', 'Days Dry', 'Green Fodder', 'Dry Fodder', 'Concentrate Breakdown', 'Mineral Mix', 'Salt', 'Water'],
    colsBull: ['Breeding Bull', 'Weight', 'Green Fodder', 'Dry Fodder', 'Concentrate Breakdown', 'Mineral Mix', 'Salt', 'Water'],
    colsHerdFeeds: ['Feed Ingredient', 'Category / Details', 'What You Put', 'Herd Needs Today', 'Shortage / Extra Needed'],
    colsTelemetry: ['HERD PARAMETER', 'VALUE', 'NUTRITION & CLIMATE', 'VALUE'],
    colsNutBalance: ['Nutrient Parameter', 'Herd Requirement', 'Current Supply (Your Input)', 'Current Status', 'Recommended Supply', 'Recommended Status'],
    safetyGateTitle: 'PRE-REPORT SAFETY GATE CHECKLIST',
    colsSafetyGate: ['CHECK ITEM', 'STATUS', 'METRIC & SAFE BOUNDS'],
    feasibilityTitle: 'RATION FEASIBILITY ALERT',
    advisoryTitle: 'FARM MANAGEMENT & FEEDING ADVISORY'
  },
  ta: {
    titleApproved: 'PALLIPATTI THEEVANA ARIKKAI (TAMIL EDITION - APPROVED)',
    titleIncomplete: 'THEEVANA VALIKATTAL (THARKKALIKAM - NIRAMBAADHA THEEVANAM)',
    titleAdjustment: 'THEEVANA VALIKATTAL (THARKKALIKAM - SARISEYDHAL THEVAI)',
    subApproved: 'Angikarikkappatta Ariviyal Theevana Thittam',
    subIncomplete: 'Echcharikkai: Theevana Kuraipaadu - Udanaadi Matram Thevai',
    subAdjustment: 'Chathu Samanilai Arikkai - Kadantha Theevanam',
    alertIncomplete: 'MUKKIYA ECHCHARIKKAI: Theevanam Muluvathum Poorthiyaagavillai. Kooduthal theevanam thevai.',
    alertAdjustment: 'GAVANIKKAVUM: Theevanathil sila chathu mattrangal thevaipadukiradhu.',
    part1Header: '1. OVVORU MAATTIRKUMANA INREYA THEEVANA ALAVU (INDIVIDUAL CATTLE DAILY FEEDING PLAN)',
    part2Header: '2. ARIVIYAL KANAKKEEDU MATRUM CHATHU SAMANILAI (SCIENTIFIC DATA & NUTRITION AUDIT)',
    milkingTitle: 'KADAVAI MAADUKAL - INREYA THEEVANA THITTAM (MILKING COWS)',
    pregnantTitle: 'CHINAKKAALNADAI - INREYA THEEVANA THITTAM (PREGNANT CATTLE)',
    heiferTitle: 'KIDAARI MAADUKAL - INREYA THEEVANA THITTAM (GROWING HEIFERS)',
    dryTitle: 'KARAVAI NINDRA MAADUKAL - THEEVANA THITTAM (DRY COWS)',
    bullTitle: 'VITHAI KAALAIGAL - THEEVANA THITTAM (BREEDING BULLS)',
    herdFeedTitle: 'INREYA PANNIKKANA MOTHATHEEVANAM & PATTRAKKURAI (HERD RATIONS)',
    colsMilking: ['Kadavai Maadu', 'Edai (kg)', 'Nilai & BCS', 'Paal Alavu', 'Pasuntheevanam', 'Ular Theevanam', 'Adartheevanam (Feeds)', 'Thaathukkal', 'Uppu', 'Kudineer'],
    colsPregnant: ['Chinakkaalnadai', 'Vagai', 'Edai (kg)', 'Chinam Matham', 'Pasuntheevanam', 'Ular Theevanam', 'Adartheevanam (Feeds)', 'Thaathukkal', 'Uppu', 'Kudineer'],
    colsHeifer: ['Kidaari Maadu', 'Edai (kg)', 'Pasuntheevanam', 'Ular Theevanam', 'Adartheevanam (Feeds)', 'Thaathukkal', 'Uppu', 'Kudineer'],
    colsDry: ['Karavai Nindra Maadu', 'Edai (kg)', 'Dry Naatkal', 'Pasuntheevanam', 'Ular Theevanam', 'Adartheevanam (Feeds)', 'Thaathukkal', 'Uppu', 'Kudineer'],
    colsBull: ['Vithai Kaalai', 'Edai (kg)', 'Pasuntheevanam', 'Ular Theevanam', 'Adartheevanam (Feeds)', 'Thaathukkal', 'Uppu', 'Kudineer'],
    colsHerdFeeds: ['Theevana Porul (Feed)', 'Vagai / Vivaram', 'Neengal Koduppathu', 'Inreiya Thevai', 'Pattrakkurai / Status'],
    colsTelemetry: ['PANNAI PARAMETER', 'ALAVU', 'CHATHU & KALAVASTHAI', 'ALAVU'],
    colsNutBalance: ['Chathu Vivaram', 'Pannai Thevai', 'Ippothu Koduppathu', 'Nilai (Current)', 'Parinthuraikkappattathu', 'Nilai (Rec)'],
    safetyGateTitle: 'ARIKKAIKKU MUNTHAIYA PAATHUKAAPPUS SARIPAARPPU (SAFETY GATES)',
    colsSafetyGate: ['SARIPAARPPU AMAMSAM', 'NILAI', 'ALAVEEDU & PAATHUKAAPPUS ELLAI'],
    feasibilityTitle: 'THEEVANA AMMAIPPU ECHCHARIKKAI (FEASIBILITY ALERT)',
    advisoryTitle: 'PANNAI PARAMAARIPPU MATRUM THEEVANA VALIKATTALGAL (ADVISORY)'
  },
  hi: {
    titleApproved: 'DAIRY PASHU POSHAN REPORT (HINDI EDITION - APPROVED)',
    titleIncomplete: 'CHARA SALAH REPORT (ASTHAYI - CHARA APURN)',
    titleAdjustment: 'CHARA SALAH REPORT (ASTHAYI - BADLAV AAVASHYAK)',
    subApproved: 'Swikrit Vaigyanik Poshan Evam Chara Yojna',
    subIncomplete: 'Chetavani: Aahar Apoornta - Tatkal Kadam Uthayein',
    subAdjustment: 'Poshan Antar Salah - Parinaam Sudhar Aavashyak',
    alertIncomplete: 'CRITICAL NOTICE: Chara Apoornta hai. Shushk Padarth ki kami poori karein.',
    alertAdjustment: 'GHYAN DEIN: Kuchh poshan tatvon mein badlav ki zaroorat hai.',
    part1Header: '1. PRATYEK PASHU KI DAINIK CHARA MATRA (INDIVIDUAL CATTLE DAILY FEEDING PLAN)',
    part2Header: '2. VAIGYANIK GANANA EVAM POSHAN AUDIT (SCIENTIFIC DATA & NUTRITION AUDIT)',
    milkingTitle: 'DUDHARU GAYEIN - DAINIK CHARA YOJNA (MILKING COWS)',
    pregnantTitle: 'GARBHAVATI PASHU - DAINIK CHARA YOJNA (PREGNANT CATTLE)',
    heiferTitle: 'BACCHIYA - DAINIK CHARA YOJNA (GROWING HEIFERS)',
    dryTitle: 'SOOKHI GAYEIN - CHARA YOJNA (DRY COWS)',
    bullTitle: 'PRAJANAN SAAND - CHARA YOJNA (BREEDING BULLS)',
    herdFeedTitle: 'AAJ KUL JHUND KI CHARA SIFARISH EVAM KAMI (HERD RATIONS)',
    colsMilking: ['Dudharu Gaay', 'Bhaar (kg)', 'Awastha & BCS', 'Doodh Matra', 'Hara Chara', 'Sookha Chara', 'Dana Mishran (Feeds)', 'Khanij', 'Namak', 'Paani'],
    colsPregnant: ['Garbhavati Pashu', 'Shreni', 'Bhaar (kg)', 'Garbh Mahina', 'Hara Chara', 'Sookha Chara', 'Dana Mishran (Feeds)', 'Khanij', 'Namak', 'Paani'],
    colsHeifer: ['Bacchiya', 'Bhaar (kg)', 'Hara Chara', 'Sookha Chara', 'Dana Mishran (Feeds)', 'Khanij', 'Namak', 'Paani'],
    colsDry: ['Sookhi Gaay', 'Bhaar (kg)', 'Sookhe Din', 'Hara Chara', 'Sookha Chara', 'Dana Mishran (Feeds)', 'Khanij', 'Namak', 'Paani'],
    colsBull: ['Prajanan Saand', 'Bhaar (kg)', 'Hara Chara', 'Sookha Chara', 'Dana Mishran (Feeds)', 'Khanij', 'Namak', 'Paani'],
    colsHerdFeeds: ['Aahar Samagri (Feed)', 'Shreni / Vivaran', 'Aapka Chara', 'Jhund Ki Zaroorat', 'Kami / Sthiti'],
    colsTelemetry: ['FARM PARAMETER', 'MATRA', 'POSHAN EVAM MAUSAM', 'MATRA'],
    colsNutBalance: ['Poshan Tatva', 'Jhund Aavashyakta', 'Vartaman Chara', 'Sthiti (Current)', 'Sifarish Matra', 'Sthiti (Rec)'],
    safetyGateTitle: 'REPORT-PURV SURAKSHA SATYAPAN CHECKLIST (SAFETY GATES)',
    colsSafetyGate: ['SURAKSHA BINDU', 'STHITI', 'MANAK EVAM SURAKSHIT SIMA'],
    feasibilityTitle: 'CHARA SANRACHNA CHETAVANI (FEASIBILITY ALERT)',
    advisoryTitle: 'FARM PRABHANDHAN EVAM CHARA SALAH (ADVISORY)'
  }
};

/**
 * EXPORT 2: DOWNLOAD COMPLETE GENERATED NUTRITION & FEEDING REPORT AS A COLORFUL PDF
 * Structured with Practical Individual Cattle Quantities FIRST and Scientific Calculations LAST.
 * Supports English ('en'), Tamil ('ta'), and Hindi ('hi') language output.
 */
export async function downloadFeedingReportPDF({
  calcResult,
  weather,
  selectedBreed,
  totalCattleCount = 0,
  totalHerdWeightKg = 0,
  totalDailyMilkL = 0,
  waterVolume = 0,
  selectedFeeds = [],
  reportLang = 'en'
}) {
  if (!calcResult) {
    alert('Please generate the nutrition calculation first before downloading the PDF report.');
    return;
  }

  if (reportLang === 'ta' || reportLang === 'hi') {
    return await downloadIndicFeedingReportPDF({
      calcResult,
      weather,
      selectedBreed,
      totalCattleCount,
      totalHerdWeightKg,
      totalDailyMilkL,
      waterVolume,
      selectedFeeds,
      reportLang
    });
  }

  const langKey = (reportLang === 'ta' || reportLang === 'hi') ? reportLang : 'en';
  const L = PDF_LANG_MAP[langKey];

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const locInfo = resolveLocationDetails(weather?.city);
  const farmName = locInfo.farmName;

  const overallStatus = calcResult.practicalFeedingReport?.overallResult?.status || 'Ration needs adjustment';
  const isApproved = calcResult.practicalFeedingReport?.isApproved ?? false;
  const isIncomplete = overallStatus.toLowerCase().includes('incomplete');

  const reportTitle = isApproved ? L.titleApproved : (isIncomplete ? L.titleIncomplete : L.titleAdjustment);
  const subTitle = isApproved ? L.subApproved : (isIncomplete ? L.subIncomplete : L.subAdjustment);

  addHeader(doc, reportTitle, subTitle, dateStr, farmName);

  let currentY = 36;

  // Advisory alert banner if ration needs adjustment or is incomplete
  if (!isApproved) {
    const alertBg = isIncomplete ? [254, 242, 242] : [255, 251, 235];
    const alertBorder = isIncomplete ? [239, 68, 68] : [245, 158, 11];
    const alertText = isIncomplete ? [153, 27, 27] : [146, 64, 14];
    doc.setFillColor(...alertBg);
    doc.setDrawColor(...alertBorder);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, currentY, 182, 11, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...alertText);
    const alertMsg = isIncomplete ? L.alertIncomplete : L.alertAdjustment;
    doc.text(alertMsg, 17, currentY + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    const subAlert = isIncomplete
      ? 'Please supply the additional feed quantities listed in the Shortage column to reach 100% herd dry matter intake.'
      : (calcResult.practicalFeedingReport?.overallResult?.reason || 'Adjust feed allocations according to scientific safety gates.');
    const splitSub = doc.splitTextToSize(subAlert, 175);
    doc.text(splitSub[0] || subAlert, 17, currentY + 8.5);
    currentY += 14;
  }

  // Quick Executive Herd Daily Feeding Banner
  const totalFreshFeed = calcResult.practicalFeedingReport?.totalFreshFeedKg || 0;
  const herdMinG = calcResult.practicalFeedingReport?.herdSummary?.mineralMixtureTotalG || calcResult.practicalFeedingReport?.mineralMixtureGrams || 250;
  const herdSaltG = calcResult.practicalFeedingReport?.herdSummary?.saltTotalG || calcResult.practicalFeedingReport?.saltGrams || 150;
  const waterReq = Math.round(Number(calcResult.waterAnalysis?.requiredLiters || calcResult.waterAnalysis?.waterRequiredLiters || calcResult.practicalFeedingReport?.waterLiters || 0));

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, currentY, pageWidth - 28, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(21, 128, 61);
  const summaryTitleText = langKey === 'ta' ? 'INREYA PANNIKKANA MOTHATHEEVANAM (TODAY TOTAL HERD FEED REQUIREMENT):' : langKey === 'hi' ? 'AAJ KUL JHUND KI CHARA AAVASHYAKTA (TODAY TOTAL HERD FEEDING):' : 'TODAY TOTAL HERD FEEDING REQUIREMENT (WHAT TO MIX & FEED TODAY):';
  doc.text(summaryTitleText, 17, currentY + 4.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(15, 23, 42);
  const summaryLine = `Total Cattle: ${totalCattleCount} Head  |  Total Fresh Feed: ${totalFreshFeed} kg/day  |  Minerals: ${herdMinG} g/day  |  Salt: ${herdSaltG} g/day  |  Clean Water: ${waterReq} L/day`;
  doc.text(summaryLine, 17, currentY + 9.8);
  currentY += 18;

  // =========================================================================
  // PART 1 (FIRST): INDIVIDUAL CATTLE DAILY FEEDING PLANS
  // Shows exact quantities of Green Fodder, Dry Fodder, Concentrate, Minerals,
  // Salt, and Water for each cow, pregnant cattle, heifer, dry cow, and bull!
  // =========================================================================

  // Prominent Section Header: Part 1
  doc.setFillColor(2, 132, 199); // Ocean Cyan
  doc.roundedRect(14, currentY, pageWidth - 28, 7.5, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(L.part1Header, 17, currentY + 5.2);
  currentY += 11;

  // 1A. INDIVIDUAL MILKING COW FEEDING PLAN (IF ANY)
  const milkingAnimals = calcResult.practicalFeedingReport?.perCategory?.milkingCow?.animals || [];
  if (milkingAnimals.length > 0) {
    const hasMilkingGreen = milkingAnimals.some(c => (c.greenFodderKg || 0) > 0);
    const hasMilkingDry = milkingAnimals.some(c => (c.dryFodderKg || 0) > 0);
    const hasMilkingConc = milkingAnimals.some(c => (c.concentrateKg || 0) > 0);

    const headMilking = [
      cleanText(langKey === 'ta' ? 'Kadavai Maadu' : langKey === 'hi' ? 'Dudharu Gaay' : 'Milking Cow'),
      cleanText(langKey === 'ta' ? 'Edai (kg)' : langKey === 'hi' ? 'Bhaar (kg)' : 'Weight'),
      cleanText(langKey === 'ta' ? 'Nilai & BCS' : langKey === 'hi' ? 'Awastha & BCS' : 'Lactation & BCS'),
      cleanText(langKey === 'ta' ? 'Paal Alavu & Ilakku' : langKey === 'hi' ? 'Doodh Matra & Lakshya' : 'Milk Yield & Target'),
      ...(hasMilkingGreen ? [cleanText(langKey === 'ta' ? 'Pasuntheevanam (kg)' : langKey === 'hi' ? 'Hara Chara (kg)' : 'Green Fodder (kg)')] : []),
      ...(hasMilkingDry ? [cleanText(langKey === 'ta' ? 'Ular Theevanam (kg)' : langKey === 'hi' ? 'Sookha Chara (kg)' : 'Dry Fodder (kg)')] : []),
      ...(hasMilkingConc ? [cleanText(langKey === 'ta' ? 'Adartheevanam (kg)' : langKey === 'hi' ? 'Dana Mishran (kg)' : 'Concentrate (kg)')] : []),
      cleanText(langKey === 'ta' ? 'Thaathukkal (g)' : langKey === 'hi' ? 'Khanij (g)' : 'Mineral Mix (g)'),
      cleanText(langKey === 'ta' ? 'Uppu (g)' : langKey === 'hi' ? 'Namak (g)' : 'Salt (g)'),
      cleanText(langKey === 'ta' ? 'Kudineer (L)' : langKey === 'hi' ? 'Paani (L)' : 'Water (L)')
    ];

    autoTable(doc, {
      startY: currentY,
      head: [headMilking],
      body: milkingAnimals.map((cow, i) => {
        const isFeas = cow.isFeasible !== false;
        const milkText = `${cow.milkYieldL} L (${cow.milkFatPct}% fat)${cow.targetMilkYieldL ? `\nTarget: ${cow.targetMilkYieldL} L (${cow.projectedMilkFatPct || cow.milkFatPct}% fat)` : ''}`;
        
        const row = [
          cleanText(cow.title || (langKey === 'ta' ? `Kadavai #${i + 1}` : langKey === 'hi' ? `Dudharu #${i + 1}` : `Cow #${i + 1}`)),
          `${cow.weightKg} kg`,
          `${cleanText(cow.stage || 'Mid lact.')} (BCS ${cow.bcs ?? 3.0})`,
          milkText
        ];

        if (hasMilkingGreen) {
          row.push(cow.greenFodderKg > 0 ? `${cow.greenFodderKg} kg` : '—');
        }
        if (hasMilkingDry) {
          const dryStr = (cow.dryFodderKg > 0 && cow.dryFodderDetails && !cow.dryFodderDetails.startsWith('0'))
            ? `${cow.dryFodderKg} kg\n(${cleanText(cow.dryFodderDetails)})`
            : `${cow.dryFodderKg} kg`;
          row.push(cow.dryFodderKg > 0 ? dryStr : '—');
        }
        if (hasMilkingConc) {
          const concStr = (cow.concentrateKg > 0 && cow.concentrateDetails && !cow.concentrateDetails.startsWith('0'))
            ? `${cow.concentrateKg} kg\n(${cleanText(cow.concentrateDetails)})`
            : `${cow.concentrateKg} kg`;
          row.push(cow.concentrateKg > 0 ? concStr : '—');
        }

        row.push(`${cow.mineralMixtureG} g`);
        row.push(`${cow.saltG || 40} g`);
        row.push(`${cow.waterLiters} L`);

        return row;
      }),
      theme: 'grid',
      headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
      styles: { fontSize: 7.0, cellPadding: 2.0 },
      alternateRowStyles: { fillColor: [240, 249, 255] }
    });

    currentY = doc.lastAutoTable.finalY + 7;
  }

  // 1B. INDIVIDUAL PREGNANT CATTLE FEEDING PLAN
  const pregnantAnimals = calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.animals || [];
  if (pregnantAnimals.length > 0) {
    const hasPregGreen = pregnantAnimals.some(c => (c.greenFodderKg || 0) > 0);
    const hasPregDry = pregnantAnimals.some(c => (c.dryFodderKg || 0) > 0);
    const hasPregConc = pregnantAnimals.some(c => (c.concentrateKg || 0) > 0);

    const headPregnant = [
      cleanText(langKey === 'ta' ? 'Chinakkaalnadai' : langKey === 'hi' ? 'Garbhavati Pashu' : 'Pregnant Cattle'),
      cleanText(langKey === 'ta' ? 'Vagai' : langKey === 'hi' ? 'Shreni' : 'Type'),
      cleanText(langKey === 'ta' ? 'Edai (kg)' : langKey === 'hi' ? 'Bhaar (kg)' : 'Weight'),
      cleanText(langKey === 'ta' ? 'Chinam & Karu Valarchi' : langKey === 'hi' ? 'Garbh & Bachha Lakshya' : 'Gestation & Fetal Projection'),
      ...(hasPregGreen ? [cleanText(langKey === 'ta' ? 'Pasuntheevanam (kg)' : langKey === 'hi' ? 'Hara Chara (kg)' : 'Green Fodder (kg)')] : []),
      ...(hasPregDry ? [cleanText(langKey === 'ta' ? 'Ular Theevanam (kg)' : langKey === 'hi' ? 'Sookha Chara (kg)' : 'Dry Fodder (kg)')] : []),
      ...(hasPregConc ? [cleanText(langKey === 'ta' ? 'Adartheevanam (kg)' : langKey === 'hi' ? 'Dana Mishran (kg)' : 'Concentrate (kg)')] : []),
      cleanText(langKey === 'ta' ? 'Thaathukkal (g)' : langKey === 'hi' ? 'Khanij (g)' : 'Mineral Mix (g)'),
      cleanText(langKey === 'ta' ? 'Uppu (g)' : langKey === 'hi' ? 'Namak (g)' : 'Salt (g)'),
      cleanText(langKey === 'ta' ? 'Kudineer (L)' : langKey === 'hi' ? 'Paani (L)' : 'Water (L)')
    ];

    autoTable(doc, {
      startY: currentY,
      head: [headPregnant],
      body: pregnantAnimals.map((cow, i) => {
        const stageText = `${cleanText(cow.stage || `Month ${cow.pregMonth || '?'}`)}\nFetal: +${cow.fetalDailyGainG || 350}g/d${cow.projectedCalfBirthWeightKg ? ` (Calf ~${cow.projectedCalfBirthWeightKg}kg)` : ''}`;
        
        const row = [
          cleanText(cow.title || (langKey === 'ta' ? `Chinam #${i + 1}` : langKey === 'hi' ? `Garbhavati #${i + 1}` : `Pregnant #${i + 1}`)),
          cleanText(cow.type || 'Pregnant'),
          `${cow.weightKg} kg`,
          stageText
        ];

        if (hasPregGreen) {
          row.push(`${cow.greenFodderKg} kg`);
        }
        if (hasPregDry) {
          const dryStr = (cow.dryFodderKg > 0 && cow.dryFodderDetails && !cow.dryFodderDetails.startsWith('0'))
            ? `${cow.dryFodderKg} kg\n(${cleanText(cow.dryFodderDetails)})`
            : `${cow.dryFodderKg} kg`;
          row.push(cow.dryFodderKg > 0 ? dryStr : '—');
        }
        if (hasPregConc) {
          const concStr = (cow.concentrateKg > 0 && cow.concentrateDetails && !cow.concentrateDetails.startsWith('0'))
            ? `${cow.concentrateKg} kg\n(${cleanText(cow.concentrateDetails)})`
            : `${cow.concentrateKg} kg`;
          row.push(cow.concentrateKg > 0 ? concStr : '—');
        }

        row.push(`${cow.mineralMixtureG} g`);
        row.push(`${cow.saltG || 35} g`);
        row.push(`${cow.waterLiters} L`);

        return row;
      }),
      theme: 'grid',
      headStyles: { fillColor: [194, 65, 12], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
      styles: { fontSize: 7.0, cellPadding: 2.0 },
      alternateRowStyles: { fillColor: [255, 250, 245] }
    });

    currentY = doc.lastAutoTable.finalY + 7;
  }

  // 1C. INDIVIDUAL GROWING HEIFER FEEDING PLAN
  const heiferAnimals = calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.animals || [];
  if (heiferAnimals.length > 0) {
    const hasHGreen = heiferAnimals.some(h => (h.greenFodderKg || 0) > 0);
    const hasHDry = heiferAnimals.some(h => (h.dryFodderKg || 0) > 0);
    const hasHConc = heiferAnimals.some(h => (h.concentrateKg || 0) > 0);

    const headHeifer = [
      cleanText(langKey === 'ta' ? 'Kidaari Maadu' : langKey === 'hi' ? 'Bacchiya' : 'Growing Heifer'),
      cleanText(langKey === 'ta' ? 'Edai (kg)' : langKey === 'hi' ? 'Bhaar (kg)' : 'Weight'),
      cleanText(langKey === 'ta' ? 'Edai Athikarippu & Ilakku' : langKey === 'hi' ? 'Dainik Vridhi & Lakshya' : 'Daily Gain & AI Target'),
      ...(hasHGreen ? [cleanText(langKey === 'ta' ? 'Pasuntheevanam (kg)' : langKey === 'hi' ? 'Hara Chara (kg)' : 'Green Fodder (kg)')] : []),
      ...(hasHDry ? [cleanText(langKey === 'ta' ? 'Ular Theevanam (kg)' : langKey === 'hi' ? 'Sookha Chara (kg)' : 'Dry Fodder (kg)')] : []),
      ...(hasHConc ? [cleanText(langKey === 'ta' ? 'Adartheevanam (kg)' : langKey === 'hi' ? 'Dana Mishran (kg)' : 'Concentrate (kg)')] : []),
      cleanText(langKey === 'ta' ? 'Thaathukkal (g)' : langKey === 'hi' ? 'Khanij (g)' : 'Mineral Mix (g)'),
      cleanText(langKey === 'ta' ? 'Uppu (g)' : langKey === 'hi' ? 'Namak (g)' : 'Salt (g)'),
      cleanText(langKey === 'ta' ? 'Kudineer (L)' : langKey === 'hi' ? 'Paani (L)' : 'Water (L)')
    ];

    autoTable(doc, {
      startY: currentY,
      head: [headHeifer],
      body: heiferAnimals.map((h, i) => {
        const gainText = `+${h.dailyWeightGainG || 600} g/day\nTarget AI: ${h.targetBreedingWeightKg || 290} kg${h.monthsToBreedingWeight ? ` (~${h.monthsToBreedingWeight} mo)` : ''}`;
        
        const row = [
          cleanText(h.title || (langKey === 'ta' ? `Kidaari #${i + 1}` : langKey === 'hi' ? `Bacchiya #${i + 1}` : `Heifer #${i + 1}`)),
          `${h.weightKg} kg`,
          gainText
        ];

        if (hasHGreen) {
          row.push(`${h.greenFodderKg} kg`);
        }
        if (hasHDry) {
          const dryStr = (h.dryFodderKg > 0 && h.dryFodderDetails && !h.dryFodderDetails.startsWith('0'))
            ? `${h.dryFodderKg} kg\n(${cleanText(h.dryFodderDetails)})`
            : `${h.dryFodderKg} kg`;
          row.push(h.dryFodderKg > 0 ? dryStr : '—');
        }
        if (hasHConc) {
          const concStr = (h.concentrateKg > 0 && h.concentrateDetails && !h.concentrateDetails.startsWith('0'))
            ? `${h.concentrateKg} kg\n(${cleanText(h.concentrateDetails)})`
            : `${h.concentrateKg} kg`;
          row.push(h.concentrateKg > 0 ? concStr : '—');
        }

        row.push(`${h.mineralMixtureG} g`);
        row.push(`${h.saltG || 25} g`);
        row.push(`${h.waterLiters} L`);

        return row;
      }),
      theme: 'grid',
      headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
      styles: { fontSize: 7.0, cellPadding: 2.0 },
      alternateRowStyles: { fillColor: [240, 253, 250] }
    });

    currentY = doc.lastAutoTable.finalY + 7;
  }

  // 1D. INDIVIDUAL DRY COW FEEDING PLAN
  const dryAnimals = calcResult.practicalFeedingReport?.perCategory?.dryCow?.animals || [];
  if (dryAnimals.length > 0) {
    const hasDryGreen = dryAnimals.some(d => (d.greenFodderKg || 0) > 0);
    const hasDryDry = dryAnimals.some(d => (d.dryFodderKg || 0) > 0);
    const hasDryConc = dryAnimals.some(d => (d.concentrateKg || 0) > 0);

    const headDry = [
      cleanText(langKey === 'ta' ? 'Karavai Nindra Maadu' : langKey === 'hi' ? 'Sookhi Gaay' : 'Dry Cow'),
      cleanText(langKey === 'ta' ? 'Edai (kg)' : langKey === 'hi' ? 'Bhaar (kg)' : 'Weight'),
      cleanText(langKey === 'ta' ? 'Dry Naatkal & Ilakku' : langKey === 'hi' ? 'Sookhe Din & Lakshya' : 'Days Dry & Calving Target'),
      ...(hasDryGreen ? [cleanText(langKey === 'ta' ? 'Pasuntheevanam (kg)' : langKey === 'hi' ? 'Hara Chara (kg)' : 'Green Fodder (kg)')] : []),
      ...(hasDryDry ? [cleanText(langKey === 'ta' ? 'Ular Theevanam (kg)' : langKey === 'hi' ? 'Sookha Chara (kg)' : 'Dry Fodder (kg)')] : []),
      ...(hasDryConc ? [cleanText(langKey === 'ta' ? 'Adartheevanam (kg)' : langKey === 'hi' ? 'Dana Mishran (kg)' : 'Concentrate (kg)')] : []),
      cleanText(langKey === 'ta' ? 'Thaathukkal (g)' : langKey === 'hi' ? 'Khanij (g)' : 'Mineral Mix (g)'),
      cleanText(langKey === 'ta' ? 'Uppu (g)' : langKey === 'hi' ? 'Namak (g)' : 'Salt (g)'),
      cleanText(langKey === 'ta' ? 'Kudineer (L)' : langKey === 'hi' ? 'Paani (L)' : 'Water (L)')
    ];

    autoTable(doc, {
      startY: currentY,
      head: [headDry],
      body: dryAnimals.map((d, i) => {
        const dryText = `${d.dryDays !== undefined ? d.dryDays : 45} days\nCalving Wt: ~${d.targetCalvingWeightKg || (d.weightKg + 30)} kg`;

        const row = [
          cleanText(d.title || (langKey === 'ta' ? `Dry Maadu #${i + 1}` : langKey === 'hi' ? `Sookhi Gaay #${i + 1}` : `Dry Cow #${i + 1}`)),
          `${d.weightKg} kg`,
          dryText
        ];

        if (hasDryGreen) {
          row.push(`${d.greenFodderKg} kg`);
        }
        if (hasDryDry) {
          const dryStr = (d.dryFodderKg > 0 && d.dryFodderDetails && !d.dryFodderDetails.startsWith('0'))
            ? `${d.dryFodderKg} kg\n(${cleanText(d.dryFodderDetails)})`
            : `${d.dryFodderKg} kg`;
          row.push(d.dryFodderKg > 0 ? dryStr : '—');
        }
        if (hasDryConc) {
          const concStr = (d.concentrateKg > 0 && d.concentrateDetails && !d.concentrateDetails.startsWith('0'))
            ? `${d.concentrateKg} kg\n(${cleanText(d.concentrateDetails)})`
            : `${d.concentrateKg} kg`;
          row.push(d.concentrateKg > 0 ? concStr : '—');
        }

        row.push(`${d.mineralMixtureG} g`);
        row.push(`${d.saltG || 30} g`);
        row.push(`${d.waterLiters} L`);

        return row;
      }),
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
      styles: { fontSize: 7.0, cellPadding: 2.0 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    currentY = doc.lastAutoTable.finalY + 7;
  }

  // 1E. INDIVIDUAL BREEDING BULL FEEDING PLAN
  const bullAnimals = calcResult.practicalFeedingReport?.perCategory?.bull?.animals || [];
  if (bullAnimals.length > 0) {
    const hasBullGreen = bullAnimals.some(b => (b.greenFodderKg || 0) > 0);
    const hasBullDry = bullAnimals.some(b => (b.dryFodderKg || 0) > 0);
    const hasBullConc = bullAnimals.some(b => (b.concentrateKg || 0) > 0);

    const headBull = [
      cleanText(langKey === 'ta' ? 'Vithai Kaalai' : langKey === 'hi' ? 'Prajanan Saand' : 'Breeding Bull'),
      cleanText(langKey === 'ta' ? 'Edai (kg)' : langKey === 'hi' ? 'Bhaar (kg)' : 'Weight'),
      cleanText(langKey === 'ta' ? 'Veeriyam & Thagudhi' : langKey === 'hi' ? 'Kshamta & Libido' : 'Breeding Vitality & Libido'),
      ...(hasBullGreen ? [cleanText(langKey === 'ta' ? 'Pasuntheevanam (kg)' : langKey === 'hi' ? 'Hara Chara (kg)' : 'Green Fodder (kg)')] : []),
      ...(hasBullDry ? [cleanText(langKey === 'ta' ? 'Ular Theevanam (kg)' : langKey === 'hi' ? 'Sookha Chara (kg)' : 'Dry Fodder (kg)')] : []),
      ...(hasBullConc ? [cleanText(langKey === 'ta' ? 'Adartheevanam (kg)' : langKey === 'hi' ? 'Dana Mishran (kg)' : 'Concentrate (kg)')] : []),
      cleanText(langKey === 'ta' ? 'Thaathukkal (g)' : langKey === 'hi' ? 'Khanij (g)' : 'Mineral Mix (g)'),
      cleanText(langKey === 'ta' ? 'Uppu (g)' : langKey === 'hi' ? 'Namak (g)' : 'Salt (g)'),
      cleanText(langKey === 'ta' ? 'Kudineer (L)' : langKey === 'hi' ? 'Paani (L)' : 'Water (L)')
    ];

    autoTable(doc, {
      startY: currentY,
      head: [headBull],
      body: bullAnimals.map((b, i) => {
        const row = [
          cleanText(b.title || (langKey === 'ta' ? `Kaalai #${i + 1}` : langKey === 'hi' ? `Saand #${i + 1}` : `Bull #${i + 1}`)),
          `${b.weightKg} kg`,
          cleanText(b.libidoIndex || 'Optimal Libido & Vitality')
        ];

        if (hasBullGreen) {
          row.push(`${b.greenFodderKg} kg`);
        }
        if (hasBullDry) {
          const dryStr = (b.dryFodderKg > 0 && b.dryFodderDetails && !b.dryFodderDetails.startsWith('0'))
            ? `${b.dryFodderKg} kg\n(${cleanText(b.dryFodderDetails)})`
            : `${b.dryFodderKg} kg`;
          row.push(b.dryFodderKg > 0 ? dryStr : '—');
        }
        if (hasBullConc) {
          const concStr = (b.concentrateKg > 0 && b.concentrateDetails && !b.concentrateDetails.startsWith('0'))
            ? `${b.concentrateKg} kg\n(${cleanText(b.concentrateDetails)})`
            : `${b.concentrateKg} kg`;
          row.push(b.concentrateKg > 0 ? concStr : '—');
        }

        row.push(`${b.mineralMixtureG} g`);
        row.push(`${b.saltG || 40} g`);
        row.push(`${b.waterLiters} L`);

        return row;
      }),
      theme: 'grid',
      headStyles: { fillColor: [88, 28, 135], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
      styles: { fontSize: 7.0, cellPadding: 2.0 },
      alternateRowStyles: { fillColor: [250, 245, 255] }
    });

    currentY = doc.lastAutoTable.finalY + 7;
  }

  // 1F. TODAY'S FEED RECOMMENDATION & SHORTAGE COMPARISON TABLE
  const feedRecs = calcResult.practicalFeedingReport?.todayRecommendations || [];
  if (feedRecs.length > 0) {
    const recRows = feedRecs.map(rec => {
      const userKg = rec.userProvidedKg !== undefined
        ? Number(rec.userProvidedKg)
        : (Number(selectedFeeds?.find(f => f.name?.toLowerCase() === rec.name?.toLowerCase())?.quantityKg) || 0);
      const neededKg = Number(rec.recommendedKg) || 0;
      const diffKg = rec.differenceKg !== undefined ? Number(rec.differenceKg) : Math.round((neededKg - userKg) * 10) / 10;

      let statusText = `Covered (${neededKg.toFixed(1)} kg)`;
      if (diffKg > 0.5) statusText = `+${diffKg.toFixed(1)} kg EXTRA NEEDED`;
      else if (diffKg < -0.5) statusText = `${Math.abs(diffKg).toFixed(1)} kg Surplus`;

      return [
        cleanText(rec.name),
        `${cleanText(rec.category)} (${rec.dmPct}% DM)`,
        `${userKg.toFixed(1)} kg/day`,
        `${neededKg.toFixed(1)} kg/day`,
        statusText
      ];
    });

    // Dedicated Pasture Grazing Row if Herd Grazed
    const pastureInfo = calcResult.practicalFeedingReport?.pastureGrazing;
    const pastureDm = Number(calcResult.practicalFeedingReport?.totalPastureDmKg || calcResult.practicalFeedingReport?.pastureDmSuppliedKg) || 0;
    if (pastureInfo || pastureDm > 0) {
      const pFresh = pastureInfo?.recommendedKg || Math.round((pastureDm / 0.22) * 10) / 10;
      const actualDm = pastureInfo?.dmAllocatedKg || pastureDm;
      const rawPastureName = cleanText(pastureInfo?.name || 'Pasture Grazing');
      const labeledPastureName = rawPastureName.includes('Estimated') ? rawPastureName : `${rawPastureName} · Estimated`;
      recRows.push([
        labeledPastureName,
        'Grazing Forage (22% DM · Estimated)',
        labeledPastureName,
        `${pFresh} kg/day (${actualDm.toFixed(2)} kg DM)`,
        'Covered by Grazing'
      ]);
    }

    // Herd total fresh trough feed summary row
    const totalUser = calcResult.practicalFeedingReport?.totalUserProvidedFeedKg ?? 
      (selectedFeeds || []).reduce((acc, f) => acc + (Number(f.quantityKg) || 0), 0);
    const totalNeeded = Number(calcResult.practicalFeedingReport?.totalTroughFreshFeedKg || calcResult.practicalFeedingReport?.totalFreshFeedKg) || 0;
    const troughDm = Number(calcResult.practicalFeedingReport?.totalTroughDmKg || calcResult.practicalFeedingReport?.recommendedFeedDmKg) || 0;
    const totalDiff = calcResult.practicalFeedingReport?.totalFeedDifferenceKg ?? Math.round((totalNeeded - totalUser) * 10) / 10;

    let totalStatus = '100% Fully Covered';
    if (totalDiff > 0.5) totalStatus = `+${totalDiff.toFixed(1)} kg Extra Feed Needed`;
    else if (totalDiff < -0.5) totalStatus = `${Math.abs(totalDiff).toFixed(1)} kg Surplus`;

    recRows.push([
      'TOTAL TROUGH FRESH FEED',
      `Harvested Rations (${troughDm.toFixed(2)} kg DM)`,
      `${totalUser.toFixed(1)} kg/day`,
      `${totalNeeded.toFixed(1)} kg/day`,
      totalStatus
    ]);

    // Total Herd DMI Balance Row
    const dmiReqVal = calcResult.practicalFeedingReport?.totalEstimatedDmiReqKg ??
                      calcResult.nutritionAnalysis?.currentNutrition?.dmi?.requiredKg ??
                      calcResult.nutritionAnalysis?.dmiRequiredKg ??
                      (totalHerdWeightKg > 0 ? (totalHerdWeightKg * 0.026).toFixed(1) : '0');
    const recDmiTotal = Number(calcResult.practicalFeedingReport?.totalHerdDmiSuppliedKg || calcResult.practicalFeedingReport?.recommendedTotalDmKg) || 0;
    const reqDmiTotal = Number(calcResult.practicalFeedingReport?.totalEstimatedDmiReqKg || calcResult.nutritionAnalysis?.dmiRequiredKg) || dmiReqVal;
    const curTroughDm = Number(calcResult.practicalFeedingReport?.currentFeedDmKg || 0);
    const currentTotalDm = Number(
      calcResult.practicalFeedingReport?.totalCurrentDmIngestedKg || (curTroughDm + pastureDm)
    ) || curTroughDm;

    let dmiBalanceStatus = '';
    const dmiRatio = reqDmiTotal > 0 ? (recDmiTotal / reqDmiTotal) : 1.0;
    if (dmiRatio >= 0.95 && dmiRatio <= 1.05) {
      dmiBalanceStatus = `100% Balanced with ${reqDmiTotal.toFixed(2)} kg target`;
    } else if (dmiRatio < 0.95) {
      const shortfall = (reqDmiTotal - recDmiTotal).toFixed(2);
      dmiBalanceStatus = `Deficient (-${shortfall} kg DM / Incomplete)`;
    } else {
      const surplus = (recDmiTotal - reqDmiTotal).toFixed(2);
      dmiBalanceStatus = `Surplus (+${surplus} kg DM excess)`;
    }

    if (recDmiTotal > 0 || reqDmiTotal > 0) {
      recRows.push([
        'TOTAL HERD DMI (FEED + GRAZING)',
        pastureDm > 0
          ? `Trough: ${curTroughDm.toFixed(1)}kg + Grazing: ${pastureDm.toFixed(1)}kg (Est.)`
          : 'Dry Matter Ingestion Balance',
        `${currentTotalDm.toFixed(2)} kg DM/day`,
        `${recDmiTotal.toFixed(2)} kg DM/day`,
        dmiBalanceStatus
      ]);
    }

    // Minerals & Water Rows
    recRows.push([
      'Mineral Mixture (ISI Type II)',
      'Essential Macro & Micro Minerals',
      '0 g/day',
      `${herdMinG} g/day`,
      `+${herdMinG} g needed`
    ]);

    recRows.push([
      'Common Iodized Salt',
      'Electrolytes & Ruminal Buffering',
      '0 g/day',
      `${herdSaltG} g/day`,
      `+${herdSaltG} g needed`
    ]);

    const waterAvail = Math.round(Number(waterVolume) || 0);
    const waterDiff = waterReq - waterAvail;
    recRows.push([
      'Clean Drinking Water',
      'Continuous Trough Supply',
      `${waterAvail} L/day`,
      `${waterReq} L/day`,
      waterDiff > 0 ? `+${waterDiff} L SHORTAGE` : 'Fully Adequate'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [L.colsHerdFeeds],
      body: recRows,
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.8 },
      styles: { fontSize: 7.2, cellPadding: 2.2 },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      didParseCell: function(data) {
        if (data.section === 'body') {
          const rowText = String(data.row.raw[0]);
          if (rowText.includes('TOTAL TROUGH') || rowText.includes('TOTAL HERD DMI')) {
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [20, 83, 45];
          }
          if (rowText.includes('Pasture Grazing')) {
            data.cell.styles.fillColor = [236, 253, 245];
            data.cell.styles.textColor = [4, 120, 87];
          }
          if (data.column.index === 4) {
            const val = String(data.cell.raw);
            if (val.includes('EXTRA') || val.includes('SHORTAGE') || val.includes('needed') || val.includes('Deficient') || val.includes('Incomplete')) {
              data.cell.styles.textColor = [185, 28, 28];
              data.cell.styles.fontStyle = 'bold';
            } else if (val.includes('Surplus')) {
              data.cell.styles.textColor = [217, 119, 6];
              data.cell.styles.fontStyle = 'bold';
            } else if (val.includes('Covered') || val.includes('Adequate') || val.includes('Balanced')) {
              data.cell.styles.textColor = [21, 128, 61];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      }
    });

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // =========================================================================
  // PART 2 (LAST): COMPLETE DATA CALCULATIONS & NUTRITIONAL AUDIT
  // Shows all the deep calculations in the final section:
  // - Herd Telemetry & Climate Summary
  // - Herd Nutritional Balance (DMI, ME, CP, NDF, Ca, P)
  // - Safety Gate Validation Checklist Table
  // - Ration Feasibility Alert
  // - KT Scientific Formulation & Consolidated Minerals Profile
  // - Farm Management & Feeding Advisory Notes
  // =========================================================================

  // Prominent Section Header: Part 2
  doc.setFillColor(15, 23, 42); // Dark Navy / Slate
  doc.roundedRect(14, currentY, pageWidth - 28, 7.5, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(L.part2Header, 17, currentY + 5.2);
  currentY += 11;

  // 2A. KEY HERD & NUTRITION METRICS SUMMARY
  const dmiReqVal = calcResult.practicalFeedingReport?.totalEstimatedDmiReqKg ??
                    calcResult.nutritionAnalysis?.currentNutrition?.dmi?.requiredKg ??
                    calcResult.nutritionAnalysis?.dmiRequiredKg ??
                    (totalHerdWeightKg > 0 ? (totalHerdWeightKg * 0.026).toFixed(1) : '0');

  autoTable(doc, {
    startY: currentY,
    theme: 'plain',
    styles: { fontSize: 8.0, cellPadding: 2.8, textColor: [15, 23, 42] },
    headStyles: { fillColor: [240, 253, 244], textColor: [21, 128, 61], fontStyle: 'bold', fontSize: 8.5 },
    head: [L.colsTelemetry],
    body: [
      [
        'Breed:',
        cleanText(calcResult.breed?.name || selectedBreed?.name || 'Dairy Cattle'),
        'Total Estimated DMI Requirement:',
        `${dmiReqVal} kg DM / day`
      ],
      [
        'Total Herd Count:',
        `${totalCattleCount} head`,
        'Total Fresh Feed Recommended:',
        `${calcResult.practicalFeedingReport?.totalFreshFeedKg || 0} kg / day`
      ],
      [
        'Total Herd Biomass:',
        `${totalHerdWeightKg.toLocaleString()} kg`,
        'Ambient Temperature & Humidity:',
        `${Math.round(weather?.tempC || 30)} °C  |  ${weather?.humidity || 65}% RH`
      ],
      [
        'Daily Milk Production:',
        `${totalDailyMilkL} Liters / day`,
        'Water Requirement vs Available:',
        `${waterReq} L req / ${waterVolume} L avail`
      ]
    ],
    columnStyles: {
      0: { fontStyle: 'bold', width: 45 },
      1: { width: 50 },
      2: { fontStyle: 'bold', width: 50 },
      3: { width: 45 }
    }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // 2B. HERD NUTRITIONAL BALANCE TABLE
  const curNut = calcResult.nutritionAnalysis?.currentNutrition || {};
  const recNut = calcResult.nutritionAnalysis?.recommendedNutrition || {};
  const min = calcResult.mineralsAnalysis || {};
  const minMixG = herdMinG;

  const curTroughDm = Number(calcResult.practicalFeedingReport?.currentFeedDmKg || curNut.dmi?.feedSuppliedKg || 0);
  const pastureDmVal = Number(calcResult.practicalFeedingReport?.totalPastureDmKg || curNut.dmi?.pastureSuppliedKg || 0);
  const currentDmVal = Number(calcResult.practicalFeedingReport?.totalCurrentDmIngestedKg || (curTroughDm + pastureDmVal));
  const currentDmDisplay = pastureDmVal > 0 
    ? `${currentDmVal.toFixed(2)} kg/day\n(Trough: ${curTroughDm.toFixed(1)}kg + Grazing: ${pastureDmVal.toFixed(1)}kg Est.)`
    : `${currentDmVal.toFixed(2)} kg/day`;

  const recDmVal = recNut.dmi?.suppliedKg || calcResult.practicalFeedingReport?.totalHerdDmiSuppliedKg || calcResult.practicalFeedingReport?.totalEstimatedDmiReqKg || dmiReqVal;

  const curCa = curNut.minerals?.calcium || {};
  const curP = curNut.minerals?.phosphorus || {};
  const recCa = recNut.minerals?.calcium || {};
  const recP = recNut.minerals?.phosphorus || {};

  const curCaReq = Number(curCa.requiredG || min.calcium?.required || 0);
  const curCaSupplied = Number(curCa.suppliedG !== undefined ? curCa.suppliedG : (min.calcium?.supplied || 0));
  const curCaBal = Number(curCa.balanceG !== undefined ? curCa.balanceG : (curCaSupplied - curCaReq));
  const curCaStatusText = curCa.status || (curCaBal > 0.5 ? `Surplus (+${curCaBal.toFixed(1)} g)` : (curCaBal < -0.5 ? `Deficit (-${Math.abs(curCaBal).toFixed(1)} g)` : 'Balanced (0.0 g)'));

  const recCaSupplied = Number(recCa.suppliedG !== undefined ? recCa.suppliedG : (Math.round((Number(min.calcium?.supplied || 0) + (minMixG * 0.20)) * 10) / 10));
  const recCaFeed = Number(recCa.feedSuppliedG !== undefined ? recCa.feedSuppliedG : (Math.round((recCaSupplied - (minMixG * 0.20)) * 10) / 10));
  const recCaMix = Number(recCa.mineralMixSuppliedG !== undefined ? recCa.mineralMixSuppliedG : Math.round(minMixG * 0.20 * 10) / 10);
  const caStatus = recCa.status || `Adequate (Feed: ${recCaFeed}g + Mix: ${recCaMix}g)`;

  const curPReq = Number(curP.requiredG || min.phosphorus?.required || 0);
  const curPSupplied = Number(curP.suppliedG !== undefined ? curP.suppliedG : (min.phosphorus?.supplied || 0));
  const curPBal = Number(curP.balanceG !== undefined ? curP.balanceG : (curPSupplied - curPReq));
  const curPStatusText = curP.status || (curPBal > 0.5 ? `Surplus (+${curPBal.toFixed(1)} g)` : (curPBal < -0.5 ? `Deficit (-${Math.abs(curPBal).toFixed(1)} g)` : 'Balanced (0.0 g)'));

  const recPSupplied = Number(recP.suppliedG !== undefined ? recP.suppliedG : (Math.round((Number(min.phosphorus?.supplied || 0) + (minMixG * 0.10)) * 10) / 10));
  const recPFeed = Number(recP.feedSuppliedG !== undefined ? recP.feedSuppliedG : (Math.round((recPSupplied - (minMixG * 0.10)) * 10) / 10));
  const recPMix = Number(recP.mineralMixSuppliedG !== undefined ? recP.mineralMixSuppliedG : Math.round(minMixG * 0.10 * 10) / 10);
  const pStatus = recP.status || `Adequate (Feed: ${recPFeed}g + Mix: ${recPMix}g)`;

  const getNdfStatusText = (pct) => {
    if (pct < 28.0) return 'Low Fibre (Risk of Acidosis)';
    if (pct <= 48.0) return 'Optimal / Adequate (30–45% Target)';
    return 'High Fibre (High Roughage Diet)';
  };

  const curNdfPct = Number(curNut.fibre?.dietNdfPct || 0);
  const recNdfPct = Number(recNut.fibre?.dietNdfPct || 0);
  const curNdfStatus = curNut.fibre?.status || getNdfStatusText(curNdfPct);
  const recNdfStatus = recNut.fibre?.status || getNdfStatusText(recNdfPct);

  const nutRows = [
    [
      'Dry Matter (DMI)',
      `${dmiReqVal} kg/day`,
      currentDmDisplay,
      cleanText(curNut.dmi?.status || 'Deficient'),
      `${recDmVal.toFixed(2)} kg/day`,
      cleanText(recNut.dmi?.status || '100% Balanced')
    ],
    [
      'Metabolizable Energy (ME)',
      `${curNut.energy?.requiredMeMcal || 'N/A'} Mcal/day`,
      `${curNut.energy?.suppliedMeMcal || 0} Mcal/day`,
      cleanText(curNut.energy?.status || 'Deficient'),
      `${recNut.energy?.suppliedMeMcal || curNut.energy?.requiredMeMcal} Mcal/day`,
      cleanText(recNut.energy?.status || 'Optimal (100% Met)')
    ],
    [
      'Crude Protein (CP)',
      `${curNut.protein?.requiredCpG || 0} g/day`,
      `${curNut.protein?.suppliedCpG || 0} g (${curNut.protein?.dietCpPct || 0}% CP)`,
      cleanText(curNut.protein?.status || 'Deficient'),
      `${recNut.protein?.suppliedCpG || curNut.protein?.requiredCpG} g (${recNut.protein?.dietCpPct || 12.0}% CP)`,
      cleanText(recNut.protein?.status || 'Optimal (100% Met)')
    ],
    [
      'Fibre (NDF)',
      'Min 28% of DM (Opt 30-45%)',
      `${curNdfPct.toFixed(1)}% NDF`,
      cleanText(curNdfStatus),
      `${recNdfPct.toFixed(1)}% NDF`,
      cleanText(recNdfStatus)
    ],
    [
      'Calcium (Ca)',
      `${curCaReq.toFixed(1)} g/day`,
      `${curCaSupplied.toFixed(1)} g/day`,
      cleanText(curCaStatusText),
      `${recCaSupplied.toFixed(1)} g/day (Feed: ${recCaFeed.toFixed(1)}g + Mix: ${recCaMix.toFixed(1)}g)`,
      cleanText(caStatus)
    ],
    [
      'Phosphorus (P)',
      `${curPReq.toFixed(1)} g/day`,
      `${curPSupplied.toFixed(1)} g/day`,
      cleanText(curPStatusText),
      `${recPSupplied.toFixed(1)} g/day (Feed: ${recPFeed.toFixed(1)}g + Mix: ${recPMix.toFixed(1)}g)`,
      cleanText(pStatus)
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [L.colsNutBalance],
    body: nutRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7.0, cellPadding: 2.0 },
    alternateRowStyles: { fillColor: [240, 253, 250] },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 3) {
        const text = String(data.cell.raw);
        if (text.includes('Adequate') || text.includes('Optimal') || text.includes('Balanced')) {
          data.cell.styles.textColor = [21, 128, 61];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fillColor = [254, 242, 242];
          data.cell.styles.fontStyle = 'bold';
        }
      }
      if (data.section === 'body' && data.column.index === 5) {
        const text = String(data.cell.raw);
        if (text.includes('Deficit') || text.includes('Shortfall') || text.includes('Risk')) {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fillColor = [254, 242, 242];
        } else if (text.includes('Surplus') || text.includes('High')) {
          data.cell.styles.textColor = [180, 83, 9];
          data.cell.styles.fillColor = [254, 243, 199];
        } else {
          data.cell.styles.textColor = [21, 128, 61];
          data.cell.styles.fillColor = [240, 253, 244];
        }
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // 2C. FINAL SAFETY GATE VALIDATION CHECKLIST TABLE
  const safetyGate = calcResult.practicalFeedingReport?.safetyGate;
  if (safetyGate) {
    const gateRows = (safetyGate.checks || []).map(chk => {
      let gateTitle = chk.gate;
      if (langKey === 'ta') {
        const taGateMap = {
          'DMI within target?': 'DMI Ular Theevana Alavu (Within Target?)',
          'ME within range?': 'ME Valarsidhai Matra Aatral (Within Range?)',
          'CP within range?': 'CP Kacha Puradham (Within Range?)',
          'NDF within range?': 'NDF Naarchathu (Within Range?)',
          'Ca/P adequate?': 'Ca/P Sunnambu/Manichathu (Adequate?)',
          'Ingredient limits safe?': 'Theevana Porutkal Varambu (Limits Safe?)',
          'Animal totals = farm totals?': 'Maadukal Kootu = Pannai Kootu (Totals Match?)',
          'Water adequate?': 'Kudineer Alavu (Water Adequate?)'
        };
        gateTitle = taGateMap[chk.gate] || chk.gate;
      } else if (langKey === 'hi') {
        const hiGateMap = {
          'DMI within target?': 'DMI Shushk Padarth Sevan (Within Target?)',
          'ME within range?': 'ME Oorja Matra (Within Range?)',
          'CP within range?': 'CP Crude Protein (Within Range?)',
          'NDF within range?': 'NDF Fibre Matra (Within Range?)',
          'Ca/P adequate?': 'Ca/P Calcium/Phosphorus (Adequate?)',
          'Ingredient limits safe?': 'Aahar Samagri Sima (Limits Safe?)',
          'Animal totals = farm totals?': 'Pashu Yog = Farm Kul (Totals Match?)',
          'Water adequate?': 'Peeyajal Matra (Water Adequate?)'
        };
        gateTitle = hiGateMap[chk.gate] || chk.gate;
      }
      return [
        gateTitle,
        chk.passed ? (langKey === 'ta' ? 'PASSED (Theerchi)' : langKey === 'hi' ? 'PASSED (Utteern)' : 'PASSED') : (langKey === 'ta' ? 'FLAGGED (Kavanikkavum)' : langKey === 'hi' ? 'FLAGGED (Dhyan Den)' : 'FLAGGED'),
        chk.detail
      ];
    });

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      head: [[`${L.safetyGateTitle} — ${safetyGate.status.toUpperCase()}`, 'STATUS', 'METRIC & SAFE BOUNDS']],
      headStyles: {
        fillColor: safetyGate.passed ? [22, 101, 52] : [180, 83, 9],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.0
      },
      body: gateRows,
      styles: { fontSize: 7.0, cellPadding: 2.0 },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 1) {
          const val = String(data.cell.raw);
          if (val.includes('PASSED')) {
            data.cell.styles.textColor = [21, 128, 61];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [185, 28, 28];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [254, 242, 242];
          }
        }
      }
    });
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 2D. RATION FEASIBILITY ALERT
  const feasibility = calcResult.practicalFeedingReport?.rationFeasibility || calcResult.nutritionAnalysis?.rationFeasibility;
  if (feasibility && !feasibility.isFeasible) {
    const warnRows = [
      [`WARNING: ${cleanText(feasibility.message)}`],
      ...((feasibility.missingNutrients || []).map(n => [
        `${cleanText(n.nutrient)}: ${cleanText(n.advice)}`
      ])),
      ...((feasibility.inclusionWarnings || []).map(w => [
        cleanText(w.message || w)
      ]))
    ];
    autoTable(doc, {
      startY: currentY,
      theme: 'plain',
      head: [[L.feasibilityTitle]],
      headStyles: { fillColor: [254, 226, 226], textColor: [153, 27, 27], fontStyle: 'bold', fontSize: 8.5 },
      body: warnRows,
      styles: { fontSize: 7.6, cellPadding: 2, textColor: [153, 27, 27] }
    });
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 2E. KT SCIENTIFIC FORMULATION & CONSOLIDATED MINERALS TABLES
  const kt = calcResult.ktFormulation || calcResult.practicalFeedingReport?.ktFormulation;
  if (kt) {
    const proxFeeds = kt.nutritiveComposition?.feeds || [];
    const dietTot = kt.nutritiveComposition?.dietTotals || {};

    if (proxFeeds.length > 0) {
      const proxRows = proxFeeds.map(f => [
        cleanText(f.name),
        cleanText(f.feedClass),
        Number(f.asFedKg).toFixed(1),
        Number(f.dmKg).toFixed(2),
        Number(f.cpKg).toFixed(2),
        Number(f.cfKg).toFixed(2),
        Number(f.ndfKg).toFixed(2),
        Number(f.adfKg).toFixed(2),
        Number(f.nfeKg).toFixed(2),
        Number(f.ashKg).toFixed(2),
        Number(f.eeKg).toFixed(2),
        Number(f.meMcal).toFixed(1),
        Number(f.nelMcal).toFixed(1)
      ]);

      proxRows.push([
        'TOTAL HERD DIET',
        '100% Diet Basis',
        Number(dietTot.asFedKg || 0).toFixed(1),
        Number(dietTot.dmKg || 0).toFixed(2),
        Number(dietTot.cpKg || 0).toFixed(2),
        Number(dietTot.cfKg || 0).toFixed(2),
        Number(dietTot.ndfKg || 0).toFixed(2),
        Number(dietTot.adfKg || 0).toFixed(2),
        Number(dietTot.nfeKg || 0).toFixed(2),
        Number(dietTot.ashKg || 0).toFixed(2),
        Number(dietTot.eeKg || 0).toFixed(2),
        Number(dietTot.meMcal || 0).toFixed(1),
        Number(dietTot.nelMcal || 0).toFixed(1)
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Feed Ingredient', 'Class', 'As-Fed', 'DM (kg)', 'CP (kg)', 'CF (kg)', 'NDF (kg)', 'ADF (kg)', 'NFE (kg)', 'Ash (kg)', 'EE (kg)', 'ME (Mcal)', 'NEL (Mcal)']],
        body: proxRows,
        theme: 'grid',
        headStyles: { fillColor: [4, 120, 87], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 6.8 },
        styles: { fontSize: 6.2, cellPadding: 1.6 },
        didParseCell: function(data) {
          if (data.section === 'body' && data.row.index === proxRows.length - 1) {
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [20, 83, 45];
          }
        }
      });
      currentY = doc.lastAutoTable.finalY + 6;

      // Advanced Protein Fractions
      const protRows = proxFeeds.map(f => [
        cleanText(f.name),
        Number(f.hemicelluloseKg).toFixed(2),
        Number(f.tpKg).toFixed(2),
        Number(f.nitrogenKg || (f.cpKg / 6.25)).toFixed(3),
        Number(f.npncpKg).toFixed(2),
        Number(f.faKg).toFixed(2),
        Number(f.ligninKg).toFixed(2)
      ]);
      protRows.push([
        'TOTAL HERD DIET',
        Number(dietTot.hemicelluloseKg || 0).toFixed(2),
        Number(dietTot.tpKg || 0).toFixed(2),
        Number((dietTot.cpKg || 0) / 6.25).toFixed(3),
        Number(dietTot.npncpKg || 0).toFixed(2),
        Number(dietTot.faKg || 0).toFixed(2),
        Number(dietTot.ligninKg || 0).toFixed(2)
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Feed Ingredient', 'Hemicellulose (NDF-ADF)', 'True Protein TP (CP-NPNCP)', 'Nitrogen (CP/6.25)', 'NPNCP (kg)', 'Fatty Acids FA (~85% EE)', 'Lignin (kg)']],
        body: protRows,
        theme: 'grid',
        headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 6.8 },
        styles: { fontSize: 6.2, cellPadding: 1.6 },
        didParseCell: function(data) {
          if (data.section === 'body' && data.row.index === protRows.length - 1) {
            data.cell.styles.fillColor = [219, 234, 254];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [30, 58, 138];
          }
        }
      });
      currentY = doc.lastAutoTable.finalY + 6;

      // Macro Minerals Profile
      const minMacroRows = proxFeeds.map(f => [
        cleanText(f.name),
        Number(f.dmKg).toFixed(2),
        Number(f.minerals?.caG || 0).toFixed(1),
        Number(f.minerals?.pG || 0).toFixed(1),
        Number(f.minerals?.mgG || 0).toFixed(1),
        Number(f.minerals?.kG || 0).toFixed(1),
        Number(f.minerals?.naG || 0).toFixed(1),
        Number(f.minerals?.clG || 0).toFixed(1),
        Number(f.minerals?.sG || 0).toFixed(1)
      ]);
      const supp = kt.mineralProfile?.supplementsSupply || {};
      minMacroRows.push([
        'MINERAL MIX & SALT (Supplements)',
        `${supp.mineralMixtureKg || 0}kg Mix / ${supp.saltKg || 0}kg Salt`,
        `${supp.calciumG || 0} g`,
        `${supp.phosphorusG || 0} g`,
        '-',
        '-',
        `${supp.sodiumG || 0} g`,
        `${supp.chlorideG || 0} g`,
        '-'
      ]);

      const macroTot = kt.mineralProfile?.macroMinerals || {};
      minMacroRows.push([
        'TOTAL HERD SUPPLY (Feeds + Supp)',
        Number(dietTot.dmKg || 0).toFixed(2),
        `${macroTot.calcium?.supplied || 0} g`,
        `${macroTot.phosphorus?.supplied || 0} g`,
        `${macroTot.magnesium?.supplied || 0} g`,
        `${macroTot.potassium?.supplied || 0} g`,
        `${macroTot.sodium?.supplied || 0} g`,
        `${macroTot.chloride?.supplied || 0} g`,
        `${macroTot.sulfur?.supplied || 0} g`
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Feed Ingredient (consolidated_minerals.dat)', 'DM / Quantity', 'Ca (g)', 'P (g)', 'Mg (g)', 'K (g)', 'Na (g)', 'Cl (g)', 'S (g)']],
        body: minMacroRows,
        theme: 'grid',
        headStyles: { fillColor: [180, 83, 9], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 6.8 },
        styles: { fontSize: 6.2, cellPadding: 1.6 },
        didParseCell: function(data) {
          if (data.section === 'body' && data.row.index === minMacroRows.length - 2) {
            data.cell.styles.fillColor = [254, 249, 195];
            data.cell.styles.fontStyle = 'italic';
            data.cell.styles.textColor = [113, 63, 18];
          }
          if (data.section === 'body' && data.row.index === minMacroRows.length - 1) {
            data.cell.styles.fillColor = [254, 243, 199];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [120, 53, 15];
          }
        }
      });
      currentY = doc.lastAutoTable.finalY + 6;

      // Trace Minerals
      const minTraceRows = proxFeeds.map(f => [
        cleanText(f.name),
        Number(f.minerals?.coMg || 0).toFixed(2),
        Number(f.minerals?.cuMg || 0).toFixed(2),
        Number(f.minerals?.iMg || 0).toFixed(2),
        Number(f.minerals?.feMg || 0).toFixed(1),
        Number(f.minerals?.mnMg || 0).toFixed(1),
        Number(f.minerals?.seMg || 0).toFixed(3),
        Number(f.minerals?.znMg || 0).toFixed(1),
        Number(f.minerals?.moMg || 0).toFixed(2)
      ]);
      const traceTot = kt.mineralProfile?.traceMinerals || {};
      minTraceRows.push([
        'TOTAL HERD SUPPLY',
        `${traceTot.cobalt?.supplied || 0} mg`,
        `${traceTot.copper?.supplied || 0} mg`,
        `${traceTot.iodine?.supplied || 0} mg`,
        `${traceTot.iron?.supplied || 0} mg`,
        `${traceTot.manganese?.supplied || 0} mg`,
        `${traceTot.selenium?.supplied || 0} mg`,
        `${traceTot.zinc?.supplied || 0} mg`,
        `${traceTot.molybdenum?.supplied || 0} mg`
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Trace Minerals (ppm / mg basis)', 'Co (mg)', 'Cu (mg)', 'I (mg)', 'Fe (mg)', 'Mn (mg)', 'Se (mg)', 'Zn (mg)', 'Mo (mg)']],
        body: minTraceRows,
        theme: 'grid',
        headStyles: { fillColor: [109, 40, 217], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 6.8 },
        styles: { fontSize: 6.2, cellPadding: 1.6 },
        didParseCell: function(data) {
          if (data.section === 'body' && data.row.index === minTraceRows.length - 1) {
            data.cell.styles.fillColor = [243, 232, 255];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [88, 28, 135];
          }
        }
      });
      currentY = doc.lastAutoTable.finalY + 6;
    }

    // 2F. ADVISORY & BEST PRACTICES NOTES
  const advisoryBullets = langKey === 'ta' ? [
    ['- Uyar paal karakkum maadukalukku kooduthal adartheevanam matrum pasuntheevanam valangavum.'],
    ['- 6-9 matha chinamaadukalukku steaming-up theevanam valangavum; mun-chinathil maintenance theevanam pothumanathu.'],
    ['- Nilalana theevana thottiyil suthamana kudineer eppothum kidaikka seiyavum.'],
    ['- Thinamum 35-60g thaathu kalavai matrum 25-35g samayal uppu kandippaaga alikkavum.'],
    ['- Veyil kaalathil kaalai matrum maalai velaiyil theevanam valangavum.'],
    ['- Karavai nindra maadukalukku naarchathu athigamulla ular theevanam alikkavum.'],
    ['- Kaalaigalukku athiga theevanam alikkaamal udal kaddai seeraaga vaithirukkavum.']
  ] : langKey === 'hi' ? [
    ['- Adhik doodh dene wali gaayon ko atirikt dana mishran evam taaza hara chara dein.'],
    ['- 6-9 mahine ki garbhavati gaayon ko steaming-up (adhik dana) dein; shuruati mahinon mein maintenance chara paryapt hai.'],
    ['- Chhayadaar sthan par naad mein 24 ghante swachh peeyajal uplabdh karayein.'],
    ['- Pratidin 35-60g khanij mishran evam 25-35g namak zaroor dein.'],
    ['- Garmi ke mausam mein subah jaldi aur shaam ko der se chara khilayein.'],
    ['- Sookhi gaayon ko fiber-yukt sookha chara dein, dana simit rakhein.'],
    ['- Prajanan saand ko santulit chara dein taaki motapa na badhe.']
  ] : [
    ['- Feed higher-yielding cows with extra concentrate and fresh green fodder.'],
    ['- Pregnant cows in months 6-9 require steaming up (increased concentrate) to build maternal and fetal reserves. Earlier pregnancy (months 1-5) needs only maintenance feeding.'],
    ['- Ensure clean, fresh drinking water is continuously accessible in shaded troughs.'],
    ['- Provide 35-60g mineral mixture and 25-35g common salt daily to maintain electrolyte balance.'],
    ['- Shift feeding times to early morning and late evening during high temperature/humidity periods.'],
    ['- Dry cows need high fibre roughage with minimal concentrate to maintain body condition before calving.'],
    ['- Bulls require good maintenance forage; avoid high dairy concentrates to prevent obesity.']
  ];

  autoTable(doc, {
    startY: currentY,
    theme: 'plain',
    head: [[L.advisoryTitle]],
    headStyles: { fillColor: [254, 243, 199], textColor: [146, 64, 14], fontStyle: 'bold', fontSize: 8.5 },
    body: advisoryBullets,
    styles: { fontSize: 7.6, cellPadding: 2, textColor: [120, 53, 15] }
  });

  addFooters(doc);

  const safeCity = (weather?.city || 'DairyFarm').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Feeding_Report_${safeCity}_${langKey.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
