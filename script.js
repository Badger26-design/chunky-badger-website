document.addEventListener('DOMContentLoaded', () => {
    // --- Email Signup Form Submission ---
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const originalButtonText = signupForm.querySelector('button').innerText;
            const button = signupForm.querySelector('button');
            const emailInput = document.getElementById('email');
            const nameInput = document.getElementById('name');

            const email = emailInput.value;
            const name = nameInput.value;

            // Simple loading state
            button.innerText = 'Sending...';
            button.disabled = true;

            try {
                const response = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, name })
                });

                const data = await response.json();

                if (response.ok) {
                    button.innerText = 'Success! Welcome to the club!';
                    button.classList.add('btn-success'); // Optional helper class?
                    signupForm.reset();
                } else {
                    button.innerText = 'Something went wrong. Try again.';
                    console.error('Signup error:', data);
                    setTimeout(() => {
                        button.innerText = originalButtonText;
                        button.disabled = false;
                    }, 3000);
                }
            } catch (error) {
                console.error('Network error:', error);
                button.innerText = 'Error. Please try again later.';
                setTimeout(() => {
                    button.innerText = originalButtonText;
                    button.disabled = false;
                }, 3000);
            }
        });
    }
    // Smooth Scroll for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Reveal on Scroll (Intersection Observer)
    const observeElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });
    observeElements.forEach(el => observer.observe(el));

    // Header Scroll Effect
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- Mobile Hamburger Menu ---
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.main-header nav');
    const navLinks = document.querySelectorAll('.main-header nav a');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('nav-active');
                hamburger.classList.remove('toggle');
            });
        });
    }

    // Loading Overlay Removal (if present)
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        // Since we are static now, just hide it immediately or after a short fade
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }, 500);
    }
});
