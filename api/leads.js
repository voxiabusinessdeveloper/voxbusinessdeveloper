/**
 * VOX Business Developer - Serverless Function: /api/leads
 * 
 * Procesa prospectos entrantes con:
 * 1. Rate limiting por IP (previene ataques de fuerza bruta/spam masivo).
 * 2. Validación de Token Anti-Spam con verificación real de proveedor (Cloudflare Turnstile, reCAPTCHA, hCaptcha, BotID) y Honeypot.
 * 3. Normalización y sanitización estricta de entradas (correo obligatorio y validado).
 * 4. Almacenamiento seguro en Supabase (retorna error y no da éxito si la inserción en BD falla).
 * 5. Notificación por correo vía Resend / FormSubmit tras confirmación de guardado.
 * 6. Manejo seguro de errores sin filtrar datos sensibles de infraestructura.
 */

// In-memory rate limiting para la instancia de Vercel Serverless Function
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 5;      // Máximo 5 envíos por minuto por IP

/**
 * Verifica límite de tasa por IP
 */
function isRateLimited(ip) {
    const now = Date.now();
    const clientData = rateLimitMap.get(ip) || { count: 0, firstRequest: now };

    if (now - clientData.firstRequest > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(ip, { count: 1, firstRequest: now });
        return false;
    }

    if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
        return true;
    }

    clientData.count += 1;
    rateLimitMap.set(ip, clientData);
    return false;
}

/**
 * Validador de Anti-Spam con verificación real de proveedor
 * Soporta Cloudflare Turnstile, Google reCAPTCHA, hCaptcha y BotID.
 * Rechaza solicitudes cuando no pueda verificarse la autenticidad.
 */
async function verifyAntiSpam(token, honeypotValue, clientIp) {
    // 1. Honeypot check: si un bot llenó el campo oculto, rechazar inmediatamente
    if (honeypotValue && honeypotValue.trim() !== '') {
        return { valid: false, reason: 'honeypot_triggered' };
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY || process.env.GOOGLE_RECAPTCHA_SECRET_KEY;
    const hcaptchaSecret = process.env.HCAPTCHA_SECRET_KEY;
    const botIdSecret = process.env.BOTID_SECRET_KEY;

    // 2. Verificación Cloudflare Turnstile
    if (turnstileSecret) {
        if (!token || typeof token !== 'string') {
            return { valid: false, reason: 'missing_turnstile_token' };
        }
        try {
            const formData = new URLSearchParams();
            formData.append('secret', turnstileSecret);
            formData.append('response', token);
            if (clientIp) formData.append('remoteip', clientIp);

            const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            const data = await verifyRes.json();
            if (!data || !data.success) {
                console.warn('[Anti-Spam] Verificación Turnstile fallida:', data);
                return { valid: false, reason: 'turnstile_verification_failed' };
            }
            return { valid: true, provider: 'turnstile' };
        } catch (err) {
            console.error('[Anti-Spam] Error consultando Turnstile API:', err.message);
            return { valid: false, reason: 'turnstile_api_error' };
        }
    }

    // 3. Verificación Google reCAPTCHA
    if (recaptchaSecret) {
        if (!token || typeof token !== 'string') {
            return { valid: false, reason: 'missing_recaptcha_token' };
        }
        try {
            const formData = new URLSearchParams();
            formData.append('secret', recaptchaSecret);
            formData.append('response', token);
            if (clientIp) formData.append('remoteip', clientIp);

            const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            const data = await verifyRes.json();
            if (!data || !data.success || (typeof data.score === 'number' && data.score < 0.5)) {
                console.warn('[Anti-Spam] Verificación reCAPTCHA fallida:', data);
                return { valid: false, reason: 'recaptcha_verification_failed' };
            }
            return { valid: true, provider: 'recaptcha' };
        } catch (err) {
            console.error('[Anti-Spam] Error consultando reCAPTCHA API:', err.message);
            return { valid: false, reason: 'recaptcha_api_error' };
        }
    }

    // 4. Verificación hCaptcha
    if (hcaptchaSecret) {
        if (!token || typeof token !== 'string') {
            return { valid: false, reason: 'missing_hcaptcha_token' };
        }
        try {
            const formData = new URLSearchParams();
            formData.append('secret', hcaptchaSecret);
            formData.append('response', token);
            if (clientIp) formData.append('remoteip', clientIp);

            const verifyRes = await fetch('https://hcaptcha.com/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            const data = await verifyRes.json();
            if (!data || !data.success) {
                console.warn('[Anti-Spam] Verificación hCaptcha fallida:', data);
                return { valid: false, reason: 'hcaptcha_verification_failed' };
            }
            return { valid: true, provider: 'hcaptcha' };
        } catch (err) {
            console.error('[Anti-Spam] Error consultando hCaptcha API:', err.message);
            return { valid: false, reason: 'hcaptcha_api_error' };
        }
    }

    // 5. Verificación BotID
    if (botIdSecret) {
        if (!token || typeof token !== 'string') {
            return { valid: false, reason: 'missing_botid_token' };
        }
        try {
            const verifyRes = await fetch('https://api.botid.io/v1/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${botIdSecret}`
                },
                body: JSON.stringify({ token })
            });
            if (verifyRes.ok) {
                const data = await verifyRes.json();
                if (data && data.success === false) {
                    return { valid: false, reason: 'botid_verification_failed' };
                }
                return { valid: true, provider: 'botid' };
            }
            return { valid: false, reason: 'botid_verification_failed' };
        } catch (err) {
            console.error('[Anti-Spam] Error consultando BotID API:', err.message);
            return { valid: false, reason: 'botid_api_error' };
        }
    }

    // 6. Si se configuró REQUIRE_ANTISPAM_VERIFICATION y no hay proveedor verificado, rechazar
    const requireVerification = process.env.REQUIRE_ANTISPAM_VERIFICATION === 'true';
    if (requireVerification) {
        return { valid: false, reason: 'unconfigured_verification_provider' };
    }

    // Si no hay proveedor configurado aún, validar que pase rate limiting y honeypot
    return { valid: true, provider: 'honeypot_ratelimit' };
}

