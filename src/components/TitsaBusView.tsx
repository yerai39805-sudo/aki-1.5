import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Search, 
  RefreshCw, 
  Waves, 
  Compass, 
  Sparkles, 
  Moon, 
  Sun, 
  Sunset, 
  CheckCircle2, 
  ArrowRight,
  ListFilter,
  Info,
  Calendar
} from 'lucide-react';

interface TitsaBusViewProps {
  emotionMode: string;
}

export interface BusLineInfo {
  code: string;
  name: string;
  origin: string;
  destination: string;
  ramal: string;
  frequency: string;
  type: 'diurno' | 'nocturno_24h' | 'express';
  zone: string;
  stopName: string;
  fullSchedule: string[]; // Scheduled times from 01:00 to 23:00+
  status: 'En ruta' | 'Puntual' | 'Retraso leve';
  color: string;
}

export interface SpecificStop {
  id: string;
  code: string;
  name: string;
  location: string;
  lines: string[];
  description: string;
  isHighlight?: boolean;
  scheduleByLine: Record<string, string[]>; // Line code -> full schedule 01:00 to 23:00
}

// 1. Full 24H / 01:00 AM - 23:00 PM lines database for Tenerife TITSA
export const TITSA_LINES: BusLineInfo[] = [
  {
    code: '014',
    name: 'Línea 014: Santa Cruz - La Laguna (24 Horas / Directa)',
    origin: 'Intercambiador Santa Cruz',
    destination: 'Intercambiador La Laguna',
    ramal: 'Ramal General TF-180 / La Cuesta / Hospitales',
    frequency: 'Cada 10-15 min (Día) | Cada 45 min (Madrugada 01:00-05:30)',
    type: 'nocturno_24h',
    zone: 'Santa Cruz / La Cuesta / La Laguna',
    stopName: 'Hospital Universitario (#3501) & Padre Anchieta (#3520)',
    status: 'En ruta',
    color: 'emerald',
    fullSchedule: [
      // 01:00 AM a 05:00 AM (Madrugada)
      '01:00', '01:45', '02:30', '03:15', '04:00', '04:45', '05:30',
      // 06:00 AM a 12:00 PM (Mañana)
      '06:00', '06:15', '06:30', '06:45', '07:00', '07:12', '07:24', '07:36', '07:48',
      '08:00', '08:12', '08:24', '08:36', '08:48', '09:00', '09:15', '09:30', '09:45',
      '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45',
      // 12:00 PM a 18:00 PM (Tarde)
      '12:00', '12:15', '12:30', '12:45', '13:00', '13:12', '13:24', '13:36', '13:48',
      '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45',
      '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45',
      // 18:00 PM a 23:00+ PM (Noche)
      '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45',
      '20:00', '20:15', '20:30', '20:45', '21:00', '21:20', '21:40',
      '22:00', '22:30', '23:00', '23:30', '23:55'
    ]
  },
  {
    code: '050',
    name: 'Línea 050: La Laguna - Tegueste - Tejina - Bajamar - Punta del Hidalgo',
    origin: 'Intercambiador La Laguna',
    destination: 'Bajamar (Piscinas) & Punta del Hidalgo',
    ramal: 'Ramal Casetera (#4160), Tejina Centro y Costa Norte',
    frequency: 'Cada 30 min (Día) | Refuerzos nocturnos 01:00, 02:30, 23:00, 23:30',
    type: 'diurno',
    zone: 'La Laguna / Tegueste / Tejina / Bajamar / La Punta',
    stopName: 'Parada Casetera (#4160) & Bajamar (#4120)',
    status: 'Puntual',
    color: 'blue',
    fullSchedule: [
      '01:00', '02:30', '05:30', '06:05', '06:35', '07:05', '07:35', '08:05', '08:35',
      '09:05', '09:35', '10:05', '10:35', '11:05', '11:35', '12:05', '12:35', '13:05',
      '13:35', '14:05', '14:35', '15:05', '15:35', '16:05', '16:35', '17:05', '17:35',
      '18:05', '18:35', '19:05', '19:35', '20:05', '20:35', '21:05', '21:40', '22:15',
      '23:00', '23:30'
    ]
  },
  {
    code: '057',
    name: 'Línea 057: La Laguna - Tacoronte - Valle de Guerra - Moya - Tejina',
    origin: 'Intercambiador La Laguna',
    destination: 'Valle de Guerra, Moya, Casetera y Tejina',
    ramal: 'Ramal Valle de Guerra & Sector Moya (#4185) y Cruce Las Toscas (#4294)',
    frequency: 'Cada 25 min (Día y Noche hasta las 23:15)',
    type: 'diurno',
    zone: 'La Laguna / Tacoronte / Valle de Guerra / Moya / Tejina',
    stopName: 'Parada de Moya (#4185) & Parada Casetera (#4160)',
    status: 'Puntual',
    color: 'amber',
    fullSchedule: [
      '01:15', '06:00', '06:25', '06:50', '07:15', '07:40', '08:05', '08:30', '08:55',
      '09:20', '09:45', '10:10', '10:35', '11:00', '11:25', '11:50', '12:15', '12:40',
      '13:05', '13:30', '13:55', '14:20', '14:45', '15:10', '15:35', '16:00', '16:25',
      '16:50', '17:15', '17:40', '18:05', '18:30', '18:55', '19:20', '19:45', '20:10',
      '20:35', '21:00', '21:30', '22:05', '22:45', '23:15'
    ]
  },
  {
    code: '711',
    name: 'Línea 711: Santa Cruz - Aeropuerto Tenerife Sur (TFS) - Costa Adeje (Nocturna)',
    origin: 'Intercambiador Santa Cruz',
    destination: 'Aeropuerto Sur (TFS) / Los Cristianos / Costa Adeje',
    ramal: 'Red Nocturna Sur TF-1 Directa (Madrugada 01:00 a 05:30 y 22:00 a 23:30)',
    frequency: 'Cada 90 min en Madrugada',
    type: 'nocturno_24h',
    zone: 'Santa Cruz / Candelaria / San Isidro / Aeropuerto Sur / Costa Adeje',
    stopName: 'Aeropuerto Tenerife Sur (#7050) & Estación Costa Adeje (#7001)',
    status: 'En ruta',
    color: 'purple',
    fullSchedule: [
      '01:00', '02:30', '04:00', '05:30', '22:00', '22:45', '23:30'
    ]
  },
  {
    code: '104',
    name: 'Línea 104: Santa Cruz - Tacoronte - La Orotava - Puerto de la Cruz (Nocturna Norte)',
    origin: 'Intercambiador Santa Cruz',
    destination: 'Puerto de la Cruz (Estación Plaza del Charco)',
    ramal: 'Servicio Nocturno Norte TF-5 por La Laguna, Tacoronte y Matanza',
    frequency: 'Salidas nocturnas de 01:00 a 05:15 y 22:30 a 23:45',
    type: 'nocturno_24h',
    zone: 'Santa Cruz / La Laguna / Tacoronte / La Orotava / Puerto Cruz',
    stopName: 'Estación Puerto de la Cruz (#4500) & Padre Anchieta (#3520)',
    status: 'Puntual',
    color: 'indigo',
    fullSchedule: [
      '01:00', '02:15', '03:45', '05:15', '22:30', '23:15', '23:45'
    ]
  },
  {
    code: '224',
    name: 'Línea 224: La Laguna - Tejina por El Ramal e IES Tejina',
    origin: 'Intercambiador La Laguna',
    destination: 'Tejina (IES Tejina, El Ramal y Casetera)',
    ramal: 'Ramal El Ramal (#4155), Instituto IES Tejina (#4170) & Casetera II (#4161)',
    frequency: 'Cada 45 min (De 06:15 a 22:45)',
    type: 'diurno',
    zone: 'Tejina / El Ramal / Instituto / Casetera',
    stopName: 'Parada del Instituto (#4170) & Parada El Ramal (#4155)',
    status: 'Puntual',
    color: 'emerald',
    fullSchedule: [
      '06:15', '07:00', '07:45', '08:30', '09:15', '10:00', '10:45', '11:30',
      '12:15', '13:00', '13:45', '14:30', '15:15', '16:00', '16:45', '17:30',
      '18:15', '19:00', '19:45', '20:30', '21:15', '22:00', '22:45'
    ]
  },
  {
    code: '051',
    name: 'Línea 051: La Laguna - Tegueste - Tejina Circular',
    origin: 'Intercambiador La Laguna',
    destination: 'Tejina Casetera & Tegueste (Ruta Circular)',
    ramal: 'Ramal Circular Comarcal Norte',
    frequency: 'Cada 35 min (De 06:10 a 23:10)',
    type: 'diurno',
    zone: 'Tejina / Tegueste / La Laguna',
    stopName: 'Parada Casetera (#4160) & Tejina Centro (#4150)',
    status: 'Puntual',
    color: 'cyan',
    fullSchedule: [
      '06:10', '06:45', '07:20', '07:55', '08:30', '09:05', '09:40', '10:15',
      '10:50', '11:25', '12:00', '12:35', '13:10', '13:45', '14:20', '14:55',
      '15:30', '16:05', '16:40', '17:15', '17:50', '18:25', '19:00', '19:35',
      '20:10', '20:45', '21:20', '22:00', '22:40', '23:10'
    ]
  },
  {
    code: '015',
    name: 'Línea 015: Santa Cruz - La Laguna (Directo Autopista TF-5)',
    origin: 'Intercambiador Santa Cruz',
    destination: 'Intercambiador La Laguna',
    ramal: 'Ramal Directo TF-5 sin paradas intermedias',
    frequency: 'Cada 15 min (De 05:45 a 23:15)',
    type: 'express',
    zone: 'Santa Cruz / La Laguna Directo',
    stopName: 'Intercambiador La Laguna (#4001)',
    status: 'En ruta',
    color: 'blue',
    fullSchedule: [
      '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45',
      '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00',
      '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15',
      '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30',
      '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45',
      '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00',
      '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:30',
      '22:00', '22:30', '23:15'
    ]
  },
  {
    code: '105',
    name: 'Línea 105: Santa Cruz - La Laguna - Tejina - Bajamar - Punta del Hidalgo',
    origin: 'Intercambiador Santa Cruz',
    destination: 'Punta del Hidalgo (Costa Norte)',
    ramal: 'Ramal Costero Norte por La Laguna, Tegueste, Tejina y Bajamar',
    frequency: 'Cada 30 min (De 06:10 a 23:00)',
    type: 'diurno',
    zone: 'Santa Cruz / Tejina / Bajamar / Punta Hidalgo',
    stopName: 'Parada La Punta del Hidalgo (#4300)',
    status: 'Puntual',
    color: 'teal',
    fullSchedule: [
      '06:10', '06:40', '07:10', '07:40', '08:10', '08:40', '09:10', '09:40', '10:10',
      '10:40', '11:10', '11:40', '12:10', '12:40', '13:10', '13:40', '14:10', '14:40',
      '15:10', '15:40', '16:10', '16:40', '17:10', '17:40', '18:10', '18:40', '19:10',
      '19:40', '20:10', '20:40', '21:10', '21:45', '22:20', '23:00'
    ]
  },
  {
    code: '110',
    name: 'Línea 110: Aero-Express Sur (Santa Cruz - Los Cristianos - Costa Adeje Directo)',
    origin: 'Intercambiador Santa Cruz',
    destination: 'Estación Costa Adeje (Directo Sur)',
    ramal: 'Autopista Sur TF-1 Directa Express',
    frequency: 'Cada 30 min (De 06:00 a 23:00)',
    type: 'express',
    zone: 'Santa Cruz / Los Cristianos / Costa Adeje',
    stopName: 'Estación Los Cristianos (#7100)',
    status: 'En ruta',
    color: 'rose',
    fullSchedule: [
      '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00',
      '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00',
      '19:30', '20:00', '20:30', '21:00', '21:30', '22:15', '23:00'
    ]
  },
  {
    code: '103',
    name: 'Línea 103: Santa Cruz - La Laguna - Puerto de la Cruz (Directo Norte)',
    origin: 'Intercambiador Santa Cruz',
    destination: 'Estación Puerto de la Cruz',
    ramal: 'Autopista Norte TF-5 Directo Express',
    frequency: 'Cada 15-30 min (De 06:00 a 23:00)',
    type: 'express',
    zone: 'Santa Cruz / La Laguna / Puerto de la Cruz',
    stopName: 'Estación Puerto de la Cruz (#4500)',
    status: 'Puntual',
    color: 'sky',
    fullSchedule: [
      '06:00', '06:30', '07:00', '07:15', '07:30', '07:45', '08:00', '08:30', '09:00',
      '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
      '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30',
      '23:00'
    ]
  },
  {
    code: '473',
    name: 'Línea 473: Los Cristianos - Costa Adeje - Playa San Juan - Los Gigantes',
    origin: 'Estación Los Cristianos',
    destination: 'Acantilados de Los Gigantes (Santiago del Teide)',
    ramal: 'Ruta Costera Suroeste TF-47',
    frequency: 'Cada 30 min (De 05:45 a 23:15)',
    type: 'diurno',
    zone: 'Costa Adeje / Guía de Isora / Los Gigantes',
    stopName: 'Estación Costa Adeje (#7001) & Los Gigantes (#8200)',
    status: 'Puntual',
    color: 'amber',
    fullSchedule: [
      '05:45', '06:15', '06:45', '07:15', '07:45', '08:15', '08:45', '09:15', '09:45',
      '10:15', '10:45', '11:15', '11:45', '12:15', '12:45', '13:15', '13:45', '14:15',
      '14:45', '15:15', '15:45', '16:15', '16:45', '17:15', '17:45', '18:15', '18:45',
      '19:15', '19:45', '20:15', '20:45', '21:15', '21:45', '22:15', '22:45', '23:15'
    ]
  }
];

