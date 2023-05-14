import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { sendToBackground } from '@plasmohq/messaging';

import { updateQueueItem } from '~background/storage';
import { parseHls, parseDash } from './parser';
import { getFormat } from './util';
import { STATIC_FORMATS } from '~constant';

export async function downloadFile(uri: string, playlistId?: string) {
  const format = getFormat(uri);
  if (STATIC_FORMATS.includes(format)) {
    await downloadStaticFile(uri);
    return;
  }
  const response = await fetch(uri);
  const manifest = await response.text();
}

export async function downloadStaticFile(uri: string) {
  const ffmpeg = createFFmpeg({
    mainName: 'main',
    log: true,
  });
  await ffmpeg.load();

  console.log('FFMPEG loaded');

  // const response = await fetch(uri);
  // const file = await response.blob();

  // console.log(file);

  // const url = URL.createObjectURL(file);
  // sendToBackground({ name: 'download', body: url });
}
