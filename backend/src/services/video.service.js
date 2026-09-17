const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const prisma = require('../utils/db');

const processVideo = async (videoId, videoPath) => {
  try {
    console.log(`🎬 Starting video processing for ${videoId}`);

    const outputDir = path.join(
      path.dirname(videoPath),
      '../hls',
      videoId
    );

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const qualities = [
      { name: '360p', width: 640, height: 360, bitrate: '800k' },
      { name: '480p', width: 854, height: 480, bitrate: '1400k' },
      { name: '720p', width: 1280, height: 720, bitrate: '2800k' },
      { name: '1080p', width: 1920, height: 1080, bitrate: '5000k' }
    ];

    const getDuration = () => {
      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
          if (err) reject(err);
          else resolve(Math.floor(metadata.format.duration));
        });
      });
    };

    const duration = await getDuration();

    const processQuality = (quality) => {
      return new Promise((resolve, reject) => {
        const qualityDir = path.join(outputDir, quality.name);
        if (!fs.existsSync(qualityDir)) {
          fs.mkdirSync(qualityDir, { recursive: true });
        }

        const outputPath = path.join(qualityDir, 'index.m3u8');

        ffmpeg(videoPath)
          .outputOptions([
            '-c:v libx264',
            '-c:a aac',
            `-b:v ${quality.bitrate}`,
            '-b:a 128k',
            `-vf scale=${quality.width}:${quality.height}`,
            '-preset fast',
            '-hls_time 10',
            '-hls_list_size 0',
            '-hls_segment_filename',
            path.join(qualityDir, 'segment%03d.ts'),
            '-f hls'
          ])
          .output(outputPath)
          .on('end', () => {
            console.log(`✅ ${quality.name} processing complete`);
            resolve();
          })
          .on('error', (err) => {
            console.error(`❌ ${quality.name} processing failed:`, err);
            reject(err);
          })
          .on('progress', (progress) => {
            if (progress.percent) {
              console.log(`📊 ${quality.name}: ${Math.floor(progress.percent)}%`);
            }
          })
          .run();
      });
    };

    await Promise.all(qualities.map(quality => processQuality(quality)));

    const masterPlaylist = path.join(outputDir, 'master.m3u8');
    const masterContent = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x480
480p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p/index.m3u8
`;

    fs.writeFileSync(masterPlaylist, masterContent);

    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'READY',
        hlsPath: outputDir,
        duration
      }
    });

    console.log(`✅ Video ${videoId} processed successfully`);
  } catch (error) {
    console.error(`❌ Video processing failed for ${videoId}:`, error);

    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'FAILED' }
    });
  }
};

const generateThumbnail = (videoPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['10%'],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '1280x720'
      })
      .on('end', () => {
        console.log('✅ Thumbnail generated');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('❌ Thumbnail generation failed:', err);
        reject(err);
      });
  });
};

module.exports = {
  processVideo,
  generateThumbnail
};
