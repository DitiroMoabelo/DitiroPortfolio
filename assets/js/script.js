// ============================================
// MOBILE NAVIGATION TOGGLE
// ============================================

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ============================================
// INSTANT NAV SCROLLING FOR ANCHOR LINKS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'instant'
            });
        }
    });
});

// ============================================
// SCROLL ANIMATIONS
// ============================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Animate elements on scroll
const animateElements = document.querySelectorAll('.category-card, .project-card, .skill-category, .experience-card, .education-card, .about-content');
animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ============================================
// HEADER SCROLL EFFECT
// ============================================

let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(247, 199, 211, 0.5)';
    } else {
        header.style.boxShadow = '0 4px 20px rgba(247, 199, 211, 0.3)';
    }
    
    lastScroll = currentScroll;
});

// ============================================
// SKILL CHIPS HOVER EFFECT
// ============================================

const skillChips = document.querySelectorAll('.skill-chip');
skillChips.forEach(chip => {
    chip.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.05)';
    });
    
    chip.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ============================================
// PROJECT CARD IMAGE ZOOM EFFECT
// ============================================

const projectImages = document.querySelectorAll('.project-image img');
projectImages.forEach(img => {
    img.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.15)';
    });
    
    img.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// ============================================
// RETRO TYPING ANIMATION
// ============================================

function startTyping() {
    const titleEl = document.querySelector('.hero-title');
    if (!titleEl) return;

    const fullText = titleEl.textContent.trim();
    titleEl.textContent = '';

    const cursorEl = document.createElement('span');
    cursorEl.className = 'cursor';
    cursorEl.textContent = '🌸';
    titleEl.appendChild(cursorEl);

    let i = 0;

    const type = () => {
        if (i < fullText.length) {
            titleEl.insertBefore(document.createTextNode(fullText[i]), cursorEl);
            i++;
            setTimeout(type, 55 + Math.random() * 25);
        }
    };

    setTimeout(type, 200);
}

// ============================================
// RETRO BOOT LOADER
// ============================================

(function initRetroLoader() {
    const loader  = document.getElementById('retro-loader');
    const fill    = document.querySelector('.loader-bar-fill');
    const label   = document.querySelector('.loader-label');
    const percent = document.querySelector('.loader-percent');

    if (!loader || !fill) {
        window.addEventListener('load', () => setTimeout(startTyping, 300));
        return;
    }

    const MESSAGES = ['BOOTING...', 'LOADING ASSETS...', 'INITIALISING...', 'READY!'];
    let progress = 0;
    let msgIdx   = 0;

    const tick = setInterval(() => {
        progress += Math.random() * 10 + 8;

        if (progress >= 100) {
            progress = 100;
            clearInterval(tick);
            if (label)   label.textContent   = 'READY!';
            if (percent) percent.textContent = '100%';
            fill.style.width = '100%';

            setTimeout(() => {
                loader.classList.add('hide');
                // Matches the 0.28s opacity transition on #retro-loader.
                setTimeout(() => {
                    loader.remove();
                    startTyping();
                }, 280);
            }, 160);
        } else {
            if (progress > 33 && msgIdx === 0) { msgIdx = 1; if (label) label.textContent = MESSAGES[1]; }
            if (progress > 66 && msgIdx === 1) { msgIdx = 2; if (label) label.textContent = MESSAGES[2]; }
            fill.style.width = progress.toFixed(1) + '%';
            if (percent) percent.textContent = Math.floor(progress) + '%';
        }
    }, 40);
})();

// ============================================
// ACTIVE NAV LINK HIGHLIGHTING
// ============================================

const sections = document.querySelectorAll('section[id]');

function highlightActiveSection() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightActiveSection);

// ============================================
// FORM VALIDATION (if contact form is added later)
// ============================================

// Placeholder for future contact form functionality

// ============================================
// LAZY LOADING FOR IMAGES
// ============================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// DARK MODE TOGGLE
// ============================================

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const htmlElement = document.documentElement;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', currentTheme);
updateThemeIcon(currentTheme);

// Toggle theme on button click
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }
}

// ============================================
// SCROLL PARALLAX FOR PLANETS & STARFIELDS
// ============================================

(function initParallax() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const layers = Array.from(document.querySelectorAll('[data-parallax]'));

    if (prefersReducedMotion || !layers.length) return;

    const targets = layers.map(el => ({
        el,
        range: parseFloat(el.dataset.parallax) || 40,
        host: el.closest('section') || el.parentElement
    })).filter(t => t.host);

    let queued = false;

    function update() {
        queued = false;
        const viewportHeight = window.innerHeight;

        targets.forEach(({ el, range, host }) => {
            const rect = host.getBoundingClientRect();

            // Skip anything fully offscreen so we aren't writing styles
            // for sections nobody is looking at.
            if (rect.bottom < 0 || rect.top > viewportHeight) return;

            // 0 as the section enters from the bottom, 1 as it leaves the top.
            const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
            const offset = (progress - 0.5) * range * 2;

            el.style.transform = 'translate3d(0, ' + offset.toFixed(1) + 'px, 0)';
        });
    }

    function requestUpdate() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(update);
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    update();
})();

