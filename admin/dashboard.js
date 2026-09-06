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
        currentView: 'pipeline', // 'pipeline', 'table', 'analytics'
        statusFilter: 'all',
        searchTerm: '',
        charts: {}
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

    const btnViewKanban = document.getElementById('btnViewKanban');
    const btnViewTable = document.getElementById('btnViewTable');
    const btnViewCharts = document.getElementById('btnViewCharts');

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
                setAuthenticatedUser({ email: localUser });
            } else {
                showLogin();
            }
        }
    }

    function showLogin() {
        state.user = null;
        loginWrapper.style.display = 'flex';
        dashboardLayout.style.display = 'none';
    }

    function setAuthenticatedUser(user) {
        state.user = user;
        userDisplayEmail.textContent = user.email || 'Admin';
        userAvatar.textContent = (user.email ? user.email.charAt(0) : 'A').toUpperCase();

        loginWrapper.style.display = 'none';
        dashboardLayout.style.display = 'flex';

        fetchLeads();
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

    function setupRealtimeSubscription() {
        const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();
        if (!isConfigured) return;

        window.VOX_SUPABASE.client
            .channel('leads-realtime-pro')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
                fetchLeads();
            })
            .subscribe();
    }

    // -------------------------------------------------------------
    // 3. CAMBIO DE VISTAS (Kanban, Tabla, Gráficos)
    // -------------------------------------------------------------
    function switchView(viewName) {
        state.currentView = viewName;

        // Actualizar botones de topbar
        [btnViewKanban, btnViewTable, btnViewCharts].forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => item.classList.remove('active'));

        kanbanViewContainer.style.display = 'none';
        tableViewContainer.style.display = 'none';
        analyticsViewContainer.style.display = 'none';

        if (viewName === 'pipeline') {
            btnViewKanban.classList.add('active');
            document.querySelector('.sidebar-nav .nav-item[data-view="pipeline"]')?.classList.add('active');
            kanbanViewContainer.style.display = 'block';
            currentViewTitle.textContent = 'Pipeline de Prospectos (Kanban)';
            renderKanban();
        } else if (viewName === 'table') {
            btnViewTable.classList.add('active');
            document.querySelector('.sidebar-nav .nav-item[data-view="table"]')?.classList.add('active');
            tableViewContainer.style.display = 'block';
            currentViewTitle.textContent = 'Bandeja de Leads (Tabla)';
            renderTable();
        } else if (viewName === 'analytics') {
            btnViewCharts.classList.add('active');
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

    btnViewKanban.addEventListener('click', () => switchView('pipeline'));
    btnViewTable.addEventListener('click', () => switchView('table'));
    btnViewCharts.addEventListener('click', () => switchView('analytics'));

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
        const columns = ['nuevo', 'en_revision', 'contactado', 'cotizado', 'cerrado'];

        columns.forEach(col => {
            const container = document.getElementById(`cards-${col}`);
            const counter = document.getElementById(`count-${col}`);
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
                    </div>
                </td>
            `;

            leadsTableBody.appendChild(tr);
        });

        if (window.lucide) window.lucide.createIcons();

        document.querySelectorAll('.view-btn, .wa-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => openLeadModal(btn.getAttribute('data-id')));
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

    saveLeadChangesBtn.addEventListener('click', async () => {
        if (!state.activeLead) return;

        const newStatus = modalStatusSelect.value;
        const newNotas = modalNotas.value.trim();

        saveLeadChangesBtn.disabled = true;
        saveLeadChangesBtn.innerHTML = '<span>Guardando...</span>';

        const isConfigured = window.VOX_SUPABASE && window.VOX_SUPABASE.isConfigured();

        if (isConfigured) {
            try {
                await window.VOX_SUPABASE.client
                    .from('leads')
                    .update({ estado: newStatus, notas: newNotas })
                    .eq('id', state.activeLead.id);
            } catch (err) {
                console.error('Error al actualizar lead en Supabase:', err);
            }
        }

        state.activeLead.estado = newStatus;
        state.activeLead.notas = newNotas;

        const localLeads = window.LeadService.getLocalLeads();
        const index = localLeads.findIndex(l => String(l.id) === String(state.activeLead.id));
        if (index !== -1) {
            localLeads[index].estado = newStatus;
            localLeads[index].notas = newNotas;
            localStorage.setItem('vox_leads_cache', JSON.stringify(localLeads));
        }

        saveLeadChangesBtn.disabled = false;
        saveLeadChangesBtn.innerHTML = '<i data-lucide="save"></i> <span>Guardar Cambios</span>';
        if (window.lucide) window.lucide.createIcons();

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
