import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronRight, Check } from 'lucide-react';
import { CATTLE_BREEDS, getBreedName } from '../data/breeds';

export default function Step1BreedSelect({ selectedBreed, onSelectBreed, allEnteredAnimals = [], onNext, t, currentLang }) {
  // Empty search term by default so ALL breeds are displayed on load!
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBreeds = CATTLE_BREEDS.filter(breed => {
    const translatedName = getBreedName(breed, t);
    const searchLower = searchTerm.toLowerCase();
    return (
      breed.name.toLowerCase().includes(searchLower) ||
      (translatedName && translatedName.toLowerCase().includes(searchLower)) ||
      breed.category.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectBreed = (breed) => {
    onSelectBreed(breed);
    setIsOpen(false);
    // Instant advance to Step 2 on breed selection!
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="wg-card animate-fade-in">
      {/* Visual Header Banner */}
      <div 
        className="step-banner"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1.5px solid #bbf7d0'
        }}
      >
        <div className="step-banner-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.825rem', color: '#16a34a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {currentLang === 'hi' ? 'नस्ल चयन' : (t ? t('steps.step_1') : 'BREED SELECTION')}
            </span>
          </div>
          <h2 className="step-banner-title" style={{ color: '#0f172a' }}>
            {currentLang === 'hi' ? 'गाय या भैंस की नस्ल चुनें' : (t ? t('step1.title') : 'Select Cattle or Buffalo Breed')}
          </h2>
          <p className="step-banner-subtitle" style={{ color: '#475569' }}>
            {currentLang === 'ta' 
              ? 'மாடு அல்லது எருமை இனத்தை கிளிக் செய்து கால்நடை மந்தை மேலாண்மைக்கு செல்லவும்.' 
              : currentLang === 'hi'
                ? 'गाय या भैंस की नस्ल कार्ड पर क्लिक करें और सीधे मवेशी झुंड प्रबंधन पर आगे बढ़ें।'
                : (t ? t('step1.subtitle') : 'Click any breed card to select and proceed directly to Cattle Herd Management.')}
          </p>
        </div>

        <img 
          src="/cattle_art/breed_select.jpg" 
          alt="Cattle Breed Selection" 
          className="step-banner-img"
        />
      </div>

      {/* SINGLE COMBINED SEARCH & SELECT FIELD */}
      <div style={{ marginBottom: '24px', position: 'relative' }} ref={dropdownRef}>
        <div className="breed-search-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 800 }}>
            {t ? t('step1.search_label') : 'Search & Select Cattle Breed'}
          </label>
        </div>
        
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#16a34a' }} />
          
          <input 
            type="text" 
            placeholder={t ? t('step1.search_placeholder') : 'Search all breeds (e.g. Holstein Friesian, Jersey, Gir, Sahiwal, Murrah)...'}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            style={{ 
              width: '100%', 
              paddingLeft: '42px', 
              paddingRight: '40px',
              paddingTop: '12px',
              paddingBottom: '12px',
              fontSize: '0.95rem',
              fontWeight: '700',
              borderRadius: '12px',
              border: '2px solid #cbd5e1'
            }}
          />
        </div>

        {/* Dropdown Results List */}
        {isOpen && (
          <div 
            className="custom-scrollbar"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '6px',
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '12px',
              maxHeight: '280px',
              overflowY: 'auto',
              zIndex: 100,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
            }}
          >
            {filteredBreeds.length > 0 ? (
              filteredBreeds.map(breed => (
                <div 
                  key={breed.id}
                  onClick={() => handleSelectBreed(breed)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    background: selectedBreed?.id === breed.id ? '#f0fdf4' : '#ffffff',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                  onMouseLeave={(e) => e.currentTarget.style.background = selectedBreed?.id === breed.id ? '#f0fdf4' : '#ffffff'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={breed.image} 
                      alt={getBreedName(breed, t)}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/cattle_art/breed_select.jpg'; }}
                    />
                    <div>
                      <div style={{ fontSize: '0.925rem', fontWeight: 800, color: '#0f172a' }}>{getBreedName(breed, t)}</div>
                      <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>{breed.category} ({breed.origin})</div>
                    </div>
                  </div>

                  {selectedBreed?.id === breed.id && (
                    <Check size={16} color="#16a34a" strokeWidth={3} />
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                {t ? t('step1.no_breeds_found') : 'No breeds match'} "{searchTerm}".
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Breed Banner & Proceed Button */}
      {selectedBreed && (
        <div style={{
          background: '#f0fdf4',
          border: '2px solid #16a34a',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img 
              src={selectedBreed.image} 
              alt={getBreedName(selectedBreed, t)}
              style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #86efac' }}
            />
            <div>
              <span className="badge-green">{t ? t('step1.selected_breed') : 'SELECTED BREED'}</span>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a', margin: '3px 0 0', fontWeight: 800 }}>
                {getBreedName(selectedBreed, t)}
              </h3>
            </div>
          </div>

          <button 
            onClick={onNext} 
            className="btn-primary" 
            style={{ 
              padding: '10px 18px', 
              fontSize: '0.88rem',
              flex: '1 1 auto',
              minWidth: 'min(100%, 220px)',
              justifyContent: 'center'
            }}
          >
            <span>
              {currentLang === 'ta' 
                ? 'மாடுகள் மந்தை பிரிவுக்குச் செல்லவும்' 
                : currentLang === 'hi'
                  ? 'मवेशी झुंड पर जाएं'
                  : 'Proceed to Cattle Herd'}
            </span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* BREED CARDS GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 140px), 1fr))',
        gap: '12px',
        marginBottom: '28px'
      }}>
        {filteredBreeds.map(breed => {
          const isSelected = selectedBreed?.id === breed.id;
          return (
            <div 
              key={breed.id}
              onClick={() => handleSelectBreed(breed)}
              className="cattle-icon-anim"
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: isSelected ? '2.5px solid #16a34a' : '1.5px solid #e2e8f0',
                background: isSelected ? '#f0fdf4' : '#ffffff',
                position: 'relative',
                textAlign: 'center',
                padding: 0,
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div style={{ position: 'relative', height: 'clamp(95px, 20vw, 130px)', overflow: 'hidden', background: '#f8fafc' }}>
                <img 
                  src={breed.image} 
                  alt={getBreedName(breed, t)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = '/cattle_art/breed_select.jpg';
                  }}
                />
                
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#16a34a',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(22,163,74,0.4)'
                  }}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </div>

              <div style={{ padding: '8px 6px' }}>
                <h3 style={{ fontSize: '0.88rem', color: isSelected ? '#15803d' : '#0f172a', margin: 0, fontWeight: 800, lineHeight: 1.25 }}>
                  {getBreedName(breed, t)}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="responsive-nav-actions" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '20px', justifyContent: 'flex-end' }}>
        <button 
          onClick={onNext} 
          className="btn-primary" 
          disabled={!selectedBreed}
          style={{ 
            padding: '12px 24px', 
            opacity: selectedBreed ? 1 : 0.5, 
            cursor: selectedBreed ? 'pointer' : 'not-allowed' 
          }}
        >
          <span>{t ? t('next_step') : 'Next Step'}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
