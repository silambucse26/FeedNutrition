import React from 'react';
import { 
  Printer, ArrowLeft, Download, FileText, Scale, Milk, Droplet, 
  MapPin, CheckCircle2, ChevronRight, Info
} from 'lucide-react';
import { getBreedName } from '../data/breeds';

export default function Step10Review({ 
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
  onEditStep,
  onResetAllData,
  t
}) {
  // Herd calculations
  const totalHeifers = heifersData.length;
  const totalFirstTime = (pregnantCategory === 'firstTime' || pregnantCategory === 'both') ? firstTimeCattle.length : 0;
  const totalRepeat = (pregnantCategory === 'repeat' || pregnantCategory === 'both') ? repeatCattle.length : 0;
  const totalPregnant = totalFirstTime + totalRepeat;
  const totalLactating = lactatingData.length;
  const totalDry = dryCowsData.length;
  const totalBulls = bullsData.length;

  const totalCattleCount = totalHeifers + totalPregnant + totalLactating + totalDry + totalBulls;

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

  const formatGrazingSystemName = (sys) => {
    if (!sys) return 'Not specified';
    const map = {
      'no_grazing': t ? t('step7.opt_no_grazing') : 'No Grazing (Zero Grazing / Stall-Fed)',
      'farm_only': t ? t('step7.opt_farm_only') : 'Farm-Only Grazing',
      'outside': t ? t('step7.opt_outside') : 'Outside Grazing',
      'hill_forest': t ? t('step7.opt_hill_forest') : 'Hill / Forest Grazing',
      'open_field': t ? t('step7.opt_open_field') : 'Open Field Grazing'
    };
    return map[sys] || sys.replace(/_/g, ' ').toUpperCase();
  };

  // ========== CSV EXPORT (Exports ONLY user-filled data) ==========
  const generateCSV = () => {
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

    // --- SECTION 3: Herd Animals Inventory ---
    rows.push(['=== HERD ANIMALS INVENTORY ===']);
    rows.push(['Total Cattle Head', totalCattleCount]);
    rows.push(['Total Herd Biomass (kg)', totalHerdWeightKg]);
    if (totalDailyMilkL > 0) rows.push(['Total Daily Milk (L/day)', totalDailyMilkL]);
    rows.push([]);

    if (totalHeifers > 0) {
      rows.push(['--- HEIFERS (Total: ' + totalHeifers + ') ---']);
      rows.push(['Heifer #', 'Weight (kg)']);
      heifersData.forEach((h, i) => {
        rows.push([i + 1, h.weight || '']);
      });
      rows.push([]);
    }

    if (totalFirstTime > 0) {
      rows.push(['--- FIRST-TIME PREGNANT HEIFERS (Total: ' + totalFirstTime + ') ---']);
      rows.push(['Cattle #', 'Weight (kg)', 'Gestation Stage (Months / Days)']);
      firstTimeCattle.forEach((c, i) => {
        const stage = c.inputType === 'months' ? `${c.pregMonth || 0} months` : `${c.pregDays || 0} days`;
        rows.push([i + 1, c.weight || '', stage]);
      });
      rows.push([]);
    }

    if (totalRepeat > 0) {
      rows.push(['--- REPEAT / MULTIPAROUS PREGNANT COWS (Total: ' + totalRepeat + ') ---']);
      rows.push(['Cow #', 'Weight (kg)', 'Gestation Stage (Months / Days)']);
      repeatCattle.forEach((c, i) => {
        const stage = c.inputType === 'months' ? `${c.pregMonth || 0} months` : `${c.pregDays || 0} days`;
        rows.push([i + 1, c.weight || '', stage]);
      });
      rows.push([]);
    }

    if (totalLactating > 0) {
      rows.push(['--- LACTATING COWS (Total: ' + totalLactating + ') ---']);
      rows.push(['Cow #', 'Weight (kg)', 'Milk Yield (L/day)', 'Fat (%)', 'BCS (1-5)', 'Lactation Stage']);
      lactatingData.forEach((c, i) => {
        rows.push([i + 1, c.weight || '', c.milkYield || '', c.milkFat || '', c.bcs || '', c.stage || '']);
      });
      rows.push([]);
    }

    if (totalDry > 0) {
      rows.push(['--- DRY COWS (Total: ' + totalDry + ') ---']);
      rows.push(['Cow #', 'Weight (kg)', 'Days in Dry Period']);
      dryCowsData.forEach((c, i) => {
        rows.push([i + 1, c.weight || '', c.dryDays || '']);
      });
      rows.push([]);
    }

    if (totalBulls > 0) {
      rows.push(['--- BULLS / DRAUGHT SIRES (Total: ' + totalBulls + ') ---']);
      rows.push(['Bull #', 'Weight (kg)']);
      bullsData.forEach((b, i) => {
        rows.push([i + 1, b.weight || '']);
      });
      rows.push([]);
    }

    // --- SECTION 4: Grazing Management ---
    rows.push(['=== GRAZING MANAGEMENT ===']);
    rows.push(['Grazing System', formatGrazingSystemName(grazingSystem)]);
    if (grazingSystem !== 'no_grazing' && grazingData) {
      rows.push(['Animal Category', 'Daily Grazing Hours', 'Distance Travelled (km)', 'Pasture / Area Type']);
      grazingCategories.forEach(cat => {
        const g = grazingData[cat.key];
        if (g && (g.hours > 0 || cat.count > 0)) {
          rows.push([cat.label, g.hours || 0, g.distance || 0, g.areaType || 'Pasture']);
        }
      });
    }
    rows.push([]);

    // --- SECTION 5: Water & Feed ---
    rows.push(['=== WATER & FEED RESOURCES ===']);
    if (waterVolume > 0 || waterSource) {
      rows.push(['Daily Water Volume (Liters)', waterVolume || 0]);
      rows.push(['Water Source', waterSource || 'N/A']);
      rows.push(['Water Quality', waterQuality || 'N/A']);
    }
    if (selectedFeeds && selectedFeeds.length > 0) {
      rows.push(['--- SELECTED FEED INGREDIENTS (' + selectedFeeds.length + ') ---']);
      rows.push(['Ingredient Name', 'Category', 'Quantity (kg/day)', 'Dry Matter (%)']);
      selectedFeeds.forEach(f => {
        rows.push([f.name || '', f.category || '', f.quantityKg || f.quantity || '', f.dmPct || f.dryMatter || '']);
      });
    }
    rows.push([]);

    // Convert to CSV string
    const csvContent = rows.map(row => 
      row.map(cell => {
        const str = String(cell === undefined || cell === null ? '' : cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ).join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FeedNutrition_FarmData_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="wg-card animate-fade-in" style={{ padding: '32px' }}>
      {/* Visual Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        border: '1.5px solid #bbf7d0',
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '28px',
        gap: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge-green">{t ? t('step10.badge') : 'FINAL STEP 10'}</span>
            <span style={{ fontSize: '0.825rem', color: '#16a34a', fontWeight: 800 }}>
              {t ? t('step10.tag') : 'FARM DATA SUMMARY'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.2 }}>
            {t ? t('step10.title') : 'Farm Data & Inventory Summary'}
          </h2>
          <p style={{ color: '#475569', fontSize: '0.925rem', margin: '0 0 16px 0', fontWeight: 500, lineHeight: 1.5 }}>
            {t ? t('step10.subtitle') : 'Review all farm parameters, animal groups, and resources you have recorded.'}
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handlePrint} className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
              <Printer size={16} />
              <span>{t ? t('step10.print_report') : 'Print Report'}</span>
            </button>

            <button onClick={generateCSV} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
              <Download size={16} />
              <span>{t ? t('step10.download_csv') : 'Download CSV'}</span>
            </button>

            {onResetAllData && (
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all recorded farm data and start fresh?')) {
                    onResetAllData();
                  }
                }} 
                className="btn-secondary" 
                style={{ padding: '10px 16px', fontSize: '0.85rem', color: '#dc2626', borderColor: '#fca5a5' }}
              >
                <span>Reset / Clear All Data</span>
              </button>
            )}
          </div>
        </div>

        <img 
          src="/cattle_art/farm_summary.jpg" 
          alt="Farm Summary" 
          style={{ 
            width: '160px', 
            height: '160px', 
            borderRadius: '20px', 
            objectFit: 'cover', 
            boxShadow: '0 10px 25px rgba(22, 163, 74, 0.25)',
            border: '4px solid #ffffff',
            flexShrink: 0
          }} 
        />
      </div>

      {/* Overview Quick Stats Bar (Only shows actual non-zero metrics) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
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

      {/* Detailed Form Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* 1. Farm Location & Environment */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
              {t ? t('step10.section_weather') : '1. Farm Location & Climate'}
            </h3>
            <button onClick={() => onEditStep(1)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              {t ? t('edit') : 'Edit'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>{t ? t('step10.location') : 'Location:'}</span>
              <strong style={{ color: '#0f172a' }}>{weather?.city || 'No location detected'}</strong>
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
                <span style={{ color: '#64748b' }}>THI Index:</span>
                <strong style={{ color: weather.thi > 78 ? '#dc2626' : '#16a34a' }}>{weather.thi}</strong>
              </div>
            )}
          </div>
        </div>

        {/* 2. Selected Breed */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
              {t ? t('steps.step_1') : 'Breed Selection'}
            </h3>
            <button onClick={() => onEditStep(1)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              {t ? t('edit') : 'Edit'}
            </button>
          </div>

          {selectedBreed ? (
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '10px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <img 
                src={selectedBreed.image} 
                alt={getBreedName(selectedBreed, t)} 
                style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #86efac' }} 
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

      {/* 3. Detailed Animal Categories (ONLY SHOWS WHAT IS ENTERED) */}
      <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
              {t ? t('step10.section_animals') : '2. Animals Inventory'}
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '2px 0 0' }}>
              Showing only the cattle categories and counts you entered.
            </p>
          </div>
          <span className="badge-green">{totalCattleCount} {t ? t('step10.head') : 'head total'}</span>
        </div>

        {totalCattleCount === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', color: '#64748b', fontSize: '0.9rem' }}>
            <Info size={20} style={{ display: 'block', margin: '0 auto 6px', color: '#94a3b8' }} />
            No animal records entered yet. Use the steps above to add your heifers, pregnant cows, lactating herd, or bulls.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* HEIFERS */}
            {totalHeifers > 0 && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                    🌱 {t ? t('step7.heifers') : 'Heifers'} ({totalHeifers} head)
                  </strong>
                  <button onClick={() => onEditStep(2)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>Edit</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {heifersData.map((h, i) => (
                    <span key={h.id || i} style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', color: '#334155' }}>
                      #{i + 1}: <strong>{h.weight} kg</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* PREGNANT COWS */}
            {totalPregnant > 0 && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                    🤰 {t ? t('step7.pregnant') : 'Pregnant Cows'} ({totalPregnant} head)
                  </strong>
                  <button onClick={() => onEditStep(3)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>Edit</button>
                </div>

                {totalFirstTime > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>First-Time Pregnant ({totalFirstTime}):</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                      {firstTimeCattle.map((c, i) => (
                        <span key={c.id || i} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', color: '#166534' }}>
                          #{i + 1}: {c.weight} kg • {c.inputType === 'months' ? `${c.pregMonth || 0} mos` : `${c.pregDays || 0} days`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {totalRepeat > 0 && (
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Repeat / Multiparous ({totalRepeat}):</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                      {repeatCattle.map((c, i) => (
                        <span key={c.id || i} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', color: '#1e40af' }}>
                          #{i + 1}: {c.weight} kg • {c.inputType === 'months' ? `${c.pregMonth || 0} mos` : `${c.pregDays || 0} days`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* LACTATING COWS */}
            {totalLactating > 0 && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                    🥛 {t ? t('step7.lactating') : 'Lactating Cows'} ({totalLactating} head • {totalDailyMilkL} L/day total)
                  </strong>
                  <button onClick={() => onEditStep(4)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>Edit</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {lactatingData.map((c, i) => (
                    <span key={c.id || i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#0f172a' }}>
                      <strong>Cow #{i + 1}</strong>: {c.weight} kg • <strong>{c.milkYield} L/day</strong> ({c.milkFat}% fat) • BCS {c.bcs} ({c.stage})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* DRY COWS */}
            {totalDry > 0 && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                    🍂 {t ? t('step7.dry') : 'Dry Cows'} ({totalDry} head)
                  </strong>
                  <button onClick={() => onEditStep(5)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>Edit</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {dryCowsData.map((c, i) => (
                    <span key={c.id || i} style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', color: '#854d0e' }}>
                      #{i + 1}: {c.weight} kg • {c.dryDays} dry days
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* BULLS */}
            {totalBulls > 0 && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                    🐂 {t ? t('step7.bulls') : 'Bulls / Sires'} ({totalBulls} head)
                  </strong>
                  <button onClick={() => onEditStep(6)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>Edit</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {bullsData.map((b, i) => (
                    <span key={b.id || i} style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', color: '#334155' }}>
                      Bull #{i + 1}: <strong>{b.weight} kg</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* 4. Grazing & Resources Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Grazing Management */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/cattle_art/grazing.jpg" alt="Grazing" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
                {t ? t('step10.section_grazing') : '3. Grazing Management'}
              </h3>
            </div>
            <button onClick={() => onEditStep(7)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              {t ? t('edit') : 'Edit'}
            </button>
          </div>

          <div style={{ marginBottom: '12px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '8px', fontSize: '0.85rem' }}>
            <span style={{ color: '#64748b' }}>{t ? t('step10.system') : 'System:'} </span>
            <strong style={{ color: '#16a34a' }}>{formatGrazingSystemName(grazingSystem)}</strong>
          </div>

          {grazingSystem !== 'no_grazing' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
              {grazingCategories.filter(cat => cat.count > 0 || (grazingData[cat.key]?.hours > 0)).map(cat => {
                const g = grazingData?.[cat.key] || {};
                return (
                  <div key={cat.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px' }}>
                    <strong style={{ color: '#0f172a' }}>{cat.label}:</strong>
                    <span style={{ color: '#475569' }}>
                      {g.hours || 0} hrs/day • {g.distance || 0} km • {g.areaType || 'Pasture'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: '0.825rem', color: '#64748b', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              {t ? t('step10.zero_grazing') : 'Zero grazing (stall fed only)'}
            </div>
          )}
        </div>

        {/* Feed & Water Resources */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/cattle_art/feed.jpg" alt="Feed" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
                {t ? t('step10.section_feed_water') : '4. Water & Feed Ingredients'}
              </h3>
            </div>
            <button onClick={() => onEditStep(9)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              {t ? t('edit') : 'Edit'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ padding: '8px 12px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ color: '#0369a1', fontWeight: 600 }}>Daily Water Volume:</span>
                <strong style={{ color: '#0284c7' }}>{waterVolume > 0 ? `${waterVolume} L/day` : 'Not recorded'}</strong>
              </div>
              {waterSource && (
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Source: {waterSource} • Quality: {waterQuality || 'Normal'}
                </span>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ color: '#0f172a', fontSize: '0.85rem' }}>Feed Ingredients:</strong>
                <span className="badge-green">{selectedFeeds.length} selected</span>
              </div>

              {selectedFeeds.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedFeeds.map((f, i) => (
                    <div key={f.id || i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{f.name}</span>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>
                        {f.quantityKg || f.quantity || 0} kg/day <span style={{ color: '#94a3b8', fontWeight: 400 }}>({f.dmPct || f.dryMatter || 0}% DM)</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>No feed ingredients selected yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Navigation: Back + Download CSV */}
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

          <button onClick={generateCSV} className="btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} />
            <span>{t ? t('step10.download_csv') : 'Download CSV Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
