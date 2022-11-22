const dotenv = require('dotenv');
const fetch = require('cross-fetch');

const DAYS_BEFORE_REMOVAL = 7;
const INPUT_PLAYLIST_ID = '3BYWuUuYCZuOOco0LrHwrO';

async function getToken() {
  const response = await fetch(`https://accounts.spotify.com/api/token?grant_type=refresh_token&refresh_token=${process.env.REFRESH_TOKEN}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  });
  const res = await response.json();
  if (res.access_token === undefined) {
    throw 'Unable to get token';
  }
  return res.access_token;
}

const makeHeaders = (token) => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

async function main() {
  // Get token
  const token = await getToken();
  // Get playlist
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${INPUT_PLAYLIST_ID}/tracks?fields=items(added_at%2C%20track(uri))`,
    {
      headers: makeHeaders(token),
    }
  ).catch(console.error);
  const data = await response.json();

  if (data.items === undefined) {
    return;
  }
  if (data.items.length === 0) {
    return;
  }

  console.info(`${data.items.length} songs currently in playlist`);
  let songsToRemove = [];
  data.items.forEach((item) => {
    const addedAtDate = new Date(item.added_at);
    const diffDays = Math.floor(
      (new Date().getTime() - addedAtDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays >= DAYS_BEFORE_REMOVAL) {
      songsToRemove.push(item.track);
    }
  });

  if (songsToRemove.length === 0) {
    console.info("No songs to remove...");
    return;
  }

  // Clean up
  console.info(`Cleaning up ${songsToRemove.length} tracks...`);
  const r = await fetch(
    `https://api.spotify.com/v1/playlists/${INPUT_PLAYLIST_ID}/tracks`,
    {
      method: 'DELETE',
      body: JSON.stringify({ tracks: songsToRemove }),
      headers: makeHeaders(token),
    }
  ).catch(console.error);
}

dotenv.config();
main();
