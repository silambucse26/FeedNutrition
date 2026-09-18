import React, { useState, useEffect } from 'react';
import { 
  Printer, ArrowLeft, Download, FileText, Scale, Milk, Droplet, 
  MapPin, CheckCircle2, ChevronRight, ChevronDown, ChevronUp, Info, Zap, RefreshCw, 
  AlertCircle, AlertTriangle, Sparkles, Activity, Flame, Wheat, Leaf, 
  Thermometer, Droplets, TrendingUp, TrendingDown, Eye, EyeOff
} from 'lucide-react';
import { getBreedName } from '../data/breeds';
import { checkBackendStatus, runNutritionCalculation } from '../services/nutritionApi';
import { downloadInputDataPDF, downloadFeedingReportPDF } from '../utils/pdfExportService';
import { translateFeed, translateCategory, translateTerm } from '../utils/tamilTranslations';

// Helper to strip any unexpected emoji characters from text
const stripEmojis = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{238C}-\u{2454}\u{20D0}-\u{20FF}]/gu, '').trim();
};

// Cattle Vector Silhouette component for animal inventory representation
function CattleVector({ size = 26, color = '#16a34a', type = 'heifer', label, weight }) {
  return (
    <div 
      style={{ 
        display: 'inline-flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '6px 8px',
        background: '#ffffff',
        border: `1.5px solid ${color}33`,
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'transform 0.15s ease'
      }}
      title={label ? `${label}${weight ? ` • ${weight} kg` : ''}` : ''}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', flexShrink: 0 }}
      >
        {/* Main Body */}
        <path 
          d="M14 26C14 23 18 20 25 21C30 20 40 21 47 24C50 25.5 53 28 54 31C55 34 54 41 53 43C52 44.5 50 45 48 45C47 45 46 48 46 53C46 54 44.5 55 43.5 55C42.5 55 42 54 42 50C42 47 40 46 39 46C38 46 37 49 37 53C37 54 35.5 55 34.5 55C33.5 55 33 54 33 47C29 47 24 47 21 47C21 49 20 53 20 54C20 55 18.5 55 18 55C17 55 16.5 54 16.5 51C16.5 48 15 47 14 47C13 47 12 50 12 53C12 54 10.5 55 9.5 55C8.5 55 8 54 8 50C8 46 9 40 10 37C11 34 11 30 14 26Z" 
          fill={color} 
        />
        {/* Head & Muzzle */}
        <path 
          d="M51 28C51 26 53 24 55 24C57 24 59 25.5 60 28C61 30.5 61 34 58.5 35C56 36 53 35 51.5 33C51 31.5 51 29.5 51 28Z" 
          fill={color} 
        />
        {/* Ears or Horns */}
        {type === 'bull' ? (
          <>
            <path d="M52 23C52 18 49 14 46 14C45 14 46 17 48 20C50 21.5 51 22.5 52 23Z" fill={color} />
            <path d="M56 23C57 18 61 14 64 14C65 14 64 17 61 20C59 21.5 58 22.5 56 23Z" fill={color} />
          </>
        ) : (
          <>
            <path d="M49 24C47 22 47 19 49 18C51 18 52 20 52 23C51 23.5 50 24 49 24Z" fill={color} opacity="0.85" />
            <path d="M58 25C60 23 62 21 63 22C63.5 23 62 25 60 26C59 26 58.5 25.5 58 25Z" fill={color} opacity="0.85" />
          </>
        )}
        {/* Tail */}
        <path d="M14 30C11 32 8 36 8 41C8 42 7 42 7 41C7 35 11 30 13.5 28C14 28.5 14 29.5 14 30Z" fill={color} />
        {/* Udder for lactating or pregnant */}
        {(type === 'lactating' || type === 'pregnant') && (
          <path d="M30 46C30 49 32 51 35 51C37 51 38 49 38 46C36 46.5 32 46.5 30 46Z" fill="#ffedd5" stroke={color} strokeWidth="1" />
        )}
        {/* Eye */}
        <circle cx="56.5" cy="27.5" r="1.2" fill="#ffffff" />
      </svg>
      {label && (
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color, marginTop: '2px', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      )}
      {weight && (
        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
          {weight} kg
        </span>
      )}
    </div>
  );
}

