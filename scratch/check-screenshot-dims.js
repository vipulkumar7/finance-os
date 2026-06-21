const { Jimp } = require("jimp");
const path = require("path");
const fs = require("fs");

async function main() {
  const scr1Path = path.join(__dirname, "../public/screenshots/screenshot1.png");
  const scr2Path = path.join(__dirname, "../public/screenshots/screenshot2.png");

  console.log("Reading screenshot 1...");
  const img1 = await Jimp.read(scr1Path);
  const w1 = img1.width;
  const h1 = img1.height;
  console.log(`Screenshot 1 dimensions: ${w1}x${h1}`);

  console.log("Reading screenshot 2...");
  const img2 = await Jimp.read(scr2Path);
  const w2 = img2.width;
  const h2 = img2.height;
  console.log(`Screenshot 2 dimensions: ${w2}x${h2}`);

  // Load manifest.json
  const manifestPath = path.join(__dirname, "../public/manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  // Append screenshots
  manifest.screenshots = [
    {
      "src": "/screenshots/screenshot1.png",
      "sizes": `${w1}x${h1}`,
      "type": "image/png",
      "form_factor": w1 > h1 ? "wide" : "narrow",
      "label": "FinanceOS Dashboard"
    },
    {
      "src": "/screenshots/screenshot2.png",
      "sizes": `${w2}x${h2}`,
      "type": "image/png",
      "form_factor": w2 > h2 ? "wide" : "narrow",
      "label": "FinanceOS Mobile View"
    }
  ];

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log("Updated manifest.json with correct screenshot details!");
}

main().catch(err => {
  console.error("Error inspecting screenshots:", err);
});
