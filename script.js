// ===== PRELOADER =====
document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    // Detectar si es móvil para ajustar el tiempo
    const isMobile = window.innerWidth <= 560;
    const isSmallMobile = window.innerWidth <= 480;

    // Tiempo ajustado según dispositivo (más rápido en móviles)
    const preloaderTime = isSmallMobile ? 500 : (isMobile ? 700 : 1000);

    setTimeout(() => {
        preloader.classList.add('hidden');
        // Remover el preloader del DOM después de la transición
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }, preloaderTime);
});

// ===== HERO CAROUSEL =====
const HERO_SLIDES = [
    "assets/svg/architecture-render.svg",
    "assets/svg/marketing-strategy.svg",
    "assets/svg/legal-services.svg",
    "assets/svg/financial-services.svg",
    "assets/svg/branding-design.svg",
];

const initHeroCarousel = () => {
    const carousel = document.getElementById('heroCarousel');
    const dotsContainer = document.getElementById('heroDots');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');

    if (!carousel || HERO_SLIDES.length === 0) return;

    // Crear slides y dots
    HERO_SLIDES.forEach((slide, index) => {
        const slideEl = document.createElement('div');
        slideEl.className = `hero-slide ${index === 0 ? 'active' : ''}`;
        slideEl.innerHTML = `
            <img src="${slide}" alt="" />
            <div class="hero-slide-overlay"></div>
        `;
        carousel.appendChild(slideEl);

        const dot = document.createElement('div');
        dot.className = `hero-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    let currentIndex = 0;

    const goToSlide = (index) => {
        slides[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');
        currentIndex = index;
        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
    };

    const nextSlide = () => {
        const nextIndex = (currentIndex + 1) % slides.length;
        goToSlide(nextIndex);
    };

    const prevSlide = () => {
        const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
        goToSlide(prevIndex);
    };

    // Start autoplay - inicia solo cuando la sección es visible
    let autoPlayInterval = null;
    let isCarouselVisible = false;

    const startAutoPlay = () => {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 6000);
    };

    const stopAutoPlay = () => {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    };

    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', () => {
        stopAutoPlay();
        prevSlide();
        if (isCarouselVisible) startAutoPlay();
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        stopAutoPlay();
        nextSlide();
        if (isCarouselVisible) startAutoPlay();
    });

    // IntersectionObserver para detectar cuando la sección es visible
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isCarouselVisible) {
                    isCarouselVisible = true;
                    if (slides.length > 1) {
                        startAutoPlay();
                    }
                } else if (!entry.isIntersecting && isCarouselVisible) {
                    isCarouselVisible = false;
                    if (autoPlayInterval) {
                        stopAutoPlay();
                        autoPlayInterval = null;
                    }
                }
            });
        }, { threshold: 0.3 });

        sectionObserver.observe(heroSection);
    }
};

// Initialize hero carousel when DOM is ready
document.addEventListener('DOMContentLoaded', initHeroCarousel);

// ===== ABOUT CAROUSEL =====
const aboutCarousel = () => {
    const track = document.querySelector('.about-carousel-track');
    const points = document.querySelectorAll('.about-point');
    const dots = document.querySelectorAll('.about-carousel-dots .dot');

    if (!track || points.length === 0) return;

    let currentIndex = 0;
    const intervalTime = 3500; // 3.5 segundos por slide

    const isMobile = () => window.innerWidth <= 560;

    const showPoint = (index) => {
        // Sistema de clases para todas las cards
        points.forEach((point, i) => {
            point.classList.remove('active');
        });
        points[index].classList.add('active');

        if (isMobile()) {
            // Sistema de clases para móvil (ya manejado arriba)
        } else {
            // Sistema de translateX para desktop
            const cardWidth = 380;
            track.style.transform = `translateX(-${index * cardWidth}px)`;
        }

        // Actualizar dots
        dots.forEach((dot, i) => {
            dot.classList.remove('active');
        });
        dots[index].classList.add('active');

        currentIndex = index;
    };

    const nextPoint = () => {
        const nextIndex = (currentIndex + 1) % points.length;
        showPoint(nextIndex);
    };

    // Auto-rotate - inicia solo cuando la sección es visible
    let carouselInterval = null;
    let isCarouselVisible = false;

    const startAutoPlay = () => {
        if (carouselInterval) clearInterval(carouselInterval);
        carouselInterval = setInterval(nextPoint, intervalTime);
    };

    const stopAutoPlay = () => {
        if (carouselInterval) {
            clearInterval(carouselInterval);
            carouselInterval = null;
        }
    };

    // IntersectionObserver para detectar cuando la sección es visible
    const aboutSection = document.getElementById('nosotros');
    if (aboutSection) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isCarouselVisible) {
                    isCarouselVisible = true;
                    startAutoPlay();
                } else if (!entry.isIntersecting && isCarouselVisible) {
                    isCarouselVisible = false;
                    stopAutoPlay();
                }
            });
        }, { threshold: 0.3 });

        sectionObserver.observe(aboutSection);
    }

    // Click on dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopAutoPlay();
            showPoint(index);
            if (isCarouselVisible) startAutoPlay();
        });
    });

    // Pause on hover
    track.addEventListener('mouseenter', () => {
        stopAutoPlay();
    });

    track.addEventListener('mouseleave', () => {
        if (isCarouselVisible) startAutoPlay();
    });

    // Recalcular al cambiar tamaño de ventana
    window.addEventListener('resize', () => {
        showPoint(currentIndex);
    });
};

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', aboutCarousel);

// ===== DATA =====
const WHATSAPP = "5215554077643"; // número actualizado
const WA_URL = `https://wa.me/${WHATSAPP}`;

const MARQUEE = ["Arquitectura","Diseño","Estrategia","Visualización","Marketing","Branding","Desarrollo","Consultoría"];

const SERVICES = [
    {icon:"building-2",title:"Arquitectura y Visualización Hiperrealista",text:"Creamos renders y visualizaciones arquitectónicas de alta calidad.",image:"assets/servicios/arquitectura y visualizacion.jpeg"},
    {icon:"megaphone",title:"Marketing Inmobiliario",text:"Diseñamos estrategias enfocadas en atraer clientes y acelerar las ventas.",image:"assets/servicios/marketing inmobiliario.jpeg"},
    {icon:"scale",title:"Servicios Jurídicos Inmobiliarios",text:"Brindamos respaldo legal para empresas y desarrolladores.",image:"assets/servicios/servicios juridicos inmobiliarios.jpeg"},
    {icon:"calculator",title:"Servicios Contables y Fiscales Inmobiliarios",text:"Optimizamos la administración financiera y el cumplimiento legal.",image:"assets/servicios/contable y fiscal.jpeg"},
    {icon:"palette",title:"Branding y Desarrollo de Marca",text:"Construimos marcas sólidas que generan confianza y posicionamiento en el mercado.",image:"assets/servicios/branding y desarrollo de marca.jpeg"},
    {icon:"code-2",title:"Desarrollo Web",text:"Creamos plataformas digitales enfocadas en la conversión.",image:"assets/servicios/desarrollo web.jpeg"},
    {icon:"layout",title:"Interiorismo Comercial y Corporativo",text:"Diseñamos espacios que fortalecen la experiencia del cliente.",image:"assets/servicios/interiorismo comercial y corporativo.jpeg"},
    {icon:"search-check",title:"Auditorias empresariales",text:"Evaluamos la operación para detectar oportunidades de mejora.",image:"assets/servicios/auditorias empresariales.jpeg"},
];

// SKILLS eliminado según análisis - redundante con Servicios

// VISUAL_SERVICES eliminado según análisis - redundante con Servicios

// Service ID mapping for detail pages
const SERVICE_IDS = [
    'arquitectura',
    'marketing',
    'juridico',
    'contable',
    'branding',
    'desarrollo',
    'interiorismo',
    'auditorias'
];

const METHODOLOGY = [
    {
        number: "01",
        title: "DIAGNOSTICAR",
        subtitle: "Entender dónde está el negocio y dónde está perdiendo valor.",
        tags: ["Diagnóstico", "Análisis", "Evaluación"],
        image: "assets/metodologia/01-diagnosticar.jpeg"
    },
    {
        number: "02",
        title: "ESTRUCTURAR",
        subtitle: "Definir hacia dónde debe crecer y cómo competir.",
        tags: ["Estrategia", "Planificación", "Competencia"],
        image: "assets/metodologia/02-estructurar.jpeg"
    },
    {
        number: "03",
        title: "DISEÑAR",
        subtitle: "Construir los sistemas legales, financieros, administrativos y comerciales.",
        tags: ["Sistemas", "Legal", "Financiero", "Administrativo"],
        image: "assets/metodologia/03-diseñar.jpeg"
    },
    {
        number: "04",
        title: "EJECUTAR",
        subtitle: "Convertir el proyecto o empresa en una marca relevante.",
        tags: ["Branding", "Posicionamiento", "Marca"],
        image: "assets/metodologia/04-ejecutar.jpeg"
    },
    {
        number: "05",
        title: "POSICIONAR",
        subtitle: "Generar demanda, prospectos y oportunidades reales de negocio.",
        tags: ["Ventas", "Demanda", "Prospectos"],
        image: "assets/metodologia/05-posicionar.jpeg"
    },
    {
        number: "06",
        title: "ESCALAR",
        subtitle: "Medir, corregir y escalar lo que funciona.",
        tags: ["Medición", "Corrección", "Escalabilidad"],
        image: "assets/metodologia/06-escalar.jpeg"
    }
];

const STATS = [
    {value:120,suffix:"+",label:"Clientes atendidos"},
    {value:340,suffix:"+",label:"Proyectos entregados"},
    {value:15,suffix:" años",label:"De experiencia"},
    {value:24,prefix:"< ",suffix:"h",label:"Tiempo de respuesta"},
];

const PROJECTS = [
    {tag:"Arquitectura",title:"Visualización Hiperrealista",text:"Renders arquitectónicos de alta fidelidad para proyectos residenciales.",image:"assets/svg/architecture-render.svg",size:"large"},
    {tag:"Interiorismo",title:"Diseño de Espacios Comerciales",text:"Concepto interiorismo para showroom corporativo.",image:"assets/svg/marketing-strategy.svg",size:"medium"},
    {tag:"Branding",title:"Identidad Corporativa",text:"Desarrollo de marca completa para firma de construcción.",image:"assets/svg/legal-services.svg",size:"medium"},
    {tag:"Desarrollo Web",title:"Plataforma Digital Inmobiliaria",text:"Web de alta conversión para desarrolladora.",image:"assets/svg/financial-services.svg",size:"large"},
    {tag:"Estrategia",title:"Consultoría de Negocios",text:"Planeación comercial para firma de arquitectura.",image:"assets/svg/branding-design.svg",size:"medium"},
];

const TESTIMONIALS = [
    {name:"Andrés Molina",company:"CEO, Grupo Aurora",rating:5,text:"El nivel de estrategia y ejecución de VOX transformó por completo nuestra presencia digital. Resultados desde el primer mes.",image:"assets/images/logos/vox_fox.png",companyLogo:"assets/images/logos/vox_logo_4k.png"},
    {name:"Valentina Ríos",company:"CMO, Nova Retail",rating:5,text:"Un equipo que entiende de negocio, no solo de diseño. La página convierte y la marca por fin se ve premium.",image:"assets/images/logos/vox_fox.png",companyLogo:"assets/images/logos/vox_logo_4k.png"},
    {name:"Diego Fuentes",company:"Fundador, LoopPay",rating:5,text:"Profesionalismo absoluto. Cumplieron cada plazo y superaron nuestras expectativas de calidad.",image:"assets/images/logos/vox_fox.png",companyLogo:"assets/images/logos/vox_logo_4k.png"},
];

const FAQS = [
    {q:"¿Qué es la metodología VOX®?",a:"VOX® es un sistema integral de crecimiento empresarial que conecta estrategia, marca, marketing, ventas y optimización para construir negocios más sólidos y escalables."},
    {q:"¿VOX® solo se encarga de marketing?",a:"No. El marketing es solo una parte del sistema. VOX® trabaja desde la visión del negocio hasta la conversión y evolución continua."},
    {q:"¿Por qué mi empresa necesita una estrategia antes de hacer marketing?",a:"Porque crecer sin dirección genera esfuerzos aislados. Primero definimos objetivos, mercado y posicionamiento para construir acciones con propósito."},
    {q:"¿Cómo mejora VOX® la experiencia de mi marca?",a:"Diseñamos una experiencia completa: identidad, comunicación, visualización, procesos comerciales y cada punto de contacto con el cliente."},
    {q:"¿VOX® ayuda a aumentar las ventas?",a:"Sí. A través de procesos comerciales, CRM, automatización, seguimiento y estrategias de conversión transformamos oportunidades en resultados."},
    {q:"¿Qué pasa después de implementar la metodología VOX®?",a:"El crecimiento continúa. Analizamos datos, optimizamos procesos e incorporamos innovación para que la empresa siga evolucionando."},
];

// SERVICE_OPTIONS eliminado - campo de servicio de interés removido del formulario

// ===== RENDER =====
function el(html){const t=document.createElement("template");t.innerHTML=html.trim();return t.content.firstChild;}

// Marquee (doubled for seamless loop)
const track=document.getElementById("marqueeTrack");
[...MARQUEE,...MARQUEE].forEach(item=>{
    track.appendChild(el(`<span>${item}</span>`));
});

// Services
const sg=document.getElementById("servicesGrid");
SERVICES.forEach((s,i)=>{
    const serviceEl=el(`
    <div class="service reveal" style="--d:${(i%3)*.07}s">
        <div class="service-image">
            <img src="${s.image}" alt="${s.title}" loading="lazy" />
            <div class="service-overlay">
                <div class="service-content">
                    <div class="service-ico"><i data-lucide="${s.icon}"></i></div>
                    <h3>${s.title}</h3>
                    <p>${s.text}</p>
                    <button class="service-btn">Ver más</button>
                </div>
            </div>
        </div>
    </div>`);
    serviceEl.style.cursor="pointer";
    serviceEl.addEventListener("click",()=>{
        const serviceId = SERVICE_IDS[i] || 'arquitectura';
        window.location.href = `servicio.html?id=${serviceId}`;
    });
    sg.appendChild(serviceEl);
});

// Methodology Carousel
const initMethodologyCarousel = () => {
    const track = document.getElementById('methodologyTrack');
    const dotsContainer = document.getElementById('methodologyDots');
    const prevBtn = document.getElementById('methodologyPrev');
    const nextBtn = document.getElementById('methodologyNext');

    if (!track || METHODOLOGY.length === 0) return;

    let currentIndex = 0;

    // Crear slides y dots
    METHODOLOGY.forEach((item, index) => {
        const tagsHTML = item.tags.map(tag => `<span class="methodology-tag">${tag}</span>`).join('');

        const slideEl = document.createElement('div');
        slideEl.className = 'methodology-slide';
        slideEl.innerHTML = `
            <div class="methodology-card reveal" style="--bg-image: url('${item.image}')">
                <div class="methodology-content">
                    <div class="methodology-number">${item.number}</div>
                    <h3 class="methodology-title">${item.title}</h3>
                    <p class="methodology-subtitle">${item.subtitle}</p>
                    <div class="methodology-tags">${tagsHTML}</div>
                </div>
            </div>
        `;
        track.appendChild(slideEl);

        const dot = document.createElement('div');
        dot.className = `methodology-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    // Clonar primer slide al final para efecto infinito
    const firstSlideClone = track.children[0].cloneNode(true);
    track.appendChild(firstSlideClone);

    const dots = document.querySelectorAll('.methodology-dot');
    const totalSlides = METHODOLOGY.length + 1; // +1 por el clon

    const updateCarousel = (instant = false) => {
        const slides = document.querySelectorAll('.methodology-slide');
        const cards = document.querySelectorAll('.methodology-card');
        
        // Smooth fade transition
        const realIndex = currentIndex % METHODOLOGY.length;
        if (cards[realIndex]) {
            cards[realIndex].style.opacity = '0.3';
            cards[realIndex].style.transform = 'scale(0.98)';
            
            setTimeout(() => {
                cards[realIndex].style.opacity = '1';
                cards[realIndex].style.transform = 'scale(1)';
            }, 300);
        }
        
        // Move track
        if (instant) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        }
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update dots
        const dotIndex = currentIndex % METHODOLOGY.length;
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === dotIndex);
        });
    };

    const goToSlide = (index) => {
        currentIndex = index;
        updateCarousel();
        resetAutoPlay();
    };

    const nextSlide = () => {
        currentIndex++;
        updateCarousel();
        
        // Si llegamos al clon del primero, saltar al primero real instantáneamente
        if (currentIndex === totalSlides - 1) {
            setTimeout(() => {
                currentIndex = 0;
                updateCarousel(true);
            }, 800);
        }
    };

    const prevSlide = () => {
        if (currentIndex === 0) {
            currentIndex = totalSlides - 1;
            updateCarousel(true);
            setTimeout(() => {
                currentIndex--;
                updateCarousel();
            }, 10);
        } else {
            currentIndex--;
            updateCarousel();
        }
    };

    const resetAutoPlay = () => {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 5000);
    };

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoPlay();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoPlay();
        });
    }

    // Auto-play - inicia solo cuando la sección es visible
    let autoPlayInterval = null;
    let isCarouselVisible = false;

    // IntersectionObserver para detectar cuando la sección es visible
    const methodologySection = document.getElementById('metodologia');
    if (methodologySection) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isCarouselVisible) {
                    isCarouselVisible = true;
                    autoPlayInterval = setInterval(nextSlide, 5000);
                } else if (!entry.isIntersecting && isCarouselVisible) {
                    isCarouselVisible = false;
                    if (autoPlayInterval) {
                        clearInterval(autoPlayInterval);
                        autoPlayInterval = null;
                    }
                }
            });
        }, { threshold: 0.3 });

        sectionObserver.observe(methodologySection);
    }

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        resetAutoPlay();
    });

    const handleSwipe = () => {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            nextSlide();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            prevSlide();
        }
    };
};

initMethodologyCarousel();

// Stats
const stg=document.getElementById("statsGrid");
if(stg){
    STATS.forEach(s=>stg.appendChild(el(`
        <div class="stat reveal">
            <div class="num">${s.prefix||""}<span class="count" data-to="${s.value}">0</span><em>${s.suffix}</em></div>
            <p>${s.label}</p>
        </div>`)));
}

// Projects Carousel
const initProjectsCarousel = () => {
    const track = document.getElementById('projectsTrack');
    const dotsContainer = document.getElementById('projectsDots');
    const prevBtn = document.getElementById('projectPrev');
    const nextBtn = document.getElementById('projectNext');

    if (!track || PROJECTS.length === 0) return;

    // Crear slides y dots
    PROJECTS.forEach((project, index) => {
        const slideEl = document.createElement('div');
        slideEl.className = `project-slide ${index === 0 ? 'active' : ''}`;
        slideEl.innerHTML = `
            <img src="${project.image}" alt="${project.title}" loading="lazy" />
            <div class="project-slide-overlay"></div>
            <div class="project-content">
                <span class="project-tag">${project.tag}</span>
                <h2>${project.title}</h2>
                <p>${project.text}</p>
            </div>
        `;
        track.appendChild(slideEl);

        const dot = document.createElement('div');
        dot.className = `project-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const slides = document.querySelectorAll('.project-slide');
    const dots = document.querySelectorAll('.project-dot');
    let currentIndex = 0;

    const goToSlide = (index) => {
        slides[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');
        currentIndex = index;
        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    };

    const nextSlide = () => {
        const nextIndex = (currentIndex + 1) % slides.length;
        goToSlide(nextIndex);
    };

    const prevSlide = () => {
        const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
        goToSlide(prevIndex);
    };

    // Start autoplay - inicia solo cuando la sección es visible
    let autoPlayInterval = null;
    let isCarouselVisible = false;

    const startAutoPlay = () => {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 3000);
    };

    const stopAutoPlay = () => {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    };

    // IntersectionObserver para detectar cuando la sección es visible
    const projectsSection = document.getElementById('proyectos');
    if (projectsSection) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isCarouselVisible) {
                    isCarouselVisible = true;
                    if (slides.length > 1) {
                        startAutoPlay();
                    }
                } else if (!entry.isIntersecting && isCarouselVisible) {
                    isCarouselVisible = false;
                    stopAutoPlay();
                }
            });
        }, { threshold: 0.3 });

        sectionObserver.observe(projectsSection);
    }

    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', () => {
        stopAutoPlay();
        prevSlide();
        if (isCarouselVisible) startAutoPlay();
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        stopAutoPlay();
        nextSlide();
        if (isCarouselVisible) startAutoPlay();
    });

    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        if (isCarouselVisible) startAutoPlay();
    }, { passive: true });

    const handleSwipe = () => {
        const swipeDistance = touchEndX - touchStartX;
        if (Math.abs(swipeDistance) > minSwipeDistance) {
            if (swipeDistance > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        }
    };
};

// Initialize projects carousel when DOM is ready
document.addEventListener('DOMContentLoaded', initProjectsCarousel);

// Testimonials Carousel
const initTestimonialsCarousel = () => {
    const carousel = document.getElementById('testimonialsCarousel');
    const track = document.getElementById('testimonialsTrack');
    const dotsContainer = document.getElementById('testimonialsDots');

    if (!carousel || !track || TESTIMONIALS.length === 0) return;

    // Generate testimonial slides
    TESTIMONIALS.forEach((testimonial, index) => {
        const slide = document.createElement('div');
        slide.className = 'testimonial-slide';
        
        // Generate stars
        const starsHTML = Array(testimonial.rating).fill('<i data-lucide="star"></i>').join('');
        
        slide.innerHTML = `
            <div class="testimonial-card reveal">
                <div class="testimonial-image">
                    <img src="${testimonial.image}" alt="${testimonial.name}" loading="lazy">
                </div>
                <div class="testimonial-content">
                    <div class="testimonial-quote">"</div>
                    <p class="testimonial-text">${testimonial.text}</p>
                    <div class="testimonial-stars">${starsHTML}</div>
                    <div class="testimonial-author">
                        <img src="${testimonial.image}" alt="${testimonial.name}" loading="lazy">
                        <div class="testimonial-author-info">
                            <h4>${testimonial.name}</h4>
                            <p>${testimonial.company}</p>
                            ${testimonial.companyLogo ? `
                            <div class="testimonial-company">
                                <img src="${testimonial.companyLogo}" alt="Company" loading="lazy">
                                <span>Empresa</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        track.appendChild(slide);
    });

    const cards = document.querySelectorAll('.testimonial-card');
    const dots = [];
    let currentIndex = 0;

    // Generate dots
    TESTIMONIALS.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `testimonial-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
        dots.push(dot);
    });

    const goToSlide = (index) => {
        cards[currentIndex].classList.remove('in');
        dots[currentIndex].classList.remove('active');
        currentIndex = index;
        cards[currentIndex].classList.add('in');
        dots[currentIndex].classList.add('active');
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    };

    const nextSlide = () => {
        const nextIndex = (currentIndex + 1) % cards.length;
        goToSlide(nextIndex);
    };

    // Start autoplay - inicia solo cuando la sección es visible
    let autoPlayInterval = null;
    let isCarouselVisible = false;

    const startAutoPlay = () => {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 5000);
    };

    const stopAutoPlay = () => {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    };

    // IntersectionObserver para detectar cuando la sección es visible
    const testimonialsSection = document.querySelector('.testimonials');
    if (testimonialsSection) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isCarouselVisible) {
                    isCarouselVisible = true;
                    startAutoPlay();
                } else if (!entry.isIntersecting && isCarouselVisible) {
                    isCarouselVisible = false;
                    stopAutoPlay();
                }
            });
        }, { threshold: 0.3 });

        sectionObserver.observe(testimonialsSection);
    }

    // Initialize first slide
    setTimeout(() => {
        cards[0].classList.add('in');
    }, 100);

    // Observe testimonial cards for scroll animation
    cards.forEach(card => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                }
            });
        }, { threshold: 0.3 });
        observer.observe(card);
    });
};

document.addEventListener('DOMContentLoaded', initTestimonialsCarousel);

// FAQ
const fl=document.getElementById("faqList");
if(fl){
    FAQS.forEach((f,i)=>{
        const item=el(`
        <div class="faq-item ${i===0?'open':''} reveal">
            <button class="faq-q"><span>${f.q}</span><span class="faq-toggle"><i data-lucide="plus"></i></span></button>
            <div class="faq-a"><p>${f.a}</p></div>
        </div>`);
        fl.appendChild(item);
    });
}

// WhatsApp links
document.getElementById("year").textContent=new Date().getFullYear();
["waFormBtn","waSuccessBtn","fabWa"].forEach(id=>{const e=document.getElementById(id);if(e)e.href=WA_URL;});

// Icons
lucide.createIcons();

// ===== INTERACTIONS =====
// FAQ accordion
function refreshFaqHeights(){
    fl.querySelectorAll(".faq-item").forEach(it=>{
        const a=it.querySelector(".faq-a");
        a.style.maxHeight=it.classList.contains("open")?a.scrollHeight+"px":"0px";
    });
}
fl.querySelectorAll(".faq-q").forEach(btn=>{
    btn.addEventListener("click",()=>{
        const item=btn.parentElement;
        const wasOpen=item.classList.contains("open");
        fl.querySelectorAll(".faq-item").forEach(i=>i.classList.remove("open"));
        if(!wasOpen)item.classList.add("open");
        refreshFaqHeights();
    });
});
setTimeout(refreshFaqHeights,100);

// Navbar scrolled + FAB
const navbar=document.getElementById("navbar");
const fab=document.getElementById("fabWa");
function onScroll(){
    const y=window.scrollY;
    navbar.classList.toggle("scrolled",y>40);
    fab.classList.toggle("show",y>600);
}
window.addEventListener("scroll",onScroll,{passive:true});onScroll();

// Mobile menu
const menuToggle=document.getElementById("menuToggle");
const mobileMenu=document.getElementById("mobileMenu");
menuToggle.addEventListener("click",()=>{
    mobileMenu.classList.toggle("open");
    menuToggle.innerHTML=mobileMenu.classList.contains("open")?'<i data-lucide="x"></i>':'<i data-lucide="menu"></i>';
    lucide.createIcons();
});

// Lenis smooth scroll
let lenis=null;
if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.Lenis){
    lenis=new Lenis({lerp:0.09});
    function raf(t){lenis.raf(t);requestAnimationFrame(raf);}requestAnimationFrame(raf);
}
function scrollTo(target){
    const node=document.querySelector(target);if(!node)return;
    if(lenis)lenis.scrollTo(node,{offset:-80,duration:1.4});
    else node.scrollIntoView({behavior:"smooth"});
}
document.querySelectorAll("[data-scroll]").forEach(a=>{
    a.addEventListener("click",e=>{
        const href=a.getAttribute("href");
        if(href&&href.startsWith("#")){e.preventDefault();scrollTo(href);
            mobileMenu.classList.remove("open");
            menuToggle.innerHTML='<i data-lucide="menu"></i>';lucide.createIcons();}
    });
});

// Hero parallax - actualizado para usar hero-video
const heroVideo=document.querySelector(".hero-video video");
if(heroVideo){
    window.addEventListener("scroll",()=>{
        const y=window.scrollY;
        if(y<window.innerHeight)heroVideo.style.transform=`translateY(${y*0.35}px) scale(${1+y*0.0001})`;
    },{passive:true});
}

// Contact icons parallax
const contactIcons=document.querySelectorAll('.info-item i');
if(contactIcons.length>0){
    window.addEventListener("scroll",()=>{
        const y=window.scrollY;
        contactIcons.forEach((icon,index)=>{
            const speed=0.05+(index*0.02);
            icon.style.transform=`translateY(${y*speed}px)`;
        });
    },{passive:true});
}

// Scroll reveal
const io=new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
        if(en.isIntersecting){
            // Add staggered delay based on class
            if(en.target.classList.contains('stagger-1')){
                setTimeout(()=>en.target.classList.add("in"), 100);
            } else if(en.target.classList.contains('stagger-2')){
                setTimeout(()=>en.target.classList.add("in"), 200);
            } else if(en.target.classList.contains('stagger-3')){
                setTimeout(()=>en.target.classList.add("in"), 300);
            } else if(en.target.classList.contains('stagger-4')){
                setTimeout(()=>en.target.classList.add("in"), 400);
            } else {
                en.target.classList.add("in");
            }
            io.unobserve(en.target);
        }
    });
},{threshold:0.15});
document.querySelectorAll(".reveal").forEach(e=>io.observe(e));

// Observe methodology cards for scroll animation with staggered delays
document.querySelectorAll(".methodology-card").forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.08}s`;
    io.observe(card);
});

// Observe services for scroll animation
document.querySelectorAll(".service").forEach(e=>io.observe(e));

// Observe about section elements for scroll animation
document.querySelectorAll(".gallery-item, .about-card, .client-logo").forEach(e=>io.observe(e));

// Count up
const counted=new WeakSet();
const countIo=new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
        if(en.isIntersecting&&!counted.has(en.target)){
            counted.add(en.target);
            const to=+en.target.dataset.to;const start=performance.now();const dur=1600;
            function tick(now){
                const p=Math.min((now-start)/dur,1);
                const e=1-Math.pow(1-p,3);
                en.target.textContent=Math.round(to*e);
                if(p<1)requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        }
    });
},{threshold:0.5});
document.querySelectorAll(".count").forEach(c=>countIo.observe(c));

// Contact form wizard
const form=document.getElementById("contactForm");
const success=document.getElementById("successCard");
const submitBtn=form.querySelector('button[type="submit"]');
const progressSteps=document.querySelectorAll('.progress-step');
const formSteps=document.querySelectorAll('.form-step');
let currentStep=1;

// Step navigation
document.querySelectorAll('.next-step').forEach(btn=>{
    btn.addEventListener('click',()=>{
        if(validateStep(currentStep)){
            goToStep(currentStep+1);
        }
    });
});

