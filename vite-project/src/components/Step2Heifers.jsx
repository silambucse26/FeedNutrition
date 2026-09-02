import React from 'react';
import { Scale, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Step2Heifers({ 
  heifersData, 
  setHeifersData, 
  defaultBreed, 
  onNext, 
  onPrev,
  t
}) {
  const baseWeight = defaultBreed ? defaultBreed.avgWeightHeifer : 350;

  // Handle count change — create/trim heifer entries to match count
  const handleCountChange = (count) => {
    const num = Math.max(0, Math.min(count, 200));
    if (num > heifersData.length) {
      const newEntries = [];
      for (let i = heifersData.length; i < num; i++) {
        newEntries.push({
          id: Date.now() + i,
          weight: baseWeight
        });
      }
      setHeifersData([...heifersData, ...newEntries]);
    } else if (num < heifersData.length) {
      setHeifersData(heifersData.slice(0, num));
    }
  };

  // Update heifer field
  const handleUpdateHeifer = (index, field, value) => {
    const updated = [...heifersData];
    updated[index] = { ...updated[index], [field]: value };
    setHeifersData(updated);
  };

  return (
    <div className="wg-card animate-fade-in" style={{ padding: '32px' }}>
      {/* Visual Header Banner with Big Clean Image */}
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
            <span className="badge-green">{t ? t('step2.badge') : 'STEP 2 OF 9'}</span>
            <span style={{ fontSize: '0.825rem', color: '#16a34a', fontWeight: 800 }}>{t ? t('step2.tag') : 'YOUNG CATTLE'}</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.2 }}>
            {t ? t('step2.title') : 'Heifer Cattle Management'}
          </h2>
          <p style={{ color: '#475569', fontSize: '0.925rem', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            {t ? t('step2.subtitle') : 'Enter your total number of growing female heifers and record their individual weights.'}
          </p>
        </div>

        <img 
          src="/cattle_art/heifers.jpg" 
          alt="Young Heifer" 
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

      {/* Heifer Count Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        background: '#ffffff',
        border: '2px solid #16a34a',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
            {t ? t('step2.count_label') : 'Number of Heifers'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
            {t ? t('step2.count_hint') : 'Type how many heifers are currently on your farm'}
          </p>
        </div>

        <input 
          type="number"
          min="0"
          max="200"
          value={heifersData.length}
          onChange={(e) => handleCountChange(parseInt(e.target.value) || 0)}
          style={{ 
            width: '110px', 
            fontSize: '1.25rem', 
            fontWeight: 800, 
            textAlign: 'center',
            color: '#16a34a',
            borderRadius: '10px',
            border: '2px solid #16a34a',
            padding: '8px 12px'
          }}
        />
      </div>

      {/* Weight Entries */}
      {heifersData.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '14px', 
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
              <label style={{ 
                display: 'block', 
                fontSize: '0.8rem', 
                color: '#475569', 
                fontWeight: 700, 
                marginBottom: '6px' 
              }}>
                <Scale size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                {t ? t('step2.weight_label', { num: idx + 1 }) : `Heifer ${idx + 1} — Weight (kg)`}
              </label>
              <input 
                type="number"
                min="50"
                max="800"
                value={heifer.weight}
                onChange={(e) => handleUpdateHeifer(idx, 'weight', parseInt(e.target.value) || 0)}
                style={{ 
                  width: '100%', 
                  fontSize: '1.1rem', 
                  fontWeight: 800, 
                  color: '#16a34a',
                  borderRadius: '8px'
                }}
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

        <button onClick={onNext} className="btn-primary">
          <span>{t ? t('next_step') : 'Next Step'}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
