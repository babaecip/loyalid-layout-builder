/**
 * @loyalid/layout-builder
 * Layout Builder UI + JSON-to-HTML Renderer
 * Supports Bootstrap 4 & 5
 *
 * Usage:
 *   import { initLayoutBuilder, generateLayout, generateFullHTML } from '@loyalid/layout-builder';
 *   initLayoutBuilder('#my-container', '#my-textarea');
 *   const html = generateLayout(data, 5); // Bootstrap 5
 */

// ========================
// VALUE MAPPING
// ========================

// Value maps: shorthand key -> { label, css }
const FONT_SIZES = { '2xs': { l: '2xs (10px)', c: '10px' }, xs: { l: 'xs (12px)', c: '12px' }, sm: { l: 'sm (13px)', c: '13px' }, base: { l: 'base (14px)', c: '14px' }, md: { l: 'md (16px)', c: '16px' }, lg: { l: 'lg (20px)', c: '20px' }, xl: { l: 'xl (24px)', c: '24px' }, '2xl': { l: '2xl (32px)', c: '32px' }, '3xl': { l: '3xl (40px)', c: '40px' }, '4xl': { l: '4xl (48px)', c: '48px' } };
const LINE_HEIGHTS = { none: { l: 'none (1)', c: '1' }, tight: { l: 'tight (1.25)', c: '1.25' }, snug: { l: 'snug (1.375)', c: '1.375' }, normal: { l: 'normal (1.5)', c: '1.5' }, relaxed: { l: 'relaxed (1.625)', c: '1.625' }, loose: { l: 'loose (2)', c: '2' } };
const SPACINGS = { none: { l: 'none (0)', c: '0' }, '2xs': { l: '2xs (2px)', c: '2px' }, xs: { l: 'xs (4px)', c: '4px' }, sm: { l: 'sm (8px)', c: '8px' }, base: { l: 'base (10px)', c: '10px' }, md: { l: 'md (16px)', c: '16px' }, lg: { l: 'lg (24px)', c: '24px' }, xl: { l: 'xl (32px)', c: '32px' }, '2xl': { l: '2xl (48px)', c: '48px' }, '3xl': { l: '3xl (64px)', c: '64px' } };
const WIDTHS = { auto: { l: 'auto (auto)', c: 'auto' }, full: { l: 'full (100%)', c: '100%' }, '3/4': { l: '3/4 (75%)', c: '75%' }, '2/3': { l: '2/3 (66.67%)', c: '66.67%' }, '1/2': { l: '1/2 (50%)', c: '50%' }, '1/3': { l: '1/3 (33.33%)', c: '33.33%' }, '1/4': { l: '1/4 (25%)', c: '25%' } };
const MAX_WIDTHS = { xs: { l: 'xs (320px)', c: '320px' }, sm: { l: 'sm (480px)', c: '480px' }, md: { l: 'md (640px)', c: '640px' }, base: { l: 'base (760px)', c: '760px' }, lg: { l: 'lg (960px)', c: '960px' }, xl: { l: 'xl (1140px)', c: '1140px' }, full: { l: 'full (100%)', c: '100%' } };
const BORDER_WIDTHS = { thin: { l: 'thin (1px)', c: '1px' }, normal: { l: 'normal (2px)', c: '2px' }, thick: { l: 'thick (3px)', c: '3px' }, thicker: { l: 'thicker (4px)', c: '4px' } };
const LETTER_SPACINGS = { tighter: { l: 'tighter (-0.05em)', c: '-0.05em' }, tight: { l: 'tight (-0.025em)', c: '-0.025em' }, normal: { l: 'normal (0)', c: '0' }, wide: { l: 'wide (0.025em)', c: '0.025em' }, wider: { l: 'wider (0.05em)', c: '0.05em' }, widest: { l: 'widest (0.1em)', c: '0.1em' } };
const FONT_WEIGHTS = { Normal: 'normal', Bold: 'bold' };

// Reverse maps: CSS value -> shorthand key (for loading existing CSS data)
function reverseMap(m) { const r = {}; for (const [k, v] of Object.entries(m)) r[v.c] = k; return r; }
const R_FONT_SIZES = reverseMap(FONT_SIZES);
const R_LINE_HEIGHTS = reverseMap(LINE_HEIGHTS);
const R_SPACINGS = reverseMap(SPACINGS);
const R_WIDTHS = reverseMap(WIDTHS);
const R_MAX_WIDTHS = reverseMap(MAX_WIDTHS);
const R_BORDER_WIDTHS = reverseMap(BORDER_WIDTHS);
const R_LETTER_SPACINGS = reverseMap(LETTER_SPACINGS);

function toShorthand(key, val) {
  if (val == null) return '';
  const s = String(val);
  // Already a shorthand key?
  const maps = { font_size: FONT_SIZES, line_height: LINE_HEIGHTS, padding: SPACINGS, margin: SPACINGS, margin_top: SPACINGS, margin_bottom: SPACINGS, width: WIDTHS, max_width: MAX_WIDTHS, border_width: BORDER_WIDTHS, letter_spacing: LETTER_SPACINGS };
  if (maps[key] && maps[key][s]) return s;
  // CSS value -> resolve to shorthand
  if (s.includes('px') || s.includes('em') || s.includes('%')) {
    const rev = { font_size: R_FONT_SIZES, line_height: R_LINE_HEIGHTS, padding: R_SPACINGS, margin: R_SPACINGS, margin_top: R_SPACINGS, margin_bottom: R_SPACINGS, width: R_WIDTHS, max_width: R_MAX_WIDTHS, border_width: R_BORDER_WIDTHS, letter_spacing: R_LETTER_SPACINGS };
    return (rev[key] && rev[key][s]) || s;
  }
  return s;
}

function toCSS(key, val) {
  if (val == null) return '';
  const maps = { font_size: FONT_SIZES, line_height: LINE_HEIGHTS, padding: SPACINGS, margin: SPACINGS, margin_top: SPACINGS, margin_bottom: SPACINGS, width: WIDTHS, max_width: MAX_WIDTHS, border_width: BORDER_WIDTHS, letter_spacing: LETTER_SPACINGS };
  const m = maps[key];
  if (m && m[val]) return m[val].c; // shorthand -> CSS
  return val; // already CSS
}

// ========================
// CSS MAP
// ========================

const CSS_PROPS = {
  background_color: 'background-color', text_color: 'color', color: 'color',
  font_size: 'font-size', font_family: 'font-family', font_weight: 'font-weight',
  text_align: 'text-align', text_transform: 'text-transform', letter_spacing: 'letter-spacing',
  padding: 'padding', margin: 'margin', margin_top: 'margin-top', margin_bottom: 'margin-bottom',
  line_height: 'line-height', width: 'width', max_width: 'max-width',
  border_style: 'border-style', border_color: 'border-color', border_width: 'border-width',
  border_radius: 'border-radius'
};

