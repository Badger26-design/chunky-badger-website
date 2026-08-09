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

    // --- Dynamic Our Books Central Catalog Data & Renderer ---
    const BOOKS_DATA = [
        {
            id: 'british-animals',
            label: 'British Animals',
            title: 'Learn to Draw:<br><span class="text-gold">British Animals</span>',
            imageSrc: 'Pictures/Mockups/UK/Cover/British%20Animals%20Over%20Mockup-no-shadow-transparent.png',
            imageAlt: 'Learn to Draw British Animals book cover mockup by Chunky Badger',
            imageClass: '',
            features: [
                '<strong>45+ animals</strong> from woodland, farm &amp; seaside',
                '<strong>6 simple steps</strong> per animal — no reading needed',
                '<strong>Draw &amp; colour</strong> right inside the book'
            ],
            moreInfoUrl: 'product-british-animals.html',
            amazonUrl: 'https://amzn.eu/d/0dFI2cpF',
            delayClass: ''
        },
        {
            id: 'african-animals',
            label: 'African Animals',
            title: 'Learn to Draw:<br><span class="text-gold">African Animals</span>',
            imageSrc: 'Pictures/Figma/Images/Our%20Books/CB%20African%20Animals%20Front%20Cover%20mockup-cut.png',
            imageAlt: 'Learn to Draw African Animals book cover mockup by Chunky Badger',
            imageClass: 'product-card-image--african',
            features: [
                '<strong>40+ animals</strong> from savanna, jungle &amp; rivers',
                '<strong>6 simple steps</strong> per animal — no reading needed',
                '<strong>Draw &amp; colour</strong> right inside the book'
            ],
            moreInfoUrl: 'product-african-animals.html',
            amazonUrl: 'https://amzn.eu/d/0aOUGahP',
            delayClass: 'delay-200'
        }
    ];

    function renderOurBooks() {
        const bookGrids = document.querySelectorAll('[data-books-grid]');
        if (!bookGrids.length) return;

        const htmlContent = BOOKS_DATA.map(book => `
                    <!-- Card: ${book.label} -->
                    <div class="product-card reveal ${book.delayClass}">
                        <div class="product-card-image ${book.imageClass}">
                            <img src="${book.imageSrc}"
                                alt="${book.imageAlt}">
                        </div>
                        <div class="product-card-body">
                            <p class="product-card-label">${book.label}</p>
                            <h3 class="product-card-title">${book.title}</h3>
                            <ul class="styled-list white-check product-card-list">
                                ${book.features.map(f => `<li>${f}</li>`).join('\n                                ')}
                            </ul>
                            <div class="product-card-actions">
                                <a href="${book.moreInfoUrl}" class="btn more-info-btn">More Info</a>
                                <a href="${book.amazonUrl}" target="_blank" class="btn btn-warning">Buy on Amazon</a>
                            </div>
                        </div>
                    </div>`).join('\n\n');

        bookGrids.forEach(grid => {
            grid.innerHTML = htmlContent;
            grid.querySelectorAll('.reveal').forEach(el => {
                if (typeof observer !== 'undefined') {
                    observer.observe(el);
                } else {
                    el.classList.add('active');
                }
            });
        });
    }

    renderOurBooks();

    // --- Subtle Cookie Bar ---
    const cookieName = 'cb_cookies_accepted';
    if (!localStorage.getItem(cookieName)) {
        const cookieBar = document.createElement('div');
        cookieBar.className = 'cookie-bar';
        cookieBar.innerHTML = `
            <p>We use cookies to ensure you get the best experience on our website. <a href="privacy-policy.html">Learn more</a></p>
            <button class="btn-cookie" id="accept-cookies">Got it!</button>
        `;
        document.body.appendChild(cookieBar);

        // Slight delay to allow transition to happen after appending
        setTimeout(() => {
            cookieBar.classList.add('show');
        }, 500);

        document.getElementById('accept-cookies').addEventListener('click', () => {
            localStorage.setItem(cookieName, 'true');
            cookieBar.classList.remove('show');
            setTimeout(() => {
                cookieBar.remove();
            }, 500);
        });
    }
});
