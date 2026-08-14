import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("swangle");

// Qualidade alta: o reel tem muito gradiente e glow.
Config.setJpegQuality(95);
Config.setCrf(17);
