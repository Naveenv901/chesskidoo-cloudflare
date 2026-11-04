const fs = require('fs');
let s = fs.readFileSync('lms/scripts.js', 'utf8');
// Find saveBatchAttendance end
const start = s.indexOf('saveBatchAttendance');
const endMarker = '/* ════════════════ COMBINED CLASS SESSION';
const endIdx = s.indexOf(endMarker, start);
const before = s.slice(start, endIdx);
const lastClose = before.lastIndexOf('}');
const funcEndPos = start + lastClose;
// The function ends with "  }" - insert sync code before it
const insertPos = s.lastIndexOf('  }', funcEndPos);
const beforeFunc = s.slice(0, insertPos);
const afterFunc = s.slice(insertPos);
const syncCode = `
    // Sync window.allAttendance immediately so the calendar reflects the
    // new Present/Absent status without waiting for the debounced
    // loadAllData() call (which may skip the fetch on a rapid second save).
    try {
      const freshRecords = records;
      const existing = window.allAttendance || [];
      freshRecords.forEach((r) => {
        const idx = existing.findIndex(a => String(a.student_id) === String(r.student_id) && String(a.date || '').slice(0, 10) === String(r.date || '').slice(0, 10));
        if (idx > -1) { existing[idx].status = r.status; existing[idx].notes = r.notes; }
        else { existing.push({ student_id: r.student_id, date: r.date, status: r.status, notes: r.notes }); }
      });
      window.allAttendance = existing;
      try { localStorage.setItem('ck_attendance_records', JSON.stringify(existing)); } catch (_) {}
    } catch (_) {}

    // Re-render the calendar so the tick/X flips immediately
    if (typeof window.renderMonthlyMatrix === 'function') window.renderMonthlyMatrix();
    if (typeof window.renderAttendanceCalendar === 'function') {
      const calEl = document.getElementById('child-attendance-cal-container') || document.getElementById('attendance-cal-container');
      if (calEl) {
        const targetStudent = window.currentStudent || (window.allStudents || [])[0];
        if (targetStudent) window.renderAttendanceCalendar(targetStudent, calEl, window.currentCalYear, window.currentCalMonth);
      }
    }
`;
s = beforeFunc + syncCode + afterFunc;
fs.writeFileSync('lms/scripts.js', s);
console.log('Patched saveBatchAttendance with calendar sync');
const verify = fs.readFileSync('lms/scripts.js', 'utf8');
console.log('Has sync code:', verify.includes('Sync window.allAttendance immediately'));
console.log('Has renderMonthlyMatrix call:', verify.includes('window.renderMonthlyMatrix()'));