document.querySelectorAll('.prev-step').forEach(btn=>{
    btn.addEventListener('click',()=>{
        goToStep(currentStep-1);
    });
});

function goToStep(step){
    currentStep=step;
    
    // Update progress steps
    progressSteps.forEach((progressStep,index)=>{
        progressStep.classList.remove('active','completed');
        if(index+1===step){
            progressStep.classList.add('active');
        }else if(index+1<step){
            progressStep.classList.add('completed');
        }
    });
    
    // Update form steps
    formSteps.forEach((formStep,index)=>{
        formStep.classList.remove('active');
        if(index+1===step){
            formStep.classList.add('active');
        }
    });
    
    // Update review values on step 3
    if(step===3){
        updateReviewValues();
    }
    
    lucide.createIcons();
}

function validateStep(step){
    const currentStepEl=document.querySelector(`.form-step[data-step="${step}"]`);
    const inputs=currentStepEl.querySelectorAll('input, textarea');
    let isValid=true;
    
    inputs.forEach(input=>{
        if(!validateField(input)){
            isValid=false;
        }
    });
    
    return isValid;
}

function updateReviewValues(){
    document.querySelectorAll('.review-value').forEach(el=>{
        const fieldName=el.dataset.field;
        const input=form.querySelector(`[name="${fieldName}"]`);
        if(input){
            el.textContent=input.value || 'No proporcionado';
        }
    });
}

