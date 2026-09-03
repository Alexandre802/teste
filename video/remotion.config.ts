import { existsSync } from 'fs';
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(96);
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('angle');
Config.setCodec('h264');
Config.setDelayRenderTimeoutInMilliseconds(120000);

// Este ambiente nao tem acesso de rede ao download do Chromium do Remotion;
// usamos o Chromium ja instalado na imagem.
const LOCAL_CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (existsSync(LOCAL_CHROME)) {
  Config.setBrowserExecutable(LOCAL_CHROME);
}
