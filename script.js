// ===== MOBILE NAVIGATION =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle mobile menu
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 70;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== ACTIVE NAV LINK ON SCROLL =====
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===== HEADER BACKGROUND ON SCROLL =====
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.style.background = 'rgba(10, 10, 10, 0.98)';
        header.style.boxShadow = '0 5px 20px rgba(255, 69, 0, 0.2)';
    } else {
        header.style.background = 'rgba(10, 10, 10, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.blog-card, .team-member, .stat-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// ===== FORM HANDLING =====
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        
        // Show success message (in a real application, you would send this to a server)
        alert('Thank you for your message! We will get back to you soon.');
        
        // Reset form
        contactForm.reset();
    });
}

// ===== DYNAMIC YEAR IN FOOTER =====
const currentYear = new Date().getFullYear();
const footerText = document.querySelector('.footer-bottom p');
if (footerText && !footerText.textContent.includes(currentYear)) {
    footerText.textContent = footerText.textContent.replace('2026', currentYear);
}

// ===== PARALLAX EFFECT FOR HERO =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroPhoenix = document.querySelector('.hero-phoenix');
    if (heroPhoenix) {
        heroPhoenix.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// ===== LOADING ANIMATION =====
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

console.log('🔥 Bohlebots-Pompeii Website Loaded - Rising from the Ashes! 🔥');
