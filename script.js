const slides = [...document.querySelectorAll(".slide")];
const deckNav = document.querySelector("#deck-nav");

slides.forEach((slide, index) => {
  const button = document.createElement("button");
  const indicator = document.createElement("span");
  button.type = "button";
  button.dataset.goTo = String(index + 1);
  button.setAttribute("aria-label", `转到第 ${index + 1} 屏`);
  button.append(indicator);
  deckNav.append(button);
});

const goToButtons = [...document.querySelectorAll("[data-go-to]")];
const deckDots = [...document.querySelectorAll(".deck-nav [data-go-to]")];
const currentSlide = document.querySelector("#current-slide");
const totalSlides = document.querySelector("#total-slides");
const progressFill = document.querySelector("#progress-fill");
const fullscreenButton = document.querySelector("#fullscreen-button");
const frameworkToggle = document.querySelector("#framework-toggle");
const frameworkControlLabel = document.querySelector("#framework-control-label");
const frameworkToggleIcon = document.querySelector("#framework-toggle-icon");
const previousSlideButton = document.querySelector("#previous-slide");
const nextSlideButton = document.querySelector("#next-slide");

let activeIndex = 0;
let scrollLocked = false;

const formatSlideNumber = (index) => String(index + 1).padStart(2, "0");

function setActiveSlide(index) {
  activeIndex = Math.max(0, Math.min(index, slides.length - 1));

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeIndex);
  });

  deckDots.forEach((button) => {
    const isCurrent = Number(button.dataset.goTo) - 1 === activeIndex;
    button.toggleAttribute("aria-current", isCurrent);
  });

  currentSlide.textContent = formatSlideNumber(activeIndex);
  progressFill.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
  document.title = `${formatSlideNumber(activeIndex)} · Agentic-RL Post-Training`;

  const frameworkIsExpanded = activeIndex > 0;
  frameworkToggle.setAttribute("aria-expanded", String(frameworkIsExpanded));
  frameworkControlLabel.textContent = frameworkIsExpanded
    ? "收起完整训练框架"
    : "查看完整训练框架";
  frameworkToggleIcon.textContent = frameworkIsExpanded ? "↑" : "↓";
  frameworkToggle.title = frameworkIsExpanded
    ? "收起完整训练框架"
    : "展开完整训练框架";
  previousSlideButton.disabled = activeIndex === 0;
  nextSlideButton.disabled = activeIndex === slides.length - 1;
}

function goToSlide(index) {
  const targetIndex = Math.max(0, Math.min(index, slides.length - 1));
  slides[targetIndex].scrollIntoView({ behavior: "smooth", block: "start" });
  setActiveSlide(targetIndex);
}

goToButtons.forEach((button) => {
  button.addEventListener("click", () => {
    goToSlide(Number(button.dataset.goTo) - 1);
  });
});

frameworkToggle.addEventListener("click", () => {
  goToSlide(activeIndex === 0 ? 1 : 0);
});

previousSlideButton.addEventListener("click", () => {
  goToSlide(activeIndex - 1);
});

nextSlideButton.addEventListener("click", () => {
  goToSlide(activeIndex + 1);
});

document.addEventListener("keydown", (event) => {
  const nextKeys = ["ArrowDown", "ArrowRight", "PageDown", " "];
  const previousKeys = ["ArrowUp", "ArrowLeft", "PageUp"];

  if (nextKeys.includes(event.key)) {
    event.preventDefault();
    goToSlide(activeIndex + 1);
  }

  if (previousKeys.includes(event.key)) {
    event.preventDefault();
    goToSlide(activeIndex - 1);
  }

  if (event.key === "Home") {
    event.preventDefault();
    goToSlide(0);
  }

  if (event.key === "End") {
    event.preventDefault();
    goToSlide(slides.length - 1);
  }

  if (event.key.toLowerCase() === "f") {
    fullscreenButton.click();
  }
});

document.addEventListener(
  "wheel",
  (event) => {
    if (window.innerWidth <= 900 || scrollLocked || Math.abs(event.deltaY) < 18) {
      return;
    }

    event.preventDefault();
    scrollLocked = true;
    goToSlide(event.deltaY > 0 ? activeIndex + 1 : activeIndex - 1);

    window.setTimeout(() => {
      scrollLocked = false;
    }, 760);
  },
  { passive: false },
);

fullscreenButton.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.warn("Fullscreen is unavailable in this browser context.", error);
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    const mostVisible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!mostVisible) return;
    setActiveSlide(slides.indexOf(mostVisible.target));
  },
  { threshold: [0.5, 0.72] },
);

slides.forEach((slide) => observer.observe(slide));
totalSlides.textContent = String(slides.length).padStart(2, "0");
setActiveSlide(0);
