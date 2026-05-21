function initHeroSlider() {
  const heroSlider = document.createElement("div");
  heroSlider.className = "hero-slider";
  const slides = [
    "./assets/images/hero/sports.webp",
    "./assets/images/hero/gt650.webp",
    "./assets/images/hero/ktm.webp",
    "./assets/images/hero/bmw.webp",
    "./assets/images/hero/custom.webp",
  ];

  slides.forEach((slide, index) => {
    const slideDiv = document.createElement("div");
    slideDiv.className = `hero-slide ${index === 0 ? "active" : ""}`;
    slideDiv.style.backgroundImage = `url(${slide})`;
    heroSlider.appendChild(slideDiv);
  });

  const backgroundImageDiv = document.querySelector(".background-image");
  if (backgroundImageDiv && backgroundImageDiv.parentNode)
    backgroundImageDiv.parentNode.replaceChild(heroSlider, backgroundImageDiv);

  const dotsContainer = document.createElement("div");
  dotsContainer.className = "slider-dots";
  slides.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.className = `slider-dot ${index === 0 ? "active" : ""}`;
    dot.dataset.index = index;
    dotsContainer.appendChild(dot);
  });

  const heroSection = document.querySelector(".hero-section");
  if (heroSection) heroSection.appendChild(dotsContainer);

  const slidesElements = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".slider-dot");
  let currentSlide = 0;

  function showSlide(index) {
    slidesElements.forEach((slide) => slide.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("active"));
    if (slidesElements[index]) slidesElements[index].classList.add("active");
    if (dots[index]) dots[index].classList.add("active");
    currentSlide = index;
  }

  function nextSlide() {
    const nextIndex = (currentSlide + 1) % slides.length;
    showSlide(nextIndex);
  }

  let slideInterval = setInterval(nextSlide, 2000);
  heroSlider.addEventListener("mouseenter", () => clearInterval(slideInterval));
  heroSlider.addEventListener("mouseleave", () => {
    slideInterval = setInterval(nextSlide, 5000);
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      clearInterval(slideInterval);
      showSlide(parseInt(dot.dataset.index, 10));
      slideInterval = setInterval(nextSlide, 5000);
    });
  });
}
function initMobileMenu() {
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "mobile-menu-toggle";
  toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
  const navbar = document.querySelector(".navbar");
  if (navbar) navbar.appendChild(toggleBtn);

  const mobileMenu = document.createElement("div");
  mobileMenu.className = "mobile-menu";
  mobileMenu.innerHTML = `<button class="close-btn"><i class="fas fa-times"></i></button>
          <ul class="nav-links">
            <li><a href="./index.html" class="active" data-translate="Home">Home</a></li>
            <li><a href="./index.htmlpages/bike-inventory.html" data-translate="Buy Bike">Buy Bike</a></li>
            <li><a href="./index.htmlpages/sell-your-bike.html" data-translate="Sell Your Bike">Sell Your Bike</a></li>
            <li><a href="./index.htmlpages/about-us.html" aria-label="About Bike Builders" data-translate="About Us">About Us</a></li>
            <li><a href="./index.htmlpages/book-a-bike.html" aria-label="Book Bike" data-translate="Book Bike">Book Bike</a></li>
            <li><a href="./index.htmlpages/latest-updates.html" data-translate="Updates">Updates</a></li>
          </ul>
          <div class="login-btn"><button data-translate="Get the Quote">Get the Quote</button></div>`;

  document.body.appendChild(mobileMenu);
  toggleBtn.addEventListener("click", () => mobileMenu.classList.add("active"));
  const closeBtn = mobileMenu.querySelector(".close-btn");
  if (closeBtn)
    closeBtn.addEventListener("click", () =>
      mobileMenu.classList.remove("active"),
    );
}

function initLazyLoading() {
  if ("IntersectionObserver" in window) {
    const lazyImages = Array.from(document.querySelectorAll("img.lazy"));
    const lazyImageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove("lazy");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });
    lazyImages.forEach((img) => lazyImageObserver.observe(img));
  }
}

function initPreconnect() {
  const preconnectUrls = [
    "https://cdnjs.cloudflare.com",
    "https://randomuser.me",
    "https://imgd.aeplcdn.com",
  ];
  preconnectUrls.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = url;
    document.head.appendChild(link);
  });
}

