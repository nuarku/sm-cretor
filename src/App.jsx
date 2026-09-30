import { useState, useRef, useEffect } from 'react'
import * as htmlToImage from 'html-to-image'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Login from './Login'
import './index.css'

function App() {
  const [user, setUser] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return unsubscribe;
  }, []);

  const [activeTab, setActiveTab] = useState('duyuru')
  
  const [duyuruData, setDuyuruData] = useState({
    title: 'Toplu Mülakat',
    content: 'Özel sektörde faaliyet gösteren perakende firmasında görevlendirilmek üzere engelli adaylar için toplu mülakat yapılacaktır.',
    date: '2026-06-24',
    startTime: '14:00',
    endTime: '16:00',
    address: 'Bursa İş Ofisi Kestel'
  })

  const [ilanData, setIlanData] = useState({
    title: 'OTOMOTİV SEKTÖRÜ KALİTE KONTROLCÜ',
    content: 'ARIYORUZ',
    deadline: '2026-07-15'
  })

  const [ilanType, setIlanType] = useState('ozelSektor')

  const [topluIlanTitle, setTopluIlanTitle] = useState('Günün Fırsatları')
  const [topluIlanData, setTopluIlanData] = useState([
    { id: 1, position: 'Makine Mühendisi', sector: 'Otomotiv Sektörü', deadline: '2026-07-20' },
    { id: 2, position: 'Ön Muhasebe Elemanı', sector: 'Tekstil Sektörü', deadline: '2026-07-22' },
    { id: 3, position: 'Satış Danışmanı', sector: 'Perakende', deadline: '2026-07-25' }
  ])

  const handleAddTopluIlan = () => {
    if (topluIlanData.length >= 10) {
      alert("En fazla 10 adet ilan ekleyebilirsiniz.");
      return;
    }
    setTopluIlanData([...topluIlanData, { id: Date.now(), position: '', sector: '', deadline: '' }]);
  }

  const handleUpdateTopluIlan = (id, field, value) => {
    setTopluIlanData(topluIlanData.map(item => item.id === id ? { ...item, [field]: value } : item));
  }

  const handleRemoveTopluIlan = (id) => {
    setTopluIlanData(topluIlanData.filter(item => item.id !== id));
  }

  const formatDuyuruDate = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long' });
  }

  const formatIlanDate = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  const previewRef = useRef(null)

  const handleDownload = () => {
    if (previewRef.current === null) return

    htmlToImage.toPng(previewRef.current, { quality: 1.0, pixelRatio: 2 })
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = `${activeTab}-gorseli.png`
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.error('oops, something went wrong!', err)
      })
  }

  // To fit the large previews (1080x1350) into the screen
  const [scale, setScale] = useState(0.4)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth - 400 // subtract sidebar
      const height = window.innerHeight - 100 // some padding
      
      const targetWidth = 1080
      const targetHeight = 1350
      
      const scaleX = width / targetWidth
      const scaleY = height / targetHeight
      
      setScale(Math.min(scaleX, scaleY, 1))
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [activeTab])

  const handleLogout = () => {
    signOut(auth).catch(console.error)
  }

  if (loadingAuth) return <div style={{padding: '50px', textAlign: 'center', fontFamily: 'sans-serif'}}>Yükleniyor...</div>;
  if (!user) return <Login />;

  return (
    <div className="main-layout">
      <header className="app-header">
        <div className="header-logo">
          <img src="/orijinal.png" alt="Bursa İş Ofisi" />
        </div>
        <div className="header-actions">
          <button className="header-btn" onClick={() => setShowHelp(true)}>Yardım</button>
          <button className="header-btn logout-btn" onClick={handleLogout}>Çıkış Yap</button>
        </div>
      </header>

      <div className="app-container">
      {/* Sidebar Form */}
      <div className="sidebar">
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'duyuru' ? 'active' : ''}`}
            onClick={() => setActiveTab('duyuru')}
          >
            Duyuru
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ilan' ? 'active' : ''}`}
            onClick={() => setActiveTab('ilan')}
          >
            İlan
          </button>
          <button 
            className={`tab-btn ${activeTab === 'topluIlan' ? 'active' : ''}`}
            onClick={() => setActiveTab('topluIlan')}
          >
            Toplu İlan
          </button>
        </div>

        {activeTab === 'duyuru' && (
          <div className="form-content">
            <div className="form-group">
              <label>Başlık</label>
              <input 
                type="text" 
                className="form-control" 
                value={duyuruData.title}
                onChange={e => setDuyuruData({...duyuruData, title: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>İçerik</label>
              <textarea 
                className="form-control" 
                value={duyuruData.content}
                onChange={e => setDuyuruData({...duyuruData, content: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Tarih</label>
              <input 
                type="date" 
                className="form-control" 
                value={duyuruData.date}
                onChange={e => setDuyuruData({...duyuruData, date: e.target.value})}
              />
            </div>
            <div className="form-group" style={{display: 'flex', gap: '10px'}}>
              <div style={{flex: 1}}>
                <label>Başlangıç Saati</label>
                <input 
                  type="time" 
                  className="form-control" 
                  value={duyuruData.startTime}
                  onChange={e => setDuyuruData({...duyuruData, startTime: e.target.value})}
                />
              </div>
              <div style={{flex: 1}}>
                <label>Bitiş Saati</label>
                <input 
                  type="time" 
                  className="form-control" 
                  value={duyuruData.endTime}
                  onChange={e => setDuyuruData({...duyuruData, endTime: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Adres</label>
              <input 
                type="text" 
                className="form-control" 
                value={duyuruData.address}
                onChange={e => setDuyuruData({...duyuruData, address: e.target.value})}
              />
            </div>
          </div>
        )}

        {activeTab === 'ilan' && (
          <div className="form-content">
            <div className="form-group">
              <label>İlan Türü</label>
              <div style={{display: 'flex', gap: '10px'}}>
                <button 
                  className={`tab-btn ${ilanType === 'ozelSektor' ? 'active' : ''}`}
                  onClick={() => setIlanType('ozelSektor')}
                  style={{flex: 1}}
                >
                  Özel Sektör
                </button>
                <button 
                  className={`tab-btn ${ilanType === 'istirak' ? 'active' : ''}`}
                  onClick={() => setIlanType('istirak')}
                  style={{flex: 1, ...(ilanType === 'istirak' ? {background: 'var(--primary-blue)'} : {})}}
                >
                  İştirak
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Başlık</label>
              <textarea 
                className="form-control" 
                rows={3}
                value={ilanData.title}
                onChange={e => setIlanData({...ilanData, title: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>İçerik</label>
              <input 
                type="text" 
                className="form-control" 
                value={ilanData.content}
                onChange={e => setIlanData({...ilanData, content: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Son Başvuru Tarihi</label>
              <input 
                type="date" 
                className="form-control" 
                value={ilanData.deadline}
                onChange={e => setIlanData({...ilanData, deadline: e.target.value})}
              />
            </div>
          </div>
        )}

        {activeTab === 'topluIlan' && (
          <div className="form-content" style={{maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px'}}>
            <div className="form-group">
              <label>Genel Başlık</label>
              <input 
                type="text" 
                className="form-control" 
                value={topluIlanTitle}
                onChange={e => setTopluIlanTitle(e.target.value)}
              />
            </div>
            
            {topluIlanData.map((item, index) => (
              <div key={item.id} style={{background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '15px', position: 'relative', border: '1px solid #dee2e6'}}>
                <div style={{fontWeight: 'bold', marginBottom: '10px', color: 'var(--primary-blue)'}}>İlan {index + 1}</div>
                <button 
                  onClick={() => handleRemoveTopluIlan(item.id)}
                  style={{position: 'absolute', top: '15px', right: '15px', background: 'var(--primary-red)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer'}}
                >
                  Sil
                </button>
                <div className="form-group">
                  <label>Pozisyon</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={item.position}
                    onChange={e => handleUpdateTopluIlan(item.id, 'position', e.target.value)}
                  />
                </div>
                <div className="form-group" style={{display: 'flex', gap: '10px'}}>
                  <div style={{flex: 1}}>
                    <label>Sektör</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={item.sector}
                      onChange={e => handleUpdateTopluIlan(item.id, 'sector', e.target.value)}
                    />
                  </div>
                  <div style={{flex: 1}}>
                    <label>Son Başvuru</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={item.deadline}
                      onChange={e => handleUpdateTopluIlan(item.id, 'deadline', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              onClick={handleAddTopluIlan}
              style={{width: '100%', padding: '12px', background: '#e9ecef', color: '#495057', border: '2px dashed #ced4da', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}
            >
              + Yeni İlan Ekle
            </button>
          </div>
        )}

        <button className="download-btn" onClick={handleDownload}>
          Görseli İndir
        </button>
      </div>

      {/* Preview Area */}
      <div className="preview-area">
        <div 
          className="preview-scale-container"
          style={{ 
            width: 1080 * scale,
            height: 1350 * scale,
            position: 'relative',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: '12px'
          }}
        >
          <div 
            className="preview-wrapper" 
            style={{ 
              transform: `scale(${scale})`, 
              transformOrigin: 'top left',
              width: 1080,
              height: 1350,
              position: 'absolute',
              top: 0,
              left: 0
            }}
          >
            <div ref={previewRef} style={{ width: '100%', height: '100%', background: 'white' }}>
            {activeTab === 'duyuru' && (
              <div className="preview-duyuru-new">
                
                <div className="duyuru-logo-container">
                  <img src="/orijinal.png" alt="Logo" className="duyuru-logo" />
                </div>
                
                <div className="duyuru-banner-wrapper">
                  <div className="duyuru-banner-top-line">
                    <div className="duyuru-banner-top-dot"></div>
                  </div>
                  <div className="duyuru-banner-main">
                    <div className="banner-text-1">TOPLU</div>
                    <div className="banner-text-2">MÜLAKAT</div>
                  </div>
                  <div className="duyuru-banner-bottom-line">
                    <div className="duyuru-banner-bottom-dot"></div>
                  </div>
                </div>

                <div className="duyuru-content-wrapper">
                  <div className="duyuru-content-text" dangerouslySetInnerHTML={{ __html: duyuruData.content.replace(/(Özel sektörde|metal firmasında)/gi, '<strong>$1</strong>') }}>
                  </div>
                </div>
                
                <div className="duyuru-details-row">
                  <div className="duyuru-detail-col">
                    <svg viewBox="0 0 24 24" fill="#4bd8e7" width="70" height="70" className="detail-icon"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>
                    <div className="detail-text" dangerouslySetInnerHTML={{ __html: formatDuyuruDate(duyuruData.date).replace(' ', '<br/>') }}></div>
                  </div>
                  <div className="duyuru-detail-col">
                    <svg viewBox="0 0 24 24" fill="#4bd8e7" width="80" height="80" className="detail-icon"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                    <div className="detail-text">{duyuruData.startTime}<br/>{duyuruData.endTime}</div>
                  </div>
                  <div className="duyuru-detail-col">
                    <svg viewBox="0 0 24 24" fill="#4bd8e7" width="80" height="80" className="detail-icon"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    <div className="detail-text">{duyuruData.address.split(' ').slice(0, 2).join(' ')}<br/>{duyuruData.address.split(' ').slice(2).join(' ')}</div>
                  </div>
                </div>

                <div className="duyuru-footer-wrapper">
                  <div className="duyuru-footer-content">
                    <div className="footer-left-col">
                      <div className="bursa-logo-white"></div>
                    </div>
                    <div className="footer-divider"></div>
                    <div className="footer-center-col">
                      Merinos Atatürk Kongre ve<br/>Kültür Merkezi, Batı Kapısı<br/>
                      <span className="footer-bold-text">+90 224 716 11 16</span>
                    </div>
                    <div className="footer-divider"></div>
                    <div className="footer-right-col">
                      Tüm iş ve kariyer fırsatları için<br/>ziyaret edin;<br/>
                      <span className="footer-bold-text">bursaisofisi.bursa.bel.tr</span>
                    </div>
                  </div>
                </div>

              </div>
            )}
            
            {activeTab === 'ilan' && (
              <div className="preview-ilan-new">
                <div className="ilan-header-new">
                  <img src="/orijinal.png" alt="Logo" className="ilan-logo-new" />
                </div>
                
                <div className="ilan-card-container">
                  <div className="ilan-card-inner">
                    <div className="ilan-card-title-row">
                      <div className="ilan-card-line"></div>
                      <div className="ilan-card-title-text">İŞ İLANI</div>
                      <div className="ilan-card-line"></div>
                    </div>
                    
                    {ilanType === 'istirak' && (
                      <div className="istirak-badge">İŞTİRAK İLANI</div>
                    )}
                    
                    <div className="ilan-position-text">
                      {ilanData.title}
                    </div>
                    <div className="ilan-ariyoruz-text">
                      ARIYORUZ
                    </div>
                  </div>
                </div>
                
                <div className="ilan-people-banner">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4bd8e7" strokeWidth="1.5" width="120" height="120">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                
                <div className="ilan-deadline-pill">
                  <div className="deadline-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="white" width="40" height="40"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>
                  </div>
                  <div className="deadline-text">SON BAŞVURU TARİHİ</div>
                  <div className="deadline-divider"></div>
                  <div className="deadline-date">{formatIlanDate(ilanData.deadline)}</div>
                </div>

                <div className="ilan-footer-new" style={{padding: '0 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '15px', flex: 1}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                      <svg viewBox="0 0 24 24" fill="var(--dark-blue)" width="40" height="40"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      <div style={{fontSize: '22px', color: 'var(--dark-blue)', fontWeight: '500', lineHeight: '1.3'}}>
                        Merinos Atatürk Kongre ve<br/>Kültür Merkezi, Batı Kapısı
                      </div>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                      <svg viewBox="0 0 24 24" fill="var(--dark-blue)" width="40" height="40"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                      <strong style={{fontSize: '28px', color: 'var(--dark-blue)', fontWeight: '800'}}>+90 224 716 11 16</strong>
                    </div>
                  </div>
                  
                  <div style={{width: '2px', height: '80px', backgroundColor: '#e0e0e0', margin: '0 40px'}}></div>
                  
                  <div style={{display: 'flex', flexDirection: 'column', gap: '15px', flex: 1}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                      <svg viewBox="0 0 24 24" fill="var(--dark-blue)" width="40" height="40"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                      <div style={{fontSize: '22px', color: 'var(--dark-blue)', fontWeight: '500', lineHeight: '1.3'}}>
                        Tüm iş ve kariyer fırsatları için<br/>ziyaret edin;
                      </div>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '40px', height: '40px'}}>
                        <svg viewBox="0 0 24 24" fill="var(--dark-blue)" width="45" height="45"><path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/></svg>
                      </div>
                      <strong style={{fontSize: '28px', color: 'var(--dark-blue)', fontWeight: '800'}}>bursaisofisi.bursa.bel.tr</strong>
                    </div>
                  </div>
                </div>
                
                <div className="ilan-bottom-band">
                   <div className="bursa-logo-white-small"></div>
                </div>
              </div>
            )}

            {activeTab === 'topluIlan' && (
              <div className="preview-toplu-new">
                <div className="toplu-bg-gradient"></div>
                
                <div className="toplu-header-new">
                  <div className="toplu-logos-row" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', marginTop: '10px'}}>
                    <img src="/birliktebeyaz.png" alt="Bursa Büyükşehir Belediyesi & Bursa İş Ofisi" style={{height: '120px', objectFit: 'contain'}} />
                  </div>
                  
                  <div className="toplu-title-pill-wrapper">
                    <div className="toplu-title-pill">
                      GÜNÜN İLANLARI
                    </div>
                  </div>
                </div>
                
                <div className="toplu-list-new" style={{gap: topluIlanData.length > 8 ? '8px' : (topluIlanData.length > 5 ? '12px' : '15px')}}>
                  {topluIlanData.map((item, index) => {
                    const isMany = topluIlanData.length > 5;
                    const isVeryMany = topluIlanData.length > 8;
                    return (
                    <div key={item.id} className="toplu-list-item-new" style={{
                      padding: isVeryMany ? '10px 20px' : (isMany ? '15px 30px' : '20px 40px'),
                    }}>
                      <div className="item-left">
                        <div className="item-position" style={{fontSize: isVeryMany ? '24px' : (isMany ? '28px' : '34px')}}>
                          {item.position}
                        </div>
                        <div className="item-sector" style={{fontSize: isVeryMany ? '18px' : (isMany ? '20px' : '24px')}}>
                          {item.sector}
                        </div>
                      </div>
                      
                      <div className="item-right">
                        <svg viewBox="0 0 24 24" fill="#4bd8e7" width={isVeryMany ? '30' : '40'} height={isVeryMany ? '30' : '40'}>
                          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
                        </svg>
                        <div className="item-date-col">
                          <div className="item-date-label" style={{fontSize: isVeryMany ? '12px' : '14px'}}>SON BAŞVURU TARİHİ</div>
                          <div className="item-date-value" style={{fontSize: isVeryMany ? '18px' : (isMany ? '22px' : '26px')}}>{formatIlanDate(item.deadline)}</div>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>

                <div className="toplu-footer-new" style={{padding: '0 60px 50px 60px', display: 'flex', justifyContent: 'space-between', gap: '40px'}}>
                  <div style={{display: 'flex', flexDirection: 'column', borderLeft: '2px solid rgba(255,255,255,0.4)', paddingLeft: '25px', flex: 1}}>
                    <div style={{color: 'white', fontSize: '24px', lineHeight: '1.4', marginBottom: '15px'}}>
                      Merinos Atatürk Kongre ve<br/>Kültür Merkezi, Batı Kapısı
                    </div>
                    <strong style={{color: 'white', fontSize: '30px', fontWeight: '800'}}>
                      +90 224 716 11 16
                    </strong>
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', borderLeft: '2px solid rgba(255,255,255,0.4)', paddingLeft: '25px', flex: 1.1}}>
                    <div style={{color: 'white', fontSize: '24px', lineHeight: '1.4', marginBottom: '15px'}}>
                      Tüm iş ve kariyer fırsatları için<br/>ziyaret edin;
                    </div>
                    <strong style={{color: 'white', fontSize: '30px', fontWeight: '800'}}>
                      bursaisofisi.bursa.bel.tr
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>

      {showHelp && (
        <div className="help-modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal" onClick={e => e.stopPropagation()}>
            <h2>Uygulama Kullanım Rehberi</h2>
            <p><strong>Bursa İş Ofisi Sosyal Medya Görsel Oluşturucu</strong>'ya hoş geldiniz.</p>
            <p>Bu uygulama, sosyal medya hesaplarında paylaşılmak üzere standartlara uygun, kurumsal tasarımlı duyuru ve iş ilanları görselleri hazırlamanızı sağlar.</p>
            <ul>
              <li><strong>Duyuru Modu:</strong> Instagram ve sosyal medya gönderileri (Post) için uygun olan <strong>1080x1350 piksel</strong> ebadında dikey görseller üretir.</li>
              <li><strong>İlan Modu:</strong> Instagram (Dikey Post), Facebook ve LinkedIn gönderileri için tam uygun olan <strong>1080x1350 piksel</strong> ebadında dikey-kare görseller üretir.</li>
            </ul>
            <p>Sol taraftaki formu doldurdukça sağ tarafta canlı önizlemesini görebilirsiniz. Tasarımınız bittiğinde <strong>"Görseli İndir"</strong> butonuna tıklayarak yüksek çözünürlüklü asıl boyutundaki PNG dosyasını bilgisayarınıza indirebilirsiniz.</p>
            <button className="download-btn" style={{marginTop: '20px'}} onClick={() => setShowHelp(false)}>Kapat</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
