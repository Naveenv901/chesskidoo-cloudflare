-- ChessKidoo D1: restore per-achievement images.
--
-- The earlier migration inserted the achievements with placeholder-trophy.jpg for
-- every row whose image it could not resolve (and generated ach-* ids instead of
-- keeping the Supabase UUIDs), so 6 of 13 achievements showed the same placeholder.
-- The correct img_url values come from the Supabase export (achievements_rows.csv).
--
-- Keyed on title because D1 rows have generated ids, not the Supabase UUIDs.
-- One-shot data fix: intentionally NOT inside migrations/ so `wrangler d1 migrations
-- apply` never re-executes it. Idempotent anyway (re-asserts the same img_url).

UPDATE achievements SET img_url = '/assets/img/acivements%20img%201.jpeg' WHERE title = '5th Place — Under-14 Boys State Championship 🏅';
UPDATE achievements SET img_url = '/assets/img/img%20fpweb.jpeg'           WHERE title = '7th Position — Under-14 Girls State Championship 👑';
UPDATE achievements SET img_url = '/assets/img/acivements%20img4.jpeg'     WHERE title = 'Velammal Nexus Best performer of the Tournament';
UPDATE achievements SET img_url = '/assets/img/awardss.jpeg'               WHERE title = '2nd Place Winner — Out of 40 Class ⭐ Coach Rohith';
UPDATE achievements SET img_url = '/assets/img/awards.jpeg'                WHERE title = '5th Position — Erode District Chess Tournament 🏆 Republic Day Trophy 2025';
UPDATE achievements SET img_url = '/assets/img/acivements%20img3.jpeg'     WHERE title = 'Top 30 out of 400 Players 🏅 Velammal Nexus Tournament · Tamil Nadu State Association';
