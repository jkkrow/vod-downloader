import { parseHls, parseDash } from './parse';
import { getFormat, chunkArray } from './util';
import type { ParsedPlaylists, ParsedSegments } from '../types/queue';

export async function getPlaylistSegments(
  playlists: ParsedPlaylists
): Promise<(ParsedSegments | 'Unknown')[]> {
  const manifestUris = playlists
    .filter((item) => item.uri)
    .map((item) => item.uri as string);

  if (!manifestUris.length) {
    // Handle manifests that has segments inside playlists
    return playlists.map(({ segments }) => segments || 'Unknown');
  }

  const format = getFormat(manifestUris[0]);

  if (format === 'cmfv') {
    // Handle cmaf formats
    return manifestUris.map((uri) => [{ uri }]);
  }

  const responses = await Promise.all(manifestUris.map((uri) => fetch(uri)));
  const manifests = await Promise.all(responses.map((res) => res.text()));

  const parser = format === 'm3u8' ? parseHls : parseDash;

  const resultList = await Promise.all(
    manifests.map((manifest, i) => parser(manifestUris[i], manifest))
  );

  return resultList.map(({ segments }) => segments || 'Unknown');
}

export async function calculateSegmentsSize(
  segments: ParsedSegments | 'Unknown'
): Promise<number | 'Unknown'> {
  try {
    if (segments === 'Unknown') return segments;

    const uris = segments.map((item) => item.uri);
    const uriChunks = chunkArray(uris, 100);
    let totalSize = 0;

    for (const chunk of uriChunks) {
      const responses = chunk.map((uri) => fetch(uri, { method: 'HEAD' }));
      const sizes = await Promise.all(responses);
      totalSize += sizes.reduce((prev, cur) => {
        const size = +(cur.headers.get('Content-Length') || 0);
        if (!size) throw new Error('Unknown Size');
        return prev + size;
      }, 0);
    }

    return totalSize || 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

export async function calculateStaticSize(uri: string) {
  const response = await fetch(uri, { method: 'HEAD' });
  const size = +(response.headers.get('Content-Length') || 0) || 'Unknown';
  return size;
}