// 2. Specific Stops Database with 01:00 to 23:00 real timetable steps
export const TITSA_SPECIFIC_STOPS: SpecificStop[] = [
  {
    id: 'casetera-1',
    code: '#4160',
    name: 'Parada Casetera (Tejina) - Arriba de Calle Spoleto (Ida / Bajada a Bajamar)',
    location: 'Tejina - Casetera Principal (Arriba de Calle Spoleto)',
    lines: ['050', '057', '224', '051'],
    description: 'Parada de Casetera situada arriba de la Calle Spoleto, para ir hacia Bajamar, Punta del Hidalgo o el Instituto.',
    isHighlight: true,
    scheduleByLine: {
      '050': [
        '01:00', '02:30', '05:40', '06:15', '06:45', '07:15', '07:45', '08:15', '08:45',
        '09:15', '09:45', '10:15', '10:45', '11:15', '11:45', '12:15', '12:45', '13:15',
        '13:45', '14:15', '14:45', '15:15', '15:45', '16:15', '16:45', '17:15', '17:45',
        '18:15', '18:45', '19:15', '19:45', '20:15', '20:45', '21:15', '21:50', '22:25',
        '23:10', '23:40'
      ],
      '057': [
        '01:25', '06:15', '06:40', '07:05', '07:30', '07:55', '08:20', '08:45', '09:10',
        '09:35', '10:00', '10:25', '10:50', '11:15', '11:40', '12:05', '12:30', '12:55',
        '13:20', '13:45', '14:10', '14:35', '15:00', '15:25', '15:50', '16:15', '16:40',
        '17:05', '17:30', '17:55', '18:20', '18:45', '19:10', '19:35', '20:00', '20:25',
        '20:50', '21:15', '21:45', '22:20', '23:00', '23:25'
      ],
      '224': [
        '06:25', '07:10', '07:55', '08:40', '09:25', '10:10', '10:55', '11:40',
        '12:25', '13:10', '13:55', '14:40', '15:25', '16:10', '16:55', '17:40',
        '18:25', '19:10', '19:55', '20:40', '21:25', '22:10', '22:55'
      ],
      '051': [
        '06:20', '06:55', '07:30', '08:05', '08:40', '09:15', '09:50', '10:25',
        '11:00', '11:35', '12:10', '12:45', '13:20', '13:55', '14:30', '15:05',
        '15:40', '16:15', '16:50', '17:25', '18:00', '18:35', '19:10', '19:45',
        '20:20', '20:55', '21:30', '22:10', '22:50', '23:20'
      ]
    }
  },
  {
    id: 'casetera-2',
    code: '#4161',
    name: 'Parada Casetera (Tejina) - Lado Iglesia (Vuelta / Subida desde Bajamar a Tejina)',
    location: 'Tejina - Casetera Lado Iglesia (Subir desde Bajamar a Tejina)',
    lines: ['050', '057', '224'],
    description: 'Parada de Casetera situada en el lado de la Iglesia, ideal al subir en guagua de regreso desde Bajamar hacia el centro de Tejina.',
    isHighlight: true,
    scheduleByLine: {
      '050': [
        '01:10', '02:40', '05:48', '06:23', '06:53', '07:23', '07:53', '08:23', '08:53',
        '09:23', '09:53', '10:23', '10:53', '11:23', '11:53', '12:23', '12:53', '13:23',
        '13:53', '14:23', '14:53', '15:23', '15:53', '16:23', '16:53', '17:23', '17:53',
        '18:23', '18:53', '19:23', '19:53', '20:23', '20:53', '21:23', '21:58', '22:33',
        '23:18', '23:48'
      ],
      '057': [
        '01:30', '06:20', '06:45', '07:10', '07:35', '08:00', '08:25', '08:50', '09:15',
        '09:40', '10:05', '10:30', '10:55', '11:20', '11:45', '12:10', '12:35', '13:00',
        '13:25', '13:50', '14:15', '14:40', '15:05', '15:30', '15:55', '16:20', '16:45',
        '17:10', '17:35', '18:00', '18:25', '18:50', '19:15', '19:40', '20:05', '20:30',
        '20:55', '21:20', '21:50', '22:25', '23:05', '23:30'
      ],
      '224': [
        '06:30', '07:15', '08:00', '08:45', '09:30', '10:15', '11:00', '11:45',
        '12:30', '13:15', '14:00', '14:45', '15:30', '16:15', '17:00', '17:45',
        '18:30', '19:15', '20:00', '20:45', '21:30', '22:15', '23:00'
      ]
    }
  },
  {
    id: 'tejina-centro',
    code: '#4150',
    name: 'Parada Tejina Centro / Plaza de Tejina',
    location: 'Tejina - Cuatro Caminos / Plaza',
    lines: ['050', '051', '057', '224', '105'],
    description: 'Parada central de Tejina frente a la plaza y zona comercial.',
    isHighlight: true,
    scheduleByLine: {
      '050': [
        '01:05', '02:35', '05:35', '06:10', '06:40', '07:10', '07:40', '08:10', '08:40',
        '09:10', '09:40', '10:10', '10:40', '11:10', '11:40', '12:10', '12:40', '13:10',
        '13:40', '14:10', '14:40', '15:10', '15:40', '16:10', '16:40', '17:10', '17:40',
        '18:10', '18:40', '19:10', '19:40', '20:10', '20:40', '21:10', '21:45', '22:20',
        '23:05', '23:35'
      ],
      '057': [
        '01:20', '06:10', '06:35', '07:00', '07:25', '07:50', '08:15', '08:40', '09:05',
        '09:30', '09:55', '10:20', '10:45', '11:10', '11:35', '12:00', '12:25', '12:50',
        '13:15', '13:40', '14:05', '14:30', '14:55', '15:20', '15:45', '16:10', '16:35',
        '17:00', '17:25', '17:50', '18:15', '18:40', '19:05', '19:30', '19:55', '20:20',
        '20:45', '21:10', '21:40', '22:15', '22:55', '23:20'
      ],
      '105': [
        '06:25', '06:55', '07:25', '07:55', '08:25', '08:55', '09:25', '09:55', '10:25',
        '10:55', '11:25', '11:55', '12:25', '12:55', '13:25', '13:55', '14:25', '14:55',
        '15:25', '15:55', '16:25', '16:55', '17:25', '17:55', '18:25', '18:55', '19:25',
        '19:55', '20:25', '20:55', '21:25', '22:00', '22:35', '23:15'
      ]
    }
  },
  {
    id: 'el-ramal',
    code: '#4155',
    name: 'Parada El Ramal (Tejina / Valle de Guerra)',
    location: 'Tejina - Cruce El Ramal',
    lines: ['050', '057', '224'],
    description: 'Punto estratégico de bifurcación entre Tejina y Valle de Guerra.',
    isHighlight: true,
    scheduleByLine: {
      '057': [
        '01:18', '06:08', '06:33', '06:58', '07:23', '07:48', '08:13', '08:38', '09:03',
        '09:28', '09:53', '10:18', '10:43', '11:08', '11:33', '11:58', '12:23', '12:48',
        '13:13', '13:38', '14:03', '14:28', '14:53', '15:18', '15:43', '16:08', '16:33',
        '16:58', '17:23', '17:48', '18:13', '18:38', '19:03', '19:28', '19:53', '20:18',
        '20:43', '21:08', '21:38', '22:13', '22:53', '23:18'
      ],
      '224': [
        '06:22', '07:07', '07:52', '08:37', '09:22', '10:07', '10:52', '11:37',
        '12:22', '13:07', '13:52', '14:37', '15:22', '16:07', '16:52', '17:37',
        '18:22', '19:07', '19:52', '20:37', '21:22', '22:07', '22:52'
      ]
    }
  },
  {
    id: 'instituto-1',
    code: '#4170',
    name: 'Parada del Instituto (IES Tejina Principal)',
    location: 'Tejina - IES Antonio González',
    lines: ['050', '057', '224'],
    description: 'Parada de acceso principal al Instituto de Educación Secundaria IES Tejina.',
    isHighlight: true,
    scheduleByLine: {
      '224': [
        '06:20', '07:05', '07:50', '08:35', '09:20', '10:05', '10:50', '11:35',
        '12:20', '13:05', '13:50', '14:35', '15:20', '16:05', '16:50', '17:35',
        '18:20', '19:05', '19:50', '20:35', '21:20', '22:05', '22:50'
      ],
      '057': [
        '01:22', '06:12', '06:37', '07:02', '07:27', '07:52', '08:17', '08:42', '09:07',
        '09:32', '09:57', '10:22', '10:47', '11:12', '11:37', '12:02', '12:27', '12:52',
        '13:17', '13:42', '14:07', '14:32', '14:57', '15:22', '15:47', '16:12', '16:37',
        '17:02', '17:27', '17:52', '18:17', '18:42', '19:07', '19:32', '19:57', '20:22',
        '20:47', '21:12', '21:42', '22:17', '22:57', '23:22'
      ]
    }
  },
  {
    id: 'instituto-2',
    code: '#4171',
    name: 'Parada la otra del Instituto (IES Tejina Secundario)',
    location: 'Tejina - Camino del Instituto',
    lines: ['050', '057'],
    description: 'Parada secundaria del Instituto en la zona este para alumnos y vecinos del entorno.',
    isHighlight: true,
    scheduleByLine: {
      '050': [
        '01:08', '02:38', '05:38', '06:13', '06:43', '07:13', '07:43', '08:13', '08:43',
        '09:13', '09:43', '10:13', '10:43', '11:13', '11:43', '12:13', '12:43', '13:13',
        '13:43', '14:13', '14:43', '15:13', '15:43', '16:13', '16:43', '17:13', '17:43',
        '18:13', '18:43', '19:13', '19:43', '20:13', '20:43', '21:13', '21:48', '22:23',
        '23:08', '23:38'
      ]
    }
  },
  {
    id: 'moya-valle-guerra',
    code: '#4185',
    name: 'Parada de Moya (Valle de Guerra)',
    location: 'Valle de Guerra - Sector Moya',
    lines: ['057', '224'],
    description: 'Parada de Moya en Valle de Guerra, clave para vecinos de la TF-161 y zonas agrícolas.',
    isHighlight: true,
    scheduleByLine: {
      '057': [
        '01:12', '06:05', '06:30', '06:55', '07:20', '07:45', '08:10', '08:35', '09:00',
        '09:25', '09:50', '10:15', '10:40', '11:05', '11:30', '11:55', '12:20', '12:45',
        '13:10', '13:35', '14:00', '14:25', '14:50', '15:15', '15:40', '16:05', '16:30',
        '16:55', '17:20', '17:45', '18:10', '18:35', '19:00', '19:25', '19:50', '20:15',
        '20:40', '21:05', '21:35', '22:10', '22:50', '23:14'
      ]
    }
  },
  {
    id: 'parada-4294',
    code: '#4294',
    name: 'Parada TF-161 - Cruce Las Toscas (#4294)',
    location: 'Cruce Las Toscas - Línea 057',
    lines: ['057'],
    description: 'Parada para la línea 057 de ida y vuelta, clave para la conexión rápida en el sector Las Toscas / Tejina.',
    isHighlight: true,
    scheduleByLine: {
      '057': [
        '01:14', '06:07', '06:32', '06:57', '07:22', '07:47', '08:12', '08:37', '09:02',
        '09:27', '09:52', '10:17', '10:42', '11:07', '11:32', '11:57', '12:22', '12:47',
        '13:12', '13:37', '14:02', '14:27', '14:52', '15:17', '15:42', '16:07', '16:32',
        '16:57', '17:22', '17:47', '18:12', '18:37', '19:02', '19:27', '19:52', '20:17',
        '20:42', '21:07', '21:37', '22:12', '22:52', '23:16'
      ]
    }
  },
  {
    id: 'bajamar-piscinas',
    code: '#4120',
    name: 'Parada Bajamar Centro (Piscinas Naturales)',
    location: 'Bajamar - Av. del Sol',
    lines: ['050', '105'],
    description: 'Parada costera en Bajamar junto a las piscinas naturales.',
    isHighlight: false,
    scheduleByLine: {
      '050': [
        '01:15', '02:45', '05:55', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00',
        '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
        '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:35', '22:10', '22:45',
        '23:25', '23:55'
      ],
      '105': [
        '06:35', '07:05', '07:35', '08:05', '08:35', '09:05', '09:35', '10:05', '10:35',
        '11:05', '11:35', '12:05', '12:35', '13:05', '13:35', '14:05', '14:35', '15:05',
        '15:35', '16:05', '16:35', '17:05', '17:35', '18:05', '18:35', '19:05', '19:35',
        '20:05', '20:35', '21:05', '21:35', '22:10', '22:45', '23:25'
      ]
    }
  },
  {
    id: 'punta-hidalgo',
    code: '#4300',
    name: 'Parada Punta del Hidalgo (Playa / Faro)',
    location: 'La Punta del Hidalgo',
    lines: ['105', '050'],
    description: 'Término de línea costera en Punta del Hidalgo.',
    isHighlight: false,
    scheduleByLine: {
      '050': [
        '01:25', '02:55', '06:05', '06:40', '07:10', '07:40', '08:10', '08:40', '09:10',
        '09:40', '10:10', '10:40', '11:10', '11:40', '12:10', '12:40', '13:10', '13:40',
        '14:10', '14:40', '15:10', '15:40', '16:10', '16:40', '17:10', '17:40', '18:10',
        '18:40', '19:10', '19:40', '20:10', '20:40', '21:10', '21:45', '22:20', '22:55',
        '23:35'
      ]
    }
  },
  {
    id: 'intercambiador-laguna',
    code: '#4001',
    name: 'Parada Intercambiador La Laguna',
    location: 'La Laguna - Estación Central',
    lines: ['014', '015', '050', '057', '103', '224'],
    description: 'Estación central de trasbordos comarcal y metropolitana de La Laguna.',
    isHighlight: false,
    scheduleByLine: {
      '014': [
        '01:00', '01:45', '02:30', '03:15', '04:00', '04:45', '05:30', '06:00', '06:15',
        '06:30', '07:00', '07:15', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
        '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
        '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '23:55'
      ]
    }
  }
];

