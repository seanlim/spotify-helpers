import dotenv from 'dotenv';
import fetch from 'cross-fetch';
import pruneInputPlaylist from './scripts/pruneInputPlaylist.mjs';

async function getToken() {
  const response = await fetch(
    `https://accounts.spotify.com/api/token?grant_type=refresh_token&refresh_token=${process.env.REFRESH_TOKEN}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  const res = await response.json();
  if (res.access_token === undefined) {
    throw 'Unable to get token';
  }
  return res.access_token;
}

async function main() {
  const token = await getToken();
  await pruneInputPlaylist(token);
  return;
}

dotenv.config();
main();
