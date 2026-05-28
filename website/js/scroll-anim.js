(function () {
  var targets = [
    ".section-header",
    ".sell-section",
    ".sell-content",
    ".sell-form-container",
    ".sell-steps .sell-step",
    ".stats-section",
    ".stat-card",
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
    ".bikes-section",
    ".brands-section",
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
    ".more-bikes-section",
    ".bike-card",
    ".inventory-section",
    ".updates-section",
    ".cities-section",
    ".city-card",
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
