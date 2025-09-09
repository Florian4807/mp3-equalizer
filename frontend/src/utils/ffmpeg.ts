import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const loadFFmpeg = async (): Promise<FFmpeg> => {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
    
    // Set up logging
    ffmpeg.on('log', ({ message }) => {
      console.log(message);
    });

    // Load FFmpeg with the current version
    await ffmpeg.load();
  }
  return ffmpeg;
};

export const equalizeVolume = async (file: File): Promise<Blob> => {
  const ffmpeg = await loadFFmpeg();
  const inputFileName = 'input.mp3';
  const outputFileName = 'output.mp3';

  try {
    // Write input file to FFmpeg file system
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));

    // Apply loudness normalization using loudnorm filter
    // This normalizes to -23 LUFS (broadcast standard)
    await ffmpeg.exec([
      '-i', inputFileName,
      '-af', 'loudnorm=I=-23:LRA=11:tp=-1.5',
      '-c:a', 'libmp3lame',
      '-b:a', '320k',
      outputFileName
    ]);

    // Read the processed file
    const data = await ffmpeg.readFile(outputFileName);
    
    // Clean up files from FFmpeg file system
    try {
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);
    } catch (cleanupError) {
      console.warn('Failed to cleanup files:', cleanupError);
    }

    // Handle different data types returned by FFmpeg
    let blobData: BlobPart;
    if (data instanceof Uint8Array) {
      blobData = data as any; // Type assertion to overcome TypeScript strict checking
    } else if (typeof data === 'string') {
      // If it's a string, convert to UTF-8 bytes
      blobData = new TextEncoder().encode(data);
    } else {
      // Fallback: treat as array buffer
      blobData = new Uint8Array(data as ArrayBuffer) as any;
    }
    
    return new Blob([blobData], { type: 'audio/mpeg' });
  } catch (error) {
    console.error('FFmpeg processing error:', error);
    throw new Error(`Failed to process audio file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};