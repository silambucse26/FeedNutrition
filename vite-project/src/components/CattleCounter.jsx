import React, { useState, useCallback } from 'react';

// SVG silhouettes for each cattle type
const COW_SVG = (
  <svg viewBox="0 0 64 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    {/* Body */}
    <ellipse cx="30" cy="30" rx="18" ry="11" />
    {/* Head */}
    <ellipse cx="50" cy="24" rx="8" ry="6" />
    {/* Ear */}
    <ellipse cx="56" cy="20" rx="3" ry="2" />
    {/* Nose */}
    <ellipse cx="57" cy="26" rx="3" ry="2" />
    {/* Legs */}
    <rect x="16" y="39" width="4" height="8" rx="2" />
    <rect x="24" y="40" width="4" height="8" rx="2" />
    <rect x="34" y="40" width="4" height="8" rx="2" />
    <rect x="42" y="39" width="4" height="8" rx="2" />
    {/* Tail */}
    <path d="M12 28 Q6 24 8 18 Q9 16 11 18" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" />
    {/* Udder hint for cow */}
    <ellipse cx="29" cy="40" rx="5" ry="3" opacity="0.5" />
  </svg>
);

const BULL_SVG = (
  <svg viewBox="0 0 64 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    {/* Body - heavier */}
    <ellipse cx="30" cy="29" rx="20" ry="13" />
    {/* Neck hump */}
    <ellipse cx="44" cy="20" rx="8" ry="7" />
    {/* Head */}
    <ellipse cx="53" cy="24" rx="8" ry="6.5" />
    {/* Horns */}
    <path d="M52 18 Q50 10 56 9 Q58 11 56 16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* Ear */}
    <ellipse cx="58" cy="20" rx="3" ry="2" />
    {/* Nose */}
    <ellipse cx="60" cy="27" rx="3" ry="2.5" />
    {/* Legs */}
    <rect x="14" y="40" width="5" height="8" rx="2" />
    <rect x="23" y="41" width="5" height="7" rx="2" />
    <rect x="33" y="41" width="5" height="7" rx="2" />
    <rect x="42" y="40" width="5" height="8" rx="2" />
    {/* Tail */}
    <path d="M10 27 Q4 22 7 15 Q9 13 11 16" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" />
  </svg>
);

const HEIFER_SVG = (
  <svg viewBox="0 0 64 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    {/* Body - slightly smaller */}
    <ellipse cx="29" cy="30" rx="16" ry="10" />
    {/* Head */}
    <ellipse cx="47" cy="24" rx="7" ry="5.5" />
    {/* Ear */}
    <ellipse cx="52" cy="20" rx="2.5" ry="1.8" />
    {/* Nose */}
    <ellipse cx="53" cy="26" rx="2.5" ry="2" />
    {/* Legs */}
    <rect x="17" y="39" width="3.5" height="7" rx="2" />
    <rect x="24" y="40" width="3.5" height="7" rx="2" />
    <rect x="32" y="40" width="3.5" height="7" rx="2" />
    <rect x="39" y="39" width="3.5" height="7" rx="2" />
    {/* Tail */}
    <path d="M13 28 Q8 24 10 18 Q11 16 13 18" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" />
  </svg>
);

const CARTOON_BY_TYPE = {
  heifer: '/cattle_art/cartoon_heifer.jpg',
  pregnant: '/cattle_art/cartoon_pregnant.jpg',
  lactating: '/cattle_art/cartoon_lactating.jpg',
  dry: '/cattle_art/cartoon_dry_cow.jpg',
  cow: '/cattle_art/cartoon_lactating.jpg',
  bull: '/cattle_art/cartoon_bull.jpg',
};

