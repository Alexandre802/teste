# FILM — frame interpolation (Google Research)

<https://github.com/google-research/frame-interpolation> — *FILM: Frame Interpolation for
Large Motion* (Reda et al., ECCV 2022). Rede TensorFlow 2 que sintetiza frames intermediários
entre duas imagens, inclusive com movimento grande.

Ferramenta **opcional e offline**, fora do pipeline Remotion. Só entra em pós-produção.

## Quando vale a pena

- transformar fotos quase idênticas (burst, before/after) em um movimento suave de 2–3 s;
- slow motion a partir de material filmado em fps baixo;
- suavizar uma sequência de imagens geradas (IA, screenshots de produto) num vídeo contínuo.

**Quando não usar:** para animação feita no Remotion, aumente `fps` na `<Composition>` e
renderize de novo. Interpolar depois é mais lento, mais pesado e degrada a imagem — o
Remotion já produz o frame exato.

## Custo real

Depende de GPU NVIDIA com CUDA, TensorFlow 2.6 e download manual dos modelos pré-treinados
(Google Drive). As dependências são antigas e conflitam com ambientes Python modernos — use
Docker (`gcr.io/deeplearning-platform-release/tf2-gpu.2-6:latest`) ou um venv dedicado. Não
instale isso no ambiente do site.

Alternativas hospedadas, sem setup: Replicate (`google-research/frame-interpolation`) e
Hugging Face Spaces. Para a maioria dos casos de landing page, é o caminho certo.

## Uso local, resumido

```bash
git clone https://github.com/google-research/frame-interpolation
cd frame-interpolation
pip3 install -r requirements.txt
sudo apt-get install -y ffmpeg
```

Baixe os modelos pré-treinados para `<pretrained_models>/` com a estrutura
`film_net/{L1,Style,VGG}/` e `vgg/imagenet-vgg-verydeep-19.mat`. Use o modelo `Style` para
material fotográfico.

Um frame intermediário (t=0.5):

```bash
python3 -m eval.interpolator_test \
  --frame1 photos/one.png \
  --frame2 photos/two.png \
  --model_path <pretrained_models>/film_net/Style/saved_model \
  --output_frame photos/output_middle.png
```

Sequência inteira + vídeo:

```bash
python3 -m eval.interpolator_cli \
  --pattern "photos" \
  --model_path <pretrained_models>/film_net/Style/saved_model \
  --times_to_interpolate 6 \
  --output_video
```

Saída em `photos/interpolated_frames/` e `photos/interpolated.mp4`.

`--times_to_interpolate = N` gera `(2^N + 1) * (num_frames - 1)` frames. N=6 sobre 2 imagens
dá 65 frames ≈ 2,7 s a 24 fps. Cada incremento **dobra** o custo — comece em 3 ou 4.

Alta resolução (4K) estoura memória: subdivida com `--block_height` e `--block_width`
(o total de patches é o produto dos dois).

## Voltar para o Remotion

Os frames interpolados entram como asset normal:

```tsx
import { Video, staticFile } from '@remotion/media';

<Video src={staticFile('interpolated.mp4')} />
```

Ou como sequência de imagens, se quiser controlar o tempo frame a frame:

```tsx
const idx = Math.min(frames.length - 1, Math.floor(frame / 2));
<Img src={staticFile(`interpolated_frames/frame_${String(idx).padStart(3, '0')}.png`)} />
```

Licença Apache 2.0 — atribuição ao Google Research ao usar o modelo.
