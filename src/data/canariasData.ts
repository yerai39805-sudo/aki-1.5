import { CanariasPlace } from '../types';

export const CANARIAS_PLACES: CanariasPlace[] = [
  // TELDE
  {
    id: 'telde-san-juan',
    name: 'Casco Histórico de San Juan',
    zone: 'Telde',
    category: 'Historia',
    shortDesc: 'El corazón señorial de Telde con calles adoquinadas, la Basílica de San Juan y edificios coloniales.',
    fullDesc: 'San Juan es la cuna noble de Telde. Destaca la majestuosa Basílica de San Juan Bautista, cuyo retablo del altar mayor traído de Flandes en el siglo XVI es una obra maestra inacabada de caña de maíz aborigen mejicana. La Plaza Mayor de San Juan invita al paseo apacible bajo la sombra de arboladas centenarias, rodeada de casas solariegas y el Ayuntamiento.',
    highlights: [
      'Basílica de San Juan Bautista con el Santo Cristo de Telde',
      'Plaza Mayor de San Juan con su hermosa arboleda',
      'Arquitectura tradicional canaria con balcones de tea',
      'Rincón de la literatura y cultura teldense'
    ],
    tips: 'Perfecto para pasear de mañana o al atardecer y disfrutar de un café canario en las terrazas de la plaza.',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    badge: 'Historia Viva'
  },
  {
    id: 'telde-san-francisco',
    name: 'Barrio Colonial de San Francisco',
    zone: 'Telde',
    category: 'Cultura',
    shortDesc: 'Un laberinto empedrado de casitas blancas, muros encorvados y absoluto silencio bohemio.',
    fullDesc: 'San Francisco es uno de los barrios más antiguos e íntimos de todas las Islas Canarias. Sus calles estrechas y empedradas conservan la esencia de los siglos XVI y XVII. En él se encuentra la pequeña Ermita de San Francisco, la Casa-Museo León y Castillo (cuna de eminentes políticos e ingenieros grancanarios) y callejuelas como la "Calle del Silencio".',
    highlights: [
      'Calles empedradas de piedra de cantería',
      'Casa-Museo León y Castillo',
      'Ermita de San Francisco y la antigua muralla',
      'Ambiente tranquilo y fotogénico'
    ],
    tips: 'Camina despacio apreciando las flores que cuelgan de las fachadas blancas y las chimeneas tradicionales.',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    badge: 'Rincón Secreto'
  },
  {
    id: 'telde-bufadero',
    name: 'El Bufadero de La Garita',
    zone: 'Telde',
    category: 'Naturaleza',
    shortDesc: 'Formación geológica marina en la costa de Telde que expulsa chorros de espuma con el vaivén del mar.',
    fullDesc: 'Ubicado en el paseo marítimo de La Garita, el Bufadero es una maravilla de la naturaleza marina volcánica. Se compone de grandes cavidades de basalto donde las olas del Atlántico entran a gran velocidad, comprimiendo el aire y expulsando potentes chorros de agua y espuma como si fuera un géiser marino.',
    highlights: [
      'Espectáculo natural de columnas de agua marina',
      'Paseo marítimo ideal para caminar y respirar brisa salina',
      'Atardeceres mágicos sobre las rocas volcánicas',
      'Cerca de la Playa de La Garita'
    ],
    tips: 'Visítalo con marea media o alta para ver los bufidos marinos en su máxima potencia.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    badge: 'Fuerza Natural'
  },
  {
    id: 'telde-melenara',
    name: 'Playa de Melenara y Neptuno',
    zone: 'Telde',
    category: 'Playa',
    shortDesc: 'Playa familiar de arena oscura presidida por la imponente escultura de Neptuno emergiendo del mar.',
    fullDesc: 'Melenara es la playa teldense por excelencia. Famosa por su ambiente marinero, sus aguas tranquilas protegidas por el muelle y la escultura de Neptuno de más de 4 metros realizada en bronce por Luis Arencibia que custodia el océano. Es además un referente gastronómico insular gracias a sus terrazas especializadas en pescado fresco, calamares y lapas con mojo.',
    highlights: [
      'Escultura monumental de Neptuno emergiendo del mar',
      'Avenida marítima llena de vida y restaurantes marineros',
      'Aguas cristalinas de Bandera Azul',
      'Atardeceres inolvidables junto al faro'
    ],
    tips: 'Ideal para comer una buena parrillada de pescado o dar un paseo costero hasta Salinetas.',
    imageUrl: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=800&q=80',
    badge: 'Sabor Marinero'
  },
  {
    id: 'telde-cuatro-puertas',
    name: 'Yacimiento de Cuatro Puertas',
    zone: 'Telde',
    category: 'Historia',
    shortDesc: 'Gran complejo arqueológico aborigen excavado a mano en la cima de la Montaña Bermeja.',
    fullDesc: 'Cuatro Puertas es uno de los yacimientos más emblemáticos de los antiguos canarios. Consiste en una gran cueva labrada a pico en la piedra volcánica con cuatro grandes aberturas frontales que dan a un foso. Se cree que era un lugar sagrado (almogarén) para rituales astronómicos y religiosos dedicados al sol y la luna.',
    highlights: [
      'Cueva ceremonial aborigen con 4 entradas monumentales',
      'Vistas panóramicas de toda la costa este de Gran Canaria',
      'Silos prehispánicos y grabados rupestres',
      'Sendero interpretativo arqueológico'
    ],
    tips: 'Lleva calzado cómodo. Las vistas al amanecer desde la montaña son espectaculares.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    badge: 'Legado Aborigen'
  },

  // TEJEDA
  {
    id: 'tejeda-pueblo',
    name: 'Pueblo de Tejeda',
    zone: 'Tejeda',
    category: 'Cultura',
    shortDesc: 'Uno de los pueblos más bonitos de España, enmarcado en el majestuoso corazón volcánico de la isla.',
    fullDesc: 'Tejeda es un oasis de casas de cal blanca y tejas rojas rodeado por bancales de almendros y acantilados imposibles. Incluido oficialmente en la red de "Los Pueblos Más Bonitos de España", destaca por sus vistas a la gran Caldera de Tejeda descrita por Miguel de Unamuno como una "tempestad petrificada".',
    highlights: [
      'Iglesia de Nuestra Señora del Socorro',
      'Museo de Esculturas Abraham Cárdenes y Centro de Plantas Medicinales',
      'Arquitectura de cumbre impecable y flores en las fachadas',
      'Artesanía en madera y repostería tradicional'
    ],
    tips: 'No te vayas sin probar el famoso Bienmesabe en la Dulcería Nublo o las panaderías del pueblo.',
    imageUrl: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=800&q=80',
    badge: 'Pueblo Con Encanto'
  },
  {
    id: 'tejeda-roque-nublo',
    name: 'Monumento Natural del Roque Nublo',
    zone: 'Tejeda',
    category: 'Naturaleza',
    shortDesc: 'El gigante sagrado de Gran Canaria: monolito basáltico de 80 metros erigido a 1.813m de altitud.',
    fullDesc: 'El Roque Nublo es el símbolo espiritual y geográfico de Gran Canaria. Formado tras las erupciones volcánicas de la cumbre, este monolito se alza majestuoso rodeado por el paisaje protegido de la Cumbre. Un sendero de senderismo de unos 1,5 km permite subir a su planicie tablida y contemplar desde allí el Teide de Tenerife en días despejados.',
    highlights: [
      'Símbolo e icono identitario de Gran Canaria',
      'Ruta de senderismo rodeada de pinar canario',
      'Vista panorámica del Teide y el mar de nubes',
      'Entorno de la Rana y el Fraile'
    ],
    tips: 'Lleva ropa de abrigo adecuada para la cumbre y agua. El atardecer desde el Nublo es mágico.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    badge: 'Icono de Canarias'
  },
  {
    id: 'tejeda-roque-bentayga',
    name: 'Roque Bentayga y Centro de Interpretación',
    zone: 'Tejeda',
    category: 'Historia',
    shortDesc: 'Fortaleza volcánica y santuario aborigen prehispánico en medio de la gran caldera de Tejeda.',
    fullDesc: 'El Bentayga es una impresionante estructura geológica que albergó uno de los principales bastiones de resistencia aborigen antes de la conquista. En su base se encuentra un almogarén o santuario de culto solar grabado en la roca, además de un centro de interpretación donde aprender la cosmovisión de los antiguos canarios.',
    highlights: [
      'Almogarén aborigen para rituales solares',
      'Centro de interpretación arqueológica',
      'Sendero empinado de ascenso con vistas espectaculares',
      'Historia de la conquista de Gran Canaria'
    ],
    tips: 'Abre por la mañana. Es una visita cultural imprescindible antes de almorzar en Tejeda.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    badge: 'Lugar Sagrado'
  },
  {
    id: 'tejeda-cruz-de-tejeda',
    name: 'Cruz de Tejeda y Parador Nacional',
    zone: 'Tejeda',
    category: 'Gastronomía',
    shortDesc: 'Punto neurálgico de la cumbre con la mítica Cruz de Piedra, puestos artesanales y el Parador.',
    fullDesc: 'La Cruz de Tejeda es el cruce de caminos de la cumbre grancanaria situado a casi 1.500 metros de altitud. Presidida por una gran cruz labrada en piedra tallada, alberga puestos de venta donde los artesanos locales ofrecen quesos de cumbre curados con flor, miel de cumbre, mermeladas de cactus y dulces de almendra.',
    highlights: [
      'Puestos artesanales con quesos de flor y miel pura',
      'Parador de Cruz de Tejeda con spa hidrotermal exterior',
      'Cruce de los principales senderos de la cumbre',
      'Clima fresco y mar de nubes'
    ],
    tips: 'Lugar ideal para hacer una parada técnica, tomar un chocolate caliente o comprar queso ahumado.',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    badge: 'Cumbre de Gran Canaria'
  },

  // GRAN CANARIA OVERVIEW
  {
    id: 'gc-dulceria-bienmesabe',
    name: 'Gastronomía: Bienmesabe y Dulces de Tejeda',
    zone: 'Tejeda',
    category: 'Gastronomía',
    shortDesc: 'El manjar tejedano a base de almendras seleccionadas, yema de huevo, azúcar y ralladura de limón.',
    fullDesc: 'El Bienmesabe es el dulce más afamado de la cumbre de Gran Canaria. Su ingrediente estrella es la almendra de Tejeda, recolectada de los almendros que visten la cumbre en flor durante los meses de invierno. Se sirve como acompañamiento en helados, flanes o untado en tostadas y galletas artesanales.',
    highlights: [
      'Receta centenaria elaborada artesanalmente',
      'Fiesta del Almendro en Flor (Febrero)',
      'Mazapanes, polvorones y mantecados tejedanos',
      'Maridaje perfecto con café o vino dulce canario'
    ],
    tips: 'Puedes comprar tarros empaquetados en la Dulcería Nublo para regalar o saborear en casa.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    badge: 'Manjar Artesanal'
  }
];