// ============================================
// CONSTELLATION SKILL MAP
// ============================================

(function initConstellations() {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const categories = Array.from(document.querySelectorAll('.skill-category'));

    if (!categories.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Builds a hub-and-spoke constellation over one category card:
    // a star just below the heading, with a line out to each chip.
    function build(card) {
        const heading = card.querySelector('h3');
        const chips = Array.from(card.querySelectorAll('.skill-chip'));

        if (!heading || !chips.length) return false;

        const box = card.getBoundingClientRect();

        // If the card has no size yet (fonts still loading, ancestor
        // hidden) there is nothing meaningful to measure.
        if (box.width === 0 || box.height === 0) return false;

        let svg = card.querySelector('.constellation');
        if (!svg) {
            svg = document.createElementNS(SVG_NS, 'svg');
            svg.setAttribute('class', 'constellation');
            svg.setAttribute('aria-hidden', 'true');
            card.insertBefore(svg, card.firstChild);
        }

        svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
        while (svg.firstChild) svg.removeChild(svg.firstChild);

        const headingRect = heading.getBoundingClientRect();
        const hub = {
            x: headingRect.left - box.left + headingRect.width / 2,
            y: headingRect.bottom - box.top + 6
        };

        // Each spoke stops at a star sitting just above its chip, so the
        // whole line stays in the open band rather than disappearing
        // behind the chip it points at.
        const targets = chips.map(chip => {
            const r = chip.getBoundingClientRect();
            return {
                x: r.left - box.left + r.width / 2,
                y: r.top - box.top - 6
            };
        });

        targets.forEach((target, i) => {
            const spoke = document.createElementNS(SVG_NS, 'line');
            spoke.setAttribute('class', 'constellation__spoke');
            spoke.setAttribute('x1', hub.x.toFixed(1));
            spoke.setAttribute('y1', hub.y.toFixed(1));
            spoke.setAttribute('x2', target.x.toFixed(1));
            spoke.setAttribute('y2', target.y.toFixed(1));

            const length = Math.hypot(target.x - hub.x, target.y - hub.y);
            spoke.style.strokeDasharray = length;
            spoke.style.strokeDashoffset = prefersReducedMotion ? 0 : length;
            spoke.style.transitionDelay = (i * 70) + 'ms';

            svg.appendChild(spoke);
        });

        targets.forEach((target, i) => {
            const star = document.createElementNS(SVG_NS, 'circle');
            star.setAttribute('class', 'constellation__star');
            star.setAttribute('cx', target.x.toFixed(1));
            star.setAttribute('cy', target.y.toFixed(1));
            star.setAttribute('r', '2.4');
            star.style.transitionDelay = (300 + i * 70) + 'ms';
            svg.appendChild(star);
        });

        const halo = document.createElementNS(SVG_NS, 'circle');
        halo.setAttribute('class', 'constellation__halo');
        halo.setAttribute('cx', hub.x.toFixed(1));
        halo.setAttribute('cy', hub.y.toFixed(1));
        halo.setAttribute('r', '9');
        svg.appendChild(halo);

        const star = document.createElementNS(SVG_NS, 'circle');
        star.setAttribute('class', 'constellation__hub');
        star.setAttribute('cx', hub.x.toFixed(1));
        star.setAttribute('cy', hub.y.toFixed(1));
        star.setAttribute('r', '3');
        svg.appendChild(star);

        return true;
    }

    function reveal(card) {
        card.classList.add('is-drawn');
        card.querySelectorAll('.constellation__spoke').forEach(spoke => {
            spoke.style.strokeDashoffset = '0';
        });
    }

    // Rebuild after a reflow, keeping already-revealed cards revealed.
    function rebuild() {
        categories.forEach(card => {
            if (build(card) && card.classList.contains('is-drawn')) reveal(card);
        });
    }

    categories.forEach(build);

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                reveal(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.3 });

        categories.forEach(card => observer.observe(card));
    } else {
        categories.forEach(reveal);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(rebuild, 150);
    });

    // Webfonts change chip widths, so remeasure once they land.
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(rebuild);
    }
})();

// ============================================
// CONSOLE MESSAGE
// ============================================

console.log('%c🌸 Welcome to Ditiro Moabelo\'s Portfolio! 🌸', 'color: #F7C7D3; font-size: 16px; font-weight: bold;');
console.log('%cBuilt with kindness and pastel colors 💕', 'color: #DCC6E8; font-size: 12px;');

// ============================================
// BACK TO TOP BUTTON
// ============================================

const backToTopBtn = document.getElementById('back-to-top');

if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    });
}

