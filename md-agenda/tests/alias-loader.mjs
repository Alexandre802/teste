import { existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '..')

function resolveFile(base) {
  const candidates = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')]
  return candidates.find((candidate) => existsSync(candidate) && candidate.endsWith('.ts'))
}

export async function resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) {
    const target = resolveFile(path.join(ROOT, specifier.slice(2)))
    if (target) return next(pathToFileURL(target).href, context)
  }
  return next(specifier, context)
}
