import React from 'react';
import { Check, Save, AlertCircle, Sparkles, Heart, Compass, Droplets, Wheat, FileCheck } from 'lucide-react';

export default function StepProgress({ 
  currentStep, 
  setStep, 
  getStepStatus, 
  isStepValid, 
  isWeatherComplete,
  currentLang,
  t 
}) {
  const steps = [
    { number: 1, key: 'step_1', fallback: 'Breed', icon: Sparkles },
    { number: 2, key: 'step_2', fallback: 'Cattle Herd', icon: Heart },
    { number: 3, key: 'step_3', fallback: 'Grazing', icon: Compass },
    { number: 4, key: 'step_4', fallback: 'Water', icon: Droplets },
    { number: 5, key: 'step_5', fallback: 'Feed', icon: Wheat },
    { number: 6, key: 'step_6', fallback: 'Summary', icon: FileCheck }
  ];

  const currentStepObj = steps[currentStep - 1] || steps[0];
  const currentTitle = (t ? t(`steps.${currentStepObj.key}`) : null) || currentStepObj?.fallback;

  const locationWarning = t ? t('location_required') : 'Location & Temp/RH Required';
  const legendGreen  = t ? t('legend_green')  : 'Completed';
  const legendYellow = t ? t('legend_yellow') : 'Partially Filled';
  const legendRed    = t ? t('legend_red')    : 'Not Filled';
  const autoSaved    = t ? t('auto_saved')    : 'Auto-saved';

  return (
    <>
      {/* ── MOBILE NATIVE APP STEPPER (<= 640px) ── */}
      <div className="mobile-app-stepper">
        <div className="mobile-stepper-header">
          <div className="mobile-stepper-title-wrap">
            <span className="mobile-stepper-name">{currentTitle}</span>
          </div>
          <div className="mobile-stepper-badge-wrap">
            <span className="mobile-stepper-saved">
              <Save size={11} color="#16a34a" /> {autoSaved}
            </span>
            {!isWeatherComplete && (
              <span className="mobile-stepper-alert" title={locationWarning}>
                <AlertCircle size={11} />
              </span>
            )}
          </div>
        </div>

        {/* 6-Segment Slim Progress Bar */}
        <div className="mobile-segments-track">
          {steps.map((step) => {
            const isActive = currentStep === step.number;
            const status = getStepStatus ? getStepStatus(step.number) : 'empty';
            let segClass = 'seg-pending';
            if (status === 'complete') segClass = 'seg-complete';
            else if (status === 'partial') segClass = 'seg-partial';

            return (
              <button
                key={step.number}
                type="button"
                onClick={() => setStep(step.number)}
                className={`mobile-seg-btn ${segClass} ${isActive ? 'seg-active' : ''}`}
                title={step.fallback}
              >
                <span className="mobile-seg-fill" />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DESKTOP STEP PROGRESS CARD (> 640px) ── */}
      <div className="desktop-step-progress wg-card" style={{ padding: 'clamp(10px, 2.5vw, 16px) clamp(12px, 3vw, 20px)', marginBottom: '16px' }}>
        {/* Top Auto-Save & Status Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.78rem', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: '#0f172a', fontWeight: 900, fontSize: '0.88rem' }}>
              {currentTitle?.toUpperCase()}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 600, fontSize: '0.75rem' }}>
              <Save size={13} color="#16a34a" /> {autoSaved}
            </span>
          </div>

          {/* Live Weather Status Indicator */}
          <div>
            {!isWeatherComplete && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
                <AlertCircle size={12} />
                {locationWarning}
              </span>
            )}
          </div>
        </div>

        {/* Steps Container: flex on desktop */}
        <div 
          className="step-progress-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            gap: '8px',
            padding: '8px 2px 6px 2px',
          }}
        >
          {steps.map((step) => {
            const isActive = currentStep === step.number;
            const status = getStepStatus ? getStepStatus(step.number) : 'empty';
            const title = t ? t(`steps.${step.key}`) : step.fallback;
            const StepIcon = step.icon;

            let bg = '#fee2e2';
            let textColor = '#dc2626';
            let border = '2px solid #ef4444';
            let ringColor = 'rgba(239, 68, 68, 0.35)';
            let activeBorder = '2.5px solid #dc2626';
            let labelColor = '#b91c1c';
            let content = <StepIcon size={16} strokeWidth={2.2} />;

            if (status === 'complete') {
              bg = '#16a34a';
              textColor = '#ffffff';
              border = '2px solid #15803d';
              ringColor = 'rgba(22, 163, 74, 0.4)';
              activeBorder = '2.5px solid #15803d';
              labelColor = '#15803d';
              content = <Check size={16} strokeWidth={3} />;
            } else if (status === 'partial') {
              bg = '#fef08a';
              textColor = '#854d0e';
              border = '2px solid #ca8a04';
              ringColor = 'rgba(202, 138, 4, 0.4)';
              activeBorder = '2.5px solid #a16207';
              labelColor = '#a16207';
              content = <StepIcon size={16} strokeWidth={2.2} />;
            }

            return (
              <button
                key={step.number}
                onClick={() => setStep(step.number)}
                className="step-progress-node"
                title={`${title} - Status: ${status.toUpperCase()}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  minWidth: '60px',
                  flexShrink: 0,
                  padding: '2px 2px',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Circle Badge */}
                <div 
                  className="step-progress-circle"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    background: bg,
                    color: textColor,
                    border: isActive ? activeBorder : border,
                    boxShadow: isActive ? `0 0 0 4px ${ringColor}` : 'none',
                    transition: 'all 0.2s ease',
                    lineHeight: 1
                  }}
                >
                  {content}
                </div>

                {/* Title Text */}
                <span 
                  className="step-progress-label"
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: isActive ? 900 : 700,
                    color: labelColor,
                    whiteSpace: 'nowrap',
                    lineHeight: 1.35,
                    textAlign: 'center',
                    maxWidth: '85px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {title}
                </span>

                {/* Status Indicator */}
                {isActive && (
                  <div style={{
                    width: '16px',
                    height: '2.5px',
                    borderRadius: '2px',
                    background: status === 'complete' ? '#16a34a' : status === 'partial' ? '#ca8a04' : '#ef4444',
                    marginTop: '1px'
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Visual Status Legend */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(10px, 3vw, 18px)',
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '1px solid #f1f5f9',
          fontSize: 'clamp(0.68rem, 1.8vw, 0.72rem)',
          color: '#64748b',
          flexWrap: 'wrap'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
            <strong style={{ color: '#15803d' }}>●</strong> {legendGreen}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fef08a', border: '1.5px solid #ca8a04', display: 'inline-block' }}></span>
            <strong style={{ color: '#a16207' }}>●</strong> {legendYellow}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fee2e2', border: '1.5px solid #ef4444', display: 'inline-block' }}></span>
            <strong style={{ color: '#b91c1c' }}>●</strong> {legendRed}
          </span>
        </div>
      </div>
    </>
  );
}
