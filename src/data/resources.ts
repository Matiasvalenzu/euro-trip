export interface LinkItem {
  name: string
  url: string
  note: string
}

export const ETIAS_URL = 'https://travel-europe.europa.eu/etias_en'

export const LINK_GROUPS: { title: string; items: LinkItem[] }[] = [
  {
    title: 'Moverse en cada ciudad',
    items: [
      { name: 'Google Maps', url: 'https://maps.google.com', note: 'Descarga el mapa offline de cada ciudad antes de llegar.' },
      { name: 'Citymapper', url: 'https://citymapper.com', note: 'Metro, tranvía y buses con horarios en tiempo real.' },
      { name: 'GVB · Ámsterdam', url: 'https://www.gvb.nl', note: 'Tranvía, metro y ferris gratuitos a Noord.' },
      { name: 'STIB · Bruselas', url: 'https://www.stib-mivb.be', note: 'Metro, tranvía y buses de Bruselas.' },
      { name: 'BVG · Berlín', url: 'https://www.bvg.de', note: 'U-Bahn, S-Bahn y buses. Valida el billete antes de subir.' },
      { name: 'BKK · Budapest', url: 'https://bkk.hu', note: 'Compra pases de 24 o 72 h en la app BudapestGO.' },
      { name: 'Wiener Linien · Viena', url: 'https://www.wienerlinien.at', note: 'Metro y tranvías de Viena.' },
      { name: 'RATP · París', url: 'https://www.ratp.fr', note: 'Metro y RER (el RER B va al aeropuerto CDG).' },
      { name: 'TMB · Barcelona', url: 'https://www.tmb.cat', note: 'Metro y buses de Barcelona.' },
    ],
  },
  {
    title: 'Trenes y vuelos',
    items: [
      { name: 'Trainline', url: 'https://www.thetrainline.com', note: 'Compra trenes de casi todos los operadores europeos.' },
      { name: 'Omio', url: 'https://www.omio.com', note: 'Compara tren, bus y avión entre ciudades.' },
      { name: 'NS International', url: 'https://www.nsinternational.com', note: 'Trenes desde Países Bajos y Bélgica (cotizaciones del viaje).' },
      { name: 'SNCB', url: 'https://www.belgiantrain.be', note: 'Trenes en Bélgica: Bruselas ⇄ Brujas.' },
      { name: 'Deutsche Bahn', url: 'https://www.bahn.de', note: 'Horarios, andenes y retrasos en Alemania.' },
      { name: 'ÖBB', url: 'https://www.oebb.at', note: 'Railjet Budapest ⇄ Viena.' },
      { name: 'MÁV', url: 'https://www.mavcsoport.hu', note: 'Trenes húngaros: Budapest ⇄ Bratislava.' },
      { name: 'Wizz Air', url: 'https://wizzair.com', note: 'Vuelo Berlín → Budapest (revisa el tamaño del equipaje de mano).' },
      { name: 'myIDTravel', url: 'https://www.myidtravel.com', note: 'Pasajes LATAM y Air France del viaje.' },
      { name: 'Rome2Rio', url: 'https://www.rome2rio.com', note: 'Cómo llegar de A a B con cualquier medio.' },
    ],
  },
  {
    title: 'Dinero, idioma e internet',
    items: [
      { name: 'XE Conversor', url: 'https://www.xe.com', note: 'Tipo de cambio en vivo (también está el conversor de esta app).' },
      { name: 'Google Traductor', url: 'https://translate.google.com', note: 'Descarga neerlandés, alemán, húngaro, francés y catalán para usarlo offline.' },
      { name: 'Airalo', url: 'https://www.airalo.com', note: 'eSIM regional para Europa.' },
      { name: 'Holafly', url: 'https://esim.holafly.com', note: 'eSIM con datos ilimitados.' },
    ],
  },
  {
    title: 'Fronteras y trámites',
    items: [
      { name: 'ETIAS', url: ETIAS_URL, note: 'Autorización de viaje de la UE para viajeros sin visa: revisa si ya es obligatoria.' },
      { name: 'EES', url: 'https://travel-europe.europa.eu/ees_en', note: 'Nuevo control con huellas y foto en tu primera entrada a Schengen.' },
    ],
  },
]

export const ESSENTIALS: { id: string; title: string; note: string; url?: string }[] = [
  { id: 'seguro', title: 'Contratar seguro de viaje', note: 'Con asistencia médica, cancelaciones y equipaje.' },
  { id: 'etias', title: 'Revisar si ETIAS ya es obligatorio', note: 'Autorización online de la UE para viajeros sin visa, como los chilenos.', url: ETIAS_URL },
  { id: 'esim', title: 'Comprar y activar eSIM europea', note: 'Un plan que cubra los 8 países del viaje.' },
  { id: 'pasaporte', title: 'Pasaportes vigentes y copias digitales', note: 'Guarda copias en dos nubes distintas.' },
  { id: 'tarjetas', title: 'Revisar tarjetas para el extranjero', note: 'Compras internacionales activas y una tarjeta de respaldo.' },
  { id: 'efectivo', title: 'Llevar algo de efectivo en euros', note: 'Para mercados, propinas y baños. Los forintos conviene sacarlos en Budapest.' },
  { id: 'mapas', title: 'Descargar mapas offline', note: 'Google Maps: una zona por ciudad.' },
  { id: 'guias', title: 'Descargar las guías de esta app', note: 'Ajustes → Guías sin conexión.' },
]

/** Título e ícono para los consejos que vienen al final de la planilla. */
export function tipMeta(text: string): { title: string; icon: 'doc' | 'shield' | 'pill' | 'phone' | 'clock' | 'cash' | 'coins' | 'map' | 'train' | 'ticket' | 'info' } {
  const rules: [RegExp, string, ReturnType<typeof tipMeta>['icon']][] = [
    [/pasaporte/i, 'Documentos', 'doc'],
    [/seguro|asistencia m[eé]dica/i, 'Seguro de viaje', 'shield'],
    [/farmacia/i, 'Farmacias', 'pill'],
    [/esim|\bsim\b/i, 'Internet en el celular', 'phone'],
    [/horas de diferencia|jet lag/i, 'Diferencia horaria', 'clock'],
    [/efectivo|tarjeta/i, 'Efectivo y tarjetas', 'cash'],
    [/eur\s*≈|tipo de cambio/i, 'Tipo de cambio', 'coins'],
    [/google maps|citymapper/i, 'Apps útiles', 'map'],
    [/tren|autob[uú]s|flixbus/i, 'Trenes y buses', 'train'],
    [/reserv|sagrada|[oó]pera|concierto/i, 'Reservar con tiempo', 'ticket'],
  ]
  const r = rules.find(([re]) => re.test(text))
  return r ? { title: r[1], icon: r[2] } : { title: 'Consejo', icon: 'info' }
}
