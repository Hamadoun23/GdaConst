/**
 * GDA Construction - comportements du site.
 *
 * Chaque fonction init* gère une seule fonctionnalité et ne fait rien si
 * ses éléments sont absents de la page. L'ordre d'appel est en bas du fichier.
 *
 * Dépendances : GSAP + ScrollTrigger (toutes les pages), ScrollSmoother
 * (hors portfolio), Isotope (accueil, réalisations), Swiper (accueil, à la demande).
 */
(() => {
    'use strict';

    const DESKTOP_MIN_WIDTH = 991;
    const NAVBAR_SCROLL_OFFSET = 300;
    const BACK_TO_TOP_OFFSET = 150;
    const SCROLL_SMOOTHING = 1;
    const HERO_SLIDE_DURATION = 5000;
    const TOUCH_LAYOUT = '(max-width: 991.98px), (hover: none)'; // À garder identique dans site.css.

    const qs = (selector, root = document) => root.querySelector(selector);
    const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
    const isDesktop = () => window.innerWidth > DESKTOP_MIN_WIDTH;
    const useTouchLayout = () => window.matchMedia(TOUCH_LAYOUT).matches;

    let smoother = null;


    /* ---------------------------- Défilement ---------------------------- */

    function initSmoothScroll() {
        if (!window.ScrollSmoother || !qs('#smooth-wrapper')) return;
        smoother = ScrollSmoother.create({ smooth: SCROLL_SMOOTHING, effects: true });
    }

    /** Barre de navigation et bouton « haut de page » : un seul écouteur, limité à une fois par image. */
    function initScrollUi() {
        const navbar = qs('.navbar');
        const backToTop = qs('.progress-wrap');
        const progressPath = qs('.progress-wrap path');
        if (!navbar || !backToTop || !progressPath) return;

        const pathLength = progressPath.getTotalLength();
        let scrollableHeight = 1;
        let frameRequested = false;

        progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
        progressPath.style.strokeDashoffset = pathLength;

        const measure = () => {
            scrollableHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        };

        const update = () => {
            const scrollTop = window.scrollY;
            navbar.classList.toggle('nav-scroll', scrollTop > NAVBAR_SCROLL_OFFSET);
            backToTop.classList.toggle('active-progress', scrollTop > BACK_TO_TOP_OFFSET);
            progressPath.style.strokeDashoffset = pathLength - (scrollTop * pathLength) / scrollableHeight;
            frameRequested = false;
        };

        const requestUpdate = () => {
            if (frameRequested) return;
            frameRequested = true;
            requestAnimationFrame(update);
        };

        backToTop.addEventListener('click', (event) => {
            event.preventDefault();
            if (smoother) smoother.scrollTo(0, true);
            else window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', measure, { passive: true });
        window.addEventListener('load', measure);
        ScrollTrigger.addEventListener('refresh', measure);

        measure();
        update();
    }


    /* ---------------------------- Chargement ---------------------------- */

    /** Écran d'accueil : complet à la première visite, accéléré sur les pages suivantes. */
    function initLoader() {
        const loader = qs('.loader-wrap');
        const curveShape = qs('#svg');
        if (!loader || !curveShape) return;

        const timeline = gsap.timeline();
        const curve = 'M0 502S175 272 500 272s500 230 500 230V0H0Z';
        const flat = 'M0 2S175 1 500 1s500 1 500 1V0H0Z';

        timeline
            .to('.loader-wrap-heading .load-text', { delay: 0.4, y: -100, opacity: 0, duration: 0.3 })
            .to(curveShape, { duration: 0.35, attr: { d: curve }, ease: 'power2.in' })
            .to(curveShape, { duration: 0.35, attr: { d: flat }, ease: 'power2.out' })
            .to(loader, { y: -1500, duration: 0.4 })
            .set(loader, { zIndex: -1, display: 'none' });

        if (qs('header')) {
            timeline.from('header', { y: 200, duration: 0.5 }, '-=1');
        }
        if (qs('header .container')) {
            timeline.from('header .container', { y: 40, opacity: 0, delay: 0.3, duration: 0.5 }, '-=0.9');
        }

        try {
            if (sessionStorage.getItem('gda-visited')) timeline.timeScale(2.5);
            sessionStorage.setItem('gda-visited', '1');
        } catch {
            // Stockage indisponible (navigation privée) : animation complète.
        }
    }

    /** Images de fond : chargées à l'approche de l'écran ; survol et galerie horizontale, après la page. */
    function initBackgrounds() {
        const applyBackground = (element) => {
            element.style.backgroundImage = `url("${element.dataset.background}")`;
        };

        const observer = new IntersectionObserver((entries) => {
            entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
                applyBackground(entry.target);
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '100% 100%' });

        const elements = qsa('[data-background]');
        const afterLoad = elements.filter((element) => element.matches('.award-reveal-img, .parallax-img'));

        elements.filter((element) => !afterLoad.includes(element)).forEach((element) => observer.observe(element));
        window.addEventListener('load', () => afterLoad.forEach(applyBackground));
    }


    /* ---------------------------- Navigation ---------------------------- */

    function initMobileMenu() {
        const toggler = qs('.navbar-toggler');
        const menu = qs('.navbar .navbar-collapse');
        if (!toggler || !menu) return;

        toggler.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('show');
            toggler.setAttribute('aria-expanded', String(isOpen));
        });
    }

    /** Liens du menu : découpe le texte en lettres pour l'effet de défilement au survol. */
    function initRollingText() {
        qsa('.rolling-text').forEach((element) => {
            const container = document.createElement('div');
            container.classList.add('block');

            for (const letter of element.innerText) {
                const span = document.createElement('span');
                span.innerText = letter.trim() === '' ? '\xa0' : letter;
                span.classList.add('letter');
                container.appendChild(span);
            }

            element.replaceChildren(container, container.cloneNode(true));
        });
    }

    function initCursor() {
        const cursor = qs('.cursor');
        if (!cursor || !window.matchMedia('(hover: hover)').matches) return;

        window.addEventListener('mousemove', (event) => {
            cursor.style.translate = `${event.clientX}px ${event.clientY}px`;
        }, { passive: true });

        document.addEventListener('mouseover', (event) => {
            cursor.classList.toggle('cursor-active', Boolean(event.target.closest('a, .cursor-pointer')));
        }, { passive: true });
    }


    /* ------------------------------ Accueil ----------------------------- */

    /** Diaporama sur écran tactile : image, vignette et titre changent ensemble, en fondu. */
    function playHeroFade(layers) {
        let current = 0;

        const show = (index) => layers.forEach((layer) => {
            layer.forEach((element, position) => element.classList.toggle('is-active', position === index));
        });

        show(current);
        window.setInterval(() => {
            current = (current + 1) % layers[0].length;
            show(current);
        }, HERO_SLIDE_DURATION);
    }

    /** Diaporama plein écran : images, vignettes et titres synchronisés au défilement. */
    function initSnapSlider() {
        const holder = qs('.ui-snap-slider');
        if (!holder) return;

        const slides = gsap.utils.toArray('.snap-slide');
        const captions = gsap.utils.toArray('.snap-slide-caption');
        const thumbs = gsap.utils.toArray('.thumb-slide');

        if (useTouchLayout()) {
            playHeroFade([slides, thumbs, captions]);
            return;
        }

        const thumbsWrapper = qs('.snap-slider-thumbs');
        const captionsWrapper = qs('.snap-slider-captions');
        const thumbImages = gsap.utils.toArray('.thumb-slide img');
        const viewportHeight = window.innerHeight;
        const lastSlideIndex = slides.length - 1;
        const scrollLength = `+=${viewportHeight * lastSlideIndex}`;

        ScrollTrigger.create({
            trigger: slides, start: 'top top', end: scrollLength, pin: thumbsWrapper, scrub: true,
        });

        gsap.fromTo(thumbs, { y: 0 }, {
            y: -thumbs[0].offsetHeight * (thumbs.length - 1),
            ease: 'none',
            scrollTrigger: { trigger: holder, start: 'top top', end: scrollLength, scrub: true },
        });

        ScrollTrigger.create({
            trigger: captionsWrapper,
            start: 'top top',
            end: () => `+=${window.innerHeight * lastSlideIndex}`,
            pin: true,
            scrub: true,
        });

        gsap.fromTo(captions, { y: 0 }, {
            y: -captions[0].offsetHeight * (captions.length - 1),
            ease: 'none',
            scrollTrigger: { trigger: holder, start: 'top top', end: scrollLength, scrub: true },
        });

        gsap.set(slides, { height: viewportHeight });

        ScrollTrigger.create({
            trigger: slides,
            start: 'top top',
            end: scrollLength,
            snap: {
                snapTo: gsap.utils.snap(1 / lastSlideIndex),
                duration: { min: 0.2, max: 0.7 },
                ease: 'power4.inOut',
            },
        });

        slides.forEach((slide, index) => {
            const isFirst = index === 0;
            const isLast = index === lastSlideIndex;
            const scrollTrigger = {
                trigger: slide,
                scrub: true,
                start: isFirst ? 'top top' : 'top bottom',
                end: isLast ? 'top top' : undefined,
            };

            gsap.fromTo(qsa('.main-img', slide), { y: isFirst ? 0 : -viewportHeight }, {
                y: isLast ? 0 : viewportHeight, ease: 'none', scrollTrigger,
            });

            if (thumbImages[index]) {
                const halfHeight = thumbImages[index].offsetHeight / 2;
                gsap.fromTo(thumbImages[index], { y: isFirst ? 0 : -halfHeight }, {
                    y: isLast ? 0 : halfHeight, ease: 'none', scrollTrigger: { ...scrollTrigger },
                });
            }
        });
    }

    /** Carrousel en bas de page : Swiper n'est téléchargé qu'à l'approche de la section. */
    function initTestimonialSlider() {
        const container = qs('.testim-style3 .swiper-container');
        if (!container) return;

        const createSlider = () => new Swiper(container, {
            slidesPerView: 3,
            spaceBetween: 30,
            speed: 1500,
            autoplay: { delay: 5000 },
            loop: true,
            pagination: { el: '.testim-style3 .swiper-pagination', clickable: true },
            breakpoints: {
                0: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
            },
        });

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            observer.disconnect();

            const script = document.createElement('script');
            script.src = 'assets/js/vendor/swiper.min.js';
            script.onload = createSlider;
            document.head.appendChild(script);
        }, { rootMargin: '100% 0px' });

        observer.observe(container);
    }

    /** Liste de l'équipe : l'image suit la souris et les autres lignes s'estompent. */
    function initTeamHover() {
        qsa('.hover-reveal-item').forEach((item) => {
            const image = item.children[1];
            if (!image) return;

            item.addEventListener('mousemove', (event) => {
                const bounds = item.getBoundingClientRect();
                image.style.transform = `translate(${event.clientX - bounds.x}px, ${event.clientY - bounds.y}px)`;
            }, { passive: true });
        });

        const rows = qsa('.team-reval .item-row');
        const setOpacity = (value) => rows.forEach((row) => { row.style.opacity = value; });

        rows.forEach((row) => {
            row.addEventListener('mouseenter', () => {
                setOpacity('.2');
                row.style.opacity = '1';
            });
            row.addEventListener('mouseleave', () => setOpacity('1'));
        });
    }


    /* ---------------------------- Expertises ---------------------------- */

    function initHorizontalPanels() {
        const container = qs('.hr-container');
        if (!container || !isDesktop()) return;

        const panels = gsap.utils.toArray('.hr-container .item-panel');

        gsap.to(panels, {
            xPercent: -100 * (panels.length - 1),
            ease: 'none',
            scrollTrigger: {
                trigger: container,
                start: 'center center',
                end: () => `+=${container.offsetWidth}`,
                pin: true,
                scrub: 1,
            },
        });
    }

    function initStickyTitle() {
        if (!qs('.features .stack-title') || !isDesktop()) return;

        ScrollTrigger.create({
            trigger: '.features .stack-title',
            start: 'center center',
            endTrigger: '.features',
            end: 'bottom bottom',
            pin: true,
            pinSpacing: false,
        });
    }


    /* ---------------------------- Portfolio ----------------------------- */

    /** Galerie horizontale pilotée par le défilement ; l'animation s'arrête dès que tout est immobile. */
    function initPortfolioSlider() {
        const slider = qs('.parallax-sliders');
        if (!slider || useTouchLayout()) return; // Sur écran tactile, site.css gère un glissement natif.

        const images = qsa('.parallax-img');
        const easing = 0.05;
        let current = 0;
        let imageWidth = 1;
        let isRunning = false;

        const measure = () => {
            const sliderWidth = slider.getBoundingClientRect().width;
            imageWidth = sliderWidth / images.length;
            document.body.style.height = `${sliderWidth - (window.innerWidth - window.innerHeight)}px`;
        };

        const render = () => {
            const target = window.scrollY;
            current += (target - current) * easing;

            const ratio = current / imageWidth;
            slider.style.transform = `translateX(-${current.toFixed(2)}px)`;
            images.forEach((image, index) => {
                image.style.transform = `translateX(${(ratio - index * 0.7) * 100}px)`;
            });

            isRunning = Math.abs(target - current) > 0.5;
            if (isRunning) requestAnimationFrame(render);
        };

        const start = () => {
            if (isRunning) return;
            isRunning = true;
            requestAnimationFrame(render);
        };

        window.addEventListener('scroll', start, { passive: true });
        window.addEventListener('resize', () => { measure(); start(); }, { passive: true });

        measure();
        start();
    }


    /* ---------------------------- Animations ---------------------------- */

    function initMasonry() {
        const gallery = qs('.gallery');
        if (!gallery || !window.Isotope) return;
        new Isotope(gallery, { itemSelector: '.items' });
    }

    /** Apparition des blocs [data-ui-animate] : uniquement opacité et déplacement, peu coûteux à animer. */
    function initRevealAnimations() {
        const distance = 60;
        const moves = {
            left: { x: -distance },
            right: { x: distance },
            up: { y: -distance },
            down: { y: distance },
        };

        qsa('[data-ui-animate]').forEach((element) => {
            gsap.from(element, {
                ...(moves[element.dataset.direction] ?? moves.down),
                opacity: 0,
                duration: 0.6,
                delay: parseFloat(element.dataset.delay) || 0,
                ease: 'power2.out',
                scrollTrigger: { trigger: element, start: 'top 90%' },
            });
        });
    }


    /* --------------------------- Initialisation -------------------------- */

    gsap.registerPlugin(ScrollTrigger);
    if (window.ScrollSmoother) gsap.registerPlugin(ScrollSmoother);

    initSmoothScroll();
    initBackgrounds();
    initLoader();
    initMobileMenu();
    initRollingText();
    initCursor();
    initSnapSlider();
    initTestimonialSlider();
    initTeamHover();
    initHorizontalPanels();
    initStickyTitle();
    initPortfolioSlider();
    initScrollUi();

    window.addEventListener('load', () => {
        initMasonry();
        initRevealAnimations();
        ScrollTrigger.refresh();
    });
})();
