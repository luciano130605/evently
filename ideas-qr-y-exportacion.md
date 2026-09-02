# QR de confirmación, stats y exportación de confirmaciones

## 1) QR para confirmar asistencia

### Para qué sirve
- Que el invitado pueda confirmar asistencia desde un QR sin escribir la URL ni buscar la invitación manualmente.
- Que el organizador pueda compartir directamente el acceso de confirmación desde el panel admin.
- Que funcione tanto en WhatsApp, Instagram, impresión, tarjetas o eventos físicos.

### Idea de uso
- En el panel admin, generar un QR que apunte a la invitación pública con un flujo de confirmación.
- El QR puede abrir directamente la invitación y, desde ahí, mostrar el mini formulario de confirmación como ahora.
- También puede apuntar a una URL con parámetro de invitado, por ejemplo `?confirm=token` o `?guest=slug`, para luego prellenar datos.
- El organizador debe poder:
  - copiar el link directo,
  - compartir el link,
  - descargar el QR como imagen,
  - abrir la vista de confirmación desde el mismo admin.

### Requerimiento funcional
- La confirmación sigue guardándose en la misma tabla `rsvps`.
- El nombre y apellido siguen siendo obligatorios en el formulario de confirmación.
- Debe seguir validando que no haya dos confirmaciones con el mismo nombre y apellido para esa invitación.
- Si el QR se comparte de forma pública, la lógica debe seguir guardando la confirmación en la base de datos con el `slug` correcto.

### Valor de negocio
- Mejor UX para el invitado.
- Menos fricción para confirmar.
- Más “premium” y útil para eventos reales.

---

## 2) Compartir QR desde admin

### Para qué sirve
- Que el dueño de la invitación pueda generar y compartir la confirmación directamente desde el panel.
- Que no tenga que armar links o descargar imágenes manualmente.

### Idea de uso
- En el admin, junto a “Ver invitación” y “Copiar link”, agregar:
  - “Compartir QR”
  - “Descargar QR”
  - “Abrir confirmación”
- El QR puede mostrarse en un modal o tarjeta dentro del panel.
- Comportamiento esperado:
  - click en compartir → usa `navigator.share`
  - click en copiar → copia la URL del QR o del link directo
  - click en descargar → guarda la imagen del QR

### Valor de negocio
- Hace que el admin sea más productivo.
- Simplifica la logística para enviar invitaciones por WhatsApp o impresión.
- Sirve para eventos físicos en cartelera o en mesas.

---

## 3) Stats del evento

### Para qué sirve
- Mostrar una vista rápida del estado del evento.
- Dar al organizador métricas útiles sin revisar cada confirmación a mano.
- Tomar decisiones en base a asistencia, restricciones y edades.

### Stats recomendadas
- Total confirmados
- Mayor de 18
- Menor de 18
- Restricciones alimentarias
- Alergias registradas
- Porcentaje de asistencia estimado
- Confirmaciones pendientes / faltantes

### Mejor forma de mostrarlo
- Tarjetas tipo cards arriba de la tabla de confirmaciones.
- Una sección llamada “Stats” o “Estadísticas”.
- Totales claros y fáciles de leer.

### Valor de negocio
- Convierte la app de una invitación estática a un dashboard real.
- Da información útil para logística, catering y organización.
- Mejora la percepción del producto como herramienta de evento.

---

## 4) Exportar confirmaciones en CSV

### Para qué sirve
- Guardar la lista de asistentes en Excel o Google Sheets.
- Compartir la información con catering, organización, logística o equipo del evento.
- Evitar copiar y pegar manualmente desde la app.

### Funcionalidad esperada
- Botón en el admin: “Exportar CSV”.
- Genera un archivo `.csv` con todas las confirmaciones de la invitación actual.
- Puede incluir:
  - nombre
  - apellido
  - restricción alimentaria
  - alergia
  - detalle adicional
  - mayor/menor de 18
  - fecha de confirmación

### Reglas de exportación
- Exportar solo las confirmaciones de la invitación activa.
- Mantener orden por fecha de creación.
- Si no hay confirmaciones, exportar un CSV vacío o mostrar un mensaje de “Sin confirmaciones”.

### Valor de negocio
- Ahorra muchísimo tiempo administrativo.
- Hace que el producto sirva para eventos reales y no solo para un demo.
- Es una funcionalidad que los clientes valoran mucho.

---

## 5) Cómo encaja todo en el admin

### Layout sugerido
- Header con:
  - Ver invitación
  - Editar invitación
  - Copiar link
  - Compartir
  - QR
  - Exportar CSV
- Luego:
  - Stats cards
  - tabla de confirmaciones
  - paginación

### Orden recomendado de implementación
1. Exportar CSV
2. Stats básicas
3. QR para confirmar asistencia
4. Descargar/compartir QR desde admin

---

## 6) Resumen ejecutivo

Lo que más suma valor es esto:
- QR para confirmar asistencia desde admin
- stats inmediatas del evento
- exportación de confirmaciones en CSV

Esto convierte la app en una herramienta real para organizar eventos, no solo en una invitación visual.

La prioridad más fuerte es:
- exportar confirmaciones,
- luego stats,
- y después QR de confirmación y compartir.
