# @loyalid/layout-builder

Layout Builder UI + JSON-to-HTML Renderer for CMS. Supports Bootstrap 4/5, Tailwind CSS, and Native CSS.

## Install

```bash
npm install @loyalid/layout-builder
```

Or from GitHub:
```bash
npm install babaecip/loyalid-layout-builder
```

Or via CDN:
```html
<script src="https://unpkg.com/@loyalid/layout-builder"></script>
```

## Quick Start

### Native JS / Script Tag
```html
<script src="dist/index.min.js"></script>
<script>
  // Builder UI — mount to container, auto-sync JSON to textarea
  LoyalidLayout.initLayoutBuilder('#builder', '#layoutData');

  // Renderer — JSON to HTML
  const html = LoyalidLayout.generateLayout(data, 5);       // Bootstrap 5
  const html = LoyalidLayout.generateLayout(data, 'tailwind'); // Tailwind CSS
  const html = LoyalidLayout.generateLayout(data, 0);       // Native (inline styles)
</script>
```

### ES Module
```js
import { initLayoutBuilder, generateLayout, generateFullHTML } from '@loyalid/layout-builder';

// Builder UI
initLayoutBuilder('#builderContainer', '#layoutData');

// Renderer
const html = generateLayout(data, 5);          // Bootstrap 5
const html = generateLayout(data, 'tailwind'); // Tailwind CSS
const html = generateLayout(data, 0);          // Native (inline styles)

// Full standalone HTML page
const page = generateFullHTML(data, { title: 'My Article', framework: 'tailwind' });
```

### React
```jsx
import { useEffect, useRef } from 'react';
import { initLayoutBuilder, generateFullHTML } from '@loyalid/layout-builder';

// Builder
function LayoutEditor({ value, onChange }) {
  const containerRef = useRef(null);
  useEffect(() => {
    const ta = document.createElement('textarea');
    ta.style.display = 'none';
    ta.value = value || '';
    document.body.appendChild(ta);
    initLayoutBuilder(containerRef.current, ta);
    const interval = setInterval(() => {
      if (ta.value !== value) onChange(ta.value);
    }, 300);
    return () => { clearInterval(interval); ta.remove(); };
  }, []);
  return <div ref={containerRef} style={{ height: 600 }} />;
}

// Renderer
function LayoutRenderer({ data, framework = 5 }) {
  const html = generateFullHTML(data, { framework });
  return <iframe srcDoc={html} style={{ width: '100%', height: 600, border: 'none' }} />;
}
```

### Laravel / Blade
```blade
<textarea id="layoutData" name="layout_data" style="display:none;">
  {!! $article->layout_data ?? '{}' !!}
</textarea>
<div id="layoutBuilder" style="height:600px;"></div>
<script src="{{ asset('dist/index.min.js') }}"></script>
<script>
  LoyalidLayout.initLayoutBuilder('#layoutBuilder', '#layoutData');
</script>
```

## API

| Function | Description |
|----------|-------------|
| `initLayoutBuilder(container, textarea, opts)` | Mount builder UI, auto-sync JSON to textarea |
| `generateLayout(data, framework)` | Render JSON to HTML string |
| `generateFullHTML(data, opts)` | Full standalone HTML page from JSON |

### `framework` parameter

| Value | Output |
|-------|--------|
| `0` | Native CSS (inline styles) |
| `4` | Bootstrap 4 |
| `5` | Bootstrap 5 |
| `'tailwind'` / `'tw'` | Tailwind CSS utility classes |

### `generateFullHTML` options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | `'Article'` | Page title |
| `framework` | number/string | `0` | CSS framework (see above) |

## Features

- **Layout Builder UI** — 3-panel interface: Style | Order | Preview
- **4 CSS Frameworks** — Native, Bootstrap 4, Bootstrap 5, Tailwind CSS
- **Blocks** — Title, Paragraph, Quote, Image, Divider
- **Font Type** — Per-block font family selection (Inherit, Arial, Georgia, etc. or Custom)
- **Quote Background** — Color picker with Transparent option for quote blocks
- **Inline Links** — `[text](url)` Markdown syntax in Paragraph and Quote content
- **Add Hyperlink** — Button to insert links via modal (Paragraph & Quote blocks)
- **Convert from HTML** — Paste editor HTML → auto-convert to blocks
- **Drag & Drop** — Reorder blocks, move up/down, delete
- **Apply to All** — Apply text color or font size to all blocks
- **CMS Integration** — Works with any textarea (Laravel, WordPress, etc.)

## Block Types

| Type | Fields |
|------|--------|
| `title` | `content`, `level` (h1-h6), `link_url`, `link_target`, `style` (incl. `font_family`, `font_family_custom`) |
| `paragraph` | `content` (supports `[text](url)` links), `style` (incl. `font_family`, `font_family_custom`) |
| `quote` | `content` (supports `[text](url)` links), `citation`, `style` (incl. `font_family`, `font_family_custom`, `border_left_color`, `border_left_width`, `background_color`) |
| `image` | `url`, `alt`, `style` |
| `divider` | `style` (border_style, border_color, border_width, width) |

## JSON Schema

```json
{
  "general_style": {
    "background_color": "#ffffff",
    "text_color": "#333333",
    "font_size": "14px",
    "font_family": "__custom__",
    "font_family_custom": "'Nunito Sans', sans-serif",
    "max_width": "760px",
    "margin": "0 auto",
    "padding": "16px",
    "line_height": "1.5",
    "text_align": "left",
    "wrapper_tag": "div"
  },
  "blocks": [
    {
      "type": "title",
      "content": "Hello World",
      "level": "h2",
      "style": { "font_size": "24px", "font_weight": "bold", "color": "#000000", "font_family": "Georgia" }
    },
    {
      "type": "paragraph",
      "content": "Read more about [ICAD](https://icad.id) here.",
      "style": { "font_size": "16px", "line_height": "1.5", "color": "#333333" }
    },
    {
      "type": "quote",
      "content": "Design is not just what it looks like. Design is how it works.",
      "citation": "Steve Jobs",
      "style": {
        "font_size": "18px",
        "line_height": "1.6",
        "color": "#555555",
        "border_left_color": "#3b82f6",
        "border_left_width": "4px",
        "background_color": "#fef3c7",
        "font_family": "Georgia"
      }
    }
  ]
}
```

## License

MIT
