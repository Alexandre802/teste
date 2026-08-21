import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("swangle");
Config.setConcurrency(4);

// Este ambiente nao alcanca o CDN do Remotion; usa o Chromium ja instalado.
Config.setBrowserExecutable("/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell");
