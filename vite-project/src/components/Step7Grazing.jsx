import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, Compass, Clock, MapPin } from 'lucide-react';

export default function Step7Grazing({ 
  grazingSystem, 
  setGrazingSystem, 
  grazingData = {}, 
  setGrazingData,
  heifersCount = 0,
  pregnantCount = 0,
  lactatingCount = 0,
  dryCount = 0,
  bullsCount = 0,
  acknowledgeStep,
  onNext, 
  onPrev,
  t
}) {
  const allCategories = [
    { key: 'heifers', label: t ? t('step7.heifers') : 'Heifers', count: heifersCount },
    { key: 'pregnant', label: t ? t('step7.pregnant') : 'Pregnant Cattle', count: pregnantCount },
    { key: 'lactating', label: t ? t('step7.lactating') : 'Lactating Cattle', count: lactatingCount },
    { key: 'dry', label: t ? t('step7.dry') : 'Dry Cows', count: dryCount },
    { key: 'bulls', label: t ? t('step7.bulls') : 'Bulls', count: bullsCount }
  ];

  // Only display categories that actually have animals on this farm
  const activeCategories = allCategories.filter(c => c.count > 0);
  const displayCategories = activeCategories.length > 0 ? activeCategories : allCategories;

  // Pre-populate sensible defaults on mount if any active category is uninitialized
  useEffect(() => {
    let needsUpdate = false;
    const initialCopy = { ...grazingData };

    displayCategories.forEach(cat => {
      const existing = initialCopy[cat.key];
      if (!existing || existing.hours === undefined || existing.hours === '') {
        needsUpdate = true;
        initialCopy[cat.key] = {
          location: existing?.location || 'inside',
          hours: existing?.location === 'outside' ? (existing.hours || 4) : 0,
          distance: existing?.location === 'outside' ? (existing.distance || 1.5) : 0
        };
      }
    });

    if (needsUpdate) {
      setGrazingData(initialCopy);
    }
  }, [displayCategories.length]);

  const handleUpdateCategory = (catKey, field, val) => {
    if (acknowledgeStep) acknowledgeStep();
    setGrazingData(prev => {
      const existing = prev[catKey] || { location: 'inside', hours: 0, distance: 0 };
      const updated = {
        ...existing,
        location: existing.location || 'inside',
        [field]: val
      };

      if (field === 'location') {
        if (val === 'none') {
          updated.hours = 0;
          updated.distance = 0;
        } else if (val === 'inside') {
          updated.distance = 0;
          // When choosing inside farm grazing, default to 0 hours
          if (updated.hours === undefined || updated.hours === '') {
            updated.hours = 0;
          }
        } else if (val === 'outside') {
          // If hours was 0, reset to 4, and give standard walking distance 1.5 km
          if (Number(updated.hours) === 0 || updated.hours === '' || updated.hours === undefined) {
            updated.hours = 4;
          }
          if (!updated.distance || Number(updated.distance) === 0) {
            updated.distance = 1.5;
          }
        }
      }

      return {
        ...prev,
        [catKey]: updated
      };
    });
  };

  const handleProceed = () => {
    for (const cat of displayCategories) {
      const d = grazingData[cat.key] || {};
      const loc = d.location || 'inside';
      const hoursVal = d.hours;

      if (hoursVal === undefined || hoursVal === '') {
        alert(`Please select or enter daily grazing time for ${cat.label}.`);
        return;
      }

      if (loc === 'outside') {
        const distVal = d.distance;
        if (distVal === undefined || distVal === '' || Number(distVal) <= 0) {
          alert(`Please select or enter walking distance (km/day) for ${cat.label} grazing outside the farm.`);
          return;
        }
      }
    }
    onNext();
  };

  const standardHourOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const standardDistanceOptions = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0];

  return (
    <div className="wg-card animate-fade-in">
      {/* Visual Header Banner */}
      <div 
        className="step-banner"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1.5px solid #bbf7d0'
        }}
      >
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge-green">{t ? t('step7.badge') : 'STEP 7 OF 9'}</span>
            <span style={{ fontSize: '0.825rem', color: '#15803d', fontWeight: 800 }}>{t ? t('step7.tag') : 'PASTURE & FORAGING'}</span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#14532d' }}>
            {t ? t('step7.title') : 'Grazing Management'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#334155' }}>
            {t ? t('step7.subtitle') : 'Select inside or outside farm grazing and choose daily grazing hours for each cattle group.'}
          </p>
        </div>

        <img 
          src="/cattle_art/grazing.jpg" 
          alt="Grazing Cattle" 
          className="step-banner-img"
        />
      </div>

      {/* Guide Notice */}
      <div style={{
        padding: '14px 18px',
        background: '#f0fdf4',
        border: '1.5px solid #86efac',
        borderRadius: '12px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <AlertCircle size={20} color="#16a34a" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ fontSize: '0.875rem', color: '#14532d' }}>
            Individual Grazing Per Cattle Group
          </strong>
          <p style={{ fontSize: '0.8rem', color: '#15803d', margin: '2px 0 0' }}>
            Select whether each cattle group grazes <strong>Inside the farm</strong> or <strong>Outside the farm</strong>, and choose daily grazing hours. Walking distance in km is only requested for cattle that graze outside.
          </p>
        </div>
      </div>

      {/* Active Grazing Details per Animal Category */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 800, marginBottom: '14px' }}>
          {t ? t('step7.details_heading') : 'Grazing Details per Animal Group'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {displayCategories.map(cat => {
            const d = grazingData[cat.key] || {};
            const loc = d.location || 'inside';
            const hoursVal = d.hours !== undefined ? d.hours : (loc === 'none' ? 0 : 4);
            const distVal = d.distance !== undefined ? d.distance : 1.5;
            const isOutside = loc === 'outside';
            const isStallFed = loc === 'none';

            // Check if hoursVal is in standard hour dropdown
            const isStandardHour = isStallFed || standardHourOptions.includes(Number(hoursVal));
            // Check if distVal is in standard distance dropdown
            const isStandardDist = standardDistanceOptions.includes(Number(distVal));

            return (
              <div 
                key={cat.key} 
                style={{ 
                  background: '#ffffff', 
                  border: isOutside ? '1.5px solid #fde68a' : isStallFed ? '1.5px solid #cbd5e1' : '1.5px solid #86efac', 
                  borderRadius: '14px', 
                  padding: '18px 20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: isOutside ? '#d97706' : isStallFed ? '#64748b' : '#16a34a'
                    }} />
                    <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                      {cat.label}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, background: '#f1f5f9', padding: '3px 10px', borderRadius: '12px' }}>
                      {cat.count} head on farm
                    </span>
                  </div>

                  <div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      background: isOutside ? '#fef3c7' : isStallFed ? '#f1f5f9' : '#dcfce7', 
                      color: isOutside ? '#b45309' : isStallFed ? '#475569' : '#15803d', 
                      padding: '4px 12px', 
                      borderRadius: '6px' 
                    }}>
                      {isOutside 
                        ? `🌲 Outside Farm • ${hoursVal} hrs/day • ${distVal} km` 
                        : (isStallFed || Number(hoursVal) === 0)
                          ? '🏡 Inside Farm • 0 hrs/day (Stall-fed)' 
                          : `🏡 Inside Farm • ${hoursVal} hrs/day`}
                    </span>
                  </div>
                </div>

                {/* Input Fields Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: isOutside ? 'repeat(auto-fit, minmax(200px, 1fr))' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  
                  {/* Field 1: Inside / Outside / Stall-Fed Selection */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
                      <MapPin size={13} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#16a34a' }} />
                      Grazing Location *
                    </label>
                    <select
                      value={loc}
                      onChange={(e) => handleUpdateCategory(cat.key, 'location', e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '9px 12px', 
                        borderRadius: '8px', 
                        border: '1.5px solid #cbd5e1', 
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        color: '#000000',
                        background: '#ffffff'
                      }}
                    >
                      <option value="inside" style={{ color: '#000000', fontWeight: 400 }}>🏡 1. Inside Farm Grazing</option>
                      <option value="outside" style={{ color: '#000000', fontWeight: 400 }}>🌲 2. Outside Farm Grazing</option>
                      <option value="none" style={{ color: '#000000', fontWeight: 400 }}>🏠 3. Stall-Fed / No Grazing</option>
                    </select>
                  </div>

                  {/* Field 2: Daily Grazing Time (Select Option) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
                      <Clock size={13} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#2563eb' }} />
                      Grazing Time (Hours / Day) *
                    </label>

                    {isStallFed ? (
                      <div style={{
                        padding: '9px 12px',
                        background: '#f1f5f9',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#64748b',
                        fontWeight: 600
                      }}>
                        0 hrs (Stall-fed / Zero Grazing)
                      </div>
                    ) : (
                      <select
                        value={isStandardHour ? hoursVal : 'custom'}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            handleUpdateCategory(cat.key, 'hours', 4);
                          } else {
                            handleUpdateCategory(cat.key, 'hours', parseFloat(e.target.value));
                          }
                        }}
                        style={{ 
                          width: '100%', 
                          padding: '9px 12px', 
                          borderRadius: '8px', 
                          border: '1.5px solid #cbd5e1', 
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          color: '#000000',
                          background: '#ffffff'
                        }}
                      >
                        <option value="0" style={{ color: '#000000' }}>0 hours / day (Inside Farm / Stall-fed)</option>
                        <option value="1" style={{ color: '#000000' }}>1 hour / day</option>
                        <option value="2" style={{ color: '#000000' }}>2 hours / day</option>
                        <option value="3" style={{ color: '#000000' }}>3 hours / day</option>
                        <option value="4" style={{ color: '#000000' }}>4 hours / day (Recommended standard)</option>
                        <option value="5" style={{ color: '#000000' }}>5 hours / day</option>
                        <option value="6" style={{ color: '#000000' }}>6 hours / day</option>
                        <option value="7" style={{ color: '#000000' }}>7 hours / day</option>
                        <option value="8" style={{ color: '#000000' }}>8 hours / day (Full-day grazing)</option>
                        <option value="9" style={{ color: '#000000' }}>9 hours / day</option>
                        <option value="10" style={{ color: '#000000' }}>10 hours / day</option>
                        {!isStandardHour && <option value="custom" style={{ color: '#000000' }}>Custom: {hoursVal} hrs/day</option>}
                      </select>
                    )}

                    {!isStallFed && !isStandardHour && (
                      <input 
                        type="number"
                        min="0.5"
                        max="24"
                        step="0.5"
                        placeholder="e.g. 4"
                        value={hoursVal === undefined || hoursVal === 0 ? '' : hoursVal}
                        onFocus={(e) => {
                          if (e.target.value === '0') handleUpdateCategory(cat.key, 'hours', '');
                          e.target.select();
                        }}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) => handleUpdateCategory(cat.key, 'hours', e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                        style={{
                          marginTop: '6px',
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #94a3b8',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#000000'
                        }}
                      />
                    )}
                  </div>

                  {/* Field 3: Walking Distance (km/day) — ONLY SHOWN IF OUTSIDE FARM */}
                  {isOutside && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
                        <Compass size={13} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#d97706' }} />
                        Walking Distance (km / day) *
                      </label>
                      <select
                        value={isStandardDist ? distVal : 'custom'}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            handleUpdateCategory(cat.key, 'distance', 1.5);
                          } else {
                            handleUpdateCategory(cat.key, 'distance', parseFloat(e.target.value));
                          }
                        }}
                        style={{ 
                          width: '100%', 
                          padding: '9px 12px', 
                          borderRadius: '8px', 
                          border: '1.5px solid #cbd5e1', 
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          color: '#000000',
                          background: '#ffffff'
                        }}
                      >
                        <option value="0.5" style={{ color: '#000000' }}>0.5 km / day (Nearby field)</option>
                        <option value="1.0" style={{ color: '#000000' }}>1.0 km / day</option>
                        <option value="1.5" style={{ color: '#000000' }}>1.5 km / day (Typical walk)</option>
                        <option value="2.0" style={{ color: '#000000' }}>2.0 km / day</option>
                        <option value="2.5" style={{ color: '#000000' }}>2.5 km / day</option>
                        <option value="3.0" style={{ color: '#000000' }}>3.0 km / day (Village perimeter)</option>
                        <option value="4.0" style={{ color: '#000000' }}>4.0 km / day</option>
                        <option value="5.0" style={{ color: '#000000' }}>5.0 km / day (Long range)</option>
                        {!isStandardDist && <option value="custom" style={{ color: '#000000' }}>Custom: {distVal} km</option>}
                      </select>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
        <button onClick={onPrev} className="btn-secondary">
          <ChevronLeft size={18} />
          <span>{t ? t('previous') : 'Previous'}</span>
        </button>

        <button onClick={handleProceed} className="btn-primary">
          <span>{t ? t('next_step') : 'Next Step'}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
