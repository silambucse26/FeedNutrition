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
  currentLang = 'ta',
  t
}) {
  const sources = [
    { id: 'Borewell', label: currentLang === 'ta' ? 'ஆழ்துளைக் கிணறு (Borewell)' : (t ? t('step8.src_borewell') : 'Borewell') },
    { id: 'River', label: currentLang === 'ta' ? 'ஆறு / ஓடை' : (t ? t('step8.src_river') : 'River') },
    { id: 'Pond', label: currentLang === 'ta' ? 'குளம் / ஏரி' : (t ? t('step8.src_pond') : 'Pond') },
    { id: 'Municipal supply', label: currentLang === 'ta' ? 'நகராட்சி / பஞ்சாயத்து குடிநீர்' : (t ? t('step8.src_municipal') : 'Municipal supply') },
    { id: 'Other', label: currentLang === 'ta' ? 'பிற ஆதாரங்கள்' : (t ? t('step8.src_other') : 'Other') }
  ];

  const qualities = [
    { id: 'Good', label: currentLang === 'ta' ? 'நன்று (சுத்தமான நன்னீர்)' : (t ? t('step8.qual_good') : 'Good (Clean & Fresh)'), color: '#16a34a', bg: '#f0fdf4' },
    { id: 'Average', label: currentLang === 'ta' ? 'நடுத்தரம் (லேசான உப்புத்தன்மை)' : (t ? t('step8.qual_average') : 'Average (Slightly Brackish)'), color: '#d97706', bg: '#fffbeb' },
    { id: 'Poor', label: currentLang === 'ta' ? 'மோசம் (கலங்கலான / அதிக உப்புத்தன்மை)' : (t ? t('step8.qual_poor') : 'Poor (Turbid / High Salinity)'), color: '#dc2626', bg: '#fef2f2' }
  ];

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
            <span style={{ background: '#0284c7', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
              {currentLang === 'ta' ? 'படி 4 / 6' : 'STEP 4 OF 6'}
            </span>
            <span style={{ fontSize: '0.825rem', color: '#0369a1', fontWeight: 800 }}>
              {currentLang === 'ta' ? 'குடிநீர் & நீர்த் தரம்' : (t ? t('step8.tag') : 'HYDRATION & WATER QUALITY')}
            </span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#0c4a6e' }}>
            {currentLang === 'ta' ? 'குடிநீர் இருப்பு & தரம்' : (t ? t('step8.title') : 'Water Availability & Quality')}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#075985' }}>
            {currentLang === 'ta' 
              ? 'பால் உற்பத்திக்கும் மாடுகளின் உடல் வெப்பச் சமநிலைக்கும் போதுமான, சுத்தமான குடிநீர் இருப்பதை உறுதி செய்க.' 
              : (t ? t('step8.subtitle') : 'Ensure clean, sufficient daily water supply essential for milk synthesis and thermoregulation.')}
          </p>
        </div>

        <img 
          src="/cattle_art/water.jpg" 
          alt="Cattle Drinking Clean Water" 
          className="step-banner-img"
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
          {currentLang === 'ta' ? 'தினசரி கிடைக்கும் குடிநீர் அளவு (லிட்டர் / நாள்)' : (t ? t('step8.daily_volume_label') : 'Daily Available Drinking Water (Litres / day)')}
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input 
            type="number"
            min="10" 
            max="20000" 
            step="10"
            placeholder="e.g. 500"
            value={waterVolume === undefined || waterVolume === '' || waterVolume === 0 ? '' : waterVolume}
            onFocus={(e) => {
              if (e.target.value === '0') setWaterVolume('');
              e.target.select();
            }}
            onWheel={(e) => e.target.blur()}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') {
                setWaterVolume('');
                return;
              }
              const num = parseInt(raw, 10);
              if (!isNaN(num)) {
                setWaterVolume(num === 0 ? '' : num);
              }
            }}
            style={{ width: '180px', fontSize: '1.4rem', fontWeight: '900', color: '#0284c7', borderColor: '#0284c7', borderRadius: '10px' }}
          />
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7' }}>
            {currentLang === 'ta' ? 'லிட்டர் / நாள்' : (t ? t('step8.litres_per_day') : 'Litres / day')}
          </span>
        </div>
      </div>

      {/* Water Source Selection */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a', fontWeight: 800, marginBottom: '12px' }}>
          {currentLang === 'ta' ? 'குடிநீர் ஆதாரம்' : (t ? t('step8.water_source') : 'Water Source')}
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
          {currentLang === 'ta' ? 'குடிநீரின் தரம்' : (t ? t('step8.water_quality') : 'Water Quality Rating')}
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
          <span>{currentLang === 'ta' ? 'முந்தையது (மேய்ச்சல்)' : (t ? t('previous') : 'Previous')}</span>
        </button>

        <button onClick={onNext} className="btn-primary">
          <span>{currentLang === 'ta' ? 'அடுத்த படி (தீவன இருப்பு)' : (t ? t('next_step') : 'Next Step')}</span>
          <ChevronRight size={18} />
        </button>
      </div>

    </div>
  );
}
