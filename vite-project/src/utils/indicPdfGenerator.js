import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CHIMERTECH_LOGO, IHERD_LOGO } from './brandLogos.js';
import { resolveLocationDetails } from './locationHelper';
import { translateFeed, translateCategory } from './tamilTranslations.js';
import { 
  STEP10_HINDI_MAP, 
  translateSafetyGate, 
  getAnimalGreenDetails, 
  getAnimalDryDetails, 
  getAnimalConcDetails 
} from './step10ReviewTranslations.js';

/**
 * Universal Offscreen HTML-to-PDF Renderer for Indic (Tamil & Hindi) and English scripts.
 * Renders A4 pages (794px x 1122px) via html2canvas at scale: 2 for 300-DPI equivalent sharpness.
 */
async function renderHtmlPagesToPdf(pagesArray, fileName) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.background = '#ffffff';
  container.style.zIndex = '-1000';
  container.style.fontFamily = "'Noto Sans Tamil', 'Noto Sans Devanagari', 'Inter', system-ui, -apple-system, sans-serif";
  document.body.appendChild(container);

  try {
    for (let i = 0; i < pagesArray.length; i++) {
      const pageDiv = document.createElement('div');
      pageDiv.style.width = '794px';
      pageDiv.style.minHeight = '1120px';
      pageDiv.style.boxSizing = 'border-box';
      pageDiv.style.padding = '22px 26px';
      pageDiv.style.background = '#ffffff';
      pageDiv.style.position = 'relative';
      pageDiv.innerHTML = pagesArray[i];
      container.appendChild(pageDiv);

      const canvas = await html2canvas(pageDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      if (i > 0) doc.addPage();
      doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);

      container.removeChild(pageDiv);
    }

    doc.save(fileName);
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Helper to get feed name in Tamil, Hindi, or English
 */
function getTrFeedName(feedName, lang) {
  if (!feedName) return '—';
  if (lang === 'ta') return translateFeed(feedName, 'ta');
  if (lang === 'hi') return STEP10_HINDI_MAP[feedName] || feedName;
  return feedName;
}

/**
 * EXPORT 1: DOWNLOAD COMPLETE FARM RECORDED INPUT DATA PDF IN NATIVE TAMIL / HINDI / ENGLISH
 */
export async function downloadIndicInputDataPDF({
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
  currentLang = 'ta'
}) {
  const isTa = currentLang === 'ta';
  const isHi = currentLang === 'hi';
  const lang = currentLang;
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const locInfo = resolveLocationDetails(weather?.city);
  const farmName = isTa ? locInfo.farmNameTa : isHi ? locInfo.farmNameHi : locInfo.farmName;
  const breedName = selectedBreed?.name || (isTa ? 'கலப்பின மாடு' : isHi ? 'मिश्रित नस्ल' : 'Crossbred Cattle');

  const title = isTa ? 'பண்ணை பதிவு செய்யப்பட்ட உள்ளீட்டு தரவு அறிக்கை' : isHi ? 'फार्म दर्ज इनपुट डेटा समीक्षा रिपोर्ट' : 'FARM RECORDED INPUT DATA REPORT';
  const subTitle = isTa ? `${farmName}  |  பதிவு செய்யப்பட்ட அனைத்து கால்நடை மற்றும் தீவன விவரங்கள்` : isHi ? `${farmName}  |  सभी दर्ज मवेशी एवं चारा इनपुट विवरण` : `${farmName}  |  Complete Review of Recorded Herd & Feeds`;
  const metaLine = isTa ? `தேதி: ${dateStr}  |  மடுபொஷாக் பால் பண்ணை ஊட்டச்சத்து தளம்` : isHi ? `दिनांक: ${dateStr}  |  मूपोषक डेयरी पशु पोषण मंच` : `Date: ${dateStr}  |  MOOPOSHAQ Precision Dairy Advisory System`;

  // Precompute Milking Rows
  let milkingRowsHtml = '';
  if (lactatingData && lactatingData.length > 0) {
    milkingRowsHtml = lactatingData.map((c, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
      const cTitle = c.title || c.tag || (isTa ? `கறவை மாடு #${i + 1}` : isHi ? `दुधारू गाय #${i + 1}` : `Cow #${i + 1}`);
      const lactType = (c.lactationType === 'first_lactation' || c.isFirstLactation) 
        ? (isTa ? 'முதல் கறவை' : isHi ? 'पहला दुग्धकाल' : '1st Lactation') 
        : (isTa ? 'இரண்டாம்+ கறவை' : isHi ? 'दूसरा+ दुग्धकाल' : '2nd+ Lactation');
      const stageTxt = c.stage || (isTa ? 'நடுப்பருவம்' : isHi ? 'मध्य काल' : 'Mid');
      return `
        <tr style="background: ${bg}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 5px 6px; text-align: center; font-weight: 700;">#${i + 1}</td>
          <td style="padding: 5px 8px; font-weight: 800; color: #0f172a;">${cTitle}</td>
          <td style="padding: 5px 8px;">${lactType}</td>
          <td style="padding: 5px 8px; font-weight: 700;">${c.weight || 0} kg</td>
          <td style="padding: 5px 8px;">${stageTxt} (BCS ${c.bcs ?? 3.0})</td>
          <td style="padding: 5px 8px; font-weight: 800; color: #16a34a;">${c.milkYield || 0} L/day</td>
          <td style="padding: 5px 8px;">${c.fat || c.milkFat || 4.2} %</td>
        </tr>
      `;
    }).join('');
  }

  // Precompute Pregnant Rows
  let pregnantRowsHtml = '';
  const allPreg = [...firstTimeCattle.map(c => ({ ...c, isFirst: true })), ...repeatCattle.map(c => ({ ...c, isFirst: false }))];
  if (allPreg.length > 0) {
    pregnantRowsHtml = allPreg.map((c, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
      const cTitle = c.title || c.tag || (isTa ? `சினை மாடு #${i + 1}` : isHi ? `गर्भवती पशु #${i + 1}` : `Pregnant #${i + 1}`);
      const catTxt = c.isFirst ? (isTa ? 'முதல்முறை சினை (கிடாரி)' : isHi ? 'प्रथम गर्भाधान बछिया' : 'First-time Heifer') : (isTa ? 'மறுசினை மாடு' : isHi ? 'पुनः गर्भवती गाय' : 'Repeat Cow');
      const stageTxt = c.inputType === 'days' ? `${c.pregDays || 0} ${isTa ? 'நாட்கள்' : isHi ? 'दिन' : 'days'}` : `${isTa ? 'மாதம்' : isHi ? 'माह' : 'Month'} ${c.pregMonth || 1}`;
      return `
        <tr style="background: ${bg}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 5px 6px; text-align: center; font-weight: 700;">#${i + 1}</td>
          <td style="padding: 5px 8px; font-weight: 800; color: #0f172a;">${cTitle}</td>
          <td style="padding: 5px 8px;">${catTxt}</td>
          <td style="padding: 5px 8px; font-weight: 700;">${c.weight || 0} kg</td>
          <td style="padding: 5px 8px; font-weight: 700; color: #ea580c;">${stageTxt}</td>
        </tr>
      `;
    }).join('');
  }

  // Precompute Other Animals Rows
  let otherRowsHtml = '';
  const otherList = [
    ...heifersData.map((h, i) => ({ num: i + 1, cat: isTa ? 'வளரும் கிடாரி' : isHi ? 'बछिया' : 'Heifer', title: h.title || `Heifer #${i + 1}`, weight: h.weight || 0, extra: `${h.ageMonths || 12} ${isTa ? 'மாதங்கள்' : isHi ? 'माह' : 'months'}` })),
    ...dryCowsData.map((d, i) => ({ num: i + 1, cat: isTa ? 'வறண்ட மாடு' : isHi ? 'सूखी गाय' : 'Dry Cow', title: d.title || `Dry #${i + 1}`, weight: d.weight || 0, extra: `${d.dryDays || 60} ${isTa ? 'நாட்கள் வறட்சி' : isHi ? 'दिन सूखे' : 'days dry'}` })),
    ...bullsData.map((b, i) => ({ num: i + 1, cat: isTa ? 'காளை' : isHi ? 'सांड' : 'Bull', title: b.title || `Bull #${i + 1}`, weight: b.weight || 0, extra: b.purpose === 'breeding' ? (isTa ? 'இனப்பெருக்கம்' : isHi ? 'प्रजनन' : 'Breeding') : (isTa ? 'வேலை மாடு' : isHi ? 'कार्य' : 'Draught') }))
  ];

  if (otherList.length > 0) {
    otherRowsHtml = otherList.map((o, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
      return `
        <tr style="background: ${bg}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 5px 6px; text-align: center; font-weight: 700;">#${i + 1}</td>
          <td style="padding: 5px 8px; font-weight: 800; color: #0f172a;">${o.title}</td>
          <td style="padding: 5px 8px; font-weight: 700; color: #166534;">${o.cat}</td>
          <td style="padding: 5px 8px; font-weight: 700;">${o.weight} kg</td>
          <td style="padding: 5px 8px; color: #475569;">${o.extra}</td>
        </tr>
      `;
    }).join('');
  }

  // Precompute Selected Feeds Rows
  let feedRowsHtml = '';
  if (selectedFeeds && selectedFeeds.length > 0) {
    feedRowsHtml = selectedFeeds.map((f, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
      const trFeed = getTrFeedName(f.name, lang);
      const trCat = isTa ? translateCategory(f.category, 'ta') : isHi ? (STEP10_HINDI_MAP[f.category] || f.category) : f.category;
      const amt = f.amountKg || f.amount || f.dailyAmountKg || 0;
      return `
        <tr style="background: ${bg}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 5px 6px; text-align: center; font-weight: 700;">#${i + 1}</td>
          <td style="padding: 5px 8px; font-weight: 800; color: #0f172a;">${trFeed}</td>
          <td style="padding: 5px 8px; color: #475569;">${trCat}</td>
          <td style="padding: 5px 8px; font-weight: 800; color: #16a34a;">${amt} kg / day</td>
          <td style="padding: 5px 8px; text-align: center;">${f.dryMatterPct || f.dm || 20} %</td>
        </tr>
      `;
    }).join('');
  }

  // Page 1
  const page1 = `
    <div style="display: flex; flex-direction: column; justify-content: space-between; min-height: 1076px;">
      <div>
        <div style="background: #15803d; border-radius: 8px; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; color: #ffffff;">
          <div>
            <h2 style="margin: 0; font-size: 16px; font-weight: 800; letter-spacing: 0.3px;">${title}</h2>
            <div style="font-size: 10.5px; opacity: 0.95; margin-top: 3px;">${subTitle}</div>
            <div style="font-size: 9px; opacity: 0.85; margin-top: 2px;">${metaLine}</div>
          </div>
          <div style="background: #ffffff; padding: 5px 10px; border-radius: 6px; display: flex; align-items: center; gap: 8px;">
            <img src="${CHIMERTECH_LOGO}" style="height: 38px; width: 38px; object-fit: contain;" />
            <div style="width: 1px; height: 30px; background: #e2e8f0;"></div>
            <img src="${IHERD_LOGO}" style="height: 32px; width: 48px; object-fit: contain;" />
          </div>
        </div>

        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 8px 14px; margin-bottom: 12px;">
          <div style="font-size: 10.5px; font-weight: 800; color: #166534; margin-bottom: 3px;">
            ${isTa ? 'பண்ணை ஒட்டுமொத்த சுருக்கம் (FARM OVERVIEW):' : isHi ? 'फार्म समग्र अवलोकन (FARM OVERVIEW):' : 'FARM SUMMARY OVERVIEW:'}
          </div>
          <div style="font-size: 9.5px; color: #1e293b; font-weight: 600;">
            ${isTa 
              ? `பண்ணை இனம்: <strong>${breedName}</strong> &nbsp;|&nbsp; மொத்த மாடுகள்: <strong>${totalCattleCount}</strong> &nbsp;|&nbsp; மொத்த எடை: <strong>${totalHerdWeightKg} kg</strong> &nbsp;|&nbsp; மொத்த பால்: <strong>${totalDailyMilkL} L/நாள்</strong>`
              : isHi
                ? `नस्ल: <strong>${breedName}</strong> &nbsp;|&nbsp; कुल पशु: <strong>${totalCattleCount}</strong> &nbsp;|&nbsp; कुल शारीरिक भार: <strong>${totalHerdWeightKg} किग्रा</strong> &nbsp;|&nbsp; कुल दूध: <strong>${totalDailyMilkL} ली/दिन</strong>`
                : `Breed: <strong>${breedName}</strong> &nbsp;|&nbsp; Total Herd: <strong>${totalCattleCount} Animals</strong> &nbsp;|&nbsp; Total Weight: <strong>${totalHerdWeightKg} kg</strong> &nbsp;|&nbsp; Total Daily Milk: <strong>${totalDailyMilkL} L/day</strong>`}
          </div>
        </div>

        <div style="background: #0284c7; color: #ffffff; padding: 6px 12px; border-radius: 6px; font-size: 10.5px; font-weight: 800; margin-bottom: 8px;">
          ${isTa ? '1. கறவை மாடுகள் விவரம் (MILKING HERD)' : isHi ? '1. दुधारू गायों का विवरण (MILKING HERD)' : '1. RECORDED MILKING HERD'}
        </div>
        ${milkingRowsHtml ? `
          <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 12px;">
            <thead>
              <tr style="background: #e0f2fe; color: #0369a1; text-align: left; font-size: 8.5px;">
                <th style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; width: 28px;">#</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'மாடு / குறிச்சொல்' : isHi ? 'गाय / टैग' : 'Tag / Name'}</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'கறவை நிலை' : isHi ? 'दुग्धकाल' : 'Lactation'}</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'உடல் எடை' : isHi ? 'वजन' : 'Weight'}</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'பருவம் & BCS' : isHi ? 'अवस्था एवं BCS' : 'Stage & BCS'}</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'பால் அளவு' : isHi ? 'दूध' : 'Daily Milk'}</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'கொழுப்பு' : isHi ? 'फैट' : 'Fat %'}</th>
              </tr>
            </thead>
            <tbody>${milkingRowsHtml}</tbody>
          </table>
        ` : `<div style="font-size: 9px; color: #64748b; font-style: italic; padding: 4px; margin-bottom: 10px;">${isTa ? 'கறவை மாடுகள் பதிவு செய்யப்படவில்லை.' : isHi ? 'कोई दुधारू गाय दर्ज नहीं है।' : 'No milking cows recorded.'}</div>`}

        <div style="background: #c2410c; color: #ffffff; padding: 6px 12px; border-radius: 6px; font-size: 10.5px; font-weight: 800; margin-bottom: 8px;">
          ${isTa ? '2. சினை மாடுகள் விவரம் (PREGNANT CATTLE)' : isHi ? '2. गर्भवती मवेशियों का विवरण (PREGNANT CATTLE)' : '2. RECORDED PREGNANT CATTLE'}
        </div>
        ${pregnantRowsHtml ? `
          <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 12px;">
            <thead>
              <tr style="background: #ffedd5; color: #9a3412; text-align: left; font-size: 8.5px;">
                <th style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; width: 28px;">#</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'மாடு / குறிச்சொல்' : isHi ? 'पशु / टैग' : 'Tag / Name'}</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'பிரிவு' : isHi ? 'श्रेणी' : 'Category'}</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'உடல் எடை' : isHi ? 'वजन' : 'Weight'}</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'சினை காலம்' : isHi ? 'गर्भावधि' : 'Gestation'}</th>
              </tr>
            </thead>
            <tbody>${pregnantRowsHtml}</tbody>
          </table>
        ` : `<div style="font-size: 9px; color: #64748b; font-style: italic; padding: 4px; margin-bottom: 10px;">${isTa ? 'சினை மாடுகள் பதிவு செய்யப்படவில்லை.' : isHi ? 'कोई गर्भवती पशु दर्ज नहीं है।' : 'No pregnant cattle recorded.'}</div>`}

        <div style="background: #15803d; color: #ffffff; padding: 6px 12px; border-radius: 6px; font-size: 10.5px; font-weight: 800; margin-bottom: 8px;">
          ${isTa ? '3. பிற கால்நடைகள் (HEIFERS, DRY COWS & BULLS)' : isHi ? '3. अन्य मवेशी (बछिया, सूखी गायें एवं सांड)' : '3. OTHER RECORDED CATTLE'}
        </div>
        ${otherRowsHtml ? `
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
            <thead>
              <tr style="background: #dcfce7; color: #166534; text-align: left; font-size: 8.5px;">
                <th style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; width: 28px;">#</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'கால்நடை குறிப்பு' : isHi ? 'पशु पहचान' : 'Animal Name'}</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'வகை' : isHi ? 'प्रकार' : 'Category'}</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'உடல் எடை' : isHi ? 'वजन' : 'Weight'}</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'கூடுதல் விவரம்' : isHi ? 'अतिरिक्त विवरण' : 'Details'}</th>
              </tr>
            </thead>
            <tbody>${otherRowsHtml}</tbody>
          </table>
        ` : `<div style="font-size: 9px; color: #64748b; font-style: italic; padding: 4px;">${isTa ? 'பிற கால்நடைகள் எதுவும் பதிவு செய்யப்படவில்லை.' : isHi ? 'कोई अन्य पशु दर्ज नहीं है।' : 'No other cattle recorded.'}</div>`}
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8.5px; color: #94a3b8;">
        <span>${isTa ? 'மடுபொஷாக் கால்நடை ஊட்டச்சத்து தளம் | Chimertech & iHerd' : isHi ? 'मूपोषक डेयरी पोषण मंच | Chimertech एवं iHerd' : 'MOOPOSHAQ System | Powered by Chimertech & iHerd'}</span>
        <span>${isTa ? 'பக்கம் 1 / 2' : isHi ? 'पृष्ठ 1 / 2' : 'Page 1 of 2'}</span>
      </div>
    </div>
  `;

  // Page 2
  const page2 = `
    <div style="display: flex; flex-direction: column; justify-content: space-between; min-height: 1076px;">
      <div>
        <div style="background: #15803d; border-radius: 8px; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; color: #ffffff;">
          <div style="font-size: 12px; font-weight: 800;">${title} &nbsp;|&nbsp; ${farmName}</div>
          <div style="background: #ffffff; padding: 3px 8px; border-radius: 5px; display: flex; align-items: center; gap: 6px;">
            <img src="${CHIMERTECH_LOGO}" style="height: 26px; width: 26px; object-fit: contain;" />
            <div style="width: 1px; height: 20px; background: #e2e8f0;"></div>
            <img src="${IHERD_LOGO}" style="height: 22px; width: 34px; object-fit: contain;" />
          </div>
        </div>

        <div style="margin-bottom: 14px;">
          <div style="background: #059669; color: #ffffff; padding: 5px 10px; border-radius: 5px; font-size: 10px; font-weight: 800; margin-bottom: 6px;">
            ${isTa ? '4. மேய்ச்சல் மற்றும் குடிநீர் மேலாண்மை (GRAZING & WATER)' : isHi ? '4. चराई प्रणाली एवं जल प्रबंधन (GRAZING & WATER)' : '4. GRAZING & WATER MANAGEMENT'}
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 8px;">
            <thead>
              <tr style="background: #d1fae5; color: #065f46; text-align: left;">
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'மேலாண்மை அம்சம்' : isHi ? 'प्रबंधन घटक' : 'Management Parameter'}</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'பண்ணை பதிவு செய்யப்பட்ட விவரம்' : isHi ? 'फार्म दर्ज विवरण' : 'Recorded Value / Details'}</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background: #ffffff; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 5px 8px; font-weight: 700;">${isTa ? 'மேய்ச்சல் முறை (Grazing System):' : isHi ? 'चराई प्रणाली:' : 'Grazing System:'}</td>
                <td style="padding: 5px 8px;">${grazingSystem === 'outside' ? (isTa ? 'பண்ணைக்கு வெளியே மேய்ச்சல்' : isHi ? 'फार्म के बाहर चराई' : 'Outside Farm') : grazingSystem === 'inside' ? (isTa ? 'பண்ணைக்குள் மேய்ச்சல்' : isHi ? 'फार्म के अंदर चराई' : 'Inside Farm') : (isTa ? 'கொட்டகை வளர்ப்பு (Zero-Grazing Stall-Fed)' : isHi ? 'खूंटे पर (Zero-Grazing)' : 'Stall-Fed Zero Grazing')}</td>
              </tr>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 5px 8px; font-weight: 700;">${isTa ? 'தினசரி குடிநீர் இருப்பு (Daily Water Supply):' : isHi ? 'दैनिक पेयजल उपलब्धता:' : 'Daily Water Available:'}</td>
                <td style="padding: 5px 8px; font-weight: 800; color: #0284c7;">${waterVolume} ${isTa ? 'லிட்டர் / நாள்' : isHi ? 'लीटर / दिन' : 'Litres / day'} (${waterSource || (isTa ? 'பண்ணை நீர் ஆதாரம்' : isHi ? 'फार्म बोरवेल/सप्लाई' : 'Farm Supply')})</td>
              </tr>
              <tr style="background: #ffffff; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 5px 8px; font-weight: 700;">${isTa ? 'தண்ணீர் தரம் (Water Quality):' : isHi ? 'पानी की गुणवत्ता:' : 'Water Quality:'}</td>
                <td style="padding: 5px 8px;">${waterQuality === 'poor' ? (isTa ? 'சுமாரான தரம் (உப்பு நீர்)' : isHi ? 'खराब / खारा' : 'Poor / Saline') : waterQuality === 'average' ? (isTa ? 'சாதாரண தரம்' : isHi ? 'औसत' : 'Average') : (isTa ? 'நல்ல சுத்தமான குடிநீர்' : isHi ? 'स्वच्छ मीठा पेयजल' : 'Good Clean Water')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 14px;">
          <div style="background: #166534; color: #ffffff; padding: 5px 10px; border-radius: 5px; font-size: 10px; font-weight: 800; margin-bottom: 6px;">
            ${isTa ? '5. பண்ணை தீவன இருப்பு விவரம் (SELECTED FEEDS & FODDER)' : isHi ? '5. चयनित चारा एवं दाना भंडार (SELECTED FEEDS & FODDER)' : '5. RECORDED FEED INVENTORY'}
          </div>
          ${feedRowsHtml ? `
            <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
              <thead>
                <tr style="background: #dcfce7; color: #166534; text-align: left;">
                  <th style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; width: 30px;">#</th>
                  <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'தீவன பொருள்' : isHi ? 'चारा सामग्री' : 'Feed Ingredient'}</th>
                  <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'தீவன வகை' : isHi ? 'चारे का प्रकार' : 'Category'}</th>
                  <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'பண்ணையில் கிடைக்கும் தினசரி அளவு' : isHi ? 'दैनिक उपलब्ध मात्रा' : 'Available Daily Quantity'}</th>
                  <th style="padding: 5px 8px; border: 1px solid #cbd5e1; text-align: center;">${isTa ? 'உலர் பொருள் (DM %)' : isHi ? 'शुष्क पदार्थ (DM %)' : 'Dry Matter %'}</th>
                </tr>
              </thead>
              <tbody>${feedRowsHtml}</tbody>
            </table>
          ` : `<div style="font-size: 9px; color: #64748b; font-style: italic; padding: 4px;">${isTa ? 'தீவனங்கள் எதுவும் பதிவு செய்யப்படவில்லை.' : isHi ? 'कोई चारा सामग्री दर्ज नहीं है।' : 'No feeds selected.'}</div>`}
        </div>

        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 14px; margin-top: 16px;">
          <div style="font-size: 10.5px; font-weight: 800; color: #166534; margin-bottom: 4px;">
            ${isTa ? 'பண்ணையாளர் உறுதிப்படுத்தல் & அறிவியல் ஊட்டச்சத்து சரிபார்ப்பு:' : isHi ? 'फार्म सत्यापन एवं वैज्ञानिक पोषण प्रमाणन:' : 'Farmer Input Confirmation & Scientific Validation:'}
          </div>
          <div style="font-size: 9px; color: #1e293b; line-height: 1.4;">
            ${isTa 
              ? 'மேலே பதிவு செய்யப்பட்டுள்ள அனைத்து விவரங்களும் (கால்நடைகளின் உடல் எடைகள், தினசரி பால் அளவுகள், கறவைப் பருவம் மற்றும் இருப்புத் தீவனங்கள்) உள்ளூர் கால்நடை மருத்துவர்/ஆலோசகர் வழிகாட்டுதலின்படி சரிபார்க்கப்பட்டுள்ளன. இந்தத் தரவுகளின் அடிப்படையில் மட்டுமே தினசரி சமச்சீர் தீவன விகிதம் துல்லியமாகக் கணக்கிடப்படுகிறது.'
              : isHi
                ? 'ऊपर दर्ज किए गए सभी विवरण (पशुओं का शारीरिक वजन, दैनिक दूध उत्पादन, गर्भावधि एवं चारा भंडार) वैज्ञानिक पोषण मानकों के अनुसार सत्यापित हैं। इन्हीं इनपुट के आधार पर आपके पूरे झुंड का सटीक दैनिक आहार राशन निर्धारित किया जाता है।'
                : 'All farm telemetry, animal live weights, daily milk yields, and feed inventories recorded above have been validated for precision scientific feed formulation.'}
          </div>
        </div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8.5px; color: #94a3b8;">
        <span>${isTa ? 'மடுபொஷாக் கால்நடை ஊட்டச்சத்து தளம் | Chimertech & iHerd' : isHi ? 'मूपोषक डेयरी पोषण मंच | Chimertech एवं iHerd' : 'MOOPOSHAQ System | Powered by Chimertech & iHerd'}</span>
        <span>${isTa ? 'பக்கம் 2 / 2' : isHi ? 'पृष्ठ 2 / 2' : 'Page 2 of 2'}</span>
      </div>
    </div>
  `;

  const safeCity = (weather?.city || 'DairyFarm').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Farm_Input_Data_${safeCity}_${lang}_${new Date().toISOString().slice(0, 10)}.pdf`;
  await renderHtmlPagesToPdf([page1, page2], fileName);
}

/**
 * EXPORT 2: DOWNLOAD COMPLETE NUTRITION & FEEDING ADVISORY REPORT PDF IN NATIVE TAMIL / HINDI / ENGLISH
 */
export async function downloadIndicFeedingReportPDF({
  calcResult,
  weather,
  selectedBreed,
  totalCattleCount = 0,
  totalHerdWeightKg = 0,
  totalDailyMilkL = 0,
  waterVolume = 0,
  selectedFeeds = [],
  reportLang = 'ta'
}) {
  if (!calcResult) {
    alert('Please generate the nutrition calculation first before downloading the PDF report.');
    return;
  }

  const isTa = reportLang === 'ta';
  const isHi = reportLang === 'hi';
  const lang = reportLang;
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const locInfo = resolveLocationDetails(weather?.city);
  const farmName = isTa ? locInfo.farmNameTa : isHi ? locInfo.farmNameHi : locInfo.farmName;
  const breedName = selectedBreed?.name || (isTa ? 'கலப்பின மாடு' : isHi ? 'मिश्रित नस्ल' : 'Crossbred Cattle');

  const overallStatus = calcResult.practicalFeedingReport?.overallResult?.status || 'Ration needs adjustment';
  const isApproved = calcResult.practicalFeedingReport?.isApproved ?? false;

  const reportTitle = isTa 
    ? (isApproved ? 'பால் மாடுகள் தீவன ஊட்டச்சத்து அறிக்கை (அங்கீகரிக்கப்பட்டது)' : 'பால் மாடுகள் தீவன ஆலோசனை அறிக்கை (மாற்றம் தேவை)')
    : isHi
      ? (isApproved ? 'डेयरी पशु पोषण एवं आहार रिपोर्ट (स्वीकृत)' : 'डेयरी पशु पोषण सलाह रिपोर्ट (बदलाव आवश्यक)')
      : (isApproved ? 'DAIRY CATTLE NUTRITION & FEEDING REPORT (APPROVED)' : 'DAIRY CATTLE NUTRITION REPORT (ADJUSTMENT NEEDED)');

  const subTitle = isTa
    ? `${farmName}  |  அறிவியல் தீவன ஆலோசனை மற்றும் தினசரி மந்தை ஒதுக்கீடு`
    : isHi
      ? `${farmName}  |  वैज्ञानिक राशन सलाह एवं दैनिक मवेशी झुंड आवंटन`
      : `${farmName}  |  Scientific Ration Advisory & Herd Allocation`;

  const metaLine = isTa
    ? `தேதி: ${dateStr}  |  மடுபொஷாக் பால் பண்ணை ஊட்டச்சத்து தளம்`
    : isHi
      ? `दिनांक: ${dateStr}  |  मूपोषक डेयरी पोषण मंच`
      : `Date: ${dateStr}  |  MOOPOSHAQ Precision Feeding Advisory Platform`;

  const totalFreshFeed = calcResult.practicalFeedingReport?.totalFreshFeedKg || 0;
  const herdMinG = calcResult.practicalFeedingReport?.herdSummary?.mineralMixtureTotalG || calcResult.practicalFeedingReport?.mineralMixtureGrams || 250;
  const herdSaltG = calcResult.practicalFeedingReport?.herdSummary?.saltTotalG || calcResult.practicalFeedingReport?.saltGrams || 150;
  const waterReq = Math.round(Number(calcResult.waterAnalysis?.requiredLiters || calcResult.waterAnalysis?.waterRequiredLiters || calcResult.practicalFeedingReport?.waterLiters || 0));

  const milkingAnimals = calcResult.practicalFeedingReport?.perCategory?.milkingCow?.animals || [];
  const pregnantAnimals = calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.animals || calcResult.practicalFeedingReport?.perCategory?.pregnant?.animals || [];
  const heiferAnimals = calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.animals || calcResult.practicalFeedingReport?.perCategory?.heifer?.animals || [];
  const dryAnimals = calcResult.practicalFeedingReport?.perCategory?.dryCow?.animals || [];
  const bullAnimals = calcResult.practicalFeedingReport?.perCategory?.bull?.animals || [];

  const hasAnyDryFodder = Boolean(
    (selectedFeeds && selectedFeeds.some(f => (f.category === 'dry_fodder' || f.category === 'dry') && (f.amountKg > 0 || f.amount > 0 || f.dailyAmountKg > 0))) ||
    (calcResult.practicalFeedingReport?.herdSummary?.dryFodderKg > 0) ||
    (calcResult.practicalFeedingReport?.feedIngredientTable && calcResult.practicalFeedingReport.feedIngredientTable.some(f => (f.category === 'dry_fodder' || f.category === 'dry') && f.recommendedKg > 0)) ||
    [...milkingAnimals, ...pregnantAnimals, ...heiferAnimals, ...dryAnimals, ...bullAnimals].some(c => (c.dryFodderKg && c.dryFodderKg > 0))
  );

  const hasAnyConcentrate = Boolean(
    (selectedFeeds && selectedFeeds.some(f => {
      const cat = (f.category || '').toLowerCase();
      const name = (f.name || '').toLowerCase();
      return (cat.includes('concentrate') || cat.includes('grain') || cat.includes('meal') || cat.includes('cake') || cat.includes('mash') || cat.includes('pellet') || cat.includes('chuni') || cat.includes('bran') || cat.includes('seed') || cat.includes('crushed') || name.includes('concentrate') || name.includes('cake') || name.includes('meal') || name.includes('grain') || name.includes('mash') || name.includes('bran') || name.includes('chuni')) && (f.amountKg > 0 || f.amount > 0 || f.dailyAmountKg > 0 || f.quantityKg > 0);
    })) ||
    (calcResult.practicalFeedingReport?.herdSummary?.concentrateKg > 0) ||
    (calcResult.practicalFeedingReport?.feedIngredientTable && calcResult.practicalFeedingReport.feedIngredientTable.some(f => (f.category === 'concentrates' || f.category === 'concentrate') && f.recommendedKg > 0)) ||
    [...milkingAnimals, ...pregnantAnimals, ...heiferAnimals, ...dryAnimals, ...bullAnimals].some(c => (c.concentrateKg && c.concentrateKg > 0))
  );

  // Precompute Milking Allocation Rows
  let milkingAllocRowsHtml = '';
  if (milkingAnimals.length > 0) {
    milkingAllocRowsHtml = milkingAnimals.map((c, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
      const cTitle = c.title || (isTa ? `கறவை மாடு #${i + 1}` : isHi ? `दुधारू गाय #${i + 1}` : `Cow #${i + 1}`);
      const cStage = c.stage || (isTa ? 'நடுப்பருவம்' : isHi ? 'मध्य' : 'Mid');
      const greenDetails = getAnimalGreenDetails(c, selectedFeeds, reportLang);
      const dryDetails = getAnimalDryDetails(c, selectedFeeds, reportLang);
      const concDetails = getAnimalConcDetails(c, selectedFeeds, reportLang);

      return `
        <tr style="background: ${bg}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 5px 6px; text-align: center; font-weight: 700;">#${i + 1}</td>
          <td style="padding: 5px 8px; font-weight: 800; color: #0f172a;">
            ${cTitle}
            <div style="font-size: 7.5px; color: #64748b; font-weight: normal;">${cStage} (BCS ${c.bcs ?? 3.0})</div>
          </td>
          <td style="padding: 5px 8px; font-weight: 700;">${c.weightKg} kg</td>
          <td style="padding: 5px 8px; font-weight: 800; color: #16a34a;">
            ${c.milkYieldL} L (${c.milkFatPct}% fat)
            ${c.targetMilkYieldL ? `<div style="font-size: 7px; color: #0284c7; font-weight: 700; margin-top: 1px;">Target: ${c.targetMilkYieldL} L (${c.projectedMilkFatRange || `${c.milkFatPct}%`})</div>` : ''}
          </td>
          <td style="padding: 5px 8px; font-weight: 800; color: #15803d;">
            ${c.greenFodderKg > 0 ? `${c.greenFodderKg} kg` : '—'}
            ${greenDetails ? `<div style="font-size: 7.5px; color: #166534; font-weight: 600; margin-top: 2px;">${greenDetails}</div>` : ''}
          </td>
          ${hasAnyDryFodder ? `
            <td style="padding: 5px 8px; font-weight: 800; color: #b45309;">
              ${c.dryFodderKg > 0 ? `${c.dryFodderKg} kg` : '—'}
              ${dryDetails ? `<div style="font-size: 7.5px; color: #a16207; font-weight: 500; margin-top: 2px;">${dryDetails}</div>` : ''}
            </td>
          ` : ''}
          ${hasAnyConcentrate ? `
            <td style="padding: 5px 8px; font-weight: 800; color: #0369a1;">
              ${c.concentrateKg > 0 ? `${c.concentrateKg} kg` : '—'}
              ${concDetails ? `<div style="font-size: 7.5px; color: #0284c7; font-weight: 600; margin-top: 2px;">${concDetails}</div>` : ''}
            </td>
          ` : ''}
          <td style="padding: 5px 6px; text-align: center; font-weight: 700;">${c.mineralMixtureG} g</td>
          <td style="padding: 5px 6px; text-align: center; font-weight: 700;">${c.saltG || 40} g</td>
          <td style="padding: 5px 6px; text-align: center; font-weight: 800; color: #0284c7;">${c.waterLiters} L</td>
        </tr>
      `;
    }).join('');
  }

  // Precompute Pregnant Allocation Rows
  let pregnantAllocRowsHtml = '';
  if (pregnantAnimals.length > 0) {
    pregnantAllocRowsHtml = pregnantAnimals.map((c, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
      const cTitle = c.title || (isTa ? `சினை மாடு #${i + 1}` : isHi ? `गर्भवती पशु #${i + 1}` : `Pregnant #${i + 1}`);
      const pregTxt = c.pregDays ? `${c.pregDays} ${isTa ? 'நாட்கள்' : isHi ? 'दिन' : 'days'}` : (isTa ? 'கடைசி மாதம்' : isHi ? 'अंतिम माह' : 'Late stage');
      const greenDetails = getAnimalGreenDetails(c, selectedFeeds, reportLang);
      const dryDetails = getAnimalDryDetails(c, selectedFeeds, reportLang);
      const concDetails = getAnimalConcDetails(c, selectedFeeds, reportLang);

      return `
        <tr style="background: ${bg}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 5px 6px; text-align: center; font-weight: 700;">#${i + 1}</td>
          <td style="padding: 5px 8px; font-weight: 800; color: #0f172a;">${cTitle}</td>
          <td style="padding: 5px 8px; font-weight: 700;">${c.weightKg} kg</td>
          <td style="padding: 5px 8px; font-weight: 700; color: #c2410c;">
            ${pregTxt}
            ${c.projectedCalfBirthWeightKg ? `<div style="font-size: 7px; color: #9a3412; font-weight: 600; margin-top: 1px;">Calf: ~${c.projectedCalfBirthWeightKg} kg</div>` : ''}
          </td>
          <td style="padding: 5px 8px; font-weight: 800; color: #15803d;">
            ${c.greenFodderKg > 0 ? `${c.greenFodderKg} kg` : '—'}
            ${greenDetails ? `<div style="font-size: 7.5px; color: #166534; font-weight: 600; margin-top: 2px;">${greenDetails}</div>` : ''}
          </td>
          ${hasAnyDryFodder ? `
            <td style="padding: 5px 8px; font-weight: 800; color: #b45309;">
              ${c.dryFodderKg > 0 ? `${c.dryFodderKg} kg` : '—'}
              ${dryDetails ? `<div style="font-size: 7.5px; color: #a16207; font-weight: 500; margin-top: 2px;">${dryDetails}</div>` : ''}
            </td>
          ` : ''}
          ${hasAnyConcentrate ? `
            <td style="padding: 5px 8px; font-weight: 800; color: #0369a1;">
              ${c.concentrateKg > 0 ? `${c.concentrateKg} kg` : '—'}
              ${concDetails ? `<div style="font-size: 7.5px; color: #0284c7; font-weight: 600; margin-top: 2px;">${concDetails}</div>` : ''}
            </td>
          ` : ''}
          <td style="padding: 5px 6px; text-align: center; font-weight: 700;">${c.mineralMixtureG} g</td>
          <td style="padding: 5px 6px; text-align: center; font-weight: 700;">${c.saltG || 40} g</td>
          <td style="padding: 5px 6px; text-align: center; font-weight: 800; color: #0284c7;">${c.waterLiters} L</td>
        </tr>
      `;
    }).join('');
  }

  // Precompute Other Allocations Rows
  let otherAllocRowsHtml = '';
  const otherAnimals = [...heiferAnimals, ...dryAnimals, ...bullAnimals];
  if (otherAnimals.length > 0) {
    otherAllocRowsHtml = otherAnimals.map((c, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
      const greenDetails = getAnimalGreenDetails(c, selectedFeeds, reportLang);
      const dryDetails = getAnimalDryDetails(c, selectedFeeds, reportLang);
      const concDetails = getAnimalConcDetails(c, selectedFeeds, reportLang);

      return `
        <tr style="background: ${bg}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 5px 6px; text-align: center; font-weight: 700;">#${i + 1}</td>
          <td style="padding: 5px 8px; font-weight: 800; color: #0f172a;">
            ${c.title || c.tag || `Animal #${i + 1}`}
            ${c.dailyWeightGainG ? `<div style="font-size: 7px; color: #166534; font-weight: 700; margin-top: 1px;">+${c.dailyWeightGainG} g/day frame gain (AI: ~${c.targetBreedingWeightKg || 225} kg)</div>` : ''}
            ${c.targetCalvingWeightKg ? `<div style="font-size: 7px; color: #475569; font-weight: 600; margin-top: 1px;">Near-calving: ~${c.targetCalvingWeightKg} kg</div>` : ''}
          </td>
          <td style="padding: 5px 8px; font-weight: 700;">${c.weightKg} kg</td>
          <td style="padding: 5px 8px; font-weight: 800; color: #15803d;">
            ${c.greenFodderKg > 0 ? `${c.greenFodderKg} kg` : '—'}
            ${greenDetails ? `<div style="font-size: 7.5px; color: #166534; font-weight: 600; margin-top: 2px;">${greenDetails}</div>` : ''}
          </td>
          ${hasAnyDryFodder ? `
            <td style="padding: 5px 8px; font-weight: 800; color: #b45309;">
              ${c.dryFodderKg > 0 ? `${c.dryFodderKg} kg` : '—'}
              ${dryDetails ? `<div style="font-size: 7.5px; color: #a16207; font-weight: 500; margin-top: 2px;">${dryDetails}</div>` : ''}
            </td>
          ` : ''}
          ${hasAnyConcentrate ? `
            <td style="padding: 5px 8px; font-weight: 800; color: #0369a1;">
              ${c.concentrateKg > 0 ? `${c.concentrateKg} kg` : '—'}
              ${concDetails ? `<div style="font-size: 7.5px; color: #0284c7; font-weight: 600; margin-top: 2px;">${concDetails}</div>` : ''}
            </td>
          ` : ''}
          <td style="padding: 5px 6px; text-align: center; font-weight: 700;">${c.mineralMixtureG} g</td>
          <td style="padding: 5px 6px; text-align: center; font-weight: 700;">${c.saltG || 40} g</td>
          <td style="padding: 5px 6px; text-align: center; font-weight: 800; color: #0284c7;">${c.waterLiters} L</td>
        </tr>
      `;
    }).join('');
  }

  // Precompute Feed Inventory & Shortage Rows
  const feedRows = calcResult.practicalFeedingReport?.feedIngredientTable || [];
  let feedShortageRowsHtml = '';
  if (feedRows.length > 0) {
    feedShortageRowsHtml = feedRows.map((f, i) => {
      const trName = getTrFeedName(f.feedName, lang);
      const trCat = isTa ? translateCategory(f.category, 'ta') : isHi ? (STEP10_HINDI_MAP[f.category] || f.category) : f.category;
      const isShort = (f.shortageKg || 0) > 0;
      const shortageText = isShort 
        ? (isTa ? `பற்றாக்குறை: ${f.shortageKg} kg` : isHi ? `कमी: ${f.shortageKg} किग्रा` : `Shortage: ${f.shortageKg} kg`)
        : (isTa ? 'முழுமையாக உள்ளது' : isHi ? 'पर्याप्त (Covered)' : 'Fully Covered');

      return `
        <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 5px 8px; font-weight: 800; color: #0f172a;">${trName}</td>
          <td style="padding: 5px 8px; font-size: 8px; color: #64748b;">${trCat}</td>
          <td style="padding: 5px 8px; font-weight: 700; color: #475569;">${f.currentInputKg || 0} kg / day</td>
          <td style="padding: 5px 8px; font-weight: 800; color: #16a34a;">${f.recommendedKg || 0} kg / day</td>
          <td style="padding: 5px 8px; font-weight: 800; color: ${isShort ? '#dc2626' : '#15803d'};">${shortageText}</td>
        </tr>
      `;
    }).join('');
  }

  // Precompute Nutrition Audit Rows
  const nutAudit = calcResult.practicalFeedingReport?.nutritionalBalanceAudit || [];
  let nutAuditRowsHtml = '';
  if (nutAudit.length > 0) {
    const paramMap = {
      'Dry Matter (DMI)': { ta: 'உலர் சத்து உட்கொள்ளல் (DMI)', hi: 'शुष्क पदार्थ (DMI)' },
      'Metabolizable Energy (ME)': { ta: 'ஆற்றல் சத்து (ME)', hi: 'ऊर्जा सघनता (ME)' },
      'Crude Protein (CP)': { ta: 'கச்சா புரதம் (CP)', hi: 'कच्चा प्रोटीन (CP)' },
      'Calcium (Ca)': { ta: 'கால்சியம் சுண்ணாம்பு (Ca)', hi: 'कैल्शियम (Ca)' },
      'Phosphorus (P)': { ta: 'பாஸ்பரஸ் மணிச்சத்து (P)', hi: 'फॉस्फोरस (P)' },
      'Water': { ta: 'குடிநீர் தேவை', hi: 'दैनिक पेयजल' }
    };
    const statusMap = {
      'Adequate': { ta: 'போதுமானது', hi: 'पर्याप्त' },
      'Deficit': { ta: 'பற்றாக்குறை', hi: 'कमी' },
      'Shortage': { ta: 'பற்றாக்குறை', hi: 'कमी' },
      'Surplus': { ta: 'கூடுதல்', hi: 'अतिरिक्त' },
      'Optimal': { ta: 'உகந்தது', hi: 'इष्टतम' },
      'PASSED': { ta: 'தேர்ச்சி', hi: 'सफल' },
      'FLAGGED': { ta: 'கவனம் தேவை', hi: 'जांचें' }
    };
    nutAuditRowsHtml = nutAudit.map((n, i) => {
      const pText = paramMap[n.parameter]?.[reportLang] || n.parameter;
      const cStat = statusMap[n.currentStatus]?.[reportLang] || n.currentStatus;
      const rStat = statusMap[n.recommendedStatus || 'PASSED']?.[reportLang] || (isTa ? 'தேர்ச்சி' : isHi ? 'सफल' : 'PASSED');
      return `
      <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 4px 6px; font-weight: 800; color: #0f172a;">${pText}</td>
        <td style="padding: 4px 6px;">${n.required}</td>
        <td style="padding: 4px 6px;">${n.currentSupply}</td>
        <td style="padding: 4px 6px; font-weight: 700; color: ${n.currentStatus?.toLowerCase().includes('ok') || n.currentStatus?.toLowerCase().includes('pass') || n.currentStatus?.toLowerCase().includes('adeq') ? '#16a34a' : '#dc2626'};">${cStat}</td>
        <td style="padding: 4px 6px;">${n.recommendedSupply}</td>
        <td style="padding: 4px 6px; font-weight: 700; color: #16a34a;">${rStat}</td>
      </tr>
      `;
    }).join('');
  }

  // Precompute Safety Gates
  const safetyGates = calcResult.practicalFeedingReport?.safetyGateChecklist || [];
  let safetyGatesHtml = '';
  if (safetyGates.length > 0) {
    safetyGatesHtml = safetyGates.slice(0, 8).map(g => {
      const isPass = g.status === 'PASSED' || g.status === 'PASS';
      const gateText = translateSafetyGate(g.checkItem || g.gate, reportLang);
      return `
        <div style="background: ${isPass ? '#f0fdf4' : '#fffbeb'}; border: 1px solid ${isPass ? '#86efac' : '#fde68a'}; border-radius: 5px; padding: 4px 8px; display: flex; align-items: center; justify-content: space-between; font-size: 8.5px;">
          <span style="font-weight: 700; color: #0f172a;">${gateText}</span>
          <span style="font-weight: 800; color: ${isPass ? '#16a34a' : '#b45309'}; background: ${isPass ? '#dcfce7' : '#fef3c7'}; padding: 1px 5px; border-radius: 4px;">
            ${isPass ? (isTa ? 'தேர்ச்சி' : isHi ? 'पास' : 'PASSED') : (isTa ? 'கவனம் தேவை' : isHi ? 'ध्यान दें' : 'FLAGGED')}
          </span>
        </div>
      `;
    }).join('');
  }

  // Page 1
  const page1 = `
    <div style="display: flex; flex-direction: column; justify-content: space-between; min-height: 1076px;">
      <div>
        <div style="background: ${isApproved ? '#15803d' : '#b45309'}; border-radius: 8px; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; color: #ffffff;">
          <div>
            <h2 style="margin: 0; font-size: 16px; font-weight: 800; letter-spacing: 0.3px;">${reportTitle}</h2>
            <div style="font-size: 10.5px; opacity: 0.95; margin-top: 3px;">${subTitle}</div>
            <div style="font-size: 9px; opacity: 0.85; margin-top: 2px;">${metaLine}</div>
          </div>
          <div style="background: #ffffff; padding: 5px 10px; border-radius: 6px; display: flex; align-items: center; gap: 8px;">
            <img src="${CHIMERTECH_LOGO}" style="height: 38px; width: 38px; object-fit: contain;" />
            <div style="width: 1px; height: 30px; background: #e2e8f0;"></div>
            <img src="${IHERD_LOGO}" style="height: 32px; width: 48px; object-fit: contain;" />
          </div>
        </div>

        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 8px 14px; margin-bottom: 12px;">
          <div style="font-size: 10.5px; font-weight: 800; color: #16a34a; margin-bottom: 3px;">
            ${isTa ? 'இன்றைய பண்ணைக்கான மொத்த தீவன தேவை (இன்று கலந்து கொடுக்க வேண்டியவை):' : isHi ? 'आज कुल झुंड की चारा आवश्यकता (आज मिलाकर खिलाने योग्य आहार):' : 'TODAY TOTAL HERD FEEDING REQUIREMENT (WHAT TO MIX & FEED TODAY):'}
          </div>
          <div style="font-size: 9.5px; color: #1e293b; font-weight: 600;">
            ${isTa 
              ? `மொத்த மாடுகள்: <strong>${totalCattleCount}</strong> &nbsp;|&nbsp; மொத்த ${hasAnyDryFodder ? 'பசுந்தீவனம்/உலர் தீவனம்' : 'பசுந்தீவனம்'}: <strong>${totalFreshFeed} kg/நாள்</strong> &nbsp;|&nbsp; தாது உப்பு: <strong>${herdMinG} g/நாள்</strong> &nbsp;|&nbsp; உப்பு: <strong>${herdSaltG} g/நாள்</strong> &nbsp;|&nbsp; சுத்தமான குடிநீர்: <strong>${waterReq} L/நாள்</strong>`
              : isHi
                ? `कुल पशु: <strong>${totalCattleCount}</strong> &nbsp;|&nbsp; कुल ${hasAnyDryFodder ? 'ताजा/सूखा चारा' : 'ताजा हरा चारा'}: <strong>${totalFreshFeed} किग्रा/दिन</strong> &nbsp;|&nbsp; खनिज मिश्रण: <strong>${herdMinG} ग्राम/दिन</strong> &nbsp;|&nbsp; साधारण नमक: <strong>${herdSaltG} ग्राम/दिन</strong> &nbsp;|&nbsp; पेयजल: <strong>${waterReq} ली/दिन</strong>`
                : `Total Cattle: <strong>${totalCattleCount} Head</strong> &nbsp;|&nbsp; Total ${hasAnyDryFodder ? 'Fresh Feed / Dry Fodder' : 'Green Fodder'}: <strong>${totalFreshFeed} kg/day</strong> &nbsp;|&nbsp; Minerals: <strong>${herdMinG} g/day</strong> &nbsp;|&nbsp; Salt: <strong>${herdSaltG} g/day</strong> &nbsp;|&nbsp; Clean Water: <strong>${waterReq} L/day</strong>`}
          </div>
        </div>

        <div style="background: #0284c7; color: #ffffff; padding: 6px 12px; border-radius: 6px; font-size: 10.5px; font-weight: 800; margin-bottom: 8px;">
          ${isTa ? '1. ஒவ்வொரு மாட்டிற்குமான தினசரி தீவன அளவு (INDIVIDUAL CATTLE DAILY FEEDING PLAN)' : isHi ? '1. प्रत्येक पशु की दैनिक चारा खुराक (INDIVIDUAL CATTLE DAILY FEEDING PLAN)' : '1. INDIVIDUAL CATTLE DAILY FEEDING ALLOCATIONS'}
        </div>

        ${milkingAllocRowsHtml ? `
          <div style="margin-bottom: 10px;">
            <div style="font-size: 9.5px; font-weight: 800; color: #0369a1; margin-bottom: 4px;">
              ${isTa ? 'கறவை மாடுகள் - தினசரி தீவன அளவு (MILKING COWS):' : isHi ? 'दुधारू गायें - दैनिक आहार योजना (MILKING COWS):' : 'Milking Cows Allocation:'}
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
              <thead>
                <tr style="background: #e0f2fe; color: #0369a1; text-align: left; font-size: 8.5px;">
                  <th style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; width: 28px;">#</th>
                  <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'மாடு / குறிப்பு' : isHi ? 'गाय / पहचान' : 'Cow / Tag'}</th>
                  <th style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 65px;">${isTa ? 'எடை' : isHi ? 'वजन' : 'Weight'}</th>
                  <th style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 85px;">${isTa ? 'பால் அளவு' : isHi ? 'दूध मात्रा' : 'Milk Yield'}</th>
                  <th style="padding: 5px 8px; border: 1px solid #cbd5e1; color: #15803d; width: 110px;">${isTa ? 'பசுந்தீவனம் (தீவனம் & அளவு)' : isHi ? 'हरा चारा (नाम एवं मात्रा)' : 'Green Fodder (Feed & Qty)'}</th>
                  ${hasAnyDryFodder ? `<th style="padding: 5px 8px; border: 1px solid #cbd5e1; color: #b45309; width: 95px;">${isTa ? 'உலர் தீவனம்' : isHi ? 'सूखा चारा' : 'Dry Fodder'}</th>` : ''}
                  ${hasAnyConcentrate ? `<th style="padding: 5px 8px; border: 1px solid #cbd5e1; color: #0369a1; width: 105px;">${isTa ? 'அடர்தீவனம்' : isHi ? 'दाना मिश्रण' : 'Concentrate'}</th>` : ''}
                  <th style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; width: 45px;">${isTa ? 'தாது' : isHi ? 'खनिज' : 'Min'}</th>
                  <th style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; width: 40px;">${isTa ? 'உப்பு' : isHi ? 'नमक' : 'Salt'}</th>
                  <th style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; width: 45px;">${isTa ? 'குடிநீர்' : isHi ? 'पानी' : 'Water'}</th>
                </tr>
              </thead>
              <tbody>${milkingAllocRowsHtml}</tbody>
            </table>
          </div>
        ` : ''}

        ${pregnantAllocRowsHtml ? `
          <div style="margin-bottom: 10px;">
            <div style="font-size: 9.5px; font-weight: 800; color: #c2410c; margin-bottom: 4px;">
              ${isTa ? 'சினைக் கால்நடைகள் - தினசரி தீவன அளவு (PREGNANT CATTLE):' : isHi ? 'गर्भवती पशु - दैनिक आहार योजना (PREGNANT CATTLE):' : 'Pregnant Cattle Allocation:'}
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
              <thead>
                <tr style="background: #ffedd5; color: #9a3412; text-align: left; font-size: 8.5px;">
                  <th style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; width: 28px;">#</th>
                  <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'கால்நடை / குறிப்பு' : isHi ? 'पशु / पहचान' : 'Animal / Tag'}</th>
                  <th style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 65px;">${isTa ? 'எடை' : isHi ? 'वजन' : 'Weight'}</th>
                  <th style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 85px;">${isTa ? 'சினை காலம்' : isHi ? 'गर्भ काल' : 'Gestation'}</th>
                  <th style="padding: 5px 8px; border: 1px solid #cbd5e1; color: #15803d; width: 110px;">${isTa ? 'பசுந்தீவனம் (தீவனம் & அளவு)' : isHi ? 'हरा चारा (नाम एवं मात्रा)' : 'Green Fodder (Feed & Qty)'}</th>
                  ${hasAnyDryFodder ? `<th style="padding: 5px 8px; border: 1px solid #cbd5e1; color: #b45309; width: 95px;">${isTa ? 'உலர் தீவனம்' : isHi ? 'सूखा चारा' : 'Dry Fodder'}</th>` : ''}
                  ${hasAnyConcentrate ? `<th style="padding: 5px 8px; border: 1px solid #cbd5e1; color: #0369a1; width: 105px;">${isTa ? 'அடர்தீவனம்' : isHi ? 'दाना मिश्रण' : 'Concentrate'}</th>` : ''}
                  <th style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; width: 45px;">${isTa ? 'தாது' : isHi ? 'खनिज' : 'Min'}</th>
                  <th style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; width: 40px;">${isTa ? 'உப்பு' : isHi ? 'नमक' : 'Salt'}</th>
                  <th style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; width: 45px;">${isTa ? 'குடிநீர்' : isHi ? 'पानी' : 'Water'}</th>
                </tr>
              </thead>
              <tbody>${pregnantAllocRowsHtml}</tbody>
            </table>
          </div>
        ` : ''}

        ${otherAllocRowsHtml ? `
          <div style="margin-bottom: 10px;">
            <div style="font-size: 9.5px; font-weight: 800; color: #166534; margin-bottom: 4px;">
              ${isTa ? 'கிடாரி, கறவை நின்ற மாடு & காளைகள் - தீவன அளவு:' : isHi ? 'बछिया, सूखी गायें एवं सांड - आहार योजना:' : 'Heifers, Dry Cows & Bulls Allocation:'}
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
              <thead>
                <tr style="background: #dcfce7; color: #166534; text-align: left; font-size: 8.5px;">
                  <th style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; width: 28px;">#</th>
                  <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'கால்நடை / பிரிவு' : isHi ? 'पशु / श्रेणी' : 'Group / Tag'}</th>
                  <th style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 65px;">${isTa ? 'எடை' : isHi ? 'वजन' : 'Weight'}</th>
                  <th style="padding: 5px 8px; border: 1px solid #cbd5e1; color: #15803d; width: 110px;">${isTa ? 'பசுந்தீவனம் (தீவனம் & அளவு)' : isHi ? 'हरा चारा (नाम एवं मात्रा)' : 'Green Fodder (Feed & Qty)'}</th>
                  ${hasAnyDryFodder ? `<th style="padding: 5px 8px; border: 1px solid #cbd5e1; color: #b45309; width: 95px;">${isTa ? 'உலர் தீவனம்' : isHi ? 'सूखा चारा' : 'Dry Fodder'}</th>` : ''}
                  ${hasAnyConcentrate ? `<th style="padding: 5px 8px; border: 1px solid #cbd5e1; color: #0369a1; width: 105px;">${isTa ? 'அடர்தீவனம்' : isHi ? 'दाना मिश्रण' : 'Concentrate'}</th>` : ''}
                  <th style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; width: 45px;">${isTa ? 'தாது' : isHi ? 'खनिज' : 'Min'}</th>
                  <th style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; width: 40px;">${isTa ? 'உப்பு' : isHi ? 'नमक' : 'Salt'}</th>
                  <th style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; width: 45px;">${isTa ? 'குடிநீர்' : isHi ? 'पानी' : 'Water'}</th>
                </tr>
              </thead>
              <tbody>${otherAllocRowsHtml}</tbody>
            </table>
          </div>
        ` : ''}
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8.5px; color: #94a3b8;">
        <span>${isTa ? 'மடுபொஷாக் கால்நடை ஊட்டச்சத்து தளம் | Chimertech & iHerd' : isHi ? 'मूपोषक डेयरी पोषण मंच | Chimertech एवं iHerd' : 'MOOPOSHAQ System | Powered by Chimertech & iHerd'}</span>
        <span>${isTa ? 'பக்கம் 1 / 2' : isHi ? 'पृष्ठ 1 / 2' : 'Page 1 of 2'}</span>
      </div>
    </div>
  `;

  // Page 2
  const page2 = `
    <div style="display: flex; flex-direction: column; justify-content: space-between; min-height: 1076px;">
      <div>
        <div style="background: ${isApproved ? '#15803d' : '#b45309'}; border-radius: 8px; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; color: #ffffff;">
          <div style="font-size: 12px; font-weight: 800;">${reportTitle} &nbsp;|&nbsp; ${farmName}</div>
          <div style="background: #ffffff; padding: 3px 8px; border-radius: 5px; display: flex; align-items: center; gap: 6px;">
            <img src="${CHIMERTECH_LOGO}" style="height: 26px; width: 26px; object-fit: contain;" />
            <div style="width: 1px; height: 20px; background: #e2e8f0;"></div>
            <img src="${IHERD_LOGO}" style="height: 22px; width: 34px; object-fit: contain;" />
          </div>
        </div>

        <div style="margin-bottom: 14px;">
          <div style="background: #15803d; color: #ffffff; padding: 5px 10px; border-radius: 5px; font-size: 10px; font-weight: 800; margin-bottom: 6px;">
            ${isTa ? '2. பண்ணை தீவன இருப்பு மற்றும் பற்றாக்குறை தணிக்கை (HERD RATIONS & SHORTAGE)' : isHi ? '2. कुल चारा भंडार एवं कमी/अतिरिक्त विश्लेषण (HERD RATIONS & SHORTAGE)' : '2. TOTAL HERD RATIONS & SHORTAGE AUDIT'}
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
            <thead>
              <tr style="background: #dcfce7; color: #166534; text-align: left; font-size: 8.5px;">
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1;">${isTa ? 'தீவன பொருள்' : isHi ? 'चारा सामग्री' : 'Feed Ingredient'}</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 85px;">${isTa ? 'வகை' : isHi ? 'प्रकार' : 'Category'}</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 110px;">${isTa ? 'நீங்கள் கொடுப்பது (Input)' : isHi ? 'वर्तमान चारा (इनपुट)' : 'What You Put'}</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 120px;">${isTa ? 'மந்தையின் தேவை (Need)' : isHi ? 'झुंड की जरूरत' : 'Herd Needs Today'}</th>
                <th style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 130px;">${isTa ? 'பற்றாக்குறை / நிலை' : isHi ? 'कमी / स्थिति' : 'Shortage / Status'}</th>
              </tr>
            </thead>
            <tbody>
              ${feedShortageRowsHtml || `<tr><td colspan="5" style="padding: 6px; text-align: center; color: #64748b;">${isTa ? 'தீவன பட்டியல் தயார் நிலையில் இல்லை.' : isHi ? 'चारा सूची उपलब्ध नहीं है।' : 'Feed table not available.'}</td></tr>`}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 14px;">
          <div style="background: #4f46e5; color: #ffffff; padding: 5px 10px; border-radius: 5px; font-size: 10px; font-weight: 800; margin-bottom: 6px;">
            ${isTa ? '3. அறிவியல் ஊட்டச்சத்து தணிக்கை மற்றும் பாதுகாப்பு சோதனைகள்' : isHi ? '3. वैज्ञानिक पोषण ऑडिट एवं सुरक्षा मानक' : '3. SCIENTIFIC NUTRITION AUDIT & SAFETY GATES'}
          </div>
          ${nutAuditRowsHtml ? `
            <table style="width: 100%; border-collapse: collapse; font-size: 8.5px; margin-bottom: 8px;">
              <thead>
                <tr style="background: #e0e7ff; color: #3730a3; text-align: left;">
                  <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">${isTa ? 'ஊட்டச்சத்து விவரம்' : isHi ? 'पोषक तत्व' : 'Nutrient Parameter'}</th>
                  <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">${isTa ? 'மந்தையின் தேவை' : isHi ? 'झुंड आवश्यकता' : 'Herd Target'}</th>
                  <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">${isTa ? 'தற்போதைய அளவு' : isHi ? 'वर्तमान स्तर' : 'Current Supply'}</th>
                  <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">${isTa ? 'தற்போதைய நிலை' : isHi ? 'वर्तमान स्थिति' : 'Current Status'}</th>
                  <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">${isTa ? 'பரிந்துரை அளவு' : isHi ? 'सिफारिश स्तर' : 'Rec Supply'}</th>
                  <th style="padding: 4px 6px; border: 1px solid #cbd5e1;">${isTa ? 'பரிந்துரை நிலை' : isHi ? 'सिफारिश स्थिति' : 'Rec Status'}</th>
                </tr>
              </thead>
              <tbody>${nutAuditRowsHtml}</tbody>
            </table>
          ` : ''}

          ${safetyGatesHtml ? `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              ${safetyGatesHtml}
            </div>
          ` : ''}
        </div>

        <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px 14px;">
          <div style="font-size: 10px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
            ${isTa ? 'பண்ணை மேலாண்மை மற்றும் தினசரி தீவன வழிகாட்டல் (FARM ADVISORY):' : isHi ? 'फार्म प्रबंधन एवं दैनिक आहार नियम (FARM ADVISORY):' : 'FARM MANAGEMENT & FEEDING ADVISORY:'}
          </div>
          <div style="font-size: 8.5px; color: #334155; line-height: 1.45;">
            ${isTa ? `
              ${hasAnyConcentrate ? '• <strong>அடர்தீவன விகிதம்:</strong> கறவை மாடுகளுக்கு உற்பத்தி செய்யப்படும் ஒவ்வொரு 2 முதல் 2.5 லிட்டர் பாலிற்கும் 1 கிலோ அடர்தீவனம் வழங்கவும்.<br />' : ''}
              • <strong>பசுந்தீவனம்:</strong> வைட்டமின்கள் மற்றும் தடையற்ற பால் சுரப்பிற்கு தினமும் 20 முதல் 25 கிலோ புதிய பசுந்தீவனம் தவறாமல் கொடுக்கவும்.<br />
              ${hasAnyDryFodder ? '• <strong>உலர் வைக்கோல்:</strong> அசைபோடுதல் மற்றும் பாலில் கொழுப்புச் சத்து (Fat %) அதிகரிக்க தினமும் 3 முதல் 5 கிலோ உலர் வைக்கோல்/புல் வழங்கவும்.<br />' : ''}
              • <strong>தாது உப்பு மற்றும் உப்பு:</strong> பால் காய்ச்சலைத் தடுக்க தினமும் 60-80 கிராம் தாதுக் கலவையும், 40 கிராம் சாதாரண உப்பும் தீவனத்தில் கலக்கவும்.<br />
              • <strong>சுத்தமான குடிநீர்:</strong> கறவை மாடுகளுக்கு தினமும் 70-90 லிட்டர் சுத்தமான தண்ணீர் தொட்டிகளில் 24 மணி நேரமும் தாராளமாகக் கிடைக்கச் செய்யவும்.
            ` : isHi ? `
              ${hasAnyConcentrate ? '• <strong>दाना मिश्रण नियम:</strong> दुधारू गायों को उत्पादित प्रत्येक 2 से 2.5 लीटर दूध के लिए 1 किग्रा संतुलित दाना मिश्रण अवश्य दें।<br />' : ''}
              • <strong>हरा चारा:</strong> विटामिन एवं निरंतर दूध प्रवाह के लिए रोजाना 20 से 25 किग्रा ताजा हरा चारा खिलाएं।<br />
              ${hasAnyDryFodder ? '• <strong>सूखा भूसा:</strong> जुगाली बनाए रखने और दूध फैट बढ़ाने के लिए रोजाना 3 से 5 किग्रा सूखा भूसा या पुआल जरूर दें।<br />' : ''}
              • <strong>खनिज एवं नमक:</strong> मिल्क फीवर व बांझपन से बचाव हेतु 60-80 ग्राम मिनरल मिक्स्चर व 40 ग्राम नमक नाद में मिलाएं।<br />
              • <strong>स्वच्छ पेयजल:</strong> दुधारू गायों को रोजाना 70-90 लीटर साफ ताजा पानी चौबीसों घंटे पर्याप्त मात्रा में उपलब्ध रखें।
            ` : `
              ${hasAnyConcentrate ? '• <strong>Concentrate Rule:</strong> Feed 1 kg balanced concentrate for every 2 to 2.5 Litres of milk produced daily.<br />' : ''}
              • <strong>Green Fodder:</strong> Provide 20–25 kg fresh green fodder daily for essential vitamins and ruminal health.<br />
              ${hasAnyDryFodder ? '• <strong>Dry Fodder:</strong> Feed 3–5 kg dry straw or hay to support rumination and milk butterfat.<br />' : ''}
              • <strong>Minerals & Salt:</strong> Add 60–80 grams mineral mixture and 40 grams common salt daily to prevent metabolic deficiency.<br />
              • <strong>Clean Water:</strong> Ensure 70–90 Litres of fresh drinking water is available ad-libitum 24/7.
            `}
          </div>
        </div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; justify-content: space-between; font-size: 8.5px; color: #94a3b8;">
        <span>${isTa ? 'மடுபொஷாக் பால் பண்ணை ஊட்டச்சத்து தளம் | Chimertech & iHerd' : isHi ? 'मूपोषक डेयरी पोषण मंच | Chimertech एवं iHerd' : 'MOOPOSHAQ System | Powered by Chimertech & iHerd'}</span>
        <span>${isTa ? 'பக்கம் 2 / 2' : isHi ? 'पृष्ठ 2 / 2' : 'Page 2 of 2'}</span>
      </div>
    </div>
  `;

  const safeCity = (weather?.city || 'DairyFarm').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Dairy_Feeding_Report_${safeCity}_${lang}_${new Date().toISOString().slice(0, 10)}.pdf`;
  await renderHtmlPagesToPdf([page1, page2], fileName);
}
