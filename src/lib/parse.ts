import { Parser as HlsParser } from 'm3u8-parser';
import { parse as DashParser } from 'mpd-parser';

import { getFormat } from '~lib/util';
import type { Manifest } from '../types/manifest';
import type { ParseResult } from '../types/queue';

export async function parseManifest(uri: string) {
  const response = await fetch(uri, { cache: 'no-cache' });
  const manifest = await response.text();
  const format = getFormat(uri);

  if (format === 'm3u8') {
    // HLS
    const parser = new HlsParser();
    parser.push(manifest);
    parser.end();

    const parsedManifest: Manifest = parser.manifest;
    const baseUri = generateBaseUri(uri);

    return formatManifest(parsedManifest, baseUri);
  } else {
    // DASH
    const parsedManifest = DashParser(manifest, { manifestUri: uri });
    const baseUri = generateBaseUri(uri);

    return formatManifest(parsedManifest, baseUri);
  }
}

function generateBaseUri(manifestUri: string) {
  const { pathname, origin } = new URL(manifestUri);
  const pathBase = pathname.split('/');
  pathBase.pop();
  pathBase.push('{{URI}}');

  return origin + pathBase.join('/');
}

function formatManifest(
  parsedManifest: Manifest,
  baseUri: string
): ParseResult {
  if (parsedManifest.playlists) {
    const playlists = parsedManifest.playlists.map((item) => {
      const { RESOLUTION, BANDWIDTH } = item.attributes;
      const resolution = RESOLUTION?.height || ('Unknown' as const);
      const bandwidth = BANDWIDTH || ('Unknown' as const);

      const uri = item.uri || item.resolvedUri || item.sidx?.uri;
      const uriWithDomain = uri ? baseUri.replace('{{URI}}', uri) : undefined;
      const formattedUri = uri && uri.startsWith('http') ? uri : uriWithDomain;

      const segments = item.segments;

      if (segments) {
        segments.forEach((segment) => {
          const uri = segment.uri;
          const uriWithDomain = baseUri.replace('{{URI}}', uri);
          const formattedUri = uri.startsWith('http') ? uri : uriWithDomain;
          segment.uri = formattedUri;
        });
      }

      return {
        ...item,
        uri: formattedUri,
        segments,
        resolution,
        bandwidth,
      };
    });

    const sortedPlaylists = playlists.sort((a, b) => {
      if (
        typeof a.resolution === 'number' &&
        typeof b.resolution === 'number' &&
        a.resolution !== b.resolution
      ) {
        return b.resolution - a.resolution;
      }

      if (typeof a.bandwidth === 'number' && typeof b.bandwidth === 'number') {
        return b.bandwidth - a.bandwidth;
      }

      return 0;
    });

    return { playlists: sortedPlaylists };
  }

  if (parsedManifest.segments) {
    const segments = parsedManifest.segments.map((item) => {
      const uri = item.uri;
      const uriWithDomain = baseUri.replace('{{URI}}', uri);
      const formattedUri = uri.startsWith('http') ? uri : uriWithDomain;

      return {
        ...item,
        uri: formattedUri,
      };
    });

    return segments.length ? { segments } : {};
  }

  return {};
}
