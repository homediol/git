(function () {
    const body = document.body;
    const header = document.querySelector('[data-header]');
    const navToggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-nav]');
    const navLinks = nav ? Array.from(nav.querySelectorAll('a')) : [];
    const revealItems = Array.from(document.querySelectorAll('.reveal'));
    const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
    const portfolioCards = Array.from(document.querySelectorAll('.portfolio-card[data-category]'));
    const faqItems = Array.from(document.querySelectorAll('.faq-item'));
    const form = document.getElementById('lead-form');
    const formFeedback = document.querySelector('[data-form-feedback]');
    const yearTarget = document.querySelector('[data-year]');

    const setNavState = (isOpen) => {
        if (!navToggle || !nav) {
            return;
        }

        navToggle.classList.toggle('is-open', isOpen);
        nav.classList.toggle('is-open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        body.classList.toggle('nav-open', isOpen);
    };

    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            const nextState = navToggle.getAttribute('aria-expanded') !== 'true';
            setNavState(nextState);
        });

        navLinks.forEach((link) => {
            link.addEventListener('click', () => setNavState(false));
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 960) {
                setNavState(false);
            }
        });
    }

    const updateHeaderState = () => {
        if (!header) {
            return;
        }

        header.classList.toggle('is-scrolled', window.scrollY > 12);
    };

    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, {
            threshold: 0.16,
            rootMargin: '0px 0px -40px 0px',
        });

        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add('is-visible'));
    }

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');

            filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));

            portfolioCards.forEach((card) => {
                const categories = (card.getAttribute('data-category') || '').split(/\s+/);
                const shouldShow = filter === 'all' || categories.includes(filter);
                card.classList.toggle('is-hidden', !shouldShow);
            });
        });
    });

    faqItems.forEach((item) => {
        const trigger = item.querySelector('.faq-trigger');
        if (!trigger) {
            return;
        }

        trigger.addEventListener('click', () => {
            const willOpen = !item.classList.contains('is-open');

            faqItems.forEach((entry) => {
                entry.classList.remove('is-open');
                const entryTrigger = entry.querySelector('.faq-trigger');
                if (entryTrigger) {
                    entryTrigger.setAttribute('aria-expanded', 'false');
                }
            });

            if (willOpen) {
                item.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });

    const setFieldError = (name, message) => {
        const errorNode = document.querySelector(`[data-error-for="${name}"]`);
        if (errorNode) {
            errorNode.textContent = message || '';
        }
    };

    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const values = {
                name: String(formData.get('name') || '').trim(),
                email: String(formData.get('email') || '').trim(),
                service: String(formData.get('service') || '').trim(),
                details: String(formData.get('details') || '').trim(),
            };

            let isValid = true;

            if (!values.name) {
                setFieldError('name', 'Please enter your name.');
                isValid = false;
            } else {
                setFieldError('name', '');
            }

            if (!values.email) {
                setFieldError('email', 'Please enter your email.');
                isValid = false;
            } else if (!validateEmail(values.email)) {
                setFieldError('email', 'Please use a valid email address.');
                isValid = false;
            } else {
                setFieldError('email', '');
            }

            if (!values.service) {
                setFieldError('service', 'Please choose a service.');
                isValid = false;
            } else {
                setFieldError('service', '');
            }

            if (!values.details) {
                setFieldError('details', 'Please add a few project details.');
                isValid = false;
            } else if (values.details.length < 16) {
                setFieldError('details', 'Please share a bit more so we can help properly.');
                isValid = false;
            } else {
                setFieldError('details', '');
            }

            if (!formFeedback) {
                return;
            }

            if (!isValid) {
                formFeedback.textContent = 'Please fix the highlighted fields and try again.';
                formFeedback.classList.remove('is-success');
                formFeedback.classList.add('is-error');
                return;
            }

            form.reset();
            formFeedback.textContent = 'Thanks. Your inquiry is ready to be connected to Pavona Studio booking flow.';
            formFeedback.classList.remove('is-error');
            formFeedback.classList.add('is-success');
        });
    }

    if (yearTarget) {
        yearTarget.textContent = String(new Date().getFullYear());
    }
})();
