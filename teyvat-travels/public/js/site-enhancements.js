(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var revealItems = document.querySelectorAll('.reveal');
  if (!reducedMotion && 'IntersectionObserver' in window) {
    revealItems.forEach(function (item) {
      item.classList.add('js-reveal-ready');
    });

    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('js-reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('js-reveal-visible');
    });
  }

  var menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    var menuButton = document.querySelector('.menu-button');
    if (menuButton) {
      menuToggle.addEventListener('change', function () {
        menuButton.setAttribute('aria-expanded', menuToggle.checked ? 'true' : 'false');
      });
      menuButton.setAttribute('aria-expanded', 'false');
    }
  }

  var galleryTracks = document.querySelectorAll(
    '.mondstadt-gallery__track, .liyue-gallery__track, .inazuma-gallery__track'
  );
  galleryTracks.forEach(function (track) {
    track.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      track.scrollBy({
        left: event.key === 'ArrowRight' ? 320 : -320,
        behavior: reducedMotion ? 'auto' : 'smooth'
      });
    });
  });

  document.querySelectorAll('[data-gallery-close]').forEach(function (button) {
    button.addEventListener('click', function () {
      document.body.classList.remove('js-gallery-open');
    });
  });

  document.querySelectorAll('.mondstadt-slide, .liyue-slide, .inazuma-slide').forEach(function (slide) {
    slide.addEventListener('click', function () {
      document.body.classList.add('js-gallery-open');
    });
  });
})();
