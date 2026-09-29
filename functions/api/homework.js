export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: cors() });
    }

    if (request.method === 'GET') {
      const view = url.searchParams.get('view');
      if (view === 'submissions') {
        const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
        const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get('limit') || '500')));
        const offset = (page - 1) * limit;

        const { results } = await env.DB.prepare(
          'SELECT * FROM hw_submissions ORDER BY submittedAt DESC LIMIT ? OFFSET ?'
        ).bind(limit, offset).all();

        const { count } = await env.DB.prepare('SELECT COUNT(*) as c FROM hw_submissions').first();
        return json(200, { data: results, total: count?.c || 0, page, limit });
      }

      const id = url.searchParams.get('id');
      if (id) {
        const row = await env.DB.prepare('SELECT * FROM hw_submissions WHERE id = ?').first(id);
        if (!row) return json(404, { error: 'Not found' });
        return json(200, row);
      }

      const { results } = await env.DB.prepare('SELECT * FROM hw_submissions ORDER BY submittedAt DESC').all();
      return json(200, { data: results });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const action = url.searchParams.get('action');

      if (action === 'submit') {
        const studentId = body.student_id || url.searchParams.get('student_id');
        const assignmentId = body.assignment_id || url.searchParams.get('assignment_id');
        if (!studentId || !assignmentId) {
          return json(400, { error: 'Student ID and Assignment ID are required' });
        }

        const existing = await env.DB.prepare(
          'SELECT * FROM hw_submissions WHERE assignment_id = ? AND student_id = ?'
        ).first(assignmentId, studentId);

        const revisionCount = existing ? (existing.revision_count || 0) + 1 : 0;
        const id = existing?.id || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const now = new Date().toISOString();

        await env.DB.prepare(
          `INSERT OR REPLACE INTO hw_submissions (id, assignment_id, student_id, submission_text, submission_url, file_urls, status, revision_count, submitted_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id,
          assignmentId,
          studentId,
          body.submission_text || '',
          body.submission_url || '',
          JSON.stringify(body.file_urls || []),
          'submitted',
          revisionCount,
          now,
          now
        ).run();

        const row = await env.DB.prepare('SELECT * FROM hw_submissions WHERE id = ?').first(id);
        return json(201, { data: row, success: true });
      }

      const title = String(body.title || '').trim();
      if (!title) return json(400, { error: 'Title is required' });

      const assignment = {
        id: body.id || `asn-${Date.now()}`,
        title,
        description: String(body.description || '').trim(),
        due_date: body.due_date || null,
        status: body.status || 'active',
        target_type: body.target_type || 'all',
        student_id: body.student_id || null,
        batch_id: body.batch_id || null,
        questions_files: JSON.stringify(body.questions_files || body.attachment_urls || []),
        attachment_urls: JSON.stringify(body.attachment_urls || body.questions_files || []),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await env.DB.prepare(
        `INSERT INTO assignments (id, title, description, dueDate, status, assignedTo, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        assignment.id,
        assignment.title,
        assignment.description,
        assignment.due_date,
        assignment.status,
        JSON.stringify([]),
        assignment.created_at,
        assignment.updated_at
      ).run();

      return json(201, { data: assignment, success: true });
    }

    if (request.method === 'PUT' || request.method === 'PATCH') {
      const body = await request.json();
      const action = url.searchParams.get('action');

      if (action === 'review') {
        const submissionId = url.searchParams.get('id');
        if (!submissionId) return json(400, { error: 'Submission ID required' });

        const fields = [];
        const values = [];
        const allowed = ['status', 'feedback', 'score'];
        for (const key of allowed) {
          if (key in body) {
            fields.push(`${key} = ?`);
            values.push(body[key]);
          }
        }
        fields.push('reviewed_at = ?', 'updated_at = ?');
        values.push(new Date().toISOString(), new Date().toISOString());
        values.push(submissionId);

        await env.DB.prepare(`UPDATE hw_submissions SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
        const row = await env.DB.prepare('SELECT * FROM hw_submissions WHERE id = ?').first(submissionId);
        return json(200, { data: row, success: true });
      }

      const id = url.searchParams.get('id') || body.id;
      if (!id) return json(400, { error: 'ID required' });

      const fields = [];
      const values = [];
      const allowed = ['title', 'description', 'due_date', 'status'];
      for (const key of allowed) {
        if (key in body) {
          fields.push(`${key} = ?`);
          values.push(body[key]);
        }
      }
      fields.push('updated_at = ?');
      values.push(new Date().toISOString(), id);

      await env.DB.prepare(`UPDATE assignments SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
      const row = await env.DB.prepare('SELECT * FROM assignments WHERE id = ?').first(id);
      return json(200, { data: row, success: true });
    }

    if (request.method === 'DELETE') {
      const id = url.searchParams.get('id') || (await request.json()).id;
      const action = url.searchParams.get('action');

      if (action === 'submission' && id) {
        await env.DB.prepare('DELETE FROM hw_submissions WHERE id = ?').bind(id).run();
        return json(200, { success: true });
      }

      if (id) {
        await env.DB.prepare('DELETE FROM assignments WHERE id = ?').bind(id).run();
        await env.DB.prepare('DELETE FROM hw_submissions WHERE assignment_id = ?').bind(id).run();
        return json(200, { success: true });
      }
    }

    return new Response('Method Not Allowed', { status: 405, headers: cors() });
  }
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-portal-role, x-portal-student-id, x-portal-coach-id'
  };
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': application/json, ...cors() }
  });
}