window.API_BASE =  "https://backend.bikebuilders.in";

window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());
gtag("config", "G-ETL311CBE6");

function animateStatsCounter() {
  const questions = document.querySelectorAll(".faq-question");
  if (!questions || questions.length === 0) return;

  questions.forEach((q, idx) => {
    if (!q.getAttribute("tabindex")) q.setAttribute("tabindex", "0");
    q.setAttribute("role", "button");
    const item = q.closest(".faq-item");
    if (!item) return;
    const answer = item.querySelector(".faq-answer");
    if (!answer) return;
    if (!answer.id) answer.id = `faq-answer-${idx}`;
    q.setAttribute("aria-controls", answer.id);
    q.setAttribute(
      "aria-expanded",
      item.classList.contains("open") ? "true" : "false",
    );
  });

  function openItem(item) {
    item.classList.add("open");
    const q = item.querySelector(".faq-question");
    if (q) q.setAttribute("aria-expanded", "true");
  }

  function closeItem(item) {
    item.classList.remove("open");
    const q = item.querySelector(".faq-question");
    if (q) q.setAttribute("aria-expanded", "false");
  }

  function toggleItem(item) {
    if (!item) return;
    if (item.classList.contains("open")) closeItem(item);
    else openItem(item);
  }

  questions.forEach((q) => {
    q.addEventListener("click", (e) => {
      const it = q.closest(".faq-item");
      toggleItem(it);
    });
    q.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const it = q.closest(".faq-item");
        toggleItem(it);
      }
    });
  });

  document.addEventListener("click", function (e) {
    const q = e.target.closest && e.target.closest(".faq-question");
    if (q) {
      const it = q.closest(".faq-item");
      toggleItem(it);
    }
  });

  observer.observe(target);
}

