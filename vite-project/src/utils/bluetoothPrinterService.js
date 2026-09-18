import { translateFeed } from './tamilTranslations';
import { getEscPosPartnerLogosBytes } from './brandLogos';
import { resolveLocationDetails } from './locationHelper';

/**
 * Bluetooth Thermal Printer Service (ESC/POS)
 * Supports portable 58mm / 80mm Bluetooth receipt printers
 * via Web Bluetooth API (Chrome, Edge, Opera on Android, Windows, Mac, Linux).
 * Also provides formatted receipt text and PDF slip generation.
 */

// Well-known BLE Serial & Thermal Printer Service UUIDs
const PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard Printer Service
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Posiflex / Common POS
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent
  '0000af00-0000-1000-8000-00805f9b34fb', // Custom POS
  '0000ae00-0000-1000-8000-00805f9b34fb',
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '0000fee7-0000-1000-8000-00805f9b34fb',
];

// Check if Web Bluetooth is available in the current browser
export function isBluetoothSupported() {
  return typeof navigator !== 'undefined' && Boolean(navigator.bluetooth);
}

/**
 * Encodes text into ESC/POS binary buffer
 */
export function createEscPosBuffer(lines) {
  const bytes = [];

  // ESC @: Initialize printer
  bytes.push(0x1b, 0x40);

  // ESC t 0: Default code page
  bytes.push(0x1b, 0x74, 0x00);

  for (const item of lines) {
    if (typeof item === 'string') {
      // Normal line
      for (let i = 0; i < item.length; i++) {
        bytes.push(item.charCodeAt(i) & 0xff);
      }
      bytes.push(0x0a); // Newline
    } else if (item.type === 'header') {
      // Center + Bold + Double Height
      bytes.push(0x1b, 0x61, 0x01); // Center
      bytes.push(0x1b, 0x45, 0x01); // Bold on
      bytes.push(0x1b, 0x21, 0x20); // Double height
      for (let i = 0; i < item.text.length; i++) {
        bytes.push(item.text.charCodeAt(i) & 0xff);
      }
      bytes.push(0x0a);
      bytes.push(0x1b, 0x21, 0x00); // Normal size
      bytes.push(0x1b, 0x45, 0x00); // Bold off
      bytes.push(0x1b, 0x61, 0x00); // Left align
    } else if (item.type === 'sub') {
      // Center align small
      bytes.push(0x1b, 0x61, 0x01);
      for (let i = 0; i < item.text.length; i++) {
        bytes.push(item.text.charCodeAt(i) & 0xff);
      }
      bytes.push(0x0a);
      bytes.push(0x1b, 0x61, 0x00);
    } else if (item.type === 'divider') {
      const div = item.char ? item.char.repeat(32) : '--------------------------------';
      for (let i = 0; i < div.length; i++) {
        bytes.push(div.charCodeAt(i) & 0xff);
      }
      bytes.push(0x0a);
    } else if (item.type === 'bold') {
      bytes.push(0x1b, 0x45, 0x01); // Bold on
      for (let i = 0; i < item.text.length; i++) {
        bytes.push(item.text.charCodeAt(i) & 0xff);
      }
      bytes.push(0x0a);
      bytes.push(0x1b, 0x45, 0x00); // Bold off
    } else if (item.type === 'row') {
      // Left and Right aligned columns (32 chars wide)
      const left = item.left || '';
      const right = item.right || '';
      const spaceLen = Math.max(1, 32 - left.length - right.length);
      const combined = left + ' '.repeat(spaceLen) + right;
      for (let i = 0; i < combined.length; i++) {
        bytes.push(combined.charCodeAt(i) & 0xff);
      }
      bytes.push(0x0a);
    } else if (item.type === 'bitmap') {
      // ESC a 1: Center alignment for image
      bytes.push(0x1b, 0x61, 0x01);
      const rawBytes = item.data;
      if (rawBytes && rawBytes.length > 0) {
        for (let i = 0; i < rawBytes.length; i++) {
          bytes.push(rawBytes[i]);
        }
        bytes.push(0x0a);
      }
      // ESC a 0: Left align
      bytes.push(0x1b, 0x61, 0x00);
    }
  }

  // Feed 4 lines & paper cut command
  bytes.push(0x1b, 0x64, 0x04);
  bytes.push(0x1d, 0x56, 0x00); // GS V 0: Full cut

  return new Uint8Array(bytes);
}

// ─── Auto-Connect & Memory Cache State ─────────────────────────────
let cachedBluetoothDevice = null;
let activeGattServer = null;
let activeWriteChar = null;

const STORAGE_KEY_ID = 'FEED_NUTRI_BT_PRINTER_ID';
const STORAGE_KEY_NAME = 'FEED_NUTRI_BT_PRINTER_NAME';

/**
 * Returns saved printer info from localStorage
 */
export function getSavedPrinterInfo() {
  if (typeof window === 'undefined') return { id: null, name: null, hasSaved: false };
  try {
    const id = localStorage.getItem(STORAGE_KEY_ID);
    const name = localStorage.getItem(STORAGE_KEY_NAME);
    return {
      id: id || null,
      name: name || null,
      hasSaved: Boolean(id || name || cachedBluetoothDevice),
    };
  } catch {
    return { id: null, name: null, hasSaved: false };
  }
}

/**
 * Forget/Unpair the saved printer so user can pair a new device
 */
