import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import WeightRangeSelect from './WeightRangeSelect';
import { COW_WEIGHT_RANGES, DRY_DAYS_RANGES, getMatchingRangeValue } from '../data/weightRanges';

export default function Step5DryCows({ 
  dryCowsData, 
  setDryCowsData, 
  defaultBreed, 
  acknowledgeStep,
  onNext, 
  onPrev,
  t
}) {
  const baseWeight = defaultBreed ? defaultBreed.avgWeightCow : 500;

  const [countInput, setCountInput] = useState(dryCowsData.length > 0 ? String(dryCowsData.length) : '');

  useEffect(() => {
    setCountInput(dryCowsData.length > 0 ? String(dryCowsData.length) : '');
  }, [dryCowsData.length]);

  const handleCountChange = (count) => {
    if (acknowledgeStep) acknowledgeStep();
    const num = Math.max(0, Math.min(count, 200));
    if (num > dryCowsData.length) {
      const newEntries = [];
      for (let i = dryCowsData.length; i < num; i++) {
        newEntries.push({
          id: Date.now() + i,
          weight: '',
          dryDays: 60
        });
      }
      setDryCowsData([...dryCowsData, ...newEntries]);
    } else if (num < dryCowsData.length) {
      setDryCowsData(dryCowsData.slice(0, num));
    }
  };

  const handleUpdateDryCow = (index, field, value) => {
    if (acknowledgeStep) acknowledgeStep();
    const updated = [...dryCowsData];
    updated[index] = { ...updated[index], [field]: value };
    setDryCowsData(updated);
  };

  return (
    <div className="wg-card animate-fade-in">
      {/* Visual Header Banner - Purple Theme */}
      <div 
        className="step-banner"
        style={{
          background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
          border: '1.5px solid #d8b4fe'
        }}
      >
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: '#9333ea', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
              {t ? t('step5.badge') : 'STEP 5 OF 9'}
            </span>
            <span style={{ fontSize: '0.825rem', color: '#7e22ce', fontWeight: 800 }}>
              {t ? t('step5.tag') : 'REST & RECOVERY HERD'}
            </span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#581c87' }}>
            {t ? t('step5.title') : 'Dry Cows Management'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#334155' }}>
            {t ? t('step5.subtitle') : 'Enter cows currently in non-lactating resting period (approx. 60 days before calving).'}
          </p>
        </div>

        <img 
          src="/cattle_art/dry_cows.jpg" 
          alt="Dry Cow" 
          className="step-banner-img"
        />
      </div>

      {/* Dry Cow Count Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        background: '#ffffff',
        border: dryCowsData.length === 0 ? '2px solid #d8b4fe' : '2px solid #9333ea',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1 1 200px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
            {t ? t('step5.count_label') : 'Number of Dry Cows'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
            {t ? t('step5.count_hint') : 'Cows in resting stage between lactations. Keep at 0 if none.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => handleCountChange(0)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              background: '#f8fafc',
              color: '#64748b',
              border: '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
          >
            {dryCowsData.length === 0 ? '0 Dry Cows' : 'Clear to 0 Dry Cows'}
          </button>

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
              width: '90px', 
              fontSize: '1.25rem', 
              fontWeight: 800, 
              textAlign: 'center',
              color: '#9333ea',
              borderRadius: '10px',
              border: '2px solid #9333ea',
              padding: '8px 10px'
            }}
          />
        </div>
      </div>

      {/* 0 Dry Cows Notice */}
      {dryCowsData.length === 0 && (
        <div style={{ padding: '14px 18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            No dry cows recorded on this farm. Enter the number above or click below to add.
          </span>
          <button 
            type="button" 
            onClick={() => handleCountChange(1)} 
            className="btn-secondary" 
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            + Add Dry Cow
          </button>
        </div>
      )}

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
                <WeightRangeSelect 
                  value={cow.weight}
                  onChange={(val) => handleUpdateDryCow(idx, 'weight', val)}
                  ranges={COW_WEIGHT_RANGES}
                  label={t ? t('step5.body_weight') : 'Body Weight (Range)'}
                  accentColor="#7e22ce"
                />

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>
                      {t ? t('step5.dry_period_days') : 'Dry Period Duration'} *
                    </label>
                    {cow.dryDays !== undefined && (
                      <span style={{ fontSize: '0.72rem', color: '#7e22ce', fontWeight: 800 }}>
                        Avg: {cow.dryDays} days
                      </span>
                    )}
                  </div>
                  <select
                    value={getMatchingRangeValue(cow.dryDays, DRY_DAYS_RANGES)}
                    onChange={(e) => {
                      const match = DRY_DAYS_RANGES.find(r => r.value === e.target.value);
                      if (match && match.avg !== '') {
                        handleUpdateDryCow(idx, 'dryDays', match.avg);
                      } else if (e.target.value === 'custom') {
                        // keep current
                      } else {
                        handleUpdateDryCow(idx, 'dryDays', 50);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 400,
                      color: '#000000',
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    {DRY_DAYS_RANGES.map((r, i) => (
                      <option key={i} value={r.value} style={{ color: '#000000', fontWeight: 400 }}>{r.label}</option>
                    ))}
                  </select>
                  {getMatchingRangeValue(cow.dryDays, DRY_DAYS_RANGES) === 'custom' && (
                    <input 
                      type="number" 
                      min="0" 
                      max="180" 
                      placeholder="e.g. 60"
                      value={cow.dryDays === undefined || cow.dryDays === '' ? '' : cow.dryDays} 
                      onFocus={(e) => {
                        if (e.target.value === '0') handleUpdateDryCow(idx, 'dryDays', '');
                        e.target.select();
                      }}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => handleUpdateDryCow(idx, 'dryDays', e.target.value === '' ? '' : (parseInt(e.target.value, 10) || 0))}
                      style={{ marginTop: '4px', width: '100%', padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, color: '#000000' }}
                    />
                  )}
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
            const hasEmpty = dryCowsData.length > 0 && dryCowsData.some(c => !c.weight || Number(c.weight) <= 0);
            if (hasEmpty) {
              alert('Please enter weights for all dry cows before proceeding.');
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
