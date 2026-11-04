const att = await (await fetch('https://chesskidoo.pages.dev/lms/js/attendance_extension.js')).text();

// 1. Find the renderAttendanceCalendar function and check its data source
const calStart = att.indexOf('window.renderAttendanceCalendar = function');
const calEnd = att.indexOf('window.changeAttendanceCalendarMonth', calStart);
const calBody = att.slice(calStart, calEnd);
console.log('=== renderAttendanceCalendar ===');
console.log('reads window.allAttendance:', calBody.includes('window.allAttendance'));
console.log('reads window.allStudents:', calBody.includes('window.allStudents'));
console.log('has status present:', calBody.includes("'present'"));
console.log('has status absent:', calBody.includes("'absent'"));
console.log('has checkmark:', calBody.includes('✓'));
console.log('has X:', calBody.includes('✕'));

// 2. Find toggleCellAttendance and check its data mutation
const toggleStart = att.indexOf('window.toggleCellAttendance');
const toggleEnd = att.indexOf('window.openMasterSchedule', toggleStart);
const toggleBody = att.slice(toggleStart, toggleEnd);
console.log('\n=== toggleCellAttendance ===');
console.log('mutates window.allAttendance:', toggleBody.includes('window.allAttendance ='));
console.log('calls renderAttendanceCalendar:', toggleBody.includes('renderAttendanceCalendar'));
console.log('calls renderMonthlyMatrix:', toggleBody.includes('renderMonthlyMatrix'));
console.log('calls renderChildAttendance:', toggleBody.includes('renderChildAttendance'));
console.log('has supabase fallback:', toggleBody.includes('supabaseClient.from'));

// 3. Find renderChildAttendanceAndHomework
const rchStart = att.indexOf('window.renderChildAttendanceAndHomework');
const rchEnd = att.indexOf('// Auto-wire', rchStart);
const rchBody = att.slice(rchStart, rchEnd);
console.log('\n=== renderChildAttendanceAndHomework ===');
console.log('is async:', rchStart !== -1 && att.slice(rchStart, rchStart + 60).includes('async'));
console.log('fetches fresh:', rchBody.includes("apiCall('/api/attendance?limit=1000'"));
console.log('calls renderAttendanceCalendar:', rchBody.includes('renderAttendanceCalendar'));
console.log('calls renderChildHomework:', rchBody.includes('renderChildHomework'));

// 4. Check the auto-wire at the end
const wireStart = att.indexOf('// Auto-wire renderChildAttendance');
console.log('\n=== Auto-wire ===');
console.log(att.slice(wireStart, wireStart + 400));