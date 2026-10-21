import ffmpegPath from 'ffmpeg-static';
import { exec } from 'child_process';
import path from 'path';

const inputWebm = path.resolve('scratch', 'recordings', 'page@624eff83e79cb2e92a77ce8b90831828.webm');
const outputMp4 = path.resolve('virasat_pitch_demo_mobile_5min_captioned.mp4');

console.log('🔄 Converting virasat_pitch_demo.webm to virasat_pitch_demo.mp4...');

const cmd = `"${ffmpegPath}" -y -i "${inputWebm}" -c:v libx264 -preset fast -crf 22 "${outputMp4}"`;

exec(cmd, (err, stdout, stderr) => {
  if (err) {
    console.error('Error converting video:', err);
    console.error(stderr);
    process.exit(1);
  }
  console.log('✅ Video conversion complete!');
  console.log('🎬 Saved MP4 to:', outputMp4);
});
