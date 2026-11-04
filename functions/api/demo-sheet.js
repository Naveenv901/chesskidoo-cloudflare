export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: cors() });
    }

    if (request.method === 'POST') {
      try {
        const body = await request.json();
        const timestamp = body.timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

        const sheetPayload = {
          timestamp,
          parentName: body.parentName || body.name || '',
          phone: body.phone || '',
          childName: body.childName || '',
          childAge: body.childAge || body.age || '',
          childDetails: body.childDetails || [body.childName, body.childAge ? `Age ${body.childAge}` : ''].filter(Boolean).join(' '),
          city: body.city || 'Not specified',
          level: body.level || 'Beginner',
          mode: body.mode || 'Online Class',
          slot: body.slot || 'Evening (5 PM - 8 PM)',
          language: body.language || 'English'
        };

        return new Response(JSON.stringify({
          success: true,
          sheetSaved: false,
          sheetId: '1AG6Mvpctz6TFzCRGa1-6Qz0V1cl0NDI-QqxINHPn5mU',
          sheetUrl: 'https://docs.google.com/spreadsheets/d/1AG6Mvpctz6TFzCRGa1-6Qz0V1cl0NDI-QqxINHPn5mU/edit?usp=sharing',
          timestamp,
          message: 'Demo class booking logged'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...cors() }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...cors() }
        });
      }
    }

    return new Response('Method Not Allowed', { status: 405, headers: cors() });
  }
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
