/**
 * Registro de cenas: a chave é o `id` usado em config/timeline.ts.
 * Cena sem componente registrado é simplesmente pulada na montagem,
 * o que permite trabalhar em uma cena por vez.
 */
import React from "react";
import { Scene01Leque } from "./Scene01Leque";
import { Scene02Orbita } from "./Scene02Orbita";
import { Scene03MenosMais } from "./Scene03MenosMais";
import { Scene04AppCursor } from "./Scene04AppCursor";
import { Scene05MereceMais } from "./Scene05MereceMais";
import { Scene06Rendimento } from "./Scene06Rendimento";
import { Scene07Seguranca } from "./Scene07Seguranca";
import { Scene08Notificacoes } from "./Scene08Notificacoes";
import { Scene09Possibilidades } from "./Scene09Possibilidades";

export const SCENE_COMPONENTS: Record<string, React.FC> = {
  "s01-leque": Scene01Leque,
  "s02-orbita": Scene02Orbita,
  "s03-menos-mais": Scene03MenosMais,
  "s04-app-cursor": Scene04AppCursor,
  "s05-merece-mais": Scene05MereceMais,
  "s06-rendimento": Scene06Rendimento,
  "s07-seguranca": Scene07Seguranca,
  "s08-notificacoes": Scene08Notificacoes,
  "s09-possibilidades": Scene09Possibilidades,
};
