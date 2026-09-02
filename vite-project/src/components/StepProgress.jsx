import React from 'react';
import { Check, Save } from 'lucide-react';

export default function StepProgress({ currentStep, setStep, isStepValid, t }) {
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
    <div className="wg-card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
      {/* Top Auto-Save Notification Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', fontSize: '0.78rem' }}>
        <span style={{ color: '#475569', fontWeight: 700 }}>
          STEP {currentStep > 9 ? 10 : currentStep} OF 10 • {currentTitle?.toUpperCase()}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 600 }}>
          <Save size={13} color="#16a34a" /> {t ? t('auto_saved') : 'Auto-saved'}
        </span>
      </div>

      {/* Steps Scroll Container */}
      <div 
        className="horizontal-scroll"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          gap: '6px',
          paddingBottom: '6px'
        }}
      >
        {steps.map((step) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isClickable = step.number < currentStep || isStepValid(step.number - 1);
          const title = t ? t(`steps.${step.key}`) : step.fallback;

          return (
            <button
              key={step.number}
              onClick={() => isClickable && setStep(step.number)}
              disabled={!isClickable && !isActive}
              style={{
                background: 'none',
                border: 'none',
                cursor: isClickable ? 'pointer' : 'default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                minWidth: '55px',
                opacity: isClickable || isActive ? 1 : 0.45,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.8rem',
                background: isCompleted ? '#16a34a' : isActive ? '#ffffff' : '#f1f5f9',
                color: isCompleted ? '#ffffff' : isActive ? '#16a34a' : '#64748b',
                border: isActive ? '2px solid #16a34a' : isCompleted ? 'none' : '1px solid #cbd5e1',
                boxShadow: isActive ? '0 0 0 3px rgba(22, 163, 74, 0.2)' : 'none'
              }}>
                {isCompleted ? <Check size={16} strokeWidth={3} /> : step.number}
              </div>

              <span style={{
                fontSize: '0.72rem',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#16a34a' : '#475569',
                whiteSpace: 'nowrap'
              }}>
                {title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
