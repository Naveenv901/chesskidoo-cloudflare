const att = await (await fetch('https://chesskidoo.pages.dev/lms/js/attendance_extension.js')).text();

const checks = {
  'toggleCellAttendance mutates window.allAttendance': att.includes('window.allAttendance = attList'),
  'renderMonthlyMatrix reads window.allAttendance': att.includes('window.allAttendance || []'),
  'renderMonthlyMatrix reads window.allStudents': att.includes('window.allStudents || []'),
  'renderChildAttendanceAndHomework fetches fresh': att.includes("apiCall('/api/attendance?limit=1000'"),
  'renderChildAttendanceAndHomework is async': att.includes('window.renderChildAttendanceAndHomework = async function'),
  'renderAttendanceCalendar reads window.allAttendance': att.slice(att.indexOf('window.renderAttendanceCalendar = function'), att.indexOf('window.renderAttendanceCalendar = function') + 600).includes('window.allAttendance'),
  'absent icon uses X': att.includes('✕'),
  'present icon uses checkmark': att.includes('✓'),
  'no supabase fallback in toggle': !att.includes('supabaseClient.from'),
};

let pass = 0, fail = 0;
for (const [name, result] of Object.entries(checks)) {
  console.log(result ? 'PASS' : 'FAIL', '-', name);
  result ? pass++ : fail++;
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');