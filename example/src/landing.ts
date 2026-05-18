/**
 * Nexus.js Landing Page Example
 * A modern product landing page demonstrating:
 * - Layout helpers (row, column, center, grid)
 * - Event handling (on, onMulti)
 * - State management (createStore)
 * - CSS helpers (cls, css)
 * - Components pattern
 */

import {
  div, h1, h2, h3, p, span, a, button, input, textarea, form,
  img, nav, header, footer, main, section, article,
  ul, li, hr, spacer,
  cls, css, id, on, onMulti, href, ph, type, name, val, required,
  row, column, center, grid, flex, full,
  createStore, createDOM, createApp,
} from '../framework/src/nexus';

// ============================================================================
// STORE — Pricing tier selection
// ============================================================================

const store = createStore({
  selectedPlan: 'standard',
  features: [
    { icon: '🚀', title: 'Fast', desc: 'Built for speed with minimal overhead' },
    { icon: '🔒', title: 'Secure', desc: 'Type-safe by default with TypeScript' },
    { icon: '📦', title: 'Lightweight', desc: 'Under 5KB gzipped, no dependencies' },
    { icon: '⚡', title: 'Intuitive', desc: 'Write HTML-like code in JavaScript' },
  ],
  plans: [
    { id: 'basic', name: 'Basic', price: 0, features: ['5 projects', '1GB storage', 'Community support'] },
    { id: 'standard', name: 'Standard', price: 19, features: ['25 projects', '10GB storage', 'Email support', 'API access'] },
    { id: 'pro', name: 'Pro', price: 49, features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access', 'Custom domains'] },
  ],
  navLinks: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
  ],
});

// ============================================================================
// RENDER FUNCTIONS
// ============================================================================

function renderNavbar() {
  return header([
    nav([cls('navbar')], [
      row([
        div([
          a('Nexus.js', { href: '#', className: 'brand' }),
        ]),
        div([
          ...store.get('navLinks').map(link =>
            a(link.label, { href: link.href, className: 'nav-link' })
          ),
          button('Get Started', {
            on: { click: () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) },
            className: 'btn-primary',
          }),
        ], cls('nav-menu')),
      ], 0),
    ]),
  ], css({ position: 'sticky', top: 0, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 100 }));
}

