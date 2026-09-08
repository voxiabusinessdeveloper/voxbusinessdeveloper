/**
 * VOX Business Developer - Advanced CRM Dashboard Logic
 * Pipeline Kanban Drag & Drop, Chart.js Analíticas, Supabase Auth & Realtime, WhatsApp Pro Customizer.
 */

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) window.lucide.createIcons();

    const state = {
        user: null,
        leads: [],
        filteredLeads: [],
        activeLead: null,
        currentView: 'pipeline', // 'pipeline', 'table', 'creditos', 'analytics'
        statusFilter: 'all',
        searchTerm: '',
        charts: {},
        creditos: [],
        filteredCreditos: [],
        creditoFilter: 'all',
        activeCredito: null
    };

    // DOM Elements - Navigation & Views
    const loginWrapper = document.getElementById('loginWrapper');
    const dashboardLayout = document.getElementById('dashboardLayout');
    const loginForm = document.getElementById('loginForm');
    const loginAlert = document.getElementById('loginAlert');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDisplayEmail = document.getElementById('userDisplayEmail');
    const userAvatar = document.getElementById('userAvatar');
    const connectionModeBadge = document.getElementById('connectionModeBadge');
    const currentViewTitle = document.getElementById('currentViewTitle');

    const kanbanViewContainer = document.getElementById('kanbanViewContainer');
    const tableViewContainer = document.getElementById('tableViewContainer');
    const analyticsViewContainer = document.getElementById('analyticsViewContainer');
    const creditosViewContainer = document.getElementById('creditosViewContainer');

    const btnViewKanban = document.getElementById('btnViewKanban');
    const btnViewTable = document.getElementById('btnViewTable');
    const btnViewCreditos = document.getElementById('btnViewCreditos');
    const btnViewCharts = document.getElementById('btnViewCharts');
    const badgeCreditosAlert = document.getElementById('badgeCreditosAlert');

    // Créditos DOM Elements
    const creditosGrid = document.getElementById('creditosGrid');
    const emptyStateCreditos = document.getElementById('emptyStateCreditos');
    const btnOpenNuevoCreditoModal = document.getElementById('btnOpenNuevoCreditoModal');
    const nuevoCreditoModal = document.getElementById('nuevoCreditoModal');
    const closeNuevoCreditoModalBtn = document.getElementById('closeNuevoCreditoModalBtn');
    const cancelNuevoCreditoBtn = document.getElementById('cancelNuevoCreditoBtn');
    const nuevoCreditoForm = document.getElementById('nuevoCreditoForm');

    const registrarPagoModal = document.getElementById('registrarPagoModal');
    const closeRegistrarPagoModalBtn = document.getElementById('closeRegistrarPagoModalBtn');
    const cancelRegistrarPagoBtn = document.getElementById('cancelRegistrarPagoBtn');
    const registrarPagoForm = document.getElementById('registrarPagoForm');

    const snippetModal = document.getElementById('snippetModal');
    const closeSnippetModalBtn = document.getElementById('closeSnippetModalBtn');
    const closeSnippetModalBtn2 = document.getElementById('closeSnippetModalBtn2');
    const btnCopySnippetCode = document.getElementById('btnCopySnippetCode');
    const copySnippetBtnText = document.getElementById('copySnippetBtnText');
    const snippetCodeContent = document.getElementById('snippetCodeContent');
    const snippetClienteName = document.getElementById('snippetClienteName');

    const historialPagosModal = document.getElementById('historialPagosModal');
    const closeHistorialModalBtn = document.getElementById('closeHistorialModalBtn');
    const historialTableBody = document.getElementById('historialTableBody');
    const emptyHistorial = document.getElementById('emptyHistorial');
    const historialClienteName = document.getElementById('historialClienteName');
    const historialProgresoSummary = document.getElementById('historialProgresoSummary');

    // Modal Eliminar Crédito DOM Elements
    const eliminarCreditoModal = document.getElementById('eliminarCreditoModal');
    const closeEliminarCreditoModalBtn = document.getElementById('closeEliminarCreditoModalBtn');
    const cancelEliminarCreditoBtn = document.getElementById('cancelEliminarCreditoBtn');
    const eliminarCreditoForm = document.getElementById('eliminarCreditoForm');
    const deleteCreditoId = document.getElementById('deleteCreditoId');
    const deleteClienteNombre = document.getElementById('deleteClienteNombre');
    const deleteDominioUrl = document.getElementById('deleteDominioUrl');
    const deleteAdminPassword = document.getElementById('deleteAdminPassword');
    const deleteCreditoAlert = document.getElementById('deleteCreditoAlert');
    const btnConfirmarEliminacion = document.getElementById('btnConfirmarEliminacion');
    const toggleDeletePwdBtn = document.getElementById('toggleDeletePwdBtn');

    // Modal Eliminar Lead DOM Elements
    const eliminarLeadModal = document.getElementById('eliminarLeadModal');
    const closeEliminarLeadModalBtn = document.getElementById('closeEliminarLeadModalBtn');
    const cancelEliminarLeadBtn = document.getElementById('cancelEliminarLeadBtn');
    const eliminarLeadForm = document.getElementById('eliminarLeadForm');
    const deleteLeadId = document.getElementById('deleteLeadId');
    const deleteLeadNombre = document.getElementById('deleteLeadNombre');
    const deleteLeadInfo = document.getElementById('deleteLeadInfo');
    const deleteLeadAdminPassword = document.getElementById('deleteLeadAdminPassword');
    const deleteLeadAlert = document.getElementById('deleteLeadAlert');
    const btnConfirmarEliminacionLead = document.getElementById('btnConfirmarEliminacionLead');
    const toggleDeleteLeadPwdBtn = document.getElementById('toggleDeleteLeadPwdBtn');
    const btnOpenDeleteLeadModal = document.getElementById('btnOpenDeleteLeadModal');

    // Filters & Search (Search-Box)
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');

    // KPIs & Badges
    const kpiTotal = document.getElementById('kpiTotal');
    const kpiNuevos = document.getElementById('kpiNuevos');
    const kpiConversion = document.getElementById('kpiConversion');
    const kpiRecursoPropio = document.getElementById('kpiRecursoPropio');
    const badgeAll = document.getElementById('badgeAll');
    const badgeNew = document.getElementById('badgeNew');

    // Modal Elements
    const leadModal = document.getElementById('leadModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalServiceBadge = document.getElementById('modalServiceBadge');
    const modalStatusBadge = document.getElementById('modalStatusBadge');
    const modalLeadName = document.getElementById('modalLeadName');
    const modalLeadDate = document.getElementById('modalLeadDate');
    const modalEmpresa = document.getElementById('modalEmpresa');
    const modalEmail = document.getElementById('modalEmail');
    const modalTelefono = document.getElementById('modalTelefono');
    const modalFinanciamiento = document.getElementById('modalFinanciamiento');
    const modalOrigenUrl = document.getElementById('modalOrigenUrl');
    const modalMensaje = document.getElementById('modalMensaje');
    const modalStatusSelect = document.getElementById('modalStatusSelect');
    const modalNotas = document.getElementById('modalNotas');
    const modalLogCreated = document.getElementById('modalLogCreated');
    const saveLeadChangesBtn = document.getElementById('saveLeadChangesBtn');

    // WhatsApp Quick Templates
    const waTemplateSelect = document.getElementById('waTemplateSelect');
    const waCustomMessage = document.getElementById('waCustomMessage');
    const modalWaBtn = document.getElementById('modalWaBtn');
    const modalMailBtn = document.getElementById('modalMailBtn');

    // Inactividad máxima permitida: 15 minutos (en milisegundos)
    const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
    const LAST_ACTIVITY_KEY = 'vox_crm_last_activity';
    let inactivityTimer = null;

    function updateLastActivity() {
        if (!state.user) return;
        const now = Date.now();
        localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
        resetInactivityTimer();
    }

    function checkInactivityOnLoad() {
        const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
        if (lastActivity) {
            const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
            if (timeSinceLastActivity > INACTIVITY_TIMEOUT_MS) {
                return true; // Expiró
            }
        }
        return false;
    }

    function resetInactivityTimer() {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        if (!state.user) return;

        inactivityTimer = setTimeout(() => {
            handleAutoLogout();
        }, INACTIVITY_TIMEOUT_MS);
    }

    async function handleAutoLogout() {
        if (!state.user) return;
        if (inactivityTimer) clearTimeout(inactivityTimer);
        localStorage.removeItem(LAST_ACTIVITY_KEY);

        const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();
        if (isConfigured) {
            await window.VOX_SUPABASE.client.auth.signOut();
        } else {
            localStorage.removeItem('vox_crm_demo_user');
        }

        showLogin('⏱️ Tu sesión ha expirado tras 15 minutos de inactividad por seguridad.');
    }

    // Escuchadores de eventos de interacción del usuario para renovar actividad
    const userActivityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    let throttledActivityUpdate = null;
    userActivityEvents.forEach(eventName => {
        window.addEventListener(eventName, () => {
            if (!state.user) return;
            // Throttle para no saturar localStorage en cada milímetro de mousemove
            if (!throttledActivityUpdate) {
                throttledActivityUpdate = setTimeout(() => {
                    updateLastActivity();
                    throttledActivityUpdate = null;
                }, 1000);
            }
        }, { passive: true });
    });

    // -------------------------------------------------------------
    // 1. INICIALIZACIÓN Y SESIÓN
    // -------------------------------------------------------------
    initAuth();

    async function initAuth() {
        const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();

        if (isConfigured) {
            connectionModeBadge.textContent = 'Supabase Cloud';
            connectionModeBadge.style.color = '#3fb950';

            const { data: { session } } = await window.VOX_SUPABASE.client.auth.getSession();
            if (session && session.user) {
                if (checkInactivityOnLoad()) {
                    await window.VOX_SUPABASE.client.auth.signOut();
                    localStorage.removeItem(LAST_ACTIVITY_KEY);
                    showLogin('⏱️ Tu sesión ha expirado tras 15 minutos de inactividad.');
                    return;
                }
                setAuthenticatedUser(session.user);
            } else {
                showLogin();
            }

            window.VOX_SUPABASE.client.auth.onAuthStateChange((_event, session) => {
                if (session && session.user) {
                    setAuthenticatedUser(session.user);
                } else {
                    showLogin();
                }
            });
        } else {
            connectionModeBadge.textContent = 'Modo Demo / Local';
            connectionModeBadge.style.color = '#c5a059';

            const localUser = localStorage.getItem('vox_crm_demo_user');
            if (localUser) {
                if (checkInactivityOnLoad()) {
                    localStorage.removeItem('vox_crm_demo_user');
                    localStorage.removeItem(LAST_ACTIVITY_KEY);
                    showLogin('⏱️ Tu sesión ha expirado tras 15 minutos de inactividad.');
                    return;
                }
                setAuthenticatedUser({ email: localUser });
            } else {
                showLogin();
            }
        }
    }

    function showLogin(msg = null) {
        state.user = null;
        if (inactivityTimer) clearTimeout(inactivityTimer);
        localStorage.removeItem(LAST_ACTIVITY_KEY);

        // Limpiar campos del formulario de login por seguridad y privacidad
        if (loginForm) {
            loginForm.reset();
        }
        const adminEmailInput = document.getElementById('adminEmail');
        const adminPasswordInputEl = document.getElementById('adminPassword');
        if (adminEmailInput) adminEmailInput.value = '';
        if (adminPasswordInputEl) {
            adminPasswordInputEl.value = '';
            adminPasswordInputEl.type = 'password';
        }
        if (togglePasswordBtn) {
            togglePasswordBtn.innerHTML = '<i data-lucide="eye" id="togglePwdIcon"></i>';
        }

        loginWrapper.style.display = 'flex';
        dashboardLayout.style.display = 'none';

        if (msg) {
            loginAlert.textContent = msg;
            loginAlert.style.display = 'block';
            loginAlert.style.backgroundColor = 'rgba(234, 179, 8, 0.15)';
            loginAlert.style.borderColor = 'rgba(234, 179, 8, 0.4)';
            loginAlert.style.color = '#fde047';
        } else if (loginAlert) {
            loginAlert.style.display = 'none';
        }

        if (window.lucide) window.lucide.createIcons();
    }

    function setAuthenticatedUser(user) {
        state.user = user;
        userDisplayEmail.textContent = user.email || 'Admin';
        userAvatar.textContent = (user.email ? user.email.charAt(0) : 'A').toUpperCase();

        // Limpiar inputs del login inmediatamente al autenticarse
        if (loginForm) loginForm.reset();
        const adminEmailInput = document.getElementById('adminEmail');
        const adminPasswordInputEl = document.getElementById('adminPassword');
        if (adminEmailInput) adminEmailInput.value = '';
        if (adminPasswordInputEl) {
            adminPasswordInputEl.value = '';
            adminPasswordInputEl.type = 'password';
        }

        loginWrapper.style.display = 'none';
        dashboardLayout.style.display = 'flex';

        updateLastActivity();
        fetchLeads();
        fetchCreditos();
        setupRealtimeSubscription();
    }

    // Toggle Mostrar/Ocultar Contraseña
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const adminPasswordInput = document.getElementById('adminPassword');
    const togglePwdIcon = document.getElementById('togglePwdIcon');

    if (togglePasswordBtn && adminPasswordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = adminPasswordInput.type === 'password';
            adminPasswordInput.type = isPassword ? 'text' : 'password';
            const newIconName = isPassword ? 'eye-off' : 'eye';
            togglePasswordBtn.innerHTML = `<i data-lucide="${newIconName}" id="togglePwdIcon"></i>`;
            if (window.lucide) window.lucide.createIcons();
        });
    }

    // Rate Limiting Config: Máximo 3 intentos por minuto
    const RATE_LIMIT_CONFIG = {
        maxAttempts: 3,
        windowMs: 60 * 1000,
        storageKey: 'vox_admin_login_rate_limit'
    };

    function checkRateLimit() {
        const now = Date.now();
        const record = JSON.parse(localStorage.getItem(RATE_LIMIT_CONFIG.storageKey) || '{"attempts": 0, "firstAttemptTime": 0, "lockUntil": 0}');

        if (record.lockUntil && now < record.lockUntil) {
            const remainingSecs = Math.ceil((record.lockUntil - now) / 1000);
            return {
                isLocked: true,
                remainingSecs,
                message: `⚠️ Demasiados intentos fallidos. Por seguridad, espera ${remainingSecs} segundos antes de volver a intentar.`
            };
        }

        // Si ya expiró la ventana de 1 minuto, reiniciar contador
        if (record.firstAttemptTime && (now - record.firstAttemptTime) > RATE_LIMIT_CONFIG.windowMs) {
            record.attempts = 0;
            record.firstAttemptTime = now;
            record.lockUntil = 0;
            localStorage.setItem(RATE_LIMIT_CONFIG.storageKey, JSON.stringify(record));
        }

        return { isLocked: false, attempts: record.attempts || 0 };
    }

    function recordFailedAttempt() {
        const now = Date.now();
        const record = JSON.parse(localStorage.getItem(RATE_LIMIT_CONFIG.storageKey) || '{"attempts": 0, "firstAttemptTime": 0, "lockUntil": 0}');

        if (!record.firstAttemptTime || (now - record.firstAttemptTime) > RATE_LIMIT_CONFIG.windowMs) {
            record.firstAttemptTime = now;
            record.attempts = 1;
        } else {
            record.attempts += 1;
        }

        if (record.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
            record.lockUntil = now + RATE_LIMIT_CONFIG.windowMs;
            localStorage.setItem(RATE_LIMIT_CONFIG.storageKey, JSON.stringify(record));
            return {
                lockedNow: true,
                remainingSecs: 60
            };
        }

        localStorage.setItem(RATE_LIMIT_CONFIG.storageKey, JSON.stringify(record));
        return {
            lockedNow: false,
            remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts - record.attempts
        };
    }

    function resetRateLimit() {
        localStorage.removeItem(RATE_LIMIT_CONFIG.storageKey);
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Verificar Rate Limit antes de procesar
        const rateLimitStatus = checkRateLimit();
        if (rateLimitStatus.isLocked) {
            loginAlert.textContent = rateLimitStatus.message;
            loginAlert.style.display = 'block';
            return;
        }

        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;

        loginAlert.style.display = 'none';
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span>Verificando...</span>';

        const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();

        if (isConfigured) {
            try {
                const { data, error } = await window.VOX_SUPABASE.client.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;

                // Inicio exitoso: limpiar intentos fallidos
                resetRateLimit();
                setAuthenticatedUser(data.user);
            } catch (err) {
                // Registrar intento fallido
                const failResult = recordFailedAttempt();

                if (failResult.lockedNow) {
                    loginAlert.textContent = `🚫 Has superado el límite de 3 intentos. Cuenta bloqueada temporalmente por ${failResult.remainingSecs} segundos.`;
                } else {
                    const attemptsLeft = failResult.remainingAttempts;
                    loginAlert.textContent = `${err.message || 'Credenciales incorrectas.'} (Te quedan ${attemptsLeft} intento${attemptsLeft === 1 ? '' : 's'} este minuto)`;
                }
                loginAlert.style.display = 'block';
            } finally {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<span>Iniciar Sesión</span> <i data-lucide="arrow-right"></i>';
                if (window.lucide) window.lucide.createIcons();
            }
        } else {
            resetRateLimit();
            localStorage.setItem('vox_crm_demo_user', email);
            setAuthenticatedUser({ email });
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span>Iniciar Sesión</span> <i data-lucide="arrow-right"></i>';
            if (window.lucide) window.lucide.createIcons();
        }
    });

    logoutBtn.addEventListener('click', async () => {
        const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();
        if (isConfigured) {
            await window.VOX_SUPABASE.client.auth.signOut();
        } else {
            localStorage.removeItem('vox_crm_demo_user');
        }
        showLogin();
    });

    // -------------------------------------------------------------
    // 2. CARGA DE DATOS & REALTIME
    // -------------------------------------------------------------
    async function fetchLeads() {
        const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();

        if (isConfigured) {
            try {
                const { data, error } = await window.VOX_SUPABASE.client
                    .from('leads')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                state.leads = data || [];
            } catch (err) {
                console.error('Error al cargar leads de Supabase:', err);
                state.leads = window.LeadService.getLocalLeads();
            }
        } else {
            state.leads = window.LeadService.getLocalLeads();
            if (state.leads.length === 0) {
                // Generar prospectos demostrativos variados para enriquecer el CRM y los gráficos
                state.leads = [
                    {
                        id: 'demo_lead_1',
                        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
                        nombre: 'Alejandro Morales',
                        correo: 'amorales@vanguardia.mx',
                        telefono: '+52 55 4123 9876',
                        empresa: 'Grupo Vanguardia Inmobiliaria',
                        servicio: 'Branding',
                        tipo_financiamiento: 'recurso_propio',
                        mensaje: 'Lanzamiento de torre de departamentos premium en Angelópolis.',
                        estado: 'nuevo',
                        notas: '',
                        origen_url: window.location.origin + '/servicios/branding.html'
                    },
                    {
                        id: 'demo_lead_2',
                        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
                        nombre: 'Valeria Sotomayor',
                        correo: 'vsotomayor@constructora.com',
                        telefono: '+52 22 2345 6789',
                        empresa: 'Desarrollos Urbanos del Valle',
                        servicio: 'Arquitectura',
                        tipo_financiamiento: 'credito_financiamiento',
                        mensaje: 'Requerimos paquete de 12 renders exteriores y 3 recorridos virtuales.',
                        estado: 'en_revision',
                        notas: 'Enviamos catálogo de referencias. Pendiente llamada técnica.',
                        origen_url: window.location.origin + '/servicios/arquitectura.html'
                    },
                    {
                        id: 'demo_lead_3',
                        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
                        nombre: 'Ignacio Fuentes',
                        correo: 'ifuentes@soluciones.mx',
                        telefono: '+52 55 8877 6655',
                        empresa: 'Fuentes & Asociados',
                        servicio: 'Legal Corporativo',
                        tipo_financiamiento: 'recurso_propio',
                        mensaje: 'Constitución de sociedad para fideicomiso de desarrollo inmobiliario.',
                        estado: 'contactado',
                        notas: 'Reunión realizada por Zoom. Muy interesados en blindaje corporativo.',
                        origen_url: window.location.origin + '/servicios/juridico.html'
                    },
                    {
                        id: 'demo_lead_4',
                        created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
                        nombre: 'Camila Herrera',
                        correo: 'camila@residenciallomas.com',
                        telefono: '+52 55 3344 5566',
                        empresa: 'Residencial Las Lomas',
                        servicio: 'Marketing',
                        tipo_financiamiento: 'requiere_asesoria',
                        mensaje: 'Campaña de preventa digital con captación de leads en redes y Google Ads.',
                        estado: 'cotizado',
                        notas: 'Propuesta formal de $85,000 MXN enviada por email.',
                        origen_url: window.location.origin + '/servicios/marketing.html'
                    },
                    {
                        id: 'demo_lead_5',
                        created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
                        nombre: 'Roberto Gomez',
                        correo: 'rgomez@altaingenieria.com',
                        telefono: '+52 55 9900 1122',
                        empresa: 'Alta Ingeniería y Construcción',
                        servicio: 'Desarrollo Web',
                        tipo_financiamiento: 'recurso_propio',
                        mensaje: 'Portal web corporativo con cotizador de lotes interactivo.',
                        estado: 'cerrado',
                        notas: 'Contrato firmado y anticipo recibido.',
                        origen_url: window.location.origin + '/servicios/desarrollo.html'
                    }
                ];
                localStorage.setItem('vox_leads_cache', JSON.stringify(state.leads));
            }
        }

        applyFilters();
    }

    let creditosRealtimeChannel = null;

    function setupRealtimeSubscription() {
        const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();
        if (!isConfigured) return;

        // Si ya existe un canal suscrito, removerlo primero antes de crear uno nuevo
        if (creditosRealtimeChannel) {
            try {
                window.VOX_SUPABASE.client.removeChannel(creditosRealtimeChannel);
            } catch (err) {
                console.warn('Error al limpiar canal realtime previo:', err);
            }
            creditosRealtimeChannel = null;
        }

        try {
            creditosRealtimeChannel = window.VOX_SUPABASE.client
                .channel('creditos-realtime-pro-' + Date.now())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'creditos_sitios' }, () => {
                    fetchCreditos();
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'historial_pagos_credito' }, () => {
                    fetchCreditos();
                })
                .subscribe();
        } catch (err) {
            console.error('Error al iniciar suscripción Realtime:', err);
        }
    }

    // -------------------------------------------------------------
    // 2.2. CARGA Y GESTIÓN DE CRÉDITOS Y CONTROL DE SITIOS
    // -------------------------------------------------------------
    async function fetchCreditos() {
        const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();

        if (isConfigured) {
            try {
                const { data, error } = await window.VOX_SUPABASE.client
                    .from('creditos_sitios')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                state.creditos = data || [];
                // Guardar copia local de respaldo
                localStorage.setItem('vox_creditos_cache', JSON.stringify(state.creditos));
            } catch (err) {
                console.error('Error al cargar créditos de Supabase:', err);
                state.creditos = JSON.parse(localStorage.getItem('vox_creditos_cache') || '[]');
            }
        } else {
            const cached = localStorage.getItem('vox_creditos_cache');
            if (cached) {
                state.creditos = JSON.parse(cached);
            } else {
                // Créditos de demostración iniciales
                state.creditos = [
                    {
                        id: 'demo_cred_1',
                        site_key: 'vox_site_9f8a2b3c4d5e6f7a',
                        cliente_nombre: 'Dra. Sofía Mendoza / Clínica Dental',
                        dominio_url: 'https://dentalmendoza.com',
                        contacto_telefono: '529994967389',
                        contacto_correo: 'contacto@dentalmendoza.com',
                        total_meses: 8,
                        meses_pagados: 3,
                        monto_mensual: 1000,
                        dia_corte: 5,
                        proximo_vencimiento: '2026-09-05',
                        estado: 'activo',
                        plan_nombre: 'Sitio Web Médico Corporativo',
                        motivo_suspension: '',
                        notas: 'Cliente muy puntual. Notificar vía WhatsApp 2 días antes.'
                    },
                    {
                        id: 'demo_cred_2',
                        site_key: 'vox_site_a1b2c3d4e5f67890',
                        cliente_nombre: 'Grupo Constructor Albarrán',
                        dominio_url: 'https://constructoraalbarran.mx',
                        contacto_telefono: '525544332211',
                        contacto_correo: 'pagos@albarran.mx',
                        total_meses: 8,
                        meses_pagados: 5,
                        monto_mensual: 1000,
                        dia_corte: 1,
                        proximo_vencimiento: '2026-09-01',
                        estado: 'en_gracia',
                        plan_nombre: 'Portal Inmobiliario + Catálogo',
                        motivo_suspension: '',
                        notas: 'Cuota 6 pendiente por cambio de tesorería.'
                    },
                    {
                        id: 'demo_cred_3',
                        site_key: 'vox_site_deadbeef12345678',
                        cliente_nombre: 'Restaurante & Grill La Fogata',
                        dominio_url: 'https://lafogatagrill.com',
                        contacto_telefono: '522221122334',
                        contacto_correo: 'gerencia@lafogata.com',
                        total_meses: 8,
                        meses_pagados: 2,
                        monto_mensual: 1000,
                        dia_corte: 15,
                        proximo_vencimiento: '2026-08-15',
                        estado: 'suspendido',
                        plan_nombre: 'Menú Digital Interactivo & Reservas',
                        motivo_suspension: 'Falta de pago cuota 3 (vencida desde Agosto)',
                        notas: 'Se envió recordatorio por WhatsApp sin respuesta.'
                    }
                ];
                localStorage.setItem('vox_creditos_cache', JSON.stringify(state.creditos));
            }
        }

        applyCreditosFilters();
    }

    // -------------------------------------------------------------
    // 3. CAMBIO DE VISTAS (Kanban, Tabla, Créditos, Gráficos)
    // -------------------------------------------------------------
    function switchView(viewName) {
        state.currentView = viewName;

        // Actualizar botones de topbar
        [btnViewKanban, btnViewTable, btnViewCreditos, btnViewCharts].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => item.classList.remove('active'));

        kanbanViewContainer.style.display = 'none';
        tableViewContainer.style.display = 'none';
        analyticsViewContainer.style.display = 'none';
        if (creditosViewContainer) creditosViewContainer.style.display = 'none';

        if (viewName === 'pipeline') {
            if (btnViewKanban) btnViewKanban.classList.add('active');
            document.querySelector('.sidebar-nav .nav-item[data-view="pipeline"]')?.classList.add('active');
            kanbanViewContainer.style.display = 'block';
            currentViewTitle.textContent = 'Pipeline de Prospectos (Kanban)';
            renderKanban();
        } else if (viewName === 'table') {
            if (btnViewTable) btnViewTable.classList.add('active');
            document.querySelector('.sidebar-nav .nav-item[data-view="table"]')?.classList.add('active');
            tableViewContainer.style.display = 'block';
            currentViewTitle.textContent = 'Bandeja de Leads (Tabla)';
            renderTable();
        } else if (viewName === 'creditos') {
            if (btnViewCreditos) btnViewCreditos.classList.add('active');
            document.querySelector('.sidebar-nav .nav-item[data-view="creditos"]')?.classList.add('active');
            if (creditosViewContainer) creditosViewContainer.style.display = 'flex';
            currentViewTitle.textContent = 'Créditos & Control de Sitios (Killswitch)';
            renderCreditos();
        } else if (viewName === 'analytics') {
            if (btnViewCharts) btnViewCharts.classList.add('active');
            document.querySelector('.sidebar-nav .nav-item[data-view="analytics"]')?.classList.add('active');
            analyticsViewContainer.style.display = 'block';
            currentViewTitle.textContent = 'Métricas y Analíticas Comerciales';
            renderCharts();
        }

        if (window.lucide) window.lucide.createIcons();
        closeMobileSidebar();
    }

    // Control de Sidebar Móvil (Drawer)
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const sidebar = document.querySelector('.sidebar');

    function openMobileSidebar() {
        if (sidebar) sidebar.classList.add('mobile-open');
        if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
    }

    function closeMobileSidebar() {
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
    }

    if (sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', openMobileSidebar);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

    if (btnViewKanban) btnViewKanban.addEventListener('click', () => switchView('pipeline'));
    if (btnViewTable) btnViewTable.addEventListener('click', () => switchView('table'));
    if (btnViewCreditos) btnViewCreditos.addEventListener('click', () => switchView('creditos'));
    if (btnViewCharts) btnViewCharts.addEventListener('click', () => switchView('analytics'));

    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            if (view) switchView(view);
        });
    });

    // -------------------------------------------------------------
    // 4. FILTRADO Y KPIS
    // -------------------------------------------------------------
    function applyFilters() {
        let list = [...state.leads];

        // 1. Filtro por Estado (Sidebar sub-items)
        if (state.statusFilter !== 'all') {
            list = list.filter(l => l.estado === state.statusFilter);
        }

        // 2. Filtro por Búsqueda de Texto (Multi-campo con coincidencia insensible)
        if (state.searchTerm) {
            const term = state.searchTerm.toLowerCase();
            list = list.filter(l =>
                (l.nombre && l.nombre.toLowerCase().includes(term)) ||
                (l.correo && l.correo.toLowerCase().includes(term)) ||
                (l.empresa && l.empresa.toLowerCase().includes(term)) ||
                (l.telefono && l.telefono.toLowerCase().includes(term)) ||
                (l.servicio && l.servicio.toLowerCase().includes(term)) ||
                (l.mensaje && l.mensaje.toLowerCase().includes(term)) ||
                (l.notas && l.notas.toLowerCase().includes(term))
            );
        }

        // Ordenamiento por defecto: más recientes primero
        list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

        state.filteredLeads = list;

        // Mostrar / Ocultar botón de limpiar búsqueda rápida
        if (clearSearchBtn) {
            clearSearchBtn.style.display = state.searchTerm ? 'flex' : 'none';
        }

        updateKPIs();

        if (state.currentView === 'pipeline') renderKanban();
        else if (state.currentView === 'table') renderTable();
        else if (state.currentView === 'analytics') renderCharts();
    }

    function updateKPIs() {
        const total = state.leads.length;
        const nuevos = state.leads.filter(l => l.estado === 'nuevo').length;
        const cerrados = state.leads.filter(l => l.estado === 'cerrado').length;
        const recursoPropio = state.leads.filter(l => l.tipo_financiamiento === 'recurso_propio').length;
        const conversion = total > 0 ? Math.round((cerrados / total) * 100) : 0;

        kpiTotal.textContent = total;
        kpiNuevos.textContent = nuevos;
        kpiConversion.textContent = `${conversion}%`;
        kpiRecursoPropio.textContent = recursoPropio;

        badgeAll.textContent = total;
        badgeNew.textContent = nuevos;
    }

    // -------------------------------------------------------------
    // 5. RENDERIZADO PIPELINE KANBAN & DRAG AND DROP
    // -------------------------------------------------------------
    function renderKanban() {
        const allColumns = ['nuevo', 'en_revision', 'contactado', 'cotizado', 'cerrado'];
        const kanbanBoard = document.querySelector('.kanban-board');

        // Si se seleccionó un estado específico, mostramos únicamente esa columna
        const activeColumns = state.statusFilter === 'all' 
            ? allColumns 
            : allColumns.filter(col => col === state.statusFilter);

        // Ajustar layout de la cuadrícula si hay una sola columna filtrada
        if (kanbanBoard) {
            if (state.statusFilter !== 'all') {
                kanbanBoard.style.gridTemplateColumns = 'minmax(300px, 480px)';
            } else {
                kanbanBoard.style.gridTemplateColumns = 'repeat(5, minmax(270px, 1fr))';
            }
        }

        allColumns.forEach(col => {
            const columnEl = document.querySelector(`.kanban-column[data-column="${col}"]`);
            const container = document.getElementById(`cards-${col}`);
            const counter = document.getElementById(`count-${col}`);

            // Ocultar o mostrar la columna según el filtro seleccionado
            if (columnEl) {
                const shouldShow = activeColumns.includes(col);
                columnEl.style.display = shouldShow ? 'flex' : 'none';
            }

            if (!container) return;

            const colLeads = state.filteredLeads.filter(l => l.estado === col);
            if (counter) counter.textContent = colLeads.length;

            container.innerHTML = '';

            colLeads.forEach(lead => {
                const card = document.createElement('div');
                card.className = 'kanban-card';
                card.draggable = true;
                card.setAttribute('data-id', lead.id);

                const dateFormatted = new Date(lead.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
                const finText = window.LeadService.formatFinanciamiento(lead.tipo_financiamiento);

                card.innerHTML = `
                    <div class="k-card-header">
                        <div>
                            <div class="k-card-name">${escapeHtml(lead.nombre)}</div>
                            <div class="k-card-empresa">${escapeHtml(lead.empresa || 'Particular')}</div>
                        </div>
                        <span class="k-card-service">${escapeHtml(lead.servicio)}</span>
                    </div>

                    <div class="k-card-finance">
                        <i data-lucide="wallet" style="width:13px;height:13px;"></i>
                        <span>${escapeHtml(finText)}</span>
                    </div>

                    <div class="k-card-footer">
                        <span class="k-card-date">${dateFormatted}</span>
                        <div class="k-card-actions">
                            <button class="btn-icon-action view-btn" data-id="${lead.id}" title="Ver Ficha y Notas">
                                <i data-lucide="eye"></i>
                            </button>
                            ${lead.telefono ? `
                            <button class="btn-icon-action wa wa-quick-btn" data-id="${lead.id}" title="WhatsApp Rápido">
                                <i data-lucide="message-circle"></i>
                            </button>` : ''}
                            <button class="btn-icon-action delete-btn delete-lead-btn" data-id="${lead.id}" title="Eliminar Prospecto">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </div>
                `;

                // Drag Events
                card.addEventListener('dragstart', (e) => {
                    card.classList.add('dragging');
                    e.dataTransfer.setData('text/plain', lead.id);
                });

                card.addEventListener('dragend', () => {
                    card.classList.remove('dragging');
                });

                container.appendChild(card);
            });
        });

        // Setup Drop Containers
        document.querySelectorAll('.kanban-column').forEach(columnEl => {
            const statusName = columnEl.getAttribute('data-column');

            columnEl.addEventListener('dragover', (e) => {
                e.preventDefault();
                columnEl.style.borderColor = 'var(--accent-gold)';
            });

            columnEl.addEventListener('dragleave', () => {
                columnEl.style.borderColor = 'var(--border-glass)';
            });

            columnEl.addEventListener('drop', async (e) => {
                e.preventDefault();
                columnEl.style.borderColor = 'var(--border-glass)';
                const leadId = e.dataTransfer.getData('text/plain');
                if (leadId) {
                    await updateLeadStatus(leadId, statusName);
                }
            });
        });

        if (window.lucide) window.lucide.createIcons();

        // Attach action listeners
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => openLeadModal(btn.getAttribute('data-id')));
        });
        document.querySelectorAll('.wa-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => openLeadModal(btn.getAttribute('data-id')));
        });
        document.querySelectorAll('.delete-lead-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                abrirModalEliminarLead(btn.getAttribute('data-id'));
            });
        });
    }

    async function updateLeadStatus(leadId, newStatus) {
        const lead = state.leads.find(l => String(l.id) === String(leadId));
        if (!lead || lead.estado === newStatus) return;

        lead.estado = newStatus;

        const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();
        if (isConfigured) {
            try {
                await window.VOX_SUPABASE.client
                    .from('leads')
                    .update({ estado: newStatus })
                    .eq('id', leadId);
            } catch (err) {
                console.error('Error al mover estado en Supabase:', err);
            }
        } else {
            const localLeads = window.LeadService.getLocalLeads();
            const idx = localLeads.findIndex(l => String(l.id) === String(leadId));
            if (idx !== -1) {
                localLeads[idx].estado = newStatus;
                localStorage.setItem('vox_leads_cache', JSON.stringify(localLeads));
            }
        }

        applyFilters();
    }

    // -------------------------------------------------------------
    // 6. RENDERIZADO TABLA DE LEADS
    // -------------------------------------------------------------
    function renderTable() {
        const leadsTableBody = document.getElementById('leadsTableBody');
        const emptyState = document.getElementById('emptyState');
        leadsTableBody.innerHTML = '';

        if (state.filteredLeads.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        state.filteredLeads.forEach(lead => {
            const tr = document.createElement('tr');
            const dateFormatted = new Date(lead.created_at).toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
            const finFormatted = window.LeadService.formatFinanciamiento(lead.tipo_financiamiento);

            tr.innerHTML = `
                <td><small class="muted">${dateFormatted}</small></td>
                <td>
                    <div class="lead-cell-name">
                        <span>${escapeHtml(lead.nombre)}</span>
                        <span class="lead-cell-empresa">${escapeHtml(lead.empresa || 'Particular')}</span>
                    </div>
                </td>
                <td><span class="badge badge-accent">${escapeHtml(lead.servicio)}</span></td>
                <td><small>${escapeHtml(finFormatted)}</small></td>
                <td>
                    <div class="lead-cell-contact">
                        <a href="mailto:${escapeHtml(lead.correo)}">${escapeHtml(lead.correo)}</a>
                        <a href="tel:${escapeHtml(lead.telefono)}">${escapeHtml(lead.telefono || '-')}</a>
                    </div>
                </td>
                <td>
                    <span class="status-badge status-${lead.estado || 'nuevo'}">${formatEstadoLabel(lead.estado)}</span>
                </td>
                <td>
                    <div class="action-buttons-cell">
                        <button class="btn-icon-action view-btn" data-id="${lead.id}" title="Ver Detalle y Gestionar">
                            <i data-lucide="eye"></i>
                        </button>
                        ${lead.telefono ? `
                        <button class="btn-icon-action wa wa-quick-btn" data-id="${lead.id}" title="WhatsApp">
                            <i data-lucide="message-circle"></i>
                        </button>` : ''}
                        <button class="btn-icon-action delete-btn delete-lead-btn" data-id="${lead.id}" title="Eliminar Prospecto">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            `;

            leadsTableBody.appendChild(tr);
        });

        if (window.lucide) window.lucide.createIcons();

        document.querySelectorAll('.view-btn, .wa-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => openLeadModal(btn.getAttribute('data-id')));
        });

        document.querySelectorAll('.delete-lead-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                abrirModalEliminarLead(btn.getAttribute('data-id'));
            });
        });
    }

    // -------------------------------------------------------------
    // 7. RENDERIZADO DE GRÁFICOS Y ANALÍTICAS (Chart.js)
    // -------------------------------------------------------------
    function renderCharts() {
        if (typeof Chart === 'undefined') return;

        // 1. Gráfico de Distribución por Servicio (Doughnut)
        const serviceCounts = {};
        state.leads.forEach(l => {
            const s = l.servicio || 'General';
            serviceCounts[s] = (serviceCounts[s] || 0) + 1;
        });

        const ctxServices = document.getElementById('servicesChart');
        if (ctxServices) {
            if (state.charts.services) state.charts.services.destroy();
            state.charts.services = new Chart(ctxServices, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(serviceCounts),
                    datasets: [{
                        data: Object.values(serviceCounts),
                        backgroundColor: [
                            '#c5a059', '#388bfd', '#a371f7', '#2ea043',
                            '#d29922', '#f85149', '#58a6ff', '#e3b341'
                        ],
                        borderWidth: 2,
                        borderColor: '#14181e'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right', labels: { color: '#8b949e', font: { family: 'Sora', size: 11 } } }
                    }
                }
            });
        }

        // 2. Gráfico de Embudo Pipeline (Bar)
        const pipelineCounts = {
            'Nuevos': state.leads.filter(l => l.estado === 'nuevo').length,
            'En Revisión': state.leads.filter(l => l.estado === 'en_revision').length,
            'Contactados': state.leads.filter(l => l.estado === 'contactado').length,
            'Cotizados': state.leads.filter(l => l.estado === 'cotizado').length,
            'Ganados': state.leads.filter(l => l.estado === 'cerrado').length
        };

        const ctxPipeline = document.getElementById('pipelineChart');
        if (ctxPipeline) {
            if (state.charts.pipeline) state.charts.pipeline.destroy();
            state.charts.pipeline = new Chart(ctxPipeline, {
                type: 'bar',
                data: {
                    labels: Object.keys(pipelineCounts),
                    datasets: [{
                        label: 'Prospectos',
                        data: Object.values(pipelineCounts),
                        backgroundColor: ['#58a6ff', '#d29922', '#bc8cff', '#e3b341', '#3fb950'],
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: { ticks: { color: '#8b949e', font: { family: 'Sora' } }, grid: { display: false } },
                        y: { ticks: { color: '#8b949e', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } }
                    }
                }
            });
        }

        // 3. Gráfico de Perfil Financiero (Horizontal Bar)
        const finCounts = {
            'Recurso Propio': state.leads.filter(l => l.tipo_financiamiento === 'recurso_propio').length,
            'Crédito Comercial / Bancario': state.leads.filter(l => l.tipo_financiamiento === 'credito_financiamiento').length,
            'Requiere Asesoría Financiera': state.leads.filter(l => l.tipo_financiamiento === 'requiere_asesoria').length
        };

        const ctxFin = document.getElementById('financingChart');
        if (ctxFin) {
            if (state.charts.financing) state.charts.financing.destroy();
            state.charts.financing = new Chart(ctxFin, {
                type: 'bar',
                data: {
                    labels: Object.keys(finCounts),
                    datasets: [{
                        label: 'Total Leads',
                        data: Object.values(finCounts),
                        backgroundColor: ['#a371f7', '#388bfd', '#d29922'],
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#8b949e', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: { ticks: { color: '#8b949e', font: { family: 'Sora' } }, grid: { display: false } }
                    }
                }
            });
        }
    }

    // -------------------------------------------------------------
    // 8. MODAL DE GESTIÓN & WHATSAPP CUSTOMIZER
    // -------------------------------------------------------------
    function openLeadModal(leadId) {
        const lead = state.leads.find(l => String(l.id) === String(leadId));
        if (!lead) return;

        state.activeLead = lead;

        const dateObj = new Date(lead.created_at);
        modalLeadDate.textContent = dateObj.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        modalServiceBadge.textContent = lead.servicio;
        modalStatusBadge.textContent = formatEstadoLabel(lead.estado);
        modalStatusBadge.className = `status-badge status-${lead.estado || 'nuevo'}`;

        modalLeadName.textContent = lead.nombre;
        modalEmpresa.textContent = lead.empresa || 'No especificada';
        modalEmail.textContent = lead.correo;
        modalTelefono.textContent = lead.telefono || 'No especificado';
        modalFinanciamiento.textContent = window.LeadService.formatFinanciamiento(lead.tipo_financiamiento);

        modalOrigenUrl.href = lead.origen_url || '#';
        modalOrigenUrl.textContent = lead.origen_url ? 'Abrir enlace de servicio' : 'Directo';

        modalMensaje.textContent = lead.mensaje || 'Sin mensaje adicional.';
        modalStatusSelect.value = lead.estado || 'nuevo';
        modalNotas.value = lead.notas || '';
        modalLogCreated.textContent = dateObj.toLocaleString('es-MX');

        // Cargar plantilla de WhatsApp
        updateWhatsAppTemplate();

        // Email Link
        modalMailBtn.href = `mailto:${lead.correo}?subject=${encodeURIComponent('Contacto VOX Business Developer - ' + lead.servicio)}`;

        leadModal.style.display = 'flex';
        if (window.lucide) window.lucide.createIcons();
    }

    function updateWhatsAppTemplate() {
        if (!state.activeLead) return;
        const templateType = waTemplateSelect.value;
        const lead = state.activeLead;
        let msg = '';

        if (templateType === 'intro') {
            msg = `Hola ${lead.nombre}, un gusto saludarte. Te contactamos del equipo comercial de VOX Business Developer en relación a tu solicitud sobre ${lead.servicio}. ¿En qué horario podríamos tener una breve llamada para conocer más sobre tu proyecto?`;
        } else if (templateType === 'meeting') {
            msg = `Hola ${lead.nombre}, te compartimos el enlace para agendar nuestra sesión estratégica de ${lead.servicio} con el equipo directivo de VOX. ¿Te queda bien esta semana?`;
        } else if (templateType === 'quote') {
            msg = `Estimado(a) ${lead.nombre}, te hemos enviado por correo electrónico la propuesta comercial y cotización para el desarrollo de tu proyecto de ${lead.servicio}. Quedamos atentos a tus comentarios.`;
        } else if (templateType === 'followup') {
            msg = `Hola ${lead.nombre}, ¿cómo estás? Te escribo para dar seguimiento a nuestra conversación sobre el proyecto de ${lead.servicio} para ${lead.empresa || 'tu empresa'}. ¿Tienes alguna consulta adicional en la que te podamos apoyar?`;
        }

        waCustomMessage.value = msg;
        updateWhatsAppButtonLink();
    }

    function updateWhatsAppButtonLink() {
        if (!state.activeLead || !state.activeLead.telefono) {
            modalWaBtn.style.display = 'none';
            return;
        }
        modalWaBtn.style.display = 'inline-flex';
        const cleanPhone = (state.activeLead.telefono || '').replace(/[^0-9]/g, '');
        const text = encodeURIComponent(waCustomMessage.value);
        modalWaBtn.href = `https://wa.me/${cleanPhone}?text=${text}`;
    }

    waTemplateSelect.addEventListener('change', updateWhatsAppTemplate);
    waCustomMessage.addEventListener('input', updateWhatsAppButtonLink);

    function closeLeadModal() {
        leadModal.style.display = 'none';
        state.activeLead = null;
    }

    closeModalBtn.addEventListener('click', closeLeadModal);
    leadModal.addEventListener('click', (e) => {
        if (e.target === leadModal) closeLeadModal();
    });

    // Actualizar badge del modal en tiempo real cuando el usuario cambia el selector
    modalStatusSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        modalStatusBadge.textContent = formatEstadoLabel(val);
        modalStatusBadge.className = `status-badge status-${val}`;
    });

    saveLeadChangesBtn.addEventListener('click', async () => {
        if (!state.activeLead) return;

        const newStatus = modalStatusSelect.value;
        const newNotas = modalNotas.value.trim();
        const leadId = state.activeLead.id;

        saveLeadChangesBtn.disabled = true;
        saveLeadChangesBtn.innerHTML = '<span>Guardando...</span>';

        // 1. Actualizar el lead en state.leads
        const leadInState = state.leads.find(l => String(l.id) === String(leadId));
        if (leadInState) {
            leadInState.estado = newStatus;
            leadInState.notas = newNotas;
        }
        state.activeLead.estado = newStatus;
        state.activeLead.notas = newNotas;

        // 2. Actualizar en Supabase Cloud si está configurado
        const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();
        if (isConfigured) {
            try {
                const { error } = await window.VOX_SUPABASE.client
                    .from('leads')
                    .update({ estado: newStatus, notas: newNotas })
                    .eq('id', leadId);

                if (error) {
                    console.error('Error al actualizar lead en Supabase:', error);
                } else {
                    console.log('✅ Lead actualizado con éxito en Supabase Cloud:', leadId);
                }
            } catch (err) {
                console.error('Error en petición a Supabase:', err);
            }
        }

        // 3. Actualizar en caché local
        const localLeads = window.LeadService.getLocalLeads();
        const index = localLeads.findIndex(l => String(l.id) === String(leadId));
        if (index !== -1) {
            localLeads[index].estado = newStatus;
            localLeads[index].notas = newNotas;
            localStorage.setItem('vox_leads_cache', JSON.stringify(localLeads));
        }

        saveLeadChangesBtn.disabled = false;
        saveLeadChangesBtn.innerHTML = '<i data-lucide="save"></i> <span>Guardar Cambios</span>';
        if (window.lucide) window.lucide.createIcons();

        // 4. Refrescar filtros y re-renderizar todas las vistas
        applyFilters();
        closeLeadModal();
    });

    // -------------------------------------------------------------
    // 9. EVENTOS DE BÚSQUEDA Y NAVEGACIÓN
    // -------------------------------------------------------------
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchTerm = e.target.value.trim();
            applyFilters();
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            state.searchTerm = '';
            applyFilters();
            searchInput.focus();
        });
    }

    document.querySelectorAll('.status-nav .nav-subitem').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.status-nav .nav-subitem').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            state.statusFilter = item.getAttribute('data-status');
            applyFilters();
        });
    });

    refreshBtn.addEventListener('click', () => fetchLeads());

    // Exportar Excel (.xlsx) con Formato Profesional
    exportCsvBtn.addEventListener('click', () => {
        if (!state.filteredLeads || state.filteredLeads.length === 0) {
            alert('No hay prospectos en la vista actual para exportar.');
            return;
        }

        const formattedData = state.filteredLeads.map((l, index) => {
            const fecha = l.created_at ? new Date(l.created_at).toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'N/A';

            return {
                'N°': index + 1,
                'Fecha Registro': fecha,
                'Nombre del Cliente': l.nombre || 'Sin nombre',
                'Empresa / Proyecto': l.empresa || 'Particular',
                'Correo Electrónico': l.correo || 'N/A',
                'Teléfono / WhatsApp': l.telefono || 'N/A',
                'Servicio de Interés': l.servicio || 'General',
                'Perfil Financiero': window.LeadService ? window.LeadService.formatFinanciamiento(l.tipo_financiamiento) : (l.tipo_financiamiento || 'N/A'),
                'Estado Comercial': formatEstadoLabel(l.estado),
                'Mensaje Inicial': l.mensaje || '',
                'Notas del Asesor': l.notas || '',
                'Página Origen': l.origen_url || ''
            };
        });

        const fileName = `Reporte_Leads_VOX_CRM_${new Date().toISOString().slice(0, 10)}.xlsx`;

        // Si SheetJS (XLSX) está disponible, exportamos un archivo nativo .xlsx con anchos de columna óptimos
        if (window.XLSX) {
            try {
                const worksheet = window.XLSX.utils.json_to_sheet(formattedData);

                // Configurar anchos de columna automáticos basados en el contenido
                const columnWidths = [
                    { wch: 5 },   // N°
                    { wch: 18 },  // Fecha
                    { wch: 26 },  // Nombre
                    { wch: 24 },  // Empresa
                    { wch: 28 },  // Correo
                    { wch: 18 },  // Teléfono
                    { wch: 22 },  // Servicio
                    { wch: 28 },  // Financiamiento
                    { wch: 18 },  // Estado
                    { wch: 35 },  // Mensaje
                    { wch: 35 },  // Notas
                    { wch: 30 }   // Origen
                ];
                worksheet['!cols'] = columnWidths;

                const workbook = window.XLSX.utils.book_new();
                window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Prospectos VOX CRM');

                window.XLSX.writeFile(workbook, fileName);
                return;
            } catch (err) {
                console.error('Error al generar XLSX, usando fallback CSV:', err);
            }
        }

        // Fallback a CSV estructurado con BOM UTF-8 y delimitador estándar
        const headers = Object.keys(formattedData[0]);
        const csvRows = [
            headers.join(';'),
            ...formattedData.map(row =>
                headers.map(field => `"${String(row[field] || '').replace(/"/g, '""')}"`).join(';')
            )
        ];

        const csvContent = '\uFEFF' + csvRows.join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Reporte_Leads_VOX_CRM_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    // -------------------------------------------------------------
    // 10. LÓGICA DEL MÓDULO DE CRÉDITOS Y KILLSWITCH DE SITIOS
    // -------------------------------------------------------------

    function applyCreditosFilters() {
        let list = [...state.creditos];

        // Filtro por Estado
        if (state.creditoFilter !== 'all') {
            list = list.filter(c => c.estado === state.creditoFilter);
        }

        // Filtro por búsqueda
        if (state.searchTerm) {
            const term = state.searchTerm.toLowerCase();
            list = list.filter(c =>
                (c.cliente_nombre && c.cliente_nombre.toLowerCase().includes(term)) ||
                (c.dominio_url && c.dominio_url.toLowerCase().includes(term)) ||
                (c.contacto_telefono && c.contacto_telefono.toLowerCase().includes(term)) ||
                (c.contacto_correo && c.contacto_correo.toLowerCase().includes(term)) ||
                (c.site_key && c.site_key.toLowerCase().includes(term)) ||
                (c.plan_nombre && c.plan_nombre.toLowerCase().includes(term))
            );
        }

        state.filteredCreditos = list;
        updateCreditosKPIs();
        if (state.currentView === 'creditos') {
            renderCreditos();
        }
    }

    function updateCreditosKPIs() {
        const totalCreditos = state.creditos.length;
        const activos = state.creditos.filter(c => c.estado === 'activo').length;
        const enGracia = state.creditos.filter(c => c.estado === 'en_gracia').length;
        const suspendidos = state.creditos.filter(c => c.estado === 'suspendido').length;
        const liquidados = state.creditos.filter(c => c.estado === 'liquidado').length;

        // Actualizar contadores de filtros pill
        const countAll = document.getElementById('countCreditosAll');
        const countActivos = document.getElementById('countCreditosActivos');
        const countGracia = document.getElementById('countCreditosGracia');
        const countSuspendidos = document.getElementById('countCreditosSuspendidos');
        const countLiquidados = document.getElementById('countCreditosLiquidados');

        if (countAll) countAll.textContent = totalCreditos;
        if (countActivos) countActivos.textContent = activos;
        if (countGracia) countGracia.textContent = enGracia;
        if (countSuspendidos) countSuspendidos.textContent = suspendidos;
        if (countLiquidados) countLiquidados.textContent = liquidados;

        // Badge en el sidebar
        if (badgeCreditosAlert) {
            const alertCount = suspendidos + enGracia;
            if (alertCount > 0) {
                badgeCreditosAlert.textContent = alertCount;
                badgeCreditosAlert.style.display = 'inline-block';
            } else {
                badgeCreditosAlert.style.display = 'none';
            }
        }

        // Cálculos financieros
        let carteraTotal = 0;
        let cobradoTotal = 0;

        state.creditos.forEach(c => {
            const meses = parseInt(c.total_meses || 8, 10);
            const pagados = parseInt(c.meses_pagados || 0, 10);
            const monto = parseFloat(c.monto_mensual || 1000);

            carteraTotal += meses * monto;
            cobradoTotal += pagados * monto;
        });

        const porCobrar = Math.max(0, carteraTotal - cobradoTotal);

        const kpiCarteraEl = document.getElementById('kpiCarteraTotal');
        const kpiCobradoEl = document.getElementById('kpiCobradoTotal');
        const kpiPorCobrarEl = document.getElementById('kpiPorCobrar');
        const kpiSuspendidosEl = document.getElementById('kpiSuspendidos');

        const formatoMoneda = (val) => '$' + Number(val).toLocaleString('es-MX', { minimumFractionDigits: 0 });

        if (kpiCarteraEl) kpiCarteraEl.textContent = formatoMoneda(carteraTotal);
        if (kpiCobradoEl) kpiCobradoEl.textContent = formatoMoneda(cobradoTotal);
        if (kpiPorCobrarEl) kpiPorCobrarEl.textContent = formatoMoneda(porCobrar);
        if (kpiSuspendidosEl) kpiSuspendidosEl.textContent = suspendidos;
    }

    function renderCreditos() {
        if (!creditosGrid) return;
        creditosGrid.innerHTML = '';

        if (!state.filteredCreditos || state.filteredCreditos.length === 0) {
            if (emptyStateCreditos) emptyStateCreditos.style.display = 'flex';
            return;
        }

        if (emptyStateCreditos) emptyStateCreditos.style.display = 'none';

        state.filteredCreditos.forEach(credito => {
            const card = createCreditoCard(credito);
            creditosGrid.appendChild(card);
        });

        if (window.lucide) window.lucide.createIcons();
    }

    function createCreditoCard(credito) {
        const card = document.createElement('div');
        card.className = `credito-card status-${credito.estado}`;

        const totalMeses = parseInt(credito.total_meses || 8, 10);
        const mesesPagados = parseInt(credito.meses_pagados || 0, 10);
        const montoMensual = parseFloat(credito.monto_mensual || 1000);
        const totalCredito = totalMeses * montoMensual;
        const totalPagado = mesesPagados * montoMensual;
        const porcentaje = Math.min(100, Math.round((mesesPagados / totalMeses) * 100));

        // Crear segmentos visuales
        let segmentsHtml = '';
        for (let i = 1; i <= totalMeses; i++) {
            const isPaid = i <= mesesPagados;
            const isFull = mesesPagados >= totalMeses;
            segmentsHtml += `<div class="credito-segment ${isPaid ? 'paid' : ''} ${isFull ? 'full' : ''}" title="Mes ${i}: ${isPaid ? 'Cubierto' : 'Pendiente'}"></div>`;
        }

        const estadoBadgeClass = credito.estado;
        let estadoLabel = 'Activo';
        if (credito.estado === 'en_gracia') estadoLabel = 'Por Vencer';
        if (credito.estado === 'suspendido') estadoLabel = 'Suspendido';
        if (credito.estado === 'liquidado') estadoLabel = 'Liquidado';

        const isSuspendido = credito.estado === 'suspendido';
        const isLiquidado = credito.estado === 'liquidado';

        const waPhone = (credito.contacto_telefono || '').replace(/\D/g, '');
        const waRemindMsg = encodeURIComponent(
            `Hola ${credito.cliente_nombre}, te saludamos de VOX Business Developer. Te recordamos que la cuota ${mesesPagados + 1} de tu sitio web (${credito.dominio_url}) está próxima a corte ($${montoMensual.toLocaleString('es-MX')} MXN). ¿Deseas los datos para transferencia SPEI?`
        );
        const waLink = waPhone ? `https://wa.me/${waPhone}?text=${waRemindMsg}` : '#';

        card.innerHTML = `
            <div class="credito-card-header">
                <div class="credito-cliente-info">
                    <h3>${escapeHtml(credito.cliente_nombre)}</h3>
                    <a href="${credito.dominio_url.startsWith('http') ? credito.dominio_url : 'https://' + credito.dominio_url}" target="_blank" rel="noopener noreferrer" class="credito-dominio-link">
                        <i data-lucide="globe" style="width: 13px; height: 13px;"></i>
                        <span>${escapeHtml(credito.dominio_url)}</span>
                    </a>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="credito-status-badge ${estadoBadgeClass}">${estadoLabel}</span>
                    <button class="btn-delete-card" data-action="eliminar-credito" data-id="${credito.id}" title="Eliminar sitio permanentemente" aria-label="Eliminar sitio">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
            </div>

            <div class="credito-progress-box">
                <div class="credito-progress-header">
                    <span>Progreso: <strong>${mesesPagados} de ${totalMeses} meses</strong></span>
                    <span><strong>$${totalPagado.toLocaleString('es-MX')}</strong> / $${totalCredito.toLocaleString('es-MX')} MXN</span>
                </div>
                <div class="credito-progress-bar">
                    <div class="credito-progress-fill ${porcentaje >= 100 ? 'full' : ''}" style="width: ${porcentaje}%;"></div>
                </div>
                <div class="credito-progress-segments">
                    ${segmentsHtml}
                </div>
            </div>

            <div class="credito-details-row">
                <div class="credito-detail-item">
                    <span class="credito-detail-label">Monto por mes:</span>
                    <span class="credito-detail-val">$${montoMensual.toLocaleString('es-MX')} MXN</span>
                </div>
                <div class="credito-detail-item">
                    <span class="credito-detail-label">Día de corte:</span>
                    <span class="credito-detail-val">Día ${credito.dia_corte || 1} de cada mes</span>
                </div>
                <div class="credito-detail-item">
                    <span class="credito-detail-label">Próximo Vencimiento:</span>
                    <span class="credito-detail-val" style="color: ${isSuspendido ? 'var(--red-tag)' : 'var(--text-primary)'};">${credito.proximo_vencimiento || 'Al día'}</span>
                </div>
                <div class="credito-detail-item">
                    <span class="credito-detail-label">Plan / Concepto:</span>
                    <span class="credito-detail-val">${escapeHtml(credito.plan_nombre || 'Página Web')}</span>
                </div>
            </div>

            ${credito.motivo_suspension ? `
                <div style="background: rgba(231, 76, 60, 0.1); border-left: 3px solid var(--red-tag); padding: 8px 10px; border-radius: 4px; font-size: 0.76rem; color: #ff8577;">
                    <strong>Motivo:</strong> ${escapeHtml(credito.motivo_suspension)}
                </div>
            ` : ''}

            <div class="credito-actions-grid">
                ${!isLiquidado ? `
                    <button class="btn-card-action btn-pay" data-action="registrar-pago" data-id="${credito.id}">
                        <i data-lucide="plus-circle" style="width: 14px; height: 14px;"></i>
                        <span>Registrar Pago</span>
                    </button>
                ` : `
                    <button class="btn-card-action" data-action="ver-historial" data-id="${credito.id}">
                        <i data-lucide="receipt" style="width: 14px; height: 14px;"></i>
                        <span>Ver Pagos (8/8)</span>
                    </button>
                `}

                ${isSuspendido ? `
                    <button class="btn-card-action btn-killswitch-reactivate" data-action="toggle-killswitch" data-id="${credito.id}" data-current="suspendido">
                        <i data-lucide="power" style="width: 14px; height: 14px;"></i>
                        <span>Reactivar Sitio</span>
                    </button>
                ` : `
                    <button class="btn-card-action btn-killswitch-suspend" data-action="toggle-killswitch" data-id="${credito.id}" data-current="activo">
                        <i data-lucide="shield-alert" style="width: 14px; height: 14px;"></i>
                        <span>Suspender Sitio</span>
                    </button>
                `}

                <button class="btn-card-action" data-action="ver-snippet" data-id="${credito.id}">
                    <i data-lucide="code" style="width: 14px; height: 14px;"></i>
                    <span>Código Web</span>
                </button>

                <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-card-action btn-wa-remind">
                    <i data-lucide="message-circle" style="width: 14px; height: 14px;"></i>
                    <span>WhatsApp</span>
                </a>
            </div>
        `;

        // Event listeners para botones de la tarjeta
        card.querySelector('[data-action="registrar-pago"]')?.addEventListener('click', () => {
            abrirModalRegistrarPago(credito);
        });

        card.querySelector('[data-action="ver-historial"]')?.addEventListener('click', () => {
            abrirModalHistorial(credito);
        });

        card.querySelector('[data-action="toggle-killswitch"]')?.addEventListener('click', () => {
            toggleKillswitchSitio(credito);
        });

        card.querySelector('[data-action="ver-snippet"]')?.addEventListener('click', () => {
            abrirModalSnippet(credito);
        });

        card.querySelector('[data-action="eliminar-credito"]')?.addEventListener('click', () => {
            abrirModalEliminarCredito(credito);
        });

        return card;
    }

    // Filtros de Créditos (Pill buttons)
    document.querySelectorAll('[data-credito-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-credito-filter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.creditoFilter = btn.getAttribute('data-credito-filter');
            applyCreditosFilters();
        });
    });

    // -------------------------------------------------------------
    // MODAL: NUEVO CRÉDITO DE SITIO
    // -------------------------------------------------------------
    function updateNuevoCreditoLiveSummary() {
        const totalMeses = parseInt(document.getElementById('credTotalMeses')?.value, 10) || 8;
        const montoMensual = parseFloat(document.getElementById('credMontoMensual')?.value) || 1000;
        const diaCorte = parseInt(document.getElementById('credDiaCorte')?.value, 10) || 5;

        const totalInversion = totalMeses * montoMensual;

        const summaryTotalEl = document.getElementById('summaryTotalCredito');
        const summaryEstructuraEl = document.getElementById('summaryEstructuraPlan');
        const summaryVencimientoEl = document.getElementById('summaryFechaVencimiento');

        if (summaryTotalEl) summaryTotalEl.textContent = '$' + totalInversion.toLocaleString('es-MX') + ' MXN';
        if (summaryEstructuraEl) summaryEstructuraEl.textContent = `${totalMeses} pagos de $${montoMensual.toLocaleString('es-MX')} MXN`;
        if (summaryVencimientoEl) summaryVencimientoEl.textContent = `Día ${diaCorte} de cada mes`;
    }

    if (btnOpenNuevoCreditoModal) {
        btnOpenNuevoCreditoModal.addEventListener('click', () => {
            if (nuevoCreditoForm) nuevoCreditoForm.reset();
            const totalMesesInput = document.getElementById('credTotalMeses');
            const montoMensualInput = document.getElementById('credMontoMensual');
            const diaCorteInput = document.getElementById('credDiaCorte');
            const planNombreInput = document.getElementById('credPlanNombre');

            if (totalMesesInput) totalMesesInput.value = '8';
            if (montoMensualInput) montoMensualInput.value = '1000';
            if (diaCorteInput) diaCorteInput.value = '5';
            if (planNombreInput) planNombreInput.value = 'Página Web Corporativa a 8 Meses';

            updateNuevoCreditoLiveSummary();
            nuevoCreditoModal.style.display = 'flex';
            if (window.lucide) window.lucide.createIcons();
        });
    }

    // Listeners para recálculo dinámico en vivo
    ['credTotalMeses', 'credMontoMensual', 'credDiaCorte'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateNuevoCreditoLiveSummary);
        }
    });

    function closeNuevoCreditoModal() {
        if (nuevoCreditoModal) nuevoCreditoModal.style.display = 'none';
    }

    if (closeNuevoCreditoModalBtn) closeNuevoCreditoModalBtn.addEventListener('click', closeNuevoCreditoModal);
    if (cancelNuevoCreditoBtn) cancelNuevoCreditoBtn.addEventListener('click', closeNuevoCreditoModal);

    if (nuevoCreditoForm) {
        nuevoCreditoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const cliente_nombre = document.getElementById('credClienteNombre').value.trim();
            const dominio_url = document.getElementById('credDominioUrl').value.trim();
            const contacto_telefono = document.getElementById('credTelefono').value.trim();
            const contacto_correo = document.getElementById('credCorreo').value.trim();
            const total_meses = parseInt(document.getElementById('credTotalMeses').value, 10) || 8;
            const monto_mensual = parseFloat(document.getElementById('credMontoMensual').value) || 1000;
            const dia_corte = parseInt(document.getElementById('credDiaCorte').value, 10) || 5;
            const plan_nombre = document.getElementById('credPlanNombre').value.trim() || 'Página Web Financiada';
            const notas = document.getElementById('credNotas').value.trim();

            const site_key = 'vox_site_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);

            // Calcular primer vencimiento
            const hoy = new Date();
            let mesVenc = hoy.getMonth() + 1;
            let anioVenc = hoy.getFullYear();
            if (mesVenc > 11) { mesVenc = 0; anioVenc++; }
            const proxVencStr = `${anioVenc}-${String(mesVenc + 1).padStart(2, '0')}-${String(dia_corte).padStart(2, '0')}`;

            const nuevoCredito = {
                site_key,
                cliente_nombre,
                dominio_url,
                contacto_telefono,
                contacto_correo,
                total_meses,
                meses_pagados: 0,
                monto_mensual,
                dia_corte,
                proximo_vencimiento: proxVencStr,
                estado: 'activo',
                motivo_suspension: '',
                notas,
                plan_nombre
            };

            const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();
            let creditoGuardado = null;

            if (isConfigured) {
                try {
                    const { data, error } = await window.VOX_SUPABASE.client
                        .from('creditos_sitios')
                        .insert([nuevoCredito])
                        .select();

                    if (error) {
                        console.error('Error insertando en Supabase:', error);
                        throw error;
                    }
                    if (data && data[0]) {
                        creditoGuardado = data[0];
                    }
                } catch (err) {
                    console.error('Error al guardar crédito en Supabase, guardando en local:', err);
                }
            }

            if (!creditoGuardado) {
                creditoGuardado = {
                    ...nuevoCredito,
                    id: 'cred_' + Date.now(),
                    created_at: new Date().toISOString()
                };
            }

            state.creditos.unshift(creditoGuardado);
            localStorage.setItem('vox_creditos_cache', JSON.stringify(state.creditos));

            closeNuevoCreditoModal();
            applyCreditosFilters();

            // Abrir automáticamente el modal con el snippet generado
            abrirModalSnippet(creditoGuardado);
        });
    }

    // -------------------------------------------------------------
    // MODAL: REGISTRAR PAGO MANUAL
    // -------------------------------------------------------------
    function abrirModalRegistrarPago(credito) {
        state.activeCredito = credito;

        const clienteEl = document.getElementById('pagoModalCliente');
        const progresoEl = document.getElementById('pagoModalProgreso');
        const idInput = document.getElementById('pagoCreditoId');
        const cuotaInput = document.getElementById('pagoNumeroCuota');
        const montoInput = document.getElementById('pagoMonto');
        const fechaInput = document.getElementById('pagoFecha');
        const pagoLiveCuotaBadge = document.getElementById('pagoLiveCuotaBadge');
        const pagoLiveMontoSugerido = document.getElementById('pagoLiveMontoSugerido');
        const pagoLiveStatusNext = document.getElementById('pagoLiveStatusNext');

        const siguienteCuota = (parseInt(credito.meses_pagados || 0, 10)) + 1;
        const totalMeses = parseInt(credito.total_meses || 8, 10);
        const isNextLiquidado = siguienteCuota >= totalMeses;

        if (clienteEl) clienteEl.textContent = `Pago: ${credito.cliente_nombre}`;
        if (progresoEl) progresoEl.textContent = `Abono de cuota mensual para ${credito.dominio_url}`;
        if (idInput) idInput.value = credito.id;
        if (cuotaInput) cuotaInput.value = siguienteCuota;
        if (montoInput) montoInput.value = credito.monto_mensual || 1000;
        if (fechaInput) fechaInput.value = new Date().toISOString().slice(0, 10);

        if (pagoLiveCuotaBadge) pagoLiveCuotaBadge.textContent = `Cuota ${siguienteCuota} de ${totalMeses}`;
        if (pagoLiveMontoSugerido) pagoLiveMontoSugerido.textContent = `$${(credito.monto_mensual || 1000).toLocaleString('es-MX')} MXN`;
        if (pagoLiveStatusNext) {
            pagoLiveStatusNext.textContent = isNextLiquidado ? 'Liquidado (100%)' : 'Sitio Activo';
            pagoLiveStatusNext.className = isNextLiquidado ? 'badge badge-accent' : 'badge badge-success';
        }

        if (registrarPagoModal) registrarPagoModal.style.display = 'flex';
        if (window.lucide) window.lucide.createIcons();
    }

    function closeRegistrarPagoModal() {
        if (registrarPagoModal) registrarPagoModal.style.display = 'none';
        state.activeCredito = null;
    }

    if (closeRegistrarPagoModalBtn) closeRegistrarPagoModalBtn.addEventListener('click', closeRegistrarPagoModal);
    if (cancelRegistrarPagoBtn) cancelRegistrarPagoBtn.addEventListener('click', closeRegistrarPagoModal);

    if (registrarPagoForm) {
        registrarPagoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!state.activeCredito) return;

            const credito = state.activeCredito;
            const creditoId = document.getElementById('pagoCreditoId').value;
            const numeroCuota = parseInt(document.getElementById('pagoNumeroCuota').value, 10);
            const monto = parseFloat(document.getElementById('pagoMonto').value);
            const fecha = document.getElementById('pagoFecha').value;
            const metodo = document.getElementById('pagoMetodo').value;
            const comprobante = document.getElementById('pagoComprobanteRef').value.trim();
            const notas = document.getElementById('pagoNotas').value.trim();

            const nuevoMesesPagados = Math.min(credito.total_meses, (parseInt(credito.meses_pagados || 0, 10)) + 1);
            const isLiquidado = nuevoMesesPagados >= credito.total_meses;
            const nuevoEstado = isLiquidado ? 'liquidado' : 'activo';

            const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();

            if (isConfigured) {
                try {
                    // 1. Insertar en historial de pagos
                    await window.VOX_SUPABASE.client
                        .from('historial_pagos_credito')
                        .insert([{
                            credito_id: creditoId,
                            numero_cuota: numeroCuota,
                            monto: monto,
                            fecha_pago: fecha,
                            metodo_pago: metodo,
                            comprobante_ref: comprobante,
                            notas: notas,
                            registrado_por: state.user ? state.user.email : 'admin'
                        }]);

                    // 2. Actualizar contador en creditos_sitios
                    await window.VOX_SUPABASE.client
                        .from('creditos_sitios')
                        .update({
                            meses_pagados: nuevoMesesPagados,
                            estado: nuevoEstado,
                            motivo_suspension: isLiquidado ? '' : (credito.estado === 'suspendido' ? '' : credito.motivo_suspension)
                        })
                        .eq('id', creditoId);

                } catch (err) {
                    console.error('Error al registrar pago en Supabase:', err);
                }
            }

            // Actualizar estado local
            credito.meses_pagados = nuevoMesesPagados;
            credito.estado = nuevoEstado;
            if (nuevoEstado === 'activo' || nuevoEstado === 'liquidado') {
                credito.motivo_suspension = '';
            }
            localStorage.setItem('vox_creditos_cache', JSON.stringify(state.creditos));

            closeRegistrarPagoModal();
            applyCreditosFilters();
            alert(`✅ Cuota ${numeroCuota} de $${monto.toLocaleString('es-MX')} MXN registrada con éxito para "${credito.cliente_nombre}".`);
        });
    }

    // -------------------------------------------------------------
    // ACCIÓN: TOGGLE KILLSWITCH (SUSPENDER / REACTIVAR)
    // -------------------------------------------------------------
    async function toggleKillswitchSitio(credito) {
        const isCurrentlySuspendido = credito.estado === 'suspendido';

        if (isCurrentlySuspendido) {
            // Confirmar reactivación
            const confirmar = confirm(`¿Deseas REACTIVAR el sitio web de "${credito.cliente_nombre}"?\nEl sitio volverá a cargar con normalidad para todos los visitantes.`);
            if (!confirmar) return;

            credito.estado = 'activo';
            credito.motivo_suspension = '';
        } else {
            // Solicitar motivo de suspensión
            const motivo = prompt(
                `⚠️ ATENCIÓN: Estás a punto de SUSPENDER el sitio web de "${credito.cliente_nombre}".\nLos visitantes verán la cortina de administración de VOX.\n\nEscribe el motivo de la suspensión:`,
                'Falta de pago de cuota mensual'
            );
            if (motivo === null) return; // Canceló

            credito.estado = 'suspendido';
            credito.motivo_suspension = motivo.trim() || 'Servicio pausado por administración';
        }

        const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();
        if (isConfigured) {
            try {
                await window.VOX_SUPABASE.client
                    .from('creditos_sitios')
                    .update({
                        estado: credito.estado,
                        motivo_suspension: credito.motivo_suspension
                    })
                    .eq('id', credito.id);
            } catch (err) {
                console.error('Error al actualizar estado killswitch:', err);
            }
        }

        localStorage.setItem('vox_creditos_cache', JSON.stringify(state.creditos));
        applyCreditosFilters();
    }

    // -------------------------------------------------------------
    // MODAL: SNIPPET DE CÓDIGO EMBEBIBLE
    // -------------------------------------------------------------
    function abrirModalSnippet(credito) {
        if (snippetClienteName) snippetClienteName.textContent = `${credito.cliente_nombre} (${credito.dominio_url})`;

        const snippetCode = `<!-- VOX Business Developer - Control de Licencia y Servicio -->\n<script src="https://voxbusinessdeveloper.com/assets/js/vox-license.js" data-vox-site="${credito.site_key}" defer></script>`;

        if (snippetCodeContent) snippetCodeContent.textContent = snippetCode;
        if (copySnippetBtnText) copySnippetBtnText.textContent = 'Copiar Código';

        if (snippetModal) snippetModal.style.display = 'flex';
    }

    function closeSnippetModal() {
        if (snippetModal) snippetModal.style.display = 'none';
    }

    if (closeSnippetModalBtn) closeSnippetModalBtn.addEventListener('click', closeSnippetModal);
    if (closeSnippetModalBtn2) closeSnippetModalBtn2.addEventListener('click', closeSnippetModal);

    if (btnCopySnippetCode) {
        btnCopySnippetCode.addEventListener('click', () => {
            if (!snippetCodeContent) return;
            const code = snippetCodeContent.textContent;
            navigator.clipboard.writeText(code).then(() => {
                if (copySnippetBtnText) copySnippetBtnText.textContent = '¡Copiado al Portapapeles!';
                setTimeout(() => {
                    if (copySnippetBtnText) copySnippetBtnText.textContent = 'Copiar Código';
                }, 2500);
            }).catch(() => {
                alert('No se pudo copiar automáticamente. Por favor selecciónalo manualmente.');
            });
        });
    }

    // -------------------------------------------------------------
    // MODAL: HISTORIAL DE PAGOS
    // -------------------------------------------------------------
    async function abrirModalHistorial(credito) {
        if (historialClienteName) historialClienteName.textContent = `Pagos: ${credito.cliente_nombre}`;
        if (historialProgresoSummary) historialProgresoSummary.textContent = `${credito.meses_pagados || 0} de ${credito.total_meses || 8} cuotas cubiertas ($${((credito.meses_pagados || 0) * (credito.monto_mensual || 1000)).toLocaleString('es-MX')} MXN)`;

        if (historialTableBody) historialTableBody.innerHTML = '';
        if (emptyHistorial) emptyHistorial.style.display = 'none';

        const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();
        let pagos = [];

        if (isConfigured) {
            try {
                const { data, error } = await window.VOX_SUPABASE.client
                    .from('historial_pagos_credito')
                    .select('*')
                    .eq('credito_id', credito.id)
                    .order('numero_cuota', { ascending: true });

                if (!error && data) pagos = data;
            } catch (err) {
                console.error('Error al obtener historial:', err);
            }
        }

        if (pagos.length === 0) {
            // Generar vista estimada si no hay registros individuales en Supabase
            const totalPagados = parseInt(credito.meses_pagados || 0, 10);
            if (totalPagados === 0) {
                if (emptyHistorial) emptyHistorial.style.display = 'block';
            } else {
                for (let i = 1; i <= totalPagados; i++) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><span class="badge badge-accent">Cuota ${i}</span></td>
                        <td>-</td>
                        <td><strong>$${(credito.monto_mensual || 1000).toLocaleString('es-MX')} MXN</strong></td>
                        <td>SPEI / Transferencia</td>
                        <td><small class="muted">Pago registrado</small></td>
                    `;
                    historialTableBody.appendChild(row);
                }
            }
        } else {
            pagos.forEach(p => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><span class="badge badge-accent">Cuota ${p.numero_cuota}</span></td>
                    <td>${p.fecha_pago || '-'}</td>
                    <td><strong>$${Number(p.monto).toLocaleString('es-MX')} MXN</strong></td>
                    <td>${p.metodo_pago ? p.metodo_pago.replace('_', ' ').toUpperCase() : 'SPEI'}</td>
                    <td><small class="muted">${escapeHtml(p.comprobante_ref || '-')}</small></td>
                `;
                historialTableBody.appendChild(row);
            });
        }

        if (historialPagosModal) historialPagosModal.style.display = 'flex';
    }

    if (closeHistorialModalBtn) {
        closeHistorialModalBtn.addEventListener('click', () => {
            if (historialPagosModal) historialPagosModal.style.display = 'none';
        });
    }

    // -------------------------------------------------------------
    // MODAL: ELIMINAR SITIO CON CONFIRMACIÓN DE CLAVE
    // -------------------------------------------------------------
    function abrirModalEliminarCredito(credito) {
        state.activeCredito = credito;

        if (deleteCreditoId) deleteCreditoId.value = credito.id;
        if (deleteClienteNombre) deleteClienteNombre.textContent = credito.cliente_nombre || 'Cliente';
        if (deleteDominioUrl) deleteDominioUrl.textContent = credito.dominio_url || 'dominio.com';
        if (deleteAdminPassword) {
            deleteAdminPassword.value = '';
            deleteAdminPassword.type = 'password';
        }
        if (toggleDeletePwdBtn) {
            toggleDeletePwdBtn.innerHTML = '<i data-lucide="eye" id="toggleDeletePwdIcon"></i>';
        }
        if (deleteCreditoAlert) {
            deleteCreditoAlert.style.display = 'none';
            deleteCreditoAlert.textContent = '';
        }
        if (btnConfirmarEliminacion) {
            btnConfirmarEliminacion.disabled = false;
            btnConfirmarEliminacion.innerHTML = '<i data-lucide="trash-2"></i> <span>Eliminar Permanentemente</span>';
        }

        if (eliminarCreditoModal) eliminarCreditoModal.style.display = 'flex';
        if (window.lucide) window.lucide.createIcons();

        // Focus en campo de contraseña
        setTimeout(() => {
            if (deleteAdminPassword) deleteAdminPassword.focus();
        }, 150);
    }

    function closeEliminarCreditoModal() {
        if (eliminarCreditoModal) eliminarCreditoModal.style.display = 'none';
        if (deleteAdminPassword) deleteAdminPassword.value = '';
        if (deleteCreditoAlert) deleteCreditoAlert.style.display = 'none';
        state.activeCredito = null;
    }

    if (closeEliminarCreditoModalBtn) closeEliminarCreditoModalBtn.addEventListener('click', closeEliminarCreditoModal);
    if (cancelEliminarCreditoBtn) cancelEliminarCreditoBtn.addEventListener('click', closeEliminarCreditoModal);

    // Toggle Mostrar/Ocultar contraseña en modal de eliminación
    if (toggleDeletePwdBtn && deleteAdminPassword) {
        toggleDeletePwdBtn.addEventListener('click', () => {
            const isPassword = deleteAdminPassword.type === 'password';
            deleteAdminPassword.type = isPassword ? 'text' : 'password';
            const newIconName = isPassword ? 'eye-off' : 'eye';
            toggleDeletePwdBtn.innerHTML = `<i data-lucide="${newIconName}" id="toggleDeletePwdIcon"></i>`;
            if (window.lucide) window.lucide.createIcons();
        });
    }

    // Procesar confirmación de eliminación
    if (eliminarCreditoForm) {
        eliminarCreditoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const creditoId = deleteCreditoId ? deleteCreditoId.value : null;
            const passwordIngresada = deleteAdminPassword ? deleteAdminPassword.value : '';

            if (!creditoId) {
                if (deleteCreditoAlert) {
                    deleteCreditoAlert.textContent = 'Error: no se especificó el sitio a eliminar.';
                    deleteCreditoAlert.style.display = 'block';
                }
                return;
            }

            if (!passwordIngresada) {
                if (deleteCreditoAlert) {
                    deleteCreditoAlert.textContent = 'Por favor ingresa tu contraseña de administrador.';
                    deleteCreditoAlert.style.display = 'block';
                }
                return;
            }

            if (deleteCreditoAlert) deleteCreditoAlert.style.display = 'none';
            if (btnConfirmarEliminacion) {
                btnConfirmarEliminacion.disabled = true;
                btnConfirmarEliminacion.innerHTML = '<span>Verificando y eliminando...</span>';
            }

            const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();

            if (isConfigured) {
                try {
                    // Validar contraseña del administrador autenticado contra Supabase Auth
                    const adminEmail = state.user && state.user.email ? state.user.email : '';
                    if (!adminEmail) {
                        throw new Error('Sesión de administrador no detectada. Vuelve a iniciar sesión.');
                    }

                    const { error: authError } = await window.VOX_SUPABASE.client.auth.signInWithPassword({
                        email: adminEmail,
                        password: passwordIngresada
                    });

                    if (authError) {
                        throw new Error('Contraseña incorrecta. No se tienen permisos para eliminar.');
                    }

                    // Contraseña válida: proceder a eliminar el registro de creditos_sitios
                    // Las filas en historial_pagos_credito se eliminan automáticamente por ON DELETE CASCADE
                    const { error: deleteError } = await window.VOX_SUPABASE.client
                        .from('creditos_sitios')
                        .delete()
                        .eq('id', creditoId);

                    if (deleteError) {
                        throw deleteError;
                    }

                    // Éxito en Supabase: actualizar estado local
                    state.creditos = state.creditos.filter(c => c.id !== creditoId);
                    localStorage.setItem('vox_creditos_cache', JSON.stringify(state.creditos));

                    closeEliminarCreditoModal();
                    applyCreditosFilters();

                } catch (err) {
                    console.error('Error al verificar/eliminar sitio:', err);
                    if (deleteCreditoAlert) {
                        deleteCreditoAlert.textContent = err.message || 'Error al eliminar el sitio.';
                        deleteCreditoAlert.style.display = 'block';
                    }
                    if (btnConfirmarEliminacion) {
                        btnConfirmarEliminacion.disabled = false;
                        btnConfirmarEliminacion.innerHTML = '<i data-lucide="trash-2"></i> <span>Eliminar Permanentemente</span>';
                        if (window.lucide) window.lucide.createIcons();
                    }
                }
            } else {
                // Modo Demo / Local
                state.creditos = state.creditos.filter(c => c.id !== creditoId);
                localStorage.setItem('vox_creditos_cache', JSON.stringify(state.creditos));

                closeEliminarCreditoModal();
                applyCreditosFilters();
            }
        });
    }

    // -------------------------------------------------------------
    // MODAL: ELIMINAR PROSPECTO / LEAD CON CONFIRMACIÓN DE CLAVE
    // -------------------------------------------------------------
    function abrirModalEliminarLead(leadId) {
        const lead = state.leads.find(l => String(l.id) === String(leadId));
        if (!lead) return;

        // Si el modal de ficha de lead está abierto, cerrarlo primero
        closeLeadModal();

        if (deleteLeadId) deleteLeadId.value = lead.id;
        if (deleteLeadNombre) deleteLeadNombre.textContent = lead.nombre || 'Prospecto';
        if (deleteLeadInfo) deleteLeadInfo.textContent = `${lead.correo} • ${lead.servicio || 'Servicio'}`;
        if (deleteLeadAdminPassword) {
            deleteLeadAdminPassword.value = '';
            deleteLeadAdminPassword.type = 'password';
        }
        if (toggleDeleteLeadPwdBtn) {
            toggleDeleteLeadPwdBtn.innerHTML = '<i data-lucide="eye" id="toggleDeleteLeadPwdIcon"></i>';
        }
        if (deleteLeadAlert) {
            deleteLeadAlert.style.display = 'none';
            deleteLeadAlert.textContent = '';
        }
        if (btnConfirmarEliminacionLead) {
            btnConfirmarEliminacionLead.disabled = false;
            btnConfirmarEliminacionLead.innerHTML = '<i data-lucide="trash-2"></i> <span>Eliminar Prospecto</span>';
        }

        if (eliminarLeadModal) eliminarLeadModal.style.display = 'flex';
        if (window.lucide) window.lucide.createIcons();

        setTimeout(() => {
            if (deleteLeadAdminPassword) deleteLeadAdminPassword.focus();
        }, 150);
    }

    function closeEliminarLeadModal() {
        if (eliminarLeadModal) eliminarLeadModal.style.display = 'none';
        if (deleteLeadAdminPassword) deleteLeadAdminPassword.value = '';
        if (deleteLeadAlert) deleteLeadAlert.style.display = 'none';
    }

    if (closeEliminarLeadModalBtn) closeEliminarLeadModalBtn.addEventListener('click', closeEliminarLeadModal);
    if (cancelEliminarLeadBtn) cancelEliminarLeadBtn.addEventListener('click', closeEliminarLeadModal);

    if (btnOpenDeleteLeadModal) {
        btnOpenDeleteLeadModal.addEventListener('click', () => {
            if (state.activeLead) {
                abrirModalEliminarLead(state.activeLead.id);
            }
        });
    }

    if (toggleDeleteLeadPwdBtn && deleteLeadAdminPassword) {
        toggleDeleteLeadPwdBtn.addEventListener('click', () => {
            const isPassword = deleteLeadAdminPassword.type === 'password';
            deleteLeadAdminPassword.type = isPassword ? 'text' : 'password';
            const newIconName = isPassword ? 'eye-off' : 'eye';
            toggleDeleteLeadPwdBtn.innerHTML = `<i data-lucide="${newIconName}" id="toggleDeleteLeadPwdIcon"></i>`;
            if (window.lucide) window.lucide.createIcons();
        });
    }

    if (eliminarLeadForm) {
        eliminarLeadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const leadId = deleteLeadId ? deleteLeadId.value : null;
            const passwordIngresada = deleteLeadAdminPassword ? deleteLeadAdminPassword.value : '';

            if (!leadId) {
                if (deleteLeadAlert) {
                    deleteLeadAlert.textContent = 'Error: no se especificó el prospecto a eliminar.';
                    deleteLeadAlert.style.display = 'block';
                }
                return;
            }

            if (!passwordIngresada) {
                if (deleteLeadAlert) {
                    deleteLeadAlert.textContent = 'Por favor ingresa tu contraseña de administrador.';
                    deleteLeadAlert.style.display = 'block';
                }
                return;
            }

            if (deleteLeadAlert) deleteLeadAlert.style.display = 'none';
            if (btnConfirmarEliminacionLead) {
                btnConfirmarEliminacionLead.disabled = true;
                btnConfirmarEliminacionLead.innerHTML = '<span>Verificando y eliminando...</span>';
            }

            const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();

            if (isConfigured) {
                try {
                    const adminEmail = state.user && state.user.email ? state.user.email : '';
                    if (!adminEmail) {
                        throw new Error('Sesión de administrador no detectada. Vuelve a iniciar sesión.');
                    }

                    const { error: authError } = await window.VOX_SUPABASE.client.auth.signInWithPassword({
                        email: adminEmail,
                        password: passwordIngresada
                    });

                    if (authError) {
                        throw new Error('Contraseña incorrecta. No se tienen permisos para eliminar.');
                    }

                    const { error: deleteError } = await window.VOX_SUPABASE.client
                        .from('leads')
                        .delete()
                        .eq('id', leadId);

                    if (deleteError) {
                        throw deleteError;
                    }

                    // Éxito en Supabase: actualizar estado local
                    state.leads = state.leads.filter(l => String(l.id) !== String(leadId));
                    localStorage.setItem('vox_leads_cache', JSON.stringify(state.leads));

                    closeEliminarLeadModal();
                    applyFilters();

                } catch (err) {
                    console.error('Error al verificar/eliminar prospecto:', err);
                    if (deleteLeadAlert) {
                        deleteLeadAlert.textContent = err.message || 'Error al eliminar el prospecto.';
                        deleteLeadAlert.style.display = 'block';
                    }
                    if (btnConfirmarEliminacionLead) {
                        btnConfirmarEliminacionLead.disabled = false;
                        btnConfirmarEliminacionLead.innerHTML = '<i data-lucide="trash-2"></i> <span>Eliminar Prospecto</span>';
                        if (window.lucide) window.lucide.createIcons();
                    }
                }
            } else {
                // Modo Demo / Local
                state.leads = state.leads.filter(l => String(l.id) !== String(leadId));
                localStorage.setItem('vox_leads_cache', JSON.stringify(state.leads));

                closeEliminarLeadModal();
                applyFilters();
            }
        });
    }

    // Helpers
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatEstadoLabel(estado) {
        const labels = {
            'nuevo': 'Nuevo',
            'en_revision': 'En Revisión',
            'contactado': 'Contactado',
            'cotizado': 'Cotizado',
            'cerrado': 'Cerrado / Ganado',
            'descartado': 'Descartado'
        };
        return labels[estado] || estado || 'Nuevo';
    }
});

