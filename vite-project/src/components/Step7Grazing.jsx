import React from 'react';
import { ChevronLeft, ChevronRight, CheckSquare, Square } from 'lucide-react';

export default function Step7Grazing({ 
  grazingSystem, 
  setGrazingSystem, 
  grazingData, 
  setGrazingData, 
  onNext, 
  onPrev,
  t
}) {
  const grazingOptions = [
    { id: 'no_grazing', title: t ? t('step7.opt_no_grazing') : '1. No Grazing', desc: t ? t('step7.opt_no_grazing_desc') : 'Stall feeding only (Zero grazing)' },
    { id: 'farm_only', title: t ? t('step7.opt_farm_only') : '2. Farm-Only Grazing', desc: t ? t('step7.opt_farm_only_desc') : 'Grazing within farm boundaries' },
    { id: 'outside', title: t ? t('step7.opt_outside') : '3. Outside Grazing', desc: t ? t('step7.opt_outside_desc') : 'Grazing outside village/fields' },
    { id: 'hill_forest', title: t ? t('step7.opt_hill_forest') : '4. Hill / Forest Grazing', desc: t ? t('step7.opt_hill_forest_desc') : 'Hilly terrain & woodland pasture' },
    { id: 'open_field', title: t ? t('step7.opt_open_field') : '5. Open Field Grazing', desc: t ? t('step7.opt_open_field_desc') : 'Communal open pastures' }
  ];

  const handleUpdateCategory = (cat, field, val) => {
    setGrazingData({
      ...grazingData,
      [cat]: {
        ...grazingData[cat],
        [field]: val
      }
    });
  };

  const categories = [
    { key: 'heifers', label: t ? t('step7.heifers') : 'Heifers' },
    { key: 'pregnant', label: t ? t('step7.pregnant') : 'Pregnant Cattle' },
    { key: 'lactating', label: t ? t('step7.lactating') : 'Lactating Cattle' },
    { key: 'dry', label: t ? t('step7.dry') : 'Dry Cows' },
    { key: 'bulls', label: t ? t('step7.bulls') : 'Bulls' }
  ];

  return (
    <div className="wg-card animate-fade-in">
      {/* Visual Header Banner */}
      <div 
        className="step-banner"
        style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          border: '1.5px solid #a7f3d0'
        }}
      >
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge-green">{t ? t('step7.badge') : 'STEP 7 OF 9'}</span>
            <span style={{ fontSize: '0.825rem', color: '#059669', fontWeight: 800 }}>{t ? t('step7.tag') : 'PASTURE & FORAGING'}</span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#065f46' }}>
            {t ? t('step7.title') : 'Grazing Management'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#047857' }}>
            {t ? t('step7.subtitle') : 'Select your grazing system and record daily hours & distance walked per cattle group.'}
          </p>
        </div>

        <img 
          src="/cattle_art/grazing.jpg" 
          alt="Grazing Cattle" 
          className="step-banner-img"
        />
      </div>

      {/* Grazing System Selection Cards */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', color: '#0f172a', fontWeight: 800, marginBottom: '12px' }}>
          {t ? t('step7.select_system') : 'Select Farm Grazing System:'}
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {grazingOptions.map(opt => (
            <div
              key={opt.id}
              onClick={() => setGrazingSystem(opt.id)}
              style={{
                background: grazingSystem === opt.id ? '#f0fdf4' : '#ffffff',
                border: grazingSystem === opt.id ? '2.5px solid #16a34a' : '1.5px solid #cbd5e1',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{opt.title}</strong>
                {grazingSystem === opt.id ? <CheckSquare color="#16a34a" size={18} /> : <Square color="#94a3b8" size={18} />}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>{opt.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Grazing Details */}
      {grazingSystem !== 'no_grazing' && (
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 800, marginBottom: '14px' }}>
            {t ? t('step7.details_per_group') : 'Grazing Details per Animal Group'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {categories.map(cat => (
              <div key={cat.key} style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '0.925rem', fontWeight: 800, color: '#16a34a', marginBottom: '12px' }}>
                  {cat.label}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                      {t ? t('step7.hours_per_day') : 'Grazing Hours / Day'}
                    </label>
                    <input 
                      type="number"
                      min="0" max="24"
                      value={grazingData[cat.key]?.hours || 4}
                      onChange={(e) => handleUpdateCategory(cat.key, 'hours', parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                      {t ? t('step7.area_type') : 'Grazing Area Type'}
                    </label>
                    <select
                      value={grazingData[cat.key]?.areaType || 'Pasture'}
                      onChange={(e) => handleUpdateCategory(cat.key, 'areaType', e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="Pasture">{t ? t('step7.area_pasture') : 'Cultivated Pasture'}</option>
                      <option value="Fallow Field">{t ? t('step7.area_fallow') : 'Fallow Field'}</option>
                      <option value="Roadside">{t ? t('step7.area_roadside') : 'Roadside / Washes'}</option>
                      <option value="Forest">{t ? t('step7.area_forest') : 'Forest Woodland'}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                      {t ? t('step7.distance') : 'Grazing Distance (km/day)'}
                    </label>
                    <input 
                      type="number"
                      min="0" max="20" step="0.5"
                      value={grazingData[cat.key]?.distance || 1.5}
                      onChange={(e) => handleUpdateCategory(cat.key, 'distance', parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', fontWeight: 700 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
