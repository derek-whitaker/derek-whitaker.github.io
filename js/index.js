// Mobile navigation toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');

if (mobileMenuToggle) {
  mobileMenuToggle.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
  });
}

// Close mobile menu when clicking on nav links
const navLinks = document.querySelectorAll('.header__nav a');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');

    // Don't prevent default for links that just reference #
    if (href === '#') return;

    e.preventDefault();
    const target = document.querySelector(href);

    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Header scroll effect for case study and about pages
if (document.querySelector('.case-study-hero') || document.querySelector('.about-hero')) {
  const header = document.querySelector('.header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Lightbox dialogs for case study figures
document.querySelectorAll('[data-lightbox]').forEach(trigger => {
  const dialog = document.getElementById(trigger.dataset.lightbox);

  if (!dialog) return;

  trigger.addEventListener('click', () => {
    // Shared dialogs show a copy of the trigger's contents
    const slot = dialog.querySelector('.lightbox__slot');

    if (slot) {
      slot.replaceChildren(...[...trigger.children].map(child => child.cloneNode(true)));
    }

    dialog.returnFocus = trigger;
    dialog.showModal();
  });
});

document.querySelectorAll('.lightbox').forEach(dialog => {
  // Close when clicking the backdrop
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      dialog.close();
    }
  });

  // Return focus to the trigger
  dialog.addEventListener('close', () => {
    dialog.returnFocus?.focus();
  });
});

// Embedded prototypes report their height, so their iframes never scroll
const autoHeightFrames = [...document.querySelectorAll('iframe[data-autoheight]')];

if (autoHeightFrames.length) {
  window.addEventListener('message', (e) => {
    if (e.origin !== window.location.origin) return;
    if (e.data?.type !== 'prototype:height' || !Number.isFinite(e.data.height)) return;

    const frame = autoHeightFrames.find(f => f.contentWindow === e.source);

    if (frame) {
      frame.style.height = `${e.data.height}px`;
    }
  });
}

// Gallery lightboxes: thumbnail links step through every image in the list.
// Without <dialog> support the links simply open the image.
document.querySelectorAll('[data-gallery]').forEach(gallery => {
  const dialog = document.getElementById(gallery.dataset.gallery);

  if (!dialog || typeof dialog.showModal !== 'function') return;

  const links = [...gallery.querySelectorAll('[data-gallery-item]')];
  const image = dialog.querySelector('.gallery__image');
  const caption = dialog.querySelector('.gallery__caption');
  let current = 0;

  const show = (index) => {
    current = (index + links.length) % links.length;

    const link = links[current];
    const item = link.closest('li');
    const label = item.querySelector('.modal-states__label').textContent.trim();
    const desc = item.querySelector('.modal-states__desc').textContent.trim();

    image.src = link.getAttribute('href');
    image.alt = link.querySelector('img').alt;
    caption.textContent = `${current + 1} of ${links.length}. ${label}: ${desc}`;
  };

  links.forEach((link, index) => {
    link.setAttribute('aria-haspopup', 'dialog');

    link.addEventListener('click', (e) => {
      e.preventDefault();
      show(index);
      dialog.returnFocus = link;
      dialog.showModal();
    });
  });

  dialog.querySelectorAll('[data-gallery-step]').forEach(button => {
    button.addEventListener('click', () => {
      show(current + Number(button.dataset.galleryStep));
    });
  });

  dialog.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      show(current + (e.key === 'ArrowLeft' ? -1 : 1));
    }
  });
});
