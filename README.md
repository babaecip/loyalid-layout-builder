# @loyalid/layout-builder

Render layout builder JSON to HTML with Bootstrap 4/5 support.

## Install

```bash
npm install @loyalid/layout-builder
```

## Usage

### Via Script Tag
```html
<script src="dist/index.min.js"></script>
<script>
  const data = {
    general_style: {
      font_size: "14px",
      max_width: "760px",
      margin: "0 auto"
    },
    blocks: [
      { type: "title", content: "Hello World", level: "h2" },
      { type: "paragraph", content: "This is a paragraph." }
    ]
  };

  LoyalidLayout.renderLayout('#output', data, { bootstrap: 5 });
</script>
```

### Via ES Module
```js
import { renderLayout, generateLayout } from '@loyalid/layout-builder';

// Render ke DOM
renderLayout('#output', json, { bootstrap: 5 });

// Atau generate HTML string saja
const html = generateLayout(data, 4);
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| bootstrap | number | 0 | 0 = no BS, 4 = BS4, 5 = BS5 |

## Block Types

| Type | Fields |
|------|--------|
| title | content, level (h1-h6), link_url, link_target, style |
| paragraph | content, link_url, link_target, style |
| image | url, alt, style |
| divider | style |

## JSON Schema

```json
{
  "general_style": {
    "background_color": "#ffffff",
    "text_color": "#333333",
    "font_size": "14px",
    "font_family": "Arial, sans-serif",
    "max_width": "760px",
    "margin": "0 auto",
    "padding": "16px",
    "text_align": "left",
    "wrapper_tag": "div"
  },
  "blocks": [
    {
      "type": "title",
      "content": "Title Text",
      "level": "h2",
      "link_url": "https://example.com",
      "link_target": "_blank",
      "style": {
        "font_size": "24px",
        "font_weight": "bold",
        "color": "#000000"
      }
    }
  ]
}
```
