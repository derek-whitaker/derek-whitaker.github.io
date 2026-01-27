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

// Header scroll effect for case study pages
if (document.querySelector('.case-study-hero')) {
  const header = document.querySelector('.header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}