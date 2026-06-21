const { Jimp } = require("jimp");
const path = require("path");
const fs = require("fs");

async function main() {
  const brainDir = "C:/Users/vipul/.gemini/antigravity-ide/brain/d8005043-175d-43b0-bb1c-d154e3b7bdcd";
  const targetBrainDir = brainDir;

  console.log("Searching for media files in:", targetBrainDir);
  const files = fs.readdirSync(targetBrainDir);
  const mediaFiles = files.filter(f => f.startsWith("media__") && (f.endsWith(".png") || f.endsWith(".jpg")));

  const screenshots = [];
  let screenshotIdx = 1;

  for (const f of mediaFiles) {
    const fPath = path.join(targetBrainDir, f);
    try {
      const img = await Jimp.read(fPath);
      const w = img.width;
      const h = img.height;
      console.log(`File: ${f} -> ${w}x${h}`);

      // Filter out small icons or cropped elements (e.g. width or height < 200px)
      if (w >= 320 && h >= 320) {
        const destName = `screenshot${screenshotIdx}.png`;
        const destPath = path.join(__dirname, "../public/screenshots", destName);

        // Ensure screenshots directory exists
        const screenshotsDir = path.dirname(destPath);
        if (!fs.existsSync(screenshotsDir)) {
          fs.mkdirSync(screenshotsDir, { recursive: true });
        }

        fs.copyFileSync(fPath, destPath);
        console.log(`Copied ${f} to public/screenshots/${destName}`);

        screenshots.push({
          "src": `/screenshots/${destName}`,
          "sizes": `${w}x${h}`,
          "type": "image/png",
          "form_factor": w > h ? "wide" : "narrow",
          "label": w > h ? "FinanceOS Dashboard - Desktop View" : "FinanceOS Dashboard - Mobile View"
        });

        screenshotIdx++;
        // Limit to 4 screenshots
        if (screenshotIdx > 4) break;
      }
    } catch (e) {
      console.warn(`Could not read ${f}:`, e.message);
    }
  }

  if (screenshots.length > 0) {
    const manifestPath = path.join(__dirname, "../public/manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    manifest.screenshots = screenshots;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
    console.log("Manifest screenshots updated successfully!");
  } else {
    console.log("No matching screenshots found.");
  }
}

main().catch(err => {
  console.error("Error finding screenshots:", err);
});