export function forgetSavedPrinter() {
  try {
    if (activeGattServer?.connected) {
      activeGattServer.disconnect();
    }
  } catch {}
  cachedBluetoothDevice = null;
  activeGattServer = null;
  activeWriteChar = null;
  try {
    localStorage.removeItem(STORAGE_KEY_ID);
    localStorage.removeItem(STORAGE_KEY_NAME);
  } catch {}
}

/**
 * Tries to get the previously permitted Bluetooth device without user picker prompt
 */
export async function getRememberedBluetoothDevice() {
  // 1. In-memory cached device from current session
  if (cachedBluetoothDevice) {
    return cachedBluetoothDevice;
  }

  // 2. Web Bluetooth getDevices() (Supported in Chrome/Edge 85+)
  if (typeof navigator !== 'undefined' && navigator.bluetooth?.getDevices) {
    try {
      const devices = await navigator.bluetooth.getDevices();
      if (devices && devices.length > 0) {
        const savedId = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ID) : null;
        const savedName = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_NAME) : null;

        if (savedId) {
          const match = devices.find(d => d.id === savedId);
          if (match) {
            cachedBluetoothDevice = match;
            return match;
          }
        }
        if (savedName) {
          const match = devices.find(d => d.name === savedName);
          if (match) {
            cachedBluetoothDevice = match;
            return match;
          }
        }
        // If only 1 permitted printer device exists in browser permission store
        cachedBluetoothDevice = devices[0];
        return devices[0];
      }
    } catch (e) {
      console.warn('Could not retrieve permitted Bluetooth devices:', e);
    }
  }

  return null;
}

/**
 * Helper to establish GATT connection and retrieve writable characteristic
 */
async function connectToPrinterDevice(device, onStatus) {
  // If already connected and characteristic is ready, reuse immediately
  if (device.gatt?.connected && activeWriteChar && cachedBluetoothDevice === device) {
    return { server: device.gatt, writeChar: activeWriteChar };
  }

  onStatus?.(`Connecting to ${device.name || 'Thermal Printer'}...`);
  const server = await device.gatt.connect();

  onStatus?.('Discovering printer service...');
  let printerService = null;
  for (const uuid of PRINTER_SERVICES) {
    try {
      printerService = await server.getPrimaryService(uuid);
      if (printerService) break;
    } catch {}
  }

  // Fallback: list all services if known UUID not matched
  if (!printerService) {
    try {
      const services = await server.getPrimaryServices();
      if (services && services.length > 0) {
        printerService = services[0];
      }
    } catch (e) {
      console.warn('Could not list primary services:', e);
    }
  }

  if (!printerService) {
    throw new Error('Could not find compatible thermal printer service on this device.');
  }

  onStatus?.('Finding writable characteristic...');
  const characteristics = await printerService.getCharacteristics();
  let writeChar = null;

  for (const char of characteristics) {
    if (char.properties.write || char.properties.writeWithoutResponse) {
      writeChar = char;
      break;
    }
  }

  if (!writeChar) {
    throw new Error('No writable characteristic found on this printer.');
  }

  // Cache active connection
  cachedBluetoothDevice = device;
  activeGattServer = server;
  activeWriteChar = writeChar;

  // Persist to localStorage for next time
  try {
    if (device.id) localStorage.setItem(STORAGE_KEY_ID, device.id);
    if (device.name) localStorage.setItem(STORAGE_KEY_NAME, device.name);
  } catch {}

  // Handle sudden disconnect
  device.addEventListener?.('gattserverdisconnected', () => {
    activeGattServer = null;
    activeWriteChar = null;
  });

  return { server, writeChar };
}

/**
 * Connect to Bluetooth Thermal Printer & Print Data
 * Automatically reconnects to previously used printer if available!
 *
 * @param {Uint8Array} escPosBuffer - Formatted ESC/POS byte array
 * @param {Function} onStatus - Callback for UI progress updates
 * @param {Object} options - { forceNewDevice: boolean }
 */
export async function printViaBluetooth(escPosBuffer, onStatus, { forceNewDevice = false } = {}) {
  if (!isBluetoothSupported()) {
    throw new Error('Bluetooth is not supported on this browser. Please use Chrome/Edge on Android or PC, or use the Thermal Print Slip option.');
  }

  let device = null;
  let isAutoReconnected = false;

  // Step 1: Try auto-connecting to remembered device if not forcing a new picker
  if (!forceNewDevice) {
    try {
      const remembered = await getRememberedBluetoothDevice();
      if (remembered) {
        onStatus?.(`தானாக இணைகிறது: ${remembered.name || 'Thermal Printer'}... (Auto-connecting)`);
        try {
          const conn = await connectToPrinterDevice(remembered, onStatus);
          device = remembered;
          isAutoReconnected = true;
          return await sendEscPosToPrinter(conn.writeChar, escPosBuffer, device, onStatus, true);
        } catch (autoErr) {
          console.warn('Auto-reconnect to saved printer failed (device may be off/unreachable):', autoErr);
          // Fall through to manual picker
          device = null;
        }
      }
    } catch (e) {
      console.warn('Error reading remembered Bluetooth device:', e);
    }
  }

  // Step 2: If no saved device or auto-reconnect failed, prompt device picker
  onStatus?.('Requesting Bluetooth device...');
  try {
    device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: PRINTER_SERVICES,
    });
  } catch (err) {
    if (err.name === 'NotFoundError') {
      throw new Error('Bluetooth scan was cancelled or no device was chosen.');
    }
    throw err;
  }

  const conn = await connectToPrinterDevice(device, onStatus);
  return await sendEscPosToPrinter(conn.writeChar, escPosBuffer, device, onStatus, false);
}

