/**
 * VOX Business Developer - Serverless Function: /api/radar-report
 *
 * Envía los Reportes Ejecutivos de Radar & Tráfico Web (Semanal 7d, Quincenal 15d, Mensual 30d)
 * vía Resend (HTML Ejecutivo Dark-Mode) con respaldo automático vía FormSubmit hacia Gmail.
 *
 * Soporta:
 * - POST desde el Panel Administrativo (/admin) con las métricas calculadas del corte.
 * - GET para ejecución automatizada / Cron Job consultando Supabase directamente.
 */

function sanitizeText(input, maxLength = 300) {
    if (typeof input !== 'string') return '';
    return input.replace(/[<>]/g, '').trim().slice(0, maxLength);
}

function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim()) && email.length <= 150;
}

function formatDuration(seconds) {
    const sec = Math.max(0, parseInt(seconds || 0, 10));
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const r = sec % 60;
    return `${m}m ${r}s`;
}

function formatDeltaText(currVal, prevVal) {
    if (prevVal === 0 && currVal === 0) return '0% (sin cambio)';
    if (prevVal === 0 && currVal > 0) return '+100% vs. corte previo';
    const diff = Math.round(((currVal - prevVal) / prevVal) * 100);
    return diff > 0 ? `+${diff}% vs. corte previo` : `${diff}% vs. corte previo`;
}

