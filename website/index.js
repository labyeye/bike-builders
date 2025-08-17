const translations = {
  en: {
    // Home page translations
    "Get Your Dream Bike at Unbeatable Prices":
      "Get Your Dream Bike at Unbeatable Prices",
    "Why Choose Our Bikes": "Why Choose Our Bikes",
    "Petrol Powered": "Petrol Powered",
    "High-performance bikes with fuel-efficient engines for powerful yet economical riding experience.":
      "High-performance bikes with fuel-efficient engines for powerful yet economical riding experience.",
    "Advanced Tech": "Advanced Tech",
    "State-of-the-art technology for a smooth, connected, and intelligent riding experience.":
      "State-of-the-art technology for a smooth, connected, and intelligent riding experience.",
    "High Performance": "High Performance",
    "Engineered for speed and endurance with premium components and precision design.":
      "Engineered for speed and endurance with premium components and precision design.",
    "Premium Warranty": "Premium Warranty",
    "Industry-leading 5-year warranty on all components for worry-free ownership.":
      "Industry-leading 5-year warranty on all components for worry-free ownership.",
    // Add all other text elements that need translation
  },
  hi: {
    // Hindi translations
    "Get Your Dream Bike at Unbeatable Prices":
      "अपनी सपनों की बाइक बेजोड़ कीमतों पर पाएं",
    "Why Choose Our Bikes": "हमारी बाइक क्यों चुनें",
    "Petrol Powered": "पेट्रोल संचालित",
    "High-performance bikes with fuel-efficient engines for powerful yet economical riding experience.":
      "शक्तिशाली फिर भी किफायती राइडिंग अनुभव के लिए ईंधन-कुशल इंजन वाली हाई-परफॉर्मेंस बाइक।",
    "Advanced Tech": "उन्नत तकनीक",
    "State-of-the-art technology for a smooth, connected, and intelligent riding experience.":
      "एक सहज, जुड़ा हुआ और बुद्धिमान राइडिंग अनुभव के लिए अत्याधुनिक तकनीक।",
    "High Performance": "उच्च प्रदर्शन",
    "Engineered for speed and endurance with premium components and precision design.":
      "प्रीमियम घटकों और सटीक डिजाइन के साथ गति और सहनशक्ति के लिए इंजीनियर।",
    "Premium Warranty": "प्रीमियम वारंटी",
    "Industry-leading 5-year warranty on all components for worry-free ownership.":
      "चिंता मुक्त स्वामित्व के लिए सभी घटकों पर उद्योग-अग्रणी 5-वर्ष की वारंटी।",
    // Add all other text elements that need translation
  },
};

// Function to translate the page
function translatePage(language) {
  // Set the font family for Hindi
  if (language === "hi") {
    document.body.classList.add("hindi-font");
  } else {
    document.body.classList.remove("hindi-font");
  }

  // Get all elements with data-translate attribute
  const elements = document.querySelectorAll("[data-translate]");

  elements.forEach((element) => {
    const key = element.getAttribute("data-translate");
    if (translations[language] && translations[language][key]) {
      element.textContent = translations[language][key];
    }
  });

  // Store the selected language in localStorage
  localStorage.setItem("selectedLanguage", language);

  // Hide the popup
  document.getElementById("languagePopup").style.display = "none";
}
async;
src = "https://www.googletagmanager.com/gtag/js?id=G-ETL311CBE6";
// Check for previously selected language
document.addEventListener("DOMContentLoaded", function () {
  const savedLanguage = localStorage.getItem("selectedLanguage");

  if (!savedLanguage) {
    // Show popup if no language is selected
    document.getElementById("languagePopup").style.display = "flex";
  } else {
    // Apply saved language
    translatePage(savedLanguage);
  }

  // Set up language buttons
  document.querySelectorAll(".language-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const lang = this.getAttribute("data-lang");
      translatePage(lang);
    });
  });
});
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag("js", new Date());

gtag("config", "G-ETL311CBE6");
function animateStats() {
  const statNumbers = document.querySelectorAll(".stat-number");
  const speed = 200; // Lower is faster

  statNumbers.forEach((stat) => {
    const target = +stat.getAttribute("data-count");
    const count = +stat.innerText;
    const increment = target / speed;

    if (count < target) {
      stat.innerText = Math.ceil(count + increment);
      setTimeout(animateStats, 1);
    } else {
      stat.innerText = target;
    }
  });
}

// Start animation when stats section is in view
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateStats();
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

observer.observe(document.querySelector(".stats-section"));
document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "mobile-menu-toggle";
  toggleBtn.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
  toggleBtn.setAttribute("aria-label", "Toggle mobile menu");

  const navbar = document.querySelector(".navbar");
  navbar.appendChild(toggleBtn);

  const mobileMenu = document.createElement("div");
  mobileMenu.className = "mobile-menu";
  mobileMenu.innerHTML = `
          <button class="close-btn" aria-label="Close mobile menu"><i class="fas fa-times" aria-hidden="true"></i></button>
          <ul class="nav-links">
            <li><a href="index.html" class="active" aria-current="page">Home</a></li>
            <li><a href="inventory.html">Buy Bike</a></li>
            <li><a href="sell.html">Sell Your Bike</a></li>
            <li><a href="about.html">About Us</a></li>
                      <li><a href="./updates.html" data-translate="Updates">Updates</a></li>
          <li><a href="contact.html" data-translate="Contact">Contact</a></li>
          </ul>
          <div class="login-btn">
            <button aria-label="Get a quote for your bike">Get the Quote</button>
          </div>
        `;

  document.body.appendChild(mobileMenu);

  toggleBtn.addEventListener("click", function () {
    mobileMenu.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  mobileMenu.querySelector(".close-btn").addEventListener("click", function () {
    mobileMenu.classList.remove("active");
    document.body.style.overflow = "auto";
  });
});
