# VOX TECH & WEB ARCHITECTURE
## Manual de Arquitectura de Desarrollo Web y Estándar de Sistemas
> **Modelo Estructural Obligatorio para Todas las Páginas, Módulos y Aplicaciones Web de VOX**  
> **Versión:** 2.0 (Producción 2026) | **Ecosistema:** VOX Business Developer

---

## 📌 Principio Arquitectónico de Desarrollo
Toda página o aplicación desarrollada por VOX debe construirse bajo una **arquitectura modular, escalable y desacoplada**.  
Ninguna página web es una isla de código independiente: todas comparten un **Núcleo Central de Utilidades (Core Engine)**, componentes de UI reutilizables, captura unificada de leads (`lead-service.js`), seguridad blindada (CORS, Rate Limiting, Turnstile/reCAPTCHA) y un flujo Dev/Ops automatizado.

---

## 1. 🌐 Visión del Sistema Web Integrado VOX
Cada landing page o módulo de servicio (*desarrollo de software, consultoría jurídica, contable, arquitectura comercial, marketing, etc.*) funciona como una extensión natural de un único ecosistema tecnológico.

* **Cero código 'espagueti':** Separación estricta entre presentación, lógica y datos.
* **Cero librerías duplicadas:** Utilidades y configuraciones centralizadas.
* **Cero formularios desconectados:** Captura comercial unificada en base de datos central.

---

## 2. 🏛️ Las Cinco Capas de la Arquitectura Web VOX

```
┌─────────────────────────────────────────────────────────────┐
│  CAPA 5: Experiencia de Usuario, Cumplimiento y Rendimiento │  (Core Web Vitals, SEO, Cookies)
├─────────────────────────────────────────────────────────────┤
│  CAPA 4: Seguridad, Autenticación y Persistencia Backend     │  (Supabase RLS, CORS, Rate Limit)
├─────────────────────────────────────────────────────────────┤
│  CAPA 3: Lógica de Negocio, Servicios y Observabilidad      │  (lead-service.js, Sentry, Telemetría)
├─────────────────────────────────────────────────────────────┤
│  CAPA 2: Módulos de Componentes Reutilizables               │  (Navbar, Cards, Modales, Form Shield)
├─────────────────────────────────────────────────────────────┤
│  CAPA 1: Núcleo y Fundamentos Compartidos (Core Layer)      │  (CSS Tokens, .env, DB Client)
└─────────────────────────────────────────────────────────────┘
```

### • Capa 1: Núcleo y Fundamentos Compartidos (Core Layer)
* **Tokens Globales:** Variables CSS (`:root`) para colores corporativos, tipografía, espaciados y reset universal.
* **Configuración Central:** Cliente único de base de datos (`/assets/js/supabase-config.js`) y utilidades de red seguras.
* **Variables de Entorno:** Matriz estricta de variables `.env` separando credenciales públicas y privadas.

### • Capa 2: Módulos de Componentes Reutilizables (Component Layer)
* **Bloques UI Estándar:** Header/Navbar inteligente con estado activo, Hero sections con CTA dinámicos, Cards con micro-interacciones, Acordeones FAQ y Footers corporativos unificados.
* **Formularios Dinámicos:** Formulario modular con validaciones en tiempo real y token anti-bot integrado.

### • Capa 3: Lógica de Negocio, Servicios y Observabilidad (Service Layer)
* **Captura Universal de Leads:** Desacoplada mediante `lead-service.js`. Sanitiza, valida y despacha los datos comerciales.
* **Licenciamiento y Control:** Control de versiones, licencias corporativas y killswitch contingente (`vox-license.js`).
* **Monitoreo de Errores:** Registro centralizado de excepciones y fallos silenciosos de red (Sentry / LogSnag / Error Boundary).

### • Capa 4: Seguridad, Autenticación y Persistencia (Security & Data Layer)
* **Backend Serverless Seguro:** Endpoints en `/api/` protegidos con políticas CORS estrictas.
* **Rate Limiting:** Límite de peticiones por IP (ej. máximo 5 cotizaciones/min) para prevención de spam y ataques DDoS.
* **Persistencia PostgreSQL / Supabase:** Políticas RLS (*Row Level Security*) activadas y segregación de roles (RBAC).