// Production cycle diagram — highlights the active category with cartoon avatars
function CattleProductionCycle({ activeType, accentColor }) {
  const stages = [
    { key: 'dry',       label: 'Dry Cows',        angle: -90, img: '/cattle_art/cartoon_dry_cow.jpg' },
    { key: 'lactating', label: 'Lactating',       angle: 0,   img: '/cattle_art/cartoon_lactating.jpg' },
    { key: 'pregnant',  label: 'Pregnant',        angle: 72,  img: '/cattle_art/cartoon_pregnant.jpg' },
    { key: 'heifer',    label: 'Heifers (12+ mo)', angle: 144, img: '/cattle_art/cartoon_heifer.jpg' },
    { key: 'bull',      label: 'Bull',            angle: 216, img: '/cattle_art/cartoon_bull.jpg' },
  ];

  const R = 72; // radius
  const cx = 115; const cy = 115;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0 0' }}>
      <svg width="230" height="230" viewBox="0 0 230 230">
        <defs>
          {stages.map(s => (
            <clipPath key={`clip-${s.key}`} id={`cycle-clip-${s.key}`}>
              <circle
                cx={cx + R * Math.cos(s.angle * Math.PI / 180)}
                cy={cy + R * Math.sin(s.angle * Math.PI / 180)}
                r="17"
              />
            </clipPath>
          ))}
        </defs>

        {/* Outer dashed circle */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="6 4" />

        {/* Dots along circle */}
        {[0, 1, 2, 3, 4].map(i => {
          const a = (i * 72 - 54) * Math.PI / 180;
          const ax = cx + R * Math.cos(a);
          const ay = cy + R * Math.sin(a);
          return <circle key={i} cx={ax} cy={ay} r="2.5" fill="#cbd5e1" />;
        })}

        {/* Stage nodes with cartoon images */}
        {stages.map(s => {
          const a = s.angle * Math.PI / 180;
          const nx = cx + R * Math.cos(a);
          const ny = cy + R * Math.sin(a);
          const isActive = s.key === activeType;
          return (
            <g key={s.key}>
              {/* Glow ring for active */}
              {isActive && (
                <circle cx={nx} cy={ny} r="26" fill={accentColor} opacity="0.22" />
              )}
              {/* Cartoon image clipped to circle */}
              <image
                href={s.img}
                x={nx - 17}
                y={ny - 17}
                width="34"
                height="34"
                clipPath={`url(#cycle-clip-${s.key})`}
                preserveAspectRatio="xMidYMid slice"
              />
              {/* Node circle border */}
              <circle
                cx={nx}
                cy={ny}
                r="17"
                fill="none"
                stroke={isActive ? accentColor : '#cbd5e1'}
                strokeWidth={isActive ? 3 : 1.5}
              />
              {/* Label below/above */}
              <text
                x={nx}
                y={ny + (ny > cy ? 29 : -24)}
                textAnchor="middle"
                fontSize="8.5"
                fontWeight={isActive ? '800' : '600'}
                fill={isActive ? accentColor : '#64748b'}
                fontFamily="'Plus Jakarta Sans', sans-serif"
              >
                {s.label}
              </text>
            </g>
          );
        })}

        {/* Center text */}
        <text x={cx} y={cy - 7} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="700" fontFamily="'Plus Jakarta Sans', sans-serif">
          CATTLE
        </text>
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="700" fontFamily="'Plus Jakarta Sans', sans-serif">
          CYCLE
        </text>
      </svg>
    </div>
  );
}

/**
 * CattleCounter — tap-to-count cattle with animated icons
 *
 * Props:
 *  count         {number}   current count
 *  onAdd         {fn}       called when + is tapped (no args)
 *  onRemove      {fn}       called when - is tapped (no args)
 *  onClear       {fn}       called to reset to 0
 *  cattleType    {string}   'heifer' | 'cow' | 'bull'
 *  accentColor   {string}   theme color
 *  label         {string}   e.g. "Heifer"
 *  description   {string}   e.g. "Young female cattle not yet calved"
 *  maxDisplay    {number}   max icons shown (default 12)
 *  showCycle     {boolean}  show the production cycle diagram
 */
