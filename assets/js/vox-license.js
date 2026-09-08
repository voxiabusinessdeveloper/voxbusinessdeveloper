/**
 * VOX Business Developer - Sistema de Verificación y Control de Licencia de Sitio Web
 * Archivo: assets/js/vox-license.js
 * 
 * Uso:
 * <script src="https://voxbusinessdeveloper.com/assets/js/vox-license.js" data-vox-site="TU_SITE_KEY" defer></script>
 */

(function () {
    'use strict';

    // 1. Obtener la clave del sitio del atributo data-vox-site
    function getSiteKey() {
        if (document.currentScript && document.currentScript.getAttribute('data-vox-site')) {
            return document.currentScript.getAttribute('data-vox-site');
        }
        const tag = document.querySelector('script[data-vox-site]');
        if (tag) return tag.getAttribute('data-vox-site');
        return null;
    }

    const SITE_KEY = getSiteKey();
    if (!SITE_KEY) return;

    // Configuración del Endpoint Supabase
    const SUPABASE_URL = "https://umnnzfaymrictdpxpurh.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbm56ZmF5bXJpY3RkcHhwdXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDY5NzksImV4cCI6MjEwNDI4Mjk3OX0.CXtmnp4xprxn0kHCEunm9QrmpY-o5qGmPD5ZslhMHcU";
    const CACHE_KEY = `_vox_lic_${SITE_KEY}`;
    const CACHE_TTL = 30 * 1000; // 30 segundos de caché para respuesta casi inmediata a cambios de estado

    // 2. Verificar caché en sessionStorage para respuesta ultra rápida
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

    // 3. Consultar Estado en Supabase (RPC con fallback directo a REST Table)
    async function consultarEstadoLicencia() {
        // También verificar si en el mismo navegador se suspendió localmente
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
            // Intentar primero RPC optimizado
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

            // Si la RPC no respondió o no encontró, consultar directamente la tabla pública
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

            // Actualizar caché
            try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                    estado: estado,
                    cliente: cliente,
                    motivo: motivo,
                    timestamp: Date.now()
                }));
            } catch (e) {}

            // Si está suspendido, activar la cortina inmediatamente
            if (estado === 'suspendido') {
                aplicarBloqueoVOX(cliente, motivo);
            }
        } catch (err) {
            console.warn('[VOX License] Validación de servicio en curso.');
        }
    }

    // 4. Función para renderizar la cortina estética de suspensión VOX de Alta Gama
    function aplicarBloqueoVOX(clienteNombre, motivo) {
        // Evitar que el sitio se desplace
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.height = '100%';
        if (document.body) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100%';
        }

        const overlayId = 'vox-suspension-overlay';
        if (document.getElementById(overlayId)) return;

        // Inyectar fuente Sora de Google Fonts si no existe
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

        const waUrl = `https://wa.me/529994967389?text=${encodeURIComponent(
            `Hola VOX Business Developer, me comunico respecto al estado de servicio de mi sitio web (${clienteNombre || 'Cliente'} - Ref: ${SITE_KEY}). Deseo regularizar y reactivar el servicio.`
        )}`;

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
                <!-- Resplandor sutil superior -->
                <div style="position: absolute; top: -60px; left: 50%; transform: translateX(-50%); width: 220px; height: 120px; background: radial-gradient(circle, rgba(201, 168, 106, 0.25) 0%, transparent 70%); pointer-events: none;"></div>

                <!-- Logo Oficial VOX Fox -->
                <div style="margin-bottom: 22px; display: inline-flex; align-items: center; justify-content: center; width: 76px; height: 76px; border-radius: 20px; background: rgba(201, 168, 106, 0.1); border: 1px solid rgba(201, 168, 106, 0.3); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);">
                    <img src="https://voxbusinessdeveloper.com/assets/images/logos/vox_fox.png" alt="VOX" style="width: 44px; height: auto; display: block;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <svg style="display: none; width: 36px; height: 36px;" viewBox="0 0 24 24" fill="none" stroke="#C9A86A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>

                <!-- Badge Superior -->
                <div style="margin-bottom: 12px;">
                    <span style="display: inline-block; background: rgba(201, 168, 106, 0.15); color: #C9A86A; border: 1px solid rgba(201, 168, 106, 0.3); padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                        VOX BUSINESS DEVELOPER
                    </span>
                </div>

                <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 10px 0; color: #FFFFFF; letter-spacing: -0.5px; line-height: 1.3;">
                    Portal Temporalmente Inactivo
                </h1>

                <p style="font-size: 14px; line-height: 1.6; color: #9AA2AC; margin: 0 0 28px 0;">
                    Este sitio web se encuentra en proceso de <strong style="color: #F5F7FA;">administración técnica y actualización de servicio</strong> por parte de VOX Business Developer.
                </p>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        background: linear-gradient(135deg, #C9A86A 0%, #A37F3C 100%);
                        color: #090B0E;
                        text-decoration: none;
                        padding: 14px 24px;
                        border-radius: 12px;
                        font-weight: 700;
                        font-size: 14px;
                        letter-spacing: 0.2px;
                        box-shadow: 0 10px 25px -5px rgba(201, 168, 106, 0.4);
                        transition: all 0.2s ease;
                    ">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                        <span>Reactivar Servicio con Soporte VOX</span>
                    </a>

                    <a href="https://voxbusinessdeveloper.com" target="_blank" rel="noopener noreferrer" style="
                        color: #606873;
                        font-size: 12px;
                        text-decoration: none;
                        padding: 6px;
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

    // Ejecutar verificación inicial
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', consultarEstadoLicencia);
    } else {
        consultarEstadoLicencia();
    }
})();
