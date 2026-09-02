import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Step5DryCows({ 
  dryCowsData, 
  setDryCowsData, 
  defaultBreed, 
  onNext, 
  onPrev,
  t
}) {
  const baseWeight = defaultBreed ? defaultBreed.avgWeightCow : 500;

  const handleCountChange = (count) => {
    const num = Math.max(0, Math.min(count, 200));
    if (num > dryCowsData.length) {
      const newEntries = [];
      for (let i = dryCowsData.length; i < num; i++) {
        newEntries.push({
          id: Date.now() + i,
          weight: baseWeight,
          dryDays: 60
        });
      }
      setDryCowsData([...dryCowsData, ...newEntries]);
    } else if (num < dryCowsData.length) {
      setDryCowsData(dryCowsData.slice(0, num));
    }
  };

  const handleUpdateDryCow = (index, field, val) => {
    const updated = [...dryCowsData];
    updated[index] = { ...updated[index], [field]: val };
    setDryCowsData(updated);
  };

  return (
    <div className="wg-card animate-fade-in">
      {/* Visual Header Banner */}
      <div 
        className="step-banner"
        style={{
          background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
          border: '1.5px solid #d8b4fe'
        }}
      >
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: '#9333ea', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>{t ? t('step5.badge') : 'STEP 5 OF 9'}</span>
            <span style={{ fontSize: '0.825rem', color: '#7e22ce', fontWeight: 800 }}>{t ? t('step5.tag') : 'RESTING & DRY PERIOD'}</span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#581c87' }}>
            {t ? t('step5.title') : 'Dry Cow Management'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#6b21a8' }}>
            {t ? t('step5.subtitle') : 'Ensure proper body condition recovery and mammary involution during the non-milking rest period.'}
          </p>
        </div>

        <img 
          src="/cattle_art/dry_cows.jpg" 
          alt="Resting Dry Cow" 
          className="step-banner-img"
        />
      </div>

      {/* Count Input Box */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        background: '#ffffff',
        border: '2px solid #9333ea',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
            {t ? t('step5.count_label') : 'Number of Dry Cows'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
            {t ? t('step5.count_hint') : 'Non-lactating mature cows before next calving'}
          </p>
        </div>

        <input 
          type="number"
          min="0"
          max="200"
          value={dryCowsData.length}
          onChange={(e) => handleCountChange(parseInt(e.target.value) || 0)}
          style={{ 
            width: '110px', 
            fontSize: '1.25rem', 
            fontWeight: 800, 
            textAlign: 'center',
            color: '#9333ea',
            borderRadius: '10px',
            border: '2px solid #9333ea',
            padding: '8px 12px'
          }}
        />
      </div>

      {/* Dry Cow Cards */}
      {dryCowsData.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
          {dryCowsData.map((cow, idx) => (
            <div key={cow.id || idx} style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ background: '#f3e8ff', color: '#7e22ce', padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                  {t ? t('step5.cow_num', { num: idx + 1 }) : `Dry Cow ${idx + 1}`}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                    {t ? t('step5.body_weight') : 'Body Weight (kg)'}
                  </label>
                  <input 
                    type="number"
                    min="200" max="900"
                    value={cow.weight}
                    onChange={(e) => handleUpdateDryCow(idx, 'weight', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', fontWeight: 700, color: '#9333ea' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                    {t ? t('step5.dry_period_days') : 'Dry Period Duration (Days)'}
                  </label>
                  <input 
                    type="number"
                    min="0" max="180"
                    value={cow.dryDays}
                    onChange={(e) => handleUpdateDryCow(idx, 'dryDays', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', fontWeight: 700 }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
        <button onClick={onPrev} className="btn-secondary">
          <ChevronLeft size={18} />
          <span>{t ? t('previous') : 'Previous'}</span>
        </button>

        <button onClick={onNext} className="btn-primary">
          <span>{t ? t('next_step') : 'Next Step'}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