/**
 * Helper to transmit ESC/POS buffer chunks to the printer
 */
async function sendEscPosToPrinter(writeChar, escPosBuffer, device, onStatus, isAuto) {
  onStatus?.('Sending feed receipt data...');

  // Send buffer in chunks of 64 bytes (standard BLE MTU)
  const CHUNK_SIZE = 64;
  for (let offset = 0; offset < escPosBuffer.length; offset += CHUNK_SIZE) {
    const chunk = escPosBuffer.slice(offset, offset + CHUNK_SIZE);
    if (writeChar.properties.writeWithoutResponse) {
      await writeChar.writeValueWithoutResponse(chunk);
    } else {
      await writeChar.writeValue(chunk);
    }
    await new Promise(res => setTimeout(res, 25));
  }

  onStatus?.('Print completed successfully!');

  // Keep connection open briefly so consecutive prints don't renegotiate, then disconnect cleanly
  setTimeout(() => {
    try {
      if (device.gatt?.connected) {
        device.gatt.disconnect();
      }
    } catch {}
  }, 2500);

  return {
    success: true,
    deviceName: device.name || 'Thermal Printer',
    autoConnected: isAuto,
  };
}

/**
 * Clean & shorten feed names so they fit cleanly on 32-column thermal receipts
 * e.g. "Hybrid Napier (CO-4)" -> "CO-4 Napier"
 * "Commercial Dairy Compound Pellets" -> "Dairy Pellets"
 * "Wheat Straw (Bhoosa / Turi)" -> "Wheat Straw"
 * "Paddy Straw (Rice Straw)" -> "Paddy Straw"
 */
export function cleanReceiptFeedName(rawName) {
  if (!rawName) return 'Feed';
  let str = String(rawName).trim();
  if (/CO-?\s*4/i.test(str)) return 'CO-4 Napier';
  if (/cumbu\s*napier/i.test(str)) return 'Cumbu Napier';
  if (/napier/i.test(str)) return 'Napier Grass';
  if (/pellet/i.test(str)) return 'Dairy Pellets';
  if (/silage/i.test(str)) return 'Maize Silage';
  if (/paddy\s*straw/i.test(str)) return 'Paddy Straw';
  if (/wheat\s*straw/i.test(str)) return 'Wheat Straw';
  if (/wheat\s*bran/i.test(str)) return 'Wheat Bran';
  if (/cottonseed/i.test(str)) return 'Cottonseed Cake';
  if (/groundnut.*cake/i.test(str)) return 'Groundnut Cake';
  if (/groundnut.*haulm/i.test(str)) return 'Groundnut Haulm';
  if (/maize.*grain/i.test(str)) return 'Maize Grain';
  if (/brewer/i.test(str)) return 'Brewer Grain';
  if (/berseem/i.test(str)) return 'Berseem';
  if (/cowpea/i.test(str)) return 'Cowpea Fodder';
  if (/sorghum.*stover|kadbi/i.test(str)) return 'Sorghum Stover';
  if (/sorghum.*grain/i.test(str)) return 'Sorghum Grain';
  if (/rice.*bran|dorb/i.test(str)) return 'Rice Bran';
  if (/mustard.*cake/i.test(str)) return 'Mustard Cake';
  if (/soybean/i.test(str)) return 'Soybean Meal';
  if (/sugarcane.*tops/i.test(str)) return 'Sugarcane Tops';
  if (/sugarcane.*bagasse/i.test(str)) return 'Bagasse';
  if (/para\s*grass|rice\s*grass/i.test(str)) return 'Para Grass';

  // Strip parentheses: "Name (something / other)" -> "Name"
  str = str.replace(/\s*\([^)]*\)/g, '').trim();
  str = str.replace(/\s*\/.*$/, '').trim();

  if (str.length > 18) {
    str = str.slice(0, 18).trim();
  }
  return str || 'Feed';
}

/**
 * Proportionally allocates feeds within a category based on farmer's selectedFeeds or todayRecommendations
 */
