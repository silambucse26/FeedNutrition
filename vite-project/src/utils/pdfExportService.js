import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
 * Adds branded header banner to the PDF document
 */
function addHeader(doc, title, subtitle, dateStr, farmName = 'Dairy Unit') {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Top Banner background
  doc.setFillColor(21, 128, 61); // #15803d Dark Green
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent thin stripe
  doc.setFillColor(134, 239, 172); // #86efac Light Green
  doc.rect(0, 28, pageWidth, 2.5, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(title.toUpperCase(), 14, 12);

  // Subtitle / Farm Name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(220, 252, 231); // #dcfce7
  doc.text(`${farmName}  |  ${subtitle}`, 14, 20);

  // Date on top right
  doc.setFontSize(8.5);
  doc.setTextColor(240, 253, 244);
  doc.text(`Generated: ${dateStr}`, pageWidth - 14, 12, { align: 'right' });
  doc.text('Precision Feed & Nutrition System', pageWidth - 14, 20, { align: 'right' });
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
    doc.text('Dairy Feed Nutrition & Ration Advisory System', 14, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
  }
}

/**
 * EXPORT 1: DOWNLOAD COMPLETE FARM INPUT DATA AS A BEAUTIFUL COLORFUL PDF
 */
export function downloadInputDataPDF({
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
  totalCattleCount = 0
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const farmName = weather?.city ? `${weather.city} Dairy Farm` : 'Dairy Farm';

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
 * EXPORT 2: DOWNLOAD COMPLETE GENERATED NUTRITION & FEEDING REPORT AS A COLORFUL PDF
 */
export function downloadFeedingReportPDF({
  calcResult,
  weather,
  selectedBreed,
  totalCattleCount = 0,
  totalHerdWeightKg = 0,
  totalDailyMilkL = 0,
  waterVolume = 0,
  selectedFeeds = []
}) {
  if (!calcResult) {
    alert('Please generate the nutrition calculation first before downloading the PDF report.');
    return;
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const farmName = weather?.city ? `${weather.city} Dairy Farm` : 'Dairy Farm';

  const overallStatus = calcResult.practicalFeedingReport?.overallResult?.status || 'Ration needs adjustment';
  const isApproved = calcResult.practicalFeedingReport?.isApproved ?? false;
  const isIncomplete = overallStatus.toLowerCase().includes('incomplete');

  const reportTitle = isApproved 
    ? 'Herd Precision Feeding & Ration Report (Approved)'
    : (isIncomplete 
        ? 'Herd Feeding Advisory (PROVISIONAL - Ration Incomplete)' 
        : 'Herd Feeding Advisory (PROVISIONAL - Needs Adjustment)');

  const subTitle = isApproved 
    ? 'Approved Scientific Nutritional Plan'
    : (isIncomplete 
        ? 'WARNING: Incomplete Diet - Action Required on Feed Deficit' 
        : 'Nutritional Gap Advisory - Adjustment Needed Before Final Adoption');

  addHeader(doc, reportTitle, subTitle, dateStr, farmName);

  let currentY = 35;

  // Fix 1: Prominent advisory banner if ration is not fully balanced and approved
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
    const alertMsg = isIncomplete 
      ? 'CRITICAL NOTICE: RATION INCOMPLETE. Dry matter intake is below herd requirement. Do NOT use as final production ration.'
      : 'PROVISIONAL ADVISORY: RATION REQUIRES ADJUSTMENT. Specific nutrient or management gates flagged below before final adoption.';
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

  // Resolve DMI requirement safely
  const dmiReqVal = calcResult.practicalFeedingReport?.totalEstimatedDmiReqKg ??
                    calcResult.nutritionAnalysis?.currentNutrition?.dmi?.requiredKg ??
                    calcResult.nutritionAnalysis?.dmiRequiredKg ??
                    (totalHerdWeightKg > 0 ? (totalHerdWeightKg * 0.026).toFixed(1) : '0');

  // 1. KEY HERD & NUTRITION METRICS SUMMARY
  autoTable(doc, {
    startY: currentY,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 3, textColor: [15, 23, 42] },
    headStyles: { fillColor: [240, 253, 244], textColor: [21, 128, 61], fontStyle: 'bold', fontSize: 9 },
    head: [['HERD PARAMETER', 'VALUE', 'NUTRITION & CLIMATE', 'VALUE']],
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
        `${Math.round(calcResult.waterAnalysis?.requiredLiters || calcResult.practicalFeedingReport?.waterLiters || 0)} L req / ${waterVolume} L avail`
      ]
    ],
    columnStyles: {
      0: { fontStyle: 'bold', width: 45 },
      1: { width: 50 },
      2: { fontStyle: 'bold', width: 50 },
      3: { width: 45 }
    }
  });
// 2. TODAY'S FEED RECOMMENDATION & SHORTAGE COMPARISON TABLE
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

    // Add Dedicated Pasture Grazing Row if Herd Grazed
    // Add Dedicated Pasture Grazing Row if Herd Grazed (Clearly labeled as Estimated - Fix 5)
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

    // Add herd total fresh trough feed summary row
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

    // Add Total Herd DMI Balance Row (Consistently shows Trough DM + Grazing DM = Total Current DM - Fix 2)
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

    // Add Mineral Mixture Row (Exact sum of per-animal requirements)
    const herdMinG = calcResult.practicalFeedingReport?.herdSummary?.mineralMixtureTotalG || calcResult.practicalFeedingReport?.mineralMixtureGrams || 250;
    recRows.push([
      'Mineral Mixture (ISI Type II)',
      'Essential Macro & Micro Minerals',
      '0 g/day',
      `${herdMinG} g/day`,
      `+${herdMinG} g needed`
    ]);

    // Add Common Salt Row (Exact sum of per-animal requirements)
    const herdSaltG = calcResult.practicalFeedingReport?.herdSummary?.saltTotalG || calcResult.practicalFeedingReport?.saltGrams || 150;
    recRows.push([
      'Common Iodized Salt',
      'Electrolytes & Ruminal Buffering',
      '0 g/day',
      `${herdSaltG} g/day`,
      `+${herdSaltG} g needed`
    ]);

    // Add Drinking Water Row
    const waterReq = Math.round(Number(calcResult.waterAnalysis?.requiredLiters || calcResult.waterAnalysis?.waterRequiredLiters || calcResult.practicalFeedingReport?.waterLiters || 0));
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
      head: [['Feed Ingredient', 'Category / Details', 'What You Put', 'Herd Needs Today', 'Shortage / Extra Needed']],
      body: recRows,
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      styles: { fontSize: 7.5, cellPadding: 2.2 },
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

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 3. INDIVIDUAL MILKING COW FEEDING PLAN (IF ANY)
  const milkingAnimals = calcResult.practicalFeedingReport?.perCategory?.milkingCow?.animals || [];
  if (milkingAnimals.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Milking Cow', 'Weight', 'Lactation & BCS', 'Milk Yield', 'Green Fodder', 'Dry Fodder', 'Concentrate Breakdown', 'Mineral Mix', 'Salt', 'Water']],
      body: milkingAnimals.map((cow, i) => {
        const isFeas = cow.isFeasible !== false;
        return [
          cleanText(cow.title || `Cow #${i + 1}`),
          `${cow.weightKg} kg`,
          `${cleanText(cow.stage || 'Mid lact.')} (BCS ${cow.bcs ?? 3.0})`,
          `${cow.milkYieldL} L (${cow.milkFatPct}% fat)`,
          isFeas ? `${cow.greenFodderKg} kg` : 'Ration Incomplete',
          isFeas ? (cow.dryFodderDetails ? `${cow.dryFodderKg} kg\n(${cleanText(cow.dryFodderDetails)})` : `${cow.dryFodderKg} kg`) : 'Incomplete',
          isFeas ? (cow.concentrateDetails ? `${cow.concentrateKg} kg\n(${cleanText(cow.concentrateDetails)})` : `${cow.concentrateKg} kg`) : 'Feeds needed',
          `${cow.mineralMixtureG} g`,
          `${cow.saltG || 40} g`,
          `${cow.waterLiters} L`
        ];
      }),
      theme: 'grid',
      headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      styles: { fontSize: 7.2, cellPadding: 2.0 },
      alternateRowStyles: { fillColor: [240, 249, 255] }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 4. INDIVIDUAL PREGNANT CATTLE FEEDING PLAN
  const pregnantAnimals = calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.animals || [];
  if (pregnantAnimals.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Pregnant Cattle', 'Type', 'Weight', 'Gestation Stage', 'Green Fodder', 'Dry Fodder', 'Concentrate Breakdown', 'Mineral Mix', 'Salt', 'Water']],
      body: pregnantAnimals.map((cow, i) => [
        cleanText(cow.title || `Pregnant #${i + 1}`),
        cleanText(cow.type || 'Pregnant'),
        `${cow.weightKg} kg`,
        cleanText(cow.stage || `Month ${cow.pregMonth || '?'}`),
        `${cow.greenFodderKg} kg`,
        cow.dryFodderDetails ? `${cow.dryFodderKg} kg\n(${cleanText(cow.dryFodderDetails)})` : `${cow.dryFodderKg} kg`,
        cow.concentrateDetails ? `${cow.concentrateKg} kg\n(${cleanText(cow.concentrateDetails)})` : `${cow.concentrateKg} kg`,
        `${cow.mineralMixtureG} g`,
        `${cow.saltG || 35} g`,
        `${cow.waterLiters} L`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [194, 65, 12], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      styles: { fontSize: 7.2, cellPadding: 2.0 },
      alternateRowStyles: { fillColor: [255, 250, 245] }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 4B. INDIVIDUAL GROWING HEIFER FEEDING PLAN
  const heiferAnimals = calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.animals || [];
  if (heiferAnimals.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Growing Heifer', 'Weight', 'Green Fodder', 'Dry Fodder', 'Concentrate Breakdown', 'Mineral Mix', 'Salt', 'Water']],
      body: heiferAnimals.map((h, i) => [
        cleanText(h.title || `Heifer #${i + 1}`),
        `${h.weightKg} kg`,
        `${h.greenFodderKg} kg`,
        h.dryFodderDetails ? `${h.dryFodderKg} kg\n(${cleanText(h.dryFodderDetails)})` : `${h.dryFodderKg} kg`,
        h.concentrateDetails ? `${h.concentrateKg} kg\n(${cleanText(h.concentrateDetails)})` : `${h.concentrateKg} kg`,
        `${h.mineralMixtureG} g`,
        `${h.saltG || 25} g`,
        `${h.waterLiters} L`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      styles: { fontSize: 7.2, cellPadding: 2.0 },
      alternateRowStyles: { fillColor: [240, 253, 250] }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 4C. INDIVIDUAL DRY COW FEEDING PLAN
  const dryAnimals = calcResult.practicalFeedingReport?.perCategory?.dryCow?.animals || [];
  if (dryAnimals.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Dry Cow', 'Weight', 'Days Dry', 'Green Fodder', 'Dry Fodder', 'Concentrate Breakdown', 'Mineral Mix', 'Salt', 'Water']],
      body: dryAnimals.map((d, i) => [
        cleanText(d.title || `Dry Cow #${i + 1}`),
        `${d.weightKg} kg`,
        `${d.dryDays !== undefined ? d.dryDays : 45} days`,
        `${d.greenFodderKg} kg`,
        d.dryFodderDetails ? `${d.dryFodderKg} kg\n(${cleanText(d.dryFodderDetails)})` : `${d.dryFodderKg} kg`,
        d.concentrateDetails ? `${d.concentrateKg} kg\n(${cleanText(d.concentrateDetails)})` : `${d.concentrateKg} kg`,
        `${d.mineralMixtureG} g`,
        `${d.saltG || 30} g`,
        `${d.waterLiters} L`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      styles: { fontSize: 7.2, cellPadding: 2.0 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 4D. INDIVIDUAL BREEDING BULL FEEDING PLAN
  const bullAnimals = calcResult.practicalFeedingReport?.perCategory?.bull?.animals || [];
  if (bullAnimals.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Breeding Bull', 'Weight', 'Green Fodder', 'Dry Fodder', 'Concentrate Breakdown', 'Mineral Mix', 'Salt', 'Water']],
      body: bullAnimals.map((b, i) => [
        cleanText(b.title || `Bull #${i + 1}`),
        `${b.weightKg} kg`,
        `${b.greenFodderKg} kg`,
        b.dryFodderDetails ? `${b.dryFodderKg} kg\n(${cleanText(b.dryFodderDetails)})` : `${b.dryFodderKg} kg`,
        b.concentrateDetails ? `${b.concentrateKg} kg\n(${cleanText(b.concentrateDetails)})` : `${b.concentrateKg} kg`,
        `${b.mineralMixtureG} g`,
        `${b.saltG || 40} g`,
        `${b.waterLiters} L`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [88, 28, 135], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      styles: { fontSize: 7.2, cellPadding: 2.0 },
      alternateRowStyles: { fillColor: [250, 245, 255] }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 5. HERD NUTRITIONAL BALANCE TABLE (Problems 1, 2, 3, 4: True Ca/P, consistent DMI, unified NDF)
  const curNut = calcResult.nutritionAnalysis?.currentNutrition || {};
  const recNut = calcResult.nutritionAnalysis?.recommendedNutrition || {};
  const min = calcResult.mineralsAnalysis || {};
  const minMixG = calcResult.practicalFeedingReport?.herdSummary?.mineralMixtureTotalG || calcResult.practicalFeedingReport?.mineralMixtureGrams || 371;

  const curTroughDm = Number(calcResult.practicalFeedingReport?.currentFeedDmKg || curNut.dmi?.feedSuppliedKg || 0);
  const curPastureDm = Number(calcResult.practicalFeedingReport?.totalPastureDmKg || curNut.dmi?.pastureSuppliedKg || 0);
  const currentDmVal = Number(calcResult.practicalFeedingReport?.totalCurrentDmIngestedKg || (curTroughDm + curPastureDm));
  const currentDmDisplay = curPastureDm > 0 
    ? `${currentDmVal.toFixed(2)} kg/day\n(Trough: ${curTroughDm.toFixed(1)}kg + Grazing: ${curPastureDm.toFixed(1)}kg Est.)`
    : `${currentDmVal.toFixed(2)} kg/day`;

  const recDmVal = recNut.dmi?.suppliedKg || calcResult.practicalFeedingReport?.totalHerdDmiSuppliedKg || calcResult.practicalFeedingReport?.totalEstimatedDmiReqKg || dmiReqVal;

  // Calcium & Phosphorus: true distinct values from current vs recommended (Fix 3)
  const curCa = curNut.minerals?.calcium || {};
  const curP = curNut.minerals?.phosphorus || {};
  const recCa = recNut.minerals?.calcium || {};
  const recP = recNut.minerals?.phosphorus || {};

  const curCaReq = Number(curCa.requiredG || min.calcium?.required || 0);
  const curCaSupplied = Number(curCa.suppliedG !== undefined ? curCa.suppliedG : (min.calcium?.supplied || 0));
  const curCaFeed = Number(curCa.feedSuppliedG !== undefined ? curCa.feedSuppliedG : curCaSupplied);
  const curCaPasture = Number(curCa.pastureSuppliedG || 0);
  const curCaBal = Number(curCa.balanceG !== undefined ? curCa.balanceG : (curCaSupplied - curCaReq));
  const curCaStatusText = curCa.status || (curCaBal > 0.5 ? `Surplus (+${curCaBal.toFixed(1)} g)` : (curCaBal < -0.5 ? `Deficit (-${Math.abs(curCaBal).toFixed(1)} g)` : 'Balanced (0.0 g)'));

  const recCaSupplied = Number(recCa.suppliedG !== undefined ? recCa.suppliedG : (Math.round((Number(min.calcium?.supplied || 0) + (minMixG * 0.20)) * 10) / 10));
  const recCaFeed = Number(recCa.feedSuppliedG !== undefined ? recCa.feedSuppliedG : (Math.round((recCaSupplied - (minMixG * 0.20)) * 10) / 10));
  const recCaMix = Number(recCa.mineralMixSuppliedG !== undefined ? recCa.mineralMixSuppliedG : Math.round(minMixG * 0.20 * 10) / 10);
  const caStatus = recCa.status || `Adequate (Feed: ${recCaFeed}g + Mix: ${recCaMix}g)`;

  const curPReq = Number(curP.requiredG || min.phosphorus?.required || 0);
  const curPSupplied = Number(curP.suppliedG !== undefined ? curP.suppliedG : (min.phosphorus?.supplied || 0));
  const curPFeed = Number(curP.feedSuppliedG !== undefined ? curP.feedSuppliedG : curPSupplied);
  const curPPasture = Number(curP.pastureSuppliedG || 0);
  const curPBal = Number(curP.balanceG !== undefined ? curP.balanceG : (curPSupplied - curPReq));
  const curPStatusText = curP.status || (curPBal > 0.5 ? `Surplus (+${curPBal.toFixed(1)} g)` : (curPBal < -0.5 ? `Deficit (-${Math.abs(curPBal).toFixed(1)} g)` : 'Balanced (0.0 g)'));

  const recPSupplied = Number(recP.suppliedG !== undefined ? recP.suppliedG : (Math.round((Number(min.phosphorus?.supplied || 0) + (minMixG * 0.10)) * 10) / 10));
  const recPFeed = Number(recP.feedSuppliedG !== undefined ? recP.feedSuppliedG : (Math.round((recPSupplied - (minMixG * 0.10)) * 10) / 10));
  const recPMix = Number(recP.mineralMixSuppliedG !== undefined ? recP.mineralMixSuppliedG : Math.round(minMixG * 0.10 * 10) / 10);
  const pStatus = recP.status || `Adequate (Feed: ${recPFeed}g + Mix: ${recPMix}g)`;

  // Unified NDF Status Logic (Fix 4)
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
    head: [['Nutrient Parameter', 'Herd Requirement', 'Current Supply (Your Input)', 'Current Status', 'Recommended Supply', 'Recommended Status']],
    body: nutRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.2, cellPadding: 2.0 },
    alternateRowStyles: { fillColor: [240, 253, 250] },
    didParseCell: function(data) {
      // Column 3: Current Status
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
      // Column 5: Recommended Status (Problem 6, 7, 8)
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

  // 5B. FINAL SAFETY GATE VALIDATION CHECKLIST TABLE (Fix 6)
  const safetyGate = calcResult.practicalFeedingReport?.safetyGate;
  if (safetyGate) {
    const gateRows = (safetyGate.checks || []).map(chk => [
      chk.gate,
      chk.passed ? 'PASSED' : 'FLAGGED',
      chk.detail
    ]);

    autoTable(doc, {
      startY: currentY,
      theme: 'grid',
      head: [[`PRE-REPORT SAFETY GATE CHECKLIST — ${safetyGate.status.toUpperCase()}`, 'STATUS', 'METRIC & SAFE BOUNDS']],
      headStyles: {
        fillColor: safetyGate.passed ? [22, 101, 52] : [180, 83, 9],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5
      },
      body: gateRows,
      styles: { fontSize: 7.2, cellPadding: 2.0 },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 1) {
          const val = String(data.cell.raw);
          if (val === 'PASSED') {
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

  // 5C. RATION FEASIBILITY WARNING (Bug #13)
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
      head: [['RATION FEASIBILITY ALERT']],
      headStyles: { fillColor: [254, 226, 226], textColor: [153, 27, 27], fontStyle: 'bold', fontSize: 9 },
      body: warnRows,
      styles: { fontSize: 8, cellPadding: 2, textColor: [153, 27, 27] }
    });
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // =========================================================================
  // 6. KT SCIENTIFIC FORMULATION & CONSOLIDATED MINERALS TABLES
  // (Full 8-Page Knowledge Transfer PDF Integration & consolidated_minerals.dat)
  // =========================================================================
  const kt = calcResult.ktFormulation || calcResult.practicalFeedingReport?.ktFormulation;
  if (kt) {
    const proxFeeds = kt.nutritiveComposition?.feeds || [];
    const dietTot = kt.nutritiveComposition?.dietTotals || {};

    // 6A. 14 NUTRITIVE & PROTEIN FRACTIONS TABLE (PAGE 4)
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
        headStyles: { fillColor: [4, 120, 87], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.2 },
        styles: { fontSize: 6.5, cellPadding: 1.8 },
        didParseCell: function(data) {
          if (data.section === 'body' && data.row.index === proxRows.length - 1) {
            data.cell.styles.fillColor = [220, 252, 231];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [20, 83, 45];
          }
        }
      });
      currentY = doc.lastAutoTable.finalY + 6;

      // Advanced Protein Fractions (Points 5-10)
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
        headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.2 },
        styles: { fontSize: 6.5, cellPadding: 1.8 },
        didParseCell: function(data) {
          if (data.section === 'body' && data.row.index === protRows.length - 1) {
            data.cell.styles.fillColor = [219, 234, 254];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [30, 58, 138];
          }
        }
      });
      currentY = doc.lastAutoTable.finalY + 6;

      // 6B. CONSOLIDATED MINERALS PROFILE (from consolidated_minerals.dat)
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
        headStyles: { fillColor: [180, 83, 9], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.2 },
        styles: { fontSize: 6.5, cellPadding: 1.8 },
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

      // Trace minerals
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
        headStyles: { fillColor: [109, 40, 217], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.2 },
        styles: { fontSize: 6.5, cellPadding: 1.8 },
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

    // 6C. KT NET ENERGY (NEL), FWI, AND BALANCING MATRIX (Points 21-27)
    const energy = kt.energyAnalysis || {};
    const fwi = kt.freeWaterIntakeFwi || {};
    const fndf = kt.forageNdfBuffer || {};
    const bwTargets = kt.bodyWeightAndFeedingBaselines || {};

    autoTable(doc, {
      startY: currentY,
      head: [['KT Formulation Metric', 'Formula / Reference', 'Calculated Value', 'Herd Demand / Target', 'Physiological Status']],
      body: [
        [
          'Milk Net Energy (NEL)',
          'NEL = 0.360 + 0.0969 x Fat%',
          `${energy.milkNepMcalPerKg || 0} Mcal/kg`,
          'Breed fat target basis',
          'Production Base'
        ],
        [
          'Milk Energy Used (NEuse)',
          'NEuse = Milk NEL x Yield',
          `${energy.milkNeuseMcalPerDay || 0} Mcal/day`,
          `${energy.milkMeMcalPerDay || 0} Mcal ME/day`,
          'Lactation Demand'
        ],
        [
          'Maintenance NEL',
          'NEL_maint = 0.10 x BW^0.75',
          `${energy.maintenanceNelMcal || 0} Mcal/day`,
          `${energy.maintenanceNelPerCowMcal || 0} Mcal/cow/d`,
          'Maintenance Base'
        ],
        [
          'Gestational NEL (Gest_NEL)',
          'Gest_NEL = GrUter_WtGain x 4.16',
          `${energy.gestNelMcalPerDay || 0} Mcal/day`,
          `${energy.dryPeriodStage || 'Gestation'} (${energy.weeksToCalving || 0} wks to calve)`,
          'Fetal Growth'
        ],
        [
          'Growth & Frame NEL (NEL_growth)',
          'NASEM EBG Model: Heifers & 1st Lactation',
          `${energy.growthNelMcal || 0} Mcal/day`,
          'Heifer Frame Growth & Primiparous Gain',
          'Frame & Growth Base'
        ],
        [
          'Total Herd NEL Requirement',
          energy.totalNelFormula || `TotalNELReq = ${energy.maintenanceNelMcal || 0} + ${energy.milkNeuseMcalPerDay || 0} + ${energy.gestNelMcalPerDay || 0} + ${energy.growthNelMcal || 0} = ${energy.totalNelRequiredMcal || 0} Mcal/day`,
          `${energy.totalNelRequiredMcal || 0} Mcal/day`,
          'Total Physiological Herd Demand',
          'Demand Target'
        ],
        [
          'Feed Net Energy (NEL) Supply',
          'NEL = Diet ME x 0.66',
          `${energy.feedNelMcal || 0} Mcal/day`,
          `Diet ME: ${energy.dietMeMcal || 0} Mcal/d`,
          'Ration Energy Supply'
        ],
        [
          'Total Net Energy Balance',
          'NEL_Supply - Total_NEL_Req',
          `${energy.energyBalanceNelMcal > 0 ? '+' : ''}${energy.energyBalanceNelMcal || 0} Mcal/day`,
          `Req: ${energy.totalNelRequiredMcal || 0} Mcal NEL`,
          `${energy.nelAdequacyPct || 0}% Adequacy (${cleanText(energy.energyStatus || 'Evaluated')})`
        ],
        [
          '% Forage NDF in Diet',
          'NASEM 2021 Sliding Scale (Forage NDF >= 19% -> 25% Min NDF)',
          `${fndf.forageNdfPct || 0}% (Total NDF: ${fndf.totalNdfPct || 0}%)`,
          `Min Total NDF: ${fndf.minRequiredTotalNdfPct || 25}%`,
          cleanText(fndf.status || 'Sufficient')
        ],
        [
          'Free Water Intake (NaK Formula)',
          'FWI = -91.1 + (2.93*DMI) + (0.61*DM%) + (0.062*NaK) + (2.49*CP%) + (0.76*T)',
          `Lactating: ${fwi.lactatingFwiPerCowL || 0} L/cow`,
          `NaK Factor: ${fwi.nakFactor || 0}`,
          `Water_herd = Sum(Water_i) = ${fwi.totalFwiLiters || 0} L/day`
        ],
        [
          'Remaining Cattle FWI (TMPC)',
          'FWI = 1.16*DMI + 0.23*DM% + 0.44*T + 0.061*(T-16.4)^2',
          `Non-lactating: ${fwi.remainingFwiPerHeadL || 0} L/head`,
          `TMPC2: ${fwi.tmpc2 || fwi.tempCorr || 0}`,
          `Total Herd: ${fwi.totalFwiLiters || 0} L/day (${waterVolume} L Avail, ${Math.round((waterVolume / Math.max(1, fwi.totalFwiLiters || 1)) * 100)}% Adequacy)`
        ],
        [
          'Body Weight & Required Feed',
          'Primi: 85% MatBW | Multi: 95% | Moisture As-Fed',
          `Moisture As-Fed: ${bwTargets.moistureRequiredAsFedKg || 0} kg/d`,
          `4.5% BW Ref: ${bwTargets.herdAsFedBaselineKg || 0} kg/d`,
          'Moisture-Derived As-Fed'
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
      styles: { fontSize: 6.8, cellPadding: 2.0 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 4) {
          const val = String(data.cell.raw);
          if (val.includes('Insufficient') || val.includes('Risk') || val.includes('Negative')) {
            data.cell.styles.textColor = [185, 28, 28];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [254, 242, 242];
          } else if (val.includes('Sufficient')) {
            data.cell.styles.textColor = [21, 128, 61];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [240, 253, 244];
          }
        }
      }
    });
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 7. ADVISORY & BEST PRACTICES NOTES (Bug #15: steaming up only for months 6-9)
  autoTable(doc, {
    startY: currentY,
    theme: 'plain',
    head: [['FARM MANAGEMENT & FEEDING ADVISORY']],
    headStyles: { fillColor: [254, 243, 199], textColor: [146, 64, 14], fontStyle: 'bold', fontSize: 9 },
    body: [
      ['- Feed higher-yielding cows with extra concentrate and fresh green fodder.'],
      ['- Pregnant cows in months 6-9 require steaming up (increased concentrate) to build maternal and fetal reserves. Earlier pregnancy (months 1-5) needs only maintenance feeding.'],
      ['- Ensure clean, fresh drinking water is continuously accessible in shaded troughs.'],
      ['- Provide 35-60g mineral mixture and 25-35g common salt daily to maintain electrolyte balance.'],
      ['- Shift feeding times to early morning and late evening during high temperature/humidity periods.'],
      ['- Dry cows need high fibre roughage with minimal concentrate to maintain body condition before calving.'],
      ['- Bulls require good maintenance forage; avoid high dairy concentrates to prevent obesity.']
    ],
    styles: { fontSize: 8, cellPadding: 2, textColor: [120, 53, 15] }
  });

  addFooters(doc);

  const safeCity = (weather?.city || 'DairyFarm').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Feeding_Report_${safeCity}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
