import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Step6Bulls({ 
  bullsData, 
  setBullsData, 
  defaultBreed, 
  onNext, 
  onPrev,
  t
}) {
  const baseWeight = defaultBreed ? (defaultBreed.avgWeightCow + 150) : 650;

  const handleCountChange = (count) => {
    const num = Math.max(0, Math.min(count, 200));
    if (num > bullsData.length) {
      const newEntries = [];
      for (let i = bullsData.length; i < num; i++) {
        newEntries.push({
          id: Date.now() + i,
          weight: baseWeight
        });
      }
      setBullsData([...bullsData, ...newEntries]);
    } else if (num < bullsData.length) {
      setBullsData(bullsData.slice(0, num));
    }
  };

  const handleUpdateBull = (index, val) => {
    const updated = [...bullsData];
    updated[index] = { ...updated[index], weight: parseInt(val) || 0 };
    setBullsData(updated);
  };

  return (
    <div className="wg-card animate-fade-in">
      {/* Visual Header Banner */}
      <div 
        className="step-banner"
        style={{
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          border: '1.5px solid #fca5a5'
        }}
      >
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: '#dc2626', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>{t ? t('step6.badge') : 'STEP 6 OF 9'}</span>
            <span style={{ fontSize: '0.825rem', color: '#b91c1c', fontWeight: 800 }}>{t ? t('step6.tag') : 'BREEDING & DRAUGHT SIRES'}</span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#991b1b' }}>
            {t ? t('step6.title') : 'Bull Cattle Management'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#7f1d1d' }}>
            {t ? t('step6.subtitle') : 'Specify active breeding bulls or working draught oxen and monitor maintenance nutrition.'}
          </p>
        </div>

        <img 
          src="/cattle_art/bulls.jpg" 
          alt="Adult Bull" 
          className="step-banner-img"
        />
      </div>

      {/* Count Input Box */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        background: '#ffffff',
        border: '2px solid #dc2626',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
            {t ? t('step6.count_label') : 'Number of Bulls'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
            {t ? t('step6.count_hint') : 'Adult breeding bulls or draught oxen'}
          </p>
        </div>

        <input 
          type="number"
          min="0"
          max="200"
          value={bullsData.length}
          onChange={(e) => handleCountChange(parseInt(e.target.value) || 0)}
          style={{ 
            width: '110px', 
            fontSize: '1.25rem', 
            fontWeight: 800, 
            textAlign: 'center',
            color: '#dc2626',
            borderRadius: '10px',
            border: '2px solid #dc2626',
            padding: '8px 12px'
          }}
        />
      </div>

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

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                  {t ? t('step6.body_weight') : 'Body Weight (kg)'}
                </label>
                <input 
                  type="number"
                  min="300" max="1200"
                  value={bull.weight}
                  onChange={(e) => handleUpdateBull(idx, e.target.value)}
                  style={{ width: '100%', fontWeight: 700, color: '#dc2626' }}
                />
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
