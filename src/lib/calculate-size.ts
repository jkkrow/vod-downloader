import { parseManifest } from './parse';
import { extractFormat, chunkArray } from './util';
import type { ParsedPlaylist, ParsedSegment } from '../types/discovery';

export async function getPlaylistSegments(
  playlists: ParsedPlaylist[]
): Promise<(ParsedSegment[] | 'Unknown')[]> {
  const manifestUris = playlists
    .filter((item) => item.uri)
    .map((item) => item.uri as string);

  if (!manifestUris.length) {
    // Handle manifests that has segments inside playlists
    return playlists.map(({ segments }) => segments || 'Unknown');
  }

  if (extractFormat(manifestUris[0]) === 'cmfv') {
    // Handle cmaf formats
    return manifestUris.map((uri) => [{ uri }]);
  }

  const resultList = await Promise.all(
    manifestUris.map((uri) => parseManifest(uri))
  );

  return resultList.map(({ segments }) => segments || 'Unknown');
}

export async function calculateSegmentsSize(
  segments: ParsedSegment[] | 'Unknown'
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
