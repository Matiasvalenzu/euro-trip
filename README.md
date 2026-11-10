# 🌍 EuroTrip Companion · Acompañante de Viaje por Europa

Aplicación web mobile-first instalable (PWA), diseñada especialmente para usarse durante un viaje multi-ciudad por Europa. Lee los datos en tiempo real desde una hoja de Google Sheets pública, funciona 100% offline y está pensada para ser rápida, limpia y sin distracciones.

📱 **Enlace público para abrir en cualquier teléfono:**  
👉 **[https://matiasvalenzu.github.io/euro-trip/](https://matiasvalenzu.github.io/euro-trip/)**

---

## 🚀 Cómo instalarla en tu teléfono (PWA)

Una vez que abras el enlace en tu celular, puedes guardarla como una app nativa:
- **iPhone (Safari):** Toca el botón **Compartir** (icono de cuadrado con flecha hacia arriba) y selecciona **"Agregar a pantalla de inicio"**.
- **Android (Chrome):** Toca los tres puntos arriba a la derecha y selecciona **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.

---

## 📋 Estructura de la hoja de Google Sheets

La app lee **la primera pestaña** de la planilla (una fila por día) y arma todo lo demás a partir de ella:

| Columna | Uso en la app |
| --- | --- |
| `Día`, `Fecha` (ej. `jue 19 nov`) | Día del itinerario. Las filas sin `Día` al final se muestran como **consejos** en la Guía. |
| `Ciudad / Etapa` | `Ámsterdam` = día en la ciudad · `Ámsterdam → Bruselas` = traslado · `Bruselas + Brujas` = excursión de un día. |
| `Actividad / Notas` | Se convierte en la lista de actividades. Los lugares conocidos (ver `src/data/places.ts`) aparecen con guía, foto y enlaces. |
| `Transporte`, `Duración aprox.`, `Valor vuelo`, `Detalle de vuelo` | Tramos: tipo (avión/tren), horarios, duración, escalas, costo y alternativas. |
| `Clima`, `Temperatura`, `Vestimenta recomendada` | Información del día (junto al pronóstico real de Open-Meteo). |
| `Alojamiento` | Texto tipo `Reservado (22-24 nov, …): Nombre — total pagado $… Código de reserva …` + enlace. |
| `Toño` | Dónde está Toño cada día; la app marca cuando coinciden. |

Para que un lugar nuevo de la planilla aparezca con guía, agréguenlo en `src/data/places.ts` (nombre, alias sin tildes y título de Wikipedia).

## ✨ Secciones

- **Hoy:** cuenta regresiva, pendientes antes de viajar, el día actual (con flechas para ver otros días), pronóstico, hora local vs. Chile y lo básico del país.
- **Itinerario:** días agrupados por ciudad y país, con el tramo (avión/tren y duración) entre ciudades; cada actividad abre una guía dentro de la app.
- **Traslados**, **Estadías**, **Gastos** (conversor EUR/HUF/CLP/USD, registro de gastos y costos del viaje) y **Guía** (pendientes, consejos, frases, emergencias y apps por país).
- **SOS:** 112, números locales, consulado y contactos propios guardados en el teléfono.

---

## 🔒 Cómo compartir tu Google Sheet para que la app la lea en vivo

Para que cualquier persona o teléfono pueda consultar la hoja sin necesidad de iniciar sesión:

1. Abre tu hoja en Google Sheets:  
   `https://docs.google.com/spreadsheets/d/1fh_OpTMr-9Ygw51FMm5CZSXFAEWVRmpxCq79XckHf2I/edit`
2. Arriba a la derecha, haz clic en el botón azul **Compartir**.
3. En **Acceso general**, cambia de *"Restringido"* a **"Cualquier persona con el enlace"**.
4. Deja el rol en **Lector**.
5. Haz clic en **Listo**.
6. En la app, toca el ícono de actualizar (↻) arriba a la derecha. En **Ajustes ⚙️** se puede cambiar la planilla y descargar las guías para usarlas sin conexión.

---

## 🛠️ Tecnologías y arquitectura

- **Framework:** React 19 + TypeScript + Vite 8
- **Estilos:** Tailwind CSS v4 con tema claro y oscuro (sigue la configuración del teléfono); títulos en Fraunces (incluida en la app, funciona offline).
- **Iconografía:** Lucide React
- **Datos externos sin API key:** Wikipedia (resúmenes y fotos de las guías), Open-Meteo (pronóstico), ExchangeRate-API (tasas de cambio).
- **PWA:** `vite-plugin-pwa` con Workbox; la planilla, guías, fotos y pronóstico quedan en caché para usar sin conexión.
- **Despliegue:** GitHub Pages vía GitHub Actions automatizado con HTTPS.