/**
 * Sanitiza texto simple para prevenir inyecciones y caracteres no deseados
 */
function sanitizeText(input, maxLength = 255) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/[<>]/g, '') // Elimina etiquetas HTML
        .trim()
        .slice(0, maxLength);
}

/**
 * Validador estricto de email
 */
function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim()) && email.length <= 150;
}

/**
 * Handler principal para Vercel Serverless Function
 */
module.exports = async function handler(req, res) {
    // Configuración de CORS y Headers de seguridad
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'method_not_allowed',
            message: 'Método no permitido. Solo se admite POST.'
        });
    }

    // Rate Limiting por IP
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                     req.headers['x-real-ip'] || 
                     req.socket?.remoteAddress || 
                     '127.0.0.1';

    if (isRateLimited(clientIp)) {
        return res.status(429).json({
            success: false,
            error: 'rate_limited',
            message: 'Has realizado demasiadas solicitudes en poco tiempo. Por favor, intenta de nuevo en un momento.'
        });
    }

    try {
        const body = req.body || {};
        const {
            nombre,
            correo,
            telefono,
            empresa,
            servicio,
            tipo_financiamiento,
            mensaje,
            origen_url,
            token,
            botIdToken,
            _hp // honeypot
        } = body;

        const antiSpamToken = token || botIdToken || body['g-recaptcha-response'] || body['cf-turnstile-response'] || body['h-captcha-response'];

        // 1. Verificación Anti-Spam Real
        const botCheck = await verifyAntiSpam(antiSpamToken, _hp, clientIp);
        if (!botCheck.valid) {
            return res.status(400).json({
                success: false,
                error: 'antispam_verification_failed',
                message: 'No fue posible validar la autenticidad del envío. Por favor, recarga la página e intenta de nuevo.'
            });
        }

        // 2. Validación de campos obligatorios
        const cleanNombre = sanitizeText(nombre, 100);
        const cleanCorreo = (correo || '').trim().toLowerCase();
        const cleanTelefono = sanitizeText(telefono, 30);
        const cleanEmpresa = sanitizeText(empresa, 120) || 'No especificada';
        const cleanServicio = sanitizeText(servicio, 100) || 'General';
        const cleanFinanciamiento = sanitizeText(tipo_financiamiento, 50) || 'recurso_propio';
        const cleanMensaje = sanitizeText(mensaje, 2000);
        const cleanOrigenUrl = sanitizeText(origen_url, 255) || 'https://voxbusinessdeveloper.com';

        if (!cleanNombre || cleanNombre.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'invalid_name',
                message: 'Por favor, introduce un nombre válido.'
            });
        }

        // El correo es obligatorio y estrictamente validado
        if (!cleanCorreo) {
            return res.status(400).json({
                success: false,
                error: 'missing_email',
                message: 'El correo electrónico es obligatorio para procesar tu solicitud.'
            });
        }

        if (!isValidEmail(cleanCorreo)) {
            return res.status(400).json({
                success: false,
                error: 'invalid_email',
                message: 'Por favor, introduce un correo electrónico válido.'
            });
        }

        const leadPayload = {
            nombre: cleanNombre,
            correo: cleanCorreo,
            telefono: cleanTelefono,
            empresa: cleanEmpresa,
            servicio: cleanServicio,
            tipo_financiamiento: cleanFinanciamiento,
            mensaje: cleanMensaje,
            origen_url: cleanOrigenUrl,
            created_at: new Date().toISOString(),
            estado: 'nuevo',
            notas: `IP: ${clientIp} | Verificado (${botCheck.provider || 'seguro'})`
        };

        // 3. Inserción Obligatoria en Supabase (Backend Server-Side)
        const supabaseUrl = process.env.SUPABASE_URL || 'https://umnnzfaymrictdpxpurh.supabase.co';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('[Supabase Config Error]: Faltan SUPABASE_URL o credenciales en variables de entorno.');
            return res.status(500).json({
                success: false,
                error: 'database_not_configured',
                message: 'Error de configuración del servidor de base de datos.'
            });
        }

        let leadId = null;
        try {
            const dbRes = await fetch(`${supabaseUrl}/rest/v1/leads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(leadPayload)
            });

            if (!dbRes.ok) {
                const errorText = await dbRes.text();
                console.error('[Supabase Server Error]:', dbRes.status, errorText);
                return res.status(502).json({
                    success: false,
                    error: 'database_insert_failed',
                    message: 'No fue posible guardar tu solicitud en la base de datos. Por favor, intenta nuevamente.'
                });
            }

            const insertedData = await dbRes.json();
            if (Array.isArray(insertedData) && insertedData.length > 0) {
                leadId = insertedData[0].id;
            }
        } catch (dbErr) {
            console.error('[Supabase Connection Error]:', dbErr.message);
            return res.status(502).json({
                success: false,
                error: 'database_connection_error',
                message: 'Error de conexión con la base de datos. Por favor intenta más tarde.'
            });
        }

        // 4. Notificación por Email (Solo se ejecuta si el lead ya fue guardado exitosamente en BD)
        try {
            const resendApiKey = process.env.RESEND_API_KEY;
            const toEmail = process.env.NOTIFICATION_EMAIL || 'vox.iabusinessdeveloper@gmail.com';

            if (resendApiKey) {
                const htmlContent = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #161a1f; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #2a3038;">
                    <div style="background: #111418; padding: 24px; border-bottom: 2px solid #ff6a00; text-align: center;">
                        <h2 style="margin: 0; color: #ffffff; font-size: 20px; letter-spacing: 1px;">VOX BUSINESS DEVELOPER</h2>
                        <p style="margin: 6px 0 0 0; color: #ff6a00; font-size: 14px; font-weight: 600;">🔥 Nuevo Lead Recibido</p>
                    </div>
                    <div style="padding: 24px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <tr style="border-bottom: 1px solid #2a3038;">
                                <td style="padding: 10px 0; color: #8a94a6; width: 40%;">Nombre:</td>
                                <td style="padding: 10px 0; color: #ffffff; font-weight: 600;">${cleanNombre}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #2a3038;">
                                <td style="padding: 10px 0; color: #8a94a6;">Correo:</td>
                                <td style="padding: 10px 0; color: #ff6a00;"><a href="mailto:${cleanCorreo}" style="color: #ff6a00; text-decoration: none;">${cleanCorreo}</a></td>
                            </tr>
                            <tr style="border-bottom: 1px solid #2a3038;">
                                <td style="padding: 10px 0; color: #8a94a6;">Teléfono:</td>
                                <td style="padding: 10px 0; color: #ffffff;">${cleanTelefono || 'No proporcionado'}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #2a3038;">
                                <td style="padding: 10px 0; color: #8a94a6;">Empresa:</td>
                                <td style="padding: 10px 0; color: #ffffff;">${cleanEmpresa}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #2a3038;">
                                <td style="padding: 10px 0; color: #8a94a6;">Servicio:</td>
                                <td style="padding: 10px 0; color: #ffffff; font-weight: 600;">${cleanServicio}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #2a3038;">
                                <td style="padding: 10px 0; color: #8a94a6;">Financiamiento:</td>
                                <td style="padding: 10px 0; color: #ffffff;">${cleanFinanciamiento}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #2a3038;">
                                <td style="padding: 10px 0; color: #8a94a6;">Mensaje:</td>
                                <td style="padding: 10px 0; color: #ffffff; line-height: 1.5;">${cleanMensaje || 'Sin mensaje adicional'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #8a94a6;">Origen:</td>
                                <td style="padding: 10px 0; color: #8a94a6; font-size: 12px;">${cleanOrigenUrl}</td>
                            </tr>
                        </table>
                        <div style="margin-top: 24px; text-align: center;">
                            <a href="https://wa.me/${(cleanTelefono || '').replace(/[^0-9]/g, '')}" style="display: inline-block; background: #ff6a00; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Contactar por WhatsApp</a>
                        </div>
                    </div>
                </div>
                `;

                const fromEmail = process.env.RESEND_FROM_EMAIL || 'VOX Leads <onboarding@resend.dev>';
                const resendRes = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: fromEmail,
                        to: [toEmail],
                        subject: `🔥 Nuevo Lead: ${cleanServicio.toUpperCase()} - ${cleanNombre}`,
                        html: htmlContent
                    })
                });

                const resendData = await resendRes.json().catch(() => null);
                console.log('[Resend Email Status]:', resendRes.status, resendData);
            } else {
                // Fallback a FormSubmit si aún no se configura RESEND_API_KEY
                const emailFields = {
                    _subject: `🔥 Nuevo Lead: ${cleanServicio.toUpperCase()} - ${cleanNombre}`,
                    _template: 'table',
                    _captcha: 'false',
                    'Nombre': cleanNombre,
                    'Correo': cleanCorreo,
                    'Teléfono': cleanTelefono || 'No proporcionado',
                    'Empresa': cleanEmpresa,
                    'Servicio': cleanServicio,
                    'Mensaje': cleanMensaje,
                    'Origen': cleanOrigenUrl
                };
                await fetch('https://formsubmit.co/ajax/vox.iabusinessdeveloper@gmail.com', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(emailFields)
                }).catch(() => {});
            }
        } catch (emailErr) {
            console.warn('[Email Dispatch Warning]:', emailErr.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Tu solicitud ha sido recibida con éxito. Un asesor se comunicará contigo a la brevedad.',
            leadId: leadId || undefined
        });

    } catch (error) {
        console.error('[Server Internal Error]:', error);
        return res.status(500).json({
            success: false,
            error: 'internal_error',
            message: 'Ocurrió un error inesperado al procesar tu solicitud. Por favor, intenta de nuevo más tarde.'
        });
    }
};