function initFeaturedBikeSlider() {
  const bikeSlider = document.querySelector(".bike-slider");
  const prevBtn = document.querySelector(".slider-nav.prev");
  const nextBtn = document.querySelector(".slider-nav.next");
  fetchFeaturedBikes();
  if (prevBtn && bikeSlider)
    prevBtn.addEventListener("click", () =>
      bikeSlider.scrollBy({ left: -300, behavior: "smooth" }),
    );
  if (nextBtn && bikeSlider)
    nextBtn.addEventListener("click", () =>
      bikeSlider.scrollBy({ left: 300, behavior: "smooth" }),
    );
  if (bikeSlider && prevBtn && nextBtn)
    bikeSlider.addEventListener("scroll", () => {
      prevBtn.disabled = bikeSlider.scrollLeft <= 10;
      nextBtn.disabled =
        bikeSlider.scrollLeft >=
        bikeSlider.scrollWidth - bikeSlider.clientWidth - 10;
    });
}
function fetchFeaturedBikes() {
  const API_BASE = "https://backend.bikebuilders.in";

  function normalizeImageUrl(url) {
    if (!url) return url;

    if (
      /^https?:\/\//.test(url) ||
      url.startsWith("data:") ||
      url.startsWith("//")
    ) {
      return url;
    }

    if (url.startsWith("/")) return API_BASE + url;

    return API_BASE + "/" + url;
  }

  (async function () {
    const candidates = [API_BASE + "/api/bikes", "/api/bikes"];
    let USE_CLOUDINARY = false;

    try {
      const cfg = await fetch(API_BASE + "/api/config")
        .then((r) => r.json())
        .catch(() => null);

      USE_CLOUDINARY = !!(cfg && cfg.success && cfg.cloudinary);
    } catch (e) {
      USE_CLOUDINARY = false;
    }

    for (const url of candidates) {
      try {
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await res.json();

        let list = [];

        if (Array.isArray(data)) list = data;
        else if (data && Array.isArray(data.bikes)) list = data.bikes;
        else if (data && Array.isArray(data.data)) list = data.data;

        const bikes = list.slice(0, 8).map((b) => {
          const copy = Object.assign({}, b);

          try {
            if (Array.isArray(copy.imageUrl)) {
              copy.imageUrl = copy.imageUrl
                .map((u) => normalizeImageUrl(u))
                .filter(
                  (u) => u && (!USE_CLOUDINARY || /^https?:\/\//.test(u)),
                );
            } else if (
              typeof copy.imageUrl === "string" &&
              copy.imageUrl.trim() !== ""
            ) {
              const nu = normalizeImageUrl(copy.imageUrl);

              copy.imageUrl =
                !USE_CLOUDINARY || /^https?:\/\//.test(nu) ? [nu] : [];
            } else {
              copy.imageUrl = [];
            }
          } catch (e) {
            copy.imageUrl = copy.imageUrl || [];
          }

          return copy;
        });

        if (bikes.length > 0) {
          displayFeaturedBikes(bikes);
          return;
        }
      } catch (err) {
        console.warn("fetch failed for", url, err);
      }
    }

    console.error(
      "Error fetching bikes for featured section: all endpoints failed",
    );

    showFeaturedBikesError();
  })();
}

function displayFeaturedBikes(bikes) {
  const bikeSlider = document.querySelector(".bike-slider");
  bikeSlider.innerHTML = "";

  if (!bikes || bikes.length === 0) {
    bikeSlider.innerHTML = `
      <div class="no-bikes" style="width: 100%; text-align: center; padding: 40px;">
        <i class="fas fa-motorcycle" style="font-size: 3rem; color: #ccc;"></i>
        <p style="margin-top: 15px; color: #666;">No featured bikes available at the moment</p>
      </div>
    `;
    return;
  }

  bikes.forEach((bike) => {
    const bikeCard = document.createElement("div");
    bikeCard.className = "bike-card";

    let statusClass = "status-available";
    let statusText = "Available";
    let isDisabled = false;

    if (bike.status === "Sold Out") {
      statusClass = "status-sold";
      statusText = "Sold Out";
      isDisabled = true;
    } else if (bike.status === "Coming Soon") {
      statusClass = "status-coming-soon";
      statusText = "Coming Soon";
      isDisabled = true;
    }

    const images = Array.isArray(bike.imageUrl)
      ? bike.imageUrl.filter((url) => url && url.trim() !== "")
      : [];

    const firstImage =
      images.length > 0
        ? images[0]
        : "https://via.placeholder.com/300?text=No+Image";

    bikeCard.innerHTML = `
      <div class="image-container">
        <img src="${firstImage}" 
            alt="${bike.brand} ${bike.model}" 
            loading="lazy">
        <div class="status-badge ${statusClass}">${statusText}</div>
      </div>
      <div class="card-content">
        <h3>${bike.brand} ${bike.model}</h3>
        <span class="model">${bike.modelYear || bike.year || "N/A"} Model</span>
        <div class="details">
          <div class="detail-item">
            <i class="fas fa-tachometer-alt"></i>
            <span>${(bike.kmDriven || 0).toLocaleString()} km</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-user"></i>
            <span>${formatOwnership(bike.ownership || "1")}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-gas-pump"></i>
            <span>${bike.fuelType || "Petrol"}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-calendar-alt"></i>
            <span>${bike.year || bike.modelYear || "N/A"}</span>
          </div>
        </div>
        <div class="price-container">
          <div class="price">₹${(bike.price || 0).toLocaleString()}</div>
          <div class="emi">Down: ₹${(
            bike.downPayment || 0
          ).toLocaleString()} | EMI: ₹${Math.round(
            ((bike.price || 0) - (bike.downPayment || 0)) / 36,
          ).toLocaleString()}/month</div>
          <button class="view-details-btn" ${isDisabled ? "disabled" : ""}>
            ${isDisabled ? bike.status : "View Details"}
          </button>
        </div>
      </div>
    `;

    bikeSlider.appendChild(bikeCard);

    if (!isDisabled) {
      bikeCard
        .querySelector(".view-details-btn")
        .addEventListener("click", () => {
          window.location.href = `bike-inventory.html#${bike._id || ""}`;
        });
    }
  });
}

function showFeaturedBikesError() {
  const bikeSlider = document.querySelector(".bike-slider");
  bikeSlider.innerHTML = `
      <div class="error-message" style="width: 100%; text-align: center; padding: 40px;">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff6b00;"></i>
        <p style="margin-top: 15px; color: #666;">Failed to load featured bikes. Please try again later.</p>
        <button onclick="fetchFeaturedBikes()" style="margin-top: 10px; padding: 8px 15px; background: #ff6b00; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Retry
        </button>
      </div>
    `;
}

function formatOwnership(owner) {
  if (owner === "1") return "1st Owner";
  if (owner === "2") return "2nd Owner";
  if (owner === "3") return "3+ Owner";
  return owner;
}
function initModals() {
  const whatsappModal = document.getElementById("whatsappModal");
  const callModal = document.getElementById("callModal");
  if (!whatsappModal || !callModal) return;

  const whatsappTrigger = document.getElementById("whatsappTrigger");
  const callTrigger = document.getElementById("callTrigger");
  const closeButtons = document.getElementsByClassName("close");

  if (whatsappTrigger)
    whatsappTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      whatsappModal.style.display = "block";
    });
  if (callTrigger)
    callTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      callModal.style.display = "block";
    });

  Array.from(closeButtons).forEach((button) =>
    button.addEventListener("click", () => {
      if (whatsappModal) whatsappModal.style.display = "none";
      if (callModal) callModal.style.display = "none";
    }),
  );

  window.addEventListener("click", (event) => {
    if (event.target === whatsappModal) whatsappModal.style.display = "none";
    if (event.target === callModal) callModal.style.display = "none";
  });

  const whatsappOptions = whatsappModal.querySelectorAll(".number-option");
  whatsappOptions.forEach((option) =>
    option.addEventListener("click", function () {
      const number = this.getAttribute("data-number");
      if (number) window.open(`https://wa.me/${number}`, "_blank");
      whatsappModal.style.display = "none";
    }),
  );

  const callOptions = callModal.querySelectorAll(".number-option");
  callOptions.forEach((option) =>
    option.addEventListener("click", function () {
      const number = this.getAttribute("data-number");
      if (number) window.location.href = `tel:${number}`;
      callModal.style.display = "none";
    }),
  );
}

