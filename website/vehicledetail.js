// Moved from vehicledetail.html to keep HTML light
// API Configuration
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "https://bike-builders-backend.vercel.app"
    : "https://bike-builders-backend.vercel.app"; // Replace with your Vercel backend URL

// Helper function to get the correct image URL
function getImageUrl(imagePath) {
  if (!imagePath) return "assets/placeholder.png";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const filename = imagePath.startsWith("carimages/")
    ? imagePath.replace("carimages/", "")
    : imagePath;

  if (filename.startsWith("assets/")) {
    return filename;
  }

  return `${API_BASE_URL}/carimages/${filename}`;
}

// Helper Functions
function formatOwnership(owner) {
  if (owner === "1" || owner.includes("1st")) return "1st Owner";
  if (owner === "2" || owner.includes("2nd")) return "2nd Owner";
  if (owner === "3" || owner.includes("3+") || owner.includes("3rd"))
    return "3+ Owner";
  return owner;
}

function normalizeImagePath(img) {
  return getImageUrl(img);
}

function getCarDataFromQuery() {
  const params = new URLSearchParams(window.location.search);
  try {
    return JSON.parse(decodeURIComponent(params.get("car")));
  } catch {
    return null;
  }
}

function carIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  try {
    const car = JSON.parse(decodeURIComponent(params.get("car")));
    return car && car._id ? car._id : null;
  } catch {
    return null;
  }
}

// Load Car Data — support both full object in ?car=... and id in ?id=...
(function () {
  const params = new URLSearchParams(window.location.search);
  const carFromQuery = (function () {
    try {
      return JSON.parse(decodeURIComponent(params.get("car") || ""));
    } catch (e) {
      return null;
    }
  })();

  function populateCar(car) {
    if (!car) return;
    document.getElementById("vehicleTitle").textContent = `${
      car.brand || car.make || ""
    } ${car.model || ""}`;
    document.getElementById("vehicleModel").textContent = `${
      car.modelYear || ""
    } Model`;
    document.getElementById("vehicleKm").textContent = `${(
      car.kmDriven || 0
    ).toLocaleString()} km`;
    document.getElementById("vehicleOwner").textContent = formatOwnership(
      car.ownership || "1",
    );
    document.getElementById("vehicleFuel").textContent =
      car.fuelType || "Petrol";
    document.getElementById("vehicleColor").textContent = car.color || "";
    document.getElementById("vehicleRegYear").textContent =
      car.registrationYear || "";
    document.getElementById("vehiclePrice").textContent = `₹${(
      car.sellingPrice ||
      car.price ||
      0
    ).toLocaleString()}`;
    document.getElementById("vehicleEmi").textContent = `Down: ₹${(
      car.downPayment || 0
    ).toLocaleString()} | EMI: ₹${Math.round(
      ((car.sellingPrice || car.price || 0) - (car.downPayment || 0)) /
        36,
    ).toLocaleString()}/month`;

    let images = [];
    if (car.photos && Array.isArray(car.photos) && car.photos.length)
      images = car.photos.slice();
    else if (
      car.imageUrl &&
      Array.isArray(car.imageUrl) &&
      car.imageUrl.length
    )
      images = car.imageUrl.slice();
    else if (car.images && Array.isArray(car.images) && car.images.length)
      images = car.images.slice();
    else if (car.image)
      images = Array.isArray(car.image) ? car.image.slice() : [car.image];
    if (!images || images.length === 0) images = ["assets/owner.png"];
    const mainImg = document.getElementById("mainVehicleImg");
    const thumbnails = document.getElementById("vehicleThumbnails");
    thumbnails.innerHTML = "";

    if (window.innerWidth <= 900) {
      const container = document.createElement("div");
      container.className = "vehicle-image-block mobile-image-block";
      const mainImgMobile = document.createElement("img");
      mainImgMobile.className = "vehicle-main-img mobile-main-img";
      mainImgMobile.src = normalizeImagePath(images[0]);
      mainImgMobile.loading = "eager";
      mainImgMobile.decoding = "async";
      mainImgMobile.alt = "Main Car Image";
      container.appendChild(mainImgMobile);
      const thumbRow = document.createElement("div");
      thumbRow.className = "vehicle-thumbnails mobile-thumbnails";
      images.forEach((img, idx) => {
        const thumb = document.createElement("img");
        thumb.src = normalizeImagePath(img);
        thumb.loading = "lazy";
        thumb.decoding = "async";
        thumb.alt = `Car ${idx + 1}`;
        thumb.style.border =
          idx === 0 ? "2px solid var(--accent)" : "2px solid transparent";
        thumb.onclick = () => {
          mainImgMobile.src = normalizeImagePath(img);
          Array.from(thumbRow.children).forEach((t, i) => {
            t.style.border =
              i === idx
                ? "2px solid var(--accent)"
                : "2px solid transparent";
          });
        };
        thumbRow.appendChild(thumb);
      });
      container.appendChild(thumbRow);
      if (mainImg && mainImg.parentNode)
        mainImg.parentNode.replaceChild(container, mainImg);
    } else {
      images.forEach((img, idx) => {
        const thumb = document.createElement("img");
        thumb.src = normalizeImagePath(img);
        thumb.loading = "lazy";
        thumb.decoding = "async";
        thumb.alt = `Car ${idx + 1}`;
        thumb.onclick = () => {
          const mainImgEl = document.getElementById("mainVehicleImg");
          if (mainImgEl) mainImgEl.src = normalizeImagePath(img);
          Array.from(thumbnails.children).forEach((t) =>
            t.classList.remove("selected"),
          );
          thumb.classList.add("selected");
        };
        if (idx === 0) thumb.classList.add("selected");
        thumbnails.appendChild(thumb);
      });
      if (document.getElementById("mainVehicleImg")) {
        const mainEl = document.getElementById("mainVehicleImg");
        mainEl.src = normalizeImagePath(images[0]);
        mainEl.loading = "eager";
        mainEl.decoding = "async";
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = normalizeImagePath(images[0]);
        document.head.appendChild(link);
      }
    }
  }

  if (carFromQuery) {
    populateCar(carFromQuery);
  } else if (params.get("id")) {
    const id = params.get("id");
    fetch(`${API_BASE_URL}/api/bikes`)
      .then((res) => res.json())
      .then((list) => {
        const bikes = Array.isArray(list)
          ? list
          : list.bikes || list.data || [];
        const found = bikes.find(
          (b) => b._id == id || (b.id && b.id == id),
        );
        if (found) populateCar(found);
        else {
          const main = document.querySelector(".vehicle-main-section");
          if (main)
            main.innerHTML =
              '<div style="padding:40px;text-align:center;"><h2>Vehicle not found</h2><p>The requested vehicle could not be loaded.</p><a href="inventory.html" class="add-to-cart-btn" style="display:inline-block;max-width:240px;margin-top:12px;">Back to inventory</a></div>';
        }
      })
      .catch(() => {
        const main = document.querySelector(".vehicle-main-section");
        if (main)
          main.innerHTML =
            '<div style="padding:40px;text-align:center;"><h2>Unable to load vehicle</h2><p>Please check your internet connection or try again later.</p><a href="inventory.html" class="add-to-cart-btn" style="display:inline-block;max-width:240px;margin-top:12px;">Back to inventory</a></div>';
      });
  }
})();

