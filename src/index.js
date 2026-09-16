/**
 * @loyalid/layout-builder
 * Render layout builder JSON to HTML with Bootstrap 4/5 support
 */

// ========================
// PUBLIC API
// ========================

/**
 * Render layout data ke DOM container
 * @param {string|Element} selector - CSS selector atau DOM element
 * @param {string|Object} jsonData - JSON string atau object
 * @param {Object} options - { bootstrap: 0|4|5 }
 */
export function renderLayout(selector, jsonData, options = {}) {
  const container = typeof selector === 'string'
    ? document.querySelector(selector)
    : selector;

  if (!container) {
    console.error('[LoyalidLayout] Container not found:', selector);
    return '';
  }

  const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
  const bs = options.bootstrap || 0;

  const html = generateLayout(data, bs);
  container.innerHTML = html;
  return html;
}

/**
 * Generate layout HTML string tanpa render ke DOM
 * @param {Object} data - layout data object
 * @param {number} bootstrap - 0, 4, atau 5
 * @returns {string} HTML string
 */
export function generateLayout(data, bootstrap = 0) {
  const gs = data.general_style || {};
  const blocks = data.blocks || [];

  const containerStyle = buildCSS(gs);
  const tag = gs.wrapper_tag || 'div';
  const bsClass = bsContainer(bootstrap);

  let html = `<${tag}${bsClass ? ` class="${bsClass}"` : ''}${containerStyle ? ` style="${containerStyle}"` : ''}>`;

  // Inherited styles for child elements
  const inherited = pickInherited(gs);

  blocks.forEach(block => {
    html += renderBlock(block, inherited, bootstrap);
  });

  html += `</${tag}>`;
  return html;
}

// ========================
// BLOCK RENDERERS
// ========================

function renderBlock(block, inherited, bs) {
  const merged = { ...inherited, ...(block.style || {}) };
  const style = buildCSS(merged);

  switch (block.type) {
    case 'title':
      return renderTitle(block, style, bs);
    case 'paragraph':
      return renderParagraph(block, style, bs);
    case 'image':
      return renderImage(block, style, bs);
    case 'divider':
      return renderDivider(block, style, bs);
    default:
      return '';
  }
}

function renderTitle(block, style, bs) {
  const tag = block.level || 'h2';
  const cls = bsClass('title', bs);

  let inner = escapeHtml(block.content || '');
  if (block.link_url) {
    inner = buildLink(block.link_url, block.link_target, inner);
  }

  return `<${tag}${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''}>${inner}</${tag}>\n`;
}

function renderParagraph(block, style, bs) {
  const cls = bsClass('paragraph', bs);

  let content = escapeHtml(block.content || '').replace(/\n/g, '<br>');
  if (block.link_url) {
    content = buildLink(block.link_url, block.link_target, content);
  }

  return `<p${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''}>${content}</p>\n`;
}

function renderImage(block, style, bs) {
  if (!block.url) return '';
  const cls = bsClass('image', bs);

  return `<img src="${escapeAttr(block.url)}" alt="${escapeAttr(block.alt || '')}"${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''} />\n`;
}

function renderDivider(block, style, bs) {
  const cls = bsClass('divider', bs);

  return `<hr${cls ? ` class="${cls}"` : ''}${style ? ` style="${style}"` : ''} />\n`;
}

// ========================
// BOOTSTRAP HELPERS
// ========================

function bsContainer(bs) {
  if (bs === 4 || bs === 5) return 'container';
  return '';
}

function bsClass(type, bs) {
  if (bs === 0) return '';
  const map = {
    title: 'mb-3',
    paragraph: 'mb-3',
    image: 'img-fluid',
    divider: 'my-3'
  };
  return map[type] || '';
}

// ========================
// STYLE HELPERS
// ========================

const CSS_MAP = {
  background_color: 'background-color',
  text_color: 'color',
  color: 'color',
  font_size: 'font-size',
  font_family: 'font-family',
  font_family_custom: null,
  font_weight: 'font-weight',
  text_align: 'text-align',
  text_transform: 'text-transform',
  letter_spacing: 'letter-spacing',
  padding: 'padding',
  margin: 'margin',
  margin_bottom: 'margin-bottom',
  margin_top: 'margin-top',
  line_height: 'line-height',
  width: 'width',
  max_width: 'max-width',
  border_radius: 'border-radius',
  border_style: 'border-style',
  border_color: 'border-color',
  border_width: 'border-width',
  wrapper_tag: null
};

function buildCSS(styles) {
  let css = '';
  for (const key of Object.keys(styles)) {
    const val = styles[key];
    const prop = CSS_MAP[key];

    if (key === 'font_family_custom' && val) {
      css += `font-family: ${val}; `;
    } else if (key === 'font_family' && styles.font_family_custom) {
      // skip if custom is set
    } else if (prop && val) {
      css += `${prop}: ${val}; `;
    }
  }
  return css.trim();
}

function pickInherited(gs) {
  const keys = ['font_family', 'font_family_custom', 'font_size', 'text_color', 'line_height', 'letter_spacing', 'text_transform'];
  const result = {};
  keys.forEach(k => {
    if (gs[k]) result[k] = gs[k];
  });
  return result;
}

// ========================
// UTILITIES
// ========================

function buildLink(url, target, content) {
  const t = target ? ` target="${escapeAttr(target)}"` : '';
  return `<a href="${escapeAttr(url)}"${t} style="color:inherit;text-decoration:none;">${content}</a>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
