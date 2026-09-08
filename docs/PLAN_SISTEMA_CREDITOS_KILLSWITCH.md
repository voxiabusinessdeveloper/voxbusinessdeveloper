# Sistema de Créditos, Cobranza Manual y Killswitch de Sitios Web
**VOX Business Developer**

---

## 1. Resumen del Objetivo
Implementar un sistema integral para gestionar páginas web financiadas a crédito (ej. **8 meses de $1,000 MXN**) que incluya:
1. **Script de Verificación y Bloqueo (Killswitch)** para los sitios web de los clientes.
2. **Módulo de Créditos & Cobranza en el Dashboard de VOX** (`/admin`) para registrar clientes, cuotas y controlar el estado del sitio en tiempo real.
3. **Flujo de Cobranza Manual** con registro de pagos con un solo clic, cálculo de cuotas restantes (ej. `3/8`), estados de gracia/suspensión y botón para generar el snippet de código del cliente.

---

## 2. Arquitectura de la Solución

```
                               ┌────────────────────────────────────────┐
                               │       Dashboard VOX (/admin)           │
                               │  - Pestaña "Créditos & Cobranza"       │
                               │  - Registrar cliente / Plan (8 meses)  │
                               │  - Registrar pagos manuales (SPEI/Efe) │
                               │  - Activar / Suspender / Reactivar     │
                               └───────────────────┬────────────────────┘
                                                   │
                                                   ▼
                               ┌────────────────────────────────────────┐
                               │           Supabase Database            │
                               │  - Tabla: creditos_sitios              │
                               │  - Tabla: historial_pagos_credito      │
                               │  - Endpoint / RPC de consulta pública  │
                               └───────────────────▲────────────────────┘
                                                   │ Consulta estado (site_key)
                                                   │
                               ┌───────────────────┴────────────────────┐
                               │       Sitio Web del Cliente            │
                               │  - Snippet: vox-license.js             │
                               │    (Verifica estado al cargar)         │
                               │  - Si está 'activo' -> Carga normal    │
                               │  - Si está 'suspendido' -> Cortina VOX │
                               └────────────────────────────────────────┘
```

---

## 3. Componentes a Desarrollar

### 3.1. Base de Datos en Supabase (`supabase_creditos_schema.sql`)
Creación de tablas seguras y optimizadas:
* **`public.creditos_sitios`**:
  - `id`: UUID identificador.
  - `site_key`: Token público único (ej. `vox_site_9f8a2b...`) para que el sitio del cliente valide su estado sin exponer credenciales.
  - `cliente_nombre`: Nombre del cliente / empresa.
  - `dominio_url`: URL del sitio web (ej. `https://cliente.com`).
  - `contacto_telefono`: Teléfono/WhatsApp para recordatorios.
  - `total_meses`: Total de mensualidades (por defecto `8`).
  - `meses_pagados`: Contador de mensualidades cubiertas (ej. `0` a `8`).
  - `monto_mensual`: Monto acordado (ej. `$1,000.00 MXN`).
  - `dia_corte`: Día del mes de pago (1 al 31).
  - `proximo_vencimiento`: Fecha límite del siguiente pago.
  - `estado`: `activo`, `en_gracia` (aviso discreto), `suspendido` (bloqueo total), `liquidado` (completó los 8 pagos, queda libre permanentemente).
  - `motivo_suspension`: Texto descriptivo (ej. "Falta de pago cuota 3").
* **`public.historial_pagos_credito`**:
  - `id`: UUID del pago.
  - `credito_id`: Referencia a `creditos_sitios`.
  - `numero_cuota`: Número de cuota pagada (ej. `1`, `2`, ..., `8`).
  - `monto`: Monto recibido.
  - `metodo_pago`: `transferencia_spei`, `oxxo`, `efectivo`, `tarjeta`, `otro`.
  - `comprobante_ref`: Folio o referencia del comprobante.
  - `fecha_pago`: Timestamp del registro.
  - `registrado_por`: Admin que validó el pago.
* **Políticas de Seguridad (RLS)**:
  - Función o vista pública ligera para validar `site_key` $\rightarrow$ `estado` (sin exponer datos confidenciales del cliente).
  - Permisos completos de edición solo para administradores autenticados.

---

