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
    const playlists = parsedManifest.playlists
      .filter((item) => item.uri || item.resolvedUri || item.sidx?.uri)
      .map((item) => {
        const { RESOLUTION, BANDWIDTH } = item.attributes;
        const resolution = RESOLUTION?.height || ('Unknown' as const);
        const bandwidth = BANDWIDTH || ('Unknown' as const);

        const uri = (item.uri || item.resolvedUri || item.sidx?.uri) as string;
        const uriWithDomain = baseUri.replace('{{URI}}', uri);
        const formattedUri = uri.startsWith('http') ? uri : uriWithDomain;

        return {
          ...item,
          uri: formattedUri,
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

    return { segments };
  }

  return {};
}

export async function calculatePlaylistsSize(playlists: ParsedPlaylists) {
  const manifestUris = playlists.map((item) => item.uri);
  const { ext } = path.parse(manifestUris[0]);
  const format = ext.replace('.', '');

  const getManifestsPromise = manifestUris.map((uri) => fetch(uri));
  const getManifests = await Promise.all(getManifestsPromise);
  const manifests = await Promise.all(getManifests.map((res) => res.text()));

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

export async function calculateSegmentsSize(segments: ParsedSegments) {
  const uris = segments.map((item) => item.uri);
  const responses = uris.map((uri) => fetch(uri, { method: 'HEAD' }));

  const sizes = await Promise.all(responses);
  const totalSize = sizes.reduce(
    (prev, cur) => prev + +(cur.headers.get('Content-Length') || 0),
    0
  );

  return totalSize || 'Unknown';
}
