import React, { useState, useEffect } from 'react';

export default function WeightRangeSelect({
  value,
  onChange,
  ranges = [],
  label = 'Select Weight Range',
  placeholder = 'Select weight range...',
  accentColor = '#16a34a',
  required = true
}) {
  // Determine initial selected range key
  const findMatchingKey = (val) => {
    if (val === '' || val === undefined || val === null) return '';
    const num = Number(val);
    const match = ranges.find(r => r.avg === num);
    if (match) return match.value;
    return 'custom';
  };

  const [selectedRange, setSelectedRange] = useState(() => findMatchingKey(value));
  const [customVal, setCustomVal] = useState(() => {
    const isCustom = findMatchingKey(value) === 'custom';
    return isCustom ? value : '';
  });

  useEffect(() => {
    const key = findMatchingKey(value);
    setSelectedRange(key);
    if (key === 'custom') {
      setCustomVal(value);
    }
  }, [value]);

  const handleSelectChange = (e) => {
    const key = e.target.value;
    setSelectedRange(key);

    if (key === '') {
      onChange('');
    } else if (key === 'custom') {
      onChange(customVal === '' ? '' : (parseFloat(customVal) || ''));
    } else {
      const match = ranges.find(r => r.value === key);
      if (match && match.avg !== '') {
        onChange(match.avg);
      }
    }
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomVal(val);
    onChange(val === '' ? '' : (parseFloat(val) || ''));
  };

  const hasVal = value !== '' && value !== undefined && Number(value) > 0;
  const currentRangeObj = ranges.find(r => r.value === selectedRange);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <label style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>
          {label} {required && '*'}
        </label>
        {hasVal && (
          <span style={{ fontSize: '0.72rem', color: accentColor, fontWeight: 800 }}>
            Avg: {value} kg
          </span>
        )}
      </div>

      <select
        value={selectedRange}
        onChange={handleSelectChange}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 400,
          color: '#000000',
          border: !hasVal ? '1.5px solid #f87171' : '1.5px solid #cbd5e1',
          background: !hasVal ? '#fff5f5' : '#ffffff',
          marginBottom: selectedRange === 'custom' ? '6px' : '0'
        }}
      >
        {ranges.map((r, i) => (
          <option key={i} value={r.value} style={{ color: '#000000', fontWeight: 400 }}>
            {r.label}
          </option>
        ))}
      </select>

      {/* Manual Input if 'custom' selected */}
      {selectedRange === 'custom' && (
        <div style={{ marginTop: '4px' }}>
          <input
            type="number"
            min="30"
            max="1500"
            step="1"
            placeholder="e.g. 400"
            value={customVal === undefined || customVal === 0 ? '' : customVal}
            onFocus={(e) => {
              if (e.target.value === '0') setCustomVal('');
              e.target.select();
            }}
            onWheel={(e) => e.target.blur()}
            onChange={handleCustomChange}
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#000000',
              border: !customVal ? '1.5px solid #f87171' : '1.5px solid #86efac'
            }}
          />
        </div>
      )}

      {!hasVal && required && (
        <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600, display: 'block', marginTop: '2px' }}>
          * Weight range required
        </span>
      )}
    </div>
  );
}
