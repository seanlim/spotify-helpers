import fetch from 'cross-fetch';
import makeHeaders from '../makeHeaders.mjs';
import fileTracks from './fileTracks.mjs';

const DAYS_BEFORE_REMOVAL = 7;
const INPUT_PLAYLIST_ID = '3BYWuUuYCZuOOco0LrHwrO';

/**
 * Retrieves tracks from the input playlist and then
 * deletes tracks that have been added more than `DAYS_BEFORE_REMOVAL` days
 * ago.
 * @param {string} token - Spotify access token
 */
export default async function pruneInputPlaylist(token) {
  // Get playlist
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${INPUT_PLAYLIST_ID}/tracks?fields=items(added_at,track(id,uri,artists(id)))`,
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
    console.info('No songs to remove...');
    return;
  }

  // TODO: File tracks
  // fileTracks(
  //   token,
  //   songsToRemove.map((t) => t.artists[0].id)
  // );

  // Delete songs from playlist
  console.info(`Cleaning up ${songsToRemove.length} tracks...`);
  await fetch(
    `https://api.spotify.com/v1/playlists/${INPUT_PLAYLIST_ID}/tracks`,
    {
      method: 'DELETE',
      body: JSON.stringify({ tracks: songsToRemove }),
      headers: makeHeaders(token),
    }
  ).catch(console.error);
}
