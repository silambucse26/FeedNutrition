import React from 'react';
import { Check, Save, AlertCircle } from 'lucide-react';

export default function StepProgress({ 
  currentStep, 
  setStep, 
  getStepStatus, 
  isStepValid, 
  isWeatherComplete,
  t 
}) {
  const steps = [
    { number: 1, key: 'step_1', fallback: 'Breed' },
    { number: 2, key: 'step_2', fallback: 'Heifers' },
    { number: 3, key: 'step_3', fallback: 'Pregnant' },
    { number: 4, key: 'step_4', fallback: 'Lactating' },
    { number: 5, key: 'step_5', fallback: 'Dry Cows' },
    { number: 6, key: 'step_6', fallback: 'Bulls' },
    { number: 7, key: 'step_7', fallback: 'Grazing' },
    { number: 8, key: 'step_8', fallback: 'Water' },
    { number: 9, key: 'step_9', fallback: 'Feed' },
    { number: 10, key: 'step_10', fallback: 'Summary' }
  ];

  const currentStepObj = steps[currentStep - 1];
  const currentTitle = t ? t(`steps.${currentStepObj?.key}`) : currentStepObj?.fallback;

  return (
    <div className="wg-card" style={{ padding: 'clamp(10px, 2.5vw, 16px) clamp(12px, 3vw, 20px)', marginBottom: '16px' }}>
      {/* Top Auto-Save & Status Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.78rem', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#0f172a', fontWeight: 800 }}>
            STEP {currentStep > 9 ? 10 : currentStep} OF 10 • {currentTitle?.toUpperCase()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 600, fontSize: '0.75rem' }}>
            <Save size={13} color="#16a34a" /> {t ? t('auto_saved') : 'Auto-saved'}
          </span>
        </div>

        {/* Live Weather Status Indicator */}
        <div>
          {isWeatherComplete ? (
            <span></span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
              <AlertCircle size={12} />
              Location & Temp/RH Required
            </span>
          )}
        </div>
      </div>

      {/* Steps Horizontal Scroll Container with generous vertical padding to avoid clipping */}
      <div 
        className="horizontal-scroll"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          gap: '8px',
          padding: '12px 4px 10px 4px',
          overflowX: 'auto',
          overflowY: 'visible'
        }}
      >
        {steps.map((step) => {
          const isActive = currentStep === step.number;
          const status = getStepStatus ? getStepStatus(step.number) : 'empty';
          const title = t ? t(`steps.${step.key}`) : step.fallback;

          // Outlines and badges exclusively in GREEN, YELLOW, or RED (NEVER in black)
          let bg = '#fee2e2';
          let textColor = '#dc2626';
          let border = '2px solid #ef4444';
          let ringColor = 'rgba(239, 68, 68, 0.35)';
          let activeBorder = '2.5px solid #dc2626';
          let labelColor = '#b91c1c';
          let content = step.number;

          if (status === 'complete') {
            bg = '#16a34a';
            textColor = '#ffffff';
            border = '2px solid #15803d';
            ringColor = 'rgba(22, 163, 74, 0.4)';
            activeBorder = '2.5px solid #15803d';
            labelColor = '#15803d';
            content = <Check size={17} strokeWidth={3} />;
          } else if (status === 'partial') {
            bg = '#fef08a';
            textColor = '#854d0e';
            border = '2px solid #ca8a04';
            ringColor = 'rgba(202, 138, 4, 0.4)';
            activeBorder = '2.5px solid #a16207';
            labelColor = '#a16207';
            content = step.number;
          } else {
            // empty / not filled (RED)
            bg = '#fee2e2';
            textColor = '#dc2626';
            border = '2px solid #ef4444';
            ringColor = 'rgba(239, 68, 68, 0.4)';
            activeBorder = '2.5px solid #b91c1c';
            labelColor = '#b91c1c';
            content = step.number;
          }

          return (
            <button
              key={step.number}
              onClick={() => setStep(step.number)}
              title={`${title} - Status: ${status.toUpperCase()}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                minWidth: '62px',
                flexShrink: 0,
                padding: '2px 4px',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              {/* Circle Badge */}
              <div style={{
                width: '36px',
                height: '36px',
                minWidth: '36px',
                minHeight: '36px',
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
              }}>
                {content}
              </div>

              {/* Title Text (Color matched, no overlap) */}
              <span style={{
                fontSize: '0.74rem',
                fontWeight: isActive ? 900 : 700,
                color: labelColor,
                whiteSpace: 'nowrap',
                lineHeight: 1.2
              }}>
                {title}
              </span>

              {/* Matching Status Indicator Dot for Active Step */}
              {isActive && (
                <div style={{
                  width: '18px',
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
        gap: '18px',
        marginTop: '10px',
        paddingTop: '10px',
        borderTop: '1px solid #f1f5f9',
        fontSize: '0.72rem',
        color: '#64748b',
        flexWrap: 'wrap'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
          <strong style={{ color: '#15803d' }}>Green:</strong> Completed
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fef08a', border: '1.5px solid #ca8a04', display: 'inline-block' }}></span>
          <strong style={{ color: '#a16207' }}>Yellow:</strong> Partially Filled
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fee2e2', border: '1.5px solid #ef4444', display: 'inline-block' }}></span>
          <strong style={{ color: '#b91c1c' }}>Red:</strong> Not Filled
        </span>
      </div>
    </div>
  );
}