function initFaqToggle() {
  const questions = document.querySelectorAll(".faq-question");
  if (!questions || questions.length === 0) return;
  questions.forEach((q, idx) => {
    if (!q.getAttribute("tabindex")) q.setAttribute("tabindex", "0");
    q.setAttribute("role", "button");

    const item = q.closest(".faq-item");
    if (!item) return;
    let answer = item.querySelector(".faq-answer");
    if (!answer) return;
    if (!answer.id) answer.id = `faq-answer-${idx}`;
    q.setAttribute("aria-controls", answer.id);
    q.setAttribute(
      "aria-expanded",
      item.classList.contains("open") ? "true" : "false",
    );

    function toggle() {
      const opened = item.classList.toggle("open");
      q.setAttribute("aria-expanded", opened ? "true" : "false");

      if (opened) {
        answer.setAttribute("tabindex", "0");
      }
    }

    q.addEventListener("click", function () {
      toggle();
    });

    q.addEventListener("keypress", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
  });
}

function initDarkMode() {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const mobileDarkModeToggle = document.getElementById("mobileDarkModeToggle");

  function checkDarkModePreference() {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      document.body.classList.add("dark-mode");
      if (darkModeToggle) darkModeToggle.checked = true;
      if (mobileDarkModeToggle) mobileDarkModeToggle.checked = true;
    }
  }

  checkDarkModePreference();

  if (darkModeToggle)
    darkModeToggle.addEventListener("change", function () {
      if (this.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
      }
      if (mobileDarkModeToggle) mobileDarkModeToggle.checked = this.checked;
    });

  if (mobileDarkModeToggle)
    mobileDarkModeToggle.addEventListener("change", function () {
      if (this.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
      }
      if (darkModeToggle) darkModeToggle.checked = this.checked;
    });

  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  if (mql && mql.addEventListener) {
    mql.addEventListener("change", (e) => {
      const newColorScheme = e.matches ? "dark" : "light";
      if (!localStorage.getItem("theme")) {
        if (newColorScheme === "dark") {
          document.body.classList.add("dark-mode");
          if (darkModeToggle) darkModeToggle.checked = true;
          if (mobileDarkModeToggle) mobileDarkModeToggle.checked = true;
        } else {
          document.body.classList.remove("dark-mode");
          if (darkModeToggle) darkModeToggle.checked = false;
          if (mobileDarkModeToggle) mobileDarkModeToggle.checked = false;
        }
      }
    });
  }
}

