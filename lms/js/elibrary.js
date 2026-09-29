/**
 * ChessKidoo LMS — E-Library & Recorded Sessions Hub (v2.0)
 * ─────────────────────────────────────────────────────────────────
 * Comprehensive E-Library system for:
 * 1. Admin & Coaches: Upload study materials & class recordings, edit/delete, and configure
 *    granular access permissions (All Students, Specific Batch, or Specific Students Alone).
 * 2. Quick Student Access Manager: Assign exclusive materials to individual students in 1 click.
 * 3. Students & Parents: Browse, watch recorded sessions, and access batch classrooms securely.
 * 4. Offline-first resilience with localStorage caching + Supabase sync.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'ck_elibrary_materials';

  const DEFAULT_LIBRARY_ITEMS = [
    {
      id: 'elib-1',
      title: 'GothamChess: How to Play Chess for Beginners | Complete Guide',
      description: 'Learn the complete basics of chess - from how pieces move to fundamental strategies. Perfect for absolute beginners starting their chess journey.',
      category: 'openings',
      categoryLabel: '♟️ Opening Repertoire',
      level: 'Beginner',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=OCSbzArwB10',
      author: 'GothamChess',
      date: '2026-07-20',
      duration: '55 mins',
      access_type: 'all',
      allowed_batch_id: '',
      allowed_batch_name: '',
      allowed_student_ids: [],
      allowed_student_names: [],
      tags: ['Beginner', 'Basics', 'Strategy', 'Fundamentals']
    },
    {
      id: 'elib-2',
      title: 'How to Calculate Chess Moves Fast & Accurately',
      description: 'Master calculation patterns, candidate move selection, tactical pins, skewers, knight forks, and back-rank mates.',
      category: 'tactics',
      categoryLabel: '⚡ Tactics & Combinations',
      level: 'Intermediate',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=wXhXbQeU2G4',
      author: 'Senior Coach Panel',
      date: '2026-08-10',
      duration: '35 mins',
      access_type: 'all',
      allowed_batch_id: '',
      allowed_batch_name: '',
      allowed_student_ids: [],
      allowed_student_names: [],
      tags: ['Tactics', 'Forks', 'Pins', 'Calculations']
    },
    {
      id: 'elib-3',
      title: '10 Chess Endgames You MUST Know (Lucena & Philidor Guide)',
      description: 'Master the "Bridge Technique" in the Lucena position and the 6th-rank cut-off in the Philidor defense with live board breakdowns.',
      category: 'endgames',
      categoryLabel: '👑 Endgame Mastery',
      level: 'Advanced',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=N6J0j7kG8jU',
      author: 'Coach Ranjith A S',
      date: '2026-08-05',
      duration: '52 mins',
      access_type: 'all',
      allowed_batch_id: '',
      allowed_batch_name: '',
      allowed_student_ids: [],
      allowed_student_names: [],
      tags: ['Endgame', 'Rook Endgames', 'Lucena', 'Philidor']
    },
    {
      id: 'elib-4',
      title: 'How to Checkmate & Defend Sharp Attacks',
      description: 'Master classic mating patterns, Scholar\'s mate defense, Greek gift sacrifices, and opposite-side castling pawn storms.',
      category: 'tactics',
      categoryLabel: '⚡ Tactics & Combinations',
      level: 'Beginner',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=1853Jq2xV5c',
      author: 'FIDE Master Team',
      date: '2026-07-28',
      duration: '28 mins',
      access_type: 'all',
      allowed_batch_id: '',
      allowed_batch_name: '',
      allowed_student_ids: [],
      allowed_student_names: [],
      tags: ['Checkmates', 'Defenses', 'Combinations']
    },
    {
      id: 'elib-5',
      title: 'Top 7 Opening Traps Every Chess Player Must Know',
      description: 'Avoid common opening blunders and learn how to trap your opponents with the Legal Mate, Fried Liver, and Blackburne Shilling traps.',
      category: 'openings',
      categoryLabel: '♟️ Opening Repertoire',
      level: 'Beginner',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=s9vj9zPq974',
      author: 'Senior Coach Panel',
      date: '2026-08-18',
      duration: '24 mins',
      access_type: 'all',
      allowed_batch_id: '',
      allowed_batch_name: '',
      allowed_student_ids: [],
      allowed_student_names: [],
      tags: ['Traps', 'Openings', 'Gambits']
    },
    {
      id: 'elib-6',
      title: 'Mastering the Sicilian Defense: Dragon & Najdorf Lines',
      description: 'Step-by-step masterclass on playing black against 1.e4 with aggressive kingside counter-attacking plans and central pawn breaks.',
      category: 'openings',
      categoryLabel: '♟️ Opening Repertoire',
      level: 'Intermediate',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=yA_eZ7K99d4',
      author: 'Coach Gyanasurya',
      date: '2026-08-14',
      duration: '40 mins',
      access_type: 'all',
      allowed_batch_id: '',
      allowed_batch_name: '',
      allowed_student_ids: [],
      allowed_student_names: [],
      tags: ['Sicilian', 'Dragon', 'Najdorf', 'Counterattack']
    },
    {
      id: 'elib-7',
      title: 'Grandmaster Live Game Analysis & Tournament Psychology',
      description: 'Recorded live masterclass session analyzing world championship games, tournament psychology, time management, and blunder prevention habits.',
      category: 'recordings',
      categoryLabel: '🎥 Class Recording',
      level: 'All Levels',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=Kz7t1v7U44w',
      author: 'Academy Coaching Panel',
      date: '2026-08-12',
      duration: '60 mins',
      access_type: 'all',
      allowed_batch_id: '',
      allowed_batch_name: '',
      allowed_student_ids: [],
      allowed_student_names: [],
      tags: ['Recording', 'Live Session', 'Tournament', 'Psychology']
    },
    {
      id: 'elib-8',
      title: 'King & Pawn Endgames: Key Squares, Opposition & Trebuchet',
      description: 'Fundamental endgame theory: the rule of the square, direct opposition, diagonal opposition, and key square outposts for guaranteed pawn promotion.',
      category: 'endgames',
      categoryLabel: '👑 Endgame Mastery',
      level: 'Intermediate',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=4pQy1hN007w',
      author: 'Coach Ranjith A S',
      date: '2026-08-02',
      duration: '32 mins',
      access_type: 'all',
      allowed_batch_id: '',
      allowed_batch_name: '',
      allowed_student_ids: [],
      allowed_student_names: [],
      tags: ['Endgames', 'King and Pawn', 'Opposition', 'Promotion']
    },
    {
      id: 'elib-9',
      title: 'GothamChess: How to Play Chess for Beginners | Complete Guide',
      description: 'Learn the complete basics of chess - from how pieces move to fundamental strategies. Perfect for absolute beginners starting their chess journey.',
      category: 'openings',
      categoryLabel: '♟️ Opening Repertoire',
      level: 'Beginner',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=OCSbzArwB10',
      author: 'GothamChess',
      date: '2026-07-20',
      duration: '55 mins',
      access_type: 'all',
      allowed_batch_id: '',
      allowed_batch_name: '',
      allowed_student_ids: [],
      allowed_student_names: [],
      tags: ['Beginner', 'Basics', 'Strategy', 'Fundamentals']
    },
    {
      id: 'elib-10',
      title: 'Daniel Naroditsky Speedrun: From Beginner to 2200+ Rating',
      description: 'Grandmaster Daniel Naroditsky demonstrates key concepts and patterns that helped him rise through the ranks. Excellent for intermediate players.',
      category: 'strategy',
      categoryLabel: '🧠 Strategy & Planning',
      level: 'Intermediate',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=mR2FNvHyp4o',
      author: 'Daniel Naroditsky',
      date: '2026-07-15',
      duration: '42 mins',
      access_type: 'all',
      allowed_batch_id: '',
      allowed_batch_name: '',
      allowed_student_ids: [],
      allowed_student_names: [],
      tags: ['Strategy', 'Planning', 'Pattern Recognition']
    },
    {
      id: 'elib-11',
      title: 'Hanging Pawns: The London System - Complete Opening Guide',
      description: 'Master the London System opening with this comprehensive guide. Learn the setup, plans, and common tactical patterns for White.',
      category: 'openings',
      categoryLabel: '♟️ Opening Repertoire',
      level: 'Intermediate',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=aQb6BCvHfLI',
      author: 'Hanging Pawns',
      date: '2026-07-10',
      duration: '38 mins',
      access_type: 'all',
      allowed_batch_id: '',
      allowed_batch_name: '',
      allowed_student_ids: [],
      allowed_student_names: [],
      tags: ['London System', 'Openings', 'White Plans']
    },
    {
      id: 'elib-12',
      title: 'Magnus Carlsen: Best Games & World Championship Analysis',
      description: 'Study the games of World Champion Magnus Carlsen. Learn his positional mastery, endgame technique, and how he grinds down opponents.',
      category: 'strategy',
      categoryLabel: '🧠 Strategy & Planning',
      level: 'Advanced',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=tvZg1F3G8Ew',
      author: 'ChessNetwork',
      date: '2026-07-05',
      duration: '48 mins',
      access_type: 'all',
      allowed_batch_id: '',
      allowed_batch_name: '',
      allowed_student_ids: [],
      allowed_student_names: [],
      tags: ['Magnus Carlsen', 'World Championship', 'Positional Play']
    },
    {
      id: 'elib-13',
      title: 'Chess Tactics: Pins, Forks, Skewers & Discoveries',
      description: 'Master the essential tactical motifs that win games. Learn to spot and execute pins, forks, skewers, discovered attacks, and double checks.',
      category: 'tactics',
      categoryLabel: '⚡ Tactics & Combinations',
      level: 'Beginner',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=dNn3hkrgA2w',
      author: 'John Bartholomew',
      date: '2026-06-28',
      duration: '35 mins',
      access_type: 'all',
      allowed_batch_id: '',
      allowed_batch_name: '',
      allowed_student_ids: [],
      allowed_student_names: [],
      tags: ['Tactics', 'Pins', 'Forks', 'Skewers']
    },
    {
      id: 'elib-14',
      title: 'The Queen\'s Gambit Declined: Complete Defense for Black',
      description: 'Learn the Queen\'s Gambit Declined defense against 1.d4. Understand the key plans, pawn breaks, and piece placement for Black.',
      category: 'openings',
      categoryLabel: '♟️ Opening Repertoire',
      level: 'Intermediate',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=TwKim4hRtqo',
      author: 'Hanging Pawns',
      date: '2026-06-22',
      duration: '44 mins',
      access_type: 'all',
      allowed_batch_id: '',
      allowed_batch_name: '',
      allowed_student_ids: [],
      allowed_student_names: [],
      tags: ['Queens Gambit', 'Defense', 'Black Plans']
    },
    {
      id: 'elib-15',
      title: 'Endgame Mastery: Rook Endgames & The Lucena Position',
      description: 'Deep dive into rook endgames. Master the Lucena position, Philidor defense, and the cutting technique that wins practical games.',
      category: 'endgames',
      categoryLabel: '👑 Endgame Mastery',
      level: 'Advanced',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=WB8bMChxWQc',
      author: 'Saint Louis Chess Club',
      date: '2026-06-15',
      duration: '50 mins',
      access_type: 'all',
      allowed_batch_id: '',
      allowed_batch_name: '',
      allowed_student_ids: [],
      allowed_student_names: [],
      tags: ['Rook Endgames', 'Lucena', 'Philidor', 'Advanced']
    }
  ];

  window.elibraryItems = [];
  let currentFilter = 'all';
  let currentSearch = '';
  let currentLevelFilter = 'all';
  let currentAccessFilter = 'all';

  // ── Load Data ──
  window.loadElibraryData = async function () {
    let local = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) local = JSON.parse(raw);
    } catch (e) { console.warn('[E-Library] Local load err:', e); }

    if (!local || !local.length) {
      local = DEFAULT_LIBRARY_ITEMS;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(local)); } catch (e) {}
    }

    // Attempt Supabase Fetch
    if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
      try {
        const origConsoleError = console.error;
        console.error = function() {};
        const { data, error } = await window.supabaseClient
          .from('elibrary')
          .select('*')
          .order('created_at', { ascending: false });
        console.error = origConsoleError;
        if (!error && Array.isArray(data) && data.length > 0) {
          const map = new Map();
          data.forEach(item => map.set(String(item.id), item));
          local.forEach(item => { if (!map.has(String(item.id))) map.set(String(item.id), item); });
          local = Array.from(map.values());
        }
      } catch (e) {
        // Quiet fallback to local storage
      }
    }

    window.elibraryItems = local;
    updateStatsCounters();
    return local;
  };

  // ── Stats Counters ──
  function updateStatsCounters() {
    const items = window.elibraryItems || [];
    const totalEl = document.getElementById('elib-stat-total');
    const videosEl = document.getElementById('elib-stat-videos');
    const restrictedEl = document.getElementById('elib-stat-restricted');
    const batchesEl = document.getElementById('elib-stat-batches');

    if (totalEl) totalEl.textContent = items.length;
    if (videosEl) videosEl.textContent = items.filter(i => i.type === 'video' || i.category === 'recordings' || i.category === 'masterclasses').length;
    if (restrictedEl) restrictedEl.textContent = items.filter(i => i.access_type === 'students' || (Array.isArray(i.allowed_student_ids) && i.allowed_student_ids.length > 0)).length;
    if (batchesEl) batchesEl.textContent = items.filter(i => i.access_type === 'batch' || (i.allowed_batch_id && i.allowed_batch_id !== 'all')).length;
  }

  // ── Role Permissions Helper ──
  function canUserManageItem(item) {
    const role = window.role || (window.currentCoach ? 'coach' : 'student');
    if (role === 'admin' || role === 'master') return true;
    if (role === 'coach') {
      const coach = window.currentCoach;
      if (!coach) return false;
      const coachName = (coach.name || coach.full_name || '').toLowerCase().trim();
      const itemAuthor = (item.author || '').toLowerCase().trim();
      const coachId = String(coach.id || coach.coach_id || '');
      const itemCoachId = String(item.coach_id || '');
      return (coachId && itemCoachId === coachId) || (coachName && itemAuthor.includes(coachName)) || (itemAuthor === coachName);
    }
    return false;
  }

  // ── Save Material ──
  window.saveElibraryItem = async function (itemData) {
    if (!itemData.title || !itemData.url) {
      if (window.toast) window.toast('Please provide a title and resource link!', 'warning');
      return false;
    }

    const currentCoach = window.currentCoach;
    const coachName = currentCoach ? (currentCoach.name || currentCoach.full_name || 'Coach') : null;
    const coachId = currentCoach ? (currentCoach.id || currentCoach.coach_id || null) : null;

    const accessType = itemData.access_type || 'all';
    let batchId = '';
    let batchName = '';
    let studentIds = [];
    let studentNames = [];

    if (accessType === 'batch') {
      batchId = itemData.allowed_batch_id || '';
      if (batchId && Array.isArray(window.allBatches)) {
        const b = window.allBatches.find(x => String(x.id) === String(batchId));
        if (b) batchName = b.name;
      }
    } else if (accessType === 'students') {
      studentIds = Array.isArray(itemData.allowed_student_ids) ? itemData.allowed_student_ids.map(String) : [];
      if (studentIds.length && Array.isArray(window.allStudents)) {
        studentNames = studentIds.map(sid => {
          const s = window.allStudents.find(x => String(x.id) === sid);
          return s ? (s.name || s.full_name || `Student #${sid}`) : `Student #${sid}`;
        });
      }
    }

    const item = {
      id: itemData.id || ('elib-' + Date.now()),
      title: itemData.title.trim(),
      description: (itemData.description || '').trim(),
      category: itemData.category || 'openings',
      categoryLabel: getCategoryLabel(itemData.category),
      level: itemData.level || 'All Levels',
      type: itemData.type || (itemData.url.match(/\.(pdf|doc|docx|pgn)/i) ? 'document' : 'video'),
      url: itemData.url.trim(),
      author: itemData.author || (window.role === 'admin' ? 'Academy Admin' : (coachName || 'ChessKidoo Coach')),
      coach_id: itemData.coach_id || (window.role === 'coach' ? coachId : null),
      date: itemData.date || new Date().toISOString().split('T')[0],
      duration: itemData.duration || (itemData.type === 'video' ? 'Video Lesson' : 'Study Resource'),
      access_type: accessType,
      allowed_batch_id: batchId,
      allowed_batch_name: batchName,
      allowed_student_ids: studentIds,
      allowed_student_names: studentNames,
      tags: Array.isArray(itemData.tags) ? itemData.tags : (itemData.tags || '').split(',').map(s => s.trim()).filter(Boolean),
      created_at: itemData.created_at || new Date().toISOString()
    };

    // Update memory & local storage
    const idx = window.elibraryItems.findIndex(x => String(x.id) === String(item.id));
    if (idx >= 0) {
      if (window.role === 'coach' && !canUserManageItem(window.elibraryItems[idx])) {
        if (window.toast) window.toast('Permission denied: Coaches can only edit their own materials.', 'error');
        return false;
      }
      window.elibraryItems[idx] = { ...window.elibraryItems[idx], ...item };
    } else {
      window.elibraryItems.unshift(item);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(window.elibraryItems));
    } catch (e) {}

    // Cloud upsert
    if (window.supabaseClient) {
      try {
        await window.supabaseClient.from('elibrary').upsert([item]);
      } catch (e) {
        console.warn('[E-Library] Supabase upsert non-blocking error:', e);
      }
    }

    updateStatsCounters();
    if (window.toast) window.toast(idx >= 0 ? '✨ Study material updated successfully!' : '✨ Study material added to E-Library successfully!', 'success');
    
    // Re-render active views
    window.renderAdminElibraryPage();
    window.renderCoachElibraryPage();
    window.renderChildElibrary();
    return true;
  };

  // ── Delete Material ──
  window.deleteElibraryItem = async function (id) {
    const item = window.elibraryItems.find(x => String(x.id) === String(id));
    if (!item) return;

    if (!canUserManageItem(item)) {
      if (window.toast) window.toast('Permission denied: You can only delete your own uploaded materials.', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${item.title}" from E-Library?`)) return;
    window.elibraryItems = window.elibraryItems.filter(x => String(x.id) !== String(id));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(window.elibraryItems));
    } catch (e) {}

    if (window.supabaseClient) {
      try {
        await window.supabaseClient.from('elibrary').delete().eq('id', id);
      } catch (e) {}
    }

    updateStatsCounters();
    if (window.toast) window.toast('Material removed from E-Library.', 'info');
    window.renderAdminElibraryPage();
    window.renderCoachElibraryPage();
    window.renderChildElibrary();
  };

  // ── Edit Material ──
  window.editElibraryItem = function (id) {
    const item = window.elibraryItems.find(x => String(x.id) === String(id));
    if (!item) return;

    if (!canUserManageItem(item)) {
      if (window.toast) window.toast('Permission denied: Coaches can only edit their own materials.', 'error');
      return;
    }

    const modal = document.getElementById('add-elibrary-modal');
    if (!modal) return;

    window._editingElibId = item.id;
    window._editingElibAuthor = item.author;
    window._editingElibCoachId = item.coach_id;

    const modalTitle = modal.querySelector('.modal-title');
    if (modalTitle) modalTitle.innerHTML = '✏️ Edit Study Material / Recorded Session';

    const submitBtn = modal.querySelector('button.btn-gold');
    if (submitBtn) submitBtn.textContent = 'Save Changes';

    const fTitle = document.getElementById('elib-form-title');
    const fDesc = document.getElementById('elib-form-desc');
    const fCat = document.getElementById('elib-form-cat');
    const fLevel = document.getElementById('elib-form-level');
    const fUrl = document.getElementById('elib-form-url');
    const fDuration = document.getElementById('elib-form-duration');
    const fAccess = document.getElementById('elib-form-access-type');

    if (fTitle) fTitle.value = item.title || '';
    if (fDesc) fDesc.value = item.description || '';
    if (fCat) fCat.value = item.category || 'openings';
    if (fLevel) fLevel.value = item.level || 'All Levels';
    if (fUrl) fUrl.value = item.url || '';
    if (fDuration) fDuration.value = item.duration || '';

    const accessType = item.access_type || (item.allowed_student_ids?.length ? 'students' : (item.allowed_batch_id ? 'batch' : 'all'));
    if (fAccess) fAccess.value = accessType;

    // Populate batches and students
    window.populateElibBatchOptions(item.allowed_batch_id);
    window.populateElibStudentList(item.allowed_student_ids || []);
    window.toggleElibAccessType(accessType);

    modal.classList.add('active');
  };

  // ── Access Permission Modal Helpers ──
  window.toggleElibAccessType = function (type) {
    const batchBox = document.getElementById('elib-form-batch-container');
    const studBox = document.getElementById('elib-form-students-container');
    if (batchBox) batchBox.style.display = type === 'batch' ? 'block' : 'none';
    if (studBox) studBox.style.display = type === 'students' ? 'block' : 'none';
  };

  window.populateElibBatchOptions = function (selectedId) {
    const select = document.getElementById('elib-form-batch');
    if (!select) return;
    const batches = window.allBatches || [];
    let opts = '<option value="">-- Choose Batch --</option>';
    batches.forEach(b => {
      const isSel = String(b.id) === String(selectedId) ? 'selected' : '';
      opts += `<option value="${escapeHtml(b.id)}" ${isSel}>${escapeHtml(b.name || 'Unnamed Batch')}</option>`;
    });
    select.innerHTML = opts;
  };

  window.populateElibStudentList = function (selectedIds) {
    const list = document.getElementById('elib-form-students-list');
    if (!list) return;
    const students = window.allStudents || [];
    const selSet = new Set((selectedIds || []).map(String));

    if (!students.length) {
      list.innerHTML = `<div style="grid-column:1/-1; font-size:12px; color:#94a3b8; text-align:center; padding:12px;">No active students found in the academy.</div>`;
      return;
    }

    list.innerHTML = students.map(s => {
      const sid = String(s.id);
      const isChecked = selSet.has(sid) ? 'checked' : '';
      const name = s.name || s.full_name || `Student #${sid}`;
      const level = s.level || 'Beginner';
      return `
        <label class="elib-student-checkbox-item" data-name="${escapeHtml(name.toLowerCase())}" style="display:flex; align-items:center; gap:8px; font-size:12px; color:#fff; cursor:pointer; background:rgba(255,255,255,0.04); padding:6px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.06);">
          <input type="checkbox" class="elib-stud-check" value="${escapeHtml(sid)}" ${isChecked} onchange="window.updateElibSelectedCount()" style="cursor:pointer; accent-color:var(--gold);">
          <span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(name)}</span>
          <span style="font-size:10px; opacity:0.6; background:rgba(218,163,62,0.15); color:var(--gold); padding:2px 6px; border-radius:4px;">${escapeHtml(level)}</span>
        </label>
      `;
    }).join('');

    window.updateElibSelectedCount();
  };

  window.filterElibStudentList = function (query) {
    const q = String(query || '').toLowerCase().trim();
    const items = document.querySelectorAll('.elib-student-checkbox-item');
    items.forEach(el => {
      const name = el.getAttribute('data-name') || '';
      el.style.display = !q || name.includes(q) ? 'flex' : 'none';
    });
  };

  window.selectAllElibStudents = function () {
    document.querySelectorAll('.elib-stud-check').forEach(cb => {
      const parent = cb.closest('.elib-student-checkbox-item');
      if (!parent || parent.style.display !== 'none') {
        cb.checked = true;
      }
    });
    window.updateElibSelectedCount();
  };

  window.clearAllElibStudents = function () {
    document.querySelectorAll('.elib-stud-check').forEach(cb => cb.checked = false);
    window.updateElibSelectedCount();
  };

  window.updateElibSelectedCount = function () {
    const count = document.querySelectorAll('.elib-stud-check:checked').length;
    const countEl = document.getElementById('elib-form-students-selected-count');
    if (countEl) countEl.textContent = `${count} student${count === 1 ? '' : 's'} selected`;
  };

  function getCategoryLabel(cat) {
    switch (cat) {
      case 'recordings': return '🎥 Class Recording';
      case 'openings': return '♟️ Opening Repertoire';
      case 'tactics': return '⚡ Tactics & Calculation';
      case 'endgames': return '👑 Endgame Mastery';
      case 'masterclasses': return '📖 Grandmaster Lecture';
      case 'tournaments': return '🏆 Tournament Prep';
      default: return '📚 Study Resource';
    }
  }

  // ── Render Card HTML ──
  function renderItemCard(item) {
    const isVideo = item.type === 'video' || item.url.includes('youtube') || item.url.includes('youtu.be') || item.url.includes('drive.google.com') || item.url.includes('loom.com');
    const badgeColor = item.category === 'recordings' ? '#ef4444' : (item.category === 'openings' ? '#3b82f6' : (item.category === 'tactics' ? '#eab308' : '#10b981'));
    const canManage = canUserManageItem(item);
    
    // Access pill
    let accessBadge = '<span style="background:rgba(16,185,129,0.15); color:#10b981; font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px;">🌐 All Students</span>';
    if (item.access_type === 'batch' || (item.allowed_batch_id && item.allowed_batch_id !== 'all')) {
      const bName = item.allowed_batch_name || 'Batch';
      accessBadge = `<span style="background:rgba(168,85,247,0.15); color:#c084fc; font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px;">👥 ${escapeHtml(bName)}</span>`;
    } else if (item.access_type === 'students' || (Array.isArray(item.allowed_student_ids) && item.allowed_student_ids.length > 0)) {
      const count = item.allowed_student_names?.length || item.allowed_student_ids?.length || 0;
      const namesStr = (item.allowed_student_names || []).slice(0, 2).join(', ') + (count > 2 ? ` +${count - 2} more` : '');
      accessBadge = `<span style="background:rgba(234,179,8,0.15); color:#eab308; font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px;" title="${escapeHtml((item.allowed_student_names || []).join(', '))}">🔒 ${escapeHtml(namesStr || `${count} Students Only`)}</span>`;
    }

    // Video Thumbnail Extraction
    let thumbnailHtml = '';
    if (isVideo) {
      let vidId = '';
      if (item.url.includes('youtube.com/watch?v=')) {
        vidId = item.url.split('v=')[1]?.split('&')[0];
      } else if (item.url.includes('youtu.be/')) {
        vidId = item.url.split('youtu.be/')[1]?.split('?')[0];
      }

      if (vidId) {
        thumbnailHtml = `
          <div style="position:relative; width:100%; height:160px; background:#0f172a; overflow:hidden; cursor:pointer;" onclick="window.openElibraryVideo('${escapeHtml(item.title)}', '${escapeHtml(item.url)}')">
            <img src="https://img.youtube.com/vi/${vidId}/hqdefault.jpg" alt="${escapeHtml(item.title)}" style="width:100%; height:100%; object-fit:cover; opacity:0.85; transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <div style="position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%); display:flex; align-items:center; justify-content:center;">
              <div style="width:48px; height:48px; border-radius:50%; background:rgba(218,163,62,0.92); display:flex; align-items:center; justify-content:center; color:#000; font-size:20px; box-shadow:0 4px 15px rgba(0,0,0,0.5); padding-left:3px;">▶</div>
            </div>
            ${item.duration ? `<span style="position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.8); color:#fff; font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:4px; backdrop-filter:blur(4px);">⏱️ ${escapeHtml(item.duration)}</span>` : ''}
          </div>
        `;
      }
    }

    return `
      <div class="elib-card" style="background:var(--surface, #1e293b); border:1px solid rgba(255,255,255,0.08); border-radius:18px; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 10px 30px rgba(0,0,0,0.25); transition:transform 0.25s, border-color 0.25s;">
        ${thumbnailHtml}
        <div style="padding:14px 18px 10px; display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(255,255,255,0.02); gap:8px;">
          <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
            <span style="background:${badgeColor}22; color:${badgeColor}; border:1px solid ${badgeColor}44; font-size:11px; font-weight:800; padding:3px 8px; border-radius:6px; text-transform:uppercase;">
              ${escapeHtml(item.categoryLabel || getCategoryLabel(item.category))}
            </span>
            <span style="background:rgba(255,255,255,0.06); color:var(--ivory-dim, #94a3b8); font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px;">
              ${escapeHtml(item.level || 'All Levels')}
            </span>
            ${accessBadge}
          </div>
          ${canManage ? `
            <div style="display:flex; gap:6px; flex-shrink:0;">
              <button class="btn btn-outline btn-sm" onclick="window.editElibraryItem('${escapeHtml(item.id)}')" style="padding:4px 8px; font-size:11px; color:var(--gold, #daa33e); border-color:rgba(218,163,62,0.3);" title="Edit Material & Access">✏️</button>
              <button class="btn btn-outline btn-sm" onclick="window.deleteElibraryItem('${escapeHtml(item.id)}')" style="padding:4px 8px; font-size:11px; color:#ef4444; border-color:rgba(239,68,68,0.3);" title="Delete Material">🗑️</button>
            </div>
          ` : ''}
        </div>

        <div style="padding:16px 18px; flex:1; display:flex; flex-direction:column;">
          <h3 style="margin:0 0 8px; font-size:1.05rem; font-weight:800; color:#ffffff; line-height:1.4;">
            ${isVideo ? '🎥 ' : '📄 '} ${escapeHtml(item.title)}
          </h3>
          <p style="margin:0 0 14px; font-size:0.88rem; color:#94a3b8; line-height:1.5; flex:1;">
            ${escapeHtml(item.description || 'No detailed description provided.')}
          </p>

          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:#64748b; margin-bottom:14px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.04);">
            <span>👨‍🏫 <strong>${escapeHtml(item.author || 'ChessKidoo Coach')}</strong></span>
            <span>📅 ${escapeHtml(item.date || '')}</span>
          </div>

          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${isVideo ? `
              <button class="btn btn-primary" style="flex:1; padding:9px 14px; font-size:0.85rem; font-weight:800; border-radius:10px; display:inline-flex; align-items:center; justify-content:center; gap:6px; box-shadow:0 4px 15px rgba(218,163,62,0.3);" onclick="window.openElibraryVideo('${escapeHtml(item.title)}', '${escapeHtml(item.url)}')">
                <span>▶ Watch Session</span>
              </button>
            ` : `
              <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" class="btn btn-gold" style="flex:1; padding:9px 14px; font-size:0.85rem; font-weight:800; border-radius:10px; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:6px;">
                <span>📥 Download</span>
              </a>
            `}
            <button class="btn btn-outline" style="flex:1; padding:9px 12px; font-size:0.82rem; border-radius:10px; border-color:rgba(218,163,62,0.4); color:var(--gold);" onclick="window.openStudyPgnFromElibrary('${escapeHtml(item.title)}', '${escapeHtml(item.category)}')" title="Study on Interactive Board">
              <span>♟️ Study Board</span>
            </button>
            ${canManage ? `
              <button class="btn btn-outline" style="padding:9px 12px; font-size:0.82rem; border-radius:10px; border-color:rgba(218,163,62,0.35); color:var(--gold);" onclick="window.editElibraryItem('${escapeHtml(item.id)}')" title="Configure Student Access">
                <span>👤 Access</span>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // ── Open in Study PGN Board ──
  window.openStudyPgnFromElibrary = function (title, category) {
    if (window.setChildTab) {
      if (window.setPage) window.setPage('child');
      window.setChildTab('studypgn');
      if (window.StudyPGN) {
        window.StudyPGN.loadCuratedGame(0);
      }
      if (window.toast) window.toast(`♟️ Loaded "${title}" into Interactive Study Board!`, 'info');
    }
  };

  // ── High-Fidelity Theater Video Player ──
  window.openElibraryVideo = function (title, url) {
    const modal = document.getElementById('video-player-modal');
    const modalTitle = document.getElementById('video-modal-title');
    const iframe = document.getElementById('video-modal-iframe');

    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      const vidId = url.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${vidId}?autoplay=1&enablejsapi=1&rel=0`;
    } else if (url.includes('youtu.be/')) {
      const vidId = url.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${vidId}?autoplay=1&enablejsapi=1&rel=0`;
    } else if (url.includes('drive.google.com/file/d/')) {
      embedUrl = url.replace('/view', '/preview');
    }

    if (modal && iframe) {
      if (modalTitle) modalTitle.textContent = `🎥 ${title}`;
      iframe.dataset.rawUrl = url;
      iframe.src = embedUrl;
      modal.style.display = 'flex';
      modal.classList.add('active', 'open');
      return;
    }

    // Floating Mini-Player Fallback
    let miniPlayer = document.getElementById('ck-floating-miniplayer');
    if (!miniPlayer) {
      miniPlayer = document.createElement('div');
      miniPlayer.id = 'ck-floating-miniplayer';
      miniPlayer.style.cssText = 'position:fixed; bottom:20px; right:20px; width:380px; height:240px; background:#000; border:2px solid var(--gold); border-radius:12px; overflow:hidden; z-index:999999; box-shadow:0 10px 30px rgba(0,0,0,0.8); display:flex; flex-direction:column;';
      miniPlayer.innerHTML = `
        <div style="background:#1e293b; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1);">
          <span id="ck-mini-title" style="font-size:12px; font-weight:700; color:var(--gold); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:280px;">${escapeHtml(title)}</span>
          <div style="display:flex; gap:6px;">
            <button onclick="document.getElementById('ck-floating-miniplayer').remove()" style="background:none; border:none; color:#fff; cursor:pointer; font-size:16px;">✕</button>
          </div>
        </div>
        <iframe id="ck-mini-iframe" src="${embedUrl}" style="width:100%; height:100%; border:none;" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>
      `;
      document.body.appendChild(miniPlayer);
    } else {
      document.getElementById('ck-mini-title').textContent = title;
      document.getElementById('ck-mini-iframe').src = embedUrl;
    }
  };

  window.closeVideoModal = function () {
    const modal = document.getElementById('video-player-modal');
    const iframe = document.getElementById('video-modal-iframe');
    if (iframe) iframe.src = '';
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active', 'open');
    }
  };

  window.openYouTubeExternal = function () {
    const iframe = document.getElementById('video-modal-iframe');
    if (iframe && iframe.dataset.rawUrl) {
      window.open(iframe.dataset.rawUrl, '_blank');
    }
  };


  // ── Filter Helper for Admin & Coach ──
  function getFilteredItems() {
    return (window.elibraryItems || []).filter(item => {
      const matchesCat = currentFilter === 'all' || item.category === currentFilter;
      const matchesLevel = currentLevelFilter === 'all' || item.level === currentLevelFilter || item.level === 'All Levels';
      
      let matchesAccess = true;
      if (currentAccessFilter === 'public') {
        matchesAccess = item.access_type === 'all' || (!item.allowed_batch_id && (!item.allowed_student_ids || !item.allowed_student_ids.length));
      } else if (currentAccessFilter === 'batch') {
        matchesAccess = item.access_type === 'batch' || Boolean(item.allowed_batch_id && item.allowed_batch_id !== 'all');
      } else if (currentAccessFilter === 'students') {
        matchesAccess = item.access_type === 'students' || (Array.isArray(item.allowed_student_ids) && item.allowed_student_ids.length > 0);
      }

      const q = currentSearch.toLowerCase();
      const matchesSearch = !q || 
        item.title.toLowerCase().includes(q) || 
        (item.description && item.description.toLowerCase().includes(q)) || 
        (item.author && item.author.toLowerCase().includes(q)) ||
        (Array.isArray(item.allowed_student_names) && item.allowed_student_names.some(n => n.toLowerCase().includes(q)));
      
      return matchesCat && matchesLevel && matchesAccess && matchesSearch;
    });
  }

  // ── Student Access Authorization Filter ──
  function isItemAccessibleToStudent(item, student) {
    if (!student) return true;
    const sid = String(student.id);

    // 1. Explicit individual student access
    if (item.access_type === 'students' || (Array.isArray(item.allowed_student_ids) && item.allowed_student_ids.length > 0)) {
      return (item.allowed_student_ids || []).map(String).includes(sid);
    }

    // 2. Specific batch access
    if (item.access_type === 'batch' || (item.allowed_batch_id && item.allowed_batch_id !== 'all')) {
      if (student.batch_id && String(student.batch_id) === String(item.allowed_batch_id)) return true;
      if (Array.isArray(window.allBatches)) {
        const batch = window.allBatches.find(b => String(b.id) === String(item.allowed_batch_id));
        if (batch && Array.isArray(batch.student_ids) && batch.student_ids.map(String).includes(sid)) {
          return true;
        }
      }
      return false;
    }

    // 3. Open to all students (Skill level check)
    const levelRank = { 'Beginner': 0, 'Intermediate': 1, 'Advanced': 2, 'Master': 3, 'All Levels': 0 };
    const studentLevel = student.level || 'Beginner';
    const itemLevel = item.level || 'All Levels';
    if (itemLevel !== 'All Levels') {
      if ((levelRank[studentLevel] || 0) < (levelRank[itemLevel] || 0)) {
        return false;
      }
    }

    return true;
  }

  // ── Render Views ──
  window.renderAdminElibraryPage = function () {
    const container = document.getElementById('admin-elibrary-grid');
    if (!container) return;
    updateStatsCounters();
    const items = getFilteredItems();
    if (!items.length) {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#94a3b8; background:var(--surface); border:1px dashed var(--border); border-radius:14px;">No study materials found matching active filters. Click <strong>+ Add New Material</strong> to upload!</div>`;
      return;
    }
    container.innerHTML = items.map(item => renderItemCard(item)).join('');
  };

  window.renderCoachElibraryPage = function () {
    const container = document.getElementById('coach-elibrary-grid');
    if (!container) return;
    const items = getFilteredItems();
    if (!items.length) {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#94a3b8; background:var(--surface); border:1px dashed var(--border); border-radius:14px;">No study materials found matching filters. Click <strong>+ Upload Material</strong> to add one!</div>`;
      return;
    }
    container.innerHTML = items.map(item => renderItemCard(item)).join('');
  };

  window.renderChildElibrary = function () {
    const container = document.getElementById('child-elibrary-grid');
    if (!container) return;
    const currentStudent = window.currentStudent;
    
    // Filter accessible items
    const allFiltered = getFilteredItems();
    const items = allFiltered.filter(item => isItemAccessibleToStudent(item, currentStudent));

    let classroomsHtml = '';
    if (currentStudent && Array.isArray(window.allBatches)) {
      const myBatches = window.allBatches.filter(b => b.student_ids && b.student_ids.map(String).includes(String(currentStudent.id)) && b.chessable_url);
      if (myBatches.length > 0) {
        classroomsHtml = myBatches.map(b => `
          <div class="elib-card" style="border:1.5px solid var(--gold); background:rgba(218,163,62,0.06); border-radius:14px; padding:18px; display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="background:rgba(218,163,62,0.2); color:var(--gold); font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px;">♟️ BATCH CLASSROOM</span>
              <span style="font-size:12px; color:var(--ivory-dim);">Live Course</span>
            </div>
            <h4 style="margin:0; color:#fff; font-size:15px; font-weight:700;">${escapeHtml(b.name)}</h4>
            <p style="margin:0; font-size:12.5px; color:var(--ivory-dim); line-height:1.5;">Official interactive classroom study link for your batch.</p>
            <div style="margin-top:auto; padding-top:8px;">
              <a href="${escapeHtml(b.chessable_url)}" target="_blank" rel="noopener" class="btn btn-gold btn-sm" style="width:100%; text-align:center; display:block; text-decoration:none;">🚀 Join Interactive Classroom</a>
            </div>
          </div>
        `).join('');
      }
    }

    if (!items.length && !classroomsHtml) {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#94a3b8; background:var(--surface); border:1px dashed var(--border); border-radius:14px;">No learning resources found in this category yet. Check back soon!</div>`;
      return;
    }
    container.innerHTML = classroomsHtml + items.map(item => renderItemCard(item)).join('');
  };

  // ── Filter Triggers ──
  window.filterElibrary = function (cat, btn) {
    currentFilter = cat;
    if (btn) {
      const parent = btn.parentElement;
      if (parent) parent.querySelectorAll('.elib-filter-pill').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
    }
    window.renderAdminElibraryPage();
    window.renderCoachElibraryPage();
    window.renderChildElibrary();
  };

  window.filterElibraryAccess = function (val) {
    currentAccessFilter = String(val || 'all');
    window.renderAdminElibraryPage();
    window.renderCoachElibraryPage();
  };

  window.filterElibraryLevel = function (val) {
    currentLevelFilter = String(val || 'all');
    window.renderAdminElibraryPage();
    window.renderCoachElibraryPage();
    window.renderChildElibrary();
  };

  window.searchElibrary = function (val) {
    currentSearch = String(val || '').trim();
    window.renderAdminElibraryPage();
    window.renderCoachElibraryPage();
    window.renderChildElibrary();
  };

  // ── Add Modal Setup ──
  window.openAddElibraryModal = function () {
    const modal = document.getElementById('add-elibrary-modal');
    if (modal) {
      window._editingElibId = null;
      window._editingElibAuthor = null;
      window._editingElibCoachId = null;

      const modalTitle = modal.querySelector('.modal-title');
      if (modalTitle) modalTitle.innerHTML = '📖 Add Study Material / Recorded Session';

      const submitBtn = modal.querySelector('button.btn-gold');
      if (submitBtn) submitBtn.textContent = 'Publish to E-Library';

      // Clear fields
      const fTitle = document.getElementById('elib-form-title');
      const fDesc = document.getElementById('elib-form-desc');
      const fCat = document.getElementById('elib-form-cat');
      const fLevel = document.getElementById('elib-form-level');
      const fUrl = document.getElementById('elib-form-url');
      const fDuration = document.getElementById('elib-form-duration');
      const fAccess = document.getElementById('elib-form-access-type');

      if (fTitle) fTitle.value = '';
      if (fDesc) fDesc.value = '';
      if (fCat) fCat.value = 'openings';
      if (fLevel) fLevel.value = 'All Levels';
      if (fUrl) fUrl.value = '';
      if (fDuration) fDuration.value = '';
      if (fAccess) fAccess.value = 'all';

      window.populateElibBatchOptions('');
      window.populateElibStudentList([]);
      window.toggleElibAccessType('all');

      modal.classList.add('active');
    }
  };

  window.submitAddElibraryForm = function () {
    const title = document.getElementById('elib-form-title')?.value;
    const desc = document.getElementById('elib-form-desc')?.value;
    const cat = document.getElementById('elib-form-cat')?.value;
    const level = document.getElementById('elib-form-level')?.value;
    const url = document.getElementById('elib-form-url')?.value;
    const duration = document.getElementById('elib-form-duration')?.value;
    const accessType = document.getElementById('elib-form-access-type')?.value || 'all';
    const batchId = document.getElementById('elib-form-batch')?.value || '';

    const checkedStudents = Array.from(document.querySelectorAll('.elib-stud-check:checked')).map(cb => cb.value);

    if (!title || !url) {
      if (window.toast) window.toast('Please provide at least a title and resource link!', 'warning');
      return;
    }

    if (accessType === 'batch' && !batchId) {
      if (window.toast) window.toast('Please select a target batch or change access to All Students.', 'warning');
      return;
    }

    if (accessType === 'students' && !checkedStudents.length) {
      if (window.toast) window.toast('Please select at least one student or change access to All Students.', 'warning');
      return;
    }

    const payload = {
      title,
      description: desc,
      category: cat,
      level,
      url,
      duration: duration || 'Study Resource',
      access_type: accessType,
      allowed_batch_id: batchId,
      allowed_student_ids: checkedStudents
    };

    if (window._editingElibId) {
      payload.id = window._editingElibId;
      if (window._editingElibAuthor) payload.author = window._editingElibAuthor;
      if (window._editingElibCoachId) payload.coach_id = window._editingElibCoachId;
    }

    window.saveElibraryItem(payload);

    const modal = document.getElementById('add-elibrary-modal');
    if (modal) modal.classList.remove('active');
  };

  // ── Quick Grant to Student Modal ──
  window.openGrantAccessModal = function (defaultStudentId) {
    const modal = document.getElementById('grant-elibrary-modal');
    if (!modal) return;

    const select = document.getElementById('grant-elib-student-select');
    const students = window.allStudents || [];

    if (select) {
      let opts = '<option value="">-- Choose Student --</option>';
      students.forEach(s => {
        const sid = String(s.id);
        const name = s.name || s.full_name || `Student #${sid}`;
        const isSel = String(defaultStudentId) === sid ? 'selected' : '';
        opts += `<option value="${escapeHtml(sid)}" ${isSel}>${escapeHtml(name)} (${escapeHtml(s.level || 'Beginner')})</option>`;
      });
      select.innerHTML = opts;
    }

    const targetStudentId = defaultStudentId || (select ? select.value : '');
    window.onGrantStudentChanged(targetStudentId);

    modal.classList.add('active');
  };

  window.onGrantStudentChanged = function (studentId) {
    const list = document.getElementById('grant-elib-materials-list');
    const countEl = document.getElementById('grant-elib-count');
    if (!list) return;

    const items = window.elibraryItems || [];
    const sid = String(studentId || '');

    if (!items.length) {
      list.innerHTML = `<div style="text-align:center; padding:16px; color:#94a3b8; font-size:12.5px;">No materials currently in E-Library.</div>`;
      if (countEl) countEl.textContent = '0 selected';
      return;
    }

    let checkedCount = 0;
    list.innerHTML = items.map(item => {
      const isChecked = (item.allowed_student_ids || []).map(String).includes(sid);
      if (isChecked) checkedCount++;
      return `
        <label style="display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.03); padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.06); cursor:pointer;">
          <input type="checkbox" class="grant-elib-item-check" value="${escapeHtml(item.id)}" ${isChecked ? 'checked' : ''} onchange="window.updateGrantSelectedCount()" style="cursor:pointer; accent-color:var(--gold);">
          <div style="flex:1;">
            <div style="color:#fff; font-size:13px; font-weight:700;">${escapeHtml(item.title)}</div>
            <div style="color:var(--ivory-dim); font-size:11px;">${escapeHtml(item.categoryLabel || item.category)} · ${escapeHtml(item.level || 'All Levels')}</div>
          </div>
        </label>
      `;
    }).join('');

    if (countEl) countEl.textContent = `${checkedCount} selected`;
  };

  window.updateGrantSelectedCount = function () {
    const count = document.querySelectorAll('.grant-elib-item-check:checked').length;
    const countEl = document.getElementById('grant-elib-count');
    if (countEl) countEl.textContent = `${count} selected`;
  };

  window.saveGrantAccessForm = async function () {
    const select = document.getElementById('grant-elib-student-select');
    const studentId = select ? select.value : '';
    if (!studentId) {
      if (window.toast) window.toast('Please select a student first!', 'warning');
      return;
    }

    const sid = String(studentId);
    const checkedItemIds = new Set(Array.from(document.querySelectorAll('.grant-elib-item-check:checked')).map(cb => String(cb.value)));

    const studentObj = (window.allStudents || []).find(s => String(s.id) === sid);
    const studentName = studentObj ? (studentObj.name || studentObj.full_name || `Student #${sid}`) : `Student #${sid}`;

    let updatedCount = 0;
    (window.elibraryItems || []).forEach(item => {
      let ids = Array.isArray(item.allowed_student_ids) ? [...item.allowed_student_ids.map(String)] : [];
      let names = Array.isArray(item.allowed_student_names) ? [...item.allowed_student_names] : [];

      const shouldHaveAccess = checkedItemIds.has(String(item.id));
      const currentlyHasAccess = ids.includes(sid);

      if (shouldHaveAccess && !currentlyHasAccess) {
        ids.push(sid);
        names.push(studentName);
        item.allowed_student_ids = ids;
        item.allowed_student_names = names;
        item.access_type = 'students';
        updatedCount++;
      } else if (!shouldHaveAccess && currentlyHasAccess) {
        const pos = ids.indexOf(sid);
        if (pos >= 0) {
          ids.splice(pos, 1);
          names.splice(pos, 1);
        }
        item.allowed_student_ids = ids;
        item.allowed_student_names = names;
        if (!ids.length && item.access_type === 'students') {
          item.access_type = 'all';
        }
        updatedCount++;
      }
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(window.elibraryItems));
    } catch (e) {}

    if (window.supabaseClient) {
      try {
        await window.supabaseClient.from('elibrary').upsert(window.elibraryItems);
      } catch (e) {}
    }

    updateStatsCounters();
    if (window.toast) window.toast(`✨ Permissions updated for ${studentName}!`, 'success');

    window.renderAdminElibraryPage();
    window.renderCoachElibraryPage();
    window.renderChildElibrary();

    const modal = document.getElementById('grant-elibrary-modal');
    if (modal) modal.classList.remove('active');
  };

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Initial load
  window.addEventListener('DOMContentLoaded', () => {
    window.loadElibraryData();
  });
})();

  // ── Advanced Video Player Modes (Modal, Mini-Player, Fullscreen) ──
  window.isVideoMini = false;

  window.closeVideoPlayer = function () {
    const modal = document.getElementById('video-player-modal');
    const iframe = document.getElementById('video-modal-iframe');
    const box = document.getElementById('video-player-modal-box');
    if (iframe) iframe.src = '';
    if (box) {
      box.style.position = '';
      box.style.bottom = '';
      box.style.right = '';
      box.style.width = '95%';
      box.style.maxWidth = '860px';
      box.style.zIndex = '';
    }
    if (modal) {
      modal.classList.remove('active', 'open');
      modal.style.display = 'none';
      modal.style.background = '';
      modal.style.pointerEvents = '';
    }
    window.isVideoMini = false;
  };

  window.toggleVideoMiniPlayer = function () {
    const modal = document.getElementById('video-player-modal');
    const box = document.getElementById('video-player-modal-box');
    const miniBtn = document.getElementById('btn-video-mini');
    if (!modal || !box) return;

    window.isVideoMini = !window.isVideoMini;
    if (window.isVideoMini) {
      modal.style.background = 'transparent';
      modal.style.pointerEvents = 'none';
      box.style.pointerEvents = 'auto';
      box.style.position = 'fixed';
      box.style.bottom = '24px';
      box.style.right = '24px';
      box.style.width = '360px';
      box.style.maxWidth = '360px';
      box.style.zIndex = '999999';
      box.style.boxShadow = '0 12px 35px rgba(0,0,0,0.85)';
      if (miniBtn) miniBtn.textContent = '🗗 Centered View';
      if (window.toast) window.toast('📺 Mini Player docked! You can now explore tactics & study pages while playing.', 'info');
    } else {
      modal.style.background = 'rgba(0,0,0,0.8)';
      modal.style.pointerEvents = 'auto';
      box.style.position = '';
      box.style.bottom = '';
      box.style.right = '';
      box.style.width = '95%';
      box.style.maxWidth = '860px';
      box.style.zIndex = '';
      box.style.boxShadow = '';
      if (miniBtn) miniBtn.textContent = '📺 Mini Player';
    }
  };

  window.toggleVideoFullscreen = function () {
    const iframeWrap = document.getElementById('video-iframe-wrap');
    if (!iframeWrap) return;
    if (!document.fullscreenElement) {
      if (iframeWrap.requestFullscreen) iframeWrap.requestFullscreen();
      else if (iframeWrap.webkitRequestFullscreen) iframeWrap.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };
