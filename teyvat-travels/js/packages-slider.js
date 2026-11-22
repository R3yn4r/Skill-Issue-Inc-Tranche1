/* Keep package navigation private to this page and out of the global scope. */
(function () {
  "use strict";

  const carousel = document.querySelector(".home-page .pk-carousel");
  if (!carousel) {
    return;
  }

  const viewport = carousel.querySelector(".pk-carousel__viewport");
  const track = carousel.querySelector(".pk-carousel__track");
  const previousButton = carousel.querySelector(".pk-carousel__control--previous");
  const nextButton = carousel.querySelector(".pk-carousel__control--next");
  const dotsContainer = carousel.querySelector(".pk-carousel__dots");
  const filterButtons = Array.from(carousel.querySelectorAll(".pk-filter-chip"));
  const sortSelect = carousel.querySelector(".pk-sort");
  const resultsCount = carousel.querySelector(".pk-results-count");
  const allSlides = Array.from(track.children);
  let slides = allSlides.slice();
  let dots = [];
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  let activeSlide = slides[0];
  let pendingDotIndex = null;
  let isMoving = false;
  let touchStartX = null;

  /* Centers the active slide on desktop and left-aligns it at narrower widths. */
  function positionSlide(slide) {
    const alignLeft = slides.length > 1 && window.matchMedia("(max-width: 1100px)").matches;
    const offset = alignLeft
      ? -slide.offsetLeft
      : (viewport.clientWidth - slide.offsetWidth) / 2 - slide.offsetLeft;

    track.style.transform = "translate3d(" + offset + "px, 0, 0)";
  }

  /* Moves the current slide back into place without animating after the track order changes. */
  function repositionWithoutTransition() {
    track.style.transition = "none";
    positionSlide(activeSlide);
    track.getBoundingClientRect();
    track.style.transition = "";
  }

  /* Hides off-screen slides from keyboard focus using inert or a tabindex fallback. */
  function setSlideInert(slide, inert) {
    if ("inert" in slide) {
      slide.inert = inert;
      return;
    }

    const focusableElements = slide.querySelectorAll(
      "a[href], button, input, select, textarea, [tabindex]"
    );

    for (let index = 0; index < focusableElements.length; index += 1) {
      const element = focusableElements[index];

      if (inert) {
        if (!element.hasAttribute("data-pk-original-tabindex")) {
          const originalTabindex = element.getAttribute("tabindex");
          element.setAttribute(
            "data-pk-original-tabindex",
            originalTabindex === null ? "" : originalTabindex
          );
        }
        element.setAttribute("tabindex", "-1");
      } else if (element.hasAttribute("data-pk-original-tabindex")) {
        const originalTabindex = element.getAttribute("data-pk-original-tabindex");
        if (originalTabindex === "") {
          element.removeAttribute("tabindex");
        } else {
          element.setAttribute("tabindex", originalTabindex);
        }
        element.removeAttribute("data-pk-original-tabindex");
      }
    }
  }

  /* Updates the active card, dot indicator, and keyboard accessibility for the visible slides. */
  function updateSlideState() {
    const viewportBounds = viewport.getBoundingClientRect();
    const activeIndex = slides.indexOf(activeSlide);

    for (let index = 0; index < slides.length; index += 1) {
      const slide = slides[index];
      const bounds = slide.getBoundingClientRect();
      const isVisible = bounds.right > viewportBounds.left && bounds.left < viewportBounds.right;

      slide.dataset.slideIndex = String(index);
      slide.setAttribute("aria-label", (index + 1) + " of " + slides.length);
      slide.classList.toggle("is-active", slide === activeSlide);
      slide.setAttribute("aria-hidden", String(!isVisible));
      setSlideInert(slide, !isVisible);
    }

    for (let index = 0; index < dots.length; index += 1) {
      dots[index].setAttribute(
        "aria-current",
        String(Number(dots[index].dataset.slideTo) === activeIndex)
      );
    }

    const focusedSlide = document.activeElement.closest(".pk-carousel__slide");
    if (focusedSlide && focusedSlide.getAttribute("aria-hidden") === "true") {
      carousel.focus();
    }
  }

  /* Finishes a slide transition, updates visibility, and continues an in-progress dot selection. */
  function finishMove() {
    isMoving = false;
    updateSlideState();

    if (pendingDotIndex === null) {
      return;
    }

    const activeIndex = slides.indexOf(activeSlide);
    if (activeIndex === pendingDotIndex) {
      pendingDotIndex = null;
      return;
    }

    const forwardDistance = (pendingDotIndex - activeIndex + slides.length) % slides.length;
    const backwardDistance = (activeIndex - pendingDotIndex + slides.length) % slides.length;
    moveBy(forwardDistance <= backwardDistance ? 1 : -1);
  }

  /* Advances or reverses by one slide, rotating the track at an edge to create a seamless loop. */
  function moveBy(direction) {
    if (isMoving || slides.length < 2) {
      return;
    }

    let target = direction > 0
      ? activeSlide.nextElementSibling
      : activeSlide.previousElementSibling;

    if (direction > 0 && (!target || target === track.lastElementChild)) {
      track.appendChild(track.firstElementChild);
      repositionWithoutTransition();
      target = activeSlide.nextElementSibling;
    } else if (direction < 0 && (!target || target === track.firstElementChild)) {
      track.insertBefore(track.lastElementChild, track.firstElementChild);
      repositionWithoutTransition();
      target = activeSlide.previousElementSibling;
    }

    if (!target) {
      return;
    }

    activeSlide = target;
    isMoving = true;
    updateSlideState();
    positionSlide(activeSlide);

    if (reducedMotionQuery.matches) {
      finishMove();
    }
  }

  /* Navigates to the requested dot using the shortest sequence of one-card movements. */
  function navigateToSlide(index) {
    const activeIndex = slides.indexOf(activeSlide);
    pendingDotIndex = index === activeIndex ? null : index;

    if (pendingDotIndex !== null && !isMoving) {
      const forwardDistance = (pendingDotIndex - activeIndex + slides.length) % slides.length;
      const backwardDistance = (activeIndex - pendingDotIndex + slides.length) % slides.length;
      moveBy(forwardDistance <= backwardDistance ? 1 : -1);
    }
  }

  /* Handles transition completion events from the track and ignores unrelated transitions. */
  function handleTransitionEnd(event) {
    if (event.target === track && event.propertyName === "transform") {
      finishMove();
    }
  }

  /* Handles clicks on the previous control and cancels any queued dot navigation. */
  function handlePreviousClick() {
    pendingDotIndex = null;
    moveBy(-1);
  }

  /* Handles clicks on the next control and cancels any queued dot navigation. */
  function handleNextClick() {
    pendingDotIndex = null;
    moveBy(1);
  }

  /* Starts dot navigation for the selected slide position. */
  function handleDotClick(event) {
    const index = Number(event.currentTarget.dataset.slideTo);
    if (Number.isInteger(index) && index >= 0 && index < slides.length) {
      navigateToSlide(index);
    }
  }

  /* Updates the visible slides and matching controls after a nation or sort change. */
  function applyFilters() {
    const selectedNation = carousel.querySelector('.pk-filter-chip[aria-pressed="true"]').dataset.nation;
    const sortOrder = sortSelect.value;

    slides = allSlides.filter(function (slide) {
      return selectedNation === "all" || slide.dataset.nation === selectedNation;
    });

    if (sortOrder === "price-ascending") {
      slides.sort(function (first, second) {
        return Number(first.dataset.price) - Number(second.dataset.price);
      });
    } else if (sortOrder === "price-descending") {
      slides.sort(function (first, second) {
        return Number(second.dataset.price) - Number(first.dataset.price);
      });
    }

    resultsCount.textContent = "Showing " + slides.length + " of " + allSlides.length + " packages";
    dotsContainer.replaceChildren();
    dots = slides.map(function (slide, index) {
      const dot = document.createElement("button");
      dot.className = "pk-carousel__dot";
      dot.type = "button";
      dot.setAttribute("aria-label", "Go to slide " + (index + 1));
      dot.setAttribute("aria-current", String(index === 0));
      dot.dataset.slideTo = String(index);
      dot.addEventListener("click", handleDotClick);
      dotsContainer.appendChild(dot);
      return dot;
    });

    previousButton.hidden = slides.length < 2;
    nextButton.hidden = slides.length < 2;
    carousel.querySelector(".pk-carousel__footer").hidden = slides.length < 2;

    for (let index = 0; index < allSlides.length; index += 1) {
      const isIncluded = slides.indexOf(allSlides[index]) !== -1;
      allSlides[index].setAttribute("aria-hidden", String(!isIncluded));
      setSlideInert(allSlides[index], !isIncluded);
    }

    activeSlide = slides[0];
    pendingDotIndex = null;
    isMoving = false;
    track.style.transition = "none";
    track.replaceChildren(...slides);

    if (slides.length > 1) {
      track.insertBefore(track.lastElementChild, track.firstElementChild);
    }

    positionSlide(activeSlide);
    track.getBoundingClientRect();
    track.style.transition = "";
    updateSlideState();
  }

  /* Keeps exactly one nation chip pressed and resets navigation to the first result. */
  function handleFilterClick(event) {
    for (let index = 0; index < filterButtons.length; index += 1) {
      filterButtons[index].setAttribute("aria-pressed", String(filterButtons[index] === event.currentTarget));
    }

    applyFilters();
  }

  /* Applies the selected price order and resets navigation to the first result. */
  function handleSortChange() {
    applyFilters();
  }

  /* Maps the left and right arrow keys to carousel navigation while the region has focus. */
  function handleKeyDown(event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      pendingDotIndex = null;
      moveBy(event.key === "ArrowRight" ? 1 : -1);
    }
  }

  /* Records the starting horizontal position for a touch gesture. */
  function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].clientX;
  }

  /* Navigates when a touch gesture moves at least 50 pixels horizontally. */
  function handleTouchEnd(event) {
    if (touchStartX === null) {
      return;
    }

    const distance = event.changedTouches[0].clientX - touchStartX;
    touchStartX = null;

    if (Math.abs(distance) >= 50) {
      pendingDotIndex = null;
      moveBy(distance < 0 ? 1 : -1);
    }
  }

  /* Completes an in-flight transition immediately when reduced motion is requested. */
  function handleReducedMotionChange() {
    if (reducedMotionQuery.matches && isMoving) {
      finishMove();
    }

    positionSlide(activeSlide);
  }

  /* Recalculates the active slide position and visibility after a viewport resize. */
  function handleResize() {
    positionSlide(activeSlide);
    updateSlideState();
  }

  /* Initializes carousel state and binds the manual navigation controls. */
  function initialize() {
    previousButton.addEventListener("click", handlePreviousClick);
    nextButton.addEventListener("click", handleNextClick);
    track.addEventListener("transitionend", handleTransitionEnd);
    carousel.addEventListener("keydown", handleKeyDown);
    viewport.addEventListener("touchstart", handleTouchStart, { passive: true });
    viewport.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("resize", handleResize);
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    for (let index = 0; index < filterButtons.length; index += 1) {
      filterButtons[index].addEventListener("click", handleFilterClick);
    }

    sortSelect.addEventListener("change", handleSortChange);
    applyFilters();
  }

  /* Runs the package carousel after all deferred document markup has been parsed. */
  initialize();
})();
