import fs from "fs";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setCrf(17);
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(4);

// Neste container o Chromium já vem pré-instalado (Playwright), então evitamos
// que o Remotion tente baixar o Chrome Headless Shell.
const candidates = [
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
];
for (const c of candidates) {
  if (fs.existsSync(c)) {
    Config.setBrowserExecutable(c);
    break;
  }
}
