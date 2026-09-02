import { Config } from "@remotion/cli/config";

/** Configuração do Remotion Studio e do render pela CLI. */
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setEntryPoint("./remotion/index.ts");
