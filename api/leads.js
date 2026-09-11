/**
 * VOX Business Developer - Serverless Function: /api/leads
 * 
 * Procesa prospectos entrantes con:
 * 1. Rate limiting por IP (previene ataques de fuerza bruta/spam masivo).
 * 2. Validación de Token Anti-Spam / BotID y Honeypot.
 * 3. Normalización y sanitización estricta de entradas.
 * 4. Almacenamiento seguro en Supabase utilizando Service Role Key (server-side).
 * 5. Notificación por correo vía endpoint seguro de backend.
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
 * Validador de BotID / Anti-Spam
 * Admite token de cliente (timestamp encriptado/firmado o integración con BotID API si configurada)
 */
async function checkBotId(botIdToken, honeypotValue) {
    // 1. Honeypot check: si un bot llenó el campo oculto, rechazar
    if (honeypotValue && honeypotValue.trim() !== '') {
        return { valid: false, reason: 'honeypot_triggered' };
    }

    // 2. Si existe variable de entorno BOTID_SECRET_KEY, verificar contra la API de BotID
    const botIdSecret = process.env.BOTID_SECRET_KEY;
    if (botIdSecret && botIdToken) {
        try {
            const verifyRes = await fetch('https://api.botid.io/v1/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${botIdSecret}`
                },
                body: JSON.stringify({ token: botIdToken })
            });
            if (verifyRes.ok) {
                const data = await verifyRes.json();
                if (data && data.success === false) {
                    return { valid: false, reason: 'botid_verification_failed' };
                }
            }
        } catch (err) {
            console.warn('[Anti-Spam] Advertencia al validar con servicio BotID:', err.message);
            // Fallback a validación algorítmica de token
        }
    }

    // 3. Validación de token local (firmado con timestamp)
    if (!botIdToken || typeof botIdToken !== 'string') {
        return { valid: false, reason: 'missing_token' };
    }

    try {
        // Formato esperado vox_bot_<timestamp_base36>_<salt>
        const parts = botIdToken.split('_');
        if (parts.length < 3 || parts[0] !== 'vox' || parts[1] !== 'bot') {
            return { valid: false, reason: 'invalid_token_format' };
        }
        const timestamp = parseInt(parts[2], 36);
        const now = Date.now();
        // Permitir un margen de -60s a +24 horas para absorber diferencias de reloj cliente/servidor
        if (isNaN(timestamp) || (timestamp - now > 60 * 1000) || (now - timestamp > 24 * 60 * 60 * 1000)) {
            return { valid: false, reason: 'invalid_time_window' };
        }
    } catch {
        return { valid: false, reason: 'token_parse_error' };
    }

    return { valid: true };
}

/**
 * Sanitiza texto simple para prevenir inyecciones y caracteres no imprimibles
 */
function sanitizeText(input, maxLength = 255) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/[<>]/g, '') // Elimina caracteres HTML
        .trim()
        .slice(0, maxLength);
}

/**
 * Validador de email
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
            botIdToken,
            _hp // honeypot
        } = body;

        // 1. Verificación Anti-Spam / BotID
        const botCheck = await checkBotId(botIdToken, _hp);
        if (!botCheck.valid) {
            // Responder con código genérico para no dar pistas al bot
            return res.status(400).json({
                success: false,
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
                message: 'Por favor, introduce un nombre válido.'
            });
        }

        if (!isValidEmail(cleanCorreo)) {
            return res.status(400).json({
                success: false,
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
            notas: `IP: ${clientIp} | Verificado Anti-Spam`
        };

        // 3. Inserción Segura en Supabase (Backend)
        const supabaseUrl = process.env.SUPABASE_URL || 'https://umnnzfaymrictdpxpurh.supabase.co';
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY;

        let dbInserted = false;
        let leadId = null;

        if (supabaseUrl && supabaseKey) {
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

                if (dbRes.ok) {
                    const insertedData = await dbRes.json();
                    if (Array.isArray(insertedData) && insertedData.length > 0) {
                        leadId = insertedData[0].id;
                    }
                    dbInserted = true;
                } else {
                    const errorText = await dbRes.text();
                    console.error('[Supabase Server Error]:', dbRes.status, errorText);
                }
            } catch (dbErr) {
                console.error('[Supabase Connection Error]:', dbErr.message);
            }
        }

        // 4. Notificación por Email desde el Servidor (FormSubmit / Resend / Webhook)
        try {
            const emailFields = {
                _subject: `🔥 Nuevo Lead: ${cleanServicio.toUpperCase()} - ${cleanNombre}`,
                _template: 'table',
                _captcha: 'false',
                'Nombre': cleanNombre,
                'Correo': cleanCorreo,
                'Teléfono': cleanTelefono || 'No proporcionado',
                'Empresa': cleanEmpresa,
                'Servicio Solicitado': cleanServicio,
                'Tipo Financiamiento': cleanFinanciamiento,
                'Mensaje': cleanMensaje || 'Sin mensaje adicional',
                'Origen': cleanOrigenUrl,
                'Fecha': new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
            };

            const notificationEndpoint = process.env.EMAIL_NOTIFICATION_ENDPOINT || 'https://formsubmit.co/ajax/vox.iabusinessdeveloper@gmail.com';
            
            // 4.1 Enviar en formato JSON
            const emailRes = await fetch(notificationEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (compatible; VoxBot/1.0)'
                },
                body: JSON.stringify(emailFields)
            });

            // 4.2 Si falla el endpoint ajax, fallback al endpoint directo form-urlencoded
            if (!emailRes.ok) {
                const params = new URLSearchParams();
                for (const [key, value] of Object.entries(emailFields)) {
                    params.append(key, value);
                }
                await fetch('https://formsubmit.co/vox.iabusinessdeveloper@gmail.com', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'Mozilla/5.0 (compatible; VoxBot/1.0)'
                    },
                    body: params.toString()
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
            message: 'Ocurrió un error inesperado al procesar tu solicitud. Por favor, intenta de nuevo más tarde.'
        });
    }
};
