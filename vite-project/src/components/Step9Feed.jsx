import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Check, Plus, Trash2, X, Sparkles, Edit3, Search, Wheat } from 'lucide-react';
import { translateFeed, translateCategory, translateTerm } from '../utils/tamilTranslations';

// Recommended quick quantity chips by category
const QUICK_QTY_MAP = {
  'Green Fodder': [10, 15, 20, 25, 30, 40, 50],
  'Dry Fodder': [3, 5, 8, 10, 15, 20],
  'Concentrates': [1, 2, 3, 4, 5, 8, 10],
  'Unconventional': [2, 5, 8, 10, 15],
};

export default function Step9Feed({
  selectedFeeds = [],
  setSelectedFeeds,
  acknowledgeStep,
  onNext,
  onPrev,
  currentLang = 'ta',
  t,
}) {
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (cards default) | 'list'
  const [editingFeed, setEditingFeed] = useState(null);
  const [modalQty, setModalQty] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Green Fodder');
  const [customDm, setCustomDm] = useState(25);

  // Lock background scroll while modal is open and ensure clean viewport positioning
  useEffect(() => {
    if (editingFeed || showCustomModal) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [editingFeed, showCustomModal]);


  const defaultFeedCatalog = [
    // ─── 1. GREEN FODDER ───────────────────────────────────────────
    { id: 'maize_fodder',        name: 'Maize Fodder',                category: 'Green Fodder',   dmPct: 22,   cpPct: 8.5,  defQty: 25 },
    { id: 'napier_grass',        name: 'Napier Grass / CO-4',          category: 'Green Fodder',   dmPct: 20,   cpPct: 9.0,  defQty: 25 },
    { id: 'sorghum_fodder',      name: 'Sorghum Fodder (Jowar)',       category: 'Green Fodder',   dmPct: 25,   cpPct: 7.5,  defQty: 20 },
    { id: 'lucerne',             name: 'Lucerne (Alfalfa)',            category: 'Green Fodder',   dmPct: 20,   cpPct: 19.5, defQty: 15 },
    { id: 'berseem',             name: 'Berseem (Egyptian Clover)',    category: 'Green Fodder',   dmPct: 15,   cpPct: 18.5, defQty: 18 },
    { id: 'cowpea_fodder',       name: 'Cowpea Fodder (Lobia)',        category: 'Green Fodder',   dmPct: 18,   cpPct: 19.0, defQty: 15 },
    { id: 'rice_grass',          name: 'Rice Grass / Para Grass',      category: 'Green Fodder',   dmPct: 22,   cpPct: 7.0,  defQty: 20 },
    { id: 'green_pasture_grass', name: 'Green Pasture Grass',          category: 'Green Fodder',   dmPct: 22,   cpPct: 8.0,  defQty: 20 },
    { id: 'oats_fodder',         name: 'Oats Fodder',                  category: 'Green Fodder',   dmPct: 20,   cpPct: 10.5, defQty: 20 },
    { id: 'silage',              name: 'Maize / Corn Silage',          category: 'Green Fodder',   dmPct: 32,   cpPct: 8.5,  defQty: 18 },
    { id: 'sugarcane_tops',      name: 'Sugarcane Tops (Green)',       category: 'Green Fodder',   dmPct: 26,   cpPct: 5.5,  defQty: 15 },

    // ─── 2. DRY FODDER ─────────────────────────────────────────────
    { id: 'wheat_straw',         name: 'Wheat Straw (Bhoosa / Turi)', category: 'Dry Fodder',     dmPct: 90,   cpPct: 3.5,  defQty: 5 },
    { id: 'paddy_straw',         name: 'Paddy Straw (Rice Straw)',    category: 'Dry Fodder',     dmPct: 88,   cpPct: 3.8,  defQty: 5 },
    { id: 'groundnut_haulm',     name: 'Groundnut Haulm / Vines',    category: 'Dry Fodder',     dmPct: 85,   cpPct: 13.5, defQty: 4 },
    { id: 'mixed_grass_hay',     name: 'Mixed Grass Hay',             category: 'Dry Fodder',     dmPct: 88,   cpPct: 7.5,  defQty: 5 },
    { id: 'jowar_hay',           name: 'Jowar / Sorghum Stover (Kadbi)', category: 'Dry Fodder',  dmPct: 88,   cpPct: 4.5,  defQty: 5 },
    { id: 'sugarcane_bagasse',   name: 'Sugarcane Bagasse',           category: 'Dry Fodder',     dmPct: 90,   cpPct: 1.8,  defQty: 4 },

    // ─── 3. CONCENTRATES ───────────────────────────────────────────
    { id: 'wheat_bran',          name: 'Wheat Bran (Choker)',          category: 'Concentrates',   dmPct: 88,   cpPct: 14.5, defQty: 4 },
    { id: 'maize_grain',         name: 'Maize Grain Crushed (Makka)', category: 'Concentrates',   dmPct: 88,   cpPct: 9.5,  defQty: 3 },
    { id: 'soybean_meal',        name: 'Soybean Meal (DOC)',           category: 'Concentrates',   dmPct: 90,   cpPct: 48.0, defQty: 2 },
    { id: 'cottonseed_cake',     name: 'Cottonseed Cake (Khal)',       category: 'Concentrates',   dmPct: 91,   cpPct: 22.0, defQty: 3 },
    { id: 'mustard_cake',        name: 'Mustard / Rapeseed Cake',     category: 'Concentrates',   dmPct: 90,   cpPct: 36.0, defQty: 2 },
    { id: 'groundnut_cake',      name: 'Groundnut Cake',              category: 'Concentrates',   dmPct: 92,   cpPct: 45.0, defQty: 2 },
    { id: 'rice_bran',           name: 'De-oiled Rice Bran (DORB)',   category: 'Concentrates',   dmPct: 90,   cpPct: 12.5, defQty: 3 },
    { id: 'commercial_pellets',  name: 'Commercial Dairy Compound Pellets', category: 'Concentrates', dmPct: 89, cpPct: 20.0, defQty: 4 },
    { id: 'barley_grain',        name: 'Barley Grain Crushed (Jau)',  category: 'Concentrates',   dmPct: 88,   cpPct: 11.5, defQty: 3 },
    { id: 'oats_grain',          name: 'Oats Grain Crushed',          category: 'Concentrates',   dmPct: 89,   cpPct: 12.0, defQty: 3 },
    { id: 'sesame_cake',         name: 'Sesame / Til Cake',           category: 'Concentrates',   dmPct: 90,   cpPct: 38.0, defQty: 2 },
    { id: 'sunflower_meal',      name: 'Sunflower Meal',              category: 'Concentrates',   dmPct: 90,   cpPct: 32.0, defQty: 2 },
    { id: 'sorghum_grain',       name: 'Sorghum Grain (Jowar Grain)', category: 'Concentrates',   dmPct: 87,   cpPct: 8.7,  defQty: 3 },
    { id: 'bajra_grain',         name: 'Bajra Grain (Pearl Millet)',  category: 'Concentrates',   dmPct: 90,   cpPct: 12.0, defQty: 3 },
    { id: 'rice_polish',         name: 'Rice Polish / Rice Bran (Oily)', category: 'Concentrates', dmPct: 90,  cpPct: 10.7, defQty: 2 },
    { id: 'whole_cottonseed',    name: 'Whole Cottonseed',            category: 'Concentrates',   dmPct: 92,   cpPct: 22.0, defQty: 2 },
    { id: 'black_gram',          name: 'Black Gram (Urad)',           category: 'Concentrates',   dmPct: 88,   cpPct: 29.0, defQty: 2 },
    { id: 'brewers_grain_dry',   name: 'Dried Brewer\'s Grain',      category: 'Concentrates',   dmPct: 91,   cpPct: 25.4, defQty: 3 },

    // ─── 4. UNCONVENTIONAL ─────────────────────────────────────────
    { id: 'brewer_grain',        name: 'Spent Brewer Grain (Wet)',    category: 'Unconventional', dmPct: 24,   cpPct: 26.0, defQty: 10 },
    { id: 'citrus_pulp',         name: 'Citrus Fruit Pulp',           category: 'Unconventional', dmPct: 20,   cpPct: 6.5,  defQty: 8 },
    { id: 'cane_molasses',       name: 'Cane Molasses',               category: 'Unconventional', dmPct: 75,   cpPct: 4.0,  defQty: 2 },
    { id: 'azolla',              name: 'Azolla Pinnata (Fresh)',       category: 'Unconventional', dmPct: 10,   cpPct: 24.0, defQty: 2 },
    { id: 'corn_gluten_meal',    name: 'Corn Gluten Meal',            category: 'Unconventional', dmPct: 88,   cpPct: 58.0, defQty: 2 },
    { id: 'guar_meal',           name: 'Guar Meal (Cluster Bean)',    category: 'Unconventional', dmPct: 88,   cpPct: 50.0, defQty: 2 },
    { id: 'corn_steep_liquor',   name: 'Corn Steep Liquor',           category: 'Unconventional', dmPct: 52,   cpPct: 52.0, defQty: 2 },
    { id: 'tamarind_seed',       name: 'Tamarind Seed Powder',        category: 'Unconventional', dmPct: 90,   cpPct: 12.0, defQty: 2 },
    { id: 'mango_seed',          name: 'Mango Seed Kernel',           category: 'Unconventional', dmPct: 88,   cpPct: 6.0,  defQty: 3 },
    { id: 'babul_pods',          name: 'Babul Pods (Acacia)',         category: 'Unconventional', dmPct: 90,   cpPct: 12.0, defQty: 3 },
    { id: 'jackfruit_waste',     name: 'Jackfruit Waste',             category: 'Unconventional', dmPct: 90,   cpPct: 7.7,  defQty: 5 },
    { id: 'tomato_waste',        name: 'Tomato Waste',                category: 'Unconventional', dmPct: 85,   cpPct: 15.0, defQty: 5 },
    { id: 'banana_root',         name: 'Banana Root / Pseudostem',   category: 'Unconventional', dmPct: 12,   cpPct: 12.0, defQty: 5 },
    { id: 'potato_waste',        name: 'Potato Waste',                category: 'Unconventional', dmPct: 80,   cpPct: 7.6,  defQty: 5 },
    { id: 'seaweed_meal',        name: 'Seaweed Meal (Sargassum)',    category: 'Unconventional', dmPct: 88,   cpPct: 10.0, defQty: 2 },
    { id: 'jowar_cake',          name: 'Jowar Cake',                  category: 'Unconventional', dmPct: 88,   cpPct: 10.0, defQty: 2 },
    { id: 'tapioca_starch_waste',name: 'Tapioca Starch Waste',        category: 'Unconventional', dmPct: 88,   cpPct: 12.0, defQty: 4 },
    { id: 'sugarcane_bagasse_unc',name: 'Sugarcane Bagasse (Pith)',    category: 'Unconventional', dmPct: 90,   cpPct: 1.7,  defQty: 5 },
    { id: 'cocoa_pods',          name: 'Cocoa Pods',                  category: 'Unconventional', dmPct: 88,   cpPct: 6.3,  defQty: 3 },
    { id: 'rain_tree_pods',      name: 'Rain Tree Pods (Saman)',      category: 'Unconventional', dmPct: 88,   cpPct: 16.7, defQty: 3 },
    { id: 'subabul_seeds',       name: 'Subabul Seeds (Leucaena)',    category: 'Unconventional', dmPct: 88,   cpPct: 29.0, defQty: 2 },
    { id: 'niger_seed_cake',     name: 'Niger Seed Cake (Guizotia)', category: 'Unconventional', dmPct: 88,   cpPct: 34.0, defQty: 2 },
    { id: 'rubber_seed_cake',    name: 'Rubber Seed Cake',            category: 'Unconventional', dmPct: 88,   cpPct: 35.0, defQty: 2 },
  ];

  const getSelectedFeed = (id) => selectedFeeds.find(f => f.id === id);

  // When user clicks a feed card, immediately open quantity prompt!
  const handleSelectFeedCard = (item) => {
    const existing = getSelectedFeed(item.id);
    setEditingFeed(item);
    setModalQty(existing?.quantityKg ? String(existing.quantityKg) : String(item.defQty || 10));
  };

  // Confirm quantity from modal
  const handleSaveModalQty = () => {
    if (!editingFeed) return;
    const num = parseFloat(modalQty);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid quantity in kg/day.');
      return;
    }

    if (acknowledgeStep) acknowledgeStep();
    const existing = getSelectedFeed(editingFeed.id);

    if (existing) {
      setSelectedFeeds(selectedFeeds.map(f => f.id === editingFeed.id ? { ...f, quantityKg: num } : f));
    } else {
      setSelectedFeeds([
        ...selectedFeeds,
        {
          id: editingFeed.id,
          name: editingFeed.name,
          category: editingFeed.category,
          dmPct: editingFeed.dmPct,
          cpPct: editingFeed.cpPct,
          quantityKg: num,
        },
      ]);
    }
    setEditingFeed(null);
  };

  const handleRemoveFeed = (id, e) => {
    e.stopPropagation();
    if (acknowledgeStep) acknowledgeStep();
    setSelectedFeeds(selectedFeeds.filter(f => f.id !== id));
  };

  const handleAddCustomFeed = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    if (acknowledgeStep) acknowledgeStep();
    const newId = `custom_${Date.now()}`;
    const newFeed = {
      id: newId,
      name: customName.trim(),
      category: customCategory,
      dmPct: parseFloat(customDm) || 25,
      quantityKg: 10,
    };
    setSelectedFeeds([...selectedFeeds, newFeed]);
    setShowCustomModal(false);
    setCustomName('');
  };

  const [searchQuery, setSearchQuery] = useState('');
  const categories = ['All', 'Green Fodder', 'Dry Fodder', 'Concentrates', 'Unconventional'];

  const displayedCatalog = defaultFeedCatalog.filter(f => {
    const catMatch = activeTab === 'All' || f.category === activeTab;
    if (!searchQuery.trim()) return catMatch;

    const q = searchQuery.toLowerCase().trim();
    const nameEn = (f.name || '').toLowerCase();
    const nameTa = translateFeed(f.name, 'ta').toLowerCase();
    const nameHi = translateFeed(f.name, 'hi').toLowerCase();
    const catEn = (f.category || '').toLowerCase();
    const catTa = translateCategory(f.category, 'ta').toLowerCase();
    const catHi = translateCategory(f.category, 'hi').toLowerCase();

    const matchesSearch = nameEn.includes(q) || nameTa.includes(q) || nameHi.includes(q) || catEn.includes(q) || catTa.includes(q) || catHi.includes(q);

    return activeTab === 'All' ? matchesSearch : (catMatch && matchesSearch);
  });

  const totalKg = selectedFeeds.reduce((acc, f) => acc + (Number(f.quantityKg) || 0), 0);

  const handleProceed = () => {
    if (selectedFeeds.length === 0) {
      alert('Please select at least one feed available on your farm.');
      return;
    }
    const incomplete = selectedFeeds.filter(f => !f.quantityKg || Number(f.quantityKg) <= 0);
    if (incomplete.length > 0) {
      alert(`Please enter quantities for: ${incomplete.map(f => f.name).join(', ')}`);
      return;
    }
    onNext();
  };

  return (
    <div className="wg-card animate-fade-in">

      {/* Visual Banner */}
      <div
        className="step-banner"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1.5px solid #86efac',
          marginBottom: '20px',
        }}
      >
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.825rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {currentLang === 'ta' ? 'பண்ணை தீவன இருப்பு' : currentLang === 'hi' ? 'फार्म चारा एवं आहार सूची' : 'FARM FEED INVENTORY'}
            </span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#14532d' }}>
            {currentLang === 'ta' ? 'தீவனம் & பசுந்தீவன இருப்பு' : currentLang === 'hi' ? 'चारा एवं आहार सामग्री उपलब्धता' : 'Feed & Fodder Availability'}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#334155' }}>
            {currentLang === 'ta' 
              ? 'உங்கள் பண்ணையில் உள்ள ஒவ்வொரு தீவனத்தையும் தொட்டுத் தேர்வு செய்து, தினசரி கிடைக்கும் அளவை (கிலோ/நாள்) உள்ளிடவும்.' 
              : currentLang === 'hi'
                ? 'अपने फार्म पर उपलब्ध चारे पर क्लिक करें और उसकी दैनिक मात्रा (किग्रा/दिन) दर्ज करें।'
                : 'Tap each feed you have on your farm. When you select a feed, enter how much you have right now (kg/day).'}
          </p>
        </div>

        <img
          src="/cattle_art/feed.jpg"
          alt="Feeds and Fodder"
          className="step-banner-img"
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* Inventory Summary Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        border: '1.5px solid #86efac',
        borderRadius: '14px',
        padding: '12px 18px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block' }}>
              {currentLang === 'ta' ? 'தேர்வு செய்த தீவனங்கள்' : currentLang === 'hi' ? 'चयनित चारा सामग्री' : 'FEEDS SELECTED'}
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#16a34a' }}>
              {selectedFeeds.length} {currentLang === 'ta' ? 'வகைகள்' : currentLang === 'hi' ? 'प्रकार' : 'Feeds'}
            </span>
          </div>
          <div style={{ width: '1px', height: '30px', background: '#e2e8f0' }} />
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block' }}>
              {currentLang === 'ta' ? 'மொத்த தீவன இருப்பு' : currentLang === 'hi' ? 'कुल दैनिक चारा भंडार' : 'TOTAL INVENTORY'}
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
              {totalKg.toFixed(0)} {currentLang === 'ta' ? 'கிலோ/நாள்' : currentLang === 'hi' ? 'किग्रा/दिन' : 'kg/day'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCustomModal(true)}
          className="btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: 800 }}
        >
          {currentLang === 'ta' ? '+ புதிய தீவனம் சேர்' : currentLang === 'hi' ? '+ कस्टम चारा जोड़ें' : '+ Add Custom Feed'}
        </button>
      </div>

      {/* Search Bar for Feed & Fodder */}
      <div style={{
        marginBottom: '14px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{
          position: 'absolute',
          left: '14px',
          color: '#16a34a',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            currentLang === 'ta'
              ? 'தீவனப் பெயரைத் தேடுக (எ.கா: நேப்பியர், வைக்கோல், சோளம், தவிடு, புண்ணாக்கு, தீவன உருண்டை)...'
              : currentLang === 'hi'
                ? 'चारा सामग्री खोजें (उदा: नेपियर, भूसा, मक्का, चोकर, खली, दाना)...'
                : 'Search feed or fodder (e.g., Napier, Straw, Silage, Bran, Cake, Pellets)...'
          }
          style={{
            width: '100%',
            padding: '10px 38px 10px 42px',
            fontSize: '0.86rem',
            borderRadius: '12px',
            border: searchQuery ? '2px solid #16a34a' : '1.5px solid #cbd5e1',
            background: '#ffffff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            outline: 'none',
            color: '#0f172a'
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '12px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b'
            }}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {searchQuery && (
        <div style={{
          marginBottom: '14px',
          fontSize: '0.78rem',
          color: '#166534',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f0fdf4',
          padding: '7px 14px',
          borderRadius: '10px',
          border: '1px solid #bbf7d0'
        }}>
          <span>
            {currentLang === 'ta'
              ? `"${searchQuery}" முடிவுகள்: ${displayedCatalog.length} தீவனங்கள் உள்ளன`
              : currentLang === 'hi'
                ? `"${searchQuery}" परिणाम: ${displayedCatalog.length} चारा सामग्रियां मिलीं`
                : `Results for "${searchQuery}": ${displayedCatalog.length} feeds found`}
          </span>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#15803d',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: '0.76rem',
              textDecoration: 'underline'
            }}
          >
            {currentLang === 'ta' ? 'தேடலை அழி' : currentLang === 'hi' ? 'खोज हटाएं' : 'Clear search'}
          </button>
        </div>
      )}

      {/* Category Tabs Row + View Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        {/* Tabs scrollable */}
        <div
          className="horizontal-scroll"
          style={{ display: 'flex', gap: '8px', overflowX: 'auto', flex: 1, paddingBottom: '2px' }}
        >
          {categories.map(cat => {
            const isSel = activeTab === cat;
            const displayLabel = cat === 'All'
              ? (currentLang === 'ta' ? 'அனைத்தும்' : currentLang === 'hi' ? 'सभी' : 'All')
              : translateCategory(cat, currentLang);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveTab(cat)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  border: `1.5px solid ${isSel ? '#16a34a' : '#e2e8f0'}`,
                  background: isSel ? '#16a34a' : '#ffffff',
                  color: isSel ? '#ffffff' : '#475569',
                  fontSize: '0.8rem',
                  fontWeight: isSel ? 800 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>

        {/* View toggle: List | Grid */}
        <div style={{ display: 'flex', border: '1.5px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            title="List view"
            style={{
              padding: '6px 10px',
              background: viewMode === 'list' ? '#16a34a' : '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill={viewMode === 'list' ? '#fff' : '#64748b'}>
              <rect x="0" y="2" width="16" height="2" rx="1"/>
              <rect x="0" y="7" width="16" height="2" rx="1"/>
              <rect x="0" y="12" width="16" height="2" rx="1"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            title="Grid view"
            style={{
              padding: '6px 10px',
              background: viewMode === 'grid' ? '#16a34a' : '#ffffff',
              border: 'none',
              borderLeft: '1.5px solid #e2e8f0',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill={viewMode === 'grid' ? '#fff' : '#64748b'}>
              <rect x="0" y="0" width="7" height="7" rx="1.5"/>
              <rect x="9" y="0" width="7" height="7" rx="1.5"/>
              <rect x="0" y="9" width="7" height="7" rx="1.5"/>
              <rect x="9" y="9" width="7" height="7" rx="1.5"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ─── LIST VIEW ─── */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px', border: '1.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          {displayedCatalog.map((item, idx) => {
            const selected = getSelectedFeed(item.id);
            const isSelected = Boolean(selected);
            const catColor = item.category === 'Green Fodder' ? '#16a34a'
              : item.category === 'Dry Fodder' ? '#b45309'
              : item.category === 'Concentrates' ? '#1d4ed8'
              : '#7c3aed';
            return (
              <div
                key={item.id}
                onClick={() => handleSelectFeedCard(item)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: isSelected ? '#f0fdf4' : '#ffffff',
                  borderBottom: idx < displayedCatalog.length - 1 ? '1px solid #f1f5f9' : 'none',
                  cursor: 'pointer', gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: catColor, flexShrink: 0 }} />
                  <span style={{
                    fontSize: '0.83rem', fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#15803d' : '#1e293b',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {translateFeed(item.name, currentLang)}
                  </span>
                </div>
                {isSelected ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px', padding: '2px 8px' }}>
                      {selected.quantityKg} kg
                    </span>
                    <button type="button" onClick={(e) => handleRemoveFeed(item.id, e)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', lineHeight: 1, display: 'flex', color: '#94a3b8' }}>
                      <X size={13} strokeWidth={2} />
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', flexShrink: 0, fontWeight: 600 }}>+ Add</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── GRID / BOX VIEW ─── */}
      {viewMode === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginBottom: '20px',
        }}>
          {displayedCatalog.map(item => {
            const selected = getSelectedFeed(item.id);
            const isSelected = Boolean(selected);
            const catColor = item.category === 'Green Fodder' ? '#16a34a'
              : item.category === 'Dry Fodder' ? '#b45309'
              : item.category === 'Concentrates' ? '#1d4ed8'
              : '#7c3aed';
            const catBg = item.category === 'Green Fodder' ? '#f0fdf4'
              : item.category === 'Dry Fodder' ? '#fef3c7'
              : item.category === 'Concentrates' ? '#eff6ff'
              : '#f5f3ff';

            return (
              <div
                key={item.id}
                onClick={() => handleSelectFeedCard(item)}
                style={{
                  borderRadius: '14px',
                  border: `2px solid ${isSelected ? catColor : '#e2e8f0'}`,
                  background: isSelected ? catBg : '#ffffff',
                  padding: '12px 12px 10px',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: '8px',
                  boxShadow: isSelected ? `0 4px 14px ${catColor}22` : '0 1px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  minHeight: '80px',
                }}
              >
                {/* Category tag */}
                <div style={{
                  display: 'inline-block',
                  fontSize: '0.6rem', fontWeight: 800,
                  color: catColor,
                  background: catBg,
                  border: `1px solid ${catColor}44`,
                  borderRadius: '6px',
                  padding: '1px 7px',
                  alignSelf: 'flex-start',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}>
                  {translateCategory(item.category, currentLang)}
                </div>

                {/* Feed name */}
                <div style={{
                  fontSize: '0.82rem', fontWeight: 700,
                  color: isSelected ? catColor : '#1e293b',
                  lineHeight: 1.3, flex: 1,
                }}>
                  {translateFeed(item.name, currentLang)}
                </div>

                {/* Bottom: quantity or add */}
                {isSelected ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: catColor }}>
                      {selected.quantityKg} kg/day
                    </span>
                    <button type="button" onClick={(e) => handleRemoveFeed(item.id, e)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: '#94a3b8' }}>
                      <X size={13} strokeWidth={2} />
                    </button>
                  </div>
                ) : (
                  <div style={{
                    fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '3px',
                  }}>
                    <Plus size={11} strokeWidth={2.5} /> Add
                  </div>
                )}

                {/* Selected checkmark badge */}
                {isSelected && (
                  <div style={{
                    position: 'absolute', top: '8px', right: '8px',
                    width: '18px', height: '18px',
                    background: catColor,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Check size={11} strokeWidth={3} color="#fff" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State when no feeds match */}
      {displayedCatalog.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '36px 20px',
          background: '#f8fafc',
          borderRadius: '16px',
          border: '1.5px dashed #cbd5e1',
          marginBottom: '20px'
        }}>
          <Wheat size={36} color="#16a34a" style={{ margin: '0 auto 8px', display: 'block' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', margin: '0 0 6px' }}>
            {currentLang === 'ta'
              ? 'தீவனங்கள் எதுவும் கிடைக்கவில்லை'
              : currentLang === 'hi'
                ? 'कोई चारा सामग्री नहीं मिली'
                : 'No feeds found'}
          </h4>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 14px' }}>
            {searchQuery
              ? (currentLang === 'ta'
                ? `"${searchQuery}" என்ற பெயரில் தீவனம் இல்லை. விருப்பமிருந்தால் புதிய தீவனமாகச் சேர்க்கலாம்.`
                : currentLang === 'hi'
                  ? `"${searchQuery}" से मेल खाता कोई चारा नहीं मिला। आप नया चारा जोड़ सकते हैं।`
                  : `No feeds matching "${searchQuery}". You can add it as a custom feed.`)
              : (currentLang === 'ta' ? 'இந்த பிரிவில் தீவனங்கள் இல்லை.' : 'No feeds in this category.')}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="btn-secondary"
                style={{ padding: '7px 16px', fontSize: '0.8rem' }}
              >
                {currentLang === 'ta' ? 'தேடலை அழி' : currentLang === 'hi' ? 'खोज हटाएं' : 'Clear Search'}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (searchQuery) setCustomName(searchQuery);
                setShowCustomModal(true);
              }}
              className="btn-primary"
              style={{ padding: '7px 16px', fontSize: '0.8rem' }}
            >
              {currentLang === 'ta' ? '+ புதிய தீவனம் சேர்க்க' : currentLang === 'hi' ? '+ नया चारा जोड़ें' : '+ Add Custom Feed'}
            </button>
          </div>
        </div>
      )}

      {/* QUANTITY MODAL - PORTALED TO DOCUMENT.BODY TO GUARANTEE VIEWPORT CENTERING */}
      {editingFeed && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setEditingFeed(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '380px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1.5px solid #86efac',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* CATTLE EATING FEED IMAGE HEADER */}
            <div style={{
              position: 'relative',
              height: '140px',
              background: '#d1fae5',
              overflow: 'hidden',
            }}>
              <img
                src="/cattle_art/feed.jpg"
                alt="Cattle eating feed"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }}
                onError={e => {
                  e.currentTarget.src = 'https://rgsfeeds.com/wp-content/uploads/2025/12/1-1.jpg';
                }}
              />
              {/* Gradient overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.25) 55%, rgba(0, 0, 0, 0.35) 100%)',
              }} />

              {/* Close (X) button on top right of image */}
              <button
                type="button"
                onClick={() => setEditingFeed(null)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '32px',
                  height: '32px',
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(4px)',
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#1e293b',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  zIndex: 2,
                }}
                title={currentLang === 'ta' ? 'மூடு' : 'Close'}
              >
                <X size={16} strokeWidth={2.5} />
              </button>

              {/* Feed info overlay at bottom of image */}
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '16px',
                right: '16px',
                zIndex: 2,
              }}>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: '#86efac',
                  background: 'rgba(0, 0, 0, 0.45)',
                  backdropFilter: 'blur(2px)',
                  border: '1px solid rgba(134, 239, 172, 0.4)',
                  borderRadius: '8px',
                  padding: '1px 7px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  marginBottom: '2px',
                }}>
                  {translateCategory(editingFeed.category, currentLang)}
                </span>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  margin: 0,
                  lineHeight: 1.25,
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                }}>
                  {translateFeed(editingFeed.name, currentLang)}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              <div style={{
                fontSize: '0.82rem',
                color: '#475569',
                fontWeight: 600,
                marginBottom: '12px',
                textAlign: 'center',
              }}>
                {currentLang === 'ta'
                  ? 'பண்ணையில் தினசரி கிடைக்கும் அளவை உள்ளிடவும்:'
                  : currentLang === 'hi'
                    ? 'दैनिक उपलब्ध मात्रा दर्ज करें:'
                    : 'Enter daily available quantity:'}
              </div>

              {/* Stepper Input: [-] [ Input ] [+] */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '16px',
              }}>
                <button
                  type="button"
                  onClick={() => {
                    const cur = parseFloat(modalQty) || 0;
                    const step = editingFeed.category === 'Concentrates' ? 1 : 5;
                    const next = Math.max(0.5, cur - step);
                    setModalQty(String(next));
                  }}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  −
                </button>

                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="500"
                    placeholder="0"
                    value={modalQty}
                    onChange={e => setModalQty(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveModalQty()}
                    style={{
                      width: '130px',
                      height: '52px',
                      fontSize: '1.8rem',
                      fontWeight: 900,
                      textAlign: 'center',
                      color: '#15803d',
                      border: '2px solid #86efac',
                      borderRadius: '14px',
                      background: '#f0fdf4',
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const cur = parseFloat(modalQty) || 0;
                    const step = editingFeed.category === 'Concentrates' ? 1 : 5;
                    setModalQty(String(cur + step));
                  }}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    border: '1.5px solid #16a34a',
                    background: '#dcfce7',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: '#15803d',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  +
                </button>

                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b' }}>
                  {currentLang === 'ta' ? 'கிலோ' : currentLang === 'hi' ? 'किग्रा' : 'kg'}
                </span>
              </div>

              {/* Quick Select Chips */}
              <div style={{
                fontSize: '0.72rem',
                color: '#64748b',
                fontWeight: 700,
                marginBottom: '8px',
              }}>
                {currentLang === 'ta' ? 'விரைவுத் தேர்வு:' : currentLang === 'hi' ? 'त्वरित चयन:' : 'Quick Select:'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                {(QUICK_QTY_MAP[editingFeed.category] || [5, 10, 15, 20, 25, 30]).map(q => {
                  const isActive = Number(modalQty) === q;
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setModalQty(String(q))}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '16px',
                        border: `1.5px solid ${isActive ? '#16a34a' : '#e2e8f0'}`,
                        background: isActive ? '#16a34a' : '#f8fafc',
                        color: isActive ? '#ffffff' : '#334155',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.1s ease',
                      }}
                    >
                      {q} {currentLang === 'ta' ? 'கிலோ' : currentLang === 'hi' ? 'किग्रा' : 'kg'}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons: Cancel and Save */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingFeed(null)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '12px', fontSize: '0.9rem', fontWeight: 700 }}
                >
                  {currentLang === 'ta' ? 'மூடு (ரத்து)' : currentLang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalQty}
                  className="btn-primary"
                  style={{
                    flex: 1.5,
                    padding: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: '#16a34a',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                  }}
                >
                  <Check size={18} strokeWidth={2.5} />
                  <span>{currentLang === 'ta' ? 'சேமி' : currentLang === 'hi' ? 'सहेजें' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Custom Feed Modal - PORTALED TO DOCUMENT.BODY */}
      {showCustomModal && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '16px',
          boxSizing: 'border-box',
        }}>
          <form onSubmit={handleAddCustomFeed} style={{ background: '#ffffff', borderRadius: '18px', padding: '24px', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 12px' }}>
              {currentLang === 'ta' ? 'புதிய தீவனம் சேர்' : currentLang === 'hi' ? 'कस्टम चारा जोड़ें' : 'Add Custom Feed'}
            </h3>
            <input
              type="text"
              placeholder={currentLang === 'ta' ? 'தீவனப் பெயர் (எ.கா. நாட்டு நேப்பியர்)' : currentLang === 'hi' ? 'चारे का नाम (उदा. हाइब्रिड नेपियर)' : 'Feed Name (e.g. Local Napier Hybrid)'}
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', marginBottom: '10px' }}
            />
            <select
              value={customCategory}
              onChange={e => setCustomCategory(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', marginBottom: '16px' }}
            >
              <option value="Green Fodder">{translateCategory('Green Fodder', currentLang)}</option>
              <option value="Dry Fodder">{translateCategory('Dry Fodder', currentLang)}</option>
              <option value="Concentrates">{translateCategory('Concentrates', currentLang)}</option>
              <option value="Unconventional">{translateCategory('Unconventional', currentLang)}</option>
            </select>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setShowCustomModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                {currentLang === 'ta' ? 'ரத்து' : currentLang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                {currentLang === 'ta' ? 'சேர்' : currentLang === 'hi' ? 'जोड़ें' : 'Add'}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Navigation */}
      <div className="responsive-nav-actions" style={{ borderTop: '1.5px solid #e2e8f0', paddingTop: '20px', marginTop: '20px' }}>
        <button onClick={onPrev} className="btn-secondary">
          <ChevronLeft size={18} />
          <span>{currentLang === 'ta' ? 'முந்தையது (தண்ணீர்)' : currentLang === 'hi' ? 'पिछला (पानी)' : (t ? t('previous') : 'Previous')}</span>
        </button>

        <button onClick={handleProceed} className="btn-primary">
          <span>{currentLang === 'ta' ? 'அடுத்த படி: இறுதிச் சுருக்கம் & கணக்கீடு' : currentLang === 'hi' ? 'अगला चरण: समीक्षा एवं गणना' : (t ? t('next_step') : 'Next: Review & Results')}</span>
          <ChevronRight size={18} />
        </button>
      </div>


    </div>
  );
}