function renderHero() {
  return section([cls('hero')], [
    center([
      span('Introducing', css({ fontSize: '14px', color: '#0969da', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase' })),
      h1('Build web apps with pleasure', css({ fontSize: '48px', fontWeight: '800', color: '#1a1a2e', lineHeight: '1.2', marginTop: '12px' })),
      p('A lightweight frontend framework that makes building interactive UIs feel natural. No complex setup, no steep learning curve.', css({ fontSize: '18px', color: '#57606a', maxWidth: '600px', marginTop: '16px', lineHeight: '1.6' })),
      spacer(32),
      row([
        button('Start Free', {
          on: { click: () => store.set('selectedPlan', 'basic') },
          className: 'btn-primary btn-lg',
        }),
        button('See Examples', {
          on: { click: () => window.open('https://github.com/AG064/dot-js', '_blank') },
          className: 'btn-secondary btn-lg',
        }),
      ], 16),
      spacer(48),
      img('https://picsum.photos/800/400?random=1', { alt: 'Dashboard preview', style: { width: '100%', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }),
    ], 800),
  ]);
}

function renderFeatures() {
  const features = store.get('features');
  return section([id('features'), cls('section')], [
    center([
      h2('Everything you need', css({ fontSize: '36px', fontWeight: '700', textAlign: 'center', color: '#1a1a2e' })),
      p('Powerful features wrapped in a simple API', css({ fontSize: '18px', color: '#57606a', textAlign: 'center', marginTop: '8px' })),
      spacer(40),
      grid(
        features.map(f => div([
          span(f.icon, css({ fontSize: '32px' })),
          h3(f.title, css({ fontSize: '20px', fontWeight: '600', marginTop: '12px' })),
          p(f.desc, css({ fontSize: '15px', color: '#57606a', marginTop: '8px', lineHeight: '1.5' })),
        ], css({ padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }))),
        2, 24
      ),
    ], 1000),
  ]);
}

function renderPricing() {
  const { plans, selectedPlan } = store.getState();
  return section([id('pricing'), cls('section')], [
    center([
      h2('Simple pricing', css({ fontSize: '36px', fontWeight: '700', textAlign: 'center', color: '#1a1a2e' })),
      p('Start free, upgrade when you need', css({ fontSize: '18px', color: '#57606a', textAlign: 'center', marginTop: '8px' })),
      spacer(40),
      flex([
        ...plans.map(plan => {
          const isSelected = selectedPlan === plan.id;
          const isPopular = plan.id === 'standard';
          return div([
            isPopular ? span('Most Popular', css({ fontSize: '12px', fontWeight: '600', color: '#fff', background: '#0969da', padding: '4px 12px', borderRadius: '20px' })) : null,
            h3(plan.name, css({ fontSize: '24px', fontWeight: '600', marginTop: '8px' })),
            div([css({ fontSize: '48px', fontWeight: '800', color: '#1a1a2e' })],
              `$${plan.price}`
            ),
            plan.price > 0 ? span('/month', css({ fontSize: '14px', color: '#57606a' })) : span('/forever', css({ fontSize: '14px', color: '#57606a' })),
            hr(css({ margin: '20px 0', border: 'none', borderTop: '1px solid #e8ecf0' })),
            ul(plan.features.map(f => li(f, css({ padding: '8px 0', color: '#57606a' }))), css({ listStyle: 'none' })),
            spacer(16),
            button(isSelected ? 'Selected' : 'Choose Plan', {
              on: { click: () => store.set('selectedPlan', plan.id) },
              className: isSelected ? 'btn-secondary' : 'btn-primary',
              style: { width: '100%' },
            }),
          ], css({
            padding: '32px',
            background: isSelected ? '#f6f8fa' : '#fff',
            border: isSelected ? '2px solid #0969da' : '2px solid #e8ecf0',
            borderRadius: '16px',
            minWidth: '260px',
          }));
        }),
      ], 'row', 24, 'stretch'),
    ], 1000),
  ]);
}

function renderContact() {
  let formState = { name: '', email: '', message: '' };
  let submitted = false;

  return section([id('contact'), cls('section')], [
    center([
      h2('Get in touch', css({ fontSize: '36px', fontWeight: '700', textAlign: 'center', color: '#1a1a2e' })),
      p("Have questions? We'd love to hear from you.", css({ fontSize: '18px', color: '#57606a', textAlign: 'center', marginTop: '8px' })),
      spacer(40),
      div([
        form([
          div([css({ marginBottom: '20px' })], [
            label('Name', { for: 'contact-name' }),
            input({ id: 'contact-name', placeholder: 'Your name', required: true }),
          ]),
          div([css({ marginBottom: '20px' })], [
            label('Email', { for: 'contact-email' }),
            input({ id: 'contact-email', type: 'email', placeholder: 'you@example.com', required: true }),
          ]),
          div([css({ marginBottom: '20px' })], [
            label('Message', { for: 'contact-message' }),
            textarea('', { id: 'contact-message', placeholder: 'Your message...', required: true }),
          ]),
          button('Send Message', {
            type: 'submit',
            className: 'btn-primary btn-lg',
          }),
        ], css({ maxWidth: '500px', margin: '0 auto' })),
      ], css({ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' })),
    ], 800),
  ]);
}

function renderFooter() {
  return footer([cls('footer')], [
    center([
      row([
        div([
          span('Nexus.js', css({ fontWeight: '600', fontSize: '18px' })),
          p('Building the future of web development.', css({ fontSize: '14px', color: '#57606a', marginTop: '4px' })),
        ]),
        div([cls('footer-links')], [
          a('GitHub', { href: 'https://github.com/AG064/dot-js', target: '_blank' }),
          a('Documentation', { href: '#' }),
          a('Twitter', { href: '#' }),
        ], css({ display: 'flex', gap: '24px' })),
      ], 0),
      hr(css({ margin: '24px 0', border: 'none', borderTop: '1px solid #e8ecf0' })),
      p('© 2026 Nexus.js. All rights reserved.', css({ fontSize: '14px', color: '#57606a', textAlign: 'center' })),
    ], 1000),
  ]);
}

function renderApp() {
  return div([
    renderNavbar(),
    main([
      renderHero(),
      renderFeatures(),
      renderPricing(),
      renderContact(),
    ]),
    renderFooter(),
  ]);
}

// ============================================================================
// BOOTSTRAP
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  if (!root) return;

  const node = createDOM(renderApp());
  root.appendChild(node);

  // Setup smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href !== '#') {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});