function allocateFeedsForCategory(targetCategory, totalKg, selectedFeeds = [], recs = [], currentLang = 'ta') {
  if (!totalKg || totalKg <= 0) return [];

  const normCat = (targetCategory || '').toLowerCase();

  // Match feeds in selectedFeeds
  const matchedFeeds = (selectedFeeds || []).filter(f => {
    const c = (f.category || '').toLowerCase();
    const n = (f.name || '').toLowerCase();
    if (normCat === 'green') return c.includes('green') || n.includes('napier') || n.includes('silage') || n.includes('grass') || n.includes('berseem') || n.includes('fodder');
    if (normCat === 'dry') return c.includes('dry') || n.includes('straw') || n.includes('hay') || n.includes('stover') || n.includes('bagasse') || n.includes('haulm');
    if (normCat === 'concentrate') return c.includes('concentrate') || c.includes('unconventional') || n.includes('pellet') || n.includes('bran') || n.includes('cake') || n.includes('grain') || n.includes('meal');
    return false;
  });

  if (matchedFeeds.length > 0) {
    const totalSelectedKg = matchedFeeds.reduce((acc, f) => acc + (Number(f.quantityKg) > 0 ? Number(f.quantityKg) : 0), 0);
    return matchedFeeds.map(f => {
      const userQty = Number(f.quantityKg) || 0;
      const ratio = totalSelectedKg > 0 ? (userQty / totalSelectedKg) : (1 / matchedFeeds.length);
      const allocatedKg = Math.round(totalKg * ratio * 10) / 10;
      return {
        name: translateFeed(f.name, currentLang) || cleanReceiptFeedName(f.name),
        asciiName: cleanReceiptFeedName(f.name),
        rawName: f.name,
        category: targetCategory,
        quantityKg: allocatedKg
      };
    }).filter(f => f.quantityKg > 0);
  }

  // Fallback to todayRecommendations if available
  const matchedRecs = (recs || []).filter(r => {
    const c = (r.category || '').toLowerCase();
    const n = (r.name || '').toLowerCase();
    if (normCat === 'green') return c.includes('green');
    if (normCat === 'dry') return c.includes('dry');
    if (normCat === 'concentrate') return c.includes('concentrate') || c.includes('unconventional');
    return false;
  });

  if (matchedRecs.length > 0) {
    const sumRecKg = matchedRecs.reduce((acc, r) => acc + (Number(r.recommendedKg) || 1), 0) || 1;
    return matchedRecs.map(r => {
      const ratio = (Number(r.recommendedKg) || 1) / sumRecKg;
      const allocatedKg = Math.round(totalKg * ratio * 10) / 10;
      return {
        name: translateFeed(r.name, currentLang) || cleanReceiptFeedName(r.name),
        asciiName: cleanReceiptFeedName(r.name),
        rawName: r.name,
        category: targetCategory,
        quantityKg: allocatedKg
      };
    }).filter(f => f.quantityKg > 0);
  }

  // Default generic fallback
  const fallbackLabel = normCat === 'green' 
    ? (currentLang === 'ta' ? 'பசுந்தீவனம்' : currentLang === 'hi' ? 'हरा चारा' : 'Green Fodder')
    : normCat === 'dry' 
      ? (currentLang === 'ta' ? 'உலர் தீவனம்' : currentLang === 'hi' ? 'सूखा चारा' : 'Dry Fodder')
      : (currentLang === 'ta' ? 'அடர்தீவனம்' : currentLang === 'hi' ? 'दाना मिश्रण' : 'Concentrate');
  const asciiFallback = normCat === 'green' ? 'Green Fodder' : normCat === 'dry' ? 'Dry Fodder' : 'Concentrate';
  return [{
    name: fallbackLabel,
    asciiName: asciiFallback,
    rawName: asciiFallback,
    category: targetCategory,
    quantityKg: Math.round(totalKg * 10) / 10
  }];
}

/**
 * Resolves exact feed items for an animal:
 * Prioritizes calc.feedIngredients (the actual computed output data from backend optimizer).
 * Falls back to proportional allocation if not yet available.
 */
function resolveFeedItemsForAnimal(calc, greenKg, dryKg, concKg, selectedFeeds, todayRecs, currentLang) {
  if (calc && calc.feedIngredients && typeof calc.feedIngredients === 'object' && Object.keys(calc.feedIngredients).length > 0) {
    const items = [];
    for (const [fname, fqty] of Object.entries(calc.feedIngredients)) {
      const q = Math.round((Number(fqty) || 0) * 10) / 10;
      if (q > 0) {
        const lower = fname.toLowerCase();
        let cat = 'concentrate';
        if (lower.includes('green') || lower.includes('napier') || lower.includes('silage') || lower.includes('grass') || lower.includes('berseem') || lower.includes('fodder') || lower.includes('lucerne') || lower.includes('cowpea') || lower.includes('oats')) {
          cat = 'green';
        } else if (lower.includes('dry') || lower.includes('straw') || lower.includes('hay') || lower.includes('stover') || lower.includes('bagasse') || lower.includes('haulm') || lower.includes('kadbi')) {
          cat = 'dry';
        }
        items.push({
          name: translateFeed(fname, currentLang) || cleanReceiptFeedName(fname),
          asciiName: cleanReceiptFeedName(fname),
          rawName: fname,
          category: cat,
          quantityKg: q
        });
      }
    }
    if (items.length > 0) return items;
  }

  const greenItems = allocateFeedsForCategory('green', greenKg, selectedFeeds, todayRecs, currentLang);
  const dryItems = allocateFeedsForCategory('dry', dryKg, selectedFeeds, todayRecs, currentLang);
  const concItems = allocateFeedsForCategory('concentrate', concKg, selectedFeeds, todayRecs, currentLang);
  return [...greenItems, ...dryItems, ...concItems];
}

/**
 * Extracts and unifies all cattle with their exact today feeding requirements,
 * including individual feed names and allocated quantities in the chosen language.
 */
