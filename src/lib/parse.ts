import { Parser } from 'm3u8-parser';
import { parse } from 'mpd-parser';

import type { Manifest } from '../types/manifest';
import type { ParseResult } from '../types/queue';

export async function parseHls(
  hlsUri: string,
  manifest: string
): Promise<ParseResult> {
  try {
    const parser = new Parser();
    parser.push(manifest);
    parser.end();

    const parsedManifest: Manifest = parser.manifest;
    const baseUri = generateBaseUri(hlsUri);

    return formatManifest(parsedManifest, baseUri);
  } catch (error) {
    return {};
  }
}

export async function parseDash(
  dashUri: string,
  manifest: string
): Promise<ParseResult> {
  try {
    const parsedManifest = parse(manifest, { manifestUri: dashUri });
    const baseUri = generateBaseUri(dashUri);

    return formatManifest(parsedManifest, baseUri);
  } catch (error) {
    return {};
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

    return { playlists };
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
