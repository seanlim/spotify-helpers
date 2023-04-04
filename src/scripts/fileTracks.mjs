import fetch from 'cross-fetch';
import makeHeaders from '../makeHeaders.mjs';

/**
 * Takes an array of tracks and files them into playlists
 * @param {string} token - Spotify access token
 * @param {string[]} artistIDs
 */
export default async function fileTracks(token, artistIDs) {
  console.info(`Filing ${artistIDs.length} songs...`);

  const response = await fetch(
    `https://api.spotify.com/v1/artists?ids=${artistIDs.join(',')}&fields=`,
    {
      headers: makeHeaders(token),
    }
  ).catch(console.error);
  const data = await response.json();

  if (data.artists === undefined) {
    return;
  }
  if (data.artists.length === 0) {
    return;
  }
  const { artists } = data;
  console.info(artists);
  artists.forEach((a) => {
    console.info(a.genres);
  });
}
