document.addEventListener('DOMContentLoaded', () => {
    

    const heroTl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.5 }});
    
    heroTl.to("#hero-bg", { scale: 1, duration: 3 })
          .from(".reveal-text", { y: 100, opacity: 0, stagger: 0.1 }, "-=2.5")
          .to("#hero-tagline", { opacity: 1 }, "-=1")
          .to("#hero-cta", { opacity: 1, y: 0 }, "-=1");


    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }
    });


    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');


            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal-section, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
        revealObserver.observe(el);
    });


    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        document.querySelectorAll('.hover-zoom').forEach(img => {
            const speed = 0.05;
            const rect = img.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const yPos = (rect.top - window.innerHeight / 2) * speed;
                img.style.transform = `translateY(${yPos}px) scale(1.05)`;
            }
        });
    });


    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, { scale: 0.98, duration: 0.3 });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { scale: 1, duration: 0.3 });
        });
    });
});
