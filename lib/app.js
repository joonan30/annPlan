// ============================================================
// annPlan - Main App Logic
// ============================================================

(function() {
  'use strict';

  const D = RESEARCH_DATA;
  const T = (typeof TRACKING_DATA !== 'undefined') ? TRACKING_DATA : { tasks: {}, phases: {}, papers: {} };
  if (!T.papers) T.papers = {};
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 7);

  // ── State ─────────────────────────────────────────────
  let dirty = false;
  let saveTimer = null;
  let isServerMode = false;

  // Detect server mode
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    fetch('/save-tracking', { method: 'OPTIONS' })
      .then(() => { isServerMode = true; updateSaveUI(); })
      .catch(() => { isServerMode = false; });
  }

  // ── Utilities ─────────────────────────────────────────
  function pm(s) { const [y, m] = s.split("-").map(Number); return new Date(y, m - 1, 1); }
  function md(a, b) { return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()); }
  function fm(s) { const [y, m] = s.split("-"); return y + "." + m; }
  function pct(p) {
    const s = pm(p.start), e = pm(p.end), t = md(s, e);
    const el = Math.max(0, Math.min(t, md(s, today)));
    return t > 0 ? Math.round(el / t * 100) : 0;
  }
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function todayISO() { return new Date().toISOString(); }
  function todayDate() { return new Date().toISOString().slice(0, 10); }

  // Task index: id → { project, phaseIdx, taskIdx, task }
  const taskIndex = {};
  D.projects.forEach(p => {
    p.phases.forEach((ph, pi) => {
      (ph.tasks || []).forEach((t, ti) => {
        if (t && t.id) {
          taskIndex[t.id] = { project: p, phaseIdx: pi, taskIdx: ti, task: t };
        }
      });
    });
  });

  // Member index
  const memberIndex = {};
  (D.members || []).forEach(m => { memberIndex[m.id] = m; });

  // ── Tracking helpers ──────────────────────────────────
  function getTaskTracking(taskId) { return T.tasks[taskId] || {}; }
  function setTaskTracking(taskId, data) {
    if (!T.tasks[taskId]) T.tasks[taskId] = {};
    Object.assign(T.tasks[taskId], data);
    markDirty();
  }
  function getPhaseTracking(phaseKey) { return T.phases[phaseKey] || {}; }
  function setPhaseTracking(phaseKey, data) {
    if (!T.phases[phaseKey]) T.phases[phaseKey] = {};
    Object.assign(T.phases[phaseKey], data);
    markDirty();
  }
  function getPaperTracking(paperId) { return T.papers[paperId] || {}; }
  function setPaperTracking(paperId, data) {
    if (!T.papers[paperId]) T.papers[paperId] = {};
    Object.assign(T.papers[paperId], data);
    markDirty();
  }

  function markDirty() {
    dirty = true;
    updateSaveUI();
    if (isServerMode) {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveToServer, 2000);
    }
  }

  // ── Save/Load ─────────────────────────────────────────
  function generateTrackingJS() {
    T.lastSaved = todayISO();
    const json = JSON.stringify(T, null, 2);
    return '// ============================================================\n' +
      '// annPlan - \uCD94\uC801 \uB370\uC774\uD130 (\uC790\uB3D9 \uC0DD\uC131/\uC218\uC815\uB428)\n' +
      '// \uC774 \uD30C\uC77C\uC740 \uC790\uB3D9 \uC800\uC7A5\uB429\uB2C8\uB2E4. \uC9C1\uC811 \uD3B8\uC9D1\uD558\uC9C0 \uB9C8\uC138\uC694.\n' +
      '// ============================================================\n\nconst TRACKING_DATA = ' + json + ';\n';
  }

  function saveToServer() {
    const body = generateTrackingJS();
    const dot = document.getElementById('saveDot');
    if (dot) { dot.className = 'save-dot saving'; }

    fetch('/save-tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: body
    })
    .then(r => { if (r.ok) { dirty = false; updateSaveUI(); } })
    .catch(() => { isServerMode = false; updateSaveUI(); });
  }

  function saveAsDownload() {
    const body = generateTrackingJS();
    const blob = new Blob([body], { type: 'text/javascript' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tracking.js';
    a.click();
    URL.revokeObjectURL(a.href);
    dirty = false;
    updateSaveUI();
  }

  function updateSaveUI() {
    const dot = document.getElementById('saveDot');
    const text = document.getElementById('saveText');
    const btn = document.getElementById('saveBtn');
    if (!dot) return;

    if (dirty) {
      dot.className = 'save-dot unsaved';
      text.textContent = '\uBBF8\uC800\uC7A5 \uBCC0\uACBD';
      if (btn) {
        btn.style.display = 'inline-block';
        btn.disabled = false;
        btn.textContent = isServerMode ? '\uC800\uC7A5 \uC911...' : '\uB2E4\uC6B4\uB85C\uB4DC \uC800\uC7A5';
      }
    } else {
      dot.className = 'save-dot saved';
      text.textContent = T.lastSaved
        ? '\uC800\uC7A5: ' + new Date(T.lastSaved).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '\uBCC0\uACBD \uC5C6\uC74C';
      if (btn) {
        btn.style.display = isServerMode ? 'none' : 'inline-block';
        btn.disabled = true;
        btn.textContent = '\uC800\uC7A5 \uC644\uB8CC';
      }
    }
  }

  window.addEventListener('beforeunload', function(e) {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  // ── Header ────────────────────────────────────────────
  document.getElementById("hSub").textContent = D.meta.owner + " \xB7 " + D.meta.affiliation;
  document.getElementById("hDate").innerHTML =
    today.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) +
    '<br><span style="font-size:10px">\uC5C5\uB370\uC774\uD2B8: ' + D.meta.lastUpdated + "</span>";

  // Save button handler
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      if (!dirty) return;
      if (isServerMode) saveToServer(); else saveAsDownload();
    });
  }
  updateSaveUI();

  // ── Stats ─────────────────────────────────────────────
  (function() {
    const a = D.projects.filter(p => p.status === "active");
    const pi = a.filter(p => p.role === "\uCC45\uC784").length;
    const co = a.filter(p => p.role !== "\uCC45\uC784").length;
    const ending = a.filter(p => { const d = md(today, pm(p.end)); return d <= 6 && d >= 0; }).length;
    const budget = a.reduce((s, p) => s + p.annualBudget, 0);
    const paperCount = (D.papers || []).length;
    document.getElementById("stats").innerHTML =
      '<div class="stat-card s1"><div class="sv">' + a.length + '</div><div class="sl">\uC9C4\uD589\uC911 (\uCC45\uC784 ' + pi + ' / \uACF5\uB3D9\xB7\uCC38\uC5EC ' + co + ')</div></div>' +
      '<div class="stat-card s2"><div class="sv">' + ending + '</div><div class="sl">6\uAC1C\uC6D4\uB0B4 \uC885\uB8CC</div></div>' +
      '<div class="stat-card s3"><div class="sv">' + (budget / 10000).toFixed(1) + '\uC5B5</div><div class="sl">\uB2F9\uD574\uB144\uB3C4 \uCD1D \uC5F0\uAD6C\uBE44</div></div>' +
      '<div class="stat-card s4"><div class="sv">' + paperCount + '</div><div class="sl">\uB17C\uBB38 \uAD00\uB9AC\uC911</div></div>';
  })();

  // ── Milestones ────────────────────────────────────────
  (function() {
    const all = [...D.milestones].sort((a, b) => a.date.localeCompare(b.date));
    const upcoming = all.filter(m => m.date >= todayStr).slice(0, 8);
    const past = all.filter(m => m.date < todayStr).slice(-2);
    const shown = [...past, ...upcoming];
    document.getElementById("msList").innerHTML = shown.map(m => {
      const p = D.projects.find(x => x.id === m.project);
      return '<div class="ms-item ' + (m.date < todayStr ? 'past' : '') + '"><span class="ms-date">' + fm(m.date) + '</span><span class="ms-dot ' + m.type + '"></span><span class="ms-proj" style="color:' + (p ? p.color : '#666') + '">' + (p ? p.shortName : m.project) + '</span><span class="ms-label">' + m.label + '</span></div>';
    }).join("") || '<div style="padding:16px;text-align:center;color:var(--text2);font-size:12px">\uC77C\uC815 \uC5C6\uC74C</div>';
  })();

  // ── Gantt ─────────────────────────────────────────────
  (function() {
    const projects = D.projects.slice().sort((a, b) => a.start.localeCompare(b.start));
    let minD = "2099-01", maxD = "2000-01";
    projects.forEach(p => { if (p.start < minD) minD = p.start; if (p.end > maxD) maxD = p.end; });
    const sy = parseInt(minD), ey = parseInt(maxD) + 1, years = [];
    for (let y = sy; y <= ey; y++) years.push(y);
    const tm = (ey - sy + 1) * 12;
    const ts = new Date(sy, 0, 1);
    const gp = s => { const d = pm(s); return md(ts, d) / tm * 100; };

    let h = '<div class="gantt-header"><div class="g-label">\uD504\uB85C\uC81D\uD2B8</div><div class="g-timeline">';
    years.forEach(y => { h += '<div class="g-year">' + y + '</div>'; });
    h += '</div></div>';

    let rh = "";
    projects.forEach(p => {
      const dc = p.status === "active" ? "#22c55e" : "#9ca3af";
      rh += '<div class="g-row"><div class="g-label"><span class="dot" style="background:' + dc + '"></span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + esc(p.name) + '">' + p.shortName + '</span></div><div class="g-bars">';
      years.forEach(y => { rh += '<div class="g-grid" style="left:' + gp(y + "-01") + '%"></div>'; });
      p.phases.forEach(ph => {
        const l = gp(ph.start), r = gp(ph.end), w = r - l;
        const lb = w > 3.5 ? ph.name : "";
        rh += '<div class="g-bar ' + ph.status + '" style="left:' + l + '%;width:' + w + '%;background:' + p.color + '" data-tooltip="' + esc(p.name) + '|' + ph.name + '|' + fm(ph.start) + '~' + fm(ph.end) + '|' + (ph.status === 'active' ? '\uC9C4\uD589\uC911' : ph.status === 'completed' ? '\uC644\uB8CC' : '\uC608\uC815') + (ph.topic && ph.topic !== 'TODO' ? '|' + esc(ph.topic) : '') + '">' + lb + '</div>';
      });
      rh += '</div></div>';
    });
    const tp = gp(todayStr);
    rh += '<div class="g-today" style="left:calc(160px + (100% - 160px) * ' + (tp / 100) + ')"></div>';
    const el = document.getElementById("gantt");
    el.innerHTML = h + '<div style="position:relative">' + rh + '</div>';
    const tl = document.createElement("div"); tl.className = "g-today-lbl"; tl.textContent = "Today";
    tl.style.left = 'calc(160px + (100% - 160px) * ' + (tp / 100) + ')';
    el.appendChild(tl);

    document.getElementById("gLeg").innerHTML =
      '<div class="legend-item"><div class="legend-sw" style="background:#22c55e"></div>\uC9C4\uD589\uC911</div>' +
      '<div class="legend-item"><div class="legend-sw" style="background:#888;opacity:.6"></div>\uC644\uB8CC</div>' +
      '<div class="legend-item"><div class="legend-sw" style="background:#888;opacity:.3"></div>\uC608\uC815</div>' +
      '<div class="legend-item"><div style="width:14px;height:2px;background:var(--today)"></div>\uC624\uB298</div>';
  })();

  // ── Phase Detail with Tracking ────────────────────────
  function computePhaseProgress(p, phaseIdx) {
    const ph = p.phases[phaseIdx];
    const tasks = ph.tasks || [];
    if (tasks.length === 0) return 0;
    const done = tasks.filter(t => t.id && getTaskTracking(t.id).completed).length;
    return Math.round(done / tasks.length * 100);
  }

  function renderPhaseDetail() {
    const el = document.getElementById("phaseDetail");
    el.innerHTML = D.projects.map((p, idx) => {
      const prog = pct(p);
      const phHtml = p.phases.map((ph, phIdx) => {
        const phaseKey = p.id + '-' + phIdx;
        const phTrack = getPhaseTracking(phaseKey);
        const tasks = ph.tasks || [];
        const taskProgress = computePhaseProgress(p, phIdx);

        let progressHtml = '';
        if (tasks.length > 0) {
          const doneCount = tasks.filter(t => t.id && getTaskTracking(t.id).completed).length;
          const color = taskProgress === 100 ? '#22c55e' : p.color;
          progressHtml = '<div class="pd-progress"><div class="pd-progress-bar"><div class="pd-progress-fill" style="width:' + taskProgress + '%;background:' + color + '"></div></div><span class="pd-progress-text" style="color:' + color + '">' + doneCount + '/' + tasks.length + '</span></div>';
        }

        const tasksHtml = tasks.length ? '<ul class="pd-tasks">' + tasks.map(t => {
          if (!t || !t.id) return '';
          const tr = getTaskTracking(t.id);
          const checked = tr.completed;
          const hasNote = tr.notes && tr.notes.trim();
          const connections = (D.taskConnections || []).filter(c => c.from === t.id || c.to === t.id);
          const showLinks = (t.links && t.links.length > 0) || connections.length > 0;

          let html = '<li class="' + (checked ? 'completed-task' : '') + '" id="task-' + t.id + '">';
          html += '<div class="task-checkbox' + (checked ? ' checked' : '') + '" data-task-id="' + t.id + '"></div>';
          html += '<span class="task-text">' + esc(t.text) + '</span>';
          if (checked && tr.completedAt) {
            html += '<span class="task-completed-date">' + tr.completedAt + '</span>';
          }
          html += '<div class="task-actions">';
          html += '<button class="task-btn' + (hasNote ? ' has-note' : '') + '" data-note-task="' + t.id + '" title="\uBA54\uBAA8">&#128221;</button>';
          if (showLinks) {
            html += '<button class="task-btn has-links" data-links-task="' + t.id + '" title="\uC5F0\uACB0\uB41C \uC791\uC5C5">&#128279;</button>';
          }
          html += '</div></li>';
          if (hasNote) {
            html += '<li style="list-style:none;padding:0"><div class="task-note-display" data-note-edit="' + t.id + '">' + esc(tr.notes) + '</div></li>';
          }
          return html;
        }).join('') + '</ul>' : '';

        const delHtml = ph.deliverables && ph.deliverables.length
          ? '<div class="pd-deliverables">' + ph.deliverables.map(d => '<span class="pd-del-tag">' + esc(d) + '</span>').join("") + '</div>'
          : '';

        let phaseNoteHtml = '';
        if (phTrack.notes && phTrack.notes.trim()) {
          phaseNoteHtml = '<div class="pd-phase-note-display" data-phase-note-edit="' + phaseKey + '">' + esc(phTrack.notes) + '</div>';
        } else {
          phaseNoteHtml = '<button class="pd-phase-note-btn" data-phase-note-add="' + phaseKey + '">+ \uC5F0\uCC28 \uBA54\uBAA8 \uCD94\uAC00</button>';
        }

        const stLabel = ph.status === "active" ? "\uC9C4\uD589\uC911" : ph.status === "completed" ? "\uC644\uB8CC" : "\uC608\uC815";
        return '<div class="pd-phase ' + ph.status + '">' +
          '<div class="pd-phase-dot ' + ph.status + '"></div>' +
          '<div class="pd-phase-head">' +
          '<span class="pd-phase-name">' + ph.name + '</span>' +
          '<span class="pd-phase-date">' + fm(ph.start) + ' ~ ' + fm(ph.end) + '</span>' +
          '<span class="pd-phase-status ' + ph.status + '">' + stLabel + '</span></div>' +
          (ph.stage ? '<div class="pd-stage">' + ph.stage + '</div>' : '') +
          (ph.topic && ph.topic !== "TODO" ? '<div class="pd-topic" style="border-color:' + p.color + '">' + esc(ph.topic) + '</div>' : '') +
          progressHtml +
          tasksHtml +
          delHtml +
          '<div class="pd-phase-note">' + phaseNoteHtml + '</div>' +
          '</div>';
      }).join("");

      // Members assigned to this project
      const projMembers = (D.members || []).filter(m => m.projects && m.projects.includes(p.id));
      const membersHtml = projMembers.length > 0
        ? '<div style="padding:4px 20px 8px;display:flex;flex-wrap:wrap;gap:4px;align-items:center"><span style="font-size:10px;color:var(--text2);margin-right:4px">\uCC38\uC5EC\uC6D0:</span>' +
          projMembers.map(m => '<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:#f3f4f6;font-weight:500">' + m.name + ' <span style="color:var(--text2)">' + m.position + '</span></span>').join('') + '</div>'
        : '';

      return '<div class="pd-project">' +
        '<div class="pd-header" data-toggle-pd="' + idx + '">' +
        '<div class="pd-header-left">' +
        '<div class="pd-color" style="background:' + p.color + '"></div>' +
        '<div><div class="pd-title">' + p.shortName + '</div>' +
        '<div class="pd-sub">' + p.funder + ' \xB7 ' + p.program + ' \xB7 ' + fm(p.start) + '~' + fm(p.end) + '</div></div></div>' +
        '<div style="display:flex;align-items:center;gap:8px">' +
        '<span class="pd-badge ' + p.role + '">' + p.role + '</span>' +
        '<span style="font-size:11px;color:var(--text2)">' + p.participationRate + '%</span>' +
        '<span style="font-size:11px;font-weight:600;color:' + p.color + '">' + (p.annualBudget / 10000).toFixed(1) + '\uC5B5/\uB144</span>' +
        '<span class="pd-arrow" id="pdArrow' + idx + '">&#9660;</span></div></div>' +
        '<div class="pd-body" id="pdBody' + idx + '">' +
        '<div class="pd-info">' +
        '<span><strong>\uACFC\uC81C\uBC88\uD638:</strong> ' + (p.projectNo || "-") + '</span>' +
        '<span><strong>PI:</strong> ' + p.pi + '</span>' +
        '<span><strong>\uC218\uD589\uAE30\uAD00:</strong> ' + p.institution + '</span>' +
        '<span><strong>\uCD1D\uAE30\uAC04:</strong> ' + p.totalMonths + '\uAC1C\uC6D4</span>' +
        '<span><strong>\uC9C4\uD589\uB960:</strong> ' + prog + '%</span></div>' +
        (p.notes ? '<div style="padding:4px 20px 8px;font-size:11px;color:#8b5cf6;font-style:italic">' + esc(p.notes) + '</div>' : '') +
        membersHtml +
        '<div class="pd-phases">' + phHtml + '</div></div></div>';
    }).join("");
  }

  renderPhaseDetail();

  // ── Members Table ─────────────────────────────────────
  (function() {
    const members = D.members || [];
    if (members.length === 0) {
      document.getElementById("membersSection").innerHTML = '<div style="background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);padding:24px;text-align:center;color:var(--text2);font-size:12px">\uAD6C\uC131\uC6D0 \uC815\uBCF4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. data.js\uC758 members \uBC30\uC5F4\uC5D0 \uCD94\uAC00\uD558\uC138\uC694.</div>';
      return;
    }

    // Group by position
    const posOrder = ['\uD3EC\uB2E5', '\uBC15\uC0AC', '\uC5F0\uAD6C\uC6D0', '\uC11D\uC0AC', '\uD559\uC0AC'];
    const groups = {};
    members.forEach(m => {
      const g = m.position || '\uAE30\uD0C0';
      if (!groups[g]) groups[g] = [];
      groups[g].push(m);
    });

    let html = '<div class="members-wrap"><table class="members-table"><thead><tr>' +
      '<th>\uC774\uB984</th><th>\uC9C1\uC704</th><th>\uC5F0\uAD6C\uBD84\uC57C</th>' +
      '<th>\uCC38\uC5EC\uACFC\uC81C</th><th>\uC5F0\uAD6C\uC8FC\uC81C</th><th>\uC878\uC5C5/\uCC44\uC6A9</th>' +
      '</tr></thead><tbody>';

    posOrder.forEach(pos => {
      const grp = groups[pos];
      if (!grp || grp.length === 0) return;

      const posLabel = { '\uD3EC\uB2E5': '\uD3EC\uC2A4\uD2B8\uB2E5', '\uBC15\uC0AC': '\uBC15\uC0AC\uACFC\uC815', '\uC5F0\uAD6C\uC6D0': '\uC5F0\uAD6C\uC6D0', '\uC11D\uC0AC': '\uC11D\uC0AC\uACFC\uC815', '\uD559\uC0AC': '\uD559\uBD80 \uC778\uD134' }[pos] || pos;
      html += '<tr class="member-group-row"><td colspan="6">' + posLabel + ' (' + grp.length + ')</td></tr>';

      grp.forEach(m => {
        const projTags = (m.projects || []).map(pid => {
          const proj = D.projects.find(p => p.id === pid);
          return proj ? '<span class="member-proj-tag" style="background:' + proj.color + '">' + proj.shortName + '</span>' : '';
        }).join('');

        const gradInfo = m.graduation
          ? (() => {
              const gm = pm(m.graduation);
              const months = md(today, gm);
              const isSoon = months >= 0 && months <= 6;
              return '<span class="member-grad' + (isSoon ? ' soon' : '') + '">' + fm(m.graduation) + (isSoon ? ' (\uC784\uBC15)' : '') + '</span>';
            })()
          : (m.enrollment ? '<span class="member-grad">' + fm(m.enrollment) + ' \uC785\uD559</span>' : '-');

        html += '<tr>' +
          '<td><div class="member-name">' + m.name + '</div><div class="member-name-en">' + (m.nameEn || '') + '</div></td>' +
          '<td><span class="member-pos ' + m.position + '">' + m.position + '</span>' +
            (m.fellowship ? '<span class="member-fellowship">' + m.fellowship + '</span>' : '') + '</td>' +
          '<td>' + (m.area ? '<span class="member-area ' + m.area + '">' + m.area + '</span>' : '-') + '</td>' +
          '<td>' + projTags + '</td>' +
          '<td><div class="member-research">' + (m.research || '-') + '</div></td>' +
          '<td>' + gradInfo + '</td>' +
          '</tr>';
      });
    });

    html += '</tbody></table></div>';
    document.getElementById("membersSection").innerHTML = html;
  })();

  // ── Papers Section ────────────────────────────────────
  const PAPER_STATUSES = [
    { value: 'preparing', label: '\uC900\uBE44\uC911' },
    { value: 'writing', label: '\uC9D1\uD544\uC911' },
    { value: 'submitted', label: '\uD22C\uACE0' },
    { value: 'revision', label: '\uC218\uC815\uC911' },
    { value: 'resubmitted', label: '\uC7AC\uD22C\uACE0' },
    { value: 'accepted', label: '\uC218\uB77D' },
    { value: 'published', label: '\uCD9C\uD310' },
  ];
  const STATUS_LABEL = {};
  PAPER_STATUSES.forEach(s => { STATUS_LABEL[s.value] = s.label; });

  function getEffectivePapers() {
    // Merge data.js papers with tracking overrides
    const papers = (D.papers || []).map(p => {
      const override = getPaperTracking(p.id);
      return Object.assign({}, p, override);
    });
    // Add papers created in tracking
    const existingIds = new Set(papers.map(p => p.id));
    Object.keys(T.papers).forEach(id => {
      if (!existingIds.has(id) && T.papers[id].title) {
        papers.push(T.papers[id]);
      }
    });
    return papers;
  }

  function renderPapers() {
    const el = document.getElementById("papersSection");
    const papers = getEffectivePapers();

    if (papers.length === 0) {
      el.innerHTML = '<div class="papers-empty">\uB17C\uBB38\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \u201C+ \uB17C\uBB38 \uCD94\uAC00\u201D \uBC84\uD2BC\uC744 \uD074\uB9AD\uD558\uC5EC \uCD94\uAC00\uD558\uC138\uC694.</div>';
      return;
    }

    el.innerHTML = '<div class="papers-grid">' + papers.map((paper, idx) => {
      const status = paper.status || 'preparing';
      const statusLabel = STATUS_LABEL[status] || status;

      // Author names
      const authorNames = (paper.authors || []).map(aid => {
        const m = memberIndex[aid];
        return m ? m.name : aid;
      }).join(', ');

      // Project tags
      const projTags = (paper.projects || []).map(pid => {
        const proj = D.projects.find(p => p.id === pid);
        return proj ? '<span style="font-size:9px;padding:1px 5px;border-radius:4px;color:white;font-weight:600;background:' + proj.color + '">' + proj.shortName + '</span>' : '';
      }).join(' ');

      // Border color based on status
      const borderColors = {
        preparing: '#9ca3af', writing: '#2563eb', submitted: '#d97706',
        revision: '#be185d', resubmitted: '#4338ca', accepted: '#16a34a', published: '#22c55e'
      };

      return '<div class="paper-card" style="border-left-color:' + (borderColors[status] || '#2563eb') + '" data-paper-id="' + paper.id + '">' +
        '<div class="paper-card-header" data-paper-toggle="' + paper.id + '">' +
        '<div class="paper-title-area">' +
        '<div class="paper-title">' + esc(paper.title) + '</div>' +
        '<div class="paper-meta">' +
        '<span class="paper-status ' + status + '">' + statusLabel + '</span>' +
        (authorNames ? '<span>' + esc(authorNames) + '</span>' : '') +
        (paper.journal || paper.targetJournal ? '<span style="font-style:italic">' + esc(paper.journal || paper.targetJournal) + '</span>' : '') +
        projTags +
        '</div></div>' +
        '<div class="paper-actions">' +
        '<button class="paper-toggle" data-paper-toggle="' + paper.id + '">&#9660;</button>' +
        '<button class="paper-delete" data-paper-delete="' + paper.id + '" title="\uC0AD\uC81C">&times;</button>' +
        '</div></div>' +
        '<div class="paper-body" id="paperBody-' + paper.id + '">' +
        renderPaperEditForm(paper) +
        '</div></div>';
    }).join('') + '</div>';
  }

  function renderPaperEditForm(paper) {
    const members = D.members || [];
    const projects = D.projects || [];

    // Status select
    let statusOpts = PAPER_STATUSES.map(s =>
      '<option value="' + s.value + '"' + (paper.status === s.value ? ' selected' : '') + '>' + s.label + '</option>'
    ).join('');

    // Author chips
    const authorSet = new Set(paper.authors || []);
    const authorChips = members.map(m =>
      '<span class="paper-author-chip' + (authorSet.has(m.id) ? ' selected' : '') + '" data-paper-author="' + m.id + '" data-paper-id="' + paper.id + '">' + m.name + '</span>'
    ).join('');

    // Ordered author list
    const orderedAuthors = (paper.authors || []).map(aid => {
      const m = memberIndex[aid];
      const name = m ? m.name : aid;
      return '<span class="paper-author-ordered" data-paper-id="' + paper.id + '" data-author-id="' + aid + '">' + name + ' <span class="remove" data-remove-author="' + aid + '">&times;</span></span>';
    }).join('');

    // Project chips
    const projSet = new Set(paper.projects || []);
    const projChips = projects.map(p =>
      '<span class="paper-proj-chip' + (projSet.has(p.id) ? ' selected' : '') + '" style="background:' + p.color + '" data-paper-proj="' + p.id + '" data-paper-id="' + paper.id + '">' + p.shortName + '</span>'
    ).join('');

    return '<div class="paper-field"><div class="paper-field-label">\uC81C\uBAA9</div>' +
      '<input type="text" value="' + esc(paper.title || '') + '" data-paper-field="title" data-paper-id="' + paper.id + '"></div>' +
      '<div class="paper-field"><div class="paper-field-label">\uC0C1\uD0DC</div>' +
      '<select data-paper-field="status" data-paper-id="' + paper.id + '">' + statusOpts + '</select></div>' +
      '<div class="paper-field"><div class="paper-field-label">\uC800\uC790 (\uD074\uB9AD\uD558\uC5EC \uCD94\uAC00/\uC81C\uAC70, \uC21C\uC11C\uB300\uB85C \uD074\uB9AD)</div>' +
      '<div class="paper-author-list">' + authorChips + '</div>' +
      '<div class="paper-author-order">' + (orderedAuthors || '<span style="font-size:10px;color:var(--text2);padding:2px">\uC800\uC790\uB97C \uD074\uB9AD\uD558\uC5EC \uCD94\uAC00\uD558\uC138\uC694</span>') + '</div></div>' +
      '<div class="paper-field"><div class="paper-field-label">\uBAA9\uD45C \uC800\uB110</div>' +
      '<input type="text" value="' + esc(paper.targetJournal || '') + '" data-paper-field="targetJournal" data-paper-id="' + paper.id + '"></div>' +
      '<div class="paper-field"><div class="paper-field-label">\uD22C\uACE0 \uC800\uB110</div>' +
      '<input type="text" value="' + esc(paper.journal || '') + '" data-paper-field="journal" data-paper-id="' + paper.id + '"></div>' +
      '<div class="paper-field"><div class="paper-field-label">\uD22C\uACE0\uC77C</div>' +
      '<input type="date" value="' + (paper.submittedDate || '') + '" data-paper-field="submittedDate" data-paper-id="' + paper.id + '"></div>' +
      '<div class="paper-field"><div class="paper-field-label">\uC218\uB77D\uC77C</div>' +
      '<input type="date" value="' + (paper.acceptedDate || '') + '" data-paper-field="acceptedDate" data-paper-id="' + paper.id + '"></div>' +
      '<div class="paper-field"><div class="paper-field-label">DOI</div>' +
      '<input type="text" value="' + esc(paper.doi || '') + '" data-paper-field="doi" data-paper-id="' + paper.id + '"></div>' +
      '<div class="paper-field"><div class="paper-field-label">\uC5F0\uAD00 \uD504\uB85C\uC81D\uD2B8</div>' +
      '<div class="paper-proj-list">' + projChips + '</div></div>' +
      '<div class="paper-field"><div class="paper-field-label">\uBA54\uBAA8</div>' +
      '<textarea data-paper-field="notes" data-paper-id="' + paper.id + '">' + esc(paper.notes || '') + '</textarea></div>';
  }

  renderPapers();

  // Add paper button
  document.getElementById('addPaperBtn').addEventListener('click', function() {
    const id = 'paper-' + Date.now();
    setPaperTracking(id, {
      id: id,
      title: '\uC0C8 \uB17C\uBB38',
      authors: [],
      correspondingAuthor: 'pi',
      journal: '',
      targetJournal: '',
      status: 'preparing',
      projects: [],
      submittedDate: null,
      acceptedDate: null,
      doi: null,
      notes: '',
    });
    renderPapers();
    // Open the new paper
    setTimeout(() => {
      const body = document.getElementById('paperBody-' + id);
      if (body) body.classList.add('open');
    }, 50);
  });

  // ── Connections Table ─────────────────────────────────
  function renderConnectionsTable() {
    const el = document.getElementById("connTable");
    if (!el || !D.taskConnections || D.taskConnections.length === 0) return;

    let html = '<table class="conn-table"><thead><tr><th>\uCD9C\uBC1C \uC791\uC5C5</th><th>\uCD9C\uBC1C \uACFC\uC81C</th><th>\uC5F0\uACB0 \uB0B4\uC6A9</th><th>\uB3C4\uCC29 \uC791\uC5C5</th><th>\uB3C4\uCC29 \uACFC\uC81C</th></tr></thead><tbody>';

    D.taskConnections.forEach(conn => {
      const fromInfo = taskIndex[conn.from];
      const toInfo = taskIndex[conn.to];
      if (!fromInfo || !toInfo) return;

      const fromText = fromInfo.task.text.length > 40 ? fromInfo.task.text.slice(0, 40) + '...' : fromInfo.task.text;
      const toText = toInfo.task.text.length > 40 ? toInfo.task.text.slice(0, 40) + '...' : toInfo.task.text;

      html += '<tr>' +
        '<td class="conn-from" data-nav-task="' + conn.from + '"><span class="conn-proj-badge" style="background:' + fromInfo.project.color + '">' + fromInfo.project.shortName + '</span>' + esc(fromText) + '</td>' +
        '<td>' + fromInfo.project.shortName + ' ' + fromInfo.project.phases[fromInfo.phaseIdx].name + '</td>' +
        '<td style="font-weight:600;color:#6b7280">' + esc(conn.label) + '</td>' +
        '<td class="conn-to" data-nav-task="' + conn.to + '"><span class="conn-proj-badge" style="background:' + toInfo.project.color + '">' + toInfo.project.shortName + '</span>' + esc(toText) + '</td>' +
        '<td>' + toInfo.project.shortName + ' ' + toInfo.project.phases[toInfo.phaseIdx].name + '</td>' +
        '</tr>';
    });

    html += '</tbody></table>';
    el.innerHTML = html;
  }

  renderConnectionsTable();

  // ── Network Graph ─────────────────────────────────────
  (function() {
    const svg = document.getElementById("netGraph");
    const W = 720, H = 420;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    const n = D.projects.length;
    const cx = W / 2, cy = H / 2, r = Math.min(W, H) * 0.32;
    const nodes = D.projects.map((p, i) => {
      const a = 2 * Math.PI * i / n - Math.PI / 2;
      return { ...p, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
    const nm = {}; nodes.forEach(n => nm[n.id] = n);
    const cs = {
      data: { c: "#2563eb", d: "none" },
      method: { c: "#16a34a", d: "6,3" },
      collab: { c: "#dc2626", d: "none" },
      infra: { c: "#9333ea", d: "4,4" },
      theme: { c: "#d97706", d: "8,4,2,4" }
    };
    let s = "";
    D.connections.forEach(conn => {
      const f = nm[conn.from], t = nm[conn.to]; if (!f || !t) return;
      const st = cs[conn.type] || cs.theme;
      const dx = t.x - f.x, dy = t.y - f.y, cv = 0.15;
      const cx2 = (f.x + t.x) / 2 - dy * cv, cy2 = (f.y + t.y) / 2 + dx * cv;
      s += '<path d="M' + f.x + ',' + f.y + ' Q' + cx2 + ',' + cy2 + ' ' + t.x + ',' + t.y + '" stroke="' + st.c + '" stroke-width="1.5" stroke-dasharray="' + st.d + '" fill="none" stroke-opacity="0.4"/>';
      s += '<text x="' + ((f.x + cx2 + t.x) / 3) + '" y="' + ((f.y + cy2 + t.y) / 3 - 4) + '" font-size="8" fill="' + st.c + '" text-anchor="middle" opacity="0.7">' + conn.label + '</text>';
    });
    nodes.forEach(nd => {
      const nr = nd.role === "\uCC45\uC784" ? 26 : 20;
      const fo = nd.role === "\uCC38\uC5EC" ? 0.5 : nd.role === "\uACF5\uB3D9" ? 0.7 : 1;
      s += '<g><circle cx="' + nd.x + '" cy="' + nd.y + '" r="' + nr + '" fill="' + nd.color + '" fill-opacity="' + fo + '" stroke="white" stroke-width="2"/>';
      const fs = nd.shortName.length > 4 ? 8 : 9;
      s += '<text x="' + nd.x + '" y="' + (nd.y + 1) + '" fill="white" font-size="' + fs + '" font-weight="700" text-anchor="middle" dominant-baseline="middle">' + nd.shortName + '</text>';
      s += '<text x="' + nd.x + '" y="' + (nd.y + nr + 12) + '" font-size="9" fill="#374151" font-weight="600" text-anchor="middle">' + nd.role + '</text>';
      s += '</g>';
    });
    svg.innerHTML = s;
    document.getElementById("cLeg").innerHTML = Object.entries(cs).map(([k, v]) =>
      '<div class="conn-leg-item"><svg width="20" height="3"><line x1="0" y1="1.5" x2="20" y2="1.5" stroke="' + v.c + '" stroke-width="2" stroke-dasharray="' + v.d + '"/></svg>' + ({ data: "\uB370\uC774\uD130", method: "\uBC29\uBC95\uB860", collab: "\uACF5\uB3D9\uC5F0\uAD6C", infra: "\uC778\uD504\uB77C", theme: "\uC8FC\uC81C\uC5F0\uACB0" })[k] + '</div>'
    ).join("");
  })();

  // ── Event Handlers ────────────────────────────────────

  // Track which projects are open
  let openProjects = new Set();
  let openPapers = new Set();

  document.addEventListener('click', function(e) {
    // Toggle project detail
    const toggle = e.target.closest('[data-toggle-pd]');
    if (toggle) {
      const idx = parseInt(toggle.dataset.togglePd);
      const body = document.getElementById("pdBody" + idx);
      const arrow = document.getElementById("pdArrow" + idx);
      if (openProjects.has(idx)) {
        openProjects.delete(idx);
        if (body) body.classList.remove("open");
        if (arrow) arrow.classList.remove("open");
      } else {
        openProjects.add(idx);
        if (body) body.classList.add("open");
        if (arrow) arrow.classList.add("open");
      }
      return;
    }

    // Task checkbox
    const cb = e.target.closest('.task-checkbox');
    if (cb) {
      const taskId = cb.dataset.taskId;
      const tr = getTaskTracking(taskId);
      setTaskTracking(taskId, {
        completed: !tr.completed,
        completedAt: !tr.completed ? todayDate() : null
      });
      renderPhaseDetail();
      reopenProjects();
      return;
    }

    // Note button
    const noteBtn = e.target.closest('[data-note-task]');
    if (noteBtn) { toggleTaskNote(noteBtn.dataset.noteTask); return; }

    // Note display click
    const noteDisplay = e.target.closest('[data-note-edit]');
    if (noteDisplay) { toggleTaskNote(noteDisplay.dataset.noteEdit); return; }

    // Links button
    const linksBtn = e.target.closest('[data-links-task]');
    if (linksBtn) { e.stopPropagation(); showTaskLinks(linksBtn, linksBtn.dataset.linksTask); return; }

    // Phase note add/edit
    const phaseNoteAdd = e.target.closest('[data-phase-note-add]');
    if (phaseNoteAdd) { togglePhaseNote(phaseNoteAdd.dataset.phaseNoteAdd); return; }
    const phaseNoteEdit = e.target.closest('[data-phase-note-edit]');
    if (phaseNoteEdit) { togglePhaseNote(phaseNoteEdit.dataset.phaseNoteEdit); return; }

    // Navigate to task
    const navTask = e.target.closest('[data-nav-task]');
    if (navTask) { navigateToTask(navTask.dataset.navTask); return; }

    // ── Paper events ──
    // Toggle paper body
    const paperToggle = e.target.closest('[data-paper-toggle]');
    if (paperToggle) {
      const pid = paperToggle.dataset.paperToggle;
      const body = document.getElementById('paperBody-' + pid);
      if (body) {
        body.classList.toggle('open');
        if (body.classList.contains('open')) openPapers.add(pid);
        else openPapers.delete(pid);
      }
      return;
    }

    // Delete paper
    const paperDelete = e.target.closest('[data-paper-delete]');
    if (paperDelete) {
      const pid = paperDelete.dataset.paperDelete;
      if (confirm('\uC774 \uB17C\uBB38\uC744 \uC0AD\uC81C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?')) {
        // Mark as deleted in tracking
        setPaperTracking(pid, { _deleted: true, title: null });
        // Also remove from D.papers if present
        if (D.papers) {
          const idx = D.papers.findIndex(p => p.id === pid);
          if (idx >= 0) D.papers.splice(idx, 1);
        }
        renderPapers();
      }
      return;
    }

    // Paper author chip toggle
    const authorChip = e.target.closest('[data-paper-author]');
    if (authorChip) {
      const pid = authorChip.dataset.paperId;
      const aid = authorChip.dataset.paperAuthor;
      const paper = getEffectivePapers().find(p => p.id === pid);
      if (!paper) return;
      let authors = [...(paper.authors || [])];
      const idx = authors.indexOf(aid);
      if (idx >= 0) authors.splice(idx, 1);
      else authors.push(aid);
      setPaperTracking(pid, { authors: authors });
      renderPapers();
      reopenPapers();
      return;
    }

    // Remove author from order
    const removeAuthor = e.target.closest('[data-remove-author]');
    if (removeAuthor) {
      const pid = removeAuthor.closest('[data-paper-id]').dataset.paperId;
      const aid = removeAuthor.dataset.removeAuthor;
      const paper = getEffectivePapers().find(p => p.id === pid);
      if (!paper) return;
      let authors = (paper.authors || []).filter(a => a !== aid);
      setPaperTracking(pid, { authors: authors });
      renderPapers();
      reopenPapers();
      return;
    }

    // Paper project chip toggle
    const projChip = e.target.closest('[data-paper-proj]');
    if (projChip) {
      const pid = projChip.dataset.paperId;
      const projId = projChip.dataset.paperProj;
      const paper = getEffectivePapers().find(p => p.id === pid);
      if (!paper) return;
      let projects = [...(paper.projects || [])];
      const idx = projects.indexOf(projId);
      if (idx >= 0) projects.splice(idx, 1);
      else projects.push(projId);
      setPaperTracking(pid, { projects: projects });
      renderPapers();
      reopenPapers();
      return;
    }

    // Close popups
    document.querySelectorAll('.task-links-popup').forEach(p => p.remove());
  });

  // Paper field change handlers (delegated)
  document.addEventListener('change', function(e) {
    const field = e.target.dataset.paperField;
    const pid = e.target.dataset.paperId;
    if (field && pid) {
      const update = {};
      update[field] = e.target.value;
      setPaperTracking(pid, update);
      if (field === 'status') {
        renderPapers();
        reopenPapers();
      }
    }
  });

  document.addEventListener('input', function(e) {
    const field = e.target.dataset.paperField;
    const pid = e.target.dataset.paperId;
    if (field && pid && (field === 'title' || field === 'notes' || field === 'journal' || field === 'targetJournal' || field === 'doi')) {
      clearTimeout(e.target._saveTimer);
      e.target._saveTimer = setTimeout(() => {
        const update = {};
        update[field] = e.target.value;
        setPaperTracking(pid, update);
      }, 500);
    }
  });

  function reopenProjects() {
    openProjects.forEach(idx => {
      const body = document.getElementById("pdBody" + idx);
      const arrow = document.getElementById("pdArrow" + idx);
      if (body) body.classList.add("open");
      if (arrow) arrow.classList.add("open");
    });
  }

  function reopenPapers() {
    openPapers.forEach(pid => {
      const body = document.getElementById('paperBody-' + pid);
      if (body) body.classList.add('open');
    });
  }

  function toggleTaskNote(taskId) {
    const taskEl = document.getElementById('task-' + taskId);
    if (!taskEl) return;

    const existing = taskEl.parentNode.querySelector('.task-note[data-for="' + taskId + '"]');
    if (existing) {
      const ta = existing.querySelector('textarea');
      if (ta) setTaskTracking(taskId, { notes: ta.value.trim() });
      renderPhaseDetail();
      reopenProjects();
      return;
    }

    const tr = getTaskTracking(taskId);
    const noteEl = document.createElement('li');
    noteEl.style.cssText = 'list-style:none;padding:0';
    noteEl.innerHTML = '<div class="task-note" data-for="' + taskId + '"><textarea placeholder="\uBA54\uBAA8\uB97C \uC785\uB825\uD558\uC138\uC694...">' + esc(tr.notes || '') + '</textarea></div>';
    taskEl.after(noteEl);

    const ta = noteEl.querySelector('textarea');
    ta.focus();
    ta.addEventListener('blur', function() {
      setTaskTracking(taskId, { notes: ta.value.trim() });
      renderPhaseDetail();
      reopenProjects();
    });
  }

  function togglePhaseNote(phaseKey) {
    const existingTextarea = document.querySelector('.pd-phase-note textarea[data-phase="' + phaseKey + '"]');
    if (existingTextarea) {
      setPhaseTracking(phaseKey, { notes: existingTextarea.value.trim() });
      renderPhaseDetail();
      reopenProjects();
      return;
    }

    const btn = document.querySelector('[data-phase-note-add="' + phaseKey + '"]');
    const display = document.querySelector('[data-phase-note-edit="' + phaseKey + '"]');
    const target = btn || display;
    if (!target) return;

    const phTrack = getPhaseTracking(phaseKey);
    const ta = document.createElement('textarea');
    ta.dataset.phase = phaseKey;
    ta.placeholder = '\uC5F0\uCC28 \uBA54\uBAA8\uB97C \uC785\uB825\uD558\uC138\uC694...';
    ta.value = phTrack.notes || '';
    target.replaceWith(ta);
    ta.focus();
    ta.addEventListener('blur', function() {
      setPhaseTracking(phaseKey, { notes: ta.value.trim() });
      renderPhaseDetail();
      reopenProjects();
    });
  }

  function showTaskLinks(btnEl, taskId) {
    document.querySelectorAll('.task-links-popup').forEach(p => p.remove());
    const info = taskIndex[taskId];
    if (!info) return;

    const connections = (D.taskConnections || []).filter(c => c.from === taskId || c.to === taskId);
    if (connections.length === 0) return;

    const popup = document.createElement('div');
    popup.className = 'task-links-popup';

    connections.forEach(conn => {
      const otherId = conn.from === taskId ? conn.to : conn.from;
      const otherInfo = taskIndex[otherId];
      if (!otherInfo) return;

      const dir = conn.from === taskId ? '\u2192' : '\u2190';
      const item = document.createElement('div');
      item.className = 'link-item';
      item.innerHTML = '<span style="color:' + otherInfo.project.color + ';font-weight:700">' + otherInfo.project.shortName + '</span> ' +
        '<span class="link-project">' + dir + ' ' + otherInfo.task.text.slice(0, 35) + (otherInfo.task.text.length > 35 ? '...' : '') + '</span>' +
        '<br><span class="link-label">' + conn.label + '</span>';
      item.addEventListener('click', function() {
        popup.remove();
        navigateToTask(otherId);
      });
      popup.appendChild(item);
    });

    const li = btnEl.closest('li');
    li.style.position = 'relative';
    li.appendChild(popup);
  }

  function navigateToTask(taskId) {
    const info = taskIndex[taskId];
    if (!info) return;
    const projIdx = D.projects.indexOf(info.project);
    if (projIdx < 0) return;

    openProjects.add(projIdx);
    const body = document.getElementById("pdBody" + projIdx);
    const arrow = document.getElementById("pdArrow" + projIdx);
    if (body) body.classList.add("open");
    if (arrow) arrow.classList.add("open");

    setTimeout(function() {
      const taskEl = document.getElementById('task-' + taskId);
      if (taskEl) {
        taskEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        taskEl.classList.add('highlight-task');
        setTimeout(() => taskEl.classList.remove('highlight-task'), 2000);
      }
    }, 100);
  }

  // ── Tooltip ───────────────────────────────────────────
  (function() {
    const tip = document.getElementById("tip");
    document.addEventListener("mouseover", function(e) {
      const b = e.target.closest("[data-tooltip]");
      if (b) {
        const p = b.dataset.tooltip.split("|");
        tip.innerHTML = '<div class="tt-t">' + p[0] + '</div>' + p[1] + ' (' + p[2] + ')<br>' + p[3] + (p[4] ? '<br><span style="color:#93c5fd">' + p[4] + '</span>' : '');
        tip.classList.add("visible");
      }
    });
    document.addEventListener("mouseout", function(e) {
      if (e.target.closest("[data-tooltip]")) tip.classList.remove("visible");
    });
    document.addEventListener("mousemove", function(e) {
      if (tip.classList.contains("visible")) {
        tip.style.left = (e.clientX + 12) + "px";
        tip.style.top = (e.clientY - 8) + "px";
      }
    });
  })();

})();
