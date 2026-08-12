// ===== PRELOADER =====
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Detectar si es móvil para ajustar el tiempo
        const isMobile = window.innerWidth <= 560;
        const isSmallMobile = window.innerWidth <= 480;

        // Tiempo ajustado según dispositivo (más rápido en móviles)
        const preloaderTime = isSmallMobile ? 800 : (isMobile ? 1000 : 1800);

        setTimeout(() => {
            preloader.classList.add('hidden');
            // Remover el preloader del DOM después de la transición
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, preloaderTime);
    }
});

// Service Detail Data
const SERVICE_DETAILS = {
    arquitectura: {
        category: "VISIONARY",
        title: "Arquitectura y Visualización Hiperrealista",
        description: "Creamos renders y visualizaciones arquitectónicas de alta calidad que transforman tus proyectos en experiencias visuales impactantes.",
        heroImage: "assets/images/services/arquitectura/Contemporary_urban_waterfront.avif",
        featureImage: "assets/images/services/arquitectura/Residential_architecture_complex.avif",
        overviewImage: "assets/images/services/arquitectura/Sculptural_residential_building.avif",
        fullWidthImage: "assets/images/services/arquitectura/Sustainable_urban_waterfront_dev.avif",
        stripImages: ["assets/images/services/arquitectura/Residential_building_with_brick202608031850.avif", "assets/images/cards/Urban_waterfront_master_plan_design.avif", "assets/images/services/arquitectura/Contemporary_urban_waterfront.avif"],
        largeFeatureImage: "assets/images/services/solutions-portfolio.jpeg",
        overview: `
            <p>En VOX Business Developer, combinamos experiencia técnica con visión artística para crear visualizaciones arquitectónicas que no solo muestran, sino que <strong>inspiran</strong>. Nuestro equipo de expertos utiliza las últimas tecnologías en rendering 3D para producir imágenes hiperrealistas que ayudan a vender proyectos antes de que existan.</p>
            <p>Trabajamos con desarrolladores inmobiliarios, arquitectos y diseñadores para materializar sus visiones con un nivel de detalle que supera las expectativas. Desde exteriores majestuosos hasta interiores acogedores, cada render cuenta una historia única.</p>
        `,
        benefits: [
            { icon: "eye", title: "Visualización Hiperrealista", text: "Renders de alta fidelidad que muestran cada detalle con precisión fotográfica.", image: "assets/images/services/arquitectura/Contemporary_urban_waterfront.avif" },
            { icon: "clock", title: "Entrega Rápida", text: "Proyectos entregados en tiempo récord sin comprometer la calidad.", image: "assets/images/services/arquitectura/Residential_architecture_complex.avif" },
            { icon: "palette", title: "Personalización Total", text: "Cada elemento se adapta a tu visión y necesidades específicas.", image: "assets/images/services/arquitectura/Sculptural_residential_building.avif" },
            { icon: "trending-up", title: "Mayor Conversión", text: "Visualizaciones que aumentan significativamente las ventas.", image: "assets/images/services/arquitectura/Sustainable_urban_waterfront_dev.avif" }
        ],
        process: [
            { step: "01", title: "Briefing", text: "Reunión inicial para entender tus objetivos y requerimientos del proyecto." },
            { step: "02", title: "Modelado", text: "Creación del modelo 3D base con precisión arquitectónica." },
            { step: "03", title: "Texturizado", text: "Aplicación de materiales realistas y configuración de iluminación." },
            { step: "04", title: "Rendering", text: "Generación de imágenes de alta resolución con post-producción." },
            { step: "05", title: "Entrega", text: "Revisión final y entrega de archivos en múltiples formatos." }
        ]
    },
    marketing: {
        category: "GROWTH",
        title: "Marketing Inmobiliario",
        description: "Diseñamos estrategias enfocadas en atraer clientes y acelerar las ventas de tus desarrollos inmobiliarios.",
        heroImage: "assets/images/services/arquitectura/Contemporary_urban_waterfront.avif",
        featureImage: "assets/images/cards/Prueba.jpeg",
        overviewImage: "assets/images/services/arquitectura/Contemporary_urban_waterfront.avif",
        fullWidthImage: "assets/images/cards/Prueba.jpeg",
        stripImages: ["assets/svg/legal-services.svg", "assets/svg/financial-services.svg", "assets/svg/branding-design.svg"],
        largeFeatureImage: "assets/images/services/solutions-portfolio.jpeg",
        overview: `
            <p>El marketing inmobiliario requiere un enfoque especializado que combine creatividad con datos. En VOX, desarrollamos estrategias integrales que conectan tu desarrollo con los compradores correctos en el momento preciso.</p>
            <p>Desde el posicionamiento de marca hasta la generación de leads cualificados, cada aspecto de nuestra estrategia está diseñado para maximizar el retorno de inversión y acelerar el ciclo de ventas.</p>
        `,
        benefits: [
            { icon: "target", title: "Segmentación Precisa", text: "Llegamos a tu audiencia ideal con mensajes personalizados.", image: "assets/images/services/arquitectura/Contemporary_urban_waterfront.avif" },
            { icon: "bar-chart", title: "Data-Driven", text: "Decisiones basadas en análisis y métricas en tiempo real.", image: "assets/images/services/arquitectura/Residential_architecture_complex.avif" },
            { icon: "megaphone", title: "Campañas Integrales", text: "Presencia coordinada en todos los canales digitales.", image: "assets/images/services/arquitectura/Sculptural_residential_building.avif" },
            { icon: "users", title: "Lead Generation", text: "Sistemas que generan y nutren prospectos cualificados.", image: "assets/images/services/arquitectura/Sustainable_urban_waterfront_dev.avif" }
        ],
        process: [
            { step: "01", title: "Análisis", text: "Evaluación del mercado, competencia y audiencia objetivo." },
            { step: "02", title: "Estrategia", text: "Desarrollo del plan de marketing y presupuesto asignado." },
            { step: "03", title: "Ejecución", text: "Implementación de campañas en todos los canales." },
            { step: "04", title: "Optimización", text: "Ajustes continuos basados en performance." },
            { step: "05", title: "Reporte", text: "Análisis de resultados y recomendaciones." }
        ]
    },
    juridico: {
        category: "NO RISK",
        title: "Servicios Legales Inmobiliarios",
        description: "Brindamos respaldo legal completo para empresas y desarrolladores inmobiliarios en todas las etapas del proyecto.",
        heroImage: "assets/images/services/legal/hero-image corporativa-legal.jpeg?v=2",
        featureImage: "assets/images/cards/Urban_waterfront_master_plan_design.avif",
        overviewImage: "assets/images/services/legal/descripcion-legal-corporativa.jpeg",
        fullWidthImage: "assets/images/services/arquitectura/Sculptural_residential_building.avif",
        stripImages: ["assets/images/services/arquitectura/Contemporary_urban_waterfront.avif", "assets/images/services/arquitectura/Sustainable_urban_waterfront_dev.avif", "assets/images/services/arquitectura/Residential_architecture_complex.avif"],
        largeFeatureImage: "assets/images/hero/hero_abstract.jpg",
        overview: `
            <p>El éxito de un desarrollo inmobiliario depende no solo de su diseño, sino de su sólida estructura legal. Nuestro equipo jurídico especializado garantiza que cada aspecto de tu proyecto cumpla con las normativas vigentes y esté protegido legalmente.</p>
            <p>Desde la adquisición del terreno hasta la entrega de unidades, acompañamos cada etapa con asesoría experta que minimiza riesgos y maximiza seguridad jurídica.</p>
        `,
        benefits: [
            { icon: "building-2", title: "Constitución de Sociedades Mercantiles", text: "Creación y estructuración legal de empresas con optimización fiscal.", image: "assets/images/services/legal/constitucion de sociedades.jpeg" },
            { icon: "users", title: "Contratos Laborales y de Proveedores", text: "Elaboración de contratos laborales y acuerdos comerciales.", image: "assets/images/services/legal/contratos laborales y provedores.jpeg" },
            { icon: "file-signature", title: "Contratos en General", text: "Redacción y revisión de todo tipo de contratos corporativos.", image: "assets/images/services/legal/contratos en general.jpeg" },
            { icon: "clipboard-list", title: "Actas de Asamblea", text: "Documentación legal de asambleas y reuniones societarias.", image: "assets/images/services/legal/actas de asamblea.jpeg" },
            { icon: "trending-up", title: "Estrategias de Aumento de Capital", text: "Asesoría legal para reestructuración y aumento de capital.", image: "assets/images/services/legal/estrategia de aumento de capital.jpeg" },
            { icon: "shield-check", title: "Prevención de Lavado de Dinero", text: "Gestión de PLD y avisos de actividad vulnerable.", image: "assets/images/services/legal/prevencion de lavado de dinero.jpeg" },
            { icon: "search", title: "Revisión de Inmuebles", text: "Análisis legal de inmuebles para desarrollo de proyectos.", image: "assets/images/services/legal/revision de inmuebles.jpeg" }
        ],
        process: [
            { step: "01", title: "Diagnóstico", text: "Revisión de situación legal actual del proyecto." },
            { step: "02", title: "Planeación", text: "Estructuración legal del desarrollo." },
            { step: "03", title: "Documentación", text: "Preparación de todos los documentos necesarios." },
            { step: "04", title: "Gestión", text: "Trámites ante autoridades y notarías." },
            { step: "05", title: "Cierre", text: "Formalización de contratos y escrituras." }
        ]
    },
    contable: {
        category: "FINANCE",
        title: "Servicios Contables y Fiscales Inmobiliarios",
        description: "Optimizamos la administración financiera y el cumplimiento fiscal de tus desarrollos inmobiliarios.",
        heroImage: "assets/images/services/arquitectura/Sustainable_urban_waterfront_dev.avif",
        featureImage: "assets/images/services/arquitectura/Contemporary_urban_waterfront.avif",
        overviewImage: "assets/images/services/arquitectura/Sustainable_urban_waterfront_dev.avif",
        fullWidthImage: "assets/images/cards/Urban_waterfront_master_plan_design.avif",
        stripImages: ["assets/images/services/arquitectura/Residential_architecture_complex.avif", "assets/images/services/arquitectura/Sculptural_residential_building.avif", "assets/images/services/arquitectura/Residential_building_with_brick202608031850.avif"],
        largeFeatureImage: "assets/images/hero/hero_abstract.jpg",
        overview: `
            <p>La eficiencia financiera es clave para el éxito de cualquier desarrollo inmobiliario. Nuestro equipo contable especializado en el sector inmobiliario optimiza tu estructura fiscal y asegura el cumplimiento de todas las obligaciones tributarias.</p>
            <p>Desde la contabilidad operativa hasta la planeación fiscal estratégica, proporcionamos herramientas y análisis que maximizan la rentabilidad de tu proyecto.</p>
        `,
        benefits: [
            { icon: "calculator", title: "Optimización Fiscal", text: "Estrategias legales para minimizar la carga tributaria.", image: "assets/images/services/arquitectura/Contemporary_urban_waterfront.avif" },
            { icon: "pie-chart", title: "Control Financiero", text: "Visión clara y detallada de la salud financiera.", image: "assets/images/services/arquitectura/Residential_architecture_complex.avif" },
            { icon: "file-check", title: "Cumplimiento", text: "Cero errores en declaraciones y pagos.", image: "assets/images/services/arquitectura/Sculptural_residential_building.avif" },
            { icon: "trending-up", title: "Rentabilidad", text: "Análisis para maximizar el retorno de inversión.", image: "assets/images/services/arquitectura/Sustainable_urban_waterfront_dev.avif" }
        ],
        process: [
            { step: "01", title: "Diagnóstico", text: "Análisis de situación fiscal y contable." },
            { step: "02", title: "Estructuración", text: "Diseño de esquema fiscal óptimo." },
            { step: "03", title: "Implementación", text: "Puesta en marcha de sistemas contables." },
            { step: "04", title: "Seguimiento", text: "Monitoreo continuo y reportes periódicos." },
            { step: "05", title: "Optimización", text: "Ajustes para mejorar eficiencia fiscal." }
        ]
    },
    branding: {
        category: "IDENTITY",
        title: "Branding y Desarrollo de Marca",
        description: "Construimos marcas sólidas que generan confianza y posicionamiento en el mercado.",
        heroImage: "assets/images/services/arquitectura/Residential_architecture_complex.avif",
        featureImage: "assets/images/services/arquitectura/Sculptural_residential_building.avif",
        overviewImage: "assets/images/services/arquitectura/Residential_architecture_complex.avif",
        fullWidthImage: "assets/images/services/arquitectura/Sustainable_urban_waterfront_dev.avif",
        stripImages: ["assets/svg/arquitectura.svg", "assets/svg/marketing-strategy.svg", "assets/svg/branding-design.svg"],
        largeFeatureImage: "assets/images/hero/hero_abstract.jpg",
        overview: `
            <p>Una marca fuerte es el activo más valioso de cualquier empresa. En VOX, creamos identidades de marca que no solo se ven, sino que se sienten y generan conexiones emocionales duraderas con tu audiencia.</p>
            <p>Desde el naming hasta la implementación completa, cada elemento de tu marca es diseñado estratégicamente para comunicar tus valores y diferenciarte en un mercado saturado.</p>
        `,
        benefits: [
            { icon: "star", title: "Identidad Única", text: "Marcas memorables que destacan en el mercado.", image: "assets/images/services/arquitectura/Contemporary_urban_waterfront.avif" },
            { icon: "heart", title: "Conexión Emocional", text: "Narrativas que resuenan con tu audiencia.", image: "assets/images/services/arquitectura/Residential_architecture_complex.avif" },
            { icon: "layers", title: "Cohesión Visual", text: "Sistema de diseño consistente en todos los touchpoints.", image: "assets/images/services/arquitectura/Sculptural_residential_building.avif" },
            { icon: "arrow-up", title: "Valor de Marca", text: "Incremento del valor percibido de tu empresa.", image: "assets/images/services/arquitectura/Sustainable_urban_waterfront_dev.avif" }
        ],
        process: [
            { step: "01", title: "Investigación", text: "Análisis de mercado, competencia y audiencia." },
            { step: "02", title: "Estrategia", text: "Definición de posicionamiento y personalidad de marca." },
            { step: "03", title: "Diseño", text: "Creación de identidad visual y verbal." },
            { step: "04", title: "Implementación", text: "Desarrollo de assets y guías de marca." },
            { step: "05", title: "Lanzamiento", text: "Rollout estratégico de la nueva marca." }
        ]
    },
    desarrollo: {
        category: "DIGITAL",
        title: "Desarrollo Web",
        description: "Creamos plataformas digitales enfocadas en la conversión y la experiencia del usuario.",
        heroImage: "assets/images/cards/Urban_waterfront_master_plan_design.avif",
        featureImage: "assets/images/services/arquitectura/Sustainable_urban_waterfront_dev.avif",
        overviewImage: "assets/images/cards/Urban_waterfront_master_plan_design.avif",
        fullWidthImage: "assets/images/services/arquitectura/Contemporary_urban_waterfront.avif",
        stripImages: ["assets/images/services/arquitectura/Residential_building_with_brick202608031850.avif", "assets/images/services/arquitectura/Residential_architecture_complex.avif", "assets/images/services/arquitectura/Sculptural_residential_building.avif"],
        largeFeatureImage: "assets/images/hero/hero_abstract.jpg",
        overview: `
            <p>En la era digital, tu sitio web es tu vitrina principal. Desarrollamos plataformas web que no solo impresionan visualmente, sino que convierten visitantes en clientes mediante experiencias de usuario optimizadas.</p>
            <p>Desde landing pages de alta conversión hasta plataformas complejas, cada línea de código está escrita con el objetivo de maximizar el rendimiento y la satisfacción del usuario.</p>
        `,
        benefits: [
            { icon: "smartphone", title: "Responsive Design", text: "Sitios que funcionan perfectamente en todos los dispositivos.", image: "assets/images/services/arquitectura/Contemporary_urban_waterfront.avif" },
            { icon: "zap", title: "Velocidad Óptima", text: "Carga rápida para mejor experiencia y SEO.", image: "assets/images/services/arquitectura/Residential_architecture_complex.avif" },
            { icon: "mouse-pointer", title: "UX Centrado", text: "Interfaces intuitivas diseñadas para convertir.", image: "assets/images/services/arquitectura/Sculptural_residential_building.avif" },
            { icon: "lock", title: "Seguridad", text: "Protección contra amenazas y datos seguros.", image: "assets/images/services/arquitectura/Sustainable_urban_waterfront_dev.avif" }
        ],
        process: [
            { step: "01", title: "Discovery", text: "Entendimiento de objetivos y requerimientos." },
            { step: "02", title: "UX/UI Design", text: "Diseño de wireframes y prototipos interactivos." },
            { step: "03", title: "Desarrollo", text: "Programación con las mejores prácticas." },
            { step: "04", title: "Testing", text: "Pruebas de funcionalidad y rendimiento." },
            { step: "05", title: "Lanzamiento", text: "Deploy y soporte post-lanzamiento." }
        ]
    },
    interiorismo: {
        category: "SPACES",
        title: "Interiorismo Comercial y Corporativo",
        description: "Diseñamos espacios que fortalecen la experiencia del cliente y reflejan la identidad de tu marca.",
        heroImage: "assets/images/services/arquitectura/Sculptural_residential_building.avif",
        featureImage: "assets/images/services/arquitectura/Residential_building_with_brick202608031850.avif",
        overviewImage: "assets/images/services/arquitectura/Sculptural_residential_building.avif",
        fullWidthImage: "assets/images/services/arquitectura/Residential_architecture_complex.avif",
        stripImages: ["assets/images/services/arquitectura/Contemporary_urban_waterfront.avif", "assets/images/services/arquitectura/Sustainable_urban_waterfront_dev.avif", "assets/images/cards/Urban_waterfront_master_plan_design.avif"],
        largeFeatureImage: "assets/images/hero/hero_abstract.jpg",
        overview: `
            <p>El diseño de espacios comerciales y corporativos tiene un impacto directo en la percepción de tu marca y la experiencia de tus clientes. Creamos interiores que no solo son funcionales, sino que cuentan tu historia.</p>
            <p>Desde oficinas corporativas hasta espacios comerciales, cada proyecto es diseñado para optimizar el flujo, mejorar la productividad y crear ambientes que inspiran.</p>
        `,
        benefits: [
            { icon: "home", title: "Espacios Funcionales", text: "Diseño que optimiza el uso de cada metro." },
            { icon: "users", title: "Experiencia del Usuario", text: "Ambientes que mejoran la interacción humana." },
            { icon: "palette", title: "Identidad Espacial", text: "Interiores que reflejan tu marca." },
            { icon: "lightbulb", title: "Innovación", text: "Soluciones creativas y vanguardistas." }
        ],
        process: [
            { step: "01", title: "Análisis", text: "Estudio de necesidades y flujo de usuarios." },
            { step: "02", title: "Concepto", text: "Desarrollo de concepto de diseño." },
            { step: "03", title: "Diseño", text: "Planos, renders y selección de materiales." },
            { step: "04", title: "Ejecución", text: "Supervisión de construcción y montaje." },
            { step: "05", title: "Entrega", text: "Finalización y handover del espacio." }
        ]
    },
    auditorias: {
        category: "ANALYSIS",
        title: "Auditorías Empresariales",
        description: "Evaluamos la operación de tu empresa para detectar oportunidades de mejora y optimización.",
        heroImage: "assets/images/cards/Urban_waterfront_master_plan_design.avif",
        featureImage: "assets/images/services/arquitectura/Contemporary_urban_waterfront.avif",
        overviewImage: "assets/images/cards/Urban_waterfront_master_plan_design.avif",
        fullWidthImage: "assets/images/services/arquitectura/Sustainable_urban_waterfront_dev.avif",
        stripImages: ["assets/images/services/arquitectura/Residential_architecture_complex.avif", "assets/images/services/arquitectura/Sculptural_residential_building.avif", "assets/images/services/arquitectura/Residential_building_with_brick202608031850.avif"],
        largeFeatureImage: "assets/images/services/solutions-portfolio.jpeg",
        overview: `
            <p>El éxito empresarial requiere una visión clara de la operación interna. Nuestras auditorías comprehensivas analizan cada aspecto de tu negocio para identificar áreas de mejora y oportunidades de optimización.</p>
            <p>Desde procesos operativos hasta estructura financiera, proporcionamos insights accionables que transforman la eficiencia de tu organización.</p>
        `,
        benefits: [
            { icon: "search", title: "Diagnóstico Preciso", text: "Identificación exacta de áreas de mejora." },
            { icon: "target", title: "Enfoque Estratégico", text: "Priorización de acciones con mayor impacto." },
            { icon: "file-text", title: "Reportes Detallados", text: "Documentación completa de hallazgos." },
            { icon: "arrow-up", title: "Mejora Continua", text: "Roadmap para optimización sostenida." }
        ],
        process: [
            { step: "01", title: "Evaluación", text: "Análisis exhaustivo de la operación actual." },
            { step: "02", title: "Diagnóstico", text: "Identificación de brechas y oportunidades." },
            { step: "03", title: "Recomendaciones", text: "Propuesta de mejoras priorizadas." },
            { step: "04", title: "Implementación", text: "Apoyo en ejecución de cambios." },
            { step: "05", title: "Seguimiento", text: "Monitoreo de resultados y ajustes." }
        ]
    }
};

