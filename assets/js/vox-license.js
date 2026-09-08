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

    // 4. Función para renderizar la cortina estética de suspensión VOX
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

        const overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: linear-gradient(135deg, #090B0E 0%, #12161C 100%) !important;
            color: #FFFFFF !important;
            z-index: 2147483647 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            padding: 20px !important;
            box-sizing: border-box !important;
            text-align: center !important;
        `;

        const waUrl = `https://wa.me/529994967389?text=${encodeURIComponent(
            `Hola VOX Business Developer, me comunico respecto al estado de servicio de mi sitio web (${clienteNombre || 'Cliente'} - Ref: ${SITE_KEY}). Deseo reactivar el servicio.`
        )}`;

        overlay.innerHTML = `
            <div style="
                max-width: 540px;
                width: 100%;
                background: rgba(18, 22, 28, 0.85);
                border: 1px solid rgba(255, 193, 7, 0.25);
                border-radius: 20px;
                padding: 40px 30px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 159, 28, 0.1);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
            ">
                <div style="margin-bottom: 24px; display: inline-flex; align-items: center; justify-content: center; width: 68px; height: 68px; border-radius: 50%; background: rgba(255, 193, 7, 0.12); border: 1px solid rgba(255, 193, 7, 0.3);">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FFC107" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>

                <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 12px 0; color: #FFFFFF; letter-spacing: -0.5px;">
                    Sitio Web Temporalmente Inactivo
                </h1>

                <p style="font-size: 15px; line-height: 1.6; color: #A0AEC0; margin: 0 0 20px 0;">
                    Este portal web se encuentra en proceso de administración técnica y actualización de servicio por parte de <strong style="color: #FFC107;">VOX Business Developer</strong>.
                </p>

                ${clienteNombre ? `
                <div style="background: rgba(255, 255, 255, 0.04); border-radius: 10px; padding: 12px 16px; margin-bottom: 24px; text-align: left; font-size: 13px; color: #CBD5E0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="color: #718096;">Titular:</span>
                        <strong style="color: #FFFFFF;">${clienteNombre}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #718096;">Identificador:</span>
                        <code style="color: #FF9F1C; font-family: monospace;">${SITE_KEY.slice(0, 12)}...</code>
                    </div>
                </div>
                ` : ''}

                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
                        color: #FFFFFF;
                        text-decoration: none;
                        padding: 14px 24px;
                        border-radius: 12px;
                        font-weight: 600;
                        font-size: 15px;
                        box-shadow: 0 10px 20px -5px rgba(37, 211, 102, 0.35);
                        transition: transform 0.2s ease;
                    ">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                        <span>Contactar a Soporte / Administración</span>
                    </a>

                    <a href="https://voxbusinessdeveloper.com" target="_blank" rel="noopener noreferrer" style="
                        color: #718096;
                        font-size: 13px;
                        text-decoration: none;
                        padding: 8px;
                        transition: color 0.2s ease;
                    ">
                        Desarrollado y Gestionado por <strong style="color: #A0AEC0;">VOX Business Developer</strong>
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
