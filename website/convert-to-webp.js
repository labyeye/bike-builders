const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'assets');

/**
 * Recursively find and convert JPG/PNG images to WebP, and re-compress existing WebP files.
 * @param {string} directory 
 */
async function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await processDirectory(fullPath);
    } else {
      const ext = path.extname(file).toLowerCase();
      // Convert original images to WebP
      if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.avif') {
        const outputPath = fullPath.replace(new RegExp(`${ext}$`, 'i'), '.webp');

        try {
          await sharp(fullPath)
            .webp({ quality: 70, alphaQuality: 90, effort: 6 })
            .toFile(outputPath);

        } catch (error) {

        }
      }
      // Re-compress existing WebP files for better optimization
      else if (ext === '.webp') {
        try {
          const tempPath = fullPath + '.tmp.webp';
          const originalSize = fs.statSync(fullPath).size;

          await sharp(fullPath)
            .webp({ quality: 65, alphaQuality: 85, effort: 6, nearLossless: false })
            .toFile(tempPath);

          const newSize = fs.statSync(tempPath).size;

          // Replace original only if new file is smaller
          if (newSize < originalSize) {
            fs.unlinkSync(fullPath);
            fs.renameSync(tempPath, fullPath);
            const savedKB = ((originalSize - newSize) / 1024).toFixed(2);
          } else {
            // Delete temp file if no improvement
            fs.unlinkSync(tempPath);
          }
        } catch (error) {

        }
      }
    }
  }
}


if (fs.existsSync(targetDir)) {
  processDirectory(targetDir);
} else {

}

