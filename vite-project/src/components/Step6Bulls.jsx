import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import WeightRangeSelect from './WeightRangeSelect';
import { BULL_WEIGHT_RANGES } from '../data/weightRanges';

export default function Step6Bulls({ 
  bullsData, 
  setBullsData, 
  defaultBreed, 
  acknowledgeStep,
  onNext, 
  onPrev,
  t
}) {
  const baseWeight = defaultBreed ? (defaultBreed.avgWeightCow + 150) : 650;

  const [countInput, setCountInput] = useState(bullsData.length > 0 ? String(bullsData.length) : '');

  useEffect(() => {
    setCountInput(bullsData.length > 0 ? String(bullsData.length) : '');
  }, [bullsData.length]);

  const handleCountChange = (count) => {
    if (acknowledgeStep) acknowledgeStep();
    const num = Math.max(0, Math.min(count, 200));
    if (num > bullsData.length) {
      const newEntries = [];
      for (let i = bullsData.length; i < num; i++) {
        newEntries.push({
          id: Date.now() + i,
          weight: ''
        });
      }
      setBullsData([...bullsData, ...newEntries]);
    } else if (num < bullsData.length) {
      setBullsData(bullsData.slice(0, num));
    }
  };

  const handleUpdateBull = (index, val) => {
    if (acknowledgeStep) acknowledgeStep();
    const updated = [...bullsData];
    updated[index] = { ...updated[index], weight: val };
    setBullsData(updated);
  };

  return (
    <div className="wg-card animate-fade-in">
      {/* Visual Header Banner - Red Theme */}
      <div 
        className="step-banner"
        style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          border: '1.5px solid #fca5a5'
        }}
      >
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: '#dc2626', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
              {t ? t('step6.badge') : 'STEP 6 OF 9'}
            </span>
            <span style={{ fontSize: '0.825rem', color: '#b91c1c', fontWeight: 800 }}>
              {t ? t('step6.tag') : 'BREEDING & WORK MALES'}
            </span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#7f1d1d' }}>
            {t ? t('step6.title') : 'Bulls Management'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#334155' }}>
            {t ? t('step6.subtitle') : 'Enter breeding bulls and working oxen to account for higher maintenance energy requirements.'}
          </p>
        </div>

        <img 
          src="/cattle_art/bulls.jpg" 
          alt="Breeding Bull" 
          className="step-banner-img"
        />
      </div>

      {/* Bull Count Input Box */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        background: '#ffffff',
        border: bullsData.length === 0 ? '2px solid #fca5a5' : '2px solid #dc2626',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1 1 200px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
            {t ? t('step6.count_label') : 'Number of Bulls'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
            {t ? t('step6.count_hint') : 'Breeding males or draft oxen on farm. Keep at 0 if none.'}
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
            {bullsData.length === 0 ? '0 Bulls' : 'Clear to 0 Bulls'}
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
              color: '#dc2626',
              borderRadius: '10px',
              border: '2px solid #dc2626',
              padding: '8px 10px'
            }}
          />
        </div>
      </div>

      {/* 0 Bulls Notice */}
      {bullsData.length === 0 && (
        <div style={{ padding: '14px 18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            No bulls recorded on this farm. Enter the number above or click below to add.
          </span>
          <button 
            type="button" 
            onClick={() => handleCountChange(1)} 
            className="btn-secondary" 
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            + Add Bull
          </button>
        </div>
      )}

      {/* Bull Cards */}
      {bullsData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          {bullsData.map((bull, idx) => (
            <div key={bull.id || idx} style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                  {t ? t('step6.bull_num', { num: idx + 1 }) : `Bull ${idx + 1}`}
                </span>
              </div>

              <WeightRangeSelect 
                value={bull.weight}
                onChange={(val) => handleUpdateBull(idx, val)}
                ranges={BULL_WEIGHT_RANGES}
                label={t ? t('step6.body_weight') : 'Body Weight (Range)'}
                accentColor="#dc2626"
              />
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
            const hasEmpty = bullsData.length > 0 && bullsData.some(b => !b.weight || Number(b.weight) <= 0);
            if (hasEmpty) {
              alert('Please enter weights for all bulls before proceeding.');
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
