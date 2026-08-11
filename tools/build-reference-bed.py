#!/usr/bin/env python3
"""
Builds the music bed from the supplied reference video's audio.

The reference runs 42.1s and the ad runs 70.4s, so the track has to be
extended. It is looped at a bar boundary of its own 134.6 BPM grid with a short
equal-power crossfade, which keeps the loop from clicking and keeps the downbeat
where the picture expects it — the visuals are locked to the same grid in
`src/ConsulTech/beat.ts`.

The reference's own sound effects are baked into this bed and cannot be
separated (its music never drops below -35 dBFS), so they arrive as texture at
music level. The ad's own effects still sit on top at effects level, since only
those can land on this ad's animation.

Usage: python3 tools/build-reference-bed.py <input.wav> <output.wav> [seconds]
"""

import math
import struct
import sys
import wave

BPM = 134.6
SR = 44100


def read_wav(path):
    w = wave.open(path, 'rb')
    n = w.getnframes()
    ch = w.getnchannels()
    sr = w.getframerate()
    raw = struct.unpack('<%dh' % (n * ch), w.readframes(n))
    if ch == 1:
        left = right = list(raw)
    else:
        left = list(raw[0::2])
        right = list(raw[1::2])
    return left, right, sr


def write_wav(path, left, right, sr):
    frames = bytearray()
    for l, r in zip(left, right):
        frames += struct.pack(
            '<hh',
            int(max(-32768, min(32767, l))),
            int(max(-32768, min(32767, r))),
        )
    w = wave.open(path, 'wb')
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes(bytes(frames))
    w.close()


def main():
    src = sys.argv[1]
    dst = sys.argv[2]
    target = float(sys.argv[3]) if len(sys.argv) > 3 else 70.5

    left, right, sr = read_wav(src)
    total = len(left) / sr

    bar = (60.0 / BPM) * 4                     # 1.783s at 134.6 BPM
    fade = int(0.45 * sr)                      # crossfade length in samples

    # Loop between bar boundaries, skipping the track's own intro fade and
    # stopping before its outro fade.
    loop_start = int(round(2 * bar * sr))                       # after bar 2
    last_bar = math.floor((total - 0.6) / bar)
    loop_end = int(round(last_bar * bar * sr))

    print(f'origem {total:.2f}s  loop {loop_start/sr:.2f}s -> {loop_end/sr:.2f}s '
          f'({(loop_end-loop_start)/sr:.2f}s, {last_bar-2} compassos)')

    need = int(target * sr)
    outL, outR = [], []

    # First pass plays from the top so the track's own intro is kept.
    outL.extend(left[:loop_end])
    outR.extend(right[:loop_end])

    # Then repeat the loop section, crossfading over the seam.
    while len(outL) < need:
        seg_l = left[loop_start:loop_end]
        seg_r = right[loop_start:loop_end]

        # Equal-power crossfade: cos/sin keeps perceived loudness constant
        # across the seam, where a linear fade would dip in the middle.
        for i in range(fade):
            t = i / fade
            a = math.cos(t * math.pi / 2)
            b = math.sin(t * math.pi / 2)
            j = len(outL) - fade + i
            if 0 <= j < len(outL):
                outL[j] = outL[j] * a + seg_l[i] * b
                outR[j] = outR[j] * a + seg_r[i] * b

        outL.extend(seg_l[fade:])
        outR.extend(seg_r[fade:])

    outL = outL[:need]
    outR = outR[:need]

    # Top and tail so the bed does not start or stop abruptly.
    fin = int(1.0 * sr)
    fout = int(1.8 * sr)
    for i in range(fin):
        g = i / fin
        outL[i] *= g
        outR[i] *= g
    for i in range(fout):
        g = 1 - i / fout
        k = need - fout + i
        outL[k] *= g
        outR[k] *= g

    write_wav(dst, outL, outR, sr)
    print(f'gravado {dst}  {need/sr:.2f}s')


if __name__ == '__main__':
    main()
