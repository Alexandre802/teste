/**
 * Registra o resolvedor de "@/" para os testes unitários rodarem direto no
 * Node, sem empacotador. O mesmo alias do tsconfig.
 */
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

register('./alias-loader.mjs', pathToFileURL(import.meta.filename))
