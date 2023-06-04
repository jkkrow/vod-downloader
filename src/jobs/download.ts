import { sendToBackground } from '@plasmohq/messaging';

import { SessionStorage } from '~storage/session';
import { parseHls, parseDash } from '../lib/parse';
import { getFormat, chunkArray } from '../lib/util';
import { DYNAMIC_FORMATS, STATIC_FORMATS } from '~constants/format';
import type { PlaylistsItem } from '~types/queue';

export async function downloadFile(
  domain: string,
  uri: string,
  playlistId?: string
) {
  const format = getFormat(uri);

  if (STATIC_FORMATS.includes(format)) {
    await downloadStaticFile(uri);
    return;
  }

  console.log(uri, playlistId);

  if (DYNAMIC_FORMATS.includes(format) && playlistId) {
    await donwloadPlaylist(domain, uri, playlistId);
    return;
  }

  if (DYNAMIC_FORMATS.includes(format) && !playlistId) {
    await downloadSegments(domain, uri);
    return;
  }
}

export async function downloadStaticFile(uri: string) {
  // const response = await fetch(uri);
  // const file = await response.blob();
  // console.log(file);
  // const url = URL.createObjectURL(file);
  // sendToBackground({ name: 'download', body: url });
}

export async function downloadSegments(domain: string, uri: string) {
  const format = getFormat(uri);
  const parser = format === 'm3u8' ? parseHls : parseDash;

  const { queue } = await SessionStorage.get(domain);

  console.log(queue);
}

export async function donwloadPlaylist(
  domain: string,
  uri: string,
  playlistId: string
) {
  const { queue } = await SessionStorage.get(domain);
  const item = queue.find((item: PlaylistsItem) => item.uri === uri) as
    | PlaylistsItem
    | undefined;

  if (!item) {
    throw new Error('Something went wrong');
  }

  const playlist = item.playlists.find(
    (playlist) => playlist.id === playlistId
  );

  if (!playlist) {
    throw new Error('Something went wrong');
  }

  const playlistUri = playlist.uri;

  if (playlistUri) {
    const format = getFormat(playlistUri);
    const parser = format === 'm3u8' ? parseHls : parseDash;

    const response = await fetch(playlistUri);
    const manifest = await response.text();

    const result = await parser(playlistUri, manifest);
    console.log(result);

    if (!result.segments) {
      throw new Error('Something went wrong');
    }

    const uris = result.segments.map((segment) => segment.uri);
    const uriChunks = chunkArray(uris, 100);
  }
}
