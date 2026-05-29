(function () {
  var targets = [
    ".section-header",
    ".sell-section",
    ".sell-content",
    ".sell-form-container",
    ".sell-steps .sell-step",
    ".stats-section",
    ".stat-card",
    ".stats-bar",
    ".stats-bar .stat-card",
    ".process-section",
    ".process-step",
    ".faq-item",
    ".faq-section",
    ".about-container",
    ".owner-message",
    ".owner-stats .stat-item",
    ".milestones-section",
    ".timeline-event",
    ".team-grid",
    ".why-choose-section",
    ".services-section",
    ".service-card",
    ".featured-section",
    ".featured-bikes-section",
    ".range-section",
    ".range-card",
    ".bikes-section",
    ".brands-section",
    ".brand-card",
    ".testimonials-section",
    ".testimonial-card",
    ".contact-card",
    ".book-content",
    ".book-form-container",
    ".book-steps .book-step",
    ".finance-hero",
    ".partner",
    ".process",
    ".why-choose-row",
    ".why-choose-item",
    ".more-bikes-section",
    ".bike-card",
    ".other-car-card",
    ".inventory-section",
    ".updates-section",
    ".cities-section",
    ".city-card",
    ".styles-section",
    ".style-card",
    ".trust-section",
    ".trust-card",
    ".gallery-section",
    ".process-sections",
    ".process-sections .process-step",
    ".additional-info-section",
    ".info-card",
    ".vehicle-main-section",
    ".vehicle-details-block",
    ".vehicle-image-block",
  ];

  function initScrollAnim() {
    if (!("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (!el.classList.contains("scroll-anim") && !el.classList.contains("scroll-anim-left") && !el.classList.contains("scroll-anim-right")) {
          el.classList.add("scroll-anim");
          observer.observe(el);
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollAnim);
  } else {
    initScrollAnim();
  }
})();