function initStyleCarousel() {
  const stylesContainer = document.querySelector(".styles-container");
  const styleCards = document.querySelectorAll(".style-card-link");

  if (window.innerWidth > 768 || styleCards.length === 0) return;

  const mobileContainer = document.createElement("div");
  mobileContainer.className = "styles-container-mobile";

  styleCards.forEach((card) => {
    mobileContainer.appendChild(card);
  });

  stylesContainer.innerHTML = "";
  stylesContainer.appendChild(mobileContainer);

  const carouselNav = document.createElement("div");
  carouselNav.className = "carousel-nav";

  const prevArrow = document.createElement("button");
  prevArrow.className = "carousel-arrow prev";
  prevArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevArrow.setAttribute("aria-label", "Previous style");

  const nextArrow = document.createElement("button");
  nextArrow.className = "carousel-arrow next";
  nextArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextArrow.setAttribute("aria-label", "Next style");

  const dotsContainer = document.createElement("div");
  dotsContainer.className = "carousel-dots";

  for (let i = 0; i < styleCards.length; i++) {
    const dot = document.createElement("div");
    dot.className = `carousel-dot ${i === 0 ? "active" : ""}`;
    dot.dataset.index = i;
    dotsContainer.appendChild(dot);
  }

  carouselNav.appendChild(prevArrow);
  carouselNav.appendChild(dotsContainer);
  carouselNav.appendChild(nextArrow);

  stylesContainer.appendChild(carouselNav);

  let currentIndex = 0;
  const totalSlides = styleCards.length;

  function updateCarousel() {
    mobileContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

    document.querySelectorAll(".carousel-dot").forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });

    prevArrow.disabled = currentIndex === 0;
    nextArrow.disabled = currentIndex === totalSlides - 1;
  }

  function nextSlide() {
    if (currentIndex < totalSlides - 1) {
      currentIndex++;
      updateCarousel();
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  }

  function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
  }

  nextArrow.addEventListener("click", nextSlide);
  prevArrow.addEventListener("click", prevSlide);

  document.querySelectorAll(".carousel-dot").forEach((dot) => {
    dot.addEventListener("click", function () {
      goToSlide(parseInt(this.dataset.index));
    });
  });

  let startX = 0;
  let currentX = 0;

  mobileContainer.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  mobileContainer.addEventListener("touchmove", (e) => {
    currentX = e.touches[0].clientX;
  });

  mobileContainer.addEventListener("touchend", () => {
    const diff = startX - currentX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < totalSlides - 1) {
        nextSlide();
      } else if (diff < 0 && currentIndex > 0) {
        prevSlide();
      }
    }
  });

  updateCarousel();
}

function attachStyleCarouselResizeHandler() {
  initStyleCarousel();
  window.addEventListener("resize", function () {
    const stylesContainer = document.querySelector(".styles-container");
    if (
      stylesContainer &&
      stylesContainer.querySelector(".styles-container-mobile")
    ) {
      if (window.innerWidth > 768) location.reload();
    } else if (window.innerWidth <= 768) initStyleCarousel();
  });
}

function init() {
  initHeroSlider();
  initMobileMenu();
  initLazyLoading();
  initPreconnect();
  initFeaturedBikeSlider();
  initStatsObserver();
  initFaqToggle();
  initModals();
  initDarkMode();
  attachStyleCarouselResizeHandler();
  initStickyNavbar();
}

function initStickyNavbar() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;
  const hero = document.querySelector(".hero-section");

  function update() {
    const isMobile = window.matchMedia("(max-width: 992px)").matches;
    const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
    const pastHero = hero ? heroBottom <= 0 : window.scrollY > 50;

    if (window.scrollY > 50) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");

    if (isMobile && pastHero) navbar.classList.add("past-hero");
    else navbar.classList.remove("past-hero");
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

document.addEventListener("DOMContentLoaded", init);
