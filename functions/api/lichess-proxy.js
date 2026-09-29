import profileHandler from './_lib/lichess-profile.js';
import gamesHandler from './_lib/lichess-games.js';
import extrasHandler from './_lib/lichess-extras.js';
import testHandler from './_lib/lichess-test.js';
import explorerHandler from './_lib/lichess-explorer.js';
import tournamentsHandler from './_lib/lichess-tournaments.js';

const PATH_TYPES = {
  'lichess-games-proxy': 'games',
  'lichess-extras-proxy': 'extras',
  'lichess-explorer-proxy': 'explorer',
  'lichess-tournaments-proxy': 'tournaments',
  'test-lichess': 'test',
  'lichess-proxy': 'profile'
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.searchParams.get('games') === '1') {
      return gamesHandler(request);
    }

    const pathKey = Object.keys(PATH_TYPES).find((k) => url.pathname.includes(k));
    const type = url.searchParams.get('type') || (pathKey ? PATH_TYPES[pathKey] : 'profile');

    switch (type) {
      case 'games': return gamesHandler(request);
      case 'extras': return extrasHandler(request);
      case 'explorer': return explorerHandler(request);
      case 'tournaments': return tournamentsHandler(request);
      case 'test': return testHandler(request);
      default: return profileHandler(request);
    }
  }
};
