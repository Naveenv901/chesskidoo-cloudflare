import profileHandler from './_lib/chesscom-profile.js';
import gamesHandler from './_lib/chesscom-games.js';
import clubsHandler from './_lib/chesscom-clubs.js';

const PATH_TYPES = {
  'chesscom-games-proxy': 'games',
  'chesscom-clubs-proxy': 'clubs',
  'chesscom-proxy': 'profile'
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathKey = Object.keys(PATH_TYPES).find((k) => url.pathname.includes(k));
    const type = url.searchParams.get('type') || (pathKey ? PATH_TYPES[pathKey] : 'profile');

    switch (type) {
      case 'games': return gamesHandler(request);
      case 'clubs': return clubsHandler(request);
      default: return profileHandler(request);
    }
  }
};