### 3.2. Script Embebible del Cliente (`vox-license.js`)
Un script ultraligero y seguro (menos de 3KB) que se coloca en el `<head>` del sitio del cliente:
* **Modo de Funcionamiento**:
  1. Al cargar la página, consulta de forma asíncrona no bloqueante el estado de la licencia mediante el `site_key`.
  2. Almacena en `sessionStorage` el estado con un TTL (para no saturar solicitudes si el usuario navega entre páginas).
  3. **Comportamiento si el estado es `activo` o `liquidado`**: No hace nada, el sitio funciona con 100% de normalidad y máxima velocidad.
  4. **Comportamiento si el estado es `suspendido`**:
     - Detiene la ejecución visual.
     - Muestra un overlay elegante y corporativo con estética VOX:
       - Logotipo oficial de VOX.
       - Mensaje: *"Sitio web temporalmente inactivo por administración del servicio"*.
       - Botón directo para contactar a soporte/administración de VOX vía WhatsApp con el folio del sitio.
  5. **Manejo Offline / Fallo de Red**: Si el servidor no responde, permite la navegación temporal para evitar falsos bloqueos.

---

### 3.3. Interfaz de Administración en el Dashboard (`/admin`)
Integración en `admin/index.html`, `admin/dashboard.js` y `admin/dashboard.css`:

1. **Nuevo Módulo en el Menú Lateral**:
   - Pestaña **"Créditos & Sitios"** con icono de tarjeta/candado.
   - Badges con contador de sitios suspendidos o pagos próximos a vencer.

2. **Vista Principal de Créditos**:
   - **Tarjetas de Resumen KPI**:
     - Total de Sitios Financiados.
     - Ingreso Mensual Esperado vs. Cobrado en el mes.
     - Sitios Activos vs. Sitios Suspendidos.
   - **Filtros Rápidos**: `Todos`, `Al corriente`, `Próximos a vencer`, `Suspendidos`, `Liquidados (8/8)`.

3. **Tabla y Tarjetas de Sitios**:
   - Nombre del Cliente / Negocio y enlace al dominio.
   - Barra de Progreso Visual: `[ ■ ■ ■ □ □ □ □ □ ] 3 de 8 Meses ($3,000 / $8,000 MXN)`.
   - Fecha de próximo corte y días restantes.
   - Badge de estado dinámico (`Activo`, `En Gracia`, `Suspendido`, `Liquidado`).
   - **Botones de Acción Rápida**:
     - 💳 **Registrar Pago**: Modal para confirmar monto ($1,000), método y subir referencia. Aumenta la cuota automáticamente.
     - ⚡ **Interruptor Killswitch**: Botón directo para `Suspender Inmediatamente` o `Reactivar Sitio`.
     - 📋 **Copiar Código Embebible**: Copia al portapapeles el tag `<script>` listo con el `site_key` para pegar en la web del cliente.
     - 💬 **Recordatorio WhatsApp**: Botón que abre WhatsApp con mensaje predeterminado de cobranza (ej. *"Hola [Cliente], te recordamos que tu cuota 4 de tu página web vence el..."*).

4. **Modal para Nuevo Crédito / Nuevo Sitio**:
   - Formulario para dar de alta un nuevo cliente: Nombre, Dominio, Teléfono, Plan (número de meses, monto mensual, día de corte).

---

## 4. Plan de Ejecución Paso a Paso

| Fase | Tarea | Entregable |
| :--- | :--- | :--- |
| **Fase 1** | **Base de Datos** | Archivo `supabase_creditos_schema.sql` con tablas, índices, RLS y función RPC pública. |
| **Fase 2** | **Script Killswitch** | Archivo `assets/js/vox-license.js` con diseño responsivo del modal de suspensión y validación de token. |
| **Fase 3** | **UI Dashboard** | Agregar la vista "Créditos & Sitios", formularios, modales y estilos en `admin/`. |
| **Fase 4** | **Lógica JS** | Métodos en `admin/dashboard.js` para CRUD de créditos, registro de pagos, toggle de suspensión y generación de snippets. |
| **Fase 5** | **Pruebas y Verificación** | Prueba de flujo completo: Crear crédito $\rightarrow$ Embeber script $\rightarrow$ Suspender $\rightarrow$ Validar bloqueo $\rightarrow$ Registrar pago $\rightarrow$ Validar reactivación. |

---

## 5. Ejemplo del Snippet que se le entregará a cada sitio web

```html
<!-- VOX Business Developer - Control de Licencia y Servicio -->
<script 
  src="https://voxbusinessdeveloper.com/assets/js/vox-license.js" 
  data-vox-site="vox_site_abc123xyz" 
  defer>
</script>
```

---
*Documento generado para VOX Business Developer. Listo para proceder a la ejecución tras confirmación.*
