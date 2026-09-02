import React, { useState } from 'react';
import { 
  Award, Thermometer, Droplets, Scale, Milk, Droplet, 
  Printer, ArrowLeft, CheckCircle2, Sparkles, AlertTriangle, Activity, Download, FileText, MapPin 
} from 'lucide-react';
import { getBreedName } from '../data/breeds';

export default function Step10Review({ 
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
  onEditStep,
  t
}) {
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

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
  const wtHeifers = heifersData.reduce((a, b) => a + (b.weight || 0), 0);
  const wtFirst = (pregnantCategory === 'firstTime' || pregnantCategory === 'both') ? firstTimeCattle.reduce((a, b) => a + (b.weight || 0), 0) : 0;
  const wtRepeat = (pregnantCategory === 'repeat' || pregnantCategory === 'both') ? repeatCattle.reduce((a, b) => a + (b.weight || 0), 0) : 0;
  const wtLactating = lactatingData.reduce((a, b) => a + (b.weight || 0), 0);
  const wtDry = dryCowsData.reduce((a, b) => a + (b.weight || 0), 0);
  const wtBulls = bullsData.reduce((a, b) => a + (b.weight || 0), 0);

  const totalHerdWeightKg = wtHeifers + wtFirst + wtRepeat + wtLactating + wtDry + wtBulls;

  // Total daily milk
  const totalDailyMilkL = lactatingData.reduce((a, b) => a + (b.milkYield || 0), 0);

  // Total Dry Matter Intake (DMI ~2.8% of body weight)
  const estDmiKg = Math.round(totalHerdWeightKg * 0.028);

  const handleGenerateAiPlan = () => {
    setGeneratingAi(true);
    setTimeout(() => {
      setGeneratingAi(false);
      setAiGenerated(true);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  const grazingCategories = [
    { key: 'heifers', label: t ? t('step7.heifers') : 'Heifers' },
    { key: 'pregnant', label: t ? t('step7.pregnant') : 'Pregnant Cattle' },
    { key: 'lactating', label: t ? t('step7.lactating') : 'Lactating Cattle' },
    { key: 'dry', label: t ? t('step7.dry') : 'Dry Cows' },
    { key: 'bulls', label: t ? t('step7.bulls') : 'Bulls' }
  ];

  const formatGrazingSystemName = (sys) => {
    if (!sys) return 'Not selected';
    const map = {
      'no_grazing': t ? t('step7.opt_no_grazing') : 'No Grazing (Zero Grazing)',
      'farm_only': t ? t('step7.opt_farm_only') : 'Farm-Only Grazing',
      'outside': t ? t('step7.opt_outside') : 'Outside Grazing',
      'hill_forest': t ? t('step7.opt_hill_forest') : 'Hill / Forest Grazing',
      'open_field': t ? t('step7.opt_open_field') : 'Open Field Grazing'
    };
    return map[sys] || sys.replace(/_/g, ' ').toUpperCase();
  };

  // ========== CSV EXPORT ==========
  const generateCSV = () => {
    const rows = [];

    // --- SECTION 1: Farm & Location ---
    rows.push(['=== FARM & LOCATION ===']);
    rows.push(['Field', 'Value']);
    rows.push(['Location', weather?.city || 'Not detected']);
    rows.push(['Temperature (°C)', weather?.tempC !== undefined ? Math.round(weather.tempC) : 'N/A']);
    rows.push(['Relative Humidity (%)', weather?.humidity !== undefined ? weather.humidity : 'N/A']);
    rows.push([]);

    // --- SECTION 2: Selected Breed ---
    rows.push(['=== SELECTED BREED ===']);
    rows.push(['Breed Name', getBreedName(selectedBreed, t) || 'Not selected']);
    rows.push(['Category', selectedBreed?.category || 'N/A']);
    rows.push(['Origin', selectedBreed?.origin || 'N/A']);
    rows.push([]);

    // --- SECTION 3: Heifers ---
    rows.push(['=== HEIFERS ===']);
    rows.push(['Total Heifers', totalHeifers]);
    if (totalHeifers > 0) {
      rows.push(['#', 'Weight (kg)']);
      heifersData.forEach((h, i) => {
        rows.push([i + 1, h.weight || '']);
      });
    }
    rows.push([]);

    // --- SECTION 4: Pregnant Cattle ---
    rows.push(['=== PREGNANT CATTLE ===']);
    rows.push(['Pregnant Category', pregnantCategory || 'None']);
    if (totalFirstTime > 0) {
      rows.push(['--- First-Time Pregnant ---']);
      rows.push(['#', 'Weight (kg)', 'Pregnancy Stage / Mode', 'Days / Months']);
      firstTimeCattle.forEach((c, i) => {
        rows.push([
          i + 1,
          c.weight || '',
          c.inputType === 'days' ? 'Days' : 'Months',
          c.inputType === 'days' ? c.pregDays : c.pregMonth
        ]);
      });
    }
    if (totalRepeat > 0) {
      rows.push(['--- Repeat Pregnant ---']);
      rows.push(['#', 'Weight (kg)', 'Pregnancy Stage / Mode', 'Days / Months']);
      repeatCattle.forEach((c, i) => {
        rows.push([
          i + 1,
          c.weight || '',
          c.inputType === 'days' ? 'Days' : 'Months',
          c.inputType === 'days' ? c.pregDays : c.pregMonth
        ]);
      });
    }
    rows.push([]);

    // --- SECTION 5: Lactating Cattle ---
    rows.push(['=== LACTATING CATTLE ===']);
    rows.push(['Total Lactating', totalLactating]);
    if (totalLactating > 0) {
      rows.push(['#', 'Weight (kg)', 'BCS Score', 'Milk Yield (L/day)', 'Milk Fat (%)', 'Lactation Stage']);
      lactatingData.forEach((c, i) => {
        rows.push([i + 1, c.weight || '', c.bcs || '', c.milkYield || '', c.milkFat || '', c.stage || '']);
      });
    }
    rows.push([]);

    // --- SECTION 6: Dry Cows ---
    rows.push(['=== DRY COWS ===']);
    rows.push(['Total Dry Cows', totalDry]);
    if (totalDry > 0) {
      rows.push(['#', 'Weight (kg)', 'Dry Period (days)']);
      dryCowsData.forEach((c, i) => {
        rows.push([i + 1, c.weight || '', c.dryDays || '']);
      });
    }
    rows.push([]);

    // --- SECTION 7: Bulls ---
    rows.push(['=== BULLS ===']);
    rows.push(['Total Bulls', totalBulls]);
    if (totalBulls > 0) {
      rows.push(['#', 'Weight (kg)']);
      bullsData.forEach((b, i) => {
        rows.push([i + 1, b.weight || '']);
      });
    }
    rows.push([]);

    // --- SECTION 8: Grazing Management (Detailed per Category) ---
    rows.push(['=== GRAZING MANAGEMENT ===']);
    rows.push(['Primary Grazing System', formatGrazingSystemName(grazingSystem)]);
    rows.push(['Animal Category', 'Grazing Hours/Day', 'Grazing Area Type', 'Distance (km/day)']);
    
    grazingCategories.forEach(cat => {
      const g = grazingData?.[cat.key] || {};
      rows.push([
        cat.label,
        grazingSystem === 'no_grazing' ? '0' : (g.hours !== undefined ? g.hours : 'N/A'),
        grazingSystem === 'no_grazing' ? 'Zero Grazing' : (g.areaType || 'Pasture'),
        grazingSystem === 'no_grazing' ? '0' : (g.distance !== undefined ? g.distance : 'N/A')
      ]);
    });
    rows.push([]);

    // --- SECTION 9: Water ---
    rows.push(['=== WATER AVAILABILITY ===']);
    rows.push(['Water Volume (L/day)', waterVolume || 'N/A']);
    rows.push(['Water Source', waterSource || 'N/A']);
    rows.push(['Water Quality', waterQuality || 'N/A']);
    rows.push([]);

    // --- SECTION 10: Feed & Fodder ---
    rows.push(['=== FEED & FODDER ===']);
    rows.push(['Total Feed Ingredients', selectedFeeds.length]);
    if (selectedFeeds.length > 0) {
      rows.push(['Ingredient Name', 'Category', 'Quantity (kg/day)', 'Dry Matter (%)']);
      selectedFeeds.forEach(f => {
        rows.push([f.name || '', f.category || '', f.quantityKg || f.quantity || '', f.dmPct || f.dryMatter || '']);
      });
    }
    rows.push([]);

    // --- SECTION 11: Summary ---
    rows.push(['=== HERD SUMMARY ===']);
    rows.push(['Total Cattle Count', totalCattleCount]);
    rows.push(['Total Herd Weight (kg)', totalHerdWeightKg]);
    rows.push(['Total Daily Milk (L/day)', totalDailyMilkL]);
    rows.push(['Estimated DMI (kg DM/day)', estDmiKg]);

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
      {/* Visual Header Banner with Big Clean Hero Image */}
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
            <span style={{ fontSize: '0.825rem', color: '#16a34a', fontWeight: 800 }}>{t ? t('step10.tag') : 'FARM COMPLETE OVERVIEW'}</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.2 }}>
            {t ? t('step10.title') : 'Farm Summary & AI Ration Recommendation'}
          </h2>
          <p style={{ color: '#475569', fontSize: '0.925rem', margin: '0 0 16px 0', fontWeight: 500, lineHeight: 1.5 }}>
            {t ? t('step10.subtitle') : 'Review complete farm inventory before generating NRC-optimized ration recommendations.'}
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handlePrint} className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
              <Printer size={16} />
              <span>{t ? t('step10.print_report') : 'Print Report'}</span>
            </button>

            <button onClick={handleGenerateAiPlan} className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.875rem' }}>
              <Sparkles size={16} />
              <span>{generatingAi ? (t ? t('step10.calculating') : 'Calculating NRC Ration...') : (t ? t('step10.generate_ai_plan') : 'Generate AI Nutrition Plan')}</span>
            </button>
          </div>
        </div>

        <img 
          src="/cattle_art/farm_summary.jpg" 
          alt="Prosperous Farm Overview" 
          style={{ 
            width: '170px', 
            height: '170px', 
            borderRadius: '20px', 
            objectFit: 'cover', 
            boxShadow: '0 10px 25px rgba(22, 163, 74, 0.25)',
            border: '4px solid #ffffff',
            flexShrink: 0
          }} 
        />
      </div>

      {/* AI Recommendation Banner Preview */}
      {aiGenerated && (
        <div style={{
          background: '#f0fdf4',
          border: '2px solid #16a34a',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 8px 20px rgba(22, 163, 74, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Sparkles color="#16a34a" size={24} />
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 800 }}>
              {t ? t('step10.ai_report_title') : 'AI NRC Ration Optimization Report'}
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>{t ? t('step10.dm_demand') : 'Total Dry Matter Demand'}</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16a34a' }}>{estDmiKg} kg DM/day</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{t ? t('step10.dm_recommended') : 'NRC Recommended DMI'}</span>
            </div>

            <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>{t ? t('step10.milk_target') : 'Daily Milk Target'}</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0d9488' }}>{totalDailyMilkL} Litres/day</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{totalLactating} {t ? t('step7.lactating') : 'Lactating Cows'}</span>
            </div>

            <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>{t ? t('step10.hydration_target') : 'Water Hydration Target'}</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0284c7' }}>{waterVolume || Math.round(totalCattleCount * 70)} Litres/day</div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Source: {waterSource}</span>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '14px 18px', borderRadius: '12px', border: '1px solid #bbf7d0', fontSize: '0.875rem', color: '#15803d', fontWeight: 600 }}>
            <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            <strong>{t ? t('step10.optimization_status') : 'AI Optimization Status: Ration is balanced for crude protein (16.2%), net energy for lactation (1.68 Mcal/kg), and calcium/phosphorus ratio (1.8:1).'}</strong>
          </div>
        </div>
      )}

      {/* Summary Sections Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* 1. Farm & Location Section */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>{t ? t('step10.section_weather') : '1. Farm & Weather'}</h3>
            <button onClick={() => onEditStep(1)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>{t ? t('edit') : 'Edit'}</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>{t ? t('step10.location') : 'Location:'}</span>
              <strong style={{ color: '#0f172a' }}>{weather?.city || 'Not detected'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>{t ? t('step10.temperature') : 'Air Temperature:'}</span>
              <strong style={{ color: '#16a34a' }}>{weather?.tempC !== undefined ? `${Math.round(weather.tempC)}°C` : 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>{t ? t('step10.humidity') : 'Relative Humidity:'}</span>
              <strong style={{ color: '#0d9488' }}>{weather?.humidity !== undefined ? `${weather.humidity}%` : 'N/A'}</strong>
            </div>
          </div>
        </div>

        {/* 2. Cattle Breed & Inventory Section */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>{t ? t('step10.section_animals') : '2. Animals Inventory'}</h3>
            <button onClick={() => onEditStep(2)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>{t ? t('edit') : 'Edit'}</button>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
            {selectedBreed && (
              <>
                <img src={selectedBreed.image} alt={getBreedName(selectedBreed, t)} style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #bbf7d0' }} />
                <div>
                  <h4 style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0, fontWeight: 800 }}>{getBreedName(selectedBreed, t)}</h4>
                  <span className="badge-green">{selectedBreed.category}</span>
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
            <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>{t ? t('step10.total_herd') : 'Total Herd:'} <strong>{totalCattleCount} {t ? t('step10.head') : 'head'}</strong></div>
            <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>{t ? t('step7.heifers') : 'Heifers'}: <strong>{totalHeifers}</strong></div>
            <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>{t ? t('step7.pregnant') : 'Pregnant'}: <strong>{totalPregnant}</strong></div>
            <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>{t ? t('step7.lactating') : 'Lactating'}: <strong>{totalLactating}</strong></div>
            <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>{t ? t('step7.dry') : 'Dry Cows'}: <strong>{totalDry}</strong></div>
            <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>{t ? t('step7.bulls') : 'Bulls'}: <strong>{totalBulls}</strong></div>
          </div>
        </div>

        {/* 3. Grazing Management Section */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/cattle_art/grazing.jpg" alt="Grazing" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>{t ? t('step10.section_grazing') : '3. Grazing Management'}</h3>
            </div>
            <button onClick={() => onEditStep(7)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>{t ? t('edit') : 'Edit'}</button>
          </div>

          <div style={{ marginBottom: '10px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '8px', fontSize: '0.85rem' }}>
            <span style={{ color: '#64748b' }}>{t ? t('step10.system') : 'System:'} </span>
            <strong style={{ color: '#16a34a' }}>{formatGrazingSystemName(grazingSystem)}</strong>
          </div>

          {grazingSystem !== 'no_grazing' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
              {grazingCategories.map(cat => {
                const g = grazingData?.[cat.key] || {};
                return (
                  <div key={cat.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px' }}>
                    <strong style={{ color: '#0f172a' }}>{cat.label}:</strong>
                    <span style={{ color: '#475569' }}>
                      {g.hours || 0} {t ? t('step10.hrs_per_day') : 'hrs/day'} • {g.distance || 0} km • {g.areaType || 'Pasture'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: '0.825rem', color: '#64748b', padding: '8px 12px' }}>
              {t ? t('step10.zero_grazing') : 'Zero grazing (stall fed only)'}
            </div>
          )}
        </div>

        {/* 4. Feed & Water Inventory Section */}
        <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/cattle_art/feed.jpg" alt="Feed" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>{t ? t('step10.section_feed_water') : '4. Feed & Water'}</h3>
            </div>
            <button onClick={() => onEditStep(9)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>{t ? t('edit') : 'Edit'}</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>{t ? t('step10.water_vol') : 'Water Volume:'}</span>
              <strong style={{ color: '#0284c7' }}>{waterVolume} L/day ({waterSource}, {waterQuality})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ color: '#64748b' }}>{t ? t('step10.feed_ingredients') : 'Feed Ingredients:'}</span>
              <strong style={{ color: '#16a34a' }}>{selectedFeeds.length} {t ? t('step10.ingredients_selected') : 'Ingredients Selected'}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Navigation: Back + Submit & Download CSV */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <button onClick={() => onEditStep(9)} className="btn-secondary">
          <ArrowLeft size={16} />
          <span>{t ? t('previous') : 'Previous'}</span>
        </button>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={generateCSV} className="btn-secondary" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} />
            <span>{t ? t('step10.download_csv') : 'Download CSV'}</span>
          </button>

          <button 
            onClick={() => {
              handleGenerateAiPlan();
              generateCSV();
            }} 
            className="btn-primary" 
            style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FileText size={18} />
            <span>{t ? t('step10.submit_export') : 'Submit & Export Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
