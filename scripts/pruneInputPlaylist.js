
const dotenv = require('dotenv');
const fetch = require('cross-fetch');

const DAYS_BEFORE_REMOVAL = 7;
const INPUT_PLAYLIST_ID = "3BYWuUuYCZuOOco0LrHwrO";

const makeHeaders = (token) => ({
  "Accept": "application/json",
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`,
});

async function main() {
  const token = process.env.TOKEN;
  // Get playlist 
  const response = await fetch(`https://api.spotify.com/v1/playlists/${INPUT_PLAYLIST_ID}/tracks?fields=items(added_at%2C%20track(uri))`, {
    headers: makeHeaders(token),
  }).catch(console.error);
  const data = await response.json();

  if (data.items === undefined) {
    return;
  }
  if (data.items.length === 0) {
    return;
  }
  let songsToRemove = [];
  data.items.forEach(item => {
    const addedAtDate = new Date(item.added_at);
    const diffDays = Math.floor(((new Date()).getTime() - addedAtDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= DAYS_BEFORE_REMOVAL) {
      songsToRemove.push(item.track);
    }
  });

  if (songsToRemove.length === 0) {
    return;
  }
  // Clean up
  console.info(`Cleaning up ${songsToRemove.length} tracks...`);
  await fetch(`https://api.spotify.com/v1/playlists/${INPUT_PLAYLIST_ID}/tracks`, {
    method: 'DELETE',
    body: JSON.stringify({ tracks: songsToRemove }),
    headers: makeHeaders(token),
  }).catch(console.error);
}

dotenv.config();
main();