// Fetch other cars from backend and show in slider (robust to different API shapes)
fetch(`${API_BASE_URL}/api/bikes`)
  .then((response) => response.json())
  .then((data) => {
    const cars = Array.isArray(data)
      ? data
      : data.bikes || data.data || [];
    if (Array.isArray(cars)) {
      const otherCarsRow = document.getElementById("otherCarsRow");
      otherCarsRow.innerHTML = "";

      cars.forEach((car) => {
        if (car._id && car._id === (carIdFromQuery() || "")) return;

        let imgSrc = "assets/owner.png";
        const candidate =
          (car.photos && car.photos[0]) ||
          (car.imageUrl && car.imageUrl[0]);
        if (candidate) {
          if (
            candidate.startsWith("http://") ||
            candidate.startsWith("https://")
          )
            imgSrc = candidate;
          else if (candidate.startsWith("assets/")) imgSrc = candidate;
          else imgSrc = `${API_BASE_URL}/carimages/${candidate}`;
        }

        const statusClass =
          car.status === "Available"
            ? "status-available"
            : car.status === "Sold Out"
              ? "status-sold"
              : car.status === "Coming Soon"
                ? "status-coming-soon"
                : "status-available";

        const ownerText = formatOwnership(car.ownership || "1");

        const card = document.createElement("div");
        card.className = "other-car-card";
        card.innerHTML = `
                <div class="image-container">
                  <img src="${imgSrc}" alt="${car.brand || car.make || ""} ${
          car.model || ""
        }" class="other-car-img" />
                  <div class="status-badge ${statusClass}" data-translate="${
          car.status || "Available"
        }">${car.status || "Available"}</div>
                </div>
                <div class="card-content">
                  <h3>${car.brand || car.make || "Unknown Brand"} ${
          car.model || "Unknown Model"
        }</h3>
                  <span class="model">${car.modelYear || "-"} Model</span>
                  <div class="details">
                    <div class="detail-item"><i class="fas fa-tachometer-alt"></i> <span>${(
                      car.kmDriven || 0
                    ).toLocaleString()} km</span></div>
                    <div class="detail-item"><i class="fas fa-user"></i> <span>${ownerText}</span></div>
                    <div class="detail-item"><i class="fas fa-gas-pump"></i> <span>${
                      car.fuelType || "Petrol"
                    }</span></div>
                  </div>
                  <div class="price-container">
                    <div class="price">₹${(
                      car.sellingPrice ||
                      car.price ||
                      0
                    ).toLocaleString()}</div>
                    <div class="button-group">
                      <button class="contact-btn" data-translate="Contact Seller" ${
                        car.status !== "Available" ? "disabled" : ""
                      }>Contact Seller</button>
                      <button class="view-details-btn" data-translate="View Details" ${
                        car.status !== "Available" ? "disabled" : ""
                      }>View Details</button>
                    </div>
                  </div>
                </div>
              `;

        setTimeout(() => {
          const viewDetailsBtn = card.querySelector(".view-details-btn");
          const contactBtn = card.querySelector(".contact-btn");

          if (viewDetailsBtn && !viewDetailsBtn.disabled) {
            viewDetailsBtn.onclick = (e) => {
              e.stopPropagation();
              const carQuery = encodeURIComponent(JSON.stringify(car));
              window.location.href = `vehicledetail.html?car=${carQuery}`;
            };
          }

          if (contactBtn && !contactBtn.disabled) {
            contactBtn.onclick = (e) => {
              e.stopPropagation();
              window.location.href = "contact.html";
            };
          }
        }, 0);

        otherCarsRow.appendChild(card);
      });

      enableAutoSlider();
      try {
        const preferred = localStorage.getItem("preferredLanguage") || "en";
        if (preferred && typeof translatePage === "function") {
          const dynamicElems =
            otherCarsRow.querySelectorAll("[data-translate]");
          dynamicElems.forEach((el) => {
            const key = el.getAttribute("data-translate");
            if (
              translations &&
              translations[preferred] &&
              translations[preferred][key]
            ) {
              el.textContent = translations[preferred][key];
            }
          });
        }
      } catch (e) {}
    }
  });