export const TitsaBusView: React.FC<TitsaBusViewProps> = ({ emotionMode }) => {
  const [activeSubTab, setActiveSubTab] = useState<'realtime' | 'fullTimetable' | 'stops' | 'tides'>('realtime');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLine, setSelectedLine] = useState<BusLineInfo>(TITSA_LINES[0]);
  const [selectedStopId, setSelectedStopId] = useState<string>('casetera-1');
  const [timeBandFilter, setTimeBandFilter] = useState<'all' | 'night' | 'morning' | 'afternoon' | 'evening'>('all');
  const [specificHourFilter, setSpecificHourFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [simulatedTimeStr, setSimulatedTimeStr] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      if (!simulatedTimeStr) {
        setCurrentTime(new Date());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [simulatedTimeStr]);

  const handleSimulateTime = (timeStr: string) => {
    setSimulatedTimeStr(timeStr);
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    setCurrentTime(d);
  };

  const handleResetRealTime = () => {
    setSimulatedTimeStr(null);
    setCurrentTime(new Date());
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 500);
  };

  // Convert time "HH:MM" to minutes from 00:00
  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Calculate live countdown and status for any scheduled time
  const calculateDepartureLive = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const nowH = currentTime.getHours();
    const nowM = currentTime.getMinutes();
    const nowS = currentTime.getSeconds();

    const nowTotalSec = nowH * 3600 + nowM * 60 + nowS;
    const targetTotalSec = h * 3600 + m * 60;

    let diffSec = targetTotalSec - nowTotalSec;
    // If time is earlier today, consider it tomorrow (or past if reviewing schedule)
    const isPastToday = diffSec < 0;
    if (diffSec < 0) {
      diffSec += 24 * 3600;
    }

    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    return {
      timeStr,
      hours,
      minutes,
      seconds,
      diffSec,
      isPastToday,
      isImminent: diffSec <= 180, // within 3 minutes
      isArriving: diffSec <= 60, // within 1 minute
      badgeText:
        diffSec <= 60
          ? '¡Llegando ahora!'
          : diffSec <= 300
          ? `Llega en ${minutes} min`
          : hours > 0
          ? `En ${hours} h ${minutes} min`
          : `En ${minutes} min ${seconds} s`
    };
  };

  // Get upcoming departures from a schedule list starting from current time
  const getUpcomingDepartures = (schedule: string[], count = 6) => {
    const currentMin = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    // Sort upcoming times
    const upcoming = schedule
      .map(t => ({
        timeStr: t,
        diffMin: timeToMinutes(t) - currentMin >= 0 
          ? timeToMinutes(t) - currentMin 
          : timeToMinutes(t) - currentMin + 24 * 60
      }))
      .sort((a, b) => a.diffMin - b.diffMin)
      .slice(0, count);

    return upcoming.map(item => calculateDepartureLive(item.timeStr));
  };

  // Filter lines by search and type
  const filteredLines = useMemo(() => {
    return TITSA_LINES.filter(line => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        line.code.toLowerCase().includes(term) ||
        line.name.toLowerCase().includes(term) ||
        line.ramal.toLowerCase().includes(term) ||
        line.destination.toLowerCase().includes(term) ||
        line.zone.toLowerCase().includes(term) ||
        line.stopName.toLowerCase().includes(term) ||
        line.fullSchedule.some(t => t.includes(term))
      );
    });
  }, [searchTerm]);

  // Filter schedules based on time band (1:00 to 23:00)
  const filterScheduleByBand = (schedule: string[]) => {
    return schedule.filter(timeStr => {
      const hour = parseInt(timeStr.split(':')[0], 10);
      
      if (specificHourFilter !== 'all') {
        const targetHour = parseInt(specificHourFilter, 10);
        if (hour !== targetHour) return false;
      }

      if (timeBandFilter === 'night') {
        // 01:00 to 05:59 and 22:00 to 23:59
        return (hour >= 1 && hour < 6) || (hour >= 22 && hour <= 23);
      }
      if (timeBandFilter === 'morning') {
        // 06:00 to 11:59
        return hour >= 6 && hour < 12;
      }
      if (timeBandFilter === 'afternoon') {
        // 12:00 to 17:59
        return hour >= 12 && hour < 18;
      }
      if (timeBandFilter === 'evening') {
        // 18:00 to 23:59
        return hour >= 18 && hour <= 23;
      }
      return true;
    });
  };

  // Selected stop info
  const selectedStop = TITSA_SPECIFIC_STOPS.find(s => s.id === selectedStopId) || TITSA_SPECIFIC_STOPS[0];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-6">
      {/* Header Banner with Real-Time Clock & 1:00 AM to 23:00 PM Info */}
      <div className="bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 border border-blue-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-md">
                <Bus className="w-5 h-5" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                Red Oficial TITSA Tenerife • Canarias
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold flex items-center gap-1.5 shadow-inner">
                <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                <span>Hora Activa: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                {simulatedTimeStr && <span className="text-[10px] bg-amber-500 text-stone-950 px-1.5 rounded font-bold">Simulada</span>}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Horarios 01:00 AM - 23:00 PM Activos
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 mb-1">
              TITSA Tiempo Real & Horario Completo (1:00 AM a 23:00 PM)
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
              Consulta en tiempo real todas las salidas, estimaciones de llegada minuto a minuto, servicio nocturno de madrugada (01:00 - 05:30) y servicio regular continuo hasta las 23:00+ en Tejina, Casetera, Moya, La Laguna, Santa Cruz y toda la isla de Tenerife.
            </p>
          </div>

          {/* Quick Simulation & Synchronize bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={handleRefresh}
              className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg transition-all cursor-pointer ${
                isRefreshing ? 'opacity-70' : ''
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Sincronizar ({lastUpdated})</span>
            </button>
            {simulatedTimeStr && (
              <button
                onClick={handleResetRealTime}
                className="px-3 py-2.5 rounded-xl bg-rose-600/30 text-rose-200 border border-rose-500/40 text-xs font-semibold hover:bg-rose-600/40 transition-all cursor-pointer text-center"
              >
                Volver a Hora Real
              </button>
            )}
          </div>
        </div>

        {/* Time Simulator Quick Jump (1:00 AM to 23:00 PM) */}
        <div className="mt-4 pt-4 border-t border-stone-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-400 font-mono flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Salto Rápido de Horario:
          </span>
          {[
            { label: '01:00 (Madrugada)', val: '01:00' },
            { label: '03:15 (Nocturno)', val: '03:15' },
            { label: '06:30 (Mañana)', val: '06:30' },
            { label: '11:05 (Mediodía)', val: '11:05' },
            { label: '14:30 (Tarde)', val: '14:30' },
            { label: '19:15 (Tarde/Noche)', val: '19:15' },
            { label: '23:00 (Últimas)', val: '23:00' }
          ].map(btn => (
            <button
              key={btn.val}
              onClick={() => handleSimulateTime(btn.val)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                simulatedTimeStr === btn.val
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'bg-stone-900/80 text-stone-300 border border-stone-800 hover:border-amber-500/40 hover:bg-stone-800'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-stone-900/60 p-2 rounded-2xl border border-stone-800 backdrop-blur-xl">
        <button
          onClick={() => setActiveSubTab('realtime')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeSubTab === 'realtime'
              ? 'bg-blue-600 text-white font-bold shadow-lg'
              : 'text-stone-300 hover:bg-stone-800/80'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Tiempo Real & Próximas Salidas</span>
        </button>

        <button
          onClick={() => setActiveSubTab('fullTimetable')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeSubTab === 'fullTimetable'
              ? 'bg-amber-500 text-stone-950 font-bold shadow-lg'
              : 'text-stone-300 hover:bg-stone-800/80'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Parrilla Completa (1:00 AM a 23:00 PM)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('stops')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeSubTab === 'stops'
              ? 'bg-indigo-600 text-white font-bold shadow-lg'
              : 'text-stone-300 hover:bg-stone-800/80'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Paradas Clave (Casetera, Moya, IES)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tides')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
            activeSubTab === 'tides'
              ? 'bg-teal-600 text-white font-bold shadow-lg'
              : 'text-stone-300 hover:bg-stone-800/80'
          }`}
        >
          <Waves className="w-4 h-4" />
          <span>Mareas & Estado del Mar (Bajamar)</span>
        </button>
      </div>

      {/* TAB 1: Real-Time & Live Countdown for Lines */}
      {activeSubTab === 'realtime' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-900/60 p-4 rounded-2xl border border-stone-800 backdrop-blur-xl">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar línea (050, 014, 057, 711...), destino o parada..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
              <span className="text-xs text-stone-400 font-mono mr-1">Filtrar:</span>
              <button
                onClick={() => setTimeBandFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  timeBandFilter === 'all'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-stone-950 text-stone-300 border border-stone-800 hover:border-blue-500/40'
                }`}
              >
                Todas las Horas
              </button>
              <button
                onClick={() => setTimeBandFilter('night')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                  timeBandFilter === 'night'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-stone-950 text-stone-300 border border-stone-800 hover:border-purple-500/40'
                }`}
              >
                <Moon className="w-3 h-3" />
                Madrugada (01:00 - 06:00)
              </button>
              <button
                onClick={() => setTimeBandFilter('morning')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                  timeBandFilter === 'morning'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-stone-950 text-stone-300 border border-stone-800 hover:border-amber-500/40'
                }`}
              >
                <Sun className="w-3 h-3" />
                Mañana (06:00 - 12:00)
              </button>
              <button
                onClick={() => setTimeBandFilter('evening')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                  timeBandFilter === 'evening'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-stone-950 text-stone-300 border border-stone-800 hover:border-indigo-500/40'
                }`}
              >
                <Sunset className="w-3 h-3" />
                Noche (18:00 - 23:00)
              </button>
            </div>
          </div>

          {/* Main Grid: Lines & Selected Line live monitor */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Line Cards */}
            <div className="lg:col-span-2 space-y-3.5 max-h-[750px] overflow-y-auto pr-1">
              {filteredLines.map((line) => {
                const upcoming = getUpcomingDepartures(line.fullSchedule, 3);
                const nextPass = upcoming[0];
                const isSelected = selectedLine?.code === line.code;

                return (
                  <div
                    key={line.code}
                    onClick={() => setSelectedLine(line)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer backdrop-blur-xl ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500/70 shadow-lg shadow-blue-500/10'
                        : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 flex items-center justify-center font-bold text-base font-mono shadow-inner">
                          {line.code}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-stone-100">{line.name}</h3>
                            {line.type === 'nocturno_24h' && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1">
                                <Moon className="w-2.5 h-2.5" /> 24 Horas
                              </span>
                            )}
                            {line.type === 'express' && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                                Directo Express
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-blue-400 font-medium mt-0.5">
                            {line.ramal}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          {line.status}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-stone-800 text-stone-300 font-mono">
                          {line.frequency}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-800/80 text-xs">
                      <div>
                        <span className="text-stone-400 block mb-0.5">Parada Principal:</span>
                        <span className="text-stone-200 font-medium flex items-center gap-1 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          {line.stopName}
                        </span>
                      </div>

                      <div>
                        <span className="text-stone-400 block mb-1">Próximas salidas calculadas en directo:</span>
                        <div className="space-y-1">
                          {upcoming.map((dep, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center justify-between px-2.5 py-1 rounded-lg text-xs font-mono ${
                                idx === 0
                                  ? 'bg-blue-950/60 border border-blue-500/30 text-blue-200 font-bold'
                                  : 'bg-stone-950 text-stone-300'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-blue-400" />
                                {dep.timeStr} h
                              </span>
                              <span className={idx === 0 ? 'text-emerald-400 font-bold' : 'text-stone-400'}>
                                {dep.badgeText}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Col: Detailed Line Live Monitor & 24H Overview */}
            <div className="space-y-4">
              {selectedLine && (
                <div className="bg-stone-900/80 border border-blue-500/30 rounded-3xl p-5 backdrop-blur-xl shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-mono font-bold text-lg">
                        {selectedLine.code}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-stone-100 text-sm">{selectedLine.name}</h4>
                        <span className="text-[11px] text-stone-400">{selectedLine.zone}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                      En Servicio
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-stone-300">
                    <p><strong className="text-stone-200">Origen:</strong> {selectedLine.origin}</p>
                    <p><strong className="text-stone-200">Destino:</strong> {selectedLine.destination}</p>
                    <p><strong className="text-stone-200">Ramal:</strong> {selectedLine.ramal}</p>
                    <p><strong className="text-stone-200">Frecuencia:</strong> {selectedLine.frequency}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                    <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Próximas 6 Salidas desde Ahora ({currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                      {getUpcomingDepartures(selectedLine.fullSchedule, 6).map((dep, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                            idx === 0
                              ? 'bg-blue-950/70 border border-blue-500/40 text-blue-200 font-bold'
                              : 'bg-stone-900 border border-stone-800/80 text-stone-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] font-mono font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-mono text-stone-100 font-bold">{dep.timeStr} h</span>
                          </div>
                          <span className={idx === 0 ? 'text-emerald-400 font-bold font-mono' : 'text-stone-400 font-mono text-[11px]'}>
                            {dep.badgeText}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-950/30 border border-blue-500/20 p-3 rounded-2xl text-[11px] text-blue-200 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-blue-400" />
                      Cobertura de Horario:
                    </p>
                    <p className="text-stone-300">
                      Total de <strong>{selectedLine.fullSchedule.length} expediciones programadas</strong> entre las <strong>01:00 AM y las 23:00 PM</strong> con seguimiento de tiempos en vivo.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Full Timetable Matrix (1:00 AM to 23:00 PM) */}
      {activeSubTab === 'fullTimetable' && (
        <div className="space-y-6">
          <div className="bg-stone-900/80 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  Parrilla Completa de Horarios (1:00 AM a 23:00 PM)
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Visualiza todas las expediciones programadas a lo largo de las 24 horas del día.
                </p>
              </div>

              {/* Line Selector for Timetable */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-stone-400 font-mono">Seleccionar Línea:</span>
                <select
                  value={selectedLine?.code}
                  onChange={(e) => {
                    const l = TITSA_LINES.find(x => x.code === e.target.value);
                    if (l) setSelectedLine(l);
                  }}
                  className="bg-stone-950 border border-stone-800 text-stone-100 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500"
                >
                  {TITSA_LINES.map(l => (
                    <option key={l.code} value={l.code}>
                      Línea {l.code} - {l.destination}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hourly Filter Bar (01:00 to 23:00) */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-stone-300 font-mono flex items-center gap-1">
                  <ListFilter className="w-3.5 h-3.5 text-amber-400" />
                  Filtrar por Franja o por Hora Específica:
                </span>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => { setTimeBandFilter('all'); setSpecificHourFilter('all'); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      timeBandFilter === 'all' && specificHourFilter === 'all'
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-950 text-stone-300 border border-stone-800 hover:bg-stone-800'
                    }`}
                  >
                    Ver Todo (1:00 - 23:59)
                  </button>
                  <button
                    onClick={() => { setTimeBandFilter('night'); setSpecificHourFilter('all'); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      timeBandFilter === 'night'
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-stone-950 text-stone-300 border border-stone-800'
                    }`}
                  >
                    <Moon className="w-3 h-3" /> Madrugada (1:00-6:00)
                  </button>
                  <button
                    onClick={() => { setTimeBandFilter('morning'); setSpecificHourFilter('all'); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      timeBandFilter === 'morning'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-stone-950 text-stone-300 border border-stone-800'
                    }`}
                  >
                    <Sun className="w-3 h-3" /> Mañana (6:00-12:00)
                  </button>
                  <button
                    onClick={() => { setTimeBandFilter('afternoon'); setSpecificHourFilter('all'); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      timeBandFilter === 'afternoon'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-stone-950 text-stone-300 border border-stone-800'
                    }`}
                  >
                    Tarde (12:00-18:00)
                  </button>
                  <button
                    onClick={() => { setTimeBandFilter('evening'); setSpecificHourFilter('all'); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      timeBandFilter === 'evening'
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-stone-950 text-stone-300 border border-stone-800'
                    }`}
                  >
                    <Sunset className="w-3 h-3" /> Noche (18:00-23:00)
                  </button>
                </div>
              </div>

              {/* Hour-by-Hour Badges 01 to 23 */}
              <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-stone-950 border border-stone-800/80">
                <span className="text-[11px] text-stone-400 font-mono py-1 px-1.5">Hora exacta:</span>
                {Array.from({ length: 23 }, (_, i) => {
                  const h = i + 1; // 1 to 23
                  const hStr = String(h).padStart(2, '0');
                  const isSelected = specificHourFilter === String(h);
                  return (
                    <button
                      key={h}
                      onClick={() => {
                        setSpecificHourFilter(isSelected ? 'all' : String(h));
                        setTimeBandFilter('all');
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'bg-stone-900 text-stone-300 border border-stone-800 hover:border-amber-500/40'
                      }`}
                    >
                      {hStr}:00
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Line Schedule Grid */}
            {selectedLine && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-200 font-mono">
                    Horarios para Línea {selectedLine.code} ({filterScheduleByBand(selectedLine.fullSchedule).length} salidas mostradas):
                  </span>
                  <span className="text-xs text-amber-400 font-mono">
                    Hora actual de referencia: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  {filterScheduleByBand(selectedLine.fullSchedule).map((timeStr, idx) => {
                    const status = calculateDepartureLive(timeStr);
                    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
                    const depMinutes = timeToMinutes(timeStr);
                    const isUpcoming = depMinutes >= currentMinutes && depMinutes <= currentMinutes + 90;
                    const isPassedToday = depMinutes < currentMinutes;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                          isUpcoming
                            ? 'bg-amber-950/30 border-amber-500/60 shadow-md shadow-amber-500/10'
                            : isPassedToday
                            ? 'bg-stone-950/40 border-stone-900 opacity-60'
                            : 'bg-stone-950/80 border-stone-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-mono font-bold text-stone-100 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {timeStr} h
                          </span>
                          {parseInt(timeStr.split(':')[0], 10) < 6 ? (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 py-0.2 rounded font-semibold">
                              Nocturna
                            </span>
                          ) : (
                            <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 py-0.2 rounded">
                              Regular
                            </span>
                          )}
                        </div>

                        <div className="text-[11px]">
                          {isUpcoming ? (
                            <span className="text-emerald-400 font-bold font-mono block">
                              {status.badgeText}
                            </span>
                          ) : isPassedToday ? (
                            <span className="text-stone-500 font-mono text-[10px] block">
                              Ya realizada hoy
                            </span>
                          ) : (
                            <span className="text-stone-400 font-mono text-[10px] block">
                              Salida posterior
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Specific Stops (Casetera, Moya, IES Tejina, etc.) */}
      {activeSubTab === 'stops' && (
        <div className="space-y-6">
          <div className="bg-stone-900/80 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  Paradas Clave Monitoreadas (Horarios 1:00 AM - 23:00 PM)
                </h3>
                <p className="text-xs text-stone-400">
                  Monitoreo directo en Casetera, Al lado de Casetera, Tejina Centro, El Ramal, IES Tejina y Moya
                </p>
              </div>

              {/* Stop Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {TITSA_SPECIFIC_STOPS.slice(0, 8).map(st => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStopId(st.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      selectedStopId === st.id
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                        : 'bg-stone-950 text-stone-300 border border-stone-800 hover:border-amber-500/50'
                    }`}
                  >
                    {st.name.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Stop Details and Schedules */}
            {selectedStop && (
              <div className="bg-stone-950/80 border border-amber-500/40 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-md inline-block mb-1">
                      Código Parada {selectedStop.code}
                    </span>
                    <h4 className="font-serif font-bold text-stone-100 text-base">{selectedStop.name}</h4>
                    <p className="text-xs text-stone-400">{selectedStop.location} • {selectedStop.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {selectedStop.lines.map(ln => (
                      <span key={ln} className="text-xs font-bold font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded-lg">
                        Línea {ln}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Schedule per line passing through this stop */}
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-300 block font-mono">
                    Parrilla Horaria Completa de 1:00 AM a 23:00 PM por Línea:
                  </span>

                  {Object.entries(selectedStop.scheduleByLine).map(([lineCode, times]) => {
                    const upcoming = getUpcomingDepartures(times, 3);
                    return (
                      <div key={lineCode} className="bg-stone-900/90 p-4 rounded-xl border border-stone-800 space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs">
                              Línea {lineCode}
                            </span>
                            <span className="text-xs text-stone-300 font-medium">
                              Próximo paso en esta parada:
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {upcoming.map((dep, i) => (
                              <span
                                key={i}
                                className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                                  i === 0
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                                    : 'bg-stone-950 text-stone-400'
                                }`}
                              >
                                {dep.timeStr} h ({dep.badgeText})
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* All Hours Pills for this line on this stop */}
                        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-stone-800/80">
                          {times.map((t, idx) => {
                            const curMin = currentTime.getHours() * 60 + currentTime.getMinutes();
                            const depMin = timeToMinutes(t);
                            const isNext = depMin >= curMin && depMin <= curMin + 45;
                            return (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                                  isNext
                                    ? 'bg-emerald-500 text-stone-950 font-bold shadow-md'
                                    : parseInt(t.split(':')[0], 10) < 6
                                    ? 'bg-purple-950/60 text-purple-300 border border-purple-800'
                                    : 'bg-stone-950 text-stone-300 border border-stone-800'
                                }`}
                              >
                                {t}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Ocean Tides & Bajamar */}
      {activeSubTab === 'tides' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-stone-100 text-base">Mareas y Condiciones Marítimas en Bajamar</h3>
                <p className="text-xs text-stone-400">Piscinas Naturales y Punta del Hidalgo</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-stone-950/60 border border-stone-800/80 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center font-bold text-stone-200">
                  <span className="flex items-center gap-1.5">🌊 Bajamar (Marea Baja)</span>
                  <span className="text-cyan-400 font-mono">14:45 h</span>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Momento idóneo para el disfrute de las piscinas naturales de Bajamar y los charcos de La Punta del Hidalgo. Conecta con las líneas <strong>050</strong> y <strong>105</strong>.
                </p>
              </div>

              <div className="bg-stone-950/60 border border-stone-800/80 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center font-bold text-stone-200">
                  <span className="flex items-center gap-1.5">🌊 Pleamar (Marea Alta)</span>
                  <span className="text-amber-400 font-mono">20:30 h</span>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed">
                  Marea llena con rompiente costera. Se recomienda precaución en los diques y paseos marítimos del litoral de Tejina y Bajamar.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-stone-900/80 border border-blue-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-stone-100 text-base">Conexión en Guagua hacia la Costa</h3>
                <p className="text-xs text-stone-400">Rutas rápidas desde Tejina y La Laguna</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-stone-300">
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
                <h4 className="font-bold text-stone-100 flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                  Desde Parada Casetera (#4160) hacia Bajamar:
                </h4>
                <p className="text-[11px] text-stone-400">
                  Toma la <strong>Línea 050</strong> (cada 30 min) o <strong>Línea 105</strong>. Tiempo estimado de trayecto: 8 a 12 minutos.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1.5">
                <h4 className="font-bold text-stone-100 flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                  Regreso desde Bajamar (#4120) hacia Tejina:
                </h4>
                <p className="text-[11px] text-stone-400">
                  Sube en <strong>Línea 050</strong> hasta la <strong>Parada Casetera Lado Iglesia (#4161)</strong> o Tejina Centro (#4150). Salidas continuas hasta las 23:30 h.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
