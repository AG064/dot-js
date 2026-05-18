/**
 * Nexus.js Landing Page Example
 *
 * A simple product landing page demonstrating Nexus.js API:
 * - Element functions: div, h1, h2, p, button, etc.
 * - Layout helpers: row, column, grid, center
 * - Event handling: on()
 * - CSS helpers: cls, css
 */

import {
  div, h1, h2, h3, p, span, a, button, input, textarea, form,
  img, nav, header, footer, main, section,
  ul, li, hr, spacer,
  cls, css, id, on, onMulti, href,
  row, column, center, grid, flex, full,
  createStore, createDOM,
} from '../framework/src/nexus';

// ============================================================================
// STORE — Simple state
// ============================================================================

const store = createStore({
  plans: [
    { id: 'basic', name: 'Basic', price: 0 },
    { id: 'pro', name: 'Pro', price: 19 },
  ],
});

// ============================================================================
// SECTIONS
// ============================================================================

function renderNavbar() {
  return header([
    nav([cls('navbar')], [
      row([
        div([a('Nexus.js', { href: '#' })], css({ fontWeight: '700', fontSize: '20px' })),
        div([
          a('Features', { href: '#features' }),
          a('Pricing', { href: '#pricing' }),
        ], css({ display: 'flex', gap: '16px' })),
      ], 0),
    ]),
  ], css({ padding: '20px', background: '#fff', borderBottom: '1px solid #eee' }));
}

function renderHero() {
  return section([css({ padding: '80px 20px', background: '#f9f9f9', textAlign: 'center' })], [
    center([
      h1('Nexus.js', css({ fontSize: '48px', marginBottom: '16px' })),
      p('A lightweight frontend framework for building web apps', css({ fontSize: '18px', color: '#666', marginBottom: '32px' })),
      row([
        button('Get Started', on('click', () => console.log('Clicked!'))),
        button('Learn More', css({ background: '#666' })),
      ], 16),
    ], 800),
  ]);
}

function renderFeatures() {
  return section([id('features'), css({ padding: '60px 20px' })], [
    center([
      h2('Features', css({ textAlign: 'center', marginBottom: '40px' })),
      grid([
        div([h3('Fast'), p('Minimal overhead, maximum speed')], css({ padding: '20px' })),
        div([h3('Simple'), p('Intuitive API anyone can learn')], css({ padding: '20px' })),
        div([h3('Lightweight'), p('Under 5KB, no dependencies')], css({ padding: '20px' })),
      ], 3, 20),
    ], 800),
  ]);
}

function renderPricing() {
  return section([id('pricing'), css({ padding: '60px 20px', background: '#f9f9f9' })], [
    center([
      h2('Pricing', css({ textAlign: 'center', marginBottom: '40px' })),
      flex([
        div([
          h3('Basic', css({ fontSize: '24px' })),
          span('$0', css({ fontSize: '36px', fontWeight: 'bold' })),
          span('/free', css({ color: '#666' })),
          hr(),
          ul(['5 projects', '1GB storage'], css({ listStyle: 'none', padding: 0 })),
          button('Choose', on('click', () => {})),
        ], css({ padding: '24px', background: '#fff', borderRadius: '8px', minWidth: '200px' })),
        div([
          h3('Pro', css({ fontSize: '24px' })),
          span('$19', css({ fontSize: '36px', fontWeight: 'bold' })),
          span('/month', css({ color: '#666' })),
          hr(),
          ul(['Unlimited projects', '100GB storage'], css({ listStyle: 'none', padding: 0 })),
          button('Choose', on('click', () => {})),
        ], css({ padding: '24px', background: '#fff', borderRadius: '8px', minWidth: '200px' })),
      ], 'row', 24, 'stretch'),
    ], 800),
  ]);
}

function renderContact() {
  return section([css({ padding: '60px 20px' })], [
    center([
      h2('Contact Us', css({ textAlign: 'center', marginBottom: '32px' })),
      div([
        form([
          div([css({ marginBottom: '16px' })], [
            span('Name', css({ display: 'block', marginBottom: '4px', fontWeight: '500' })),
            input({ placeholder: 'Your name' }),
          ]),
          div([css({ marginBottom: '16px' })], [
            span('Email', css({ display: 'block', marginBottom: '4px', fontWeight: '500' })),
            input({ placeholder: 'you@example.com' }),
          ]),
          div([css({ marginBottom: '16px' })], [
            span('Message', css({ display: 'block', marginBottom: '4px', fontWeight: '500' })),
            textarea({ placeholder: 'Your message' }),
          ]),
          button('Send', { type: 'submit' }),
        ], css({ maxWidth: '400px', margin: '0 auto' })),
      ], css({ background: '#fff', padding: '32px', borderRadius: '8px' })),
    ], 600),
  ]);
}

function renderFooter() {
  return footer([css({ padding: '32px 20px', background: '#333', color: '#fff', textAlign: 'center' })], [
    p('© 2026 Nexus.js. All rights reserved.'),
  ]);
}

function renderApp() {
  return div([
    renderNavbar(),
    main([renderHero(), renderFeatures(), renderPricing(), renderContact()]),
    renderFooter(),
  ]);
}

// ============================================================================
// BOOTSTRAP
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  if (!root) {
    console.error('App element not found');
    return;
  }
  console.log('Rendering app...');
  const node = createDOM(renderApp());
  root.appendChild(node);
  console.log('App rendered');
});