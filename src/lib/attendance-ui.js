// attendance-ui.js – client‑side helper to keep attendance icons in sync
// ---------------------------------------------------------------
// This module can be loaded in the browser via `import`.
// It fetches the latest attendance map from the backend and updates
// every element that carries the data attributes used by the UI.

export async function fixAttendanceIcons(page) {
  // 1️⃣ Pull the latest attendance map from the API.
  const latestMap = await page.evaluate(async (base) => {
    try {
      const res = await fetch(`${base}/attendance`);
      if (!res.ok) return {};
      const data = await res.json();
      // Backend now returns { latestAttendance: { "studentId_date": "present"|"absent" } }
      return data.latestAttendance || {};
    } catch {
      return {};
    }
  }, process.env.BASE_URL || 'https://chesskidoo.pages.dev');

  // 2️⃣ Walk the DOM and update icons.
  await page.evaluate((map) => {
    const elems = document.querySelectorAll('[data-student-id][data-attendance-date]');
    elems.forEach((el) => {
      const studentId = el.getAttribute('data-student-id');
      const date = el.getAttribute('data-attendance-date');
      const key = `${studentId}_${date}`;
      const status = map[key];
      if (!status) return;
      const icon = el.querySelector('.attendance-icon');
      if (!icon) return;
      const desired = status === 'present' ? '✅' : '❌';
      if (icon.textContent !== desired) {
        icon.textContent = desired;
      }
    });
  }, latestMap);
}
