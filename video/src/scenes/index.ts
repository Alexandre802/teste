import type { FC } from "react";
import type { SceneConfig } from "../config/scenes";
import { Scene01 } from "./Scene01";
import { Scene02 } from "./Scene02";
import { Scene03 } from "./Scene03";
import { Scene04 } from "./Scene04";
import { Scene05 } from "./Scene05";
import { Scene06 } from "./Scene06";
import { Scene07 } from "./Scene07";
import { Scene08 } from "./Scene08";
import { Scene09 } from "./Scene09";
import { Scene10 } from "./Scene10";

export type SceneComponent = FC<{ cfg: SceneConfig }>;

/** Registro id -> componente da cena. */
export const SCENE_COMPONENTS: Record<string, SceneComponent> = {
  s1: Scene01,
  s2: Scene02,
  s3: Scene03,
  s4: Scene04,
  s5: Scene05,
  s6: Scene06,
  s7: Scene07,
  s8: Scene08,
  s9: Scene09,
  s10: Scene10,
};
