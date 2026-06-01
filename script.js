/* ==========================================================================
   Apex Performance Club - Premium Interactions Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Header Scroll Effect
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    function toggleMenu() {
        menuToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
        
        // Prevent body scrolling when menu is active
        if (mobileNav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    menuToggle.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // 3. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.fade-in-up, .reveal-slide-up');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Stop tracking once animated
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 4. FAQ Accordion panel toggle
    const faqTriggers = document.querySelectorAll('.faq-trigger');

    faqTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const panel = trigger.nextElementSibling;
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            
            // Close all other panels first
            faqTriggers.forEach(otherTrigger => {
                if (otherTrigger !== trigger) {
                    otherTrigger.setAttribute('aria-expanded', 'false');
                    otherTrigger.nextElementSibling.style.maxHeight = null;
                }
            });

            // Toggle current panel
            if (isExpanded) {
                trigger.setAttribute('aria-expanded', 'false');
                panel.style.maxHeight = null;
            } else {
                trigger.setAttribute('aria-expanded', 'true');
                panel.style.maxHeight = panel.scrollHeight + 'px';
            }
        });
    });

    // 5. Transformation Slider
    const slides = document.querySelectorAll('.transformation-slide');
    const prevBtn = document.querySelector('.prev-slide');
    const nextBtn = document.querySelector('.next-slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    let currentSlide = 0;

    function showSlide(index) {
        // Handle wrapping
        if (index >= slides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = index;
        }

        // Toggle slide active states
        slides.forEach((slide, idx) => {
            if (idx === currentSlide) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        // Toggle dot active states
        dots.forEach((dot, idx) => {
            if (idx === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            showSlide(currentSlide - 1);
        });

        nextBtn.addEventListener('click', () => {
            showSlide(currentSlide + 1);
        });

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.getAttribute('data-index'), 10);
                showSlide(index);
            });
        });
    }

    // 6. Lead Capturing Modals & CTAs
    const modal = document.getElementById('booking-modal');
    const modalClose = document.querySelector('.modal-close');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const modalGoalSelect = document.getElementById('modal-goal');
    
    // Time slot elements inside modal
    const timeSlotBtns = document.querySelectorAll('.time-slot-btn');
    const hiddenTimeInput = document.getElementById('modal-time-slot');

    function openModal(planName = '') {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Pre-select modal goal if a plan button is pressed
        if (planName && modalGoalSelect) {
            if (planName.toLowerCase() === 'starter') {
                modalGoalSelect.value = 'strength'; // fallback general
            } else if (planName.toLowerCase() === 'growth') {
                modalGoalSelect.value = 'muscle';
            } else if (planName.toLowerCase() === 'elite') {
                modalGoalSelect.value = 'weightloss';
            }
        }
    }

    function closeModal() {
        modal.classList.remove('active');
        if (!mobileNav.classList.contains('active')) {
            document.body.style.overflow = '';
        }
        
        // Reset time slot selections
        timeSlotBtns.forEach(btn => btn.classList.remove('active'));
        if (hiddenTimeInput) hiddenTimeInput.value = '';
        
        // Hide synced profile message
        const profileSyncBanner = document.getElementById('modal-profile-sync');
        if (profileSyncBanner) {
            profileSyncBanner.style.display = 'none';
            profileSyncBanner.innerHTML = '';
        }
    }

    // Modal Time Slot Selection event listeners
    timeSlotBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            timeSlotBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (hiddenTimeInput) {
                hiddenTimeInput.value = btn.getAttribute('data-time');
            }
        });
    });

    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const plan = btn.getAttribute('data-plan') || '';
            openModal(plan);
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // 7. Toast Alerts & Form Submissions
    const successToast = document.getElementById('success-toast');
    const contactForm = document.getElementById('contact-form');
    const modalForm = document.getElementById('modal-form');

    function showToast() {
        successToast.classList.add('active');
        
        // Hide toast after 4.5 seconds
        setTimeout(() => {
            successToast.classList.remove('active');
        }, 4500);
    }

    function handleFormSubmit(e, isModal = false) {
        e.preventDefault();
        
        // Retrieve form input data (visual simulation)
        const formData = new FormData(e.target);
        const name = formData.get('name');
        
        // Simulate high-performance loading state on submit button
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing Security Entry...';

        setTimeout(() => {
            // Restore button and close modals
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            if (isModal) {
                closeModal();
            }
            
            // Clean forms
            e.target.reset();
            
            // Present gorgeous success notification
            showToast();
        }, 1200);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => handleFormSubmit(e, false));
    }

    if (modalForm) {
        modalForm.addEventListener('submit', (e) => handleFormSubmit(e, true));
    }

    // 8. Interactive Macro Calculator Logic
    const calcWeightInput = document.getElementById('calc-weight');
    const calcHeightInput = document.getElementById('calc-height');
    const calcActivitySelect = document.getElementById('calc-activity');
    const weightValDisplay = document.getElementById('weight-val');
    const heightValDisplay = document.getElementById('height-val');
    
    const goalBtns = document.querySelectorAll('.goal-btn');
    const caloriesDisplay = document.getElementById('calories-display');
    const proteinDisplay = document.getElementById('protein-display');
    const carbsDisplay = document.getElementById('carbs-display');
    const fatsDisplay = document.getElementById('fats-display');
    
    const proteinBar = document.getElementById('protein-bar');
    const carbsBar = document.getElementById('carbs-bar');
    const fatsBar = document.getElementById('fats-bar');
    
    const recommendationText = document.getElementById('recommendation-text');
    const calcCtaBtn = document.getElementById('calc-cta-btn');
    
    let selectedGoal = 'recomp'; // default
    
    function calculateApexFormula() {
        if (!calcWeightInput || !calcHeightInput || !calcActivitySelect) return;
        
        const weight = parseFloat(calcWeightInput.value);
        const height = parseFloat(calcHeightInput.value);
        const activityFactor = parseFloat(calcActivitySelect.value);
        
        // Mifflin-St Jeor Equation (BMR) + Balanced athletic adjustments
        const bmr = (10 * weight) + (6.25 * height) - (5 * 30) + 5;
        const tdee = bmr * activityFactor;
        
        let targetCalories = 0;
        let proteinGrams = 0;
        let fatGrams = 0;
        let carbGrams = 0;
        let advice = '';
        
        if (selectedGoal === 'recomp') {
            // Fat Loss & Recomposition (18% Calorie Deficit)
            targetCalories = Math.round(tdee * 0.82);
            proteinGrams = Math.round(weight * 2.2); // 2.2g per kg
            const fatCalories = targetCalories * 0.25; // 25% of calories
            fatGrams = Math.round(fatCalories / 9);
            const remainingCalories = targetCalories - (proteinGrams * 4) - (fatGrams * 9);
            carbGrams = Math.max(0, Math.round(remainingCalories / 4));
            advice = `Based on your goal to recomp, we recommend the <strong>Elite Plan</strong>. This covers dynamic macro tracking, weekly body scans, and tailored metabolic styling.`;
        } else if (selectedGoal === 'bulk') {
            // Clean Muscle Bulk (10% Calorie Surplus)
            targetCalories = Math.round(tdee * 1.10);
            proteinGrams = Math.round(weight * 2.0); // 2.0g per kg
            const fatCalories = targetCalories * 0.25;
            fatGrams = Math.round(fatCalories / 9);
            const remainingCalories = targetCalories - (proteinGrams * 4) - (fatGrams * 9);
            carbGrams = Math.max(0, Math.round(remainingCalories / 4));
            advice = `Based on your goal to build muscle, we recommend the <strong>Growth Plan</strong> to leverage custom progressive overload strength blueprints.`;
        } else {
            // Raw Power & Strength (Maintenance calories, higher fat and carb ratio)
            targetCalories = Math.round(tdee);
            proteinGrams = Math.round(weight * 2.2);
            const fatCalories = targetCalories * 0.30; // 30% of calories
            fatGrams = Math.round(fatCalories / 9);
            const remainingCalories = targetCalories - (proteinGrams * 4) - (fatGrams * 9);
            carbGrams = Math.max(0, Math.round(remainingCalories / 4));
            advice = `Based on your strength goal, we recommend the <strong>Elite Plan</strong> to leverage velocity-based training systems and 1-on-1 personal coaching.`;
        }
        
        // Update values on page
        if (caloriesDisplay) {
            caloriesDisplay.innerHTML = `${targetCalories.toLocaleString()} <span class="kcal-unit">kcal / day</span>`;
        }
        if (proteinDisplay) proteinDisplay.textContent = `${proteinGrams} g`;
        if (carbsDisplay) carbsDisplay.textContent = `${carbGrams} g`;
        if (fatsDisplay) fatsDisplay.textContent = `${fatGrams} g`;
        
        // Update Progress Bars (Relative limits: Protein max 300g, Carbs max 500g, Fats max 150g)
        if (proteinBar) proteinBar.style.width = `${Math.min(100, (proteinGrams / 300) * 100)}%`;
        if (carbsBar) carbsBar.style.width = `${Math.min(100, (carbGrams / 500) * 100)}%`;
        if (fatsBar) fatsBar.style.width = `${Math.min(100, (fatGrams / 150) * 100)}%`;
        
        if (recommendationText) recommendationText.innerHTML = advice;
    }
    
    // Wire up Calculator event listeners
    if (calcWeightInput && calcHeightInput) {
        calcWeightInput.addEventListener('input', () => {
            if (weightValDisplay) weightValDisplay.textContent = `${calcWeightInput.value} kg`;
            calculateApexFormula();
        });
        
        calcHeightInput.addEventListener('input', () => {
            if (heightValDisplay) heightValDisplay.textContent = `${calcHeightInput.value} cm`;
            calculateApexFormula();
        });
        
        if (calcActivitySelect) {
            calcActivitySelect.addEventListener('change', calculateApexFormula);
        }
        
        goalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                goalBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedGoal = btn.getAttribute('data-goal');
                calculateApexFormula();
            });
        });
        
        // Initial run
        calculateApexFormula();
    }
    
    // Wire up modal trigger from calculator
    if (calcCtaBtn && modalGoalSelect) {
        calcCtaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Open booking modal
            openModal();
            
            // Synchronize goal value
            if (selectedGoal === 'recomp') {
                modalGoalSelect.value = 'weightloss';
            } else if (selectedGoal === 'bulk') {
                modalGoalSelect.value = 'muscle';
            } else {
                modalGoalSelect.value = 'strength';
            }
            
            // Sync values to hidden modal fields
            const weight = calcWeightInput.value;
            const calories = caloriesDisplay.textContent.replace(' kcal / day', '');
            
            document.getElementById('modal-sync-weight').value = weight;
            document.getElementById('modal-sync-calories').value = calories;
            document.getElementById('modal-sync-goal').value = selectedGoal;
            
            // Populate and show the sync notification inside the modal
            const syncBanner = document.getElementById('modal-profile-sync');
            if (syncBanner) {
                syncBanner.style.display = 'block';
                const goalLabel = selectedGoal === 'recomp' ? 'Recomp' : selectedGoal === 'bulk' ? 'Hypertrophy' : 'Strength';
                syncBanner.innerHTML = `🧬 <strong>Onboarding Sync</strong>: ${weight}kg | Goal: ${goalLabel} | Target: <strong>${calories} kcal/day</strong>. Your biomechanical assessment card is pre-initialized.`;
            }
        });
    }

    // 9. Video Review Player Modals
    const videoCards = document.querySelectorAll('.video-card');
    const videoModal = document.getElementById('video-modal');
    const videoModalClose = document.getElementById('video-modal-close');
    const videoModalTitle = document.getElementById('video-modal-title');
    const videoMetricGoal = document.getElementById('video-metric-goal');
    const videoMetricDuration = document.getElementById('video-metric-duration');
    const videoMetricResult = document.getElementById('video-metric-result');
    
    function openVideoModal(card) {
        if (!videoModal) return;
        
        const client = card.getAttribute('data-client') || '';
        const goal = card.getAttribute('data-goal') || '';
        const duration = card.getAttribute('data-duration') || '';
        const result = card.getAttribute('data-result') || '';
        
        if (videoModalTitle) videoModalTitle.textContent = `${client} - Transformation Story`;
        if (videoMetricGoal) videoMetricGoal.textContent = `Target: ${goal}`;
        if (videoMetricDuration) videoMetricDuration.textContent = `Duration: ${duration}`;
        if (videoMetricResult) videoMetricResult.textContent = `Result: ${result}`;
        
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeVideoModal() {
        if (videoModal) {
            videoModal.classList.remove('active');
            if (!mobileNav.classList.contains('active')) {
                document.body.style.overflow = '';
            }
        }
    }
    
    videoCards.forEach(card => {
        card.addEventListener('click', () => openVideoModal(card));
    });
    
    if (videoModalClose) {
        videoModalClose.addEventListener('click', closeVideoModal);
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });

    // 10. Active Nav link update based on scroll section
    const navItems = document.querySelectorAll('.nav-link');
    const scrollSections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        let scrollY = window.pageYOffset;
        
        scrollSections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 120;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navItems.forEach(item => {
                    if (item.getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    });

    // 11. Scroll Progress Indicator Line (Apple-style UX)
    const progressBar = document.getElementById('scroll-progress-bar');
    window.addEventListener('scroll', () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (progressBar) {
            progressBar.style.width = scrolled + '%';
        }
    });

    // 12. Dynamic Live Capacity Counter Ticker Simulation
    const capacityCountEl = document.getElementById('live-capacity-count');
    if (capacityCountEl) {
        setInterval(() => {
            const currentCount = parseInt(capacityCountEl.textContent, 10);
            let change = Math.random() > 0.5 ? 1 : -1;
            let nextCount = currentCount + change;
            if (nextCount < 3) nextCount = 3;
            if (nextCount > 7) nextCount = 7;
            capacityCountEl.textContent = nextCount;
        }, 7000);
    }
});