// Load service content based on URL parameter
function loadServiceContent() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');
    
    if (!serviceId || !SERVICE_DETAILS[serviceId]) {
        // Default to first service if no valid ID
        loadServiceData('arquitectura');
        return;
    }
    
    loadServiceData(serviceId);
}

function loadServiceData(serviceId) {
    const service = SERVICE_DETAILS[serviceId];
    
    // Update hero section
    document.getElementById('serviceCategory').textContent = service.category;
    document.getElementById('serviceTitle').textContent = service.title;
    document.getElementById('serviceDescription').textContent = service.description;
    document.getElementById('heroBg').style.backgroundImage = `url('${service.heroImage}')`;
    
    // Update feature image
    if (document.getElementById('featureImage1')) {
        document.getElementById('featureImage1').src = service.featureImage;
    }
    
    // Update overview
    document.getElementById('overviewContent').innerHTML = service.overview;
    
    // Update overview image
    if (document.getElementById('overviewImage')) {
        document.getElementById('overviewImage').src = service.overviewImage;
    }
    
    // Update full width image
    if (document.getElementById('fullWidthImg1')) {
        document.getElementById('fullWidthImg1').src = service.fullWidthImage;
    }
    
    // Large feature image estático en HTML, no se actualiza dinámicamente
    
    // Update benefits
    const benefitsGrid = document.getElementById('benefitsGrid');
    const benefitsTitle = document.getElementById('benefitsTitle');
    const benefitsOverline = document.querySelector('#benefits .overline');
    if (benefitsTitle) {
        benefitsTitle.textContent = service.title;
    }
    if (benefitsOverline) {
        benefitsOverline.textContent = service.category;
    }
    benefitsGrid.innerHTML = '';
    service.benefits.forEach((benefit, index) => {
        const imageHtml = benefit.image ? `<div class="benefit-image"><img src="${benefit.image}" alt="${benefit.title}"></div>` : '';
        benefitsGrid.innerHTML += `
            <div class="benefit-card reveal" style="--d:${index * 0.15}s">
                ${imageHtml}
                <div class="benefit-content">
                    <div class="benefit-text-content">
                        <h3 class="benefit-title">${benefit.title}</h3>
                        <p class="benefit-text">${benefit.text}</p>
                    </div>
                    <div class="benefit-icon">
                        <i data-lucide="${benefit.icon}"></i>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Update process timeline
    const processTimeline = document.getElementById('processTimeline');
    processTimeline.innerHTML = '';
    service.process.forEach((step, index) => {
        const isEven = index % 2 === 0;
        processTimeline.innerHTML += `
            <div class="process-step reveal" style="--d:${index * 0.1}s">
                <div class="process-number">${step.step}</div>
                <div class="process-content">
                    <h3 class="process-title">${step.title}</h3>
                    <p class="process-text">${step.text}</p>
                </div>
            </div>
        `;
    });
    
    // Update gallery
    const galleryGrid = document.getElementById('galleryGrid');
    const gallerySection = document.getElementById('gallery');
    if (service.gallery && service.gallery.length > 0) {
        gallerySection.style.display = 'block';
        galleryGrid.innerHTML = '';
        service.gallery.forEach((image, index) => {
            galleryGrid.innerHTML += `
                <div class="gallery-item reveal" style="--d:${index * 0.1}s">
                    <img src="${image}" alt="Proyecto ${index + 1}">
                    <div class="gallery-overlay">
                        <span class="gallery-label">Proyecto ${index + 1}</span>
                    </div>
                </div>
            `;
        });
    } else {
        gallerySection.style.display = 'none';
    }

    // Hide stats section for all services
    const statsSection = document.getElementById('stats');
    statsSection.style.display = 'none';
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Initialize scroll animations
    initScrollAnimations();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    loadServiceContent();
    
    // ===== MOBILE MENU =====
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            menuToggle.classList.toggle('active');
        });

        // Close menu when clicking on a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                menuToggle.classList.remove('active');
            });
        });
    }

    // ===== NAVBAR SCROLL =====
    const navbar = document.getElementById('navbar');
    function onScroll() {
        const y = window.scrollY;
        navbar.classList.toggle('scrolled', y > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
});

// Scroll animations
function initScrollAnimations() {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}
