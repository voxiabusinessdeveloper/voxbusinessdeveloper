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
        currentView: 'pipeline', // 'pipeline', 'table', 'creditos', 'radar', 'analytics'
        statusFilter: 'all',
        searchTerm: '',
        charts: {},
        creditos: [],
        filteredCreditos: [],
        creditoFilter: 'all',
        activeCredito: null,
        radar: {
            sitios: [],
            sesiones: [],
            eventos: [],
            filteredSesiones: [],
            activeSessionId: null,
            siteFilter: 'all',
            periodFilter: 'all',
            visitorFilter: 'all',
            activeTab: 'sessions',
            heatmapPage: 'all',
            heatmapDevice: 'all'
        }
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
    const radarViewContainer = document.getElementById('radarViewContainer');

    const btnViewKanban = document.getElementById('btnViewKanban');
    const btnViewTable = document.getElementById('btnViewTable');
    const btnViewCreditos = document.getElementById('btnViewCreditos');
    const btnViewRadar = document.getElementById('btnViewRadar');
    const btnViewCharts = document.getElementById('btnViewCharts');
    const badgeCreditosAlert = document.getElementById('badgeCreditosAlert');
    const badgeOnlineNow = document.getElementById('badgeOnlineNow');

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

    // Modal Killswitch DOM Elements
    const killswitchModal = document.getElementById('killswitchModal');
    const closeKillswitchModalBtn = document.getElementById('closeKillswitchModalBtn');
    const cancelKillswitchBtn = document.getElementById('cancelKillswitchBtn');
    const killswitchForm = document.getElementById('killswitchForm');
    const killswitchCreditoId = document.getElementById('killswitchCreditoId');
    const killswitchTargetAction = document.getElementById('killswitchTargetAction');
    const killswitchClienteNombre = document.getElementById('killswitchClienteNombre');
    const killswitchDominioUrl = document.getElementById('killswitchDominioUrl');
    const killswitchMotivoInput = document.getElementById('killswitchMotivoInput');
    const killswitchSuspendGroup = document.getElementById('killswitchSuspendGroup');
    const killswitchReactivateNotice = document.getElementById('killswitchReactivateNotice');
    const killswitchModalTitle = document.getElementById('killswitchModalTitle');
    const killswitchModalDesc = document.getElementById('killswitchModalDesc');
    const killswitchStatusBadge = document.getElementById('killswitchStatusBadge');
    const btnConfirmarKillswitch = document.getElementById('btnConfirmarKillswitch');
    const btnConfirmarKillswitchText = document.getElementById('btnConfirmarKillswitchText');
    const killswitchHeaderWrap = document.getElementById('killswitchHeaderWrap');
    const killswitchIconBox = document.getElementById('killswitchIconBox');
    const killswitchHeaderIcon = document.getElementById('killswitchHeaderIcon');

    // Toast Notification System (Reemplazo profesional de alerts)
    const voxToastContainer = document.getElementById('voxToastContainer');

    function showToast(message, type = 'success', title = null) {
        if (!voxToastContainer) {
            console.log(`[Toast ${type}]`, message);
            return;
        }

        const toast = document.createElement('div');
        toast.className = `vox-toast toast-${type}`;

        let iconName = 'check-circle';
        let defaultTitle = 'Operación Exitosa';

        if (type === 'error') {
            iconName = 'alert-circle';
            defaultTitle = 'Atención';
        } else if (type === 'info') {
            iconName = 'info';
            defaultTitle = 'Información';
        }

        toast.innerHTML = `
            <div class="toast-icon">
                <i data-lucide="${iconName}"></i>
            </div>
            <div class="toast-content">
                <span class="toast-title">${title || defaultTitle}</span>
                <span class="toast-message">${escapeHtml(message)}</span>
            </div>
            <button class="toast-close" aria-label="Cerrar notificación">
                <i data-lucide="x" style="width: 14px; height: 14px;"></i>
            </button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        const dismissToast = () => {
            toast.classList.add('hiding');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        };

        if (closeBtn) closeBtn.addEventListener('click', dismissToast);

        voxToastContainer.appendChild(toast);
        if (window.lucide) window.lucide.createIcons();

        // Auto dismiss after 4.5s
        setTimeout(dismissToast, 4500);
    }

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
        fetchRadarData();
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
                .on('postgres_changes', { event: '*', schema: 'public', table: 'telemetria_sesiones' }, () => {
                    fetchRadarData();
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'telemetria_eventos' }, () => {
                    fetchRadarData();
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'telemetria_sitios' }, () => {
                    fetchRadarData();
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
        populateRadarSiteSelector();
    }

    // -------------------------------------------------------------
    // 3. CAMBIO DE VISTAS (Kanban, Tabla, Créditos, Radar, Gráficos)
    // -------------------------------------------------------------
    function switchView(viewName) {
        state.currentView = viewName;

        // Actualizar botones de topbar
        [btnViewKanban, btnViewTable, btnViewCreditos, btnViewRadar, btnViewCharts].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => item.classList.remove('active'));

        kanbanViewContainer.style.display = 'none';
        tableViewContainer.style.display = 'none';
        analyticsViewContainer.style.display = 'none';
        if (creditosViewContainer) creditosViewContainer.style.display = 'none';
        if (radarViewContainer) radarViewContainer.style.display = 'none';

        const leadsKpiGrid = document.getElementById('leadsKpiGrid');
        const leadsFilterBar = document.getElementById('leadsFilterBar');
        if (leadsKpiGrid) {
            leadsKpiGrid.style.display = (viewName === 'radar' || viewName === 'creditos') ? 'none' : '';
        }
        if (leadsFilterBar) {
            leadsFilterBar.style.display = (viewName === 'radar') ? 'none' : '';
        }

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
        } else if (viewName === 'radar') {
            if (btnViewRadar) btnViewRadar.classList.add('active');
            document.querySelector('.sidebar-nav .nav-item[data-view="radar"]')?.classList.add('active');
            if (radarViewContainer) radarViewContainer.style.display = 'flex';
            currentViewTitle.textContent = 'Radar & Tráfico Web Multi-Sitio (En Vivo)';
            renderRadar();
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
    if (btnViewRadar) btnViewRadar.addEventListener('click', () => switchView('radar'));
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
        else if (state.currentView === 'creditos') applyCreditosFilters();
        else if (state.currentView === 'radar') applyRadarFilters();
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

        // Renderizar Recorrido Web vinculado al Lead (VOX Radar)
        renderLeadRadarJourney(lead);

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

    refreshBtn.addEventListener('click', () => {
        fetchLeads();
        fetchCreditos();
        fetchRadarData();
        showToast('Datos de prospectos, créditos y radar actualizados.', 'info', 'Panel Sincronizado');
    });

    // Exportar Excel (.xlsx) con Formato Profesional
    exportCsvBtn.addEventListener('click', () => {
        if (!state.filteredLeads || state.filteredLeads.length === 0) {
            showToast('No hay prospectos en la vista actual para exportar.', 'info', 'Sin Registros');
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
                        <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
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
                        <span>Ver Pagos (${totalMeses}/${totalMeses})</span>
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
            
            <div class="credito-card-danger-footer">
                <button class="btn-delete-credito-text" data-action="eliminar-credito" data-id="${credito.id}">
                    <i data-lucide="trash-2" style="width: 13px; height: 13px;"></i>
                    <span>Eliminar Registro y Licencia</span>
                </button>
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

        card.querySelectorAll('[data-action="eliminar-credito"]').forEach(btn => {
            btn.addEventListener('click', () => {
                abrirModalEliminarCredito(credito);
            });
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

            const saveBtn = document.getElementById('saveNuevoCreditoBtn');
            const cliente_nombre = document.getElementById('credClienteNombre').value.trim();
            const dominio_url = document.getElementById('credDominioUrl').value.trim();
            const rawTelefono = document.getElementById('credTelefono').value.trim();
            const codigoPaisEl = document.getElementById('credCodigoPais');
            const codigoPais = codigoPaisEl ? codigoPaisEl.value : '+52';
            const contacto_telefono = rawTelefono ? `${codigoPais} ${rawTelefono}`.trim() : '';
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
            if (!isConfigured) {
                showToast('No se puede crear el crédito: la conexión con Supabase no está configurada.', 'error', 'Error de Base de Datos');
                return;
            }

            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<span>Guardando en base de datos...</span>';
            }

            let creditoGuardado = null;

            try {
                const { data, error } = await window.VOX_SUPABASE.client
                    .from('creditos_sitios')
                    .insert([nuevoCredito])
                    .select();

                if (error) {
                    console.error('Error insertando crédito en Supabase:', error);
                    showToast('Error al guardar crédito en Supabase: ' + (error.message || 'Fallo de inserción'), 'error', 'Error al Crear Crédito');
                    if (saveBtn) {
                        saveBtn.disabled = false;
                        saveBtn.innerHTML = '<i data-lucide="check"></i> <span>Activar y Generar Licencia</span>';
                        if (window.lucide) window.lucide.createIcons();
                    }
                    return;
                }

                if (data && data[0]) {
                    creditoGuardado = data[0];
                } else {
                    throw new Error('Supabase no devolvió el registro insertado.');
                }

            } catch (err) {
                console.error('Excepción al guardar crédito en Supabase:', err);
                showToast('Error de conexión con Supabase: ' + (err.message || 'No se pudo guardar'), 'error', 'Error al Crear Crédito');
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = '<i data-lucide="check"></i> <span>Activar y Generar Licencia</span>';
                    if (window.lucide) window.lucide.createIcons();
                }
                return;
            }

            // Inserción confirmada en Supabase: actualizar estado local
            state.creditos.unshift(creditoGuardado);
            localStorage.setItem('vox_creditos_cache', JSON.stringify(state.creditos));

            // Disparar notificación por correo a vox.iabusinessdeveloper@gmail.com
            if (window.LeadService && typeof window.LeadService.sendCreditoNotification === 'function') {
                window.LeadService.sendCreditoNotification(creditoGuardado).then((res) => {
                    if (res && res.success) {
                        showToast('Correo de alerta enviado a vox.iabusinessdeveloper@gmail.com', 'success');
                    }
                }).catch(err => console.error('Error al disparar notificación:', err));
            }

            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i data-lucide="check"></i> <span>Activar y Generar Licencia</span>';
                if (window.lucide) window.lucide.createIcons();
            }

            closeNuevoCreditoModal();
            applyCreditosFilters();
            showToast(`Crédito creado y registrado con éxito para "${creditoGuardado.cliente_nombre}".`, 'success', 'Crédito Creado');

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

            const confirmarPagoBtn = document.getElementById('btnConfirmarPago');
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
            if (!isConfigured) {
                showToast('No se puede registrar el pago: la conexión con Supabase no está configurada.', 'error', 'Error de Base de Datos');
                return;
            }

            if (confirmarPagoBtn) {
                confirmarPagoBtn.disabled = true;
                confirmarPagoBtn.innerHTML = '<span>Registrando pago en base de datos...</span>';
            }

            try {
                // 1. Insertar en historial de pagos
                const { error: insertError } = await window.VOX_SUPABASE.client
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

                if (insertError) {
                    console.error('Error insertando pago en Supabase:', insertError);
                    showToast('Error al registrar pago en Supabase: ' + (insertError.message || 'Fallo de inserción'), 'error', 'Error al Registrar Pago');
                    if (confirmarPagoBtn) {
                        confirmarPagoBtn.disabled = false;
                        confirmarPagoBtn.innerHTML = '<i data-lucide="check"></i> <span>Confirmar y Guardar Pago</span>';
                        if (window.lucide) window.lucide.createIcons();
                    }
                    return;
                }

                // 2. Actualizar contador en creditos_sitios
                const { error: updateError } = await window.VOX_SUPABASE.client
                    .from('creditos_sitios')
                    .update({
                        meses_pagados: nuevoMesesPagados,
                        estado: nuevoEstado,
                        motivo_suspension: isLiquidado ? '' : (credito.estado === 'suspendido' ? '' : credito.motivo_suspension)
                    })
                    .eq('id', creditoId);

                if (updateError) {
                    console.error('Error actualizando crédito en Supabase tras pago:', updateError);
                    showToast('El pago se guardó pero falló actualizar el estado del crédito: ' + (updateError.message || 'Error de actualización'), 'error', 'Error de Actualización');
                    if (confirmarPagoBtn) {
                        confirmarPagoBtn.disabled = false;
                        confirmarPagoBtn.innerHTML = '<i data-lucide="check"></i> <span>Confirmar y Guardar Pago</span>';
                        if (window.lucide) window.lucide.createIcons();
                    }
                    return;
                }

            } catch (err) {
                console.error('Excepción al registrar pago en Supabase:', err);
                showToast('Error de conexión al registrar pago: ' + (err.message || 'Error inesperado'), 'error', 'Error al Registrar Pago');
                if (confirmarPagoBtn) {
                    confirmarPagoBtn.disabled = false;
                    confirmarPagoBtn.innerHTML = '<i data-lucide="check"></i> <span>Confirmar y Guardar Pago</span>';
                    if (window.lucide) window.lucide.createIcons();
                }
                return;
            }

            // Actualizar estado local únicamente tras validación y éxito en Supabase
            credito.meses_pagados = nuevoMesesPagados;
            credito.estado = nuevoEstado;
            if (nuevoEstado === 'activo' || nuevoEstado === 'liquidado') {
                credito.motivo_suspension = '';
            }
            localStorage.setItem('vox_creditos_cache', JSON.stringify(state.creditos));

            if (confirmarPagoBtn) {
                confirmarPagoBtn.disabled = false;
                confirmarPagoBtn.innerHTML = '<i data-lucide="check"></i> <span>Confirmar y Guardar Pago</span>';
                if (window.lucide) window.lucide.createIcons();
            }

            closeRegistrarPagoModal();
            applyCreditosFilters();
            showToast(`Cuota ${numeroCuota} de $${monto.toLocaleString('es-MX')} MXN registrada para "${credito.cliente_nombre}".`, 'success', 'Pago Confirmado');
        });
    }

    // -------------------------------------------------------------
    // ACCIÓN: CONTROL KILLSWITCH MEDIANTE MODAL PROFESIONAL
    // -------------------------------------------------------------
    function toggleKillswitchSitio(credito) {
        state.activeCredito = credito;
        const isCurrentlySuspendido = credito.estado === 'suspendido';

        if (killswitchCreditoId) killswitchCreditoId.value = credito.id;
        if (killswitchTargetAction) killswitchTargetAction.value = isCurrentlySuspendido ? 'reactivar' : 'suspender';
        if (killswitchClienteNombre) killswitchClienteNombre.textContent = credito.cliente_nombre || 'Cliente';
        if (killswitchDominioUrl) killswitchDominioUrl.textContent = credito.dominio_url || 'dominio.com';

        if (isCurrentlySuspendido) {
            // Configurar modal para Reactivar
            if (killswitchModalTitle) killswitchModalTitle.textContent = 'Reactivar Sitio Web';
            if (killswitchModalDesc) killswitchModalDesc.textContent = 'Restablecer el acceso público de la página web.';
            if (killswitchStatusBadge) {
                killswitchStatusBadge.textContent = 'Reactivación de Servicio';
                killswitchStatusBadge.className = 'badge badge-success';
                killswitchStatusBadge.style.background = 'rgba(46, 204, 113, 0.15)';
                killswitchStatusBadge.style.color = 'var(--green-tag)';
                killswitchStatusBadge.style.borderColor = 'rgba(46, 204, 113, 0.3)';
            }
            if (killswitchIconBox) {
                killswitchIconBox.style.background = 'rgba(46, 204, 113, 0.12)';
                killswitchIconBox.style.borderColor = 'rgba(46, 204, 113, 0.3)';
                killswitchIconBox.style.color = 'var(--green-tag)';
            }
            if (killswitchHeaderIcon) {
                killswitchHeaderIcon.setAttribute('data-lucide', 'power');
            }
            if (killswitchSuspendGroup) killswitchSuspendGroup.style.display = 'none';
            if (killswitchReactivateNotice) killswitchReactivateNotice.style.display = 'block';
            if (btnConfirmarKillswitch) {
                btnConfirmarKillswitch.disabled = false;
                btnConfirmarKillswitch.className = 'btn btn-primary';
                btnConfirmarKillswitch.style.background = 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';
                btnConfirmarKillswitch.innerHTML = '<i data-lucide="power"></i><span id="btnConfirmarKillswitchText">Reactivar Sitio Ahora</span>';
            }
        } else {
            // Configurar modal para Suspender
            if (killswitchModalTitle) killswitchModalTitle.textContent = 'Suspender Sitio Web (Killswitch)';
            if (killswitchModalDesc) killswitchModalDesc.textContent = 'Bloquear el sitio web con la cortina de administración de VOX.';
            if (killswitchStatusBadge) {
                killswitchStatusBadge.textContent = 'Suspensión por Falta de Pago';
                killswitchStatusBadge.className = 'badge badge-danger';
                killswitchStatusBadge.style.background = 'rgba(231, 76, 60, 0.15)';
                killswitchStatusBadge.style.color = '#ff6b6b';
                killswitchStatusBadge.style.borderColor = 'rgba(231, 76, 60, 0.3)';
            }
            if (killswitchIconBox) {
                killswitchIconBox.style.background = 'rgba(231, 76, 60, 0.12)';
                killswitchIconBox.style.borderColor = 'rgba(231, 76, 60, 0.3)';
                killswitchIconBox.style.color = 'var(--red-tag)';
            }
            if (killswitchHeaderIcon) {
                killswitchHeaderIcon.setAttribute('data-lucide', 'shield-alert');
            }
            if (killswitchSuspendGroup) killswitchSuspendGroup.style.display = 'block';
            if (killswitchReactivateNotice) killswitchReactivateNotice.style.display = 'none';
            if (killswitchMotivoInput) killswitchMotivoInput.value = 'Falta de pago de cuota mensual';
            if (btnConfirmarKillswitch) {
                btnConfirmarKillswitch.disabled = false;
                btnConfirmarKillswitch.className = 'btn btn-danger-submit';
                btnConfirmarKillswitch.style.background = '';
                btnConfirmarKillswitch.innerHTML = '<i data-lucide="power"></i><span id="btnConfirmarKillswitchText">Aplicar Bloqueo Killswitch</span>';
            }
        }

        if (killswitchModal) killswitchModal.style.display = 'flex';
        if (window.lucide) window.lucide.createIcons();
    }

    function closeKillswitchModal() {
        if (killswitchModal) killswitchModal.style.display = 'none';
        state.activeCredito = null;
    }

    if (closeKillswitchModalBtn) closeKillswitchModalBtn.addEventListener('click', closeKillswitchModal);
    if (cancelKillswitchBtn) cancelKillswitchBtn.addEventListener('click', closeKillswitchModal);

    if (killswitchForm) {
        killswitchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const creditoId = killswitchCreditoId ? killswitchCreditoId.value : null;
            const targetAction = killswitchTargetAction ? killswitchTargetAction.value : 'suspender';
            const credito = state.creditos.find(c => c.id === creditoId);
            if (!credito) {
                closeKillswitchModal();
                return;
            }

            if (btnConfirmarKillswitch) {
                btnConfirmarKillswitch.disabled = true;
                btnConfirmarKillswitch.innerHTML = '<span>Procesando...</span>';
            }

            try {
                if (targetAction === 'reactivar') {
                    credito.estado = 'activo';
                    credito.motivo_suspension = '';
                } else {
                    const motivo = killswitchMotivoInput ? killswitchMotivoInput.value.trim() : '';
                    credito.estado = 'suspendido';
                    credito.motivo_suspension = motivo || 'Servicio pausado por administración';
                }

                const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();
                if (isConfigured) {
                    try {
                        const { error } = await window.VOX_SUPABASE.client
                            .from('creditos_sitios')
                            .update({
                                estado: credito.estado,
                                motivo_suspension: credito.motivo_suspension
                            })
                            .eq('id', credito.id);
                        if (error) console.error('Error al actualizar estado killswitch:', error);
                    } catch (err) {
                        console.error('Error de conexión al actualizar estado killswitch:', err);
                    }
                }

                localStorage.setItem('vox_creditos_cache', JSON.stringify(state.creditos));
                applyCreditosFilters();

                if (targetAction === 'reactivar') {
                    showToast(`El sitio de "${credito.cliente_nombre}" ha sido reactivado con éxito.`, 'success', 'Sitio Online');
                } else {
                    showToast(`El sitio de "${credito.cliente_nombre}" ha sido bloqueado correctamente.`, 'error', 'Sitio Suspendido');
                }
            } finally {
                closeKillswitchModal();
                if (btnConfirmarKillswitch) {
                    btnConfirmarKillswitch.disabled = false;
                }
            }
        });
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
                showToast('Código de integración copiado al portapapeles.', 'info', 'Código Copiado');
                setTimeout(() => {
                    if (copySnippetBtnText) copySnippetBtnText.textContent = 'Copiar Código';
                }, 2500);
            }).catch(() => {
                showToast('No se pudo copiar automáticamente. Por favor selecciónalo manualmente.', 'error', 'Error al Copiar');
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

    // -------------------------------------------------------------
    // 11. LÓGICA DEL MÓDULO RADAR & TRÁFICO WEB MULTI-SITIO
    // -------------------------------------------------------------
    const radarSiteSelect = document.getElementById('radarSiteSelect');
    const radarPeriodSelect = document.getElementById('radarPeriodSelect');
    const radarVisitorFilterSelect = document.getElementById('radarVisitorFilterSelect');
    const btnRadarViewScript = document.getElementById('btnRadarViewScript');
    const btnOpenNuevoSitioMonitoreoModal = document.getElementById('btnOpenNuevoSitioMonitoreoModal');

    const nuevoSitioMonitoreoModal = document.getElementById('nuevoSitioMonitoreoModal');
    const closeNuevoSitioMonitoreoBtn = document.getElementById('closeNuevoSitioMonitoreoBtn');
    const cancelNuevoSitioMonitoreoBtn = document.getElementById('cancelNuevoSitioMonitoreoBtn');
    const nuevoSitioMonitoreoForm = document.getElementById('nuevoSitioMonitoreoForm');

    const btnRadarTabSessions = document.getElementById('btnRadarTabSessions');
    const btnRadarTabHeatmap = document.getElementById('btnRadarTabHeatmap');
    const radarSessionsTab = document.getElementById('radarSessionsTab');
    const radarHeatmapTab = document.getElementById('radarHeatmapTab');

    const radarSessionsList = document.getElementById('radarSessionsList');
    const emptyRadarSessions = document.getElementById('emptyRadarSessions');
    const radarSessionsCountLabel = document.getElementById('radarSessionsCountLabel');
    const radarVisitorDetailHeader = document.getElementById('radarVisitorDetailHeader');
    const radarVisitorTimelineBody = document.getElementById('radarVisitorTimelineBody');

    const heatmapPageSelect = document.getElementById('heatmapPageSelect');
    const heatmapDeviceSelect = document.getElementById('heatmapDeviceSelect');
    const heatmapDotsContainer = document.getElementById('heatmapDotsContainer');
    const radarTopPagesBody = document.getElementById('radarTopPagesBody');
    const radarTopElementsBody = document.getElementById('radarTopElementsBody');

    const LOCAL_SESSIONS_CACHE = 'vox_telemetry_sessions_cache';
    const LOCAL_EVENTS_CACHE = 'vox_telemetry_events_cache';
    const LOCAL_SITIOS_CACHE = 'vox_telemetry_sitios_cache';
    const ONLINE_THRESHOLD_MS = 2.5 * 60 * 1000; // 2.5 minutos para considerar Online Ahora

    function isSessionOnline(session) {
        if (!session || !session.last_seen_at) return false;
        return (Date.now() - new Date(session.last_seen_at).getTime()) <= ONLINE_THRESHOLD_MS;
    }

    function getSiteDisplayName(siteKey) {
        if (!siteKey || siteKey === 'vox_site_official') {
            return 'VOX Oficial (voxbusinessdeveloper.com)';
        }
        const matchCred = state.creditos.find(c => c.site_key === siteKey);
        if (matchCred) {
            return `${matchCred.cliente_nombre} (${matchCred.dominio_url})`;
        }
        const matchMon = state.radar.sitios.find(s => s.site_key === siteKey);
        if (matchMon) {
            return `${matchMon.nombre_sitio} (${matchMon.dominio_url})`;
        }
        return siteKey;
    }

    function seedDemoRadarIfNeeded() {
        try {
            const existingSessions = JSON.parse(localStorage.getItem(LOCAL_SESSIONS_CACHE) || '[]');
            if (existingSessions.length > 0) return;

            const now = Date.now();
            const demoSitios = [
                {
                    id: 'mon_demo_1',
                    site_key: 'vox_mon_torreaura2026',
                    nombre_sitio: 'Torre Aura Residencial',
                    dominio_url: 'https://torreaura.mx',
                    cliente_nombre: 'Desarrollos Aura (Contado)',
                    activo: true,
                    notas: 'Landing page de preventa inmobiliaria'
                }
            ];
            localStorage.setItem(LOCAL_SITIOS_CACHE, JSON.stringify(demoSitios));

            const demoSessions = [
                {
                    session_id: 'vsess_demo_live_1',
                    visitor_id: 'vusr_alejandro_01',
                    site_key: 'vox_site_official',
                    dominio: 'voxbusinessdeveloper.com',
                    started_at: new Date(now - 220 * 1000).toISOString(),
                    last_seen_at: new Date(now - 25 * 1000).toISOString(),
                    duration_seconds: 195,
                    max_scroll_pct: 100,
                    entry_url: '/',
                    current_url: '/servicios/branding.html',
                    referrer: 'Instagram',
                    utm_source: 'instagram',
                    utm_medium: 'reels',
                    utm_campaign: 'lanzamiento_vox',
                    device_type: 'mobile',
                    os: 'iOS',
                    browser: 'Safari',
                    screen_res: '390x844',
                    language: 'es-MX',
                    timezone: 'America/Mexico_City',
                    page_views_count: 3,
                    clicks_count: 6,
                    whatsapp_clicks: 1,
                    form_interacted: true,
                    converted_to_lead: true,
                    lead_nombre: 'Alejandro Morales',
                    lead_correo: 'amorales@vanguardia.mx'
                },
                {
                    session_id: 'vsess_demo_live_2',
                    visitor_id: 'vusr_arquitectura_89',
                    site_key: 'vox_site_official',
                    dominio: 'voxbusinessdeveloper.com',
                    started_at: new Date(now - 95 * 1000).toISOString(),
                    last_seen_at: new Date(now - 12 * 1000).toISOString(),
                    duration_seconds: 83,
                    max_scroll_pct: 75,
                    entry_url: '/servicios/arquitectura.html',
                    current_url: '/servicios/arquitectura.html',
                    referrer: 'Google Search',
                    utm_source: 'google',
                    utm_medium: 'cpc',
                    utm_campaign: 'renders_3d',
                    device_type: 'desktop',
                    os: 'macOS',
                    browser: 'Chrome',
                    screen_res: '1728x1117',
                    language: 'es-MX',
                    timezone: 'America/Mexico_City',
                    page_views_count: 2,
                    clicks_count: 4,
                    whatsapp_clicks: 1,
                    form_interacted: true,
                    converted_to_lead: false,
                    lead_nombre: '',
                    lead_correo: ''
                },
                {
                    session_id: 'vsess_demo_ext_3',
                    visitor_id: 'vusr_dental_44',
                    site_key: 'vox_site_9f8a2b3c4d5e6f7a',
                    dominio: 'dentalmendoza.com',
                    started_at: new Date(now - 1800 * 1000).toISOString(),
                    last_seen_at: new Date(now - 1650 * 1000).toISOString(),
                    duration_seconds: 150,
                    max_scroll_pct: 100,
                    entry_url: '/',
                    current_url: '/#citas',
                    referrer: 'Facebook',
                    utm_source: 'fb_ads',
                    utm_medium: 'social',
                    utm_campaign: 'blanqueamiento',
                    device_type: 'mobile',
                    os: 'Android',
                    browser: 'Chrome',
                    screen_res: '412x915',
                    language: 'es-MX',
                    timezone: 'America/Merida',
                    page_views_count: 2,
                    clicks_count: 5,
                    whatsapp_clicks: 2,
                    form_interacted: false,
                    converted_to_lead: false,
                    lead_nombre: '',
                    lead_correo: ''
                },
                {
                    session_id: 'vsess_demo_ext_4',
                    visitor_id: 'vusr_aura_12',
                    site_key: 'vox_mon_torreaura2026',
                    dominio: 'torreaura.mx',
                    started_at: new Date(now - 3400 * 1000).toISOString(),
                    last_seen_at: new Date(now - 3190 * 1000).toISOString(),
                    duration_seconds: 210,
                    max_scroll_pct: 75,
                    entry_url: '/',
                    current_url: '/#departamentos',
                    referrer: 'Google Search',
                    utm_source: '',
                    utm_medium: '',
                    utm_campaign: '',
                    device_type: 'desktop',
                    os: 'Windows',
                    browser: 'Edge',
                    screen_res: '1920x1080',
                    language: 'es-MX',
                    timezone: 'America/Mexico_City',
                    page_views_count: 2,
                    clicks_count: 4,
                    whatsapp_clicks: 1,
                    form_interacted: true,
                    converted_to_lead: false,
                    lead_nombre: '',
                    lead_correo: ''
                }
            ];

            const demoEvents = [
                // Eventos de Alejandro Morales (Convertido en Lead)
                {
                    id: 'ev_101',
                    created_at: new Date(now - 220 * 1000).toISOString(),
                    session_id: 'vsess_demo_live_1',
                    visitor_id: 'vusr_alejandro_01',
                    site_key: 'vox_site_official',
                    event_type: 'pageview',
                    page_url: 'https://voxbusinessdeveloper.com/',
                    page_path: '/',
                    page_title: 'VOX Business Developer | Inicio',
                    section_id: 'inicio',
                    element_text: 'Entró a página principal (/) desde Instagram',
                    scroll_pct: 0
                },
                {
                    id: 'ev_102',
                    created_at: new Date(now - 190 * 1000).toISOString(),
                    session_id: 'vsess_demo_live_1',
                    visitor_id: 'vusr_alejandro_01',
                    site_key: 'vox_site_official',
                    event_type: 'section_view',
                    page_path: '/',
                    section_id: 'servicios',
                    element_text: 'Vio sección #servicios (Soluciones Integrales VOX)'
                },
                {
                    id: 'ev_103',
                    created_at: new Date(now - 165 * 1000).toISOString(),
                    session_id: 'vsess_demo_live_1',
                    visitor_id: 'vusr_alejandro_01',
                    site_key: 'vox_site_official',
                    event_type: 'scroll_milestone',
                    page_path: '/',
                    scroll_pct: 50,
                    element_text: 'Alcanzó el 50% de scroll en /'
                },
                {
                    id: 'ev_104',
                    created_at: new Date(now - 140 * 1000).toISOString(),
                    session_id: 'vsess_demo_live_1',
                    visitor_id: 'vusr_alejandro_01',
                    site_key: 'vox_site_official',
                    event_type: 'click',
                    page_path: '/',
                    section_id: 'servicios',
                    element_tag: 'a',
                    element_text: 'Branding y Desarrollo de Marca',
                    element_href: '/servicios/branding.html',
                    click_x_pct: 62.4,
                    click_y_pct: 38.5
                },
                {
                    id: 'ev_105',
                    created_at: new Date(now - 135 * 1000).toISOString(),
                    session_id: 'vsess_demo_live_1',
                    visitor_id: 'vusr_alejandro_01',
                    site_key: 'vox_site_official',
                    event_type: 'pageview',
                    page_path: '/servicios/branding.html',
                    page_title: 'Branding Corporativo | VOX',
                    element_text: 'Navegó a /servicios/branding.html'
                },
                {
                    id: 'ev_106',
                    created_at: new Date(now - 80 * 1000).toISOString(),
                    session_id: 'vsess_demo_live_1',
                    visitor_id: 'vusr_alejandro_01',
                    site_key: 'vox_site_official',
                    event_type: 'form_start',
                    page_path: '/',
                    section_id: 'contacto',
                    element_tag: 'form',
                    element_text: 'Inició llenado de formulario (campo: nombre)',
                    click_x_pct: 48.2,
                    click_y_pct: 84.1
                },
                {
                    id: 'ev_107',
                    created_at: new Date(now - 35 * 1000).toISOString(),
                    session_id: 'vsess_demo_live_1',
                    visitor_id: 'vusr_alejandro_01',
                    site_key: 'vox_site_official',
                    event_type: 'form_submit',
                    page_path: '/',
                    section_id: 'contacto',
                    element_tag: 'form',
                    element_text: 'Lead Convertido: Alejandro Morales (Branding)',
                    click_x_pct: 51.0,
                    click_y_pct: 88.6
                },
                {
                    id: 'ev_108',
                    created_at: new Date(now - 25 * 1000).toISOString(),
                    session_id: 'vsess_demo_live_1',
                    visitor_id: 'vusr_alejandro_01',
                    site_key: 'vox_site_official',
                    event_type: 'cta_whatsapp',
                    page_path: '/',
                    section_id: 'contacto',
                    element_tag: 'a',
                    element_text: 'Botón Flotante WhatsApp Directo',
                    click_x_pct: 92.5,
                    click_y_pct: 91.2
                },
                // Eventos de Visitante #2 (Arquitectura)
                {
                    id: 'ev_201',
                    created_at: new Date(now - 95 * 1000).toISOString(),
                    session_id: 'vsess_demo_live_2',
                    visitor_id: 'vusr_arquitectura_89',
                    site_key: 'vox_site_official',
                    event_type: 'pageview',
                    page_path: '/servicios/arquitectura.html',
                    page_title: 'Arquitectura y Visualización 3D | VOX',
                    element_text: 'Entró a /servicios/arquitectura.html desde Google Search'
                },
                {
                    id: 'ev_202',
                    created_at: new Date(now - 60 * 1000).toISOString(),
                    session_id: 'vsess_demo_live_2',
                    visitor_id: 'vusr_arquitectura_89',
                    site_key: 'vox_site_official',
                    event_type: 'scroll_milestone',
                    page_path: '/servicios/arquitectura.html',
                    scroll_pct: 75,
                    element_text: 'Alcanzó el 75% de la página'
                },
                {
                    id: 'ev_203',
                    created_at: new Date(now - 35 * 1000).toISOString(),
                    session_id: 'vsess_demo_live_2',
                    visitor_id: 'vusr_arquitectura_89',
                    site_key: 'vox_site_official',
                    event_type: 'click',
                    page_path: '/servicios/arquitectura.html',
                    section_id: 'gallery',
                    element_tag: 'button',
                    element_text: 'Ver Portafolio de Renders 3D',
                    click_x_pct: 34.8,
                    click_y_pct: 54.2
                },
                {
                    id: 'ev_204',
                    created_at: new Date(now - 12 * 1000).toISOString(),
                    session_id: 'vsess_demo_live_2',
                    visitor_id: 'vusr_arquitectura_89',
                    site_key: 'vox_site_official',
                    event_type: 'cta_whatsapp',
                    page_path: '/servicios/arquitectura.html',
                    section_id: 'cta',
                    element_tag: 'a',
                    element_text: 'Cotizar por WhatsApp',
                    click_x_pct: 58.1,
                    click_y_pct: 82.4
                },
                // Eventos Sitio Externo: Clínica Dental
                {
                    id: 'ev_301',
                    created_at: new Date(now - 1800 * 1000).toISOString(),
                    session_id: 'vsess_demo_ext_3',
                    visitor_id: 'vusr_dental_44',
                    site_key: 'vox_site_9f8a2b3c4d5e6f7a',
                    event_type: 'pageview',
                    page_path: '/',
                    page_title: 'Clínica Dental Dra. Sofía Mendoza',
                    element_text: 'Entró a dentalmendoza.com desde Facebook'
                },
                {
                    id: 'ev_302',
                    created_at: new Date(now - 1650 * 1000).toISOString(),
                    session_id: 'vsess_demo_ext_3',
                    visitor_id: 'vusr_dental_44',
                    site_key: 'vox_site_9f8a2b3c4d5e6f7a',
                    event_type: 'cta_whatsapp',
                    page_path: '/',
                    section_id: 'citas',
                    element_tag: 'a',
                    element_text: 'Agendar Cita Dental por WhatsApp',
                    click_x_pct: 50.2,
                    click_y_pct: 76.0
                },
                // Eventos Sitio Monitoreo: Torre Aura
                {
                    id: 'ev_401',
                    created_at: new Date(now - 3400 * 1000).toISOString(),
                    session_id: 'vsess_demo_ext_4',
                    visitor_id: 'vusr_aura_12',
                    site_key: 'vox_mon_torreaura2026',
                    event_type: 'pageview',
                    page_path: '/',
                    page_title: 'Torre Aura Residencial | Preventa',
                    element_text: 'Entró a torreaura.mx desde Google Search'
                },
                {
                    id: 'ev_402',
                    created_at: new Date(now - 3190 * 1000).toISOString(),
                    session_id: 'vsess_demo_ext_4',
                    visitor_id: 'vusr_aura_12',
                    site_key: 'vox_mon_torreaura2026',
                    event_type: 'form_abandon',
                    page_path: '/',
                    section_id: 'contacto',
                    element_tag: 'form',
                    element_text: 'Abandonó formulario de cotización sin enviar',
                    click_x_pct: 44.5,
                    click_y_pct: 80.3
                }
            ];

            localStorage.setItem(LOCAL_SESSIONS_CACHE, JSON.stringify(demoSessions));
            localStorage.setItem(LOCAL_EVENTS_CACHE, JSON.stringify(demoEvents));
        } catch (e) {}

        // Semilla histórica para Análisis Semanal (7d), Quincenal (15d) y Mensual (30d)
        try {
            const PERIOD_SEED_KEY = 'vox_telemetry_seed_periods_v1';
            if (!localStorage.getItem(PERIOD_SEED_KEY)) {
                const now = Date.now();
                const DAY_MS = 24 * 3600 * 1000;
                const currentSessions = JSON.parse(localStorage.getItem(LOCAL_SESSIONS_CACHE) || '[]');
                const existingIds = new Set(currentSessions.map(s => s.session_id));

                const historicalConfig = [
                    { dayOffset: 1, site: 'vox_site_official', dom: 'voxbusinessdeveloper.com', ref: 'Instagram', dev: 'mobile', os: 'iOS', dur: 210, scroll: 100, wa: 1, form: true, lead: true, name: 'Valeria Castañeda', mail: 'vcastaneda@luxehomes.mx', url: '/servicios/interiorismo.html' },
                    { dayOffset: 1, site: 'vox_site_official', dom: 'voxbusinessdeveloper.com', ref: 'Google Search', dev: 'desktop', os: 'Windows', dur: 145, scroll: 75, wa: 1, form: false, lead: false, url: '/servicios/desarrollo.html' },
                    { dayOffset: 2, site: 'vox_site_official', dom: 'voxbusinessdeveloper.com', ref: 'Facebook', dev: 'mobile', os: 'Android', dur: 98, scroll: 50, wa: 0, form: true, lead: false, url: '/servicios/marketing.html' },
                    { dayOffset: 3, site: 'vox_site_official', dom: 'voxbusinessdeveloper.com', ref: 'Instagram', dev: 'mobile', os: 'iOS', dur: 240, scroll: 100, wa: 2, form: true, lead: true, name: 'Rodrigo Santillán', mail: 'rsantillan@grupoaltus.com', url: '/servicios/arquitectura.html' },
                    { dayOffset: 4, site: 'vox_site_9f8a2b3c4d5e6f7a', dom: 'dentalmendoza.com', ref: 'Google Search', dev: 'mobile', os: 'iOS', dur: 175, scroll: 100, wa: 1, form: true, lead: true, name: 'Mariana Téllez', mail: 'mtellez@gmail.com', url: '/#citas' },
                    { dayOffset: 5, site: 'vox_site_official', dom: 'voxbusinessdeveloper.com', ref: 'Directo', dev: 'desktop', os: 'macOS', dur: 165, scroll: 75, wa: 1, form: false, lead: false, url: '/servicios/juridico.html' },
                    { dayOffset: 6, site: 'vox_mon_torreaura2026', dom: 'torreaura.mx', ref: 'Instagram', dev: 'mobile', os: 'iOS', dur: 190, scroll: 100, wa: 1, form: true, lead: false, url: '/#preventa' },
                    { dayOffset: 8, site: 'vox_site_official', dom: 'voxbusinessdeveloper.com', ref: 'Google Search', dev: 'desktop', os: 'Windows', dur: 130, scroll: 75, wa: 0, form: true, lead: false, url: '/servicios/branding.html' },
                    { dayOffset: 9, site: 'vox_site_official', dom: 'voxbusinessdeveloper.com', ref: 'Instagram', dev: 'mobile', os: 'Android', dur: 205, scroll: 100, wa: 1, form: true, lead: true, name: 'Carlos Ibarra', mail: 'cibarra@constructoraib.mx', url: '/servicios/arquitectura.html' },
                    { dayOffset: 11, site: 'vox_site_official', dom: 'voxbusinessdeveloper.com', ref: 'LinkedIn', dev: 'desktop', os: 'macOS', dur: 260, scroll: 100, wa: 1, form: true, lead: true, name: 'Fernanda Ríos', mail: 'frios@corporativorios.mx', url: '/servicios/financiero.html' },
                    { dayOffset: 12, site: 'vox_site_9f8a2b3c4d5e6f7a', dom: 'dentalmendoza.com', ref: 'Facebook', dev: 'mobile', os: 'Android', dur: 115, scroll: 75, wa: 1, form: false, lead: false, url: '/' },
                    { dayOffset: 13, site: 'vox_site_official', dom: 'voxbusinessdeveloper.com', ref: 'Google Search', dev: 'desktop', os: 'Windows', dur: 88, scroll: 50, wa: 0, form: false, lead: false, url: '/' },
                    { dayOffset: 14, site: 'vox_mon_torreaura2026', dom: 'torreaura.mx', ref: 'Instagram', dev: 'mobile', os: 'iOS', dur: 225, scroll: 100, wa: 2, form: true, lead: true, name: 'Patricio Elizondo', mail: 'pelizondo@inversiones.mx', url: '/#departamentos' },
                    { dayOffset: 17, site: 'vox_site_official', dom: 'voxbusinessdeveloper.com', ref: 'Instagram', dev: 'mobile', os: 'iOS', dur: 150, scroll: 75, wa: 1, form: false, lead: false, url: '/servicios/marketing.html' },
                    { dayOffset: 19, site: 'vox_site_official', dom: 'voxbusinessdeveloper.com', ref: 'Google Search', dev: 'desktop', os: 'Windows', dur: 195, scroll: 100, wa: 1, form: true, lead: true, name: 'Daniela Villarreal', mail: 'dvillarreal@dvstudio.mx', url: '/servicios/branding.html' },
                    { dayOffset: 22, site: 'vox_site_official', dom: 'voxbusinessdeveloper.com', ref: 'Directo', dev: 'desktop', os: 'macOS', dur: 110, scroll: 50, wa: 0, form: false, lead: false, url: '/servicios/desarrollo.html' },
                    { dayOffset: 25, site: 'vox_site_9f8a2b3c4d5e6f7a', dom: 'dentalmendoza.com', ref: 'Instagram', dev: 'mobile', os: 'iOS', dur: 140, scroll: 75, wa: 1, form: false, lead: false, url: '/#citas' },
                    { dayOffset: 28, site: 'vox_site_official', dom: 'voxbusinessdeveloper.com', ref: 'Google Search', dev: 'desktop', os: 'Windows', dur: 175, scroll: 100, wa: 1, form: true, lead: false, url: '/servicios/juridico.html' },
                    { dayOffset: 34, site: 'vox_site_official', dom: 'voxbusinessdeveloper.com', ref: 'Facebook', dev: 'mobile', os: 'Android', dur: 120, scroll: 50, wa: 1, form: false, lead: false, url: '/' },
                    { dayOffset: 39, site: 'vox_site_official', dom: 'voxbusinessdeveloper.com', ref: 'Google Search', dev: 'desktop', os: 'Windows', dur: 160, scroll: 75, wa: 0, form: true, lead: true, name: 'Héctor Lozano', mail: 'hlozano@lozanoasoc.com', url: '/servicios/contabilidad.html' }
                ];

                historicalConfig.forEach((h, idx) => {
                    const sid = `vsess_hist_period_${idx + 1}`;
                    if (existingIds.has(sid)) return;
                    const ts = new Date(now - h.dayOffset * DAY_MS - (idx * 1800 * 1000)).toISOString();
                    currentSessions.push({
                        session_id: sid,
                        visitor_id: `vusr_hist_${idx + 10}`,
                        site_key: h.site,
                        dominio: h.dom,
                        started_at: ts,
                        last_seen_at: ts,
                        duration_seconds: h.dur,
                        max_scroll_pct: h.scroll,
                        entry_url: '/',
                        current_url: h.url,
                        referrer: h.ref,
                        utm_source: h.ref.toLowerCase().replace(/\s+/g, '_'),
                        utm_medium: 'organic',
                        utm_campaign: 'crecimiento_2026',
                        device_type: h.dev,
                        os: h.os,
                        browser: h.os === 'iOS' ? 'Safari' : 'Chrome',
                        screen_res: h.dev === 'mobile' ? '390x844' : '1920x1080',
                        language: 'es-MX',
                        timezone: 'America/Mexico_City',
                        page_views_count: h.scroll >= 75 ? 3 : 2,
                        clicks_count: (h.wa || 0) + (h.form ? 3 : 1),
                        whatsapp_clicks: h.wa,
                        form_interacted: h.form,
                        converted_to_lead: h.lead,
                        lead_nombre: h.name || '',
                        lead_correo: h.mail || ''
                    });
                });

                localStorage.setItem(LOCAL_SESSIONS_CACHE, JSON.stringify(currentSessions));
                localStorage.setItem(PERIOD_SEED_KEY, '1');
            }

            // Semilla para Buffalo Manufactura (ejemplo directo de tarjeta de página industrial)
            const BUFFALO_SEED_KEY = 'vox_telemetry_seed_buffalo_v1';
            if (!localStorage.getItem(BUFFALO_SEED_KEY)) {
                const now = Date.now();
                const DAY_MS = 24 * 3600 * 1000;
                const sitiosList = JSON.parse(localStorage.getItem(LOCAL_SITIOS_CACHE) || '[]');
                if (!sitiosList.some(s => s.site_key === 'vox_mon_buffalo2026')) {
                    sitiosList.unshift({
                        id: 'mon_buffalo_1',
                        site_key: 'vox_mon_buffalo2026',
                        nombre_sitio: 'Buffalo Manufactura',
                        dominio_url: 'https://buffalomanufactura.com',
                        cliente_nombre: 'Grupo Industrial Buffalo',
                        activo: true,
                        notas: 'Planta de manufactura, maquinado CNC y proyectos industriales'
                    });
                    localStorage.setItem(LOCAL_SITIOS_CACHE, JSON.stringify(sitiosList));
                }

                const currSess = JSON.parse(localStorage.getItem(LOCAL_SESSIONS_CACHE) || '[]');
                const currEvs = JSON.parse(localStorage.getItem(LOCAL_EVENTS_CACHE) || '[]');
                const sessIds = new Set(currSess.map(s => s.session_id));

                const buffaloSessions = [
                    {
                        session_id: 'vsess_buffalo_live_1',
                        visitor_id: 'vusr_buf_ing_01',
                        site_key: 'vox_mon_buffalo2026',
                        dominio: 'buffalomanufactura.com',
                        started_at: new Date(now - 140 * 1000).toISOString(),
                        last_seen_at: new Date(now - 18 * 1000).toISOString(),
                        duration_seconds: 185,
                        max_scroll_pct: 100,
                        entry_url: '/',
                        current_url: '/#cotizacion-industrial',
                        referrer: 'Google Search',
                        utm_source: 'google',
                        utm_medium: 'cpc',
                        utm_campaign: 'maquinado_industrial',
                        device_type: 'desktop',
                        os: 'Windows',
                        browser: 'Chrome',
                        screen_res: '1920x1080',
                        language: 'es-MX',
                        timezone: 'America/Monterrey',
                        page_views_count: 4,
                        clicks_count: 6,
                        whatsapp_clicks: 2,
                        form_interacted: true,
                        converted_to_lead: true,
                        lead_nombre: 'Ing. Roberto Garza (Compras)',
                        lead_correo: 'rgarza@acerosdelnorte.mx'
                    },
                    {
                        session_id: 'vsess_buffalo_hist_2',
                        visitor_id: 'vusr_buf_02',
                        site_key: 'vox_mon_buffalo2026',
                        dominio: 'buffalomanufactura.com',
                        started_at: new Date(now - 2 * DAY_MS).toISOString(),
                        last_seen_at: new Date(now - 2 * DAY_MS).toISOString(),
                        duration_seconds: 210,
                        max_scroll_pct: 100,
                        entry_url: '/',
                        current_url: '/catalogo-acero',
                        referrer: 'LinkedIn',
                        device_type: 'desktop',
                        os: 'Windows',
                        browser: 'Edge',
                        screen_res: '1920x1080',
                        language: 'es-MX',
                        timezone: 'America/Monterrey',
                        page_views_count: 3,
                        clicks_count: 5,
                        whatsapp_clicks: 1,
                        form_interacted: true,
                        converted_to_lead: true,
                        lead_nombre: 'Arq. Eugenio Treviño',
                        lead_correo: 'etrevino@parquesindustriales.mx'
                    },
                    {
                        session_id: 'vsess_buffalo_hist_3',
                        visitor_id: 'vusr_buf_03',
                        site_key: 'vox_mon_buffalo2026',
                        dominio: 'buffalomanufactura.com',
                        started_at: new Date(now - 5 * DAY_MS).toISOString(),
                        last_seen_at: new Date(now - 5 * DAY_MS).toISOString(),
                        duration_seconds: 155,
                        max_scroll_pct: 75,
                        entry_url: '/',
                        current_url: '/#maquinaria',
                        referrer: 'Instagram',
                        device_type: 'mobile',
                        os: 'iOS',
                        browser: 'Safari',
                        screen_res: '390x844',
                        language: 'es-MX',
                        timezone: 'America/Monterrey',
                        page_views_count: 2,
                        clicks_count: 4,
                        whatsapp_clicks: 1,
                        form_interacted: false,
                        converted_to_lead: false,
                        lead_nombre: '',
                        lead_correo: ''
                    },
                    {
                        session_id: 'vsess_buffalo_hist_4',
                        visitor_id: 'vusr_buf_04',
                        site_key: 'vox_mon_buffalo2026',
                        dominio: 'buffalomanufactura.com',
                        started_at: new Date(now - 10 * DAY_MS).toISOString(),
                        last_seen_at: new Date(now - 10 * DAY_MS).toISOString(),
                        duration_seconds: 195,
                        max_scroll_pct: 100,
                        entry_url: '/',
                        current_url: '/#cotizacion-industrial',
                        referrer: 'Google Search',
                        device_type: 'desktop',
                        os: 'Windows',
                        browser: 'Chrome',
                        screen_res: '1920x1080',
                        language: 'es-MX',
                        timezone: 'America/Mexico_City',
                        page_views_count: 3,
                        clicks_count: 5,
                        whatsapp_clicks: 2,
                        form_interacted: true,
                        converted_to_lead: true,
                        lead_nombre: 'Lic. Sofía Mondragón',
                        lead_correo: 'smondragon@logistica-mty.com'
                    },
                    {
                        session_id: 'vsess_buffalo_hist_5',
                        visitor_id: 'vusr_buf_05',
                        site_key: 'vox_mon_buffalo2026',
                        dominio: 'buffalomanufactura.com',
                        started_at: new Date(now - 18 * DAY_MS).toISOString(),
                        last_seen_at: new Date(now - 18 * DAY_MS).toISOString(),
                        duration_seconds: 130,
                        max_scroll_pct: 75,
                        entry_url: '/',
                        current_url: '/',
                        referrer: 'Directo',
                        device_type: 'desktop',
                        os: 'Windows',
                        browser: 'Chrome',
                        screen_res: '1920x1080',
                        language: 'es-MX',
                        timezone: 'America/Monterrey',
                        page_views_count: 2,
                        clicks_count: 3,
                        whatsapp_clicks: 1,
                        form_interacted: false,
                        converted_to_lead: false,
                        lead_nombre: '',
                        lead_correo: ''
                    }
                ];

                buffaloSessions.forEach(bs => {
                    if (!sessIds.has(bs.session_id)) {
                        currSess.unshift(bs);
                    }
                });

                const buffaloEvents = [
                    {
                        id: 'ev_buf_1',
                        created_at: new Date(now - 135 * 1000).toISOString(),
                        session_id: 'vsess_buffalo_live_1',
                        visitor_id: 'vusr_buf_ing_01',
                        site_key: 'vox_mon_buffalo2026',
                        event_type: 'pageview',
                        page_path: '/',
                        page_title: 'Buffalo Manufactura | Soluciones Industriales',
                        element_text: 'Entró a buffalomanufactura.com desde Google Search'
                    },
                    {
                        id: 'ev_buf_2',
                        created_at: new Date(now - 95 * 1000).toISOString(),
                        session_id: 'vsess_buffalo_live_1',
                        visitor_id: 'vusr_buf_ing_01',
                        site_key: 'vox_mon_buffalo2026',
                        event_type: 'click',
                        page_path: '/catalogo-acero',
                        section_id: 'maquinaria',
                        element_tag: 'button',
                        element_text: 'Descargar Ficha Técnica Maquinado CNC',
                        click_x_pct: 42.5,
                        click_y_pct: 46.8
                    },
                    {
                        id: 'ev_buf_3',
                        created_at: new Date(now - 45 * 1000).toISOString(),
                        session_id: 'vsess_buffalo_live_1',
                        visitor_id: 'vusr_buf_ing_01',
                        site_key: 'vox_mon_buffalo2026',
                        event_type: 'form_submit',
                        page_path: '/',
                        section_id: 'cotizacion-industrial',
                        element_tag: 'form',
                        element_text: 'Lead Industrial: Ing. Roberto Garza (Lote 500 pzas)',
                        click_x_pct: 54.2,
                        click_y_pct: 83.4
                    },
                    {
                        id: 'ev_buf_4',
                        created_at: new Date(now - 18 * 1000).toISOString(),
                        session_id: 'vsess_buffalo_live_1',
                        visitor_id: 'vusr_buf_ing_01',
                        site_key: 'vox_mon_buffalo2026',
                        event_type: 'cta_whatsapp',
                        page_path: '/',
                        section_id: 'cotizacion-industrial',
                        element_tag: 'a',
                        element_text: 'WhatsApp Ventas Industriales Buffalo',
                        click_x_pct: 89.4,
                        click_y_pct: 90.1
                    }
                ];

                buffaloEvents.forEach(bev => {
                    if (!currEvs.some(e => e.id === bev.id)) {
                        currEvs.push(bev);
                    }
                });

                localStorage.setItem(LOCAL_SESSIONS_CACHE, JSON.stringify(currSess));
                localStorage.setItem(LOCAL_EVENTS_CACHE, JSON.stringify(currEvs));
                localStorage.setItem(BUFFALO_SEED_KEY, '1');
            }
        } catch (e) {}
    }

    async function fetchRadarData() {
        seedDemoRadarIfNeeded();

        const localSitios = JSON.parse(localStorage.getItem(LOCAL_SITIOS_CACHE) || '[]');
        const localSessions = JSON.parse(localStorage.getItem(LOCAL_SESSIONS_CACHE) || '[]');
        const localEvents = JSON.parse(localStorage.getItem(LOCAL_EVENTS_CACHE) || '[]');

        let cloudSitios = [];
        let cloudSessions = [];
        let cloudEvents = [];

        const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();
        if (isConfigured) {
            try {
                const [sitiosRes, sessRes, evRes] = await Promise.all([
                    window.VOX_SUPABASE.client.from('telemetria_sitios').select('*').order('created_at', { ascending: false }),
                    window.VOX_SUPABASE.client.from('telemetria_sesiones').select('*').order('last_seen_at', { ascending: false }).limit(200),
                    window.VOX_SUPABASE.client.from('telemetria_eventos').select('*').order('created_at', { ascending: false }).limit(1000)
                ]);

                if (!sitiosRes.error && sitiosRes.data) cloudSitios = sitiosRes.data;
                if (!sessRes.error && sessRes.data) cloudSessions = sessRes.data;
                if (!evRes.error && evRes.data) cloudEvents = evRes.data;
            } catch (err) {
                // Si las tablas de telemetría aún no se han ejecutado en SQL Editor, usar espejo local de forma transparente
            }
        }

        // Combinar sin duplicados por site_key / session_id / id
        const sitiosMap = new Map();
        [...localSitios, ...cloudSitios].forEach(s => {
            if (s && s.site_key && s.site_key !== 'vox_site_official') {
                sitiosMap.set(s.site_key, s);
            }
        });
        state.radar.sitios = Array.from(sitiosMap.values());

        const sessionsMap = new Map();
        [...cloudSessions, ...localSessions].forEach(s => {
            if (!s || !s.session_id) return;
            const prev = sessionsMap.get(s.session_id);
            if (!prev || new Date(s.last_seen_at || 0) >= new Date(prev.last_seen_at || 0)) {
                sessionsMap.set(s.session_id, { ...(prev || {}), ...s });
            }
        });
        state.radar.sesiones = Array.from(sessionsMap.values()).sort(
            (a, b) => new Date(b.last_seen_at || 0).getTime() - new Date(a.last_seen_at || 0).getTime()
        );

        const eventsMap = new Map();
        [...cloudEvents, ...localEvents].forEach(ev => {
            if (!ev) return;
            const key = ev.id || `${ev.session_id}_${ev.event_type}_${ev.created_at}`;
            if (!eventsMap.has(key)) {
                eventsMap.set(key, ev);
            }
        });
        state.radar.eventos = Array.from(eventsMap.values()).sort(
            (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );

        populateRadarSiteSelector();
        applyRadarFilters();
    }

    function populateRadarSiteSelector() {
        if (!radarSiteSelect) return;
        const currentVal = state.radar.siteFilter || 'all';

        let html = `
            <option value="all">🌐 Todos los Sitios Conectados</option>
            <option value="vox_site_official">⚡ VOX Business Developer (Sitio Oficial)</option>
        `;

        if (state.creditos && state.creditos.length > 0) {
            html += `<optgroup label="Sitios en Créditos & Cobranza">`;
            state.creditos.forEach(c => {
                html += `<option value="${escapeHtml(c.site_key)}">💳 ${escapeHtml(c.cliente_nombre)} (${escapeHtml(c.dominio_url)})</option>`;
            });
            html += `</optgroup>`;
        }

        if (state.radar.sitios && state.radar.sitios.length > 0) {
            html += `<optgroup label="Sitios Externos de Solo Monitoreo">`;
            state.radar.sitios.forEach(s => {
                html += `<option value="${escapeHtml(s.site_key)}">📡 ${escapeHtml(s.nombre_sitio)} (${escapeHtml(s.dominio_url)})</option>`;
            });
            html += `</optgroup>`;
        }

        radarSiteSelect.innerHTML = html;
        if ([...radarSiteSelect.options].some(o => o.value === currentVal)) {
            radarSiteSelect.value = currentVal;
        } else {
            state.radar.siteFilter = 'all';
            radarSiteSelect.value = 'all';
        }

        renderRadarSitesDeck();
    }

    function getAvailableRadarSiteCards() {
        const cards = [
            {
                site_key: 'all',
                name: 'Consolidado Global',
                domain: 'Todas las páginas conectadas',
                badge: 'GLOBAL',
                initials: '🌐'
            },
            {
                site_key: 'vox_site_official',
                name: 'VOX Business Developer',
                domain: 'voxbusinessdeveloper.com',
                badge: 'OFICIAL',
                initials: 'VX'
            }
        ];

        const seenKeys = new Set(['all', 'vox_site_official']);

        if (state.radar.sitios && state.radar.sitios.length > 0) {
            state.radar.sitios.forEach(s => {
                if (!s || !s.site_key || seenKeys.has(s.site_key)) return;
                seenKeys.add(s.site_key);
                const cleanDom = (s.dominio_url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
                const initials = (s.nombre_sitio || 'ST').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                cards.push({
                    site_key: s.site_key,
                    name: s.nombre_sitio || 'Sitio Monitoreado',
                    domain: cleanDom || s.cliente_nombre || s.site_key,
                    badge: 'RADAR',
                    initials
                });
            });
        }

        if (state.creditos && state.creditos.length > 0) {
            state.creditos.forEach(c => {
                if (!c || !c.site_key || seenKeys.has(c.site_key)) return;
                seenKeys.add(c.site_key);
                const cleanDom = (c.dominio_url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
                const initials = (c.cliente_nombre || 'CR').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                cards.push({
                    site_key: c.site_key,
                    name: c.cliente_nombre || 'Cliente Crédito',
                    domain: cleanDom || c.site_key,
                    badge: 'CRÉDITO',
                    initials
                });
            });
        }

        return cards;
    }

    function buildSparklineSvg(pointsCount = 7, isOnline = false) {
        const strokeColor = isOnline ? '#10b981' : '#52525b';
        const pts = [18, 14, 16, 9, 13, 6, 4].slice(0, pointsCount);
        const d = pts.map((y, idx) => `${idx === 0 ? 'M' : 'L'} ${idx * 12} ${y}`).join(' ');
        return `
            <svg width="74" height="22" viewBox="0 0 74 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="${d}" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }

    function showVercelProjectsGrid() {
        const gridView = document.getElementById('vercelProjectsGridView');
        const workspaceView = document.getElementById('vercelProjectWorkspaceView');
        if (gridView) gridView.style.display = 'flex';
        if (workspaceView) workspaceView.style.display = 'none';
        renderRadarSitesDeck();
        if (window.lucide) window.lucide.createIcons();
    }

    function openVercelProjectWorkspace(cardInfo) {
        state.radar.siteFilter = cardInfo.site_key;
        if (radarSiteSelect) radarSiteSelect.value = cardInfo.site_key;

        // Por defecto abrir en Web Analytics (7d / 15d / 30d) para ver los análisis del proyecto seleccionado
        state.radar.activeTab = 'periods';
        const btnRadarTabPeriodsEl = document.getElementById('btnRadarTabPeriods');
        [btnRadarTabSessions, btnRadarTabHeatmap, btnRadarTabPeriodsEl].forEach(b => b?.classList.remove('active'));
        if (btnRadarTabPeriodsEl) btnRadarTabPeriodsEl.classList.add('active');

        const gridView = document.getElementById('vercelProjectsGridView');
        const workspaceView = document.getElementById('vercelProjectWorkspaceView');
        if (gridView) gridView.style.display = 'none';
        if (workspaceView) {
            workspaceView.style.display = 'flex';
            workspaceView.classList.remove('radar-dynamic-refresh');
            void workspaceView.offsetWidth;
            workspaceView.classList.add('radar-dynamic-refresh');
        }

        const headerPill = document.getElementById('vercelActiveProjectHeader');
        if (headerPill) {
            headerPill.innerHTML = `
                <div class="v-card-avatar" style="width:28px;height:28px;font-size:0.72rem;">${escapeHtml(cardInfo.initials)}</div>
                <strong style="color:#ededed;font-size:0.95rem;">${escapeHtml(cardInfo.name)}</strong>
                <span class="vercel-mono-tag">${escapeHtml(cardInfo.domain)}</span>
            `;
        }

        applyRadarFilters();
        if (window.lucide) window.lucide.createIcons();
    }

    function renderRadarSitesDeck() {
        const deckGrid = document.getElementById('radarSitesCardsGrid');
        const activeIndicator = document.getElementById('radarActiveSiteIndicatorText');
        const globalSummaryText = document.getElementById('vercelGlobalLiveSummaryText');
        const projectSearchTerm = (document.getElementById('vercelProjectSearchInput')?.value || '').trim().toLowerCase();
        if (!deckGrid) return;

        const allCards = getAvailableRadarSiteCards();
        const cards = projectSearchTerm
            ? allCards.filter(c =>
                c.name.toLowerCase().includes(projectSearchTerm) ||
                c.domain.toLowerCase().includes(projectSearchTerm) ||
                c.badge.toLowerCase().includes(projectSearchTerm)
            )
            : allCards;

        const activeKey = state.radar.siteFilter || 'all';
        const totalOnlineAll = state.radar.sesiones.filter(s => isSessionOnline(s)).length;

        if (globalSummaryText) {
            globalSummaryText.textContent = `${totalOnlineAll} Online ahora · ${allCards.length - 1} páginas conectadas`;
        }
        if (activeIndicator) {
            activeIndicator.textContent = `${cards.length} proyecto${cards.length === 1 ? '' : 's'} disponible${cards.length === 1 ? '' : 's'}`;
        }

        deckGrid.innerHTML = '';

        cards.forEach(cardInfo => {
            const isSelected = cardInfo.site_key === activeKey;
            const siteSessions = cardInfo.site_key === 'all'
                ? state.radar.sesiones
                : state.radar.sesiones.filter(s => s.site_key === cardInfo.site_key);

            const onlineCount = siteSessions.filter(s => isSessionOnline(s)).length;
            const totalSess = siteSessions.length;
            const totalWa = siteSessions.reduce((acc, s) => acc + (parseInt(s.whatsapp_clicks || 0, 10)), 0);
            const totalLeads = siteSessions.filter(s => s.converted_to_lead).length;

            const latestSess = siteSessions[0];
            const latestDesc = latestSess
                ? (latestSess.lead_nombre
                    ? `Lead: ${latestSess.lead_nombre} (${latestSess.current_url || '/'})`
                    : `Visita desde ${latestSess.referrer || 'Directo'} → ${latestSess.current_url || '/'}`)
                : 'Esperando primera sesión de telemetría...';
            const latestTime = latestSess ? formatRelativeTime(latestSess.last_seen_at) : 'Sin actividad';

            const cardEl = document.createElement('button');
            cardEl.type = 'button';
            cardEl.className = `vercel-project-card ${isSelected ? 'active' : ''}`;
            cardEl.setAttribute('data-site-card-key', cardInfo.site_key);

            cardEl.innerHTML = `
                <div class="v-card-header">
                    <div class="v-card-identity">
                        <div class="v-card-avatar">${escapeHtml(cardInfo.initials)}</div>
                        <div class="v-card-titles">
                            <span class="v-card-name">${escapeHtml(cardInfo.name)}</span>
                            <span class="v-card-domain">${escapeHtml(cardInfo.domain)}</span>
                        </div>
                    </div>
                    <div class="v-card-sparkline-wrap">
                        <span class="v-status-badge ${onlineCount > 0 ? 'is-live' : ''}">
                            ${onlineCount > 0 ? `<span class="mini-live-dot"></span> ${onlineCount} Online` : escapeHtml(cardInfo.badge)}
                        </span>
                        ${buildSparklineSvg(7, onlineCount > 0)}
                    </div>
                </div>

                <div class="v-card-activity">
                    <span class="v-activity-line">${escapeHtml(latestDesc)}</span>
                    <div class="v-activity-meta">
                        <span>main · telemetry</span>
                        <span>${escapeHtml(latestTime)}</span>
                    </div>
                </div>

                <div class="v-card-footer">
                    <div class="v-card-stats">
                        <div class="v-stat-item">
                            <strong>${totalSess}</strong>
                            <small>Sesiones</small>
                        </div>
                        <div class="v-stat-item">
                            <strong style="color:#10b981;">${totalWa}</strong>
                            <small>WhatsApp</small>
                        </div>
                        <div class="v-stat-item">
                            <strong style="color:#f59e0b;">${totalLeads}</strong>
                            <small>Leads</small>
                        </div>
                    </div>
                    <span class="v-open-arrow">Abrir Analytics →</span>
                </div>
            `;

            cardEl.addEventListener('click', () => {
                openVercelProjectWorkspace(cardInfo);
            });

            deckGrid.appendChild(cardEl);
        });
    }

    function applyRadarFilters() {
        const now = Date.now();
        let list = [...state.radar.sesiones];

        // 1. Filtro por Sitio
        if (state.radar.siteFilter !== 'all') {
            list = list.filter(s => s.site_key === state.radar.siteFilter);
        }

        // 2. Filtro por Periodo
        if (state.radar.periodFilter === 'today') {
            list = list.filter(s => (now - new Date(s.last_seen_at || s.started_at).getTime()) <= 24 * 3600 * 1000);
        } else if (state.radar.periodFilter === '7d') {
            list = list.filter(s => (now - new Date(s.last_seen_at || s.started_at).getTime()) <= 7 * 24 * 3600 * 1000);
        } else if (state.radar.periodFilter === '15d') {
            list = list.filter(s => (now - new Date(s.last_seen_at || s.started_at).getTime()) <= 15 * 24 * 3600 * 1000);
        } else if (state.radar.periodFilter === '30d') {
            list = list.filter(s => (now - new Date(s.last_seen_at || s.started_at).getTime()) <= 30 * 24 * 3600 * 1000);
        }

        // 3. Filtro por Tipo de Visitante
        if (state.radar.visitorFilter === 'online') {
            list = list.filter(s => isSessionOnline(s));
        } else if (state.radar.visitorFilter === 'lead') {
            list = list.filter(s => s.converted_to_lead);
        } else if (state.radar.visitorFilter === 'whatsapp') {
            list = list.filter(s => (s.whatsapp_clicks || 0) > 0);
        } else if (state.radar.visitorFilter === 'form') {
            list = list.filter(s => s.form_interacted);
        }

        // 4. Filtro por caja de búsqueda del Radar o superior
        const activeRadarTerm = (state.radar.searchQuery || state.searchTerm || '').trim().toLowerCase();
        if (activeRadarTerm) {
            const term = activeRadarTerm;
            list = list.filter(s =>
                (s.lead_nombre && s.lead_nombre.toLowerCase().includes(term)) ||
                (s.lead_correo && s.lead_correo.toLowerCase().includes(term)) ||
                (s.visitor_id && s.visitor_id.toLowerCase().includes(term)) ||
                (s.dominio && s.dominio.toLowerCase().includes(term)) ||
                (s.referrer && s.referrer.toLowerCase().includes(term)) ||
                (s.current_url && s.current_url.toLowerCase().includes(term)) ||
                (s.os && s.os.toLowerCase().includes(term))
            );
        }

        state.radar.filteredSesiones = list;

        // Seleccionar por defecto la primera sesión si no hay una activa en la lista
        if (!state.radar.activeSessionId || !list.some(s => s.session_id === state.radar.activeSessionId)) {
            state.radar.activeSessionId = list.length > 0 ? list[0].session_id : null;
        }

        updateRadarKPIs();
        if (state.currentView === 'radar') {
            renderRadar();
        }
    }

    function updateRadarKPIs() {
        const allOnlineCount = state.radar.sesiones.filter(s => isSessionOnline(s)).length;
        if (badgeOnlineNow) {
            badgeOnlineNow.textContent = allOnlineCount;
        }

        const list = state.radar.filteredSesiones;
        const onlineFiltered = list.filter(s => isSessionOnline(s)).length;
        const totalSessions = list.length;
        const uniqueVisitors = new Set(list.map(s => s.visitor_id)).size;

        const totalWaClicks = list.reduce((acc, s) => acc + (parseInt(s.whatsapp_clicks || 0, 10)), 0);
        const totalConverted = list.filter(s => s.converted_to_lead).length;
        const totalForm = list.filter(s => s.form_interacted).length;
        const totalIntent = totalWaClicks + totalConverted + totalForm;

        const avgDuration = totalSessions > 0
            ? Math.round(list.reduce((acc, s) => acc + (parseInt(s.duration_seconds || 0, 10)), 0) / totalSessions)
            : 0;
        const avgScroll = totalSessions > 0
            ? Math.round(list.reduce((acc, s) => acc + (parseInt(s.max_scroll_pct || 0, 10)), 0) / totalSessions)
            : 0;

        const elOnline = document.getElementById('kpiRadarOnline');
        const elOnlineSub = document.getElementById('kpiRadarOnlineSub');
        const elSessions = document.getElementById('kpiRadarSessions');
        const elVisitorsSub = document.getElementById('kpiRadarVisitorsSub');
        const elIntent = document.getElementById('kpiRadarIntent');
        const elIntentSub = document.getElementById('kpiRadarIntentSub');
        const elEngagement = document.getElementById('kpiRadarEngagement');
        const elScrollSub = document.getElementById('kpiRadarScrollSub');

        if (elOnline) elOnline.textContent = onlineFiltered;
        if (elOnlineSub) elOnlineSub.textContent = onlineFiltered === 1 ? '1 persona navegando ahora' : `${onlineFiltered} personas activas (últ. 2 min)`;
        if (elSessions) elSessions.textContent = totalSessions;
        if (elVisitorsSub) elVisitorsSub.textContent = `${uniqueVisitors} visitante${uniqueVisitors === 1 ? '' : 's'} único${uniqueVisitors === 1 ? '' : 's'}`;
        if (elIntent) elIntent.textContent = totalIntent;
        if (elIntentSub) elIntentSub.textContent = `${totalWaClicks} WhatsApp · ${totalForm} Form · ${totalConverted} Leads`;
        if (elEngagement) elEngagement.textContent = formatDuration(avgDuration);
        if (elScrollSub) elScrollSub.textContent = `${avgScroll}% profundidad media de scroll`;
        const elScrollBarFill = document.getElementById('kpiRadarScrollBarFill');
        if (elScrollBarFill) elScrollBarFill.style.width = `${Math.min(100, Math.max(8, avgScroll))}%`;
    }

    function formatDuration(seconds) {
        const sec = Math.max(0, parseInt(seconds || 0, 10));
        if (sec < 60) return `${sec}s`;
        const m = Math.floor(sec / 60);
        const r = sec % 60;
        return `${m}m ${r}s`;
    }

    function formatRelativeTime(isoDate) {
        if (!isoDate) return 'Hace instantes';
        const diffSec = Math.max(0, Math.round((Date.now() - new Date(isoDate).getTime()) / 1000));
        if (diffSec < 45) return 'En vivo ahora';
        if (diffSec < 3600) return `Hace ${Math.floor(diffSec / 60)} min`;
        if (diffSec < 86400) return `Hace ${Math.floor(diffSec / 3600)} h`;
        return new Date(isoDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    }

    function renderRadar() {
        const radarPeriodsTab = document.getElementById('radarPeriodsTab');
        if (state.radar.activeTab === 'heatmap') {
            if (radarSessionsTab) radarSessionsTab.style.display = 'none';
            if (radarHeatmapTab) radarHeatmapTab.style.display = 'grid';
            if (radarPeriodsTab) radarPeriodsTab.style.display = 'none';
            renderRadarHeatmapAndRankings();
        } else if (state.radar.activeTab === 'periods') {
            if (radarSessionsTab) radarSessionsTab.style.display = 'none';
            if (radarHeatmapTab) radarHeatmapTab.style.display = 'none';
            if (radarPeriodsTab) radarPeriodsTab.style.display = 'flex';
            renderRadarPeriodAnalysis();
        } else {
            if (radarSessionsTab) radarSessionsTab.style.display = 'grid';
            if (radarHeatmapTab) radarHeatmapTab.style.display = 'none';
            if (radarPeriodsTab) radarPeriodsTab.style.display = 'none';
            renderRadarSessionsAndTimeline();
        }
        if (window.lucide) window.lucide.createIcons();
    }

    function renderRadarSessionsAndTimeline() {
        if (!radarSessionsList) return;
        radarSessionsList.innerHTML = '';

        const list = state.radar.filteredSesiones;
        if (radarSessionsCountLabel) {
            radarSessionsCountLabel.textContent = `${list.length} sesión${list.length === 1 ? '' : 'es'} encontrada${list.length === 1 ? '' : 's'}`;
        }

        if (list.length === 0) {
            if (emptyRadarSessions) emptyRadarSessions.style.display = 'flex';
            if (radarVisitorDetailHeader) {
                radarVisitorDetailHeader.innerHTML = `<div class="empty-state" style="padding:24px 0;"><p>Selecciona o espera una sesión para inspeccionar su recorrido.</p></div>`;
            }
            if (radarVisitorTimelineBody) radarVisitorTimelineBody.innerHTML = '';
            return;
        }

        if (emptyRadarSessions) emptyRadarSessions.style.display = 'none';

        list.forEach(sess => {
            const online = isSessionOnline(sess);
            const isSelected = sess.session_id === state.radar.activeSessionId;
            const shortVid = (sess.visitor_id || 'anon').slice(-6).toUpperCase();
            const displayName = sess.lead_nombre
                ? `${sess.lead_nombre}`
                : `Visitante #${shortVid}`;

            const avatarInitials = sess.lead_nombre
                ? sess.lead_nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                : shortVid.slice(0, 2);
            const avatarClass = sess.converted_to_lead ? 'is-lead' : (online ? 'is-online' : '');
            const scrollPct = Math.min(100, Math.max(0, parseInt(sess.max_scroll_pct || 0, 10)));

            const deviceIcon = sess.device_type === 'mobile' ? 'smartphone' : (sess.device_type === 'tablet' ? 'tablet' : 'monitor');
            const card = document.createElement('div');
            card.className = `radar-session-card ${isSelected ? 'active' : ''}`;

            card.innerHTML = `
                <div class="radar-session-top">
                    <div class="radar-visitor-identity">
                        <div class="visitor-avatar-badge ${avatarClass}">${escapeHtml(avatarInitials)}</div>
                        <div class="visitor-name-stack">
                            <span class="visitor-name-main">
                                <span class="${online ? 'status-dot-live' : 'status-dot-offline'}" title="${online ? 'Conectado ahora' : 'Sesión finalizada'}"></span>
                                ${escapeHtml(displayName)}
                            </span>
                            <span class="visitor-sub-domain">${escapeHtml(sess.dominio || getSiteDisplayName(sess.site_key))} · ${escapeHtml(sess.current_url || sess.entry_url || '/')}</span>
                        </div>
                    </div>
                    <span class="radar-session-time ${online ? 'online-now' : ''}">${formatRelativeTime(sess.last_seen_at)}</span>
                </div>

                <div class="radar-session-meta">
                    <span class="radar-meta-pill"><i data-lucide="${deviceIcon}" style="width:12px;height:12px;"></i> ${escapeHtml(sess.os || sess.device_type || 'Web')}</span>
                    <span class="radar-meta-pill"><i data-lucide="compass" style="width:12px;height:12px;"></i> ${escapeHtml(sess.referrer || 'Directo')}</span>
                    <span class="radar-meta-pill"><i data-lucide="clock" style="width:12px;height:12px;"></i> ${formatDuration(sess.duration_seconds)}</span>
                    <span class="radar-meta-pill"><i data-lucide="layers" style="width:12px;height:12px;"></i> ${sess.page_views_count || 1} pág.</span>
                </div>

                <div class="session-scroll-strip">
                    <span class="session-scroll-lbl">Scroll</span>
                    <div class="session-scroll-track">
                        <div class="session-scroll-fill" style="width: ${scrollPct}%;"></div>
                    </div>
                    <span class="session-scroll-pct">${scrollPct}%</span>
                </div>

                <div class="radar-session-badges">
                    <span class="radar-mini-tag tag-site">${escapeHtml(sess.dominio || getSiteDisplayName(sess.site_key))}</span>
                    ${sess.converted_to_lead ? `<span class="radar-mini-tag tag-lead">🔥 Lead Convertido</span>` : ''}
                    ${(sess.whatsapp_clicks || 0) > 0 ? `<span class="radar-mini-tag tag-wa">💬 WhatsApp (${sess.whatsapp_clicks})</span>` : ''}
                    ${sess.form_interacted && !sess.converted_to_lead ? `<span class="radar-mini-tag tag-form">📝 Tocó Formulario</span>` : ''}
                </div>
            `;

            card.addEventListener('click', () => {
                state.radar.activeSessionId = sess.session_id;
                renderRadarSessionsAndTimeline();
                if (window.lucide) window.lucide.createIcons();
            });

            radarSessionsList.appendChild(card);
        });

        const activeSession = list.find(s => s.session_id === state.radar.activeSessionId) || list[0];
        renderVisitorDetailAndTimeline(activeSession);
    }

    function getEventLabelAndIcon(ev) {
        switch (ev.event_type) {
            case 'pageview':
                return { icon: 'eye', label: 'Vista de Página', color: '#58a6ff' };
            case 'section_view':
                return { icon: 'layout', label: 'Lectura de Sección', color: '#c9a86a' };
            case 'scroll_milestone':
                return { icon: 'arrow-down', label: `Profundidad de Scroll (${ev.scroll_pct || 0}%)`, color: '#a371f7' };
            case 'cta_whatsapp':
                return { icon: 'message-circle', label: 'Clic en WhatsApp Directo', color: '#25D366' };
            case 'cta_phone':
                return { icon: 'phone-call', label: 'Clic en Llamada Telefónica', color: '#2ecc71' };
            case 'cta_email':
                return { icon: 'mail', label: 'Clic en Correo Electrónico', color: '#388bfd' };
            case 'form_start':
                return { icon: 'edit-3', label: 'Inicio de Formulario', color: '#4c82f7' };
            case 'form_submit':
                return { icon: 'check-circle-2', label: 'Formulario Enviado / Conversión Lead', color: '#ff6a00' };
            case 'form_abandon':
                return { icon: 'alert-triangle', label: 'Abandono de Formulario', color: '#ff6b6b' };
            default:
                return { icon: 'mouse-pointer-click', label: 'Clic de Usuario', color: '#e0c588' };
        }
    }

    function renderVisitorDetailAndTimeline(sess) {
        if (!sess || !radarVisitorDetailHeader || !radarVisitorTimelineBody) return;

        const online = isSessionOnline(sess);
        const shortVid = (sess.visitor_id || 'anon').slice(-6).toUpperCase();
        const titleName = sess.lead_nombre
            ? `${sess.lead_nombre} (${sess.lead_correo || 'Lead Identificado'})`
            : `Visitante Anónimo #${shortVid}`;

        // Buscar si existe en state.leads para botón directo al CRM
        const matchedLead = state.leads.find(l =>
            (sess.lead_correo && l.correo && l.correo.toLowerCase() === sess.lead_correo.toLowerCase()) ||
            (l.notas && l.notas.includes(sess.session_id))
        );

        radarVisitorDetailHeader.innerHTML = `
            <div class="visitor-summary-top">
                <div class="visitor-summary-title">
                    <h3>
                        <span class="${online ? 'status-dot-live' : 'status-dot-offline'}"></span>
                        <span>${escapeHtml(titleName)}</span>
                        ${online ? `<span class="badge badge-success" style="font-size:0.68rem;">ONLINE AHORA</span>` : ''}
                    </h3>
                    <div class="visitor-summary-sub">
                        Sitio: <strong style="color:var(--gold-primary);">${escapeHtml(getSiteDisplayName(sess.site_key))}</strong>
                        · Sesión ID: <code>${escapeHtml(sess.session_id)}</code>
                    </div>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    ${matchedLead ? `
                        <button type="button" class="btn btn-primary btn-sm" id="btnOpenMatchedLeadFromRadar">
                            <i data-lucide="user-check"></i>
                            <span>Abrir Ficha Lead CRM</span>
                        </button>
                    ` : ''}
                </div>
            </div>

            <div class="visitor-specs-grid">
                <div class="visitor-spec-item">
                    <span class="visitor-spec-lbl">Origen / Referrer</span>
                    <span class="visitor-spec-val">${escapeHtml(sess.referrer || 'Directo')}${sess.utm_campaign ? ` (${escapeHtml(sess.utm_campaign)})` : ''}</span>
                </div>
                <div class="visitor-spec-item">
                    <span class="visitor-spec-lbl">Dispositivo & SO</span>
                    <span class="visitor-spec-val">${escapeHtml((sess.device_type || 'PC').toUpperCase())} · ${escapeHtml(sess.os || 'Web')} (${escapeHtml(sess.browser || '')})</span>
                </div>
                <div class="visitor-spec-item">
                    <span class="visitor-spec-lbl">Tiempo Activo</span>
                    <span class="visitor-spec-val">${formatDuration(sess.duration_seconds)} (${sess.page_views_count || 1} pág.)</span>
                </div>
                <div class="visitor-spec-item">
                    <span class="visitor-spec-lbl">Scroll Máximo</span>
                    <span class="visitor-spec-val" style="color:var(--gold-primary);">${sess.max_scroll_pct || 0}% leído</span>
                </div>
                <div class="visitor-spec-item">
                    <span class="visitor-spec-lbl">Zona Horaria / Pantalla</span>
                    <span class="visitor-spec-val" title="${escapeHtml(sess.timezone || '')}">${escapeHtml((sess.timezone || 'Local').split('/').pop())} · ${escapeHtml(sess.screen_res || '-')}</span>
                </div>
            </div>
        `;

        if (matchedLead) {
            document.getElementById('btnOpenMatchedLeadFromRadar')?.addEventListener('click', () => {
                openLeadModal(matchedLead.id);
            });
        }

        // Filtrar los eventos cronológicos de esta sesión
        const sessionEvents = state.radar.eventos.filter(ev => ev.session_id === sess.session_id);
        const eventsCountBadge = document.getElementById('radarEventsCountBadge');
        if (eventsCountBadge) {
            eventsCountBadge.textContent = `${ Math.max(1, sessionEvents.length) } evento${ sessionEvents.length === 1 ? '' : 's' }`;
        }

        if (sessionEvents.length === 0) {
            radarVisitorTimelineBody.innerHTML = `
                <div class="vox-journey-timeline">
                    <div class="journey-step">
                        <span class="journey-step-icon-node" style="color:#58a6ff; border-color:#58a6ff;">
                            <i data-lucide="eye" style="width:14px;height:14px;"></i>
                        </span>
                        <div class="journey-step-top">
                            <span class="journey-step-type" style="color:#58a6ff;"><i data-lucide="eye" style="width:13px;height:13px;"></i> Entrada al Sitio</span>
                            <span class="journey-step-time">${new Date(sess.started_at).toLocaleTimeString('es-MX')}</span>
                        </div>
                        <div class="journey-step-desc">Ingresó a <strong>${escapeHtml(sess.entry_url || '/')}</strong> desde ${escapeHtml(sess.referrer || 'Directo')}</div>
                    </div>
                </div>
            `;
            return;
        }

        let timelineHtml = `<div class="vox-journey-timeline">`;
        sessionEvents.forEach(ev => {
            const meta = getEventLabelAndIcon(ev);
            const timeStr = ev.created_at ? new Date(ev.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
            const coordsBadge = (typeof ev.click_x_pct === 'number' && typeof ev.click_y_pct === 'number')
                ? `<span class="radar-meta-pill" title="Coordenada exacta del clic en la página"><i data-lucide="crosshair" style="width:11px;height:11px;"></i> X: ${ev.click_x_pct}% · Y: ${ev.click_y_pct}%</span>`
                : '';

            timelineHtml += `
                <div class="journey-step step-${escapeHtml(ev.event_type)}">
                    <span class="journey-step-icon-node" style="color:${meta.color}; border-color:${meta.color};">
                        <i data-lucide="${meta.icon}" style="width:14px;height:14px;"></i>
                    </span>
                    <div class="journey-step-top">
                        <span class="journey-step-type" style="color:${meta.color};">
                            <i data-lucide="${meta.icon}" style="width:13px;height:13px;"></i>
                            ${escapeHtml(meta.label)}
                        </span>
                        <span class="journey-step-time">${timeStr}</span>
                    </div>
                    <div class="journey-step-desc">${escapeHtml(ev.element_text || ev.page_title || ev.page_path || 'Interacción registrada')}</div>
                    <div class="journey-step-sub">
                        <span>📄 Página: <strong>${escapeHtml(ev.page_path || '/')}</strong></span>
                        ${ev.section_id ? `<span>📌 Sección: <strong>#${escapeHtml(ev.section_id)}</strong></span>` : ''}
                        ${coordsBadge}
                    </div>
                </div>
            `;
        });
        timelineHtml += `</div>`;

        radarVisitorTimelineBody.innerHTML = timelineHtml;
    }

    function renderRadarHeatmapAndRankings() {
        const allowedSessionIds = new Set(state.radar.filteredSesiones.map(s => s.session_id));
        const sessionDeviceMap = new Map(state.radar.filteredSesiones.map(s => [s.session_id, s.device_type || 'desktop']));

        const siteEvents = state.radar.eventos.filter(ev => allowedSessionIds.has(ev.session_id));

        // Poblar selector de páginas en el Heatmap
        if (heatmapPageSelect) {
            const currentPage = state.radar.heatmapPage || 'all';
            const pages = Array.from(new Set(siteEvents.map(ev => ev.page_path || '/'))).filter(Boolean);
            let pageOpts = `<option value="all">Todas las Páginas (${pages.length})</option>`;
            pages.forEach(p => {
                pageOpts += `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`;
            });
            heatmapPageSelect.innerHTML = pageOpts;
            if (pages.includes(currentPage)) {
                heatmapPageSelect.value = currentPage;
            } else {
                state.radar.heatmapPage = 'all';
                heatmapPageSelect.value = 'all';
            }
        }

        // Actualizar barra de URL del mockup navegador
        const urlDisplay = document.getElementById('heatmapBrowserUrlDisplay');
        if (urlDisplay) {
            const siteLabel = (!state.radar.siteFilter || state.radar.siteFilter === 'all')
                ? 'voxbusinessdeveloper.com'
                : getSiteDisplayName(state.radar.siteFilter);
            const pathLabel = (!state.radar.heatmapPage || state.radar.heatmapPage === 'all')
                ? '/* (Todas las rutas)'
                : state.radar.heatmapPage;
            urlDisplay.textContent = `https://${siteLabel}${pathLabel}`;
        }

        // Filtrar clics con coordenadas para el lienzo (X%, Y%)
        const clickEvents = siteEvents.filter(ev => {
            if (typeof ev.click_x_pct !== 'number' && isNaN(parseFloat(ev.click_x_pct))) return false;
            if (state.radar.heatmapPage !== 'all' && (ev.page_path || '/') !== state.radar.heatmapPage) return false;
            if (state.radar.heatmapDevice !== 'all') {
                const dev = sessionDeviceMap.get(ev.session_id) || 'desktop';
                if (dev !== state.radar.heatmapDevice) return false;
            }
            return true;
        });

        const pointsBadge = document.getElementById('heatmapPointsCountBadge');
        if (pointsBadge) {
            pointsBadge.textContent = `${clickEvents.length} clic${clickEvents.length === 1 ? '' : 's'} mapeado${clickEvents.length === 1 ? '' : 's'}`;
        }

        if (heatmapDotsContainer) {
            heatmapDotsContainer.innerHTML = '';
            clickEvents.forEach(ev => {
                const x = Math.min(98, Math.max(2, parseFloat(ev.click_x_pct)));
                const y = Math.min(98, Math.max(2, parseFloat(ev.click_y_pct)));
                let pointClass = 'point-click';
                if (ev.event_type === 'cta_whatsapp' || ev.event_type === 'cta_phone') pointClass = 'point-whatsapp';
                else if (ev.event_type && ev.event_type.startsWith('form_')) pointClass = 'point-form';

                const dot = document.createElement('div');
                dot.className = `heatmap-click-point ${pointClass}`;
                dot.style.left = `${x}%`;
                dot.style.top = `${y}%`;
                dot.title = `${ev.element_text || 'Clic'} | Pág: ${ev.page_path || '/'} (X: ${x}%, Y: ${y}%)`;
                heatmapDotsContainer.appendChild(dot);
            });
        }

        // Ranking 1: Páginas & Secciones más vistas
        if (radarTopPagesBody) {
            const pageCounts = {};
            siteEvents.forEach(ev => {
                if (ev.event_type === 'pageview' || ev.event_type === 'section_view') {
                    const key = ev.event_type === 'section_view' && ev.section_id
                        ? `${ev.page_path || '/'}#${ev.section_id}`
                        : (ev.page_path || '/');
                    pageCounts[key] = (pageCounts[key] || 0) + 1;
                }
            });

            const sortedPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
            const totalViews = sortedPages.reduce((acc, item) => acc + item[1], 0) || 1;

            if (sortedPages.length === 0) {
                radarTopPagesBody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--text-tertiary);">Sin registros aún</td></tr>`;
            } else {
                radarTopPagesBody.innerHTML = sortedPages.map(([pathName, count]) => {
                    const pct = Math.round((count / totalViews) * 100);
                    return `
                        <tr>
                            <td>
                                <strong>${escapeHtml(pathName)}</strong>
                                <div class="ranking-mini-bar"><div class="ranking-mini-bar-fill" style="width:${pct}%;"></div></div>
                            </td>
                            <td><strong>${count}</strong></td>
                            <td><span class="badge badge-accent">${pct}%</span></td>
                        </tr>
                    `;
                }).join('');
            }
        }

        // Ranking 2: Botones & Elementos más clicados
        if (radarTopElementsBody) {
            const elCounts = {};
            siteEvents.forEach(ev => {
                if (['click', 'cta_whatsapp', 'cta_phone', 'cta_email', 'form_submit'].includes(ev.event_type)) {
                    const label = (ev.element_text || ev.page_path || 'Elemento').slice(0, 50);
                    const key = `${label}|||${ev.event_type}`;
                    elCounts[key] = (elCounts[key] || 0) + 1;
                }
            });

            const sortedEls = Object.entries(elCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
            const maxElCount = sortedEls.length > 0 ? sortedEls[0][1] : 1;
            if (sortedEls.length === 0) {
                radarTopElementsBody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--text-tertiary);">Sin clics registrados aún</td></tr>`;
            } else {
                radarTopElementsBody.innerHTML = sortedEls.map(([composite, count]) => {
                    const [label, type] = composite.split('|||');
                    const badgeLabel = type === 'cta_whatsapp' ? 'WhatsApp' : (type === 'form_submit' ? 'Lead Form' : 'Clic');
                    const barPct = Math.round((count / maxElCount) * 100);
                    return `
                        <tr>
                            <td>
                                <span>${escapeHtml(label)}</span>
                                <div class="ranking-mini-bar"><div class="ranking-mini-bar-fill" style="width:${barPct}%;"></div></div>
                            </td>
                            <td><span class="badge">${badgeLabel}</span></td>
                            <td><strong>${count}</strong></td>
                        </tr>
                    `;
                }).join('');
            }
        }
    }

    // Renderizar el recorrido web dentro del modal de detalle de Lead (CRM)
    function renderLeadRadarJourney(lead) {
        const box = document.getElementById('modalLeadRadarBox');
        if (!box || !lead) return;

        // Buscar sesión vinculada por session_id, notas o correo
        const matchedSession = state.radar.sesiones.find(s =>
            (lead.session_id && s.session_id === lead.session_id) ||
            (lead.notas && lead.notas.includes(s.session_id)) ||
            (lead.correo && s.lead_correo && s.lead_correo.toLowerCase() === lead.correo.toLowerCase()) ||
            (lead.nombre && s.lead_nombre && s.lead_nombre.toLowerCase() === lead.nombre.toLowerCase())
        );

        if (!matchedSession) {
            box.innerHTML = `<small class="muted">Este prospecto no tiene una sesión de navegación previa vinculada o fue registrado manualmente.</small>`;
            return;
        }

        const evs = state.radar.eventos.filter(e => e.session_id === matchedSession.session_id);
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:4px;">
                <span style="font-size:0.76rem; color:var(--text-secondary);">
                    🌐 Origen: <strong style="color:var(--gold-primary);">${escapeHtml(matchedSession.referrer || 'Directo')}</strong>
                    · ⏱️ ${formatDuration(matchedSession.duration_seconds)}
                    · 📜 Scroll: ${matchedSession.max_scroll_pct || 0}%
                </span>
                <button type="button" class="btn btn-outline btn-sm" id="btnJumpToLeadRadarSession" style="padding:3px 9px; font-size:0.72rem;">
                    <i data-lucide="activity" style="width:12px;height:12px;"></i>
                    <span>Ver en Radar</span>
                </button>
            </div>
        `;

        evs.slice(0, 6).forEach(ev => {
            const meta = getEventLabelAndIcon(ev);
            const timeStr = ev.created_at ? new Date(ev.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '';
            html += `
                <div class="lead-radar-step-mini">
                    <span><strong>${escapeHtml(meta.label)}:</strong> ${escapeHtml(ev.element_text || ev.page_path || '/')}</span>
                    <small class="muted">${timeStr}</small>
                </div>
            `;
        });

        box.innerHTML = html;
        document.getElementById('btnJumpToLeadRadarSession')?.addEventListener('click', () => {
            closeLeadModal();
            state.radar.siteFilter = 'all';
            state.radar.visitorFilter = 'all';
            state.radar.activeSessionId = matchedSession.session_id;
            state.radar.activeTab = 'sessions';
            applyRadarFilters();
            switchView('radar');
        });
    }

    // =========================================================================
    // SUB-TAB 3: ANÁLISIS SEMANAL (7d), QUINCENAL (15d) Y MENSUAL (30d)
    // =========================================================================
    if (!state.radar.analysisPeriod) {
        state.radar.analysisPeriod = '15d';
    }

    function computePeriodStats(sessionsList) {
        const totalSessions = sessionsList.length;
        const uniqueVisitors = new Set(sessionsList.map(s => s.visitor_id)).size;
        const waClicks = sessionsList.reduce((acc, s) => acc + (parseInt(s.whatsapp_clicks || 0, 10)), 0);
        const formCount = sessionsList.filter(s => s.form_interacted).length;
        const leadsCount = sessionsList.filter(s => s.converted_to_lead).length;
        const highScrollCount = sessionsList.filter(s => (parseInt(s.max_scroll_pct || 0, 10)) >= 50).length;
        const intentSessionsCount = sessionsList.filter(s => (parseInt(s.whatsapp_clicks || 0, 10)) > 0 || s.form_interacted || s.converted_to_lead).length;
        const avgDuration = totalSessions > 0
            ? Math.round(sessionsList.reduce((acc, s) => acc + (parseInt(s.duration_seconds || 0, 10)), 0) / totalSessions)
            : 0;
        const avgScroll = totalSessions > 0
            ? Math.round(sessionsList.reduce((acc, s) => acc + (parseInt(s.max_scroll_pct || 0, 10)), 0) / totalSessions)
            : 0;
        const convRate = totalSessions > 0 ? Math.round((leadsCount / totalSessions) * 1000) / 10 : 0;

        return {
            totalSessions,
            uniqueVisitors,
            waClicks,
            formCount,
            leadsCount,
            highScrollCount,
            intentSessionsCount,
            avgDuration,
            avgScroll,
            convRate
        };
    }

    function formatDeltaBadge(currVal, prevVal, suffix = '') {
        if (prevVal === 0 && currVal === 0) {
            return `<span class="period-delta-pill neutral">= 0% vs. previo</span>`;
        }
        if (prevVal === 0 && currVal > 0) {
            return `<span class="period-delta-pill up">▲ +100%${suffix} vs. previo</span>`;
        }
        const diffPct = Math.round(((currVal - prevVal) / prevVal) * 100);
        if (diffPct > 0) {
            return `<span class="period-delta-pill up">▲ +${diffPct}%${suffix}</span>`;
        }
        if (diffPct < 0) {
            return `<span class="period-delta-pill down">▼ ${diffPct}%${suffix}</span>`;
        }
        return `<span class="period-delta-pill neutral">= Sin cambio</span>`;
    }

    function getAnalysisWindowConfig(periodCode) {
        if (periodCode === '7d') {
            return { days: 7, label: 'Corte Semanal (Últimos 7 Días)', prevLabel: 'Semana Anterior' };
        }
        if (periodCode === '30d') {
            return { days: 30, label: 'Corte Mensual (Últimos 30 Días)', prevLabel: 'Mes Anterior' };
        }
        return { days: 15, label: 'Corte Quincenal (Últimos 15 Días)', prevLabel: 'Quincena Anterior' };
    }

    function renderRadarPeriodAnalysis() {
        const periodCode = state.radar.analysisPeriod || '15d';
        const cfg = getAnalysisWindowConfig(periodCode);
        const now = Date.now();
        const DAY_MS = 24 * 3600 * 1000;
        const windowMs = cfg.days * DAY_MS;

        // Sincronizar botones del control segmentado
        document.querySelectorAll('#radarAnalysisPeriodControl .period-seg-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-analysis-period') === periodCode);
        });

        // Filtrar sesiones por el sitio seleccionado (o todos)
        const baseSiteSessions = state.radar.siteFilter === 'all'
            ? state.radar.sesiones
            : state.radar.sesiones.filter(s => s.site_key === state.radar.siteFilter);

        const currStart = now - windowMs;
        const prevStart = now - (windowMs * 2);

        const currentSessions = baseSiteSessions.filter(s => {
            const t = new Date(s.last_seen_at || s.started_at).getTime();
            return t >= currStart && t <= now;
        });

        const prevSessions = baseSiteSessions.filter(s => {
            const t = new Date(s.last_seen_at || s.started_at).getTime();
            return t >= prevStart && t < currStart;
        });

        const curr = computePeriodStats(currentSessions);
        const prev = computePeriodStats(prevSessions);

        // Actualizar cabecera de rango de fechas y Spotlight de la Página Activa
        const rangeBadge = document.getElementById('radarPeriodRangeBadge');
        const siteSub = document.getElementById('radarPeriodSiteSubtitle');
        const spotlightBox = document.getElementById('radarPeriodSiteSpotlight');
        const fmtDate = (ms) => new Date(ms).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

        const cards = getAvailableRadarSiteCards();
        const activeCardObj = cards.find(c => c.site_key === (state.radar.siteFilter || 'all')) || cards[0];
        const onlineOnSite = baseSiteSessions.filter(s => isSessionOnline(s)).length;

        if (spotlightBox && activeCardObj) {
            spotlightBox.innerHTML = `
                <div class="spotlight-left">
                    <div class="spotlight-badge-avatar">${escapeHtml(activeCardObj.initials)}</div>
                    <div class="spotlight-titles">
                        <h3>
                            <span>${escapeHtml(activeCardObj.name)}</span>
                            <span class="badge badge-accent" style="font-size:0.68rem;">${escapeHtml(activeCardObj.domain)}</span>
                            ${onlineOnSite > 0 ? `<span class="site-card-live-pill has-online"><span class="mini-live-dot"></span> ${onlineOnSite} Online Ahora</span>` : ''}
                        </h3>
                        <p>Mostrando diagnóstico exclusivo de <strong>${escapeHtml(activeCardObj.name)}</strong> · Selecciona cualquier otra tarjeta arriba para cambiar de página al instante.</p>
                    </div>
                </div>
            `;
        }

        if (rangeBadge) {
            rangeBadge.textContent = `${cfg.label}: ${fmtDate(currStart)} — ${fmtDate(now)}`;
        }
        if (siteSub) {
            const siteName = state.radar.siteFilter === 'all'
                ? 'Todos los Sitios Conectados'
                : getSiteDisplayName(state.radar.siteFilter);
            siteSub.textContent = `Sitio: ${siteName} · Comparado contra ${cfg.prevLabel} (${fmtDate(prevStart)} al ${fmtDate(currStart)})`;
        }

        // 1. Renderizar las 4 tarjetas comparativas (Periodo Actual vs Periodo Previo)
        const compareGrid = document.getElementById('radarPeriodCompareGrid');
        if (compareGrid) {
            compareGrid.innerHTML = `
                <div class="glass-panel period-compare-card">
                    <div class="period-compare-top">
                        <span class="period-compare-lbl">Tráfico del Periodo</span>
                        ${formatDeltaBadge(curr.totalSessions, prev.totalSessions)}
                    </div>
                    <h4 class="period-compare-val">${curr.totalSessions} <small style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);">sesiones</small></h4>
                    <div class="period-compare-prev">
                        <span>${curr.uniqueVisitors} visitantes únicos</span>
                        <span>${cfg.prevLabel}: <strong>${prev.totalSessions}</strong></span>
                    </div>
                </div>

                <div class="glass-panel period-compare-card">
                    <div class="period-compare-top">
                        <span class="period-compare-lbl">Clics a WhatsApp</span>
                        ${formatDeltaBadge(curr.waClicks, prev.waClicks)}
                    </div>
                    <h4 class="period-compare-val" style="color:#25D366;">${curr.waClicks} <small style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);">contactos</small></h4>
                    <div class="period-compare-prev">
                        <span>${curr.formCount} tocaron formulario</span>
                        <span>${cfg.prevLabel}: <strong>${prev.waClicks}</strong></span>
                    </div>
                </div>

                <div class="glass-panel period-compare-card">
                    <div class="period-compare-top">
                        <span class="period-compare-lbl">Leads Convertidos</span>
                        ${formatDeltaBadge(curr.leadsCount, prev.leadsCount)}
                    </div>
                    <h4 class="period-compare-val" style="color:var(--gold-primary);">${curr.leadsCount} <small style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);">(${curr.convRate}% conv.)</small></h4>
                    <div class="period-compare-prev">
                        <span>Tasa previa: ${prev.convRate}%</span>
                        <span>${cfg.prevLabel}: <strong>${prev.leadsCount}</strong></span>
                    </div>
                </div>

                <div class="glass-panel period-compare-card">
                    <div class="period-compare-top">
                        <span class="period-compare-lbl">Retención & Lectura</span>
                        ${formatDeltaBadge(curr.avgDuration, prev.avgDuration)}
                    </div>
                    <h4 class="period-compare-val">${formatDuration(curr.avgDuration)} <small style="font-size:0.85rem;font-weight:600;color:#bc8cff;">(${curr.avgScroll}% scroll)</small></h4>
                    <div class="period-compare-prev">
                        <span>Scroll previo: ${prev.avgScroll}%</span>
                        <span>${cfg.prevLabel}: <strong>${formatDuration(prev.avgDuration)}</strong></span>
                    </div>
                </div>
            `;
        }

        // 2. Renderizar Gráfica de Evolución Diaria
        const dailyStage = document.getElementById('radarDailyChartStage');
        const dailySubtitle = document.getElementById('radarDailyChartSubtitle');
        if (dailySubtitle) {
            dailySubtitle.textContent = `Desglose día por día de los últimos ${cfg.days} días (${curr.totalSessions} sesiones en total)`;
        }
        if (dailyStage) {
            const buckets = [];
            for (let i = cfg.days - 1; i >= 0; i--) {
                const dayStart = new Date(now - i * DAY_MS);
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(dayStart.getTime() + DAY_MS - 1);
                const label = dayStart.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });

                const daySessions = currentSessions.filter(s => {
                    const t = new Date(s.last_seen_at || s.started_at).getTime();
                    return t >= dayStart.getTime() && t <= dayEnd.getTime();
                });
                const sCount = daySessions.length;
                const iCount = daySessions.filter(s => (s.whatsapp_clicks || 0) > 0 || s.converted_to_lead || s.form_interacted).length;
                buckets.push({ label, sCount, iCount });
            }

            const maxDayVal = Math.max(4, ...buckets.map(b => Math.max(b.sCount, b.iCount)));
            dailyStage.innerHTML = buckets.map(b => {
                const sHeight = Math.max(4, Math.round((b.sCount / maxDayVal) * 180));
                const iHeight = b.iCount > 0 ? Math.max(4, Math.round((b.iCount / maxDayVal) * 180)) : 2;
                return `
                    <div class="daily-bar-col" title="${b.label}: ${b.sCount} sesiones · ${b.iCount} señales de intención/leads">
                        <span class="daily-bar-val-top">${b.sCount > 0 ? b.sCount : ''}</span>
                        <div class="daily-bar-pair">
                            <div class="daily-bar-visitors" style="height:${sHeight}px;"></div>
                            <div class="daily-bar-intent" style="height:${iHeight}px;"></div>
                        </div>
                        <span class="daily-bar-lbl">${escapeHtml(b.label)}</span>
                    </div>
                `;
            }).join('');
        }

        // 3. Renderizar Embudo de Conversión de 4 Etapas
        const funnelContainer = document.getElementById('radarFunnelContainer');
        const funnelRateBadge = document.getElementById('radarFunnelRateBadge');
        if (funnelRateBadge) {
            funnelRateBadge.textContent = `${curr.convRate}% Conversión a Lead`;
        }
        if (funnelContainer) {
            const base = Math.max(1, curr.totalSessions);
            const pctScroll = Math.round((curr.highScrollCount / base) * 100);
            const pctIntent = Math.round((curr.intentSessionsCount / base) * 100);
            const pctLead = Math.round((curr.leadsCount / base) * 100);

            funnelContainer.innerHTML = `
                <div class="funnel-step-row">
                    <div class="funnel-step-top">
                        <span class="funnel-step-name">1. Sesiones Totales del Periodo</span>
                        <span class="funnel-step-stats"><strong>${curr.totalSessions}</strong> (100%)</span>
                    </div>
                    <div class="funnel-track">
                        <div class="funnel-fill" style="width:100%; background:linear-gradient(90deg, #388bfd, #58a6ff);"></div>
                    </div>
                </div>

                <div class="funnel-step-row">
                    <div class="funnel-step-top">
                        <span class="funnel-step-name">2. Lectura Activa (Scroll ≥ 50%)</span>
                        <span class="funnel-step-stats"><strong>${curr.highScrollCount}</strong> (${pctScroll}%)</span>
                    </div>
                    <div class="funnel-track">
                        <div class="funnel-fill" style="width:${Math.max(6, pctScroll)}%; background:linear-gradient(90deg, #a371f7, #bc8cff);"></div>
                    </div>
                </div>

                <div class="funnel-step-row">
                    <div class="funnel-step-top">
                        <span class="funnel-step-name">3. Intención Comercial (WhatsApp / Formulario)</span>
                        <span class="funnel-step-stats"><strong>${curr.intentSessionsCount}</strong> (${pctIntent}%)</span>
                    </div>
                    <div class="funnel-track">
                        <div class="funnel-fill" style="width:${Math.max(6, pctIntent)}%; background:linear-gradient(90deg, #2ecc71, #25D366);"></div>
                    </div>
                </div>

                <div class="funnel-step-row">
                    <div class="funnel-step-top">
                        <span class="funnel-step-name">4. Prospectos Convertidos (Leads en CRM)</span>
                        <span class="funnel-step-stats"><strong>${curr.leadsCount}</strong> (${pctLead}%)</span>
                    </div>
                    <div class="funnel-track">
                        <div class="funnel-fill" style="width:${Math.max(6, pctLead)}%; background:linear-gradient(90deg, var(--gold-primary), #ff6a00);"></div>
                    </div>
                </div>
            `;
        }

        // 4. Tabla de Canales de Adquisición y Dispositivos del Periodo
        const channelsBody = document.getElementById('radarPeriodChannelsBody');
        const channelMap = {};
        currentSessions.forEach(s => {
            const ch = s.referrer || 'Directo';
            if (!channelMap[ch]) {
                channelMap[ch] = { count: 0, scrollSum: 0, wa: 0, leads: 0 };
            }
            channelMap[ch].count += 1;
            channelMap[ch].scrollSum += parseInt(s.max_scroll_pct || 0, 10);
            channelMap[ch].wa += parseInt(s.whatsapp_clicks || 0, 10);
            if (s.converted_to_lead) channelMap[ch].leads += 1;
        });

        const sortedChannels = Object.entries(channelMap).sort((a, b) => b[1].count - a[1].count);
        if (channelsBody) {
            if (sortedChannels.length === 0) {
                channelsBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-tertiary);">Sin sesiones en este corte temporal</td></tr>`;
            } else {
                const maxChCount = sortedChannels[0][1].count || 1;
                channelsBody.innerHTML = sortedChannels.map(([chName, data]) => {
                    const avgChScroll = Math.round(data.scrollSum / data.count);
                    const barW = Math.round((data.count / maxChCount) * 100);
                    return `
                        <tr>
                            <td>
                                <strong>${escapeHtml(chName)}</strong>
                                <div class="ranking-mini-bar"><div class="ranking-mini-bar-fill" style="width:${barW}%;"></div></div>
                            </td>
                            <td><strong>${data.count}</strong></td>
                            <td>${avgChScroll}%</td>
                            <td>
                                <span class="badge badge-accent">${data.wa} WA · ${data.leads} Leads</span>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }

        // 5. Diagnóstico Ejecutivo Automático & Borrador listo para Gmail
        const insightsBody = document.getElementById('radarPeriodInsightsBody');
        const topChannel = sortedChannels.length > 0 ? sortedChannels[0][0] : 'Directo';
        const topChannelCount = sortedChannels.length > 0 ? sortedChannels[0][1].count : 0;
        const mobileCount = currentSessions.filter(s => s.device_type === 'mobile').length;
        const mobilePct = curr.totalSessions > 0 ? Math.round((mobileCount / curr.totalSessions) * 100) : 0;
        const siteLabel = state.radar.siteFilter === 'all'
            ? 'Todos los Sitios Conectados'
            : getSiteDisplayName(state.radar.siteFilter);

        const emailDraft = [
            `ASUNTO: Reporte ${cfg.label} — ${siteLabel}`,
            `PERIODO: ${fmtDate(currStart)} al ${fmtDate(now)}`,
            `--------------------------------------------------`,
            `• Sesiones Totales: ${curr.totalSessions} (${curr.uniqueVisitors} visitantes únicos | Previo: ${prev.totalSessions})`,
            `• Clics a WhatsApp Directo: ${curr.waClicks} (Previo: ${prev.waClicks})`,
            `• Leads Convertidos en CRM: ${curr.leadsCount} (Tasa de conversión: ${curr.convRate}%)`,
            `• Retención Media: ${formatDuration(curr.avgDuration)} por visita | Profundidad de lectura: ${curr.avgScroll}%`,
            `• Principal Canal de Tráfico: ${topChannel} (${topChannelCount} sesiones) | Tráfico Móvil: ${mobilePct}%`
        ].join('\n');

        state.radar.lastExecutiveDraft = emailDraft;
        state.radar.lastPeriodPayload = {
            periodCode,
            periodLabel: cfg.label,
            dateRange: `${fmtDate(currStart)} al ${fmtDate(now)}`,
            siteLabel,
            curr,
            prev,
            channels: sortedChannels.map(([chName, data]) => ({
                name: chName,
                count: data.count,
                avgScroll: Math.round(data.scrollSum / data.count),
                wa: data.wa,
                leads: data.leads
            }))
        };

        if (insightsBody) {
            insightsBody.innerHTML = `
                <div class="insight-bullet-card">
                    📈 <strong>Rendimiento vs. ${escapeHtml(cfg.prevLabel)}:</strong> Se registraron <strong>${curr.totalSessions} sesiones</strong> frente a ${prev.totalSessions} del periodo anterior, logrando <strong>${curr.waClicks} clics a WhatsApp</strong> y <strong>${curr.leadsCount} conversiones a Lead</strong> (${curr.convRate}%).
                </div>
                <div class="insight-bullet-card">
                    🎯 <strong>Canal Ganador & Dispositivos:</strong> La fuente principal en este corte fue <strong>${escapeHtml(topChannel)}</strong> (${topChannelCount} visitas). El <strong>${mobilePct}%</strong> de los usuarios navegó desde teléfono móvil con una lectura promedio del <strong>${curr.avgScroll}%</strong>.
                </div>
                <div class="email-draft-preview-box" id="radarExecutiveEmailDraftBox">${escapeHtml(emailDraft)}</div>
            `;
        }
    }

    function exportRadarPeriodCsv() {
        const periodCode = state.radar.analysisPeriod || '15d';
        const cfg = getAnalysisWindowConfig(periodCode);
        const now = Date.now();
        const currStart = now - cfg.days * 24 * 3600 * 1000;

        const baseSiteSessions = state.radar.siteFilter === 'all'
            ? state.radar.sesiones
            : state.radar.sesiones.filter(s => s.site_key === state.radar.siteFilter);

        const rows = baseSiteSessions.filter(s => {
            const t = new Date(s.last_seen_at || s.started_at).getTime();
            return t >= currStart && t <= now;
        });

        const headers = ['Fecha', 'Sitio', 'Visitante_o_Lead', 'Correo', 'Origen', 'Dispositivo', 'SO', 'Duracion_Seg', 'Scroll_Pct', 'Clics_WhatsApp', 'Formulario', 'Convertido_Lead'];
        const csvLines = [headers.join(',')];

        rows.forEach(s => {
            const line = [
                `"${new Date(s.last_seen_at || s.started_at).toLocaleString('es-MX')}"`,
                `"${(s.dominio || s.site_key || '').replace(/"/g, '""')}"`,
                `"${(s.lead_nombre || s.visitor_id || '').replace(/"/g, '""')}"`,
                `"${(s.lead_correo || '').replace(/"/g, '""')}"`,
                `"${(s.referrer || 'Directo').replace(/"/g, '""')}"`,
                `"${s.device_type || 'desktop'}"`,
                `"${s.os || 'Web'}"`,
                s.duration_seconds || 0,
                s.max_scroll_pct || 0,
                s.whatsapp_clicks || 0,
                s.form_interacted ? 'SI' : 'NO',
                s.converted_to_lead ? 'SI' : 'NO'
            ];
            csvLines.push(line.join(','));
        });

        const blob = new Blob(['\uFEFF' + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `VOX_Radar_Reporte_${periodCode}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`Reporte ${cfg.label} descargado en formato CSV / Excel.`, 'success', 'Reporte Exportado');
    }

    // Eventos de controles del Radar
    if (radarSiteSelect) {
        radarSiteSelect.addEventListener('change', (e) => {
            state.radar.siteFilter = e.target.value;
            applyRadarFilters();
        });
    }

    if (radarPeriodSelect) {
        radarPeriodSelect.addEventListener('change', (e) => {
            state.radar.periodFilter = e.target.value;
            if (['7d', '15d', '30d'].includes(e.target.value)) {
                state.radar.analysisPeriod = e.target.value;
            }
            applyRadarFilters();
        });
    }

    if (radarVisitorFilterSelect) {
        radarVisitorFilterSelect.addEventListener('change', (e) => {
            state.radar.visitorFilter = e.target.value;
            document.querySelectorAll('#radarVisitorPills .radar-pill').forEach(pill => {
                pill.classList.toggle('active', pill.getAttribute('data-visitor-filter') === state.radar.visitorFilter);
            });
            applyRadarFilters();
        });
    }

    document.querySelectorAll('#radarVisitorPills .radar-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const val = pill.getAttribute('data-visitor-filter') || 'all';
            state.radar.visitorFilter = val;
            if (radarVisitorFilterSelect) radarVisitorFilterSelect.value = val;
            document.querySelectorAll('#radarVisitorPills .radar-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            applyRadarFilters();
        });
    });

    const radarSearchInput = document.getElementById('radarSearchInput');
    if (radarSearchInput) {
        radarSearchInput.addEventListener('input', (e) => {
            state.radar.searchQuery = e.target.value;
            applyRadarFilters();
        });
    }

    const vercelProjectSearchInput = document.getElementById('vercelProjectSearchInput');
    if (vercelProjectSearchInput) {
        vercelProjectSearchInput.addEventListener('input', () => {
            renderRadarSitesDeck();
        });
    }

    document.getElementById('btnBackToVercelProjects')?.addEventListener('click', showVercelProjectsGrid);
    document.getElementById('btnSwitchProjectQuick')?.addEventListener('click', showVercelProjectsGrid);

    const btnRadarTabPeriods = document.getElementById('btnRadarTabPeriods');
    [btnRadarTabSessions, btnRadarTabHeatmap, btnRadarTabPeriods].forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            [btnRadarTabSessions, btnRadarTabHeatmap, btnRadarTabPeriods].forEach(b => b?.classList.remove('active'));
            btn.classList.add('active');
            state.radar.activeTab = btn.getAttribute('data-radar-tab') || 'sessions';
            renderRadar();
        });
    });

    document.querySelectorAll('#radarAnalysisPeriodControl .period-seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pVal = btn.getAttribute('data-analysis-period') || '15d';
            state.radar.analysisPeriod = pVal;
            state.radar.periodFilter = pVal;
            if (radarPeriodSelect) radarPeriodSelect.value = pVal;
            applyRadarFilters();
        });
    });

    document.getElementById('btnExportRadarPeriodCsv')?.addEventListener('click', exportRadarPeriodCsv);

    document.getElementById('btnPrintRadarPeriodReport')?.addEventListener('click', () => {
        window.print();
    });

    document.getElementById('btnCopyExecutiveReportText')?.addEventListener('click', () => {
        if (state.radar.lastExecutiveDraft) {
            navigator.clipboard.writeText(state.radar.lastExecutiveDraft).then(() => {
                showToast('Borrador ejecutivo copiado al portapapeles.', 'success', 'Resumen Copiado');
            });
        }
    });

    const enviarReporteCorreoModal = document.getElementById('enviarReporteCorreoModal');
    const enviarReporteCorreoForm = document.getElementById('enviarReporteCorreoForm');
    const closeEnviarReporteModalBtn = document.getElementById('closeEnviarReporteModalBtn');
    const cancelEnviarReporteModalBtn = document.getElementById('cancelEnviarReporteModalBtn');

    function closeEnviarReporteModal() {
        if (enviarReporteCorreoModal) enviarReporteCorreoModal.style.display = 'none';
    }

    if (closeEnviarReporteModalBtn) closeEnviarReporteModalBtn.addEventListener('click', closeEnviarReporteModal);
    if (cancelEnviarReporteModalBtn) cancelEnviarReporteModalBtn.addEventListener('click', closeEnviarReporteModal);

    document.getElementById('btnPreviewGmailReport')?.addEventListener('click', () => {
        if (!state.radar.lastPeriodPayload) {
            renderRadarPeriodAnalysis();
        }
        const payload = state.radar.lastPeriodPayload || {};
        const badgeEl = document.getElementById('modalReportePeriodBadge');
        const descEl = document.getElementById('modalReporteSiteDesc');
        const previewEl = document.getElementById('modalReportePreviewBox');

        if (badgeEl) badgeEl.textContent = payload.periodLabel || 'Corte Ejecutivo';
        if (descEl) descEl.textContent = `Sitio: ${payload.siteLabel || 'Todos'} · ${payload.dateRange || ''}`;
        if (previewEl) previewEl.textContent = state.radar.lastExecutiveDraft || '';

        if (enviarReporteCorreoModal) {
            enviarReporteCorreoModal.style.display = 'flex';
            if (window.lucide) window.lucide.createIcons();
        }
    });

    if (enviarReporteCorreoForm) {
        enviarReporteCorreoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const toEmail = (document.getElementById('reporteDestinatarioInput')?.value || 'vox.iabusinessdeveloper@gmail.com').trim();
            const notaAdicional = (document.getElementById('reporteNotaInput')?.value || '').trim();
            const submitBtn = document.getElementById('btnConfirmSendRadarReport');
            const submitBtnText = document.getElementById('btnConfirmSendRadarReportText');

            if (!state.radar.lastPeriodPayload) {
                renderRadarPeriodAnalysis();
            }
            const payload = {
                ...(state.radar.lastPeriodPayload || {}),
                toEmail,
                notaAdicional
            };

            if (submitBtn) submitBtn.disabled = true;
            if (submitBtnText) submitBtnText.textContent = 'Enviando a Gmail...';

            let sentOk = false;

            // 1. Intentar envío por Serverless Function (/api/radar-report -> Resend + FormSubmit fallback)
            try {
                const apiRes = await fetch('/api/radar-report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (apiRes.ok) {
                    const data = await apiRes.json();
                    if (data && data.success) {
                        sentOk = true;
                    }
                }
            } catch (apiErr) {
                // Continuar al respaldo directo desde navegador si se ejecuta en servidor estático local
            }

            // 2. Respaldo directo desde cliente vía FormSubmit AJAX si /api/radar-report no está activo localmente
            if (!sentOk) {
                try {
                    const c = payload.curr || {};
                    const p = payload.prev || {};
                    const topCh = (payload.channels || [])
                        .slice(0, 5)
                        .map(ch => `${ch.name}: ${ch.count} sesiones (${ch.wa} WA, ${ch.leads} Leads)`)
                        .join(' | ') || 'Directo';

                    const fsPayload = {
                        _subject: `📊 Reporte ${payload.periodLabel || 'Ejecutivo'} — ${payload.siteLabel || 'VOX Radar'}`,
                        _template: 'table',
                        _captcha: 'false',
                        'Corte de Análisis': payload.periodLabel || 'Quincenal',
                        'Rango de Fechas': payload.dateRange || '-',
                        'Sitio Monitoreado': payload.siteLabel || 'Todos',
                        'Sesiones del Periodo': `${c.totalSessions || 0} sesiones (${c.uniqueVisitors || 0} únicos) | Previo: ${p.totalSessions || 0}`,
                        'Clics a WhatsApp': `${c.waClicks || 0} clics | Previo: ${p.waClicks || 0}`,
                        'Leads Convertidos': `${c.leadsCount || 0} leads (Tasa: ${c.convRate || 0}%) | Previo: ${p.leadsCount || 0}`,
                        'Retención y Lectura': `${formatDuration(c.avgDuration || 0)} promedio | ${c.avgScroll || 0}% scroll medio`,
                        'Canales Principales': topCh,
                        'Nota Ejecutiva': notaAdicional || 'Sin nota adicional'
                    };

                    const fsRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(toEmail)}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(fsPayload)
                    });
                    if (fsRes.ok) {
                        sentOk = true;
                    }
                } catch (fsErr) {
                    console.warn('[Radar Client Email Fallback Error]:', fsErr);
                }
            }

            if (submitBtn) submitBtn.disabled = false;
            if (submitBtnText) submitBtnText.textContent = 'Enviar Reporte Ahora';

            if (sentOk) {
                closeEnviarReporteModal();
                showToast(`Reporte ${payload.periodLabel || ''} enviado exitosamente a ${toEmail}.`, 'success', 'Correo Enviado');
            } else {
                showToast('No fue posible conectar con el servidor de correo. Verifica tu conexión a internet.', 'error', 'Error de Envío');
            }
        });
    }

    if (heatmapPageSelect) {
        heatmapPageSelect.addEventListener('change', (e) => {
            state.radar.heatmapPage = e.target.value;
            renderRadarHeatmapAndRankings();
        });
    }

    if (heatmapDeviceSelect) {
        heatmapDeviceSelect.addEventListener('change', (e) => {
            state.radar.heatmapDevice = e.target.value;
            renderRadarHeatmapAndRankings();
        });
    }

    // Botón para ver el <script> del sitio seleccionado en Radar
    if (btnRadarViewScript) {
        btnRadarViewScript.addEventListener('click', () => {
            const selectedKey = (state.radar.siteFilter && state.radar.siteFilter !== 'all')
                ? state.radar.siteFilter
                : 'vox_site_official';

            const displayLabel = getSiteDisplayName(selectedKey);
            abrirModalSnippet({
                site_key: selectedKey,
                cliente_nombre: displayLabel,
                dominio_url: selectedKey
            });
        });
    }

    // Modal: Agregar Sitio Externo de Solo Monitoreo
    function closeNuevoSitioMonitoreoModal() {
        if (nuevoSitioMonitoreoModal) nuevoSitioMonitoreoModal.style.display = 'none';
    }

    if (btnOpenNuevoSitioMonitoreoModal) {
        btnOpenNuevoSitioMonitoreoModal.addEventListener('click', () => {
            if (nuevoSitioMonitoreoForm) nuevoSitioMonitoreoForm.reset();
            if (nuevoSitioMonitoreoModal) nuevoSitioMonitoreoModal.style.display = 'flex';
            if (window.lucide) window.lucide.createIcons();
        });
    }

    if (closeNuevoSitioMonitoreoBtn) closeNuevoSitioMonitoreoBtn.addEventListener('click', closeNuevoSitioMonitoreoModal);
    if (cancelNuevoSitioMonitoreoBtn) cancelNuevoSitioMonitoreoBtn.addEventListener('click', closeNuevoSitioMonitoreoModal);

    if (nuevoSitioMonitoreoForm) {
        nuevoSitioMonitoreoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre_sitio = document.getElementById('monNombreSitio')?.value.trim() || 'Sitio Externo';
            const dominio_url = document.getElementById('monDominioUrl')?.value.trim() || 'https://ejemplo.com';
            const cliente_nombre = document.getElementById('monClienteNombre')?.value.trim() || 'Cliente Directo';
            const notas = document.getElementById('monNotas')?.value.trim() || '';
            const site_key = 'vox_mon_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 8);

            const nuevoSitio = {
                id: 'mon_' + Date.now(),
                created_at: new Date().toISOString(),
                site_key,
                nombre_sitio,
                dominio_url,
                cliente_nombre,
                activo: true,
                notas
            };

            const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();
            if (isConfigured) {
                try {
                    const { data, error } = await window.VOX_SUPABASE.client
                        .from('telemetria_sitios')
                        .insert([{
                            site_key,
                            nombre_sitio,
                            dominio_url,
                            cliente_nombre,
                            activo: true,
                            notas
                        }])
                        .select();
                    if (!error && data && data[0]) {
                        nuevoSitio.id = data[0].id;
                    }
                } catch (err) {
                    // Respaldo local transparente
                }
            }

            state.radar.sitios.unshift(nuevoSitio);
            localStorage.setItem(LOCAL_SITIOS_CACHE, JSON.stringify(state.radar.sitios));

            state.radar.siteFilter = site_key;
            populateRadarSiteSelector();
            applyRadarFilters();
            closeNuevoSitioMonitoreoModal();

            showToast(`Sitio "${nombre_sitio}" agregado al Radar de Monitoreo.`, 'success', 'Sitio Registrado');
            abrirModalSnippet({
                site_key,
                cliente_nombre: `${nombre_sitio} (${cliente_nombre})`,
                dominio_url
            });
        });
    }

    // Sincronización automática cuando otra pestaña del mismo navegador navega por el sitio
    window.addEventListener('storage', (e) => {
        if (e.key === LOCAL_SESSIONS_CACHE || e.key === LOCAL_EVENTS_CACHE) {
            fetchRadarData();
        }
    });

    // Refresco automático ligero del indicador Online cada 15 segundos
    setInterval(() => {
        if (state.user && document.visibilityState === 'visible') {
            fetchRadarData();
        }
    }, 15000);

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

