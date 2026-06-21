const { Jimp } = require("jimp");
const path = require("path");
const fs = require("fs");

async function main() {
  const icon192Path = path.join(__dirname, "../public/icons/icon-192.png");
  const icon512Path = path.join(__dirname, "../public/icons/icon-512.png");

  // Keep a backup of the original 1024x1024 icon if we need it
  const backupPath = path.join(__dirname, "../public/icons/icon-original.jpg");
  if (!fs.existsSync(backupPath) && fs.existsSync(icon192Path)) {
    fs.copyFileSync(icon192Path, backupPath);
    console.log("Created backup of original icon at:", backupPath);
  }

  const sourcePath = fs.existsSync(backupPath) ? backupPath : icon192Path;

  console.log("Reading source image from:", sourcePath);
  const image = await Jimp.read(sourcePath);

  // Resize and save 192x192 PNG
  console.log("Resizing and saving 192x192 PNG...");
  const img192 = image.clone();
  img192.resize({ w: 192, h: 192 });
  await img192.write(icon192Path);
  console.log("Saved 192x192 icon to:", icon192Path);

  // Resize and save 512x512 PNG
  console.log("Resizing and saving 512x512 PNG...");
  const img512 = image.clone();
  img512.resize({ w: 512, h: 512 });
  await img512.write(icon512Path);
  console.log("Saved 512x512 icon to:", icon512Path);

  console.log("Icon conversion completed successfully!");
}

main().catch(err => {
  console.error("Error converting icons:", err);
});
