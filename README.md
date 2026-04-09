# 🏍️ Bike Builders — Project Structure

## Current Structure (❌ Messy)

```
bike-builders/
├── website/                        # Static website (HTML/CSS/JS)
│   ├── index.html
│   ├── about.html
│   ├── book.html
│   ├── contact.html
│   ├── finance.html
│   ├── inventory.html
│   ├── sell.html
│   ├── updates.html
│   ├── vehicledetail.html
│   ├── locations-bihar.html
│   ├── location-bihar-city.html
│   ├── 404.html
│   ├── style.css                   # ← All CSS dumped at root
│   ├── about.css
│   ├── book.css
│   ├── contact.css
│   ├── finance.css
│   ├── inventory.css
│   ├── sell.css
│   ├── quote.css
│   ├── updates.css
│   ├── vehicledetail.css
│   ├── location-bihar.css
│   ├── global.css
│   ├── index.js                    # ← All JS dumped at root
│   ├── testimonials.js
│   ├── vehicledetail.js
│   ├── location-bihar-cities.json  # ← Data file at root
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── sitemap-locations-bihar.xml
│   ├── site.webmanifest
│   ├── vercel.json
│   ├── web-app-manifest-192x192.webp
│   ├── web-app-manifest-512x512.webp
│   ├── scripts/
│   │   └── remove_comments.js
│   └── assets/
│       ├── favicon.ico
│       ├── favicon.svg
│       ├── favicon-96x96.webp
│       ├── apple-touch-icon.webp
│       ├── logo2.svg
│       ├── back.svg
│       ├── own.webp
│       ├── owner.webp
│       ├── qe.jpeg
│       ├── images/
│       │   ├── 1.svg, 2.svg, 3.svg, 4.svg
│       │   ├── relogo.webp
│       │   ├── locations.webp
│       │   ├── financing/
│       │   ├── gallery/
│       │   ├── part-bihar/
│       │   └── range/
│       └── services/
│           ├── buy.webp
│           ├── sell.webp
│           └── service.webp
│
├── bike-inventory/                 # Backend API (Node.js/Express)
│   ├── server.js                   # ← Single monolith file
│   ├── package.json
│   ├── .env
│   ├── reviews.json
│   ├── vercel.json
│   └── public/
│
└── bike-inventory-frontend/        # Admin Dashboard (React)
    ├── package.json
    ├── public/
    └── src/
        ├── App.js
        ├── components/
        ├── pages/
        ├── css/
        └── assets/
```

---

## Recommended Structure (✅ Professional)

```
bike-builders/
├── README.md
├── .gitignore
│
├── website/
│   ├── index.html
│   ├── 404.html
│   │
│   ├── pages/                      # All non-index HTML pages
│   │   ├── about.html
│   │   ├── book.html
│   │   ├── contact.html
│   │   ├── finance.html
│   │   ├── inventory.html
│   │   ├── sell.html
│   │   ├── updates.html
│   │   ├── vehicle-detail.html
│   │   └── locations/
│   │       ├── bihar.html
│   │       └── bihar-city.html
│   │
│   ├── css/                        # All stylesheets grouped
│   │   ├── global.css
│   │   ├── style.css
│   │   ├── about.css
│   │   ├── book.css
│   │   ├── contact.css
│   │   ├── finance.css
│   │   ├── inventory.css
│   │   ├── sell.css
│   │   ├── quote.css
│   │   ├── updates.css
│   │   ├── vehicle-detail.css
│   │   └── locations.css
│   │
│   ├── js/                         # All JavaScript grouped
│   │   ├── main.js
│   │   ├── testimonials.js
│   │   └── vehicle-detail.js
│   │
│   ├── data/                       # JSON / static data
│   │   └── bihar-cities.json
│   │
│   ├── assets/
│   │   ├── icons/                  # Favicons & app icons
│   │   │   ├── favicon.ico
│   │   │   ├── favicon.svg
│   │   │   ├── favicon-96x96.webp
│   │   │   ├── apple-touch-icon.webp
│   │   │   ├── manifest-192x192.webp
│   │   │   └── manifest-512x512.webp
│   │   ├── logos/                   # Brand logos
│   │   │   ├── logo.svg
│   │   │   └── logo.webp
│   │   └── images/                 # All images organized
│   │       ├── hero/
│   │       ├── gallery/
│   │       ├── services/
│   │       ├── financing/
│   │       ├── locations/
│   │       ├── range/
│   │       └── team/
│   │
│   ├── scripts/                    # Build/utility scripts
│   │   └── remove-comments.js
│   │
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── site.webmanifest
│   └── vercel.json
│
├── bike-inventory/                 # Backend API
│   ├── package.json
│   ├── vercel.json
│   ├── .env.example
│   ├── src/
│   │   ├── index.js                # Entry point
│   │   ├── routes/                 # Route handlers
│   │   │   ├── vehicles.js
│   │   │   ├── leads.js
│   │   │   ├── reviews.js
│   │   │   └── finance.js
│   │   ├── controllers/            # Business logic
│   │   ├── middleware/             # Auth, validation, etc.
│   │   ├── config/                 # DB & app config
│   │   └── utils/                  # Helper functions
│   └── public/
│
└── bike-inventory-frontend/        # Admin Dashboard (React)
    ├── package.json
    ├── .env.example
    ├── public/
    └── src/
        ├── index.js
        ├── App.js
        ├── components/             # Reusable UI components
        ├── pages/                  # Route-level pages
        ├── styles/                 # CSS files
        ├── assets/                 # Static assets
        ├── services/               # API call functions
        └── utils/                  # Helpers
```

---

### Key Changes

| Problem | Fix |
|---|---|
| CSS files scattered at root | Moved to `css/` folder |
| JS files scattered at root | Moved to `js/` folder |
| HTML pages mixed at root | Non-index pages moved to `pages/` |
| JSON data at root | Moved to `data/` folder |
| Favicons mixed with images | Separated into `assets/icons/` |
| Images have unclear names (1.svg, qe.jpeg) | Use descriptive names |
| Backend is one giant `server.js` | Split into `routes/`, `controllers/`, `middleware/` |
| No `.env.example` | Add template for environment variables |