function buildCSS(styles) {
  let css = '';
  for (const [k, v] of Object.entries(styles)) {
    if (k === 'font_family_custom' && v) { css += `font-family: ${v}; `; continue; }
    if (k === 'font_family' && styles.font_family_custom) continue;
    if (k === 'wrapper_tag') continue;
    const prop = CSS_PROPS[k];
    if (prop && v != null && v !== '') css += `${prop}: ${v}; `;
  }
  return css.trim();
}

// ========================
// HTML UTILITIES
// ========================

function esc(s) { return s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : ''; }
function escAttr(s) { return esc(s).replace(/'/g, '&#39;'); }

/**
 * Parse inline Markdown-style links: [text](url) → <a href="url">text</a>
 * Also handles [text](url "title") with optional title attribute.
 */
function parseInlineLinks(text) {
  if (!text) return '';
  return text.replace(/\[([^\]]+)\]\(([^)"\s]+)(?:\s+"([^"]*)")?\)/g, (_, linkText, url, title) => {
    const t = title ? ` title="${escAttr(title)}"` : '';
    return `<a href="${escAttr(url)}"${t} style="color:inherit;text-decoration:underline;">${esc(linkText)}</a>`;
  });
}

// ========================
// BLOCK DEFINITIONS
// ========================

function defaultBlock(type) {
  const base = { type, content: '', style: {}, link_url: '', link_target: '' };
  switch (type) {
    case 'title':
      return { ...base, level: 'h2', style: { font_size: '24px', font_weight: 'bold', color: '#000000', text_align: 'left', margin_bottom: '16px' } };
    case 'paragraph':
      return { ...base, style: { font_size: '16px', line_height: '1.5', text_align: 'left', color: '#333333', margin_bottom: '16px', padding: '0' } };
    case 'image':
      return { ...base, url: '', alt: '', style: { width: '100%', text_align: 'center', margin_bottom: '16px' } };
    case 'divider':
      return { ...base, style: { border_style: 'solid', border_color: '#cccccc', border_width: '1px', margin_top: '16px', margin_bottom: '16px', width: '100%' } };
    default:
      return base;
  }
}

const BLOCK_ICONS = { title: 'T', paragraph: 'P', image: 'I', divider: 'D' };

// ========================
// LAYOUT BUILDER CLASS
// ========================

class LayoutBuilder {
  constructor(container, textarea, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.textarea = typeof textarea === 'string' ? document.querySelector(textarea) : textarea;
    this.options = options;
    this.state = { general_style: this._defaultGS(), blocks: [] };
    this._expandedBlocks = new Set();
    this._expandedGS = true;
    this._dragIndex = null;

    // Load existing data from textarea
    if (this.textarea && this.textarea.value) {
      try {
        const parsed = JSON.parse(this.textarea.value);
        if (parsed.general_style) this.state.general_style = { ...this.state.general_style, ...parsed.general_style };
        if (parsed.blocks) this.state.blocks = parsed.blocks;
        // Expand all blocks
        this.state.blocks.forEach((_, i) => this._expandedBlocks.add(i));
      } catch (e) { /* ignore */ }
    }

    this.init();
    this.sync();
  }

  _defaultGS() {
    return {
      background_color: '#ffffff', text_color: '#333333', font_size: '14px',
      font_family: '__custom__', font_family_custom: "'Nunito Sans', sans-serif",
      padding: '16px', text_align: 'left', max_width: '760px',
      margin: '0 auto', line_height: '1.5', wrapper_tag: 'div'
    };
  }

  init() {
    this.container.innerHTML = '';
    this.container.style.cssText = 'display:flex;gap:0;height:600px;font-family:system-ui,-apple-system,sans-serif;font-size:13px;';

    // Left panel
    this.leftPanel = el('div', 'lb-left');
    this.leftPanel.style.cssText = 'width:320px;min-width:320px;overflow-y:auto;background:#fff;border-right:1px solid #e5e7eb;padding:0;';
    this.container.appendChild(this.leftPanel);

    // Middle panel
    this.midPanel = el('div', 'lb-mid');
    this.midPanel.style.cssText = 'width:260px;min-width:260px;overflow-y:auto;background:#f9fafb;border-right:1px solid #e5e7eb;padding:12px;';
    this.container.appendChild(this.midPanel);

    // Right panel
    this.rightPanel = el('div', 'lb-right');
    this.rightPanel.style.cssText = 'flex:1;overflow-y:auto;background:#f3f4f6;padding:16px;';
    this.container.appendChild(this.rightPanel);

    this.renderLeft();
    this.renderMiddle();
    this.renderRight();
  }

  // ---- LEFT PANEL ----
  renderLeft() {
    this.leftPanel.innerHTML = '';
    this.leftPanel.appendChild(this._renderConvertBtn());
    this.leftPanel.appendChild(this._renderGS());
    this.leftPanel.appendChild(this._renderAddBlock());
    this.leftPanel.appendChild(this._renderBlocks());
  }

  _renderConvertBtn() {
    const wrap = el('div');

    // Header (same style as General Style)
    const hdr = el('div');
    hdr.style.cssText = 'padding:10px 14px;background:#1e293b;color:#fff;font-weight:600;cursor:pointer;display:flex;justify-content:space-between;align-items:center;user-select:none;';
    hdr.innerHTML = '<span>Convert from HTML</span><span>\u25B6</span>';
    wrap.appendChild(hdr);

    // Body
    const body = el('div');
    body.style.cssText = 'padding:12px 14px;';
    const hint = el('div');
    hint.style.cssText = 'font-size:11px;color:#9ca3af;margin-bottom:10px;line-height:1.5;';
    hint.textContent = 'Paste HTML from editor and convert it into layout blocks automatically.';
    body.appendChild(hint);
    const btn = el('button');
    btn.type = 'button';
    btn.style.cssText = 'display:inline-flex;align-items:center;gap:5px;padding:5px 14px;font-size:12px;font-weight:500;line-height:1.5;color:#374151;background-color:#fff;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;transition:background .15s;';
    btn.onmouseenter = () => { btn.style.backgroundColor = '#f3f4f6'; };
    btn.onmouseleave = () => { btn.style.backgroundColor = '#fff'; };
    const icon = el('span');
    icon.textContent = '\u21C5';
    icon.style.cssText = 'font-size:13px;opacity:.65;';
    btn.appendChild(icon);
    btn.appendChild(document.createTextNode(' Convert from HTML'));
    btn.onclick = () => this._showConvertModal();
    body.appendChild(btn);
    wrap.appendChild(body);

    // Toggle
    let open = false;
    hdr.onclick = () => { open = !open; body.style.display = open ? 'block' : 'none'; hdr.querySelector('span:last-child').textContent = open ? '\u25BC' : '\u25B6'; };
    body.style.display = 'none';

    return wrap;
  }

  _showConvertModal() {
    const overlay = el('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';

    const modal = el('div');
    modal.style.cssText = 'background:#fff;border-radius:8px;padding:20px;width:500px;max-width:90vw;max-height:80vh;display:flex;flex-direction:column;';

    const title = el('h3');
    title.style.cssText = 'margin:0 0 10px;font-size:15px;color:#1e293b;';
    title.textContent = 'Convert from HTML';
    modal.appendChild(title);

    const ta = el('textarea');
    ta.placeholder = 'Paste HTML content here...';
    ta.style.cssText = 'width:100%;height:200px;padding:8px;border:1px solid #d1d5db;border-radius:4px;font-size:12px;font-family:monospace;resize:vertical;';
    modal.appendChild(ta);

    const btnRow = el('div');
    btnRow.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;margin-top:12px;';

    const cancelBtn = el('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = 'padding:6px 16px;border:1px solid #d1d5db;border-radius:4px;background:#fff;cursor:pointer;font-size:12px;';
    cancelBtn.onclick = () => document.body.removeChild(overlay);

    const convertBtn = el('button');
    convertBtn.textContent = 'Convert';
    convertBtn.style.cssText = 'padding:6px 16px;border:none;border-radius:4px;background:#3b82f6;color:#fff;cursor:pointer;font-size:12px;font-weight:600;';
    convertBtn.onclick = () => {
      this.convertFromHTML(ta.value);
      document.body.removeChild(overlay);
    };

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(convertBtn);
    modal.appendChild(btnRow);
    overlay.appendChild(modal);
    overlay.onclick = (e) => { if (e.target === overlay) document.body.removeChild(overlay); };
    document.body.appendChild(overlay);
  }

  _showLinkModal(textarea, block) {
    const overlay = el('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';

    const modal = el('div');
    modal.style.cssText = 'background:#fff;border-radius:8px;padding:20px;width:400px;max-width:90vw;';

    const title = el('h3');
    title.style.cssText = 'margin:0 0 12px;font-size:14px;color:#1e293b;';
    title.textContent = 'Add Hyperlink';
    modal.appendChild(title);

    // Link Text
    const ltWrap = el('div');
    ltWrap.style.cssText = 'margin-bottom:10px;';
    ltWrap.innerHTML = '<label style="display:block;font-size:11px;color:#6b7280;margin-bottom:3px;">Link Text</label>';
    const ltInput = el('input');
    ltInput.type = 'text';
    ltInput.placeholder = 'e.g. Click here';
    ltInput.style.cssText = 'width:100%;padding:6px 8px;border:1px solid #d1d5db;border-radius:4px;font-size:12px;';
    ltWrap.appendChild(ltInput);
    modal.appendChild(ltWrap);

    // URL
    const urlWrap = el('div');
    urlWrap.style.cssText = 'margin-bottom:10px;';
    urlWrap.innerHTML = '<label style="display:block;font-size:11px;color:#6b7280;margin-bottom:3px;">URL</label>';
    const urlInput = el('input');
    urlInput.type = 'url';
    urlInput.placeholder = 'https://...';
    urlInput.style.cssText = 'width:100%;padding:6px 8px;border:1px solid #d1d5db;border-radius:4px;font-size:12px;';
    urlWrap.appendChild(urlInput);
    modal.appendChild(urlWrap);

    const btnRow = el('div');
    btnRow.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;margin-top:12px;';

    const cancelBtn = el('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = 'padding:5px 14px;border:1px solid #d1d5db;border-radius:4px;background:#fff;cursor:pointer;font-size:12px;';
    cancelBtn.onclick = () => document.body.removeChild(overlay);

    const insertBtn = el('button');
    insertBtn.textContent = 'Insert Link';
    insertBtn.style.cssText = 'padding:5px 14px;border:none;border-radius:4px;background:#3b82f6;color:#fff;cursor:pointer;font-size:12px;font-weight:600;';
    insertBtn.onclick = () => {
      const linkText = ltInput.value.trim() || 'link';
      const url = urlInput.value.trim();
      if (!url) { urlInput.focus(); return; }
      const markdown = `[${linkText}](${url})`;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = textarea.value.substring(0, start);
      const after = textarea.value.substring(end);
      textarea.value = before + markdown + after;
      textarea.selectionStart = textarea.selectionEnd = start + markdown.length;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.focus();
      document.body.removeChild(overlay);
    };

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(insertBtn);
    modal.appendChild(btnRow);
    overlay.appendChild(modal);
    overlay.onclick = (e) => { if (e.target === overlay) document.body.removeChild(overlay); };
    document.body.appendChild(overlay);
    ltInput.focus();
  }

  convertFromHTML(html) {
    if (!html || !html.trim()) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = html;

    const newBlocks = [];
    tmp.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
      const tag = h.tagName.toLowerCase();
      newBlocks.push({
        type: 'title', content: h.textContent.trim(), level: tag,
        style: { font_size: toCSS('font_size', { h1: '2xl', h2: 'xl', h3: 'lg', h4: 'md', h5: 'base', h6: 'sm' }[tag] || 'md'), font_weight: 'bold', color: '#000000', text_align: 'left', margin_bottom: '16px' },
        link_url: h.closest('a') ? h.closest('a').href : '', link_target: ''
      });
    });
    tmp.querySelectorAll('p').forEach(p => {
      if (p.textContent.trim()) {
        newBlocks.push({
          type: 'paragraph', content: p.textContent.trim(),
          style: { font_size: '16px', line_height: '1.5', text_align: 'left', color: '#333333', margin_bottom: '16px', padding: '0' },
          link_url: '', link_target: ''
        });
      }
    });
    tmp.querySelectorAll('img').forEach(img => {
      newBlocks.push({
        type: 'image', url: img.src, alt: img.alt || '',
        style: { width: '100%', text_align: 'center', margin_bottom: '16px' },
        link_url: '', link_target: ''
      });
    });
    tmp.querySelectorAll('hr').forEach(() => {
      newBlocks.push({
        type: 'divider', content: '',
        style: { border_style: 'solid', border_color: '#cccccc', border_width: '1px', margin_top: '16px', margin_bottom: '16px', width: '100%' },
        link_url: '', link_target: ''
      });
    });

    if (newBlocks.length === 0 && tmp.textContent.trim()) {
      newBlocks.push({
        type: 'paragraph', content: tmp.textContent.trim(),
        style: { font_size: '16px', line_height: '1.5', text_align: 'left', color: '#333333', margin_bottom: '16px', padding: '0' },
        link_url: '', link_target: ''
      });
    }

    this.state.blocks = newBlocks;
    this._expandedBlocks = new Set(newBlocks.map((_, i) => i));
    this.sync();
    this.renderLeft();
    this.renderMiddle();
  }

  _renderGS() {
    const gs = this.state.general_style;
    const wrap = el('div');

    // Header
    const hdr = el('div');
    hdr.style.cssText = 'padding:10px 14px;background:#1e293b;color:#fff;font-weight:600;cursor:pointer;display:flex;justify-content:space-between;align-items:center;user-select:none;';
    hdr.innerHTML = `<span>General Style</span><span>${this._expandedGS ? '\u25BC' : '\u25B6'}</span>`;
    hdr.onclick = () => { this._expandedGS = !this._expandedGS; this.renderLeft(); };
    wrap.appendChild(hdr);

    if (!this._expandedGS) return wrap;

    const body = el('div');
    body.style.cssText = 'padding:12px 14px;';

    // Color pickers
    body.appendChild(this._colorField('Background Color', 'background_color', gs.background_color));
    body.appendChild(this._colorField('Text Color', 'text_color', gs.text_color, null, 'Apply to All Text', () => {
      this.state.blocks.forEach(b => { if (b.style) b.style.color = this.state.general_style.text_color; });
    }));

    // Font Size — convert CSS value to shorthand key for dropdown matching
    body.appendChild(this._selectField('Font Size', 'font_size', toShorthand('font_size', gs.font_size), FONT_SIZES, (v) => { this.state.general_style.font_size = toCSS('font_size', v); }, 'Apply to All Paragraph', () => {
      this.state.blocks.forEach(b => { if (b.type === 'paragraph' && b.style) b.style.font_size = this.state.general_style.font_size; });
    }));
    body.appendChild(this._selectField('Line Height', 'line_height', toShorthand('line_height', gs.line_height), LINE_HEIGHTS, (v) => { this.state.general_style.line_height = toCSS('line_height', v); }));
    body.appendChild(this._selectField('Max Width', 'max_width', toShorthand('max_width', gs.max_width), MAX_WIDTHS, (v) => { this.state.general_style.max_width = toCSS('max_width', v); }));
    body.appendChild(this._selectField('Margin', 'margin', toShorthand('margin', gs.margin), { none: SPACINGS.none, auto: { l: 'auto', c: 'auto' }, centered: { l: 'centered (0 auto)', c: '0 auto' }, '2xs': SPACINGS['2xs'], xs: SPACINGS.xs, sm: SPACINGS.sm, base: SPACINGS.base, md: SPACINGS.md, lg: SPACINGS.lg, xl: SPACINGS.xl, '2xl': SPACINGS['2xl'] }, (v) => { this.state.general_style.margin = toCSS('margin', v) || v; }));
    body.appendChild(this._selectField('Padding', 'padding', toShorthand('padding', gs.padding), SPACINGS, (v) => { this.state.general_style.padding = toCSS('padding', v); }));
    body.appendChild(this._selectField('Text Align', 'text_align', gs.text_align || 'left', { left: 'Left', center: 'Center', right: 'Right', justify: 'Justify' }, (v) => { this.state.general_style.text_align = v; }));
    body.appendChild(this._selectField('Wrapper Tag', 'wrapper_tag', gs.wrapper_tag || 'div', { div: '<div>', section: '<section>' }, (v) => { this.state.general_style.wrapper_tag = v; }));

    // Font Family — inline layout (dropdown + custom input on same row)
    const ffWrap = el('div');
    ffWrap.style.cssText = 'margin-bottom:10px;';
    ffWrap.innerHTML = `<label style="display:block;font-size:11px;color:#6b7280;margin-bottom:3px;">Font Family</label>`;
    const ffRow = el('div');
    ffRow.style.cssText = 'display:flex;gap:6px;align-items:center;';
    const ffSel = el('select');
    ffSel.style.cssText = 'padding:5px 8px;border:1px solid #d1d5db;border-radius:4px;font-size:12px;flex:1;';
    ['Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New', 'Custom...'].forEach(opt => {
      const o = document.createElement('option');
      o.value = opt === 'Custom...' ? '__custom__' : opt;
      o.textContent = opt;
      if (gs.font_family === o.value) o.selected = true;
      ffSel.appendChild(o);
    });
    ffSel.onchange = () => { this.state.general_style.font_family = ffSel.value; this.sync(); this.renderLeft(); };
    ffRow.appendChild(ffSel);
    if (gs.font_family === '__custom__') {
      const customInput = el('input');
      customInput.type = 'text';
      customInput.value = gs.font_family_custom || '';
      customInput.placeholder = "e.g. 'Nunito Sans', sans-serif";
      customInput.style.cssText = 'flex:1;padding:5px 8px;border:1px solid #d1d5db;border-radius:4px;font-size:12px;';
      customInput.oninput = () => { this.state.general_style.font_family_custom = customInput.value; this.sync(); };
      ffRow.appendChild(customInput);
    }
    ffWrap.appendChild(ffRow);
    body.appendChild(ffWrap);

    wrap.appendChild(body);
    return wrap;
  }

  _renderAddBlock() {
    const wrap = el('div');
    const hdr = el('div');
    hdr.style.cssText = 'padding:10px 14px;background:#1e293b;color:#fff;font-weight:600;cursor:pointer;display:flex;justify-content:space-between;align-items:center;user-select:none;';
    hdr.innerHTML = '<span>Add Block</span>';
    wrap.appendChild(hdr);

    const body = el('div');
    body.style.cssText = 'padding:12px 14px;display:flex;gap:6px;flex-wrap:wrap;';

    ['title', 'image', 'paragraph', 'divider'].forEach(type => {
      const btn = el('button');
      btn.style.cssText = 'padding:6px 14px;border:1px solid #d1d5db;border-radius:6px;background:#fff;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;';
      btn.innerHTML = `<span style="font-weight:700;">${BLOCK_ICONS[type]}</span> ${type.charAt(0).toUpperCase() + type.slice(1)}`;
      btn.onclick = () => this.addBlock(type);
      body.appendChild(btn);
    });

    wrap.appendChild(body);
    return wrap;
  }

  _renderBlocks() {
    const wrap = el('div');
    const hdr = el('div');
    hdr.style.cssText = 'padding:10px 14px;background:#1e293b;color:#fff;font-weight:600;cursor:pointer;display:flex;justify-content:space-between;align-items:center;user-select:none;';
    hdr.innerHTML = `<span>Blocks</span>`;
    wrap.appendChild(hdr);

    const body = el('div');
    body.style.cssText = 'padding:8px 14px;';

    this.state.blocks.forEach((block, i) => {
      body.appendChild(this._renderBlockEditor(block, i));
    });

    if (this.state.blocks.length === 0) {
      const empty = el('div');
      empty.style.cssText = 'padding:20px;text-align:center;color:#9ca3af;font-style:italic;';
      empty.textContent = 'No blocks yet. Click a button above to add one.';
      body.appendChild(empty);
    }

    wrap.appendChild(body);
    return wrap;
  }

  _renderBlockEditor(block, index) {
    const expanded = this._expandedBlocks.has(index);
    const wrap = el('div');
    wrap.style.cssText = 'margin-bottom:8px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;';

    // Header
    const hdr = el('div');
    hdr.style.cssText = 'padding:8px 10px;background:#f1f5f9;display:flex;justify-content:space-between;align-items:center;cursor:pointer;user-select:none;';
    const preview = block.content ? String(block.content).substring(0, 30) + (block.content.length > 30 ? '...' : '') : (block.type === 'image' ? '\uD83D\uDCF7 Image' : block.type === 'divider' ? '\u2015 Divider' : '');
    hdr.innerHTML = `<span style="display:flex;align-items:center;gap:6px;"><span style="font-weight:700;font-size:11px;">\u25BC</span><span style="font-size:11px;font-weight:600;color:#6b7280;">${block.type.toUpperCase()}</span><span style="color:#9ca3af;font-size:11px;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(preview)}</span></span>`;
    const actions = el('span');
    actions.style.cssText = 'display:flex;gap:2px;';

    // Move Up btn
    const upBtn = el('button');
    upBtn.innerHTML = '\u25B2';
    upBtn.title = 'Move Up';
    upBtn.style.cssText = 'border:none;background:none;cursor:pointer;font-size:11px;padding:0 4px;color:#6b7280;';
    upBtn.onclick = (e) => { e.stopPropagation(); this.moveBlock(index, index - 1); };

    // Move Down btn
    const downBtn = el('button');
    downBtn.innerHTML = '\u25BC';
    downBtn.title = 'Move Down';
    downBtn.style.cssText = 'border:none;background:none;cursor:pointer;font-size:11px;padding:0 4px;color:#6b7280;';
    downBtn.onclick = (e) => { e.stopPropagation(); this.moveBlock(index, index + 1); };

    // Delete btn
    const delBtn = el('button');
    delBtn.innerHTML = '\u2715';
    delBtn.title = 'Delete';
    delBtn.style.cssText = 'border:none;background:none;cursor:pointer;font-size:14px;padding:0 4px;color:#ef4444;';
    delBtn.onclick = (e) => { e.stopPropagation(); this.removeBlock(index); };

    actions.appendChild(upBtn);
    actions.appendChild(downBtn);
    actions.appendChild(delBtn);
    hdr.appendChild(actions);

    hdr.onclick = () => {
      if (expanded) this._expandedBlocks.delete(index);
      else this._expandedBlocks.add(index);
      this.renderLeft();
    };
    wrap.appendChild(hdr);

    if (!expanded) return wrap;

    // Body - block-specific fields
    const body = el('div');
    body.style.cssText = 'padding:10px;background:#fff;';

    if (block.type === 'title') {
      body.appendChild(this._selectField('Title Level', `_b${index}_level`, block.level || 'h2', { h1: 'H1', h2: 'H2', h3: 'H3', h4: 'H4', h5: 'H5', h6: 'H6' }, (v) => { block.level = v; }));
      body.appendChild(this._textField('Title Text', `_b${index}_content`, block.content, 'Enter title...', (v) => { block.content = v; }));
      body.appendChild(this._textField('Link URL', `_b${index}_link_url`, block.link_url || '', 'https://... (optional)', (v) => { block.link_url = v; }));
      body.appendChild(this._selectField('Link Target', `_b${index}_link_target`, block.link_target || '', { '': 'Same Tab', _blank: 'New Tab' }, (v) => { block.link_target = v; }));
      body.appendChild(this._selectField('Font Size', `_b${index}_fs`, toShorthand('font_size', block.style.font_size), FONT_SIZES, (v) => { block.style.font_size = toCSS('font_size', v); }));
      body.appendChild(this._selectField('Font Weight', `_b${index}_fw`, block.style.font_weight || 'normal', FONT_WEIGHTS, (v) => { block.style.font_weight = v; }));
      body.appendChild(this._colorField('Color', `_b${index}_color`, block.style.color || '#000000', (v) => { block.style.color = v; }));
      body.appendChild(this._selectField('Text Align', `_b${index}_ta`, block.style.text_align || 'left', { left: 'Left', center: 'Center', right: 'Right', justify: 'Justify' }, (v) => { block.style.text_align = v; }));
      body.appendChild(this._selectField('Letter Spacing', `_b${index}_ls`, toShorthand('letter_spacing', block.style.letter_spacing), LETTER_SPACINGS, (v) => { block.style.letter_spacing = toCSS('letter_spacing', v); }));
      body.appendChild(this._selectField('Text Transform', `_b${index}_tt`, block.style.text_transform || '', { '': 'None', uppercase: 'Uppercase', lowercase: 'Lowercase', capitalize: 'Capitalize' }, (v) => { block.style.text_transform = v; }));
      body.appendChild(this._selectField('Margin Bottom', `_b${index}_mb`, toShorthand('margin_bottom', block.style.margin_bottom), SPACINGS, (v) => { block.style.margin_bottom = toCSS('margin_bottom', v); }));
    }

    if (block.type === 'paragraph') {
      // Textarea for paragraph content
      const taWrap = el('div');
      taWrap.style.cssText = 'margin-bottom:10px;';

      // Label row with "Add Hyperlink" button
      const labelRow = el('div');
      labelRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;';
      const labelText = el('span');
      labelText.style.cssText = 'font-size:11px;color:#6b7280;';
      labelText.textContent = 'Paragraph Text';
      labelRow.appendChild(labelText);
      const linkBtn = el('button');
      linkBtn.type = 'button';
      linkBtn.textContent = '+ Add Hyperlink';
      linkBtn.style.cssText = 'font-size:10px;padding:2px 8px;border:1px solid #d1d5db;border-radius:4px;background:#f9fafb;cursor:pointer;color:#3b82f6;';
      linkBtn.onclick = () => this._showLinkModal(ta, block);
      labelRow.appendChild(linkBtn);
      taWrap.appendChild(labelRow);

      const ta = el('textarea');
      ta.value = block.content || '';
      ta.placeholder = 'Enter your paragraph text... Use [text](url) for inline links.';
      ta.style.cssText = 'width:100%;padding:6px 8px;border:1px solid #d1d5db;border-radius:4px;font-size:12px;min-height:80px;resize:vertical;font-family:inherit;';
      ta.oninput = () => { block.content = ta.value; this.sync(); };
      taWrap.appendChild(ta);
      body.appendChild(taWrap);

      body.appendChild(this._selectField('Font Size', `_b${index}_fs`, toShorthand('font_size', block.style.font_size), FONT_SIZES, (v) => { block.style.font_size = toCSS('font_size', v); }));
      body.appendChild(this._selectField('Line Height', `_b${index}_lh`, toShorthand('line_height', block.style.line_height), LINE_HEIGHTS, (v) => { block.style.line_height = toCSS('line_height', v); }));
      body.appendChild(this._selectField('Text Align', `_b${index}_ta`, block.style.text_align || 'left', { left: 'Left', center: 'Center', right: 'Right', justify: 'Justify' }, (v) => { block.style.text_align = v; }));
      body.appendChild(this._selectField('Letter Spacing', `_b${index}_ls`, toShorthand('letter_spacing', block.style.letter_spacing), LETTER_SPACINGS, (v) => { block.style.letter_spacing = toCSS('letter_spacing', v); }));
      body.appendChild(this._selectField('Text Transform', `_b${index}_tt`, block.style.text_transform || '', { '': 'None', uppercase: 'Uppercase', lowercase: 'Lowercase', capitalize: 'Capitalize' }, (v) => { block.style.text_transform = v; }));
      body.appendChild(this._colorField('Color', `_b${index}_color`, block.style.color || '#333333', (v) => { block.style.color = v; }));
      body.appendChild(this._selectField('Padding', `_b${index}_pad`, toShorthand('padding', block.style.padding), SPACINGS, (v) => { block.style.padding = toCSS('padding', v); }));
      body.appendChild(this._selectField('Margin Bottom', `_b${index}_mb`, toShorthand('margin_bottom', block.style.margin_bottom), SPACINGS, (v) => { block.style.margin_bottom = toCSS('margin_bottom', v); }));
    }

    if (block.type === 'image') {
      body.appendChild(this._textField('Image URL', `_b${index}_url`, block.url || '', 'https://...', (v) => { block.url = v; }, 'text'));

      // File upload
      const upWrap = el('div');
      upWrap.style.cssText = 'margin-bottom:10px;';
      upWrap.innerHTML = `<label style="display:block;font-size:11px;color:#6b7280;margin-bottom:3px;">Or Upload Image</label>`;
      const fileInput = el('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.cssText = 'font-size:12px;';
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { block.url = reader.result; this.sync(); this.renderLeft(); };
        reader.readAsDataURL(file);
      };
      upWrap.appendChild(fileInput);
      body.appendChild(upWrap);

      body.appendChild(this._textField('Alt Text', `_b${index}_alt`, block.alt || '', 'Image description', (v) => { block.alt = v; }));
      body.appendChild(this._selectField('Width', `_b${index}_w`, toShorthand('width', block.style.width), WIDTHS, (v) => { block.style.width = toCSS('width', v); }));
      body.appendChild(this._selectField('Text Align', `_b${index}_ta`, block.style.text_align || 'center', { left: 'Left', center: 'Center', right: 'Right' }, (v) => { block.style.text_align = v; }));
      body.appendChild(this._selectField('Margin Bottom', `_b${index}_mb`, toShorthand('margin_bottom', block.style.margin_bottom), SPACINGS, (v) => { block.style.margin_bottom = toCSS('margin_bottom', v); }));
    }

    if (block.type === 'divider') {
      body.appendChild(this._selectField('Border Style', `_b${index}_bs`, block.style.border_style || 'solid', { solid: 'Solid', dashed: 'Dashed', dotted: 'Dotted' }, (v) => { block.style.border_style = v; }));
      body.appendChild(this._colorField('Border Color', `_b${index}_bc`, block.style.border_color || '#cccccc', (v) => { block.style.border_color = v; }));
      body.appendChild(this._selectField('Border Width', `_b${index}_bw`, toShorthand('border_width', block.style.border_width), BORDER_WIDTHS, (v) => { block.style.border_width = toCSS('border_width', v); }));
      body.appendChild(this._selectField('Margin Top', `_b${index}_mt`, toShorthand('margin_top', block.style.margin_top), SPACINGS, (v) => { block.style.margin_top = toCSS('margin_top', v); }));
      body.appendChild(this._selectField('Margin Bottom', `_b${index}_mb`, toShorthand('margin_bottom', block.style.margin_bottom), SPACINGS, (v) => { block.style.margin_bottom = toCSS('margin_bottom', v); }));
      body.appendChild(this._selectField('Width', `_b${index}_w`, toShorthand('width', block.style.width), WIDTHS, (v) => { block.style.width = toCSS('width', v); }));
    }

    wrap.appendChild(body);
    return wrap;
  }

  // ---- MIDDLE PANEL (Layout Order) ----
  renderMiddle() {
    this.midPanel.innerHTML = '';
    const hdr = el('div');
    hdr.style.cssText = 'font-weight:600;font-size:13px;margin-bottom:10px;color:#374151;';
    hdr.textContent = 'Layout Order';
    this.midPanel.appendChild(hdr);

    this.state.blocks.forEach((block, i) => {
      const item = el('div');
      item.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;background:#fff;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:6px;cursor:grab;font-size:12px;';
      item.draggable = true;

      const num = el('span');
      num.style.cssText = 'width:22px;height:22px;background:#e5e7eb;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#374151;flex-shrink:0;';
      num.textContent = i + 1;

      const icon = el('span');
      icon.style.cssText = 'width:22px;height:22px;background:#3b82f6;color:#fff;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;';
      icon.textContent = BLOCK_ICONS[block.type] || '?';

      const label = el('span');
      label.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#374151;';
      label.textContent = block.content ? String(block.content).substring(0, 25) + (block.content.length > 25 ? '...' : '') : (block.type === 'image' ? '\uD83D\uDCF7 Image' : block.type === 'divider' ? '\u2015 Divider' : '');

      const del = el('span');
      del.textContent = '\u00D7';
      del.style.cssText = 'cursor:pointer;color:#ef4444;font-size:16px;font-weight:700;flex-shrink:0;';
      del.onclick = () => this.removeBlock(i);

      item.appendChild(num);
      item.appendChild(icon);
      item.appendChild(label);
      item.appendChild(del);

      // Drag & drop
      item.ondragstart = (e) => { this._dragIndex = i; item.style.opacity = '0.4'; e.dataTransfer.effectAllowed = 'move'; };
      item.ondragend = () => { this._dragIndex = null; item.style.opacity = '1'; };
      item.ondragover = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; item.style.borderColor = '#3b82f6'; };
      item.ondragleave = () => { item.style.borderColor = '#e5e7eb'; };
      item.ondrop = (e) => {
        e.preventDefault();
        item.style.borderColor = '#e5e7eb';
        if (this._dragIndex !== null && this._dragIndex !== i) {
          const moved = this.state.blocks.splice(this._dragIndex, 1)[0];
          this.state.blocks.splice(i, 0, moved);
          this.sync();
          this.renderMiddle();
          this.renderLeft();
        }
      };

      this.midPanel.appendChild(item);
    });

    if (this.state.blocks.length === 0) {
      const empty = el('div');
      empty.style.cssText = 'text-align:center;color:#9ca3af;padding:30px 10px;font-style:italic;font-size:12px;';
      empty.textContent = 'No blocks yet.';
      this.midPanel.appendChild(empty);
    }
  }

  // ---- RIGHT PANEL (Preview) ----
  renderRight() {
    this.rightPanel.innerHTML = '';
    const hdr = el('div');
    hdr.style.cssText = 'font-weight:600;font-size:13px;margin-bottom:10px;color:#374151;display:flex;align-items:center;gap:6px;';
    hdr.innerHTML = '<span>\uD83D\uDC41</span> Live Preview';
    this.rightPanel.appendChild(hdr);

    const preview = el('div');
    preview.style.cssText = 'background:#fff;border-radius:8px;padding:0;min-height:200px;box-shadow:0 1px 3px rgba(0,0,0,0.1);overflow:hidden;';
    preview.innerHTML = this._generateHTML();
    this.rightPanel.appendChild(preview);
  }

  // ---- BLOCK OPERATIONS ----
  addBlock(type) {
    const block = defaultBlock(type);
    this.state.blocks.push(block);
    this._expandedBlocks.add(this.state.blocks.length - 1);
    this.sync();
    this.renderLeft();
    this.renderMiddle();
  }

  removeBlock(index) {
    this.state.blocks.splice(index, 1);
    // Re-index expanded set
    const newExpanded = new Set();
    this._expandedBlocks.forEach(i => {
      if (i < index) newExpanded.add(i);
      else if (i > index) newExpanded.add(i - 1);
    });
    this._expandedBlocks = newExpanded;
    this.sync();
    this.renderLeft();
    this.renderMiddle();
  }

  duplicateBlock(index) {
    const clone = JSON.parse(JSON.stringify(this.state.blocks[index]));
    this.state.blocks.splice(index + 1, 0, clone);
    this._expandedBlocks.add(index + 1);
    this.sync();
    this.renderLeft();
    this.renderMiddle();
  }

  moveBlock(from, to) {
    if (to < 0 || to >= this.state.blocks.length) return;
    const block = this.state.blocks.splice(from, 1)[0];
    this.state.blocks.splice(to, 0, block);
    this.sync();
    this.renderLeft();
    this.renderMiddle();
  }

  // ---- SYNC ----
  sync() {
    const json = JSON.stringify(this.state, null, 2);
    if (this.textarea) this.textarea.value = json;
    this.renderRight();
    this.renderMiddle();
  }

  // ---- HTML GENERATION ----
  _generateHTML() {
    const gs = this.state.general_style;
    const css = buildCSS(gs);
    const tag = gs.wrapper_tag || 'div';
    const fontFamily = gs.font_family === '__custom__' ? gs.font_family_custom : gs.font_family;

    let html = `<${tag} style="${css}">`;

    const inherited = {};
    if (fontFamily) inherited.font_family_custom = fontFamily;
    if (gs.font_size) inherited.font_size = gs.font_size;
    if (gs.text_color) inherited.color = gs.text_color;

    this.state.blocks.forEach(block => {
      const merged = { ...inherited, ...(block.style || {}) };
      const bcss = buildCSS(merged);

      switch (block.type) {
        case 'title': {
          const lvl = block.level || 'h2';
          // Inline links [text](url) take priority; fall back to block-level link_url
          let inner = parseInlineLinks(block.content || '');
          if (!inner.includes('<a ') && block.link_url) inner = `<a href="${escAttr(block.link_url)}"${block.link_target ? ` target="${escAttr(block.link_target)}"` : ''} style="color:inherit;text-decoration:none;">${esc(block.content || '')}</a>`;
          html += `<${lvl} style="${bcss}">${inner}</${lvl}>`;
          break;
        }
        case 'paragraph': {
          // Inline links [text](url) take priority; fall back to block-level link_url
          let content = parseInlineLinks(block.content || '').replace(/\n/g, '<br>');
          if (!content.includes('<a ') && block.link_url) content = `<a href="${escAttr(block.link_url)}" style="color:inherit;text-decoration:none;">${esc(block.content || '').replace(/\n/g, '<br>')}</a>`;
          html += `<p style="${bcss}">${content}</p>`;
          break;
        }
        case 'image':
          if (block.url) html += `<img src="${escAttr(block.url)}" alt="${escAttr(block.alt || '')}" style="${bcss} max-width:100%;height:auto;" />`;
          break;
        case 'divider':
          html += `<hr style="${bcss} border:none;border-top:${block.style.border_width || '1px'} ${block.style.border_style || 'solid'} ${block.style.border_color || '#cccccc'};width:${block.style.width || '100%'};" />`;
          break;
      }
    });

    html += `</${tag}>`;
    return html;
  }

  // ---- FORM FIELD HELPERS ----
  _colorField(label, key, value, onChange, btnLabel, btnAction) {
    const wrap = el('div');
    wrap.style.cssText = 'margin-bottom:10px;';
    wrap.innerHTML = `<label style="display:block;font-size:11px;color:#6b7280;margin-bottom:3px;">${label}</label>`;
    const row = el('div');
    row.style.cssText = 'display:flex;gap:6px;align-items:center;';
    const picker = el('input');
    picker.type = 'color';
    picker.value = value || '#000000';
    picker.style.cssText = 'width:32px;height:28px;border:1px solid #d1d5db;border-radius:4px;cursor:pointer;padding:0;';
    const text = el('input');
    text.type = 'text';
    text.value = value || '';
    text.style.cssText = 'flex:1;padding:5px 8px;border:1px solid #d1d5db;border-radius:4px;font-size:12px;font-family:monospace;';

    const update = (v) => {
      picker.value = v || '#000000';
      text.value = v;
      if (onChange) {
        onChange(v);
        this.sync();
      } else {
        this.state.general_style[key] = v;
        this.sync();
      }
    };
    picker.oninput = () => update(picker.value);
    text.oninput = () => update(text.value);

    row.appendChild(picker);
    row.appendChild(text);
    wrap.appendChild(row);
    if (btnLabel && btnAction) {
      const btn = el('button');
      btn.textContent = btnLabel;
      btn.style.cssText = 'margin-top:4px;padding:3px 10px;border:1px solid #d1d5db;border-radius:4px;background:#f9fafb;cursor:pointer;font-size:11px;color:#374151;';
      btn.onclick = () => { btnAction(); this.sync(); this.renderLeft(); this.renderMiddle(); };
      wrap.appendChild(btn);
    }
    return wrap;
  }

  _selectField(label, key, value, options, onChange, btnLabel, btnAction) {
    const wrap = el('div');
    wrap.style.cssText = 'margin-bottom:10px;';
    wrap.innerHTML = `<label style="display:block;font-size:11px;color:#6b7280;margin-bottom:3px;">${label}</label>`;
    const sel = el('select');
    sel.style.cssText = 'width:100%;padding:5px 8px;border:1px solid #d1d5db;border-radius:4px;font-size:12px;';
    Object.entries(options).forEach(([val, opt]) => {
      const o = document.createElement('option');
      o.value = val;
      // Support both { l, c } objects and plain strings
      o.textContent = (opt && opt.l) ? opt.l : opt;
      if (String(val) === String(value)) o.selected = true;
      sel.appendChild(o);
    });
    sel.onchange = () => {
      if (onChange) {
        onChange(sel.value);
        this.sync();
      } else {
        this.state.general_style[key] = sel.value;
        this.sync();
      }
    };
    wrap.appendChild(sel);
    if (btnLabel && btnAction) {
      const btn = el('button');
      btn.textContent = btnLabel;
      btn.style.cssText = 'margin-top:4px;padding:3px 10px;border:1px solid #d1d5db;border-radius:4px;background:#f9fafb;cursor:pointer;font-size:11px;color:#374151;';
      btn.onclick = () => { btnAction(); this.sync(); this.renderLeft(); this.renderMiddle(); };
      wrap.appendChild(btn);
    }
    return wrap;
  }

  _textField(label, key, value, placeholder, onChange, type) {
    const wrap = el('div');
    wrap.style.cssText = 'margin-bottom:10px;';
    wrap.innerHTML = `<label style="display:block;font-size:11px;color:#6b7280;margin-bottom:3px;">${label}</label>`;
    const input = el('input');
    input.type = type || 'text';
    input.value = value || '';
    input.placeholder = placeholder || '';
    input.style.cssText = 'width:100%;padding:5px 8px;border:1px solid #d1d5db;border-radius:4px;font-size:12px;';
    input.oninput = () => {
      if (onChange) {
        onChange(input.value);
        this.sync();
      } else {
        this.sync();
      }
    };
    wrap.appendChild(input);
    return wrap;
  }
}

// ========================
// DOM HELPER
// ========================

function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

// ========================
// PUBLIC API
// ========================

/**
 * Initialize a full Layout Builder UI in a container, syncing JSON to a textarea.
 * @param {string|Element} container - CSS selector or DOM element for the builder UI
 * @param {string|Element} textarea - CSS selector or DOM element for JSON output textarea
 * @param {Object} [options] - { title, bootstrap }
 * @returns {LayoutBuilder} builder instance
 */
export function initLayoutBuilder(container, textarea, options = {}) {
  const c = typeof container === 'string' ? document.querySelector(container) : container;
  const t = typeof textarea === 'string' ? document.querySelector(textarea) : textarea;
  if (!c) { console.error('[LayoutBuilder] Container not found:', container); return null; }
  return new LayoutBuilder(c, t, options);
}

/**
 * Generate HTML from layout data (for rendering only, no UI)
 */
export function generateLayout(data, bootstrap = 0) {
  const gs = data.general_style || {};
  const blocks = data.blocks || [];
  const css = buildCSS(gs);
  const tag = gs.wrapper_tag || 'div';
  let html = `<${tag} style="${css}">`;
  const inherited = {};
  if (gs.font_family_custom) inherited.font_family_custom = gs.font_family_custom;
  if (gs.font_size) inherited.font_size = gs.font_size;
  if (gs.text_color) inherited.color = gs.text_color;

  blocks.forEach(block => {
    const merged = { ...inherited, ...(block.style || {}) };
    const bcss = buildCSS(merged);
    switch (block.type) {
      case 'title': {
        const lvl = block.level || 'h2';
        let inner = parseInlineLinks(block.content || '');
        if (!inner.includes('<a ') && block.link_url) inner = `<a href="${escAttr(block.link_url)}"${block.link_target ? ` target="${escAttr(block.link_target)}"` : ''} style="color:inherit;text-decoration:none;">${esc(block.content || '')}</a>`;
        html += `<${lvl} style="${bcss}">${inner}</${lvl}>\n`;
        break;
      }
      case 'paragraph': {
        let content = parseInlineLinks(block.content || '').replace(/\n/g, '<br>');
        if (!content.includes('<a ') && block.link_url) content = `<a href="${escAttr(block.link_url)}" style="color:inherit;text-decoration:none;">${esc(block.content || '').replace(/\n/g, '<br>')}</a>`;
        html += `<p style="${bcss}">${content}</p>\n`;
        break;
      }
      case 'image':
        if (block.url) html += `<img src="${escAttr(block.url)}" alt="${escAttr(block.alt || '')}" style="${bcss} max-width:100%;height:auto;" />\n`;
        break;
      case 'divider':
        html += `<hr style="${bcss} border:none;border-top:${block.style.border_width || '1px'} ${block.style.border_style || 'solid'} ${block.style.border_color || '#cccccc'};width:${block.style.width || '100%'};" />\n`;
        break;
    }
  });
  html += `</${tag}>`;
  return html;
}

/**
 * Generate full standalone HTML page (wkhtml-style)
 */
export function generateFullHTML(data, options = {}) {
  const inner = generateLayout(data);
  const title = options.title || 'Article';
  return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${esc(title)}</title>\n  <style>\n    * { margin: 0; padding: 0; box-sizing: border-box; }\n    body { background: #f0f0f0; }\n    img { max-width: 100%; height: auto; }\n    a { color: inherit; text-decoration: none; }\n  </style>\n</head>\n<body>\n${inner}\n</body>\n</html>`;
}
