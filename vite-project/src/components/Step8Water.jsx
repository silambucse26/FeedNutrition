import React from 'react';
import { ChevronLeft, ChevronRight, Droplets, ShieldCheck } from 'lucide-react';

export default function Step8Water({ 
  waterVolume, 
  setWaterVolume, 
  waterSource, 
  setWaterSource, 
  waterQuality, 
  setWaterQuality, 
  onNext, 
  onPrev,
  t
}) {
  const sources = [
    { id: 'Borewell', label: t ? t('step8.src_borewell') : 'Borewell' },
    { id: 'River', label: t ? t('step8.src_river') : 'River' },
    { id: 'Pond', label: t ? t('step8.src_pond') : 'Pond' },
    { id: 'Municipal supply', label: t ? t('step8.src_municipal') : 'Municipal supply' },
    { id: 'Other', label: t ? t('step8.src_other') : 'Other' }
  ];

  const qualities = [
    { id: 'Good', label: t ? t('step8.qual_good') : 'Good (Clean & Fresh)', color: '#16a34a', bg: '#f0fdf4' },
    { id: 'Average', label: t ? t('step8.qual_average') : 'Average (Slightly Brackish)', color: '#d97706', bg: '#fffbeb' },
    { id: 'Poor', label: t ? t('step8.qual_poor') : 'Poor (Turbid / High Salinity)', color: '#dc2626', bg: '#fef2f2' }
  ];

  return (
    <div className="wg-card animate-fade-in" style={{ padding: '32px' }}>
      {/* Visual Header Banner with Big Clean Image */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
        border: '1.5px solid #7dd3fc',
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '28px',
        gap: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: '#0284c7', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>{t ? t('step8.badge') : 'STEP 8 OF 9'}</span>
            <span style={{ fontSize: '0.825rem', color: '#0369a1', fontWeight: 800 }}>{t ? t('step8.tag') : 'HYDRATION & WATER QUALITY'}</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0c4a6e', margin: '0 0 8px 0', lineHeight: 1.2 }}>
            {t ? t('step8.title') : 'Water Availability & Quality'}
          </h2>
          <p style={{ color: '#075985', fontSize: '0.925rem', margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
            {t ? t('step8.subtitle') : 'Ensure clean, sufficient daily water supply essential for milk synthesis and thermoregulation.'}
          </p>
        </div>

        <img 
          src="/cattle_art/water.jpg" 
          alt="Cattle Drinking Clean Water" 
          style={{ 
            width: '160px', 
            height: '160px', 
            borderRadius: '20px', 
            objectFit: 'cover', 
            boxShadow: '0 10px 25px rgba(2, 132, 199, 0.25)',
            border: '4px solid #ffffff',
            flexShrink: 0
          }} 
        />
      </div>

      {/* Daily Volume Input */}
      <div style={{
        background: '#ffffff',
        border: '2px solid #0284c7',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '28px'
      }}>
        <label style={{ display: 'block', fontSize: '1rem', color: '#0f172a', fontWeight: 800, marginBottom: '8px' }}>
          {t ? t('step8.daily_volume_label') : 'Daily Available Drinking Water (Litres / day)'}
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input 
            type="number"
            min="50" max="10000" step="50"
            value={waterVolume}
            onChange={(e) => setWaterVolume(parseInt(e.target.value) || 0)}
            style={{ width: '180px', fontSize: '1.4rem', fontWeight: '900', color: '#0284c7', borderColor: '#0284c7', borderRadius: '10px' }}
          />
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7' }}>
            {t ? t('step8.litres_per_day') : 'Litres / day'}
          </span>
        </div>
      </div>

      {/* Water Source Selection */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a', fontWeight: 800, marginBottom: '12px' }}>
          {t ? t('step8.water_source') : 'Water Source'}
        </label>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {sources.map(src => {
            const isSel = waterSource === src.id;
            return (
              <button
                key={src.id}
                type="button"
                onClick={() => setWaterSource(src.id)}
                className={`chip-btn ${isSel ? 'chip-btn-active' : ''}`}
                style={{
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  borderRadius: '24px'
                }}
              >
                {src.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Water Quality Ratings */}
      <div style={{ marginBottom: '32px' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a', fontWeight: 800, marginBottom: '12px' }}>
          {t ? t('step8.water_quality') : 'Water Quality Rating'}
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {qualities.map(q => {
            const isSel = waterQuality === q.id;
            return (
              <div
                key={q.id}
                onClick={() => setWaterQuality(q.id)}
                style={{
                  background: isSel ? q.bg : '#ffffff',
                  border: isSel ? `2.5px solid ${q.color}` : '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <Droplets size={20} color={isSel ? q.color : '#94a3b8'} />
                <span style={{ fontSize: '0.925rem', fontWeight: 800, color: isSel ? q.color : '#0f172a' }}>
                  {q.label}
                </span>
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

        <button onClick={onNext} className="btn-primary">
          <span>{t ? t('next_step') : 'Next Step'}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
