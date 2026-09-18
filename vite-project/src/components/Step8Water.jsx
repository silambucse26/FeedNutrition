import React from 'react';
import { ChevronLeft, ChevronRight, Droplets } from 'lucide-react';

export default function Step8Water({ 
  waterVolume = '', 
  setWaterVolume, 
  waterSource = '', 
  setWaterSource, 
  waterQuality = 'Good', 
  setWaterQuality, 
  acknowledgeStep,
  onNext, 
  onPrev,
  currentLang = 'ta',
  t
}) {
  const sources = [
    { id: 'Borewell', label: currentLang === 'ta' ? 'ஆழ்துளைக் கிணறு (Borewell)' : currentLang === 'hi' ? 'बोरवेल / नलकूप' : 'Borewell' },
    { id: 'River', label: currentLang === 'ta' ? 'ஆறு / ஓடை' : currentLang === 'hi' ? 'नदी / नहर' : 'River' },
    { id: 'Pond', label: currentLang === 'ta' ? 'குளம் / ஏரி' : currentLang === 'hi' ? 'तालाब / जलाशय' : 'Pond' },
    { id: 'Municipal supply', label: currentLang === 'ta' ? 'நகராட்சி / பஞ்சாயத்து குடிநீர்' : currentLang === 'hi' ? 'सरकारी / नगर आपूर्ति' : 'Municipal supply' },
    { id: 'Other', label: currentLang === 'ta' ? 'பிற ஆதாரங்கள்' : currentLang === 'hi' ? 'अन्य स्रोत' : 'Other' }
  ];

  const qualities = [
    { id: 'Good', label: currentLang === 'ta' ? 'நன்று (சுத்தமான நன்னீர்)' : currentLang === 'hi' ? 'अच्छा (साफ एवं ताजा पानी)' : 'Good (Clean & Fresh)', color: '#16a34a', bg: '#f0fdf4' },
    { id: 'Average', label: currentLang === 'ta' ? 'நடுத்தரம் (லேசான உப்புத்தன்மை)' : currentLang === 'hi' ? 'मध्यम (हल्का खारा पानी)' : 'Average (Slightly Brackish)', color: '#d97706', bg: '#fffbeb' },
    { id: 'Poor', label: currentLang === 'ta' ? 'மோசம் (கலங்கலான / அதிக உப்புத்தன்மை)' : currentLang === 'hi' ? 'खराब (गंदला / अत्यधिक खारा)' : 'Poor (Turbid / High Salinity)', color: '#dc2626', bg: '#fef2f2' }
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
            <span style={{ fontSize: '0.825rem', color: '#0369a1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {currentLang === 'ta' ? 'குடிநீர் & நீர்த் தரம்' : currentLang === 'hi' ? 'पेयजल एवं जल गुणवत्ता' : (t ? t('step8.tag') : 'HYDRATION & WATER QUALITY')}
            </span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#0c4a6e' }}>
            {currentLang === 'ta' ? 'குடிநீர் இருப்பு & தரம்' : currentLang === 'hi' ? 'पानी की उपलब्धता एवं गुणवत्ता' : (t ? t('step8.title') : 'Water Availability & Quality')}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#075985' }}>
            {currentLang === 'ta' 
              ? 'பால் உற்பத்திக்கும் மாடுகளின் உடல் வெப்பச் சமநிலைக்கும் போதுமான, சுத்தமான குடிநீர் இருப்பதை உறுதி செய்க.' 
              : currentLang === 'hi'
                ? 'दूध उत्पादन एवं पशु के शरीर तापमान नियंत्रण हेतु पर्याप्त स्वच्छ पेयजल सुनिश्चित करें।'
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
          {currentLang === 'ta' ? 'தினசரி கிடைக்கும் குடிநீர் அளவு (லிட்டர் / நாள்)' : currentLang === 'hi' ? 'दैनिक उपलब्ध पेयजल की मात्रा (लीटर / दिन)' : (t ? t('step8.daily_volume_label') : 'Daily Available Drinking Water (Litres / day)')}
        </label>
        <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '16px' }}>
          {currentLang === 'ta' 
            ? 'உங்கள் பண்ணையில் தினசரி மாடுகளுக்குக் கிடைக்கக்கூடிய மொத்த நன்னீரின் அளவை உள்ளிடவும்.' 
            : currentLang === 'hi'
              ? 'अपने फार्म पर मवेशियों के लिए उपलब्ध कुल दैनिक पेयजल की मात्रा दर्ज करें।'
              : 'Enter total volume of fresh drinking water made accessible per day to the cattle.'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input 
            type="number"
            min="0"
            step="10"
            placeholder={currentLang === 'ta' ? 'எ.கா. 350' : currentLang === 'hi' ? 'उदा. 350' : 'e.g. 350'}
            value={waterVolume}
            onChange={(e) => {
              if (acknowledgeStep) acknowledgeStep();
              setWaterVolume(e.target.value);
            }}
            onFocus={(e) => {
              if (e.target.value === '0') {
                setWaterVolume('');
              }
            }}
            style={{ width: 'min(100%, 180px)', fontSize: '1.4rem', fontWeight: '900', color: '#0284c7', borderColor: '#0284c7', borderRadius: '10px' }}
          />
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7' }}>
            {currentLang === 'ta' ? 'லிட்டர் / நாள்' : currentLang === 'hi' ? 'लीटर / दिन' : (t ? t('step8.litres_per_day') : 'Litres / day')}
          </span>
        </div>
      </div>

      {/* Water Source Selection */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', color: '#0f172a', fontWeight: 800, marginBottom: '12px' }}>
          {currentLang === 'ta' ? 'குடிநீர் ஆதாரம்' : currentLang === 'hi' ? 'पेयजल स्रोत' : (t ? t('step8.water_source') : 'Water Source')}
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
                  padding: '8px 16px',
                  fontSize: '0.85rem',
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
          {currentLang === 'ta' ? 'குடிநீரின் தரம்' : currentLang === 'hi' ? 'जल गुणवत्ता रेटिंग' : (t ? t('step8.water_quality') : 'Water Quality Rating')}
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '12px' }}>
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
                  padding: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <Droplets size={20} color={isSel ? q.color : '#94a3b8'} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: isSel ? q.color : '#0f172a', lineHeight: 1.3 }}>
                  {q.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="responsive-nav-actions" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
        <button onClick={onPrev} className="btn-secondary">
          <ChevronLeft size={18} />
          <span>{currentLang === 'ta' ? 'முந்தையது (மேய்ச்சல்)' : currentLang === 'hi' ? 'पिछला (चराई)' : (t ? t('previous') : 'Previous')}</span>
        </button>

        <button onClick={onNext} className="btn-primary">
          <span>{currentLang === 'ta' ? 'அடுத்த படி (தீவன இருப்பு)' : currentLang === 'hi' ? 'अगला चरण (चारा सूची)' : (t ? t('next_step') : 'Next Step')}</span>
          <ChevronRight size={18} />
        </button>
      </div>

    </div>
  );
}
