import React from 'react';
import { Scene01 } from './Scene01';
import { Scene02 } from './Scene02';
import { Scene03 } from './Scene03';
import { Scene04 } from './Scene04';
import { Scene05 } from './Scene05';
import { Scene06 } from './Scene06';
import { Scene07 } from './Scene07';
import { Scene08 } from './Scene08';
import { Scene09 } from './Scene09';
import { Scene10 } from './Scene10';
import { SceneApp } from './SceneApp';
import { Scene11 } from './Scene11';
import { Scene12 } from './Scene12';

/** Ordem das cenas — casa com SCENES em timeline.ts. */
export const SCENE_COMPONENTS: React.FC[] = [
  Scene01,
  Scene02,
  Scene03,
  Scene04,
  Scene05,
  Scene06,
  Scene07,
  Scene08,
  Scene09,
  Scene10,
  /** 10 — take de demonstração do aplicativo (entra dentro da janela do S04) */
  SceneApp,
  /** 11 — lista de capacidades ("ele faz tudo sozinho") */
  Scene11,
  /** 12 — fecho argumentativo em tipografia */
  Scene12,
];
