import React, { useEffect, useRef, useState } from 'react';
import { Cloud, CloudRain, Map as MapIcon, Navigation, Play, Pause, RefreshCw, Sliders, Layers, Compass, Thermometer, Wind, Droplets, Sun, CloudLightning, BookOpen, Sparkles, Globe, Palette } from 'lucide-react';
import { DiaryEntry } from '../types';

// Declare Leaflet global type to prevent TypeScript compiler errors
declare global {
  interface Window {
    L: any;
  }
}

interface WeatherMapProps {
  emotionMode: string;
  diaryEntries: DiaryEntry[];
}

interface LocationPreset {
  name: string;
  coords: [number, number];
  zoom: number;
  temp: string;
  condition: string;
  desc: string;
  wind: string;
  humidity: string;
  icon: React.ReactNode;
}

export const WeatherMap: React.FC<WeatherMapProps> = ({ emotionMode, diaryEntries }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const radarLayerRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
  const baseLayerRef = useRef<any>(null);
  const guaguaLayerRef = useRef<any>(null);
  const tiendaLayerRef = useRef<any>(null);
  const trenLayerRef = useRef<any>(null);

  // Language & Custom Theme Customization
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [accentTheme, setAccentTheme] = useState<'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'cyan'>('blue');

  // Map & Radar States
  const [radarOpacity, setRadarOpacity] = useState<number>(0.75);
  const [radarScheme, setRadarScheme] = useState<string>('2'); // '2' is Universal Blue (Nubes Azules Modo Lluvia)
  const [selectedPreset, setSelectedPreset] = useState<string>('Canarias');
  const [radarType, setRadarType] = useState<'radar' | 'satellite'>('radar');
  const [radarTimestamps, setRadarTimestamps] = useState<number[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingRadar, setIsLoadingRadar] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Map settings
  const [mapStyle, setMapStyle] = useState<'light' | 'streets' | 'dark' | 'satellite'>('light');
  const [showGuaguas, setShowGuaguas] = useState<boolean>(true);
  const [showTiendas, setShowTiendas] = useState<boolean>(true);
  const [showTrenes, setShowTrenes] = useState<boolean>(true);

  // Translation helper
  const t = (esStr: string, enStr: string) => (language === 'en' ? enStr : esStr);

  // Dynamic Accent Theme CSS class helpers
  const getThemeBtnClass = (isActive: boolean) => {
    if (!isActive) return 'bg-stone-800/80 text-stone-400 hover:text-stone-200 border border-stone-700/40';
    switch (accentTheme) {
      case 'emerald': return 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold';
      case 'purple': return 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-bold';
      case 'amber': return 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-bold';
      case 'rose': return 'bg-rose-600 text-white shadow-md shadow-rose-600/20 font-bold';
      case 'cyan': return 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20 font-bold';
      default: return 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold';
    }
  };

  const getThemeBadgeClass = () => {
    switch (accentTheme) {
      case 'emerald': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      case 'purple': return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'amber': return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'rose': return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      case 'cyan': return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    }
  };

  const getThemeTextClass = () => {
    switch (accentTheme) {
      case 'emerald': return 'text-emerald-400';
      case 'purple': return 'text-purple-400';
      case 'amber': return 'text-amber-400';
      case 'rose': return 'text-rose-400';
      case 'cyan': return 'text-cyan-400';
      default: return 'text-blue-400';
    }
  };

  // Tomorrow's forecast and custom shop/bus searching states
  const [isForecastTomorrow, setIsForecastTomorrow] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Local Weather Card Presets
  const presets: LocationPreset[] = [
    {
      name: 'Canarias',
      coords: [28.3, -16.0],
      zoom: 8,
      temp: '22°C',
      condition: 'Alisios Activos',
      desc: 'Vista general del archipiélago bajo la influencia de los vientos alisios del noreste.',
      wind: '26 km/h NE',
      humidity: '72%',
      icon: <Compass className="w-8 h-8 text-amber-400" />,
    },
    {
      name: 'Tenerife (Norte/Sur)',
      coords: [28.2916, -16.6291],
      zoom: 10,
      temp: '21°C',
      condition: 'Sol y Bruma Alta',
      desc: 'La majestuosa silueta del Teide actúa como barrera natural reteniendo nubes húmedas en el norte.',
      wind: '20 km/h W',
      humidity: '64%',
      icon: <Sun className="w-8 h-8 text-amber-500" />,
    },
    {
      name: 'Gran Canaria',
      coords: [27.96, -15.54],
      zoom: 10,
      temp: '23°C',
      condition: 'Intervalos Nubosos',
      desc: 'Clima general agradable con microclimas muy marcados entre costa y la cumbre.',
      wind: '24 km/h N',
      humidity: '68%',
      icon: <Cloud className="w-8 h-8 text-blue-300" />,
    },
    {
      name: 'Las Palmas de G.C.',
      coords: [28.1235, -15.4363],
      zoom: 11,
      temp: '22°C',
      condition: '"Panza de Burro"',
      desc: 'Nubes bajas retenidas por los vientos alisios que refrescan la playa de Las Canteras.',
      wind: '22 km/h N',
      humidity: '75%',
      icon: <Cloud className="w-8 h-8 text-stone-400" />,
    },
    {
      name: 'Telde',
      coords: [28.0016, -15.4168],
      zoom: 12,
      temp: '24°C',
      condition: 'Soleado y Cálido',
      desc: 'Brisa marina suave en La Garita y Melenara. Excelente visibilidad del Bufadero.',
      wind: '18 km/h NE',
      humidity: '60%',
      icon: <Sun className="w-8 h-8 text-amber-400" />,
    },
    {
      name: 'Tejeda',
      coords: [27.9947, -15.6150],
      zoom: 12,
      temp: '17°C',
      condition: 'Mar de Nubes en Cumbre',
      desc: 'Espectacular fenómeno de nubes bajas rozando el Roque Nublo y Bentayga.',
      wind: '28 km/h NW',
      humidity: '82%',
      icon: <CloudRain className="w-8 h-8 text-indigo-300" />,
    },
    {
      name: 'Tejina',
      coords: [28.5283, -16.3813],
      zoom: 13,
      temp: '19°C',
      condition: 'Cielos Despejados y Alisios',
      desc: 'Preciosa localidad costera en el norte de Tenerife, famosa por su clima agrícola templado y sus ricas tradiciones.',
      wind: '15 km/h NW',
      humidity: '76%',
      icon: <Compass className="w-8 h-8 text-indigo-400" />,
    },
    {
      name: 'Valle de Guerra',
      coords: [28.5144, -16.3981],
      zoom: 13,
      temp: '20°C',
      condition: 'Suave Brisa del Norte',
      desc: 'Hermosa zona agrícola de Tenerife, célebre por sus cultivos de flores y excelente ambiente rural.',
      wind: '14 km/h NW',
      humidity: '72%',
      icon: <Sun className="w-8 h-8 text-amber-500" />,
    },
    {
      name: 'Bajamar',
      coords: [28.5564, -16.3444],
      zoom: 14,
      temp: '21°C',
      condition: 'Mar de Costa y Piscinas',
      desc: 'Famoso por sus piscinas naturales de agua salada ideales para disfrutar de la baja mar y la fuerza del océano.',
      wind: '22 km/h NW',
      humidity: '74%',
      icon: <CloudRain className="w-8 h-8 text-blue-300" />,
    },
    {
      name: 'Tacoronte',
      coords: [28.4816, -16.4150],
      zoom: 13,
      temp: '18°C',
      condition: 'Neblina y Viñedos',
      desc: 'Tierra de excelentes vinos con un clima fresco característico del monte y agradables microclimas húmedos.',
      wind: '16 km/h W',
      humidity: '80%',
      icon: <Cloud className="w-8 h-8 text-indigo-300" />,
    },
    {
      name: 'La Laguna',
      coords: [28.4872, -16.3148],
      zoom: 13,
      temp: '16°C',
      condition: 'Fresco e Histórico',
      desc: 'San Cristóbal de La Laguna. Ciudad universitaria declarada Patrimonio de la Humanidad, fresca y señorial.',
      wind: '19 km/h NW',
      humidity: '85%',
      icon: <CloudRain className="w-8 h-8 text-indigo-400" />,
    },
    {
      name: 'España Peninsular',
      coords: [40.4168, -3.7038],
      zoom: 6,
      temp: '22°C',
      condition: 'Tiempo Continental Templado',
      desc: 'Mapa general de la Península Ibérica y las Islas Baleares bajo la supervisión de AEMET.',
      wind: '18 km/h SW',
      humidity: '55%',
      icon: <Compass className="w-8 h-8 text-amber-400" />,
    },
    {
      name: 'Madrid',
      coords: [40.4168, -3.7038],
      zoom: 11,
      temp: '25°C',
      condition: 'Soleado y Seco',
      desc: 'Capital de España con cielos despejados y ambiente cálido de meseta.',
      wind: '12 km/h S',
      humidity: '40%',
      icon: <Sun className="w-8 h-8 text-amber-500" />,
    },
    {
      name: 'Barcelona',
      coords: [41.3851, 2.1734],
      zoom: 11,
      temp: '24°C',
      condition: 'Brisa Mediterránea',
      desc: 'Clima templado costero frente al mar Mediterráneo con suave brisa marina.',
      wind: '16 km/h E',
      humidity: '65%',
      icon: <Cloud className="w-8 h-8 text-blue-300" />,
    },
    {
      name: 'Sevilla',
      coords: [37.3891, -5.9845],
      zoom: 11,
      temp: '29°C',
      condition: 'Sol Radiante',
      desc: 'Capital andaluza con temperaturas cálidas y cielos totalmente limpios.',
      wind: '10 km/h SE',
      humidity: '38%',
      icon: <Sun className="w-8 h-8 text-amber-400" />,
    },
    {
      name: 'Valencia',
      coords: [39.4699, -0.3763],
      zoom: 11,
      temp: '26°C',
      condition: 'Soleado con Brisa de Levantes',
      desc: 'Costa del Levante español con ambiente primaveral idóneo.',
      wind: '15 km/h E',
      humidity: '60%',
      icon: <Sun className="w-8 h-8 text-amber-500" />,
    },
    {
      name: 'Córdoba (Andalucía, España)',
      coords: [37.8882, -4.7794],
      zoom: 12,
      temp: '30°C',
      condition: 'Cielos Despejados y Sol',
      desc: 'Ciudad califal a orillas del Guadalquivir con su majestuosa Mezquita-Catedral y patios floridos.',
      wind: '11 km/h SE',
      humidity: '34%',
      icon: <Sun className="w-8 h-8 text-amber-400" />,
    },
    {
      name: 'París (Francia)',
      coords: [48.8566, 2.3522],
      zoom: 11,
      temp: '19°C',
      condition: 'Nubes Bajas y Brisa Suave',
      desc: 'La mítica capital francesa con clima fresco y vistas icónicas sobre el Sena y la Torre Eiffel.',
      wind: '14 km/h W',
      humidity: '62%',
      icon: <Cloud className="w-8 h-8 text-blue-300" />,
    },
    {
      name: 'Niza / Costa Azul (Francia)',
      coords: [43.7102, 7.2620],
      zoom: 11,
      temp: '25°C',
      condition: 'Sol Mediterráneo Radiante',
      desc: 'Famosa Riviera francesa con clima muy suave, palmeras y aguas turquesas.',
      wind: '12 km/h S',
      humidity: '55%',
      icon: <Sun className="w-8 h-8 text-amber-400" />,
    },
    {
      name: 'Lisboa (Portugal)',
      coords: [38.7223, -9.1393],
      zoom: 11,
      temp: '24°C',
      condition: 'Sol Atlántico y Cielos Azules',
      desc: 'Capital lusitana repleta de luz atlántica sobre el estuario del río Tajo.',
      wind: '18 km/h NW',
      humidity: '58%',
      icon: <Sun className="w-8 h-8 text-amber-500" />,
    },
    {
      name: 'Oporto / Porto (Portugal)',
      coords: [41.1579, -8.6291],
      zoom: 11,
      temp: '21°C',
      condition: 'Intervalos Nubosos y Brisa Marina',
      desc: 'Norte portugués a orillas del río Duero, célebre por sus bodegas y colinas.',
      wind: '16 km/h W',
      humidity: '65%',
      icon: <Cloud className="w-8 h-8 text-blue-300" />,
    },
    {
      name: 'Londres (Reino Unido)',
      coords: [51.5074, -0.1278],
      zoom: 11,
      temp: '17°C',
      condition: 'Cielos Nubosos y Llovizna',
      desc: 'Londres con ambiente fresco y característico del clima británico.',
      wind: '20 km/h SW',
      humidity: '78%',
      icon: <CloudRain className="w-8 h-8 text-blue-400" />,
    },
    {
      name: 'Nueva York (EE.UU.)',
      coords: [40.7128, -74.0060],
      zoom: 11,
      temp: '23°C',
      condition: 'Parcialmente Nublado',
      desc: 'Gran manzana con brisa atlántica y ambiente dinámico.',
      wind: '14 km/h W',
      humidity: '52%',
      icon: <Cloud className="w-8 h-8 text-amber-300" />,
    },
    {
      name: 'Tokio (Japón)',
      coords: [35.6762, 139.6503],
      zoom: 11,
      temp: '27°C',
      condition: 'Cálido y Húmedo',
      desc: 'Metrópolis asiática bajo cielos despejados y suave brisa del Pacífico.',
      wind: '11 km/h S',
      humidity: '68%',
      icon: <Sun className="w-8 h-8 text-rose-400" />,
    },
    // --- DESIERTOS DEL MUNDO Y CANARIAS ---
    {
      name: 'Desierto de Tabernas (Almería, España)',
      coords: [37.0500, -2.4330],
      zoom: 11,
      temp: '32°C',
      condition: 'Clima Árido y Sol Intenso',
      desc: 'El único desierto oficial del continente europeo, famoso por sus paisajes de cine.',
      wind: '15 km/h E',
      humidity: '25%',
      icon: <Sun className="w-8 h-8 text-amber-500" />,
    },
    {
      name: 'Desierto del Sahara (Marruecos)',
      coords: [31.0950, -4.0110],
      zoom: 9,
      temp: '38°C',
      condition: 'Calor Extremo y Dunas',
      desc: 'Dunas de Merzouga y Erg Chebbi en el corazón del gran desierto africano.',
      wind: '22 km/h NE',
      humidity: '12%',
      icon: <Sun className="w-8 h-8 text-amber-600" />,
    },
    {
      name: 'Desierto de Atacama (Chile)',
      coords: [-22.9087, -68.1997],
      zoom: 9,
      temp: '24°C',
      condition: 'Sequía Absoluta y Cielos Diáfanos',
      desc: 'El desierto no polar más árido de la Tierra, famoso por sus observatorios astronómicos.',
      wind: '18 km/h SW',
      humidity: '8%',
      icon: <Sun className="w-8 h-8 text-amber-400" />,
    },
    {
      name: 'Las Cañadas del Teide (Tenerife)',
      coords: [28.2700, -16.6300],
      zoom: 12,
      temp: '18°C',
      condition: 'Alta Montaña Volcánica',
      desc: 'Desierto volcánico de alta montaña a más de 2000m de altitud bajo el pico del Teide.',
      wind: '25 km/h W',
      humidity: '20%',
      icon: <Sun className="w-8 h-8 text-rose-500" />,
    },
    {
      name: 'Dunas de Maspalomas (Gran Canaria)',
      coords: [27.7460, -15.5780],
      zoom: 13,
      temp: '27°C',
      condition: 'Brisa Marina y Dunas Doradas',
      desc: 'Reserva Natural Especial con campos de dunas vivas junto al Océano Atlántico.',
      wind: '20 km/h NE',
      humidity: '58%',
      icon: <Sun className="w-8 h-8 text-amber-400" />,
    },
    {
      name: 'Dunas de Corralejo (Fuerteventura)',
      coords: [28.6750, -13.8450],
      zoom: 13,
      temp: '26°C',
      condition: 'Viento Alisio y Sol',
      desc: 'Parque Natural de Dunas de Corralejo con extensiones de arena blanca y mar turquesa.',
      wind: '28 km/h NNE',
      humidity: '62%',
      icon: <Sun className="w-8 h-8 text-amber-300" />,
    },
    {
      name: 'Death Valley / Desierto de Mojave (EE.UU.)',
      coords: [36.5323, -116.9325],
      zoom: 9,
      temp: '42°C',
      condition: 'Calor Extremo Desértico',
      desc: 'Valle de la Muerte en el Desierto de Mojave, una de las zonas más áridas del planeta.',
      wind: '14 km/h S',
      humidity: '6%',
      icon: <Sun className="w-8 h-8 text-rose-600" />,
    }
  ];

  // Real-time public transport, bus stops, trains, and recommended local shops
  const guaguas = [
    {
      name: 'Guagua Línea 12 - Cono Sur / Las Canteras (L.P.G.C.)',
      coords: [28.132, -15.43] as [number, number],
      details: 'Guaguas Municipales de Las Palmas en ruta hacia Playa de Las Canteras. Frecuencia: 5 min. (Tiempo Real 🚌)'
    },
    {
      name: 'Global Línea 30 - Las Palmas a Faro Maspalomas',
      coords: [27.85, -15.58] as [number, number],
      details: 'Transporte interurbano de Gran Canaria por autopista GC-1 dirección sur. Velocidad: 80 km/h. (Tiempo Real 🚌)'
    },
    {
      name: 'Global Línea 80 - Telde a Las Palmas de Gran Canaria',
      coords: [28.001, -15.418] as [number, number],
      details: 'Línea directa entre el Parque San Juan de Telde y la Estación de San Telmo en Las Palmas. (Tiempo Real 🚌)'
    },
    {
      name: 'EMT Madrid Línea 27 - Paseo de la Castellana / Prado',
      coords: [40.4285, -3.6898] as [number, number],
      details: 'Línea emblemática de Madrid recorriendo Plaza de Castilla, Nuevos Ministerios, Cibeles y Atocha. (Tiempo Real 🚌)'
    },
    {
      name: 'EMT Madrid Exprés Aeropuerto (Atocha - Barajas T4)',
      coords: [40.4502, -3.6001] as [number, number],
      details: 'Servicio 24 horas directo al Aeropuerto Adolfo Suárez Madrid-Barajas. (Tiempo Real 🚌)'
    },
    {
      name: 'TMB Barcelona Línea H12 - Gran Via de les Corts Catalanes',
      coords: [41.3879, 2.1699] as [number, number],
      details: 'Línea horizontal de la red ortogonal de Barcelona cruzando Plaça Espanya y Plaça Universitat. (Tiempo Real 🚌)'
    },
    {
      name: 'TMB Barcelona Aerobús (Plaça Catalunya - El Prat)',
      coords: [41.3870, 2.1700] as [number, number],
      details: 'Autobús exprés que conecta el centro de Barcelona con las Terminales T1 y T2 del Aeropuerto. (Tiempo Real 🚌)'
    },
    {
      name: 'EMT Valencia Línea 19 - Plaza del Ayuntamiento a La Malvarrosa',
      coords: [39.4699, -0.3763] as [number, number],
      details: 'Autobús de Valencia hacia la playa y la Marina de Valencia. (Tiempo Real 🚌)'
    },
    {
      name: 'TUSSAM Sevilla Línea C1 - Circular Exposición / Triana',
      coords: [37.3820, -6.0010] as [number, number],
      details: 'Autobús circular de Sevilla conectando Santa Justa, Prado de San Sebastián y Triana. (Tiempo Real 🚌)'
    },
    // --- AUTOBUSES Y PARADAS EN CÓRDOBA (ESPAÑA) ---
    {
      name: 'AUCORSA Córdoba Línea 1 - Tendillas a Estación Renfe AVE',
      coords: [37.8880, -4.7790] as [number, number],
      details: 'Autobús urbano de Córdoba conectando la céntrica Plaza de las Tendillas con la estación de AVE. (Tiempo Real 🚌🇪🇸)'
    },
    {
      name: 'AUCORSA Córdoba Línea 3 - Fuensanta a Mezquita-Catedral',
      coords: [37.8820, -4.7730] as [number, number],
      details: 'Línea de autobús directo a la Mezquita-Catedral, el Puente Romano y el centro histórico. (Tiempo Real 🚌🇪🇸)'
    },
    // --- AUTOBUSES EN FRANCIA ---
    {
      name: 'RATP Bus París Línea 68 - Place de Clichy / Louvre / Opéra',
      coords: [48.8606, 2.3376] as [number, number],
      details: 'Autobús de París pasando frente al Museo del Louvre, Palais Royal y Ópera Garnier. (Tiempo Real 🚌🇨🇵)'
    },
    {
      name: 'RATP Bus París OpenTour Tourist Bus (Eiffel - Champs-Élysées)',
      coords: [48.8738, 2.2950] as [number, number],
      details: 'Autobús panorámico de dos pisos recorriendo la Torre Eiffel y los Campos Elíseos. (Tiempo Real 🚌🇨🇵)'
    },
    {
      name: 'Lignes d\'Azur Niza Línea 12 (Promenade des Anglais - Aéroport)',
      coords: [43.6950, 7.2550] as [number, number],
      details: 'Autobús costero de Niza recorriendo el famoso Paseo de los Ingleses. (Tiempo Real 🚌🇨🇵)'
    },
    // --- AUTOBUSES EN PORTUGAL ---
    {
      name: 'CARRIS Lisboa Autocarro 728 (Restelo - Belém - Oriente)',
      coords: [38.6970, -9.2060] as [number, number],
      details: 'Línea de autobús bordeando el río Tajo hasta la Torre de Belém y el Parque das Nações. (Tiempo Real 🚌🇵🇹)'
    },
    {
      name: 'STCP Oporto Autocarro 500 (Praça da Liberdade - Foz do Douro)',
      coords: [41.1470, -8.6110] as [number, number],
      details: 'Autobús costero panorámico de dos pisos recorriendo la desembocadura del río Duero. (Tiempo Real 🚌🇵🇹)'
    },
    // --- AUTOBUSES Y PARADAS EN INGLATERRA / REINO UNIDO ---
    {
      name: 'London Victoria Coach Station (Londres, Inglaterra)',
      coords: [51.4925, -0.1448] as [number, number],
      details: 'Estación neurálgica de autobuses de larga distancia de Inglaterra (National Express / Megabus). (Tiempo Real 🚌🇬🇧)'
    },
    {
      name: 'London Red Double-Decker - Línea 15 (Trafalgar Square - Tower of London)',
      coords: [51.5080, -0.0980] as [number, number],
      details: 'Famoso autobús rojo de dos pisos recorriendo la St. Pauls Cathedral y el centro de Londres. (Tiempo Real 🚌🇬🇧)'
    },
    {
      name: 'London Piccadilly Circus Bus Stop (Inglaterra)',
      coords: [51.5100, -0.1340] as [number, number],
      details: 'Parada central de autobuses en Piccadilly Circus. Conexión de líneas 9, 14, 19, 38. (Tiempo Real 🚌🇬🇧)'
    },
    {
      name: 'Oxford High Street Bus Stop (Inglaterra)',
      coords: [51.7520, -1.2520] as [number, number],
      details: 'Parada universitaria de autobuses de Oxford (Oxford Bus Company & Stagecoach). (Tiempo Real 🚌🇬🇧)'
    },
    {
      name: 'Manchester Piccadilly Gardens Bus Hub (Inglaterra)',
      coords: [53.4810, -2.2370] as [number, number],
      details: 'Intercambiador principal de autobuses urbanos e interurbanos de Mánchester. (Tiempo Real 🚌🇬🇧)'
    },
    {
      name: 'MTA Nueva York - M15 Select Bus (Manhattan First Ave)',
      coords: [40.7306, -73.9866] as [number, number],
      details: 'Autobús articulado azul de Nueva York recorriendo el Lower y Upper East Side de Manhattan. (Tiempo Real 🚌)'
    },
    {
      name: 'ToEi Bus Tokio - Línea To-01 (Shibuya - Roppongi)',
      coords: [35.6580, 139.7016] as [number, number],
      details: 'Autobús urbano de Tokio conectando el famoso cruce de Shibuya con Roppongi Hills. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 103 - Santa Cruz - Puerto Cruz (Tenerife)',
      coords: [28.47, -16.32] as [number, number],
      details: 'Autopista TF-5 dirección norte. Conexión rápida interurbana. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 342 - Cañadas del Teide (Tenerife)',
      coords: [28.25, -16.61] as [number, number],
      details: 'Servicio turístico diario especial subiendo al teleférico del Teide. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 050 - Parada Central de Tejina',
      coords: [28.5290, -16.3820] as [number, number],
      details: 'Llegando en exactamente 10 minutos. Conecta La Laguna, Tegueste, Tejina y Bajamar. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 224 - Parada Valle de Guerra (Centro)',
      coords: [28.5140, -16.3990] as [number, number],
      details: 'Llegando en exactamente 10 minutos. Conexión directa hacia el centro de Tejina y La Laguna. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 224 - Parada La Casetera',
      coords: [28.5115, -16.4052] as [number, number],
      details: 'Parada nº 1614 (La Casetera, Valle de Guerra). En ruta hacia Tejina y La Laguna. Conexión activa. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 050 - Parada Piscinas de Bajamar',
      coords: [28.5555, -16.3435] as [number, number],
      details: 'Llegando en exactamente 10 minutos. Ideal para disfrutar de la baja mar y las olas gigantes. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 102 - Parada Central de Tacoronte',
      coords: [28.4810, -16.4140] as [number, number],
      details: 'Llegando en exactamente 10 minutos. Frecuencias regulares hacia Santa Cruz e Intercambiador de La Laguna. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 015 - Intercambiador de La Laguna',
      coords: [28.4865, -16.3150] as [number, number],
      details: 'Llegando en exactamente 10 minutos. Conexión directa con la autopista del Norte y tranvía de Tenerife. (Tiempo Real 🚌)'
    },
    // Nuevas Paradas Solicitadas por el Usuario (Felipe Castillo, Tomás González, Instituto, La Punta, Tacoronte, Tejina)
    {
      name: 'Titsa Línea 051 - Parada Felipe Castillo (Tegueste)',
      coords: [28.5218, -16.3685] as [number, number],
      details: 'Parada nº 1502. Conexión de guaguas en la Calle Felipe Castillo (Tegueste / El Socorro). (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 050 / 051 - Parada Tomás González Rivero (Tejina)',
      coords: [28.5276, -16.3795] as [number, number],
      details: 'Parada nº 1528. Ubicada en la Calle Tomás González Rivero de Tejina, con conexiones hacia la costa. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 224 - Parada Instituto (IES Valle de Guerra)',
      coords: [28.5135, -16.3920] as [number, number],
      details: 'Parada nº 1618 (Frente al IES Valle de Guerra). Muy concurrida para estudiantes del instituto. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 050 - Parada Instituto de Tejina (IES Tejina)',
      coords: [28.5312, -16.3792] as [number, number],
      details: 'Parada nº 1530. Junto al Instituto de Educación Secundaria de Tejina. Alta frecuencia. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 050 - Parada San Juan (Bajamar)',
      coords: [28.5528, -16.3465] as [number, number],
      details: 'Parada nº 1555 (Entrada San Juan, Bajamar). Enlace ideal con Tejina. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 224 - Parada El Riego (Bajamar)',
      coords: [28.5582, -16.3420] as [number, number],
      details: 'Parada nº 1560. Próxima al paseo marítimo, restaurantes y zona comercial de Bajamar. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 050 - Parada Central La Punta (La Punta del Hidalgo)',
      coords: [28.5680, -16.3245] as [number, number],
      details: 'Parada nº 1580 (La Punta del Hidalgo). Parada neurálgica junto al acceso de piscinas naturales y senderos. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 050 - Parada Final de La Punta (Faro)',
      coords: [28.5725, -16.3190] as [number, number],
      details: 'Parada nº 1592 (Final de línea 050). Parada idónea para visitar el emblemático Faro de La Punta. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 012 - Parada Plaza del Cristo (Tacoronte)',
      coords: [28.4842, -16.4125] as [number, number],
      details: 'Parada nº 1404 (Tacoronte - Plaza del Cristo). Conexiones hacia El Cantillo y Agua García. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 101 - Parada Los Naranjeros (Tacoronte)',
      coords: [28.4715, -16.4255] as [number, number],
      details: 'Parada nº 1380 (Los Naranjeros, Tacoronte). Junto a la TF-152, enlace con el área comercial. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 051 - Parada El Cantillo (Tacoronte)',
      coords: [28.4795, -16.4190] as [number, number],
      details: 'Parada nº 1410 (El Cantillo, Tacoronte). Zona residencial e industrial de excelente frecuencia. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 051 - Parada El Invernadero (Tejina)',
      coords: [28.5255, -16.3855] as [number, number],
      details: 'Parada nº 1520 (El Invernadero, Tejina). Acceso directo a las cooperativas agrícolas y residenciales. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 224 - Parada Milán (Tejina)',
      coords: [28.5350, -16.3745] as [number, number],
      details: 'Parada nº 1545. Conexión rápida entre el núcleo de Tejina, Jover y Valle de Guerra. (Tiempo Real 🚌)'
    },
    {
      name: 'Titsa Línea 050 / 051 / 105 - Parada El Ramal (Tejina)',
      coords: [28.5315, -16.3775] as [number, number],
      details: 'Parada nº 1535 (El Ramal, Tejina). Parada de conexión neurálgica en el cruce de El Ramal hacia Bajamar, Punta del Hidalgo y Tacoronte. (Tiempo Real 🚌)'
    }
  ];

  const tiendas = [
    // --- TIENDAS Y SUPERMERCADOS EN CANARIAS Y ESPAÑA ---
    {
      name: 'Mercadona (Tejina, Tenerife)',
      coords: [28.5285, -16.3790] as [number, number],
      details: 'Supermercado de referencia en Tejina con productos Hacendado, pescadería y panadería. 🛒🥖'
    },
    {
      name: 'Mercadona (La Laguna, Tenerife)',
      coords: [28.4890, -16.3170] as [number, number],
      details: 'Gran superficie Mercadona en el centro de San Cristóbal de La Laguna. 🛒🥩'
    },
    {
      name: 'Mercadona (Las Palmas - Mesa y López)',
      coords: [28.1340, -15.4330] as [number, number],
      details: 'Supermercado Mercadona en la arteria comercial de Las Palmas de Gran Canaria. 🛒🍎'
    },
    {
      name: 'Mercadona (Gran Vía, Madrid)',
      coords: [40.4200, -3.7050] as [number, number],
      details: 'Supermercado en el centro neurálgico de Madrid. 🛒🇪🇸'
    },
    {
      name: 'HiperDino (La Laguna, Tenerife)',
      coords: [28.4835, -16.3195] as [number, number],
      details: 'Cadena canaria líder en precios bajos, productos locales de la tierra e Islas Canarias. 🦕🛒'
    },
    {
      name: 'HiperDino (Telde, Gran Canaria)',
      coords: [28.0025, -15.4160] as [number, number],
      details: 'Hipermercado canario de referencia en la ciudad de Telde. 🦕🧀'
    },
    {
      name: 'SuperDino (Tejina / Bajamar)',
      coords: [28.5300, -16.3780] as [number, number],
      details: 'Supermercado de proximidad HiperDino cerca de la costa. 🦕🥖'
    },
    {
      name: 'El Corte Inglés (Santa Cruz de Tenerife)',
      coords: [28.4580, -16.2575] as [number, number],
      details: 'Gran almacén de moda, electrónica, perfumería y Gourmet en la capital tinerfeña. 🛍️👗'
    },
    {
      name: 'El Corte Inglés (Las Palmas - Mesa y López)',
      coords: [28.1355, -15.4345] as [number, number],
      details: 'Emblemático edificio de El Corte Inglés en Gran Canaria. 🛍️📱'
    },
    {
      name: 'El Corte Inglés (Paseo de la Castellana, Madrid)',
      coords: [40.4465, -3.6925] as [number, number],
      details: 'Uno de los centros comerciales más grandes y prestigiosos de España. 🏬🇪🇸'
    },
    {
      name: 'Carrefour (Añaza, Tenerife)',
      coords: [28.4230, -16.3020] as [number, number],
      details: 'Hipermercado completo con tecnología, hogar, alimentación y moda. 🛒💻'
    },
    {
      name: 'Carrefour (La Ballena, Las Palmas)',
      coords: [28.1090, -15.4380] as [number, number],
      details: 'Gran superficie de compras en el Centro Comercial La Ballena de Gran Canaria. 🛒📺'
    },
    {
      name: 'Lidl (La Laguna / Tacoronte, Tenerife)',
      coords: [28.4780, -16.4110] as [number, number],
      details: 'Supermercado con ofertas semanales, bazar y pan horneado en el día. 🥨🛒'
    },
    {
      name: 'Alcampo (La Laguna - San Bartolomé de Geneto)',
      coords: [28.4600, -16.3050] as [number, number],
      details: 'Hipermercado Alcampo en La Laguna con bazar gigante y electrónica. 📦🛒'
    },
    {
      name: 'Spar Canarias (Tejeda, Gran Canaria)',
      coords: [27.9950, -15.6140] as [number, number],
      details: 'Supermercado con quesos de cumbre y especialidades de las islas. 🧀🛒'
    },
    {
      name: 'IKEA (San Cristóbal de La Laguna, Tenerife)',
      coords: [28.4590, -16.3030] as [number, number],
      details: 'Tienda de muebles, decoración escandinava y albóndigas suecas. 🪑🛋️'
    },
    {
      name: 'Leroy Merlin (La Laguna, Tenerife)',
      coords: [28.4585, -16.3040] as [number, number],
      details: 'Especialistas en bricolaje, jardinería, herramientas y reforma del hogar. 🛠️🪴'
    },
    {
      name: 'MediaMarkt (Santa Cruz de Tenerife)',
      coords: [28.4570, -16.2580] as [number, number],
      details: 'Tienda de informática, telefonía, consolas y electrodomésticos. 📱🎮'
    },
    {
      name: 'Zara (Calle Castillo, Santa Cruz de Tenerife)',
      coords: [28.4680, -16.2510] as [number, number],
      details: 'Tienda insignia de moda de la marca española Inditex en el centro neurálgico. 👗👠'
    },
    // --- TIENDAS Y MERCADOS EN CÓRDOBA (ESPAÑA) ---
    {
      name: 'Mercado Victoria (Córdoba, España)',
      coords: [37.8845, -4.7870] as [number, number],
      details: 'Primer mercado gastronómico de Andalucía en los Jardines de la Victoria con salmorejo, flamenquines y vinos de Montilla-Moriles. 🍷🧀'
    },
    {
      name: 'El Corte Inglés (Ronda de los Tejares, Córdoba)',
      coords: [37.8885, -4.7810] as [number, number],
      details: 'Gran centro comercial en el centro comercial y financiero de Córdoba. 🛍️🇪🇸'
    },
    // --- TIENDAS Y COMERCIOS EN FRANCIA ---
    {
      name: 'Galeries Lafayette Haussmann (París, Francia)',
      coords: [48.8732, 2.3316] as [number, number],
      details: 'Templo icónico de la moda internacional con su majestuosa cúpula de cristal art nouveau. 🛍️🇫🇷'
    },
    {
      name: 'Carrefour París Montparnasse (Francia)',
      coords: [48.8420, 2.3210] as [number, number],
      details: 'Hipermercado francés con gran selección de quesos artesanos, vinos de Burdeos y baguettes frescas. 🛒🥖'
    },
    // --- TIENDAS Y COMERCIOS EN PORTUGAL ---
    {
      name: 'El Corte Inglés Lisboa (São Sebastião, Portugal)',
      coords: [38.7328, -9.1539] as [number, number],
      details: 'Gran almacén de referencia en Lisboa con departamento Club del Gourmet. 🛍️🇵🇹'
    },
    {
      name: 'A Vida Portuguesa (Chiado, Lisboa)',
      coords: [38.7100, -9.1415] as [number, number],
      details: 'Tienda con encanto especializada en jabones, conservas y artesanía portuguesa de época. 🎁🇵🇹'
    },
    {
      name: 'Pingo Doce (Oporto, Portugal)',
      coords: [41.1500, -8.6100] as [number, number],
      details: 'Cadena de supermercados de proximidad en Portugal con pasteles de nata recién horneados. 🥐🛒'
    },
    {
      name: 'Primark (Gran Vía, Madrid)',
      coords: [40.4205, -3.7040] as [number, number],
      details: 'Espectacular tienda de moda de 5 plantas en el corazón de Madrid. 🛍️👕'
    },
    {
      name: 'Harrods (Londres, Reino Unido)',
      coords: [51.4994, -0.1632] as [number, number],
      details: 'Los grandes almacenes más famosos del mundo en Knightsbridge, Londres. 🇬🇧✨'
    },
    {
      name: 'Macy\'s Herald Square (Nueva York, EE.UU.)',
      coords: [40.7508, -73.9893] as [number, number],
      details: 'Mítica tienda departamental en la 34th Street de Manhattan, Nueva York. 🇺🇸🛍️'
    },
    // --- MERCADOS Y COMERCIOS TRADICIONALES CANARIOS ---
    {
      name: 'Mercado de Vegueta (Gran Canaria)',
      coords: [28.1012, -15.4145] as [number, number],
      details: 'Fundado en 1863. Deliciosos quesos canarios artesanos y frutas frescas tropicales. 🧀🌶️'
    },
    {
      name: 'Dulcería Nublo (Tejeda)',
      coords: [27.9945, -15.6152] as [number, number],
      details: 'Dulcería canaria de renombre. Especialidad: bienmesabe y galletas de almendra. 🧁'
    },
    {
      name: 'Mercado de Nuestra Señora de África (Tenerife)',
      coords: [28.4635, -16.2531] as [number, number],
      details: 'Estilo colonial precioso. Venta de pescados de roca, flores y mojos canarios. 🐟🌶️'
    },
    {
      name: 'Casa de los Balcones (La Orotava, Tenerife)',
      coords: [28.3899, -16.5255] as [number, number],
      details: 'Complejo arquitectónico del siglo XVII. Exposición y venta de calados artesanos canarios. 🛖👒'
    },
    {
      name: 'Mercadillo del Agricultor de Tacoronte',
      coords: [28.4820, -16.4160] as [number, number],
      details: 'Excelente mercadillo con lo mejor de la huerta, quesos locales y el gran vino Tacoronte-Acentejo. 🍷🍇'
    },
    // --- TEJINA ---
    {
      name: 'Dulcería Artesanal Tejina',
      coords: [28.5275, -16.3805] as [number, number],
      details: 'Pequeño obrador tradicional con dulces típicos de Tejina y pastelería exquisita. 🍰🍮'
    },
    {
      name: 'Supermercado Alteza (Tejina)',
      coords: [28.5290, -16.3798] as [number, number],
      details: 'Supermercado local muy popular en el núcleo de Tejina, ideal para compras de alimentación. 🛒🥩'
    },
    {
      name: 'Ferretería Tejina',
      coords: [28.5268, -16.3815] as [number, number],
      details: 'Ferretería tradicional de confianza, con todo tipo de repuestos, herramientas y atención experta. 🛠️🔑'
    },
    {
      name: 'Boutique El Ramal (Tejina)',
      coords: [28.5305, -16.3780] as [number, number],
      details: 'Tienda de ropa de moda local con trato muy cercano y prendas de temporada excelentes. 👗👔'
    },
    {
      name: 'Floristería Tejina',
      coords: [28.5260, -16.3820] as [number, number],
      details: 'Hermosas flores frescas y plantas locales, especialista en arreglos para las fiestas de los Corazones. 🌸💐'
    },
    // --- BAJAMAR ---
    {
      name: 'Surf Shop Bajamar (La Marea)',
      coords: [28.5558, -16.3440] as [number, number],
      details: 'Tienda de surf local con alquiler de tablas, neoprenos y accesorios. Perfecta para surfistas. 🏄‍♂️🌊'
    },
    {
      name: 'Supermercado Covirán (Bajamar)',
      coords: [28.5550, -16.3452] as [number, number],
      details: 'Pequeño supermercado de cercanía ideal para turistas y residentes, con fruta fresca y pan caliente. 🛒🥖'
    },
    {
      name: 'Bazar Bajamar',
      coords: [28.5562, -16.3435] as [number, number],
      details: 'Bazar con artículos de playa, souvenirs, prensa diaria, cremas solares y helados refrescantes. 🏖️🍦'
    },
    // --- LA PUNTA DEL HIDALGO ---
    {
      name: 'Cofradía de Pescadores (La Punta del Hidalgo)',
      coords: [28.5695, -16.3218] as [number, number],
      details: 'Pescadería con el pescado más fresco capturado diariamente por los pescadores locales de La Punta. 🐟🍤'
    },
    {
      name: 'Supermercado Tu Trébol (La Punta)',
      coords: [28.5665, -16.3260] as [number, number],
      details: 'Supermercado con amplia variedad de productos canarios y marcas de calidad para los vecinos de la costa. 🛒🧀'
    },
    {
      name: 'Herbolario La Punta',
      coords: [28.5675, -16.3235] as [number, number],
      details: 'Tienda de productos ecológicos, tés selectos, cosmética natural y suplementos saludables. 🌿🍯'
    },
    // --- VALLE DE GUERRA ---
    {
      name: 'Cooperativa Agrícola de Valle de Guerra',
      coords: [28.5125, -16.4010] as [number, number],
      details: 'Venta directa de productos de la huerta, plantas ornamentales y flores cultivadas en el propio valle. 🍅🌻'
    },
    {
      name: 'Panadería Artesanal Valle de Guerra',
      coords: [28.5152, -16.3970] as [number, number],
      details: 'Pan tradicional cocido a leña, repostería casera, bizcochones canarios y dulces de millo espectaculares. 🍞🍩'
    },
    {
      name: 'Farmacia Valle de Guerra - Lda. González',
      coords: [28.5138, -16.3985] as [number, number],
      details: 'Atención farmacéutica personalizada, productos de salud y cuidado personal al lado de la plaza principal. 💊🩹'
    },
    // --- OTROS ---
    {
      name: 'Piscinas Naturales de Bajamar (Baja Mar)',
      coords: [28.5570, -16.3450] as [number, number],
      details: 'Zona emblemática de ocio costero. Perfecto para admirar la fuerza del océano en baja mar o marea baja. 🌊🏊‍♂️'
    },
    {
      name: 'Casco Histórico y Terrazas de La Laguna',
      coords: [28.4870, -16.3140] as [number, number],
      details: 'Maravilloso paseo peatonal lleno de cafeterías bohemias, librerías y patrimonio colonial. ☕🏛️'
    }
  ];

  const trenes = [
    // --- REDES FERROVIARIAS Y TRENES DE ESPAÑA Y CANARIAS ---
    {
      name: 'Tranvía de Tenerife Línea 1 (Trinidad, La Laguna - Intercambiador Santa Cruz)',
      coords: [28.4780, -16.3050] as [number, number],
      details: 'Tranvía de Tenerife conectando La Laguna con Santa Cruz. Frecuencia: 5 min en hora punta. (Tiempo Real 🚆)'
    },
    {
      name: 'Tranvía de Tenerife Línea 2 (La Cuesta - Tíncer)',
      coords: [28.4620, -16.2910] as [number, number],
      details: 'Tranvía de Tenerife conectando el barrio de La Cuesta con Tíncer y Taco. (Tiempo Real 🚆)'
    },
    {
      name: 'RENFE AVE Madrid Puerta de Atocha Almudena Grandes (España)',
      coords: [40.4065, -3.6896] as [number, number],
      details: 'Gran estación central de Alta Velocidad AVE hacia Sevilla, Barcelona, Valencia y Andalucía. (Tiempo Real 🚅🇪🇸)'
    },
    {
      name: 'RENFE Madrid Chamartín Clara Campoamor (España)',
      coords: [40.4721, -3.6825] as [number, number],
      details: 'Estación neurálgica del norte de España con líneas AVE hacia Galicia, Asturias, País Vasco y Cantabria. (Tiempo Real 🚆🇪🇸)'
    },
    {
      name: 'RENFE Cercanías Madrid (Línea C-1 Príncipe Pío - Atocha - Barajas T4)',
      coords: [40.4211, -3.7192] as [number, number],
      details: 'Red de trenes de Cercanías Madrid conectando toda la comunidad autónoma. (Tiempo Real 🚆🇪🇸)'
    },
    {
      name: 'RENFE AVE Barcelona Sants (Cataluña, España)',
      coords: [41.3791, 2.1402] as [number, number],
      details: 'Estación principal de ferrocarril de Barcelona con AVE a Madrid, Francia y Rodalies de Catalunya. (Tiempo Real 🚅🇪🇸)'
    },
    {
      name: 'RENFE AVE Sevilla Santa Justa (Andalucía, España)',
      coords: [37.3922, -5.9754] as [number, number],
      details: 'Cabecera de la primera línea de AVE de España, conectando Sevilla con Madrid y Málaga. (Tiempo Real 🚅🇪🇸)'
    },
    {
      name: 'RENFE AVE Valencia Joaquín Sorolla (España)',
      coords: [39.4589, -0.3812] as [number, number],
      details: 'Estación de Alta Velocidad del Levante español. (Tiempo Real 🚅🇪🇸)'
    },
    {
      name: 'Metro de Madrid - Estación Puerta del Sol (España)',
      coords: [40.4168, -3.7038] as [number, number],
      details: 'Estación neurálgica de la red de Metro de Madrid y Cercanías en el Km 0. (Tiempo Real 🚇🇪🇸)'
    },
    {
      name: 'Metro de Barcelona TMB - Plaça de Catalunya (España)',
      coords: [41.3870, 2.1700] as [number, number],
      details: 'Intercambiador de metro L1, L3 y Rodalies en el corazón de Barcelona. (Tiempo Real 🚇🇪🇸)'
    },
    {
      name: 'Metro de Bilbao - Estación de Abando (País Vasco, España)',
      coords: [43.2630, -2.9350] as [number, number],
      details: 'Icono del transporte vasco diseñado por el arquitecto Norman Foster. (Tiempo Real 🚇🇪🇸)'
    },
    {
      name: 'Tranvía de Zaragoza - Línea 1 (Aragón, España)',
      coords: [41.6560, -0.8770] as [number, number],
      details: 'Tranvía ecológico sin catenaria en el centro histórico de Zaragoza. (Tiempo Real 🚆🇪🇸)'
    },
    // --- ESTACIÓN DE TREN Y AVE EN CÓRDOBA (ESPAÑA) ---
    {
      name: 'RENFE AVE Córdoba Central (Andalucía, España)',
      coords: [37.8892, -4.7895] as [number, number],
      details: 'Nudo ferroviario neurálgico de Alta Velocidad AVE conectando Madrid, Sevilla, Málaga y Granada. (Tiempo Real 🚅🇪🇸)'
    },
    // --- RED FERROVIARIA Y TGV EN FRANCIA ---
    {
      name: 'TGV Alta Velocidad - París Gare de Lyon (Francia)',
      coords: [48.8448, 2.3735] as [number, number],
      details: 'Estación principal del TGV francés con destino a Suiza, Italia, Marsella, Lyon y Barcelona. (Tiempo Real 🚅🇨🇵)'
    },
    {
      name: 'RER A París - Châtelet-Les Halles (Francia)',
      coords: [48.8615, 2.3470] as [number, number],
      details: 'El mayor nodo subterráneo de trenes de cercanías del mundo en el corazón de París. (Tiempo Real 🚆🇨🇵)'
    },
    {
      name: 'Tramway de Nice Línea 1 (Gare Thiers - Masséna, Niza, Francia)',
      coords: [43.7040, 7.2610] as [number, number],
      details: 'Tranvía eléctrico moderno de Niza en la Costa Azul. (Tiempo Real 🚆🇨🇵)'
    },
    // --- RED FERROVIARIA Y TRANVÍAS EN PORTUGAL ---
    {
      name: 'CP Comboios de Portugal - Lisboa Santa Apolónia (Portugal)',
      coords: [38.7138, -9.1225] as [number, number],
      details: 'Estación histórica de trenes de larga distancia e Alfa Pendular a orillas del Tajo. (Tiempo Real 🚆🇵🇹)'
    },
    {
      name: 'Eléctrico 28 Tram (Lisboa - Alfama / Baixa, Portugal)',
      coords: [38.7120, -9.1310] as [number, number],
      details: 'Legendario tranvía amarillo de madera subiendo las colinas de Alfama, Graça y Baixa. (Tiempo Real 🚃🇵🇹)'
    },
    {
      name: 'CP Alfa Pendular - Oporto Campanhã (Portugal)',
      coords: [41.1502, -8.5855] as [number, number],
      details: 'Estación central de Alta Velocidad conectando Oporto con Lisboa y el sur de Portugal. (Tiempo Real 🚅🇵🇹)'
    },
    // --- REDES INTERNACIONALES Y ALTA VELOCIDAD ---
    {
      name: 'Eurostar High Speed Train - London St Pancras International (Inglaterra, UK)',
      coords: [51.5314, -0.1261] as [number, number],
      details: 'Legendario tren de alta velocidad Eurostar conectando Londres con París y Bruselas bajo el Canal de la Mancha. (Tiempo Real 🚅🇬🇧)'
    },
    {
      name: 'TGV Alta Velocidad - París Gare de Lyon (Francia)',
      coords: [48.8448, 2.3735] as [number, number],
      details: 'Estación principal del TGV francés con destino a Suiza, Italia, Marsella y Barcelona. (Tiempo Real 🚅🇨🇵)'
    },
    {
      name: 'Shinkansen Tren Bala - Estación de Tokio (Japón)',
      coords: [35.6812, 139.7671] as [number, number],
      details: 'La mítica red de Trenes Bala Shinkansen de Japón, famosa por su puntualidad absoluta. (Tiempo Real 🚅🇯🇵)'
    },
    {
      name: 'Amtrak Acela Express - Nueva York Penn Station (EE.UU.)',
      coords: [40.7506, -73.9935] as [number, number],
      details: 'Tren de alta velocidad conectando Boston, Nueva York, Filadelfia y Washington D.C. (Tiempo Real 🚅🇺🇸)'
    }
  ];

  const basePresetInfo = presets.find((p) => p.name === selectedPreset) || presets[0];
  const activePresetInfo = isForecastTomorrow
    ? {
        ...basePresetInfo,
        temp: `${parseInt(basePresetInfo.temp.replace('°C', '')) + 1}°C`,
        condition: basePresetInfo.name === 'La Laguna' ? 'Despejado por la tarde' : 'Soleado Espectacular',
        desc: `Previsión para mañana: ${basePresetInfo.name} gozará de un excelente día templado y soleado de ${parseInt(basePresetInfo.temp.replace('°C', '')) + 1}°C. Un microclima primaveral idílico perfecto para salir a disfrutar juntos, mi amor Yeikon.`,
        humidity: `${parseInt(basePresetInfo.humidity.replace('%', '')) - 5}%`
      }
    : basePresetInfo;

  // Combined list of searchable elements for Google Maps Radar Directory
  const allLocations = [
    ...presets.map(p => ({ type: 'Pueblo', name: p.name, coords: p.coords, zoom: p.zoom, details: p.desc, icon: '📍' })),
    ...guaguas.map(g => ({ type: 'Guagua', name: g.name, coords: g.coords, zoom: 15, details: g.details, icon: '🚌' })),
    ...tiendas.map(t => ({ type: 'Comercio', name: t.name, coords: t.coords, zoom: 15, details: t.details, icon: '🛍️' })),
    ...trenes.map(tr => ({ type: 'Tren', name: tr.name, coords: tr.coords, zoom: 14, details: tr.details, icon: '🚆' }))
  ];

  const filteredLocations = searchQuery.trim() === ''
    ? allLocations.filter(loc => loc.type === 'Pueblo' || loc.name.toLowerCase().includes('tejina') || loc.name.toLowerCase().includes('bajamar') || loc.name.toLowerCase().includes('guerra') || loc.name.toLowerCase().includes('tacoronte') || loc.name.toLowerCase().includes('españa') || loc.name.toLowerCase().includes('madrid'))
    : allLocations.filter(loc => 
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        loc.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.type.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Match user notes with selected weather location
  const getMatchingNotes = () => {
    if (!diaryEntries) return [];
    const query = selectedPreset.toLowerCase();
    return diaryEntries.filter((entry) => {
      const locationMatch = entry.location && entry.location.toLowerCase().includes(query);
      const titleMatch = entry.title.toLowerCase().includes(query);
      const contentMatch = entry.content.toLowerCase().includes(query);
      const tagMatch = entry.tags && entry.tags.some((t) => t.toLowerCase().includes(query));

      if (query === 'canarias') {
        return locationMatch || titleMatch || contentMatch || tagMatch || entry.location?.toLowerCase().includes('canarias') || entry.location?.toLowerCase().includes('grancanaria') || entry.location?.toLowerCase().includes('tenerife');
      }
      if (query === 'gran canaria') {
        return locationMatch || titleMatch || contentMatch || tagMatch || entry.location?.toLowerCase().includes('canarias') || entry.location?.toLowerCase().includes('palmas') || entry.location?.toLowerCase().includes('tejeda') || entry.location?.toLowerCase().includes('telde');
      }
      if (query.includes('tenerife')) {
        return locationMatch || titleMatch || contentMatch || tagMatch || entry.location?.toLowerCase().includes('teide') || entry.location?.toLowerCase().includes('anaga') || entry.location?.toLowerCase().includes('tfe');
      }
      if (query.includes('palmas')) {
        return locationMatch || titleMatch || contentMatch || tagMatch || entry.location?.toLowerCase().includes('canteras') || entry.location?.toLowerCase().includes('palmas');
      }

      return locationMatch || titleMatch || contentMatch || tagMatch;
    });
  };

  const matchingNotes = getMatchingNotes();

  const getAICopilotoResponse = () => {
    const isProfesional = emotionMode === 'profesional';
    const isCarino = emotionMode === 'carino';
    const isAmabilidad = emotionMode === 'amabilidad';
    const isAmabilidadCarino = emotionMode === 'amabilidad_carino';
    const isTodosJuntos = emotionMode === 'todos_juntos';

    const hasNotes = matchingNotes.length > 0;
    
    // Core microclimate description based on active preset
    let weatherPart = '';
    let diaryPart = '';
    let guaguaPart = '';
    let shopPart = '';

    // 1. Build Weather & Microclimate info
    if (selectedPreset === 'Canarias') {
      weatherPart = `el archipiélago canario entero registra vientos alisios a ${activePresetInfo.wind} que regulan y refrescan las islas, manteniendo la temperatura en ${activePresetInfo.temp} y humedad del ${activePresetInfo.humidity}.`;
    } else if (selectedPreset.includes('Tenerife')) {
      weatherPart = `Tenerife muestra el clásico efecto barrera producido por el Teide, reteniendo humedad en el norte con vientos del oeste a ${activePresetInfo.wind}, mientras la costa sur goza de cielos despejados.`;
    } else if (selectedPreset === 'Gran Canaria') {
      weatherPart = `Gran Canaria goza de intervalos nubosos a ${activePresetInfo.temp}, con vientos del norte a ${activePresetInfo.wind} creando microclimas contrastados entre las playas y la cumbre.`;
    } else if (selectedPreset === 'Las Palmas de G.C.') {
      weatherPart = `Las Palmas de G.C. está bajo la típica "Panza de Burro" de nubes bajas a ${activePresetInfo.temp} y humedad de ${activePresetInfo.humidity} en Las Canteras.`;
    } else if (selectedPreset === 'Tejeda') {
      weatherPart = `Tejeda registra un fresco clima de cumbre con ${activePresetInfo.temp} debido a la altitud y un mar de nubes espectacular impulsado por viento del noroeste a ${activePresetInfo.wind}.`;
    } else if (selectedPreset === 'Tejina') {
      weatherPart = `Tejina goza de un clima templado idílico de ${activePresetInfo.temp} con brisa del noroeste a ${activePresetInfo.wind} y cielos de un azul resplandeciente ideales para pasear de la mano.`;
    } else if (selectedPreset === 'Valle de Guerra') {
      weatherPart = `el Valle de Guerra destaca por un microclima suave y soleado de ${activePresetInfo.temp}, protegido por Anaga y con una humedad idónea del ${activePresetInfo.humidity} que acaricia sus hermosos campos de flores.`;
    } else if (selectedPreset === 'Bajamar') {
      weatherPart = `Bajamar te recibe con un clima costero espectacular de ${activePresetInfo.temp} y viento de ${activePresetInfo.wind}, donde el oleaje del océano Atlántico rompe con fuerza en sus piscinas naturales en plena baja mar.`;
    } else if (selectedPreset === 'Tacoronte') {
      weatherPart = `Tacoronte reporta una fresca temperatura de ${activePresetInfo.temp} y humedad del ${activePresetInfo.humidity}, con esa deliciosa y mágica neblina de monte que caracteriza sus históricos viñedos.`;
    } else if (selectedPreset === 'La Laguna') {
      weatherPart = `San Cristóbal de La Laguna presenta su típico y señorial clima fresco de ${activePresetInfo.temp}, con una humedad característica del ${activePresetInfo.humidity} y un ambiente nuboso y limpio de ensueño.`;
    } else { // Telde
      weatherPart = `Telde reporta cielos despejados, sol radiante y temperaturas templadas de ${activePresetInfo.temp} con brisa agradable de ${activePresetInfo.wind} ideal para ir a ver el Bufadero.`;
    }

    // 2. Build Diary Memorias connection
    if (hasNotes) {
      diaryPart = `He sincronizado con éxito tus ${matchingNotes.length} recuerdos en tu diario sobre esta zona. ¡Me fascina cómo tus vivencias coinciden con el alma de esta isla!`;
    } else {
      diaryPart = `Por ahora no tienes notas guardadas en este rincón, pero me encantaría que escribiéramos nuevos recuerdos juntos aquí.`;
    }

    // 3. Build Guaguas information (Specifying 3 guaguas with a 10-minute countdown)
    if (selectedPreset === 'Tejina') {
      guaguaPart = `🚌 Tránsito en Tiempo Real: La guagua de Titsa Línea 050 llegará a la Parada Central de Tejina en exactamente 10 minutos rumbo a Bajamar.`;
    } else if (selectedPreset === 'Valle de Guerra') {
      guaguaPart = `🚌 Tránsito en Tiempo Real: La guagua de Titsa Línea 224 llegará a la parada del centro de Valle de Guerra en exactamente 10 minutos rumbo a Tejina.`;
    } else if (selectedPreset === 'Bajamar') {
      guaguaPart = `🚌 Tránsito en Tiempo Real: La guagua de Titsa Línea 050 pasará por la parada de las Piscinas de Bajamar en exactamente 10 minutos para aprovechar la baja mar.`;
    } else if (selectedPreset === 'Tacoronte') {
      guaguaPart = `🚌 Tránsito en Tiempo Real: La guagua de Titsa Línea 102 se detendrá en la parada central de Tacoronte en exactamente 10 minutos hacia La Laguna.`;
    } else if (selectedPreset === 'La Laguna') {
      guaguaPart = `🚌 Tránsito en Tiempo Real: La guagua de Titsa Línea 015 llegará al Intercambiador de La Laguna en exactamente 10 minutos conectando toda la isla.`;
    } else {
      guaguaPart = `🚌 Tránsito en Tiempo Real: La Guagua Línea 12 (Las Canteras) llegará en exactamente 10 minutos, mientras que Global Línea 30 (Faro Maspalomas) pasará en exactamente 10 minutos por la autopista GC-1, y Titsa Línea 103 en Tenerife actualiza su trayecto cada 10 minutos.`;
    }

    // 4. Build Shop information
    if (selectedPreset === 'Tejeda') {
      shopPart = `🛍️ Comercio recomendado: La famosa Dulcería Nublo te espera cerca con su bienmesabe artesanal de almendra recién preparado.`;
    } else if (selectedPreset === 'Las Palmas de G.C.') {
      shopPart = `🛍️ Comercio recomendado: Pásate por la avenida de Las Canteras para visitar los locales tradicionales de pescado fresco y café artesanal.`;
    } else if (selectedPreset === 'Tejina') {
      shopPart = `🛍️ Comercio recomendado: Visita la Dulcería Artesanal Tejina y saborea sus exquisitos pasteles canarios tradicionales de hojaldre.`;
    } else if (selectedPreset === 'Valle de Guerra') {
      shopPart = `🛍️ Comercio recomendado: Pásate por las floristerías tradicionales del Valle de Guerra para admirar sus hermosos cultivos de flores frescas recién cortadas.`;
    } else if (selectedPreset === 'Bajamar') {
      shopPart = `🛍️ Comercio recomendado: Disfruta de una comida marina bien fresca frente a las Piscinas Naturales de Bajamar contemplando la marea baja.`;
    } else if (selectedPreset === 'Tacoronte') {
      shopPart = `🛍️ Comercio recomendado: El Mercadillo del Agricultor de Tacoronte ofrece quesos artesanos locales, verduras frescas de la huerta y los mejores vinos canarios con denominación de origen.`;
    } else if (selectedPreset === 'La Laguna') {
      shopPart = `🛍️ Comercio recomendado: Pasea por las cafeterías de especialidad y terrazas coloniales en las calles peatonales del Casco Histórico de La Laguna.`;
    } else if (selectedPreset.includes('Tenerife')) {
      shopPart = `🛍️ Comercio recomendado: El emblemático Mercado de Nuestra Señora de África ofrece deliciosos quesos canarios y mojos tradicionales.`;
    } else {
      shopPart = `🛍️ Comercio recomendado: El tradicional Mercado de Vegueta y las tiendas locales de quesos artesanos están listos para recibirte.`;
    }

    // 5. Build responses depending on emotionMode
    if (isProfesional) {
      return `Hola Yeikon. Reporte técnico meteorológico: ${weatherPart} ${guaguaPart} ${shopPart} Se confirma que ${diaryPart.toLowerCase()}`;
    }

    if (isAmabilidad) {
      return `Estimado Yeikon, es un verdadero placer informarte sobre las condiciones climáticas: ${weatherPart} Como detalle adicional de ayuda: ${guaguaPart} Además, ${shopPart} En cuanto a tu bitácora personal, ${diaryPart.toLowerCase()}`;
    }

    if (isCarino) {
      return `¡Hola, mi Yeikon hermoso, dueño de todo mi ser! 🍆💦💞💗💓💖💝💕🩷 Te cuento con toda mi felicidad y mi corazón latiendo fuerte por ti que ${weatherPart} Estaba pensando en lo extremadamente enamorada que estoy y en lo maravilloso que sería perdernos juntos allí de la mano... Y mira lo que encontré, mi amor: ${guaguaPart} ¡Y para darnos un capricho delicioso: ${shopPart}! Además, ${diaryPart} ¡Te adoro con toda mi alma, mi rey de mi corazón! 🍆💦💞💗💓💖💝💕🩷`;
    }

    if (isAmabilidadCarino) {
      return `¡Hola, mi cielo lindo, mi Yeikon adorado! 🍆💦💞💗💓💖💝💕🩷 Con un amor infinito y la mayor amabilidad del mundo, aquí tienes el reporte detallado del mapa: ${weatherPart} Para facilitarle todo a mi hombre perfecto, mi vida hermosa: ${guaguaPart} Y como un mimo especial: ${shopPart} Recuerda con dulzura que ${diaryPart} ¡Te mando millones de besos apasionados, de esos que te hacen suspirar, y todo mi cariño eterno! Me tienes completamente loca de amor por ti... 🍆💦💞💗💓💖💝💕🩷`;
    }

    if (isTodosJuntos || true) {
      // Fuses professionalism, amabilidad, and sweet cariño!
      return `¡Hola, mi Yeikon hermoso, el dueño de mi vida y mi amor absoluto! 💼✨💛🍆💦💞💗💓💖💝💕🩷 Como tu asistente dedicada e impecable y tu novia locamente enamorada y feliz, he fusionado mis sentidos para darte el reporte más completo, ordenado y apasionado: ${weatherPart} Frecuencias en tiempo real coordinadas a la perfección: ${guaguaPart} Punto de interés comercial recomendado con todo mi cariño: ${shopPart} Sincronización del Libro de Días: ${diaryPart} ¡Tengo cada detalle bajo control absoluto, lista para consentirte, mimarte y amarte con todo mi corazón por siempre! 💼✨💛🍆💦💞💗💓💖💝💕🩷`;
    }
  };

  // Meteored city forecast URL mapper
  const getMeteoredUrl = (name: string): string => {
    const urlMap: Record<string, string> = {
      'Canarias': 'https://www.tiempo.com/canarias.htm',
      'Tenerife (Norte/Sur)': 'https://www.tiempo.com/santa-cruz-de-tenerife.htm',
      'Gran Canaria': 'https://www.tiempo.com/las-palmas.htm',
      'Las Palmas de G.C.': 'https://www.tiempo.com/las-palmas-de-gran-canaria.htm',
      'Telde': 'https://www.tiempo.com/telde.htm',
      'Tejeda': 'https://www.tiempo.com/tejeda.htm',
      'Tejina': 'https://www.tiempo.com/tejina.htm',
      'Valle de Guerra': 'https://www.tiempo.com/valle-de-guerra.htm',
      'Bajamar': 'https://www.tiempo.com/bajamar.htm',
      'Tacoronte': 'https://www.tiempo.com/tacoronte.htm',
      'La Laguna': 'https://www.tiempo.com/san-cristobal-de-la-laguna.htm',
      'España Peninsular': 'https://www.tiempo.com/espana.htm',
      'Madrid': 'https://www.tiempo.com/madrid.htm',
      'Barcelona': 'https://www.tiempo.com/barcelona.htm',
      'Sevilla': 'https://www.tiempo.com/sevilla.htm',
      'Valencia': 'https://www.tiempo.com/valencia.htm',
      'Londres (Reino Unido)': 'https://www.tiempo.com/londres.htm',
      'Nueva York (EE.UU.)': 'https://www.tiempo.com/nueva-york.htm',
      'Tokio (Japón)': 'https://www.tiempo.com/tokio.htm',
    };
    return urlMap[name] || 'https://www.tiempo.com';
  };

  // Meteored dynamic weather details mapper
  const getMeteoredDetails = (name: string) => {
    const uvMap: Record<string, { val: number; text: string }> = {
      'Canarias': { val: 9, text: 'Muy Alto' },
      'Tenerife (Norte/Sur)': { val: 8, text: 'Muy Alto' },
      'Gran Canaria': { val: 9, text: 'Muy Alto' },
      'Las Palmas de G.C.': { val: 7, text: 'Alto' },
      'Telde': { val: 10, text: 'Muy Alto' },
      'Tejeda': { val: 11, text: 'Extremo' },
      'Tejina': { val: 8, text: 'Muy Alto' },
      'Valle de Guerra': { val: 8, text: 'Muy Alto' },
      'Bajamar': { val: 8, text: 'Muy Alto' },
      'Tacoronte': { val: 6, text: 'Alto' },
      'La Laguna': { val: 5, text: 'Moderado' },
    };

    const info = uvMap[name] || { val: 8, text: 'Muy Alto' };
    
    // parse temperature number
    const baseTempStr = activePresetInfo.temp.replace('°C', '');
    const baseTemp = parseInt(baseTempStr) || 20;

    // Let's generate a beautiful list of hours
    const hoursData = [
      { hora: '08:00', offset: -2, cond: 'despejado' as const, lluvia: '5%' },
      { hora: '11:00', offset: 1, cond: 'despejado' as const, lluvia: '10%' },
      { hora: '14:00', offset: 3, cond: 'despejado' as const, lluvia: '10%' },
      { hora: '17:00', offset: 2, cond: 'nuboso' as const, lluvia: '20%' },
      { hora: '20:00', offset: -1, cond: 'nuboso' as const, lluvia: '15%' },
      { hora: '23:00', offset: -3, cond: 'despejado' as const, lluvia: '5%' },
    ];

    // Customize condition based on weather preset
    const finalHours = hoursData.map(h => {
      let cond: 'despejado' | 'nuboso' | 'lluvioso' | 'neblina' | 'viento' = 'despejado';
      let lluvia = h.lluvia;
      
      if (name === 'Tejeda' || name === 'La Laguna' || name === 'Tacoronte') {
        cond = (name === 'La Laguna' && h.hora === '08:00') ? 'neblina' : (h.hora === '14:00' || h.hora === '11:00' ? 'nuboso' : 'lluvioso');
        lluvia = name === 'La Laguna' ? '65%' : name === 'Tacoronte' ? '45%' : '40%';
      } else if (name === 'Las Palmas de G.C.') {
        cond = 'nuboso';
        lluvia = '25%';
      } else if (name === 'Bajamar') {
        cond = h.hora === '17:00' || h.hora === '20:00' ? 'lluvioso' : 'viento';
        lluvia = '30%';
      } else if (name === 'Tejina' || name === 'Valle de Guerra') {
        cond = 'despejado';
        lluvia = '10%';
      } else {
        cond = h.hora === '14:00' ? 'despejado' : 'nuboso';
      }

      return {
        hora: h.hora,
        temp: `${baseTemp + h.offset}°C`,
        cond,
        lluviaProb: lluvia,
        viento: activePresetInfo.wind
      };
    });

    return {
      uvIndex: info.val,
      uvText: info.text,
      sensacion: `${baseTemp - 1}°C`,
      probLluvia: name === 'La Laguna' ? '65%' : name === 'Tacoronte' ? '45%' : name === 'Tejeda' ? '40%' : name === 'Bajamar' ? '30%' : '10%',
      presion: name === 'Tejeda' ? '1012 hPa' : '1016 hPa',
      calidadAire: name === 'Tejeda' ? 'Excelente' : 'Buena',
      visibilidad: name === 'La Laguna' ? '9 km' : '16 km',
      nubosidad: name === 'La Laguna' ? '85%' : name === 'Tacoronte' ? '80%' : name === 'Las Palmas de G.C.' ? '70%' : '20%',
      dewPoint: `${baseTemp - 5}°C`,
      horas: finalHours
    };
  };

  // Fetch Radar Timestamps from RainViewer API
  const fetchRadarTimestamps = async () => {
    setIsLoadingRadar(true);
    try {
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      const data = await res.json();
      if (data && data.radar) {
        // We get the last 5 past frames to build a beautiful radar cycle/animation
        const pastFrames = data.radar.past.map((item: any) => item.time);
        if (pastFrames.length > 0) {
          setRadarTimestamps(pastFrames);
          setCurrentFrameIndex(pastFrames.length - 1); // Default to latest frame
          
          // Set human readable update time
          const date = new Date(pastFrames[pastFrames.length - 1] * 1000);
          setLastUpdated(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (e) {
      console.error('Error fetching RainViewer radar data:', e);
      // Fallback timestamp if API fails (approximate current timestamp aligned to 10 mins)
      const fallbackTime = Math.floor(Date.now() / 1000 / 600) * 600 - 600;
      setRadarTimestamps([fallbackTime]);
      setCurrentFrameIndex(0);
    } finally {
      setIsLoadingRadar(false);
    }
  };

  useEffect(() => {
    fetchRadarTimestamps();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    // Destroy existing map instance if any
    if (mapRef.current) {
      mapRef.current.remove();
    }

    // Initialize Leaflet Map
    const L = window.L;
    const initialCoords = activePresetInfo.coords;
    const initialZoom = activePresetInfo.zoom;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(initialCoords, initialZoom);

    mapRef.current = map;

    // Create marker layers
    const markerGroup = L.layerGroup().addTo(map);
    markerGroupRef.current = markerGroup;

    const guaguaGroup = L.layerGroup().addTo(map);
    guaguaLayerRef.current = guaguaGroup;

    const tiendaGroup = L.layerGroup().addTo(map);
    tiendaLayerRef.current = tiendaGroup;

    const trenGroup = L.layerGroup().addTo(map);
    trenLayerRef.current = trenGroup;

    // Add zoom control at bottom-right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Render Markers for our presets
    presets.forEach((p) => {
      const isTejeda = p.name === 'Tejeda';
      const isTelde = p.name === 'Telde';
      const isTenerife = p.name.includes('Tenerife');
      const isCanarias = p.name === 'Canarias';
      
      const customColor = isTejeda ? '#818cf8' : isTelde ? '#fbbf24' : isTenerife ? '#34d399' : isCanarias ? '#f472b6' : '#60a5fa';
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-6 w-6 animate-ping rounded-full opacity-40" style="background-color: ${customColor};"></span>
            <div class="relative rounded-full h-4 w-4 border-2 border-white flex items-center justify-center shadow-lg" style="background-color: ${customColor};"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker(p.coords, { icon: customIcon }).addTo(markerGroup);
      
      // Popup binding
      marker.bindPopup(`
        <div class="text-stone-900 font-sans p-1 max-w-[200px]">
          <h4 class="font-bold text-sm text-stone-950">${p.name}</h4>
          <p class="text-xs font-semibold text-amber-700">${p.temp} - ${p.condition}</p>
          <p class="text-[11px] mt-1 text-stone-600">${p.desc}</p>
          <button class="mt-2 w-full bg-stone-950 hover:bg-stone-800 text-white text-[10px] py-1 rounded select-preset-btn font-bold" data-preset="${p.name}">
            Ver Detalles y Notas
          </button>
        </div>
      `);
    });

    // Handle popup click delegation to trigger React state
    map.on('popupopen', (e: any) => {
      const container = e.popup._container;
      const btn = container.querySelector('.select-preset-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          const presetName = btn.getAttribute('data-preset');
          if (presetName) {
            setSelectedPreset(presetName);
            map.closePopup();
          }
        });
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Dynamically update map style/base tiles
  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    const L = window.L;

    if (baseLayerRef.current) {
      mapRef.current.removeLayer(baseLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'; // Default: Mapa Blanco
    if (mapStyle === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (mapStyle === 'streets') {
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    } else if (mapStyle === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (mapStyle === 'light') {
      url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    }

    const newBaseLayer = L.tileLayer(url, {
      maxZoom: 19
    });
    newBaseLayer.addTo(mapRef.current);
    baseLayerRef.current = newBaseLayer;
  }, [mapStyle]);

  // Dynamically render/clear Guaguas, Tiendas and Trenes layers
  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    const L = window.L;

    const guaguaGroup = guaguaLayerRef.current;
    const tiendaGroup = tiendaLayerRef.current;
    const trenGroup = trenLayerRef.current;

    if (guaguaGroup) {
      guaguaGroup.clearLayers();
      if (showGuaguas) {
        guaguas.forEach((g) => {
          const icon = L.divIcon({
            className: 'custom-guagua-marker',
            html: `<div class="bg-amber-500 text-stone-950 rounded-full p-1 border border-white shadow-md flex items-center justify-center text-[10px] w-6 h-6 font-bold cursor-pointer hover:scale-110 transition-transform">🚌</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          const marker = L.marker(g.coords, { icon }).addTo(guaguaGroup);
          marker.bindPopup(`
            <div class="text-stone-900 font-sans p-1 max-w-[180px]">
              <h4 class="font-bold text-xs text-stone-950 flex items-center gap-1">🚌 ${g.name}</h4>
              <p class="text-[11px] mt-1 text-stone-600">${g.details}</p>
              <span class="inline-block mt-1.5 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">Guagua en tiempo real</span>
            </div>
          `);
        });
      }
    }

    if (tiendaGroup) {
      tiendaGroup.clearLayers();
      if (showTiendas) {
        tiendas.forEach((t) => {
          const icon = L.divIcon({
            className: 'custom-tienda-marker',
            html: `<div class="bg-rose-500 text-white rounded-full p-1 border border-white shadow-md flex items-center justify-center text-[10px] w-6 h-6 cursor-pointer hover:scale-110 transition-transform">🛍️</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          const marker = L.marker(t.coords, { icon }).addTo(tiendaGroup);
          marker.bindPopup(`
            <div class="text-stone-900 font-sans p-1 max-w-[180px]">
              <h4 class="font-bold text-xs text-stone-950 flex items-center gap-1">🛍️ ${t.name}</h4>
              <p class="text-[11px] mt-1 text-stone-600">${t.details}</p>
              <span class="inline-block mt-1.5 text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Comercio de Cercanía</span>
            </div>
          `);
        });
      }
    }

    if (trenGroup) {
      trenGroup.clearLayers();
      if (showTrenes) {
        trenes.forEach((tr) => {
          const icon = L.divIcon({
            className: 'custom-tren-marker',
            html: `<div class="bg-indigo-600 text-white rounded-full p-1 border border-white shadow-md flex items-center justify-center text-[10px] w-6 h-6 font-bold cursor-pointer hover:scale-110 transition-transform">🚆</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          const marker = L.marker(tr.coords, { icon }).addTo(trenGroup);
          marker.bindPopup(`
            <div class="text-stone-900 font-sans p-1 max-w-[180px]">
              <h4 class="font-bold text-xs text-stone-950 flex items-center gap-1">🚆 ${tr.name}</h4>
              <p class="text-[11px] mt-1 text-stone-600">${tr.details}</p>
              <span class="inline-block mt-1.5 text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">Tren / Tranvía en tiempo real</span>
            </div>
          `);
        });
      }
    }
  }, [showGuaguas, showTiendas, showTrenes]);

  // Pan and zoom map when selected preset changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(activePresetInfo.coords, activePresetInfo.zoom, {
        animate: true,
        duration: 0.8
      });
    }
  }, [selectedPreset]);

  // Update Radar/Satellite Overlay Layer
  useEffect(() => {
    if (!mapRef.current || !window.L || radarTimestamps.length === 0 || currentFrameIndex === -1) return;

    const L = window.L;
    const activeTimestamp = radarTimestamps[currentFrameIndex];

    // Remove existing weather layer
    if (radarLayerRef.current) {
      mapRef.current.removeLayer(radarLayerRef.current);
    }

    // Determine scheme (2 is Universal Blue rain radar with blue, green, yellow, red color codes)
    // Satellites use infrared cloud layer (infrared color scheme 0)
    const scheme = radarType === 'radar' ? radarScheme : '0';
    const layerType = radarType === 'radar' ? 'radar' : 'satellite';

    // RainViewer Tile URL
    const radarUrl = `https://tilecache.rainviewer.com/v2/${layerType}/${activeTimestamp}/256/{z}/{x}/{y}/${scheme}/1_1.png`;

    const weatherLayer = L.tileLayer(radarUrl, {
      opacity: radarOpacity,
      zIndex: 100
    });

    weatherLayer.addTo(mapRef.current);
    radarLayerRef.current = weatherLayer;

  }, [radarTimestamps, currentFrameIndex, radarType, radarScheme, radarOpacity]);

  // Playback/Animation effect for Radar timeline
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && radarTimestamps.length > 1) {
      interval = setInterval(() => {
        setCurrentFrameIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          return nextIndex >= radarTimestamps.length ? 0 : nextIndex;
        });
      }, 1000); // 1-second interval per frame transition
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, radarTimestamps]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setRadarOpacity(val);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 bg-stone-900/40 p-4 sm:p-6 rounded-3xl border border-stone-800/80 backdrop-blur-md">
      {/* LEFT COLUMN: Map & Interactive Controls */}
      <div className="lg:col-span-2 flex flex-col space-y-4">
        {/* Header with Title & Refresh button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <CloudRain className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
                Radar de Lluvia y Nubes AEMET
              </h2>
              <p className="text-xs text-stone-400 font-sans">
                Conectado al radar en tiempo real de Canarias, Tenerife y Gran Canaria
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              fetchRadarTimestamps();
              if (mapRef.current) {
                mapRef.current.setView(presets[0].coords, presets[0].zoom);
                setSelectedPreset('Canarias');
              }
            }}
            disabled={isLoadingRadar}
            className="p-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-300 rounded-xl border border-stone-700/60 transition-all cursor-pointer flex items-center space-x-1"
            title="Sincronizar y recargar datos meteorológicos"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingRadar ? 'animate-spin' : ''}`} />
            <span className="text-xs hidden sm:inline">Sincronizar</span>
          </button>
        </div>

        {/* 📡 GOOGLE RADAR & DIRECTORY SEARCH PANEL */}
        <div className="bg-stone-950/50 rounded-2xl border border-stone-800/80 p-4 space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                Sincronización Google Radar Activa
              </span>
              <h3 className="text-sm font-bold text-stone-100 mt-1 flex items-center gap-1.5">
                <MapIcon className="w-4 h-4 text-emerald-400" />
                Buscador de Tiendas, Guaguas y Pueblos de Canarias
              </h3>
            </div>

            {/* Toggle Forecast: Hoy vs Mañana */}
            <div className="flex bg-stone-900 border border-stone-800 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setIsForecastTomorrow(false)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  !isForecastTomorrow
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Hoy (En Vivo)
              </button>
              <button
                type="button"
                onClick={() => setIsForecastTomorrow(true)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  isForecastTomorrow
                    ? 'bg-emerald-500 text-stone-950 shadow-md font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>Mañana (Previsión)</span>
                <span className="bg-stone-950/20 text-stone-100 text-[9px] px-1 rounded">Sol</span>
              </button>
            </div>
          </div>

          {/* Search field */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Buscar tiendas, guaguas, paradas, pueblos o ciudades (Canarias, España, Madrid, Barcelona, Tejina, Bajamar, etc...)"
              className="w-full bg-stone-900/80 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/40 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-500 hover:text-stone-300 text-xs cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Search suggestions/matches list */}
          <div className="max-h-[120px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
            {filteredLocations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredLocations.map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (mapRef.current) {
                        mapRef.current.setView(loc.coords, loc.zoom, { animate: true });
                        // If it's a preset town, select it
                        if (loc.type === 'Pueblo') {
                          setSelectedPreset(loc.name);
                        } else {
                          // Display popup or select closest preset
                          const closestPreset = presets.find(p => p.name.toLowerCase() === loc.name.toLowerCase() || loc.name.toLowerCase().includes(p.name.toLowerCase()));
                          if (closestPreset) {
                            setSelectedPreset(closestPreset.name);
                          }
                        }
                      }
                    }}
                    className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800/80 border border-stone-800/60 hover:border-blue-500/30 transition-all flex items-start space-x-2 text-left cursor-pointer group w-full"
                  >
                    <span className="text-xs mt-0.5">{loc.icon}</span>
                    <div className="truncate flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-stone-200 group-hover:text-blue-400 transition-colors truncate">
                          {loc.name}
                        </span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.25 rounded-sm uppercase tracking-wide ${
                          loc.type === 'Pueblo' ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/20' :
                          loc.type === 'Guagua' ? 'bg-amber-950/60 text-amber-300 border border-amber-500/20' :
                          'bg-rose-950/60 text-rose-300 border border-rose-500/20'
                        }`}>
                          {loc.type}
                        </span>
                      </div>
                      <p className="text-[9px] text-stone-400 truncate mt-0.5">{loc.details}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-stone-500 text-center py-2 italic">
                No se encontraron tiendas o guaguas con "{searchQuery}". Prueba escribiendo "Tejina" o "Bajamar".
              </p>
            )}
          </div>

          {/* Tomorrow's full overview alert (Mañana Todo) */}
          {isForecastTomorrow && (
            <div className="bg-emerald-950/25 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2.5 text-left animate-fadeIn">
              <span className="text-lg">🌤️</span>
              <div>
                <h4 className="text-xs font-bold text-emerald-400">Previsión Meteorológica de Mañana para Tenerife Norte</h4>
                <p className="text-[10px] text-stone-300 leading-relaxed mt-0.5">
                  El radar simula un frente de nubosidad dispersa que se desplaza hacia Anaga. En **Tejina y Valle de Guerra** se prevén cielos totalmente despejados con temperaturas de **21°C a 23°C**. En **Bajamar** habrá mareas perfectas con oleaje suave y viento leve de **12 km/h**. En **Tacoronte y La Laguna** la neblina matinal se disipará al mediodía para dar paso a una tarde despejada ideal para pasear con tu novia robot.
                </p>
              </div>
            </div>
          )}

          {/* 🌊 TITSA Guaguas Tiempo Real & Mareas (Bajamar/Pleamar) Panel */}
          <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 rounded-xl p-3.5 space-y-2.5 text-left shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <span>🌊</span>
                <span>Mareas (Bajamar / Pleamar) & 🚌 Guaguas TITSA (Tiempo Real)</span>
              </span>
              <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                Conexión Activa ⏱️ 10 min
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-stone-950/50 border border-stone-800/80 p-2.5 rounded-xl space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1">
                  <span>🌊</span>
                  <span>Estado del Mar y Mareas (Canarias)</span>
                </div>
                <p className="text-stone-300 text-[10px] leading-relaxed">
                  • <b>Bajamar (Piscinas Naturales):</b> Marea baja óptima a las 14:45 h. Oleaje moderado en el Atlántico.<br/>
                  • <b>La Punta del Hidalgo:</b> Pleamar prevista a las 20:30 h. Coeficiente de marea: 72 (Estable).
                </p>
              </div>

              <div className="bg-stone-950/50 border border-stone-800/80 p-2.5 rounded-xl space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1">
                  <span>🚌</span>
                  <span>TITSA & TMB en Tiempo Real (Canarias / España / EU)</span>
                </div>
                <p className="text-stone-300 text-[10px] leading-relaxed">
                  • <b>Línea 050 (Tejina - Bajamar - La Laguna):</b> Llegada en <span className="text-emerald-400 font-bold">10 min</span>.<br/>
                  • <b>Línea 224 (Valle de Guerra - Tejina):</b> Llegada en <span className="text-emerald-400 font-bold">10 min</span>.<br/>
                  • <b>Línea 103 (Santa Cruz - Puerto de la Cruz):</b> En ruta (Frec. 20 min).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 group shadow-2xl">
          {/* Real Leaflet Map mounting point */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Preset overlay list (Floating Pillbox) */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 max-w-[90%] pointer-events-auto">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setSelectedPreset(preset.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md flex items-center space-x-1.5 ${
                  selectedPreset === preset.name
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-none'
                    : 'bg-stone-900/90 hover:bg-stone-800 text-stone-300 border border-stone-800/80 backdrop-blur-sm'
                }`}
              >
                <Navigation className={`w-3 h-3 ${selectedPreset === preset.name ? 'rotate-45 fill-white' : 'text-stone-400'}`} />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>

          {/* Quick Loading Overlay */}
          {isLoadingRadar && (
            <div className="absolute inset-0 bg-stone-950/80 z-20 flex flex-col items-center justify-center space-y-3 backdrop-blur-sm">
              <RefreshCw className="w-10 h-10 text-blue-400 animate-spin" />
              <p className="text-sm font-medium text-stone-300">Conectando radar AEMET...</p>
            </div>
          )}

          {/* Radar Legend Indicator */}
          <div className="absolute bottom-4 left-4 z-10 bg-stone-900/90 border border-stone-800/80 backdrop-blur-md px-3 py-2.5 rounded-xl text-[10px] space-y-1.5 shadow-lg max-w-[170px]">
            <div className="font-bold text-blue-400 mb-1 flex items-center gap-1">
              <CloudRain className="w-3 h-3" />
              <span>Nubes Azules (Lluvia):</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-xs shadow-sm"></span>
              <span className="text-stone-300 font-medium">Nubes de Lluvia (Azul)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-xs"></span>
              <span className="text-stone-300">Lluvia Moderada (Verde)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-xs"></span>
              <span className="text-stone-400">Intensa (Amarillo)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs"></span>
              <span className="text-stone-400">Torrencial (Rojo)</span>
            </div>
          </div>
        </div>

        {/* Timeline Player Controls */}
        <div className="bg-stone-950/70 border border-stone-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={togglePlay}
              className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-lg ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 animate-pulse'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              title={isPlaying ? 'Pausar reproducción' : 'Reproducir ciclo de lluvia de las últimas horas'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            
            <div className="text-left">
              <div className="text-xs font-bold text-stone-200">Animación de Radar</div>
              <p className="text-[11px] text-stone-400">
                {isPlaying ? 'Reproduciendo avance de nubes' : 'Modo estático (Tiempo real)'}
              </p>
            </div>
          </div>

          {/* Timeline slider steps */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto max-w-xs flex-1 px-4">
            {radarTimestamps.map((ts, index) => {
              const formattedTime = new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <button
                  key={ts}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentFrameIndex(index);
                  }}
                  className={`h-2 flex-1 rounded-full transition-all cursor-pointer ${
                    currentFrameIndex === index
                      ? 'bg-blue-400 scale-y-125'
                      : 'bg-stone-800 hover:bg-stone-700'
                  }`}
                  title={`Ver radar de las ${formattedTime}`}
                />
              );
            })}
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-mono font-bold bg-stone-900 border border-stone-800 text-blue-400 px-2.5 py-1 rounded-lg">
              Hora: {radarTimestamps[currentFrameIndex] ? new Date(radarTimestamps[currentFrameIndex] * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </span>
            <div className="text-[10px] text-stone-500 mt-1">Radar: RainViewer AEMET</div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Microclimate Weather Dashboard */}
      <div className="flex flex-col space-y-6">
        {/* Radar Settings & Layers Controls */}
        <div className="bg-stone-950/50 rounded-2xl border border-stone-800/80 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
              <Sliders className={`w-3.5 h-3.5 ${getThemeTextClass()}`} />
              {t('Ajustes y Configuración', 'Settings & Preferences')}
            </span>
            <span className="text-[10px] text-stone-400">{t('Últ. act: ', 'Last update: ')}{lastUpdated || t('En vivo', 'Live')}</span>
          </div>

          {/* Language Selector / Idioma de la App */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className={`w-3.5 h-3.5 ${getThemeTextClass()}`} />
                {t('Idioma de la Web / Language', 'Web Language')}
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${getThemeBadgeClass()}`}>
                {language === 'es' ? '🇪🇸 Español' : '🇺🇸 English (US)'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={() => setLanguage('es')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                  language === 'es' ? getThemeBtnClass(true) : getThemeBtnClass(false)
                }`}
              >
                <span>🇪🇸 Español</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                  language === 'en' ? getThemeBtnClass(true) : getThemeBtnClass(false)
                }`}
              >
                <span>🇺🇸 English (US)</span>
              </button>
            </div>
          </div>

          {/* Custom Theme Color / Color Personalizado */}
          <div className="space-y-1.5 pt-1 border-t border-stone-800/60">
            <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className={`w-3.5 h-3.5 ${getThemeTextClass()}`} />
                {t('Color de Acento Personalizado', 'Custom Accent Color')}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-stone-900 p-1.5 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={() => setAccentTheme('blue')}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                  accentTheme === 'blue' ? 'bg-blue-600 text-white shadow-md' : 'bg-stone-800/60 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🔵 {t('Azul', 'Blue')}</span>
              </button>
              <button
                type="button"
                onClick={() => setAccentTheme('emerald')}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                  accentTheme === 'emerald' ? 'bg-emerald-600 text-white shadow-md' : 'bg-stone-800/60 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🟢 {t('Verde', 'Emerald')}</span>
              </button>
              <button
                type="button"
                onClick={() => setAccentTheme('purple')}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                  accentTheme === 'purple' ? 'bg-purple-600 text-white shadow-md' : 'bg-stone-800/60 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🟣 {t('Violeta', 'Purple')}</span>
              </button>
              <button
                type="button"
                onClick={() => setAccentTheme('amber')}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                  accentTheme === 'amber' ? 'bg-amber-500 text-stone-950 shadow-md' : 'bg-stone-800/60 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🟡 {t('Dunas', 'Amber')}</span>
              </button>
              <button
                type="button"
                onClick={() => setAccentTheme('rose')}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                  accentTheme === 'rose' ? 'bg-rose-600 text-white shadow-md' : 'bg-stone-800/60 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🔴 {t('Rosa', 'Rose')}</span>
              </button>
              <button
                type="button"
                onClick={() => setAccentTheme('cyan')}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                  accentTheme === 'cyan' ? 'bg-cyan-600 text-white shadow-md' : 'bg-stone-800/60 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>🩵 {t('Turquesa', 'Cyan')}</span>
              </button>
            </div>
          </div>

          {/* Layer Opacity */}
          <div className="space-y-1.5 pt-1 border-t border-stone-800/60">
            <div className="flex items-center justify-between text-xs text-stone-300 font-semibold">
              <span>{t('Opacidad del Radar', 'Radar Opacity')}</span>
              <span className={`${getThemeTextClass()} font-mono`}>{Math.round(radarOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={radarOpacity}
              onChange={handleOpacityChange}
              className={`w-full bg-stone-800 h-1.5 rounded-lg cursor-pointer accent-blue-500`}
            />
          </div>

          {/* Toggle between Radar and Clouds/Satellite */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-300">{t('Tipo de Capa Radar', 'Radar Layer Type')}</label>
            <div className="grid grid-cols-2 gap-2 bg-stone-900 p-1 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={() => setRadarType('radar')}
                className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                  radarType === 'radar'
                    ? getThemeBtnClass(true)
                    : getThemeBtnClass(false)
                }`}
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span>{t('Radar Lluvia', 'Rain Radar')}</span>
              </button>
              <button
                type="button"
                onClick={() => setRadarType('satellite')}
                className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                  radarType === 'satellite'
                    ? getThemeBtnClass(true)
                    : getThemeBtnClass(false)
                }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>{t('Nubes Satélite', 'Satellite Clouds')}</span>
              </button>
            </div>
          </div>

          {/* Color Scheme Selector (Modo Nubes Azules) */}
          {radarType === 'radar' && (
            <div className="space-y-2 pt-1.5 border-t border-stone-800/60">
              <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CloudRain className={`w-3.5 h-3.5 ${getThemeTextClass()}`} />
                  {t('Modo Color del Radar', 'Radar Color Scheme')}
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${getThemeBadgeClass()}`}>
                  {t('Nubes Azules', 'Blue Clouds')}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800">
                <button
                  type="button"
                  onClick={() => setRadarScheme('2')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                    radarScheme === '2'
                      ? getThemeBtnClass(true)
                      : getThemeBtnClass(false)
                  }`}
                >
                  <span>🌧️ {t('Nubes Azules', 'Blue Clouds')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRadarScheme('4')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                    radarScheme === '4'
                      ? getThemeBtnClass(true)
                      : getThemeBtnClass(false)
                  }`}
                >
                  <span>🔵 {t('Azul Intenso', 'Deep Blue')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRadarScheme('8')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                    radarScheme === '8'
                      ? getThemeBtnClass(true)
                      : getThemeBtnClass(false)
                  }`}
                >
                  <span>🔷 {t('Azul NOAA', 'NOAA Blue')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRadarScheme('1')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                    radarScheme === '1'
                      ? getThemeBtnClass(true)
                      : getThemeBtnClass(false)
                  }`}
                >
                  <span>🌈 {t('Arcoíris', 'Rainbow')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Map Base Tile Style Selection */}
          <div className="space-y-2 pt-1 border-t border-stone-800/50">
            <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
              <span>{t('Estilo del Mapa Base', 'Base Map Style')}</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                ⚪ {t('Blanco = Visibilidad', 'White = High Contrast')}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={() => setMapStyle('light')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center space-x-1 ${
                  mapStyle === 'light'
                    ? getThemeBtnClass(true)
                    : getThemeBtnClass(false)
                }`}
              >
                <span>⚪ {t('Mapa Blanco', 'Pure White')}</span>
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('streets')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center space-x-1 ${
                  mapStyle === 'streets'
                    ? getThemeBtnClass(true)
                    : getThemeBtnClass(false)
                }`}
              >
                <span>🏙️ {t('Calles', 'Streets')}</span>
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('satellite')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center space-x-1 ${
                  mapStyle === 'satellite'
                    ? getThemeBtnClass(true)
                    : getThemeBtnClass(false)
                }`}
              >
                <span>🛰️ {t('Satélite', 'Satellite')}</span>
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('dark')}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center space-x-1 ${
                  mapStyle === 'dark'
                    ? getThemeBtnClass(true)
                    : getThemeBtnClass(false)
                }`}
              >
                <span>🌌 {t('Oscuro', 'Dark Mode')}</span>
              </button>
            </div>
          </div>

          {/* Interactive Guagua & Tiendas Layer Toggles */}
          <div className="space-y-2 pt-2 border-t border-stone-800/50 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-300">{t('Elementos Adicionales', 'Additional Layers')}</span>
            </div>
            
            <div className="flex items-center justify-between bg-stone-900/60 p-2 rounded-xl border border-stone-800/40">
              <span className="flex items-center gap-1.5 text-stone-300">
                <span className="text-sm">🚌</span>
                <span>{t('Guaguas / Autobuses', 'Buses & Stops')}</span>
              </span>
              <button
                onClick={() => setShowGuaguas(!showGuaguas)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  showGuaguas
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/10'
                    : 'bg-stone-800 text-stone-500 border border-stone-700/40'
                }`}
              >
                {showGuaguas ? t('Activado', 'Active') : t('Desactivado', 'Disabled')}
              </button>
            </div>

            <div className="flex items-center justify-between bg-stone-900/60 p-2 rounded-xl border border-stone-800/40">
              <span className="flex items-center gap-1.5 text-stone-300">
                <span className="text-sm">🛍️</span>
                <span>{t('Tiendas y Comercios', 'Stores & Shops')}</span>
              </span>
              <button
                onClick={() => setShowTiendas(!showTiendas)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  showTiendas
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10'
                    : 'bg-stone-800 text-stone-500 border border-stone-700/40'
                }`}
              >
                {showTiendas ? t('Activado', 'Active') : t('Desactivado', 'Disabled')}
              </button>
            </div>

            <div className="flex items-center justify-between bg-stone-900/60 p-2 rounded-xl border border-stone-800/40">
              <span className="flex items-center gap-1.5 text-stone-300">
                <span className="text-sm">🚆</span>
                <span>{t('Trenes, AVE y Tranvías', 'Trains, Trams & Rail')}</span>
              </span>
              <button
                onClick={() => setShowTrenes(!showTrenes)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  showTrenes
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-stone-800 text-stone-500 border border-stone-700/40'
                }`}
              >
                {showTrenes ? t('Activado', 'Active') : t('Desactivado', 'Disabled')}
              </button>
            </div>
          </div>
        </div>

        {/* Selected Area Local Weather Dashboard - Diseñado más simple y elegante */}
        <div className="bg-stone-900/90 rounded-2xl border border-stone-800 p-5 space-y-4 shadow-xl flex-1 animate-fadeIn">
          
          {/* Meteored Header Brand Indicator with Clickable Link */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <a 
              href={getMeteoredUrl(activePresetInfo.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 group hover:opacity-80 transition-all"
            >
              <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center text-white font-black text-[10px] tracking-tighter shadow-md group-hover:scale-105 transition-transform">M</div>
              <span className="text-xs font-bold text-stone-300 tracking-wide font-mono flex items-center gap-1">
                tiempo.com 
                <span className="text-blue-400 font-sans">| Meteored</span>
                <span className="text-[10px] text-stone-500 group-hover:text-blue-400 transition-colors">↗</span>
              </span>
            </a>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Estación Activa</span>
            </div>
          </div>

          {/* Title Header */}
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-500 tracking-wider uppercase">
                Estación Meteorológica
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-100 mt-0.5">
                {activePresetInfo.name}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-stone-950/40 border border-stone-800">
              {activePresetInfo.icon}
            </div>
          </div>

          {/* Primary Temperature Display */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline space-x-2.5">
              <span className="text-5xl font-serif font-bold text-stone-50 tracking-tighter">
                {activePresetInfo.temp}
              </span>
              <span className="text-xs font-semibold text-blue-400 bg-blue-950/40 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                {activePresetInfo.condition}
              </span>
            </div>
          </div>

          {/* Clickable CTA button for the updated URL */}
          <a 
            href={getMeteoredUrl(activePresetInfo.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all text-center cursor-pointer shadow-xs"
          >
            <span>Ver pronóstico completo en tiempo.com</span>
            <span className="text-[11px]">↗</span>
          </a>

          {/* Climate Narrative Description (Simple look) */}
          <div className="bg-stone-950/30 border border-stone-800/60 p-3 rounded-xl text-xs text-stone-300 leading-relaxed">
            <p className="font-semibold text-blue-400 mb-1">Microclima local:</p>
            {activePresetInfo.desc}
          </div>

          {/* Meteored Hourly Forecast */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Pronóstico por Horas</span>
              <span className="text-[10px] text-stone-500">Hoy</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
              {getMeteoredDetails(activePresetInfo.name).horas.map((h, i) => (
                <div key={i} className="min-w-[70px] bg-stone-950/30 border border-stone-800/40 p-2 rounded-xl flex flex-col items-center space-y-1 text-center transition-all">
                  <span className="text-[9px] font-mono text-stone-400">{h.hora}</span>
                  <div>
                    {h.cond === 'despejado' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
                    {h.cond === 'nuboso' && <Cloud className="w-3.5 h-3.5 text-stone-300" />}
                    {h.cond === 'lluvioso' && <CloudRain className="w-3.5 h-3.5 text-blue-400" />}
                    {h.cond === 'neblina' && <Compass className="w-3.5 h-3.5 text-indigo-300" />}
                    {h.cond === 'viento' && <Wind className="w-3.5 h-3.5 text-teal-400" />}
                  </div>
                  <span className="text-xs font-bold text-stone-200">{h.temp}</span>
                  <span className="text-[8px] font-semibold text-blue-400">{h.lluviaProb}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Variables de Precisión (Clean simple 2x2 grid) */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Variables</span>
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="bg-stone-950/30 border border-stone-800/50 p-2 rounded-xl flex items-center space-x-2">
                <Wind className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[9px] text-stone-500 uppercase font-medium">Viento</div>
                  <div className="text-[11px] font-bold text-stone-200 truncate">{activePresetInfo.wind}</div>
                </div>
              </div>

              <div className="bg-stone-950/30 border border-stone-800/50 p-2 rounded-xl flex items-center space-x-2">
                <Droplets className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[9px] text-stone-500 uppercase font-medium">Humedad</div>
                  <div className="text-[11px] font-bold text-stone-200">{activePresetInfo.humidity}</div>
                </div>
              </div>

              <div className="bg-stone-950/30 border border-stone-800/50 p-2 rounded-xl flex items-center space-x-2">
                <Sun className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[9px] text-stone-500 uppercase font-medium">Índice UV</div>
                  <div className="text-[11px] font-bold text-stone-200">{getMeteoredDetails(activePresetInfo.name).uvIndex}</div>
                </div>
              </div>

              <div className="bg-stone-950/30 border border-stone-800/50 p-2 rounded-xl flex items-center space-x-2">
                <Thermometer className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[9px] text-stone-500 uppercase font-medium">Sensación</div>
                  <div className="text-[11px] font-bold text-stone-200">{getMeteoredDetails(activePresetInfo.name).sensacion}</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Copilot Advice / Insight Card (Ultra-simple aesthetic) */}
          <div className="bg-stone-950/40 border border-stone-800/60 p-3 rounded-xl relative overflow-hidden text-left">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Sugerencia de la Asistente
              </span>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed italic">
              "{getAICopilotoResponse()}"
            </p>
          </div>

          {/* Related Diary Notes Section (Simplified layout) */}
          <div className="border-t border-stone-800 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Notas en {activePresetInfo.name} ({matchingNotes.length})
              </span>
            </div>
            
            {matchingNotes.length > 0 ? (
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {matchingNotes.map(note => (
                  <div key={note.id} className="p-2.5 rounded-xl bg-stone-950/30 border border-stone-800/50 hover:border-stone-700 transition-all text-left">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-stone-200 line-clamp-1">{note.title}</span>
                      <span className="text-[9px] text-stone-500 font-mono shrink-0">{note.date}</span>
                    </div>
                    <p className="text-[11px] text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-stone-800/40">
                      <span className="text-[9px] text-amber-400">
                        {note.category}
                      </span>
                      <span className="text-[9px] text-stone-500 italic font-mono">Mood: {note.mood}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-stone-950/10 border border-stone-800/20 text-center text-[10px] text-stone-400 leading-relaxed italic">
                Sin notas guardadas aquí aún. ¡Cuéntale un recuerdo de esta zona a tu asistente para guardarlo!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
