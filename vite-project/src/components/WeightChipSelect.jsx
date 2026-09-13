import React, { useState } from 'react';
import { Check, Pencil } from 'lucide-react';

/**
 * WeightChipSelect — Replace dropdowns with tap-to-select chips
 *
 * Props match the same API as WeightRangeSelect for drop-in replacement:
 *  value         current weight value (numeric or '')
 *  onChange      fn(numericValue)
 *  ranges        array of { label, value, avg }
 *  label         field label string
 *  accentColor   theme color
 *  required      boolean
 */
export default function WeightChipSelect({
  value,
  onChange,
  ranges = [],
  label = 'Select Weight',
  accentColor = '#16a34a',
  required = true,
}) {
  const [showCustom, setShowCustom] = useState(false);
  const [customVal, setCustomVal] = useState('');

  // Find which range is currently selected
  const currentRange = ranges.find(r => r.avg !== '' && r.avg !== undefined && Number(r.avg) === Number(value));

  // Filter out the placeholder & custom from chips
  const chipRanges = ranges.filter(r => r.value !== '' && r.value !== 'custom');

  const hasVal = value !== '' && value !== undefined && Number(value) > 0;

  const handleSelect = (r) => {
    setShowCustom(false);
    onChange(r.avg);
  };

  const handleCustomSubmit = () => {
    const parsed = parseFloat(customVal);
    if (!isNaN(parsed) && parsed > 0) {
      onChange(parsed);
      setShowCustom(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Label row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '5px',
      }}>
        <label style={{
          fontSize: '0.78rem',
          color: '#334155',
          fontWeight: 800,
        }}>
          {label}{required && <span style={{ color: accentColor }}> *</span>}
        </label>
        {hasVal && (
          <span style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            color: accentColor,
            background: `${accentColor}15`,
            padding: '1px 7px',
            borderRadius: '12px',
          }}>
            ✓ {value} kg
          </span>
        )}
      </div>

      {/* Chip grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '5px',
        marginBottom: showCustom ? '6px' : '0',
      }}>
        {chipRanges.map((r, i) => {
          const isSelected = currentRange?.value === r.value;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(r)}
              style={{
                padding: '4px 9px',
                borderRadius: '14px',
                border: `1.5px solid ${isSelected ? accentColor : '#e2e8f0'}`,
                background: isSelected ? accentColor : '#ffffff',
                color: isSelected ? '#ffffff' : '#475569',
                fontSize: '0.72rem',
                fontWeight: isSelected ? 800 : 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? `0 2px 6px ${accentColor}30` : '0 1px 2px rgba(0,0,0,0.04)',
                whiteSpace: 'nowrap',
              }}
            >
              {isSelected && <Check size={11} strokeWidth={3} />}
              {r.label.replace(/\s*\(.*?\)/g, '').replace(/^Select.*$/i, '').trim()}
            </button>
          );
        })}

        {/* Custom / manual entry chip */}
        <button
          type="button"
          onClick={() => {
            setShowCustom(!showCustom);
            if (!showCustom && hasVal && !currentRange) {
              setCustomVal(String(value));
            }
          }}
          style={{
            padding: '7px 12px',
            borderRadius: '24px',
            border: `2px solid ${showCustom || (!currentRange && hasVal) ? accentColor : '#e2e8f0'}`,
            background: showCustom || (!currentRange && hasVal) ? `${accentColor}15` : '#f8fafc',
            color: showCustom || (!currentRange && hasVal) ? accentColor : '#94a3b8',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <Pencil size={11} />
          Custom kg
        </button>
      </div>

      {/* Custom input — slide in when needed */}
      {showCustom && (
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          marginTop: '8px',
          padding: '10px 12px',
          background: `${accentColor}08`,
          borderRadius: '12px',
          border: `1.5px solid ${accentColor}30`,
        }}>
          <input
            type="number"
            min="30"
            max="1500"
            step="1"
            placeholder="Enter exact kg (e.g. 340)"
            value={customVal}
            autoFocus
            onChange={e => setCustomVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
            onWheel={e => e.target.blur()}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1.5px solid ${accentColor}60`,
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#0f172a',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={handleCustomSubmit}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: accentColor,
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Set
          </button>
        </div>
      )}

      {/* Validation */}
      {!hasVal && required && (
        <p style={{
          fontSize: '0.72rem',
          color: '#ef4444',
          fontWeight: 600,
          margin: '6px 0 0',
        }}>
          * Please select a weight range
        </p>
      )}
    </div>
  );
}