// Real-time validation
const inputs=form.querySelectorAll('input, textarea');
inputs.forEach(input=>{
    input.addEventListener('input',()=>{
        validateField(input);
    });
    input.addEventListener('blur',()=>{
        validateField(input);
    });
});

function validateField(input){
    const field=input.parentElement;
    const successIcon=field.querySelector('.field-icon.success');
    const errorIcon=field.querySelector('.field-icon.error');
    
    let isValid=false;
    
    if(input.type==='email'){
        const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid=emailRegex.test(input.value);
    }else{
        isValid=input.value.trim().length>0;
    }
    
    if(input.value.trim().length===0){
        input.classList.remove('valid','invalid');
        if(successIcon)successIcon.style.display='none';
        if(errorIcon)errorIcon.style.display='none';
    }else if(isValid){
        input.classList.add('valid');
        input.classList.remove('invalid');
        if(successIcon)successIcon.style.display='block';
        if(errorIcon)errorIcon.style.display='none';
    }else{
        input.classList.add('invalid');
        input.classList.remove('valid');
        if(successIcon)successIcon.style.display='none';
        if(errorIcon)errorIcon.style.display='block';
    }
    
    return isValid;
}

form.addEventListener("submit",(e)=>{
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(form);
    const nombre = formData.get('nombre');
    const correo = formData.get('correo');
    const telefono = formData.get('telefono');
    const mensaje = formData.get('mensaje');
    
    // Create mailto link with pre-filled data
    const mailtoLink = `mailto:HOLA@VOXBUSINESSDEVELOPER.COM?subject=Contacto desde VOX Business Developer&body=Nombre: ${encodeURIComponent(nombre)}%0ACorreo: ${encodeURIComponent(correo)}%0ATeléfono: ${encodeURIComponent(telefono)}%0AMensaje: ${encodeURIComponent(mensaje)}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Show success message
    submitBtn.classList.remove('loading');
    form.setAttribute("hidden","");
    success.removeAttribute("hidden");
    
    // Add extra pulse elements for better animation
    const ring=success.querySelector('.success-ring');
    if(ring.children.length===1){
        ring.innerHTML='<span class="pulse"></span><span class="pulse"></span><span class="pulse"></span><span class="check-big"><i data-lucide="check"></i></span>';
    }
    
    lucide.createIcons();
});
document.getElementById("resetBtn").addEventListener("click",()=>{
    form.reset();
    inputs.forEach(input=>{
        input.classList.remove('valid','invalid');
        const field=input.parentElement;
        const successIcon=field.querySelector('.field-icon.success');
        const errorIcon=field.querySelector('.field-icon.error');
        if(successIcon)successIcon.style.display='none';
        if(errorIcon)errorIcon.style.display='none';
    });
    
    // Remove chips and servicioInput references (no longer exist in wizard)
    // chips.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));
    // servicioInput.value="";
    
    success.setAttribute("hidden","");
    form.removeAttribute("hidden");
    
    // Reset wizard to step 1
    goToStep(1);
    
    // Reinitialize icons
    lucide.createIcons();
});