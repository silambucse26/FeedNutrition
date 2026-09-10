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
    { num: 2, title: t ? t('steps.step_2') : 'Heifers' },
    { num: 3, title: t ? t('steps.step_3') : 'Pregnant Cows' },
    { num: 4, title: t ? t('steps.step_4') : 'Lactating Herd' },
    { num: 5, title: t ? t('steps.step_5') : 'Dry Cows' },
    { num: 6, title: t ? t('steps.step_6') : 'Bulls' },
    { num: 7, title: t ? t('steps.step_7') : 'Grazing Management' },
    { num: 8, title: t ? t('steps.step_8') : 'Water Availability' },
    { num: 9, title: t ? t('steps.step_9') : 'Feed & Fodder' }
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
  if (!hasCattle) requiredMissingItems.push({ num: 2, title: 'Cattle Herd Inventory', reason: 'Record at least one animal in your herd (Heifers, Pregnant, Lactating, Dry, or Bulls)' });
  if (hasInvalidCattle) requiredMissingItems.push({ num: 4, title: 'Cattle Details Incomplete', reason: 'Ensure all recorded cattle have valid live weights and production values' });
  if (!hasWater) requiredMissingItems.push({ num: 8, title: t ? t('steps.step_8') : 'Water Availability', reason: 'Daily water supply volume and water source are required' });
  if (!hasFeed) requiredMissingItems.push({ num: 9, title: t ? t('steps.step_9') : 'Feed & Fodder', reason: 'Select feed ingredients with daily quantity (kg/day)' });

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
    link.setAttribute("download", `FeedNutrition_FarmData_${dateStr}.csv`);
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
            <span className="badge-green">{t ? t('step10.badge') : 'STEP 10 OF 10'}</span>
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

          <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
            <button 
              onClick={handlePrint}
              className="btn-secondary"
              style={{ background: '#ffffff', padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={14} />
              <span>{t ? t('print_page') : 'Print Summary'}</span>
            </button>

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
                style={{ background: '#ffffff', border: '1.5px solid #0284c7', color: '#0369a1', padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
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
                  selectedFeeds
                })}
                style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#ffffff', border: 'none', padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)' }}
                title="Download generated feeding report in colorful PDF format"
              >
                <Download size={14} />
                <span>Download Feeding Report (PDF)</span>
              </button>
            )}

            {canGenerateNutrition && (
              <button 
                onClick={generateCSV}
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} />
                <span>{t ? t('step10.download_csv') : 'Download CSV Report'}</span>
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 22vw, 200px), 1fr))',
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
        <span>Recorded Farm Data Review (Steps 1 to 9)</span>
      </h3>

      {/* Top Two Summary Cards: Climate & Breed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* 1. Farm Location & Climate */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
              {t ? t('step10.section_weather') : '1. Farm Location & Climate'}
            </h4>
            <button onClick={() => onEditStep(1)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              {t ? t('edit') : 'Edit'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>{t ? t('step10.location') : 'Location:'}</span>
              <strong style={{ color: weather?.city ? '#0f172a' : '#dc2626' }}>{weather?.city || 'No location detected'}</strong>
            </div>

            {weather?.tempC !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b' }}>{t ? t('step10.temperature') : 'Air Temperature:'}</span>
                <strong style={{ color: '#16a34a' }}>{Math.round(weather.tempC)}°C</strong>
              </div>
            )}

            {weather?.humidity !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b' }}>{t ? t('step10.humidity') : 'Relative Humidity:'}</span>
                <strong style={{ color: '#0d9488' }}>{weather.humidity}%</strong>
              </div>
            )}

            {weather?.thi !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b' }}>THI Climate Index:</span>
                <strong style={{ color: weather.thi > 78 ? '#dc2626' : '#16a34a' }}>{weather.thi}</strong>
              </div>
            )}
          </div>
        </div>

        {/* 2. Selected Breed */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
              {t ? t('steps.step_1') : '2. Breed Selection'}
            </h4>
            <button onClick={() => onEditStep(1)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              {t ? t('edit') : 'Edit'}
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
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No breed selected.</p>
          )}
        </div>

      </div>

      {/* 3. Detailed Animal Categories Inventory */}
      <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
              {t ? t('step10.section_animals') : '3. Cattle Herd Inventory'}
            </h4>
            <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '2px 0 0' }}>
              Only showing categories and live weights recorded on this farm.
            </p>
          </div>
          <span className="badge-green">{totalCattleCount} {t ? t('step10.head') : 'head total'}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* HEIFERS */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: totalHeifers > 0 ? '#ffffff' : '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: totalHeifers > 0 ? '10px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CattleVector size={24} color={totalHeifers > 0 ? '#16a34a' : '#94a3b8'} type="heifer" />
                <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>
                  {t ? t('step7.heifers') : 'Heifers'}: {totalHeifers > 0 ? `${totalHeifers} head` : '0 head (None on farm)'}
                </strong>
              </div>
              <button onClick={() => onEditStep(2)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>Edit</button>
            </div>
            {totalHeifers > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {heifersData.map((h, i) => (
                  <CattleVector 
                    key={h.id || i}
                    size={32}
                    color="#16a34a"
                    type="heifer"
                    label={`Heifer #${i + 1}`}
                    weight={h.weight}
                  />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                No heifers recorded
              </div>
            )}
          </div>

          {/* PREGNANT COWS */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: totalPregnant > 0 ? '#ffffff' : '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: totalPregnant > 0 ? '10px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CattleVector size={24} color={totalPregnant > 0 ? '#d97706' : '#94a3b8'} type="pregnant" />
                <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>
                  {t ? t('step7.pregnant') : 'Pregnant Cows'}: {totalPregnant > 0 ? `${totalPregnant} head` : '0 head (None on farm)'}
                </strong>
              </div>
              <button onClick={() => onEditStep(3)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>Edit</button>
            </div>

            {totalFirstTime > 0 && (
              <div style={{ marginBottom: '10px', marginTop: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>First-Time Pregnant ({totalFirstTime}):</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {firstTimeCattle.map((c, i) => (
                    <CattleVector 
                      key={c.id || i}
                      size={32}
                      color="#d97706"
                      type="pregnant"
                      label={`1st-Preg #${i + 1}`}
                      weight={c.weight}
                    />
                  ))}
                </div>
              </div>
            )}

            {totalRepeat > 0 && (
              <div style={{ marginTop: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Repeat / Multiparous ({totalRepeat}):</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {repeatCattle.map((c, i) => (
                    <CattleVector 
                      key={c.id || i}
                      size={32}
                      color="#b45309"
                      type="pregnant"
                      label={`Repeat #${i + 1}`}
                      weight={c.weight}
                    />
                  ))}
                </div>
              </div>
            )}

            {totalPregnant === 0 && (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                No pregnant cattle recorded
              </div>
            )}
          </div>

          {/* LACTATING COWS */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: totalLactating > 0 ? '#ffffff' : '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: totalLactating > 0 ? '10px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CattleVector size={24} color={totalLactating > 0 ? '#0284c7' : '#94a3b8'} type="lactating" />
                <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>
                  {t ? t('step7.lactating') : 'Lactating Cows'}: {totalLactating > 0 ? `${totalLactating} head (${totalDailyMilkL} L/day total)` : '0 head (None on farm)'}
                </strong>
              </div>
              <button onClick={() => onEditStep(4)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>Edit</button>
            </div>
            {totalLactating > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {lactatingData.map((c, i) => (
                  <CattleVector 
                    key={c.id || i}
                    size={32}
                    color="#0284c7"
                    type="lactating"
                    label={`Cow #${i + 1} (${(c.lactationType === 'first_lactation' || c.isFirstLactation) ? '1st Lact' : '2nd+'})`}
                    weight={c.weight}
                  />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                No lactating cattle recorded
              </div>
            )}
          </div>

          {/* DRY COWS */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: totalDry > 0 ? '#ffffff' : '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: totalDry > 0 ? '10px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CattleVector size={24} color={totalDry > 0 ? '#059669' : '#94a3b8'} type="dry" />
                <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>
                  {t ? t('step7.dry') : 'Dry Cows'}: {totalDry > 0 ? `${totalDry} head` : '0 head (None on farm)'}
                </strong>
              </div>
              <button onClick={() => onEditStep(5)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>Edit</button>
            </div>
            {totalDry > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {dryCowsData.map((c, i) => (
                  <CattleVector 
                    key={c.id || i}
                    size={32}
                    color="#059669"
                    type="dry"
                    label={`Dry #${i + 1}`}
                    weight={c.weight}
                  />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                No dry cows recorded
              </div>
            )}
          </div>

          {/* BULLS */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: totalBulls > 0 ? '#ffffff' : '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: totalBulls > 0 ? '10px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CattleVector size={24} color={totalBulls > 0 ? '#dc2626' : '#94a3b8'} type="bull" />
                <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>
                  {t ? t('step7.bulls') : 'Bulls'}: {totalBulls > 0 ? `${totalBulls} head` : '0 head (None on farm)'}
                </strong>
              </div>
              <button onClick={() => onEditStep(6)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>Edit</button>
            </div>
            {totalBulls > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {bullsData.map((b, i) => (
                  <CattleVector 
                    key={b.id || i}
                    size={32}
                    color="#dc2626"
                    type="bull"
                    label={`Bull #${i + 1}`}
                    weight={b.weight}
                  />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                No bulls recorded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Grazing, Water, Feed & Fodder */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* 4. Grazing Management */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
              {t ? t('step10.section_grazing') : '4. Grazing System'}
            </h4>
            <button onClick={() => onEditStep(7)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              {t ? t('edit') : 'Edit'}
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

                  const locBadge = isOutside ? 'Outside Farm' : isStallFed ? 'Stall-Fed' : 'Inside Farm';
                  const locColor = isOutside ? '#b45309' : isStallFed ? '#475569' : '#15803d';
                  const locBg = isOutside ? '#fef3c7' : isStallFed ? '#f1f5f9' : '#dcfce7';

                  return (
                    <div key={cat.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#0f172a' }}>{cat.label}</strong>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, background: locBg, color: locColor, padding: '2px 8px', borderRadius: '6px' }}>
                          {locBadge}
                        </span>
                      </div>
                      <span style={{ color: '#0f172a', fontWeight: 700 }}>
                        {isStallFed ? '0 hrs (Stall-fed)' : `${hrs} hrs/day`} {isOutside && dist > 0 ? `• ${dist} km walk` : ''}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>Standard zero-grazing recorded.</p>
          )}
        </div>

        {/* 5. Water Availability */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
              {t ? t('5. Water Supply') : '5. Water Supply'}
            </h4>
            <button onClick={() => onEditStep(8)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              {t ? t('edit') : 'Edit'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f0f9ff', borderRadius: '8px' }}>
              <span style={{ color: '#0369a1' }}>Daily Volume:</span>
              <strong style={{ color: '#0284c7' }}>{waterVolume} Litres / day</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>Primary Source:</span>
              <strong style={{ color: '#0f172a' }}>{waterSource || 'Not specified'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>Water Quality:</span>
              <strong style={{ color: '#16a34a' }}>{waterQuality || 'Good'}</strong>
            </div>
          </div>
        </div>

        {/* 6. Feed & Fodder Rations */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
              {t ? t('6. Feed Ingredients') : 'step10.section_feed'}
            </h4>
            <button onClick={() => onEditStep(9)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              {t ? t('edit') : 'Edit'}
            </button>
          </div>

          {selectedFeeds && selectedFeeds.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
              {selectedFeeds.map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{f.name}</span>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>{f.quantityKg} kg/day ({f.category})</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>No feed ingredients selected yet.</p>
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
                {checkingBackend ? (
                  <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Checking status...</span>
                ) : backendOnline ? (
                  <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                    Live Connected (FastAPI)
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', background: '#fee2e2', color: '#b91c1c', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
                    Offline (Start backend server)
                  </span>
                )}
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
                padding: '12px 32px',
                fontSize: '1rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={18} className={calcLoading ? 'animate-spin' : ''} />
              <span>{calcLoading ? 'Calculating Nutrition Values...' : calcResult ? 'Recalculate Nutrition Values' : 'Calculate Your Nutrition Values'}</span>
            </button>
          </div>
        )}

        {/* Backend offline guide notice if not connected */}
        {!backendOnline && (
          <div style={{ padding: '16px 20px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', color: '#92400e', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
            <AlertCircle size={24} style={{ flexShrink: 0, color: '#d97706' }} />
            <div>
              <strong>Python Backend is currently not responding.</strong>
              <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#78350f' }}>
                To connect: open a terminal in <code>d:\Project\Feednutrition\backend</code> and run: <br />
                <code style={{ background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>.\venv\Scripts\uvicorn.exe main:app --reload --port 8000</code>
              </div>
            </div>
          </div>
        )}

        {/* Calculation Error Notice */}
        {calcError && (
          <div style={{ padding: '12px 16px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', color: '#991b1b', fontSize: '0.85rem', marginTop: '16px' }}>
            <strong>Calculation Notice:</strong> {calcError}
          </div>
        )}

        {/* ============================================================ */}
        {/* CALCULATION RESULTS DISPLAY (SHOWN WHEN USER CLICKS TRIGGER) */}
        {/* ============================================================ */}
        {canGenerateNutrition && calcResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
            
            {/* 1. MY FARM FEEDING REPORT HEADER CARD */}
            <div style={{
              background: '#ffffff',
              border: '2px solid #86efac',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 15px rgba(22, 163, 74, 0.08)'
            }}>
              <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', color: '#15803d', fontWeight: 900, margin: '0 0 4px' }}>
                    My Farm Feeding Report
                  </h3>
                  <h4 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
                    {weather?.city ? `${weather.city} Dairy Farm` : 'Anna Nagar Farm'}
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
                    <span>Download Report (PDF)</span>
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
                    <span>Download Inputs (PDF)</span>
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
                    Cattle Reference &amp; Genetic Baseline
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                    {calcResult.breed?.name || selectedBreed?.name || 'Dairy Cattle'}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '2px' }}>
                    Mature Cow Weight Target: <strong>{selectedBreed?.avgWeightCow || 450} kg</strong> • Reference Baseline: <strong>{selectedBreed?.avgMilkYield || '10–12'} L/day</strong> ({selectedBreed?.fatPct || '4.0'}% fat)
                  </div>
                </div>
              </div>

              {(() => {
                const dmiVal = calcResult.practicalFeedingReport?.totalEstimatedDmiReqKg ?? 
                               calcResult.nutritionAnalysis?.dmi?.requiredKg ?? 
                               calcResult.nutritionAnalysis?.dmiRequiredKg ?? 
                               (totalHerdWeightKg > 0 ? (totalHerdWeightKg * 0.026).toFixed(1) : '0');
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '0.88rem', color: '#1e293b' }}>
                    <div><strong>Breed:</strong> <span style={{ color: '#16a34a', fontWeight: 800 }}>{calcResult.breed?.name || selectedBreed?.name}</span></div>
                    <div><strong>Total cattle:</strong> <span style={{ fontWeight: 800 }}>{totalCattleCount} Head</span></div>
                    <div><strong>Total herd weight:</strong> <span style={{ fontWeight: 800 }}>{totalHerdWeightKg.toLocaleString()} kg</span></div>
                    <div><strong>Milk production:</strong> <span style={{ color: '#0284c7', fontWeight: 800 }}>{totalDailyMilkL} L/day</span></div>
                    <div><strong>Dry-matter required:</strong> <span style={{ fontWeight: 800, color: '#15803d' }}>{dmiVal} kg/day</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Thermometer size={16} color="#d97706" />
                      <span><strong>Temperature:</strong> {Math.round(weather?.tempC || 33)}°C</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Droplets size={16} color="#0284c7" />
                      <span><strong>Humidity:</strong> {weather?.humidity || 69}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Droplet size={16} color="#0284c7" />
                      <span><strong>Water available:</strong> {waterVolume} L/day</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 2. TODAY'S FEED RECOMMENDATION TABLE */}
            <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <h4 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wheat size={22} color="#15803d" />
                  <span>Today's Feed Recommendation &amp; Practical Action Plan</span>
                </h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 10px', fontWeight: 600 }}>
                Selected farm feeds inventory:
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                {selectedFeeds.map((f, i) => (
                  <span key={i} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Leaf size={14} color="#16a34a" />
                    <span>{f.name}</span>
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
                  <div style={{
                    background: isAllOk ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: `2px solid ${isAllOk ? '#86efac' : '#fcd34d'}`,
                    borderRadius: '16px',
                    padding: '18px 22px',
                    marginBottom: '22px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '1.75rem' }}>{isAllOk ? <CheckCircle2 size={24} color="#16a34a" /> : <AlertTriangle size={24} color="#d97706" />}</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: isAllOk ? '#166534' : '#92400e' }}>
                          {isAllOk ? 'All Okay! Feeding Plan for Today' : 'Today\'s Feeding Advice (Simple English Guide)'}
                        </h4>
                        <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: isAllOk ? '#15803d' : '#b45309', fontWeight: 600 }}>
                          {isAllOk 
                            ? 'All feed amounts match what your herd needs. Keep feeding as planned today!' 
                            : 'Here is what you should increase or decrease today in simple words:'}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Shortages: Feed more */}
                      {shortages.map((r, i) => {
                        const userKg = r.userProvidedKg !== undefined ? Number(r.userProvidedKg) : (Number(selectedFeeds?.find(f => f.name?.toLowerCase() === r.name?.toLowerCase())?.quantityKg) || 0);
                        const neededKg = Number(r.recommendedKg) || 0;
                        const diffKg = r.differenceKg !== undefined ? Number(r.differenceKg) : Math.round((neededKg - userKg) * 10) / 10;
                        return (
                          <div key={`short-${i}`} style={{
                            background: '#ffffff',
                            border: '1.5px solid #f87171',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 900, padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                              FEED MORE TODAY
                            </span>
                            <span style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                              You should feed <strong>+{diffKg.toFixed(1)} kg more of {r.name}</strong> today (give <strong>{neededKg.toFixed(1)} kg total</strong>, currently at {userKg.toFixed(1)} kg).
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
                          <div key={`surp-${i}`} style={{
                            background: '#ffffff',
                            border: '1.5px solid #93c5fd',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{ background: '#dbeafe', color: '#1d4ed8', fontWeight: 900, padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                              DECREASE THIS
                            </span>
                            <span style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                              You can decrease <strong>{r.name}</strong> by <strong>{Math.abs(diffKg).toFixed(1)} kg</strong> today (give <strong>{neededKg.toFixed(1)} kg total</strong>, currently giving {userKg.toFixed(1)} kg).
                            </span>
                          </div>
                        );
                      })}

                      {/* Covered: All okay */}
                      {covered.map((r, i) => {
                        const userKg = r.userProvidedKg !== undefined ? Number(r.userProvidedKg) : (Number(selectedFeeds?.find(f => f.name?.toLowerCase() === r.name?.toLowerCase())?.quantityKg) || 0);
                        return (
                          <div key={`cov-${i}`} style={{
                            background: '#ffffff',
                            border: '1.5px solid #86efac',
                            borderRadius: '10px',
                            padding: '8px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: 900, padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                              ALL OKAY
                            </span>
                            <span style={{ fontSize: '0.875rem', color: '#334155' }}>
                              <strong>{r.name}</strong> is just right ({userKg.toFixed(1)} kg). Keep giving this exact amount today.
                            </span>
                          </div>
                        );
                      })}

                      {/* Water and minerals note in simple English */}
                      <div style={{
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
                          <Droplets size={14} color="#0284c7" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /><strong>Water:</strong> Provide at least <strong>{waterVolume || 200} Litres</strong> of fresh clean drinking water today.
                        </div>
                        <div>
                          <strong>Minerals &amp; Salt:</strong> Add <strong>{calcResult.practicalFeedingReport?.mineralMixtureGrams || 250}g</strong> mineral mixture + <strong>{calcResult.practicalFeedingReport?.saltGrams || 150}g</strong> salt to today's ration.
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* 5-COLUMN PRACTICAL COMPARISON TABLE (WHAT YOU PUT vs WHAT HERD NEEDS vs EXTRA NEEDED) */}
              <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '12px 14px' }}>Feed Ingredient</th>
                      <th style={{ padding: '12px 14px' }}>Feed Type</th>
                      <th style={{ padding: '12px 14px', background: '#f1f5f9', color: '#1e293b' }}>What You Put (Input)</th>
                      <th style={{ padding: '12px 14px', background: '#f0fdf4', color: '#166534' }}>What Herd Needs (Recommendation)</th>
                      <th style={{ padding: '12px 14px' }}>Shortage / Extra Feed You Need</th>
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
                            {stripEmojis(rec.name)}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.825rem' }}>
                            {rec.category} ({rec.dmPct}% DM)
                          </td>
                          <td style={{ padding: '12px 14px', color: '#0f172a', fontWeight: 800, background: '#f8fafc' }}>
                            {userKg > 0 ? `${userKg.toFixed(1)} kg / day` : '0.0 kg / day'}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#15803d', fontWeight: 800, background: '#f0fdf4' }}>
                            {neededKg.toFixed(1)} kg / day
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
                                +{diffKg.toFixed(1)} kg extra needed
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
                                {Math.abs(diffKg).toFixed(1)} kg surplus
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
                                Covered ({neededKg.toFixed(1)} kg)
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
                            {displayName}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#047857', fontSize: '0.825rem' }}>
                            Grazing Forage (22% DM · Estimated)
                          </td>
                          <td style={{ padding: '12px 14px', color: '#065f46', fontWeight: 800, background: '#ecfdf5' }}>
                            Grazing Access · Estimated
                          </td>
                          <td style={{ padding: '12px 14px', color: '#065f46', fontWeight: 800, background: '#d1fae5' }}>
                            {pFresh.toFixed(1)} kg / day ({pDm.toFixed(2)} kg DM)
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
                              Covered by Grazing
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
                            Total Trough Fresh Feed To Mix Today (Harvested: {troughDm.toFixed(2)} kg DM):
                          </td>
                          <td style={{ padding: '14px', color: '#1e293b', fontWeight: 900, fontSize: '0.95rem', background: '#e2e8f0' }}>
                            {totalUserProvidedKg.toFixed(1)} kg / day
                          </td>
                          <td style={{ padding: '14px', color: '#166534', fontWeight: 900, fontSize: '1.05rem', background: '#dcfce7' }}>
                            {totalFreshNeededKg.toFixed(1)} kg / day
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
                                +{totalHerdDiffKg.toFixed(1)} kg extra feed needed / day
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
                                {Math.abs(totalHerdDiffKg).toFixed(1)} kg surplus
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
                                100% Fully covered
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Total Herd DMI Balance Row (Problems 1 & 2: Dynamic status + Trough + Grazing current intake) */}
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
                            Total Herd Dry Matter Intake (Trough + Grazing):
                          </td>
                          <td style={{ padding: '14px', color: '#1e293b', fontWeight: 900, fontSize: '0.95rem', background: '#e2e8f0' }}>
                            <div>{currentTotalDm.toFixed(2)} kg DM / day</div>
                            {Number(calcResult.practicalFeedingReport?.totalPastureDmKg || 0) > 0 && (
                              <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
                                Trough: {Number(calcResult.practicalFeedingReport?.currentFeedDmKg || 0).toFixed(1)}kg + Grazing: {Number(calcResult.practicalFeedingReport?.totalPastureDmKg || 0).toFixed(1)}kg (Est.)
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '14px', color: isDeficient ? '#991b1b' : '#065f46', fontWeight: 900, fontSize: '1.05rem', background: isDeficient ? '#fee2e2' : '#d1fae5' }}>
                            {recDmiTotal.toFixed(2)} kg DM / day
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
                                DMI Target Met ({recDmiTotal.toFixed(1)} / {reqDmiTotal.toFixed(1)} kg DM)
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
                                Deficient (-{shortfall} kg DM / Incomplete)
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
                                Surplus (+{surplus} kg DM excess)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Minerals, Salt, and Water rows */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>Mineral mixture (DCP / Calcite)</td>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.825rem' }}>Macro/Micro minerals</td>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontWeight: 700, background: '#f8fafc' }}>0 grams / day</td>
                      <td style={{ padding: '10px 14px', color: '#15803d', fontWeight: 800, background: '#f0fdf4' }}>
                        {calcResult.practicalFeedingReport?.mineralMixtureGrams || 250} grams / day
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde047', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                          +{calcResult.practicalFeedingReport?.mineralMixtureGrams || 250} g needed
                        </span>
                      </td>
                    </tr>

                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>Common Iodized Salt</td>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.825rem' }}>Electrolytes & buffer</td>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontWeight: 700, background: '#f8fafc' }}>0 grams / day</td>
                      <td style={{ padding: '10px 14px', color: '#15803d', fontWeight: 800, background: '#f0fdf4' }}>
                        {calcResult.practicalFeedingReport?.saltGrams || 150} grams / day
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde047', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                          +{calcResult.practicalFeedingReport?.saltGrams || 150} g needed
                        </span>
                      </td>
                    </tr>

                    {(() => {
                      const waterReq = Math.round(Number(calcResult.waterAnalysis?.requiredLiters || calcResult.waterAnalysis?.waterRequiredLiters || calcResult.practicalFeedingReport?.waterLiters || 0));
                      const waterAvail = Math.round(Number(waterVolume) || 0);
                      const waterShortage = waterReq - waterAvail;
                      return (
                        <tr>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>Clean Drinking Water</td>
                          <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.825rem' }}>Ad-libitum in troughs</td>
                          <td style={{ padding: '10px 14px', color: '#0f172a', fontWeight: 700, background: '#f8fafc' }}>{waterAvail} litres / day</td>
                          <td style={{ padding: '10px 14px', color: '#0284c7', fontWeight: 800, background: '#f0f9ff' }}>
                            {waterReq} litres / day
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            {waterShortage > 0 ? (
                              <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                                +{waterShortage} L shortage
                              </span>
                            ) : (
                              <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                                Adequate
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
                  <strong>Farmer Quick Understanding:</strong>
                  <ul style={{ margin: '4px 0 0', paddingLeft: '18px', lineHeight: 1.5 }}>
                    <li><strong>What You Put (Input):</strong> What you currently have or provide to the farm daily.</li>
                    <li><strong>What Herd Needs (Recommendation):</strong> The total scientifically calculated feed your whole herd needs today.</li>
                    <li><strong>Shortage / Extra Needed:</strong> The additional feed you need to bring or buy today so your cattle do not suffer health decline or milk drop.</li>
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
                            Scientific Feeding Verdict
                          </span>
                          <strong style={{ fontSize: '1.15rem', color: textColor }}>
                            {status}
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
                        {isInfeasible ? 'Safety Gate: REJECTED (INFEASIBLE)' : (safetyGate.passed ? 'Safety Gate: PASSED' : 'Safety Gate: ADJUSTMENT NEEDED')}
                      </span>
                    </div>

                    <div style={{ marginTop: '8px', borderTop: `1px solid ${border}`, paddingTop: '10px' }}>
                      <p style={{ fontSize: '0.86rem', color: textColor, margin: '0 0 6px', fontWeight: 800 }}>
                        {isWellBalanced ? 'Why is this ration approved?' : 'Identified Safety & Nutritional Flags:'}
                      </p>
                      {safetyGate.failureReasons && safetyGate.failureReasons.length > 0 ? (
                        <ul style={{ margin: '4px 0 10px', paddingLeft: '20px', fontSize: '0.84rem', color: textColor, lineHeight: 1.6 }}>
                          {safetyGate.failureReasons.map((reason, idx) => (
                            <li key={idx}><strong>{reason}</strong></li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ fontSize: '0.84rem', color: textColor, margin: '0 0 8px', lineHeight: 1.5 }}>
                          {overall.reason || 'All physiological and safety constraints (DMI, Energy, Protein, NDF, Ca, P, and water) are balanced.'}
                        </p>
                      )}

                      {/* Safety Gate Checklist Grid */}
                      {safetyGate.checks && safetyGate.checks.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: textColor, display: 'block', marginBottom: '6px' }}>
                            PRE-REPORT SAFETY GATE VERIFICATION:
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
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
                                  {chk.passed ? 'PASSED' : 'FLAGGED'}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '32px' }}>
              
              {/* 3.1 MILKING COW */}
              {totalLactating > 0 && (
                <div style={{ background: '#ffffff', border: '1.5px solid #bae6fd', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.04)' }}>
                  {/* Category Header with Reference Image */}
                  <div style={{ display: 'flex', gap: '18px', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e0f2fe', flexWrap: 'wrap' }}>
                    <img 
                      src="/cattle_art/lactating.jpg" 
                      alt="Milking Cows" 
                      onError={(e) => { e.target.src = "/cattle_art/farm_summary.jpg"; }}
                      style={{ width: '100px', height: '72px', objectFit: 'cover', borderRadius: '12px', border: '1.5px solid #bae6fd', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <h4 style={{ fontSize: '1.25rem', color: '#0369a1', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Milk size={22} color="#0284c7" />
                          <span>Milking Cows ({totalLactating} Head)</span>
                        </h4>
                        <span style={{ fontSize: '0.825rem', color: '#0369a1', fontWeight: 700, background: '#e0f2fe', padding: '4px 12px', borderRadius: '20px' }}>
                          Total Milk: {totalDailyMilkL} Litres/day • Avg Weight: {Math.round(wtLactating / Math.max(1, totalLactating))} kg
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#475569' }}>
                        <strong>Cattle Reference:</strong> High-producing dairy cows require prioritized feed energy and bypass protein to sustain peak milk yield without losing body condition.
                      </p>
                    </div>
                  </div>

                  {/* Simple English Daily Guidelines */}
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '14px 16px', marginBottom: '18px' }}>
                    <div style={{ fontWeight: 800, color: '#0369a1', fontSize: '0.9rem', marginBottom: '6px' }}>
                      Milking Cow Feeding Rules (Simple Daily Guide):
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px', fontSize: '0.84rem', color: '#1e293b' }}>
                      <div>• <strong>Concentrate Rule:</strong> Feed 1 kg cattle feed for every 2 to 2.5 Litres of milk produced daily.</div>
                      <div>• <strong>Green Fodder:</strong> Give 20–25 kg fresh green fodder daily for vitamins and milk flow.</div>
                      <div>• <strong>Dry Straw / Hay:</strong> Feed 3–5 kg dry straw daily to support rumination and butterfat.</div>
                      <div>• <strong>Clean Water:</strong> Milking cows need 70–90 Litres of fresh water daily. Lack of water drops milk.</div>
                      <div>• <strong>Minerals &amp; Salt:</strong> Add 60–80 grams mineral mixture daily to prevent milk fever.</div>
                    </div>
                  </div>

                  {/* Individual Animal Table */}
                  {calcResult.practicalFeedingReport?.perCategory?.milkingCow?.animals?.length > 0 && (
                    <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#0369a1', display: 'block', marginBottom: '8px' }}>
                        Exact Daily Feeding for Each Individual Milking Cow:
                      </strong>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', background: '#ffffff', border: '1px solid #bae6fd', borderRadius: '10px', overflow: 'hidden' }}>
                        <thead>
                          <tr style={{ background: '#f0f9ff', borderBottom: '2px solid #bae6fd', textAlign: 'left', color: '#0369a1' }}>
                            <th style={{ padding: '10px 12px' }}>Cattle</th>
                            <th style={{ padding: '10px 12px' }}>Weight</th>
                            <th style={{ padding: '10px 12px' }}>Lactation & BCS</th>
                            <th style={{ padding: '10px 12px' }}>Milk Yield</th>
                            <th style={{ padding: '10px 12px' }}>Green Fodder (kg)</th>
                            <th style={{ padding: '10px 12px' }}>Dry Fodder (kg)</th>
                            <th style={{ padding: '10px 12px' }}>Concentrate (kg)</th>
                            <th style={{ padding: '10px 12px' }}>Mineral Mix (g)</th>
                            <th style={{ padding: '10px 12px' }}>Salt (g)</th>
                            <th style={{ padding: '10px 12px' }}>Water (L)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calcResult.practicalFeedingReport?.perCategory?.milkingCow?.animals.map((cow, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #e0f2fe', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                              <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>
                                <div>{stripEmojis(cow.title) || `Cow #${idx + 1}`}</div>
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
                                    {cow.parity}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 600 }}>
                                {cow.weightKg} kg
                              </td>
                              <td style={{ padding: '10px 12px', fontSize: '0.8rem' }}>
                                <div style={{ fontWeight: 700, color: '#0369a1' }}>{cow.stage || 'Mid lactation'}</div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                       
                                  <span style={{ 
                                    background: cow.bcs <= 2.5 ? '#fee2e2' : '#f1f5f9', 
                                    color: cow.bcs <= 2.5 ? '#b91c1c' : '#475569', 
                                    padding: '1px 6px', 
                                    borderRadius: '6px', 
                                    fontSize: '0.72rem', 
                                    fontWeight: 700 
                                  }}>
                                    BCS {cow.bcs ?? 3.0} {cow.bcs <= 2.5 ? '(Thin)' : ''}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                {cow.milkYieldL} L/day <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>({cow.milkFatPct}% fat)</span>
                              </td>
                              <td style={{ padding: '10px 12px', color: cow.isFeasible === false ? '#dc2626' : '#15803d', fontWeight: 800 }}>
                                {cow.isFeasible === false ? 'Incomplete' : `${cow.greenFodderKg} kg`}
                              </td>
                              <td style={{ padding: '10px 12px', color: cow.isFeasible === false ? '#dc2626' : '#854d0e', fontWeight: 700 }}>
                                {cow.isFeasible === false ? 'Incomplete' : `${cow.dryFodderKg} kg`}
                                {cow.isFeasible !== false && cow.dryFodderDetails && (
                                  <div style={{ fontSize: '0.72rem', color: '#a16207', fontWeight: 500, marginTop: '2px' }}>
                                    {cow.dryFodderDetails}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '10px 12px', color: cow.isFeasible === false ? '#dc2626' : '#0284c7', fontWeight: 900 }}>
                                <div>
                                  <span>{cow.isFeasible === false ? 'Feeds needed' : `${cow.concentrateKg} kg`}</span>
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
                                      {cow.concentrateDmPct}% DMI (Max safe 40%)
                                    </span>
                                  )}
                                </div>
                                {cow.isFeasible !== false && cow.concentrateDetails && (
                                  <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600, marginTop: '2px' }}>
                                    {cow.concentrateDetails}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>
                                {cow.mineralMixtureG} g
                              </td>
                              <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 700 }}>
                                {cow.saltG || 40} g
                              </td>
                              <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                {cow.waterLiters} L
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>Average per Cow:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem' }}>
                        <div>Green fodder — <strong>{calcResult.practicalFeedingReport?.perCategory?.milkingCow?.dailyFeeding?.greenFodderKg ?? 25} kg</strong></div>
                        <div>Dry fodder — <strong>{calcResult.practicalFeedingReport?.perCategory?.milkingCow?.dailyFeeding?.dryFodderKg ?? 4} kg</strong></div>
                        <div>Concentrate — <strong>{calcResult.practicalFeedingReport?.perCategory?.milkingCow?.dailyFeeding?.concentrateKg ?? 5} kg</strong></div>
                        <div>Mineral mixture — <strong>{calcResult.practicalFeedingReport?.perCategory?.milkingCow?.dailyFeeding?.mineralMixtureG ?? 70} g</strong></div>
                        <div>Water — <strong>{calcResult.practicalFeedingReport?.perCategory?.milkingCow?.dailyFeeding?.waterLiters ?? 75} L</strong></div>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>Herd Nutrition Balance:</strong>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.8rem' }}>
                        <div>Energy: <span style={{ fontWeight: 700, color: (calcResult.nutritionAnalysis?.energy?.status?.includes('Adequate') || calcResult.nutritionAnalysis?.energy?.status?.includes('Optimal')) ? '#15803d' : '#d97706' }}>{calcResult.nutritionAnalysis?.energy?.status?.split(' ')[0] || 'Adequate'}</span></div>
                        <div>Protein: <span style={{ fontWeight: 700, color: (calcResult.nutritionAnalysis?.protein?.status?.includes('Adequate') || calcResult.nutritionAnalysis?.protein?.status?.includes('Optimal')) ? '#15803d' : '#d97706' }}>{calcResult.nutritionAnalysis?.protein?.status?.split(' ')[0] || 'Adequate'}</span></div>
                        <div>Fibre: <span style={{ fontWeight: 700, color: (calcResult.nutritionAnalysis?.fibre?.status?.includes('Adequate') || calcResult.nutritionAnalysis?.fibre?.status?.includes('Optimal')) ? '#15803d' : '#d97706' }}>{calcResult.nutritionAnalysis?.fibre?.status?.split(' ')[0] || 'Adequate'}</span></div>
                        <div>Calcium: <span style={{ fontWeight: 700, color: calcResult.mineralsAnalysis?.calcium?.status === 'Adequate' ? '#15803d' : '#d97706' }}>{calcResult.mineralsAnalysis?.calcium?.status || 'Adequate'}</span></div>
                        <div>Phosphorus: <span style={{ fontWeight: 700, color: calcResult.mineralsAnalysis?.phosphorus?.status === 'Adequate' ? '#15803d' : '#d97706' }}>{calcResult.mineralsAnalysis?.phosphorus?.status || 'Adequate'}</span></div>
                        <div>Salt: <span style={{ fontWeight: 700, color: '#15803d' }}>Adequate</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3.2 PREGNANT CATTLE */}
              {totalPregnant > 0 && (
                <div style={{ background: '#ffffff', border: '1.5px solid #fed7aa', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(194, 65, 12, 0.04)' }}>
                  {/* Category Header with Reference Image */}
                  <div style={{ display: 'flex', gap: '18px', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #ffedd5', flexWrap: 'wrap' }}>
                    <img 
                      src="/cattle_art/pregnant.jpg" 
                      alt="Pregnant Cattle" 
                      onError={(e) => { e.target.src = "/cattle_art/farm_summary.jpg"; }}
                      style={{ width: '100px', height: '72px', objectFit: 'cover', borderRadius: '12px', border: '1.5px solid #fed7aa', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <h4 style={{ fontSize: '1.25rem', color: '#c2410c', fontWeight: 900, margin: 0 }}>
                          Pregnant Cattle ({totalPregnant} Animals: {totalFirstTime} First Pregnancy, {totalRepeat} Repeat)
                        </h4>
                        <span style={{ fontSize: '0.825rem', color: '#c2410c', fontWeight: 700, background: '#fff7ed', padding: '4px 12px', borderRadius: '20px' }}>
                          Gestation Stages: Months 1–9
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#7c2d12' }}>
                        <strong>Cattle Reference:</strong> Late gestation (months 7–9) requires steaming up with energy concentrates to build calf birthweight and colostrum. Months 1–6 need maintenance-level forage.
                      </p>
                    </div>
                  </div>

                  {/* Individual Pregnant Animal Table */}
                  {calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.animals?.length > 0 && (
                    <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#c2410c', display: 'block', marginBottom: '8px' }}>
                        Exact Daily Feeding for Each Pregnant Animal:
                      </strong>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', background: '#ffffff', border: '1px solid #fed7aa', borderRadius: '10px', overflow: 'hidden' }}>
                        <thead>
                          <tr style={{ background: '#fffaf5', borderBottom: '2px solid #fed7aa', textAlign: 'left', color: '#c2410c' }}>
                            <th style={{ padding: '10px 12px' }}>Animal</th>
                            <th style={{ padding: '10px 12px' }}>Type</th>
                            <th style={{ padding: '10px 12px' }}>Weight</th>
                            <th style={{ padding: '10px 12px' }}>Gestation Stage</th>
                            <th style={{ padding: '10px 12px' }}>Green Fodder (kg)</th>
                            <th style={{ padding: '10px 12px' }}>Dry Fodder (kg)</th>
                            <th style={{ padding: '10px 12px' }}>Concentrate (kg)</th>
                            <th style={{ padding: '10px 12px' }}>Mineral Mix (g)</th>
                            <th style={{ padding: '10px 12px' }}>Salt (g)</th>
                            <th style={{ padding: '10px 12px' }}>Water (L)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.animals.map((cow, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #ffedd5', background: idx % 2 === 0 ? '#ffffff' : '#fffaf5' }}>
                              <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>
                                {stripEmojis(cow.title) || `Pregnant #${idx + 1}`}
                              </td>
                              <td style={{ padding: '10px 12px', color: '#9a3412', fontWeight: 600 }}>
                                {cow.type}
                              </td>
                              <td style={{ padding: '10px 12px', color: '#475569' }}>
                                {cow.weightKg} kg
                              </td>
                              <td style={{ padding: '10px 12px' }}>
                                <span style={{ 
                                  fontWeight: 800, 
                                  color: cow.pregMonth >= 8 ? '#b91c1c' : cow.pregMonth >= 6 ? '#c2410c' : '#15803d' 
                                }}>
                                  {cow.stage || `Month ${cow.pregMonth}`}
                                </span>
                                {cow.pregMonth >= 8 ? (
                                  <span style={{ display: 'block', fontSize: '0.72rem', background: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: '6px', fontWeight: 700, marginTop: '2px', width: 'fit-content' }}>
                                    Steaming Up (Month {cow.pregMonth})
                                  </span>
                                ) : (
                                  <span style={{ display: 'block', fontSize: '0.72rem', background: '#f0fdf4', color: '#166534', padding: '1px 6px', borderRadius: '6px', fontWeight: 600, marginTop: '2px', width: 'fit-content' }}>
                                    Month {cow.pregMonth}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '10px 12px', color: '#15803d', fontWeight: 800 }}>
                                {cow.greenFodderKg} kg
                              </td>
                              <td style={{ padding: '10px 12px', color: '#854d0e', fontWeight: 700 }}>
                                {cow.dryFodderKg} kg
                                {cow.dryFodderDetails && (
                                  <div style={{ fontSize: '0.72rem', color: '#a16207', fontWeight: 500, marginTop: '2px' }}>
                                    {cow.dryFodderDetails}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 900 }}>
                                {cow.concentrateKg} kg
                                {cow.concentrateDetails && (
                                  <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600, marginTop: '2px' }}>
                                    {cow.concentrateDetails}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '10px 12px', color: '#475569' }}>
                                {cow.mineralMixtureG} g
                              </td>
                              <td style={{ padding: '10px 12px', color: '#475569' }}>
                                {cow.saltG || 35} g
                              </td>
                              <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                {cow.waterLiters} L
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div style={{ background: '#fffaf5', padding: '14px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>Average per Animal:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem' }}>
                        <div>Green fodder — <strong>{calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.dailyFeeding?.greenFodderKg ?? 20} kg</strong></div>
                        <div>Dry fodder — <strong>{calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.dailyFeeding?.dryFodderKg ?? 4} kg</strong></div>
                        <div>Concentrate — <strong>{calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.dailyFeeding?.concentrateKg ?? 2.5} kg</strong></div>
                        <div>Mineral mixture — <strong>{calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.dailyFeeding?.mineralMixtureG ?? 60} g</strong></div>
                        <div>Water — <strong>{calcResult.practicalFeedingReport?.perCategory?.pregnantCattle?.dailyFeeding?.waterLiters ?? 55} L</strong></div>
                      </div>
                    </div>

                    <div style={{ background: '#fffaf5', padding: '14px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#9a3412', display: 'block', marginBottom: '6px' }}>Why Pregnancy Stage Matters:</strong>
                      <p style={{ fontSize: '0.8rem', color: '#7c2d12', margin: 0, lineHeight: 1.4 }}>
                        A cow that is 5 months pregnant has lower fetal requirements and needs mostly fiber/green fodder. A cow in month 9 has rapid calf growth and needs higher concentrate density (steaming up) because rumen capacity decreases.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3.3 GROWING HEIFER */}
              {totalHeifers > 0 && (
                <div style={{ background: '#ffffff', border: '1.5px solid #bbf7d0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(21, 128, 61, 0.04)' }}>
                  {/* Category Header with Reference Image */}
                  <div style={{ display: 'flex', gap: '18px', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #dcfce7', flexWrap: 'wrap' }}>
                    <img 
                      src="/cattle_art/heifers.jpg" 
                      alt="Growing Heifers" 
                      onError={(e) => { e.target.src = "/cattle_art/farm_summary.jpg"; }}
                      style={{ width: '100px', height: '72px', objectFit: 'cover', borderRadius: '12px', border: '1.5px solid #bbf7d0', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <h4 style={{ fontSize: '1.25rem', color: '#15803d', fontWeight: 900, margin: 0 }}>
                          Growing Heifers ({totalHeifers} Head)
                        </h4>
                        <span style={{ fontSize: '0.825rem', color: '#15803d', fontWeight: 700, background: '#f0fdf4', padding: '4px 12px', borderRadius: '20px' }}>
                          Target Gain: 500–600 g/day
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#166534' }}>
                        <strong>Cattle Reference:</strong> Growing replacement heifers require balanced protein and minerals for skeletal frame growth without excess body fat deposition.
                      </p>
                    </div>
                  </div>

                  {/* Individual Heifer Table */}
                  {calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.animals?.length > 0 && (
                    <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#15803d', display: 'block', marginBottom: '8px' }}>
                        Exact Daily Feeding for Each Heifer:
                      </strong>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '10px', overflow: 'hidden' }}>
                        <thead>
                          <tr style={{ background: '#f0fdf4', borderBottom: '2px solid #bbf7d0', textAlign: 'left', color: '#15803d' }}>
                            <th style={{ padding: '10px 12px' }}>Heifer</th>
                            <th style={{ padding: '10px 12px' }}>Weight</th>
                            <th style={{ padding: '10px 12px' }}>Green Fodder (kg)</th>
                            <th style={{ padding: '10px 12px' }}>Dry Fodder (kg)</th>
                            <th style={{ padding: '10px 12px' }}>Concentrate (kg)</th>
                            <th style={{ padding: '10px 12px' }}>Mineral Mix (g)</th>
                            <th style={{ padding: '10px 12px' }}>Salt (g)</th>
                            <th style={{ padding: '10px 12px' }}>Water (L)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.animals.map((h, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #dcfce7', background: idx % 2 === 0 ? '#ffffff' : '#f0fdf4' }}>
                              <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>
                                {stripEmojis(h.title) || `Heifer #${idx + 1}`}
                              </td>
                              <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 600 }}>
                                {h.weightKg} kg
                              </td>
                              <td style={{ padding: '10px 12px', color: '#15803d', fontWeight: 800 }}>
                                {h.greenFodderKg} kg
                              </td>
                              <td style={{ padding: '10px 12px', color: '#854d0e', fontWeight: 700 }}>
                                {h.dryFodderKg} kg
                                {h.dryFodderDetails && (
                                  <div style={{ fontSize: '0.72rem', color: '#a16207', fontWeight: 500, marginTop: '2px' }}>
                                    {h.dryFodderDetails}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                {h.concentrateKg} kg
                                {h.concentrateDetails && (
                                  <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600, marginTop: '2px' }}>
                                    {h.concentrateDetails}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '10px 12px', color: '#475569' }}>
                                {h.mineralMixtureG} g
                              </td>
                              <td style={{ padding: '10px 12px', color: '#475569' }}>
                                {h.saltG || 25} g
                              </td>
                              <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                {h.waterLiters} L
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>Average per Heifer:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem' }}>
                        <div>Green fodder — <strong>{calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.dailyFeeding?.greenFodderKg ?? 15} kg</strong></div>
                        <div>Dry fodder — <strong>{calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.dailyFeeding?.dryFodderKg ?? 2.5} kg</strong></div>
                        <div>Concentrate — <strong>{calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.dailyFeeding?.concentrateKg ?? 1.5} kg</strong></div>
                        <div>Mineral mixture — <strong>{calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.dailyFeeding?.mineralMixtureG ?? 35} g</strong></div>
                        <div>Water — <strong>{calcResult.practicalFeedingReport?.perCategory?.growingHeifer?.dailyFeeding?.waterLiters ?? 30} L</strong></div>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>Result & Care:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                        <div>• Maintain steady daily growth</div>
                        <div>• Avoid overfeeding heavy concentrates</div>
                        <div>• Check mineral mixture balance</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3.4 DRY COW */}
              {totalDry > 0 && (
                <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(71, 85, 105, 0.04)' }}>
                  {/* Category Header with Reference Image */}
                  <div style={{ display: 'flex', gap: '18px', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                    <img 
                      src="/cattle_art/dry_cows.jpg" 
                      alt="Dry Cows" 
                      onError={(e) => { e.target.src = "/cattle_art/farm_summary.jpg"; }}
                      style={{ width: '100px', height: '72px', objectFit: 'cover', borderRadius: '12px', border: '1.5px solid #cbd5e1', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <h4 style={{ fontSize: '1.25rem', color: '#334155', fontWeight: 900, margin: 0 }}>
                          Dry Cows ({totalDry} Head)
                        </h4>
                        <span style={{ fontSize: '0.825rem', color: '#475569', fontWeight: 700, background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>
                          Dry Period: 45–60 Days
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#475569' }}>
                        <strong>Cattle Reference:</strong> Mammary gland involution and rumen rest period before next calving. Feed mostly high fiber forage and restrict heavy concentrates.
                      </p>
                    </div>
                  </div>

                  {/* Individual Dry Cow Table */}
                  {calcResult.practicalFeedingReport?.perCategory?.dryCow?.animals?.length > 0 && (
                    <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#475569', display: 'block', marginBottom: '8px' }}>
                        Exact Daily Feeding for Each Dry Cow:
                      </strong>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left', color: '#475569' }}>
                            <th style={{ padding: '10px 12px' }}>Dry Cow</th>
                            <th style={{ padding: '10px 12px' }}>Weight</th>
                            <th style={{ padding: '10px 12px' }}>Dry Period</th>
                            <th style={{ padding: '10px 12px' }}>Green Fodder (kg)</th>
                            <th style={{ padding: '10px 12px' }}>Dry Fodder (kg)</th>
                            <th style={{ padding: '10px 12px' }}>Concentrate (kg)</th>
                            <th style={{ padding: '10px 12px' }}>Mineral Mix (g)</th>
                            <th style={{ padding: '10px 12px' }}>Salt (g)</th>
                            <th style={{ padding: '10px 12px' }}>Water (L)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calcResult.practicalFeedingReport?.perCategory?.dryCow?.animals.map((d, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                              <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>
                                {stripEmojis(d.title) || `Dry Cow #${idx + 1}`}
                              </td>
                              <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 600 }}>
                                {d.weightKg} kg
                              </td>
                              <td style={{ padding: '10px 12px' }}>
                                <span style={{ fontWeight: 700, color: '#475569' }}>
                                  {d.dryDays} days dry
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
                                  {d.dryDays > 30 ? 'Far-off (Rumen rest)' : 'Close-up (Transition)'}
                                </span>
                              </td>
                              <td style={{ padding: '10px 12px', color: '#15803d', fontWeight: 800 }}>
                                {d.greenFodderKg} kg
                              </td>
                              <td style={{ padding: '10px 12px', color: '#854d0e', fontWeight: 700 }}>
                                {d.dryFodderKg} kg
                                {d.dryFodderDetails && (
                                  <div style={{ fontSize: '0.72rem', color: '#a16207', fontWeight: 500, marginTop: '2px' }}>
                                    {d.dryFodderDetails}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                {d.concentrateKg} kg
                                {d.concentrateDetails && (
                                  <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600, marginTop: '2px' }}>
                                    {d.concentrateDetails}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '10px 12px', color: '#475569' }}>
                                {d.mineralMixtureG} g
                              </td>
                              <td style={{ padding: '10px 12px', color: '#475569' }}>
                                {d.saltG || 30} g
                              </td>
                              <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                {d.waterLiters} L
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>Average per Cow:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem' }}>
                        <div>Green fodder — <strong>{calcResult.practicalFeedingReport?.perCategory?.dryCow?.dailyFeeding?.greenFodderKg ?? 20} kg</strong></div>
                        <div>Dry fodder — <strong>{calcResult.practicalFeedingReport?.perCategory?.dryCow?.dailyFeeding?.dryFodderKg ?? 4.5} kg</strong></div>
                        <div>Concentrate — <strong>{calcResult.practicalFeedingReport?.perCategory?.dryCow?.dailyFeeding?.concentrateKg ?? 1.2} kg</strong></div>
                        <div>Mineral mixture — <strong>{calcResult.practicalFeedingReport?.perCategory?.dryCow?.dailyFeeding?.mineralMixtureG ?? 45} g</strong></div>
                        <div>Water — <strong>{calcResult.practicalFeedingReport?.perCategory?.dryCow?.dailyFeeding?.waterLiters ?? 50} L</strong></div>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>Status:</strong>
                      <p style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, margin: '0 0 6px' }}>
                        Maintenance feeding required
                      </p>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                        Avoid excessive grains during dry period to prevent fat cow syndrome and metabolic disorders at calving.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3.5 BREEDING BULL */}
              {totalBulls > 0 && (
                <div style={{ background: '#ffffff', border: '1.5px solid #fca5a5', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(185, 28, 28, 0.04)' }}>
                  {/* Category Header with Reference Image */}
                  <div style={{ display: 'flex', gap: '18px', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #fee2e2', flexWrap: 'wrap' }}>
                    <img 
                      src="/cattle_art/bulls.jpg" 
                      alt="Breeding Bulls" 
                      onError={(e) => { e.target.src = "/cattle_art/farm_summary.jpg"; }}
                      style={{ width: '100px', height: '72px', objectFit: 'cover', borderRadius: '12px', border: '1.5px solid #fca5a5', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <h4 style={{ fontSize: '1.25rem', color: '#b91c1c', fontWeight: 900, margin: 0 }}>
                          Breeding Bulls &amp; Draught Cattle ({totalBulls} Head)
                        </h4>
                        <span style={{ fontSize: '0.825rem', color: '#b91c1c', fontWeight: 700, background: '#fef2f2', padding: '4px 12px', borderRadius: '20px' }}>
                          Basal Metabolism: +10%
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#7f1d1d' }}>
                        <strong>Cattle Reference:</strong> Breeding bulls and working oxen have higher basal metabolic rates. Feed balanced green roughage with moderate energy concentrate for reproductive vigor.
                      </p>
                    </div>
                  </div>

                  {/* Individual Bull Table */}
                  {calcResult.practicalFeedingReport?.perCategory?.bull?.animals?.length > 0 && (
                    <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#b91c1c', display: 'block', marginBottom: '8px' }}>
                        Exact Daily Feeding for Each Bull:
                      </strong>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', background: '#ffffff', border: '1px solid #fca5a5', borderRadius: '10px', overflow: 'hidden' }}>
                        <thead>
                          <tr style={{ background: '#fef2f2', borderBottom: '2px solid #fca5a5', textAlign: 'left', color: '#b91c1c' }}>
                            <th style={{ padding: '10px 12px' }}>Bull</th>
                            <th style={{ padding: '10px 12px' }}>Weight</th>
                            <th style={{ padding: '10px 12px' }}>Green Fodder (kg)</th>
                            <th style={{ padding: '10px 12px' }}>Dry Fodder (kg)</th>
                            <th style={{ padding: '10px 12px' }}>Concentrate (kg)</th>
                            <th style={{ padding: '10px 12px' }}>Mineral Mix (g)</th>
                            <th style={{ padding: '10px 12px' }}>Salt (g)</th>
                            <th style={{ padding: '10px 12px' }}>Water (L)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calcResult.practicalFeedingReport?.perCategory?.bull?.animals.map((b, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #fee2e2', background: idx % 2 === 0 ? '#ffffff' : '#fef2f2' }}>
                              <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>
                                {stripEmojis(b.title) || `Bull #${idx + 1}`}
                              </td>
                              <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 600 }}>
                                {b.weightKg} kg
                              </td>
                              <td style={{ padding: '10px 12px', color: '#15803d', fontWeight: 800 }}>
                                {b.greenFodderKg} kg
                              </td>
                              <td style={{ padding: '10px 12px', color: '#854d0e', fontWeight: 700 }}>
                                {b.dryFodderKg} kg
                                {b.dryFodderDetails && (
                                  <div style={{ fontSize: '0.72rem', color: '#a16207', fontWeight: 500, marginTop: '2px' }}>
                                    {b.dryFodderDetails}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                {b.concentrateKg} kg
                                {b.concentrateDetails && (
                                  <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600, marginTop: '2px' }}>
                                    {b.concentrateDetails}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '10px 12px', color: '#475569' }}>
                                {b.mineralMixtureG} g
                              </td>
                              <td style={{ padding: '10px 12px', color: '#475569' }}>
                                {b.saltG || 40} g
                              </td>
                              <td style={{ padding: '10px 12px', color: '#0284c7', fontWeight: 800 }}>
                                {b.waterLiters} L
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div style={{ background: '#fef2f2', padding: '14px', borderRadius: '12px', border: '1px solid #fca5a5' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>Average per Bull:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.825rem' }}>
                      <div>Green fodder — <strong>{calcResult.practicalFeedingReport?.perCategory?.bull?.dailyFeeding?.greenFodderKg ?? 25} kg</strong></div>
                      <div>Dry fodder — <strong>{calcResult.practicalFeedingReport?.perCategory?.bull?.dailyFeeding?.dryFodderKg ?? 5} kg</strong></div>
                      <div>Concentrate — <strong>{calcResult.practicalFeedingReport?.perCategory?.bull?.dailyFeeding?.concentrateKg ?? 1.8} kg</strong></div>
                      <div>Mineral mixture — <strong>{calcResult.practicalFeedingReport?.perCategory?.bull?.dailyFeeding?.mineralMixtureG ?? 50} g</strong></div>
                      <div>Water — <strong>{calcResult.practicalFeedingReport?.perCategory?.bull?.dailyFeeding?.waterLiters ?? 65} L</strong></div>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#b91c1c', margin: '8px 0 0', fontWeight: 600 }}>
                      * The bull should not receive the same high-energy concentrate level as the lactating cow.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* 4. WATER STATUS */}
            <div style={{ background: '#ffffff', border: '1.5px solid #bae6fd', borderRadius: '16px', padding: '24px', marginBottom: '28px', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.04)' }}>
              <h4 style={{ fontSize: '1.25rem', color: '#0369a1', fontWeight: 900, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Droplets size={22} color="#0284c7" />
                <span>Water Status &amp; Hydration</span>
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#0f172a', margin: '0 0 8px' }}>
                <strong>{waterVolume} L</strong> water available for <strong>{totalCattleCount}</strong> cattle (Average availability: <strong>{Math.round(waterVolume / Math.max(1, totalCattleCount))} L/animal/day</strong>)
              </p>

              <div style={{
                padding: '12px 16px',
                background: calcResult.waterAnalysis?.waterBalanceLiters < 0 ? '#fef2f2' : '#f0fdf4',
                border: calcResult.waterAnalysis?.waterBalanceLiters < 0 ? '1.5px solid #fca5a5' : '1.5px solid #86efac',
                borderRadius: '12px',
                marginTop: '8px'
              }}>
                <strong style={{ fontSize: '0.95rem', color: calcResult.waterAnalysis?.waterBalanceLiters < 0 ? '#b91c1c' : '#15803d', display: 'block', marginBottom: '4px' }}>
                  {calcResult.practicalFeedingReport?.waterStatus?.status || 'Water availability status'}
                </strong>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                  Available: <strong>{waterVolume} L/day</strong> • Calculated herd requirement: <strong>{calcResult.waterAnalysis?.waterRequiredLiters} L/day</strong>
                </div>
                {calcResult.waterAnalysis?.waterBalanceLiters < 0 && (
                  <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#dc2626', fontWeight: 800 }}>
                    Shortage: {Math.abs(calcResult.waterAnalysis?.waterBalanceLiters)} L/day
                  </div>
                )}
                <div style={{ marginTop: '6px', fontSize: '0.825rem', color: '#0f172a', fontWeight: 700 }}>
                  Farmer action: {calcResult.practicalFeedingReport?.waterStatus?.farmerAction}
                </div>
              </div>
            </div>

            {/* 5. WEATHER ADVISORY */}
            <div style={{ background: '#ffffff', border: '1.5px solid #fde047', borderRadius: '16px', padding: '24px', marginBottom: '28px', boxShadow: '0 2px 8px rgba(234, 179, 8, 0.04)' }}>
              <h4 style={{ fontSize: '1.15rem', color: '#854d0e', fontWeight: 900, margin: '0 0 6px' }}>
                {calcResult.practicalFeedingReport?.weatherAdvisory?.title || 'Warm Weather Today'}
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#a16207', margin: '0 0 12px', fontWeight: 700 }}>
                {Math.round(weather?.tempC || 33)}°C | {weather?.humidity || 69}% humidity (THI: {calcResult.climate?.thi})
              </p>

              <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '8px' }}>Recommended action:</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem', color: '#334155' }}>
                {calcResult.practicalFeedingReport?.weatherAdvisory?.recommendedActions?.map((act, i) => (
                  <div key={i}>{act}</div>
                ))}
              </div>
            </div>

            {/* 6. PRACTICAL FEED BALANCE (SIMPLE FARMER LANGUAGE) */}
            <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '28px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)' }}>
              <h4 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 900, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scale size={20} color="#15803d" />
                <span>Feed Balance (Are These Feeds Enough?)</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {calcResult.practicalFeedingReport?.feedBalanceSimple?.map((item, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0f172a', marginBottom: '4px' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: (item.icon === 'ok' || item.status?.toLowerCase().includes('adequate')) ? '#15803d' : '#d97706', marginBottom: item.detail ? '6px' : '0' }}>
                        {stripEmojis(item.status)}
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
                          Technical &amp; Laboratory View
                        </span>
                        <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 900, margin: 0 }}>
                          Scientific Nutritive Fractions &amp; Consolidated Minerals Matrix
                        </h3>
                      </div>
                      <p style={{ fontSize: '0.825rem', color: '#475569', margin: 0 }}>
                        Detailed 14 nutritive and protein fractions, 15 minerals profile, and Net Energy (NEL) calculations (available in full in the downloadable PDF report).
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
                        <span>{showTechnicalDetails ? 'Hide Laboratory Details' : 'Show Advanced Laboratory Analysis'}</span>
                      </button>
                    </div>
                  </div>

                  {showTechnicalDetails && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <span style={{ padding: '4px 10px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>
                          Diet DM: {dietTotals.dmKg || 0} kg
                        </span>
                        <span style={{ padding: '4px 10px', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#1e40af' }}>
                          Diet ME: {dietTotals.meMcal || 0} Mcal ({dietTotals.nelMcal || 0} NEL)
                        </span>
                        <span style={{ padding: '4px 10px', background: fndf.isSufficient ? '#f0fdf4' : '#fef2f2', border: fndf.isSufficient ? '1px solid #86efac' : '1px solid #fca5a5', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: fndf.isSufficient ? '#166534' : '#991b1b' }}>
                          Forage NDF: {fndf.forageNdfPct || 0}% ({fndf.isSufficient ? '>= 21% OK' : '< 21% Low'})
                        </span>
                      </div>

                  {/* TAB SELECTOR */}
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                    <button type="button" onClick={() => setKtTab('proximate')} style={tabBtnStyle('proximate')}>
                      14 Nutritive &amp; Protein Fractions
                    </button>
                    <button type="button" onClick={() => setKtTab('minerals')} style={tabBtnStyle('minerals')}>
                      15 Minerals Profile
                    </button>
                    <button type="button" onClick={() => setKtTab('energy')} style={tabBtnStyle('energy')}>
                      Net Energy (NEL) Matrix
                    </button>
                    <button type="button" onClick={() => setKtTab('ndf')} style={tabBtnStyle('ndf')}>
                      Forage NDF Buffer (&gt;21%)
                    </button>
                    <button type="button" onClick={() => setKtTab('water')} style={tabBtnStyle('water')}>
                      Free Water Intake
                    </button>
                    <button type="button" onClick={() => setKtTab('baselines')} style={tabBtnStyle('baselines')}>
                      Body Weight Targets
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
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
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
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
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
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
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
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                        {/* Feed Net Energy Box */}
                        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '14px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>Diet Net Energy (NEL) Supply</span>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#15803d', margin: '4px 0' }}>
                            {energy.feedNelMcal || 0} <span style={{ fontSize: '0.85rem' }}>Mcal/day</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#166534' }}>
                            Diet ME: {energy.dietMeMcal || 0} Mcal/day x 0.66
                          </div>
                        </div>

                        {/* Lactating Milk Energy Demand */}
                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>Milk Energy (NEL) Demand</span>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1d4ed8', margin: '4px 0' }}>
                            {energy.milkNeuseMcalPerDay || 0} <span style={{ fontSize: '0.85rem' }}>Mcal/day</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#1e40af' }}>
                            Milk NEL: {energy.milkNepMcalPerKg || 0} Mcal/kg (0.360 + 0.0969 x Fat%)
                          </div>
                        </div>

                        {/* Maintenance Energy Demand */}
                        <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '14px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase' }}>Maintenance NEL Demand</span>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7c3aed', margin: '4px 0' }}>
                            {energy.maintenanceNelMcal || 0} <span style={{ fontSize: '0.85rem' }}>Mcal/day</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6d28d9' }}>
                            Formula: 0.10 x BW^0.75 per animal
                          </div>
                        </div>

                        {/* Gestational Energy Demand */}
                        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>Gestational Demand</span>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#b45309', margin: '4px 0' }}>
                            {energy.gestNelMcalPerDay || 0} <span style={{ fontSize: '0.85rem' }}>Mcal/day</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#92400e' }}>
                            Conceptus Gain: {energy.gravidUterineGainKgDay || 0} kg/day | {energy.dryPeriodStage}
                          </div>
                        </div>

                        {/* Growth & Frame Energy Demand */}
                        <div style={{ background: '#fdf4ff', border: '1px solid #f0abfc', borderRadius: '12px', padding: '14px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#86198f', textTransform: 'uppercase' }}>Growth & Frame Demand</span>
                          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#a21caf', margin: '4px 0' }}>
                            {energy.growthNelMcal || 0} <span style={{ fontSize: '0.85rem' }}>Mcal/day</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#86198f' }}>
                            {energy.growthDescription || 'Heifer Frame Growth & Primiparous Gain'}
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '0.8rem', marginBottom: '14px' }}>
                          <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#059669' }}>Primiparous Target Weight:</strong>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '4px 0' }}>
                              {bwBaselines.primiparousTargetBwKg || 0} kg
                            </div>
                            <span style={{ fontSize: '0.725rem', color: '#64748b' }}>Mature BW x 85% | 4.5% BW Ref: {bwBaselines.primiparousRequiredAsFedKg || 0} kg/day</span>
                          </div>

                          <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#2563eb' }}>Multiparous Target Weight:</strong>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '4px 0' }}>
                              {bwBaselines.multiparousTargetBwKg || 0} kg
                            </div>
                            <span style={{ fontSize: '0.725rem', color: '#64748b' }}>Mature BW x 95% | 4.5% BW Ref: {bwBaselines.multiparousRequiredAsFedKg || 0} kg/day</span>
                          </div>

                          <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#7c3aed' }}>Moisture-Derived As-Fed:</strong>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '4px 0', color: '#7c3aed' }}>
                              {bwBaselines.moistureRequiredAsFedKg || 0} kg/day
                            </div>
                            <span style={{ fontSize: '0.725rem', color: '#64748b' }}>True requirement = DMI / (Diet DM% / 100) (Thumb-rule 4.5% BW: {bwBaselines.herdAsFedBaselineKg || 0} kg)</span>
                          </div>
                        </div>

                        <h5 style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 800, margin: '10px 0 6px' }}>
                          NRC DMI Equations Benchmarks:
                        </h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '0.775rem' }}>
                          <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <strong>Heifer Target DMI (Eq 20-10):</strong>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#047857' }}>{kt.dmiFormulations?.primiparousFarOffTargetDmiKg} kg DM/day</div>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>0.022 x MatBW x [1 - e^(-1.54*BW/MatBW)]</span>
                          </div>
                          <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <strong>Heifer Diet-Based DMI (Eq 20-11):</strong>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0284c7' }}>{kt.dmiFormulations?.heiferDietDmiKg} kg DM/day</div>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>0.0226 x MatBW - 0.082 x [NDF deviation]</span>
                          </div>
                          <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <strong>Lactating Target DMI (Eq 20-18):</strong>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#d97706' }}>{kt.dmiFormulations?.lactatingTargetDmiEqKg} kg DM/day</div>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>4% FCM &amp; Parity corrected</span>
                          </div>
                          <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <strong>Total Ingested DM:</strong>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#4338ca' }}>{kt.dmiFormulations?.totalDmIngestedKg} kg DM/day</div>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Trough: {kt.dmiFormulations?.troughDmKg} kg + Grazing: {kt.dmiFormulations?.grazingDmKg} kg</span>
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
                      {!feasibility.isFeasible ? 'Ration Feasibility Alert: Deficits Detected' : 'Feed Inclusion Advisory'}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: !feasibility.isFeasible ? '#b91c1c' : '#78350f', margin: '0 0 12px', fontWeight: 600 }}>
                    {feasibility.message}
                  </p>

                  {feasibility.missingNutrients && feasibility.missingNutrients.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                      {feasibility.missingNutrients.map((n, idx) => (
                        <div key={idx} style={{ background: '#ffffff', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', fontSize: '0.825rem' }}>
                          <strong style={{ color: '#b91c1c' }}>{n.nutrient || n.name || (typeof n === 'string' ? 'Deficit Alert' : 'Warning')}:</strong> {n.advice || n.message || (typeof n === 'string' ? n : '')}
                        </div>
                      ))}
                    </div>
                  )}

                  {feasibility.inclusionWarnings && feasibility.inclusionWarnings.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {feasibility.inclusionWarnings.map((w, idx) => (
                        <div key={idx} style={{ background: '#ffffff', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', fontSize: '0.825rem', color: '#92400e' }}>
                          <strong>{w.feed} Limit:</strong> {w.message}
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
                        Rumen Fiber Health & Acidosis Prevention (NRC & ICAR)
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
                      SARA Risk: {rfh.saraRisk}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 14px', lineHeight: 1.5 }}>
                    {rfh.advisory}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Forage NDF (fNDF)</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: rfh.forageNdfPct >= 19 ? '#15803d' : '#dc2626' }}>
                        {rfh.forageNdfPct}% <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>(Min 19%)</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Protects rumen buffering</div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Effective NDF (peNDF)</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: rfh.physicallyEffectiveNdfPct >= 21 ? '#15803d' : '#d97706' }}>
                        {rfh.physicallyEffectiveNdfPct}% <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>(Min 21%)</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Stimulates cud chewing</div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Total Dietary NDF</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: rfh.totalNdfPct <= 48 ? '#15803d' : '#d97706' }}>
                        {rfh.totalNdfPct}% <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>(Max 48%)</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Prevents rumen gut-fill limit</div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Est. Cud Chews</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                        ~{rfh.estimatedCudChewsPerDay?.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Chews / herd / day</div>
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
                        Agro-Climatic Feed Intelligence: {reg.zoneName}
                      </h4>
                    </div>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                      Location: {reg.detectedLocation || 'National'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0 0 14px' }}>
                    Scientifically recommended regional feeds and agro-byproducts suited for your local climate to optimize costs and milk solids.
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {/* Greens */}
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#166534', marginBottom: '6px' }}>
                        Top Regional Greens
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: '#334155', lineHeight: 1.4 }}>
                        {reg.topRegionalGreens?.map((g, i) => (
                          <li key={i} style={{ marginBottom: '4px' }}>
                            <strong>{g.name}</strong> ({g.cpPct}% CP)
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Dry Roughage */}
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#854d0e', marginBottom: '6px' }}>
                        Top Dry Roughages
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: '#334155', lineHeight: 1.4 }}>
                        {reg.topRegionalDry?.map((d, i) => (
                          <li key={i} style={{ marginBottom: '4px' }}>
                            <strong>{d.name}</strong>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Concentrates & Oil Cakes */}
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '6px' }}>
                        Top Oil Cakes & Byproducts
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: '#334155', lineHeight: 1.4 }}>
                        {reg.topRegionalConcentrates?.map((c, i) => (
                          <li key={i} style={{ marginBottom: '4px' }}>
                            <strong>{c.name}</strong> ({c.cpPct}% CP)
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
          <span>{t ? t('previous') : 'Previous'}</span>
        </button>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {onResetAllData && (
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all recorded farm data and start fresh?')) {
                  onResetAllData();
                }
              }} 
              className="btn-secondary" 
              style={{ padding: '12px 18px', color: '#dc2626', borderColor: '#fca5a5' }}
            >
              <span>Reset & Start New Record</span>
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
              title="Download recorded farm inputs in colorful PDF format"
            >
              <FileText size={18} color="#0284c7" />
              <span>Download Inputs (PDF)</span>
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
              title="Download generated feeding report in colorful PDF format"
            >
              <Download size={18} />
              <span>Download Feeding Report (PDF)</span>
            </button>
          )}

          {canGenerateNutrition && (
            <button onClick={generateCSV} className="btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} />
              <span>{t ? t('step10.download_csv') : 'Download CSV Report'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
