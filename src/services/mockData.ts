import type { TravelData } from '../types/travel'

export const DEFAULT_MOCK_DATA: TravelData = {
  lastUpdated: Date.now(),
  isMock: true,
  itinerario: [
    {
      id: 'it-1',
      fecha: '2026-05-10',
      ciudad: 'Madrid',
      actividad: 'Llegada a Barajas y Check-in en el centro',
      horaInicio: '09:30',
      horaFin: '12:00',
      costoEstimado: '€ 15 (Metro/Cercanías)',
      notas: 'Tomar Metro Línea 8 hasta Nuevos Ministerios, luego transbordo a Sol.',
      linkReserva: 'https://www.metromadrid.es'
    },
    {
      id: 'it-2',
      fecha: '2026-05-10',
      ciudad: 'Madrid',
      actividad: 'Visita Museo del Prado y Parque de El Retiro',
      horaInicio: '14:30',
      horaFin: '18:00',
      costoEstimado: '€ 15',
      notas: 'Entrada reservada para las 15:00. Llevar pasaporte físico.',
      linkReserva: 'https://www.museodelprado.es'
    },
    {
      id: 'it-3',
      fecha: '2026-05-11',
      ciudad: 'Madrid',
      actividad: 'Palacio Real y Mercado de San Miguel',
      horaInicio: '10:00',
      horaFin: '14:00',
      costoEstimado: '€ 25 (Tapas + Entrada)',
      notas: 'Probar bocadillo de calamares y vino tinto de la casa.',
      linkReserva: 'https://mercadodesanmiguel.es'
    },
    {
      id: 'it-4',
      fecha: '2026-05-12',
      ciudad: 'Barcelona',
      actividad: 'Llegada en AVE y Paseo por Las Ramblas y Barrio Gótico',
      horaInicio: '12:00',
      horaFin: '17:00',
      costoEstimado: '€ 10',
      notas: 'Cuidado con carteristas en el metro y la Rambla.',
      linkReserva: ''
    },
    {
      id: 'it-5',
      fecha: '2026-05-13',
      ciudad: 'Barcelona',
      actividad: 'Basílica de la Sagrada Familia y Park Güell',
      horaInicio: '09:45',
      horaFin: '15:30',
      costoEstimado: '€ 36',
      notas: 'Entrada Sagrada Familia a las 10:00 con acceso a la torre de la Pasión.',
      linkReserva: 'https://sagradafamilia.org'
    },
    {
      id: 'it-6',
      fecha: '2026-05-15',
      ciudad: 'París',
      actividad: 'Torre Eiffel y Crucero por el Sena al atardecer',
      horaInicio: '17:00',
      horaFin: '21:30',
      costoEstimado: '€ 45',
      notas: 'El barco Bateaux Parisiens zarpa a los pies de la Torre.',
      linkReserva: 'https://www.bateauxparisiens.com'
    },
    {
      id: 'it-7',
      fecha: '2026-05-16',
      ciudad: 'París',
      actividad: 'Museo del Louvre y Jardines de las Tullerías',
      horaInicio: '09:00',
      horaFin: '14:00',
      costoEstimado: '€ 22',
      notas: 'Entrada por la galería Carrousel para evitar filas exteriores.',
      linkReserva: 'https://www.louvre.fr'
    },
    {
      id: 'it-8',
      fecha: '2026-05-18',
      ciudad: 'Roma',
      actividad: 'Coliseo, Foro Romano y Palatino',
      horaInicio: '08:30',
      horaFin: '13:00',
      costoEstimado: '€ 24',
      notas: 'Llevar botella de agua recargable (hay fontanelle por toda Roma).',
      linkReserva: 'https://ticketing.colosseo.it'
    },
    {
      id: 'it-9',
      fecha: '2026-05-19',
      ciudad: 'Roma',
      actividad: 'Basílica de San Pedro y Museos Vaticanos',
      horaInicio: '08:00',
      horaFin: '14:30',
      costoEstimado: '€ 28',
      notas: 'Código de vestimenta estricto: hombros y rodillas cubiertos.',
      linkReserva: 'https://m.museivaticani.va'
    }
  ],
  transporte: [
    {
      id: 'tr-1',
      fecha: '2026-05-09',
      tipo: 'vuelo',
      origen: 'Santiago (SCL)',
      destino: 'Madrid (MAD)',
      numeroServicio: 'IB6830 (Iberia)',
      hora: '23:55',
      duracion: '12h 40m',
      costo: '680.000 CLP',
      linkBillete: 'https://www.iberia.com',
      codigoConfirmacion: 'IBE-X92A1P'
    },
    {
      id: 'tr-2',
      fecha: '2026-05-12',
      tipo: 'tren',
      origen: 'Madrid Atocha',
      destino: 'Barcelona Sants',
      numeroServicio: 'AVE 03103',
      hora: '08:30',
      duracion: '2h 30m',
      costo: '€ 45',
      linkBillete: 'https://www.renfe.com',
      codigoConfirmacion: 'RNF-78K29L'
    },
    {
      id: 'tr-3',
      fecha: '2026-05-14',
      tipo: 'vuelo',
      origen: 'Barcelona (BCN)',
      destino: 'París Orly (ORY)',
      numeroServicio: 'VY8240 (Vueling)',
      hora: '14:15',
      duracion: '1h 55m',
      costo: '€ 52',
      linkBillete: 'https://www.vueling.com',
      codigoConfirmacion: 'VUE-M4190Z'
    },
    {
      id: 'tr-4',
      fecha: '2026-05-17',
      tipo: 'vuelo',
      origen: 'París CDG',
      destino: 'Roma Fiumicino (FCO)',
      numeroServicio: 'AF1104 (Air France)',
      hora: '10:20',
      duracion: '2h 05m',
      costo: '€ 75',
      linkBillete: 'https://www.airfrance.cl',
      codigoConfirmacion: 'AF-89B74T'
    },
    {
      id: 'tr-5',
      fecha: '2026-05-20',
      tipo: 'FlixBus',
      origen: 'Roma Tiburtina',
      destino: 'Florencia Villa Costanza',
      numeroServicio: 'Línea 403',
      hora: '07:15',
      duracion: '3h 25m',
      costo: '€ 14',
      linkBillete: 'https://global.flixbus.com',
      codigoConfirmacion: 'FLX-330190'
    }
  ],
  alojamiento: [
    {
      id: 'al-1',
      ciudad: 'Madrid',
      nombre: 'Generator Madrid (Centro)',
      direccion: 'Calle de San Bernardo 2, 28013 Madrid',
      checkIn: '10/05/2026 14:00',
      checkOut: '12/05/2026 11:00',
      costoNoche: '€ 48',
      linkReserva: 'https://staygenerator.com/hostels/madrid',
      telefono: '+34 910 47 98 00',
      notas: 'A 2 minutos de Gran Vía. Tienen terraza en la azotea y lockers para equipaje.'
    },
    {
      id: 'al-2',
      ciudad: 'Barcelona',
      nombre: 'Yeah Hostel Barcelona',
      direccion: 'Carrer de Girona 176, Gràcia, 08037 Barcelona',
      checkIn: '12/05/2026 15:00',
      checkOut: '14/05/2026 11:00',
      costoNoche: '€ 55',
      linkReserva: 'https://yeahhostelbarcelona.com',
      telefono: '+34 935 31 01 29',
      notas: 'Incluye cena comunitaria económica por € 10. Muy cerca de Sagrada Familia.'
    },
    {
      id: 'al-3',
      ciudad: 'París',
      nombre: 'The People Paris Nation',
      direccion: '28 Bis Place de la Nation, 75012 París',
      checkIn: '14/05/2026 15:00',
      checkOut: '17/05/2026 10:30',
      costoNoche: '€ 62',
      linkReserva: 'https://www.thepeoplehostel.com',
      telefono: '+33 1 76 35 17 00',
      notas: 'Línea 1 directa al Louvre y Campos Elíseos. Rooftop bar con vista a la torre.'
    },
    {
      id: 'al-4',
      ciudad: 'Roma',
      nombre: 'The RomeHello Hostel',
      direccion: 'Via Torino 45, 00184 Roma',
      checkIn: '17/05/2026 14:00',
      checkOut: '20/05/2026 10:00',
      costoNoche: '€ 58',
      linkReserva: 'https://theromehello.com',
      telefono: '+39 06 9686 0070',
      notas: 'A 500m de la estación Termini y metro Repubblica. Pagar tasa turística de € 3,5/noche en efectivo.'
    }
  ],
  enlaces: [
    {
      id: 'en-1',
      categoria: 'transporte local',
      nombre: 'Citymapper (La mejor app de metro/bus)',
      url: 'https://citymapper.com',
      notas: 'Funciona perfecto en Madrid, Barcelona, París y Roma.'
    },
    {
      id: 'en-2',
      categoria: 'transporte local',
      nombre: 'FlixBus Boletos y Rutas',
      url: 'https://global.flixbus.com',
      notas: 'Buses interurbanos low cost por Europa.'
    },
    {
      id: 'en-3',
      categoria: 'traductor',
      nombre: 'Google Translate (Descargar offline)',
      url: 'https://translate.google.com',
      notas: 'Descargar paquetes de francés e italiano para traducción de cámara en restaurantes.'
    },
    {
      id: 'en-4',
      categoria: 'mapas',
      nombre: 'Google Maps Offline',
      url: 'https://maps.google.com',
      notas: 'Descargar zonas sin conexión de cada ciudad antes de salir del hostel.'
    },
    {
      id: 'en-5',
      categoria: 'clima',
      nombre: 'MeteoBlue Europa',
      url: 'https://www.meteoblue.com',
      notas: 'Pronóstico de alta precisión por hora.'
    },
    {
      id: 'en-6',
      categoria: 'bancos/cajeros',
      nombre: 'Cajeros sin comisión excesiva',
      url: 'https://www.bankinter.com',
      notas: 'Evitar cajeros amarillos "Euronet" (cobran comisión altísima y tipo de cambio abusivo). Usar bancos oficiales (Santander, BBVA, BNP Paribas).'
    },
    {
      id: 'en-7',
      categoria: 'embajada',
      nombre: 'Consulados y Embajada de Chile en Europa',
      url: 'https://www.chile.gob.cl/espana/consulados',
      notas: 'Teléfonos de asistencia consular de emergencia para chilenos en el exterior.'
    },
    {
      id: 'en-8',
      categoria: 'farmacias',
      nombre: 'Farmacias de Guardia (Farmacie di Turno)',
      url: 'https://www.farmacieonline.it',
      notas: 'En Europa las farmacias de turno tienen una cruz verde iluminada.'
    }
  ],
  presupuesto: [
    {
      id: 'pr-1',
      concepto: 'Vuelo Santiago - Madrid (Iberia ida/vuelta)',
      montoGastado: 680000,
      moneda: 'CLP',
      fecha: '2026-03-15',
      categoria: 'Transporte'
    },
    {
      id: 'pr-2',
      concepto: 'Seguro de Viaje IATI Internacional',
      montoGastado: 75000,
      moneda: 'CLP',
      fecha: '2026-03-20',
      categoria: 'Seguro / Salud'
    },
    {
      id: 'pr-3',
      concepto: 'Alojamiento Generator Madrid (2 noches)',
      montoGastado: 96,
      moneda: 'EUR',
      fecha: '2026-04-02',
      categoria: 'Alojamiento'
    },
    {
      id: 'pr-4',
      concepto: 'Tren AVE Madrid - Barcelona',
      montoGastado: 45,
      moneda: 'EUR',
      fecha: '2026-04-10',
      categoria: 'Transporte'
    },
    {
      id: 'pr-5',
      concepto: 'Alojamiento Yeah Hostel Barcelona (2 noches)',
      montoGastado: 110,
      moneda: 'EUR',
      fecha: '2026-04-12',
      categoria: 'Alojamiento'
    },
    {
      id: 'pr-6',
      concepto: 'Entrada Sagrada Familia + Torre',
      montoGastado: 36,
      moneda: 'EUR',
      fecha: '2026-04-15',
      categoria: 'Actividades'
    },
    {
      id: 'pr-7',
      concepto: 'Vuelo Barcelona - París (Vueling)',
      montoGastado: 52,
      moneda: 'EUR',
      fecha: '2026-04-18',
      categoria: 'Transporte'
    },
    {
      id: 'pr-8',
      concepto: 'The People Paris Hostel (3 noches)',
      montoGastado: 186,
      moneda: 'EUR',
      fecha: '2026-04-20',
      categoria: 'Alojamiento'
    },
    {
      id: 'pr-9',
      concepto: 'Museo del Prado Madrid',
      montoGastado: 15,
      moneda: 'EUR',
      fecha: '2026-04-22',
      categoria: 'Actividades'
    },
    {
      id: 'pr-10',
      concepto: 'Alimentación y Tapas días 1 a 3 (estimado)',
      montoGastado: 120,
      moneda: 'EUR',
      fecha: '2026-05-11',
      categoria: 'Comida'
    }
  ],
  emergencias: [
    {
      id: 'em-1',
      tipo: 'teléfono emergencia',
      nombre: 'Emergencias Unión Europea (Policía / Ambulancia / Bomberos)',
      valor: '112',
      notas: 'Número universal y gratuito en toda la UE. Funciona sin saldo y sin chip local.'
    },
    {
      id: 'em-2',
      tipo: 'seguro de viaje',
      nombre: 'Asistencia Médica Seguro IATI / Universal Assistance',
      valor: '+34 934 85 77 35',
      notas: 'Póliza Nº: ES-2026-994821. Llamar antes de ir a una clínica para coordinación de pago directo.'
    },
    {
      id: 'em-3',
      tipo: 'contacto familiar',
      nombre: 'Contacto Familiar de Emergencia (Chile)',
      valor: '+56 9 8765 4321',
      notas: 'Disponible 24/7 vía WhatsApp y llamada telefónica internacional.'
    },
    {
      id: 'em-4',
      tipo: 'consulado',
      nombre: 'Consulado General de Chile en Madrid (Emergencias)',
      valor: '+34 670 41 81 21',
      notas: 'Teléfono exclusivo de emergencias consulares (accidentes graves, extravío de pasaporte, detenciones).'
    },
    {
      id: 'em-5',
      tipo: 'consulado',
      nombre: 'Consulado General de Chile en París',
      valor: '+33 6 58 75 73 99',
      notas: 'Emergencias 24h para chilenos en Francia.'
    },
    {
      id: 'em-6',
      tipo: 'consulado',
      nombre: 'Consulado General de Chile en Roma',
      valor: '+39 349 761 1431',
      notas: 'Asistencia consular de emergencia en Italia.'
    },
    {
      id: 'em-7',
      tipo: 'número local',
      nombre: 'Bloqueo Internacional de Tarjetas (BancoEstado / Santander / Chile)',
      valor: '+1 636 722 7111',
      notas: 'Mastercard Global Service por cobro revertido en caso de robo o pérdida.'
    }
  ]
}
