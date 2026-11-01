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

La aplicación lee automáticamente las siguientes 6 pestañas vía la API pública GViz:

1. **Itinerario:** `Fecha`, `Ciudad`, `Actividad/Descripción`, `Hora inicio`, `Hora fin`, `Costo estimado`, `Notas`, `Link de reserva o confirmación`.
2. **Transporte:** `Fecha`, `Tipo`, `Origen`, `Destino`, `Número de servicio`, `Hora`, `Duración`, `Costo`, `Link de billete o check-in`, `Código de confirmación`.
3. **Alojamiento:** `Ciudad`, `Nombre`, `Dirección`, `Check-in`, `Check-out`, `Costo por noche`, `Link de reserva`, `Teléfono`, `Notas`.
4. **Enlaces útiles:** `Categoría`, `Nombre`, `URL`, `Notas`.
5. **Presupuesto:** `Concepto`, `Monto gastado`, `Moneda`, `Fecha`, `Categoría`. (Todo convertido a CLP con tasa referencial).
6. **Emergencias:** `Tipo`, `Valor`, `Notas`.

---

## 🔒 Cómo compartir tu Google Sheet para que la app la lea en vivo

Para que cualquier persona o teléfono pueda consultar la hoja sin necesidad de iniciar sesión:

1. Abre tu hoja en Google Sheets:  
   `https://docs.google.com/spreadsheets/d/1fh_OpTMr-9Ygw51FMm5CZSXFAEWVRmpxCq79XckHf2I/edit`
2. Arriba a la derecha, haz clic en el botón azul **Compartir**.
3. En **Acceso general**, cambia de *"Restringido"* a **"Cualquier persona con el enlace"**.
4. Deja el rol en **Lector**.
5. Haz clic en **Listo**.
6. En la app (icono de engranaje ⚙️ arriba a la derecha), toca **"Guardar y Sincronizar"** o desactiva el **"Modo Demo"** para ver tus datos en vivo.

---

## 🛠️ Tecnologías y arquitectura

- **Framework:** React 19 + TypeScript + Vite 8
- **Estilos:** Tailwind CSS v4 (Modo oscuro en verde salvia `#7ea172` y grafito `#121417`, optimizado para sol directo).
- **Iconografía:** Lucide React
- **PWA:** `vite-plugin-pwa` con Workbox Service Worker y Stale-While-Revalidate en caché local (`localStorage`).
- **Despliegue:** GitHub Pages vía GitHub Actions automatizado con HTTPS.
