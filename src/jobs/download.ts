import { Queue } from '~storage/session/Queue';
import { parseHls, parseDash } from '../lib/parse';
import { getFormat, chunkArray } from '../lib/util';
import { DYNAMIC_FORMATS, STATIC_FORMATS } from '~constants/format';
import type { PlaylistsItem } from '~types/queue';

export function downloadFile(tabId: number, uri: string, playlistId?: string) {
  const format = getFormat(uri);

  console.log(uri, playlistId);

  if (STATIC_FORMATS.includes(format)) {
    return downloadStaticFile(tabId, uri);
  }

  if (DYNAMIC_FORMATS.includes(format) && playlistId) {
    return donwloadPlaylist(tabId, uri, playlistId);
  }

  if (DYNAMIC_FORMATS.includes(format) && !playlistId) {
    return downloadSegments(tabId, uri);
  }
}

export async function downloadStaticFile(tabId: number, uri: string) {
  // const response = await fetch(uri);
  // const file = await response.blob();
  // console.log(file);
  // const url = URL.createObjectURL(file);
  // sendToBackground({ name: 'download', body: url });
}

export async function downloadSegments(tabId: number, uri: string) {
  const format = getFormat(uri);
  const parser = format === 'm3u8' ? parseHls : parseDash;

  const { items } = await Queue.get(tabId);

  console.log(items);
}

export async function donwloadPlaylist(
  tabId: number,
  uri: string,
  playlistId: string
) {
  const { items } = await Queue.get(tabId);
  const item = items.find((item: PlaylistsItem) => item.uri === uri) as
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
