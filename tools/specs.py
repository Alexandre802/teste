# Caixas de cada elemento no espaco 1080x1920.
# ORDEM IMPORTA: o que esta na frente sai primeiro; o buraco e tapado
# antes do proximo recorte, entao nenhum sprite leva pedaco do vizinho.
# "auto": "words" -> o slicer detecta as palavras sozinho e gera name1..nameN

SPEC = {}

# ---------------------------------------------------------------- CENA 1
SPEC["s1"] = [
    # linhas de dentro das telas (fundo branco -> tapa repetindo a linha de cima)
    dict(name="ml_badge",   box=(626, 952, 676, 1002), fill="flat", feather=3),
    dict(name="ml_row1",    grow_to_ink=True, limit=(396, 928, 696, 1500), box=(398, 1028, 692, 1142), fill="flat", feather=3),
    dict(name="ml_row2",    grow_to_ink=True, limit=(396, 928, 696, 1500), box=(398, 1152, 692, 1268), fill="flat", feather=3),
    dict(name="ml_row3",    grow_to_ink=True, limit=(396, 928, 696, 1500), box=(398, 1282, 692, 1398), fill="flat", feather=3),
    dict(name="ml_more",    grow_to_ink=True, limit=(396, 928, 696, 1500), box=(396, 1424, 692, 1492), fill="flat", feather=3),
    dict(name="sh_badge",   box=(336, 998, 378, 1044), fill="flat", feather=3),
    dict(name="sh_row1",    grow_to_ink=True, limit=(188, 972, 388, 1412), box=(188, 1052, 386, 1162), fill="flat", feather=3),
    dict(name="sh_row2",    grow_to_ink=True, limit=(188, 972, 388, 1412), box=(188, 1168, 386, 1278), fill="flat", feather=3),
    dict(name="sh_row3",    grow_to_ink=True, limit=(188, 972, 388, 1412), box=(188, 1282, 386, 1390), fill="flat", feather=3),
    dict(name="se_badge",   box=(842, 972, 884, 1018), fill="flat", feather=3),
    dict(name="se_row1",    grow_to_ink=True, limit=(690, 948, 906, 1402), box=(694, 1042, 902, 1152), fill="flat", feather=3),
    dict(name="se_row2",    grow_to_ink=True, limit=(690, 948, 906, 1402), box=(694, 1158, 902, 1262), fill="flat", feather=3),
    dict(name="se_row3",    grow_to_ink=True, limit=(690, 948, 906, 1402), box=(694, 1272, 902, 1378), fill="flat", feather=3),
    # cards de notificacao flutuando no fundo azul
    dict(name="nl1", pad=34, ring=40, dark=30, exclusive=True, box=(0, 800, 194, 918), hard="l"),
    dict(name="nl2", pad=34, ring=40, dark=30, exclusive=True, box=(0, 982, 194, 1094), hard="l"),
    dict(name="nl3", pad=34, ring=40, dark=30, exclusive=True, box=(0, 1166, 194, 1284), hard="l"),
    dict(name="nr1", pad=34, ring=40, dark=30, exclusive=True, box=(888, 796, 1080, 914), hard="r"),
    dict(name="nr2", pad=34, ring=40, dark=30, exclusive=True, box=(890, 980, 1080, 1094), hard="r"),
    dict(name="nr3", pad=34, ring=40, dark=30, exclusive=True, box=(890, 1166, 1080, 1286), hard="r"),
    # titulos palavra a palavra
    dict(name="h1", box=(120, 316, 1010, 530), auto="words", pad=16, ring=26, exclusive=True),
    dict(name="h2", box=(115, 534, 1020, 676), auto="words", pad=16, ring=26, exclusive=True),
    dict(name="logo", box=(310, 112, 765, 300), exclusive=True),
    # celulares (frente primeiro: o do meio esta por cima)
    dict(name="phones", box=(150, 726, 922, 1672), pad=62, ring=52, dark=30),
]

