import React, { useState, useEffect } from 'react';
import { Scale, ChevronLeft, ChevronRight } from 'lucide-react';
import WeightRangeSelect from './WeightRangeSelect';
import { HEIFER_WEIGHT_RANGES } from '../data/weightRanges';

export default function Step2Heifers({ 
  heifersData, 
  setHeifersData, 
  defaultBreed, 
  acknowledgeStep,
  onNext, 
  onPrev,
  t 
}) {
  const baseWeight = defaultBreed ? defaultBreed.avgWeightHeifer : 350;

  const [countInput, setCountInput] = useState(heifersData.length > 0 ? String(heifersData.length) : '');

  useEffect(() => {
    setCountInput(heifersData.length > 0 ? String(heifersData.length) : '');
  }, [heifersData.length]);

  // Handle count change — create/trim heifer entries to match count
  const handleCountChange = (count) => {
    if (acknowledgeStep) acknowledgeStep();
    const num = Math.max(0, Math.min(count, 200));
    if (num > heifersData.length) {
      const newEntries = [];
      for (let i = heifersData.length; i < num; i++) {
        newEntries.push({
          id: Date.now() + i,
          weight: ''
        });
      }
      setHeifersData([...heifersData, ...newEntries]);
    } else if (num < heifersData.length) {
      setHeifersData(heifersData.slice(0, num));
    }
  };

  // Update heifer field
  const handleUpdateHeifer = (index, field, value) => {
    if (acknowledgeStep) acknowledgeStep();
    const updated = [...heifersData];
    updated[index] = { ...updated[index], [field]: value };
    setHeifersData(updated);
  };

  return (
    <div className="wg-card animate-fade-in">
      {/* Visual Header Banner - Green Young Cattle Theme */}
      <div 
        className="step-banner"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1.5px solid #86efac'
        }}
      >
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: '#16a34a', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
              {t ? t('step2.badge') : 'STEP 2 OF 9'}
            </span>
            <span style={{ fontSize: '0.825rem', color: '#15803d', fontWeight: 800 }}>
              {t ? t('step2.tag') : 'YOUNG CATTLE'}
            </span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#14532d' }}>
            {t ? t('step2.title') : 'Heifer Cattle Management'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#334155' }}>
            {t ? t('step2.subtitle') : 'Enter your total number of growing female heifers and record their individual weights.'}
          </p>
        </div>

        <img 
          src="/cattle_art/heifers.jpg" 
          alt="Young Heifer" 
          className="step-banner-img"
        />
      </div>

      {/* Heifer Count Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        background: '#ffffff',
        border: heifersData.length === 0 ? '2px solid #86efac' : '2px solid #16a34a',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1 1 200px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
            {t ? t('step2.count_label') : 'Number of Heifers'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
            {t ? t('step2.count_hint') : 'If you do not have heifers on your farm, keep this at 0.'}
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
            {heifersData.length === 0 ? '0 Heifers' : 'Clear to 0 Heifers'}
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
              color: '#16a34a',
              borderRadius: '10px',
              border: '2px solid #16a34a',
              padding: '8px 10px'
            }}
          />
        </div>
      </div>

      {/* 0 Heifers Notice */}
      {heifersData.length === 0 && (
        <div style={{ padding: '14px 18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            No heifers recorded on this farm. Enter the number above or click below to add.
          </span>
          <button 
            type="button" 
            onClick={() => handleCountChange(1)} 
            className="btn-secondary" 
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            + Add Heifer
          </button>
        </div>
      )}

      {/* Weight Entries */}
      {heifersData.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(140px, 28vw, 200px), 1fr))', 
          gap: '12px', 
          marginBottom: '28px' 
        }}>
          {heifersData.map((heifer, idx) => (
            <div 
              key={heifer.id || idx}
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              <WeightRangeSelect
                value={heifer.weight}
                onChange={(val) => handleUpdateHeifer(idx, 'weight', val)}
                ranges={HEIFER_WEIGHT_RANGES}
                label={t ? t('step2.weight_label', { num: idx + 1 }) : `Heifer ${idx + 1} — Weight`}
                accentColor="#16a34a"
              />
            </div>
          ))}
        </div>
      )}

      {/* Navigation with validation check */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
        <button onClick={onPrev} className="btn-secondary">
          <ChevronLeft size={18} />
          <span>{t ? t('previous') : 'Previous'}</span>
        </button>

        <button 
          onClick={() => {
            const hasEmpty = heifersData.length > 0 && heifersData.some(h => !h.weight || Number(h.weight) <= 0);
            if (hasEmpty) {
              alert('Please enter weights for all heifers before proceeding.');
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