### • Capa 5: Experiencia de Usuario y Rendimiento (UX & Performance Layer)
* **Rendimiento:** Animaciones a 60 FPS, lazy loading en imágenes/recursos y tiempos de carga < 1.5s (Core Web Vitals).
* **Control de Caché:** Estrategia de *cache-busting* en assets estáticos y cabeceras `Cache-Control` optimizadas.
* **SEO Técnico & Accesibilidad:** Estructura semántica HTML5 con **un único `<h1>`**, jerarquía H2/H3 y etiquetas OpenGraph completas.
* **Privacidad y Cumplimiento:** Banner de consentimiento de cookies y enlaces a Políticas de Privacidad (GDPR/LGPD).

---

## 3. 📂 Estructura Estándar de Archivos del Proyecto

```text
├── index.html                   # Landing principal corporativa
├── servicio.html                # Plantilla base reutilizable de servicio
├── styles.css                   # Core de estilos y tokens del sistema
├── script.js                    # Controlador de interactividad global
├── .env.example                 # Plantilla pública de variables requeridas
├── .env.local                   # Variables locales de desarrollo (en .gitignore)
├── vercel.json                  # Configuración de headers de seguridad, CORS y rutas
│
├── /assets/
│   ├── /css/                    # Hojas de estilo modulares complementarias
│   ├── /js/
│   │   ├── supabase-config.js   # Cliente maestro de Supabase
│   │   ├── lead-service.js      # Servicio universal de leads y telemetría
│   │   └── vox-license.js       # Sistema de licencias y contingencia
│   └── /images/                 # Recursos gráficos optimizados (WebP / SVG)
│
├── /servicios/                  # Páginas individuales de cada vertical
│   ├── desarrollo-software.html
│   ├── juridico-corporativo.html
│   ├── contable-financiero.html
│   └── arquitectura-comercial.html
│
├── /api/                        # Serverless Functions (Backend seguro)
│   ├── leads.js                 # Endpoint de captura de leads con Rate Limit y CORS
│   └── verify-license.js        # Validación segura de licencias
│
├── /admin/                      # Panel interno protegido por Auth y RLS
│   ├── index.html
│   └── dashboard.js
│
└── /docs/                       # Documentación técnica, esquemas y manuales
```

---

## 4. 🔄 Flujo Dev/Ops, Gestión de Entornos y CI/CD

### 4.1. Estrategia de Ramas en Git (GitFlow)
* `main`: Rama de **Producción**. Despliegue automático tras pasar pruebas automatizadas. **Protegida contra push directo.**
* `staging`: Rama de **Pruebas y Homologación (QA)**. Verificación previa a release.
* `feature/*` o `fix/*`: Ramas de desarrollo para nuevas características o parches (ej. `feature/turnstile-captcha`, `fix/cors-lead-api`). Requieren Pull Request con revisión.

### 4.2. Matriz de Variables de Entorno (Envs)
| Archivo / Ubicación | Propósito | Regla de Seguridad |
| :--- | :--- | :--- |
| `.env.example` | Plantilla versionada en Git | Sin valores reales ni secretos. |
| `.env.local` | Entorno local de desarrollo | **Obligatorio en `.gitignore`**. Nunca subir a Git. |
| **Vercel Settings** | Producción y Staging | Inyección segura en cloud. Service Role Keys solo en `/api/`. |

### 4.3. Pipeline de CI/CD Automatizado
1. **Validación de PR:** Chequeo automático de sintaxis AST (Node), linters y consistencia de dependencias.
2. **Preview Deploy:** Generación de URL de previsualización efímera para pruebas funcionales y de UX.
3. **Paso a Producción:** Aprobación obligatoria del Checklist de Homologación antes del merge a `main`.

---

## 5. 🧪 Protocolo de QA, Calidad de Código y Manejo de Assets

### 5.1. Linter y Formato Unificado
* **ESLint & Prettier:** Indentación de 2 espacios, comillas simples, punto y coma obligatorio, sin variables no utilizadas.
* **Stylelint:** Garantiza el uso exclusivo de tokens CSS de `:root`, impidiendo colores hexadecimales hardcodeados en componentes aislados.

