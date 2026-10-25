import { renderCvBodyHtml, getCvStyles, paginateCvDom, isDarkHexColor, DEFAULT_COLORS, FONT_FAMILIES, escapeHtml } from '/renderer.js';

let profiles = [];
let currentProfile = null;
let activeTab = 'timeline';
let previewMode = 'live'; // 'live' | 'pdf'
let openEntryIds = new Set();
let openProjectIds = new Set();
let categoryFilter = 'all';
let saveTimeout = null;
let pdfPreviewUrl = null;

// DOM elements
const profileSelect = document.getElementById('profileSelect');
const btnDuplicateProfile = document.getElementById('btnDuplicateProfile');
const btnRenameProfile = document.getElementById('btnRenameProfile');
const btnDeleteProfile = document.getElementById('btnDeleteProfile');
const btnExportJson = document.getElementById('btnExportJson');
const inputImportJson = document.getElementById('inputImportJson');
const btnExportPdf = document.getElementById('btnExportPdf');
const saveStatus = document.getElementById('saveStatus');
const editorContent = document.getElementById('editorContent');
const cvLiveMount = document.getElementById('cvLiveMount');
const cvDynamicStyles = document.getElementById('cvDynamicStyles');
const liveSheetWrap = document.getElementById('liveSheetWrap');
const nativePdfIframe = document.getElementById('nativePdfIframe');
const modeLiveBtn = document.getElementById('modeLiveBtn');
const modePdfBtn = document.getElementById('modePdfBtn');
const zoomSelect = document.getElementById('zoomSelect');
const btnRefreshPdfPreview = document.getElementById('btnRefreshPdfPreview');

async function init() {
  const res = await fetch('/api/profiles');
  const data = await res.json();
  profiles = data.profiles || [];
  currentProfile = profiles.find((p) => p.id === 'default-en') || profiles[0];
  renderProfileDropdown();
  renderEditor();
  updateLivePreview();
}

function renderProfileDropdown() {
  profileSelect.innerHTML = profiles
    .map(
      (p) =>
        `<option value="${escapeHtml(p.id)}" ${
          currentProfile && p.id === currentProfile.id ? 'selected' : ''
        }>${escapeHtml(p.name || p.id)}</option>`
    )
    .join('');
}

function scheduleAutoSave() {
  saveStatus.textContent = '● Saving...';
  saveStatus.style.color = '#fbbf24';
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    await saveCurrentProfileToServer();
  }, 450);
}

async function saveCurrentProfileToServer() {
  if (!currentProfile) return;
  try {
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: currentProfile }),
    });
    const data = await res.json();
    if (data.ok) {
      saveStatus.textContent = '✓ Saved';
      saveStatus.style.color = '#10b981';
    }
  } catch (e) {
    saveStatus.textContent = '⚠ Save error';
    saveStatus.style.color = '#ef4444';
  }
}

function updateLivePreview() {
  if (!currentProfile) return;
  const isDark = Boolean(currentProfile.layout?.darkMode);
  liveSheetWrap.style.padding = '0';
  liveSheetWrap.style.background = isDark ? '#0f1117' : '#FFFFFF';
  const toolbarDarkChk = document.getElementById('chkToolbarDarkMode');
  if (toolbarDarkChk) toolbarDarkChk.checked = isDark;
  cvDynamicStyles.textContent = getCvStyles(currentProfile);
  cvLiveMount.innerHTML = renderCvBodyHtml(currentProfile);
  const rootEl = cvLiveMount.querySelector('.cv-root');
  paginateCvDom(rootEl, currentProfile, false);
  drawA4PageGuides();
}

function drawA4PageGuides() {
  liveSheetWrap.querySelectorAll('.a4-page-guide').forEach((el) => el.remove());
  const pageHeightPx = 297 * 3.7795275591;
  const totalHeight = liveSheetWrap.scrollHeight;
  const totalPages = Math.max(1, Math.ceil(totalHeight / pageHeightPx));
  liveSheetWrap.style.minHeight = `${Math.round(totalPages * pageHeightPx)}px`;

  for (let p = 1; p < totalPages; p++) {
    const guide = document.createElement('div');
    guide.className = 'a4-page-guide';
    guide.style.top = `${Math.round(p * pageHeightPx)}px`;
    guide.innerHTML = `<span>Page ${p} / Page ${p + 1} Break (approx.)</span>`;
    liveSheetWrap.appendChild(guide);
  }
}

async function refreshNativePdfPreview() {
  if (!currentProfile) return;
  btnRefreshPdfPreview.textContent = '⏳ Rendering PDF...';
  btnRefreshPdfPreview.disabled = true;
  try {
    const res = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: currentProfile, inline: true }),
    });
    if (!res.ok) throw new Error('PDF generation failed');
    const blob = await res.blob();
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    pdfPreviewUrl = URL.createObjectURL(blob);
    nativePdfIframe.src = pdfPreviewUrl;
  } catch (err) {
    alert('Failed to render native PDF preview: ' + err.message);
  } finally {
    btnRefreshPdfPreview.textContent = '↻ Refresh PDF View';
    btnRefreshPdfPreview.disabled = false;
  }
}

