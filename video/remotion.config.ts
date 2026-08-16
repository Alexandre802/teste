import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle-egl");
Config.setBrowserExecutable(
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
);
Config.setConcurrency(4);

// margem folgada para o carregamento das fontes locais em render paralelo
Config.setDelayRenderTimeoutInMilliseconds(120_000);