// Auto-scroll functionality
function enableAutoSlider() {
  const row = document.getElementById("otherCarsRow");
  if (!row) return;

  let scrollAmount = 0;
  let maxScroll = row.scrollWidth - row.clientWidth;
  let direction = 1;

  let interval = setInterval(() => {
    if (row.scrollWidth <= row.clientWidth) return;

    if (scrollAmount >= maxScroll) direction = -1;
    if (scrollAmount <= 0) direction = 1;

    scrollAmount += direction * 320;
    if (scrollAmount < 0) scrollAmount = 0;
    if (scrollAmount > maxScroll) scrollAmount = maxScroll;

    row.scrollTo({ left: scrollAmount, behavior: "smooth" });
  }, 3000);

  row.addEventListener("mouseenter", () => clearInterval(interval));
  row.addEventListener("mouseleave", () => {
    interval = setInterval(() => {
      if (row.scrollWidth <= row.clientWidth) return;

      if (scrollAmount >= maxScroll) direction = -1;
      if (scrollAmount <= 0) direction = 1;

      scrollAmount += direction * 320;
      if (scrollAmount < 0) scrollAmount = 0;
      if (scrollAmount > maxScroll) scrollAmount = maxScroll;

      row.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }, 3000);
  });
}

// --- THUMBNAIL SLIDER LOGIC ---
(function () {
  const mainImg = document.getElementById("mainVehicleImg");
  const thumbnails = document.getElementById("vehicleThumbnails");
  if (!mainImg || !thumbnails) return;

  if (
    thumbnails.dataset.sliderInitialized === "true" ||
    thumbnails.querySelector(".vehicle-thumbnails-scroll")
  )
    return;
  thumbnails.dataset.sliderInitialized = "true";

  setTimeout(() => {
    const thumbs = Array.from(thumbnails.querySelectorAll("img"));
    if (thumbs.length <= 5) return;

    const scrollContainer = document.createElement("div");
    scrollContainer.className = "vehicle-thumbnails-scroll";
    scrollContainer.style.overflowX = "auto";
    scrollContainer.style.whiteSpace = "nowrap";
    scrollContainer.style.scrollBehavior = "smooth";
    thumbs.forEach((img) => {
      img.style.display = "inline-block";
      img.style.marginRight = "6px";
      img.style.width = "120px";
      img.style.height = "110px";
      scrollContainer.appendChild(img);
    });
    thumbnails.appendChild(scrollContainer);

    let currentMainIdx = 0;

    function updateThumbs() {
      thumbs.forEach((img, idx) => {
        img.classList.toggle("selected", idx === currentMainIdx);
      });
      mainImg.src = thumbs[currentMainIdx].src;
      const thumbWidth = thumbs[0].offsetWidth + 12;
      const visibleStart = scrollContainer.scrollLeft;
      const visibleEnd = visibleStart + scrollContainer.offsetWidth;
      const thumbLeft = currentMainIdx * thumbWidth;
      const thumbRight = thumbLeft + thumbWidth;
      if (thumbLeft < visibleStart) {
        scrollContainer.scrollLeft = thumbLeft;
      } else if (thumbRight > visibleEnd) {
        scrollContainer.scrollLeft =
          thumbRight - scrollContainer.offsetWidth;
      }
    }
    updateThumbs();

    thumbs.forEach((img, idx) => {
      img.onclick = function () {
        currentMainIdx = idx;
        updateThumbs();
      };
    });

    const prevBtn = document.createElement("button");
    prevBtn.className = "slider-btn prev";
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.onclick = function (e) {
      e.stopPropagation();
      if (currentMainIdx > 0) {
        currentMainIdx--;
        updateThumbs();
      }
    };
    const nextBtn = document.createElement("button");
    nextBtn.className = "slider-btn next";
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.onclick = function (e) {
      e.stopPropagation();
      if (currentMainIdx < thumbs.length - 1) {
        currentMainIdx++;
        updateThumbs();
      }
    };
    thumbnails.appendChild(prevBtn);
    thumbnails.appendChild(nextBtn);

    const imageBlock = mainImg.closest(".vehicle-image-block");
    if (imageBlock) {
      imageBlock.addEventListener("mouseenter", () => {
        prevBtn.style.opacity = nextBtn.style.opacity = "1";
      });
      imageBlock.addEventListener("mouseleave", () => {
        prevBtn.style.opacity = nextBtn.style.opacity = "0";
      });
      prevBtn.style.opacity = nextBtn.style.opacity = "0";
    }
  }, 500);
})();

