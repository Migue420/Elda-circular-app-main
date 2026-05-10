/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Camera, 
  Recycle, 
  User, 
  Trash2, 
  ArrowRight, 
  Award, 
  History, 
  Search, 
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import QuizEducativo from './components/features/QuizEducativo';

import 'leaflet/dist/leaflet.css';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

import { useLocalStorage } from './hooks/useLocalStorage';
import { 
  PICKUP_POINTS, 
  WASTE_CALENDAR, 
  PickupPoint, 
  WasteItem, 
  UserProfile 
} from './constants';

type Tab = 'esquinas' | 'reportar' | 'vida' | 'elda';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('esquinas');
  const [profile, setProfile] = useLocalStorage<UserProfile>('elda_profile', {
    name: '',
    coins: 0,
    badges: [],
    impactKg: 0,
    onboarded: false
  });
  const [items, setItems] = useLocalStorage<WasteItem[]>('elda_items', []);
  const [incidents, setIncidents] = useLocalStorage<any[]>('elda_incidents', []);

  // Sync FOBESA logging (72h logic)
  useEffect(() => {
    const checkExpirations = () => {
      const now = Date.now();
      items.forEach(item => {
        if (!item.claimedBy && (now - item.createdAt) > 72 * 60 * 60 * 1000) {
          console.log(`[FOBESA AUTO-LOG] Alerta recogida especial: ${item.title} en ${item.id}. Llamando al 966 952 382...`);
        }
      });
    };
    const interval = setInterval(checkExpirations, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [items]);

  if (!profile.onboarded) {
    return <Onboarding onComplete={(name) => setProfile({ ...profile, name, onboarded: true })} />;
  }

  const addCoins = (amount: number) => {
    setProfile(prev => {
      const newBadges = [...prev.badges];
      if (prev.badges.length === 0 && amount > 0) {
        newBadges.push('Iniciador Circular');
        confetti();
      }
      return {
        ...prev,
        coins: prev.coins + amount,
        badges: newBadges,
        impactKg: prev.impactKg + (amount * 5) // 1 coin = 5kg for calculation simplicity
      };
    });
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-pop-bg halftone-bg border-x-4 border-black">
      {/* Waste Calendar Header */}
      <div className="p-3 bg-black text-white flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <Recycle className="w-5 h-5 text-cian" />
          <span className="font-bold text-xs uppercase tracking-widest">Elda Circular</span>
        </div>
        <div className="flex gap-2 items-center">
            <WasteTicker />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pb-20 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'esquinas' && <MisEsquinas key="esquinas" />}
          {activeTab === 'reportar' && <Reportar key="reportar" onReport={() => addCoins(10)} />}
          {activeTab === 'vida' && <DarVida key="vida" items={items} setItems={setItems} onSwap={() => addCoins(20)} />}
          {activeTab === 'elda' && <MiElda key="elda" profile={profile} />}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-4 border-black flex justify-around p-2 z-50 shadow-[0_-4px_0_0_rgba(0,0,0,1)]">
        <NavItem 
          active={activeTab === 'esquinas'} 
          onClick={() => setActiveTab('esquinas')} 
          icon={<MapPin />} 
          label="Esquinas" 
          color="bg-cian" 
        />
        <NavItem 
          active={activeTab === 'reportar'} 
          onClick={() => setActiveTab('reportar')} 
          icon={<Camera />} 
          label="Reportar" 
          color="bg-magenta" 
        />
        <NavItem 
          active={activeTab === 'vida'} 
          onClick={() => setActiveTab('vida')} 
          icon={<Recycle />} 
          label="Dar Vida" 
          color="bg-turquesa" 
        />
        <NavItem 
          active={activeTab === 'elda'} 
          onClick={() => setActiveTab('elda')} 
          icon={<User />} 
          label="Mi Elda" 
          color="bg-dorado" 
        />
      </nav>
    </div>
  );
}

function WasteTicker() {
  const today = new Date().getDay();
  const schedule = WASTE_CALENDAR.find(s => s.day === today);
  
  return (
    <div className={`comic-border px-2 py-0.5 text-[10px] uppercase font-bold flex items-center gap-1 ${schedule?.color} text-white`}>
      <span>Hoy: {schedule?.bag}</span>
    </div>
  );
}

