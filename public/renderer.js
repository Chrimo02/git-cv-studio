// Shared Git-Graph Topology & CV HTML Renderer (works identically in Safari, Firefox, Chrome & Node.js)

export const DEFAULT_COLORS = {
  main: '#3b82f6',
  job: '#10b981',
  edu: '#8b5cf6',
  cert: '#f59e0b',
  other: '#ec4899',
};

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

    if (isCert) {
      rawCommits.push({
        id: entry.id,
        type: 'point',
        date: parseDate(entry.startDate),
        parent,
        entry,
        category: cat,
        priority: prio,
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
    const diff = a.date.valueOf() - b.date.valueOf();
    if (diff !== 0) return diff;
    if (a.type === 'start' && b.type === 'start') {
      if (isAncestor(b.parent, a.id)) return -1;
      if (isAncestor(a.parent, b.id)) return 1;
    }
    if (a.type === 'start' && b.type !== 'start') return -1;
    if (a.type !== 'start' && b.type === 'start') return 1;
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
  const CARD_PAD_Y = Number(layout.cardPaddingY) ?? 10;
  const NODE_Y = Math.max(18, Math.round(CARD_PAD_Y + 14));

  const contactItems = [];
  if (header.showLocation !== false && header.location) {
    contactItems.push(`<span class="cv-contact-item"><span class="cv-contact-key">loc:</span><span>${escapeHtml(header.location)}</span></span>`);
  }
  if (header.showEmail !== false && header.email) {
    contactItems.push(`<a href="mailto:${escapeHtml(header.email)}" class="cv-contact-item cv-link"><span class="cv-contact-key">mail:</span><span class="cv-contact-strong">${escapeHtml(header.email)}</span></a>`);
  }
  if (header.showPhone !== false && header.phone && String(header.phone).trim() !== '') {
    contactItems.push(`<a href="tel:${escapeHtml(header.phone)}" class="cv-contact-item cv-link"><span class="cv-contact-key">tel:</span><span>${escapeHtml(header.phone)}</span></a>`);
  }
  if (header.showWebsite !== false && header.website) {
    contactItems.push(`<a href="${escapeHtml(header.website)}" target="_blank" rel="noopener noreferrer" class="cv-contact-item cv-link"><span class="cv-contact-key">web:</span><span class="cv-contact-strong">${escapeHtml(cleanUrlDisplay(header.website))}</span></a>`);
  }
  if (header.showGithub !== false && header.github) {
    contactItems.push(`<a href="${escapeHtml(header.github)}" target="_blank" rel="noopener noreferrer" class="cv-contact-item cv-link"><span class="cv-contact-key">git:</span><span>${escapeHtml(cleanUrlDisplay(header.github))}</span></a>`);
  }
  if (header.showLinkedin !== false && header.linkedin) {
    contactItems.push(`<a href="${escapeHtml(header.linkedin)}" target="_blank" rel="noopener noreferrer" class="cv-contact-item cv-link"><span class="cv-contact-key">in:</span><span>${escapeHtml(cleanUrlDisplay(header.linkedin))}</span></a>`);
  }

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
    .map((c) => {
      const incoming = c.activeAfter;
      const outgoing = c.activeBefore;
      const commitColor = branchColors[c.id] || colors.main;
      const isStartNode = c.type === 'start';
      const entry = c.entry;
      const nodeDateText =
        c.type === 'ongoing'
          ? labels.present || 'Present'
          : formatShortDate(c.date, locale);

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

      const nodeCenterX = c.type === 'ongoing' && !c.singleCommitMode ? colX : parentX;
      const nodeCircleSvg = `<circle cx="${nodeCenterX}" cy="${NODE_Y}" r="${NODE_R}" fill="#FFFFFF" stroke="${commitColor}" stroke-width="3.2" />`;

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
        <div class="cv-commit-row" style="min-height:${rowMin}px;">
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
          <div class="cv-card-col ${isStartNode ? 'cv-card-start' : 'cv-card-detail'}" style="padding-left:${CONTENT_INDENT}px; padding-top:${padY}px; padding-bottom:${padY}px;">
            ${rightContentHtml}
          </div>
        </div>
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

  let footerSectionHtml = '';
  if (layout.showFooterSection !== false && (languages.length > 0 || interests.length > 0)) {
    const gridClass =
      languages.length > 0 && interests.length > 0
        ? 'cv-footer-grid'
        : 'cv-footer-grid-single';

    footerSectionHtml = `
      <section class="cv-section cv-card-block">
        <div class="cv-section-header">
          <h2 class="cv-section-title">${escapeHtml(labels.footerSectionTitle || 'Languages & Beyond Code')}</h2>
          <p class="cv-section-cmd"><span>~</span> ${escapeHtml(labels.footerSectionCommand || 'cat environment.conf')}</p>
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

  return `
    <div class="cv-root" style="--cv-scale: ${Number(layout.fontScale) || 1};">
      <header class="cv-header">
        <div class="cv-header-top">
          <div class="cv-header-info">
            <div class="cv-head-badges">
              <span class="cv-head-ref">HEAD -&gt; main</span>
              <span class="cv-head-ver">curriculum-vitae.v${new Date().getFullYear()}</span>
            </div>
            <h1 class="cv-name">${escapeHtml(header.fullName || 'Alex Developer')}</h1>
            ${header.headline ? `<p class="cv-headline">${escapeHtml(header.headline)}</p>` : ''}
            <div class="cv-contacts">${contactItems.join('')}</div>
          </div>
          ${
            header.showAvatar !== false && header.avatar
              ? `<div class="cv-avatar"><img src="${escapeHtml(header.avatar)}" alt="${escapeHtml(header.fullName)}" /></div>`
              : ''
          }
        </div>
        ${
          header.showSummary !== false && header.summary
            ? `<div class="cv-summary-wrap"><p class="cv-summary">${escapeHtml(header.summary)}</p></div>`
            : ''
        }
        <div class="cv-legend-bar">
          <p class="cv-git-cmd"><span>~</span> ${escapeHtml(labels.gitCommand || 'git log --branches --full-history --stat')}</p>
          <div class="cv-legend-items">
            <span class="cv-legend-item"><i style="background:${colors.job}"></i>${escapeHtml(labels.legendJob || 'Work Experience')}</span>
            <span class="cv-legend-item"><i style="background:${colors.edu}"></i>${escapeHtml(labels.legendEdu || 'Education')}</span>
            <span class="cv-legend-item"><i style="background:${colors.cert}"></i>${escapeHtml(labels.legendCert || 'Certifications')}</span>
            <span class="cv-legend-item"><i style="background:${colors.other}"></i>${escapeHtml(labels.legendOther || 'Other')}</span>
          </div>
        </div>
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
  const marginMm = Number(layout.pageMarginMm) ?? 10;
  const scale = Number(layout.fontScale) || 1;

  return `
    @page {
      size: A4 portrait;
      margin: ${marginMm}mm 12mm ${marginMm}mm 12mm;
    }

    .cv-root {
      font-family: "Inter", system-ui, -apple-system, sans-serif;
      color: #111111;
      background: #FFFFFF;
      line-height: 1.5;
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
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 14px;
      margin-bottom: 14px;
    }

    .cv-header-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
    }

    .cv-header-info {
      flex: 1;
      min-width: 0;
    }

    .cv-head-badges {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .cv-head-ref {
      font-family: "JetBrains Mono", monospace;
      font-size: calc(9px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 2px 6px;
      border-radius: 2px;
      background: #f5f5f5;
      color: #525252;
      border: 1px solid #e5e5e5;
    }

    .cv-head-ver {
      font-family: "JetBrains Mono", monospace;
      font-size: calc(9px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #a3a3a3;
    }

    .cv-name {
      font-family: "Fraunces", Georgia, serif;
      font-size: calc(28px * ${scale});
      font-weight: 600;
      letter-spacing: -0.025em;
      color: #0a0a0a;
      line-height: 1.05;
      margin: 0 0 4px 0;
    }

    .cv-headline {
      font-family: "JetBrains Mono", monospace;
      font-size: calc(11px * ${scale});
      color: #525252;
      margin: 0 0 10px 0;
    }

    .cv-contacts {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      column-gap: 14px;
      row-gap: 4px;
      font-family: "JetBrains Mono", monospace;
      font-size: calc(10px * ${scale});
      color: #404040;
    }

    .cv-contact-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      text-decoration: none;
      color: inherit;
    }

    .cv-link:hover {
      text-decoration: underline;
    }

    .cv-contact-key {
      color: #a3a3a3;
    }

    .cv-contact-strong {
      color: #171717;
      font-weight: 500;
    }

    .cv-avatar {
      width: 78px;
      height: 78px;
      border-radius: 9999px;
      overflow: hidden;
      border: 1px solid #e5e5e5;
      flex-shrink: 0;
    }

    .cv-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .cv-summary-wrap {
      margin-top: 11px;
      padding-top: 9px;
      border-top: 1px solid #f5f5f5;
    }

    .cv-summary {
      margin: 0;
      font-size: calc(11px * ${scale});
      line-height: 1.55;
      color: #404040;
    }

    .cv-legend-bar {
      margin-top: 11px;
      padding-top: 9px;
      border-top: 1px solid #e5e5e5;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .cv-git-cmd {
      margin: 0;
      font-family: "JetBrains Mono", monospace;
      font-size: calc(9px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #737373;
    }

    .cv-git-cmd span {
      color: #171717;
      font-weight: 600;
    }

    .cv-legend-items {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      font-family: "JetBrains Mono", monospace;
      font-size: calc(9px * ${scale});
      color: #525252;
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

    .cv-node-date {
      position: absolute;
      left: 0;
      text-align: right;
      font-family: "JetBrains Mono", monospace;
      font-size: calc(9px * ${scale});
      font-weight: 500;
      line-height: 1;
      color: #737373;
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
      width: 100%;
      min-width: 0;
      padding-right: 4px;
    }

    .cv-card-detail {
      border-bottom: 1px solid #f5f5f5;
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
      font-family: "JetBrains Mono", monospace;
      font-size: calc(9px * ${scale});
      color: #a3a3a3;
    }

    .cv-start-text {
      font-family: "JetBrains Mono", monospace;
      font-size: calc(9.5px * ${scale});
      color: #737373;
    }

    .cv-start-title {
      font-weight: 500;
      color: #404040;
    }

    .cv-start-org {
      color: #a3a3a3;
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
      font-family: "JetBrains Mono", monospace;
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
      font-family: "JetBrains Mono", monospace;
      font-size: calc(8.5px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #059669;
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
      font-family: "JetBrains Mono", monospace;
      font-size: calc(8.5px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #737373;
    }

    .cv-card-daterange {
      font-family: "JetBrains Mono", monospace;
      font-size: calc(9.5px * ${scale});
      color: #737373;
    }

    .cv-card-title {
      font-family: "Fraunces", Georgia, serif;
      font-size: calc(15px * ${scale});
      font-weight: 500;
      color: #0a0a0a;
      line-height: 1.25;
      margin: 0 0 2px 0;
    }

    .cv-card-org {
      font-family: "JetBrains Mono", monospace;
      font-size: calc(10px * ${scale});
      font-weight: 400;
      color: #525252;
      margin: 0 0 6px 0;
    }

    .cv-card-loc {
      color: #a3a3a3;
    }

    .cv-card-logo {
      width: 38px;
      height: 38px;
      border-radius: 6px;
      background: #ffffff;
      padding: 4px;
      border: 1px solid #e5e5e5;
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
      color: #404040;
      margin-bottom: 6px;
      white-space: pre-line;
    }

    .cv-card-grade {
      font-family: "JetBrains Mono", monospace;
      font-size: calc(9.5px * ${scale});
      color: #737373;
      margin: 0 0 6px 0;
    }

    .cv-card-grade span {
      color: #171717;
      font-weight: 600;
    }

    .cv-skills-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 4px;
    }

    .cv-skill-tag {
      font-family: "JetBrains Mono", monospace;
      font-size: calc(7.5px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #404040;
      padding: 2px 6px;
      border-radius: 2px;
      background: #f5f5f5;
      border: 1px solid #e5e5e5;
    }

    .cv-skill-tag-white {
      background: #ffffff;
    }

    .cv-cred-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 6px;
      font-family: "JetBrains Mono", monospace;
      font-size: calc(8.5px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #404040;
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    /* Projects & Footer Sections */
    .cv-section {
      padding-top: 14px;
      margin-top: 10px;
      border-top: 1px solid #e5e5e5;
    }

    .cv-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .cv-section-title {
      font-family: "Fraunces", Georgia, serif;
      font-size: calc(17px * ${scale});
      font-weight: 600;
      color: #0a0a0a;
      margin: 0;
    }

    .cv-section-cmd {
      font-family: "JetBrains Mono", monospace;
      font-size: calc(9px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #737373;
      margin: 0;
    }

    .cv-section-cmd span {
      color: #171717;
      font-weight: 600;
    }

    .cv-proj-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .cv-proj-card {
      border: 1px solid #e5e5e5;
      border-radius: 6px;
      padding: 10px 12px;
      background: #fafafa;
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
      font-family: "Fraunces", Georgia, serif;
      font-size: calc(14px * ${scale});
      font-weight: 600;
      color: #0a0a0a;
      margin: 0;
    }

    .cv-proj-type {
      font-family: "JetBrains Mono", monospace;
      font-size: calc(8px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 1.5px 5px;
      border-radius: 2px;
      background: #e5e5e5;
      color: #404040;
    }

    .cv-proj-year {
      font-family: "JetBrains Mono", monospace;
      font-size: calc(9px * ${scale});
      color: #a3a3a3;
    }

    .cv-proj-links {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: "JetBrains Mono", monospace;
      font-size: calc(9px * ${scale});
    }

    .cv-proj-link {
      color: #525252;
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .cv-proj-excerpt {
      font-size: calc(10.5px * ${scale});
      line-height: 1.45;
      color: #404040;
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
      border: 1px solid #e5e5e5;
      border-radius: 6px;
      padding: 10px 12px;
      background: #fafafa;
    }

    .cv-box-label {
      font-family: "JetBrains Mono", monospace;
      font-size: calc(9px * ${scale});
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #737373;
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
      border-bottom: 1px solid #efefef;
    }

    .cv-lang-item:last-child {
      padding-bottom: 0;
      margin-bottom: 0;
      border-bottom: none;
    }

    .cv-lang-name {
      font-weight: 600;
      color: #171717;
      flex-shrink: 0;
    }

    .cv-lang-level {
      font-family: "JetBrains Mono", monospace;
      font-size: calc(9.5px * ${scale});
      color: #525252;
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
      color: #171717;
    }

    .cv-int-detail {
      color: #404040;
    }
  `;
}

export function renderFullPrintableHtml(profile, baseUrl = '') {
  const styles = getCvStyles(profile);
  const body = renderCvBodyHtml(profile);
  const fullName = profile?.header?.fullName || 'Alex Developer';

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
        background: #FFFFFF;
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
