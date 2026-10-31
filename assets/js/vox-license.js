/**
 * VOX Business Developer - Sistema Unificado de Licencia (Killswitch) y Telemetría Web (VOX Radar)
 * Archivo: assets/js/vox-license.js
 * 
 * Uso en páginas externas o propias:
 * <script src="https://voxbusinessdeveloper.com/assets/js/vox-license.js" data-vox-site="TU_SITE_KEY" defer></script>
 */

(function () {
    'use strict';

    // No ejecutar telemetría ni bloqueo dentro del panel de administración
    if (window.location.pathname && window.location.pathname.indexOf('/admin') === 0) {
        return;
    }

    // 1. Obtener la clave del sitio del atributo data-vox-site (o asignar vox_site_official por defecto)
    function getSiteKey() {
        if (document.currentScript && document.currentScript.getAttribute('data-vox-site')) {
            return document.currentScript.getAttribute('data-vox-site').trim();
        }
        const tag = document.querySelector('script[data-vox-site]');
        if (tag && tag.getAttribute('data-vox-site')) {
            return tag.getAttribute('data-vox-site').trim();
        }
        return 'vox_site_official';
    }

    const SITE_KEY = getSiteKey();
    if (!SITE_KEY) return;

    // Configuración del Endpoint Supabase
    const SUPABASE_URL = "https://umnnzfaymrictdpxpurh.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbm56ZmF5bXJpY3RkcHhwdXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDY5NzksImV4cCI6MjEwNDI4Mjk3OX0.CXtmnp4xprxn0kHCEunm9QrmpY-o5qGmPD5ZslhMHcU";
    const CACHE_KEY = `_vox_lic_${SITE_KEY}`;
    const CACHE_TTL = 30 * 1000; // 30 segundos de caché para respuesta casi inmediata a cambios de estado

    // =========================================================================
    // PARTE A: VERIFICACIÓN DE LICENCIA Y KILLSWITCH (Para sitios clientes)
    // =========================================================================
    if (SITE_KEY !== 'vox_site_official') {
        try {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.timestamp < CACHE_TTL) {
                    if (parsed.estado === 'suspendido') {
                        aplicarBloqueoVOX(parsed.cliente, parsed.motivo);
                    }
                }
            }
        } catch (e) {}

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', consultarEstadoLicencia);
        } else {
            consultarEstadoLicencia();
        }
    }

    async function consultarEstadoLicencia() {
        try {
            const localCache = localStorage.getItem('vox_creditos_cache');
            if (localCache) {
                const creditos = JSON.parse(localCache);
                const match = creditos.find(c => c.site_key === SITE_KEY);
                if (match && match.estado === 'suspendido') {
                    aplicarBloqueoVOX(match.cliente_nombre, match.motivo_suspension);
                    return;
                }
            }
        } catch (e) {}

        try {
            const rpcEndpoint = `${SUPABASE_URL}/rest/v1/rpc/verificar_licencia_sitio`;
            const response = await fetch(rpcEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({ p_site_key: SITE_KEY })
            });

            let estado = null;
            let cliente = '';
            let motivo = '';

            if (response.ok) {
                const data = await response.json();
                if (data && data.valido) {
                    estado = data.estado;
                    cliente = data.cliente || '';
                    motivo = data.motivo || '';
                }
            }

            if (!estado) {
                const tableEndpoint = `${SUPABASE_URL}/rest/v1/creditos_sitios?site_key=eq.${encodeURIComponent(SITE_KEY)}&select=estado,cliente_nombre,motivo_suspension`;
                const tableRes = await fetch(tableEndpoint, {
                    method: 'GET',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                });

                if (tableRes.ok) {
                    const rows = await tableRes.json();
                    if (rows && rows.length > 0) {
                        estado = rows[0].estado;
                        cliente = rows[0].cliente_nombre || '';
                        motivo = rows[0].motivo_suspension || '';
                    }
                }
            }

            if (!estado) return;

            try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                    estado: estado,
                    cliente: cliente,
                    motivo: motivo,
                    timestamp: Date.now()
                }));
            } catch (e) {}

            if (estado === 'suspendido') {
                aplicarBloqueoVOX(cliente, motivo);
            }
        } catch (err) {
            // Silencioso en caso de red
        }
    }

    function aplicarBloqueoVOX(clienteNombre, motivo) {
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.height = '100%';
        if (document.body) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100%';
        }

        const overlayId = 'vox-suspension-overlay';
        if (document.getElementById(overlayId)) return;

        if (!document.getElementById('vox-font-sora')) {
            const fontLink = document.createElement('link');
            fontLink.id = 'vox-font-sora';
            fontLink.rel = 'stylesheet';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap';
            document.head.appendChild(fontLink);
        }

        const overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: radial-gradient(circle at 50% 20%, rgba(201, 168, 106, 0.08) 0%, rgba(9, 11, 14, 0.98) 70%), #090B0E !important;
            color: #F5F7FA !important;
            z-index: 2147483647 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-family: 'Sora', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            padding: 24px !important;
            box-sizing: border-box !important;
            text-align: center !important;
        `;

        overlay.innerHTML = `
            <div style="
                max-width: 520px;
                width: 100%;
                background: linear-gradient(180deg, rgba(24, 28, 34, 0.9) 0%, rgba(17, 20, 24, 0.95) 100%);
                border: 1px solid rgba(201, 168, 106, 0.35);
                border-radius: 24px;
                padding: 44px 34px;
                box-shadow: 0 30px 90px rgba(0, 0, 0, 0.9), 0 0 50px rgba(201, 168, 106, 0.12);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                position: relative;
                overflow: hidden;
            ">
                <div style="position: absolute; top: -60px; left: 50%; transform: translateX(-50%); width: 220px; height: 120px; background: radial-gradient(circle, rgba(201, 168, 106, 0.25) 0%, transparent 70%); pointer-events: none;"></div>

                <div style="margin-bottom: 22px; display: inline-flex; align-items: center; justify-content: center; width: 76px; height: 76px; border-radius: 20px; background: rgba(201, 168, 106, 0.1); border: 1px solid rgba(201, 168, 106, 0.3); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);">
                    <img src="https://voxbusinessdeveloper.com/assets/images/logos/vox_fox.png" alt="VOX" style="width: 44px; height: auto; display: block;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <svg style="display: none; width: 36px; height: 36px;" viewBox="0 0 24 24" fill="none" stroke="#C9A86A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>

                <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; background: rgba(201, 168, 106, 0.15); color: #C9A86A; border: 1px solid rgba(201, 168, 106, 0.3); padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                        VOX BUSINESS DEVELOPER
                    </span>
                </div>

                <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 10px 0; color: #FFFFFF; letter-spacing: -0.5px; line-height: 1.3;">
                    Portal Temporalmente Inactivo
                </h1>

                <p style="font-size: 14px; line-height: 1.6; color: #9AA2AC; margin: 0 0 24px 0;">
                    Este sitio web se encuentra en proceso de <strong style="color: #F5F7FA;">administración técnica y actualización de servicio</strong> por parte de VOX Business Developer.
                </p>

                <div style="padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.06);">
                    <a href="https://voxbusinessdeveloper.com" target="_blank" rel="noopener noreferrer" style="
                        color: #606873;
                        font-size: 12px;
                        text-decoration: none;
                        padding: 6px;
                        display: inline-block;
                        transition: color 0.2s ease;
                    ">
                        Desarrollado y Gestionado por <strong style="color: #C9A86A;">VOX Business Developer</strong>
                    </a>
                </div>
            </div>
        `;

        if (document.body) {
            document.body.appendChild(overlay);
        } else {
            window.addEventListener('DOMContentLoaded', () => document.body.appendChild(overlay));
        }
    }

    // =========================================================================
    // PARTE B: MOTOR DE TELEMETRÍA Y RASTREO DE MOVIMIENTOS (VOX RADAR)
    // =========================================================================
    const VID_STORAGE_KEY = '_vox_radar_vid';
    const SID_STORAGE_KEY = '_vox_radar_sid';
    const SID_STATE_KEY = '_vox_radar_state';
    const LOCAL_SESSIONS_CACHE = 'vox_telemetry_sessions_cache';
    const LOCAL_EVENTS_CACHE = 'vox_telemetry_events_cache';
    const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

    function generateId(prefix) {
        return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
    }

    function getVisitorId() {
        try {
            let vid = localStorage.getItem(VID_STORAGE_KEY);
            if (!vid) {
                vid = generateId('vusr');
                localStorage.setItem(VID_STORAGE_KEY, vid);
            }
            return vid;
        } catch (e) {
            return generateId('vusr');
        }
    }

    function detectDeviceType() {
        const ua = navigator.userAgent || '';
        if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
        if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return 'mobile';
        }
        return window.innerWidth <= 768 ? 'mobile' : 'desktop';
    }

    function detectOS() {
        const ua = navigator.userAgent || '';
        if (/Windows/i.test(ua)) return 'Windows';
        if (/Android/i.test(ua)) return 'Android';
        if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
        if (/Mac OS X|Macintosh/i.test(ua)) return 'macOS';
        if (/Linux/i.test(ua)) return 'Linux';
        return 'Otro';
    }

    function detectBrowser() {
        const ua = navigator.userAgent || '';
        if (/Edg\//i.test(ua)) return 'Edge';
        if (/OPR\/|Opera/i.test(ua)) return 'Opera';
        if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return 'Chrome';
        if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return 'Safari';
        if (/Firefox\//i.test(ua)) return 'Firefox';
        return 'Navegador Web';
    }

    function classifyReferrer(ref) {
        if (!ref) return 'Directo';
        try {
            const url = new URL(ref);
            if (url.hostname === window.location.hostname) return 'Navegación Interna';
            const host = url.hostname.toLowerCase();
            if (host.includes('google.')) return 'Google Search';
            if (host.includes('instagram.com')) return 'Instagram';
            if (host.includes('facebook.com') || host.includes('fb.com')) return 'Facebook';
            if (host.includes('tiktok.com')) return 'TikTok';
            if (host.includes('linkedin.com')) return 'LinkedIn';
            if (host.includes('bing.com')) return 'Bing';
            if (host.includes('youtube.com')) return 'YouTube';
            return url.hostname;
        } catch (e) {
            return 'Directo';
        }
    }

    function getUtmParams() {
        try {
            const params = new URLSearchParams(window.location.search);
            return {
                utm_source: params.get('utm_source') || '',
                utm_medium: params.get('utm_medium') || '',
                utm_campaign: params.get('utm_campaign') || ''
            };
        } catch (e) {
            return { utm_source: '', utm_medium: '', utm_campaign: '' };
        }
    }

    const visitorId = getVisitorId();
    const utm = getUtmParams();

    // Recuperar o iniciar sesión de navegador
    function initOrRestoreSession() {
        const now = Date.now();
        try {
            const raw = sessionStorage.getItem(SID_STATE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.session_id && (now - (parsed.last_ts || now) < SESSION_TIMEOUT_MS)) {
                    parsed.last_ts = now;
                    parsed.current_url = window.location.pathname + window.location.search;
                    parsed.page_views_count = (parsed.page_views_count || 1) + 1;
                    sessionStorage.setItem(SID_STATE_KEY, JSON.stringify(parsed));
                    return parsed;
                }
            }
        } catch (e) {}

        const initialRef = classifyReferrer(document.referrer);
        const newSession = {
            session_id: generateId('vsess'),
            visitor_id: visitorId,
            site_key: SITE_KEY,
            dominio: window.location.hostname || 'voxbusinessdeveloper.com',
            started_at: new Date(now).toISOString(),
            last_seen_at: new Date(now).toISOString(),
            start_ts: now,
            last_ts: now,
            duration_seconds: 0,
            max_scroll_pct: 0,
            entry_url: window.location.pathname + window.location.search,
            current_url: window.location.pathname + window.location.search,
            referrer: initialRef === 'Navegación Interna' ? 'Directo' : initialRef,
            utm_source: utm.utm_source,
            utm_medium: utm.utm_medium,
            utm_campaign: utm.utm_campaign,
            device_type: detectDeviceType(),
            os: detectOS(),
            browser: detectBrowser(),
            screen_res: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language || 'es-MX',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mexico_City',
            page_views_count: 1,
            clicks_count: 0,
            whatsapp_clicks: 0,
            form_interacted: false,
            converted_to_lead: false,
            lead_nombre: '',
            lead_correo: ''
        };

        try {
            sessionStorage.setItem(SID_STORAGE_KEY, newSession.session_id);
            sessionStorage.setItem(SID_STATE_KEY, JSON.stringify(newSession));
        } catch (e) {}

        return newSession;
    }

    const sessionData = initOrRestoreSession();
    const eventQueue = [];
    const reachedScrollMilestones = new Set();
    const viewedSections = new Set();
    let formStartedOnPage = false;
    let formSubmittedOnPage = false;
    let isDirty = false;

    function persistSessionState() {
        const now = Date.now();
        sessionData.last_ts = now;
        sessionData.last_seen_at = new Date(now).toISOString();
        sessionData.duration_seconds = Math.max(
            sessionData.duration_seconds || 0,
            Math.round((now - (sessionData.start_ts || now)) / 1000)
        );
        try {
            sessionStorage.setItem(SID_STATE_KEY, JSON.stringify(sessionData));
        } catch (e) {}
    }

    // Guardar espejo local en localStorage para disponibilidad inmediata en el mismo navegador
    function syncToLocalStorageMirror(eventsToSync) {
        try {
            const rawSessions = localStorage.getItem(LOCAL_SESSIONS_CACHE);
            const sessions = rawSessions ? JSON.parse(rawSessions) : [];
            const idx = sessions.findIndex(s => s.session_id === sessionData.session_id);
            const cleanSession = { ...sessionData };
            delete cleanSession.start_ts;
            delete cleanSession.last_ts;

            if (idx >= 0) {
                sessions[idx] = { ...sessions[idx], ...cleanSession };
            } else {
                sessions.unshift(cleanSession);
            }
            localStorage.setItem(LOCAL_SESSIONS_CACHE, JSON.stringify(sessions.slice(0, 120)));

            if (eventsToSync && eventsToSync.length > 0) {
                const rawEvents = localStorage.getItem(LOCAL_EVENTS_CACHE);
                const allEvents = rawEvents ? JSON.parse(rawEvents) : [];
                eventsToSync.forEach(ev => {
                    allEvents.push({ id: generateId('vev'), ...ev });
                });
                // Conservar últimos 800 eventos locales
                localStorage.setItem(LOCAL_EVENTS_CACHE, JSON.stringify(allEvents.slice(-800)));
            }
        } catch (e) {}
    }

    function recordEvent(eventType, details = {}) {
        persistSessionState();
        const ev = {
            created_at: new Date().toISOString(),
            session_id: sessionData.session_id,
            visitor_id: sessionData.visitor_id,
            site_key: SITE_KEY,
            event_type: eventType,
            page_url: window.location.href,
            page_path: window.location.pathname || '/',
            page_title: (document.title || '').slice(0, 120),
            section_id: details.section_id || '',
            element_tag: details.element_tag || '',
            element_text: (details.element_text || '').replace(/\s+/g, ' ').trim().slice(0, 120),
            element_href: (details.element_href || '').slice(0, 240),
            click_x_pct: typeof details.click_x_pct === 'number' ? Number(details.click_x_pct.toFixed(2)) : null,
            click_y_pct: typeof details.click_y_pct === 'number' ? Number(details.click_y_pct.toFixed(2)) : null,
            scroll_pct: typeof details.scroll_pct === 'number' ? Math.round(details.scroll_pct) : null,
            metadata: details.metadata || {}
        };

        eventQueue.push(ev);
        isDirty = true;
        syncToLocalStorageMirror([ev]);
    }

    // Enviar lote acumulado a Supabase Cloud (RPC con fallback REST)
    async function flushTelemetry(useKeepalive = false) {
        if (!isDirty && eventQueue.length === 0) return;

        persistSessionState();
        const batchEvents = eventQueue.splice(0, eventQueue.length);
        isDirty = false;

        const cleanSession = { ...sessionData };
        delete cleanSession.start_ts;
        delete cleanSession.last_ts;

        syncToLocalStorageMirror([]);

        try {
            const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/registrar_telemetria_vox`, {
                method: 'POST',
                keepalive: useKeepalive,
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    p_session: cleanSession,
                    p_events: batchEvents
                })
            });

            if (rpcRes.ok) return;

            // Fallback directo a tablas REST si aún no se creó la RPC
            await fetch(`${SUPABASE_URL}/rest/v1/telemetria_sesiones?on_conflict=session_id`, {
                method: 'POST',
                keepalive: useKeepalive,
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Prefer': 'resolution=merge-duplicates,return=minimal'
                },
                body: JSON.stringify(cleanSession)
            });

            if (batchEvents.length > 0) {
                await fetch(`${SUPABASE_URL}/rest/v1/telemetria_eventos`, {
                    method: 'POST',
                    keepalive: useKeepalive,
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(batchEvents)
                });
            }
        } catch (err) {
            // Fallo silencioso para no interrumpir la experiencia del visitante
        }
    }

    // 1. Registrar Pageview Inicial
    function trackInitialPageview() {
        recordEvent('pageview', {
            scroll_pct: 0,
            metadata: {
                referrer: document.referrer || 'Directo',
                viewport: `${window.innerWidth}x${window.innerHeight}`
            }
        });
        setTimeout(() => flushTelemetry(false), 1200);
    }

    // 2. Rastreo de Profundidad de Scroll (25%, 50%, 75%, 100%)
    let scrollThrottleTimer = null;
    function handleScroll() {
        if (scrollThrottleTimer) return;
        scrollThrottleTimer = setTimeout(() => {
            scrollThrottleTimer = null;
            const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
            const docHeight = Math.max(
                document.body ? document.body.scrollHeight : 0,
                document.documentElement ? document.documentElement.scrollHeight : 0
            ) - window.innerHeight;

            if (docHeight <= 0) return;
            const pct = Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100)));

            if (pct > (sessionData.max_scroll_pct || 0)) {
                sessionData.max_scroll_pct = pct;
                isDirty = true;
                persistSessionState();
            }

            [25, 50, 75, 100].forEach(milestone => {
                if (pct >= milestone && !reachedScrollMilestones.has(milestone)) {
                    reachedScrollMilestones.add(milestone);
                    recordEvent('scroll_milestone', {
                        scroll_pct: milestone,
                        element_text: `Alcanzó el ${milestone}% de la página`
                    });
                }
            });
        }, 350);
    }

    // 3. Rastreo de Secciones Vistas (IntersectionObserver)
    function setupSectionObserver() {
        if (typeof IntersectionObserver === 'undefined') return;
        const sections = document.querySelectorAll('section[id], header[id], footer[id]');
        if (!sections.length) return;

        const timers = new Map();
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const secId = entry.target.getAttribute('id');
                if (!secId || viewedSections.has(secId)) return;

                if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
                    const t = setTimeout(() => {
                        if (!viewedSections.has(secId)) {
                            viewedSections.add(secId);
                            const heading = entry.target.querySelector('h1, h2, h3');
                            const secLabel = heading ? heading.textContent.trim().slice(0, 80) : secId;
                            recordEvent('section_view', {
                                section_id: secId,
                                element_text: `Vio sección #${secId} (${secLabel})`
                            });
                        }
                    }, 1500);
                    timers.set(secId, t);
                } else {
                    const t = timers.get(secId);
                    if (t) {
                        clearTimeout(t);
                        timers.delete(secId);
                    }
                }
            });
        }, { threshold: [0.35] });

        sections.forEach(sec => observer.observe(sec));
    }

    // 4. Rastreo de Clics y Coordenadas (X%, Y%)
    function handleDocumentClick(e) {
        const target = e.target;
        if (!target) return;

        const actionable = target.closest('a, button, [role="button"], input[type="submit"], .service-card, .team-card, .fab-wa');
        const el = actionable || target;

        const tag = (el.tagName || '').toLowerCase();
        const href = (el.getAttribute && (el.getAttribute('href') || '')) || '';
        const idAttr = (el.getAttribute && (el.getAttribute('id') || '')) || '';
        const ariaLabel = (el.getAttribute && (el.getAttribute('aria-label') || '')) || '';
        const rawText = (el.innerText || el.value || ariaLabel || idAttr || tag).replace(/\s+/g, ' ').trim().slice(0, 100);

        const closestSection = el.closest && el.closest('section[id], footer[id], header[id], nav');
        const sectionId = closestSection ? (closestSection.getAttribute('id') || closestSection.tagName.toLowerCase()) : '';

        // Coordenadas relativas (0-100%)
        const vw = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
        const vh = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
        const docH = Math.max(
            vh,
            document.body ? document.body.scrollHeight : 0,
            document.documentElement ? document.documentElement.scrollHeight : 0
        );

        const clickXPct = Math.min(100, Math.max(0, (e.clientX / vw) * 100));
        const clickYPct = Math.min(100, Math.max(0, (e.pageY / docH) * 100));
        const viewportYPct = Math.min(100, Math.max(0, (e.clientY / vh) * 100));

        // Clasificar el tipo de clic
        let eventType = 'click';
        const lowerHref = href.toLowerCase();
        const lowerId = idAttr.toLowerCase();
        const classListStr = (el.className && typeof el.className === 'string') ? el.className.toLowerCase() : '';

        if (
            lowerHref.includes('wa.me') ||
            lowerHref.includes('whatsapp.com') ||
            lowerId.includes('wa') ||
            classListStr.includes('fab-wa') ||
            rawText.toLowerCase().includes('whatsapp')
        ) {
            eventType = 'cta_whatsapp';
            sessionData.whatsapp_clicks = (sessionData.whatsapp_clicks || 0) + 1;
        } else if (lowerHref.startsWith('tel:')) {
            eventType = 'cta_phone';
        } else if (lowerHref.startsWith('mailto:')) {
            eventType = 'cta_email';
        }

        // Ignorar clics vacíos en el fondo que no sean elementos interactivos si no aportan valor,
        // pero registrar coordenadas de todo clic intencional
        sessionData.clicks_count = (sessionData.clicks_count || 0) + 1;

        recordEvent(eventType, {
            section_id: sectionId,
            element_tag: tag,
            element_text: rawText || `Clic en <${tag}>`,
            element_href: href,
            click_x_pct: clickXPct,
            click_y_pct: clickYPct,
            metadata: {
                viewport_y_pct: Number(viewportYPct.toFixed(1)),
                is_interactive: Boolean(actionable)
            }
        });

        if (eventType !== 'click') {
            flushTelemetry(true);
        }
    }

    // 5. Rastreo de Interacción con Formularios (Inicio, Envío y Abandono)
    function setupFormTracking() {
        document.addEventListener('focusin', (e) => {
            const input = e.target;
            if (!input || !input.closest) return;
            const form = input.closest('form');
            if (!form) return;

            const fieldName = input.getAttribute('name') || input.getAttribute('id') || input.getAttribute('type') || 'campo';
            sessionData.form_interacted = true;

            if (!formStartedOnPage) {
                formStartedOnPage = true;
                recordEvent('form_start', {
                    section_id: form.closest('section[id]')?.getAttribute('id') || 'formulario',
                    element_tag: 'form',
                    element_text: `Inició llenado de formulario (campo: ${fieldName})`,
                    metadata: { first_field: fieldName }
                });
            }
        }, { passive: true });

        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (!form) return;
            formSubmittedOnPage = true;
            sessionData.form_interacted = true;
            recordEvent('form_submit', {
                section_id: form.closest('section[id]')?.getAttribute('id') || 'formulario',
                element_tag: 'form',
                element_text: 'Envió formulario de contacto'
            });
            flushTelemetry(true);
        }, { passive: true });
    }

    // 6. API Pública para Vincular Sesión con Lead del CRM
    window.VOX_TELEMETRY = {
        getSessionId: () => sessionData.session_id,
        getVisitorId: () => sessionData.visitor_id,
        getSiteKey: () => SITE_KEY,
        trackCustomEvent: (type, details) => {
            recordEvent(type || 'click', details || {});
        },
        identifyLead: (leadInfo = {}) => {
            formSubmittedOnPage = true;
            sessionData.converted_to_lead = true;
            sessionData.form_interacted = true;
            if (leadInfo.nombre) sessionData.lead_nombre = String(leadInfo.nombre).trim();
            if (leadInfo.correo) sessionData.lead_correo = String(leadInfo.correo).trim().toLowerCase();

            recordEvent('form_submit', {
                section_id: 'contacto',
                element_tag: 'form',
                element_text: `Lead Convertido: ${sessionData.lead_nombre || 'Prospecto'} (${leadInfo.servicio || 'General'})`,
                metadata: {
                    lead_id: leadInfo.leadId || null,
                    lead_nombre: sessionData.lead_nombre,
                    lead_correo: sessionData.lead_correo,
                    servicio: leadInfo.servicio || ''
                }
            });
            flushTelemetry(true);
        }
    };

    // Inicializar listeners de telemetría
    function startTelemetryEngine() {
        trackInitialPageview();
        setupSectionObserver();
        setupFormTracking();

        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('click', handleDocumentClick, { passive: true });

        // Envío periódico por lotes cada 8 segundos si hubo actividad, y heartbeat cada 24s
        let ticks = 0;
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                ticks++;
                persistSessionState();
                if (isDirty || ticks % 3 === 0) {
                    isDirty = true;
                    flushTelemetry(false);
                }
            }
        }, 8000);

        // Detectar abandono de formulario o salida de pestaña
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                if (formStartedOnPage && !formSubmittedOnPage && !sessionData.converted_to_lead) {
                    recordEvent('form_abandon', {
                        section_id: 'contacto',
                        element_tag: 'form',
                        element_text: 'Salió de la página tras interactuar con el formulario sin enviarlo'
                    });
                    formStartedOnPage = false; // evitar duplicados
                }
                isDirty = true;
                flushTelemetry(true);
            }
        });

        window.addEventListener('pagehide', () => {
            isDirty = true;
            flushTelemetry(true);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startTelemetryEngine);
    } else {
        startTelemetryEngine();
    }
})();