function NavItem({ active, onClick, icon, label, color }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, color: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 transition-all ${active ? 'scale-110' : 'opacity-60'}`}
    >
      <div className={`p-2 rounded-full border-2 border-black ${active ? color : 'bg-gray-200'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
      {active && <div className="h-1 w-1 bg-black rounded-full" />}
    </button>
  );
}

/* --- Sections --- */

function MisEsquinas() {
  const [isEvening, setIsEvening] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      setIsEvening(hours >= 20 || hours < 0);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="h-full flex flex-col p-4"
    >
      <div className="mb-4">
        <h2 className="text-3xl font-black uppercase italic leading-none mb-1">Mis Esquinas</h2>
        <div className="bg-cian comic-border p-2 text-xs font-bold uppercase">
          {isEvening ? '🟢 Horario Activo: Recogida en curso' : '🔴 Horario: 20:00 - 00:00'}
        </div>
      </div>
      
      <div className="flex-1 comic-border overflow-hidden relative min-h-[300px]">
        <MapContainer center={[38.477, -0.793]} zoom={15} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {PICKUP_POINTS.map(point => (
            <Marker key={point.id} position={[point.lat, point.lng]}>
              <Popup>
                <div className="font-bold">{point.name}</div>
                <div className="text-[10px]">{point.activeFrom} - {point.activeTo}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 overflow-y-auto">
        {PICKUP_POINTS.slice(0, 4).map(p => (
           <div key={p.id} className="bg-white border-2 border-black p-2 text-[10px] font-black uppercase">
             {p.name}
           </div>
        ))}
      </div>
    </motion.div>
  );
}

function Reportar({ onReport }: { onReport: () => void }) {
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'fail'>('idle');
  const [flashlight, setFlashlight] = useState(false);

  const startScan = () => {
    setStatus('scanning');
    setScanning(true);
    // Simulate IA scan
    setTimeout(() => {
      const score = Math.random();
      if (score > 0.85) {
        setStatus('success');
        onReport();
        confetti();
      } else {
        setStatus('fail');
      }
      setScanning(false);
    }, 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 flex flex-col items-center h-full"
    >
      <h2 className="text-3xl font-black uppercase italic leading-none mb-6 self-start">Escaner IA</h2>
      
      <div className="w-full aspect-[3/4] comic-border bg-black relative flex items-center justify-center overflow-hidden">
        {status === 'idle' && (
          <div className="text-white text-center p-4">
             <Camera className="w-12 h-12 mx-auto mb-2 text-magenta" />
             <p className="text-xs uppercase font-bold">Apunta al residuo o pegatina roja</p>
          </div>
        )}

        {status === 'scanning' && (
           <div className="absolute inset-0 flex flex-col items-center justify-center">
             <div className="w-full h-1 bg-magenta absolute top-0 animate-[scan_2s_infinite]" />
             <div className="text-white font-black animate-pulse uppercase">Analizando Incidencia...</div>
             <p className="text-[10px] text-gray-400 mt-2">Buscando patrones: PEGATINA_ROJA_CONFORME</p>
           </div>
        )}

        {status === 'success' && (
          <div className="absolute inset-0 bg-green-500 flex flex-col items-center justify-center text-white p-4 text-center">
             <CheckCircle2 className="w-16 h-16 mb-4" />
             <p className="font-black text-2xl uppercase">¡Ahorro Logístico Detectado!</p>
             <p className="text-sm">+10 Elda-Coins</p>
             <button onClick={() => setStatus('idle')} className="mt-6 comic-button bg-white text-black text-sm">NUEVO REPORTE</button>
          </div>
        )}

        {status === 'fail' && (
          <div className="absolute inset-0 bg-red-500 flex flex-col items-center justify-center text-white p-4 text-center">
             <AlertTriangle className="w-16 h-16 mb-4" />
             <p className="font-black text-2xl uppercase">Error de Captura</p>
             <p className="text-sm">Confianza &lt; 85%. Mejora la luz.</p>
             <button onClick={() => setStatus('idle')} className="mt-6 comic-button bg-white text-black text-sm">REINTENTAR</button>
          </div>
        )}

        {/* GUIDES */}
        <div className="absolute inset-0 pointer-events-none p-4 opacity-50">
           <div className="border-t-2 border-l-2 border-white w-8 h-8 absolute top-4 left-4" />
           <div className="border-t-2 border-r-2 border-white w-8 h-8 absolute top-4 right-4" />
           <div className="border-b-2 border-l-2 border-white w-8 h-8 absolute bottom-4 left-4" />
           <div className="border-b-2 border-r-2 border-white w-8 h-8 absolute bottom-4 right-4" />
        </div>

        {flashlight && <div className="absolute inset-0 bg-white/30 mix-blend-overlay pointer-events-none" />}
      </div>

      <div className="mt-8 flex gap-4 w-full">
         <button 
           onClick={() => setFlashlight(!flashlight)} 
           className={`comic-button flex-1 ${flashlight ? 'bg-white' : 'bg-gray-300'}`}
         >
           {flashlight ? '🔦 ON' : '🔦 OFF'}
         </button>
         <button 
           onClick={startScan} 
           disabled={status === 'scanning' || status === 'success'}
           className="comic-button bg-magenta text-white flex-[2] uppercase font-black"
         >
           Escanear
         </button>
      </div>

      <p className="mt-6 text-[10px] text-center font-bold uppercase text-gray-500">
        Cada reporte evita 0,90€ de sobrecoste municipal por tonelada desviada.
      </p>

      <style>{`
        @keyframes scan {
          from { top: 0% }
          to { top: 100% }
        }
      `}</style>
    </motion.div>
  );
}

<<<<<<< HEAD
function DarVida({ items, setItems, onSwap }: { items: WasteItem[], setItems: any, onSwap: () => void }) {
=======
function DarVida({ items, setItems, onSwap }: { items: WasteItem[], setItems: React.Dispatch<React.SetStateAction<WasteItem[]>>, onSwap: () => void }) {
>>>>>>> d34ee96 (feat: implementacion final de Elda Circular con IA y sistema de puntos)
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', category: 'mueble' as any });

  const addItem = () => {
    if (!newItem.title) return;
    const item: WasteItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: newItem.title,
      description: 'Disponible en Elda',
      category: newItem.category,
      createdAt: Date.now(),
      ownerId: 'user1'
    };
    setItems([item, ...items]);
    setShowAdd(false);
    setNewItem({ title: '', category: 'mueble' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 h-full flex flex-col"
    >
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black uppercase italic leading-none mb-1">Dar Vida</h2>
          <p className="text-[10px] font-bold uppercase bg-turquesa inline-block px-1">Tablón economía circular</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="comic-button bg-turquesa text-xs">AÑADIR</button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 italic font-bold uppercase text-center">
            <Search className="w-12 h-12 mb-2" />
            Nada por aquí... aún.
          </div>
        ) : (
          items.map(item => (
            <WasteCard key={item.id} item={item} onSwap={() => {
              setItems(items.filter(i => i.id !== item.id));
              onSwap();
            }} />
          ))
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white comic-border p-6 w-full max-w-sm">
             <h3 className="text-xl font-bold uppercase mb-4 italic">Publicar Ítem</h3>
             <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase">Título</label>
                  <input 
                    type="text" 
                    className="w-full" 
                    placeholder="Silla, abrigo, TV..." 
                    value={newItem.title}
                    onChange={e => setNewItem({...newItem, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase">Categoría</label>
                  <select 
                    className="w-full"
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value as any})}
                  >
                    <option value="mueble">Mueble</option>
                    <option value="electrodomestico">Electrodoméstico</option>
                    <option value="textil">Textil</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAdd(false)} className="comic-button flex-1 bg-gray-200">CANCELAR</button>
                  <button onClick={addItem} className="comic-button flex-1 bg-turquesa uppercase font-black">PUBLICAR</button>
                </div>
             </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function WasteCard({ item, onSwap }: { item: WasteItem, onSwap: () => void }) {
  const [showQR, setShowQR] = useState(false);
  const timeLeft = 72 - (Date.now() - item.createdAt) / (1000 * 60 * 60);

  return (
    <div className="bg-white comic-border p-4 relative overflow-hidden">
       <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-black text-lg uppercase leading-tight">{item.title}</h4>
            <span className="text-[10px] bg-black text-white px-1 font-bold uppercase">{item.category}</span>
          </div>
          <div className="text-right">
            <div className={`text-[10px] font-bold uppercase px-1 border-2 border-black inline-block ${timeLeft < 24 ? 'bg-red-400' : 'bg-gray-200'}`}>
              Expira en {Math.max(0, Math.floor(timeLeft))}h
            </div>
          </div>
       </div>

       <div className="flex gap-2 mt-4">
         <button onClick={() => setShowQR(true)} className="comic-button flex-1 text-xs bg-turquesa font-black flex items-center justify-center gap-2">
           <Smartphone className="w-4 h-4" /> ME INTERESA
         </button>
       </div>

       {showQR && (
         <div className="absolute inset-0 bg-white comic-border flex flex-col items-center justify-center p-4 z-10">
            <h5 className="font-bold uppercase text-center mb-2">¡Intercambio!</h5>
            <p className="text-[8px] uppercase text-center mb-2">Escanea el código del vecino para liberar 20 Elda-Coins</p>
            <div className="p-2 border-4 border-black bg-white mb-4">
              <QRCodeSVG value={`vida-swap-${item.id}`} size={120} />
            </div>
            <div className="flex gap-2 w-full">
               <button onClick={() => setShowQR(false)} className="comic-button text-[10px] bg-gray-200">CERRAR</button>
               <button onClick={onSwap} className="comic-button text-[10px] flex-1 bg-turquesa font-black uppercase">FINGIR ESCANEO</button>
            </div>
         </div>
       )}
    </div>
  );
}

function MiElda({ profile }: { profile: UserProfile }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 h-full flex flex-col"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full border-4 border-black bg-dorado flex items-center justify-center font-black text-3xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          {profile.name[0]}
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase italic leading-none">{profile.name}</h2>
          <p className="text-xs font-bold uppercase text-gray-500">Miembro desde Hoy</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
         <div className="bg-white comic-border p-4 flex flex-col items-center">
            <span className="text-xs font-bold uppercase text-gray-500">Elda-Coins</span>
            <span className="text-3xl font-black text-dorado drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">{profile.coins}</span>
         </div>
         <div className="bg-white comic-border p-4 flex flex-col items-center">
            <span className="text-xs font-bold uppercase text-gray-500">Impulso Ciudad</span>
            <span className="text-3xl font-black text-cian drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">{(profile.coins * 0.09).toFixed(2)}€</span>
         </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-black uppercase italic mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-dorado" /> Insignias
        </h3>
        <div className="flex flex-wrap gap-2">
           {profile.badges.length === 0 ? (
             <p className="text-xs italic font-bold uppercase text-gray-400">Sin insignias aún. ¡Empieza a reciclar!</p>
           ) : (
             profile.badges.map(b => (
               <div key={b} className="bg-dorado comic-border px-3 py-1 text-xs font-black uppercase flex items-center gap-2">
                 <p>{b}</p>
               </div>
             ))
           )}
        </div>
      </div>

      <div className="comic-border p-4 bg-black text-white mb-4">
         <h3 className="font-bold uppercase text-xs mb-2 text-dorado">Tu Impacto</h3>
         <div className="flex items-center justify-between">
           <span className="text-2xl font-black uppercase">{profile.impactKg} <small className="text-[10px]">KG</small></span>
           <span className="text-[10px] uppercase font-bold text-gray-400">de residuos desviados</span>
         </div>
      </div>

      <div className="mb-4 space-y-2">
        <a 
          href={`mailto:alcaldia@elda.es?subject=Propuesta Innovación: Elda Circular - Ahorro Municipal&body=Estimados miembros del Ayuntamiento de Elda,%0D%0A%0D%0AComo ciudadano comprometido, les presento "Elda Circular", una PWA diseñada para reducir el gasto municipal en gestión de residuos en hasta 90€ por tonelada mediante gamificación y logística de proximidad.%0D%0A%0D%0AAdjunto el código fuente (ZIP) y la memoria técnica detallada.%0D%0A%0D%0ASaludos,%0D%0A${profile.name}`}
          className="w-full flex items-center justify-between comic-button bg-cyan-400 text-black text-xs font-black uppercase"
        >
          <span>🏛️ PROPUESTA AYUNTAMIENTO</span>
          <ArrowRight className="w-4 h-4" />
        </a>
        <a 
          href={`mailto:info@fobesa.com?subject=Colaboración Logística: App Elda Circular&body=Hola equipo de FOBESA,%0D%0A%0D%0AHe desarrollado una herramienta que utiliza IA para detectar incidencias y fomentar la economía circular en Elda, optimizando las rutas de recogida especial.%0D%0A%0D%0ALes adjunto el código del prototipo y la arquitectura del sistema.%0D%0A%0D%0AAtentamente,%0D%0A${profile.name}`}
          className="w-full flex items-center justify-between comic-button bg-magenta text-white text-xs font-black uppercase"
        >
          <span>🚚 PROPUESTA FOBESA</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      <div className="mb-4">
        <button 
          onClick={() => {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
              printWindow.document.write(`
                <html>
                  <head>
                    <title>MEMORIA TÉCNICA - ELDA CIRCULAR</title>
                    <style>
                      body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #333; }
                      h1 { color: #000; border-bottom: 4px solid #00FFFF; padding-bottom: 10px; }
                      h2 { color: #FF00FF; margin-top: 30px; }
                      .highlight { background: #FFF500; font-weight: bold; padding: 2px 5px; }
                      .footer { margin-top: 50px; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
                    </style>
                  </head>
                  <body>
                    <h1>ELDA CIRCULAR: Memoria de Proyecto</h1>
                    <p><strong>Objetivo:</strong> Reducción del gasto municipal en vertederos y optimización logística.</p>
                    
                    <h2>1. Impacto Económico</h2>
                    <p>El ayuntamiento ahorra aproximadamente <span class="highlight">90€ por cada tonelada</span> de residuo que se desvía del flujo general hacia el reciclaje correcto o la reutilización.</p>
                    
                    <h2>2. Módulos Técnicos</h2>
                    <ul>
                      <li><strong>Visión IA:</strong> Detección de patrones en pegatinas de "No Conforme" para educar al ciudadano en tiempo real.</li>
                      <li><strong>Mapa de Proximidad:</strong> Optimización de los 10 puntos críticos de recogida en horario nocturno (20h-00h).</li>
                      <li><strong>Dar Vida:</strong> Tablón de economía circular con lógica de expiración de 72h y aviso automático a FOBESA para evitar abandono en vía pública.</li>
                    </ul>
                    
                    <h2>3. Gamificación (Elda-Coins)</h2>
                    <p>Sistema de meritocracia digital donde las acciones positivas liberan moneda local virtual, canjeable por beneficios ciudadanos, fomentando el orgullo de pertenencia a Elda.</p>
                    
                    <div class="footer">Propuesta generada por Elda Circular PWA - Ayuntamiento de Elda x FOBESA</div>
                  </body>
                </html>
              `);
              printWindow.document.close();
              printWindow.print();
            }
          }}
          className="w-full flex items-center justify-between comic-button bg-black text-white text-xs font-black uppercase"
        >
          <span>📄 REPORTE TÉCNICO (PARA PDF)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-4">
        <a 
          href="https://notebooklm.google.com/notebook/42dd2ad4-3ef7-40dc-8c78-07443e13a3ef/artifact/835c1f28-c605-4b9c-af9b-31a634345195?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_2&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_2_" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between comic-button bg-white text-black text-xs font-black uppercase"
        >
          <span>📘 CONOCE EL PROYECTO (NOTEBOOK LM)</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      <div className="mt-auto pt-6 text-center">
        <p className="text-[9px] font-bold uppercase text-gray-500 mb-2">Ayuntamiento de Elda x FOBESA</p>
        <div className="flex justify-center gap-4 opacity-50">
           <div className="w-8 h-8 rounded-full border-2 border-black bg-cian" />
           <div className="w-8 h-8 rounded-full border-2 border-black bg-magenta" />
           <div className="w-8 h-8 rounded-full border-2 border-black bg-turquesa" />
        </div>
      </div>
    </motion.div>
  );
}

function Onboarding({ onComplete }: { onComplete: (name: string) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  const steps = [
    {
      title: "BIENVENIDO A ELDA CIRCULAR",
      subtitle: "Ayuntamiento de Elda x FOBESA",
      content: (
        <div>
          <p className="mb-4">Reduce, reutiliza y ahorra a tu ciudad 90€ por cada tonelada de residuo correctamente gestionado.</p>
          <a 
            href="https://notebooklm.google.com/notebook/42dd2ad4-3ef7-40dc-8c78-07443e13a3ef/artifact/835c1f28-c605-4b9c-af9b-31a634345195?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_2&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_2_" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 border-2 border-black bg-white/50 text-[10px] font-black uppercase"
          >
            📘 Resumen del Proyecto <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      ),
      color: "bg-cian",
      icon: <Recycle className="w-20 h-20" />,
      action: "SIGUIENTE"
    },
    {
      title: "CONVIERTE RESIDUOS EN ELDA-COINS",
      subtitle: "Gana Elda-Coins por cada acción",
      content: "Reporta incidencias, comparte muebles y respeta los horarios de recogida para ganar monedas y premios exclusivos.",
      color: "bg-magenta",
      icon: <Award className="w-20 h-20" />,
      action: "LO TENGO"
    },
    {
      title: "¿CÓMO TE LLAMAMOS?",
      subtitle: "Date de alta en la comunidad",
      content: "",
      color: "bg-turquesa",
      icon: <User className="w-20 h-20" />,
      action: "EMPEZAR"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      if (name.trim()) {
        onComplete(name);
      }
    }
  };

  return (
    <div className={`h-screen max-w-md mx-auto flex flex-col items-center justify-center p-6 ${steps[step].color} halftone-bg overflow-hidden relative border-x-4 border-black`}>
      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 1.2, rotate: 5 }}
          className="bg-white border-4 border-black p-8 w-full shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative z-10"
        >
          <div className="absolute -top-10 -right-6 bg-dorado border-4 border-black p-3 rotate-12 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            {steps[step].icon}
          </div>

          <h2 className="text-4xl font-black uppercase italic leading-[0.9] mb-2">{steps[step].title}</h2>
          <p className="text-xs font-bold uppercase mb-6 bg-black text-white inline-block px-2">{steps[step].subtitle}</p>
          
          <div className="font-bold text-sm leading-tight mb-8">
            {steps[step].content}
          </div>

          {step === 2 && (
            <div className="mb-8">
              <input 
                type="text" 
                placeholder="TU NOMBRE..." 
                className="w-full text-xl font-black uppercase tracking-tighter bg-white border-4 border-black p-4"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <button 
            onClick={handleNext}
            disabled={step === 2 && !name.trim()}
            className="w-full py-4 bg-black text-white font-black text-xl italic uppercase hover:translate-x-1 hover:translate-y-1 active:shadow-none shadow-[6px_6px_0_0_rgba(0,255,255,1)] disabled:opacity-50 disabled:shadow-none transition-all"
          >
            {steps[step].action}
          </button>
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-10 left-10 w-24 h-24 bg-magenta rounded-full mix-blend-multiply border-4 border-black -z-0 opacity-50" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-dorado rounded-full mix-blend-multiply border-4 border-black -z-0 opacity-50 translate-x-1/2" />
      
      <div className="absolute bottom-6 flex gap-2">
        {steps.map((_, i) => (
          <div key={i} className={`h-3 w-10 border-2 border-black transition-all ${i === step ? 'bg-black shadow-[2px_2px_0_0_rgba(255,255,255,1)]' : 'bg-white/50'}`} />
        ))}
      </div>
    </div>
  );
}