export default function CattleCounter({
  count = 0,
  onAdd,
  onRemove,
  onClear,
  cattleType = 'cow',
  accentColor = '#16a34a',
  label = 'Cattle',
  description = '',
  maxDisplay = 12,
  showCycle = true,
}) {
  const [lastTapped, setLastTapped] = useState(false);

  const handleTap = useCallback(() => {
    if (count >= 200) return;
    onAdd();
    setLastTapped(true);
    setTimeout(() => setLastTapped(false), 350);
  }, [count, onAdd]);

  const displayCount = Math.min(count, maxDisplay);
  const overflow = count > maxDisplay ? count - maxDisplay : 0;
  const cartoonImg = CARTOON_BY_TYPE[cattleType] || CARTOON_BY_TYPE.cow;

  // Map cattleType → cycle key
  const cycleKey = cattleType === 'heifer' ? 'heifer'
    : cattleType === 'pregnant' ? 'pregnant'
    : cattleType === 'lactating' ? 'lactating'
    : cattleType === 'bull' ? 'bull'
    : 'dry';

  const defaultDesc = cattleType === 'heifer' ? 'Above 12 months old cattle only' : description;

  return (
    <div style={{ width: '100%' }}>

      {/* Production Cycle + Tap Zone — side by side on desktop */}
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        marginBottom: '20px',
      }}>

        {/* Left: Cycle Diagram */}
        {showCycle && (
          <div style={{
            flex: '0 0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <CattleProductionCycle activeType={cycleKey} accentColor={accentColor} />
            <p style={{
              fontSize: '0.74rem',
              color: '#64748b',
              textAlign: 'center',
              fontWeight: 700,
              margin: '-2px 0 0',
              maxWidth: '170px',
            }}>
              {defaultDesc}
            </p>
          </div>
        )}

        {/* Right: Tap counter section */}
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>

          {/* Big tap button */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
          }}>
            <p style={{
              fontSize: '0.82rem',
              color: '#64748b',
              fontWeight: 600,
              margin: 0,
              textAlign: 'center',
            }}>
              Tap the {label} to add one · Tap as many times as you have
            </p>

            {/* TAP BUTTON WITH CARTOON AVATAR */}
            <button
              type="button"
              onClick={handleTap}
              title={`Tap to add a ${label}`}
              style={{
                width: '120px',
                height: '106px',
                borderRadius: '24px',
                border: `3px solid ${accentColor}`,
                background: lastTapped ? `${accentColor}25` : '#ffffff',
                color: accentColor,
                cursor: count >= 200 ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: lastTapped ? 'scale(0.92)' : 'scale(1)',
                boxShadow: lastTapped
                  ? `0 0 0 6px ${accentColor}30, 0 8px 24px ${accentColor}40`
                  : `0 6px 18px ${accentColor}20`,
                outline: 'none',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                padding: '8px',
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: `2.5px solid ${accentColor}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                flexShrink: 0,
              }}>
                <img
                  src={cartoonImg}
                  alt={label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.04em', color: accentColor }}>
                TAP TO ADD
              </span>
            </button>

            {/* Count display + controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <button
                type="button"
                onClick={onRemove}
                disabled={count === 0}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: `2px solid ${count === 0 ? '#e2e8f0' : accentColor}`,
                  background: count === 0 ? '#f8fafc' : '#ffffff',
                  color: count === 0 ? '#cbd5e1' : accentColor,
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  cursor: count === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                −
              </button>

              <div style={{
                minWidth: '72px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  color: count === 0 ? '#cbd5e1' : accentColor,
                  lineHeight: 1,
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'color 0.2s ease',
                }}>
                  {count}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginTop: '1px' }}>
                  {label}{count !== 1 ? 's' : ''}
                </div>
              </div>

              <button
                type="button"
                onClick={handleTap}
                disabled={count >= 200}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: `2px solid ${count >= 200 ? '#e2e8f0' : accentColor}`,
                  background: count >= 200 ? '#f8fafc' : accentColor,
                  color: count >= 200 ? '#cbd5e1' : '#ffffff',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  cursor: count >= 200 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                +
              </button>
            </div>

            {/* Clear button */}
            {count > 0 && (
              <button
                type="button"
                onClick={onClear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '0',
                }}
              >
                Clear all {label}s
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cattle Icon Grid — shows up to maxDisplay cartoon avatars */}
      {count > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '14px',
          background: `${accentColor}08`,
          borderRadius: '16px',
          border: `1.5px solid ${accentColor}25`,
          marginBottom: '16px',
          minHeight: '60px',
          alignItems: 'center',
        }}>
          {Array.from({ length: displayCount }).map((_, i) => (
            <div
              key={i}
              className="cattle-icon-anim"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: `2px solid ${accentColor}`,
                boxShadow: `0 2px 6px ${accentColor}25`,
                animationDelay: `${Math.min(i * 0.03, 0.4)}s`,
                background: '#ffffff',
                flexShrink: 0,
              }}
            >
              <img
                src={cartoonImg}
                alt={label}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
          {overflow > 0 && (
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 900,
              flexShrink: 0,
            }}>
              +{overflow}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {count === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '14px',
          border: '1.5px dashed #e2e8f0',
          marginBottom: '16px',
          color: '#94a3b8',
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            overflow: 'hidden',
            margin: '0 auto 8px',
            border: '2px dashed #cbd5e1',
            opacity: 0.6,
          }}>
            <img
              src={cartoonImg}
              alt={label}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>
            No {label}s added yet — tap the {label} icon above!
          </p>
          <p style={{ fontSize: '0.72rem', margin: '4px 0 0', color: '#cbd5e1' }}>
            If you don't have any {label.toLowerCase()}s, leave at 0 and proceed.
          </p>
        </div>
      )}
    </div>
  );
}
