import { Parser } from 'm3u8-parser';
import { parse } from 'mpd-parser';

import type { Manifest } from './types';
import { ERROR, PLAYLIST, SEGMENT } from '../constant';

export async function parseHls(hlsUri: string, manifest: string) {
  try {
    const parser = new Parser();
    parser.push(manifest);
    parser.end();

    const parsedManifest: Manifest = parser.manifest;
    const baseUri = generateBaseUri(hlsUri);

    return formatManifest(parsedManifest, baseUri);
  } catch (error) {
    return {
      type: ERROR,
      data: error.message,
    };
  }
}

export async function parseDash(dashUri: string, manifest: string) {
  try {
    const parsedManifest = parse(manifest, { manifestUri: dashUri });
    const baseUri = generateBaseUri(dashUri);

    return formatManifest(parsedManifest, baseUri);
  } catch (error) {
    return {
      type: ERROR,
      data: error.message,
    };
  }
}

function generateBaseUri(manifestUri: string) {
  const { pathname, origin } = new URL(manifestUri);
  const pathBase = pathname.split('/');
  pathBase.pop();
  pathBase.push('{{URI}}');

  return origin + pathBase.join('/');
}

function formatManifest(parsedManifest: Manifest, baseUri: string) {
  if (parsedManifest.playlists?.length) {
    const playlists = parsedManifest.playlists.map((playlist) => {
      const { NAME, RESOLUTION, BANDWIDTH } = playlist.attributes;
      const name = RESOLUTION?.height || BANDWIDTH || NAME;
      const bandwidth = BANDWIDTH;
      const rawUri = playlist.uri || playlist.resolvedUri || playlist.sidx?.uri;
      const uri = rawUri.startsWith('http')
        ? rawUri
        : baseUri.replace('{{URI}}', rawUri);

      return {
        name,
        bandwidth,
        uri,
      };
    });

    return {
      type: PLAYLIST,
      data: playlists,
    };
  }

  if (parsedManifest.segments?.length) {
    const segments = parsedManifest.segments.map((segment) => {
      const rawUri = segment.uri;
      const uri = rawUri.startsWith('http')
        ? rawUri
        : baseUri.replace('{{URI}}', rawUri);

      return {
        ...segment,
        uri,
      };
    });

    return {
      type: SEGMENT,
      data: segments,
    };
  }

  return {
    type: ERROR,
    data: 'Cannot find playlist or segments to download',
  };
}
