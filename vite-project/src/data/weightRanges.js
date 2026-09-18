// Predefined Animal Weight and Production Ranges (Mid-Point / Average Used for Precision Calculations)

export const COW_WEIGHT_RANGES = [
  { label: 'Select Weight Range...', value: '', avg: '' },
  { label: '< 250 kg', value: '<250', avg: 225 },
  { label: '250 – 300 kg', value: '250-300', avg: 275 },
  { label: '300 – 350 kg', value: '300-350', avg: 325 },
  { label: '350 – 400 kg', value: '350-400', avg: 375 },
  { label: '400 – 450 kg', value: '400-450', avg: 425 },
  { label: '450 – 500 kg', value: '450-500', avg: 475 },
  { label: '500 – 550 kg', value: '500-550', avg: 525 },
  { label: '550 – 600 kg', value: '550-600', avg: 575 },
  { label: '600 – 650 kg', value: '600-650', avg: 625 },
  { label: '> 650 kg', value: '>650', avg: 675 },
  { label: 'Custom kg', value: 'custom', avg: '' }
];

export const HEIFER_WEIGHT_RANGES = [
  { label: 'Select Weight Range...', value: '', avg: '' },
  { label: '< 150 kg', value: '<150', avg: 125 },
  { label: '150 – 200 kg', value: '150-200', avg: 175 },
  { label: '200 – 250 kg', value: '200-250', avg: 225 },
  { label: '250 – 300 kg', value: '250-300', avg: 275 },
  { label: '300 – 350 kg', value: '300-350', avg: 325 },
  { label: '350 – 400 kg', value: '350-400', avg: 375 },
  { label: '> 400 kg', value: '>400', avg: 425 },
  { label: 'Custom kg', value: 'custom', avg: '' }
];

export const BULL_WEIGHT_RANGES = [
  { label: 'Select Weight Range...', value: '', avg: '' },
  { label: '300 – 400 kg', value: '300-400', avg: 350 },
  { label: '400 – 500 kg', value: '400-500', avg: 450 },
  { label: '500 – 600 kg', value: '500-600', avg: 550 },
  { label: '600 – 700 kg', value: '600-700', avg: 650 },
  { label: '700 – 800 kg', value: '700-800', avg: 750 },
  { label: '> 800 kg', value: '>800', avg: 850 },
  { label: 'Custom kg', value: 'custom', avg: '' }
];

export const PREGNANCY_MONTH_OPTIONS = [
  { label: 'Select Pregnancy Month...', value: '' },
  { label: 'Month 1 (30 days)', value: 1, days: 30 },
  { label: 'Month 2 (60 days)', value: 2, days: 60 },
  { label: 'Month 3 (90 days)', value: 3, days: 90 },
  { label: 'Month 4 (120 days)', value: 4, days: 120 },
  { label: 'Month 5 (150 days)', value: 5, days: 150 },
  { label: 'Month 6 (180 days)', value: 6, days: 180 },
  { label: 'Month 7 (210 days)', value: 7, days: 210 },
  { label: 'Month 8 (240 days)', value: 8, days: 240 },
  { label: 'Month 9 (270 days)', value: 9, days: 270 }
];

export const PREGNANCY_DAYS_OPTIONS = [
  { label: 'Select Days...', value: '' },
  { label: '30 days', value: 30 },
  { label: '60 days', value: 60 },
  { label: '90 days', value: 90 },
  { label: '120 days', value: 120 },
  { label: '150 days', value: 150 },
  { label: '180 days', value: 180 },
  { label: '210 days', value: 210 },
  { label: '240 days', value: 240 },
  { label: '270 days', value: 270 },
  { label: 'Custom Days', value: 'custom' }
];

export const MILK_YIELD_RANGES = [
  { label: 'Select Milk Yield...', value: '', avg: '' },
  { label: '< 4 L/day', value: '<4', avg: 3.0 },
  { label: '4 – 6 L/day', value: '4-6', avg: 5.0 },
  { label: '6 – 8 L/day', value: '6-8', avg: 7.0 },
  { label: '8 – 10 L/day', value: '8-10', avg: 9.0 },
  { label: '10 – 12 L/day', value: '10-12', avg: 11.0 },
  { label: '12 – 15 L/day', value: '12-15', avg: 13.5 },
  { label: '15 – 18 L/day', value: '15-18', avg: 16.5 },
  { label: '18 – 22 L/day', value: '18-22', avg: 20.0 },
  { label: '22 – 26 L/day', value: '22-26', avg: 24.0 },
  { label: '> 26 L/day', value: '>26', avg: 28.0 },
  { label: 'Custom L/day', value: 'custom', avg: '' }
];

export const MILK_FAT_RANGES = [
  { label: 'Select Milk Fat %...', value: '', avg: '' },
  { label: '3.0% – 3.5%', value: '3.0-3.5', avg: 3.25 },
  { label: '3.5% – 4.0%', value: '3.5-4.0', avg: 3.75 },
  { label: '4.0% – 4.5%', value: '4.0-4.5', avg: 4.25 },
  { label: '4.5% – 5.0%', value: '4.5-5.0', avg: 4.75 },
  { label: '5.0% – 6.0%', value: '5.0-6.0', avg: 5.5 },
  { label: '6.0% – 7.5%', value: '6.0-7.5', avg: 6.75 },
  { label: '> 7.5%', value: '>7.5', avg: 8.0 },
  { label: 'Custom Fat %', value: 'custom', avg: '' }
];

export const DRY_DAYS_RANGES = [
  { label: 'Select Dry Period...', value: '', avg: '' },
  { label: '< 30 days', value: '<30', avg: 20 },
  { label: '30 – 45 days', value: '30-45', avg: 38 },
  { label: '45 – 60 days', value: '45-60', avg: 52 },
  { label: '60 – 75 days', value: '60-75', avg: 68 },
  { label: '> 75 days', value: '>75', avg: 85 },
  { label: 'Custom Days', value: 'custom', avg: '' }
];

/**
 * Helper to match an existing numeric value to a range option, or return 'custom'
 */
export function getMatchingRangeValue(val, ranges) {
  if (val === '' || val === undefined || val === null) return '';
  const num = Number(val);
  const match = ranges.find(r => r.avg === num);
  if (match) return match.value;
  return 'custom';
}
