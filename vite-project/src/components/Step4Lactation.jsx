import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import WeightRangeSelect from './WeightRangeSelect';
import { COW_WEIGHT_RANGES, MILK_YIELD_RANGES, MILK_FAT_RANGES, getMatchingRangeValue } from '../data/weightRanges';

export default function Step4Lactation({ 
  lactatingData, 
  setLactatingData, 
  defaultBreed, 
  acknowledgeStep,
  onNext, 
  onPrev,
  t
}) {
  const baseWeight = defaultBreed ? defaultBreed.avgWeightCow : 520;

  const [countInput, setCountInput] = useState(lactatingData.length > 0 ? String(lactatingData.length) : '');

  useEffect(() => {
    setCountInput(lactatingData.length > 0 ? String(lactatingData.length) : '');
  }, [lactatingData.length]);

  const handleCountChange = (count) => {
    if (acknowledgeStep) acknowledgeStep();
    const num = Math.max(0, Math.min(count, 200));
    if (num > lactatingData.length) {
      const newEntries = [];
      for (let i = lactatingData.length; i < num; i++) {
        newEntries.push({
          id: Date.now() + i,
          weight: '',
          bcs: 3.5,
          milkYield: '',
          milkFat: '',
          stage: 'Early lactation',
          lactationType: 'second_plus',
          isFirstLactation: false,
          milkPricePerLitre: ''
        });
      }
      setLactatingData([...lactatingData, ...newEntries]);
    } else if (num < lactatingData.length) {
      setLactatingData(lactatingData.slice(0, num));
    }
  };

  const handleUpdateCow = (index, fieldOrUpdates, value) => {
    if (acknowledgeStep) acknowledgeStep();
    setLactatingData(prev => {
      const updated = [...prev];
      if (typeof fieldOrUpdates === 'object' && fieldOrUpdates !== null) {
        updated[index] = { ...updated[index], ...fieldOrUpdates };
      } else {
        updated[index] = { ...updated[index], [fieldOrUpdates]: value };
      }
      return updated;
    });
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
      {/* Visual Header Banner - Blue Theme */}
      <div 
        className="step-banner"
        style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1.5px solid #7dd3fc'
        }}
      >
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: '#0284c7', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
              {t ? t('step4.badge') : 'STEP 4 OF 9'}
            </span>
            <span style={{ fontSize: '0.825rem', color: '#0369a1', fontWeight: 800 }}>
              {t ? t('step4.tag') : 'MILK PRODUCING HERD'}
            </span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#0c4a6e' }}>
            {t ? t('step4.title') : 'Lactating Cattle Management'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#334155' }}>
            {t ? t('step4.subtitle') : 'Record your milking cows, body condition scores, daily milk production (L/day), and milk fat %.'}
          </p>
        </div>

        <img 
          src="/cattle_art/lactating.jpg" 
          alt="Milking Cow" 
          className="step-banner-img"
        />
      </div>

      {/* Lactating Count Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        background: '#ffffff',
        border: '2px solid #0284c7',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1 1 200px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
            {t ? t('step4.count_label') : 'Number of Lactating Cows'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
            {t ? t('step4.count_hint') : 'Currently in-milk cows on the farm. Enter 0 if none.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {lactatingData.length > 0 && (
            <div style={{ fontSize: '0.9rem', color: '#0284c7', fontWeight: 800, background: '#f0f9ff', padding: '8px 14px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
              {t ? t('step4.total_milk', { litres: lactatingData.reduce((a, b) => a + (Number(b.milkYield) || 0), 0) }) : `Total Daily Milk: ${lactatingData.reduce((a, b) => a + (Number(b.milkYield) || 0), 0)} L/day`}
            </div>
          )}

          <input 
            type="number"
            min="0"
            max="200"
            placeholder="0"
            value={countInput}
            onFocus={(e) => {
              e.target.select();
            }}
            onWheel={(e) => e.target.blur()}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') {
                setCountInput('');
                handleCountChange(0);
                return;
              }
              const num = parseInt(raw, 10);
              if (!isNaN(num)) {
                const clamped = Math.max(0, Math.min(num, 200));
                setCountInput(num === 0 ? '0' : String(clamped));
                handleCountChange(clamped);
              }
            }}
            onBlur={() => {
              if (!countInput || countInput === '0') {
                setCountInput('');
                handleCountChange(0);
              }
            }}
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

      {/* 0 Lactating Cows Notice */}
      {lactatingData.length === 0 && (
        <div style={{ padding: '14px 18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            No lactating cows recorded on this farm. Enter the number above or click below to add.
          </span>
          <button 
            type="button" 
            onClick={() => handleCountChange(1)} 
            className="btn-secondary" 
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            + Add Lactating Cow
          </button>
        </div>
      )}

      {/* Lactating Cows List */}
      {lactatingData.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
          {lactatingData.map((cow, idx) => (
            <div key={cow.id || idx} style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '20px' }}>
              
              {/* Header / Summary Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                      {t ? t('step4.cow_num', { num: idx + 1 }) : `Milking Cow ${idx + 1}`}
                    </span>
                    <span style={{ 
                      background: (cow.lactationType === 'first_lactation' || cow.isFirstLactation) ? '#fef3c7' : '#f1f5f9', 
                      color: (cow.lactationType === 'first_lactation' || cow.isFirstLactation) ? '#92400e' : '#475569', 
                      padding: '2px 8px', 
                      borderRadius: '6px', 
                      fontSize: '0.72rem', 
                      fontWeight: 700 
                    }}>
                      {(cow.lactationType === 'first_lactation' || cow.isFirstLactation) ? '1st Lactation' : '2nd+ Lactation'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    Weight: {cow.weight} kg | {(cow.lactationType === 'first_lactation' || cow.isFirstLactation) ? '1st Lactation' : '2nd+ Lactation'} | BCS: {cow.bcs} | Milk: {cow.milkYield} L/day | Fat: {cow.milkFat}% | Stage: {cow.stage}
                  </div>
                </div>
              </div>

              {/* Inputs Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                
                {/* Body Weight */}
                <WeightRangeSelect 
                  value={cow.weight}
                  onChange={(val) => handleUpdateCow(idx, 'weight', val)}
                  ranges={COW_WEIGHT_RANGES}
                  label={t ? t('step4.body_weight') : 'Body Weight (Range)'}
                  accentColor="#0284c7"
                />

                {/* Lactation Parity (1st Lactation vs 2nd+ Lactation) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>
                      {t ? t('step4.lactation_type') : 'Lactation Parity / Type'} *
                    </label>
                    <span style={{ 
                      fontSize: '0.70rem', 
                      color: (cow.lactationType === 'first_lactation' || cow.isFirstLactation) ? '#0369a1' : '#16a34a', 
                      fontWeight: 800, 
                      background: (cow.lactationType === 'first_lactation' || cow.isFirstLactation) ? '#e0f2fe' : '#f0fdf4', 
                      padding: '1px 6px', 
                      borderRadius: '4px' 
                    }}>
                      {(cow.lactationType === 'first_lactation' || cow.isFirstLactation) ? '+20% Growth Allowance' : 'Mature Cow'}
                    </span>
                  </div>
                  <select
                    value={(cow.lactationType === 'first_lactation' || cow.isFirstLactation) ? 'first_lactation' : 'second_plus'}
                    onChange={(e) => {
                      const isFirst = e.target.value === 'first_lactation';
                      handleUpdateCow(idx, {
                        lactationType: isFirst ? 'first_lactation' : 'second_plus',
                        isFirstLactation: isFirst
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      border: '1.5px solid #cbd5e1',
                      background: (cow.lactationType === 'first_lactation' || cow.isFirstLactation) ? '#f0f9ff' : '#ffffff'
                    }}
                  >
                    <option value="first_lactation">{t ? t('step4.type_first') : '1st Lactation (First time milking / Primiparous)'}</option>
                    <option value="second_plus">{t ? t('step4.type_second_plus') : '2nd+ Lactation (More than first time / Multiparous)'}</option>
                  </select>
                </div>

                {/* Milk Yield */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>
                      {t ? t('step4.milk_yield') : 'Daily Milk Yield'} *
                    </label>
                    {cow.milkYield !== '' && (
                      <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 800 }}>
                        Avg: {cow.milkYield} L/day
                      </span>
                    )}
                  </div>
                  <select
                    value={getMatchingRangeValue(cow.milkYield, MILK_YIELD_RANGES)}
                    onChange={(e) => {
                      const match = MILK_YIELD_RANGES.find(r => r.value === e.target.value);
                      if (match && match.avg !== '') {
                        handleUpdateCow(idx, 'milkYield', match.avg);
                      } else if (e.target.value === 'custom') {
                        // Keep current or set to empty
                      } else {
                        handleUpdateCow(idx, 'milkYield', '');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 400,
                      color: '#000000',
                      border: cow.milkYield === '' ? '1.5px solid #f87171' : '1.5px solid #cbd5e1',
                      background: cow.milkYield === '' ? '#fff5f5' : '#ffffff'
                    }}
                  >
                    {MILK_YIELD_RANGES.map((r, i) => (
                      <option key={i} value={r.value} style={{ color: '#000000', fontWeight: 400 }}>{r.label}</option>
                    ))}
                  </select>
                  {getMatchingRangeValue(cow.milkYield, MILK_YIELD_RANGES) === 'custom' && (
                    <input 
                      type="number" 
                      step="0.5" 
                      placeholder="e.g. 15"
                      value={cow.milkYield === undefined ? '' : cow.milkYield} 
                      onFocus={(e) => {
                        if (e.target.value === '0') handleUpdateCow(idx, 'milkYield', '');
                        e.target.select();
                      }}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => handleUpdateCow(idx, 'milkYield', e.target.value === '' ? '' : (parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : ''))}
                      style={{ marginTop: '4px', width: '100%', padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, color: '#000000' }}
                    />
                  )}
                  {cow.milkYield === '' && (
                    <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                      * Milk yield required
                    </span>
                  )}
                </div>

                {/* Fat % */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>
                      {t ? t('step4.fat_pct') : 'Milk Fat %'} *
                    </label>
                    {cow.milkFat !== '' && (
                      <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 800 }}>
                        Avg: {cow.milkFat}%
                      </span>
                    )}
                  </div>
                  <select
                    value={getMatchingRangeValue(cow.milkFat, MILK_FAT_RANGES)}
                    onChange={(e) => {
                      const match = MILK_FAT_RANGES.find(r => r.value === e.target.value);
                      if (match && match.avg !== '') {
                        handleUpdateCow(idx, 'milkFat', match.avg);
                      } else if (e.target.value === 'custom') {
                        // Keep current
                      } else {
                        handleUpdateCow(idx, 'milkFat', '');
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 400,
                      color: '#000000',
                      border: !cow.milkFat ? '1.5px solid #f87171' : '1.5px solid #cbd5e1',
                      background: !cow.milkFat ? '#fff5f5' : '#ffffff'
                    }}
                  >
                    {MILK_FAT_RANGES.map((r, i) => (
                      <option key={i} value={r.value} style={{ color: '#000000', fontWeight: 400 }}>{r.label}</option>
                    ))}
                  </select>
                  {getMatchingRangeValue(cow.milkFat, MILK_FAT_RANGES) === 'custom' && (
                    <input 
                      type="number" 
                      step="0.1" 
                      placeholder="e.g. 4.2"
                      value={cow.milkFat === undefined ? '' : cow.milkFat} 
                      onFocus={(e) => {
                        if (e.target.value === '0') handleUpdateCow(idx, 'milkFat', '');
                        e.target.select();
                      }}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => handleUpdateCow(idx, 'milkFat', e.target.value === '' ? '' : (parseFloat(e.target.value) || ''))}
                      style={{ marginTop: '4px', width: '100%', padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, color: '#000000' }}
                    />
                  )}
                  {(!cow.milkFat || Number(cow.milkFat) <= 0) && (
                    <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                      * Fat % required
                    </span>
                  )}
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

        <button 
          onClick={() => {
            const hasEmpty = lactatingData.length > 0 && lactatingData.some(c => 
              !c.weight || Number(c.weight) <= 0 || 
              c.milkYield === '' || Number(c.milkYield) < 0 || 
              c.milkFat === '' || Number(c.milkFat) <= 0
            );
            if (hasEmpty) {
              alert('Please enter weight, milk yield, and fat percentage for all milking cows before proceeding.');
              return;
            }
            onNext();
          }} 
          className="btn-primary"
        >
          <span>{t ? t('next_step') : 'Next Step'}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
