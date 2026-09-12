/**
 * VOX Business Developer - Lead Service (Producción Segura)
 * 
 * Envío seguro de prospectos a través de Vercel Serverless Function `/api/leads`.
 * Integrado con verificación Anti-Spam real y manejo de errores.
 */

const LeadService = {
    LOCAL_STORAGE_KEY: 'vox_leads_cache',

    /**
     * Obtiene el token de captcha disponible de los proveedores compatibles
     */
    getCaptchaToken() {
        if (typeof window.turnstile !== 'undefined' && typeof window.turnstile.getResponse === 'function') {
            try {
                const t = window.turnstile.getResponse();
                if (t) return t;
            } catch (e) {}
        }
        if (typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.getResponse === 'function') {
            try {
                const g = window.grecaptcha.getResponse();
                if (g) return g;
            } catch (e) {}
        }
        if (typeof window.hcaptcha !== 'undefined' && typeof window.hcaptcha.getResponse === 'function') {
            try {
                const h = window.hcaptcha.getResponse();
                if (h) return h;
            } catch (e) {}
        }
        return '';
    },

    /**
     * Envía un lead a través del endpoint seguro /api/leads
     * @param {Object} leadData 
     * @returns {Promise<{success: boolean, message: string, leadId?: string}>}
     */
    async submitLead(leadData) {
        const captchaToken = leadData.token || leadData.botIdToken || this.getCaptchaToken();

        const payload = {
            nombre: leadData.nombre?.trim() || '',
            correo: leadData.correo?.trim().toLowerCase() || '',
            telefono: leadData.telefono?.trim() || '',
            empresa: leadData.empresa?.trim() || 'No especificada',
            servicio: leadData.servicio || 'General',
            tipo_financiamiento: leadData.tipo_financiamiento || 'recurso_propio',
            mensaje: leadData.mensaje?.trim() || '',
            origen_url: window.location.href,
            token: captchaToken,
            _hp: document.getElementById('voxHoneypot')?.value || ''
        };

        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => ({
                success: false,
                message: 'Error al procesar la respuesta del servidor.'
            }));

            if (!response.ok || !result.success) {
                console.warn('⚠️ Respuesta de error de /api/leads:', result);
                throw new Error(result.message || 'Error al procesar el prospecto en el servidor.');
            }

            console.log('✅ Lead procesado exitosamente por /api/leads:', result);

            // Guardar en caché local para histórico de usuario
            this.saveLocalLead(payload, result.leadId);

            return {
                success: true,
                leadId: result.leadId,
                message: result.message || 'Solicitud enviada correctamente'
            };

        } catch (err) {
            console.error('❌ Error enviando lead a /api/leads:', err);
            throw err;
        }
    },

    /**
     * Guarda lead en caché local de forma transparente
     */
    saveLocalLead(payload, leadId) {
        try {
            const localPayload = { ...payload, id: leadId || ('lead_' + Date.now()), created_at: new Date().toISOString() };
            delete localPayload.token;
            delete localPayload.botIdToken;
            delete localPayload._hp;
            const currentLeads = this.getLocalLeads();
            currentLeads.unshift(localPayload);
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(currentLeads.slice(0, 50)));
        } catch (e) {
            // Ignorar errores de almacenamiento local
        }
    },

    /**
     * Obtiene los leads locales
     */
    getLocalLeads() {
        try {
            const data = localStorage.getItem(this.LOCAL_STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    /**
     * Formatea el valor del financiamiento para lectura humana
     */
    formatFinanciamiento(tipo) {
        switch (tipo) {
            case 'recurso_propio':
                return 'Recurso propio / Capital directo';
            case 'credito_financiamiento':
                return 'Crédito bancario / Financiamiento comercial';
            case 'requiere_asesoria':
                return 'Busca asesoría para financiamiento';
            default:
                return tipo || 'No especificado';
        }
    }
};

window.LeadService = LeadService;