### 5.2. Control de Caché de Assets (Cache-Busting)
* **Assets Inmutables (Fuentes, Logos):** `Cache-Control: public, max-age=31536000, immutable`.
* **Scripts y CSS:** Versionado por query param (ej. `styles.css?v=2.1`) o hash para reflejar cambios en producción de inmediato sin que el cliente requiera vaciar caché.

---

## 6. 🛡️ Seguridad Ampliada (Capa 4) & Observabilidad (Capa 3)

### 6.1. CORS y Rate Limiting Serverless
* Restricción estricta de orígenes autorizados en `/api/leads.js` a dominios oficiales de VOX.
* Rate Limiting por IP configurado (máximo 5 peticiones/minuto por cliente) para mitigar spam y ataques de fuerza bruta.

### 6.2. Protección Anti-Bots
* Integración obligatoria de **Cloudflare Turnstile** o **reCAPTCHA v3 invisible** en todos los formularios públicos.
* El token generado en el cliente se verifica en el backend antes de guardar el lead o disparar correos de notificación.

### 6.3. Privacidad y Consentimiento de Cookies
* Banner modal o barra de consentimiento modular categorizada (Técnicas, Analítica, Marketing) con enlace a Políticas de Privacidad.

### 6.4. Observabilidad y Monitoreo de Errores
* Captura y reporte asíncrono de excepciones cliente/servidor mediante **Sentry** o **LogSnag** integrado en `lead-service.js`.

---

## 7. 📏 Reglas Técnicas Obligatorias para Nuevas Páginas

1. **Principio DRY (Don't Repeat Yourself):** Ninguna página debe duplicar la lógica de envío de formularios, clientes de APIs o scripts del core; se importan desde `/assets/js/`.
2. **Estilos Tokenizados:** Usar exclusivamente las variables de `:root` para consistencia cromática, espaciados y tipografía.
3. **Trazabilidad Universal de Formularios:** Cada formulario debe registrar servicio de origen, requerimiento comercial, UTMs de campaña y timestamp.
4. **Semántica HTML5 & SEO:** Estructura con `<header>`, `<main>`, `<section>`, `<footer>`, un solo `<h1>` por página y atributos ARIA de accesibilidad.
5. **Resiliencia & Feedback:** Bloques `try/catch` en llamadas asíncronas, estados de carga (spinners/disable) y notificaciones toast de éxito o error.

---

## 8. ✅ Checklist de Homologación Pre-Publicación (Gate de Producción)

Toda nueva página, servicio o módulo de VOX debe cumplir este checklist antes de lanzarse a producción:

- [ ] **Core & Tokens:** Importa correctamente `styles.css` y las utilidades compartidas sin duplicar estilos.
- [ ] **Captura de Leads:** Conectada a `lead-service.js`, probada en Supabase y con notificación por correo activa.
- [ ] **Protección Anti-Bot:** Verificación de token Turnstile / reCAPTCHA activa en el formulario.
- [ ] **Variables de Entorno:** `.env.example` al día y credenciales sensibles configuradas en Vercel/Hosting.
- [ ] **Calidad de Código (QA):** Sin errores de sintaxis en consola, formateado con linter y con cache-busting en assets.
- [ ] **Seguridad Serverless:** Endpoints `/api/` con CORS restringido y Rate Limiting verificado.
- [ ] **Monitoreo:** Logger de errores activo para atrapar fallos silenciosos de red.
- [ ] **SEO Técnico:** Meta Title único, Meta Description persuasiva, OpenGraph configurado y único `<h1>`.
- [ ] **Core Web Vitals:** Tiempo de carga inferior a 1.5 - 2.0 segundos en conexiones móviles estándar.
- [ ] **Responsive Design:** Probado y fluido en 360px, 768px, 1024px y 1440px sin desbordamiento horizontal.
- [ ] **Privacidad:** Banner de cookies operativo y consola del navegador limpia.

---

## 9. 🏆 Dictamen y Evaluación Arquitectónica

* **Escalabilidad Garantizada:** El desacoplamiento en 5 capas permite incorporar nuevos servicios o herramientas sin afectar las páginas existentes.
* **Máxima Conversión Comercial:** La centralización de `lead-service.js` asegura cero pérdida de oportunidades de negocio en cualquier punto del ecosistema.
