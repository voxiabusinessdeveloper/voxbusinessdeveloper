/**
 * VOX Business Developer - Lead Service
 * Administrador de envío de prospectos a Supabase, Alertas por Email y Preparación WhatsApp.
 */

const LeadService = {
    LOCAL_STORAGE_KEY: 'vox_leads_cache',

    /**
     * Guarda un lead en Supabase y dispara notificación por email
     * @param {Object} leadData 
     * @returns {Promise<{success: boolean, message: string, leadId?: string}>}
     */
    async submitLead(leadData) {
        const payload = {
            nombre: leadData.nombre?.trim() || '',
            correo: leadData.correo?.trim().toLowerCase() || '',
            telefono: leadData.telefono?.trim() || '',
            empresa: leadData.empresa?.trim() || 'No especificada',
            servicio: leadData.servicio || 'General',
            tipo_financiamiento: leadData.tipo_financiamiento || 'recurso_propio',
            mensaje: leadData.mensaje?.trim() || '',
            origen_url: window.location.href,
            created_at: new Date().toISOString(),
            estado: 'nuevo',
            notas: ''
        };

        let dbSuccess = false;
        let leadId = null;

        // 1. Guardar en Supabase si está conectado
        if (window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured()) {
            try {
                const { data, error } = await window.VOX_SUPABASE.client
                    .from('leads')
                    .insert([payload]);

                if (error) {
                    console.error('❌ Error de respuesta en Supabase:', error);
                    throw error;
                }
                dbSuccess = true;
                console.log('✅ Lead registrado con éxito en Supabase Cloud');
            } catch (err) {
                console.error('❌ Error guardando en Supabase:', err);
            }
        }

        // 2. Fallback / Almacenamiento local para pruebas inmediatas
        if (!dbSuccess) {
            leadId = 'demo_' + Date.now();
            payload.id = leadId;
            const currentLeads = this.getLocalLeads();
            currentLeads.unshift(payload);
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(currentLeads));
            console.log('💾 Lead guardado en almacenamiento local (Modo Demo):', payload);
            dbSuccess = true;
        }

        // 3. Notificación por Email (FormSubmit endpoint en background)
        this.sendEmailNotification(payload);

        // 4. Hook para futura integración de WhatsApp (Twilio / Meta API)
        this.sendWhatsAppNotification(payload);

        return {
            success: true,
            leadId: leadId,
            message: 'Solicitud enviada correctamente'
        };
    },

    /**
     * Envía una notificación silenciosa por email
     */
    async sendEmailNotification(payload) {
        try {
            const formData = new FormData();
            formData.append('_subject', `🔥 Nuevo Lead: ${payload.servicio.toUpperCase()} - ${payload.nombre}`);
            formData.append('_template', 'table');
            formData.append('_captcha', 'false');
            formData.append('Nombre', payload.nombre);
            formData.append('Correo', payload.correo);
            formData.append('Teléfono', payload.telefono);
            formData.append('Empresa', payload.empresa);
            formData.append('Servicio Solicitado', payload.servicio);
            formData.append('Financiamiento', this.formatFinanciamiento(payload.tipo_financiamiento));
            formData.append('Mensaje', payload.mensaje);
            formData.append('Origen', payload.origen_url);

            await fetch('https://formsubmit.co/ajax/vox.iabusinessdeveloper@gmail.com', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            console.log('📧 Notificación por email despachada.');
        } catch (e) {
            console.warn('⚠️ No se pudo enviar el correo de alerta automático:', e);
        }
    },

    /**
     * Envía un email a vox.iabusinessdeveloper@gmail.com con los datos del nuevo crédito registrado
     * @param {Object} credito 
     */
    async sendCreditoNotification(credito) {
        try {
            const formData = new FormData();
            const totalInversion = (credito.total_meses || 0) * (credito.monto_mensual || 0);
            formData.append('_subject', `💳 Nuevo Crédito Registrado: ${credito.cliente_nombre} (${credito.plan_nombre || 'Plan Financiado'})`);
            formData.append('_template', 'table');
            formData.append('_captcha', 'false');
            formData.append('Tipo de Registro', 'Nuevo Crédito / Financiamiento de Sitio Web');
            formData.append('Cliente / Empresa', credito.cliente_nombre || 'N/A');
            formData.append('Dominio / URL', credito.dominio_url || 'N/A');
            formData.append('Teléfono', credito.contacto_telefono || 'N/A');
            formData.append('Correo del Cliente', credito.contacto_correo || 'N/A');
            formData.append('Plan Contratado', credito.plan_nombre || 'Página Web Financiada');
            formData.append('Total de Meses / Cuotas', `${credito.total_meses} meses`);
            formData.append('Monto Mensual', `$${Number(credito.monto_mensual || 0).toLocaleString('es-MX')} MXN`);
            formData.append('Inversión Total', `$${totalInversion.toLocaleString('es-MX')} MXN`);
            formData.append('Día de Corte', `Día ${credito.dia_corte} de cada mes`);
            formData.append('Próximo Vencimiento', credito.proximo_vencimiento || 'N/A');
            formData.append('Site Key (Kill-Switch)', credito.site_key || 'N/A');
            formData.append('Notas / Observaciones', credito.notas || 'Sin notas adicionales');
            formData.append('Fecha de Registro', new Date().toLocaleString('es-MX'));

            await fetch('https://formsubmit.co/ajax/vox.iabusinessdeveloper@gmail.com', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            console.log('📧 Alerta de crédito enviada a vox.iabusinessdeveloper@gmail.com');
        } catch (e) {
            console.warn('⚠️ No se pudo enviar el correo de alerta de crédito:', e);
        }
    },

    /**
     * Hook preparado para integrar WhatsApp en el futuro
     */
    async sendWhatsAppNotification(payload) {
        // En el futuro, aquí se hace fetch a una Supabase Edge Function o API de Twilio/WhatsApp Cloud API
        console.log('📱 [WhatsApp Hook Ready]: Listo para disparar mensaje a comercial para el lead:', payload.nombre);
    },

    /**
     * Obtiene los leads locales (fallback para pruebas)
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