// Cattle Cartoon Badge with Animal Number and Entered Details for Summary Review
function CattleSummaryBadge({
  imgSrc,
  number,
  title,
  weight,
  details = [],
  color = '#16a34a',
  onClick,
  isMissing = false,
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        background: isMissing ? '#fef2f2' : '#ffffff',
        border: `1.5px solid ${isMissing ? '#ef4444' : color + '40'}`,
        borderRadius: '12px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      title={onClick ? 'Click to edit this cattle in Herd Management' : ''}
    >
      {/* Cartoon Cattle Image with Prominent Number Badge Underneath */}
      <div style={{
        position: 'relative',
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        overflow: 'hidden',
        border: `2px solid ${isMissing ? '#ef4444' : color}`,
        flexShrink: 0,
        background: '#f8fafc',
      }}>
        <img
          src={imgSrc}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: isMissing ? '#ef4444' : color,
          color: '#ffffff',
          fontSize: '0.60rem',
          fontWeight: 900,
          textAlign: 'center',
          lineHeight: '13px',
          letterSpacing: '0.2px',
        }}>
          #{number}
        </div>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f172a' }}>
            {title}
          </span>
          {isMissing ? (
            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '1px 5px', borderRadius: '4px' }}>
              Missing Data
            </span>
          ) : (
            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '1px 5px', borderRadius: '4px' }}>
              ✓
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          {weight ? (
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: color, background: `${color}15`, padding: '1px 6px', borderRadius: '5px' }}>
              {weight} kg
            </span>
          ) : (
            <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '1px 5px', borderRadius: '5px' }}>
              ⚠️ Missing Weight
            </span>
          )}
          {details.map((d, idx) => (
            <span key={idx} style={{ fontSize: '0.68rem', fontWeight: 600, color: '#475569', background: '#f1f5f9', padding: '1px 5px', borderRadius: '5px' }}>
              {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Step10Review({ 
  weather, 
  setWeather,
  fetchWeatherByCoords,
  fetchWeatherByCity,
  isWeatherComplete,
  getStepStatus,
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
  onEditStep,
  onResetAllData,
  currentLang = 'ta',
  t
}) {
  // Python Backend Calculation State
  const [backendOnline, setBackendOnline] = useState(false);
  const [checkingBackend, setCheckingBackend] = useState(true);
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState(null);
  const [ktTab, setKtTab] = useState('proximate');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Manual weather entry state
  const [showManualWeather, setShowManualWeather] = useState(false);
  const [manCity, setManCity] = useState('');
  const [manTemp, setManTemp] = useState('');
  const [manHumidity, setManHumidity] = useState('');

  // Herd calculations
  const totalHeifers = heifersData.length;
  const totalFirstTime = (pregnantCategory === 'firstTime' || pregnantCategory === 'both') ? firstTimeCattle.length : 0;
  const totalRepeat = (pregnantCategory === 'repeat' || pregnantCategory === 'both') ? repeatCattle.length : 0;
  const totalPregnant = totalFirstTime + totalRepeat;
  const totalLactating = lactatingData.length;
  const totalDry = dryCowsData.length;
  const totalBulls = bullsData.length;
  const totalCattleCount = totalHeifers + totalPregnant + totalLactating + totalDry + totalBulls;

  // Mandatory data validation checks
  const isWeatherOk = Boolean(isWeatherComplete);
  const stepCatalog = [
    { num: 1, title: t ? t('steps.step_1') : 'Breed Selection' },
    { num: 2, title: t ? t('steps.step_2') : 'Cattle Herd' },
    { num: 3, title: t ? t('steps.step_3') : 'Grazing Management' },
    { num: 4, title: t ? t('steps.step_4') : 'Water Availability' },
    { num: 5, title: t ? t('steps.step_5') : 'Feed & Fodder' },
    { num: 6, title: t ? t('steps.step_6') : 'Summary & Review' }
  ];

  const hasCattle = totalCattleCount > 0;
  const hasBreed = Boolean(selectedBreed);
  const hasWater = Number(waterVolume) > 0 && Boolean(waterSource);
  const hasFeed = selectedFeeds && selectedFeeds.length > 0 && selectedFeeds.every(f => Number(f.quantityKg) > 0);
  const hasInvalidCattle = 
    (heifersData && heifersData.some(h => !h.weight || Number(h.weight) <= 0)) ||
    (firstTimeCattle && firstTimeCattle.some(c => !c.weight || Number(c.weight) <= 0)) ||
    (repeatCattle && repeatCattle.some(c => !c.weight || Number(c.weight) <= 0)) ||
    (lactatingData && lactatingData.some(l => !l.weight || Number(l.weight) <= 0 || l.milkYield === '' || Number(l.milkYield) < 0 || l.milkFat === '' || Number(l.milkFat) <= 0)) ||
    (dryCowsData && dryCowsData.some(d => !d.weight || Number(d.weight) <= 0)) ||
    (bullsData && bullsData.some(b => !b.weight || Number(b.weight) <= 0));

  const canGenerateNutrition = isWeatherOk && hasBreed && hasCattle && !hasInvalidCattle && hasWater && hasFeed;

  const requiredMissingItems = [];
  if (!hasBreed) requiredMissingItems.push({ num: 1, title: t ? t('steps.step_1') : 'Breed Selection', reason: 'Select a cattle or buffalo breed' });
  if (!hasCattle) requiredMissingItems.push({ num: 2, title: t ? t('steps.step_2') : 'Cattle Herd', reason: 'Record at least one animal in your herd (Heifers, Pregnant, Lactating, Dry, or Bulls)' });
  if (hasInvalidCattle) requiredMissingItems.push({ num: 2, title: 'Cattle Details Incomplete', reason: 'Ensure all recorded cattle have valid live weights and production values' });
  if (!hasWater) requiredMissingItems.push({ num: 4, title: t ? t('steps.step_4') : 'Water Availability', reason: 'Daily water supply volume and water source are required' });
  if (!hasFeed) requiredMissingItems.push({ num: 5, title: t ? t('steps.step_5') : 'Feed & Fodder', reason: 'Select feed ingredients with daily quantity (kg/day)' });

  // Check backend connectivity on mount (calculation is triggered on user button click)
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      setCheckingBackend(true);
      const status = await checkBackendStatus();
      if (!isMounted) return;
      setBackendOnline(status.connected);
      setCheckingBackend(false);
    };
    checkStatus();
    return () => { isMounted = false; };
  }, []);

  const handleExecuteCalculation = async () => {
    if (!canGenerateNutrition) {
      setCalcError('Cannot calculate: Please complete all mandatory steps and weather telemetry first.');
      return;
    }
    setCalcLoading(true);
    setCalcError(null);
    try {
      const data = await runNutritionCalculation({
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
        selectedFeeds
      });
      setCalcResult(data);
      setBackendOnline(true);
    } catch (err) {
      console.warn('Backend calculation error:', err);
      setCalcError(err.message || 'Calculation request failed');
    } finally {
      setCalcLoading(false);
    }
  };

  const handleSaveManualWeather = (e) => {
    e.preventDefault();
    if (!manCity.trim() || !manTemp || !manHumidity) return;
    const temp = parseFloat(manTemp);
    const rh = parseFloat(manHumidity);
    const thiCalc = Math.round(0.8 * temp + (rh / 100) * (temp - 14.4) + 46.4);
    const wObj = {
      city: manCity.trim(),
      tempC: temp,
      humidity: rh,
      condition: 'Clear',
      thi: thiCalc
    };
    if (setWeather) setWeather(wObj);
    try {
      localStorage.setItem('feednutrition_weather', JSON.stringify(wObj));
    } catch (e) {}
    setShowManualWeather(false);
  };

  // Biomass weight calculation
  const wtHeifers = heifersData.reduce((a, b) => a + (Number(b.weight) || 0), 0);
  const wtFirst = (pregnantCategory === 'firstTime' || pregnantCategory === 'both') ? firstTimeCattle.reduce((a, b) => a + (Number(b.weight) || 0), 0) : 0;
  const wtRepeat = (pregnantCategory === 'repeat' || pregnantCategory === 'both') ? repeatCattle.reduce((a, b) => a + (Number(b.weight) || 0), 0) : 0;
  const wtLactating = lactatingData.reduce((a, b) => a + (Number(b.weight) || 0), 0);
  const wtDry = dryCowsData.reduce((a, b) => a + (Number(b.weight) || 0), 0);
  const wtBulls = bullsData.reduce((a, b) => a + (Number(b.weight) || 0), 0);

  const totalHerdWeightKg = wtHeifers + wtFirst + wtRepeat + wtLactating + wtDry + wtBulls;

  // Total daily milk
  const totalDailyMilkL = lactatingData.reduce((a, b) => a + (Number(b.milkYield) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const grazingCategories = [
    { key: 'heifers', label: t ? t('step7.heifers') : 'Heifers', count: totalHeifers },
    { key: 'pregnant', label: t ? t('step7.pregnant') : 'Pregnant Cattle', count: totalPregnant },
    { key: 'lactating', label: t ? t('step7.lactating') : 'Lactating Cattle', count: totalLactating },
    { key: 'dry', label: t ? t('step7.dry') : 'Dry Cows', count: totalDry },
    { key: 'bulls', label: t ? t('step7.bulls') : 'Bulls', count: totalBulls }
  ];

  const getGrazingSystemLabel = (sys) => {
    if (!sys) return 'Inside Farm Grazing';
    const map = {
      'inside_farm': 'Inside Farm Grazing',
      'farm_only': 'Inside Farm Grazing',
      'outside_farm': 'Outside Farm Grazing',
      'outside': 'Outside Farm Grazing'
    };
    return map[sys] || 'Inside Farm Grazing';
  };

  // ========== CSV EXPORT (Exports ONLY user-filled data) ==========
  const generateCSV = () => {
    if (!canGenerateNutrition) {
      alert('Cannot export report: Please complete all mandatory steps and weather telemetry first.');
      return;
    }
    const rows = [];

    // --- SECTION 1: Farm & Location ---
    rows.push(['=== FARM & LOCATION ===']);
    rows.push(['Field', 'Value']);
    rows.push(['Location', weather?.city || 'Not detected']);
    if (weather?.tempC !== undefined) rows.push(['Temperature (°C)', Math.round(weather.tempC)]);
    if (weather?.humidity !== undefined) rows.push(['Relative Humidity (%)', weather.humidity]);
    if (weather?.condition) rows.push(['Weather Condition', weather.condition]);
    rows.push([]);

    // --- SECTION 2: Selected Breed ---
    if (selectedBreed) {
      rows.push(['=== SELECTED BREED ===']);
      rows.push(['Breed Name', getBreedName(selectedBreed, t) || selectedBreed.name || 'Not selected']);
      rows.push(['Category', selectedBreed.category || 'N/A']);
      rows.push(['Origin', selectedBreed.origin || 'N/A']);
      rows.push([]);
    }

    // --- SECTION 3: Heifers ---
    if (totalHeifers > 0) {
      rows.push(['=== HEIFERS ===']);
      rows.push(['Total Heifers', totalHeifers]);
      rows.push(['#', 'Weight (kg)']);
      heifersData.forEach((h, i) => {
        rows.push([i + 1, h.weight || 'N/A']);
      });
      rows.push([]);
    }

    // --- SECTION 4: Pregnant Cattle ---
    if (totalPregnant > 0) {
      rows.push(['=== PREGNANT CATTLE ===']);
      rows.push(['Pregnant Category', pregnantCategory]);
      if (totalFirstTime > 0) {
        rows.push(['--- First-Time Pregnant ---']);
        rows.push(['#', 'Weight (kg)', 'Pregnancy Month', 'Pregnancy Days']);
        firstTimeCattle.forEach((c, i) => {
          rows.push([
            i + 1,
            c.weight || 'N/A',
            c.inputType === 'months' ? c.pregMonth : 'N/A',
            c.inputType === 'days' ? c.pregDays : 'N/A'
          ]);
        });
      }
      if (totalRepeat > 0) {
        rows.push(['--- Repeat Pregnant ---']);
        rows.push(['#', 'Weight (kg)', 'Pregnancy Month', 'Pregnancy Days']);
        repeatCattle.forEach((c, i) => {
          rows.push([
            i + 1,
            c.weight || 'N/A',
            c.inputType === 'months' ? c.pregMonth : 'N/A',
            c.inputType === 'days' ? c.pregDays : 'N/A'
          ]);
        });
      }
      rows.push([]);
    }

    // --- SECTION 5: Lactating Cattle ---
    if (totalLactating > 0) {
      rows.push(['=== LACTATING CATTLE ===']);
      rows.push(['Total Lactating', totalLactating]);
      rows.push(['#', 'Weight (kg)', 'BCS Score', 'Milk Yield (L/day)', 'Milk Fat (%)', 'Lactation Stage']);
      lactatingData.forEach((c, i) => {
        rows.push([
          i + 1,
          c.weight || 'N/A',
          c.bcs || 'N/A',
          c.milkYield !== undefined ? c.milkYield : 'N/A',
          c.milkFat !== undefined ? c.milkFat : 'N/A',
          c.stage || 'N/A'
        ]);
      });
      rows.push([]);
    }

    // --- SECTION 6: Dry Cows ---
    if (totalDry > 0) {
      rows.push(['=== DRY COWS ===']);
      rows.push(['Total Dry Cows', totalDry]);
      rows.push(['#', 'Weight (kg)', 'Dry Period (days)']);
      dryCowsData.forEach((c, i) => {
        rows.push([i + 1, c.weight || 'N/A', c.dryDays || 'N/A']);
      });
      rows.push([]);
    }

    // --- SECTION 7: Bulls ---
    if (totalBulls > 0) {
      rows.push(['=== BULLS ===']);
      rows.push(['Total Bulls', totalBulls]);
      rows.push(['#', 'Weight (kg)']);
      bullsData.forEach((b, i) => {
        rows.push([i + 1, b.weight || 'N/A']);
      });
      rows.push([]);
    }

    // --- SECTION 8: Grazing ---
    rows.push(['=== GRAZING MANAGEMENT ===']);
    if (grazingData && Object.keys(grazingData).length > 0) {
      rows.push(['Animal Group', 'Grazing Location', 'Grazing Time (Hours/Day)', 'Walking Distance (km/day)']);
      grazingCategories.forEach(cat => {
        if (cat.count > 0 && grazingData[cat.key]) {
          const d = grazingData[cat.key];
          const locName = d.location === 'outside' ? 'Outside Farm Grazing' : (d.location === 'none' || d.hours === 0 ? 'Stall-Fed / No Grazing' : 'Inside Farm Grazing');
          rows.push([cat.label, locName, d.hours || 0, d.location === 'outside' && d.distance ? `${d.distance} km` : '0 km (Inside/Stall-fed)']);
        }
      });
    }
    rows.push([]);

    // --- SECTION 9: Water ---
    rows.push(['=== WATER AVAILABILITY ===']);
    rows.push(['Water Volume (L/day)', waterVolume]);
    rows.push(['Water Source', waterSource]);
    rows.push(['Water Quality', waterQuality]);
    rows.push([]);

    // --- SECTION 10: Feeds ---
    if (selectedFeeds && selectedFeeds.length > 0) {
      rows.push(['=== FEED & FODDER ===']);
      rows.push(['Total Feed Ingredients', selectedFeeds.length]);
      rows.push(['Ingredient Name', 'Category', 'Quantity (kg/day)', 'Dry Matter (%)']);
      selectedFeeds.forEach(f => {
        rows.push([f.name || 'Unknown', f.category || 'N/A', f.quantityKg || 0, f.dmPct || 'N/A']);
      });
      rows.push([]);
    }

    // Convert to CSV
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `MOOPOSHAQ_FarmData_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="wg-card animate-fade-in" style={{ padding: '24px' }}>
      
      {/* Visual Header Banner */}
      <div 
        className="step-banner"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1.5px solid #86efac',
          marginBottom: '24px'
        }}
      >
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge-green">FINAL STEP 6</span>
            <span style={{ fontSize: '0.825rem', color: '#16a34a', fontWeight: 800 }}>
              {t ? t('step10.tag') : 'COMPREHENSIVE FARM REVIEW'}
            </span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#14532d' }}>
            {t ? t('step10.title') : 'Farm Data Summary & Ration Review'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#166534' }}>
            {t ? t('step10.subtitle') : 'Verify all your recorded farm data below, then generate your precision nutrition calculation.'}
          </p>

          <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>


            {hasCattle && (
              <button 
                onClick={() => downloadInputDataPDF({
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
                })}
                className="btn-secondary"
                style={{ background: '#ffffff', border: '1.5px solid #0284c7', color: '#0369a1', padding: '7px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                title="Download recorded farm inputs in colorful PDF format"
              >
                <FileText size={14} color="#0284c7" />
                <span>Download Input Data (PDF)</span>
              </button>
            )}

            {calcResult && (
              <button 
                onClick={() => downloadFeedingReportPDF({
                  calcResult,
                  weather,
                  selectedBreed,
                  totalCattleCount,
                  totalHerdWeightKg,
                  totalDailyMilkL,
                  waterVolume,
                  selectedFeeds,
                  reportLang: currentLang
                })}
                style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#ffffff', border: 'none', padding: '7px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)' }}
                title="Download generated feeding report in colorful PDF format"
              >
                <Download size={14} />
                <span>Download Feeding Report (PDF)</span>
              </button>
            )}


          </div>
        </div>

        <img 
          src="/cattle_art/farm_summary.jpg" 
          alt="Farm Summary" 
          className="step-banner-img"
        />
      </div>

      {/* Overview Quick Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
        gap: '12px',
        marginBottom: '28px'
      }}>
        <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Animals</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 2px' }}>
            {totalCattleCount} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>head</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>{selectedBreed ? getBreedName(selectedBreed, t) : 'All categories'}</span>
        </div>

        <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Herd Weight</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 2px' }}>
            {totalHerdWeightKg > 0 ? `${totalHerdWeightKg.toLocaleString()}` : '0'} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>kg</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Combined Biomass</span>
        </div>

        {totalDailyMilkL > 0 && (
          <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '14px', padding: '16px' }}>
            <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Daily Milk Output</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#15803d', margin: '4px 0 2px' }}>
              {totalDailyMilkL} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Liters/day</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#166534' }}>From {totalLactating} lactating cows</span>
          </div>
        )}

        {waterVolume > 0 && (
          <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '14px', padding: '16px' }}>
            <span style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase' }}>Daily Water Available</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0284c7', margin: '4px 0 2px' }}>
              {waterVolume} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>L/day</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#0369a1' }}>{waterSource || 'Farm supply'}</span>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 1. COMPLETE FARM DATA REVIEW CARDS (SHOWN FIRST!)            */}
      {/* ============================================================ */}
      <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileText size={20} color="#16a34a" />
        <span>{currentLang === 'ta' ? 'பதிவு செய்யப்பட்ட பண்ணைத் தரவுகள் (படிகள் 1 முதல் 9)' : 'Recorded Farm Data Review (Steps 1 to 9)'}</span>
      </h3>

      {/* Top Two Summary Cards: Climate & Breed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* 1. Farm Location & Climate */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
              {currentLang === 'ta' ? '1. பண்ணை இருப்பிடம் & காலநிலை' : (t ? t('step10.section_weather') : '1. Farm Location & Climate')}
            </h4>
            <button onClick={() => onEditStep(1)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              {currentLang === 'ta' ? 'மாற்றுக' : (t ? t('edit') : 'Edit')}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>{currentLang === 'ta' ? 'இருப்பிடம்:' : (t ? t('step10.location') : 'Location:')}</span>
              <strong style={{ color: weather?.city ? '#0f172a' : '#dc2626' }}>{weather?.city || (currentLang === 'ta' ? 'இருப்பிடம் கண்டறியப்படவில்லை' : 'No location detected')}</strong>
            </div>

            {weather?.tempC !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b' }}>{currentLang === 'ta' ? 'சுற்றுச்சூழல் வெப்பநிலை:' : (t ? t('step10.temperature') : 'Air Temperature:')}</span>
                <strong style={{ color: '#16a34a' }}>{Math.round(weather.tempC)}°C</strong>
              </div>
            )}

            {weather?.humidity !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b' }}>{currentLang === 'ta' ? 'ஈரப்பதம்:' : (t ? t('step10.humidity') : 'Relative Humidity:')}</span>
                <strong style={{ color: '#0d9488' }}>{weather.humidity}%</strong>
              </div>
            )}

            {weather?.thi !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b' }}>{currentLang === 'ta' ? 'THI காலநிலை குறியீடு:' : 'THI Climate Index:'}</span>
                <strong style={{ color: weather.thi > 78 ? '#dc2626' : '#16a34a' }}>{weather.thi}</strong>
              </div>
            )}
          </div>
        </div>

        {/* 2. Selected Breed */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
              {currentLang === 'ta' ? '2. இனத் தேர்வு' : (t ? t('steps.step_1') : '2. Breed Selection')}
            </h4>
            <button onClick={() => onEditStep(1)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              {currentLang === 'ta' ? 'மாற்றுக' : (t ? t('edit') : 'Edit')}
            </button>
          </div>

          {selectedBreed ? (
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <img 
                src={selectedBreed.image} 
                alt={getBreedName(selectedBreed, t)} 
                style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #86efac' }} 
              />
              <div>
                <h4 style={{ fontSize: '1.1rem', color: '#0f172a', margin: 0, fontWeight: 800 }}>
                  {getBreedName(selectedBreed, t)}
                </h4>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                  <span className="badge-green">{selectedBreed.category}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({selectedBreed.origin})</span>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{currentLang === 'ta' ? 'இனம் எதுவும் தேர்ந்தெடுக்கப்படவில்லை.' : 'No breed selected.'}</p>
          )}
        </div>

      </div>

      {/* 3. Detailed Animal Categories Inventory */}
      <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
              {currentLang === 'ta' ? '3. மந்தை மாடுகள் விவரம்' : (t ? t('step10.section_animals') : '3. Cattle Herd Inventory')}
            </h4>
            <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '2px 0 0' }}>
              {currentLang === 'ta' ? 'இப்பண்ணையில் பதிவு செய்யப்பட்ட மாடுகளின் எண்ணிக்கை மற்றும் எடைகள் மட்டுமே காட்டப்படுகின்றன.' : 'Only showing categories and live weights recorded on this farm.'}
            </p>
          </div>
          <span className="badge-green">{totalCattleCount} {currentLang === 'ta' ? 'மொத்த மாடுகள்' : (t ? t('step10.head') : 'head total')}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* HEIFERS */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: totalHeifers > 0 ? '#ffffff' : '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: totalHeifers > 0 ? '10px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src="/cattle_art/cartoon_heifer.jpg" 
                  alt="Heifers" 
                  style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid #16a34a', flexShrink: 0 }} 
                />
                <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>
                  {currentLang === 'ta' ? 'கிடாரிகள்' : (t ? t('step7.heifers') : 'Heifers')}: {totalHeifers > 0 ? `${totalHeifers} ${currentLang === 'ta' ? 'மாடுகள்' : 'head'}` : (currentLang === 'ta' ? '0 மாடுகள் (பண்ணையில் இல்லை)' : '0 head (None on farm)')}
                </strong>
              </div>
              <button onClick={() => onEditStep(2)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>{currentLang === 'ta' ? 'மாற்றுக' : 'Edit'}</button>
            </div>
            {totalHeifers > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                {heifersData.map((h, i) => (
                  <CattleSummaryBadge 
                    key={h.id || i}
                    imgSrc="/cattle_art/cartoon_heifer.jpg"
                    number={i + 1}
                    title={currentLang === 'ta' ? `கிடாரி #${i + 1}` : `Heifer #${i + 1}`}
                    weight={h.weight}
                    details={[`${h.ageMonths || 18} ${currentLang === 'ta' ? 'மாதம்' : 'mo'}`]}
                    color="#16a34a"
                    onClick={() => onEditStep(2)}
                    isMissing={!h.weight || Number(h.weight) <= 0}
                  />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                {currentLang === 'ta' ? 'கிடாரிகள் எதுவும் பதிவு செய்யப்படவில்லை' : 'No heifers recorded'}
              </div>
            )}
          </div>

          {/* PREGNANT COWS */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: totalPregnant > 0 ? '#ffffff' : '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: totalPregnant > 0 ? '10px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src="/cattle_art/cartoon_pregnant.jpg" 
                  alt="Pregnant Cattle" 
                  style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid #d97706', flexShrink: 0 }} 
                />
                <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>
                  {currentLang === 'ta' ? 'சினை மாடுகள்' : (t ? t('step7.pregnant') : 'Pregnant Cows')}: {totalPregnant > 0 ? `${totalPregnant} ${currentLang === 'ta' ? 'மாடுகள்' : 'head'}` : (currentLang === 'ta' ? '0 மாடுகள் (பண்ணையில் இல்லை)' : '0 head (None on farm)')}
                </strong>
              </div>
              <button onClick={() => onEditStep(3)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>{currentLang === 'ta' ? 'மாற்றுக' : 'Edit'}</button>
            </div>

            {totalFirstTime > 0 && (
              <div style={{ marginBottom: '10px', marginTop: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>{currentLang === 'ta' ? `முதல் முறை சினை (${totalFirstTime}):` : `First-Time Pregnant (${totalFirstTime}):`}</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
                  {firstTimeCattle.map((c, i) => (
                    <CattleSummaryBadge 
                      key={c.id || i}
                      imgSrc="/cattle_art/cartoon_pregnant.jpg"
                      number={i + 1}
                      title={currentLang === 'ta' ? `1-ம் சினை #${i + 1}` : `1st-Preg #${i + 1}`}
                      weight={c.weight}
                      details={[`${c.pregDays || 150}${currentLang === 'ta' ? ' நாள் சினை' : 'd preg'}`]}
                      color="#d97706"
                      onClick={() => onEditStep(3)}
                      isMissing={!c.weight || Number(c.weight) <= 0}
                    />
                  ))}
                </div>
              </div>
            )}

            {totalRepeat > 0 && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>{currentLang === 'ta' ? `மறு சினை மாடுகள் (${totalRepeat}):` : `Repeat / Multiparous (${totalRepeat}):`}</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
                  {repeatCattle.map((c, i) => (
                    <CattleSummaryBadge 
                      key={c.id || i}
                      imgSrc="/cattle_art/cartoon_pregnant.jpg"
                      number={i + 1}
                      title={currentLang === 'ta' ? `மறுசினை #${i + 1}` : `Repeat #${i + 1}`}
                      weight={c.weight}
                      details={[`${c.pregDays || 210}${currentLang === 'ta' ? ' நாள் சினை' : 'd preg'}`]}
                      color="#b45309"
                      onClick={() => onEditStep(3)}
                      isMissing={!c.weight || Number(c.weight) <= 0}
                    />
                  ))}
                </div>
              </div>
            )}

            {totalPregnant === 0 && (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                {currentLang === 'ta' ? 'சினை மாடுகள் எதுவும் பதிவு செய்யப்படவில்லை' : 'No pregnant cattle recorded'}
              </div>
            )}
          </div>

          {/* LACTATING COWS */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: totalLactating > 0 ? '#ffffff' : '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: totalLactating > 0 ? '10px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src="/cattle_art/cartoon_lactating.jpg" 
                  alt="Lactating Cows" 
                  style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid #0284c7', flexShrink: 0 }} 
                />
                <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>
                  {currentLang === 'ta' ? 'கறவை மாடுகள்' : (t ? t('step7.lactating') : 'Lactating Cows')}: {totalLactating > 0 ? `${totalLactating} ${currentLang === 'ta' ? 'மாடுகள்' : 'head'} (${totalDailyMilkL} ${currentLang === 'ta' ? 'லிட்டர்/நாள்' : 'L/day total'})` : (currentLang === 'ta' ? '0 மாடுகள் (பண்ணையில் இல்லை)' : '0 head (None on farm)')}
                </strong>
              </div>
              <button onClick={() => onEditStep(4)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>{currentLang === 'ta' ? 'மாற்றுக' : 'Edit'}</button>
            </div>
            {totalLactating > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                {lactatingData.map((c, i) => (
                  <CattleSummaryBadge 
                    key={c.id || i}
                    imgSrc="/cattle_art/cartoon_lactating.jpg"
                    number={i + 1}
                    title={currentLang === 'ta' ? `கறவை மாடு #${i + 1} (${(c.lactationType === 'first_lactation' || c.isFirstLactation) ? '1-ம் ஈத்து' : '2+ ஈத்து'})` : `Cow #${i + 1} (${(c.lactationType === 'first_lactation' || c.isFirstLactation) ? '1st Lact' : '2nd+'})`}
                    weight={c.weight}
                    details={[
                      `${c.milkYield || 10} ${currentLang === 'ta' ? 'லி/நாள்' : 'L/d'}`,
                      `${c.milkFat || 4.2}% ${currentLang === 'ta' ? 'கொழுப்பு' : 'Fat'}`,
                      c.stage === 'early' ? (currentLang === 'ta' ? 'துவக்க பருவம் (<100 நாள்)' : 'Early (<100d)') : c.stage === 'late' ? (currentLang === 'ta' ? 'பிந்தைய பருவம் (>200 நாள்)' : 'Late (>200d)') : (currentLang === 'ta' ? 'நடுப்பருவம் (100–200 நாள்)' : 'Mid (100–200d)')
                    ]}
                    color="#0284c7"
                    onClick={() => onEditStep(4)}
                    isMissing={!c.weight || Number(c.weight) <= 0 || c.milkYield === '' || Number(c.milkYield) <= 0 || c.milkFat === '' || Number(c.milkFat) <= 0}
                  />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                {currentLang === 'ta' ? 'கறவை மாடுகள் எதுவும் பதிவு செய்யப்படவில்லை' : 'No lactating cattle recorded'}
              </div>
            )}
          </div>

          {/* DRY COWS */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: totalDry > 0 ? '#ffffff' : '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: totalDry > 0 ? '10px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src="/cattle_art/cartoon_dry_cow.jpg" 
                  alt="Dry Cows" 
                  style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid #9333ea', flexShrink: 0 }} 
                />
                <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>
                  {currentLang === 'ta' ? 'வறண்ட மாடுகள்' : (t ? t('step7.dry') : 'Dry Cows')}: {totalDry > 0 ? `${totalDry} ${currentLang === 'ta' ? 'மாடுகள்' : 'head'}` : (currentLang === 'ta' ? '0 மாடுகள் (பண்ணையில் இல்லை)' : '0 head (None on farm)')}
                </strong>
              </div>
              <button onClick={() => onEditStep(5)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>{currentLang === 'ta' ? 'மாற்றுக' : 'Edit'}</button>
            </div>
            {totalDry > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                {dryCowsData.map((c, i) => (
                  <CattleSummaryBadge 
                    key={c.id || i}
                    imgSrc="/cattle_art/cartoon_dry_cow.jpg"
                    number={i + 1}
                    title={currentLang === 'ta' ? `வறண்ட மாடு #${i + 1}` : `Dry Cow #${i + 1}`}
                    weight={c.weight}
                    details={[`${c.dryDays || 60} ${currentLang === 'ta' ? 'நாள் வறட்சி' : 'd dry'}`]}
                    color="#9333ea"
                    onClick={() => onEditStep(5)}
                    isMissing={!c.weight || Number(c.weight) <= 0}
                  />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                {currentLang === 'ta' ? 'வறண்ட மாடுகள் எதுவும் பதிவு செய்யப்படவில்லை' : 'No dry cows recorded'}
              </div>
            )}
          </div>

          {/* BULLS */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: totalBulls > 0 ? '#ffffff' : '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: totalBulls > 0 ? '10px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src="/cattle_art/cartoon_bull.jpg" 
                  alt="Bulls" 
                  style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid #dc2626', flexShrink: 0 }} 
                />
                <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>
                  {currentLang === 'ta' ? 'காளைகள்' : (t ? t('step7.bulls') : 'Bulls')}: {totalBulls > 0 ? `${totalBulls} ${currentLang === 'ta' ? 'மாடுகள்' : 'head'}` : (currentLang === 'ta' ? '0 மாடுகள் (பண்ணையில் இல்லை)' : '0 head (None on farm)')}
                </strong>
              </div>
              <button onClick={() => onEditStep(6)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>{currentLang === 'ta' ? 'மாற்றுக' : 'Edit'}</button>
            </div>
            {totalBulls > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px' }}>
                {bullsData.map((b, i) => (
                  <CattleSummaryBadge 
                    key={b.id || i}
                    imgSrc="/cattle_art/cartoon_bull.jpg"
                    number={i + 1}
                    title={currentLang === 'ta' ? `காளை #${i + 1}` : `Bull #${i + 1}`}
                    weight={b.weight}
                    details={[`${b.purpose || (currentLang === 'ta' ? 'இனப்பெருக்கக் காளை' : 'Breeding Bull')}`]}
                    color="#dc2626"
                    onClick={() => onEditStep(6)}
                    isMissing={!b.weight || Number(b.weight) <= 0}
                  />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                {currentLang === 'ta' ? 'காளைகள் எதுவும் பதிவு செய்யப்படவில்லை' : 'No bulls recorded'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Grazing, Water, Feed & Fodder */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginBottom: '32px' }}>
        
        {/* 4. Grazing Management */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
              {currentLang === 'ta' ? '4. மேய்ச்சல் முறை' : (t ? t('step10.section_grazing') : '4. Grazing System')}
            </h4>
            <button onClick={() => onEditStep(7)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              {currentLang === 'ta' ? 'மாற்றுக' : (t ? t('edit') : 'Edit')}
            </button>
          </div>

          {grazingData && Object.keys(grazingData).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.825rem' }}>
              {grazingCategories.map(cat => {
                if (cat.count > 0 && grazingData[cat.key]) {
                  const d = grazingData[cat.key];
                  const loc = d.location || (Number(d.hours) > 0 ? 'inside' : 'inside');
                  const isOutside = loc === 'outside';
                  const isStallFed = loc === 'none';
                  const hrs = d.hours !== undefined && d.hours !== '' ? d.hours : (isStallFed ? 0 : 4);
                  const dist = Number(d.distance) || 0;

                  const locBadge = isOutside ? (currentLang === 'ta' ? 'பண்ணைக்கு வெளியே' : 'Outside Farm') : isStallFed ? (currentLang === 'ta' ? 'தொழுவப் பராமரிப்பு' : 'Stall-Fed') : (currentLang === 'ta' ? 'பண்ணைக்குள் மேய்ச்சல்' : 'Inside Farm');
                  const locColor = isOutside ? '#b45309' : isStallFed ? '#475569' : '#15803d';
                  const locBg = isOutside ? '#fef3c7' : isStallFed ? '#f1f5f9' : '#dcfce7';

                  return (
                    <div key={cat.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#0f172a' }}>{translateTerm(cat.label, currentLang)}</strong>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, background: locBg, color: locColor, padding: '2px 8px', borderRadius: '6px' }}>
                          {locBadge}
                        </span>
                      </div>
                      <span style={{ color: '#0f172a', fontWeight: 700 }}>
                        {isStallFed ? (currentLang === 'ta' ? '0 மணி (தொழுவம்)' : '0 hrs (Stall-fed)') : `${hrs} ${currentLang === 'ta' ? 'மணி/நாள்' : 'hrs/day'}`} {isOutside && dist > 0 ? `• ${dist} ${currentLang === 'ta' ? 'கி.மீ நடை' : 'km walk'}` : ''}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>{currentLang === 'ta' ? 'மேய்ச்சல் இல்லா வழக்கமான தொழுவப் பராமரிப்பு பதிவு செய்யப்பட்டுள்ளது.' : 'Standard zero-grazing recorded.'}</p>
          )}
        </div>

        {/* 5. Water Availability */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
              {currentLang === 'ta' ? '5. குடிநீர் இருப்பு' : '5. Water Supply'}
            </h4>
            <button onClick={() => onEditStep(8)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              {currentLang === 'ta' ? 'மாற்றுக' : (t ? t('edit') : 'Edit')}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f0f9ff', borderRadius: '8px' }}>
              <span style={{ color: '#0369a1' }}>{currentLang === 'ta' ? 'தினசரி அளவு:' : 'Daily Volume:'}</span>
              <strong style={{ color: '#0284c7' }}>{waterVolume} {currentLang === 'ta' ? 'லிட்டர் / நாள்' : 'Litres / day'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>{currentLang === 'ta' ? 'முக்கிய மூலம்:' : 'Primary Source:'}</span>
              <strong style={{ color: '#0f172a' }}>{translateTerm(waterSource, currentLang) || (currentLang === 'ta' ? 'குறிப்பிடப்படவில்லை' : 'Not specified')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>{currentLang === 'ta' ? 'தண்ணீர் தரம்:' : 'Water Quality:'}</span>
              <strong style={{ color: '#16a34a' }}>{translateTerm(waterQuality, currentLang) || (currentLang === 'ta' ? 'நன்று' : 'Good')}</strong>
            </div>
          </div>
        </div>

        {/* 6. Feed & Fodder Rations */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
              {currentLang === 'ta' ? '6. தீவனப் பொருட்கள்' : '6. Feed Ingredients'}
            </h4>
            <button onClick={() => onEditStep(9)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              {currentLang === 'ta' ? 'மாற்றுக' : (t ? t('edit') : 'Edit')}
            </button>
          </div>

          {selectedFeeds && selectedFeeds.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
              {selectedFeeds.map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{translateFeed(f.name, currentLang)}</span>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>{f.quantityKg} {currentLang === 'ta' ? 'கிலோ/நாள்' : 'kg/day'} ({translateCategory(f.category, currentLang)})</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>{currentLang === 'ta' ? 'தீவனப் பொருட்கள் எதுவும் தேர்ந்தெடுக்கப்படவில்லை.' : 'No feed ingredients selected yet.'}</p>
          )}
        </div>

      </div>

      {/* ============================================================ */}
      {/* 2. CALCULATION ENGINE & TRIGGER CARD (PLACED IN LAST!)       */}
      {/* ============================================================ */}
      <div style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        border: backendOnline ? '2px solid #86efac' : '2px dashed #cbd5e1',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: backendOnline ? '0 10px 25px -5px rgba(22, 163, 74, 0.08)' : 'none'
      }}>
        {/* Top Header Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: backendOnline ? '#dcfce7' : '#f1f5f9',
              color: backendOnline ? '#16a34a' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={22} className={calcLoading ? 'animate-spin' : ''} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
                  Scientific Precision Nutrition & Formulation Engine
                </h3>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '3px 0 0' }}>
                ICAR & NRC precision equations for THI stress, DMI requirements, RUP/RDP protein, and mineral homeostasis.
              </p>
            </div>
          </div>
        </div>

        {/* ========== CASE 1: MANDATORY DATA INCOMPLETE NOTICE & CHECKLIST ========== */}
        {!canGenerateNutrition && (
          <div style={{
            padding: '20px',
            background: '#fffbeb',
            border: '2px solid #fde68a',
            borderRadius: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <AlertTriangle size={22} color="#d97706" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#92400e', margin: 0 }}>
                All Farm Data is Required Before Calculating Nutrition Values
              </h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#78350f', margin: '0 0 16px', lineHeight: 1.5 }}>
              To ensure scientific accuracy of the feed formulation and heat stress (THI) index, <strong>every step must be filled</strong>, and <strong>location, temperature, and relative humidity must be provided</strong>.
            </p>

            {/* Checklist Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* 1. Weather Check */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: isWeatherOk ? '#f0fdf4' : '#fef2f2',
                border: isWeatherOk ? '1px solid #bbf7d0' : '1.5px solid #fca5a5',
                borderRadius: '10px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: isWeatherOk ? '#16a34a' : '#dc2626'
                  }}></span>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: isWeatherOk ? '#15803d' : '#991b1b' }}>
                      Location & Weather Telemetry: {isWeatherOk ? `Synced (${weather?.city}, ${weather?.tempC}°C, ${weather?.humidity}% RH)` : 'Missing (Location, Temp & RH Required)'}
                    </strong>
                    {!isWeatherOk && (
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#b91c1c' }}>
                        Local temperature and humidity are essential to compute THI, heat stress, and free water intake.
                      </p>
                    )}
                  </div>
                </div>

                {!isWeatherOk && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {fetchWeatherByCoords && (
                      <button 
                        onClick={fetchWeatherByCoords}
                        className="btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <MapPin size={14} /> Auto-Detect GPS Weather
                      </button>
                    )}
                    <button 
                      onClick={() => setShowManualWeather(!showManualWeather)}
                      className="btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      {showManualWeather ? 'Cancel' : 'Enter Manually'}
                    </button>
                  </div>
                )}
              </div>

              {/* Inline Manual Weather Entry Form */}
              {showManualWeather && !isWeatherOk && (
                <form onSubmit={handleSaveManualWeather} style={{
                  padding: '14px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  alignItems: 'flex-end'
                }}>
                  <div style={{ flex: '1 1 140px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>City / District:</label>
                    <input 
                      type="text"
                      placeholder="e.g. Salem, Karnal, Anand"
                      value={manCity}
                      onChange={(e) => setManCity(e.target.value)}
                      required
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ width: '100px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Temp (°C):</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 32"
                      value={manTemp}
                      onFocus={(e) => e.target.select()}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => setManTemp(e.target.value)}
                      required
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ width: '100px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Humidity (%):</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 65"
                      min="5"
                      max="100"
                      value={manHumidity}
                      onFocus={(e) => e.target.select()}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => setManHumidity(e.target.value)}
                      required
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    Save Weather
                  </button>
                </form>
              )}

              {/* 2. Cattle Count Check */}
              {!hasCattle && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#fef2f2',
                  border: '1.5px solid #fca5a5',
                  borderRadius: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626' }}></span>
                    <span style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 700 }}>
                      No Cattle Recorded (Total Head: 0). Record at least one animal to calculate nutrition.
                    </span>
                  </div>
                  <button onClick={() => onEditStep(2)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                    Go to Cattle
                  </button>
                </div>
              )}

              {/* 3. Missing Requirements Checklist */}
              {requiredMissingItems.filter(item => item.num !== 2 || hasCattle).map(item => (
                <div key={item.num} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#ffffff',
                  border: '1.5px solid #fca5a5',
                  borderRadius: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#ef4444'
                    }}></span>
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        {item.title}
                      </strong>
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#fee2e2',
                        color: '#b91c1c'
                      }}>
                        Required
                      </span>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                        {item.reason}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => onEditStep(item.num)} 
                    className="btn-secondary" 
                    style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    Go to Step {item.num} →
                  </button>
                </div>
              ))}

            </div>
          </div>
        )}

        {/* ========== CASE 2: READY TO CALCULATE PROMINENT ACTION CARD ========== */}
        {canGenerateNutrition && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '24px 20px',
            background: '#f0fdf4',
            borderRadius: '16px',
            border: '2px solid #86efac',
            marginBottom: calcResult ? '28px' : '0'
          }}>
            <Sparkles size={32} color="#16a34a" style={{ marginBottom: '10px' }} />
            <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803d', margin: '0 0 6px' }}>
              All Farm Data Verified & Ready to Calculate
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#166534', margin: '0 0 18px', maxWidth: '560px' }}>
              All 9 steps and local climate telemetry have been confirmed. Click below to run the scientific nutrition engine and view herd balances.
            </p>

            <button
              onClick={handleExecuteCalculation}
              disabled={calcLoading}
              className="btn-primary"
              style={{
                padding: '12px 20px',
                fontSize: 'clamp(0.88rem, 2.5vw, 1.05rem)',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
                cursor: 'pointer',
                maxWidth: '100%',
                width: 'min(100%, 440px)',
                lineHeight: 1.35
              }}
            >
              <RefreshCw size={18} className={calcLoading ? 'animate-spin' : ''} />
              <span>
                {calcLoading 
                  ? (currentLang === 'ta' ? 'ஊட்டச்சத்து தேவைகள் கணக்கிடப்படுகிறது...' : 'Calculating Nutrition Values...') 
                  : calcResult 
                    ? (currentLang === 'ta' ? 'மீண்டும் ஊட்டச்சத்தைக் கணக்கிடுக' : 'Recalculate Nutrition Values') 
                    : (currentLang === 'ta' ? 'தீவன ஊட்டச்சத்து தேவைகளைக் கணக்கிடுக' : 'Calculate Your Nutrition Values')}
              </span>
            </button>
          </div>
        )}

        {/* Backend offline guide notice if not connected */}
        {!backendOnline && (
          <div style={{ padding: '16px 20px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', color: '#92400e', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '16px' }}>
            <AlertCircle size={24} style={{ flexShrink: 0, color: '#d97706', marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <strong>{currentLang === 'ta' ? 'பைத்தான் சர்வர் தற்போது பதிலளிக்கவில்லை.' : 'Python Backend is currently not responding.'}</strong>
                <button
                  onClick={async () => {
                    setCheckingBackend(true);
                    const status = await checkBackendStatus();
                    setBackendOnline(status.connected);
                    setCheckingBackend(false);
                  }}
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: '#f59e0b',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {checkingBackend ? (currentLang === 'ta' ? 'இணைக்கப்படுகிறது...' : 'Retrying...') : (currentLang === 'ta' ? '🔄 மீண்டும் இணைக்க' : '🔄 Retry Connection')}
                </button>
              </div>
              <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#78350f', lineHeight: 1.5 }}>
                • <strong>If deployed on Vercel:</strong> Ensure <code>VITE_API_BASE_URL</code> is set to <code>https://feednutrition.onrender.com</code> in your Vercel project's Environment Variables.<br />
                • <strong>If running locally:</strong> Open a terminal inside the <code>backend/</code> folder and run: <br />
                <code style={{ background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>uvicorn main:app --reload --port 8000</code>
              </div>
            </div>
          </div>
        )}

        {/* Calculation Error Notice */}
        {calcError && (
          <div style={{ padding: '12px 16px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', color: '#991b1b', fontSize: '0.85rem', marginTop: '16px' }}>
            <strong>{currentLang === 'ta' ? 'கணக்கீட்டுக் குறிப்பு:' : 'Calculation Notice:'}</strong> {calcError}
          </div>
        )}

        {/* ============================================================ */}
        {/* CALCULATION RESULTS DISPLAY (SHOWN WHEN USER CLICKS TRIGGER) */}
        {/* ============================================================ */}
        {canGenerateNutrition && calcResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
            
            {/* 1. MY FARM FEEDING REPORT HEADER CARD */}
            <div className="review-section-card" style={{
              background: '#ffffff',
              border: '2px solid #86efac',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 15px rgba(22, 163, 74, 0.08)'
            }}>
              <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', color: '#15803d', fontWeight: 900, margin: '0 0 4px' }}>
                    {currentLang === 'ta' ? 'எனது பண்ணை தீவன அறிக்கை' : 'My Farm Feeding Report'}
                  </h3>
                  <h4 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
                    {weather?.city 
                      ? (currentLang === 'ta' ? `${weather.city} பால் பண்ணை` : `${weather.city} Dairy Farm`) 
                      : (currentLang === 'ta' ? 'மூபோஷாக் பால் பண்ணை' : 'MOOPOSHAQ Farm')}
                  </h4>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => downloadFeedingReportPDF({
                      calcResult,
                      weather,
                      selectedBreed,
                      totalCattleCount,
                      totalHerdWeightKg,
                      totalDailyMilkL,
                      waterVolume,
                      selectedFeeds
                    })}
                    style={{
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      boxShadow: '0 3px 8px rgba(22, 163, 74, 0.25)'
                    }}
                    title="Download complete herd feeding calculation in colorful PDF format"
                  >
                    <Download size={16} />
                    <span>{currentLang === 'ta' ? 'அறிக்கையைப் பதிவிறக்கு (PDF)' : 'Download Report (PDF)'}</span>
                  </button>

                  <button
                    onClick={() => downloadInputDataPDF({
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
                      totalCattleCount
                    })}
                    style={{
                      background: '#ffffff',
                      color: '#0369a1',
                      border: '1.5px solid #bae6fd',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                    title="Download recorded farm inputs in colorful PDF format"
                  >
                    <FileText size={15} color="#0284c7" />
                    <span>{currentLang === 'ta' ? 'உள்ளீடுகளைப் பதிவிறக்கு (PDF)' : 'Download Inputs (PDF)'}</span>
                  </button>
                </div>
              </div>

              {/* Cattle Reference & Biological Baseline Banner */}
              <div style={{
                display: 'flex',
                gap: '18px',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginBottom: '20px',
                padding: '14px 18px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1.5px solid #e2e8f0'
              }}>
                <img 
                  src={selectedBreed?.image || "/cattle_art/farm_summary.jpg"} 
                  alt={calcResult.breed?.name || selectedBreed?.name || "Cattle"} 
                  onError={(e) => { e.target.src = "/cattle_art/farm_summary.jpg"; }}
                  style={{ width: '85px', height: '62px', objectFit: 'cover', borderRadius: '10px', border: '1.5px solid #cbd5e1', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {currentLang === 'ta' ? 'மாடுகள் குறிப்பு & மரபியல் அடிப்படை' : 'Cattle Reference & Genetic Baseline'}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                    {calcResult.breed?.name || selectedBreed?.name || (currentLang === 'ta' ? 'கறவை மாடுகள்' : 'Dairy Cattle')}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '2px' }}>
                    {currentLang === 'ta' ? 'முதிர்ந்த பசு எடை இலக்கு: ' : 'Mature Cow Weight Target: '}
                    <strong>{selectedBreed?.avgWeightCow || 450} {currentLang === 'ta' ? 'கிலோ' : 'kg'}</strong> • 
                    {currentLang === 'ta' ? ' அடிப்படை பால் அளவு: ' : ' Reference Baseline: '}
                    <strong>{selectedBreed?.avgMilkYield || '10–12'} {currentLang === 'ta' ? 'லி/நாள்' : 'L/day'}</strong> ({selectedBreed?.fatPct || '4.0'}% {currentLang === 'ta' ? 'கொழுப்பு' : 'fat'})
                  </div>
                </div>
              </div>

              {(() => {
                const dmiVal = calcResult.practicalFeedingReport?.totalEstimatedDmiReqKg ?? 
                               calcResult.nutritionAnalysis?.dmi?.requiredKg ?? 
                               calcResult.nutritionAnalysis?.dmiRequiredKg ?? 
                               (totalHerdWeightKg > 0 ? (totalHerdWeightKg * 0.026).toFixed(1) : '0');
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', fontSize: '0.88rem', color: '#1e293b' }}>
                    <div><strong>{currentLang === 'ta' ? 'இனம்:' : 'Breed:'}</strong> <span style={{ color: '#16a34a', fontWeight: 800 }}>{calcResult.breed?.name || selectedBreed?.name}</span></div>
                    <div><strong>{currentLang === 'ta' ? 'மொத்த மாடுகள்:' : 'Total cattle:'}</strong> <span style={{ fontWeight: 800 }}>{totalCattleCount} {currentLang === 'ta' ? 'மாடுகள்' : 'Head'}</span></div>
                    <div><strong>{currentLang === 'ta' ? 'மந்தையின் மொத்த எடை:' : 'Total herd weight:'}</strong> <span style={{ fontWeight: 800 }}>{totalHerdWeightKg.toLocaleString()} {currentLang === 'ta' ? 'கிலோ' : 'kg'}</span></div>
                    <div><strong>{currentLang === 'ta' ? 'பால் உற்பத்தி:' : 'Milk production:'}</strong> <span style={{ color: '#0284c7', fontWeight: 800 }}>{totalDailyMilkL} {currentLang === 'ta' ? 'லிட்டர்/நாள்' : 'L/day'}</span></div>
                    <div><strong>{currentLang === 'ta' ? 'தேவையான உலர் சத்து (DMI):' : 'Dry-matter required:'}</strong> <span style={{ fontWeight: 800, color: '#15803d' }}>{dmiVal} {currentLang === 'ta' ? 'கிலோ/நாள்' : 'kg/day'}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Thermometer size={16} color="#d97706" />
                      <span><strong>{currentLang === 'ta' ? 'வெப்பநிலை:' : 'Temperature:'}</strong> {Math.round(weather?.tempC || 33)}°C</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Droplets size={16} color="#0284c7" />
                      <span><strong>{currentLang === 'ta' ? 'ஈரப்பதம்:' : 'Humidity:'}</strong> {weather?.humidity || 69}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Droplet size={16} color="#0284c7" />
                      <span><strong>{currentLang === 'ta' ? 'குடிநீர் இருப்பு:' : 'Water available:'}</strong> {waterVolume} {currentLang === 'ta' ? 'லிட்டர்/நாள்' : 'L/day'}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 2. TODAY'S FEED RECOMMENDATION TABLE */}
            <div className="review-section-card" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wheat size={22} color="#15803d" />
                  <span>{currentLang === 'ta' ? 'இன்றைய தீவனப் பரிந்துரை & நடைமுறை செயல் திட்டம்' : "Today's Feed Recommendation & Practical Action Plan"}</span>
                </h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 10px', fontWeight: 600 }}>
                {currentLang === 'ta' ? 'தேர்வு செய்யப்பட்ட பண்ணை தீவன இருப்பு:' : 'Selected farm feeds inventory:'}
              </p>
              <div className="selected-feeds-inventory" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                {selectedFeeds.map((f, i) => (
                  <span key={i} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Leaf size={14} color="#16a34a" />
                    <span>{translateFeed(f.name, currentLang)}</span>
                  </span>
                ))}
              </div>


              {/* SIMPLE PLAIN-ENGLISH FEEDING GUIDE */}
              {(() => {
                const recs = calcResult.practicalFeedingReport?.todayRecommendations || [];
                const shortages = recs.filter(r => {
                  const userKg = r.userProvidedKg !== undefined ? Number(r.userProvidedKg) : (Number(selectedFeeds?.find(f => f.name?.toLowerCase() === r.name?.toLowerCase())?.quantityKg) || 0);
                  const neededKg = Number(r.recommendedKg) || 0;
                  const diffKg = r.differenceKg !== undefined ? Number(r.differenceKg) : Math.round((neededKg - userKg) * 10) / 10;
                  return diffKg > 0.5;
                });
                const surpluses = recs.filter(r => {
                  const userKg = r.userProvidedKg !== undefined ? Number(r.userProvidedKg) : (Number(selectedFeeds?.find(f => f.name?.toLowerCase() === r.name?.toLowerCase())?.quantityKg) || 0);
                  const neededKg = Number(r.recommendedKg) || 0;
                  const diffKg = r.differenceKg !== undefined ? Number(r.differenceKg) : Math.round((neededKg - userKg) * 10) / 10;
                  return diffKg < -0.5;
                });
                const covered = recs.filter(r => {
                  const userKg = r.userProvidedKg !== undefined ? Number(r.userProvidedKg) : (Number(selectedFeeds?.find(f => f.name?.toLowerCase() === r.name?.toLowerCase())?.quantityKg) || 0);
                  const neededKg = Number(r.recommendedKg) || 0;
                  const diffKg = r.differenceKg !== undefined ? Number(r.differenceKg) : Math.round((neededKg - userKg) * 10) / 10;
                  return Math.abs(diffKg) <= 0.5;
                });

                const isAllOk = shortages.length === 0;

                return (
                  <div className="today-advice-wrapper" style={{
                    background: isAllOk ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: `2px solid ${isAllOk ? '#86efac' : '#fcd34d'}`,
                    borderRadius: '16px',
                    padding: '18px 22px',
                    marginBottom: '22px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <div className="today-advice-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '1.75rem' }}>{isAllOk ? <CheckCircle2 size={24} color="#16a34a" /> : <AlertTriangle size={24} color="#d97706" />}</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: isAllOk ? '#166534' : '#92400e' }}>
                          {isAllOk 
                            ? (currentLang === 'ta' ? 'அனைத்தும் சரி! இன்றைய தீவனத் திட்டம்' : 'All Okay! Feeding Plan for Today') 
                            : (currentLang === 'ta' ? 'இன்றைய தீவன வழிகாட்டல் (விவசாயிகளுக்கான எளிய விளக்கம்)' : "Today's Feeding Advice (Simple English Guide)")}
                        </h4>
                        <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: isAllOk ? '#15803d' : '#b45309', fontWeight: 600 }}>
                          {isAllOk 
                            ? (currentLang === 'ta' ? 'அனைத்து தீவன அளவுகளும் உங்கள் மந்தைக்குத் தேவையான அளவிற்கு சரியாக உள்ளன. இன்று திட்டமிட்டபடி தொடர்ந்து வழங்கவும்!' : 'All feed amounts match what your herd needs. Keep feeding as planned today!') 
                            : (currentLang === 'ta' ? 'இன்று நீங்கள் எவற்றை அதிகரிக்க அல்லது குறைக்க வேண்டும் என்ற எளிய விவரம்:' : 'Here is what you should increase or decrease today in simple words:')}
                        </p>
                      </div>
                    </div>

                    <div className="today-advice-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Shortages: Feed more */}
                      {shortages.map((r, i) => {
                        const userKg = r.userProvidedKg !== undefined ? Number(r.userProvidedKg) : (Number(selectedFeeds?.find(f => f.name?.toLowerCase() === r.name?.toLowerCase())?.quantityKg) || 0);
                        const neededKg = Number(r.recommendedKg) || 0;
                        const diffKg = r.differenceKg !== undefined ? Number(r.differenceKg) : Math.round((neededKg - userKg) * 10) / 10;
                        return (
                          <div key={`short-${i}`} className="today-advice-item shortage-item" style={{
                            background: '#ffffff',
                            border: '1.5px solid #f87171',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <span className="today-advice-badge shortage-badge" style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 900, padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                              {currentLang === 'ta' ? 'இன்று கூடுதலாக அளிக்க வேண்டும்' : 'FEED MORE TODAY'}
                            </span>
                            <span className="today-advice-text" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                              {currentLang === 'ta' ? (
                                <>இன்று நீங்கள் <strong>+{diffKg.toFixed(1)} கிலோ கூடுதலாக {translateFeed(r.name, currentLang)}</strong> தீவனம் அளிக்க வேண்டும் (மொத்தம் <strong>{neededKg.toFixed(1)} கிலோ தேவை</strong>, தற்போது {userKg.toFixed(1)} கிலோ உள்ளது).</>
                              ) : (
                                <>You should feed <strong>+{diffKg.toFixed(1)} kg more of {r.name}</strong> today (give <strong>{neededKg.toFixed(1)} kg total</strong>, currently at {userKg.toFixed(1)} kg).</>
                              )}
                            </span>
                          </div>
                        );
                      })}

                      {/* Surpluses: Feed less */}
                      {surpluses.map((r, i) => {
                        const userKg = r.userProvidedKg !== undefined ? Number(r.userProvidedKg) : (Number(selectedFeeds?.find(f => f.name?.toLowerCase() === r.name?.toLowerCase())?.quantityKg) || 0);
                        const neededKg = Number(r.recommendedKg) || 0;
                        const diffKg = r.differenceKg !== undefined ? Number(r.differenceKg) : Math.round((neededKg - userKg) * 10) / 10;
                        return (
                          <div key={`surp-${i}`} className="today-advice-item surplus-item" style={{
                            background: '#ffffff',
                            border: '1.5px solid #93c5fd',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <span className="today-advice-badge surplus-badge" style={{ background: '#dbeafe', color: '#1d4ed8', fontWeight: 900, padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                              {currentLang === 'ta' ? 'அளவைக் குறைக்கலாம்' : 'DECREASE THIS'}
                            </span>
                            <span className="today-advice-text" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                              {currentLang === 'ta' ? (
                                <>இன்று நீங்கள் <strong>{translateFeed(r.name, currentLang)}</strong> தீவனத்தை <strong>{Math.abs(diffKg).toFixed(1)} கிலோ குறைக்கலாம்</strong> (மொத்தம் <strong>{neededKg.toFixed(1)} கிலோ போதுமானது</strong>, தற்போது {userKg.toFixed(1)} கிலோ அளிக்கிறீர்கள்).</>
                              ) : (
                                <>You can decrease <strong>{r.name}</strong> by <strong>{Math.abs(diffKg).toFixed(1)} kg</strong> today (give <strong>{neededKg.toFixed(1)} kg total</strong>, currently giving {userKg.toFixed(1)} kg).</>
                              )}
                            </span>
                          </div>
                        );
                      })}

                      {/* Covered: All okay */}
                      {covered.map((r, i) => {
                        const userKg = r.userProvidedKg !== undefined ? Number(r.userProvidedKg) : (Number(selectedFeeds?.find(f => f.name?.toLowerCase() === r.name?.toLowerCase())?.quantityKg) || 0);
                        return (
                          <div key={`cov-${i}`} className="today-advice-item covered-item" style={{
                            background: '#ffffff',
                            border: '1.5px solid #86efac',
                            borderRadius: '10px',
                            padding: '8px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <span className="today-advice-badge covered-badge" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 900, padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                              {currentLang === 'ta' ? 'சரியான அளவு' : 'ALL OKAY'}
                            </span>
                            <span className="today-advice-text" style={{ fontSize: '0.875rem', color: '#334155' }}>
                              {currentLang === 'ta' ? (
                                <><strong>{translateFeed(r.name, currentLang)}</strong> சரியான அளவில் உள்ளது ({userKg.toFixed(1)} கிலோ). இதே அளவைத் தொடரவும்.</>
                              ) : (
                                <><strong>{r.name}</strong> is just right ({userKg.toFixed(1)} kg). Keep giving this exact amount today.</>
                              )}
                            </span>
                          </div>
                        );
                      })}

                      {/* Water and minerals note in simple language */}
                      <div className="today-advice-item today-advice-water" style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '16px',
                        fontSize: '0.85rem',
                        color: '#475569'
                      }}>
                        <div>
                          <Droplets size={14} color="#0284c7" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                          <strong>{currentLang === 'ta' ? 'குடிநீர்:' : 'Water:'}</strong> {currentLang === 'ta' ? <>இன்று குறைந்தது <strong>{waterVolume || 200} லிட்டர்</strong> சுத்தமான குடிநீர் வழங்கவும்.</> : <>Provide at least <strong>{waterVolume || 200} Litres</strong> of fresh clean drinking water today.</>}
                        </div>
                        <div>
                          <strong>{currentLang === 'ta' ? 'தாது உப்பு & உப்பு:' : 'Minerals & Salt:'}</strong> {currentLang === 'ta' ? <>இன்றைய தீவனத்தில் <strong>{calcResult.practicalFeedingReport?.mineralMixtureGrams || 250} கிராம்</strong> தாது உப்புக் கலவை + <strong>{calcResult.practicalFeedingReport?.saltGrams || 150} கிராம்</strong> உப்பு சேர்த்து வழங்கவும்.</> : <>Add <strong>{calcResult.practicalFeedingReport?.mineralMixtureGrams || 250}g</strong> mineral mixture + <strong>{calcResult.practicalFeedingReport?.saltGrams || 150}g</strong> salt to today's ration.</>}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* MOBILE FEED CARDS VIEW */}
              <div className="mobile-feed-cards" style={{ display: 'none', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {calcResult.practicalFeedingReport?.todayRecommendations?.map((rec, i) => {
                  const userKg = rec.userProvidedKg !== undefined 
                    ? Number(rec.userProvidedKg) 
                    : (Number(selectedFeeds?.find(f => f.name?.toLowerCase() === rec.name?.toLowerCase())?.quantityKg) || 0);
                  const neededKg = Number(rec.recommendedKg) || 0;
                  const diffKg = rec.differenceKg !== undefined ? Number(rec.differenceKg) : Math.round((neededKg - userKg) * 10) / 10;
                  const isShortage = diffKg > 0.5;
                  const isSurplus = diffKg < -0.5;

                  return (
                    <div key={`m-feed-${i}`} style={{
                      background: '#ffffff',
                      border: isShortage ? '1.5px solid #fca5a5' : isSurplus ? '1.5px solid #bfdbfe' : '1.5px solid #86efac',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>{translateFeed(stripEmojis(rec.name), currentLang)}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{translateCategory(rec.category, currentLang)} • {rec.dmPct}% {currentLang === 'ta' ? 'உலர்சத்து' : 'DM'}</span>
                        </div>
                        {isShortage ? (
                          <span style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', padding: '3px 8px', borderRadius: '12px', fontWeight: 800, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                            +{diffKg.toFixed(1)} {currentLang === 'ta' ? 'கிலோ தேவை' : 'kg needed'}
                          </span>
                        ) : isSurplus ? (
                          <span style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #93c5fd', padding: '3px 8px', borderRadius: '12px', fontWeight: 800, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                            {Math.abs(diffKg).toFixed(1)} {currentLang === 'ta' ? 'கிலோ உபரி' : 'kg surplus'}
                          </span>
                        ) : (
                          <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '12px', fontWeight: 800, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                            {currentLang === 'ta' ? 'சரியான அளவு' : 'Covered'}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                        <div>
                          <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>{currentLang === 'ta' ? 'நீங்கள் அளிப்பது:' : 'You entered:'}</span>
                          <strong style={{ color: '#1e293b' }}>{userKg > 0 ? `${userKg.toFixed(1)} ${currentLang === 'ta' ? 'கிலோ/நாள்' : 'kg/day'}` : (currentLang === 'ta' ? '0.0 கிலோ/நாள்' : '0.0 kg/day')}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#15803d', fontSize: '0.72rem', display: 'block' }}>{currentLang === 'ta' ? 'மந்தைக்குத் தேவை:' : 'Herd needs:'}</span>
                          <strong style={{ color: '#15803d', fontSize: '0.85rem' }}>{neededKg.toFixed(1)} {currentLang === 'ta' ? 'கிலோ/நாள்' : 'kg/day'}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Mobile Total Fresh Feed Summary */}
                {(() => {
                  const totalUserProvidedKg = calcResult.practicalFeedingReport?.totalUserProvidedFeedKg ?? 
                    (selectedFeeds || []).reduce((acc, f) => acc + (Number(f.quantityKg) || 0), 0);
                  const totalFreshNeededKg = Number(calcResult.practicalFeedingReport?.totalTroughFreshFeedKg || calcResult.practicalFeedingReport?.totalFreshFeedKg) || 0;
                  const totalHerdDiffKg = calcResult.practicalFeedingReport?.totalFeedDifferenceKg ?? Math.round((totalFreshNeededKg - totalUserProvidedKg) * 10) / 10;
                  return (
                    <div style={{
                      background: '#f0fdf4',
                      border: '2px solid #86efac',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <strong style={{ color: '#166534', fontSize: '0.9rem' }}>
                        {currentLang === 'ta' ? 'இன்று தொட்டியில் கலந்து வைக்க வேண்டிய மொத்த தீவனம்:' : 'Total Fresh Trough Feed Today:'}
                      </strong>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                        <span style={{ color: '#475569' }}>{currentLang === 'ta' ? 'மந்தையின் மொத்தத் தேவை:' : 'Total Herd Needs:'}</span>
                        <strong style={{ color: '#166534', fontSize: '1rem' }}>{totalFreshNeededKg.toFixed(1)} {currentLang === 'ta' ? 'கிலோ/நாள்' : 'kg/day'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                        <span style={{ color: '#475569' }}>{currentLang === 'ta' ? 'நீங்கள் அளித்த மொத்த அளவு:' : 'Total You Provided:'}</span>
                        <strong style={{ color: '#1e293b' }}>{totalUserProvidedKg.toFixed(1)} {currentLang === 'ta' ? 'கிலோ/நாள்' : 'kg/day'}</strong>
                      </div>
                      <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                        <span style={{ color: '#475569' }}>{currentLang === 'ta' ? 'நடவடிக்கை:' : 'Action:'}</span>
                        <strong style={{ color: totalHerdDiffKg > 0.5 ? '#dc2626' : '#15803d' }}>
                          {totalHerdDiffKg > 0.5 
                            ? (currentLang === 'ta' ? `+${totalHerdDiffKg.toFixed(1)} கிலோ கூடுதலாகத் தேவை` : `+${totalHerdDiffKg.toFixed(1)} kg extra needed`) 
                            : (currentLang === 'ta' ? 'சமநிலையில் உள்ளது' : 'Balanced & Covered')}
                        </strong>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 5-COLUMN PRACTICAL COMPARISON TABLE (SHOWN ON DESKTOP & TABLETS) */}
              <div className="desktop-feed-table responsive-table-container horizontal-scroll">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '12px 14px' }}>{currentLang === 'ta' ? 'தீவனப் பொருள்' : 'Feed Ingredient'}</th>
                      <th style={{ padding: '12px 14px' }}>{currentLang === 'ta' ? 'தீவன வகை' : 'Feed Type'}</th>
                      <th style={{ padding: '12px 14px', background: '#f1f5f9', color: '#1e293b' }}>{currentLang === 'ta' ? 'நீங்கள் இடும் தீவனம் (உள்ளீடு)' : 'What You Put (Input)'}</th>
                      <th style={{ padding: '12px 14px', background: '#f0fdf4', color: '#166534' }}>{currentLang === 'ta' ? 'மந்தைக்குத் தேவையான பரிந்துரை' : 'What Herd Needs (Recommendation)'}</th>
                      <th style={{ padding: '12px 14px' }}>{currentLang === 'ta' ? 'பற்றாக்குறை / கூடுதல் தேவை' : 'Shortage / Extra Feed You Need'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calcResult.practicalFeedingReport?.todayRecommendations?.map((rec, i) => {
                      const userKg = rec.userProvidedKg !== undefined 
                        ? Number(rec.userProvidedKg) 
                        : (Number(selectedFeeds?.find(f => f.name?.toLowerCase() === rec.name?.toLowerCase())?.quantityKg) || 0);
                      const neededKg = Number(rec.recommendedKg) || 0;
                      const diffKg = rec.differenceKg !== undefined ? Number(rec.differenceKg) : Math.round((neededKg - userKg) * 10) / 10;
                      
                      const isShortage = diffKg > 0.5;
                      const isSurplus = diffKg < -0.5;

                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                            {translateFeed(stripEmojis(rec.name), currentLang)}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.825rem' }}>
                            {translateCategory(rec.category, currentLang)} ({rec.dmPct}% {currentLang === 'ta' ? 'உலர்சத்து' : 'DM'})
                          </td>
                          <td style={{ padding: '12px 14px', color: '#0f172a', fontWeight: 800, background: '#f8fafc' }}>
                            {userKg > 0 ? `${userKg.toFixed(1)} ${currentLang === 'ta' ? 'கிலோ / நாள்' : 'kg / day'}` : (currentLang === 'ta' ? '0.0 கிலோ / நாள்' : '0.0 kg / day')}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#15803d', fontWeight: 800, background: '#f0fdf4' }}>
                            {neededKg.toFixed(1)} {currentLang === 'ta' ? 'கிலோ / நாள்' : 'kg / day'}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {isShortage ? (
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '5px',
                                background: diffKg > 10 ? '#fef2f2' : '#fffbeb', 
                                color: diffKg > 10 ? '#dc2626' : '#b45309', 
                                border: `1px solid ${diffKg > 10 ? '#fca5a5' : '#fde047'}`, 
                                padding: '4px 10px', 
                                borderRadius: '20px', 
                                fontWeight: 800,
                                fontSize: '0.825rem' 
                              }}>
                                +{diffKg.toFixed(1)} {currentLang === 'ta' ? 'கிலோ கூடுதலாகத் தேவை' : 'kg extra needed'}
                              </span>
                            ) : isSurplus ? (
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '5px',
                                background: '#eff6ff', 
                                color: '#2563eb', 
                                border: '1px solid #bfdbfe', 
                                padding: '4px 10px', 
                                borderRadius: '20px', 
                                fontWeight: 800,
                                fontSize: '0.825rem' 
                              }}>
                                {Math.abs(diffKg).toFixed(1)} {currentLang === 'ta' ? 'கிலோ உபரி' : 'kg surplus'}
                              </span>
                            ) : (
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '5px',
                                background: '#f0fdf4', 
                                color: '#16a34a', 
                                border: '1px solid #bbf7d0', 
                                padding: '4px 10px', 
                                borderRadius: '20px', 
                                fontWeight: 800,
                                fontSize: '0.825rem' 
                              }}>
                                {currentLang === 'ta' ? `சமநிலையில் உள்ளது (${neededKg.toFixed(1)} கிலோ)` : `Covered (${neededKg.toFixed(1)} kg)`}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Dedicated Pasture Grazing Row */}
                    {(() => {
                      const pInfo = calcResult.practicalFeedingReport?.pastureGrazing;
                      const pDm = Number(calcResult.practicalFeedingReport?.totalPastureDmKg || calcResult.practicalFeedingReport?.pastureDmSuppliedKg) || 0;
                      if (!pInfo && pDm <= 0) return null;
                      const pFresh = pInfo?.recommendedKg || Math.round((pDm / 0.22) * 10) / 10;
                      const pName = pInfo?.name || 'Pasture Grazing';
                      const displayName = pName.includes('Estimated') ? pName : `${pName} · Estimated`;

                      return (
                        <tr style={{ borderBottom: '1px solid #d1fae5', background: '#f0fdf4' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#065f46' }}>
                            {currentLang === 'ta' ? 'மேய்ச்சல் புல் (மதிப்பீடு)' : displayName}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#047857', fontSize: '0.825rem' }}>
                            {currentLang === 'ta' ? 'மேய்ச்சல் தீவனம் (22% உலர்சத்து · மதிப்பீடு)' : 'Grazing Forage (22% DM · Estimated)'}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#065f46', fontWeight: 800, background: '#ecfdf5' }}>
                            {currentLang === 'ta' ? 'மேய்ச்சல் அனுமதி · மதிப்பீடு' : 'Grazing Access · Estimated'}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#065f46', fontWeight: 800, background: '#d1fae5' }}>
                            {pFresh.toFixed(1)} {currentLang === 'ta' ? 'கிலோ / நாள்' : 'kg / day'} ({pDm.toFixed(2)} {currentLang === 'ta' ? 'கிலோ உலர்சத்து' : 'kg DM'})
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '5px',
                              background: '#ecfdf5', 
                              color: '#065f46', 
                              border: '1px solid #6ee7b7', 
                              padding: '4px 10px', 
                              borderRadius: '20px', 
                              fontWeight: 800,
                              fontSize: '0.825rem' 
                            }}>
                              {currentLang === 'ta' ? 'மேய்ச்சல் மூலம் பெறப்படுகிறது' : 'Covered by Grazing'}
                            </span>
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Total Fresh Herd Feed Row */}
                    {(() => {
                      const totalUserProvidedKg = calcResult.practicalFeedingReport?.totalUserProvidedFeedKg ?? 
                        (selectedFeeds || []).reduce((acc, f) => acc + (Number(f.quantityKg) || 0), 0);
                      const totalFreshNeededKg = Number(calcResult.practicalFeedingReport?.totalTroughFreshFeedKg || calcResult.practicalFeedingReport?.totalFreshFeedKg) || 0;
                      const troughDm = Number(calcResult.practicalFeedingReport?.totalTroughDmKg || calcResult.practicalFeedingReport?.recommendedFeedDmKg) || 0;
                      const totalHerdDiffKg = calcResult.practicalFeedingReport?.totalFeedDifferenceKg ?? Math.round((totalFreshNeededKg - totalUserProvidedKg) * 10) / 10;
                      
                      return (
                        <tr style={{ borderBottom: '1.5px solid #cbd5e1', background: '#f0fdf4' }}>
                          <td colSpan={2} style={{ padding: '14px', fontWeight: 800, color: '#166534', fontSize: '0.95rem' }}>
                            {currentLang === 'ta' 
                              ? `இன்று தொட்டியில் கலந்து வைக்க வேண்டிய மொத்த தீவனம் (உலர் சத்து: ${troughDm.toFixed(2)} கிலோ DMI):` 
                              : `Total Trough Fresh Feed To Mix Today (Harvested: ${troughDm.toFixed(2)} kg DM):`}
                          </td>
                          <td style={{ padding: '14px', color: '#1e293b', fontWeight: 900, fontSize: '0.95rem', background: '#e2e8f0' }}>
                            {totalUserProvidedKg.toFixed(1)} {currentLang === 'ta' ? 'கிலோ / நாள்' : 'kg / day'}
                          </td>
                          <td style={{ padding: '14px', color: '#166534', fontWeight: 900, fontSize: '1.05rem', background: '#dcfce7' }}>
                            {totalFreshNeededKg.toFixed(1)} {currentLang === 'ta' ? 'கிலோ / நாள்' : 'kg / day'}
                          </td>
                          <td style={{ padding: '14px' }}>
                            {totalHerdDiffKg > 0.5 ? (
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '5px',
                                background: '#fee2e2', 
                                color: '#b91c1c', 
                                border: '1px solid #f87171', 
                                padding: '5px 12px', 
                                borderRadius: '20px', 
                                fontWeight: 900,
                                fontSize: '0.85rem' 
                              }}>
                                +{totalHerdDiffKg.toFixed(1)} {currentLang === 'ta' ? 'கிலோ கூடுதல் தீவனம் தேவை / நாள்' : 'kg extra feed needed / day'}
                              </span>
                            ) : totalHerdDiffKg < -0.5 ? (
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '5px',
                                background: '#dbeafe', 
                                color: '#1d4ed8', 
                                border: '1px solid #93c5fd', 
                                padding: '5px 12px', 
                                borderRadius: '20px', 
                                fontWeight: 900,
                                fontSize: '0.85rem' 
                              }}>
                                {Math.abs(totalHerdDiffKg).toFixed(1)} {currentLang === 'ta' ? 'கிலோ உபரி' : 'kg surplus'}
                              </span>
                            ) : (
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '5px',
                                background: '#dcfce7', 
                                color: '#15803d', 
                                border: '1px solid #86efac', 
                                padding: '5px 12px', 
                                borderRadius: '20px', 
                                fontWeight: 900,
                                fontSize: '0.85rem' 
                              }}>
                                {currentLang === 'ta' ? '100% முழுமையாக நிறைவடைந்தது' : '100% Fully covered'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Total Herd DMI Balance Row */}
                    {(() => {
                      const recDmiTotal = Number(calcResult.practicalFeedingReport?.totalHerdDmiSuppliedKg || calcResult.practicalFeedingReport?.recommendedTotalDmKg) || 0;
                      const reqDmiTotal = Number(calcResult.practicalFeedingReport?.totalEstimatedDmiReqKg || calcResult.nutritionAnalysis?.dmiRequiredKg) || 0;
                      const currentTotalDm = Number(
                        calcResult.practicalFeedingReport?.totalCurrentDmIngestedKg ||
                        ((calcResult.practicalFeedingReport?.currentFeedDmKg || 0) + (calcResult.practicalFeedingReport?.totalPastureDmKg || 0))
                      ) || (calcResult.practicalFeedingReport?.currentFeedDmKg || 0);

                      if (recDmiTotal <= 0 && reqDmiTotal <= 0) return null;

                      const dmiRatio = reqDmiTotal > 0 ? (recDmiTotal / reqDmiTotal) : 1.0;
                      const isBalanced = dmiRatio >= 0.95 && dmiRatio <= 1.05;
                      const isDeficient = dmiRatio < 0.95;
                      const shortfall = (reqDmiTotal - recDmiTotal).toFixed(1);
                      const surplus = (recDmiTotal - reqDmiTotal).toFixed(1);

                      return (
                        <tr style={{ 
                          borderBottom: isDeficient ? '2px solid #ef4444' : '2px solid #059669', 
                          background: isDeficient ? '#fef2f2' : '#ecfdf5' 
                        }}>
                          <td colSpan={2} style={{ padding: '14px', fontWeight: 900, color: isDeficient ? '#991b1b' : '#065f46', fontSize: '0.95rem' }}>
                            {currentLang === 'ta' ? 'மந்தையின் மொத்த உலர் சத்து உட்கொள்ளல் (தொட்டி + மேய்ச்சல்):' : 'Total Herd Dry Matter Intake (Trough + Grazing):'}
                          </td>
                          <td style={{ padding: '14px', color: '#1e293b', fontWeight: 900, fontSize: '0.95rem', background: '#e2e8f0' }}>
                            <div>{currentTotalDm.toFixed(2)} {currentLang === 'ta' ? 'கிலோ உலர்சத்து / நாள்' : 'kg DM / day'}</div>
                            {Number(calcResult.practicalFeedingReport?.totalPastureDmKg || 0) > 0 && (
                              <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
                                {currentLang === 'ta' 
                                  ? `தொட்டி: ${Number(calcResult.practicalFeedingReport?.currentFeedDmKg || 0).toFixed(1)}கிலோ + மேய்ச்சல்: ${Number(calcResult.practicalFeedingReport?.totalPastureDmKg || 0).toFixed(1)}கிலோ (மதிப்பீடு)` 
                                  : `Trough: ${Number(calcResult.practicalFeedingReport?.currentFeedDmKg || 0).toFixed(1)}kg + Grazing: ${Number(calcResult.practicalFeedingReport?.totalPastureDmKg || 0).toFixed(1)}kg (Est.)`}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '14px', color: isDeficient ? '#991b1b' : '#065f46', fontWeight: 900, fontSize: '1.05rem', background: isDeficient ? '#fee2e2' : '#d1fae5' }}>
                            {recDmiTotal.toFixed(2)} {currentLang === 'ta' ? 'கிலோ உலர்சத்து / நாள்' : 'kg DM / day'}
                          </td>
                          <td style={{ padding: '14px' }}>
                            {isBalanced ? (
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '5px',
                                background: '#d1fae5', 
                                color: '#065f46', 
                                border: '1px solid #6ee7b7', 
                                padding: '5px 12px', 
                                borderRadius: '20px', 
                                fontWeight: 900,
                                fontSize: '0.85rem' 
                              }}>
                                {currentLang === 'ta' ? `DMI இலக்கு எட்டப்பட்டது (${recDmiTotal.toFixed(1)} / ${reqDmiTotal.toFixed(1)} கிலோ DM)` : `DMI Target Met (${recDmiTotal.toFixed(1)} / ${reqDmiTotal.toFixed(1)} kg DM)`}
                              </span>
                            ) : isDeficient ? (
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '5px',
                                background: '#fee2e2', 
                                color: '#991b1b', 
                                border: '1px solid #fca5a5', 
                                padding: '5px 12px', 
                                borderRadius: '20px', 
                                fontWeight: 900,
                                fontSize: '0.85rem' 
                              }}>
                                {currentLang === 'ta' ? `பற்றாக்குறை (-${shortfall} கிலோ DM / முழுமையற்றது)` : `Deficient (-${shortfall} kg DM / Incomplete)`}
                              </span>
                            ) : (
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '5px',
                                background: '#fef3c7', 
                                color: '#92400e', 
                                border: '1px solid #fcd34d', 
                                padding: '5px 12px', 
                                borderRadius: '20px', 
                                fontWeight: 900,
                                fontSize: '0.85rem' 
                              }}>
                                {currentLang === 'ta' ? `உபரி (+${surplus} கிலோ DM கூடுதல்)` : `Surplus (+${surplus} kg DM excess)`}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })()}


                    {/* Minerals, Salt, and Water rows */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{currentLang === 'ta' ? 'தாது உப்புக் கலவை (DCP / Calcite)' : 'Mineral mixture (DCP / Calcite)'}</td>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.825rem' }}>{currentLang === 'ta' ? 'மேக்ரோ / மைக்ரோ தாதுக்கள்' : 'Macro/Micro minerals'}</td>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontWeight: 700, background: '#f8fafc' }}>{currentLang === 'ta' ? '0 கிராம் / நாள்' : '0 grams / day'}</td>
                      <td style={{ padding: '10px 14px', color: '#15803d', fontWeight: 800, background: '#f0fdf4' }}>
                        {calcResult.practicalFeedingReport?.mineralMixtureGrams || 250} {currentLang === 'ta' ? 'கிராம் / நாள்' : 'grams / day'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde047', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                          +{calcResult.practicalFeedingReport?.mineralMixtureGrams || 250} {currentLang === 'ta' ? 'கி தேவை' : 'g needed'}
                        </span>
                      </td>
                    </tr>

                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{currentLang === 'ta' ? 'அயோடைஸ்டு சாதாரண உப்பு' : 'Common Iodized Salt'}</td>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.825rem' }}>{currentLang === 'ta' ? 'எலக்ட்ரோலைட்டுகள் & அமில சமநிலை' : 'Electrolytes & buffer'}</td>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontWeight: 700, background: '#f8fafc' }}>{currentLang === 'ta' ? '0 கிராம் / நாள்' : '0 grams / day'}</td>
                      <td style={{ padding: '10px 14px', color: '#15803d', fontWeight: 800, background: '#f0fdf4' }}>
                        {calcResult.practicalFeedingReport?.saltGrams || 150} {currentLang === 'ta' ? 'கிராம் / நாள்' : 'grams / day'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde047', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                          +{calcResult.practicalFeedingReport?.saltGrams || 150} {currentLang === 'ta' ? 'கி தேவை' : 'g needed'}
                        </span>
                      </td>
                    </tr>

                    {(() => {
                      const waterReq = Math.round(Number(calcResult.waterAnalysis?.requiredLiters || calcResult.waterAnalysis?.waterRequiredLiters || calcResult.practicalFeedingReport?.waterLiters || 0));
                      const waterAvail = Math.round(Number(waterVolume) || 0);
                      const waterShortage = waterReq - waterAvail;
                      return (
                        <tr>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{currentLang === 'ta' ? 'சுத்தமான குடிநீர்' : 'Clean Drinking Water'}</td>
                          <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.825rem' }}>{currentLang === 'ta' ? 'தொட்டிகளில் தாராளமாக' : 'Ad-libitum in troughs'}</td>
                          <td style={{ padding: '10px 14px', color: '#0f172a', fontWeight: 700, background: '#f8fafc' }}>{waterAvail} {currentLang === 'ta' ? 'லிட்டர் / நாள்' : 'litres / day'}</td>
                          <td style={{ padding: '10px 14px', color: '#0284c7', fontWeight: 800, background: '#f0f9ff' }}>
                            {waterReq} {currentLang === 'ta' ? 'லிட்டர் / நாள்' : 'litres / day'}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            {waterShortage > 0 ? (
                              <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                                +{waterShortage} {currentLang === 'ta' ? 'லிட்டர் பற்றாக்குறை' : 'L shortage'}
                              </span>
                            ) : (
                              <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                                {currentLang === 'ta' ? 'போதுமானது' : 'Adequate'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Farmer Explanation Guide Note */}
              <div style={{
                padding: '12px 16px',
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '12px',
                marginBottom: '16px',
                fontSize: '0.825rem',
                color: '#166534',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <Info size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>{currentLang === 'ta' ? 'விவசாயிகளுக்கான எளிய வழிகாட்டி:' : 'Farmer Quick Understanding:'}</strong>
                  <ul style={{ margin: '4px 0 0', paddingLeft: '18px', lineHeight: 1.5 }}>
                    <li><strong>{currentLang === 'ta' ? 'நீங்கள் இடும் தீவனம் (உள்ளீடு):' : 'What You Put (Input):'}</strong> {currentLang === 'ta' ? 'தற்போது பண்ணையில் தினசரி நீங்கள் கொடுக்கும் அல்லது இருப்பு வைத்துள்ள தீவனம்.' : 'What you currently have or provide to the farm daily.'}</li>
                    <li><strong>{currentLang === 'ta' ? 'மந்தைக்குத் தேவையான பரிந்துரை:' : 'What Herd Needs (Recommendation):'}</strong> {currentLang === 'ta' ? 'உங்கள் ஒட்டுமொத்த மந்தைக்கும் இன்று தேவைப்படும் அறிவியல் பூர்வமான தீவன அளவு.' : 'The total scientifically calculated feed your whole herd needs today.'}</li>
                    <li><strong>{currentLang === 'ta' ? 'பற்றாக்குறை / கூடுதல் தேவை:' : 'Shortage / Extra Needed:'}</strong> {currentLang === 'ta' ? 'மாடுகளின் உடல் எடை குறையாமலும் பால் உற்பத்தி குறையாமலும் இருக்க இன்று கூடுதலாக அளிக்க வேண்டிய தீவனம்.' : 'The additional feed you need to bring or buy today so your cattle do not suffer health decline or milk drop.'}</li>
                  </ul>
                </div>
              </div>

              {/* Overall result banner & Final Safety Gate Checklist */}
              {(() => {
                const overall = calcResult.practicalFeedingReport?.overallResult || {};
                const safetyGate = calcResult.practicalFeedingReport?.safetyGate || {};
                const status = overall.status || 'Ration needs adjustment';
                const icon = overall.icon || 'warning';
                const isInfeasible = status.toLowerCase().includes('infeasible') || status.toLowerCase().includes('no feasible') || status.toLowerCase().includes('rejected');
                const isCompleteFail = status.toLowerCase().includes('incomplete') || isInfeasible;
                const isWellBalanced = status.toLowerCase().includes('well balanced');

                const bg = isWellBalanced ? '#f0fdf4' : isCompleteFail ? '#fef2f2' : '#fffbeb';
                const border = isWellBalanced ? '#86efac' : isCompleteFail ? '#fca5a5' : '#fde047';
                const textColor = isWellBalanced ? '#166534' : isCompleteFail ? '#991b1b' : '#854d0e';

                return (
                  <div style={{
                    padding: '18px 22px',
                    background: bg,
                    border: `1.5px solid ${border}`,
                    borderRadius: '14px',
                    marginBottom: '18px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Activity size={22} color={textColor} style={{ flexShrink: 0 }} />
                        <div>
                          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: textColor, opacity: 0.85, display: 'block' }}>
                            {currentLang === 'ta' ? 'அறிவியல் ஊட்டச்சத்து தீர்ப்பு' : 'Scientific Feeding Verdict'}
                          </span>
                          <strong style={{ fontSize: '1.15rem', color: textColor }}>
                            {currentLang === 'ta' ? translateTerm(status, currentLang) : status}
                          </strong>
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        background: isWellBalanced ? '#dcfce7' : isCompleteFail ? '#fee2e2' : '#fef3c7',
                        color: textColor,
                        border: `1px solid ${border}`
                      }}>
                        {isInfeasible ? (currentLang === 'ta' ? 'பாதுகாப்பு சோதனை: நிராகரிக்கப்பட்டது (INFEASIBLE)' : 'Safety Gate: REJECTED (INFEASIBLE)') : (safetyGate.passed ? (currentLang === 'ta' ? 'பாதுகாப்பு சோதனை: தேர்ச்சி (PASSED)' : 'Safety Gate: PASSED') : (currentLang === 'ta' ? 'பாதுகாப்பு சோதனை: சரிசெய்தல் தேவை' : 'Safety Gate: ADJUSTMENT NEEDED'))}
                      </span>
                    </div>

                    <div style={{ marginTop: '8px', borderTop: `1px solid ${border}`, paddingTop: '10px' }}>
                      <p style={{ fontSize: '0.86rem', color: textColor, margin: '0 0 6px', fontWeight: 800 }}>
                        {isWellBalanced ? (currentLang === 'ta' ? 'இந்த தீவன முறை ஏன் அங்கீகரிக்கப்பட்டது?' : 'Why is this ration approved?') : (currentLang === 'ta' ? 'கண்டறியப்பட்ட ஊட்டச்சத்து எச்சரிக்கைகள்:' : 'Identified Safety & Nutritional Flags:')}
                      </p>
                      {safetyGate.failureReasons && safetyGate.failureReasons.length > 0 ? (
                        <ul style={{ margin: '4px 0 10px', paddingLeft: '20px', fontSize: '0.84rem', color: textColor, lineHeight: 1.6 }}>
                          {safetyGate.failureReasons.map((reason, idx) => (
                            <li key={idx}><strong>{reason}</strong></li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ fontSize: '0.84rem', color: textColor, margin: '0 0 8px', lineHeight: 1.5 }}>
                          {overall.reason || (currentLang === 'ta' ? 'அனைத்து உடலியல் மற்றும் பாதுகாப்பு கட்டுப்பாடுகள் (DMI, ஆற்றல், புரதம், NDF, தாதுக்கள், மற்றும் குடிநீர்) சமநிலையில் உள்ளன.' : 'All physiological and safety constraints (DMI, Energy, Protein, NDF, Ca, P, and water) are balanced.')}
                        </p>
                      )}

                      {/* Safety Gate Checklist Grid */}
                      {safetyGate.checks && safetyGate.checks.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: textColor, display: 'block', marginBottom: '6px' }}>
                            {currentLang === 'ta' ? 'அறிக்கைக்கு முந்தைய பாதுகாப்பு சரிபார்ப்பு:' : 'PRE-REPORT SAFETY GATE VERIFICATION:'}
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '8px' }}>
                            {safetyGate.checks.map((chk, cIdx) => (
                              <div key={cIdx} style={{
                                background: chk.passed ? '#ffffff' : '#fff7ed',
                                border: `1px solid ${chk.passed ? '#bbf7d0' : '#fed7aa'}`,
                                borderRadius: '8px',
                                padding: '6px 10px',
                                fontSize: '0.78rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '6px'
                              }}>
                                <span style={{ color: '#1e293b', fontWeight: 700 }}>{chk.gate}</span>
                                <span style={{
                                  padding: '1px 6px',
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  background: chk.passed ? '#dcfce7' : '#fee2e2',
                                  color: chk.passed ? '#15803d' : '#b91c1c'
                                }}>
                                  {chk.passed ? (currentLang === 'ta' ? 'தேர்ச்சி' : 'PASSED') : (currentLang === 'ta' ? 'கவனிக்கவும்' : 'FLAGGED')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 3. CATEGORY-BY-CATEGORY PRACTICAL FEEDING CARDS */}
            {(() => {
              const hasAnyDryFodder = (selectedFeeds || []).some(f => {
                const cat = (f.category || '').toLowerCase();
                return (cat.includes('dry') || cat.includes('straw') || cat.includes('hay') || cat.includes('stover')) && Number(f.quantityKg) > 0;
              }) || [
                ...(calcResult?.practicalFeedingReport?.perCategory?.milkingCow?.animals || []),
                ...(calcResult?.practicalFeedingReport?.perCategory?.pregnantCattle?.animals || []),
                ...(calcResult?.practicalFeedingReport?.perCategory?.growingHeifer?.animals || []),
                ...(calcResult?.practicalFeedingReport?.perCategory?.dryCow?.animals || []),
                ...(calcResult?.practicalFeedingReport?.perCategory?.bull?.animals || [])
              ].some(a => (a.dryFodderKg || 0) > 0);

              const hasAnyConcentrate = (selectedFeeds || []).some(f => {
                const cat = (f.category || '').toLowerCase();
                const name = (f.name || '').toLowerCase();
                return (cat.includes('concentrate') || cat.includes('grain') || cat.includes('meal') || cat.includes('cake') || cat.includes('mash') || cat.includes('pellet') || cat.includes('chuni') || cat.includes('bran') || cat.includes('seed') || cat.includes('crushed') || name.includes('concentrate') || name.includes('cake') || name.includes('meal') || name.includes('grain') || name.includes('mash') || name.includes('bran') || name.includes('chuni')) && Number(f.quantityKg) > 0;
              }) || [
                ...(calcResult?.practicalFeedingReport?.perCategory?.milkingCow?.animals || []),
                ...(calcResult?.practicalFeedingReport?.perCategory?.pregnantCattle?.animals || []),
                ...(calcResult?.practicalFeedingReport?.perCategory?.growingHeifer?.animals || []),
                ...(calcResult?.practicalFeedingReport?.perCategory?.dryCow?.animals || []),
                ...(calcResult?.practicalFeedingReport?.perCategory?.bull?.animals || [])
              ].some(a => (a.concentrateKg || 0) > 0);

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '32px' }}>
                  
                  {/* 3.1 MILKING COW */}
                  {totalLactating > 0 && (
                    <div className="cattle-category-card" style={{ background: '#ffffff', border: '1.5px solid #bae6fd', borderRadius: '16px', padding: 'clamp(14px, 3vw, 24px)', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.04)', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
                      {/* Category Header with Reference Image */}
                      <div className="category-card-header">
                        <img 
                          src="/cattle_art/lactating.jpg" 
                          alt="Milking Cows" 
                          onError={(e) => { e.target.src = "/cattle_art/farm_summary.jpg"; }}
                          className="category-card-header-img"
                          style={{ border: '1.5px solid #bae6fd' }}
                        />
                        <div className="category-card-header-content">
                          <div className="category-card-title-row">
                            <h4 style={{ fontSize: '1.25rem', color: '#0369a1', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Milk size={22} color="#0284c7" />
                              <span>{currentLang === 'ta' ? `கறவை மாடுகள் (${totalLactating} மாடுகள்)` : currentLang === 'hi' ? `दुधारू गायें (${totalLactating} पशु)` : `Milking Cows (${totalLactating} Head)`}</span>
                            </h4>
                            <span style={{ fontSize: '0.825rem', color: '#0369a1', fontWeight: 700, background: '#e0f2fe', padding: '4px 12px', borderRadius: '20px' }}>
                              {currentLang === 'ta' ? `மொத்த பால்: ${totalDailyMilkL} லிட்டர்/நாள் • சராசரி எடை: ${Math.round(wtLactating / Math.max(1, totalLactating))} கிலோ` : currentLang === 'hi' ? `कुल दूध: ${totalDailyMilkL} लीटर/दिन • औसत वजन: ${Math.round(wtLactating / Math.max(1, totalLactating))} किग्रा` : `Total Milk: ${totalDailyMilkL} Litres/day • Avg Weight: ${Math.round(wtLactating / Math.max(1, totalLactating))} kg`}
                            </span>
                          </div>
                          <p className="cattle-reference-text" style={{ color: '#475569' }}>
                            <strong>{currentLang === 'ta' ? 'மாடு வளர்ப்பு வழிகாட்டி:' : currentLang === 'hi' ? 'पशु पोषण संदर्भ:' : 'Cattle Reference:'}</strong> {currentLang === 'ta' ? 'அதிக பால் தரும் கறவை மாடுகளுக்கு அவற்றின் உடல் எடை குறையாமல் சீரான பால் உற்பத்தியைத் தக்கவைக்க ஆற்றல் மற்றும் புறப்புரதம் நிறைந்த சரிவிகிதத் தீவனம் முன்னுரிமையாகத் தேவைப்படுகிறது.' : currentLang === 'hi' ? 'उच्च दुग्ध उत्पादक गायों को शरीर का वजन बनाए रखने और अधिकतम दूध उत्पादन के लिए ऊर्जा और बाईपास प्रोटीन युक्त संतुलित आहार की आवश्यकता होती है।' : 'High-producing dairy cows require prioritized feed energy and bypass protein to sustain peak milk yield without losing body condition.'}
                          </p>
                        </div>
                      </div>

                      {/* Simple Daily Guidelines */}
                      <div className="cattle-educational-note" style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '14px 16px', marginBottom: '18px' }}>
                        <div style={{ fontWeight: 800, color: '#0369a1', fontSize: '0.9rem', marginBottom: '6px' }}>
                          {currentLang === 'ta' ? 'கறவை மாடுகளுக்கான தீவன வழிகாட்டி (தினசரி எளிய விதிகள்):' : currentLang === 'hi' ? 'दुधारू गायों हेतु आहार नियम (सरल दैनिक निर्देश):' : 'Milking Cow Feeding Rules (Simple Daily Guide):'}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '8px', fontSize: '0.84rem', color: '#1e293b' }}>
                          {hasAnyConcentrate && (
                            <div>• <strong>{currentLang === 'ta' ? 'அடர்தீவன விதி:' : currentLang === 'hi' ? 'दाना नियम:' : 'Concentrate Rule:'}</strong> {currentLang === 'ta' ? 'ஒவ்வொரு 2 முதல் 2.5 லிட்டர் பால் உற்பத்திக்கும் 1 கிலோ அடர்தீவனம் அளிக்க வேண்டும்.' : currentLang === 'hi' ? 'प्रत्येक 2 से 2.5 लीटर दूध पर 1 किग्रा दाना मिश्रण दें।' : 'Feed 1 kg cattle feed for every 2 to 2.5 Litres of milk produced daily.'}</div>
                          )}
                          <div>• <strong>{currentLang === 'ta' ? 'பசுந்தீவனம்:' : currentLang === 'hi' ? 'हरा चारा:' : 'Green Fodder:'}</strong> {currentLang === 'ta' ? 'வைட்டமின்கள் மற்றும் தடையற்ற பால் சுரப்புக்கு தினமும் 20–25 கிலோ பசுந்தீவனம் அளிக்க வேண்டும்.' : currentLang === 'hi' ? 'विटामिन और निरंतर दूध प्रवाह हेतु 20-25 किग्रा ताजा हरा चारा दें।' : 'Give 20–25 kg fresh green fodder daily for vitamins and milk flow.'}</div>
                          {hasAnyDryFodder && (
                            <div>• <strong>{currentLang === 'ta' ? 'உலர் தீவனம்:' : currentLang === 'hi' ? 'सूखा चारा:' : 'Dry Straw / Hay:'}</strong> {currentLang === 'ta' ? 'அசைபோடுதலுக்கும் பாலின் கொழுப்புச் சத்துக்கும் (Fat) 3–5 கிலோ உலர் தீவனம் அளிக்க வேண்டும்.' : currentLang === 'hi' ? 'जुगाली और दूध फैट के लिए 3–5 किग्रा सूखा चारा दें।' : 'Feed 3–5 kg dry straw daily to support rumination and butterfat.'}</div>
                          )}
                          <div>• <strong>{currentLang === 'ta' ? 'சுத்தமான தண்ணீர்:' : currentLang === 'hi' ? 'स्वच्छ जल:' : 'Clean Water:'}</strong> {currentLang === 'ta' ? 'கறவை மாடுகளுக்கு தினமும் 70–90 லிட்டர் சுத்தமான தண்ணீர் தேவை. தண்ணீர் குறைந்தால் பால் உற்பத்தி குறையும்.' : currentLang === 'hi' ? 'दुधारू गायों को रोजाना 70-90 लीटर स्वच्छ जल दें।' : 'Milking cows need 70–90 Litres of fresh water daily. Lack of water drops milk.'}</div>
                          <div>• <strong>{currentLang === 'ta' ? 'தாதுக்கள் & உப்பு:' : currentLang === 'hi' ? 'खनिज व नमक:' : 'Minerals & Salt:'}</strong> {currentLang === 'ta' ? 'பால் காய்ச்சலைத் தவிர்க்க தினமும் 60–80 கிராம் தாது உப்புக் கலவை சேர்க்க வேண்டும்.' : currentLang === 'hi' ? 'मिल्क फीवर रोकथाम के लिए 60-80 ग्राम खनिज मिश्रण दें।' : 'Add 60–80 grams mineral mixture daily to prevent milk fever.'}</div>
                        </div>
                      </div>

                      {/* Individual Animal Table */}
                      {calcResult.practicalFeedingReport?.perCategory?.milkingCow?.animals?.length > 0 && (
                        <div className="responsive-table-container horizontal-scroll" style={{ marginBottom: '16px' }}>
                          <strong style={{ fontSize: '0.88rem', color: '#0369a1', display: 'block', marginBottom: '8px' }}>
                            {currentLang === 'ta' ? 'ஒவ்வொரு கறவை மாட்டுக்குமான தினசரி துல்லிய தீவன அளவு:' : currentLang === 'hi' ? 'प्रत्येक दुधारू गाय का दैनिक सटीक आहार आवंटन:' : 'Exact Daily Feeding for Each Individual Milking Cow:'}
                          </strong>
                          <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse', fontSize: '0.84rem', background: '#ffffff', border: '1px solid #bae6fd', borderRadius: '10px', overflow: 'hidden' }}>
                            <thead>
                              <tr style={{ background: '#f0f9ff', borderBottom: '2px solid #bae6fd', textAlign: 'left', color: '#0369a1' }}>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'மாடு' : currentLang === 'hi' ? 'पहचान' : 'Cattle'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'எடை' : currentLang === 'hi' ? 'वजन' : 'Weight'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'பருவம் & BCS' : currentLang === 'hi' ? 'अवस्था & BCS' : 'Lactation & BCS'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'பால் உற்பத்தி & இலக்கு' : currentLang === 'hi' ? 'दूध उत्पादन & लक्ष्य' : 'Milk Yield & Target'}</th>
                                <th style={{ padding: '10px 12px', color: '#15803d' }}>{currentLang === 'ta' ? 'பசுந்தீவனம்' : currentLang === 'hi' ? 'हरा चारा' : 'Green Fodder'}</th>
                                {hasAnyDryFodder && (
                                  <th style={{ padding: '10px 12px', color: '#b45309' }}>{currentLang === 'ta' ? 'உலர் தீவனம்' : currentLang === 'hi' ? 'सूखा चारा' : 'Dry Fodder'}</th>
                                )}
                                {hasAnyConcentrate && (
                                  <th style={{ padding: '10px 12px', color: '#0369a1' }}>{currentLang === 'ta' ? 'அடர்தீவனம்' : currentLang === 'hi' ? 'दाना मिश्रण' : 'Concentrate'}</th>
                                )}
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'தாது' : currentLang === 'hi' ? 'खनिज' : 'Min (g)'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'உப்பு' : currentLang === 'hi' ? 'नमक' : 'Salt (g)'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'குடிநீர்' : currentLang === 'hi' ? 'पानी' : 'Water (L)'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {calcResult.practicalFeedingReport?.perCategory?.milkingCow?.animals.map((cow, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #e0f2fe', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                  <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>
                                    <div>{stripEmojis(cow.title) || (currentLang === 'ta' ? `கறவை மாடு #${idx + 1}` : currentLang === 'hi' ? `गाय #${idx + 1}` : `Cow #${idx + 1}`)}</div>
                                    {cow.parity && (
                                      <span style={{
                                        background: cow.isFirstLactation ? '#e0f2fe' : '#f1f5f9',
                                        color: cow.isFirstLactation ? '#0369a1' : '#475569',
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        display: 'inline-block',
                                        marginTop: '2px'
                                      }}>
                                        {currentLang === 'ta' ? (cow.isFirstLactation ? '1வது ஈற்று' : '2+ ஈற்று') : currentLang === 'hi' ? (cow.isFirstLactation ? '1st ब्यात' : '2+ ब्यात') : cow.parity}
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 600 }}>
                                    {cow.weightKg} {currentLang === 'ta' ? 'கிலோ' : currentLang === 'hi' ? 'किग्रा' : 'kg'}
                                  </td>

                                  <td style={{ padding: '10px 12px', fontSize: '0.8rem' }}>
                                    <div style={{ fontWeight: 700, color: '#0369a1' }}>{translateTerm(cow.stage, currentLang) || (currentLang === 'ta' ? 'நடுப்பருவம்' : currentLang === 'hi' ? 'मध्य दुग्धकाल' : 'Mid lactation')}</div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                      <span style={{ 
                                        background: cow.bcs <= 2.5 ? '#fee2e2' : '#f1f5f9', 
                                        color: cow.bcs <= 2.5 ? '#b91c1c' : '#475569', 
                                        padding: '1px 6px', 
                                        borderRadius: '6px', 
                                        fontSize: '0.72rem', 
                                        fontWeight: 700 
                                      }}>
                                        BCS {cow.bcs ?? 3.0} {cow.bcs <= 2.5 ? (currentLang === 'ta' ? '(மெலிந்தது)' : currentLang === 'hi' ? '(कमजोर)' : '(Thin)') : ''}
                                      </span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                    <div>{cow.milkYieldL} {currentLang === 'ta' ? 'லி/நாள்' : currentLang === 'hi' ? 'ली/दिन' : 'L/day'} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>({cow.milkFatPct}% {currentLang === 'ta' ? 'கொழுப்பு' : currentLang === 'hi' ? 'फैट' : 'fat'})</span></div>
                                    {cow.targetMilkYieldL && (
                                      <div style={{ marginTop: '4px', fontSize: '0.74rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', fontWeight: 700 }}>
                                        {currentLang === 'ta' ? `இலக்கு: ${cow.targetMilkYieldL} லி` : currentLang === 'hi' ? `लक्ष्य: ${cow.targetMilkYieldL} ली` : `Target: ${cow.targetMilkYieldL} L/day`}
                                        {cow.potentialMilkGainL > 0 && <span style={{ color: '#15803d', marginLeft: '4px' }}>(+{cow.potentialMilkGainL} L)</span>}
                                      </div>
                                    )}
                                    {cow.projectedMilkFatRange && (
                                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                                        {currentLang === 'ta' ? `எதிர்பார்க்கப்படும் கொழுப்பு: ${cow.projectedMilkFatRange}` : currentLang === 'hi' ? `अनुमानित फैट: ${cow.projectedMilkFatRange}` : `Exp. Fat: ${cow.projectedMilkFatRange}`}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: cow.isFeasible === false ? '#b45309' : '#15803d', fontWeight: 800 }}>
                                    <div>{cow.greenFodderKg > 0 ? `${cow.greenFodderKg} ${currentLang === 'ta' ? 'கிலோ' : currentLang === 'hi' ? 'किग्रा' : 'kg'}${cow.isFeasible === false ? '*' : ''}` : (cow.isFeasible === false ? '—' : `0 ${currentLang === 'ta' ? 'கிலோ' : currentLang === 'hi' ? 'किग्रा' : 'kg'}`)}</div>
                                    {cow.isFeasible !== false && cow.greenFodderDetails && (
                                      <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600, marginTop: '2px' }}>
                                        {cow.greenFodderDetails}
                                      </div>
                                    )}
                                  </td>
                                  {hasAnyDryFodder && (
                                    <td style={{ padding: '10px 12px', color: cow.isFeasible === false ? '#b45309' : '#854d0e', fontWeight: 700 }}>
                                      <div>{cow.dryFodderKg > 0 ? `${cow.dryFodderKg} ${currentLang === 'ta' ? 'கிலோ' : currentLang === 'hi' ? 'किग्रा' : 'kg'}${cow.isFeasible === false ? '*' : ''}` : (cow.isFeasible === false ? '—' : `0 ${currentLang === 'ta' ? 'கிலோ' : currentLang === 'hi' ? 'किग्रा' : 'kg'}`)}</div>
                                      {cow.isFeasible !== false && cow.dryFodderDetails && (
                                        <div style={{ fontSize: '0.72rem', color: '#a16207', fontWeight: 500, marginTop: '2px' }}>
                                          {cow.dryFodderDetails}
                                        </div>
                                      )}
                                    </td>
                                  )}
                                  {hasAnyConcentrate && (
                                    <td style={{ padding: '10px 12px', color: cow.isFeasible === false ? '#b45309' : '#0284c7', fontWeight: 900 }}>
                                      <div>
                                        <span>{cow.concentrateKg > 0 ? `${cow.concentrateKg} ${currentLang === 'ta' ? 'கிலோ' : currentLang === 'hi' ? 'किग्रा' : 'kg'}${cow.isFeasible === false ? '*' : ''}` : (cow.isFeasible === false ? '—' : `0 ${currentLang === 'ta' ? 'கிலோ' : currentLang === 'hi' ? 'किग्रा' : 'kg'}`)}</span>
                                        {cow.concentrateDmPct > 0 && (
                                          <span style={{ 
                                            display: 'inline-block',
                                            marginLeft: '6px',
                                            fontSize: '0.72rem', 
                                            padding: '1px 6px', 
                                            borderRadius: '4px', 
                                            background: cow.concentrateDmPct > 40 ? '#fee2e2' : '#e0f2fe',
                                            color: cow.concentrateDmPct > 40 ? '#b91c1c' : '#0369a1',
                                            fontWeight: 700 
                                          }}>
                                            {cow.concentrateDmPct}% DMI ({currentLang === 'ta' ? 'அதிகபட்சம் 40%' : currentLang === 'hi' ? 'अधिकतम 40%' : 'Max safe 40%'})
                                          </span>
                                        )}
                                      </div>
                                      {cow.isFeasible !== false && cow.concentrateDetails && (
                                        <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600, marginTop: '2px' }}>
                                          {cow.concentrateDetails}
                                        </div>
                                      )}
                                    </td>
                                  )}
                                  <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>
                                    {cow.mineralMixtureG} {currentLang === 'ta' ? 'கி' : currentLang === 'hi' ? 'ग्रा' : 'g'}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>
                                    {cow.saltG || 40} {currentLang === 'ta' ? 'கி' : currentLang === 'hi' ? 'ग्रा' : 'g'}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                    {cow.waterLiters} {currentLang === 'ta' ? 'லி' : currentLang === 'hi' ? 'ली' : 'L'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px' }}>
                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>{currentLang === 'ta' ? 'சராசரியாக ஒரு மாட்டுக்கு:' : currentLang === 'hi' ? 'प्रति गाय औसत दैनिक खुराक:' : 'Average per Cow:'}</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem' }}>
                            {(() => {
                              const firstAnimMilk = calcResult.practicalFeedingReport?.perCategory?.milkingCow?.animals?.[0];
                              const feedIngMilk = firstAnimMilk?.feedIngredients || {};
                              const greenFeedsMilk = (selectedFeeds || []).filter(f => (f.category || '').toLowerCase().includes('green') || (f.category || '').toLowerCase().includes('fodder'));
                              const totalGreenMilk = calcResult.practicalFeedingReport?.perCategory?.milkingCow?.dailyFeeding?.greenFodderKg ?? 25;
                              const perFeedMilk = greenFeedsMilk.map(f => ({ name: f.name, qty: Number(feedIngMilk[f.name] || 0) })).filter(e => e.qty > 0);
                              return (
                                <div>
                                  <div style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>
                                    {currentLang === 'ta' ? 'பசுந்தீவனம்' : currentLang === 'hi' ? 'हरा चारा' : 'Green fodder'} — <strong style={{ color: '#15803d' }}>{totalGreenMilk} {currentLang === 'ta' ? 'கிலோ' : currentLang === 'hi' ? 'किग्रा' : 'kg'}</strong>
                                  </div>
                                  {perFeedMilk.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '8px', borderLeft: '2px solid #bbf7d0' }}>
                                      {perFeedMilk.map((e, ei) => (
                                        <div key={ei} style={{ fontSize: '0.75rem', color: '#166534' }}>
                                          • {translateFeed(e.name, currentLang)}: <strong>{e.qty.toFixed(1)} kg</strong>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div style={{ fontSize: '0.75rem', color: '#15803d', paddingLeft: '8px' }}>
                                      {greenFeedsMilk.map(f => translateFeed(f.name, currentLang)).join(', ')}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                            {hasAnyDryFodder && (
                              <div>
                                {currentLang === 'ta' ? 'உலர் தீவனம்' : currentLang === 'hi' ? 'सूखा चारा' : 'Dry fodder'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.milkingCow?.dailyFeeding?.dryFodderKg ?? 4} {currentLang === 'ta' ? 'கிலோ' : currentLang === 'hi' ? 'किग्रा' : 'kg'}</strong>
                                {(() => {
                                  const dryFeeds = (selectedFeeds || []).filter(f => (f.category || '').toLowerCase().includes('dry') || (f.category || '').toLowerCase().includes('straw'));
                                  if (dryFeeds.length > 0) {
                                    return (
                                      <span style={{ color: '#854d0e', fontSize: '0.76rem', marginLeft: '6px' }}>
                                        ({dryFeeds.map(f => translateFeed(f.name, currentLang)).join(', ')})
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            )}
                            {hasAnyConcentrate && (
                              <div>
                                {currentLang === 'ta' ? 'அடர்தீவனம்' : currentLang === 'hi' ? 'दाना मिश्रण' : 'Concentrate'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.milkingCow?.dailyFeeding?.concentrateKg ?? 5} {currentLang === 'ta' ? 'கிலோ' : currentLang === 'hi' ? 'किग्रा' : 'kg'}</strong>
                                {(() => {
                                  const concFeeds = (selectedFeeds || []).filter(f => (f.category || '').toLowerCase().includes('concentrate') || (f.category || '').toLowerCase().includes('mash'));
                                  if (concFeeds.length > 0) {
                                    return (
                                      <span style={{ color: '#0369a1', fontSize: '0.76rem', marginLeft: '6px' }}>
                                        ({concFeeds.map(f => translateFeed(f.name, currentLang)).join(', ')})
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            )}
                            <div>{currentLang === 'ta' ? 'தாது உப்புக் கலவை' : currentLang === 'hi' ? 'खनिज मिश्रण' : 'Mineral mixture'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.milkingCow?.dailyFeeding?.mineralMixtureG ?? 70} {currentLang === 'ta' ? 'கிராம்' : currentLang === 'hi' ? 'ग्राम' : 'g'}</strong></div>
                            <div>{currentLang === 'ta' ? 'குடிநீர்' : currentLang === 'hi' ? 'पेयजल' : 'Water'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.milkingCow?.dailyFeeding?.waterLiters ?? 75} {currentLang === 'ta' ? 'லிட்டர்' : currentLang === 'hi' ? 'लीटर' : 'L'}</strong></div>
                          </div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>{currentLang === 'ta' ? 'மந்தையின் ஊட்டச்சத்து சமநிலை:' : 'Herd Nutrition Balance:'}</strong>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.8rem' }}>
                            <div>{currentLang === 'ta' ? 'ஆற்றல் (Energy):' : 'Energy:'} <span style={{ fontWeight: 700, color: (calcResult.nutritionAnalysis?.energy?.status?.includes('Adequate') || calcResult.nutritionAnalysis?.energy?.status?.includes('Optimal')) ? '#15803d' : '#d97706' }}>{currentLang === 'ta' ? 'சரியானது' : (calcResult.nutritionAnalysis?.energy?.status?.split(' ')[0] || 'Adequate')}</span></div>
                            <div>{currentLang === 'ta' ? 'புரதம் (Protein):' : 'Protein:'} <span style={{ fontWeight: 700, color: (calcResult.nutritionAnalysis?.protein?.status?.includes('Adequate') || calcResult.nutritionAnalysis?.protein?.status?.includes('Optimal')) ? '#15803d' : '#d97706' }}>{currentLang === 'ta' ? 'சரியானது' : (calcResult.nutritionAnalysis?.protein?.status?.split(' ')[0] || 'Adequate')}</span></div>
                            <div>{currentLang === 'ta' ? 'நார்ச்சத்து (Fibre):' : 'Fibre:'} <span style={{ fontWeight: 700, color: (calcResult.nutritionAnalysis?.fibre?.status?.includes('Adequate') || calcResult.nutritionAnalysis?.fibre?.status?.includes('Optimal')) ? '#15803d' : '#d97706' }}>{currentLang === 'ta' ? 'சரியானது' : (calcResult.nutritionAnalysis?.fibre?.status?.split(' ')[0] || 'Adequate')}</span></div>
                            <div>{currentLang === 'ta' ? 'கால்சியம் (Ca):' : 'Calcium:'} <span style={{ fontWeight: 700, color: calcResult.mineralsAnalysis?.calcium?.status === 'Adequate' ? '#15803d' : '#d97706' }}>{currentLang === 'ta' ? 'சரியானது' : (calcResult.mineralsAnalysis?.calcium?.status || 'Adequate')}</span></div>
                            <div>{currentLang === 'ta' ? 'பாஸ்பரஸ் (P):' : 'Phosphorus:'} <span style={{ fontWeight: 700, color: calcResult.mineralsAnalysis?.phosphorus?.status === 'Adequate' ? '#15803d' : '#d97706' }}>{currentLang === 'ta' ? 'சரியானது' : (calcResult.mineralsAnalysis?.phosphorus?.status || 'Adequate')}</span></div>
                            <div>{currentLang === 'ta' ? 'உப்பு (Salt):' : 'Salt:'} <span style={{ fontWeight: 700, color: '#15803d' }}>{currentLang === 'ta' ? 'சரியானது' : 'Adequate'}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3.2 PREGNANT CATTLE */}
                  {totalPregnant > 0 && (
                    <div className="cattle-category-card" style={{ background: '#ffffff', border: '1.5px solid #fed7aa', borderRadius: '16px', padding: 'clamp(14px, 3vw, 24px)', boxShadow: '0 2px 8px rgba(194, 65, 12, 0.04)', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
                      {/* Category Header with Reference Image */}
                      <div className="category-card-header">
                        <img 
                          src="/cattle_art/pregnant.jpg" 
                          alt="Pregnant Cattle" 
                          onError={(e) => { e.target.src = "/cattle_art/farm_summary.jpg"; }}
                          className="category-card-header-img"
                          style={{ border: '1.5px solid #fed7aa' }}
                        />
                        <div className="category-card-header-content">
                          <div className="category-card-title-row">
                            <h4 style={{ fontSize: '1.25rem', color: '#c2410c', fontWeight: 900, margin: 0 }}>
                              {currentLang === 'ta' ? `சினை மாடுகள் (${totalPregnant} மாடுகள்: ${totalFirstTime} முதல் சினை, ${totalRepeat} மறு சினை)` : `Pregnant Cattle (${totalPregnant} Animals: ${totalFirstTime} First Pregnancy, ${totalRepeat} Repeat)`}
                            </h4>
                            <span style={{ fontSize: '0.825rem', color: '#c2410c', fontWeight: 700, background: '#fff7ed', padding: '4px 12px', borderRadius: '20px' }}>
                              {currentLang === 'ta' ? 'சினைப் பருவம்: 1–9 மாதங்கள்' : 'Gestation Stages: Months 1–9'}
                            </span>
                          </div>
                          <p className="cattle-reference-text" style={{ color: '#7c2d12' }}>
                            <strong>{currentLang === 'ta' ? 'மாடு வளர்ப்பு வழிகாட்டி:' : 'Cattle Reference:'}</strong> {currentLang === 'ta' ? 'கடைசி சினைப் பருவத்தில் (7-9 மாதங்கள்) கன்றின் வளர்ச்சி மற்றும் சீம்பால் உற்பத்திக்காக கூடுதல் சத்துணவு (Steaming up) அளிக்க வேண்டும். 1-6 மாதங்களில் பராமரிப்புத் தீவனம் போதுமானது.' : 'Late gestation (months 7–9) requires steaming up with energy concentrates to build calf birthweight and colostrum. Months 1–6 need maintenance-level forage.'}
                          </p>
                        </div>
                      </div>

                      {/* Individual Pregnant Animal Table */}
                      {calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.animals?.length > 0 && (
                        <div className="responsive-table-container horizontal-scroll" style={{ marginBottom: '16px' }}>
                          <strong style={{ fontSize: '0.88rem', color: '#c2410c', display: 'block', marginBottom: '8px' }}>
                            {currentLang === 'ta' ? 'ஒவ்வொரு சினை மாட்டுக்குமான தினசரி துல்லிய தீவன அளவு:' : 'Exact Daily Feeding for Each Pregnant Animal:'}
                          </strong>
                          <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse', fontSize: '0.84rem', background: '#ffffff', border: '1px solid #fed7aa', borderRadius: '10px', overflow: 'hidden' }}>
                            <thead>
                              <tr style={{ background: '#fffaf5', borderBottom: '2px solid #fed7aa', textAlign: 'left', color: '#c2410c' }}>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'மாடு' : 'Animal'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'வகை' : 'Type'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'எடை' : 'Weight'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'சினைப் பருவம் & கன்று வளர்ச்சி' : 'Gestation & Calf Projection'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'பசுந்தீவனம் (கிலோ)' : 'Green Fodder (kg)'}</th>
                                {hasAnyDryFodder && (
                                  <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'உலர் தீவனம் (கிலோ)' : 'Dry Fodder (kg)'}</th>
                                )}
                                {hasAnyConcentrate && (
                                  <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'அடர்தீவனம் (கிலோ)' : 'Concentrate (kg)'}</th>
                                )}
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'தாது உப்பு (கி)' : 'Mineral Mix (g)'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'உப்பு (கி)' : 'Salt (g)'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'குடிநீர் (லி)' : 'Water (L)'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.animals.map((cow, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #ffedd5', background: idx % 2 === 0 ? '#ffffff' : '#fffaf5' }}>
                                  <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>
                                    {stripEmojis(cow.title) || (currentLang === 'ta' ? `சினை மாடு #${idx + 1}` : `Pregnant #${idx + 1}`)}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#9a3412', fontWeight: 600 }}>
                                    {translateTerm(cow.type, currentLang) || cow.type}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#475569' }}>
                                    {cow.weightKg} {currentLang === 'ta' ? 'கிலோ' : 'kg'}
                                  </td>
                                  <td style={{ padding: '10px 12px' }}>
                                    <span style={{ 
                                      fontWeight: 800, 
                                      color: cow.pregMonth >= 8 ? '#b91c1c' : cow.pregMonth >= 6 ? '#c2410c' : '#15803d' 
                                    }}>
                                      {currentLang === 'ta' ? `${cow.pregMonth}-ம் மாதம்` : (cow.stage || `Month ${cow.pregMonth}`)}
                                    </span>
                                    {cow.pregMonth >= 8 ? (
                                      <span style={{ display: 'block', fontSize: '0.72rem', background: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: '6px', fontWeight: 700, marginTop: '2px', width: 'fit-content' }}>
                                        {currentLang === 'ta' ? `கூடுதல் சத்துணவு (${cow.pregMonth}-ம் மாதம்)` : `Steaming Up (Month ${cow.pregMonth})`}
                                      </span>
                                    ) : (
                                      <span style={{ display: 'block', fontSize: '0.72rem', background: '#f0fdf4', color: '#166534', padding: '1px 6px', borderRadius: '6px', fontWeight: 600, marginTop: '2px', width: 'fit-content' }}>
                                        {currentLang === 'ta' ? `${cow.pregMonth}-ம் மாதம்` : `Month ${cow.pregMonth}`}
                                      </span>
                                    )}
                                    <div style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: 600, marginTop: '3px' }}>
                                      {currentLang === 'ta' ? `எதிர்பார்க்கப்படும் கன்று பிறப்பு எடை: ~${cow.projectedCalfBirthWeightKg || 25} கிலோ` : `Projected calf birth wt: ~${cow.projectedCalfBirthWeightKg || 25} kg`}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#7c2d12', marginTop: '1px' }}>
                                      {currentLang === 'ta' ? `கருப்பை திசு வளர்ச்சி: ~${cow.fetalDailyGainG || cow.gravidUterineGainG || 180} கி/நாள்` : `Gravid uterine gain: ~${cow.fetalDailyGainG || cow.gravidUterineGainG || 180} g/day`}
                                    </div>
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#15803d', fontWeight: 800 }}>
                                    {cow.greenFodderKg} {currentLang === 'ta' ? 'கிலோ' : 'kg'}
                                  </td>
                                  {hasAnyDryFodder && (
                                    <td style={{ padding: '10px 12px', color: '#854d0e', fontWeight: 700 }}>
                                      {cow.dryFodderKg} {currentLang === 'ta' ? 'கிலோ' : 'kg'}
                                      {cow.dryFodderDetails && (
                                        <div style={{ fontSize: '0.72rem', color: '#a16207', fontWeight: 500, marginTop: '2px' }}>
                                          {cow.dryFodderDetails}
                                        </div>
                                      )}
                                    </td>
                                  )}
                                  {hasAnyConcentrate && (
                                    <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 900 }}>
                                      {cow.concentrateKg} {currentLang === 'ta' ? 'கிலோ' : 'kg'}
                                      {cow.concentrateDetails && (
                                        <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600, marginTop: '2px' }}>
                                          {cow.concentrateDetails}
                                        </div>
                                      )}
                                    </td>
                                  )}
                                  <td style={{ padding: '10px 12px', color: '#475569' }}>
                                    {cow.mineralMixtureG} {currentLang === 'ta' ? 'கி' : 'g'}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#475569' }}>
                                    {cow.saltG || 35} {currentLang === 'ta' ? 'கி' : 'g'}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                    {cow.waterLiters} {currentLang === 'ta' ? 'லி' : 'L'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px' }}>
                        <div style={{ background: '#fffaf5', padding: '14px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>{currentLang === 'ta' ? 'சராசரியாக ஒரு மாட்டுக்கு:' : 'Average per Animal:'}</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem' }}>
                            {(() => {
                              const firstAnimal = calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.animals?.[0];
                              const feedIng = firstAnimal?.feedIngredients || {};
                              const greenFeeds = (selectedFeeds || []).filter(f => (f.category || '').toLowerCase().includes('green') || (f.category || '').toLowerCase().includes('fodder'));
                              const totalGreen = calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.dailyFeeding?.greenFodderKg ?? 20;
                              const perFeedEntries = greenFeeds.map(f => ({ name: f.name, qty: Number(feedIng[f.name] || 0) })).filter(e => e.qty > 0);
                              return (
                                <div>
                                  <div style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>
                                    {currentLang === 'ta' ? 'பசுந்தீவனம்' : 'Green fodder'} — <strong style={{ color: '#15803d' }}>{totalGreen} {currentLang === 'ta' ? 'கிலோ' : 'kg'}</strong>
                                  </div>
                                  {perFeedEntries.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '8px', borderLeft: '2px solid #bbf7d0' }}>
                                      {perFeedEntries.map((e, ei) => (
                                        <div key={ei} style={{ fontSize: '0.75rem', color: '#166534' }}>
                                          • {translateFeed(e.name, currentLang)}: <strong>{e.qty.toFixed(1)} kg</strong>
                                        </div>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })()}
                            {hasAnyDryFodder && (
                              <div>{currentLang === 'ta' ? 'உலர் தீவனம்' : 'Dry fodder'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.dailyFeeding?.dryFodderKg ?? 4} {currentLang === 'ta' ? 'கிலோ' : 'kg'}</strong></div>
                            )}
                            {hasAnyConcentrate && (
                              <div>{currentLang === 'ta' ? 'அடர்தீவனம்' : 'Concentrate'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.dailyFeeding?.concentrateKg ?? 2.5} {currentLang === 'ta' ? 'கிலோ' : 'kg'}</strong></div>
                            )}
                            <div>{currentLang === 'ta' ? 'தாது உப்புக் கலவை' : 'Mineral mixture'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.dailyFeeding?.mineralMixtureG ?? 60} {currentLang === 'ta' ? 'கிராம்' : 'g'}</strong></div>
                            <div>{currentLang === 'ta' ? 'குடிநீர்' : 'Water'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.dailyFeeding?.waterLiters ?? 55} {currentLang === 'ta' ? 'லிட்டர்' : 'L'}</strong></div>
                          </div>
                        </div>

                        <div className="cattle-educational-note" style={{ background: '#fffaf5', padding: '14px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#9a3412', display: 'block', marginBottom: '6px' }}>{currentLang === 'ta' ? 'சினைப் பருவம் ஏன் முக்கியம்?' : 'Why Pregnancy Stage Matters:'}</strong>
                          <p style={{ fontSize: '0.8rem', color: '#7c2d12', margin: 0, lineHeight: 1.4 }}>
                            {currentLang === 'ta' ? '5 மாத சினை மாடுகளுக்கு நார்ச்சத்தும் பசுந்தீவனமும் போதுமானது. ஆனால் 9-வது மாதத்தில் கன்றின் அதிவேக வளர்ச்சி காரணமாக வயிற்றின் கொள்ளளவு குறைகிறது, எனவே செறிவூட்டப்பட்ட அடர்தீவனம் அளிக்க வேண்டும்.' : 'A cow that is 5 months pregnant has lower fetal requirements and needs mostly fiber/green fodder. A cow in month 9 has rapid calf growth and needs higher concentrate density (steaming up) because rumen capacity decreases.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3.3 GROWING HEIFER */}
                  {totalHeifers > 0 && (
                    <div className="cattle-category-card" style={{ background: '#ffffff', border: '1.5px solid #bbf7d0', borderRadius: '16px', padding: 'clamp(14px, 3vw, 24px)', boxShadow: '0 2px 8px rgba(21, 128, 61, 0.04)', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
                      {/* Category Header with Reference Image */}
                      <div className="category-card-header">
                        <img 
                          src="/cattle_art/heifers.jpg" 
                          alt="Growing Heifers" 
                          onError={(e) => { e.target.src = "/cattle_art/farm_summary.jpg"; }}
                          className="category-card-header-img"
                          style={{ border: '1.5px solid #bbf7d0' }}
                        />
                        <div className="category-card-header-content">
                          <div className="category-card-title-row">
                            <h4 style={{ fontSize: '1.25rem', color: '#15803d', fontWeight: 900, margin: 0 }}>
                              {currentLang === 'ta' ? `வளரும் கிடாரிகள் (${totalHeifers} மாடுகள்)` : `Growing Heifers (${totalHeifers} Head)`}
                            </h4>
                            <span style={{ fontSize: '0.825rem', color: '#15803d', fontWeight: 700, background: '#f0fdf4', padding: '4px 12px', borderRadius: '20px' }}>
                              {currentLang === 'ta' ? `இலக்கு வளர்ச்சி: +${calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.animals?.[0]?.dailyWeightGainG || 550} கி/நாள்` : `Target Gain: +${calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.animals?.[0]?.dailyWeightGainG || 550} g/day`}
                            </span>
                          </div>
                          <p className="cattle-reference-text" style={{ color: '#166534' }}>
                            <strong>{currentLang === 'ta' ? 'மாடு வளர்ப்பு வழிகாட்டி:' : 'Cattle Reference:'}</strong> {currentLang === 'ta' ? 'வளரும் கிடாரிகளுக்கு அதிக கொழுப்பு படியாமல் எலும்பு மற்றும் உடல் கட்டமைப்பு வளர்ச்சிக்கு சரிவிகித புரதமும் தாதுக்களும் தேவைப்படுகின்றன.' : 'Growing replacement heifers require balanced protein and minerals for skeletal frame growth without excess body fat deposition.'}
                          </p>
                        </div>
                      </div>

                      {/* Individual Heifer Table */}
                      {calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.animals?.length > 0 && (
                        <div className="responsive-table-container horizontal-scroll" style={{ marginBottom: '16px' }}>
                          <strong style={{ fontSize: '0.88rem', color: '#15803d', display: 'block', marginBottom: '8px' }}>
                            {currentLang === 'ta' ? 'ஒவ்வொரு கிடாரிக்குமான தினசரி துல்லிய தீவன அளவு:' : 'Exact Daily Feeding for Each Heifer:'}
                          </strong>
                          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '0.84rem', background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '10px', overflow: 'hidden' }}>
                            <thead>
                              <tr style={{ background: '#f0fdf4', borderBottom: '2px solid #bbf7d0', textAlign: 'left', color: '#15803d' }}>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'கிடாரி' : 'Heifer'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'எடை' : 'Weight'}</th>
                                <th style={{ padding: '10px 12px', color: '#15803d' }}>{currentLang === 'ta' ? 'எடை வளர்ச்சி & AI இலக்கு' : 'Frame Gain & AI Target'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'பசுந்தீவனம் (கிலோ)' : 'Green Fodder (kg)'}</th>
                                {hasAnyDryFodder && (
                                  <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'உலர் தீவனம் (கிலோ)' : 'Dry Fodder (kg)'}</th>
                                )}
                                {hasAnyConcentrate && (
                                  <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'அடர்தீவனம் (கிலோ)' : 'Concentrate (kg)'}</th>
                                )}
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'தாது உப்பு (கி)' : 'Mineral Mix (g)'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'உப்பு (கி)' : 'Salt (g)'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'குடிநீர் (லி)' : 'Water (L)'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.animals.map((h, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #dcfce7', background: idx % 2 === 0 ? '#ffffff' : '#f0fdf4' }}>
                                  <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>
                                    {stripEmojis(h.title) || (currentLang === 'ta' ? `கிடாரி #${idx + 1}` : `Heifer #${idx + 1}`)}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 600 }}>
                                    {h.weightKg} {currentLang === 'ta' ? 'கிலோ' : 'kg'}
                                  </td>
                                  <td style={{ padding: '10px 12px', fontSize: '0.8rem' }}>
                                    <div style={{ fontWeight: 800, color: '#15803d' }}>
                                      +{h.dailyWeightGainG || 550} {currentLang === 'ta' ? 'கி/நாள் வளர்ச்சி' : 'g/day frame gain'}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>
                                      {currentLang === 'ta' 
                                        ? `இனப்பெருக்க எடை: ~${h.targetBreedingWeightKg || 225} கிலோ (~${h.monthsToBreedingWeight || 2} மாதங்களில் AI)` 
                                        : `Target AI: ~${h.targetBreedingWeightKg || 225} kg (~${h.monthsToBreedingWeight || 2} mo to AI)`}
                                    </div>
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#15803d', fontWeight: 800 }}>
                                    {h.greenFodderKg} {currentLang === 'ta' ? 'கிலோ' : 'kg'}
                                  </td>
                                  {hasAnyDryFodder && (
                                    <td style={{ padding: '10px 12px', color: '#854d0e', fontWeight: 700 }}>
                                      {h.dryFodderKg} {currentLang === 'ta' ? 'கிலோ' : 'kg'}
                                      {h.dryFodderDetails && (
                                        <div style={{ fontSize: '0.72rem', color: '#a16207', fontWeight: 500, marginTop: '2px' }}>
                                          {h.dryFodderDetails}
                                        </div>
                                      )}
                                    </td>
                                  )}
                                  {hasAnyConcentrate && (
                                    <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                      {h.concentrateKg} {currentLang === 'ta' ? 'கிலோ' : 'kg'}
                                      {h.concentrateDetails && (
                                        <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600, marginTop: '2px' }}>
                                          {h.concentrateDetails}
                                        </div>
                                      )}
                                    </td>
                                  )}
                                  <td style={{ padding: '10px 12px', color: '#475569' }}>
                                    {h.mineralMixtureG} {currentLang === 'ta' ? 'கி' : 'g'}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#475569' }}>
                                    {h.saltG || 25} {currentLang === 'ta' ? 'கி' : 'g'}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                    {h.waterLiters} {currentLang === 'ta' ? 'லி' : 'L'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px' }}>
                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>{currentLang === 'ta' ? 'சராசரியாக ஒரு கிடாரிக்கு:' : 'Average per Heifer:'}</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem' }}>
                            {(() => {
                              const firstAnimal = calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.animals?.[0];
                              const feedIng = firstAnimal?.feedIngredients || {};
                              const greenFeeds = (selectedFeeds || []).filter(f => (f.category || '').toLowerCase().includes('green') || (f.category || '').toLowerCase().includes('fodder'));
                              const totalGreen = calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.dailyFeeding?.greenFodderKg ?? 15;
                              const perFeedEntries = greenFeeds.map(f => ({ name: f.name, qty: Number(feedIng[f.name] || 0) })).filter(e => e.qty > 0);
                              return (
                                <div>
                                  <div style={{ color: '#475569', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>
                                    {currentLang === 'ta' ? 'பசுந்தீவனம்' : 'Green fodder'} — <strong style={{ color: '#15803d' }}>{totalGreen} {currentLang === 'ta' ? 'கிலோ' : 'kg'}</strong>
                                  </div>
                                  {perFeedEntries.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '8px', borderLeft: '2px solid #bbf7d0' }}>
                                      {perFeedEntries.map((e, ei) => (
                                        <div key={ei} style={{ fontSize: '0.75rem', color: '#166534' }}>
                                          • {translateFeed(e.name, currentLang)}: <strong>{e.qty.toFixed(1)} kg</strong>
                                        </div>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })()}
                            {hasAnyDryFodder && (
                              <div>{currentLang === 'ta' ? 'உலர் தீவனம்' : 'Dry fodder'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.dailyFeeding?.dryFodderKg ?? 2.5} {currentLang === 'ta' ? 'கிலோ' : 'kg'}</strong></div>
                            )}
                            {hasAnyConcentrate && (
                              <div>{currentLang === 'ta' ? 'அடர்தீவனம்' : 'Concentrate'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.dailyFeeding?.concentrateKg ?? 1.5} {currentLang === 'ta' ? 'கிலோ' : 'kg'}</strong></div>
                            )}
                            <div>{currentLang === 'ta' ? 'தாது உப்புக் கலவை' : 'Mineral mixture'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.dailyFeeding?.mineralMixtureG ?? 35} {currentLang === 'ta' ? 'கிராம்' : 'g'}</strong></div>
                            <div>{currentLang === 'ta' ? 'குடிநீர்' : 'Water'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.dailyFeeding?.waterLiters ?? 30} {currentLang === 'ta' ? 'லிட்டர்' : 'L'}</strong></div>
                            <div style={{ color: '#15803d', fontWeight: 700, marginTop: '2px' }}>
                              {currentLang === 'ta' ? 'தினசரி எடை வளர்ச்சி:' : 'Projected Daily Gain:'} +{calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.animals?.[0]?.dailyWeightGainG || 550} {currentLang === 'ta' ? 'கி/நாள்' : 'g/day'}
                            </div>
                          </div>
                        </div>

                        <div className="cattle-educational-note" style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>{currentLang === 'ta' ? 'பராமரிப்பு வழிகாட்டுதல்:' : 'Result & Care:'}</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                            <div>• {currentLang === 'ta' ? 'சீராக தினமும் உடல் எடை வளர்ச்சியைப் பராமரிக்கவும்' : 'Maintain steady daily growth'}</div>
                            <div>• {currentLang === 'ta' ? 'அதிக அடர்தீவனம் கொடுத்து அளவுக்கு மீறி கொழுப்பு சேர்வதைத் தவிர்க்கவும்' : 'Avoid overfeeding heavy concentrates'}</div>
                            <div>• {currentLang === 'ta' ? 'தாது உப்புக் கலவையை தவறாமல் சேர்க்கவும்' : 'Check mineral mixture balance'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3.4 DRY COW */}
                  {totalDry > 0 && (
                    <div className="cattle-category-card" style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '16px', padding: 'clamp(14px, 3vw, 24px)', boxShadow: '0 2px 8px rgba(71, 85, 105, 0.04)', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
                      {/* Category Header with Reference Image */}
                      <div className="category-card-header">
                        <img 
                          src="/cattle_art/dry_cows.jpg" 
                          alt="Dry Cows" 
                          onError={(e) => { e.target.src = "/cattle_art/farm_summary.jpg"; }}
                          className="category-card-header-img"
                          style={{ border: '1.5px solid #cbd5e1' }}
                        />
                        <div className="category-card-header-content">
                          <div className="category-card-title-row">
                            <h4 style={{ fontSize: '1.25rem', color: '#334155', fontWeight: 900, margin: 0 }}>
                              {currentLang === 'ta' ? `வறண்ட மாடுகள் (${totalDry} மாடுகள்)` : `Dry Cows (${totalDry} Head)`}
                            </h4>
                            <span style={{ fontSize: '0.825rem', color: '#475569', fontWeight: 700, background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>
                              {currentLang === 'ta' ? 'வறண்ட காலம்: 45–60 நாட்கள்' : 'Dry Period: 45–60 Days'}
                            </span>
                          </div>
                          <p className="cattle-reference-text" style={{ color: '#475569' }}>
                            <strong>{currentLang === 'ta' ? 'மாடு வளர்ப்பு வழிகாட்டி:' : 'Cattle Reference:'}</strong> {currentLang === 'ta' ? 'மடி திசுக்களின் புத்துணர்ச்சி மற்றும் அடுத்த ஈத்துக்கு வயிற்றின் ஓய்வு காலம். அதிக நார்ச்சத்துள்ள தீவனம் அளித்து அடர்தீவன அளவைக் குறைக்க வேண்டும்.' : 'Mammary gland involution and rumen rest period before next calving. Feed mostly high fiber forage and restrict heavy concentrates.'}
                          </p>
                        </div>
                      </div>

                      {/* Individual Dry Cow Table */}
                      {calcResult.practicalFeedingReport?.perCategory?.dryCow?.animals?.length > 0 && (
                        <div className="responsive-table-container horizontal-scroll" style={{ marginBottom: '16px' }}>
                          <strong style={{ fontSize: '0.88rem', color: '#475569', display: 'block', marginBottom: '8px' }}>
                            {currentLang === 'ta' ? 'ஒவ்வொரு வறண்ட மாட்டுக்குமான தினசரி துல்லிய தீவன அளவு:' : 'Exact Daily Feeding for Each Dry Cow:'}
                          </strong>
                          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '0.84rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                            <thead>
                              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left', color: '#475569' }}>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'வறண்ட மாடு' : 'Dry Cow'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'எடை' : 'Weight'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'வறண்ட காலம்' : 'Dry Period'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'பசுந்தீவனம் (கிலோ)' : 'Green Fodder (kg)'}</th>
                                {hasAnyDryFodder && (
                                  <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'உலர் தீவனம் (கிலோ)' : 'Dry Fodder (kg)'}</th>
                                )}
                                {hasAnyConcentrate && (
                                  <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'அடர்தீவனம் (கிலோ)' : 'Concentrate (kg)'}</th>
                                )}
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'தாது உப்பு (கி)' : 'Mineral Mix (g)'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'உப்பு (கி)' : 'Salt (g)'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'குடிநீர் (லி)' : 'Water (L)'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {calcResult.practicalFeedingReport?.perCategory?.dryCow?.animals.map((d, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                  <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>
                                    {stripEmojis(d.title) || (currentLang === 'ta' ? `வறண்ட மாடு #${idx + 1}` : `Dry Cow #${idx + 1}`)}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 600 }}>
                                    <div>{d.weightKg} {currentLang === 'ta' ? 'கிலோ' : 'kg'}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 700, marginTop: '2px' }}>
                                      {currentLang === 'ta' ? `ஈத்துக்கு முன் எடை: ~${d.targetCalvingWeightKg || (d.weightKg + 25)} கிலோ` : `Near-calving: ~${d.targetCalvingWeightKg || (d.weightKg + 25)} kg`}
                                    </div>
                                  </td>
                                  <td style={{ padding: '10px 12px' }}>
                                    <span style={{ fontWeight: 700, color: '#475569' }}>
                                      {d.dryDays} {currentLang === 'ta' ? 'நாட்கள் வறட்சி' : 'days dry'}
                                    </span>
                                    <span style={{ 
                                      display: 'block', 
                                      fontSize: '0.72rem', 
                                      background: d.dryDays > 30 ? '#f1f5f9' : '#fef3c7', 
                                      color: d.dryDays > 30 ? '#475569' : '#b45309', 
                                      padding: '1px 6px', 
                                      borderRadius: '6px', 
                                      fontWeight: 700, 
                                      marginTop: '2px', 
                                      width: 'fit-content' 
                                    }}>
                                      {d.dryDays > 30 ? (currentLang === 'ta' ? 'தொடக்க ஓய்வு (வயிற்று ஓய்வு)' : 'Far-off (Rumen rest)') : (currentLang === 'ta' ? 'ஈத்துக்கு முந்தைய மாற்றம்' : 'Close-up (Transition)')}
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#15803d', fontWeight: 800 }}>
                                    {d.greenFodderKg} {currentLang === 'ta' ? 'கிலோ' : 'kg'}
                                  </td>
                                  {hasAnyDryFodder && (
                                    <td style={{ padding: '10px 12px', color: '#854d0e', fontWeight: 700 }}>
                                      {d.dryFodderKg} {currentLang === 'ta' ? 'கிலோ' : 'kg'}
                                      {d.dryFodderDetails && (
                                        <div style={{ fontSize: '0.72rem', color: '#a16207', fontWeight: 500, marginTop: '2px' }}>
                                          {d.dryFodderDetails}
                                        </div>
                                      )}
                                    </td>
                                  )}
                                  {hasAnyConcentrate && (
                                    <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                      {d.concentrateKg} {currentLang === 'ta' ? 'கிலோ' : 'kg'}
                                      {d.concentrateDetails && (
                                        <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600, marginTop: '2px' }}>
                                          {d.concentrateDetails}
                                        </div>
                                      )}
                                    </td>
                                  )}
                                  <td style={{ padding: '10px 12px', color: '#475569' }}>
                                    {d.mineralMixtureG} {currentLang === 'ta' ? 'கி' : 'g'}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#475569' }}>
                                    {d.saltG || 30} {currentLang === 'ta' ? 'கி' : 'g'}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                    {d.waterLiters} {currentLang === 'ta' ? 'லி' : 'L'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px' }}>
                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>{currentLang === 'ta' ? 'சராசரியாக ஒரு மாட்டுக்கு:' : 'Average per Cow:'}</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem' }}>
                            <div>{currentLang === 'ta' ? 'பசுந்தீவனம்' : 'Green fodder'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.dryCow?.dailyFeeding?.greenFodderKg ?? 20} {currentLang === 'ta' ? 'கிலோ' : 'kg'}</strong></div>
                            {hasAnyDryFodder && (
                              <div>{currentLang === 'ta' ? 'உலர் தீவனம்' : 'Dry fodder'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.dryCow?.dailyFeeding?.dryFodderKg ?? 4.5} {currentLang === 'ta' ? 'கிலோ' : 'kg'}</strong></div>
                            )}
                            {hasAnyConcentrate && (
                              <div>{currentLang === 'ta' ? 'அடர்தீவனம்' : 'Concentrate'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.dryCow?.dailyFeeding?.concentrateKg ?? 1.2} {currentLang === 'ta' ? 'கிலோ' : 'kg'}</strong></div>
                            )}
                            <div>{currentLang === 'ta' ? 'தாது உப்புக் கலவை' : 'Mineral mixture'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.dryCow?.dailyFeeding?.mineralMixtureG ?? 45} {currentLang === 'ta' ? 'கிராம்' : 'g'}</strong></div>
                            <div>{currentLang === 'ta' ? 'குடிநீர்' : 'Water'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.dryCow?.dailyFeeding?.waterLiters ?? 50} {currentLang === 'ta' ? 'லிட்டர்' : 'L'}</strong></div>
                          </div>
                        </div>

                        <div className="cattle-educational-note" style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>{currentLang === 'ta' ? 'நிலைமை:' : 'Status:'}</strong>
                          <p style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, margin: '0 0 6px' }}>
                            {currentLang === 'ta' ? 'பராமரிப்புத் தீவனம் தேவை' : 'Maintenance feeding required'}
                          </p>
                          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                            {currentLang === 'ta' ? 'கன்று ஈனும் போது ஏற்படும் வளர்சிதை மாற்றக் கோளாறுகளைத் தவிர்க்க வறண்ட காலத்தில் அதிக தானியங்கள் கொடுப்பதைத் தவிர்க்கவும்.' : 'Avoid excessive grains during dry period to prevent fat cow syndrome and metabolic disorders at calving.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3.5 BREEDING BULL */}
                  {totalBulls > 0 && (
                    <div className="cattle-category-card" style={{ background: '#ffffff', border: '1.5px solid #fca5a5', borderRadius: '16px', padding: 'clamp(14px, 3vw, 24px)', boxShadow: '0 2px 8px rgba(185, 28, 28, 0.04)', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
                      {/* Category Header with Reference Image */}
                      <div className="category-card-header">
                        <img 
                          src="/cattle_art/bulls.jpg" 
                          alt="Breeding Bulls" 
                          onError={(e) => { e.target.src = "/cattle_art/farm_summary.jpg"; }}
                          className="category-card-header-img"
                          style={{ border: '1.5px solid #fca5a5' }}
                        />
                        <div className="category-card-header-content">
                          <div className="category-card-title-row">
                            <h4 style={{ fontSize: '1.25rem', color: '#b91c1c', fontWeight: 900, margin: 0 }}>
                              {currentLang === 'ta' ? `காளைகள் & உழவு மாடுகள் (${totalBulls} மாடுகள்)` : `Breeding Bulls & Draught Cattle (${totalBulls} Head)`}
                            </h4>
                            <span style={{ fontSize: '0.825rem', color: '#b91c1c', fontWeight: 700, background: '#fef2f2', padding: '4px 12px', borderRadius: '20px' }}>
                              {currentLang === 'ta' ? 'அடிப்படை வளர்சிதை மாற்றம்: +10%' : 'Basal Metabolism: +10%'}
                            </span>
                          </div>
                          <p className="cattle-reference-text" style={{ color: '#7f1d1d' }}>
                            <strong>{currentLang === 'ta' ? 'மாடு வளர்ப்பு வழிகாட்டி:' : 'Cattle Reference:'}</strong> {currentLang === 'ta' ? 'இனப்பெருக்க காளைகள் மற்றும் வேலை செய்யும் மாடுகளுக்கு அதிக வளர்சிதை மாற்ற விகிதம் உள்ளது. இனப்பெருக்க சுறுசுறுப்பிற்காக சரிவிகித பசுந்தீவனத்துடன் மிதமான அடர்தீவனம் அளிக்க வேண்டும்.' : 'Breeding bulls and working oxen have higher basal metabolic rates. Feed balanced green roughage with moderate energy concentrate for reproductive vigor.'}
                          </p>
                        </div>
                      </div>

                      {/* Individual Bull Table */}
                      {calcResult.practicalFeedingReport?.perCategory?.bull?.animals?.length > 0 && (
                        <div className="responsive-table-container horizontal-scroll" style={{ marginBottom: '16px' }}>
                          <strong style={{ fontSize: '0.88rem', color: '#b91c1c', display: 'block', marginBottom: '8px' }}>
                            {currentLang === 'ta' ? 'ஒவ்வொரு காளைக்குமான தினசரி துல்லிய தீவன அளவு:' : 'Exact Daily Feeding for Each Bull:'}
                          </strong>
                          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '0.84rem', background: '#ffffff', border: '1px solid #fca5a5', borderRadius: '10px', overflow: 'hidden' }}>
                            <thead>
                              <tr style={{ background: '#fef2f2', borderBottom: '2px solid #fca5a5', textAlign: 'left', color: '#b91c1c' }}>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'காளை' : 'Bull'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'எடை' : 'Weight'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'பசுந்தீவனம் (கிலோ)' : 'Green Fodder (kg)'}</th>
                                {hasAnyDryFodder && (
                                  <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'உலர் தீவனம் (கிலோ)' : 'Dry Fodder (kg)'}</th>
                                )}
                                {hasAnyConcentrate && (
                                  <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'அடர்தீவனம் (கிலோ)' : 'Concentrate (kg)'}</th>
                                )}
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'தாது உப்பு (கி)' : 'Mineral Mix (g)'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'உப்பு (கி)' : 'Salt (g)'}</th>
                                <th style={{ padding: '10px 12px' }}>{currentLang === 'ta' ? 'குடிநீர் (லி)' : 'Water (L)'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {calcResult.practicalFeedingReport?.perCategory?.bull?.animals.map((b, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #fee2e2', background: idx % 2 === 0 ? '#ffffff' : '#fef2f2' }}>
                                  <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>
                                    {stripEmojis(b.title) || (currentLang === 'ta' ? `காளை #${idx + 1}` : `Bull #${idx + 1}`)}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 600 }}>
                                    {b.weightKg} {currentLang === 'ta' ? 'கிலோ' : 'kg'}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#15803d', fontWeight: 800 }}>
                                    {b.greenFodderKg} {currentLang === 'ta' ? 'கிலோ' : 'kg'}
                                  </td>
                                  {hasAnyDryFodder && (
                                    <td style={{ padding: '10px 12px', color: '#854d0e', fontWeight: 700 }}>
                                      {b.dryFodderKg} {currentLang === 'ta' ? 'கிலோ' : 'kg'}
                                      {b.dryFodderDetails && (
                                        <div style={{ fontSize: '0.72rem', color: '#a16207', fontWeight: 500, marginTop: '2px' }}>
                                          {b.dryFodderDetails}
                                        </div>
                                      )}
                                    </td>
                                  )}
                                  {hasAnyConcentrate && (
                                    <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                      {b.concentrateKg} {currentLang === 'ta' ? 'கிலோ' : 'kg'}
                                      {b.concentrateDetails && (
                                        <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600, marginTop: '2px' }}>
                                          {b.concentrateDetails}
                                        </div>
                                      )}
                                    </td>
                                  )}
                                  <td style={{ padding: '10px 12px', color: '#475569' }}>
                                    {b.mineralMixtureG} {currentLang === 'ta' ? 'கி' : 'g'}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#475569' }}>
                                    {b.saltG || 40} {currentLang === 'ta' ? 'கி' : 'g'}
                                  </td>
                                  <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                    {b.waterLiters} {currentLang === 'ta' ? 'லி' : 'L'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div style={{ background: '#fef2f2', padding: '14px', borderRadius: '12px', border: '1px solid #fca5a5' }}>
                        <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>{currentLang === 'ta' ? 'சராசரியாக ஒரு காளைக்கு:' : 'Average per Bull:'}</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.825rem' }}>
                          <div>{currentLang === 'ta' ? 'பசுந்தீவனம்' : 'Green fodder'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.bull?.dailyFeeding?.greenFodderKg ?? 25} {currentLang === 'ta' ? 'கிலோ' : 'kg'}</strong></div>
                          {hasAnyDryFodder && (
                            <div>{currentLang === 'ta' ? 'உலர் தீவனம்' : 'Dry fodder'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.bull?.dailyFeeding?.dryFodderKg ?? 5} {currentLang === 'ta' ? 'கிலோ' : 'kg'}</strong></div>
                          )}
                          {hasAnyConcentrate && (
                            <div>{currentLang === 'ta' ? 'அடர்தீவனம்' : 'Concentrate'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.bull?.dailyFeeding?.concentrateKg ?? 1.8} {currentLang === 'ta' ? 'கிலோ' : 'kg'}</strong></div>
                          )}
                          <div>{currentLang === 'ta' ? 'தாது உப்புக் கலவை' : 'Mineral mixture'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.bull?.dailyFeeding?.mineralMixtureG ?? 50} {currentLang === 'ta' ? 'கிராம்' : 'g'}</strong></div>
                          <div>{currentLang === 'ta' ? 'குடிநீர்' : 'Water'} — <strong>{calcResult.practicalFeedingReport?.perCategory?.bull?.dailyFeeding?.waterLiters ?? 65} {currentLang === 'ta' ? 'லிட்டர்' : 'L'}</strong></div>
                        </div>
                        <p className="cattle-educational-note" style={{ fontSize: '0.78rem', color: '#b91c1c', margin: '8px 0 0', fontWeight: 600 }}>
                          {currentLang === 'ta' ? '* கறவை மாடுகளுக்கு கொடுக்கும் அதிக அடர்தீவன அளவை காளைகளுக்கு அளிக்கக் கூடாது.' : '* The bull should not receive the same high-energy concentrate level as the lactating cow.'}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              );
            })()}

            {/* 4. WATER STATUS */}
            <div className="review-section-card" style={{ background: '#ffffff', border: '1.5px solid #bae6fd', borderRadius: '16px', padding: '24px', marginBottom: '28px', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.04)' }}>
              <h4 style={{ fontSize: '1.25rem', color: '#0369a1', fontWeight: 900, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Droplets size={22} color="#0284c7" />
                <span>{currentLang === 'ta' ? 'குடிநீர் இருப்பு & நீரேற்ற நிலை' : 'Water Status & Hydration'}</span>
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#0f172a', margin: '0 0 8px' }}>
                {currentLang === 'ta' ? (
                  <><strong>{waterVolume} லிட்டர்</strong> தண்ணீர் <strong>{totalCattleCount}</strong> மாடுகளுக்கு கிடைக்கிறது (சராசரி இருப்பு: <strong>{Math.round(waterVolume / Math.max(1, totalCattleCount))} லிட்டர்/மாடு/நாள்</strong>)</>
                ) : (
                  <><strong>{waterVolume} L</strong> water available for <strong>{totalCattleCount}</strong> cattle (Average availability: <strong>{Math.round(waterVolume / Math.max(1, totalCattleCount))} L/animal/day</strong>)</>
                )}
              </p>

              <div style={{
                padding: '12px 16px',
                background: calcResult.waterAnalysis?.waterBalanceLiters < 0 ? '#fef2f2' : '#f0fdf4',
                border: calcResult.waterAnalysis?.waterBalanceLiters < 0 ? '1.5px solid #fca5a5' : '1.5px solid #86efac',
                borderRadius: '12px',
                marginTop: '8px'
              }}>
                <strong style={{ fontSize: '0.95rem', color: calcResult.waterAnalysis?.waterBalanceLiters < 0 ? '#b91c1c' : '#15803d', display: 'block', marginBottom: '4px' }}>
                  {currentLang === 'ta' ? translateTerm(calcResult.practicalFeedingReport?.waterStatus?.status, currentLang) : (calcResult.practicalFeedingReport?.waterStatus?.status || 'Water availability status')}
                </strong>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                  {currentLang === 'ta' ? 'கிடைக்கும் தண்ணீர்:' : 'Available:'} <strong>{waterVolume} {currentLang === 'ta' ? 'லி/நாள்' : 'L/day'}</strong> • {currentLang === 'ta' ? 'கணக்கிடப்பட்ட மந்தை தேவை:' : 'Calculated herd requirement:'} <strong>{calcResult.waterAnalysis?.waterRequiredLiters} {currentLang === 'ta' ? 'லி/நாள்' : 'L/day'}</strong>
                </div>
                {calcResult.waterAnalysis?.waterBalanceLiters < 0 && (
                  <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#dc2626', fontWeight: 800 }}>
                    {currentLang === 'ta' ? 'பற்றாக்குறை:' : 'Shortage:'} {Math.abs(calcResult.waterAnalysis?.waterBalanceLiters)} {currentLang === 'ta' ? 'லிட்டர்/நாள்' : 'L/day'}
                  </div>
                )}
                <div style={{ marginTop: '6px', fontSize: '0.825rem', color: '#0f172a', fontWeight: 700 }}>
                  {currentLang === 'ta' ? 'விவசாயி செய்ய வேண்டியது:' : 'Farmer action:'} {calcResult.practicalFeedingReport?.waterStatus?.farmerAction}
                </div>
              </div>
            </div>

            {/* 5. WEATHER ADVISORY */}
            <div className="review-section-card" style={{ background: '#ffffff', border: '1.5px solid #fde047', borderRadius: '16px', padding: '24px', marginBottom: '28px', boxShadow: '0 2px 8px rgba(234, 179, 8, 0.04)' }}>
              <h4 style={{ fontSize: '1.15rem', color: '#854d0e', fontWeight: 900, margin: '0 0 6px' }}>
                {calcResult.practicalFeedingReport?.weatherAdvisory?.title || (currentLang === 'ta' ? 'இன்றைய வெப்பநிலை எச்சரிக்கை' : 'Warm Weather Today')}
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#a16207', margin: '0 0 12px', fontWeight: 700 }}>
                {Math.round(weather?.tempC || 33)}°C | {weather?.humidity || 69}% {currentLang === 'ta' ? 'ஈரப்பதம்' : 'humidity'} (THI: {calcResult.climate?.thi})
              </p>

              <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>{currentLang === 'ta' ? 'பரிந்துரைக்கப்படும் நடவடிக்கைகள்:' : 'Recommended action:'}</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem', color: '#334155' }}>
                {calcResult.practicalFeedingReport?.weatherAdvisory?.recommendedActions?.map((act, i) => (
                  <div key={i}>{act}</div>
                ))}
              </div>
            </div>

            {/* 6. PRACTICAL FEED BALANCE (SIMPLE FARMER LANGUAGE) */}
            <div className="cattle-category-card" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: 'clamp(14px, 3vw, 24px)', marginBottom: '28px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
              <h4 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 900, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scale size={20} color="#15803d" />
                <span>{currentLang === 'ta' ? 'தீவன ஊட்டச்சத்து சமநிலை (இந்த தீவனங்கள் போதுமானதா?)' : 'Feed Balance (Are These Feeds Enough?)'}</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '10px' }}>
                {calcResult.practicalFeedingReport?.feedBalanceSimple?.map((item, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0f172a', marginBottom: '4px' }}>
                        {translateTerm(item.label, currentLang)}
                      </div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: (item.icon === 'ok' || item.status?.toLowerCase().includes('adequate')) ? '#15803d' : '#d97706', marginBottom: item.detail ? '6px' : '0' }}>
                        {translateTerm(stripEmojis(item.status), currentLang)}
                      </div>
                    </div>
                    {item.detail && (
                      <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.35, background: '#ffffff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                        {item.detail}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 6B. KT SCIENTIFIC NUTRITION FORMULATION & CONSOLIDATED MINERALS (8-PAGE PDF ARCHITECTURE) */}
            {(() => {
              const kt = calcResult.ktFormulation || calcResult.practicalFeedingReport?.ktFormulation;
              if (!kt) return null;
              const prox = kt.nutritiveComposition || {};
              const dietTotals = prox.dietTotals || {};
              const feeds = prox.feeds || [];
              const minProfile = kt.mineralProfile || {};
              const macro = minProfile.macroMinerals || {};
              const trace = minProfile.traceMinerals || {};
              const energy = kt.energyAnalysis || {};
              const lactEnergy = energy.lactatingEnergySufficiency || {};
              const gestEnergy = energy.gestationalEnergySufficiency || {};
              const fndf = kt.forageNdfBuffer || {};
              const fwi = kt.freeWaterIntakeFwi || {};
              const bwBaselines = kt.bodyWeightAndFeedingBaselines || {};

              const tabBtnStyle = (tabId) => ({
                padding: '8px 14px',
                borderRadius: '8px',
                border: ktTab === tabId ? '1.5px solid #059669' : '1px solid #cbd5e1',
                background: ktTab === tabId ? '#ecfdf5' : '#ffffff',
                color: ktTab === tabId ? '#065f46' : '#475569',
                fontWeight: ktTab === tabId ? 800 : 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              });

              return (
                <div style={{
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '32px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ background: '#059669', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {currentLang === 'ta' ? 'தொழில்நுட்ப & ஆய்வக பார்வை' : 'Technical & Laboratory View'}
                        </span>
                        <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 900, margin: 0 }}>
                          {currentLang === 'ta' ? 'அறிவியல் ஊட்டச்சத்து கூறுகள் & தாதுக்கள் அட்டவணை (KT Formulation)' : 'Scientific Nutritive Fractions & Consolidated Minerals Matrix'}
                        </h3>
                      </div>
                      <p style={{ fontSize: '0.825rem', color: '#475569', margin: 0 }}>
                        {currentLang === 'ta' ? 'விரிவான 14 ஊட்டச்சத்து மற்றும் புரத கூறுகள், 15 தாதுக்களின் விவரம், மற்றும் நிகர ஆற்றல் (NEL) கணக்கீடுகள் (PDF அறிக்கையிலும் பதிவிறக்கலாம்).' : 'Detailed 14 nutritive and protein fractions, 15 minerals profile, and Net Energy (NEL) calculations (available in full in the downloadable PDF report).'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: showTechnicalDetails ? '#f1f5f9' : '#ecfdf5',
                          border: showTechnicalDetails ? '1.5px solid #94a3b8' : '1.5px solid #10b981',
                          color: showTechnicalDetails ? '#334155' : '#047857',
                          padding: '10px 18px',
                          borderRadius: '10px',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {showTechnicalDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                        <span>{showTechnicalDetails ? (currentLang === 'ta' ? 'ஆய்வக விவரங்களை மறைக்க' : 'Hide Laboratory Details') : (currentLang === 'ta' ? 'விரிவான ஆய்வக பகுப்பாய்வைக் காட்ட' : 'Show Advanced Laboratory Analysis')}</span>
                      </button>
                    </div>
                  </div>

                  {showTechnicalDetails && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <span style={{ padding: '4px 10px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>
                          {currentLang === 'ta' ? 'உலர் சத்து (DM):' : 'Diet DM:'} {dietTotals.dmKg || 0} kg
                        </span>
                        <span style={{ padding: '4px 10px', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#1e40af' }}>
                          {currentLang === 'ta' ? 'வளர்சிதை மாற்ற ஆற்றல் (ME):' : 'Diet ME:'} {dietTotals.meMcal || 0} Mcal ({dietTotals.nelMcal || 0} NEL)
                        </span>
                        <span style={{ padding: '4px 10px', background: fndf.isSufficient ? '#f0fdf4' : '#fef2f2', border: fndf.isSufficient ? '1px solid #86efac' : '1px solid #fca5a5', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: fndf.isSufficient ? '#166534' : '#991b1b' }}>
                          {currentLang === 'ta' ? 'தீவன நார்ச்சத்து NDF:' : 'Forage NDF:'} {fndf.forageNdfPct || 0}% ({fndf.isSufficient ? (currentLang === 'ta' ? '>= 21% சரியானது' : '>= 21% OK') : (currentLang === 'ta' ? '< 21% குறைவு' : '< 21% Low')})
                        </span>
                      </div>

                  {/* TAB SELECTOR */}
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                    <button type="button" onClick={() => setKtTab('proximate')} style={tabBtnStyle('proximate')}>
                      {currentLang === 'ta' ? '14 ஊட்டச்சத்து & புரத கூறுகள்' : '14 Nutritive & Protein Fractions'}
                    </button>
                    <button type="button" onClick={() => setKtTab('minerals')} style={tabBtnStyle('minerals')}>
                      {currentLang === 'ta' ? '15 தாதுக்கள் விவரம்' : '15 Minerals Profile'}
                    </button>
                    <button type="button" onClick={() => setKtTab('energy')} style={tabBtnStyle('energy')}>
                      {currentLang === 'ta' ? 'நிகர ஆற்றல் (NEL) அட்டவணை' : 'Net Energy (NEL) Matrix'}
                    </button>
                    <button type="button" onClick={() => setKtTab('ndf')} style={tabBtnStyle('ndf')}>
                      {currentLang === 'ta' ? 'நார்ச்சத்து NDF தாங்கல் (>21%)' : 'Forage NDF Buffer (>21%)'}
                    </button>
                    <button type="button" onClick={() => setKtTab('water')} style={tabBtnStyle('water')}>
                      {currentLang === 'ta' ? 'குடிநீர் நுகர்வு (FWI)' : 'Free Water Intake'}
                    </button>
                    <button type="button" onClick={() => setKtTab('baselines')} style={tabBtnStyle('baselines')}>
                      {currentLang === 'ta' ? 'உடல் எடை இலக்குகள்' : 'Body Weight Targets'}
                    </button>
                  </div>

                  {/* TAB CONTENT */}
                  {ktTab === 'proximate' && (
                    <div>
                      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                          Feed Ingredient Nutritive Breakdown (Page 4 Equations)
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Wet Fodder (%DM &lt; 45) | Dry Fodder (%DM &gt; 45) | Concentrates | Unconventional Feeds
                        </span>
                      </div>
                      <div className="responsive-table-container horizontal-scroll">
                        <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                              <th style={{ padding: '8px 10px', fontWeight: 800, color: '#1e293b' }}>Ingredient</th>
                              <th style={{ padding: '8px 6px', fontWeight: 700, color: '#475569' }}>Class</th>
                              <th style={{ padding: '8px 6px', fontWeight: 700, color: '#475569' }}>As-Fed (kg)</th>
                              <th style={{ padding: '8px 6px', fontWeight: 700, color: '#475569' }}>DM (kg)</th>
                              <th style={{ padding: '8px 6px', fontWeight: 700, color: '#475569' }}>CP (kg)</th>
                              <th style={{ padding: '8px 6px', fontWeight: 700, color: '#475569' }}>CF (kg)</th>
                              <th style={{ padding: '8px 6px', fontWeight: 700, color: '#475569' }}>NDF (kg)</th>
                              <th style={{ padding: '8px 6px', fontWeight: 700, color: '#475569' }}>ADF (kg)</th>
                              <th style={{ padding: '8px 6px', fontWeight: 700, color: '#475569' }}>HemiCell (kg)</th>
                              <th style={{ padding: '8px 6px', fontWeight: 700, color: '#475569' }}>NFE (kg)</th>
                              <th style={{ padding: '8px 6px', fontWeight: 700, color: '#475569' }}>Ash (kg)</th>
                              <th style={{ padding: '8px 6px', fontWeight: 700, color: '#475569' }}>EE (kg)</th>
                              <th style={{ padding: '8px 6px', fontWeight: 700, color: '#475569' }}>FA (kg)</th>
                              <th style={{ padding: '8px 6px', fontWeight: 700, color: '#475569' }}>TP (kg)</th>
                              <th style={{ padding: '8px 6px', fontWeight: 700, color: '#475569' }}>NPNCP (kg)</th>
                              <th style={{ padding: '8px 6px', fontWeight: 700, color: '#475569' }}>Nitrogen (kg)</th>
                              <th style={{ padding: '8px 6px', fontWeight: 700, color: '#7c3aed' }}>ME (Mcal)</th>
                              <th style={{ padding: '8px 6px', fontWeight: 700, color: '#0284c7' }}>NEL (Mcal)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {feeds.map((f, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                <td style={{ padding: '7px 10px', fontWeight: 700, color: '#0f172a' }}>{f.name}</td>
                                <td style={{ padding: '7px 6px', color: '#64748b' }}>{f.feedClass}</td>
                                <td style={{ padding: '7px 6px', fontWeight: 600 }}>{f.asFedKg}</td>
                                <td style={{ padding: '7px 6px', fontWeight: 700, color: '#047857' }}>{f.dmKg}</td>
                                <td style={{ padding: '7px 6px', color: '#1e40af' }}>{f.cpKg}</td>
                                <td style={{ padding: '7px 6px' }}>{f.cfKg}</td>
                                <td style={{ padding: '7px 6px', color: '#b45309' }}>{f.ndfKg}</td>
                                <td style={{ padding: '7px 6px' }}>{f.adfKg}</td>
                                <td style={{ padding: '7px 6px' }}>{f.hemicelluloseKg}</td>
                                <td style={{ padding: '7px 6px' }}>{f.nfeKg}</td>
                                <td style={{ padding: '7px 6px' }}>{f.ashKg}</td>
                                <td style={{ padding: '7px 6px' }}>{f.eeKg}</td>
                                <td style={{ padding: '7px 6px' }}>{f.faKg}</td>
                                <td style={{ padding: '7px 6px', fontWeight: 700 }}>{f.tpKg}</td>
                                <td style={{ padding: '7px 6px' }}>{f.npncpKg}</td>
                                <td style={{ padding: '7px 6px' }}>{f.nitrogenKg}</td>
                                <td style={{ padding: '7px 6px', fontWeight: 700, color: '#7c3aed' }}>{f.meMcal}</td>
                                <td style={{ padding: '7px 6px', fontWeight: 800, color: '#0284c7' }}>{f.nelMcal}</td>
                              </tr>
                            ))}
                            <tr style={{ background: '#ecfdf5', borderTop: '2px solid #10b981', fontWeight: 800, color: '#065f46' }}>
                              <td style={{ padding: '9px 10px' }}>TOTAL HERD DIET</td>
                              <td style={{ padding: '9px 6px' }}>100% Basis</td>
                              <td style={{ padding: '9px 6px' }}>{dietTotals.asFedKg} kg</td>
                              <td style={{ padding: '9px 6px', color: '#047857' }}>{dietTotals.dmKg} kg</td>
                              <td style={{ padding: '9px 6px', color: '#1e40af' }}>{dietTotals.cpKg} kg ({dietTotals.cpPct}%)</td>
                              <td style={{ padding: '9px 6px' }}>{dietTotals.cfKg} kg ({dietTotals.cfPct}%)</td>
                              <td style={{ padding: '9px 6px', color: '#b45309' }}>{dietTotals.ndfKg} kg ({dietTotals.ndfPct}%)</td>
                              <td style={{ padding: '9px 6px' }}>{dietTotals.adfKg} kg ({dietTotals.adfPct}%)</td>
                              <td style={{ padding: '9px 6px' }}>{dietTotals.hemicelluloseKg} kg</td>
                              <td style={{ padding: '9px 6px' }}>{dietTotals.nfeKg} kg ({dietTotals.nfePct}%)</td>
                              <td style={{ padding: '9px 6px' }}>{dietTotals.ashKg} kg ({dietTotals.ashPct}%)</td>
                              <td style={{ padding: '9px 6px' }}>{dietTotals.eeKg} kg ({dietTotals.eePct}%)</td>
                              <td style={{ padding: '9px 6px' }}>{dietTotals.faKg} kg</td>
                              <td style={{ padding: '9px 6px' }}>{dietTotals.tpKg} kg</td>
                              <td style={{ padding: '9px 6px' }}>{dietTotals.npncpKg} kg</td>
                              <td style={{ padding: '9px 6px' }}>{(dietTotals.cpKg / 6.25).toFixed(3)} kg</td>
                              <td style={{ padding: '9px 6px', color: '#7c3aed' }}>{dietTotals.meMcal} Mcal</td>
                              <td style={{ padding: '9px 6px', color: '#0284c7' }}>{dietTotals.nelMcal} Mcal</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '0.725rem', color: '#475569', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                        <span><strong>True Protein (TP):</strong> CP - NPNCP</span>
                        <span>•</span>
                        <span><strong>Nitrogen (N):</strong> CP / 6.25</span>
                        <span>•</span>
                        <span><strong>Hemicellulose:</strong> NDF - ADF</span>
                        <span>•</span>
                        <span><strong>Fatty Acids (FA):</strong> DM x % FA / 100 (~85% of EE in cattle diets)</span>
                        <span>•</span>
                        <span><strong>Lignin:</strong> DM x % Lignin / 100 (Roughages contain 4–8% lignin)</span>
                        <span>•</span>
                        <span><strong>Feed NEL:</strong> ME x 0.66</span>
                      </div>
                    </div>
                  )}

                  {ktTab === 'minerals' && (
                    <div>
                      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                          Complete 15-Mineral Profile from <code style={{ color: '#047857' }}>consolidated_minerals.dat</code>
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          7 Macro Minerals (g/day) + 8 Micro Minerals (mg/day)
                        </span>
                      </div>

                      {/* Macro Minerals */}
                      <div style={{ marginBottom: '16px' }}>
                        <strong style={{ fontSize: '0.8rem', color: '#854d0e', display: 'block', marginBottom: '6px' }}>
                          1. Macro Minerals (Daily Intake in Grams):
                        </strong>
                        <div className="responsive-table-container horizontal-scroll">
                          <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                            <thead>
                              <tr style={{ background: '#fef3c7', borderBottom: '2px solid #fde047' }}>
                                <th style={{ padding: '7px 10px', textAlign: 'left', color: '#92400e', fontWeight: 800 }}>Ingredient</th>
                                <th style={{ padding: '7px 6px', textAlign: 'center', color: '#92400e', fontWeight: 700 }}>DM (kg)</th>
                                <th style={{ padding: '7px 6px', textAlign: 'center', color: '#92400e', fontWeight: 700 }}>Ca (g)</th>
                                <th style={{ padding: '7px 6px', textAlign: 'center', color: '#92400e', fontWeight: 700 }}>P (g)</th>
                                <th style={{ padding: '7px 6px', textAlign: 'center', color: '#92400e', fontWeight: 700 }}>Mg (g)</th>
                                <th style={{ padding: '7px 6px', textAlign: 'center', color: '#92400e', fontWeight: 700 }}>K (g)</th>
                                <th style={{ padding: '7px 6px', textAlign: 'center', color: '#92400e', fontWeight: 700 }}>Na (g)</th>
                                <th style={{ padding: '7px 6px', textAlign: 'center', color: '#92400e', fontWeight: 700 }}>Cl (g)</th>
                                <th style={{ padding: '7px 6px', textAlign: 'center', color: '#92400e', fontWeight: 700 }}>S (g)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {feeds.map((f, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#fffbeb' }}>
                                  <td style={{ padding: '6px 10px', fontWeight: 700, color: '#0f172a' }}>{f.name}</td>
                                  <td style={{ padding: '6px 6px', textAlign: 'center' }}>{f.dmKg}</td>
                                  <td style={{ padding: '6px 6px', textAlign: 'center', fontWeight: 700, color: '#15803d' }}>{f.minerals?.caG}</td>
                                  <td style={{ padding: '6px 6px', textAlign: 'center', fontWeight: 700, color: '#15803d' }}>{f.minerals?.pG}</td>
                                  <td style={{ padding: '6px 6px', textAlign: 'center' }}>{f.minerals?.mgG}</td>
                                  <td style={{ padding: '6px 6px', textAlign: 'center' }}>{f.minerals?.kG}</td>
                                  <td style={{ padding: '6px 6px', textAlign: 'center' }}>{f.minerals?.naG}</td>
                                  <td style={{ padding: '6px 6px', textAlign: 'center' }}>{f.minerals?.clG}</td>
                                  <td style={{ padding: '6px 6px', textAlign: 'center' }}>{f.minerals?.sG}</td>
                                </tr>
                              ))}
                              <tr style={{ background: '#fef3c7', fontWeight: 800, color: '#78350f', borderTop: '2px solid #f59e0b' }}>
                                <td style={{ padding: '8px 10px' }}>TOTAL HERD SUPPLY</td>
                                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{dietTotals.dmKg} kg</td>
                                <td style={{ padding: '8px 6px', textAlign: 'center', color: '#15803d' }}>{macro.calcium?.supplied || 0} g</td>
                                <td style={{ padding: '8px 6px', textAlign: 'center', color: '#15803d' }}>{macro.phosphorus?.supplied || 0} g</td>
                                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{macro.magnesium?.supplied || 0} g</td>
                                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{macro.potassium?.supplied || 0} g</td>
                                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{macro.sodium?.supplied || 0} g</td>
                                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{macro.chloride?.supplied || 0} g</td>
                                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{macro.sulfur?.supplied || 0} g</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Trace Minerals */}
                      <div>
                        <strong style={{ fontSize: '0.8rem', color: '#6b21a8', display: 'block', marginBottom: '6px' }}>
                          2. Trace Minerals (Daily Intake in Milligrams - ppm Basis):
                        </strong>
                        <div className="responsive-table-container horizontal-scroll">
                          <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                            <thead>
                              <tr style={{ background: '#f3e8ff', borderBottom: '2px solid #d8b4fe' }}>
                                <th style={{ padding: '7px 10px', textAlign: 'left', color: '#6b21a8', fontWeight: 800 }}>Ingredient</th>
                                <th style={{ padding: '7px 6px', textAlign: 'center', color: '#6b21a8', fontWeight: 700 }}>Co (mg)</th>
                                <th style={{ padding: '7px 6px', textAlign: 'center', color: '#6b21a8', fontWeight: 700 }}>Cu (mg)</th>
                                <th style={{ padding: '7px 6px', textAlign: 'center', color: '#6b21a8', fontWeight: 700 }}>I (mg)</th>
                                <th style={{ padding: '7px 6px', textAlign: 'center', color: '#6b21a8', fontWeight: 700 }}>Fe (mg)</th>
                                <th style={{ padding: '7px 6px', textAlign: 'center', color: '#6b21a8', fontWeight: 700 }}>Mn (mg)</th>
                                <th style={{ padding: '7px 6px', textAlign: 'center', color: '#6b21a8', fontWeight: 700 }}>Se (mg)</th>
                                <th style={{ padding: '7px 6px', textAlign: 'center', color: '#6b21a8', fontWeight: 700 }}>Zn (mg)</th>
                                <th style={{ padding: '7px 6px', textAlign: 'center', color: '#6b21a8', fontWeight: 700 }}>Mo (mg)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {feeds.map((f, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#faf5ff' }}>
                                  <td style={{ padding: '6px 10px', fontWeight: 700, color: '#0f172a' }}>{f.name}</td>
                                  <td style={{ padding: '6px 6px', textAlign: 'center' }}>{f.minerals?.coMg}</td>
                                  <td style={{ padding: '6px 6px', textAlign: 'center' }}>{f.minerals?.cuMg}</td>
                                  <td style={{ padding: '6px 6px', textAlign: 'center' }}>{f.minerals?.iMg}</td>
                                  <td style={{ padding: '6px 6px', textAlign: 'center' }}>{f.minerals?.feMg}</td>
                                  <td style={{ padding: '6px 6px', textAlign: 'center' }}>{f.minerals?.mnMg}</td>
                                  <td style={{ padding: '6px 6px', textAlign: 'center' }}>{f.minerals?.seMg}</td>
                                  <td style={{ padding: '6px 6px', textAlign: 'center' }}>{f.minerals?.znMg}</td>
                                  <td style={{ padding: '6px 6px', textAlign: 'center' }}>{f.minerals?.moMg}</td>
                                </tr>
                              ))}
                              <tr style={{ background: '#f3e8ff', fontWeight: 800, color: '#581c87', borderTop: '2px solid #a855f7' }}>
                                <td style={{ padding: '8px 10px' }}>TOTAL HERD SUPPLY</td>
                                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{trace.cobalt?.supplied || 0} mg</td>
                                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{trace.copper?.supplied || 0} mg</td>
                                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{trace.iodine?.supplied || 0} mg</td>
                                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{trace.iron?.supplied || 0} mg</td>
                                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{trace.manganese?.supplied || 0} mg</td>
                                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{trace.selenium?.supplied || 0} mg</td>
                                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{trace.zinc?.supplied || 0} mg</td>
                                <td style={{ padding: '8px 6px', textAlign: 'center' }}>{trace.molybdenum?.supplied || 0} mg</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {ktTab === 'energy' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '12px' }}>
                        {/* Feed Net Energy Box */}
                        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '14px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>{currentLang === 'ta' ? 'உணவு நிகர ஆற்றல் (NEL)' : 'Diet Net Energy (NEL) Supply'}</span>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#15803d', margin: '4px 0' }}>
                            {energy.feedNelMcal || 0} <span style={{ fontSize: '0.85rem' }}>Mcal/day</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#166534' }}>
                            {currentLang === 'ta' ? 'உணவு ME:' : 'Diet ME:'} {energy.dietMeMcal || 0} Mcal/day x 0.66
                          </div>
                        </div>

                        {/* Lactating Milk Energy Demand */}
                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>{currentLang === 'ta' ? 'பால் உற்பத்தி ஆற்றல் தேவை' : 'Milk Energy (NEL) Demand'}</span>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1d4ed8', margin: '4px 0' }}>
                            {energy.milkNeuseMcalPerDay || 0} <span style={{ fontSize: '0.85rem' }}>Mcal/day</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#1e40af' }}>
                            {currentLang === 'ta' ? 'பால் NEL:' : 'Milk NEL:'} {energy.milkNepMcalPerKg || 0} Mcal/kg (0.360 + 0.0969 x Fat%)
                          </div>
                        </div>

                        {/* Maintenance Energy Demand */}
                        <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '14px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase' }}>{currentLang === 'ta' ? 'பராமரிப்பு ஆற்றல் தேவை' : 'Maintenance NEL Demand'}</span>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7c3aed', margin: '4px 0' }}>
                            {energy.maintenanceNelMcal || 0} <span style={{ fontSize: '0.85rem' }}>Mcal/day</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6d28d9' }}>
                            {currentLang === 'ta' ? 'சூத்திரம்: 0.10 x BW^0.75' : 'Formula: 0.10 x BW^0.75 per animal'}
                          </div>
                        </div>

                        {/* Gestational Energy Demand */}
                        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>{currentLang === 'ta' ? 'சினைக்கால ஆற்றல் தேவை' : 'Gestational Demand'}</span>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#b45309', margin: '4px 0' }}>
                            {energy.gestNelMcalPerDay || 0} <span style={{ fontSize: '0.85rem' }}>Mcal/day</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#92400e' }}>
                            {currentLang === 'ta' ? 'கரு வளர்ச்சி:' : 'Conceptus Gain:'} {energy.gravidUterineGainKgDay || 0} kg/day | {energy.dryPeriodStage}
                          </div>
                        </div>

                        {/* Growth & Frame Energy Demand */}
                        <div style={{ background: '#fdf4ff', border: '1px solid #f0abfc', borderRadius: '12px', padding: '14px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#86198f', textTransform: 'uppercase' }}>{currentLang === 'ta' ? 'வளர்ச்சி ஆற்றல் தேவை' : 'Growth & Frame Demand'}</span>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#a21caf', margin: '4px 0' }}>
                            {energy.growthNelMcal || 0} <span style={{ fontSize: '0.85rem' }}>Mcal/day</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#86198f' }}>
                            {currentLang === 'ta' ? 'கிடாரி உடல் வளர்ச்சி' : energy.growthDescription || 'Heifer Frame Growth & Primiparous Gain'}
                          </div>
                        </div>
                      </div>

                      {/* True Net Energy Balance Card */}
                      <div style={{
                        background: energy.energyBalanceNelMcal >= 0 ? '#f0fdf4' : '#fef2f2',
                        border: energy.energyBalanceNelMcal >= 0 ? '1.5px solid #86efac' : '1.5px solid #fca5a5',
                        borderRadius: '12px',
                        padding: '16px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <span style={{ fontSize: '0.95rem', fontWeight: 900, color: energy.energyBalanceNelMcal >= 0 ? '#166534' : '#991b1b' }}>
                              Total Herd Net Energy Balance: {energy.energyBalanceNelMcal > 0 ? `+${energy.energyBalanceNelMcal}` : energy.energyBalanceNelMcal} Mcal NEL/day ({energy.nelAdequacyPct}% Adequacy)
                            </span>
                            <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                              Total Required: {energy.totalNelRequiredMcal || 0} Mcal NEL (Maintenance: {energy.maintenanceNelMcal || 0} + Milk: {energy.milkNeuseMcalPerDay || 0} + Gestation: {energy.gestNelMcalPerDay || 0} + Growth: {energy.growthNelMcal || 0}) vs Supply: {energy.feedNelMcal || 0} Mcal NEL
                            </div>
                          </div>
                          <span style={{ padding: '4px 12px', borderRadius: '20px', fontWeight: 800, fontSize: '0.8rem', background: energy.energyBalanceNelMcal >= 0 ? '#bbf7d0' : '#fecaca', color: energy.energyBalanceNelMcal >= 0 ? '#14532d' : '#7f1d1d' }}>
                            {energy.energyStatus}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                          <strong>Nutritional Advisory:</strong> {energy.energyAdvice}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.75rem', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', color: '#475569' }}>
                        <strong>Exact Formulation Chain:</strong> {energy.totalNelFormula || `TotalNELReq = ${energy.maintenanceNelMcal || 0} (Maint) + ${energy.milkNeuseMcalPerDay || 0} (Milk) + ${energy.gestNelMcalPerDay || 0} (Gest) + ${energy.growthNelMcal || 0} (Growth) = ${energy.totalNelRequiredMcal || 0} Mcal/day`} | Energy Balance = Feed_NEL ({energy.feedNelMcal || 0}) - Total_NEL_Req ({energy.totalNelRequiredMcal || 0})
                      </div>
                    </div>
                  )}

                  {ktTab === 'ndf' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{
                        background: fndf.isSufficient ? '#f0fdf4' : '#fef2f2',
                        border: fndf.isSufficient ? '1.5px solid #86efac' : '1.5px solid #fca5a5',
                        borderRadius: '12px',
                        padding: '16px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: fndf.isSufficient ? '#166534' : '#991b1b' }}>
                            % Forage NDF in Diet: {fndf.forageNdfPct}% (Target &gt; 21%)
                          </span>
                          <span style={{ padding: '3px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem', background: fndf.isSufficient ? '#bbf7d0' : '#fecaca', color: fndf.isSufficient ? '#14532d' : '#7f1d1d' }}>
                            {fndf.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#334155', margin: '0 0 10px' }}>
                          {fndf.advice}
                        </p>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.775rem', color: '#475569' }}>
                          <div><strong>Total Forage NDF:</strong> {fndf.totalForageNdfKg} kg</div>
                          <div><strong>Total Diet DM:</strong> {fndf.totalDietDmKg} kg</div>
                          <div><strong>Formula:</strong> (Total Forage NDF / Total DM of Diet) x 100%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {ktTab === 'water' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '14px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>Lactating Cow Water (FWI)</span>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0284c7', margin: '4px 0' }}>
                            {fwi.lactatingFwiPerCowL || 0} <span style={{ fontSize: '0.85rem' }}>Liters / cow / day</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#0369a1' }}>
                            NaK Factor: {fwi.nakFactor || 0} | Formula: -91.1 + (2.93*DMI) + (0.61*DM%) + (0.062*NaK) + (2.49*CP%) + (0.76*T)
                          </div>
                        </div>

                        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>Remaining Cattle FWI</span>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#475569', margin: '4px 0' }}>
                            {fwi.remainingFwiPerHeadL || 0} <span style={{ fontSize: '0.85rem' }}>Liters / head / day</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#334155' }}>
                            TMPC2: {fwi.tmpc2 || fwi.tempCorr || 0} | Formula: 1.16(DMI) + 0.23(DM%) + 0.44T + 0.061(T-16.4)^2
                          </div>
                        </div>

                        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>Total Herd Water Required</span>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#059669', margin: '4px 0' }}>
                            {fwi.totalFwiLiters || 0} <span style={{ fontSize: '0.85rem' }}>Liters / day</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#065f46' }}>
                            Water_herd = &Sigma;(Water_i) = {fwi.totalFwiLiters || 0} L/day | RWL: {fwi.respiratoryWaterLoss || 0} kg/d
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {ktTab === 'baselines' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                        <h5 style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 800, margin: '0 0 8px' }}>
                          Body Weight Targets &amp; Required Feed (Moisture-Derived vs 4.5% Baseline)
                        </h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px', fontSize: '0.8rem', marginBottom: '14px' }}>
                          <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#059669' }}>Primiparous Target Weight:</strong>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '4px 0' }}>
                              {bwBaselines.primiparousTargetBwKg || 0} kg
                            </div>
                            <span style={{ fontSize: '0.725rem', color: '#64748b' }}>Mature BW x 85% | 4.5% BW Ref: {bwBaselines.primiparousRequiredAsFedKg || 0} kg/day</span>
                          </div>

                          <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#2563eb' }}>{currentLang === 'ta' ? 'பல முறை ஈன்ற மாடுகளின் எடை:' : 'Multiparous Target Weight:'}</strong>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '4px 0' }}>
                              {bwBaselines.multiparousTargetBwKg || 0} kg
                            </div>
                            <span style={{ fontSize: '0.725rem', color: '#64748b' }}>{currentLang === 'ta' ? `முதிர்ந்த எடை x 95% | 4.5% உடல் எடை குறிப்பு: ${bwBaselines.multiparousRequiredAsFedKg || 0} kg/நாள்` : `Mature BW x 95% | 4.5% BW Ref: ${bwBaselines.multiparousRequiredAsFedKg || 0} kg/day`}</span>
                          </div>

                          <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#7c3aed' }}>{currentLang === 'ta' ? 'ஈரப்பதம் சார்ந்த மொத்த தீவனம்:' : 'Moisture-Derived As-Fed:'}</strong>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '4px 0', color: '#7c3aed' }}>
                              {bwBaselines.moistureRequiredAsFedKg || 0} kg/{currentLang === 'ta' ? 'நாள்' : 'day'}
                            </div>
                            <span style={{ fontSize: '0.725rem', color: '#64748b' }}>{currentLang === 'ta' ? `உண்மையான தேவை = DMI / (உணவு DM% / 100) (உடல் எடையில் 4.5%: ${bwBaselines.herdAsFedBaselineKg || 0} kg)` : `True requirement = DMI / (Diet DM% / 100) (Thumb-rule 4.5% BW: ${bwBaselines.herdAsFedBaselineKg || 0} kg)`}</span>
                          </div>
                        </div>

                        <h5 style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 800, margin: '10px 0 6px' }}>
                          {currentLang === 'ta' ? 'NRC உலர் பொருள் உட்கொள்ளல் (DMI) அளவுகோல்கள்:' : 'NRC DMI Equations Benchmarks:'}
                        </h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '10px', fontSize: '0.775rem' }}>
                          <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <strong>{currentLang === 'ta' ? 'கிடேரி இலக்கு DMI (Eq 20-10):' : 'Heifer Target DMI (Eq 20-10):'}</strong>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#047857' }}>{kt.dmiFormulations?.primiparousFarOffTargetDmiKg} kg DM/{currentLang === 'ta' ? 'நாள்' : 'day'}</div>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>0.022 x MatBW x [1 - e^(-1.54*BW/MatBW)]</span>
                          </div>
                          <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <strong>{currentLang === 'ta' ? 'கிடேரி உணவு சார்ந்த DMI (Eq 20-11):' : 'Heifer Diet-Based DMI (Eq 20-11):'}</strong>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0284c7' }}>{kt.dmiFormulations?.heiferDietDmiKg} kg DM/{currentLang === 'ta' ? 'நாள்' : 'day'}</div>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>0.0226 x MatBW - 0.082 x [NDF deviation]</span>
                          </div>
                          <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <strong>{currentLang === 'ta' ? 'கறவை மாடு இலக்கு DMI (Eq 20-18):' : 'Lactating Target DMI (Eq 20-18):'}</strong>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#d97706' }}>{kt.dmiFormulations?.lactatingTargetDmiEqKg} kg DM/{currentLang === 'ta' ? 'நாள்' : 'day'}</div>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{currentLang === 'ta' ? '4% FCM & ஈற்று திருத்தம்' : '4% FCM & Parity corrected'}</span>
                          </div>
                          <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <strong>{currentLang === 'ta' ? 'மொத்த உட்கொள்ளப்பட்ட உலர் பொருள்:' : 'Total Ingested DM:'}</strong>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#4338ca' }}>{kt.dmiFormulations?.totalDmIngestedKg} kg DM/{currentLang === 'ta' ? 'நாள்' : 'day'}</div>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{currentLang === 'ta' ? `தொட்டி: ${kt.dmiFormulations?.troughDmKg} kg + மேய்ச்சல்: ${kt.dmiFormulations?.grazingDmKg} kg` : `Trough: ${kt.dmiFormulations?.troughDmKg} kg + Grazing: ${kt.dmiFormulations?.grazingDmKg} kg`}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 7. RATION FEASIBILITY & INCLUSION ALERTS */}
            {(() => {
              const feasibility = calcResult.practicalFeedingReport?.rationFeasibility || calcResult.nutritionAnalysis?.rationFeasibility;
              if (!feasibility) return null;
              const hasWarnings = !feasibility.isFeasible || (feasibility.inclusionWarnings && feasibility.inclusionWarnings.length > 0);
              if (!hasWarnings) return null;

              return (
                <div style={{
                  background: !feasibility.isFeasible ? '#fef2f2' : '#fffbeb',
                  border: !feasibility.isFeasible ? '1.5px solid #f87171' : '1.5px solid #fcd34d',
                  borderRadius: '16px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <AlertTriangle size={20} color={!feasibility.isFeasible ? '#dc2626' : '#d97706'} />
                    <h4 style={{ fontSize: '1.1rem', color: !feasibility.isFeasible ? '#991b1b' : '#92400e', fontWeight: 900, margin: 0 }}>
                      {!feasibility.isFeasible 
                        ? (currentLang === 'ta' ? 'தீவன சாத்தியக்கூறு எச்சரிக்கை: ஊட்டச்சத்து பற்றாக்குறைகள் கண்டறியப்பட்டுள்ளன' : 'Ration Feasibility Alert: Deficits Detected')
                        : (currentLang === 'ta' ? 'தீவன வரம்பு மற்றும் உள்ளடக்க ஆலோசனை' : 'Feed Inclusion Advisory')}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: !feasibility.isFeasible ? '#b91c1c' : '#78350f', margin: '0 0 12px', fontWeight: 600 }}>
                    {feasibility.message}
                  </p>

                  {feasibility.missingNutrients && feasibility.missingNutrients.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                      {feasibility.missingNutrients.map((n, idx) => (
                        <div key={idx} style={{ background: '#ffffff', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', fontSize: '0.825rem' }}>
                          <strong style={{ color: '#b91c1c' }}>{n.nutrient || n.name || (typeof n === 'string' ? (currentLang === 'ta' ? 'பற்றாக்குறை எச்சரிக்கை' : 'Deficit Alert') : (currentLang === 'ta' ? 'எச்சரிக்கை' : 'Warning'))}:</strong> {n.advice || n.message || (typeof n === 'string' ? n : '')}
                        </div>
                      ))}
                    </div>
                  )}

                  {feasibility.inclusionWarnings && feasibility.inclusionWarnings.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {feasibility.inclusionWarnings.map((w, idx) => (
                        <div key={idx} style={{ background: '#ffffff', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', fontSize: '0.825rem', color: '#92400e' }}>
                          <strong>{translateFeed ? translateFeed(w.feed, currentLang) : w.feed} {currentLang === 'ta' ? 'வரம்பு:' : 'Limit:'}</strong> {w.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 8. RUMEN FIBER HEALTH & ACIDOSIS (SARA) PREVENTION */}
            {(() => {
              const rfh = calcResult.practicalFeedingReport?.rumenFiberHealth || calcResult.rumenFiberHealth;
              if (!rfh) return null;
              const isLowRisk = rfh.saraRisk === 'Low';
              return (
                <div style={{
                  background: isLowRisk ? '#f0fdf4' : '#fffbeb',
                  border: isLowRisk ? '1.5px solid #86efac' : '1.5px solid #fde047',
                  borderRadius: '16px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Leaf size={20} color={isLowRisk ? "#166534" : "#854d0e"} />
                      <h4 style={{ fontSize: '1.15rem', color: isLowRisk ? '#166534' : '#854d0e', fontWeight: 900, margin: 0 }}>
                        {currentLang === 'ta' ? 'அசைபோடும் இரைப்பை நார்ச்சத்து & அமிலத்தன்மை தடுப்பு (SARA)' : 'Rumen Fiber Health & Acidosis Prevention (NRC & ICAR)'}
                      </h4>
                    </div>
                    <span style={{
                      background: isLowRisk ? '#dcfce7' : '#fef3c7',
                      color: isLowRisk ? '#15803d' : '#b45309',
                      border: `1px solid ${isLowRisk ? '#bbf7d0' : '#fde68a'}`,
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 800
                    }}>
                      {currentLang === 'ta' 
                        ? `SARA அமிலத்தன்மை அபாயம்: ${rfh.saraRisk === 'Low' ? 'குறைவு (பாதுகாப்பானது)' : rfh.saraRisk === 'Medium' ? 'நடுத்தரம்' : 'அதிகம்'}` 
                        : `SARA Risk: ${rfh.saraRisk}`}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 14px', lineHeight: 1.5 }}>
                    {rfh.advisory}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '10px' }}>
                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>{currentLang === 'ta' ? 'தீவன நார்ச்சத்து (fNDF)' : 'Forage NDF (fNDF)'}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: rfh.forageNdfPct >= 19 ? '#15803d' : '#dc2626' }}>
                        {rfh.forageNdfPct}% <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>({currentLang === 'ta' ? 'குறைந்தது 19%' : 'Min 19%'})</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{currentLang === 'ta' ? 'இரைப்பை அமிலத்தன்மையை சீராக்கும்' : 'Protects rumen buffering'}</div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>{currentLang === 'ta' ? 'பயனுள்ள நார்ச்சத்து (peNDF)' : 'Effective NDF (peNDF)'}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: rfh.physicallyEffectiveNdfPct >= 21 ? '#15803d' : '#d97706' }}>
                        {rfh.physicallyEffectiveNdfPct}% <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>({currentLang === 'ta' ? 'குறைந்தது 21%' : 'Min 21%'})</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{currentLang === 'ta' ? 'அசைபோடுதலை தூண்டுகிறது' : 'Stimulates cud chewing'}</div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>{currentLang === 'ta' ? 'மொத்த உணவு நார்ச்சத்து (NDF)' : 'Total Dietary NDF'}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: rfh.totalNdfPct <= 48 ? '#15803d' : '#d97706' }}>
                        {rfh.totalNdfPct}% <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>({currentLang === 'ta' ? 'அதிகபட்சம் 48%' : 'Max 48%'})</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{currentLang === 'ta' ? 'வயிறு அடைப்பு வரம்பைத் தடுக்கும்' : 'Prevents rumen gut-fill limit'}</div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>{currentLang === 'ta' ? 'மதிப்பிடப்பட்ட அசைபோடுதல்' : 'Est. Cud Chews'}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                        ~{rfh.estimatedCudChewsPerDay?.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{currentLang === 'ta' ? 'அசைபோடுதல் / மந்தை / நாள்' : 'Chews / herd / day'}</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 9. AGRO-CLIMATIC REGIONAL FEED INTELLIGENCE & DEFICIENCY BRIDGES */}
            {(() => {
              const reg = calcResult.practicalFeedingReport?.regionalFeedIntelligence || calcResult.regionalFeedIntelligence;
              if (!reg) return null;
              return (
                <div style={{
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={20} color="#0f172a" />
                      <h4 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 900, margin: 0 }}>
                        {currentLang === 'ta' ? `வேளாண் காலநிலை தீவன வழிகாட்டுதல்: ${reg.zoneName}` : `Agro-Climatic Feed Intelligence: ${reg.zoneName}`}
                      </h4>
                    </div>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {currentLang === 'ta' ? `இருப்பிடம்: ${reg.detectedLocation || 'நாடு தழுவியது'}` : `Location: ${reg.detectedLocation || 'National'}`}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0 0 14px' }}>
                    {currentLang === 'ta'
                      ? 'உங்கள் உள்ளூர் தட்பவெப்ப நிலைக்கு ஏற்ற, பால் தரம் மற்றும் அடர்த்தியை அதிகரித்து செலவைக் குறைக்கும் பரிந்துரைக்கப்பட்ட தீவனங்கள் மற்றும் விவசாய துணைப்பொருட்கள்.'
                      : 'Scientifically recommended regional feeds and agro-byproducts suited for your local climate to optimize costs and milk solids.'}
                  </p>

                  {/* Deficiency Bridges Alerts (if any) */}
                  {reg.deficiencyBridges && reg.deficiencyBridges.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                      {reg.deficiencyBridges.map((b, idx) => (
                        <div key={idx} style={{
                          background: b.severity === 'High' ? '#fef2f2' : '#fffbeb',
                          border: `1px solid ${b.severity === 'High' ? '#fca5a5' : '#fde68a'}`,
                          borderRadius: '8px',
                          padding: '10px 14px',
                          fontSize: '0.825rem'
                        }}>
                          <strong style={{ color: b.severity === 'High' ? '#b91c1c' : '#92400e' }}>
                            {b.type}:
                          </strong>{' '}
                          <span style={{ color: '#334155' }}>{b.advice}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Top Regional Feeds Columns */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '12px' }}>
                    {/* Greens */}
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#166534', marginBottom: '6px' }}>
                        {currentLang === 'ta' ? 'சிறந்த பிராந்திய பசுந்தீவனங்கள்' : 'Top Regional Greens'}
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: '#334155', lineHeight: 1.4 }}>
                        {reg.topRegionalGreens?.map((g, i) => (
                          <li key={i} style={{ marginBottom: '4px' }}>
                            <strong>{translateFeed ? translateFeed(g.name, currentLang) : g.name}</strong> ({g.cpPct}% CP)
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Dry Roughage */}
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#854d0e', marginBottom: '6px' }}>
                        {currentLang === 'ta' ? 'சிறந்த உலர் தீவனங்கள்' : 'Top Dry Roughages'}
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: '#334155', lineHeight: 1.4 }}>
                        {reg.topRegionalDry?.map((d, i) => (
                          <li key={i} style={{ marginBottom: '4px' }}>
                            <strong>{translateFeed ? translateFeed(d.name, currentLang) : d.name}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Concentrates & Oil Cakes */}
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '6px' }}>
                        {currentLang === 'ta' ? 'சிறந்த புண்ணாக்குகள் & துணைப்பொருட்கள்' : 'Top Oil Cakes & Byproducts'}
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: '#334155', lineHeight: 1.4 }}>
                        {reg.topRegionalConcentrates?.map((c, i) => (
                          <li key={i} style={{ marginBottom: '4px' }}>
                            <strong>{translateFeed ? translateFeed(c.name, currentLang) : c.name}</strong> ({c.cpPct}% CP)
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        )}
      </div>

      {/* Navigation: Back + Reset + Download CSV */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <button onClick={() => onEditStep(9)} className="btn-secondary">
          <ArrowLeft size={16} />
          <span>{currentLang === 'ta' ? 'முந்தையது' : (t ? t('previous') : 'Previous')}</span>
        </button>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {onResetAllData && (
            <button 
              onClick={() => {
                const confirmMsg = currentLang === 'ta' 
                  ? 'பதிவு செய்யப்பட்ட அனைத்து பண்ணை தரவுகளையும் அழித்து புதிதாக தொடங்க விரும்புகிறீர்களா?' 
                  : 'Are you sure you want to clear all recorded farm data and start fresh?';
                if (window.confirm(confirmMsg)) {
                  onResetAllData();
                }
              }} 
              className="btn-secondary" 
              style={{ padding: '12px 18px', color: '#dc2626', borderColor: '#fca5a5' }}
            >
              <span>{currentLang === 'ta' ? 'அனைத்தையும் அழித்து புதிதாகத் தொடங்கு' : 'Reset & Start New Record'}</span>
            </button>
          )}

          {hasCattle && (
            <button 
              onClick={() => downloadInputDataPDF({
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
                totalCattleCount
              })}
              className="btn-secondary"
              style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '8px', border: '1.5px solid #0284c7', color: '#0369a1', fontWeight: 700 }}
              title={currentLang === 'ta' ? 'பதிவு செய்யப்பட்ட பண்ணை உள்ளீடுகளை வண்ணமயமான PDF வடிவத்தில் பதிவிறக்கவும்' : 'Download recorded farm inputs in colorful PDF format'}
            >
              <FileText size={18} color="#0284c7" />
              <span>{currentLang === 'ta' ? 'உள்ளீடுகள் பதிவிறக்கம் (PDF)' : 'Download Inputs (PDF)'}</span>
            </button>
          )}

          {calcResult && (
            <button 
              onClick={() => downloadFeedingReportPDF({
                calcResult,
                weather,
                selectedBreed,
                totalCattleCount,
                totalHerdWeightKg,
                totalDailyMilkL,
                waterVolume,
                selectedFeeds
              })}
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 22px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
              }}
              title={currentLang === 'ta' ? 'உருவாக்கப்பட்ட தீவன அறிக்கையை வண்ணமயமான PDF வடிவத்தில் பதிவிறக்கவும்' : 'Download generated feeding report in colorful PDF format'}
            >
              <Download size={18} />
              <span>{currentLang === 'ta' ? 'தீவன அறிக்கை பதிவிறக்கம் (PDF)' : 'Download Feeding Report (PDF)'}</span>
            </button>
          )}

          {canGenerateNutrition && (
            <button onClick={generateCSV} className="btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} />
              <span>{currentLang === 'ta' ? 'CSV அறிக்கை பதிவிறக்கம்' : (t ? t('step10.download_csv') : 'Download CSV Report')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
