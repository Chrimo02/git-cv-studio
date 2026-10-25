// Shared Git-Graph Topology & CV HTML Renderer (works identically in Safari, Firefox, Chrome & Node.js)

export const DEFAULT_COLORS = {
  main: '#3b82f6',
  job: '#10b981',
  edu: '#8b5cf6',
  cert: '#f59e0b',
  other: '#ec4899',
};

export const FONT_FAMILIES = {
  // --- Modern Sans-Serif ---
  inter: {
    id: 'inter',
    category: 'Modern Sans-Serif',
    label: 'Inter (Modern Sans — Tech Standard)',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  system: {
    id: 'system',
    category: 'Modern Sans-Serif',
    label: 'System Native (SF Pro / Segoe UI / Apple)',
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  roboto: {
    id: 'roboto',
    category: 'Modern Sans-Serif',
    label: 'Roboto (Neutral Sans — Clean & Corporate)',
    body: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    heading: '"Roboto", "Helvetica Neue", Arial, sans-serif',
  },
  helvetica: {
    id: 'helvetica',
    category: 'Modern Sans-Serif',
    label: 'Helvetica Neue (Swiss Modernism — Timeless)',
    body: '"Helvetica Neue", Helvetica, Arial, -apple-system, sans-serif',
    heading: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  avenir: {
    id: 'avenir',
    category: 'Modern Sans-Serif',
    label: 'Avenir Next (Geometric Modern — Tech & Product)',
    body: '"Avenir Next", Avenir, "Century Gothic", -apple-system, sans-serif',
    heading: '"Avenir Next", Avenir, "Century Gothic", sans-serif',
  },
  futura: {
    id: 'futura',
    category: 'Modern Sans-Serif',
    label: 'Futura (Bauhaus Geometric — Clean & Striking)',
    body: '"Futura", "Century Gothic", -apple-system, sans-serif',
    heading: '"Futura", "Century Gothic", sans-serif',
  },
  trebuchet: {
    id: 'trebuchet',
    category: 'Modern Sans-Serif',
    label: 'Trebuchet MS (Humanist Sans — Warm & Clear)',
    body: '"Trebuchet MS", "Lucida Grande", "Lucida Sans Unicode", sans-serif',
    heading: '"Trebuchet MS", "Lucida Grande", sans-serif',
  },
  gill: {
    id: 'gill',
    category: 'Modern Sans-Serif',
    label: 'Gill Sans (British Modernist — Balanced & Classic)',
    body: '"Gill Sans", "Gill Sans MT", Calibri, sans-serif',
    heading: '"Gill Sans", "Gill Sans MT", sans-serif',
  },
  verdana: {
    id: 'verdana',
    category: 'Modern Sans-Serif',
    label: 'Verdana (Screen Legibility — Open & Crisp)',
    body: '"Verdana", Geneva, -apple-system, sans-serif',
    heading: '"Verdana", Geneva, sans-serif',
  },
  optima: {
    id: 'optima',
    category: 'Modern Sans-Serif',
    label: 'Optima (Humanist Hybrid — Executive Grace)',
    body: '"Optima", Candara, "Segoe UI", sans-serif',
    heading: '"Optima", Candara, sans-serif',
  },

  // --- Editorial & Classic Serif ---
  fraunces: {
    id: 'fraunces',
    category: 'Editorial & Classic Serif',
    label: 'Fraunces (Editorial Serif — Elegant & Warm)',
    body: '"Fraunces", Georgia, "Times New Roman", serif',
    heading: '"Fraunces", Georgia, serif',
  },
  georgia: {
    id: 'georgia',
    category: 'Editorial & Classic Serif',
    label: 'Georgia (Classic Editorial — Balanced & Literary)',
    body: '"Georgia", "Times New Roman", serif',
    heading: '"Georgia", serif',
  },
  garamond: {
    id: 'garamond',
    category: 'Editorial & Classic Serif',
    label: 'EB Garamond (Prestigious Serif — Academic Standard)',
    body: '"EB Garamond", Garamond, "Baskerville", "Times New Roman", serif',
    heading: '"EB Garamond", Garamond, serif',
  },
  merriweather: {
    id: 'merriweather',
    category: 'Editorial & Classic Serif',
    label: 'Merriweather (Book Serif — Sturdy & Formal)',
    body: '"Merriweather", Georgia, "Times New Roman", serif',
    heading: '"Merriweather", Georgia, serif',
  },
  palatino: {
    id: 'palatino',
    category: 'Editorial & Classic Serif',
    label: 'Palatino Linotype (Book Antiqua — Renaissance Style)',
    body: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
    heading: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
  },
  charter: {
    id: 'charter',
    category: 'Editorial & Classic Serif',
    label: 'Charter (Bitstream Charter — Sharp & Authoritative)',
    body: '"Charter", "Bitstream Charter", Georgia, serif',
    heading: '"Charter", "Bitstream Charter", Georgia, serif',
  },
  didot: {
    id: 'didot',
    category: 'Editorial & Classic Serif',
    label: 'Didot / Bodoni (High-Fashion — Luxury Contrast)',
    body: '"Didot", "Bodoni MT", "Times New Roman", serif',
    heading: '"Didot", "Bodoni MT", serif',
  },
  baskerville: {
    id: 'baskerville',
    category: 'Editorial & Classic Serif',
    label: 'Baskerville (Traditional British Serif — Refined)',
    body: '"Baskerville", "Baskerville Old Face", "Hoefler Text", Garamond, serif',
    heading: '"Baskerville", "Hoefler Text", serif',
  },

  // --- Developer & Monospace ---
  mono: {
    id: 'mono',
    category: 'Developer & Monospace',
    label: 'JetBrains Mono (Developer Mode — Full Code Style)',
    body: '"JetBrains Mono", Menlo, Monaco, Consolas, monospace',
    heading: '"JetBrains Mono", monospace',
  },
  fira: {
    id: 'fira',
    category: 'Developer & Monospace',
    label: 'Fira Code (Modern Tech Mono — Clean Code)',
    body: '"Fira Code", "Fira Mono", "Menlo", Monaco, monospace',
    heading: '"Fira Code", "Fira Mono", monospace',
  },
  courier: {
    id: 'courier',
    category: 'Developer & Monospace',
    label: 'Courier Prime (Typewriter Monospace — Engineering)',
    body: '"Courier New", Courier, monospace',
    heading: '"Courier New", Courier, monospace',
  },
  vt323: {
    id: 'vt323',
    category: 'Developer & Monospace',
    label: 'VT323 (8-Bit Retro Terminal — Hacker Vibe)',
    body: '"VT323", monospace',
    heading: '"VT323", monospace',
  },
};

export const CONTACT_ICONS = {
  loc: `<svg class="cv-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  mail: `<svg class="cv-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
  tel: `<svg class="cv-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
  web: `<svg class="cv-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  git: `<svg class="cv-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
  in: `<svg class="cv-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
  link: `<svg class="cv-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
};

export function isDarkHexColor(hex) {
  if (!hex || typeof hex !== 'string') return false;
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 3 && clean.length !== 6) return false;
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.52;
}

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function cleanUrlDisplay(url) {
  if (!url) return '';
  return String(url).replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

export function isOngoingDate(dstr) {
  if (!dstr) return true;
  const lower = String(dstr).trim().toLowerCase();
  return (
    lower === '' ||
    lower === 'present' ||
    lower === 'current' ||
    lower === 'ongoing' ||
    lower === 'heute' ||
    lower === 'aktiv' ||
    lower === 'aktuell' ||
    lower === 'now'
  );
}

const MONTH_MAP = {
  jan: 0, january: 0, januar: 0,
  feb: 1, february: 1, februar: 1,
  mar: 2, march: 2, mär: 2, maerz: 2, märz: 2, mrz: 2,
  apr: 3, april: 3,
  may: 4, mai: 4,
  jun: 5, june: 5, juni: 5,
  jul: 6, july: 6, juli: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9, okt: 9, oktober: 9,
  nov: 10, november: 10,
  dec: 11, december: 11, dez: 11, dezember: 11,
};

/**
 * Cross-browser deterministic date parser (fixes Safari/WebKit returning Invalid Date for "Jul 2023")
 */
export function parseDate(dstr) {
  if (!dstr || isOngoingDate(dstr)) return new Date(2099, 0, 1);
  const raw = String(dstr).trim();

  // 1. Match "Month YYYY" or "Month. YYYY" (e.g. "Aug 2025", "Okt. 2026", "September 2022")
  const monthYearMatch = raw.match(/^([a-zA-ZäöüÄÖÜ]+)\.?\s+(\d{4})$/);
  if (monthYearMatch) {
    const mKey = monthYearMatch[1].toLowerCase();
    const year = parseInt(monthYearMatch[2], 10);
    const monthIdx = MONTH_MAP[mKey] ?? MONTH_MAP[mKey.slice(0, 3)];
    if (monthIdx !== undefined && !isNaN(year)) {
      return new Date(year, monthIdx, 1, 12, 0, 0);
    }
  }

  // 2. Match "YYYY-MM" or "YYYY-MM-DD"
  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const monthIdx = parseInt(isoMatch[2], 10) - 1;
    const day = isoMatch[3] ? parseInt(isoMatch[3], 10) : 1;
    return new Date(year, monthIdx, day, 12, 0, 0);
  }

  // 3. Match "MM/YYYY" or "MM.YYYY"
  const slashMatch = raw.match(/^(\d{1,2})[./](\d{4})$/);
  if (slashMatch) {
    const monthIdx = parseInt(slashMatch[1], 10) - 1;
    const year = parseInt(slashMatch[2], 10);
    return new Date(year, monthIdx, 1, 12, 0, 0);
  }

  // 4. Match plain year "YYYY"
  const yearOnlyMatch = raw.match(/^(\d{4})$/);
  if (yearOnlyMatch) {
    return new Date(parseInt(yearOnlyMatch[1], 10), 0, 1, 12, 0, 0);
  }

  // Fallback to native Date
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function formatShortDate(date, locale = 'en-US') {
  try {
    return date.toLocaleDateString(locale || 'en-US', { month: 'short', year: 'numeric' });
  } catch {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}

export function computeGitGraph(profile) {
  const layout = profile?.layout || {};
  const colors = { ...DEFAULT_COLORS, ...(layout.colors || {}) };
  const enabledEntries = (profile?.entries || []).filter((e) => e && e.enabled !== false);

  // Map enabled entry IDs so disabled parent branches fall back gracefully to their ancestor or 'main'
  const allEntriesById = new Map();
  (profile?.entries || []).forEach((e) => {
    if (e && e.id) allEntriesById.set(e.id, e);
  });

  const enabledById = new Map();
  enabledEntries.forEach((e) => {
    enabledById.set(e.id, e);
  });

  const resolveParent = (parentId) => {
    let curr = parentId || 'main';
    const visited = new Set();
    while (curr && curr !== 'main') {
      if (visited.has(curr)) return 'main';
      visited.add(curr);
      if (enabledById.has(curr)) return curr;
      const foundKey = Array.from(enabledById.keys()).find(
        (k) => k.toLowerCase() === String(curr).toLowerCase()
      );
      if (foundKey) return foundKey;
      // If parent exists in allEntriesById but is disabled, walk up to its parent!
      const disabledParent =
        allEntriesById.get(curr) ||
        Array.from(allEntriesById.values()).find(
          (e) => e.id.toLowerCase() === String(curr).toLowerCase()
        );
      if (disabledParent && disabledParent.parent) {
        curr = disabledParent.parent;
      } else {
        curr = 'main';
      }
    }
    return 'main';
  };

  const globalShowStart = layout.showStartNodes !== false;
  const rawCommits = [];
  // Fixed timestamp for ongoing commits so all ongoing items sort deterministically by priority
  const ongoingTimestamp = new Date(2099, 11, 31, 12, 0, 0);

  enabledEntries.forEach((entry) => {
    const prio = Number(entry.priority) || 0;
    const parent = resolveParent(entry.parent);
    const cat = entry.category || 'job';
    const isCert = cat === 'cert';
    const showStart = !isCert && globalShowStart && entry.showStartNode !== false;
    const entryOrder = (profile.entries || []).indexOf(entry);

    if (isCert) {
      rawCommits.push({
        id: entry.id,
        type: 'point',
        date: parseDate(entry.startDate),
        parent,
        entry,
        category: cat,
        priority: prio,
        entryOrder,
      });
    } else if (!showStart) {
      const ongoing = isOngoingDate(entry.endDate);
      rawCommits.push({
        id: entry.id,
        type: ongoing ? 'ongoing' : 'point',
        date: ongoing ? ongoingTimestamp : parseDate(entry.endDate),
        parent,
        entry,
        category: cat,
        priority: prio,
        entryOrder,
        singleCommitMode: true,
      });
    } else {
      const ongoing = isOngoingDate(entry.endDate);
      if (ongoing) {
        rawCommits.push({
          id: entry.id,
          type: 'ongoing',
          date: ongoingTimestamp,
          parent,
          entry,
          category: cat,
          priority: prio,
          entryOrder,
        });
      } else {
        rawCommits.push({
          id: entry.id,
          type: 'end',
          date: parseDate(entry.endDate),
          parent,
          entry,
          category: cat,
          priority: prio,
          entryOrder,
        });
      }
      rawCommits.push({
        id: entry.id,
        type: 'start',
        date: parseDate(entry.startDate),
        parent,
        entry,
        category: cat,
        priority: prio,
        entryOrder,
      });
    }
  });

  const parentMap = {};
  rawCommits.forEach((c) => {
    if (c.parent) parentMap[c.id] = c.parent;
  });

  const isAncestor = (childParent, ancestorId) => {
    let curr = childParent;
    const seen = new Set();
    while (curr && curr !== 'main') {
      if (seen.has(curr)) return false;
      seen.add(curr);
      if (curr === ancestorId) return true;
      curr = parentMap[curr];
    }
    return false;
  };

  // Sort ASCENDING (Oldest first) to build graph topology
  rawCommits.sort((a, b) => {
    // 1. If start commits, ancestor branch starts before descendant branch
    if (a.type === 'start' && b.type === 'start') {
      if (isAncestor(b.parent, a.id)) return -1;
      if (isAncestor(a.parent, b.id)) return 1;
    }
    // 2. An entry start node must always be processed before its own end/ongoing card in ascending pass
    if (a.id === b.id) {
      if (a.type === 'start') return -1;
      if (b.type === 'start') return 1;
    }
    // 3. For card commits (end, ongoing, point):
    // In manual sort mode (default) or when dates match, user-defined list order determines position!
    if (a.type !== 'start' && b.type !== 'start') {
      const diff = a.date.valueOf() - b.date.valueOf();
      if (diff === 0 || layout.manualSort !== false) {
        const orderDiff = (b.entryOrder ?? 0) - (a.entryOrder ?? 0);
        if (orderDiff !== 0) return orderDiff;
      }
    }
    // 4. Default / fallback date comparison
    const diff = a.date.valueOf() - b.date.valueOf();
    if (diff !== 0) return diff;
    if (a.type === 'start' && b.type !== 'start') return -1;
    if (a.type !== 'start' && b.type === 'start') return 1;
    const orderDiff = (b.entryOrder ?? 0) - (a.entryOrder ?? 0);
    if (orderDiff !== 0) return orderDiff;
    const prioDiff = (a.priority || 0) - (b.priority || 0);
    if (prioDiff !== 0) return prioDiff;
    return 0;
  });

  let activeBranches = ['main'];
  let freeCols = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const branchCols = { main: 0 };
  const processedCommits = [];

  rawCommits.forEach((c) => {
    let col = branchCols[c.id];
    const parentCol = branchCols[c.parent] ?? 0;
    const before = [...activeBranches];

    if (c.type === 'start') {
      col = freeCols.shift() || 1;
      branchCols[c.id] = col;
      activeBranches.push(c.id);
    } else if (c.type === 'end') {
      activeBranches = activeBranches.filter((b) => b !== c.id);
      if (col !== undefined) {
        freeCols.unshift(col);
        freeCols.sort((a, b) => a - b);
      } else {
        col = parentCol;
      }
    } else if (c.type === 'ongoing') {
      if (c.singleCommitMode) {
        col = parentCol;
      } else if (col === undefined) {
        col = branchCols[c.id] = freeCols.shift() || 1;
        activeBranches.push(c.id);
      }
    } else if (c.type === 'point') {
      col = parentCol;
    }

    const after = [...activeBranches];

    processedCommits.push({
      ...c,
      col,
      parentCol,
      activeBefore: before,
      activeAfter: after,
    });
  });

  // Reverse to DESCENDING (Newest on top)
  processedCommits.reverse();

  const branchColors = { main: colors.main };
  rawCommits.forEach((c) => {
    branchColors[c.id] = colors[c.category] || colors.main;
  });

  return {
    colors,
    activeBranches,
    branchCols,
    branchColors,
    processedCommits,
  };
}

export function renderCvBodyHtml(profile) {
  const header = profile?.header || {};
  const labels = profile?.labels || {};
  const layout = profile?.layout || {};
  const locale = labels.dateLocale || 'en-US';

  const {
    colors,
    activeBranches,
    branchCols,
    branchColors,
    processedCommits,
  } = computeGitGraph(profile);

  const COL_W = Number(layout.colWidth) || 22;
  const X_OFFSET = Number(layout.graphOffset) || 68;
  const CONTENT_INDENT = Number(layout.contentIndent) || 188;
  const NODE_R = Number(layout.nodeRadius) || 5;
  const LINE_W = Number(layout.lineWidth) || 2.5;
  const ROW_MIN_H = Number(layout.rowMinHeight) || 68;
  const START_ROW_MIN_H = Number(layout.startRowMinHeight) || 44;
  const CARD_PAD_Y = Number(layout.cardPaddingY ?? 10);
  const NODE_Y = Math.max(18, Math.round(CARD_PAD_Y + 14));

  const contactItems = [];
  const buildContact = (keyId, value, { href = '', strong = false, external = false } = {}) => {
    const iconHtml = CONTACT_ICONS[keyId] || CONTACT_ICONS.link;
    const valHtml = `<span class="cv-contact-val${strong ? ' cv-contact-strong' : ''}">${escapeHtml(value)}</span>`;
    const fullClass = keyId === 'in' ? ' cv-contact-fullwidth' : '';
    if (href) {
      const ext = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${escapeHtml(href)}"${ext} class="cv-contact-item cv-link${fullClass}">${iconHtml}${valHtml}</a>`;
    }
    return `<span class="cv-contact-item${fullClass}">${iconHtml}${valHtml}</span>`;
  };
  if (header.showLocation !== false && header.location) {
    contactItems.push(buildContact('loc', header.location));
  }
  if (header.showEmail !== false && header.email) {
    contactItems.push(buildContact('mail', header.email, { href: `mailto:${header.email}`, strong: true }));
  }
  if (header.showPhone !== false && header.phone && String(header.phone).trim() !== '') {
    contactItems.push(buildContact('tel', header.phone, { href: `tel:${header.phone}` }));
  }
  if (header.showWebsite !== false && header.website) {
    contactItems.push(buildContact('web', cleanUrlDisplay(header.website), { href: header.website, strong: true, external: true }));
  }
  if (header.showGithub !== false && header.github) {
    contactItems.push(buildContact('git', cleanUrlDisplay(header.github), { href: header.github, external: true }));
  }
  if (header.showLinkedin !== false && header.linkedin) {
    contactItems.push(buildContact('in', cleanUrlDisplay(header.linkedin), { href: header.linkedin, external: true }));
  }
  (header.customContacts || []).forEach((c) => {
    if (!c || c.enabled === false || !String(c.value || '').trim()) return;
    const iconHtml = CONTACT_ICONS.link;
    const valHtml = `<span class="cv-contact-val">${escapeHtml(c.value)}</span>`;
    const url = String(c.url || '').trim();
    contactItems.push(
      url
        ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="cv-contact-item cv-link">${iconHtml}${valHtml}</a>`
        : `<span class="cv-contact-item">${iconHtml}${valHtml}</span>`
    );
  });

  // Top active branches extension SVG
  let topExtensionHtml = '';
  if (activeBranches.length > 0) {
    const extLines = activeBranches
      .map((branchId) => {
        const bCol = branchCols[branchId] || 0;
        const bColor = branchColors[branchId] || colors.main;
        const x = bCol * COL_W + X_OFFSET;
        return `
          <line x1="${x}" y1="0" x2="${x}" y2="100%" stroke="${bColor}" stroke-width="${LINE_W}" stroke-dasharray="3 2.5" />
          <circle cx="${x}" cy="2.5" r="2.5" fill="${bColor}" />
        `;
      })
      .join('');
    topExtensionHtml = `
      <div class="cv-graph-ext">
        <svg width="100%" height="100%" class="cv-svg-block" style="overflow:visible;">
          ${extLines}
        </svg>
      </div>
    `;
  }

  // Commit rows
  const commitRowsHtml = processedCommits
    .map((c, commitIdx) => {
      const incoming = c.activeAfter;
      const outgoing = c.activeBefore;
      const commitColor = branchColors[c.id] || colors.main;
      const isStartNode = c.type === 'start';
      const entry = c.entry;
      const nodeDateText =
        c.type === 'ongoing'
          ? labels.present || 'Present'
          : formatShortDate(c.date, locale);

      const incomingBridgeSvg = incoming
        .map((branchId) => {
          const bCol = branchCols[branchId] || 0;
          const bColor = branchColors[branchId] || colors.main;
          const x = bCol * COL_W + X_OFFSET;
          return `<line x1="${x}" y1="0" x2="${x}" y2="100%" stroke="${bColor}" stroke-width="${LINE_W}" />`;
        })
        .join('');

      const outgoingBridgeSvg = outgoing
        .map((branchId) => {
          const bCol = branchCols[branchId] || 0;
          const bColor = branchColors[branchId] || colors.main;
          const x = bCol * COL_W + X_OFFSET;
          return `<line x1="${x}" y1="0" x2="${x}" y2="100%" stroke="${bColor}" stroke-width="${LINE_W}" />`;
        })
        .join('');

      // SVG pass-through lines
      const passThroughSvg = incoming
        .map((branchId) => {
          if (outgoing.includes(branchId) && branchId !== c.id) {
            const bCol = branchCols[branchId] || 0;
            const bColor = branchColors[branchId] || colors.main;
            const x = bCol * COL_W + X_OFFSET;
            return `<line x1="${x}" y1="0" x2="${x}" y2="100%" stroke="${bColor}" stroke-width="${LINE_W}" />`;
          }
          return '';
        })
        .join('');

      let eventSvg = '';
      const colX = c.col * COL_W + X_OFFSET;
      const parentX = c.parentCol * COL_W + X_OFFSET;

      if (c.type === 'end') {
        eventSvg = `
          <path d="M ${parentX} ${NODE_Y} C ${parentX} ${NODE_Y + 12}, ${colX} ${NODE_Y + 4}, ${colX} ${NODE_Y + 16}" fill="none" stroke="${commitColor}" stroke-width="${LINE_W}" />
          <line x1="${colX}" y1="${NODE_Y + 16}" x2="${colX}" y2="100%" stroke="${commitColor}" stroke-width="${LINE_W}" />
        `;
      } else if (c.type === 'start') {
        eventSvg = `
          <line x1="${colX}" y1="0" x2="${colX}" y2="${NODE_Y - 14}" stroke="${commitColor}" stroke-width="${LINE_W}" />
          <path d="M ${colX} ${NODE_Y - 14} C ${colX} ${NODE_Y - 4}, ${parentX} ${NODE_Y - 10}, ${parentX} ${NODE_Y}" fill="none" stroke="${commitColor}" stroke-width="${LINE_W}" />
        `;
      } else if (c.type === 'ongoing' && !c.singleCommitMode) {
        eventSvg = `
          <line x1="${colX}" y1="0" x2="${colX}" y2="100%" stroke="${commitColor}" stroke-width="${LINE_W}" />
          <circle cx="${colX}" cy="${NODE_Y}" r="${NODE_R + 4.5}" fill="none" stroke="${commitColor}" stroke-width="1.3" stroke-dasharray="2.5 2.5" />
        `;
      } else if (c.type === 'ongoing' && c.singleCommitMode) {
        eventSvg = `
          <circle cx="${parentX}" cy="${NODE_Y}" r="${NODE_R + 4.5}" fill="none" stroke="${commitColor}" stroke-width="1.3" stroke-dasharray="2.5 2.5" />
        `;
      }

      const isDarkDoc = Boolean(layout.darkMode);
      const nodeFillColor = isDarkDoc ? '#0f1117' : '#FFFFFF';
      const nodeCenterX = c.type === 'ongoing' && !c.singleCommitMode ? colX : parentX;
      const nodeCircleSvg = `<circle cx="${nodeCenterX}" cy="${NODE_Y}" r="${NODE_R}" fill="${nodeFillColor}" stroke="${commitColor}" stroke-width="3.2" />`;

      let rightContentHtml = '';
      if (isStartNode) {
        rightContentHtml = `
          <div class="cv-start-line">
            <span class="cv-start-date">${escapeHtml(formatShortDate(c.date, locale))}</span>
            <span class="cv-start-text">
              ${escapeHtml(labels.started || 'Started')}
              <strong class="cv-start-title">${escapeHtml(entry.title)}</strong>
              ${entry.organization ? `<span class="cv-start-org"> @ ${escapeHtml(entry.organization)}</span>` : ''}
            </span>
          </div>
        `;
      } else {
        const badgeLabel = entry.badge || entry.id;
        const isOngoingEntry = isOngoingDate(entry.endDate) && entry.category !== 'cert';
        const statusHtml = isOngoingEntry
          ? `<span class="cv-status-ongoing"><span class="cv-status-dot"></span>${escapeHtml(labels.ongoing || 'Active')}</span>`
          : `<span class="cv-status-label">${escapeHtml(c.type === 'end' ? (labels.merge || 'Merge') : (labels.commit || 'Commit'))}</span>`;

        const dateRangeText =
          entry.category === 'cert'
            ? formatShortDate(c.date, locale)
            : isOngoingEntry
              ? `${entry.startDate} — ${labels.present || 'Present'}`
              : `${entry.startDate} — ${entry.endDate}`;

        const showLogo = layout.showLogos !== false && entry.logo;
        const showDesc = layout.showDescriptions !== false && entry.showDescription !== false && entry.description;
        const showSkills = layout.showSkills !== false && entry.showSkills !== false && Array.isArray(entry.skills) && entry.skills.length > 0;

        rightContentHtml = `
          <div class="cv-card-top">
            <div class="cv-card-main">
              <div class="cv-card-meta">
                <span class="cv-branch-badge" style="color:${commitColor}; background-color:${commitColor}14; border-color:${commitColor}45;">
                  ${escapeHtml(badgeLabel)}
                </span>
                ${statusHtml}
                <span class="cv-card-daterange">${escapeHtml(dateRangeText)}</span>
              </div>
              <h3 class="cv-card-title">${escapeHtml(entry.title)}</h3>
              ${
                entry.organization
                  ? `<h4 class="cv-card-org">${escapeHtml(entry.organization)}${
                      entry.location ? `<span class="cv-card-loc"> · ${escapeHtml(entry.location)}</span>` : ''
                    }</h4>`
                  : ''
              }
            </div>
            ${
              showLogo
                ? `<div class="cv-card-logo"><img src="${escapeHtml(entry.logo)}" alt="" /></div>`
                : ''
            }
          </div>
          ${showDesc ? `<div class="cv-card-desc">${escapeHtml(entry.description)}</div>` : ''}
          ${
            entry.grade
              ? `<p class="cv-card-grade">${escapeHtml(labels.grade || 'GRADE:')} <span>${escapeHtml(entry.grade)}</span></p>`
              : ''
          }
          ${
            showSkills
              ? `<div class="cv-skills-wrap">${entry.skills
                  .map((s) => `<span class="cv-skill-tag">${escapeHtml(s)}</span>`)
                  .join('')}</div>`
              : ''
          }
          ${
            entry.url
              ? `<a href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer" class="cv-cred-link">${escapeHtml(
                  labels.credential || 'View Credential'
                )} <span>→</span></a>`
              : ''
          }
        `;
      }

      const rowMin = isStartNode ? START_ROW_MIN_H : ROW_MIN_H;
      const padY = isStartNode ? Math.max(4, Math.round(CARD_PAD_Y * 0.65)) : CARD_PAD_Y;

      return `
        ${
          commitIdx > 0
            ? `<div class="cv-page-break-top" data-commit-idx="${commitIdx}">
                <div class="cv-graph-col" style="top:0; bottom:-1px;">
                  <svg width="100%" height="100%" class="cv-svg-block">
                    ${incomingBridgeSvg}
                  </svg>
                </div>
              </div>`
            : ''
        }
        <div class="cv-commit-row" data-commit-idx="${commitIdx}" style="min-height:${rowMin}px;">
          <div class="cv-node-date" style="top:${NODE_Y - 5}px; width:${Math.max(42, X_OFFSET - 12)}px;">
            ${escapeHtml(nodeDateText)}
          </div>
          <div class="cv-graph-col">
            <svg width="100%" height="100%" class="cv-svg-block">
              ${passThroughSvg}
              ${eventSvg}
              ${nodeCircleSvg}
            </svg>
          </div>
          <div class="cv-card-col ${isStartNode ? 'cv-card-start' : 'cv-card-detail'}" style="margin-left:${CONTENT_INDENT}px; padding-top:${padY}px; padding-bottom:${padY}px;">
            ${rightContentHtml}
          </div>
        </div>
        ${
          commitIdx < processedCommits.length - 1
            ? `<div class="cv-page-break-bottom" data-commit-idx="${commitIdx}">
                <div class="cv-graph-col" style="top:-1px; bottom:0;">
                  <svg width="100%" height="100%" class="cv-svg-block">
                    ${outgoingBridgeSvg}
                  </svg>
                </div>
              </div>`
            : ''
        }
      `;
    })
    .join('');

  // Projects Section
  const enabledProjects = (profile?.projects || []).filter((p) => p && p.enabled !== false);
  let projectsSectionHtml = '';
  if (layout.showProjectsSection !== false && enabledProjects.length > 0) {
    const projectCards = enabledProjects
      .map((proj) => {
        const links = [];
        if (proj.repo) {
          links.push(
            `<a href="${escapeHtml(proj.repo)}" target="_blank" rel="noopener noreferrer" class="cv-proj-link">${escapeHtml(
              cleanUrlDisplay(proj.repo)
            )} →</a>`
          );
        }
        if (proj.demo) {
          links.push(
            `<a href="${escapeHtml(proj.demo)}" target="_blank" rel="noopener noreferrer" class="cv-proj-link">live demo →</a>`
          );
        }
        return `
          <div class="cv-card-block cv-proj-card">
            <div class="cv-proj-header">
              <div class="cv-proj-title-group">
                <h3 class="cv-proj-name">${escapeHtml(proj.name)}</h3>
                ${proj.type ? `<span class="cv-proj-type">${escapeHtml(proj.type)}</span>` : ''}
                ${proj.year ? `<span class="cv-proj-year">${escapeHtml(proj.year)}</span>` : ''}
              </div>
              <div class="cv-proj-links">${links.join('')}</div>
            </div>
            ${proj.excerpt ? `<p class="cv-proj-excerpt">${escapeHtml(proj.excerpt)}</p>` : ''}
            ${
              Array.isArray(proj.tags) && proj.tags.length > 0
                ? `<div class="cv-skills-wrap">${proj.tags
                    .map((t) => `<span class="cv-skill-tag cv-skill-tag-white">${escapeHtml(t)}</span>`)
                    .join('')}</div>`
                : ''
            }
          </div>
        `;
      })
      .join('');

    projectsSectionHtml = `
      <section class="cv-section cv-card-block">
        <div class="cv-section-header">
          <h2 class="cv-section-title">${escapeHtml(labels.projectsTitle || 'Selected Engineering Projects')}</h2>
          <p class="cv-section-cmd"><span>~</span> ${escapeHtml(labels.projectsCommand || 'git submodule status --projects')}</p>
        </div>
        <div class="cv-proj-grid">
          ${projectCards}
        </div>
      </section>
    `;
  }

  // Languages & Interests Section (each sub-block & item individually toggleable!)
  const showLangsSec = layout.showLanguagesSection !== false;
  const showIntsSec = layout.showInterestsSection !== false;
  const languages = showLangsSec
    ? (profile?.languages || []).filter((l) => l && l.enabled !== false)
    : [];
  const interests = showIntsSec
    ? (profile?.interests || []).filter((it) => it && it.enabled !== false)
    : [];

  const isDark = Boolean(layout.darkMode);
  const showHeaderBg = layout.showHeaderBg !== false;
  const showFooterBg = layout.showFooterBg !== false;
  const rawHeaderBg = layout.headerBgColor || '#f1f5f9';
  const rawFooterBg = layout.footerBgColor || '#f1f5f9';
  const effectiveHeaderBg =
    isDark && rawHeaderBg.toLowerCase() === '#f1f5f9' ? '#171c28' : rawHeaderBg;
  const effectiveFooterBg =
    isDark && rawFooterBg.toLowerCase() === '#f1f5f9' ? '#171c28' : rawFooterBg;
  const headerIsDark = showHeaderBg ? isDarkHexColor(effectiveHeaderBg) : isDark;
  const footerIsDark = showFooterBg ? isDarkHexColor(effectiveFooterBg) : isDark;

  let footerSectionHtml = '';
  if (layout.showFooterSection !== false && (languages.length > 0 || interests.length > 0)) {
    const gridClass =
      languages.length > 0 && interests.length > 0
        ? 'cv-footer-grid'
        : 'cv-footer-grid-single';

    footerSectionHtml = `
      <section class="cv-section cv-footer-section cv-card-block ${showFooterBg ? 'has-bg' : ''} ${footerIsDark ? 'theme-dark' : 'theme-light'}">
        <div class="cv-section-header">
          <h2 class="cv-section-title">${escapeHtml(labels.footerSectionTitle !== undefined && labels.footerSectionTitle !== '' ? labels.footerSectionTitle : 'Languages & Beyond Code')}</h2>
        </div>
        <div class="${gridClass}">
          ${
            languages.length > 0
              ? `<div class="cv-footer-box">
                  <h3 class="cv-box-label">${escapeHtml(labels.languagesTitle || 'Languages')}</h3>
                  <ul class="cv-lang-list">
                    ${languages
                      .map(
                        (l) => `
                      <li class="cv-lang-item">
                        <span class="cv-lang-name">${escapeHtml(l.language)}</span>
                        <span class="cv-lang-level">${escapeHtml(l.level)}</span>
                      </li>
                    `
                      )
                      .join('')}
                  </ul>
                </div>`
              : ''
          }
          ${
            interests.length > 0
              ? `<div class="cv-footer-box">
                  <h3 class="cv-box-label">${escapeHtml(labels.interestsTitle || 'Interests & Personal Focus')}</h3>
                  <div class="cv-int-list">
                    ${interests
                      .map(
                        (it) => `
                      <div class="cv-int-item">
                        <strong class="cv-int-title">${escapeHtml(it.title)}: </strong>
                        <span class="cv-int-detail">${escapeHtml(it.detail)}</span>
                      </div>
                    `
                      )
                      .join('')}
                  </div>
                </div>`
              : ''
          }
        </div>
      </section>
    `;
  }

  const legVis = layout.legendVisibility || {};
  const legendList = [];
  if (legVis.main !== false) {
    legendList.push(`<span class="cv-legend-item"><i style="background:${colors.main}"></i>${escapeHtml(labels.legendMain || 'Main Branch')}</span>`);
  }
  if (legVis.job !== false) {
    legendList.push(`<span class="cv-legend-item"><i style="background:${colors.job}"></i>${escapeHtml(labels.legendJob || 'Work Experience')}</span>`);
  }
  if (legVis.edu !== false) {
    legendList.push(`<span class="cv-legend-item"><i style="background:${colors.edu}"></i>${escapeHtml(labels.legendEdu || 'Education')}</span>`);
  }
  if (legVis.cert !== false) {
    legendList.push(`<span class="cv-legend-item"><i style="background:${colors.cert}"></i>${escapeHtml(labels.legendCert || 'Certifications')}</span>`);
  }
  if (legVis.other !== false) {
    legendList.push(`<span class="cv-legend-item"><i style="background:${colors.other}"></i>${escapeHtml(labels.legendOther || 'Other')}</span>`);
  }

  const showLegendBar = layout.showLegend !== false && (legendList.length > 0 || labels.gitCommand);
  const legendBarHtml = showLegendBar
    ? `<div class="cv-legend-bar">
        <p class="cv-git-cmd"><span>~</span> ${escapeHtml(labels.gitCommand || 'git log --branches --full-history --stat')}</p>
        ${legendList.length > 0 ? `<div class="cv-legend-items">${legendList.join('')}</div>` : ''}
      </div>`
    : '';

  return `
    <div class="cv-root ${isDark ? 'cv-dark' : 'cv-light'}" style="--cv-scale: ${Number(layout.fontScale) || 1};">
      <header class="cv-header">
        <div class="cv-header-banner ${showHeaderBg ? 'has-bg' : ''} ${headerIsDark ? 'theme-dark' : 'theme-light'}">
          <div class="cv-header-info">
            <h1 class="cv-name">${escapeHtml(header.fullName || 'Alex Developer')}</h1>
            ${header.headline ? `<p class="cv-headline">${escapeHtml(header.headline)}</p>` : ''}
            ${
              contactItems.length > 0
                ? `<div class="cv-contacts${layout.showContactDivider !== false && header.headline ? ' cv-contacts-divider' : ''}">${contactItems.join('')}</div>`
                : ''
            }
            ${
              header.showSummary !== false && header.summary
                ? `<div class="cv-summary-wrap"><p class="cv-summary">${escapeHtml(header.summary)}</p></div>`
                : ''
            }
          </div>
          ${
            header.showAvatar !== false && header.avatar
              ? `<div class="cv-avatar"><img src="${escapeHtml(header.avatar)}" alt="${escapeHtml(header.fullName)}" /></div>`
              : ''
          }
        </div>
        ${legendBarHtml}
      </header>

      <section class="cv-timeline">
        ${topExtensionHtml}
        ${commitRowsHtml}
      </section>

      ${projectsSectionHtml}
      ${footerSectionHtml}
    </div>
  `;
}

export function getCvStyles(profile) {
  const layout = profile?.layout || {};
  const marginMm = Number(layout.pageMarginMm ?? 10);
  const scale = Number(layout.fontScale) || 1;
  const avatarSize = Number(layout.avatarSize) || 116;

  const isDark = Boolean(layout.darkMode);
  const showHeaderBg = layout.showHeaderBg !== false;
  const showFooterBg = layout.showFooterBg !== false;
  const rawHeaderBg = layout.headerBgColor || '#f1f5f9';
  const rawFooterBg = layout.footerBgColor || '#f1f5f9';
  const effectiveHeaderBg =
    isDark && rawHeaderBg.toLowerCase() === '#f1f5f9' ? '#171c28' : rawHeaderBg;
  const effectiveFooterBg =
    isDark && rawFooterBg.toLowerCase() === '#f1f5f9' ? '#171c28' : rawFooterBg;
  const headerIsDark = showHeaderBg ? isDarkHexColor(effectiveHeaderBg) : isDark;
  const footerIsDark = showFooterBg ? isDarkHexColor(effectiveFooterBg) : isDark;

  const effectiveHeaderText =
    layout.headerTextColor || (headerIsDark ? '#f8fafc' : '#0f172a');
  const effectiveFooterText =
    layout.footerTextColor || (footerIsDark ? '#f8fafc' : '#0f172a');

  const typo = layout.typo || {};
  const tSize = (k, def) => Number(typo[k]?.size) || def;
  const tColor = (k, def) => typo[k]?.color || def;
  const mix = (c, pct) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
  const headerPadBottom = Number(layout.headerPadBottom ?? 30);

  const hdrBase = showHeaderBg ? effectiveHeaderText : isDark ? '#f8fafc' : '#0a0a0a';
  const ftrBase = showFooterBg ? effectiveFooterText : isDark ? '#f8fafc' : '#0a0a0a';

  const nameColor = tColor('name', hdrBase);
  const headlineColor = tColor('headline', showHeaderBg ? mix(hdrBase, 82) : isDark ? '#94a3b8' : '#525252');
  const contactsColor = tColor('contacts', showHeaderBg ? mix(hdrBase, 85) : isDark ? '#cbd5e1' : '#404040');
  const contactKeyColor = tColor('contactKey', showHeaderBg ? mix(hdrBase, 58) : isDark ? '#475569' : '#a3a3a3');
  const contactStrongColor = tColor('contacts', hdrBase);
  const summaryColor = tColor('summary', showHeaderBg ? mix(hdrBase, 88) : isDark ? '#cbd5e1' : '#404040');
  const summaryBorder = typo.summaryBorder?.color || (showHeaderBg ? mix(hdrBase, 16) : isDark ? '#1a1f2c' : '#f5f5f5');
  const contactBorder = typo.contactBorder?.color || summaryBorder;

  const footerTitleColor = tColor('footerTitle', ftrBase);
  const footerLabelColor = tColor('footerLabel', showFooterBg ? mix(ftrBase, 68) : isDark ? '#64748b' : '#737373');
  const footerTextStrong = tColor('footerText', ftrBase);
  const footerTextSoft = tColor('footerText', showFooterBg ? mix(ftrBase, 86) : isDark ? '#cbd5e1' : '#404040');
  const footerFontSize = tSize('footerText', 10.5);

  const pageBg = isDark ? '#0f1117' : '#FFFFFF';
  const textPrimary = isDark ? '#f8fafc' : '#0a0a0a';
  const textBody = isDark ? '#cbd5e1' : '#404040';
  const textSecondary = isDark ? '#94a3b8' : '#525252';
  const textMuted = isDark ? '#64748b' : '#737373';
  const textDim = isDark ? '#475569' : '#a3a3a3';
  const borderMain = isDark ? '#232938' : '#e5e5e5';
  const borderSubtle = isDark ? '#1a1f2c' : '#f5f5f5';
  const cardBg = isDark ? '#161b26' : '#fafafa';
  const tagBg = isDark ? '#181e2c' : '#f5f5f5';
  const tagBorder = isDark ? '#283147' : '#e5e5e5';
  const tagText = isDark ? '#cbd5e1' : '#404040';

  const selectedFontKey = layout.fontFamily || 'inter';
  const fontConfig = FONT_FAMILIES[selectedFontKey] || FONT_FAMILIES.inter;
  const isUnifiedFont = layout.fontScope !== 'content';

  const rootFontFamily = fontConfig.body;
  const headingFontFamily = fontConfig.heading || fontConfig.body;
  const codeFontFamily = isUnifiedFont ? fontConfig.body : '"JetBrains Mono", Menlo, Monaco, Consolas, monospace';

  return `
    @page {
      size: A4 portrait;
      margin: 0;
    }

    .cv-root {
      box-sizing: border-box;
      font-family: ${rootFontFamily};
      color: ${textPrimary};
      background: ${pageBg};
      line-height: 1.5;
      padding: ${marginMm}mm 12mm;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      font-size: calc(11px * ${scale});
    }

    .cv-root *, .cv-root *::before, .cv-root *::after {
      box-sizing: border-box;
    }

    .cv-commit-row,
    .cv-card-block {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .cv-header {
      border-bottom: 1px solid ${borderMain};
      padding-bottom: 12px;
      margin-bottom: 14px;
    }

    .cv-header-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 22px;
    }

    .cv-header-banner.has-bg {
      background: ${effectiveHeaderBg};
      margin-top: -${marginMm}mm;
      margin-left: -12mm;
      margin-right: -12mm;
      padding: ${marginMm}mm 12mm ${headerPadBottom}px 12mm;
      border-radius: 0;
      border: none;
    }

    .cv-header-info {
      flex: 1;
      min-width: 0;
    }

    .cv-name {
      font-family: ${headingFontFamily};
      font-size: calc(${tSize('name', 34)}px * ${scale});
      font-weight: 600;
      letter-spacing: -0.025em;
      color: ${nameColor};
      line-height: 1.05;
      margin: 0 0 5px 0;
    }

    .cv-headline {
      font-family: ${codeFontFamily};
      font-size: calc(${tSize('headline', 13.5)}px * ${scale});
      color: ${headlineColor};
      margin: 0;
    }

    .cv-contacts {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 16px;
      row-gap: 5px;
      margin-top: 10px;
      font-family: ${codeFontFamily};
      font-size: calc(${tSize('contacts', 10)}px * ${scale});
      color: ${contactsColor};
    }

    .cv-contacts.cv-contacts-divider {
      margin-top: 10px;
      padding-top: 9px;
      border-top: 1px solid ${contactBorder};
    }

    .cv-contact-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-width: 0;
      text-decoration: none;
      color: inherit;
    }

    .cv-contact-val {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .cv-contact-fullwidth {
      grid-column: 1 / -1;
      width: 100%;
      margin-top: 2px;
    }

    .cv-contact-icon {
      width: 13px;
      height: 13px;
      stroke: ${contactKeyColor};
      fill: none;
      flex-shrink: 0;
      display: inline-block;
      vertical-align: -1.5px;
      opacity: 0.9;
      margin-right: 2px;
    }

    .cv-link:hover {
      text-decoration: underline;
    }

    .cv-contact-key {
      color: ${contactKeyColor};
    }

    .cv-contact-strong {
      color: ${contactStrongColor};
      font-weight: 500;
    }

    .cv-avatar {
      width: ${avatarSize}px;
      height: ${avatarSize}px;
      border-radius: 9999px;
      overflow: hidden;
      border: 2px solid color-mix(in srgb, ${showHeaderBg ? effectiveHeaderText : textPrimary} 18%, transparent);
      flex-shrink: 0;
    }

    .cv-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .cv-summary-wrap {
      margin-top: 10px;
      padding-top: 9px;
      border-top: 1px solid ${summaryBorder};
    }

    .cv-summary {
      margin: 0;
      font-size: calc(${tSize('summary', 11)}px * ${scale});
      line-height: 1.55;
      color: ${summaryColor};
    }

    .cv-legend-bar {
      margin-top: 10px;
      padding-top: ${showHeaderBg ? '0' : '9px'};
      border-top: ${showHeaderBg ? 'none' : `1px solid ${borderMain}`};
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .cv-git-cmd {
      margin: 0;
      font-family: ${codeFontFamily};
      font-size: calc(9px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: ${textMuted};
    }

    .cv-git-cmd span {
      color: ${textPrimary};
      font-weight: 600;
    }

    .cv-legend-items {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      font-family: ${codeFontFamily};
      font-size: calc(9px * ${scale});
      color: ${textSecondary};
    }

    .cv-legend-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .cv-legend-item i {
      width: 8px;
      height: 8px;
      border-radius: 9999px;
      display: inline-block;
    }

    /* Timeline */
    .cv-timeline {
      position: relative;
      padding-bottom: 6px;
    }

    .cv-graph-ext {
      position: relative;
      left: 0;
      height: 15px;
      width: 240px;
      pointer-events: none;
    }

    .cv-svg-block {
      display: block;
    }

    .cv-commit-row {
      position: relative;
      display: flex;
      width: 100%;
    }

    .cv-page-break-top,
    .cv-page-break-bottom {
      display: none;
      position: relative;
      width: 100%;
      pointer-events: none;
    }

    .cv-node-date {
      position: absolute;
      left: 0;
      text-align: right;
      font-family: ${codeFontFamily};
      font-size: calc(9px * ${scale});
      font-weight: 500;
      line-height: 1;
      color: ${textMuted};
      user-select: none;
    }

    .cv-graph-col {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 250px;
      overflow: hidden;
      z-index: 0;
      pointer-events: none;
    }

    .cv-card-col {
      position: relative;
      z-index: 10;
      flex: 1;
      min-width: 0;
      padding-right: 4px;
    }

    .cv-card-detail {
      border-bottom: 1px solid ${borderSubtle};
    }

    .cv-card-split-part1 {
      border-bottom: none !important;
    }

    .cv-start-line {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      column-gap: 8px;
      row-gap: 2px;
      margin-top: 1px;
    }

    .cv-start-date {
      font-family: ${codeFontFamily};
      font-size: calc(9px * ${scale});
      color: ${textDim};
    }

    .cv-start-text {
      font-family: ${codeFontFamily};
      font-size: calc(9.5px * ${scale});
      color: ${textMuted};
    }

    .cv-start-title {
      font-weight: 500;
      color: ${textBody};
    }

    .cv-start-org {
      color: ${textDim};
    }

    .cv-card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .cv-card-main {
      flex: 1;
      min-width: 0;
    }

    .cv-card-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      column-gap: 8px;
      row-gap: 4px;
      margin-bottom: 4px;
    }

    .cv-branch-badge {
      font-family: ${codeFontFamily};
      font-size: calc(8.5px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 2px 5px;
      border-radius: 2px;
      border: 1px solid;
      font-weight: 500;
      line-height: 1;
    }

    .cv-status-ongoing {
      font-family: ${codeFontFamily};
      font-size: calc(8.5px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #10b981;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .cv-status-dot {
      width: 5px;
      height: 5px;
      border-radius: 9999px;
      background: #10b981;
      display: inline-block;
    }

    .cv-status-label {
      font-family: ${codeFontFamily};
      font-size: calc(8.5px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: ${textMuted};
    }

    .cv-card-daterange {
      font-family: ${codeFontFamily};
      font-size: calc(9.5px * ${scale});
      color: ${textMuted};
    }

    .cv-card-title {
      font-family: ${headingFontFamily};
      font-size: calc(15px * ${scale});
      font-weight: 500;
      color: ${textPrimary};
      line-height: 1.25;
      margin: 0 0 2px 0;
    }

    .cv-card-org {
      font-family: ${codeFontFamily};
      font-size: calc(10px * ${scale});
      font-weight: 400;
      color: ${textSecondary};
      margin: 0 0 6px 0;
    }

    .cv-card-loc {
      color: ${textDim};
    }

    .cv-card-logo {
      width: 38px;
      height: 38px;
      border-radius: 6px;
      background: #ffffff;
      padding: 4px;
      border: 1px solid ${borderMain};
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .cv-card-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    .cv-card-desc {
      font-size: calc(10.5px * ${scale});
      line-height: 1.5;
      color: ${textBody};
      margin-bottom: 6px;
      white-space: pre-line;
    }

    .cv-card-grade {
      font-family: ${codeFontFamily};
      font-size: calc(9.5px * ${scale});
      color: ${textMuted};
      margin: 0 0 6px 0;
    }

    .cv-card-grade span {
      color: ${textPrimary};
      font-weight: 600;
    }

    .cv-skills-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 4px;
    }

    .cv-skill-tag {
      font-family: ${codeFontFamily};
      font-size: calc(7.5px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: ${tagText};
      padding: 2px 6px;
      border-radius: 2px;
      background: ${tagBg};
      border: 1px solid ${tagBorder};
    }

    .cv-skill-tag-white {
      background: ${isDark ? '#1e2536' : '#ffffff'};
    }

    .cv-cred-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 6px;
      font-family: ${codeFontFamily};
      font-size: calc(8.5px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: ${textBody};
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    /* Projects & Footer Sections */
    .cv-section {
      padding-top: 14px;
      margin-top: 10px;
      border-top: 1px solid ${borderMain};
    }

    .cv-footer-section {
      break-before: avoid !important;
      page-break-before: avoid !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    .cv-footer-section.has-bg {
      background: ${effectiveFooterBg};
      border: none;
      border-radius: 0;
      margin-left: -12mm;
      margin-right: -12mm;
      margin-bottom: -${marginMm}mm;
      padding: 16px 12mm ${marginMm}mm 12mm;
      margin-top: 14px;
    }

    .cv-footer-section .cv-section-title {
      font-size: calc(${tSize('footerTitle', 17)}px * ${scale});
      color: ${footerTitleColor};
    }

    .cv-footer-section .cv-box-label {
      font-size: calc(${tSize('footerLabel', 9)}px * ${scale});
      color: ${footerLabelColor};
    }

    .cv-footer-section .cv-lang-name,
    .cv-footer-section .cv-int-title {
      color: ${footerTextStrong};
    }

    .cv-footer-section .cv-lang-item,
    .cv-footer-section .cv-int-item {
      font-size: calc(${footerFontSize}px * ${scale});
    }

    .cv-footer-section .cv-lang-level {
      font-size: calc(${Math.max(6, footerFontSize - 1)}px * ${scale});
      color: ${footerTextSoft};
    }

    .cv-footer-section .cv-int-detail {
      color: ${footerTextSoft};
    }

    .cv-footer-section.has-bg .cv-footer-box {
      background: color-mix(in srgb, ${effectiveFooterText} 5%, transparent);
      border-color: color-mix(in srgb, ${effectiveFooterText} 15%, transparent);
    }

    .cv-footer-section.has-bg .cv-lang-item {
      border-bottom-color: color-mix(in srgb, ${effectiveFooterText} 14%, transparent);
    }

    .cv-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .cv-section-title {
      font-family: ${headingFontFamily};
      font-size: calc(17px * ${scale});
      font-weight: 600;
      color: ${textPrimary};
      margin: 0;
    }

    .cv-section-cmd {
      font-family: ${codeFontFamily};
      font-size: calc(9px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: ${textMuted};
      margin: 0;
    }

    .cv-section-cmd span {
      color: ${textPrimary};
      font-weight: 600;
    }

    .cv-proj-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .cv-proj-card {
      border: 1px solid ${borderMain};
      border-radius: 6px;
      padding: 10px 12px;
      background: ${cardBg};
    }

    .cv-proj-header {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 4px;
    }

    .cv-proj-title-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cv-proj-name {
      font-family: ${headingFontFamily};
      font-size: calc(14px * ${scale});
      font-weight: 600;
      color: ${textPrimary};
      margin: 0;
    }

    .cv-proj-type {
      font-family: ${codeFontFamily};
      font-size: calc(8px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 1.5px 5px;
      border-radius: 2px;
      background: ${tagBg};
      color: ${tagText};
    }

    .cv-proj-year {
      font-family: ${codeFontFamily};
      font-size: calc(9px * ${scale});
      color: ${textDim};
    }

    .cv-proj-links {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: ${codeFontFamily};
      font-size: calc(9px * ${scale});
    }

    .cv-proj-link {
      color: ${textSecondary};
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .cv-proj-excerpt {
      font-size: calc(10.5px * ${scale});
      line-height: 1.45;
      color: ${textBody};
      margin: 0 0 6px 0;
    }

    .cv-footer-grid {
      display: grid;
      grid-template-columns: 5fr 7fr;
      gap: 14px;
    }

    .cv-footer-grid-single {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
    }

    .cv-footer-box {
      border: 1px solid ${borderMain};
      border-radius: 6px;
      padding: 10px 12px;
      background: ${cardBg};
    }

    .cv-box-label {
      font-family: ${codeFontFamily};
      font-size: calc(9px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: ${textMuted};
      margin: 0 0 8px 0;
      font-weight: 500;
    }

    .cv-lang-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .cv-lang-item {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      font-size: calc(10.5px * ${scale});
      padding-bottom: 5px;
      margin-bottom: 5px;
      border-bottom: 1px solid ${borderSubtle};
    }

    .cv-lang-item:last-child {
      padding-bottom: 0;
      margin-bottom: 0;
      border-bottom: none;
    }

    .cv-lang-name {
      font-weight: 600;
      color: ${textPrimary};
      flex-shrink: 0;
    }

    .cv-lang-level {
      font-family: ${codeFontFamily};
      font-size: calc(9.5px * ${scale});
      color: ${textSecondary};
      text-align: right;
    }

    .cv-int-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .cv-int-item {
      font-size: calc(10.5px * ${scale});
      line-height: 1.4;
    }

    .cv-int-title {
      font-weight: 600;
      color: ${textPrimary};
    }

    .cv-int-detail {
      color: ${textBody};
    }
  `;
}

export function paginateCvDom(rootEl, profile, isPrintMode = false) {
  if (!rootEl) return;
  const layout = profile?.layout || {};
  const marginMm = Number(layout.pageMarginMm ?? 10);
  const CONTENT_INDENT = Number(layout.contentIndent) || 188;

  // 1. Reset previous pagination adjustments & restore any split continuations
  rootEl.style.minHeight = '';
  rootEl.style.paddingBottom = '';
  rootEl.querySelectorAll('.cv-commit-continuation').forEach((cont) => {
    const idx = cont.dataset.commitIdx;
    const parentRow = rootEl.querySelector(`.cv-commit-row[data-commit-idx="${idx}"]:not(.cv-commit-continuation)`);
    if (parentRow) {
      const cardDesc = parentRow.querySelector('.cv-card-desc');
      if (cardDesc && cardDesc.getAttribute('data-full-text')) {
        cardDesc.textContent = cardDesc.getAttribute('data-full-text');
      }
      const skills = cont.querySelector('.cv-skills-wrap');
      if (skills) parentRow.querySelector('.cv-card-col')?.appendChild(skills);
      const cred = cont.querySelector('.cv-cred-link');
      if (cred) parentRow.querySelector('.cv-card-col')?.appendChild(cred);
    }
    cont.remove();
  });
  rootEl.querySelectorAll('.cv-continuation-bridge').forEach((el) => el.remove());
  rootEl.querySelectorAll('.cv-card-split-part1').forEach((el) => {
    el.classList.remove('cv-card-split-part1');
    el.style.borderBottom = '';
  });

  rootEl.querySelectorAll('.cv-page-break-top, .cv-page-break-bottom').forEach((el) => {
    el.style.display = 'none';
    el.style.height = '0px';
    el.style.breakBefore = '';
    el.style.pageBreakBefore = '';
  });
  rootEl.querySelectorAll('.cv-section').forEach((el) => {
    el.style.breakBefore = '';
    el.style.pageBreakBefore = '';
    el.style.paddingTop = '';
    el.style.paddingBottom = '';
    el.style.marginTop = '';
  });

  // Measure exact A4 height (297mm) and top/bottom margin in CSS pixels
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:absolute; top:0; left:0; width:1px; height:297mm; visibility:hidden; pointer-events:none;';
  rootEl.appendChild(probe);
  const pageHeightPx = probe.getBoundingClientRect().height || 297 * 3.7795275591;
  probe.style.height = `${marginMm}mm`;
  const marginPx = probe.getBoundingClientRect().height || marginMm * 3.7795275591;
  probe.remove();

  let currentPageTopY = rootEl.getBoundingClientRect().top;
  let pageCount = 1;
  const rows = Array.from(rootEl.querySelectorAll('.cv-commit-row'));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.classList.contains('cv-commit-continuation')) continue;
    const rect = row.getBoundingClientRect();
    const bottomOnPage = rect.bottom - currentPageTopY;

    if (bottomOnPage > pageHeightPx - marginPx && i > 0) {
      const cardTop = row.querySelector('.cv-card-top');
      const cardDesc = row.querySelector('.cv-card-desc');
      const cardTopBottom = cardTop ? cardTop.getBoundingClientRect().bottom - currentPageTopY : bottomOnPage;

      // Check if the card top fits on this page with at least 25px room for initial content
      const canStartOnCurrentPage = cardTop && cardTopBottom <= pageHeightPx - marginPx - 25 && cardDesc;

      if (canStartOnCurrentPage) {
        const rawFullText = cardDesc.getAttribute('data-full-text') || cardDesc.textContent;
        cardDesc.setAttribute('data-full-text', rawFullText);
        const isNewlineSeparated = rawFullText.includes('\n');
        const items = isNewlineSeparated
          ? rawFullText.split('\n')
          : (rawFullText.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) || [rawFullText]);

        // Temporarily detach trailing elements (skillsWrap, credLink) so they do not steal room
        // from text items on the current page or distort height measurements.
        const skillsWrap = row.querySelector('.cv-skills-wrap');
        const credLink = row.querySelector('.cv-cred-link');
        const origSkillsParent = skillsWrap ? skillsWrap.parentNode : null;
        const origCredParent = credLink ? credLink.parentNode : null;
        if (skillsWrap) skillsWrap.remove();
        if (credLink) credLink.remove();

        let fitItems = [];
        let overflowItems = [];

        for (let itIdx = 0; itIdx < items.length; itIdx++) {
          cardDesc.textContent = fitItems.concat(items[itIdx]).join(isNewlineSeparated ? '\n' : ' ');
          const testBottom = row.getBoundingClientRect().bottom - currentPageTopY;
          if (testBottom <= pageHeightPx - marginPx - 4) {
            fitItems.push(items[itIdx]);
          } else {
            overflowItems = items.slice(itIdx);
            break;
          }
        }

        const hasTrailingToMove = Boolean(skillsWrap || credLink);
        const shouldSplit = fitItems.length > 0 && (overflowItems.length > 0 || hasTrailingToMove);

        if (shouldSplit) {
          cardDesc.textContent = fitItems.join(isNewlineSeparated ? '\n' : ' ');
          const parentCardCol = row.querySelector('.cv-card-col');
          if (parentCardCol) {
            parentCardCol.classList.add('cv-card-split-part1');
            parentCardCol.style.setProperty('border-bottom', 'none', 'important');
          }

          // Continuation top bridge on next page
          // (needs straightSvg from bottomBridge)
          const bottomBridge = rootEl.querySelector(`.cv-page-break-bottom[data-commit-idx="${i}"]`);
          const straightSvg = bottomBridge ? bottomBridge.querySelector('.cv-graph-col')?.innerHTML || '' : '';

          const contTopBridge = document.createElement('div');
          contTopBridge.className = 'cv-page-break-top cv-continuation-bridge';
          contTopBridge.style.display = 'block';
          contTopBridge.style.height = `${marginPx}px`;
          contTopBridge.innerHTML = `<div class="cv-graph-col" style="top:0; bottom:-1px;">${straightSvg}</div>`;
          if (isPrintMode) {
            contTopBridge.style.breakBefore = 'page';
            contTopBridge.style.pageBreakBefore = 'always';
          }

          // Continuation row on next page
          const contRow = document.createElement('div');
          contRow.className = 'cv-commit-row cv-commit-continuation';
          contRow.dataset.commitIdx = String(i);
          contRow.style.minHeight = '32px';

          const contGraphCol = document.createElement('div');
          contGraphCol.className = 'cv-graph-col';
          contGraphCol.innerHTML = straightSvg;
          contRow.appendChild(contGraphCol);

          const contCardCol = document.createElement('div');
          contCardCol.className = 'cv-card-col cv-card-detail';
          contCardCol.style.marginLeft = `${CONTENT_INDENT}px`;
          contCardCol.style.paddingTop = '4px';
          contCardCol.style.paddingBottom = '8px';

          if (overflowItems.length > 0) {
            const contDescDiv = document.createElement('div');
            contDescDiv.className = 'cv-card-desc';
            contDescDiv.textContent = overflowItems.join(isNewlineSeparated ? '\n' : ' ');
            contCardCol.appendChild(contDescDiv);
          }

          if (skillsWrap) contCardCol.appendChild(skillsWrap);
          if (credLink) contCardCol.appendChild(credLink);

          contRow.appendChild(contCardCol);

          // Measure remaining space AFTER row has its final split content and trailing elements moved out
          const curRowBottomOnPage = row.getBoundingClientRect().bottom - currentPageTopY;
          const remainingToPageEdge = Math.max(0, pageHeightPx - curRowBottomOnPage);

          if (bottomBridge) {
            bottomBridge.style.display = 'block';
            const bridgeH = isPrintMode ? Math.max(0, remainingToPageEdge - 0.5) : remainingToPageEdge;
            bottomBridge.style.height = `${bridgeH}px`;
          }

          if (bottomBridge && bottomBridge.nextSibling) {
            row.parentNode.insertBefore(contTopBridge, bottomBridge.nextSibling);
            row.parentNode.insertBefore(contRow, contTopBridge.nextSibling);
          } else {
            row.after(contTopBridge);
            contTopBridge.after(contRow);
          }

          currentPageTopY += pageHeightPx;
          pageCount++;
          continue;
        } else {
          // Could not split cleanly or nothing fit; restore description and trailing elements
          cardDesc.textContent = rawFullText;
          if (skillsWrap && origSkillsParent) origSkillsParent.appendChild(skillsWrap);
          if (credLink && origCredParent) origCredParent.appendChild(credLink);
        }
      }

      // If cannot break inside or even first item cannot fit on current page:
      // Push the entire row to the next page
      const prevRow = rows[i - 1];
      const prevBottomOnPage = prevRow.getBoundingClientRect().bottom - currentPageTopY;
      const remainingToPageEdge = Math.max(0, pageHeightPx - prevBottomOnPage);

      const bottomBridge = rootEl.querySelector(`.cv-page-break-bottom[data-commit-idx="${i - 1}"]`);
      const topBridge = rootEl.querySelector(`.cv-page-break-top[data-commit-idx="${i}"]`);

      if (bottomBridge) {
        bottomBridge.style.display = 'block';
        const bridgeH = isPrintMode ? Math.max(0, remainingToPageEdge - 0.5) : remainingToPageEdge;
        bottomBridge.style.height = `${bridgeH}px`;
      }

      if (topBridge) {
        topBridge.style.display = 'block';
        topBridge.style.height = `${marginPx}px`;
        if (isPrintMode) {
          topBridge.style.breakBefore = 'page';
          topBridge.style.pageBreakBefore = 'always';
        }
        currentPageTopY += pageHeightPx;
        pageCount++;
      }
    }
  }

  // Ensure post-timeline sections (like projects, but NEVER the footer alone) respect page margins
  const sections = Array.from(rootEl.querySelectorAll('.cv-section:not(.cv-footer-section)'));
  for (const sec of sections) {
    const rect = sec.getBoundingClientRect();
    const bottomOnPage = rect.bottom - currentPageTopY;
    if (bottomOnPage > pageHeightPx - marginPx) {
      const topOnPage = rect.top - currentPageTopY;
      const remainingToPageEdge = Math.max(0, pageHeightPx - topOnPage);
      const isBoxedSection = sec.classList.contains('has-bg');
      if (isPrintMode) {
        sec.style.breakBefore = 'page';
        sec.style.pageBreakBefore = 'always';
        sec.style.marginTop = `${marginPx}px`;
        if (!isBoxedSection) {
          sec.style.paddingTop = `${marginPx + 14}px`;
          sec.style.marginTop = '0px';
        }
        currentPageTopY = sec.getBoundingClientRect().top - (isBoxedSection ? marginPx : 0);
      } else {
        sec.style.marginTop = `${remainingToPageEdge + marginPx}px`;
        currentPageTopY = sec.getBoundingClientRect().top - marginPx;
      }
      pageCount++;
    }
  }

  // NOTE: Footer directly follows the last entry/section on the SAME page (never alone on a new page)

  // 6. Extend the footer background seamlessly to the bottom edge of the final page
  const footerSec = rootEl.querySelector('.cv-footer-section');
  if (footerSec && footerSec.classList.contains('has-bg')) {
    const rootTop = rootEl.getBoundingClientRect().top;
    const footerBottom = footerSec.getBoundingClientRect().bottom;
    const totalPages = Math.max(1, Math.ceil((footerBottom - rootTop) / pageHeightPx));
    const targetBottom = rootTop + totalPages * pageHeightPx;
    const gap = targetBottom - footerBottom;

    if (gap > 0.5) {
      const curPadBottom = parseFloat(window.getComputedStyle(footerSec).paddingBottom) || 0;
      // In print mode, reserve 2px so subpixel rounding cannot spill onto a new page
      const safeExtra = isPrintMode ? Math.max(0, gap - 2) : gap;
      footerSec.style.paddingBottom = `${curPadBottom + safeExtra}px`;
    }
    if (!isPrintMode) {
      rootEl.style.minHeight = `${totalPages * pageHeightPx}px`;
    }
  }
}

export function renderFullPrintableHtml(profile, baseUrl = '') {
  const styles = getCvStyles(profile);
  const body = renderCvBodyHtml(profile);
  const fullName = profile?.header?.fullName || 'Alex Developer';
  const isDark = Boolean(profile?.layout?.darkMode);
  const pageBg = isDark ? '#0f1117' : '#FFFFFF';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    ${baseUrl ? `<base href="${escapeHtml(baseUrl)}" />` : ''}
    <title>${escapeHtml(fullName)} — CV</title>
    <link rel="stylesheet" href="/fonts/fonts.css" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 210mm;
        background: ${pageBg};
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      ${styles}
    </style>
  </head>
  <body>
    ${body}
  </body>
</html>`;
}
