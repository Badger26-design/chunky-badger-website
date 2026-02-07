document.addEventListener('DOMContentLoaded', () => {
    // Smooth Scroll for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 100;
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

    // --- Hero Image Sequence Animation ---
    const canvas = document.getElementById('hero-animation');
    const loadingOverlay = document.getElementById('loading-overlay');
    let ctx = null;

    if (canvas) {
        ctx = canvas.getContext('2d');

        // Canvas sizing
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Image Configuration
        const frameCount = 41;
        const currentFrame = index => (
            `Pictures/Home header animation/Smooth_animation_of_1080p_202602071504_${index.toString().padStart(3, '0')}.jpg`
        );

        const images = [];
        const animationState = { frame: 0 };

        const render = () => {
            if (!ctx) return;
            const img = images[animationState.frame];
            if (!img) return;

            // "Cover" fit logic
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio = Math.max(hRatio, vRatio);
            const centerShift_x = (canvas.width - img.width * ratio) / 2;
            const centerShift_y = (canvas.height - img.height * ratio) / 2;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, img.width, img.height,
                centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
        };

        const setupScrollAnimation = () => {
            const heroSection = document.getElementById('hero');

            window.addEventListener('scroll', () => {
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;

                if (heroSection) {
                    const sectionTop = heroSection.offsetTop;
                    const sectionHeight = heroSection.offsetHeight;

                    // Simple progress calculation based on sticky container
                    let progress = (scrollY - sectionTop) / (sectionHeight - windowHeight);
                    progress = Math.max(0, Math.min(1, progress));

                    const frameIndex = Math.min(
                        frameCount - 1,
                        Math.floor(progress * frameCount)
                    );

                    if (animationState.frame !== frameIndex) {
                        animationState.frame = frameIndex;
                        requestAnimationFrame(render);
                    }
                }
            });
        };

        // Preload Images
        let loadedCount = 0;
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            img.onload = () => {
                loadedCount++;
                if (loadedCount === frameCount) {
                    if (loadingOverlay) {
                        loadingOverlay.style.opacity = '0';
                        setTimeout(() => loadingOverlay.style.display = 'none', 500);
                    }
                    render();
                    setupScrollAnimation();
                }
            };
            img.onerror = () => {
                console.error("Failed to load image", i);
                // Ensure we don't get stuck if one image fails
                loadedCount++;
                if (loadedCount === frameCount && loadingOverlay) {
                    loadingOverlay.style.opacity = '0';
                    setTimeout(() => loadingOverlay.style.display = 'none', 500);
                }
            };
            images.push(img);
        }

    } else {
        // No canvas, hide loader immediately
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }


    // --- Coming Soon Carousel Logic ---
    const carouselTrack = document.querySelector('.carousel-track');
    if (carouselTrack) {
        const slides = Array.from(carouselTrack.children);
        const nextButton = document.querySelector('.next-btn');
        const prevButton = document.querySelector('.prev-btn');
        let currentIndex = 0;

        const getVisibleCount = () => window.innerWidth > 768 ? 3 : 1;

        const updateCarousel = () => {
            if (slides.length === 0) return;
            const slideWidth = slides[0].getBoundingClientRect().width;
            const amountToMove = slideWidth * currentIndex;
            carouselTrack.style.transform = `translateX(-${amountToMove}px)`;
        };

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                const visibleCount = getVisibleCount();
                const maxIndex = Math.max(0, slides.length - visibleCount);
                if (currentIndex < maxIndex) {
                    currentIndex++;
                } else {
                    currentIndex = 0;
                }
                updateCarousel();
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                const visibleCount = getVisibleCount();
                const maxIndex = Math.max(0, slides.length - visibleCount);
                if (currentIndex > 0) {
                    currentIndex--;
                } else {
                    currentIndex = maxIndex;
                }
                updateCarousel();
            });
        }

        window.addEventListener('resize', () => {
            // Reset to 0 on resize to avoid alignment issues, or just update
            currentIndex = 0;
            updateCarousel();
        });

        // Initial init
        setTimeout(updateCarousel, 100);
    }

});
