document.addEventListener('DOMContentLoaded', () => {
    console.log('Chunky Badger Script v1.2 - MailerLite Restore');
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

                // Check for HTTP errors first (e.g. 404, 500)
                if (!response.ok) {
                    console.error(`HTTP Error: ${response.status}`);

                    // Try to read text to see if it's JSON or HTML
                    const text = await response.text();
                    try {
                        const json = JSON.parse(text);
                        throw new Error(json.error || `Server Error (${response.status})`);
                    } catch (e) {
                        // If it's not JSON, it's likely a Vercel HTML error page
                        throw new Error(`Server Error (${response.status})`);
                    }
                }

                // If OK, parse success data
                const data = await response.json();

                button.innerText = 'Success! Welcome to the club!';
                button.classList.add('btn-success');
                signupForm.reset();

            } catch (error) {
                console.error('Signup error:', error);

                // Show specific error message on button
                button.innerText = error.message || 'Error. Check console.';

                setTimeout(() => {
                    button.innerText = originalButtonText;
                    button.disabled = false;
                }, 5000);
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

    // Hand Parallax Effect
    const heroHandImage = document.getElementById('hero-hand-image');
    if (heroHandImage) {
        window.addEventListener('scroll', () => {
             // 3D pivot effect around the vertical center (Y-axis)
            const scrolled = window.scrollY;
            // Cap the rotation between 0 and 35 degrees so it remains readable
            const tilt = Math.max(-35, Math.min(scrolled * 0.06, 35));
            heroHandImage.style.transform = `rotateY(${tilt}deg)`;
        });
    }

    // Books Slider Logic (Vertical to Horizontal)
    const booksWrapper = document.getElementById('books-scroll-wrapper');
    const booksTrack = document.getElementById('books-slider-track');
    const dots = document.querySelectorAll('.slider-dot');
    
    if (booksWrapper && booksTrack) {
        window.addEventListener('scroll', () => {
            const rect = booksWrapper.getBoundingClientRect();
            // Match the 10vh top and 80vh height CSS definition
            const stickyTop = window.innerHeight * 0.1; 
            const stickyContainerHeight = window.innerHeight * 0.8; 
            
            // Calculate how far we've scrolled past the sticky trigger point
            const scrollDistance = Math.max(0, stickyTop - rect.top);
            
            // The total scrollable distance within the sticky state
            const maxScrollable = booksWrapper.offsetHeight - stickyContainerHeight;
            
            // Normalize progress between 0 and 1
            let progress = scrollDistance / maxScrollable;
            progress = Math.max(0, Math.min(1, progress));
            
            // Translate the track horizontally
            const maxTranslate = booksTrack.scrollWidth - booksTrack.clientWidth;
            booksTrack.style.transform = `translateX(-${progress * maxTranslate}px)`;
            
            // Update the active dot
            if(dots.length > 0) {
                const activeIndex = Math.round(progress * (dots.length - 1));
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === activeIndex);
                });
            }
        });
        
        // Update scrollToBook to scroll the page vertically to the right spot
        window.scrollToBook = function(bookNumber) {
            if(dots.length === 0) return;
            const index = bookNumber - 1;
            const targetProgress = index / (dots.length - 1);
            
            const stickyTop = window.innerHeight * 0.1;
            const stickyContainerHeight = window.innerHeight * 0.8;
            const maxScrollable = booksWrapper.offsetHeight - stickyContainerHeight;
            const wrapperDocTop = window.scrollY + booksWrapper.getBoundingClientRect().top;
            
            const targetScrollY = wrapperDocTop - stickyTop + (targetProgress * maxScrollable);
            
            window.scrollTo({
                top: targetScrollY,
                behavior: 'smooth'
            });
        };
    }
});
