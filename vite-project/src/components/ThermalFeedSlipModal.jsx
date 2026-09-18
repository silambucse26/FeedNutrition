import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Printer, Bluetooth, Download, X, CheckCircle2, AlertCircle, 
  Loader2, Smartphone, FileText, Info, ArrowRight, RefreshCw 
} from 'lucide-react';
import { 
  isBluetoothSupported, 
  buildCattleFeedPlan, 
  buildThermalReceiptCommands, 
  printViaBluetooth,
  getSavedPrinterInfo,
  forgetSavedPrinter,
  getRememberedBluetoothDevice
} from '../utils/bluetoothPrinterService';
import { downloadDailyFeedSlipPDF } from '../utils/dailySlipPdf';
import { CHIMERTECH_LOGO, IHERD_LOGO, PARTNER_LOGOS_MONO_PNG } from '../utils/brandLogos.js';
import { resolveLocationDetails } from '../utils/locationHelper';

export default function ThermalFeedSlipModal({
  isOpen,
  onClose,
  heifersData = [],
  firstTimeCattle = [],
  repeatCattle = [],
  lactatingData = [],
  dryCowsData = [],
  bullsData = [],
  calcResult = null,
  selectedBreed = null,
  weather = null,
  selectedFeeds = [],
  currentLang = 'ta'
}) {
  const [slipLang, setSlipLang] = useState(currentLang || 'ta');
  const [btStatus, setBtStatus] = useState('');
  const [btLoading, setBtLoading] = useState(false);
  const [btError, setBtError] = useState(null);
  const [btSuccess, setBtSuccess] = useState(false);
  const [savedPrinter, setSavedPrinter] = useState(() => getSavedPrinterInfo());

  // Synchronize language when currentLang prop changes
  useEffect(() => {
    if (currentLang) setSlipLang(currentLang);
  }, [currentLang, isOpen]);

  // Detect remembered printer on modal open
  useEffect(() => {
    if (isOpen) {
      const info = getSavedPrinterInfo();
      setSavedPrinter(info);
      if (typeof navigator !== 'undefined' && navigator.bluetooth?.getDevices) {
        getRememberedBluetoothDevice()
          .then(dev => {
            if (dev && dev.name) {
              setSavedPrinter({ id: dev.id, name: dev.name, hasSaved: true });
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const locInfo = resolveLocationDetails(weather?.city);
  const farmCity = locInfo.city;
  const fullLocation = locInfo.fullLocation;
  const displayFarmName = slipLang === 'ta' ? locInfo.farmNameTa : slipLang === 'hi' ? locInfo.farmNameHi : locInfo.farmName;
  const farmName = displayFarmName;
  const breedName = selectedBreed?.name || 'Dairy Cattle';
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Extract cattle feed breakdown with individual feed ingredient allocations in selected language
  const { cattleList, totals } = buildCattleFeedPlan({
    heifersData,
    firstTimeCattle,
    repeatCattle,
    lactatingData,
    dryCowsData,
    bullsData,
    calcResult,
    selectedBreed,
    selectedFeeds,
    currentLang: slipLang
  });

  const hasBluetooth = isBluetoothSupported();

  // Bluetooth Print Handler (Supports auto-connect or force new device picker)
  const handleBluetoothPrint = async (forceNew = false) => {
    setBtError(null);
    setBtSuccess(false);
    setBtLoading(true);

    try {
      const escPosData = buildThermalReceiptCommands({
        farmName,
        location: farmCity,
        breed: breedName,
        cattleList,
        totals,
        dateStr: `${dateStr} ${timeStr}`,
        currentLang: slipLang
      });

      const res = await printViaBluetooth(escPosData, (msg) => {
        setBtStatus(msg);
      }, { forceNewDevice: forceNew });

      setBtSuccess(true);
      const updatedInfo = getSavedPrinterInfo();
      setSavedPrinter(updatedInfo);

      const deviceLabel = res.deviceName || updatedInfo.name || 'Thermal Printer';
      setBtStatus(
        slipLang === 'ta'
          ? `${deviceLabel} மூலம் வெற்றிகரமாக அச்சிடப்பட்டது! (Auto-connected)`
          : slipLang === 'hi'
            ? `${deviceLabel} पर सफलतापूर्वक प्रिंट हो गया!`
            : `Successfully printed to ${deviceLabel}!`
      );
    } catch (err) {
      console.error('Bluetooth Print Error:', err);
      setBtError(err.message || 'Bluetooth connection failed.');
    } finally {
      setBtLoading(false);
    }
  };

  const handleForgetPrinter = () => {
    forgetSavedPrinter();
    setSavedPrinter({ id: null, name: null, hasSaved: false });
    setBtStatus('');
    setBtError(null);
  };

  // Browser / System Thermal Print Handler
  const handleSystemPrint = () => {
    document.body.classList.add('thermal-slip-printing');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('thermal-slip-printing');
    }, 1000);
  };

  // PDF Download Handler
  const handleDownloadPDF = () => {
    downloadDailyFeedSlipPDF({
      farmName,
      location: farmCity,
      breedName,
      cattleList,
      totals,
      currentLang: slipLang,
    });
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      className="thermal-modal-backdrop"
    >
      <div 
        className="thermal-modal-card animate-fade-in"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
          border: '1.5px solid #cbd5e1',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div className="no-print" style={{
          padding: '16px 20px',
          borderBottom: '1.5px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Printer size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                {slipLang === 'ta' 
                  ? 'தினசரி மாடுகளுக்கான தீவன சீட்டு' 
                  : slipLang === 'hi' 
                    ? 'दैनिक पशु आहार पर्ची (थर्मल प्रिंट)' 
                    : 'Daily Cattle Feeding Slip'}
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 0' }}>
                {slipLang === 'ta' 
                  ? 'புளூடூத் தெர்மல் பிரிண்டர் (58mm / 80mm) & PDF' 
                  : slipLang === 'hi' 
                    ? 'ब्लूटूथ पोर्टेबल प्रिंटर एवं PDF रसीद' 
                    : 'Portable Bluetooth Printer & PDF Slip'}
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Language Selection Tabs for Thermal Receipt & PDF */}
        <div className="no-print" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 18px',
          background: '#f8fafc',
          borderBottom: '1.5px solid #e2e8f0',
          flexShrink: 0,
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155' }}>
              {slipLang === 'ta' ? 'அச்சு மொழி (Print Language):' : slipLang === 'hi' ? 'प्रिंट भाषा (Print Language):' : 'Print Language:'}
            </span>
          </div>
          <div style={{ display: 'inline-flex', background: '#e2e8f0', padding: '3px', borderRadius: '10px', gap: '3px' }}>
            <button
              type="button"
              onClick={() => setSlipLang('ta')}
              style={{
                background: slipLang === 'ta' ? '#0284c7' : 'transparent',
                color: slipLang === 'ta' ? '#ffffff' : '#334155',
                border: 'none',
                borderRadius: '7px',
                padding: '4px 12px',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              🇮🇳 தமிழ்
            </button>
            <button
              type="button"
              onClick={() => setSlipLang('en')}
              style={{
                background: slipLang === 'en' ? '#0284c7' : 'transparent',
                color: slipLang === 'en' ? '#ffffff' : '#334155',
                border: 'none',
                borderRadius: '7px',
                padding: '4px 12px',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              🇬🇧 English
            </button>
            <button
              type="button"
              onClick={() => setSlipLang('hi')}
              style={{
                background: slipLang === 'hi' ? '#0284c7' : 'transparent',
                color: slipLang === 'hi' ? '#ffffff' : '#334155',
                border: 'none',
                borderRadius: '7px',
                padding: '4px 12px',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              🇮🇳 हिन्दी
            </button>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="no-print" style={{
          padding: '12px 18px',
          background: '#ffffff',
          borderBottom: '1px solid #f1f5f9',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
          flexShrink: 0
        }}>
          {/* Bluetooth Print Button (1-Click Auto-Connect if saved) */}
          <button
            type="button"
            onClick={() => handleBluetoothPrint(false)}
            disabled={btLoading}
            style={{
              background: btLoading ? '#94a3b8' : 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '9px 12px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: btLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 3px 8px rgba(2, 132, 199, 0.25)',
              transition: 'all 0.15s ease'
            }}
            title={hasBluetooth ? (savedPrinter.hasSaved ? `Auto-Connect & Print via ${savedPrinter.name}` : 'Connect and Print via Bluetooth') : 'Web Bluetooth requires Chrome / Edge on Android or PC'}
          >
            {btLoading ? <Loader2 size={15} className="spin-anim" /> : <Bluetooth size={16} />}
            <span>
              {btLoading 
                ? (slipLang === 'ta' ? 'இணைகிறது...' : slipLang === 'hi' ? 'कनेक्ट हो रहा है...' : 'Printing...') 
                : savedPrinter.name 
                  ? (slipLang === 'ta' ? `தானாக பிரிண்ட் (${savedPrinter.name})` : slipLang === 'hi' ? `ऑटो प्रिंट (${savedPrinter.name})` : `Auto Print (${savedPrinter.name})`)
                  : (slipLang === 'ta' ? 'புளூடூத் பிரிண்ட்' : slipLang === 'hi' ? 'ब्लूटूथ प्रिंट' : 'Bluetooth Print')}
            </span>
          </button>

          {/* Thermal / Browser Print */}
          <button
            type="button"
            onClick={handleSystemPrint}
            style={{
              background: '#f0fdf4',
              color: '#15803d',
              border: '1.5px solid #86efac',
              padding: '9px 12px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <Printer size={15} />
            <span>
              {slipLang === 'ta' ? 'தெர்மல் சீட்டு பிரிண்ட்' : slipLang === 'hi' ? 'पर्ची प्रिंट' : 'Thermal Print'}
            </span>
          </button>

          {/* Download PDF Slip */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            style={{
              background: '#fffbeb',
              color: '#b45309',
              border: '1.5px solid #fde68a',
              padding: '9px 12px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <Download size={15} />
            <span>
              {slipLang === 'ta' ? 'PDF பதிவிறக்கு' : slipLang === 'hi' ? 'PDF डाउनलोड' : 'PDF Slip'}
            </span>
          </button>
        </div>

        {/* Auto-Connect Status Banner */}
        {savedPrinter.hasSaved && hasBluetooth && (
          <div style={{
            padding: '8px 16px',
            background: '#f0fdf4',
            borderBottom: '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.76rem',
            color: '#166534',
            flexShrink: 0,
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 0 2px #bbf7d0',
              }} />
              <span style={{ fontWeight: 800 }}>
                {slipLang === 'ta' ? 'தானியங்கி இணைப்பு (Auto-Connect):' : slipLang === 'hi' ? 'स्वतः कनेक्ट (Auto-Connect):' : 'Auto-Connect:'}
              </span>
              <span style={{ fontWeight: 800, color: '#0f172a' }}>
                {savedPrinter.name || 'Thermal Printer'}
              </span>
              <span style={{
                fontSize: '0.66rem',
                background: '#dcfce7',
                color: '#15803d',
                padding: '2px 7px',
                borderRadius: '10px',
                fontWeight: 800,
                border: '1px solid #86efac',
              }}>
                {slipLang === 'ta' ? 'நினைவில் உள்ளது' : slipLang === 'hi' ? 'सहेजा गया' : 'Paired'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleBluetoothPrint(true)}
                disabled={btLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  fontWeight: 800,
                  cursor: btLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.74rem',
                  textDecoration: 'underline',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
                title={slipLang === 'ta' ? 'வேறு பிரிண்டரைத் தேர்ந்தெடுக்க' : 'Choose another Bluetooth printer'}
              >
                <RefreshCw size={12} />
                <span>{slipLang === 'ta' ? 'பிரிண்டரை மாற்று' : slipLang === 'hi' ? 'प्रिंटर बदलें' : 'Change'}</span>
              </button>

              <button
                type="button"
                onClick={handleForgetPrinter}
                disabled={btLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontWeight: 700,
                  cursor: btLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.74rem',
                }}
                title={slipLang === 'ta' ? 'இந்த பிரிண்டரை நீக்கு' : 'Forget this printer'}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* First time pairing hint */}
        {!savedPrinter.hasSaved && hasBluetooth && (
          <div style={{
            padding: '7px 16px',
            background: '#f0fdf4',
            borderBottom: '1px solid #bbf7d0',
            fontSize: '0.72rem',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
          }}>
            <Info size={13} color="#16a34a" />
            <span>
              {slipLang === 'ta'
                ? 'ஒருமுறை உங்கள் தெர்மல் பிரிண்டரை இணைத்தால் போதும், அடுத்தமுறை பிரிண்டர் தானாகவே (Auto-Connect) இணையும்!'
                : slipLang === 'hi'
                  ? 'एक बार थर्मल प्रिंटर कनेक्ट करने पर, अगली बार यह स्वतः (Auto-Connect) कनेक्ट हो जाएगा!'
                  : 'Connect your thermal printer once, and future prints will auto-connect automatically!'}
            </span>
          </div>
        )}

        {/* Status / Notice alerts */}
        {btStatus && (
          <div style={{
            padding: '8px 16px',
            background: btSuccess ? '#f0fdf4' : '#f0f9ff',
            borderBottom: `1px solid ${btSuccess ? '#86efac' : '#bae6fd'}`,
            color: btSuccess ? '#15803d' : '#0369a1',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}>
            {btSuccess ? <CheckCircle2 size={15} color="#16a34a" /> : <Loader2 size={15} className="spin-anim" />}
            <span>{btStatus}</span>
          </div>
        )}

        {btError && (
          <div style={{
            padding: '8px 16px',
            background: '#fef2f2',
            borderBottom: '1px solid #fca5a5',
            color: '#b91c1c',
            fontSize: '0.76rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}>
            <AlertCircle size={15} color="#dc2626" />
            <span>{btError}</span>
          </div>
        )}

        {!hasBluetooth && (
          <div className="no-print" style={{
            padding: '8px 16px',
            background: '#fffbeb',
            borderBottom: '1px solid #fed7aa',
            color: '#9a3412',
            fontSize: '0.74rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}>
            <Info size={14} color="#ea580c" />
            <span>
              {slipLang === 'ta'
                ? 'குறிப்பு: புளூடூத் நேரடி அச்சிடலுக்கு Chrome / Edge பிரவுசரைப் பயன்படுத்தவும். அல்லது "தெர்மல் சீட்டு பிரிண்ட்" அல்லது "PDF" பயன்படுத்தலாம்.'
                : slipLang === 'hi'
                  ? 'नोट: सीधे ब्लूटूथ प्रिंट हेतु Chrome/Edge का उपयोग करें, अथवा "पर्ची प्रिंट" या "PDF" बटन दबाएं।'
                  : 'Note: Web Bluetooth is supported on Chrome & Edge. You can also use the Thermal Print or PDF option.'}
            </span>
          </div>
        )}

        {/* Scrollable Receipt Body */}
        <div 
          className="thermal-modal-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 16px',
            background: '#f1f5f9',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          {/* Thermal Receipt Paper UI (Stylized 58mm / 80mm slip) */}
          <div 
            id="printable-thermal-receipt"
            className="thermal-receipt-paper"
            style={{
              width: '100%',
              maxWidth: '380px',
              background: '#ffffff',
              padding: '20px 16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              borderTop: '3px dashed #cbd5e1',
              borderBottom: '3px dashed #cbd5e1',
              fontFamily: '"Courier New", Courier, monospace',
              color: '#0f172a',
              fontSize: '0.82rem',
              lineHeight: 1.45,
            }}
          >
            {/* Slip Header */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              {/* MooPoshaq Brand Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                marginBottom: '2px'
              }}>
                <img 
                  src="/mooposhaqlogo.png" 
                  alt="MooPoshaq" 
                  style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px' }} 
                />
                <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '1px', color: '#0f172a' }}>
                  MOOPOSHAQ
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0284c7' }}>
                {slipLang === 'ta' 
                  ? 'கால்நடை ஊட்டச்சத்து & தீவன ஆலோசனை' 
                  : slipLang === 'hi' 
                    ? 'पशु पोषण एवं संतुलित आहार परामर्श' 
                    : 'CATTLE NUTRITION ADVISORY'}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, marginTop: '2px', color: '#0f172a' }}>
                {farmName.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
                {fullLocation}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {dateStr} • {timeStr}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
                {slipLang === 'ta' ? 'இனம்:' : slipLang === 'hi' ? 'नस्ल:' : 'Breed:'} {breedName}
              </div>
            </div>

            <div style={{ borderBottom: '1px dashed #0f172a', margin: '8px 0' }} />

            <div style={{ textAlign: 'center', fontWeight: 900, fontSize: '0.88rem', marginBottom: '6px', color: '#0f172a' }}>
              {slipLang === 'ta' 
                ? 'தினசரி மாடுகளுக்கான தீவன அளவு' 
                : slipLang === 'hi' 
                  ? 'प्रत्येक पशु का दैनिक आहार पर्ची' 
                  : 'DAILY FEED SLIP PER CATTLE'}
            </div>

            <div style={{ borderBottom: '1px dashed #0f172a', margin: '6px 0 10px' }} />

            {/* Individual Cattle Feeding List */}
            {cattleList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#64748b' }}>
                {slipLang === 'ta' ? 'பண்ணையில் மாடுகள் பதிவு செய்யப்படவில்லை.' : slipLang === 'hi' ? 'झुंड में कोई पशु पंजीकृत नहीं है।' : 'No cattle registered in herd.'}
              </div>
            ) : (
              cattleList.map((c, idx) => (
                <div key={idx} style={{ marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px dotted #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 900, fontSize: '0.86rem' }}>
                    <span>
                      [#{c.number}] {c.name.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#0369a1' }}>
                      {c.weightKg} {slipLang === 'ta' ? 'கிலோ' : slipLang === 'hi' ? 'किग्रा' : 'kg'}
                    </span>
                  </div>

                  {c.subtitle && (
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginBottom: '4px' }}>
                      {slipLang === 'ta' ? 'நிலை:' : slipLang === 'hi' ? 'स्थिति:' : 'Status:'} {c.subtitle}
                    </div>
                  )}

                  {/* Feed Breakdown Table Rows - Shows Specific Feed Ingredient Names & Quantities */}
                  <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                    {c.feedItems && c.feedItems.length > 0 ? (
                      c.feedItems.map((f, fIdx) => (
                        <div key={fIdx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
                          <span>• {f.name}:</span>
                          <strong style={{ color: f.category === 'concentrate' ? '#0284c7' : '#0f172a' }}>
                            {f.quantityKg} {slipLang === 'ta' ? 'கிலோ' : slipLang === 'hi' ? 'किग्रा' : 'kg'}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>• {slipLang === 'ta' ? 'பசுந்தீவனம்:' : slipLang === 'hi' ? 'हरा चारा:' : 'Green Fodder:'}</span>
                          <strong>{c.greenFodderKg} {slipLang === 'ta' ? 'கிலோ' : slipLang === 'hi' ? 'किग्रा' : 'kg'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>• {slipLang === 'ta' ? 'உலர் தீவனம்:' : slipLang === 'hi' ? 'சூखा चारा:' : 'Dry Fodder:'}</span>
                          <strong>{c.dryFodderKg} {slipLang === 'ta' ? 'கிலோ' : slipLang === 'hi' ? 'किग्रा' : 'kg'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>• {slipLang === 'ta' ? 'அடர்தீவனம்:' : slipLang === 'hi' ? 'दाणा / दाना:' : 'Concentrate:'}</span>
                          <strong style={{ color: '#0284c7' }}>{c.concentrateKg} {slipLang === 'ta' ? 'கிலோ' : slipLang === 'hi' ? 'किग्रा' : 'kg'}</strong>
                        </div>
                      </>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
                      <span>• {slipLang === 'ta' ? 'தாது உப்புக் கலவை:' : slipLang === 'hi' ? 'खनिज मिश्रण:' : 'Mineral Mix:'}</span>
                      <strong>{c.mineralMixtureG} {slipLang === 'ta' ? 'கிராம்' : slipLang === 'hi' ? 'ग्राम' : 'g'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
                      <span>• {slipLang === 'ta' ? 'உப்பு:' : slipLang === 'hi' ? 'नमक:' : 'Common Salt:'}</span>
                      <strong>{c.saltG} {slipLang === 'ta' ? 'கிராம்' : slipLang === 'hi' ? 'ग्राम' : 'g'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
                      <span>• {slipLang === 'ta' ? 'குடிநீர்:' : slipLang === 'hi' ? 'पीने का पानी:' : 'Clean Water:'}</span>
                      <strong>{c.waterLiters} {slipLang === 'ta' ? 'லிட்டர்' : slipLang === 'hi' ? 'लीटर' : 'L'}</strong>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Total Herd Summary - Broken down by individual feed ingredient */}
            <div style={{ borderTop: '1.5px solid #0f172a', borderBottom: '1.5px solid #0f172a', padding: '8px 0', margin: '10px 0' }}>
              <div style={{ fontWeight: 900, fontSize: '0.84rem', marginBottom: '4px' }}>
                {slipLang === 'ta' ? 'இன்றைய மொத்த பண்ணை தேவை:' : slipLang === 'hi' ? 'आज का कुल फार्म आहार:' : 'TODAY TOTAL HERD FEED:'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span>{slipLang === 'ta' ? 'மொத்த மாடுகள்:' : slipLang === 'hi' ? 'कुल पशु:' : 'Total Cattle:'}</span>
                <strong>{totals.count} {slipLang === 'ta' ? 'எண்ணிக்கை' : slipLang === 'hi' ? 'पशु' : 'Head'}</strong>
              </div>

              {totals.aggregatedFeedTotals && totals.aggregatedFeedTotals.length > 0 ? (
                totals.aggregatedFeedTotals.map((f, fIdx) => (
                  <div key={fIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '1px 0' }}>
                    <span>{slipLang === 'ta' ? `மொத்த ${f.name}:` : slipLang === 'hi' ? `कुल ${f.name}:` : `Total ${f.name}:`}</span>
                    <strong style={{ color: '#0284c7' }}>
                      {f.totalKg} {slipLang === 'ta' ? 'கிலோ' : slipLang === 'hi' ? 'किग्रा' : 'kg'}
                    </strong>
                  </div>
                ))
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span>{slipLang === 'ta' ? 'மொத்த பசுந்தீவனம்:' : slipLang === 'hi' ? 'कुल हरा चारा:' : 'Total Green Fodder:'}</span>
                    <strong>{totals.totalGreenKg} {slipLang === 'ta' ? 'கிலோ' : slipLang === 'hi' ? 'किग्रा' : 'kg'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span>{slipLang === 'ta' ? 'மொத்த உலர் தீவனம்:' : slipLang === 'hi' ? 'कुल सूखा चारा:' : 'Total Dry Fodder:'}</span>
                    <strong>{totals.totalDryKg} {slipLang === 'ta' ? 'கிலோ' : slipLang === 'hi' ? 'किग्रा' : 'kg'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span>{slipLang === 'ta' ? 'மொத்த அடர்தீவனம்:' : slipLang === 'hi' ? 'कुल दाना:' : 'Total Concentrate:'}</span>
                    <strong style={{ color: '#0284c7' }}>{totals.totalConcKg} {slipLang === 'ta' ? 'கிலோ' : slipLang === 'hi' ? 'किग्रा' : 'kg'}</strong>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '1px 0' }}>
                <span>{slipLang === 'ta' ? 'மொத்த தாது உப்பு:' : slipLang === 'hi' ? 'कुल खनिज मिश्रण:' : 'Total Minerals:'}</span>
                <strong>{totals.totalMineralG} {slipLang === 'ta' ? 'கிராம்' : slipLang === 'hi' ? 'ग्राम' : 'g'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '1px 0' }}>
                <span>{slipLang === 'ta' ? 'மொத்த குடிநீர்:' : slipLang === 'hi' ? 'कुल पीने का पानी:' : 'Total Water:'}</span>
                <strong>{totals.totalWaterL} {slipLang === 'ta' ? 'லிட்டர்' : slipLang === 'hi' ? 'लीटर' : 'L'}</strong>
              </div>
            </div>

            {/* Slip Footer Notes */}
            <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#64748b', marginTop: '10px' }}>
              <div>{slipLang === 'ta' ? '2-3 வேளைகளாகப் பிரித்து தீவனம் வழங்கவும்' : slipLang === 'hi' ? 'दिन में 2-3 बार विभाजित करके खिलाएं' : 'Divide into 2-3 split feedings daily'}</div>
              <div>{slipLang === 'ta' ? 'சுத்தமான குடிநீர் தாராளமாக வழங்கவும்' : slipLang === 'hi' ? 'पर्याप्त स्वच्छ पेयजल हमेशा उपलब्ध रखें' : 'Provide fresh, ad-lib clean water always'}</div>
              <div style={{ marginTop: '6px', fontWeight: 800 }}>
                {slipLang === 'ta' ? '*** மூபோஷாக் தீவன ஆலோசனை ***' : slipLang === 'hi' ? '*** मूपोषक आहार सलाह ***' : '*** MOOPOSHAQ RATION ADVISORY ***'}
              </div>
              {/* Slip Footer (IN LAST): Partner Logos */}
              <div style={{
                marginTop: '12px',
                paddingTop: '10px',
                borderTop: '1.5px dashed #0f172a',
                textAlign: 'center'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '6px'
                }}>
                  <img 
                    src={PARTNER_LOGOS_MONO_PNG} 
                    alt="Chimertech & iHerd" 
                    className="thermal-slip-partner-logo"
                    style={{ height: '36px', maxWidth: '260px', objectFit: 'contain', display: 'inline-block' }} 
                  />
                </div>
                <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 800 }}>
                  Powered by <strong>Chimertech</strong> &amp; <strong>iHerd</strong>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer Bottom Controls */}
        <div className="no-print" style={{
          padding: '12px 18px',
          borderTop: '1.5px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
            {totals.count} {currentLang === 'ta' ? 'மாடுகள் சேர்க்கப்பட்டன' : currentLang === 'hi' ? 'पशु शामिल' : 'cattle in slip'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            {currentLang === 'ta' ? 'மூடுக' : currentLang === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>

      </div>

      {/* Embedded CSS for Thermal Printer Page Media */}
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          body.thermal-slip-printing #root {
            display: none !important;
          }
          body.thermal-slip-printing .thermal-modal-backdrop {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          body.thermal-slip-printing .thermal-modal-card {
            border: none !important;
            box-shadow: none !important;
            max-width: 100% !important;
            width: 100% !important;
            overflow: visible !important;
            background: transparent !important;
          }
          body.thermal-slip-printing .thermal-modal-scroll {
            overflow: visible !important;
            padding: 0 !important;
            background: transparent !important;
            display: block !important;
          }
          body.thermal-slip-printing #printable-thermal-receipt {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 80mm !important;
            padding: 4mm !important;
            border: 1px dashed #000000 !important;
            box-shadow: none !important;
            font-size: 8.5pt !important;
            line-height: 1.35 !important;
            color: #000000 !important;
            background: #ffffff !important;
          }
          body.thermal-slip-printing #printable-thermal-receipt * {
            visibility: visible !important;
          }
          body.thermal-slip-printing #printable-thermal-receipt img {
            visibility: visible !important;
            display: inline-block !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            filter: grayscale(100%) contrast(300%) !important;
            image-rendering: -webkit-optimize-contrast !important;
            image-rendering: pixelated !important;
          }
          @page {
            size: auto;
            margin: 4mm;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