// Mobile menu initializer
function initializeMobileMenu() {
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "mobile-menu-toggle";
  toggleBtn.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
  toggleBtn.setAttribute("aria-label", "Toggle mobile menu");

  const navbar = document.querySelector(".navbar");
  navbar.appendChild(toggleBtn);

  const mobileMenu = document.createElement("div");
  mobileMenu.className = "mobile-menu";
  mobileMenu.innerHTML = `
    <button class="close-btn" aria-label="Close mobile menu">
      <i class="fas fa-times" aria-hidden="true"></i>
    </button>
    <ul class="nav-links">
      <li>
        <a href="index.html"  aria-current="page">
          <i class="fas fa-home"></i> 
          <span data-translate="Home">Home</span>
        </a>
      </li>
      <li>
        <a href="inventory.html">
          <i class="fas fa-motorcycle"></i> 
          <span data-translate="Buy Car">Buy Car</span>
        </a>
      </li>
      <li>
        <a href="sell.html">
          <i class="fas fa-dollar-sign"></i>
          <span data-translate="Sell Your Car">Sell Your Car</span>
        </a>
      </li>
      <li>
        <a href="about.html">
          <i class="fas fa-info-circle"></i>
          <span data-translate="About Us">About Us</span>
        </a>
      </li>
      <li>
        <a href="#" class="updates-link">
          <i class="fas fa-bell"></i> 
          <span data-translate="Updates">Updates</span>
        </a>
      </li>
      <li>
        <a href="contact.html">
          <i class="fas fa-envelope"></i>
          <span data-translate="Contact">Contact</span>
        </a>
      </li>
    </ul>
    <div class="login-btn">
      <a href="./contact.html">
        <button aria-label="Get a quote for your Car" data-translate="Get the Quote">
          Get the Quote
        </button>
      </a>
    </div>
  `;

  document.body.appendChild(mobileMenu);

  toggleBtn.addEventListener("click", function () {
    mobileMenu.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  mobileMenu
    .querySelector(".close-btn")
    .addEventListener("click", function () {
      mobileMenu.classList.remove("active");
      document.body.style.overflow = "auto";
    });
}
