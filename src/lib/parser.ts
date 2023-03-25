import path from 'path';
import { Parser } from 'm3u8-parser';
import { parse } from 'mpd-parser';

import type { Manifest, ParsedPlaylists, ParsedSegments } from './types';
import type { ParseResult } from './types';

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

export async function calculatePlaylistsSize(
  playlists: ParsedPlaylists
): Promise<(number | 'Unknown')[]> {
  const manifestUris = playlists
    .filter((item) => item.uri)
    .map((item) => item.uri as string);

  if (!manifestUris.length) {
    // Handle manifests that has segments inside playlists
    const totalSizes: (number | 'Unknown')[] = [];

    for (const { segments } of playlists) {
      if (segments) {
        const size = await calculateSegmentsSize(segments);
        totalSizes.push(size);
      } else {
        totalSizes.push('Unknown');
      }
    }

    return totalSizes;
  }

  const { ext } = path.parse(manifestUris[0]);
  const format = ext.replace('.', '');

  if (format === 'cmfv') {
    // Handle cmaf formats
    const responses = manifestUris.map((uri) => fetch(uri, { method: 'HEAD' }));
    const datas = await Promise.all(responses);
    const sizes = datas.map(
      (data) => +(data.headers.get('Content-Length') || 0) || 'Unknown'
    );

    return sizes;
  }

  const responses = await Promise.all(manifestUris.map((uri) => fetch(uri)));
  const manifests = await Promise.all(responses.map((res) => res.text()));

  const parser = format === 'm3u8' ? parseHls : parseDash;

  const resultList = await Promise.all(
    manifests.map((manifest, i) => parser(manifestUris[i], manifest))
  );

  const totalSizes = await Promise.all(
    resultList.map(({ segments }) =>
      segments ? calculateSegmentsSize(segments) : 'Unknown'
    )
  );

  return totalSizes;
}

export async function calculateSegmentsSize(
  segments: ParsedSegments
): Promise<number | 'Unknown'> {
  try {
    const uris = segments.map((item) => item.uri);
    const responses = uris.map((uri) => fetch(uri, { method: 'HEAD' }));

    const sizes = await Promise.all(responses);
    const totalSize = sizes.reduce(
      (prev, cur) => prev + +(cur.headers.get('Content-Length') || 0),
      0
    );

    return totalSize || 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}
