import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Step4Lactation({ 
  lactatingData, 
  setLactatingData, 
  defaultBreed, 
  onNext, 
  onPrev,
  t
}) {
  const baseWeight = defaultBreed ? defaultBreed.avgWeightCow : 520;

  const handleCountChange = (count) => {
    const num = Math.max(0, Math.min(count, 200));
    if (num > lactatingData.length) {
      const newEntries = [];
      for (let i = lactatingData.length; i < num; i++) {
        newEntries.push({
          id: Date.now() + i,
          weight: baseWeight,
          bcs: 3.5,
          milkYield: 18,
          milkFat: 4.2,
          stage: 'Early lactation'
        });
      }
      setLactatingData([...lactatingData, ...newEntries]);
    } else if (num < lactatingData.length) {
      setLactatingData(lactatingData.slice(0, num));
    }
  };

  const handleUpdateCow = (index, field, val) => {
    const updated = [...lactatingData];
    updated[index] = { ...updated[index], [field]: val };
    setLactatingData(updated);
  };

  const getBcsLabel = (bcs) => {
    if (bcs <= 1.5) return t ? t('step4.bcs_1') : '1 - Very Thin';
    if (bcs <= 2.5) return t ? t('step4.bcs_2') : '2 - Thin';
    if (bcs <= 3.5) return t ? t('step4.bcs_3') : '3 - Good Condition';
    if (bcs <= 4.5) return t ? t('step4.bcs_4') : '4 - Fat / Overweight';
    return t ? t('step4.bcs_5') : '5 - Very Fat / Excellent Condition';
  };

  return (
    <div className="wg-card animate-fade-in">
      {/* Visual Header Banner */}
      <div 
        className="step-banner"
        style={{
          background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
          border: '1.5px solid #7dd3fc'
        }}
      >
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: '#0284c7', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>{t ? t('step4.badge') : 'STEP 4 OF 9'}</span>
            <span style={{ fontSize: '0.825rem', color: '#0369a1', fontWeight: 800 }}>{t ? t('step4.tag') : 'DAIRY & MILK YIELD'}</span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#0c4a6e' }}>
            {t ? t('step4.title') : 'Lactating Cows Management'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#075985' }}>
            {t ? t('step4.subtitle') : 'Optimize energy, protein, and calcium rations for high milk production and peak lactation.'}
          </p>
        </div>

        <img 
          src="/cattle_art/lactating.jpg" 
          alt="Lactating Dairy Cow" 
          className="step-banner-img"
        />
      </div>

      {/* Count Input Box */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        border: '2px solid #0284c7',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
            {t ? t('step4.count_label') : 'Number of Lactating Cows'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
            {t ? t('step4.count_hint') : 'Cows currently in active milking cycle'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {lactatingData.length > 0 && (
            <div style={{ fontSize: '0.9rem', color: '#0284c7', fontWeight: 800, background: '#f0f9ff', padding: '8px 14px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
              {t ? t('step4.total_milk', { litres: lactatingData.reduce((a, b) => a + (b.milkYield || 0), 0) }) : `Total Daily Milk: ${lactatingData.reduce((a, b) => a + (b.milkYield || 0), 0)} L/day`}
            </div>
          )}

          <input 
            type="number"
            min="0"
            max="200"
            value={lactatingData.length}
            onChange={(e) => handleCountChange(parseInt(e.target.value) || 0)}
            style={{ 
              width: '110px', 
              fontSize: '1.25rem', 
              fontWeight: 800, 
              textAlign: 'center',
              color: '#0284c7',
              borderRadius: '10px',
              border: '2px solid #0284c7',
              padding: '8px 12px'
            }}
          />
        </div>
      </div>

      {/* Lactating Cows List */}
      {lactatingData.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
          {lactatingData.map((cow, idx) => (
            <div key={cow.id || idx} style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
              
              {/* Header / Summary Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {t ? t('step4.cow_num', { num: idx + 1 }) : `Milking Cow ${idx + 1}`}
                  </span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    Weight: {cow.weight} kg | BCS: {cow.bcs} | Milk: {cow.milkYield} L/day | Fat: {cow.milkFat}% | Stage: {cow.stage}
                  </div>
                </div>
              </div>

              {/* Inputs Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                
                {/* Body Weight */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
                    {t ? t('step4.body_weight') : 'Body Weight (kg)'}
                  </label>
                  <input 
                    type="number"
                    min="200"
                    max="900"
                    value={cow.weight}
                    onChange={(e) => handleUpdateCow(idx, 'weight', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', fontWeight: 700, color: '#0284c7' }}
                  />
                </div>

                {/* Milk Yield */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
                    {t ? t('step4.milk_yield') : 'Milk Yield (Litres / day)'}
                  </label>
                  <input 
                    type="number"
                    min="0"
                    max="60"
                    step="0.5"
                    value={cow.milkYield}
                    onChange={(e) => handleUpdateCow(idx, 'milkYield', parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', fontWeight: 700, color: '#0284c7' }}
                  />
                </div>

                {/* Fat % */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
                    {t ? t('step4.fat_pct') : 'Milk Fat Percentage (%)'}
                  </label>
                  <input 
                    type="number"
                    min="2"
                    max="14"
                    step="0.1"
                    value={cow.milkFat}
                    onChange={(e) => handleUpdateCow(idx, 'milkFat', parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', fontWeight: 700 }}
                  />
                </div>

                {/* Lactation Stage */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>
                    {t ? t('step4.lactation_stage') : 'Lactation Stage'}
                  </label>
                  <select 
                    value={cow.stage}
                    onChange={(e) => handleUpdateCow(idx, 'stage', e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Early lactation">{t ? t('step4.stage_early') : 'Early lactation (Months 1-3)'}</option>
                    <option value="Mid lactation">{t ? t('step4.stage_mid') : 'Mid lactation (Months 4-6)'}</option>
                    <option value="Late lactation">{t ? t('step4.stage_late') : 'Late lactation (Months 7-10)'}</option>
                  </select>
                </div>

              </div>

              {/* Visual BCS Score Slider (1 - 5) */}
              <div style={{ marginTop: '16px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
                    {t ? t('step4.bcs_label') : 'Body Condition Score (BCS 1 to 5):'} <strong style={{ color: '#0284c7' }}>{getBcsLabel(cow.bcs)}</strong>
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0284c7' }}>BCS {cow.bcs}</span>
                </div>

                <input 
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={cow.bcs}
                  onChange={(e) => handleUpdateCow(idx, 'bcs', parseFloat(e.target.value) || 3.5)}
                  style={{ width: '100%' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: '#64748b', marginTop: '6px' }}>
                  <span>1 ({t ? t('step4.bcs_1') : 'Very Thin'})</span>
                  <span>2 ({t ? t('step4.bcs_2') : 'Thin'})</span>
                  <span>3 ({t ? t('step4.bcs_3') : 'Good'})</span>
                  <span>4 ({t ? t('step4.bcs_4') : 'Fat'})</span>
                  <span>5 ({t ? t('step4.bcs_5') : 'Very Fat'})</span>
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
