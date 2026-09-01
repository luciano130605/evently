# Pruebas del flujo completo de invitaciones XV

Estas pruebas validan el flujo principal de la app para invitar a personas, guardar confirmaciones y verificar que la lógica no falle con varios usuarios en simultáneo.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
cd frontend
npm install
```

## Ejecutar pruebas

```bash
npm test
```

## Ejecutar en modo watch

```bash
npm run test:watch
```

## Qué prueba esta suite

- creación de slug a partir del nombre
- guardar y recuperar una invitación por slug
- guardar múltiples RSVP y leerlos
- administración y carga de invitados por slug
- volumen alto de usuarios confirmando al mismo tiempo
- validación de que no se pisan invitaciones distintas

## Simulación de carga concurrente

La prueba de alto volumen usa `Promise.all` para disparar confirmaciones de múltiples usuarios al mismo tiempo y verificar que todos queden registrados.

## Sugerencia adicional

Si querés probarlo contra Supabase real, copiate `.env.example` a `.env` y completá tus valores:

```env
VITE_SUPABASE_URL=https://tmpwfusuzrmycmwuuotk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcHdmdXN1enJteWNtd3V1b3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMjIyMTQsImV4cCI6MjEwMzc5ODIxNH0.PxZnMKoHYZ9BELOGUqQGBPmd4sLNw0qSZHg8NfHVzC0
```

Luego ejecutá:

```bash
npm test
```
