import { Parser } from 'm3u8-parser';

import { ERROR, PLAYLIST, SEGMENT } from '../constant';

export async function parseHls(hlsUrl: string, manifest: string) {
  try {
    const url = new URL(hlsUrl);
    const parser = new Parser();
    parser.push(manifest);
    parser.end();

    const pathBase = url.pathname.split('/');
    pathBase.pop();
    pathBase.push('{{URL}}');

    const base = url.origin + pathBase.join('/');

    console.log(parser);

    if (parser.manifest.playlists?.length) {
      const rawGroups = parser.manifest.playlists;
      const groups = rawGroups.map((g) => {
        return {
          name: g.attributes.NAME
            ? g.attributes.NAME
            : g.attributes.RESOLUTION
            ? `${g.attributes.RESOLUTION.width}x${g.attributes.RESOLUTION.height}`
            : `MAYBE_AUDIO:${g.attributes.BANDWIDTH}`,
          bandwidth: g.attributes.BANDWIDTH,
          uri: g.uri.startsWith('http')
            ? g.uri
            : base.replace('{{URL}}', g.uri),
        };
      });

      return {
        type: PLAYLIST,
        data: groups,
      };
    } else if (parser.manifest.segments?.length) {
      const rawSegments = parser.manifest.segments;
      const segments = rawSegments.map((s) => ({
        ...s,
        uri: s.uri.startsWith('http') ? s.uri : base.replace('{{URL}}', s.uri),
      }));

      return {
        type: SEGMENT,
        data: segments,
      };
    }
  } catch (error) {
    return {
      type: ERROR,
      data: error.message,
    };
  }
}