export function buildCattleFeedPlan({
  heifersData = [],
  firstTimeCattle = [],
  repeatCattle = [],
  lactatingData = [],
  dryCowsData = [],
  bullsData = [],
  calcResult = null,
  selectedBreed = null,
  selectedFeeds = [],
  currentLang = 'ta'
}) {
  const list = [];
  const todayRecs = calcResult?.practicalFeedingReport?.todayRecommendations || [];

  const catMilking = calcResult?.practicalFeedingReport?.perCategory?.milkingCow?.animals || [];
  const catPregnant = calcResult?.practicalFeedingReport?.perCategory?.pregnantCattle?.animals || [];
  const catHeifers = calcResult?.practicalFeedingReport?.perCategory?.growingHeifer?.animals || [];
  const catDry = calcResult?.practicalFeedingReport?.perCategory?.dryCow?.animals || [];
  const catBulls = calcResult?.practicalFeedingReport?.perCategory?.bull?.animals || [];

  // 1. HEIFERS
  heifersData.forEach((h, idx) => {
    const wt = Number(h.weight) || 300;
    const calc = catHeifers[idx];
    const greenKg = calc ? Number(calc.greenFodderKg) : Math.round(wt * 0.045 * 10) / 10;
    const dryKg = calc ? Number(calc.dryFodderKg) : Math.round(wt * 0.01 * 10) / 10;
    const concKg = calc ? Number(calc.concentrateKg) : Math.round(wt * 0.005 * 10) / 10;
    const minG = calc ? Number(calc.mineralMixtureG) : 50;
    const saltG = calc ? Number(calc.saltG) : 25;
    const waterL = calc ? Number(calc.waterLiters) : Math.round(wt * 0.12);

    const feedItems = resolveFeedItemsForAnimal(calc, greenKg, dryKg, concKg, selectedFeeds, todayRecs, currentLang);

    list.push({
      category: 'heifers',
      categoryLabel: currentLang === 'ta' ? 'கிடாரி (இளம் மாடு)' : currentLang === 'hi' ? 'बछिया (12+ माह)' : 'Growing Heifer',
      asciiCategory: currentLang === 'ta' ? 'KIDAARI' : currentLang === 'hi' ? 'BACCHIYA' : 'HEIFER',
      number: idx + 1,
      name: currentLang === 'ta' ? `கிடாரி #${idx + 1}` : currentLang === 'hi' ? `बछिया #${idx + 1}` : `Heifer #${idx + 1}`,
      asciiName: currentLang === 'ta' ? `KIDAARI #${idx + 1}` : currentLang === 'hi' ? `BACCHIYA #${idx + 1}` : `Heifer #${idx + 1}`,
      weightKg: wt,
      subtitle: h.ageMonths ? `${h.ageMonths} ${currentLang === 'ta' ? 'மாதங்கள்' : currentLang === 'hi' ? 'माह' : 'mo'}` : '12+ mo',
      greenFodderKg: greenKg,
      dryFodderKg: dryKg,
      concentrateKg: concKg,
      feedItems,
      mineralMixtureG: minG,
      saltG: saltG,
      waterLiters: waterL,
    });
  });

  // 2. PREGNANT CATTLE (1st time & repeat)
  const unifiedPregnant = [
    ...firstTimeCattle.map(c => ({ ...c, isRepeat: false })),
    ...repeatCattle.map(c => ({ ...c, isRepeat: true }))
  ];

  unifiedPregnant.forEach((p, idx) => {
    const wt = Number(p.weight) || 400;
    const calc = catPregnant[idx];
    const greenKg = calc ? Number(calc.greenFodderKg) : Math.round(wt * 0.05 * 10) / 10;
    const dryKg = calc ? Number(calc.dryFodderKg) : Math.round(wt * 0.012 * 10) / 10;
    const concKg = calc ? Number(calc.concentrateKg) : Math.round((wt * 0.008 + 1.0) * 10) / 10;
    const minG = calc ? Number(calc.mineralMixtureG) : 60;
    const saltG = calc ? Number(calc.saltG) : 35;
    const waterL = calc ? Number(calc.waterLiters) : Math.round(wt * 0.14);

    const typeStr = p.isRepeat
      ? (currentLang === 'ta' ? 'மறு சினை' : currentLang === 'hi' ? 'पुनः गर्भ' : 'Repeat Cow')
      : (currentLang === 'ta' ? '1-ம் சினை' : currentLang === 'hi' ? 'प्रथम गर्भ' : '1st Time');

    const feedItems = resolveFeedItemsForAnimal(calc, greenKg, dryKg, concKg, selectedFeeds, todayRecs, currentLang);

    list.push({
      category: 'pregnant',
      categoryLabel: currentLang === 'ta' ? `சினை மாடு (${typeStr})` : currentLang === 'hi' ? `गर्भवती पशु (${typeStr})` : `Pregnant (${typeStr})`,
      asciiCategory: currentLang === 'ta' ? 'CHINAKKAALNADAI' : currentLang === 'hi' ? 'GARBHAVATI PASHU' : 'PREGNANT',
      number: idx + 1,
      name: currentLang === 'ta' ? `சினை மாடு #${idx + 1}` : currentLang === 'hi' ? `गर्भवती गाय #${idx + 1}` : `Pregnant Cow #${idx + 1}`,
      asciiName: currentLang === 'ta' ? `CHINAI #${idx + 1}` : currentLang === 'hi' ? `GARBHAVATI #${idx + 1}` : `Pregnant Cow #${idx + 1}`,
      weightKg: wt,
      subtitle: p.pregDays ? `${p.pregDays} ${currentLang === 'ta' ? 'நாள் சினை' : currentLang === 'hi' ? 'दिन गर्भ' : 'days'}` : typeStr,
      greenFodderKg: greenKg,
      dryFodderKg: dryKg,
      concentrateKg: concKg,
      feedItems,
      mineralMixtureG: minG,
      saltG: saltG,
      waterLiters: waterL,
    });
  });

  // 3. LACTATING COWS
  lactatingData.forEach((l, idx) => {
    const wt = Number(l.weight) || 420;
    const milk = Number(l.milkYield) || 0;
    const calc = catMilking[idx];
    const greenKg = calc ? Number(calc.greenFodderKg) : Math.round((wt * 0.045 + milk * 0.4) * 10) / 10;
    const dryKg = calc ? Number(calc.dryFodderKg) : Math.round((wt * 0.01 + 1.0) * 10) / 10;
    const concKg = calc ? Number(calc.concentrateKg) : Math.round((1.5 + milk * 0.4) * 10) / 10;
    const minG = calc ? Number(calc.mineralMixtureG) : 80;
    const saltG = calc ? Number(calc.saltG) : 40;
    const waterL = calc ? Number(calc.waterLiters) : Math.round(wt * 0.12 + milk * 3.5);

    const feedItems = resolveFeedItemsForAnimal(calc, greenKg, dryKg, concKg, selectedFeeds, todayRecs, currentLang);

    list.push({
      category: 'lactating',
      categoryLabel: currentLang === 'ta' ? 'கறவை மாடு' : currentLang === 'hi' ? 'दुधारू गाय' : 'Milking Cow',
      asciiCategory: currentLang === 'ta' ? 'KARAVAI MAADU' : currentLang === 'hi' ? 'DUDHARU GAY' : 'MILKING COW',
      number: idx + 1,
      name: currentLang === 'ta' ? `கறவை மாடு #${idx + 1}` : currentLang === 'hi' ? `दुधारू गाय #${idx + 1}` : `Milking Cow #${idx + 1}`,
      asciiName: currentLang === 'ta' ? `KARAVAI MAADU #${idx + 1}` : currentLang === 'hi' ? `DUDHARU GAY #${idx + 1}` : `Milking Cow #${idx + 1}`,
      weightKg: wt,
      subtitle: `${milk} L/d • ${l.milkFat || 4.2}% ${currentLang === 'ta' ? 'கொழுப்பு' : currentLang === 'hi' ? 'फैट' : 'fat'}`,
      greenFodderKg: greenKg,
      dryFodderKg: dryKg,
      concentrateKg: concKg,
      feedItems,
      mineralMixtureG: minG,
      saltG: saltG,
      waterLiters: waterL,
      milkYield: milk,
    });
  });

  // 4. DRY COWS
  dryCowsData.forEach((d, idx) => {
    const wt = Number(d.weight) || 400;
    const calc = catDry[idx];
    const greenKg = calc ? Number(calc.greenFodderKg) : Math.round(wt * 0.04 * 10) / 10;
    const dryKg = calc ? Number(calc.dryFodderKg) : Math.round(wt * 0.012 * 10) / 10;
    const concKg = calc ? Number(calc.concentrateKg) : Math.round(wt * 0.004 * 10) / 10;
    const minG = calc ? Number(calc.mineralMixtureG) : 50;
    const saltG = calc ? Number(calc.saltG) : 30;
    const waterL = calc ? Number(calc.waterLiters) : Math.round(wt * 0.11);

    const feedItems = resolveFeedItemsForAnimal(calc, greenKg, dryKg, concKg, selectedFeeds, todayRecs, currentLang);

    list.push({
      category: 'dry',
      categoryLabel: currentLang === 'ta' ? 'வற்றிய மாடு' : currentLang === 'hi' ? 'सूखी गाय' : 'Dry Cow',
      asciiCategory: currentLang === 'ta' ? 'VATRIYA MAADU' : currentLang === 'hi' ? 'SOOKHI GAY' : 'DRY COW',
      number: idx + 1,
      name: currentLang === 'ta' ? `வற்றிய மாடு #${idx + 1}` : currentLang === 'hi' ? `सूखी गाय #${idx + 1}` : `Dry Cow #${idx + 1}`,
      asciiName: currentLang === 'ta' ? `VATRIYA MAADU #${idx + 1}` : currentLang === 'hi' ? `SOOKHI GAY #${idx + 1}` : `Dry Cow #${idx + 1}`,
      weightKg: wt,
      subtitle: d.dryDays ? `${d.dryDays} ${currentLang === 'ta' ? 'நாட்கள் வற்றியது' : currentLang === 'hi' ? 'दिन सूखी' : 'days dry'}` : (currentLang === 'ta' ? 'ஓய்வு' : currentLang === 'hi' ? 'विश्राम' : 'Resting'),
      greenFodderKg: greenKg,
      dryFodderKg: dryKg,
      concentrateKg: concKg,
      feedItems,
      mineralMixtureG: minG,
      saltG: saltG,
      waterLiters: waterL,
    });
  });

  // 5. BULLS
  bullsData.forEach((b, idx) => {
    const wt = Number(b.weight) || 550;
    const calc = catBulls[idx];
    const greenKg = calc ? Number(calc.greenFodderKg) : Math.round(wt * 0.045 * 10) / 10;
    const dryKg = calc ? Number(calc.dryFodderKg) : Math.round(wt * 0.012 * 10) / 10;
    const concKg = calc ? Number(calc.concentrateKg) : Math.round(wt * 0.006 * 10) / 10;
    const minG = calc ? Number(calc.mineralMixtureG) : 60;
    const saltG = calc ? Number(calc.saltG) : 35;
    const waterL = calc ? Number(calc.waterLiters) : Math.round(wt * 0.12);

    const purp = b.purpose === 'Breeding Bull'
      ? (currentLang === 'ta' ? 'இனப்பெருக்கம்' : currentLang === 'hi' ? 'प्रजनन' : 'Breeding')
      : (currentLang === 'ta' ? 'உழவு / வேலை' : currentLang === 'hi' ? 'कामकाजी' : 'Draft');

    const feedItems = resolveFeedItemsForAnimal(calc, greenKg, dryKg, concKg, selectedFeeds, todayRecs, currentLang);

    list.push({
      category: 'bulls',
      categoryLabel: currentLang === 'ta' ? `காளை (${purp})` : currentLang === 'hi' ? `सांड / बैल (${purp})` : `Bull (${purp})`,
      asciiCategory: currentLang === 'ta' ? 'VITHAI KAALAI' : currentLang === 'hi' ? 'PRAJANAN SAAND' : 'BULL',
      number: idx + 1,
      name: currentLang === 'ta' ? `காளை #${idx + 1}` : currentLang === 'hi' ? `सांड #${idx + 1}` : `Bull #${idx + 1}`,
      asciiName: currentLang === 'ta' ? `KAALAI #${idx + 1}` : currentLang === 'hi' ? `SAAND #${idx + 1}` : `Bull #${idx + 1}`,
      weightKg: wt,
      subtitle: purp,
      greenFodderKg: greenKg,
      dryFodderKg: dryKg,
      concentrateKg: concKg,
      feedItems,
      mineralMixtureG: minG,
      saltG: saltG,
      waterLiters: waterL,
    });
  });

  // Calculate herd grand totals
  const totals = list.reduce(
    (acc, item) => ({
      count: acc.count + 1,
      totalWeightKg: acc.totalWeightKg + item.weightKg,
      totalGreenKg: Math.round((acc.totalGreenKg + item.greenFodderKg) * 10) / 10,
      totalDryKg: Math.round((acc.totalDryKg + item.dryFodderKg) * 10) / 10,
      totalConcKg: Math.round((acc.totalConcKg + item.concentrateKg) * 10) / 10,
      totalMineralG: acc.totalMineralG + item.mineralMixtureG,
      totalSaltG: acc.totalSaltG + item.saltG,
      totalWaterL: acc.totalWaterL + item.waterLiters,
    }),
    {
      count: 0,
      totalWeightKg: 0,
      totalGreenKg: 0,
      totalDryKg: 0,
      totalConcKg: 0,
      totalMineralG: 0,
      totalSaltG: 0,
      totalWaterL: 0,
    }
  );

  // Herd-level aggregation of specific feed ingredients
  const feedMap = {};
  list.forEach(c => {
    (c.feedItems || []).forEach(f => {
      const key = f.rawName || f.fullName || f.name;
      if (!feedMap[key]) {
        feedMap[key] = {
          rawName: key,
          name: f.name,
          asciiName: f.asciiName || cleanReceiptFeedName(key),
          totalKg: 0
        };
      }
      feedMap[key].totalKg += f.quantityKg;
    });
  });

  totals.aggregatedFeedTotals = Object.values(feedMap).map(f => ({
    name: f.name,
    asciiName: f.asciiName,
    rawName: f.rawName,
    totalKg: Math.round(f.totalKg * 10) / 10
  }));

  return { cattleList: list, totals };
}

