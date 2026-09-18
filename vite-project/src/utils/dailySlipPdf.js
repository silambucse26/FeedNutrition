import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { CHIMERTECH_LOGO, IHERD_LOGO } from './brandLogos.js';
import { resolveLocationDetails } from './locationHelper';
import { translateFeed } from './tamilTranslations.js';
import { STEP10_HINDI_MAP } from './step10ReviewTranslations.js';

/**
 * Downloads a dedicated Daily Cattle Feed Slip (PDF)
 * Listing each individual cattle with Category, Number, Name, Body Weight,
 * and exact today feeding in KG (Green, Dry, Concentrate, Minerals, Salt, Water).
 * Full native script support for Tamil (தமிழ்), Hindi (हिन्दी), and English.
 */
export async function downloadDailyFeedSlipPDF({
  farmName = 'Dairy Farm',
  location = '',
  breedName = 'Cattle',
  cattleList = [],
  totals = {},
  currentLang = 'ta',
}) {
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const locInfo = resolveLocationDetails(location || farmName);
  const displayFarmName = currentLang === 'ta' ? locInfo.farmNameTa : currentLang === 'hi' ? locInfo.farmNameHi : locInfo.farmName;
  const isIndic = currentLang === 'ta' || currentLang === 'hi';

  const titleText = currentLang === 'ta'
    ? 'தினசரி கால்நடை தீவன சீட்டு'
    : currentLang === 'hi'
      ? 'दैनिक मवेशी चारा पर्ची'
      : 'DAILY CATTLE FEEDING SLIP';

  const breedLabel = currentLang === 'ta' ? 'இனம்' : currentLang === 'hi' ? 'நस्ल' : 'Breed';
  const totalCattleLabel = currentLang === 'ta' ? 'மொத்த மாடுகள்' : currentLang === 'hi' ? 'कुल पशु' : 'Total Cattle';
  const dateLabel = currentLang === 'ta' ? 'தேதி' : currentLang === 'hi' ? 'दिनांक' : 'Date';

  const summaryHeader = currentLang === 'ta'
    ? 'இன்றைய பண்ணைக்கான மொத்த தீவன தேவை (இன்று கலந்து கொடுக்க வேண்டியவை):'
    : currentLang === 'hi'
      ? 'आज कुल झुंड की चारा आवश्यकता (आज मिलाकर खिलाने योग्य आहार):'
      : 'TODAY TOTAL HERD FEEDING REQUIREMENT (WHAT TO MIX & FEED TODAY):';

  const minLabel = currentLang === 'ta' ? 'தாது உப்பு' : currentLang === 'hi' ? 'खनिज' : 'Minerals';
  const saltLabel = currentLang === 'ta' ? 'உப்பு' : currentLang === 'hi' ? 'नमक' : 'Salt';
  const waterLabel = currentLang === 'ta' ? 'குடிநீர்' : currentLang === 'hi' ? 'पेयजल' : 'Water';

  const hasAnyDryFodder = Boolean(
    (totals.totalDryKg && totals.totalDryKg > 0) ||
    cattleList.some(c => (c.dryFodderKg && c.dryFodderKg > 0) || (c.feedItems && c.feedItems.some(f => f.category === 'dry' && f.quantityKg > 0)))
  );

  const hasAnyConcentrate = Boolean(
    (totals.totalConcKg && totals.totalConcKg > 0) ||
    cattleList.some(c => (c.concentrateKg && c.concentrateKg > 0) || (c.feedItems && c.feedItems.some(f => (f.category === 'concentrate' || f.category === 'concentrates') && f.quantityKg > 0)))
  );

  const totalSummary = totals.aggregatedFeedTotals && totals.aggregatedFeedTotals.length > 0
    ? totals.aggregatedFeedTotals
        .filter(f => (hasAnyDryFodder || f.category !== 'dry') && (hasAnyConcentrate || (f.category !== 'concentrate' && f.category !== 'concentrates')))
        .map(f => {
          const trName = currentLang === 'ta' ? translateFeed(f.name, 'ta') : currentLang === 'hi' ? (STEP10_HINDI_MAP[f.name] || f.name) : f.name;
          return `${trName}: ${f.totalKg} kg`;
        }).join('  |  ') + `  |  ${minLabel}: ${totals.totalMineralG || 0} g  |  ${saltLabel}: ${totals.totalSaltG || 0} g  |  ${waterLabel}: ${totals.totalWaterL || 0} L`
    : (currentLang === 'ta'
        ? `பசுந்தீவனம்: ${totals.totalGreenKg || 0} kg${hasAnyDryFodder ? `   |   உலர்தீவனம்: ${totals.totalDryKg || 0} kg` : ''}${hasAnyConcentrate ? `   |   அடர்தீவனம்: ${totals.totalConcKg || 0} kg` : ''}   |   ${minLabel}: ${totals.totalMineralG || 0} g   |   ${saltLabel}: ${totals.totalSaltG || 0} g   |   ${waterLabel}: ${totals.totalWaterL || 0} L`
        : currentLang === 'hi'
          ? `हरा चारा: ${totals.totalGreenKg || 0} kg${hasAnyDryFodder ? `   |   सूखा चारा: ${totals.totalDryKg || 0} kg` : ''}${hasAnyConcentrate ? `   |   दाना मिश्रण: ${totals.totalConcKg || 0} kg` : ''}   |   ${minLabel}: ${totals.totalMineralG || 0} g   |   ${saltLabel}: ${totals.totalSaltG || 0} g   |   ${waterLabel}: ${totals.totalWaterL || 0} L`
          : `Green: ${totals.totalGreenKg || 0} kg${hasAnyDryFodder ? `   |   Dry: ${totals.totalDryKg || 0} kg` : ''}${hasAnyConcentrate ? `   |   Conc: ${totals.totalConcKg || 0} kg` : ''}   |   ${minLabel}: ${totals.totalMineralG || 0} g   |   ${saltLabel}: ${totals.totalSaltG || 0} g   |   ${waterLabel}: ${totals.totalWaterL || 0} L`);

  const thNum = currentLang === 'ta' ? 'எண்' : currentLang === 'hi' ? 'क्र.' : 'No.';
  const thAnimal = currentLang === 'ta' ? 'கால்நடை / மாடு' : currentLang === 'hi' ? 'पशु / पहचान' : 'Cattle & Tag';
  const thWeight = currentLang === 'ta' ? 'உடல் எடை & நிலை' : currentLang === 'hi' ? 'शारीरिक वजन & अवस्था' : 'Weight & Stage';
  const thGreen = currentLang === 'ta' ? 'பசுந்தீவனம் (Green)' : currentLang === 'hi' ? 'हरा चारा (Green)' : 'Green Fodder';
  const thDry = currentLang === 'ta' ? 'உலர் தீவனம் (Dry)' : currentLang === 'hi' ? 'सूखा चारा (Dry)' : 'Dry Fodder';
  const thConc = currentLang === 'ta' ? 'அடர்தீவனம் (Conc)' : currentLang === 'hi' ? 'दाना मिश्रण (Conc)' : 'Concentrate';
  const thMin = currentLang === 'ta' ? 'தாது (Min)' : currentLang === 'hi' ? 'खनिज (Min)' : 'Minerals';
  const thSalt = currentLang === 'ta' ? 'உப்பு' : currentLang === 'hi' ? 'नमक' : 'Salt';
  const thWater = currentLang === 'ta' ? 'குடிநீர்' : currentLang === 'hi' ? 'पानी' : 'Water';

  const instructionText = currentLang === 'ta'
    ? 'குறிப்பு: 2 முதல் 3 வேளைகளாகப் பிரித்து தீவனம் வழங்கவும். தாராளமாக சுத்தமான குடிநீர் எப்போதும் கிடைக்கச் செய்யவும்.'
    : currentLang === 'hi'
      ? 'निर्देश: दिन में 2 से 3 बार विभाजित करके आहार खिलाएं। स्वच्छ ताजा पेयजल चौबीसों घंटे पर्याप्त मात्रा में उपलब्ध रखें।'
      : 'Instructions: Divide green fodder and concentrate into 2-3 split feedings daily. Always provide clean, ad-libitum drinking water.';

  const noteTitle = currentLang === 'ta' ? 'பண்ணை வழிகாட்டல்' : currentLang === 'hi' ? 'फार्म निर्देश' : 'Farmer Instructions';
  const systemFooter = currentLang === 'ta'
    ? 'மடுபொஷாக் பால் பண்ணை ஊட்டச்சத்து தளம்  |  Chimertech & iHerd ஆதரவுடன்'
    : currentLang === 'hi'
      ? 'मूपोषक डेयरी पोषण एवं राशन मंच  |  Chimertech एवं iHerd द्वारा संचालित'
      : 'MOOPOSHAQ Cattle Nutrition System  |  Powered by Chimertech & iHerd';

  const generatedOn = currentLang === 'ta' ? 'பதிவிறக்கம்' : currentLang === 'hi' ? 'दिनांक' : 'Generated on';

  // If Indic language (Tamil or Hindi), render via HTML2Canvas for 100% native font shaping!
  if (isIndic) {
    const tableRowsHtml = cattleList.map((c, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const greenFeeds = (c.feedItems || []).filter(f => f.category === 'green');
      const dryFeeds = (c.feedItems || []).filter(f => f.category === 'dry');
      const concFeeds = (c.feedItems || []).filter(f => f.category === 'concentrate');

      const formatItems = (items, defaultKg, detailsStr) => {
        if (items.length > 0) {
          return items.map(f => {
            const tr = currentLang === 'ta' ? translateFeed(f.name, 'ta') : currentLang === 'hi' ? (STEP10_HINDI_MAP[f.name] || f.name) : f.name;
            return `<div style="line-height: 1.25; margin-bottom: 2px;"><strong>${tr}</strong>: ${f.quantityKg} kg</div>`;
          }).join('');
        }
        if (detailsStr) {
          return `<div style="line-height: 1.25;"><strong>${detailsStr}</strong></div>`;
        }
        return defaultKg > 0 ? `<strong>${defaultKg} kg</strong>` : '—';
      };

      const animalTitle = currentLang === 'ta'
        ? (c.name ? c.name.replace(/Milking Cow/gi, 'கறவை மாடு').replace(/Cow/gi, 'மாடு').replace(/Heifer/gi, 'கிடாரி').replace(/Pregnant/gi, 'சினை').replace(/Dry/gi, 'கறவை நின்ற').replace(/Bull/gi, 'காளை') : `மாடு #${c.number}`)
        : currentLang === 'hi'
          ? (c.name ? c.name.replace(/Milking Cow/gi, 'दुधारू गाय').replace(/Cow/gi, 'गाय').replace(/Heifer/gi, 'बछिया').replace(/Pregnant/gi, 'गर्भवती').replace(/Dry/gi, 'सूखी गाय').replace(/Bull/gi, 'सांड') : `पशु #${c.number}`)
          : (c.name || `Cattle #${c.number}`);

      const stageDesc = c.subtitle || (c.categoryLabel || c.category || '');

      return `
        <tr style="background: ${bg}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 7px 6px; text-align: center; font-weight: 800; border-right: 1px solid #e2e8f0;">#${c.number}</td>
          <td style="padding: 7px 8px; border-right: 1px solid #e2e8f0;">
            <div style="font-weight: 800; color: #0f172a; font-size: 10px;">${animalTitle}</div>
            <div style="font-size: 8.5px; color: #64748b;">${c.categoryLabel || c.category || ''}</div>
          </td>
          <td style="padding: 7px 8px; border-right: 1px solid #e2e8f0;">
            <div style="font-weight: 700; color: #0f172a;">${c.weightKg} kg</div>
            ${stageDesc ? `<div style="font-size: 8px; color: #64748b;">${stageDesc}</div>` : ''}
          </td>
          <td style="padding: 7px 8px; color: #15803d; border-right: 1px solid #e2e8f0; font-size: 8.5px;">${formatItems(greenFeeds, c.greenFodderKg, c.greenFodderDetails)}</td>
          ${hasAnyDryFodder ? `<td style="padding: 7px 8px; color: #b45309; border-right: 1px solid #e2e8f0; font-size: 8.5px;">${formatItems(dryFeeds, c.dryFodderKg, c.dryFodderDetails)}</td>` : ''}
          ${hasAnyConcentrate ? `<td style="padding: 7px 8px; color: #0369a1; border-right: 1px solid #e2e8f0; font-size: 8.5px;">${formatItems(concFeeds, c.concentrateKg, c.concentrateDetails)}</td>` : ''}
          <td style="padding: 7px 6px; text-align: center; font-weight: 700; border-right: 1px solid #e2e8f0;">${c.mineralMixtureG} g</td>
          <td style="padding: 7px 6px; text-align: center; font-weight: 700; border-right: 1px solid #e2e8f0;">${c.saltG || 40} g</td>
          <td style="padding: 7px 6px; text-align: center; font-weight: 800; color: #0284c7;">${c.waterLiters} L</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <div style="width: 794px; min-height: 1120px; box-sizing: border-box; padding: 22px 26px; background: #ffffff; color: #0f172a; font-family: 'Noto Sans Tamil', 'Noto Sans Devanagari', 'Inter', system-ui, sans-serif; position: relative; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <!-- Header Banner -->
          <div style="background: #0284c7; border-radius: 8px; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; color: #ffffff;">
            <div>
              <h2 style="margin: 0; font-size: 17px; font-weight: 800; letter-spacing: 0.3px;">${titleText}</h2>
              <div style="font-size: 11px; opacity: 0.95; margin-top: 3px;">${displayFarmName} &nbsp;|&nbsp; ${breedLabel}: <strong>${breedName}</strong></div>
              <div style="font-size: 9.5px; opacity: 0.85; margin-top: 2px;">${dateLabel}: ${dateStr} &nbsp;|&nbsp; ${totalCattleLabel}: <strong>${cattleList.length}</strong></div>
            </div>
            <div style="background: #ffffff; padding: 5px 10px; border-radius: 6px; display: flex; align-items: center; gap: 8px;">
              <img src="${CHIMERTECH_LOGO}" style="height: 38px; width: 38px; object-fit: contain;" />
              <div style="width: 1px; height: 30px; background: #e2e8f0;"></div>
              <img src="${IHERD_LOGO}" style="height: 32px; width: 48px; object-fit: contain;" />
            </div>
          </div>

          <!-- Summary Box -->
          <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 8px 14px; margin-bottom: 12px;">
            <div style="font-size: 10.5px; font-weight: 800; color: #166534; margin-bottom: 3px;">${summaryHeader}</div>
            <div style="font-size: 9.5px; color: #1e293b; font-weight: 600;">${totalSummary}</div>
          </div>

          <!-- Cattle Feed Allocations Table -->
          <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 12px;">
            <thead>
              <tr style="background: #0284c7; color: #ffffff; text-align: left; font-size: 9px;">
                <th style="padding: 7px 6px; border: 1px solid #0284c7; text-align: center; width: 32px;">${thNum}</th>
                <th style="padding: 7px 8px; border: 1px solid #0284c7; width: 140px;">${thAnimal}</th>
                <th style="padding: 7px 8px; border: 1px solid #0284c7; width: 85px;">${thWeight}</th>
                <th style="padding: 7px 8px; border: 1px solid #0284c7; color: #dcfce7; width: ${hasAnyDryFodder ? '125px' : '185px'};">${thGreen}</th>
                ${hasAnyDryFodder ? `<th style="padding: 7px 8px; border: 1px solid #0284c7; color: #fef08a; width: 110px;">${thDry}</th>` : ''}
                ${hasAnyConcentrate ? `<th style="padding: 7px 8px; border: 1px solid #0284c7; color: #e0f2fe; width: 120px;">${thConc}</th>` : ''}
                <th style="padding: 7px 6px; border: 1px solid #0284c7; text-align: center; width: 55px;">${thMin}</th>
                <th style="padding: 7px 6px; border: 1px solid #0284c7; text-align: center; width: 45px;">${thSalt}</th>
                <th style="padding: 7px 6px; border: 1px solid #0284c7; text-align: center; width: 50px;">${thWater}</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <!-- Notes & Advisory -->
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; font-size: 9px; color: #334155; line-height: 1.4;">
            <strong style="color: #0f172a;">${noteTitle}:</strong> ${instructionText}
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 8.5px; color: #94a3b8;">
          <span>${systemFooter}</span>
          <span>${generatedOn}: ${dateStr}</span>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px';
    container.style.zIndex = '-1000';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    try {
      const pageEl = container.firstElementChild;
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);

      const fileCity = location ? location.replace(/[^a-zA-Z0-9]/g, '_') : 'Farm';
      doc.save(`Daily_Feed_Slip_${fileCity}_${currentLang}_${dateStr.replace(/\s+/g, '_')}.pdf`);
      return;
    } catch (e) {
      console.warn('HTML2Canvas Daily Slip PDF generation error, falling back to standard jsPDF:', e);
    } finally {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  }

  // Standard jsPDF fallback for English
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Branded Header (30mm height)
  doc.setFillColor(2, 132, 199);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setFillColor(56, 189, 248);
  doc.rect(0, 30, pageWidth, 2, 'F');

  const boxW = 44;
  const boxH = 18;
  const boxX = pageWidth - boxW - 8;
  const boxY = 6;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(boxX, boxY, boxW, boxH, 2.5, 2.5, 'F');

  try {
    doc.addImage(CHIMERTECH_LOGO, 'PNG', boxX + 2, boxY + 1.5, 15, 15);
  } catch (e) {
    console.warn('Could not add Chimertech logo:', e);
  }

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(boxX + 19, boxY + 2.5, boxX + 19, boxY + boxH - 2.5);

  try {
    doc.addImage(IHERD_LOGO, 'PNG', boxX + 21, boxY + 2.5, 21, 13);
  } catch (e) {
    console.warn('Could not add iHerd logo:', e);
  }

  const textMaxW = boxX - 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(titleText.length > 38 ? 10.5 : 12);
  doc.setTextColor(255, 255, 255);
  doc.text(titleText, 12, 10.5, { maxWidth: textMaxW });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(224, 242, 254);
  doc.text(`${displayFarmName}  |  ${breedLabel}: ${breedName}`, 12, 18, { maxWidth: textMaxW });

  doc.setFontSize(7.5);
  doc.setTextColor(240, 249, 255);
  doc.text(`Date: ${dateStr}  |  ${totalCattleLabel}: ${cattleList.length} Head`, 12, 25, { maxWidth: textMaxW });

  // Summary Banner
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(134, 239, 172);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, 36, pageWidth - 28, 14, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  doc.text(summaryHeader, 18, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(totalSummary, 18, 47, { maxWidth: pageWidth - 36 });

  const tableData = cattleList.map((c) => {
    const greenFeeds = (c.feedItems || []).filter(f => f.category === 'green');
    const dryFeeds = (c.feedItems || []).filter(f => f.category === 'dry');
    const concFeeds = (c.feedItems || []).filter(f => f.category === 'concentrate');

    const greenStr = greenFeeds.length > 0 
      ? greenFeeds.map(f => `${f.name}: ${f.quantityKg}kg`).join('\n')
      : `${c.greenFodderKg} kg`;

    const dryStr = dryFeeds.length > 0
      ? dryFeeds.map(f => `${f.name}: ${f.quantityKg}kg`).join('\n')
      : `${c.dryFodderKg} kg`;

    const concStr = concFeeds.length > 0
      ? concFeeds.map(f => `${f.name}: ${f.quantityKg}kg`).join('\n')
      : `${c.concentrateKg} kg`;

    const row = [
      `#${c.number}`,
      `${c.name}\n(${c.categoryLabel || c.category})`,
      `${c.weightKg} kg\n${c.subtitle || ''}`,
      greenStr,
    ];
    if (hasAnyDryFodder) {
      row.push(dryStr);
    }
    if (hasAnyConcentrate) {
      row.push(concStr);
    }
    row.push(
      `${c.mineralMixtureG} g`,
      `${c.saltG || 40} g`,
      `${c.waterLiters} L`
    );
    return row;
  });

  const headRow = [thNum, thAnimal, thWeight, thGreen];
  if (hasAnyDryFodder) {
    headRow.push(thDry);
  }
  if (hasAnyConcentrate) {
    headRow.push(thConc);
  }
  headRow.push(thMin, thSalt, thWater);

  autoTable(doc, {
    startY: 54,
    head: [headRow],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [2, 132, 199],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center',
    },
    styles: {
      fontSize: 7.0,
      cellPadding: 2.0,
      valign: 'middle',
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 9, fontStyle: 'bold' },
      1: { fontStyle: 'bold', cellWidth: 32 },
      2: { cellWidth: 24 },
      3: { cellWidth: 35, fontStyle: 'bold', textColor: [21, 128, 61] },
      4: { cellWidth: 28, fontStyle: 'bold', textColor: [180, 83, 9] },
      5: { cellWidth: 30, fontStyle: 'bold', textColor: [2, 132, 199] },
      6: { halign: 'center', cellWidth: 14 },
      7: { halign: 'center', cellWidth: 12 },
      8: { halign: 'center', cellWidth: 14, fontStyle: 'bold', textColor: [3, 105, 161] },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  const finalY = doc.lastAutoTable.finalY + 6;
  if (finalY < pageHeight - 20) {
    doc.setFontSize(7.2);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.text(instructionText, 14, finalY);
  }

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(systemFooter, 14, pageHeight - 8);
  doc.text(`${generatedOn} ${dateStr}`, pageWidth - 14, pageHeight - 8, { align: 'right' });

  const fileCity = location ? location.replace(/[^a-zA-Z0-9]/g, '_') : 'Farm';
  doc.save(`Daily_Feed_Slip_${fileCity}_${dateStr.replace(/\s+/g, '_')}.pdf`);
}