async function downloadNativePdf() {
  if (!currentProfile) return;
  const origHtml = btnExportPdf.innerHTML;
  btnExportPdf.disabled = true;
  btnExportPdf.innerHTML = '<span>⏳ Generating Native PDF...</span>';

  try {
    await saveCurrentProfileToServer();
    const filename = `${(currentProfile.header?.fullName || 'Resume').replace(/\s+/g, '_')}_CV_${currentProfile.id}.pdf`;
    const res = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: currentProfile,
        filename,
        inline: false,
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to generate PDF');
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch (err) {
    alert('PDF Export failed: ' + err.message);
  } finally {
    btnExportPdf.disabled = false;
    btnExportPdf.innerHTML = origHtml;
  }
}

async function uploadImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            dataUrl: reader.result,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
        resolve(data.url);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ==================== EDITOR TAB RENDERING ====================

function renderEditor() {
  if (!currentProfile) return;

  if (activeTab === 'timeline') {
    renderTimelineTab();
  } else if (activeTab === 'header') {
    renderHeaderTab();
  } else if (activeTab === 'projects') {
    renderProjectsTab();
  } else if (activeTab === 'layout') {
    renderLayoutTab();
  }
}

function renderTimelineTab() {
  const layout = currentProfile.layout || (currentProfile.layout = {});
  const header = currentProfile.header || (currentProfile.header = {});
  const colors = { ...DEFAULT_COLORS, ...(layout.colors || {}) };
  const entries = currentProfile.entries || (currentProfile.entries = []);

  const allBranchOptions = [
    { id: 'main', label: 'main (Primary Timeline)' },
    ...entries.map((e) => ({ id: e.id, label: `${e.id} (${e.title?.slice(0, 28) || e.category})` })),
  ];

  const filteredEntries = entries
    .map((entry, idx) => ({ entry, idx }))
    .filter(({ entry }) => categoryFilter === 'all' || entry.category === categoryFilter);

  editorContent.innerHTML = `
    <div class="section-block">
      <div class="section-block-title">
        <span>CV Sections &amp; Graph Elements (ON / OFF)</span>
      </div>
      <div class="section-toggles-grid" style="margin-bottom:10px;">
        <label class="section-toggle-pill">
          <span>Projects Section</span>
          <input type="checkbox" class="ui-switch" id="chkSecProjects" ${layout.showProjectsSection !== false ? 'checked' : ''} />
        </label>
        <label class="section-toggle-pill">
          <span>Languages &amp; Interests</span>
          <input type="checkbox" class="ui-switch" id="chkSecFooter" ${layout.showFooterSection !== false ? 'checked' : ''} />
        </label>
        <label class="section-toggle-pill">
          <span>Executive Summary</span>
          <input type="checkbox" class="ui-switch" id="chkSecSummary" ${header.showSummary !== false ? 'checked' : ''} />
        </label>
        <label class="section-toggle-pill">
          <span>Portrait Photo</span>
          <input type="checkbox" class="ui-switch" id="chkSecAvatar" ${header.showAvatar !== false ? 'checked' : ''} />
        </label>
        <label class="section-toggle-pill">
          <span>"Started" Commit Rows</span>
          <input type="checkbox" class="ui-switch" id="chkGlobalStartNodes" ${layout.showStartNodes !== false ? 'checked' : ''} />
        </label>
        <label class="section-toggle-pill">
          <span>Company Logos</span>
          <input type="checkbox" class="ui-switch" id="chkGlobalLogos" ${layout.showLogos !== false ? 'checked' : ''} />
        </label>
        <label class="section-toggle-pill">
          <span>Bullet Descriptions</span>
          <input type="checkbox" class="ui-switch" id="chkGlobalDescs" ${layout.showDescriptions !== false ? 'checked' : ''} />
        </label>
        <label class="section-toggle-pill">
          <span>Skill Badges</span>
          <input type="checkbox" class="ui-switch" id="chkGlobalSkills" ${layout.showSkills !== false ? 'checked' : ''} />
        </label>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap; padding-top:8px; border-top:1px solid var(--border);">
        <div style="display:flex; gap:5px; flex-wrap:wrap;">
          ${['all', 'job', 'edu', 'cert', 'other']
            .map((cat) => {
              const labelsMap = {
                all: `All (${entries.length})`,
                job: 'Jobs',
                edu: 'Education',
                cert: 'Certs',
                other: 'Other',
              };
              const isAct = categoryFilter === cat;
              return `<button class="btn btn-sm cat-filter-btn" data-cat="${cat}" style="${
                isAct ? 'background:#2563eb; border-color:#3b82f6; color:#fff;' : ''
              }">${labelsMap[cat]}</button>`;
            })
            .join('')}
        </div>
        <button id="btnAddEntry" class="btn btn-sm" style="border-color:#3b82f6; color:#93c5fd;">+ New Station</button>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:8px; border-top:1px solid var(--border);">
        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
          <input type="checkbox" class="ui-switch" id="chkManualTimelineOrder" ${layout.manualSort !== false ? 'checked' : ''} />
          <span style="font-size:11.5px; font-weight:500;">
            <strong>Manuelle Reihenfolge (Drag &amp; Drop / Pfeile)</strong>
            <span style="color:var(--text-muted); font-size:10.5px;">— Stationen exakt wie in dieser Liste anordnen</span>
          </span>
        </label>
      </div>
    </div>

    <div id="entriesList">
      ${filteredEntries
        .map(({ entry, idx }) => {
          const isOpen = openEntryIds.has(entry.id);
          const dotColor = colors[entry.category] || colors.main;
          const dateInfo =
            entry.category === 'cert'
              ? entry.startDate
              : `${entry.startDate || '?'} → ${entry.endDate || 'Present'}`;

          return `
            <div class="entry-item ${entry.enabled === false ? 'disabled-entry' : ''} ${isOpen ? 'open' : ''}" data-idx="${idx}">
              <div class="entry-header" data-toggle-idx="${idx}">
                <span class="entry-drag-handle" title="Drag to reorder" draggable="true" style="cursor:grab; user-select:none; color:var(--text-dim); font-size:14px; padding:0 3px;">⋮⋮</span>
                <input type="checkbox" class="ui-switch entry-enable-chk" data-idx="${idx}" ${
                  entry.enabled !== false ? 'checked' : ''
                } title="Toggle station visibility in CV" />
                <span class="entry-cat-dot" style="background:${dotColor}"></span>
                <div class="entry-summary">
                  <div class="entry-summary-title">${escapeHtml(entry.title || 'Untitled Station')}</div>
                  <div class="entry-summary-meta">
                    [${escapeHtml(entry.badge || entry.id)}] · ${escapeHtml(entry.organization || '')} · ${escapeHtml(dateInfo)}
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:3px;">
                  <button class="btn btn-sm entry-move-btn" data-dir="up" data-idx="${idx}" title="Move up" ${idx === 0 ? 'disabled style="opacity:0.35;"' : ''}>▲</button>
                  <button class="btn btn-sm entry-move-btn" data-dir="down" data-idx="${idx}" title="Move down" ${idx === entries.length - 1 ? 'disabled style="opacity:0.35;"' : ''}>▼</button>
                </div>
                <button class="btn btn-sm entry-dup-btn" data-idx="${idx}" title="Duplicate entry">⧉</button>
                <button class="btn btn-sm btn-danger entry-del-btn" data-idx="${idx}" title="Permanently delete entry">🗑</button>
              </div>

              <div class="entry-details">
                <div class="field-grid">
                  <div class="field-wrap">
                    <label class="field-label">Branch ID (Internal Slug)</label>
                    <input type="text" class="studio-input entry-field" data-idx="${idx}" data-key="id" value="${escapeHtml(entry.id)}" />
                  </div>
                  <div class="field-wrap">
                    <label class="field-label">Badge Label (Shown in Pill)</label>
                    <input type="text" class="studio-input entry-field" data-idx="${idx}" data-key="badge" value="${escapeHtml(entry.badge || entry.id)}" />
                  </div>

                  <div class="field-wrap">
                    <label class="field-label">Category</label>
                    <select class="studio-select entry-field" data-idx="${idx}" data-key="category">
                      <option value="job" ${entry.category === 'job' ? 'selected' : ''}>Work Experience (Job)</option>
                      <option value="edu" ${entry.category === 'edu' ? 'selected' : ''}>Education</option>
                      <option value="cert" ${entry.category === 'cert' ? 'selected' : ''}>Certification (Point Commit)</option>
                      <option value="other" ${entry.category === 'other' ? 'selected' : ''}>Other / Program</option>
                    </select>
                  </div>

                  <div class="field-wrap">
                    <label class="field-label">Parent Branch</label>
                    <select class="studio-select entry-field" data-idx="${idx}" data-key="parent">
                      ${allBranchOptions
                        .filter((opt) => opt.id !== entry.id)
                        .map(
                          (opt) =>
                            `<option value="${escapeHtml(opt.id)}" ${
                              (entry.parent || 'main') === opt.id ? 'selected' : ''
                            }>${escapeHtml(opt.label)}</option>`
                        )
                        .join('')}
                    </select>
                  </div>

                  <div class="field-wrap field-full">
                    <label class="field-label">Role / Degree / Title</label>
                    <input type="text" class="studio-input entry-field" data-idx="${idx}" data-key="title" value="${escapeHtml(entry.title)}" />
                  </div>

                  <div class="field-wrap">
                    <label class="field-label">Company / Institution / Issuer</label>
                    <input type="text" class="studio-input entry-field" data-idx="${idx}" data-key="organization" value="${escapeHtml(entry.organization)}" />
                  </div>

                  <div class="field-wrap">
                    <label class="field-label">Location</label>
                    <input type="text" class="studio-input entry-field" data-idx="${idx}" data-key="location" value="${escapeHtml(entry.location)}" />
                  </div>

                  <div class="field-wrap">
                    <label class="field-label">${entry.category === 'cert' ? 'Issue Date (e.g. Feb 2026)' : 'Start Date (e.g. Oct 2023)'}</label>
                    <input type="text" class="studio-input entry-field" data-idx="${idx}" data-key="startDate" value="${escapeHtml(entry.startDate)}" />
                  </div>

                  <div class="field-wrap">
                    <label class="field-label">End Date ("Present" if ongoing)</label>
                    <input type="text" class="studio-input entry-field" data-idx="${idx}" data-key="endDate" value="${escapeHtml(entry.endDate)}" ${entry.category === 'cert' ? 'disabled' : ''} />
                  </div>

                  <div class="field-wrap">
                    <label class="field-label">Grade / GPA (Optional)</label>
                    <input type="text" class="studio-input entry-field" data-idx="${idx}" data-key="grade" value="${escapeHtml(entry.grade)}" />
                  </div>

                  <div class="field-wrap">
                    <label class="field-label">Priority (Tie-breaker sort order)</label>
                    <input type="number" class="studio-input entry-field" data-idx="${idx}" data-key="priority" value="${Number(entry.priority) || 0}" />
                  </div>

                  <div class="field-wrap field-full">
                    <label class="field-label">Logo Path or Upload</label>
                    <div style="display:flex; gap:6px;">
                      <input type="text" class="studio-input entry-field" style="flex:1;" data-idx="${idx}" data-key="logo" value="${escapeHtml(entry.logo)}" />
                      <label class="btn btn-sm" style="margin:0;">
                        Upload
                        <input type="file" accept="image/*" class="entry-logo-upload" data-idx="${idx}" style="display:none;" />
                      </label>
                    </div>
                  </div>

                  <div class="field-wrap field-full">
                    <label class="field-label">Credential / External Link URL (Optional)</label>
                    <input type="text" class="studio-input entry-field" data-idx="${idx}" data-key="url" value="${escapeHtml(entry.url)}" />
                  </div>

                  <div class="field-wrap field-full" style="margin: 4px 0;">
                    <div class="toggle-row">
                      ${
                        entry.category !== 'cert'
                          ? `<label class="switch-wrap">
                              <input type="checkbox" class="ui-switch entry-bool-field" data-idx="${idx}" data-key="showStartNode" ${
                                entry.showStartNode !== false ? 'checked' : ''
                              } />
                              <span>"Started" Commit Row</span>
                            </label>`
                          : ''
                      }
                      <label class="switch-wrap">
                        <input type="checkbox" class="ui-switch entry-bool-field" data-idx="${idx}" data-key="showDescription" ${
                          entry.showDescription !== false ? 'checked' : ''
                        } />
                        <span>Description</span>
                      </label>
                      <label class="switch-wrap">
                        <input type="checkbox" class="ui-switch entry-bool-field" data-idx="${idx}" data-key="showSkills" ${
                          entry.showSkills !== false ? 'checked' : ''
                        } />
                        <span>Skills</span>
                      </label>
                    </div>
                  </div>

                  <div class="field-wrap field-full">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                      <label class="field-label" style="margin:0;">Description / Bullet Points</label>
                      <button type="button" class="btn btn-sm add-bullet-btn" data-idx="${idx}">+ Add "• " Bullet</button>
                    </div>
                    <textarea class="studio-textarea entry-field" data-idx="${idx}" data-key="description" rows="4">${escapeHtml(entry.description)}</textarea>
                  </div>

                  <div class="field-wrap field-full">
                    <label class="field-label">Skills &amp; Technologies (comma-separated)</label>
                    <textarea class="studio-textarea entry-skills-field" data-idx="${idx}" rows="2" style="min-height:48px;">${escapeHtml((entry.skills || []).join(', '))}</textarea>
                  </div>
                </div>
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;

  // Bind section & global toggles
  document.getElementById('chkSecProjects')?.addEventListener('change', (e) => {
    currentProfile.layout.showProjectsSection = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });
  document.getElementById('chkSecFooter')?.addEventListener('change', (e) => {
    currentProfile.layout.showFooterSection = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });
  document.getElementById('chkSecSummary')?.addEventListener('change', (e) => {
    currentProfile.header.showSummary = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });
  document.getElementById('chkSecAvatar')?.addEventListener('change', (e) => {
    currentProfile.header.showAvatar = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });
  document.getElementById('chkGlobalStartNodes')?.addEventListener('change', (e) => {
    currentProfile.layout.showStartNodes = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });
  document.getElementById('chkGlobalLogos')?.addEventListener('change', (e) => {
    currentProfile.layout.showLogos = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });
  document.getElementById('chkGlobalDescs')?.addEventListener('change', (e) => {
    currentProfile.layout.showDescriptions = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });
  document.getElementById('chkGlobalSkills')?.addEventListener('change', (e) => {
    currentProfile.layout.showSkills = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('chkManualTimelineOrder')?.addEventListener('change', (e) => {
    layout.manualSort = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.querySelectorAll('.cat-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      categoryFilter = btn.dataset.cat;
      renderTimelineTab();
    });
  });

  document.getElementById('btnAddEntry')?.addEventListener('click', () => {
    const newId = 'new-branch-' + (entries.length + 1);
    entries.unshift({
      id: newId,
      badge: newId,
      enabled: true,
      showStartNode: true,
      showDescription: true,
      showSkills: true,
      category: 'job',
      parent: 'main',
      title: 'New Role / Milestone',
      organization: 'Company / Institution',
      location: 'Location',
      startDate: 'Jan 2026',
      endDate: 'Present',
      priority: 1,
      grade: '',
      url: '',
      logo: '',
      description: '• Key responsibility or achievement.',
      skills: ['Skill 1', 'Skill 2'],
    });
    openEntryIds.add(newId);
    renderTimelineTab();
    updateLivePreview();
    scheduleAutoSave();
  });

  document.querySelectorAll('.entry-move-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = Number(btn.dataset.idx);
      const dir = btn.dataset.dir;
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (targetIdx >= 0 && targetIdx < entries.length) {
        const [moved] = entries.splice(idx, 1);
        entries.splice(targetIdx, 0, moved);
        entries.forEach((e, i) => {
          e.priority = (entries.length - i) * 10;
        });
        layout.manualSort = true;
        renderTimelineTab();
        updateLivePreview();
        scheduleAutoSave();
      }
    });
  });

  let draggedItemIdx = null;
  document.querySelectorAll('.entry-item').forEach((item) => {
    const handle = item.querySelector('.entry-drag-handle');
    if (handle) {
      handle.addEventListener('dragstart', (e) => {
        draggedItemIdx = Number(item.dataset.idx);
        e.dataTransfer.effectAllowed = 'move';
        item.style.opacity = '0.45';
      });
      handle.addEventListener('dragend', () => {
        item.style.opacity = '1';
        draggedItemIdx = null;
        document.querySelectorAll('.entry-item').forEach((el) => {
          el.style.borderTop = '';
          el.style.borderBottom = '';
        });
      });
    }

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const targetIdx = Number(item.dataset.idx);
      if (draggedItemIdx === null || draggedItemIdx === targetIdx) return;
      if (draggedItemIdx < targetIdx) {
        item.style.borderBottom = '2px solid var(--border-focus)';
        item.style.borderTop = '';
      } else {
        item.style.borderTop = '2px solid var(--border-focus)';
        item.style.borderBottom = '';
      }
    });

    item.addEventListener('dragleave', () => {
      item.style.borderTop = '';
      item.style.borderBottom = '';
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.style.borderTop = '';
      item.style.borderBottom = '';
      const targetIdx = Number(item.dataset.idx);
      if (draggedItemIdx === null || draggedItemIdx === targetIdx) return;
      const [moved] = entries.splice(draggedItemIdx, 1);
      entries.splice(targetIdx, 0, moved);
      entries.forEach((e, i) => {
        e.priority = (entries.length - i) * 10;
      });
      layout.manualSort = true;
      renderTimelineTab();
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.entry-header').forEach((hdr) => {
    hdr.addEventListener('click', (e) => {
      if (e.target.closest('input') || e.target.closest('button')) return;
      const idx = Number(hdr.dataset.toggleIdx);
      const entry = entries[idx];
      if (!entry) return;
      if (openEntryIds.has(entry.id)) openEntryIds.delete(entry.id);
      else openEntryIds.add(entry.id);
      renderTimelineTab();
    });
  });

  document.querySelectorAll('.entry-enable-chk').forEach((chk) => {
    chk.addEventListener('change', () => {
      const idx = Number(chk.dataset.idx);
      entries[idx].enabled = chk.checked;
      chk.closest('.entry-item')?.classList.toggle('disabled-entry', !chk.checked);
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.entry-dup-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      const orig = entries[idx];
      const copy = JSON.parse(JSON.stringify(orig));
      copy.id = orig.id + '-copy';
      copy.title = orig.title + ' (Copy)';
      entries.splice(idx + 1, 0, copy);
      openEntryIds.add(copy.id);
      renderTimelineTab();
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.entry-del-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      const entry = entries[idx];
      if (!confirm(`Permanently delete "${entry.title}"? (Tip: Use the green switch on the left if you only want to hide it!)`)) return;
      entries.splice(idx, 1);
      renderTimelineTab();
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.entry-field').forEach((inp) => {
    inp.addEventListener('input', () => {
      const idx = Number(inp.dataset.idx);
      const key = inp.dataset.key;
      const val = inp.type === 'number' ? Number(inp.value) : inp.value;
      if (key === 'id') {
        const oldId = entries[idx].id;
        if (openEntryIds.has(oldId)) {
          openEntryIds.delete(oldId);
          openEntryIds.add(val);
        }
      }
      entries[idx][key] = val;
      if (key === 'category') {
        renderTimelineTab();
      }
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.entry-bool-field').forEach((chk) => {
    chk.addEventListener('change', () => {
      const idx = Number(chk.dataset.idx);
      const key = chk.dataset.key;
      entries[idx][key] = chk.checked;
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.entry-skills-field').forEach((ta) => {
    ta.addEventListener('input', () => {
      const idx = Number(ta.dataset.idx);
      entries[idx].skills = ta.value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.add-bullet-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      const cur = entries[idx].description || '';
      entries[idx].description = cur ? cur + '\n• ' : '• ';
      renderTimelineTab();
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.entry-logo-upload').forEach((fileInp) => {
    fileInp.addEventListener('change', async () => {
      const file = fileInp.files?.[0];
      if (!file) return;
      const idx = Number(fileInp.dataset.idx);
      try {
        const uploadedUrl = await uploadImageFile(file);
        entries[idx].logo = uploadedUrl;
        renderTimelineTab();
        updateLivePreview();
        scheduleAutoSave();
      } catch (e) {
        alert('Logo upload failed: ' + e.message);
      }
    });
  });
}

function renderHeaderTab() {
  const h = currentProfile.header || (currentProfile.header = {});
  const l = currentProfile.labels || (currentProfile.labels = {});
  const layout = currentProfile.layout || (currentProfile.layout = {});
  const headerBg = layout.headerBgColor || '#f1f5f9';
  const defaultHdrText = isDarkHexColor(headerBg) ? '#f8fafc' : '#0f172a';
  const headerText = layout.headerTextColor || defaultHdrText;
  const avatarSize = Number(layout.avatarSize) || 116;

  editorContent.innerHTML = `
    <div class="section-block">
      <div class="section-block-title">Personal &amp; Contact Information (with Visibility Switches)</div>
      <div class="field-grid">
        <div class="field-wrap">
          <label class="field-label">Full Name</label>
          <input type="text" class="studio-input hdr-field" data-key="fullName" value="${escapeHtml(h.fullName)}" />
        </div>
        <div class="field-wrap">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="field-label" style="margin:0;">Location</label>
            <input type="checkbox" class="ui-switch hdr-bool-field" data-key="showLocation" ${h.showLocation !== false ? 'checked' : ''} title="Show/Hide Location" />
          </div>
          <input type="text" class="studio-input hdr-field" data-key="location" value="${escapeHtml(h.location)}" />
        </div>
        <div class="field-wrap field-full">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="field-label" style="margin:0;">Headline / Target Role (Subtitle)</label>
            <label class="switch-wrap">
              <span>Divider below Subtitle</span>
              <input type="checkbox" class="ui-switch" id="chkShowContactDivider" ${layout.showContactDivider !== false ? 'checked' : ''} />
            </label>
          </div>
          <input type="text" class="studio-input hdr-field" data-key="headline" value="${escapeHtml(h.headline)}" />
        </div>
        <div class="field-wrap">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="field-label" style="margin:0;">Email</label>
            <input type="checkbox" class="ui-switch hdr-bool-field" data-key="showEmail" ${h.showEmail !== false ? 'checked' : ''} title="Show/Hide Email" />
          </div>
          <input type="text" class="studio-input hdr-field" data-key="email" value="${escapeHtml(h.email)}" />
        </div>
        <div class="field-wrap">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="field-label" style="margin:0;">Phone</label>
            <input type="checkbox" class="ui-switch hdr-bool-field" data-key="showPhone" ${h.showPhone !== false ? 'checked' : ''} title="Show/Hide Phone" />
          </div>
          <input type="text" class="studio-input hdr-field" data-key="phone" placeholder="+49 ..." value="${escapeHtml(h.phone)}" />
        </div>
        <div class="field-wrap">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="field-label" style="margin:0;">Website URL</label>
            <input type="checkbox" class="ui-switch hdr-bool-field" data-key="showWebsite" ${h.showWebsite !== false ? 'checked' : ''} title="Show/Hide Website" />
          </div>
          <input type="text" class="studio-input hdr-field" data-key="website" value="${escapeHtml(h.website)}" />
        </div>
        <div class="field-wrap">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="field-label" style="margin:0;">GitHub URL</label>
            <input type="checkbox" class="ui-switch hdr-bool-field" data-key="showGithub" ${h.showGithub !== false ? 'checked' : ''} title="Show/Hide GitHub" />
          </div>
          <input type="text" class="studio-input hdr-field" data-key="github" value="${escapeHtml(h.github)}" />
        </div>
        <div class="field-wrap field-full">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="field-label" style="margin:0;">LinkedIn URL</label>
            <input type="checkbox" class="ui-switch hdr-bool-field" data-key="showLinkedin" ${h.showLinkedin !== false ? 'checked' : ''} title="Show/Hide LinkedIn" />
          </div>
          <input type="text" class="studio-input hdr-field" data-key="linkedin" value="${escapeHtml(h.linkedin)}" />
        </div>
        <div class="field-wrap field-full">
          <label class="field-label">Contact Labels (leave empty to hide the label)</label>
          <div style="display:grid; grid-template-columns:repeat(6,1fr); gap:6px;">
            ${['loc', 'mail', 'tel', 'web', 'git', 'in']
              .map(
                (k) =>
                  `<input type="text" class="studio-input contact-key-field" data-key="${k}" value="${escapeHtml((h.contactKeys && h.contactKeys[k] !== undefined) ? h.contactKeys[k] : k)}" title="Label for ${k}" style="padding:5px 7px; font-family:'JetBrains Mono',monospace; font-size:11px;" />`
              )
              .join('')}
          </div>
        </div>
        <div class="field-wrap field-full">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <label class="field-label" style="margin:0;">Custom Contact Items (free label &amp; text, optional link)</label>
            <button type="button" id="btnAddCustomContact" class="btn btn-sm">+ Add Item</button>
          </div>
          ${(h.customContacts || [])
            .map(
              (c, idx) => `
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px; ${c.enabled === false ? 'opacity:0.48;' : ''}">
              <input type="checkbox" class="ui-switch cc-enable" data-idx="${idx}" ${c.enabled !== false ? 'checked' : ''} title="Show/Hide" />
              <input type="text" class="studio-input cc-field" data-idx="${idx}" data-key="label" placeholder="Label" value="${escapeHtml(c.label)}" style="width:20%;" />
              <input type="text" class="studio-input cc-field" data-idx="${idx}" data-key="value" placeholder="Text" value="${escapeHtml(c.value)}" style="flex:1;" />
              <input type="text" class="studio-input cc-field" data-idx="${idx}" data-key="url" placeholder="Link (optional)" value="${escapeHtml(c.url)}" style="width:28%;" />
              <button type="button" class="btn btn-sm btn-danger cc-del" data-idx="${idx}" title="Delete">🗑</button>
            </div>`
            )
            .join('')}
        </div>
        <div class="field-wrap field-full">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="field-label" style="margin:0;">Portrait Photo</label>
            <label class="switch-wrap">
              <span>Show Portrait</span>
              <input type="checkbox" class="ui-switch" id="chkShowAvatar" ${h.showAvatar !== false ? 'checked' : ''} />
            </label>
          </div>
          <div style="display:flex; gap:6px; margin-bottom:8px;">
            <input type="text" class="studio-input hdr-field" style="flex:1;" data-key="avatar" value="${escapeHtml(h.avatar)}" />
            <label class="btn btn-sm" style="margin:0;">
              Upload Photo
              <input type="file" id="inputAvatarUpload" accept="image/*" style="display:none;" />
            </label>
          </div>
          <div class="slider-row" style="margin-bottom:4px;">
            <div class="slider-top">
              <span>Portrait Photo Size (Right Column)</span>
              <span class="slider-val" id="val_hdr_avatarSize">${avatarSize}px</span>
            </div>
            <input type="range" id="rngHdrAvatarSize" min="76" max="156" step="2" value="${avatarSize}" />
          </div>
        </div>
        <div class="field-wrap field-full">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <label class="field-label" style="margin:0;">Header Full-Width Background &amp; Text Color</label>
            <label class="switch-wrap">
              <span>Colored Header</span>
              <input type="checkbox" class="ui-switch" id="chkHdrBg" ${layout.showHeaderBg !== false ? 'checked' : ''} />
            </label>
          </div>
          <div class="field-grid" style="margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:8px; background:var(--bg-input); padding:6px 10px; border-radius:6px; border:1px solid var(--border);">
              <input type="color" id="clrHdrBg" value="${escapeHtml(headerBg)}" style="border:none; width:26px; height:26px; background:none; cursor:pointer;" />
              <div style="flex:1;">
                <div style="font-size:11px; font-weight:500;">Background Color</div>
                <div id="hexHdrBg" style="font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--text-muted);">${escapeHtml(headerBg)}</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px; background:var(--bg-input); padding:6px 10px; border-radius:6px; border:1px solid var(--border);">
              <input type="color" id="clrHdrText" value="${escapeHtml(headerText)}" style="border:none; width:26px; height:26px; background:none; cursor:pointer;" />
              <div style="flex:1;">
                <div style="font-size:11px; font-weight:500;">Text Color</div>
                <div id="hexHdrText" style="font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--text-muted);">${escapeHtml(headerText)}</div>
              </div>
              <button type="button" class="btn btn-sm hdr-txt-preset" data-hex="#0f172a" title="Dark Text" style="padding:2px 6px; font-size:10px;">Dark</button>
              <button type="button" class="btn btn-sm hdr-txt-preset" data-hex="#ffffff" title="White Text" style="padding:2px 6px; font-size:10px;">White</button>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            ${[
              { label: 'Slate', hex: '#f1f5f9', txt: '#0f172a' },
              { label: 'Ice Blue', hex: '#eff6ff', txt: '#0f172a' },
              { label: 'Mint', hex: '#ecfdf5', txt: '#0f172a' },
              { label: 'Sand', hex: '#f7f4ef', txt: '#0f172a' },
              { label: 'Dark Navy', hex: '#1e293b', txt: '#f8fafc' },
              { label: 'Charcoal', hex: '#171c28', txt: '#f8fafc' },
            ]
              .map(
                (sw) =>
                  `<button type="button" class="btn btn-sm hdr-bg-preset" data-hex="${sw.hex}" data-txt="${sw.txt}" style="padding:3px 7px; font-size:10.5px;">
                    <span style="width:10px; height:10px; border-radius:3px; background:${sw.hex}; border:1px solid rgba(255,255,255,0.2); display:inline-block;"></span>
                    ${sw.label}
                  </button>`
              )
              .join('')}
          </div>
        </div>
        <div class="field-wrap field-full">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label class="field-label" style="margin:0;">Executive Summary / Kurzprofil</label>
            <label class="switch-wrap">
              <span>Show Summary</span>
              <input type="checkbox" class="ui-switch" id="chkShowSummary" ${h.showSummary !== false ? 'checked' : ''} />
            </label>
          </div>
          <textarea class="studio-textarea hdr-field" data-key="summary" rows="4">${escapeHtml(h.summary)}</textarea>
        </div>
      </div>
    </div>

    <div class="section-block">
      <div class="section-block-title">Document Labels &amp; Language Localization</div>
      <div class="field-grid">
        <div class="field-wrap">
          <label class="field-label">Date Locale</label>
          <select class="studio-select lbl-field" data-key="dateLocale">
            <option value="en-US" ${l.dateLocale === 'en-US' ? 'selected' : ''}>English (en-US · Oct 2026)</option>
            <option value="de-DE" ${l.dateLocale === 'de-DE' ? 'selected' : ''}>Deutsch (de-DE · Okt. 2026)</option>
          </select>
        </div>
        <div class="field-wrap">
          <label class="field-label">Git Command Subtitle</label>
          <input type="text" class="studio-input lbl-field" data-key="gitCommand" value="${escapeHtml(l.gitCommand)}" />
        </div>
        <div class="field-wrap">
          <label class="field-label">Present Label ("Present" / "Heute")</label>
          <input type="text" class="studio-input lbl-field" data-key="present" value="${escapeHtml(l.present)}" />
        </div>
        <div class="field-wrap">
          <label class="field-label">Active Badge ("Active" / "Aktiv")</label>
          <input type="text" class="studio-input lbl-field" data-key="ongoing" value="${escapeHtml(l.ongoing)}" />
        </div>
        <div class="field-wrap">
          <label class="field-label">Started Prefix ("Started" / "Start")</label>
          <input type="text" class="studio-input lbl-field" data-key="started" value="${escapeHtml(l.started)}" />
        </div>
        <div class="field-wrap">
          <label class="field-label">Grade Prefix ("GRADE:" / "NOTE:")</label>
          <input type="text" class="studio-input lbl-field" data-key="grade" value="${escapeHtml(l.grade)}" />
        </div>
        <div class="field-wrap">
          <label class="field-label">Legend: Main Branch (Trunk)</label>
          <input type="text" class="studio-input lbl-field" data-key="legendMain" value="${escapeHtml(l.legendMain || 'Main Branch')}" />
        </div>
        <div class="field-wrap">
          <label class="field-label">Legend: Jobs</label>
          <input type="text" class="studio-input lbl-field" data-key="legendJob" value="${escapeHtml(l.legendJob)}" />
        </div>
        <div class="field-wrap">
          <label class="field-label">Legend: Education</label>
          <input type="text" class="studio-input lbl-field" data-key="legendEdu" value="${escapeHtml(l.legendEdu)}" />
        </div>
        <div class="field-wrap">
          <label class="field-label">Legend: Certifications</label>
          <input type="text" class="studio-input lbl-field" data-key="legendCert" value="${escapeHtml(l.legendCert)}" />
        </div>
        <div class="field-wrap">
          <label class="field-label">Legend: Other</label>
          <input type="text" class="studio-input lbl-field" data-key="legendOther" value="${escapeHtml(l.legendOther)}" />
        </div>
        <div class="field-wrap">
          <label class="field-label">Projects Section Heading</label>
          <input type="text" class="studio-input lbl-field" data-key="projectsTitle" value="${escapeHtml(l.projectsTitle)}" />
        </div>
        <div class="field-wrap">
          <label class="field-label">Languages &amp; Interests Heading</label>
          <input type="text" class="studio-input lbl-field" data-key="footerSectionTitle" placeholder="Languages &amp; Beyond Code" value="${escapeHtml(l.footerSectionTitle !== undefined && l.footerSectionTitle !== '' ? l.footerSectionTitle : 'Languages & Beyond Code')}" />
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.contact-key-field').forEach((inp) => {
    inp.addEventListener('input', () => {
      if (!h.contactKeys) h.contactKeys = {};
      h.contactKeys[inp.dataset.key] = inp.value;
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.getElementById('btnAddCustomContact')?.addEventListener('click', () => {
    if (!h.customContacts) h.customContacts = [];
    h.customContacts.push({ enabled: true, label: '', value: 'Custom text', url: '' });
    renderHeaderTab();
    updateLivePreview();
    scheduleAutoSave();
  });

  document.querySelectorAll('.cc-field').forEach((inp) => {
    inp.addEventListener('input', () => {
      h.customContacts[Number(inp.dataset.idx)][inp.dataset.key] = inp.value;
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.cc-enable').forEach((chk) => {
    chk.addEventListener('change', () => {
      h.customContacts[Number(chk.dataset.idx)].enabled = chk.checked;
      renderHeaderTab();
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.cc-del').forEach((btn) => {
    btn.addEventListener('click', () => {
      h.customContacts.splice(Number(btn.dataset.idx), 1);
      renderHeaderTab();
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.hdr-field').forEach((inp) => {
    inp.addEventListener('input', () => {
      h[inp.dataset.key] = inp.value;
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.hdr-bool-field').forEach((chk) => {
    chk.addEventListener('change', () => {
      h[chk.dataset.key] = chk.checked;
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.getElementById('chkShowContactDivider')?.addEventListener('change', (e) => {
    layout.showContactDivider = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('chkShowAvatar')?.addEventListener('change', (e) => {
    h.showAvatar = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('chkShowSummary')?.addEventListener('change', (e) => {
    h.showSummary = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('rngHdrAvatarSize')?.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    layout.avatarSize = val;
    const lbl = document.getElementById('val_hdr_avatarSize');
    if (lbl) lbl.textContent = `${val}px`;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('chkHdrBg')?.addEventListener('change', (e) => {
    layout.showHeaderBg = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('clrHdrBg')?.addEventListener('input', (e) => {
    layout.headerBgColor = e.target.value;
    layout.showHeaderBg = true;
    const chk = document.getElementById('chkHdrBg');
    if (chk) chk.checked = true;
    const hexEl = document.getElementById('hexHdrBg');
    if (hexEl) hexEl.textContent = e.target.value;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('clrHdrText')?.addEventListener('input', (e) => {
    layout.headerTextColor = e.target.value;
    const hexEl = document.getElementById('hexHdrText');
    if (hexEl) hexEl.textContent = e.target.value;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.querySelectorAll('.hdr-txt-preset').forEach((btn) => {
    btn.addEventListener('click', () => {
      layout.headerTextColor = btn.dataset.hex;
      renderHeaderTab();
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.hdr-bg-preset').forEach((btn) => {
    btn.addEventListener('click', () => {
      layout.headerBgColor = btn.dataset.hex;
      if (btn.dataset.txt) layout.headerTextColor = btn.dataset.txt;
      layout.showHeaderBg = true;
      renderHeaderTab();
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.getElementById('inputAvatarUpload')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImageFile(file);
      h.avatar = url;
      renderHeaderTab();
      updateLivePreview();
      scheduleAutoSave();
    } catch (err) {
      alert('Photo upload failed: ' + err.message);
    }
  });

  document.querySelectorAll('.lbl-field').forEach((inp) => {
    inp.addEventListener('input', () => {
      l[inp.dataset.key] = inp.value;
      updateLivePreview();
      scheduleAutoSave();
    });
  });
}

function renderProjectsTab() {
  const layout = currentProfile.layout || (currentProfile.layout = {});
  const projects = currentProfile.projects || (currentProfile.projects = []);
  const languages = currentProfile.languages || (currentProfile.languages = []);
  const interests = currentProfile.interests || (currentProfile.interests = []);

  editorContent.innerHTML = `
    <div class="section-block">
      <div class="section-block-title">
        <label class="switch-wrap">
          <input type="checkbox" class="ui-switch" id="chkShowProjectsSec" ${layout.showProjectsSection !== false ? 'checked' : ''} />
          <span>Selected Projects Section (Master Switch)</span>
        </label>
        <button id="btnAddProject" class="btn btn-sm" style="border-color:#3b82f6; color:#93c5fd;">+ New Project</button>
      </div>
      <div style="${layout.showProjectsSection === false ? 'opacity:0.45;' : ''}">
        ${projects
          .map((proj, idx) => {
            const pId = proj.id || `proj-${idx}`;
            const isOpen = openProjectIds.has(pId);
            return `
              <div class="entry-item ${proj.enabled === false ? 'disabled-entry' : ''} ${isOpen ? 'open' : ''}">
                <div class="entry-header proj-card-header" data-pidx="${idx}">
                  <input type="checkbox" class="ui-switch proj-enable-chk" data-idx="${idx}" ${
                    proj.enabled !== false ? 'checked' : ''
                  } title="Show/Hide this project in CV" />
                  <div class="entry-summary">
                    <div class="entry-summary-title">${escapeHtml(proj.name || 'Untitled Project')}</div>
                    <div class="entry-summary-meta">${escapeHtml(proj.type || '')} · ${escapeHtml(proj.year || '')}</div>
                  </div>
                  <button class="btn btn-sm btn-danger proj-del-btn" data-idx="${idx}" title="Permanently delete project">🗑</button>
                </div>
                <div class="entry-details">
                  <div class="field-grid">
                    <div class="field-wrap">
                      <label class="field-label">Project Name</label>
                      <input type="text" class="studio-input proj-field" data-idx="${idx}" data-key="name" value="${escapeHtml(proj.name)}" />
                    </div>
                    <div class="field-wrap">
                      <label class="field-label">Type / Category &amp; Year</label>
                      <div style="display:flex; gap:6px;">
                        <input type="text" class="studio-input proj-field" style="flex:1;" data-idx="${idx}" data-key="type" placeholder="IoT / Web App" value="${escapeHtml(proj.type)}" />
                        <input type="text" class="studio-input proj-field" style="width:70px;" data-idx="${idx}" data-key="year" placeholder="2025" value="${escapeHtml(proj.year)}" />
                      </div>
                    </div>
                    <div class="field-wrap">
                      <label class="field-label">GitHub Repo URL</label>
                      <input type="text" class="studio-input proj-field" data-idx="${idx}" data-key="repo" value="${escapeHtml(proj.repo)}" />
                    </div>
                    <div class="field-wrap">
                      <label class="field-label">Live Demo URL</label>
                      <input type="text" class="studio-input proj-field" data-idx="${idx}" data-key="demo" value="${escapeHtml(proj.demo)}" />
                    </div>
                    <div class="field-wrap field-full">
                      <label class="field-label">Project Description / Excerpt</label>
                      <textarea class="studio-textarea proj-field" data-idx="${idx}" data-key="excerpt" rows="2">${escapeHtml(proj.excerpt)}</textarea>
                    </div>
                    <div class="field-wrap field-full">
                      <label class="field-label">Tech Stack Tags (comma-separated)</label>
                      <input type="text" class="studio-input proj-tags-field" data-idx="${idx}" value="${escapeHtml((proj.tags || []).join(', '))}" />
                    </div>
                  </div>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    </div>

    <div class="section-block">
      <div class="section-block-title">
        <label class="switch-wrap">
          <input type="checkbox" class="ui-switch" id="chkShowFooterSec" ${layout.showFooterSection !== false ? 'checked' : ''} />
          <span>Languages &amp; Interests Section (Master Switch)</span>
        </label>
      </div>

      <div style="${layout.showFooterSection === false ? 'opacity:0.45;' : ''}">
        <!-- Footer Background & Text Color Controls -->
        <div style="margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid var(--border);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <label class="field-label" style="margin:0;">Footer Full-Width Background &amp; Text Color</label>
            <div style="display:flex; align-items:center; gap:8px;">
              <button type="button" id="btnSyncFooterWithHeader" class="btn btn-sm" style="padding:3px 7px; font-size:10.5px;">⇄ Copy from Header</button>
              <label class="switch-wrap">
                <span>Colored Footer</span>
                <input type="checkbox" class="ui-switch" id="chkFooterBgProjTab" ${layout.showFooterBg !== false ? 'checked' : ''} />
              </label>
            </div>
          </div>
          <div class="field-grid">
            <div style="display:flex; align-items:center; gap:8px; background:var(--bg-input); padding:6px 10px; border-radius:6px; border:1px solid var(--border);">
              <input type="color" id="clrFooterBgProjTab" value="${escapeHtml(layout.footerBgColor || '#f1f5f9')}" style="border:none; width:26px; height:26px; background:none; cursor:pointer;" />
              <div style="flex:1;">
                <div style="font-size:11px; font-weight:500;">Background Color</div>
                <div id="hexFooterBgProjTab" style="font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--text-muted);">${escapeHtml(layout.footerBgColor || '#f1f5f9')}</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px; background:var(--bg-input); padding:6px 10px; border-radius:6px; border:1px solid var(--border);">
              <input type="color" id="clrFooterTextProjTab" value="${escapeHtml(layout.footerTextColor || (isDarkHexColor(layout.footerBgColor || '#f1f5f9') ? '#f8fafc' : '#0f172a'))}" style="border:none; width:26px; height:26px; background:none; cursor:pointer;" />
              <div style="flex:1;">
                <div style="font-size:11px; font-weight:500;">Text Color</div>
                <div id="hexFooterTextProjTab" style="font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--text-muted);">${escapeHtml(layout.footerTextColor || (isDarkHexColor(layout.footerBgColor || '#f1f5f9') ? '#f8fafc' : '#0f172a'))}</div>
              </div>
              <button type="button" class="btn btn-sm ftr-txt-preset" data-hex="#0f172a" title="Dark Text" style="padding:2px 6px; font-size:10px;">Dark</button>
              <button type="button" class="btn btn-sm ftr-txt-preset" data-hex="#ffffff" title="White Text" style="padding:2px 6px; font-size:10px;">White</button>
            </div>
          </div>
        </div>

        <!-- Footer Section Title -->
        <div style="margin-bottom:14px; background:var(--bg-input); padding:9px 12px; border-radius:6px; border:1px solid var(--border);">
          <label class="field-label" style="font-weight:600; font-size:11.5px; margin-bottom:5px; display:block;">Footer Section Heading (Überschrift)</label>
          <input type="text" id="inpFooterTitleProjTab" class="studio-input" style="width:100%;" placeholder="Languages &amp; Beyond Code" value="${escapeHtml(currentProfile.labels?.footerSectionTitle !== undefined && currentProfile.labels.footerSectionTitle !== '' ? currentProfile.labels.footerSectionTitle : 'Languages & Beyond Code')}" />
        </div>

        <!-- Languages Sub-Section -->
        <div style="margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid var(--border);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <label class="switch-wrap">
              <input type="checkbox" class="ui-switch" id="chkShowLangsSub" ${layout.showLanguagesSection !== false ? 'checked' : ''} />
              <strong>Languages Block</strong>
            </label>
            <button id="btnAddLang" class="btn btn-sm">+ Add Language</button>
          </div>
          ${languages
            .map(
              (l, idx) => `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; ${l.enabled === false ? 'opacity:0.48;' : ''}">
              <input type="checkbox" class="ui-switch lang-enable-chk" data-idx="${idx}" ${l.enabled !== false ? 'checked' : ''} title="Show/Hide this language" />
              <input type="text" class="studio-input lang-field" style="width:36%;" data-idx="${idx}" data-key="language" placeholder="Language" value="${escapeHtml(l.language)}" />
              <input type="text" class="studio-input lang-field" style="flex:1;" data-idx="${idx}" data-key="level" placeholder="Proficiency" value="${escapeHtml(l.level)}" />
              <button class="btn btn-sm btn-danger lang-del-btn" data-idx="${idx}" title="Permanently delete">🗑</button>
            </div>
          `
            )
            .join('')}
        </div>

        <!-- Interests Sub-Section -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <label class="switch-wrap">
              <input type="checkbox" class="ui-switch" id="chkShowIntsSub" ${layout.showInterestsSection !== false ? 'checked' : ''} />
              <strong>Interests &amp; Personal Focus Block</strong>
            </label>
            <button id="btnAddInterest" class="btn btn-sm">+ Add Interest</button>
          </div>
          ${interests
            .map(
              (it, idx) => `
            <div style="border:1px solid var(--border); border-radius:6px; padding:8px; margin-bottom:6px; background:#151820; ${it.enabled === false ? 'opacity:0.48;' : ''}">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <input type="checkbox" class="ui-switch int-enable-chk" data-idx="${idx}" ${it.enabled !== false ? 'checked' : ''} title="Show/Hide this interest" />
                <input type="text" class="studio-input int-field" style="flex:1;" data-idx="${idx}" data-key="title" placeholder="Focus Title" value="${escapeHtml(it.title)}" />
                <button class="btn btn-sm btn-danger int-del-btn" data-idx="${idx}" title="Permanently delete">🗑</button>
              </div>
              <textarea class="studio-textarea int-field" style="width:100%; min-height:46px;" data-idx="${idx}" data-key="detail" rows="2">${escapeHtml(it.detail)}</textarea>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;

  document.getElementById('chkShowProjectsSec')?.addEventListener('change', (e) => {
    layout.showProjectsSection = e.target.checked;
    renderProjectsTab();
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('chkShowFooterSec')?.addEventListener('change', (e) => {
    layout.showFooterSection = e.target.checked;
    renderProjectsTab();
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('chkFooterBgProjTab')?.addEventListener('change', (e) => {
    layout.showFooterBg = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('clrFooterBgProjTab')?.addEventListener('input', (e) => {
    layout.footerBgColor = e.target.value;
    layout.showFooterBg = true;
    const chk = document.getElementById('chkFooterBgProjTab');
    if (chk) chk.checked = true;
    const hexEl = document.getElementById('hexFooterBgProjTab');
    if (hexEl) hexEl.textContent = e.target.value;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('clrFooterTextProjTab')?.addEventListener('input', (e) => {
    layout.footerTextColor = e.target.value;
    const hexEl = document.getElementById('hexFooterTextProjTab');
    if (hexEl) hexEl.textContent = e.target.value;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.querySelectorAll('.ftr-txt-preset').forEach((btn) => {
    btn.addEventListener('click', () => {
      layout.footerTextColor = btn.dataset.hex;
      renderProjectsTab();
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.getElementById('btnSyncFooterWithHeader')?.addEventListener('click', () => {
    layout.footerBgColor = layout.headerBgColor || '#f1f5f9';
    if (layout.headerTextColor) layout.footerTextColor = layout.headerTextColor;
    layout.showFooterBg = true;
    renderProjectsTab();
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('inpFooterTitleProjTab')?.addEventListener('input', (e) => {
    if (!currentProfile.labels) currentProfile.labels = {};
    currentProfile.labels.footerSectionTitle = e.target.value;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('chkShowLangsSub')?.addEventListener('change', (e) => {
    layout.showLanguagesSection = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('chkShowIntsSub')?.addEventListener('change', (e) => {
    layout.showInterestsSection = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.querySelectorAll('.proj-card-header').forEach((hdr) => {
    hdr.addEventListener('click', (e) => {
      if (e.target.closest('input') || e.target.closest('button')) return;
      const idx = Number(hdr.dataset.pidx);
      const proj = projects[idx];
      if (!proj) return;
      const pId = proj.id || `proj-${idx}`;
      if (openProjectIds.has(pId)) openProjectIds.delete(pId);
      else openProjectIds.add(pId);
      renderProjectsTab();
    });
  });

  document.getElementById('btnAddProject')?.addEventListener('click', () => {
    const pId = 'project-' + (projects.length + 1);
    projects.push({
      id: pId,
      enabled: true,
      name: 'New Project',
      type: 'Software',
      year: '2026',
      repo: '',
      demo: '',
      excerpt: 'Short summary of the project and its technical impact.',
      tags: ['Python', 'React'],
    });
    openProjectIds.add(pId);
    renderProjectsTab();
    updateLivePreview();
    scheduleAutoSave();
  });

  document.querySelectorAll('.proj-enable-chk').forEach((chk) => {
    chk.addEventListener('change', () => {
      const idx = Number(chk.dataset.idx);
      projects[idx].enabled = chk.checked;
      chk.closest('.entry-item')?.classList.toggle('disabled-entry', !chk.checked);
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.proj-del-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.idx);
      if (!confirm(`Permanently delete project "${projects[idx].name}"? (Tip: Use the green switch on the left to hide it instead!)`)) return;
      projects.splice(idx, 1);
      renderProjectsTab();
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.proj-field').forEach((inp) => {
    inp.addEventListener('input', () => {
      projects[Number(inp.dataset.idx)][inp.dataset.key] = inp.value;
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.proj-tags-field').forEach((inp) => {
    inp.addEventListener('input', () => {
      projects[Number(inp.dataset.idx)].tags = inp.value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.getElementById('btnAddLang')?.addEventListener('click', () => {
    languages.push({ enabled: true, language: 'Language', level: 'Level' });
    renderProjectsTab();
    updateLivePreview();
    scheduleAutoSave();
  });

  document.querySelectorAll('.lang-enable-chk').forEach((chk) => {
    chk.addEventListener('change', () => {
      languages[Number(chk.dataset.idx)].enabled = chk.checked;
      renderProjectsTab();
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.lang-field').forEach((inp) => {
    inp.addEventListener('input', () => {
      languages[Number(inp.dataset.idx)][inp.dataset.key] = inp.value;
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.lang-del-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!confirm('Permanently delete this language?')) return;
      languages.splice(Number(btn.dataset.idx), 1);
      renderProjectsTab();
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.getElementById('btnAddInterest')?.addEventListener('click', () => {
    interests.push({ enabled: true, title: 'Focus Area', detail: 'Details...' });
    renderProjectsTab();
    updateLivePreview();
    scheduleAutoSave();
  });

  document.querySelectorAll('.int-enable-chk').forEach((chk) => {
    chk.addEventListener('change', () => {
      interests[Number(chk.dataset.idx)].enabled = chk.checked;
      renderProjectsTab();
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.int-field').forEach((inp) => {
    inp.addEventListener('input', () => {
      interests[Number(inp.dataset.idx)][inp.dataset.key] = inp.value;
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.int-del-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!confirm('Permanently delete this interest?')) return;
      interests.splice(Number(btn.dataset.idx), 1);
      renderProjectsTab();
      updateLivePreview();
      scheduleAutoSave();
    });
  });
}

function renderLayoutTab() {
  const layout = currentProfile.layout || (currentProfile.layout = {});
  const colors = layout.colors || (layout.colors = { ...DEFAULT_COLORS });
  const headerBg = layout.headerBgColor || '#f1f5f9';
  const footerBg = layout.footerBgColor || '#f1f5f9';

  const sliders = [
    { key: 'fontScale', label: 'Typography Scale (Font Size)', min: 0.8, max: 1.2, step: 0.02, unit: 'x', def: 1 },
    { key: 'avatarSize', label: 'Portrait Photo Size (Right Header)', min: 76, max: 156, step: 2, unit: 'px', def: 116 },
    { key: 'headerPadBottom', label: 'Header Box Bottom Padding (Space above Git Legend)', min: 8, max: 80, step: 2, unit: 'px', def: 30 },
    { key: 'pageMarginMm', label: 'A4 Top/Bottom Page Margin', min: 6, max: 20, step: 1, unit: 'mm', def: 10 },
    { key: 'cardPaddingY', label: 'Commit Card Vertical Padding', min: 4, max: 20, step: 1, unit: 'px', def: 10 },
    { key: 'rowMinHeight', label: 'Detail Commit Row Min-Height', min: 46, max: 110, step: 2, unit: 'px', def: 68 },
    { key: 'startRowMinHeight', label: '"Started" Node Row Min-Height', min: 26, max: 76, step: 2, unit: 'px', def: 44 },
    { key: 'colWidth', label: 'Git Branch Column Spacing', min: 14, max: 32, step: 1, unit: 'px', def: 22 },
    { key: 'graphOffset', label: 'Git Graph Left Offset (Date Margin)', min: 48, max: 96, step: 2, unit: 'px', def: 68 },
    { key: 'contentIndent', label: 'Card Content Left Indent', min: 130, max: 260, step: 2, unit: 'px', def: 188 },
    { key: 'nodeRadius', label: 'Commit Node Circle Radius', min: 3.5, max: 8, step: 0.5, unit: 'px', def: 5 },
    { key: 'lineWidth', label: 'Git Branch Stroke Width', min: 1.5, max: 4.5, step: 0.25, unit: 'px', def: 2.5 },
  ];

  const fontCategories = {};
  Object.values(FONT_FAMILIES).forEach((f) => {
    const cat = f.category || 'Other';
    if (!fontCategories[cat]) fontCategories[cat] = [];
    fontCategories[cat].push(f);
  });

  const fontOptionsHtml = Object.entries(fontCategories)
    .map(
      ([cat, fonts]) => `
      <optgroup label="${escapeHtml(cat)}">
        ${fonts
          .map(
            (f) =>
              `<option value="${f.id}" ${(layout.fontFamily || 'inter') === f.id ? 'selected' : ''}>${escapeHtml(
                f.label
              )}</option>`
          )
          .join('')}
      </optgroup>
    `
    )
    .join('');

  editorContent.innerHTML = `
    <div class="section-block">
      <div class="section-block-title">
        <span>Document Theme, Header &amp; Footer Backgrounds</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:10px;">
        <label class="section-toggle-pill" style="padding:9px 12px;">
          <div>
            <div style="font-weight:600; font-size:12.5px;">🌙 Document Dark Mode</div>
            <div style="font-size:11px; color:var(--text-muted);">Dark A4 background (#0f1117) with crisp white typography</div>
          </div>
          <input type="checkbox" class="ui-switch" id="chkLayoutDarkMode" ${layout.darkMode ? 'checked' : ''} />
        </label>

        <div class="field-grid">
          <div class="field-wrap" style="background:var(--bg-input); padding:8px 10px; border-radius:6px; border:1px solid var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:11.5px; font-weight:600;">Header Background</span>
              <input type="checkbox" class="ui-switch" id="chkLayoutHeaderBg" ${layout.showHeaderBg !== false ? 'checked' : ''} title="Enable/Disable colored header background" />
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="color" id="clrLayoutHeaderBg" value="${escapeHtml(headerBg)}" style="border:none; width:26px; height:26px; background:none; cursor:pointer;" />
              <span id="hexLayoutHeaderBg" style="font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--text-muted);">${escapeHtml(headerBg)}</span>
            </div>
          </div>

          <div class="field-wrap" style="background:var(--bg-input); padding:8px 10px; border-radius:6px; border:1px solid var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:11.5px; font-weight:600;">Footer Background</span>
              <input type="checkbox" class="ui-switch" id="chkLayoutFooterBg" ${layout.showFooterBg !== false ? 'checked' : ''} title="Enable/Disable colored footer background" />
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="color" id="clrLayoutFooterBg" value="${escapeHtml(footerBg)}" style="border:none; width:26px; height:26px; background:none; cursor:pointer;" />
              <span id="hexLayoutFooterBg" style="font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--text-muted);">${escapeHtml(footerBg)}</span>
            </div>
          </div>
        </div>

        <div class="field-wrap" style="background:var(--bg-input); padding:8px 10px; border-radius:6px; border:1px solid var(--border);">
          <label class="field-label" style="font-weight:600; font-size:11.5px; margin-bottom:4px; display:block;">Footer Section Title (Überschrift)</label>
          <input type="text" id="inpFooterTitleLayoutTab" class="studio-input" style="width:100%;" placeholder="Languages &amp; Beyond Code" value="${escapeHtml(currentProfile.labels?.footerSectionTitle !== undefined && currentProfile.labels.footerSectionTitle !== '' ? currentProfile.labels.footerSectionTitle : 'Languages & Beyond Code')}" />
        </div>

        <div class="field-wrap" style="background:var(--bg-input); padding:10px 12px; border-radius:6px; border:1px solid var(--border);">
          <label class="field-label" style="font-weight:600; font-size:12px; margin-bottom:6px; display:block;">Font Family (Schriftart — 22 verfügbare Schriften)</label>
          <select id="selFontFamily" class="studio-select" style="width:100%; font-size:12px; padding:6px 8px;">
            ${fontOptionsHtml}
          </select>
        </div>

        <div class="field-wrap" style="background:var(--bg-input); padding:9px 12px; border-radius:6px; border:1px solid var(--border);">
          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
            <div>
              <div style="font-weight:600; font-size:12px;">Schriftart auf alle Texte anwenden (auch Git-Bereich)</div>
              <div style="font-size:10.5px; color:var(--text-muted);">Einheitliche Typografie für das gesamte Dokument inkl. Git-Timeline, Daten, Badges &amp; Labels</div>
            </div>
            <input type="checkbox" class="ui-switch" id="chkFontScopeAll" ${layout.fontScope !== 'content' ? 'checked' : ''} />
          </label>
        </div>

        <div class="field-wrap" style="background:var(--bg-input); padding:9px 12px; border-radius:6px; border:1px solid var(--border);">
          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
            <div>
              <div style="font-weight:600; font-size:12px;">Divider line below Subtitle</div>
              <div style="font-size:10.5px; color:var(--text-muted);">Horizontal divider line between subtitle and contact items</div>
            </div>
            <input type="checkbox" class="ui-switch" id="chkLayoutContactDivider" ${layout.showContactDivider !== false ? 'checked' : ''} />
          </label>
        </div>
      </div>
    </div>

    <div class="section-block">
      <div class="section-block-title">
        <span>Fine-Tuning: Size &amp; Color per Element</span>
        <button id="btnResetTypo" class="btn btn-sm">↺ Reset All</button>
      </div>
      ${[
        { group: 'Header' },
        { key: 'name', label: 'Name (Headline)', def: 34, min: 18, max: 60, step: 1 },
        { key: 'headline', label: 'Subtitle', def: 13.5, min: 8, max: 26, step: 0.5 },
        { key: 'contactBorder', label: 'Subtitle Divider Line', def: null },
        { key: 'contacts', label: 'Contact Items (Text)', def: 10, min: 6, max: 18, step: 0.5 },
        { key: 'contactKey', label: 'Contact Labels (loc:, mail: …)', def: null },
        { key: 'summaryBorder', label: 'Summary Divider Line', def: null },
        { key: 'summary', label: 'Profile Text', def: 11, min: 7, max: 18, step: 0.5 },
        { group: 'Footer' },
        { key: 'footerTitle', label: 'Footer Title', def: 17, min: 10, max: 32, step: 0.5 },
        { key: 'footerLabel', label: 'Footer Box Labels', def: 9, min: 6, max: 16, step: 0.5 },
        { key: 'footerText', label: 'Footer Text (Languages & Interests)', def: 10.5, min: 7, max: 18, step: 0.5 },
      ]
        .map((t) => {
          if (t.group) {
            return `<div style="font-family:'JetBrains Mono',monospace; font-size:10.5px; text-transform:uppercase; letter-spacing:0.08em; color:#93c5fd; margin:10px 0 6px;">${t.group}</div>`;
          }
          const cfg = (layout.typo && layout.typo[t.key]) || {};
          const size = cfg.size ?? t.def;
          const hasColor = Boolean(cfg.color);
          return `
          <div style="background:var(--bg-input); border:1px solid var(--border); border-radius:6px; padding:7px 10px; margin-bottom:6px;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
              <span style="font-size:11.5px; font-weight:500;">${escapeHtml(t.label)}</span>
              <div style="display:flex; align-items:center; gap:6px;">
                <span id="typoColorState_${t.key}" style="font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--text-muted);">${hasColor ? escapeHtml(cfg.color) : 'auto'}</span>
                <input type="color" class="typo-color" data-key="${t.key}" value="${escapeHtml(cfg.color || '#888888')}" title="Text color" style="border:none; width:24px; height:24px; background:none; cursor:pointer;" />
                <button type="button" class="btn btn-sm typo-color-reset" data-key="${t.key}" title="Back to automatic color" style="padding:2px 6px; font-size:10px;">auto</button>
              </div>
            </div>
            ${
              t.def === null
                ? ''
                : `<div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
                    <input type="range" class="typo-size" data-key="${t.key}" min="${t.min}" max="${t.max}" step="${t.step}" value="${size}" style="flex:1;" />
                    <span class="slider-val" id="typoSizeVal_${t.key}" style="min-width:42px; text-align:right;">${size}px</span>
                  </div>`
            }
          </div>`;
        })
        .join('')}
    </div>

    <div class="section-block">
      <div class="section-block-title">
        <span>Spacing, Typography &amp; Graph Geometry</span>
        <button id="btnResetLayout" class="btn btn-sm">↺ Reset Defaults</button>
      </div>
      ${sliders
        .map((s) => {
          const val = layout[s.key] ?? s.def;
          return `
          <div class="slider-row">
            <div class="slider-top">
              <span>${escapeHtml(s.label)}</span>
              <span class="slider-val" id="val_${s.key}">${val}${s.unit}</span>
            </div>
            <input type="range" class="layout-slider" data-key="${s.key}" data-unit="${s.unit}" min="${s.min}" max="${s.max}" step="${s.step}" value="${val}" />
          </div>
        `;
        })
        .join('')}
    </div>

    <div class="section-block">
      <div class="section-block-title">
        <span>Git Graph Legend &amp; Category Colors</span>
        <button id="btnResetColors" class="btn btn-sm">↺ Default Colors</button>
      </div>
      <label class="section-toggle-pill" style="padding:7px 12px; margin-bottom:10px;">
        <div>
          <div style="font-weight:600; font-size:12px;">Show Git Legend Bar</div>
          <div style="font-size:10.5px; color:var(--text-muted);">Displays the branch color legend under the header</div>
        </div>
        <input type="checkbox" class="ui-switch" id="chkShowLegend" ${layout.showLegend !== false ? 'checked' : ''} />
      </label>

      <div style="display:flex; flex-direction:column; gap:8px;">
        ${[
          { key: 'main', labelKey: 'legendMain', defLabel: 'Main Branch', desc: 'main / trunk branch' },
          { key: 'job', labelKey: 'legendJob', defLabel: 'Work Experience', desc: 'Job / Employment' },
          { key: 'edu', labelKey: 'legendEdu', defLabel: 'Education', desc: 'University / School' },
          { key: 'cert', labelKey: 'legendCert', defLabel: 'Certifications', desc: 'Point Commit Certs' },
          { key: 'other', labelKey: 'legendOther', defLabel: 'Other', desc: 'Extracurricular / Other' },
        ]
          .map((c) => {
            const isVis = (layout.legendVisibility || {})[c.key] !== false;
            const currLabel = currentProfile.labels?.[c.labelKey] || c.defLabel;
            const currColor = colors[c.key] || DEFAULT_COLORS[c.key];
            return `
              <div style="display:flex; align-items:center; gap:8px; background:var(--bg-input); padding:7px 10px; border-radius:6px; border:1px solid var(--border);">
                <input type="checkbox" class="ui-switch leg-vis-chk" data-key="${c.key}" ${isVis ? 'checked' : ''} title="Show/hide in CV legend" />
                <input type="color" class="color-picker" data-key="${c.key}" value="${escapeHtml(currColor)}" style="border:none; width:26px; height:26px; background:none; cursor:pointer;" />
                <div style="flex:1;">
                  <input type="text" class="studio-input leg-lbl-inp" data-key="${c.labelKey}" value="${escapeHtml(currLabel)}" style="padding:4px 8px; font-size:11.5px;" placeholder="${escapeHtml(c.defLabel)}" />
                </div>
                <span style="font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--text-muted); min-width:54px;" id="hex_${c.key}">${escapeHtml(currColor)}</span>
              </div>
            `;
          })
          .join('')}
      </div>
    </div>
  `;

  document.getElementById('selFontFamily')?.addEventListener('change', (e) => {
    layout.fontFamily = e.target.value;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('chkFontScopeAll')?.addEventListener('change', (e) => {
    layout.fontScope = e.target.checked ? 'all' : 'content';
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('chkLayoutContactDivider')?.addEventListener('change', (e) => {
    layout.showContactDivider = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('inpFooterTitleLayoutTab')?.addEventListener('input', (e) => {
    if (!currentProfile.labels) currentProfile.labels = {};
    currentProfile.labels.footerSectionTitle = e.target.value;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('chkShowLegend')?.addEventListener('change', (e) => {
    layout.showLegend = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.querySelectorAll('.leg-vis-chk').forEach((chk) => {
    chk.addEventListener('change', () => {
      if (!layout.legendVisibility) layout.legendVisibility = {};
      layout.legendVisibility[chk.dataset.key] = chk.checked;
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.leg-lbl-inp').forEach((inp) => {
    inp.addEventListener('input', () => {
      if (!currentProfile.labels) currentProfile.labels = {};
      currentProfile.labels[inp.dataset.key] = inp.value;
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  const ensureTypo = (key) => {
    if (!layout.typo) layout.typo = {};
    if (!layout.typo[key]) layout.typo[key] = {};
    return layout.typo[key];
  };

  document.querySelectorAll('.typo-size').forEach((rng) => {
    rng.addEventListener('input', () => {
      const key = rng.dataset.key;
      ensureTypo(key).size = Number(rng.value);
      const lbl = document.getElementById(`typoSizeVal_${key}`);
      if (lbl) lbl.textContent = `${rng.value}px`;
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.typo-color').forEach((pk) => {
    pk.addEventListener('input', () => {
      const key = pk.dataset.key;
      ensureTypo(key).color = pk.value;
      const st = document.getElementById(`typoColorState_${key}`);
      if (st) st.textContent = pk.value;
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.querySelectorAll('.typo-color-reset').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      if (layout.typo && layout.typo[key]) delete layout.typo[key].color;
      renderLayoutTab();
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.getElementById('btnResetTypo')?.addEventListener('click', () => {
    layout.typo = {};
    renderLayoutTab();
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('chkLayoutDarkMode')?.addEventListener('change', (e) => {
    layout.darkMode = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('chkLayoutHeaderBg')?.addEventListener('change', (e) => {
    layout.showHeaderBg = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('clrLayoutHeaderBg')?.addEventListener('input', (e) => {
    layout.headerBgColor = e.target.value;
    layout.showHeaderBg = true;
    const chk = document.getElementById('chkLayoutHeaderBg');
    if (chk) chk.checked = true;
    const hexEl = document.getElementById('hexLayoutHeaderBg');
    if (hexEl) hexEl.textContent = e.target.value;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('chkLayoutFooterBg')?.addEventListener('change', (e) => {
    layout.showFooterBg = e.target.checked;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.getElementById('clrLayoutFooterBg')?.addEventListener('input', (e) => {
    layout.footerBgColor = e.target.value;
    layout.showFooterBg = true;
    const chk = document.getElementById('chkLayoutFooterBg');
    if (chk) chk.checked = true;
    const hexEl = document.getElementById('hexLayoutFooterBg');
    if (hexEl) hexEl.textContent = e.target.value;
    updateLivePreview();
    scheduleAutoSave();
  });

  document.querySelectorAll('.layout-slider').forEach((rng) => {
    rng.addEventListener('input', () => {
      const key = rng.dataset.key;
      const unit = rng.dataset.unit;
      const num = Number(rng.value);
      layout[key] = num;
      const lbl = document.getElementById(`val_${key}`);
      if (lbl) lbl.textContent = `${num}${unit}`;
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.getElementById('btnResetLayout')?.addEventListener('click', () => {
    sliders.forEach((s) => {
      layout[s.key] = s.def;
    });
    renderLayoutTab();
    updateLivePreview();
    scheduleAutoSave();
  });

  document.querySelectorAll('.color-picker').forEach((pk) => {
    pk.addEventListener('input', () => {
      const key = pk.dataset.key;
      colors[key] = pk.value;
      const hexEl = document.getElementById(`hex_${key}`);
      if (hexEl) hexEl.textContent = pk.value;
      updateLivePreview();
      scheduleAutoSave();
    });
  });

  document.getElementById('btnResetColors')?.addEventListener('click', () => {
    Object.assign(colors, DEFAULT_COLORS);
    renderLayoutTab();
    updateLivePreview();
    scheduleAutoSave();
  });
}

// ==================== GLOBAL TOOLBAR EVENTS ====================

document.querySelectorAll('.editor-tab').forEach((tabBtn) => {
  tabBtn.addEventListener('click', () => {
    document.querySelectorAll('.editor-tab').forEach((b) => b.classList.remove('active'));
    tabBtn.classList.add('active');
    activeTab = tabBtn.dataset.tab;
    renderEditor();
  });
});

profileSelect.addEventListener('change', () => {
  const found = profiles.find((p) => p.id === profileSelect.value);
  if (found) {
    currentProfile = found;
    renderEditor();
    updateLivePreview();
    if (previewMode === 'pdf') refreshNativePdfPreview();
  }
});

btnDuplicateProfile.addEventListener('click', async () => {
  if (!currentProfile) return;
  const name = prompt('Name for the new application profile:', `${currentProfile.name} (Copy)`);
  if (!name) return;
  const copy = JSON.parse(JSON.stringify(currentProfile));
  copy.name = name;
  copy.id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
  currentProfile = copy;
  profiles.push(copy);
  await saveCurrentProfileToServer();
  renderProfileDropdown();
  renderEditor();
  updateLivePreview();
});

btnRenameProfile.addEventListener('click', async () => {
  if (!currentProfile) return;
  const name = prompt('New profile name:', currentProfile.name);
  if (!name) return;
  currentProfile.name = name;
  await saveCurrentProfileToServer();
  renderProfileDropdown();
});

btnDeleteProfile.addEventListener('click', async () => {
  if (!currentProfile) return;
  if (profiles.length <= 1) {
    alert('Cannot delete the last remaining profile.');
    return;
  }
  if (!confirm(`Delete profile "${currentProfile.name}"?`)) return;
  const delId = currentProfile.id;
  const res = await fetch(`/api/profiles/${encodeURIComponent(delId)}`, { method: 'DELETE' });
  if (res.ok) {
    profiles = profiles.filter((p) => p.id !== delId);
    currentProfile = profiles[0];
    renderProfileDropdown();
    renderEditor();
    updateLivePreview();
  }
});

btnExportJson.addEventListener('click', () => {
  if (!currentProfile) return;
  const blob = new Blob([JSON.stringify(currentProfile, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentProfile.id || 'cv-profile'}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

inputImportJson.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const imported = JSON.parse(reader.result);
      imported.id = (imported.id || file.name.replace(/\.json$/i, '')) + '-' + Date.now().toString().slice(-3);
      imported.name = imported.name || imported.id;
      profiles.push(imported);
      currentProfile = imported;
      await saveCurrentProfileToServer();
      renderProfileDropdown();
      renderEditor();
      updateLivePreview();
    } catch (err) {
      alert('Invalid profile JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
});

modeLiveBtn.addEventListener('click', () => {
  previewMode = 'live';
  modeLiveBtn.classList.add('active');
  modePdfBtn.classList.remove('active');
  liveSheetWrap.style.display = 'block';
  nativePdfIframe.style.display = 'none';
  btnRefreshPdfPreview.style.display = 'none';
  updateLivePreview();
});

modePdfBtn.addEventListener('click', () => {
  previewMode = 'pdf';
  modePdfBtn.classList.add('active');
  modeLiveBtn.classList.remove('active');
  liveSheetWrap.style.display = 'none';
  nativePdfIframe.style.display = 'block';
  btnRefreshPdfPreview.style.display = 'inline-flex';
  refreshNativePdfPreview();
});

btnRefreshPdfPreview.addEventListener('click', () => {
  refreshNativePdfPreview();
});

document.getElementById('chkToolbarDarkMode')?.addEventListener('change', (e) => {
  if (!currentProfile) return;
  if (!currentProfile.layout) currentProfile.layout = {};
  currentProfile.layout.darkMode = e.target.checked;
  if (activeTab === 'layout') renderLayoutTab();
  updateLivePreview();
  scheduleAutoSave();
  if (previewMode === 'pdf') refreshNativePdfPreview();
});

zoomSelect.addEventListener('change', () => {
  const z = Number(zoomSelect.value) || 1;
  liveSheetWrap.style.transform = `scale(${z})`;
});

btnExportPdf.addEventListener('click', () => {
  downloadNativePdf();
});

init();
