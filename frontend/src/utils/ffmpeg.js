import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg;

export const loadFFmpeg = async () => {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg({ log: true });
    await ffmpeg.load();
  }
  return ffmpeg;
};

export const equalizeVolume = async (file) => {
  const ffmpeg = await loadFFmpeg();
  const inputFile = 'input.mp3';
  const outputFile = 'output.mp3';

  await ffmpeg.writeFile(inputFile, await fetchFile(file));

  // This is a placeholder for the actual ffmpeg command
  await ffmpeg.exec(['-i', inputFile, '-af', 'loudnorm', outputFile]);

  const data = await ffmpeg.readFile(outputFile);
  return new Blob([data.buffer], { type: 'audio/mpeg' });
};