# ---------------------------------------------------------------- CENA 2
SPEC["s2"] = [
    dict(name="number", box=(20, 630, 1072, 1135), pad=56, ring=46, dark=35),
    dict(name="sub",    box=(145, 1136, 1020, 1262), auto="words"),
    dict(name="logo",   box=(245, 258, 880, 512)),
    dict(name="boxA", box=(62, 498, 222, 628)),
    dict(name="boxB", box=(930, 522, 1080, 648), hard="r"),
    dict(name="boxC", box=(32, 740, 128, 838)),
    dict(name="boxD", box=(0, 1232, 210, 1428), hard="l"),
    dict(name="boxE", box=(632, 1348, 738, 1448)),
    dict(name="boxF", box=(845, 1238, 1018, 1408)),
    dict(name="boxG", box=(940, 1360, 1080, 1512), hard="r"),
]

# ---------------------------------------------------------------- CENA 3
SPEC["s3"] = [
    # conteudo de dentro do app (fundo branco)
    dict(name="eta",     grow_to_ink=True, limit=(88, 652, 500, 1600), box=(100, 1398, 482, 1578), fill="flat", feather=3),
    dict(name="st1_t",   grow_to_ink=True, limit=(88, 652, 500, 1600), box=(210, 820, 420, 872), fill="flat", feather=3),
    dict(name="st1_b",   grow_to_ink=True, limit=(88, 652, 500, 1600), box=(210, 874, 410, 956), fill="flat", feather=3),
    dict(name="st2_t",   grow_to_ink=True, limit=(88, 652, 500, 1600), box=(206, 1022, 350, 1076), fill="flat", feather=3),
    dict(name="st2_b",   grow_to_ink=True, limit=(88, 652, 500, 1600), box=(206, 1078, 458, 1180), fill="flat", feather=3),
    dict(name="st3_t",   grow_to_ink=True, limit=(88, 652, 500, 1600), box=(204, 1224, 330, 1280), fill="flat", feather=3),
    dict(name="st3_b",   grow_to_ink=True, limit=(88, 652, 500, 1600), box=(204, 1282, 452, 1384), fill="flat", feather=3),
    dict(name="dot1",    limit=(88, 652, 500, 1600), box=(108, 802, 214, 908), fill="flat", feather=3),
    dict(name="dot2",    limit=(88, 652, 500, 1600), box=(106, 1006, 212, 1112), fill="flat", feather=3),
    dict(name="dot3",    limit=(88, 652, 500, 1600), box=(104, 1210, 210, 1316), fill="flat", feather=3),
    dict(name="lineA",   limit=(88, 652, 500, 1600), box=(140, 900, 182, 1018), fill="flat", feather=4),
    dict(name="lineB",   limit=(88, 652, 500, 1600), box=(138, 1104, 180, 1222), fill="flat", feather=4),
    dict(name="hdr_t",   grow_to_ink=True, limit=(88, 652, 500, 1600), box=(110, 692, 470, 756), fill="flat", feather=3),
    dict(name="hdr_s",   grow_to_ink=True, limit=(88, 652, 500, 1600), box=(110, 756, 492, 800), fill="flat", feather=3),
    dict(name="h1",  box=(524, 786, 1056, 892), auto="words", exclusive=True),
    dict(name="h2",  box=(524, 892, 1076, 984), auto="words", gap=8, exclusive=True),
    dict(name="sub", box=(524, 986, 1048, 1062), auto="words", gap=7, exclusive=True),
    dict(name="logo", box=(316, 140, 768, 326), exclusive=True),
    # celular inteiro (ja sem o conteudo acima)
    dict(name="phone", box=(30, 392, 552, 1652), pad=58, ring=48, dark=30),
]