/**
 * Builds standard ASCII text receipt for 58mm / 80mm thermal printers
 * (Using clean English/Transliterated labels to ensure 100% compatibility with standard ESC/POS ROM fonts)
 */
export function buildThermalReceiptCommands({
  farmName = 'DAIRY FARM',
  location = '',
  breed = '',
  cattleList = [],
  totals = {},
  dateStr = '',
  currentLang = 'ta'
}) {
  const isTa = currentLang === 'ta';
  const isHi = currentLang === 'hi';

  const titleHeader = isTa ? 'MOOPOSHAQ THEEVANA VALIKATTI' : isHi ? 'MOOPOSHAQ PASHU POSHAN' : 'MOOPOSHAQ';
  const titleSub = isTa ? 'DHINASARI THEEVANA SEETTU' : isHi ? 'DAINIK AAHAR PARCHI' : 'CATTLE NUTRITION ADVISORY';
  const secTitle = isTa ? 'DHINASARI THEEVANA SEETTU (PER HEAD)' : isHi ? 'DAINIK AAHAR PARCHI (PER HEAD)' : 'DAILY FEED SLIP PER CATTLE';
  const herdTitle = isTa ? 'INDREYA MOTHATH THEEVANAM:' : isHi ? 'AAJ KA KUL CHARA:' : 'TODAY HERD TOTAL FEED:';
  const cattleLabel = isTa ? 'Mothak Kaalnadai' : isHi ? 'Kul Pashu' : 'Total Cattle';
  const minLabel = isTa ? 'Thaathukkal' : isHi ? 'Khanij Mishran' : 'Mineral Mix';
  const saltLabel = isTa ? 'Uppu' : isHi ? 'Namak' : 'Salt';
  const waterLabel = isTa ? 'Thooya Kudineer' : isHi ? 'Peene Ka Paani' : 'Clean Water';
  const footer1 = isTa ? '2-3 velaiyaka pirithu alikkavum' : isHi ? 'Din mein 2-3 bar vibhajit karein' : 'Feed fresh & provide ad-lib water';
  const footer2 = isTa ? 'Thooya kudineer tharalamaka valangavum' : isHi ? 'Paryapt swachh paani hamesha dein' : '*** Precision Ration Approved ***';

  const locInfo = resolveLocationDetails(location || farmName);
  const cleanFarmName = locInfo.farmName;
  const cleanLocationStr = locInfo.fullLocation;

  const lines = [
    { type: 'header', text: titleHeader },
    { type: 'sub', text: titleSub },
    { type: 'bold', text: cleanFarmName.toUpperCase() },
    { type: 'sub', text: cleanLocationStr.toUpperCase() },
    { type: 'sub', text: `DATE: ${dateStr || new Date().toLocaleDateString('en-GB')}` },
    { type: 'sub', text: `BREED: ${breed || 'Cattle / Buffalo'}` },
    { type: 'divider', char: '=' },
    { type: 'bold', text: secTitle },
    { type: 'divider', char: '-' },
  ];

  cattleList.forEach((c) => {
    const catName = c.asciiCategory || c.category.toUpperCase();
    lines.push({ type: 'bold', text: `[#${c.number}] ${catName} (${c.weightKg}kg)` });
    if (c.subtitle) {
      lines.push({ type: 'row', left: ' Status:', right: c.subtitle });
    }

    // Print specific feed items with feed name & allocated quantity
    if (c.feedItems && c.feedItems.length > 0) {
      c.feedItems.forEach(f => {
        if (f.quantityKg > 0) {
          const fn = f.asciiName || cleanReceiptFeedName(f.name);
          lines.push({ type: 'row', left: ` ${fn}:`, right: `${f.quantityKg.toFixed(1)} kg` });
        }
      });
    } else {
      if (c.greenFodderKg > 0) lines.push({ type: 'row', left: isTa ? ' Pasuntheevanam:' : isHi ? ' Hara Chara:' : ' Green Fodder:', right: `${c.greenFodderKg} kg` });
      if (c.dryFodderKg > 0) lines.push({ type: 'row', left: isTa ? ' Ular Theevanam:' : isHi ? ' Sookha Chara:' : ' Dry Fodder:', right: `${c.dryFodderKg} kg` });
      if (c.concentrateKg > 0) lines.push({ type: 'row', left: isTa ? ' Adartheevanam:' : isHi ? ' Dana Mishran:' : ' Concentrate:', right: `${c.concentrateKg} kg` });
    }

    if (c.mineralMixtureG > 0) lines.push({ type: 'row', left: ` ${minLabel}:`, right: `${c.mineralMixtureG} g` });
    if (c.saltG > 0) lines.push({ type: 'row', left: ` ${saltLabel}:`, right: `${c.saltG} g` });
    if (c.waterLiters > 0) lines.push({ type: 'row', left: ` ${waterLabel}:`, right: `${c.waterLiters} L` });
    lines.push({ type: 'divider', char: '-' });
  });

  lines.push({ type: 'divider', char: '=' });
  lines.push({ type: 'bold', text: herdTitle });
  lines.push({ type: 'row', left: ` ${cattleLabel}:`, right: `${totals.count} Head` });

  // Print herd totals broken down by individual feed ingredient
  if (totals.aggregatedFeedTotals && totals.aggregatedFeedTotals.length > 0) {
    totals.aggregatedFeedTotals.forEach(f => {
      const fn = f.asciiName || cleanReceiptFeedName(f.name);
      lines.push({ type: 'row', left: ` Total ${fn}:`, right: `${f.totalKg.toFixed(1)} kg` });
    });
  } else {
    lines.push({ type: 'row', left: isTa ? ' Mothap Pasuntheevanam:' : isHi ? ' Kul Hara Chara:' : ' Total Green Fodder:', right: `${totals.totalGreenKg} kg` });
    lines.push({ type: 'row', left: isTa ? ' Motha Ular Theevanam:' : isHi ? ' Kul Sookha Chara:' : ' Total Dry Fodder:', right: `${totals.totalDryKg} kg` });
    lines.push({ type: 'row', left: isTa ? ' Motha Adartheevanam:' : isHi ? ' Kul Dana Mishran:' : ' Total Concentrate:', right: `${totals.totalConcKg} kg` });
  }

  lines.push({ type: 'row', left: ` Total ${minLabel}:`, right: `${totals.totalMineralG} g` });
  lines.push({ type: 'row', left: ` Total ${saltLabel}:`, right: `${totals.totalSaltG} g` });
  lines.push({ type: 'row', left: ` Total ${waterLabel}:`, right: `${totals.totalWaterL} L` });
  lines.push({ type: 'divider', char: '=' });
  lines.push({ type: 'sub', text: footer1 });
  lines.push({ type: 'sub', text: footer2 });
  lines.push({ type: 'divider', char: '-' });

  // IN LAST: Render high-contrast ESC/POS raster bitmap logo for Chimertech & iHerd
  try {
    const logoBytes = getEscPosPartnerLogosBytes();
    if (logoBytes && logoBytes.length > 0) {
      lines.push({ type: 'bitmap', data: logoBytes });
    }
  } catch (e) {
    console.warn('Could not attach thermal logo bitmap', e);
  }

  lines.push({ type: 'sub', text: 'Powered by Chimertech & iHerd' });

  return createEscPosBuffer(lines);
}