function buildExecutiveHtmlEmail(report) {
    const {
        periodLabel,
        dateRange,
        siteLabel,
        notaAdicional,
        curr,
        prev,
        channels = []
    } = report;

    const deltaSessions = formatDeltaText(curr.totalSessions, prev.totalSessions);
    const deltaWa = formatDeltaText(curr.waClicks, prev.waClicks);
    const deltaLeads = formatDeltaText(curr.leadsCount, prev.leadsCount);

    const channelsRowsHtml = channels.length > 0
        ? channels.slice(0, 6).map(ch => `
            <tr style="border-bottom: 1px solid #2a3038;">
                <td style="padding: 10px 8px; color: #ffffff; font-weight: 600;">${sanitizeText(ch.name, 80)}</td>
                <td style="padding: 10px 8px; color: #e2e8f0; text-align: center;">${ch.count || 0}</td>
                <td style="padding: 10px 8px; color: #c9a86a; text-align: center;">${ch.avgScroll || 0}%</td>
                <td style="padding: 10px 8px; color: #25D366; text-align: right; font-weight: 600;">${ch.wa || 0} WA · ${ch.leads || 0} Leads</td>
            </tr>
        `).join('')
        : `<tr><td colspan="4" style="padding: 12px; color: #8a94a6; text-align: center;">Sin canales registrados en este periodo</td></tr>`;

    return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; background: #12151a; color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #2a3038;">
        <div style="background: linear-gradient(135deg, #0d1014 0%, #1a1f29 100%); padding: 28px 24px; border-bottom: 2px solid #c9a86a; text-align: center;">
            <span style="display: inline-block; background: rgba(201, 168, 106, 0.16); color: #c9a86a; border: 1px solid rgba(201, 168, 106, 0.4); padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">VOX RADAR & TRÁFICO WEB</span>
            <h2 style="margin: 12px 0 4px 0; color: #ffffff; font-size: 21px; letter-spacing: 0.5px;">${sanitizeText(periodLabel, 120)}</h2>
            <p style="margin: 0; color: #94a3b8; font-size: 13px;">🌐 Sitio: <strong style="color: #c9a86a;">${sanitizeText(siteLabel, 150)}</strong> · 📅 ${sanitizeText(dateRange, 120)}</p>
        </div>

        <div style="padding: 24px;">
            ${notaAdicional ? `
                <div style="background: rgba(255, 106, 0, 0.1); border-left: 3px solid #ff6a00; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 13px; color: #f8fafc;">
                    <strong style="color: #ff6a00;">Nota Ejecutiva:</strong> ${sanitizeText(notaAdicional, 500)}
                </div>
            ` : ''}

            <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; color: #c9a86a;">1. Resumen Comparativo vs. Periodo Anterior</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px; background: #181c23; border-radius: 10px; overflow: hidden;">
                <tr style="border-bottom: 1px solid #2a3038;">
                    <td style="padding: 12px 14px; color: #94a3b8;">Sesiones Registradas</td>
                    <td style="padding: 12px 14px; color: #ffffff; font-weight: 700; font-size: 16px;">${curr.totalSessions} <span style="font-size: 12px; color: #94a3b8; font-weight: 400;">(${curr.uniqueVisitors} únicos)</span></td>
                    <td style="padding: 12px 14px; color: #58a6ff; text-align: right; font-size: 12px; font-weight: 600;">${deltaSessions} (Prev: ${prev.totalSessions})</td>
                </tr>
                <tr style="border-bottom: 1px solid #2a3038;">
                    <td style="padding: 12px 14px; color: #94a3b8;">Clics en WhatsApp Directo</td>
                    <td style="padding: 12px 14px; color: #25D366; font-weight: 700; font-size: 16px;">${curr.waClicks} clics</td>
                    <td style="padding: 12px 14px; color: #25D366; text-align: right; font-size: 12px; font-weight: 600;">${deltaWa} (Prev: ${prev.waClicks})</td>
                </tr>
                <tr style="border-bottom: 1px solid #2a3038;">
                    <td style="padding: 12px 14px; color: #94a3b8;">Prospectos Convertidos (Leads)</td>
                    <td style="padding: 12px 14px; color: #ff6a00; font-weight: 700; font-size: 16px;">${curr.leadsCount} Leads <span style="font-size: 12px; color: #c9a86a;">(${curr.convRate}% conv.)</span></td>
                    <td style="padding: 12px 14px; color: #ff6a00; text-align: right; font-size: 12px; font-weight: 600;">${deltaLeads} (Prev: ${prev.leadsCount})</td>
                </tr>
                <tr>
                    <td style="padding: 12px 14px; color: #94a3b8;">Tiempo Medio & Scroll Leído</td>
                    <td style="padding: 12px 14px; color: #ffffff; font-weight: 700;">${formatDuration(curr.avgDuration)} · ${curr.avgScroll}% scroll</td>
                    <td style="padding: 12px 14px; color: #94a3b8; text-align: right; font-size: 12px;">Previo: ${formatDuration(prev.avgDuration)} (${prev.avgScroll}%)</td>
                </tr>
            </table>

            <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; color: #c9a86a;">2. Embudo de Conversión del Periodo</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px; background: #181c23; border-radius: 10px; overflow: hidden;">
                <tr style="border-bottom: 1px solid #2a3038;">
                    <td style="padding: 10px 14px; color: #e2e8f0;">1. Total de Sesiones del Corte</td>
                    <td style="padding: 10px 14px; color: #58a6ff; text-align: right; font-weight: 700;">${curr.totalSessions} (100%)</td>
                </tr>
                <tr style="border-bottom: 1px solid #2a3038;">
                    <td style="padding: 10px 14px; color: #e2e8f0;">2. Lectura Activa (Scroll ≥ 50%)</td>
                    <td style="padding: 10px 14px; color: #bc8cff; text-align: right; font-weight: 700;">${curr.highScrollCount} sesiones</td>
                </tr>
                <tr style="border-bottom: 1px solid #2a3038;">
                    <td style="padding: 10px 14px; color: #e2e8f0;">3. Intención Comercial (WhatsApp / Formulario)</td>
                    <td style="padding: 10px 14px; color: #25D366; text-align: right; font-weight: 700;">${curr.intentSessionsCount} sesiones</td>
                </tr>
                <tr>
                    <td style="padding: 10px 14px; color: #e2e8f0;">4. Leads Cerrados en CRM</td>
                    <td style="padding: 10px 14px; color: #ff6a00; text-align: right; font-weight: 700;">${curr.leadsCount} prospectos (${curr.convRate}%)</td>
                </tr>
            </table>

            <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; color: #c9a86a;">3. Canales de Adquisición Principales</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: #181c23; border-radius: 10px; overflow: hidden;">
                <thead>
                    <tr style="background: #101318; border-bottom: 1px solid #2a3038;">
                        <th style="padding: 10px 8px; text-align: left; color: #94a3b8;">Origen</th>
                        <th style="padding: 10px 8px; text-align: center; color: #94a3b8;">Sesiones</th>
                        <th style="padding: 10px 8px; text-align: center; color: #94a3b8;">Scroll</th>
                        <th style="padding: 10px 8px; text-align: right; color: #94a3b8;">Resultados</th>
                    </tr>
                </thead>
                <tbody>
                    ${channelsRowsHtml}
                </tbody>
            </table>

            <div style="margin-top: 26px; text-align: center; padding-top: 18px; border-top: 1px solid #2a3038;">
                <a href="https://voxbusinessdeveloper.com/admin" style="display: inline-block; background: linear-gradient(135deg, #c9a86a, #ff6a00); color: #0d1014; padding: 12px 26px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 13px; letter-spacing: 0.4px;">ABRIR RADAR EN PANEL VOX</a>
            </div>
        </div>
    </div>
    `;
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'method_not_allowed',
            message: 'Método no permitido. Usa POST o GET.'
        });
    }

    try {
        const defaultToEmail = process.env.NOTIFICATION_EMAIL || 'vox.iabusinessdeveloper@gmail.com';
        let reportPayload = null;
        let toEmail = defaultToEmail;

        if (req.method === 'POST') {
            const body = req.body || {};
            if (body.toEmail && isValidEmail(body.toEmail)) {
                toEmail = body.toEmail.trim().toLowerCase();
            }
            reportPayload = {
                periodCode: sanitizeText(body.periodCode || '15d', 10),
                periodLabel: sanitizeText(body.periodLabel || 'Corte Quincenal (Últimos 15 Días)', 120),
                dateRange: sanitizeText(body.dateRange || 'Periodo Actual', 120),
                siteLabel: sanitizeText(body.siteLabel || 'Todos los Sitios Conectados', 150),
                notaAdicional: sanitizeText(body.notaAdicional || '', 500),
                curr: body.curr || {
                    totalSessions: 0,
                    uniqueVisitors: 0,
                    waClicks: 0,
                    formCount: 0,
                    leadsCount: 0,
                    highScrollCount: 0,
                    intentSessionsCount: 0,
                    avgDuration: 0,
                    avgScroll: 0,
                    convRate: 0
                },
                prev: body.prev || {
                    totalSessions: 0,
                    waClicks: 0,
                    leadsCount: 0,
                    avgDuration: 0,
                    avgScroll: 0,
                    convRate: 0
                },
                channels: Array.isArray(body.channels) ? body.channels : []
            };
        } else {
            // Ejecución vía GET (ej. Cron Job automático semanal, quincenal o mensual)
            const periodCode = req.query?.period || '15d';
            const days = periodCode === '7d' ? 7 : (periodCode === '30d' ? 30 : 15);
            const periodLabel = days === 7
                ? 'Corte Semanal Automático (7 Días)'
                : (days === 30 ? 'Corte Mensual Automático (30 Días)' : 'Corte Quincenal Automático (15 Días)');

            const now = Date.now();
            const windowMs = days * 24 * 3600 * 1000;
            const currStartIso = new Date(now - windowMs).toISOString();
            const prevStartIso = new Date(now - windowMs * 2).toISOString();

            const supabaseUrl = process.env.SUPABASE_URL || 'https://umnnzfaymrictdpxpurh.supabase.co';
            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY;

            let sessions = [];
            if (supabaseUrl && supabaseKey) {
                const dbRes = await fetch(
                    `${supabaseUrl}/rest/v1/telemetria_sesiones?last_seen_at=gte.${encodeURIComponent(prevStartIso)}&select=*`,
                    {
                        headers: {
                            'apikey': supabaseKey,
                            'Authorization': `Bearer ${supabaseKey}`
                        }
                    }
                ).catch(() => null);
                if (dbRes && dbRes.ok) {
                    sessions = await dbRes.json();
                }
            }

            const currSessions = sessions.filter(s => new Date(s.last_seen_at || s.started_at).getTime() >= (now - windowMs));
            const prevSessions = sessions.filter(s => {
                const t = new Date(s.last_seen_at || s.started_at).getTime();
                return t >= (now - windowMs * 2) && t < (now - windowMs);
            });

            const calc = (list) => {
                const totalSessions = list.length;
                const uniqueVisitors = new Set(list.map(s => s.visitor_id)).size;
                const waClicks = list.reduce((a, s) => a + (parseInt(s.whatsapp_clicks || 0, 10)), 0);
                const formCount = list.filter(s => s.form_interacted).length;
                const leadsCount = list.filter(s => s.converted_to_lead).length;
                const highScrollCount = list.filter(s => (parseInt(s.max_scroll_pct || 0, 10)) >= 50).length;
                const intentSessionsCount = list.filter(s => (parseInt(s.whatsapp_clicks || 0, 10)) > 0 || s.form_interacted || s.converted_to_lead).length;
                const avgDuration = totalSessions > 0 ? Math.round(list.reduce((a, s) => a + (parseInt(s.duration_seconds || 0, 10)), 0) / totalSessions) : 0;
                const avgScroll = totalSessions > 0 ? Math.round(list.reduce((a, s) => a + (parseInt(s.max_scroll_pct || 0, 10)), 0) / totalSessions) : 0;
                const convRate = totalSessions > 0 ? Math.round((leadsCount / totalSessions) * 1000) / 10 : 0;
                return { totalSessions, uniqueVisitors, waClicks, formCount, leadsCount, highScrollCount, intentSessionsCount, avgDuration, avgScroll, convRate };
            };

            reportPayload = {
                periodCode,
                periodLabel,
                dateRange: `${currStartIso.slice(0, 10)} al ${new Date(now).toISOString().slice(0, 10)}`,
                siteLabel: 'Todos los Sitios Conectados',
                notaAdicional: 'Reporte programado generado automáticamente por VOX Radar.',
                curr: calc(currSessions),
                prev: calc(prevSessions),
                channels: []
            };
        }

        const subject = `📊 Reporte ${reportPayload.periodLabel} — ${reportPayload.siteLabel}`;
        const htmlContent = buildExecutiveHtmlEmail(reportPayload);
        const resendApiKey = process.env.RESEND_API_KEY;

        let sentVia = null;

        // 1. Intentar envío vía Resend si RESEND_API_KEY está configurada
        if (resendApiKey) {
            try {
                const fromEmail = process.env.RESEND_FROM_EMAIL || 'VOX Radar <onboarding@resend.dev>';
                const resendRes = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: fromEmail,
                        to: [toEmail],
                        subject,
                        html: htmlContent
                    })
                });

                if (resendRes.ok) {
                    sentVia = 'resend';
                } else {
                    const errData = await resendRes.json().catch(() => ({}));
                    console.warn('[Radar Report Resend Warning]:', resendRes.status, errData);
                }
            } catch (resendErr) {
                console.warn('[Radar Report Resend Error]:', resendErr.message);
            }
        }

        // 2. Respaldo automático a FormSubmit si Resend no está activo o restringió destinatario externo
        if (!sentVia) {
            const c = reportPayload.curr;
            const p = reportPayload.prev;
            const topChannelsText = (reportPayload.channels || [])
                .slice(0, 5)
                .map(ch => `${ch.name}: ${ch.count} sesiones (${ch.wa} WA, ${ch.leads} Leads)`)
                .join(' | ') || 'Directo';

            const formSubmitPayload = {
                _subject: subject,
                _template: 'table',
                _captcha: 'false',
                'Corte de Análisis': reportPayload.periodLabel,
                'Rango de Fechas': reportPayload.dateRange,
                'Sitio Monitoreado': reportPayload.siteLabel,
                'Sesiones del Periodo': `${c.totalSessions} sesiones (${c.uniqueVisitors} visitantes únicos) | Previo: ${p.totalSessions}`,
                'Clics a WhatsApp': `${c.waClicks} clics | Previo: ${p.waClicks}`,
                'Leads Convertidos': `${c.leadsCount} leads (Tasa: ${c.convRate}%) | Previo: ${p.leadsCount}`,
                'Retención y Lectura': `${formatDuration(c.avgDuration)} promedio | ${c.avgScroll}% scroll medio`,
                'Embudo del Periodo': `100% Visitas (${c.totalSessions}) -> Scroll >=50% (${c.highScrollCount}) -> Intención (${c.intentSessionsCount}) -> Leads (${c.leadsCount})`,
                'Canales Principales': topChannelsText,
                'Nota Ejecutiva': reportPayload.notaAdicional || 'Sin nota adicional'
            };

            const fsRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(toEmail)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': 'https://voxbusinessdeveloper.com',
                    'Referer': 'https://voxbusinessdeveloper.com/admin'
                },
                body: JSON.stringify(formSubmitPayload)
            });

            if (fsRes.ok) {
                sentVia = 'formsubmit_gmail';
            } else {
                throw new Error('No fue posible despachar el correo por ningún proveedor.');
            }
        }

        return res.status(200).json({
            success: true,
            provider: sentVia,
            toEmail,
            message: `Reporte ${reportPayload.periodLabel} enviado exitosamente a ${toEmail}.`
        });
    } catch (err) {
        console.error('[Radar Report Dispatch Error]:', err.message);
        return res.status(500).json({
            success: false,
            error: 'report_dispatch_failed',
            message: 'No se pudo enviar el reporte desde el servidor, se intentará respaldo directo.'
        });
    }
};