# ---------------------------------------------------------------- CENA 4
SPEC["s4"] = [
    dict(name="box",    box=(828, 780, 1050, 980), ring=24),
    dict(name="lbl_go", box=(506, 842, 648, 896)),
    dict(name="dot_go", box=(552, 892, 606, 944)),
    dict(name="lbl_sp", box=(912, 1018, 1072, 1070), hard="r"),
    dict(name="dot_sp", box=(980, 1062, 1036, 1116)),
    dict(name="h1",  box=(38, 682, 462, 820), auto="words"),
    dict(name="h2",  box=(34, 818, 536, 956), auto="words"),
    dict(name="s1",  box=(40, 988, 296, 1052), auto="words"),
    dict(name="s2",  box=(40, 1044, 386, 1110), auto="words"),
    dict(name="s3",  box=(40, 1100, 350, 1164), auto="words"),
    dict(name="s4",  box=(40, 1156, 440, 1222), auto="words"),
    dict(name="map", box=(420, 460, 1080, 1230), hard="r", pad=40, ring=40),
]

# ---------------------------------------------------------------- CENA 5
SPEC["s5"] = [
    # conteudo do card de status
    dict(name="stars",  box=(348, 1632, 724, 1756), feather=6),
    dict(name="s_t1",   box=(416, 1344, 714, 1432), feather=6),
    dict(name="s_t2",   box=(422, 1458, 704, 1548), feather=6),
    dict(name="s_t3",   box=(406, 1562, 726, 1656), feather=6),
    dict(name="s_d1",   box=(362, 1350, 440, 1428), feather=6),
    dict(name="s_d2",   box=(362, 1464, 440, 1542), feather=6),
    dict(name="s_d3",   box=(346, 1564, 438, 1656), feather=6),
    dict(name="s_line", box=(384, 1400, 420, 1592), feather=5),
    dict(name="status", box=(318, 1318, 762, 1802), pad=20, ring=34),
    # cards laterais
    dict(name="c_tl", pad=18, ring=30, box=(20, 800, 266, 1096)),
    dict(name="c_bl", pad=18, ring=30, box=(20, 1104, 266, 1400)),
    dict(name="c_tr", pad=18, ring=30, box=(820, 800, 1066, 1096)),
    dict(name="c_br", pad=18, ring=30, box=(820, 1104, 1066, 1400)),
    # titulo e logo saem antes do domo, que encosta neles
    dict(name="h1", box=(105, 336, 1020, 512), auto="words", exclusive=True),
    dict(name="h2", box=(105, 512, 1050, 680), auto="words", exclusive=True),
    dict(name="logo", box=(308, 100, 790, 300), exclusive=True),
    # centro: frente primeiro
    dict(name="shield", box=(438, 812, 618, 1030), ring=20),
    dict(name="cbox",   box=(318, 872, 788, 1308), ring=26),
    dict(name="dome",   box=(228, 668, 852, 1352), pad=22, ring=40),
]

# ---------------------------------------------------------------- CENA 6
SPEC["s6"] = [
    dict(name="ntl", pad=34, ring=40, dark=30, box=(18, 262, 305, 425), hard="l"),
    dict(name="ntr", pad=34, ring=40, dark=30, box=(788, 308, 1062, 428)),
    dict(name="nbl", pad=34, ring=40, dark=30, box=(12, 1258, 302, 1425), hard="l"),
    dict(name="nbr", pad=34, ring=40, dark=30, box=(808, 1258, 1080, 1418), hard="r"),
    dict(name="boxTR", pad=22, ring=32, dark=35, box=(800, 470, 980, 616)),
    dict(name="boxBL", pad=22, ring=32, dark=35, box=(0, 1068, 216, 1222), hard="l"),
    dict(name="pinL", pad=22, ring=32, dark=35, box=(30, 540, 108, 620)),
    dict(name="pinR", pad=22, ring=32, dark=35, box=(988, 540, 1060, 620)),
    dict(name="logo", box=(258, 460, 822, 698)),
    dict(name="big1", box=(355, 705, 765, 898), pad=18, ring=26),
    dict(name="big2", box=(175, 892, 945, 1110), pad=18, ring=26),
    dict(name="tag",  box=(220, 1124, 936, 1230), pad=20, ring=28),
    dict(name="ware", box=(0, 1388, 1080, 1920), hard="lrb", pad=34, ring=36),
]
