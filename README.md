# Seven Lakes SEO Generator

Modular system for generating SEO-optimized pages for the Seven Lakes Tajikistan website.

## Project Structure

```text
.
├── scripts/
│   └── generate-seo-pages.js    # Entry point script
├── src/
│   ├── components/
│   │   └── SeoPageGenerator.js  # Core logic and rendering functions
│   ├── data/
│   │   └── seven-lakes-data.js  # Centralized content and metadata
│   └── templates/
│       └── lake-page-template.html # HTML template for individual lake pages
└── out/                         # Generated HTML files
```

## How to Run

To regenerate all SEO pages, run:

```bash
node scripts/generate-seo-pages.js
```

The script will:
1. Load data from `src/data/seven-lakes-data.js`.
2. Apply locale-specific overrides (RU/EN).
3. Use `SeoGenerator` to render pages based on templates.
4. Write output to the `out/` directory.
5. Generate a `sitemap.xml`.

## Key Features

- **Modularity**: Data, logic, and templates are strictly separated.
- **Multilingual Support**: Efficiently handles Russian and English content with easy-to-apply overrides.
- **HTML Templates**: Lake pages use a dedicated HTML template for better maintainability.
- **SEO Ready**: Automatically generates JSON-LD schema, meta tags, and canonical links.
- **Responsive Images**: Built-in support for `srcset` and `sizes` for optimized loading.

## Adding Content

- **New Lake**: Add to `lakePages` in `seven-lakes-data.js` and provide content in `lakePageContent`.
- **New Locale**: Define overrides in `seven-lakes-data.js` and update the mapping in `generate-seo-pages.js`.
- **Global Design Change**: Modify `lake-page-template.html` or update the rendering methods in `SeoPageGenerator.js`.
