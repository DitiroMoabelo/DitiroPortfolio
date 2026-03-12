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
        progress += Math.random() * 7 + 3;

        if (progress >= 100) {
            progress = 100;
            clearInterval(tick);
            if (label)   label.textContent   = 'READY!';
            if (percent) percent.textContent = '100%';
            fill.style.width = '100%';

            setTimeout(() => {
                loader.classList.add('hide');
                setTimeout(() => {
                    loader.remove();
                    startTyping();
                }, 500);
            }, 400);
        } else {
            if (progress > 33 && msgIdx === 0) { msgIdx = 1; if (label) label.textContent = MESSAGES[1]; }
            if (progress > 66 && msgIdx === 1) { msgIdx = 2; if (label) label.textContent = MESSAGES[2]; }
            fill.style.width = progress.toFixed(1) + '%';
            if (percent) percent.textContent = Math.floor(progress) + '%';
        }
    }, 55);
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

