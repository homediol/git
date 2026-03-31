<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pavona Studio | Responsive Preview</title>
    <meta name="description" content="Responsive preview for Pavona Studio with a mobile-first layout, clean UI, and lightweight interactions.">
    <meta name="theme-color" content="#f6efe7">
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicons/favicon.svg') }}">
    <link rel="stylesheet" href="{{ asset('pavona-studio-responsive.css') }}">
</head>
<body>
    <a class="skip-link" href="#main-content">Skip to content</a>

    <header class="site-header" data-header>
        <div class="container nav-shell">
            <a class="brand" href="#top" aria-label="Pavona Studio home">
                <span class="brand-mark">P</span>
                <span class="brand-copy">
                    <strong>Pavona Studio</strong>
                    <small>Photography, film, design, and live production</small>
                </span>
            </a>

            <button
                class="nav-toggle"
                type="button"
                aria-expanded="false"
                aria-controls="site-menu"
                aria-label="Open navigation"
                data-nav-toggle
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <nav class="site-nav" id="site-menu" data-nav>
                <a href="#services">Services</a>
                <a href="#portfolio">Portfolio</a>
                <a href="#process">Process</a>
                <a href="#reviews">Reviews</a>
                <a href="#faq">FAQ</a>
                <a class="nav-cta" href="#contact">Book now</a>
            </nav>
        </div>
    </header>

    <main id="main-content">
        <section class="hero section" id="top">
            <div class="container hero-grid">
                <div class="hero-copy reveal">
                    <p class="eyebrow">Responsive creative website</p>
                    <h1>Premium visuals, clean booking flow, and effortless usability on every screen.</h1>
                    <p class="hero-text">
                        Pavona Studio helps people and brands capture weddings, live events, portraits, campaigns,
                        and digital stories with a polished experience from first click to final delivery.
                    </p>

                    <div class="hero-actions">
                        <a class="button button-primary" href="#contact">Start a project</a>
                        <a class="button button-secondary" href="#portfolio">See our work</a>
                    </div>

                    <ul class="trust-list" aria-label="Highlights">
                        <li>Mobile-first layout</li>
                        <li>Tap-friendly actions</li>
                        <li>Fast-loading sections</li>
                    </ul>
                </div>

                <div class="hero-stage reveal">
                    <div class="hero-panel hero-panel-main">
                        <div class="panel-topline">
                            <span class="panel-label">This week</span>
                            <span class="status-pill">Open for bookings</span>
                        </div>
                        <h2>One studio, multiple production services.</h2>
                        <p>
                            Wedding storytelling, drone coverage, graduation sessions, brand visuals, real estate
                            media, and live event support.
                        </p>
                        <div class="metric-row">
                            <div class="metric-card">
                                <strong>48h</strong>
                                <span>Fast response time</span>
                            </div>
                            <div class="metric-card">
                                <strong>6+</strong>
                                <span>Core service lines</span>
                            </div>
                            <div class="metric-card">
                                <strong>All devices</strong>
                                <span>Responsive delivery</span>
                            </div>
                        </div>
                    </div>

                    <div class="hero-panel-grid">
                        <article class="hero-panel hero-card-accent">
                            <span class="mini-label">Photography</span>
                            <strong>Wedding + maternity + birthdays</strong>
                            <p>Clean layouts, quick inquiries, and clear service cards.</p>
                        </article>
                        <article class="hero-panel">
                            <span class="mini-label">Production</span>
                            <strong>Live streaming + sound system</strong>
                            <p>Useful info blocks and confident calls to action.</p>
                        </article>
                        <article class="hero-panel">
                            <span class="mini-label">Design</span>
                            <strong>Brand visuals that feel premium</strong>
                            <p>Strong typography, breathing space, and readable forms.</p>
                        </article>
                    </div>
                </div>
            </div>
        </section>

        <section class="section section-soft" id="services">
            <div class="container">
                <div class="section-heading reveal">
                    <p class="eyebrow">Services</p>
                    <h2>Built to help visitors understand your offer fast.</h2>
                    <p>
                        Every service card is easy to scan, easy to tap, and designed to stay consistent from phone
                        to desktop.
                    </p>
                </div>

                <div class="service-grid">
                    <article class="service-card reveal">
                        <span class="service-icon">01</span>
                        <h3>Wedding coverage</h3>
                        <p>Photography and videography packages for ceremonies, receptions, and save-the-date sessions.</p>
                    </article>
                    <article class="service-card reveal">
                        <span class="service-icon">02</span>
                        <h3>Maternity and personal sessions</h3>
                        <p>Portrait-focused pages with clear booking guidance and friendly mobile form controls.</p>
                    </article>
                    <article class="service-card reveal">
                        <span class="service-icon">03</span>
                        <h3>Graduation and birthday shoots</h3>
                        <p>Quick-glance packages, smooth scrolling sections, and responsive image storytelling.</p>
                    </article>
                    <article class="service-card reveal">
                        <span class="service-icon">04</span>
                        <h3>Drone and real estate media</h3>
                        <p>Bold cards and polished layouts that make visual services feel premium and easy to trust.</p>
                    </article>
                    <article class="service-card reveal">
                        <span class="service-icon">05</span>
                        <h3>Logo and brand design</h3>
                        <p>Strong hierarchy, clean calls to action, and professional presentation across breakpoints.</p>
                    </article>
                    <article class="service-card reveal">
                        <span class="service-icon">06</span>
                        <h3>Funerals and live streaming</h3>
                        <p>Simple navigation and respectful layouts for sensitive events and high-priority bookings.</p>
                    </article>
                </div>
            </div>
        </section>

        <section class="section" id="portfolio">
            <div class="container">
                <div class="section-heading reveal">
                    <p class="eyebrow">Selected work</p>
                    <h2>Portfolio filtering without heavy UI.</h2>
                    <p>
                        Lightweight JavaScript keeps the experience fast while helping users focus on the type of work
                        they want to see.
                    </p>
                </div>

                <div class="filter-bar reveal" role="tablist" aria-label="Portfolio filters">
                    <button class="filter-chip is-active" type="button" data-filter="all">All</button>
                    <button class="filter-chip" type="button" data-filter="wedding">Wedding</button>
                    <button class="filter-chip" type="button" data-filter="portraits">Portraits</button>
                    <button class="filter-chip" type="button" data-filter="brand">Brand</button>
                    <button class="filter-chip" type="button" data-filter="live">Live</button>
                </div>

                <div class="portfolio-grid">
                    <article class="portfolio-card reveal" data-category="wedding">
                        <div class="portfolio-visual tone-sunset"></div>
                        <div class="portfolio-copy">
                            <span class="tag">Wedding</span>
                            <h3>Lake-view celebration story</h3>
                            <p>Elegant storytelling blocks with clear information density and strong CTA placement.</p>
                        </div>
                    </article>
                    <article class="portfolio-card reveal" data-category="portraits">
                        <div class="portfolio-visual tone-studio"></div>
                        <div class="portfolio-copy">
                            <span class="tag">Portraits</span>
                            <h3>Graduation portrait collection</h3>
                            <p>Optimized spacing, readable captions, and layouts that stay balanced on narrow screens.</p>
                        </div>
                    </article>
                    <article class="portfolio-card reveal" data-category="brand">
                        <div class="portfolio-visual tone-amber"></div>
                        <div class="portfolio-copy">
                            <span class="tag">Brand</span>
                            <h3>Real estate launch visuals</h3>
                            <p>Content blocks built with CSS Grid for reliable scaling from mobile to large displays.</p>
                        </div>
                    </article>
                    <article class="portfolio-card reveal" data-category="live">
                        <div class="portfolio-visual tone-night"></div>
                        <div class="portfolio-copy">
                            <span class="tag">Live</span>
                            <h3>Corporate live streaming event</h3>
                            <p>Fast-access sections, sticky navigation, and touch-friendly controls for busy users.</p>
                        </div>
                    </article>
                    <article class="portfolio-card reveal" data-category="wedding portraits">
                        <div class="portfolio-visual tone-bloom"></div>
                        <div class="portfolio-copy">
                            <span class="tag">Wedding</span>
                            <h3>Save-the-date editorial session</h3>
                            <p>Refined composition and mobile-safe visual rhythm for a polished browsing experience.</p>
                        </div>
                    </article>
                    <article class="portfolio-card reveal" data-category="brand live">
                        <div class="portfolio-visual tone-teal"></div>
                        <div class="portfolio-copy">
                            <span class="tag">Production</span>
                            <h3>Sound system showcase page</h3>
                            <p>Strong contrast, clear interaction states, and lightweight motion for modern usability.</p>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <section class="section section-dark" id="process">
            <div class="container">
                <div class="section-heading section-heading-dark reveal">
                    <p class="eyebrow">Process</p>
                    <h2>Simple user flow from inquiry to delivery.</h2>
                    <p>Each step is intentionally clear so people can move forward confidently without friction.</p>
                </div>

                <div class="process-grid">
                    <article class="process-card reveal">
                        <span>Step 1</span>
                        <h3>Discover</h3>
                        <p>Users land on a clear homepage, understand services quickly, and choose the right category.</p>
                    </article>
                    <article class="process-card reveal">
                        <span>Step 2</span>
                        <h3>Compare</h3>
                        <p>Service and portfolio sections use cards, tags, and compact summaries that are easy to scan.</p>
                    </article>
                    <article class="process-card reveal">
                        <span>Step 3</span>
                        <h3>Book</h3>
                        <p>Forms stay short, fields are large enough for touch, and the next action is always obvious.</p>
                    </article>
                    <article class="process-card reveal">
                        <span>Step 4</span>
                        <h3>Follow up</h3>
                        <p>Clear contact details and responsive layouts keep communication simple after submission.</p>
                    </article>
                </div>
            </div>
        </section>

        <section class="section" id="reviews">
            <div class="container">
                <div class="section-heading reveal">
                    <p class="eyebrow">Client experience</p>
                    <h2>Designed to feel reliable before the first conversation.</h2>
                    <p>Clear content, consistent spacing, and comfortable tap zones reduce friction for every visitor.</p>
                </div>

                <div class="review-grid">
                    <blockquote class="review-card reveal">
                        <p>“The site made booking easy on my phone. I found the service I wanted in seconds.”</p>
                        <footer>Wedding client</footer>
                    </blockquote>
                    <blockquote class="review-card reveal">
                        <p>“Everything felt polished and professional, especially the service cards and contact flow.”</p>
                        <footer>Brand client</footer>
                    </blockquote>
                    <blockquote class="review-card reveal">
                        <p>“Clean layout, easy navigation, and great spacing even on a small screen.”</p>
                        <footer>Graduation session client</footer>
                    </blockquote>
                </div>
            </div>
        </section>

        <section class="section section-soft" id="faq">
            <div class="container">
                <div class="section-heading reveal">
                    <p class="eyebrow">FAQ</p>
                    <h2>Short answers that keep people moving.</h2>
                    <p>A light accordion keeps information compact on mobile and convenient on larger screens.</p>
                </div>

                <div class="faq-list" data-accordion>
                    <article class="faq-item reveal">
                        <button class="faq-trigger" type="button" aria-expanded="false">
                            <span>Can this layout work on phones, tablets, and desktops?</span>
                            <span class="faq-icon">+</span>
                        </button>
                        <div class="faq-panel">
                            <p>Yes. The preview uses a mobile-first structure, flexible containers, CSS Grid, and Flexbox without fixed widths.</p>
                        </div>
                    </article>
                    <article class="faq-item reveal">
                        <button class="faq-trigger" type="button" aria-expanded="false">
                            <span>Are the buttons and forms touch-friendly?</span>
                            <span class="faq-icon">+</span>
                        </button>
                        <div class="faq-panel">
                            <p>Yes. Interactive controls have generous padding, clear focus states, and visible active feedback for touch devices.</p>
                        </div>
                    </article>
                    <article class="faq-item reveal">
                        <button class="faq-trigger" type="button" aria-expanded="false">
                            <span>Is the page heavy to load?</span>
                            <span class="faq-icon">+</span>
                        </button>
                        <div class="faq-panel">
                            <p>No. It uses lightweight HTML, CSS, and vanilla JavaScript with small animations and no heavy libraries.</p>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <section class="section contact-section" id="contact">
            <div class="container contact-grid">
                <div class="contact-copy reveal">
                    <p class="eyebrow">Book a session</p>
                    <h2>Ready for a site that feels easy to use on every device?</h2>
                    <p>
                        This demo focuses on clarity, quick navigation, and tap-friendly interactions so visitors can
                        move from interest to inquiry without friction.
                    </p>

                    <ul class="contact-points">
                        <li>WhatsApp and call actions can stay one tap away</li>
                        <li>Short forms reduce drop-off on mobile</li>
                        <li>Responsive sections keep content readable everywhere</li>
                    </ul>
                </div>

                <div class="contact-card reveal">
                    <form id="lead-form" novalidate>
                        <div class="field-grid">
                            <label class="field">
                                <span>Name</span>
                                <input type="text" name="name" placeholder="Your full name" required>
                                <small class="field-error" data-error-for="name"></small>
                            </label>

                            <label class="field">
                                <span>Email</span>
                                <input type="email" name="email" placeholder="you@example.com" required>
                                <small class="field-error" data-error-for="email"></small>
                            </label>
                        </div>

                        <div class="field-grid">
                            <label class="field">
                                <span>Service</span>
                                <select name="service" required>
                                    <option value="">Select a service</option>
                                    <option value="Wedding coverage">Wedding coverage</option>
                                    <option value="Portrait session">Portrait session</option>
                                    <option value="Drone coverage">Drone coverage</option>
                                    <option value="Live streaming">Live streaming</option>
                                    <option value="Logo design">Logo design</option>
                                </select>
                                <small class="field-error" data-error-for="service"></small>
                            </label>

                            <label class="field">
                                <span>Event date</span>
                                <input type="date" name="date">
                            </label>
                        </div>

                        <label class="field">
                            <span>Project details</span>
                            <textarea name="details" rows="5" placeholder="Tell us about your event, location, or goals." required></textarea>
                            <small class="field-error" data-error-for="details"></small>
                        </label>

                        <button class="button button-primary button-full" type="submit">Send inquiry</button>
                        <p class="form-feedback" data-form-feedback aria-live="polite"></p>
                    </form>
                </div>
            </div>
        </section>
    </main>

    <footer class="site-footer">
        <div class="container footer-grid">
            <div>
                <a class="brand brand-footer" href="#top">
                    <span class="brand-mark">P</span>
                    <span class="brand-copy">
                        <strong>Pavona Studio</strong>
                        <small>Responsive preview page</small>
                    </span>
                </a>
            </div>

            <div class="footer-links">
                <a href="#services">Services</a>
                <a href="#portfolio">Portfolio</a>
                <a href="#contact">Contact</a>
            </div>

            <p class="footer-note">© <span data-year></span> Pavona Studio. Built with responsive HTML, CSS, and JavaScript.</p>
        </div>
    </footer>

    <script src="{{ asset('pavona-studio-responsive.js') }}" defer></script>
</body>
</html>
