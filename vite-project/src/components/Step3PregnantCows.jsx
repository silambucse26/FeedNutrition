import React from 'react';
import { ChevronLeft, ChevronRight, CheckSquare, Square } from 'lucide-react';

export default function Step3PregnantCows({ 
  pregnantCategory, // 'firstTime', 'repeat', 'both'
  setPregnantCategory,
  firstTimeCattle, setFirstTimeCattle,
  repeatCattle, setRepeatCattle,
  defaultBreed,
  onNext,
  onPrev,
  t
}) {
  const baseWeight = defaultBreed ? defaultBreed.avgWeightCow : 480;

  // Handle count change for First-Time Pregnant
  const handleFirstTimeCountChange = (count) => {
    const num = Math.max(0, Math.min(count, 200));
    if (num > firstTimeCattle.length) {
      const newEntries = [];
      for (let i = firstTimeCattle.length; i < num; i++) {
        newEntries.push({
          id: Date.now() + i,
          weight: baseWeight,
          inputType: 'months',
          pregMonth: 5,
          pregDays: 150
        });
      }
      setFirstTimeCattle([...firstTimeCattle, ...newEntries]);
    } else if (num < firstTimeCattle.length) {
      setFirstTimeCattle(firstTimeCattle.slice(0, num));
    }
  };

  // Handle count change for Repeat Pregnant
  const handleRepeatCountChange = (count) => {
    const num = Math.max(0, Math.min(count, 200));
    if (num > repeatCattle.length) {
      const newEntries = [];
      for (let i = repeatCattle.length; i < num; i++) {
        newEntries.push({
          id: Date.now() + i,
          weight: baseWeight + 50,
          inputType: 'months',
          pregMonth: 7,
          pregDays: 210
        });
      }
      setRepeatCattle([...repeatCattle, ...newEntries]);
    } else if (num < repeatCattle.length) {
      setRepeatCattle(repeatCattle.slice(0, num));
    }
  };

  const getPregStage = (daysOrMonths, inputType) => {
    const months = inputType === 'days' ? Math.round(daysOrMonths / 30) : daysOrMonths;
    if (months <= 3) return { label: t ? t('step3.early_preg') : 'Early Pregnancy (Months 1-3)', color: '#16a34a', bg: '#f0fdf4' };
    if (months <= 6) return { label: t ? t('step3.mid_preg') : 'Mid Pregnancy (Months 4-6)', color: '#0d9488', bg: '#ccfbf1' };
    return { label: t ? t('step3.late_preg') : 'Late Pregnancy (Months 7-9)', color: '#d97706', bg: '#fffbeb' };
  };

  const showFirst = pregnantCategory === 'firstTime' || pregnantCategory === 'both';
  const showRepeat = pregnantCategory === 'repeat' || pregnantCategory === 'both';

  return (
    <div className="wg-card animate-fade-in">
      {/* Visual Header Banner */}
      <div 
        className="step-banner"
        style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '1.5px solid #fcd34d'
        }}
      >
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: '#d97706', color: '#ffffff', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>{t ? t('step3.badge') : 'STEP 3 OF 9'}</span>
            <span style={{ fontSize: '0.825rem', color: '#b45309', fontWeight: 800 }}>{t ? t('step3.tag') : 'MATERNITY & CALVING'}</span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#78350f' }}>
            {t ? t('step3.title') : 'Pregnant Cattle Management'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#92400e' }}>
            {t ? t('step3.subtitle') : 'Track gestation stages, expected calving dates, and fetal growth nutritional demands.'}
          </p>
        </div>

        <img 
          src="/cattle_art/pregnant.jpg" 
          alt="Pregnant Cow" 
          className="step-banner-img"
        />
      </div>

      {/* Category Checkboxes / Choice Cards */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', color: '#0f172a', fontWeight: 800, marginBottom: '12px' }}>
          {t ? t('step3.category_label') : 'Pregnancy Category Selection:'}
        </label>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div
            onClick={() => setPregnantCategory('firstTime')}
            style={{
              background: pregnantCategory === 'firstTime' ? '#f0fdf4' : '#ffffff',
              border: pregnantCategory === 'firstTime' ? '2.5px solid #16a34a' : '1.5px solid #cbd5e1',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{t ? t('step3.first_time') : 'First-Time Pregnant'}</strong>
              {pregnantCategory === 'firstTime' ? <CheckSquare color="#16a34a" size={18} /> : <Square color="#94a3b8" size={18} />}
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>{t ? t('step3.first_time_sub') : 'Primiparous Heifer Cows'}</p>
          </div>

          <div
            onClick={() => setPregnantCategory('repeat')}
            style={{
              background: pregnantCategory === 'repeat' ? '#f0fdf4' : '#ffffff',
              border: pregnantCategory === 'repeat' ? '2.5px solid #16a34a' : '1.5px solid #cbd5e1',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{t ? t('step3.repeat') : 'Repeat Pregnant'}</strong>
              {pregnantCategory === 'repeat' ? <CheckSquare color="#16a34a" size={18} /> : <Square color="#94a3b8" size={18} />}
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>{t ? t('step3.repeat_sub') : 'Multiparous Mature Cows'}</p>
          </div>

          <div
            onClick={() => setPregnantCategory('both')}
            style={{
              background: pregnantCategory === 'both' ? '#f0fdf4' : '#ffffff',
              border: pregnantCategory === 'both' ? '2.5px solid #16a34a' : '1.5px solid #cbd5e1',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{t ? t('step3.both') : 'Both Categories'}</strong>
              {pregnantCategory === 'both' ? <CheckSquare color="#16a34a" size={18} /> : <Square color="#94a3b8" size={18} />}
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>{t ? t('step3.both_sub') : 'First-time & Repeat Pregnant'}</p>
          </div>
        </div>
      </div>

      {/* Timeline Display */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '14px 20px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        fontSize: '0.8rem',
        fontWeight: 700
      }}>
        <span style={{ color: '#16a34a' }}>{t ? t('step3.early_preg') : 'Early Pregnancy (Months 1-3)'}</span>
        <span style={{ color: '#94a3b8' }}>→</span>
        <span style={{ color: '#0d9488' }}>{t ? t('step3.mid_preg') : 'Mid Pregnancy (Months 4-6)'}</span>
        <span style={{ color: '#94a3b8' }}>→</span>
        <span style={{ color: '#d97706' }}>{t ? t('step3.late_preg') : 'Late Pregnancy (Months 7-9)'}</span>
      </div>

      {/* FIRST-TIME PREGNANT SECTION */}
      {showFirst && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            background: '#ffffff',
            border: '2px solid #16a34a',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
                {t ? t('step3.first_time_count') : 'Number of First-time Pregnant Cattle'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
                {t ? t('step3.first_time_hint') : 'Heifers expecting their first calf'}
              </p>
            </div>
            <input 
              type="number"
              min="0"
              max="200"
              value={firstTimeCattle.length}
              onChange={(e) => handleFirstTimeCountChange(parseInt(e.target.value) || 0)}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {firstTimeCattle.map((cow, idx) => {
              const stage = getPregStage(cow.inputType === 'days' ? cow.pregDays : cow.pregMonth, cow.inputType);
              return (
                <div key={cow.id || idx} style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge-green">{t ? t('step3.cow_num', { num: idx + 1 }) : `Cow ${idx + 1}`}</span>
                      <span style={{ background: stage.bg, color: stage.color, padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                        {stage.label}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                        {t ? t('step3.individual_weight') : 'Individual Weight (kg)'}
                      </label>
                      <input 
                        type="number" 
                        value={cow.weight}
                        onChange={(e) => {
                          const updated = [...firstTimeCattle];
                          updated[idx].weight = parseInt(e.target.value) || 0;
                          setFirstTimeCattle(updated);
                        }}
                        style={{ width: '100%', fontWeight: 700, color: '#16a34a' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                        {t ? t('step3.preg_input_mode') : 'Pregnancy Input Mode'}
                      </label>
                      <select 
                        value={cow.inputType}
                        onChange={(e) => {
                          const updated = [...firstTimeCattle];
                          updated[idx].inputType = e.target.value;
                          setFirstTimeCattle(updated);
                        }}
                        style={{ width: '100%' }}
                      >
                        <option value="months">{t ? t('step3.mode_months') : 'Pregnancy Month (1-9)'}</option>
                        <option value="days">{t ? t('step3.mode_days') : 'Days after insemination (1-283)'}</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                        {cow.inputType === 'days' ? (t ? t('step3.days_after_insem') : 'Days After Insemination') : (t ? t('step3.preg_month') : 'Pregnancy Month')}
                      </label>
                      {cow.inputType === 'days' ? (
                        <input 
                          type="number"
                          min="1" max="283"
                          value={cow.pregDays}
                          onChange={(e) => {
                            const updated = [...firstTimeCattle];
                            updated[idx].pregDays = parseInt(e.target.value) || 1;
                            setFirstTimeCattle(updated);
                          }}
                          style={{ width: '100%', fontWeight: 700, color: '#16a34a' }}
                        />
                      ) : (
                        <input 
                          type="number"
                          min="1" max="9"
                          value={cow.pregMonth}
                          onChange={(e) => {
                            const updated = [...firstTimeCattle];
                            updated[idx].pregMonth = parseInt(e.target.value) || 1;
                            setFirstTimeCattle(updated);
                          }}
                          style={{ width: '100%', fontWeight: 700, color: '#16a34a' }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* REPEAT PREGNANT SECTION */}
      {showRepeat && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            background: '#ffffff',
            border: '2px solid #16a34a',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>
                {t ? t('step3.repeat_count') : 'Number of Repeat Pregnant Cattle'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>
                {t ? t('step3.repeat_hint') : 'Mature cows in their second or subsequent pregnancy'}
              </p>
            </div>
            <input 
              type="number"
              min="0"
              max="200"
              value={repeatCattle.length}
              onChange={(e) => handleRepeatCountChange(parseInt(e.target.value) || 0)}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {repeatCattle.map((cow, idx) => {
              const stage = getPregStage(cow.inputType === 'days' ? cow.pregDays : cow.pregMonth, cow.inputType);
              return (
                <div key={cow.id || idx} style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge-green">{t ? t('step3.cow_num', { num: idx + 1 }) : `Cow ${idx + 1}`}</span>
                      <span style={{ background: stage.bg, color: stage.color, padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                        {stage.label}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                        {t ? t('step3.individual_weight') : 'Individual Weight (kg)'}
                      </label>
                      <input 
                        type="number" 
                        value={cow.weight}
                        onChange={(e) => {
                          const updated = [...repeatCattle];
                          updated[idx].weight = parseInt(e.target.value) || 0;
                          setRepeatCattle(updated);
                        }}
                        style={{ width: '100%', fontWeight: 700, color: '#16a34a' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                        {t ? t('step3.preg_input_mode') : 'Pregnancy Input Mode'}
                      </label>
                      <select 
                        value={cow.inputType}
                        onChange={(e) => {
                          const updated = [...repeatCattle];
                          updated[idx].inputType = e.target.value;
                          setRepeatCattle(updated);
                        }}
                        style={{ width: '100%' }}
                      >
                        <option value="months">{t ? t('step3.mode_months') : 'Pregnancy Month (1-9)'}</option>
                        <option value="days">{t ? t('step3.mode_days') : 'Days after insemination (1-283)'}</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                        {cow.inputType === 'days' ? (t ? t('step3.days_after_insem') : 'Days After Insemination') : (t ? t('step3.preg_month') : 'Pregnancy Month')}
                      </label>
                      {cow.inputType === 'days' ? (
                        <input 
                          type="number"
                          min="1" max="283"
                          value={cow.pregDays}
                          onChange={(e) => {
                            const updated = [...repeatCattle];
                            updated[idx].pregDays = parseInt(e.target.value) || 1;
                            setRepeatCattle(updated);
                          }}
                          style={{ width: '100%', fontWeight: 700, color: '#16a34a' }}
                        />
                      ) : (
                        <input 
                          type="number"
                          min="1" max="9"
                          value={cow.pregMonth}
                          onChange={(e) => {
                            const updated = [...repeatCattle];
                            updated[idx].pregMonth = parseInt(e.target.value) || 1;
                            setRepeatCattle(updated);
                          }}
                          style={{ width: '100%', fontWeight: 700, color: '#16a34a' }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
