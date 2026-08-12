/**
 * Reencoda o master (out/waatzo-reel.mp4) para a versão de entrega:
 * mesmo 1080x1920/30fps, arquivo ~2,5x menor e com folga de pico no áudio.
 *
 * Uso: npm run web
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const ffmpeg = createRequire(import.meta.url)('ffmpeg-static');

execFileSync(
  ffmpeg,
  [
    '-v', 'error', '-y',
    '-i', 'out/waatzo-reel.mp4',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '22',
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
    // limitador leve: evita estouro depois da recodificação em AAC
    '-af', 'alimiter=limit=0.89:level=disabled',
    '-c:a', 'aac', '-b:a', '160k',
    'waatzo-reel.mp4',
  ],
  { stdio: 'inherit' },
);

console.log('waatzo-reel.mp4 pronto');
