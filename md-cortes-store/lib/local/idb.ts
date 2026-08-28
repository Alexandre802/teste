"use client";

/**
 * Espelho local dos dados, em IndexedDB.
 *
 * O app é local-first: a tela sempre lê deste espelho, e o Supabase é a fonte
 * de verdade que entra por sincronização. É o que faz a venda aparecer no
 * mesmo instante em que Maicon confirma, e o que segura os dados quando o
 * sinal cai no meio do atendimento.
 *
 * A loja é de uma pessoa só, então o volume cabe folgado num único registro:
 * gravar o retrato inteiro a cada mudança é mais simples — e mais difícil de
 * deixar inconsistente — do que manter um object store por tabela.
 */

const DB_NAME = "md-cortes-store";
const DB_VERSION = 1;
const STORE = "kv";

const SNAPSHOT_KEY = "snapshot";
const OUTBOX_KEY = "outbox";
const META_KEY = "meta";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function read<T>(key: string): Promise<T | null> {
  if (typeof indexedDB === "undefined") return null;
  try {
    const db = await open();
    return await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).get(key);
      request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Navegação anônima ou armazenamento bloqueado: o app segue só em memória.
    return null;
  }
}

async function write(key: string, value: unknown): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await open();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // idem: perder o cache local é aceitável, travar a tela não é.
  }
}

export const localDb = {
  readSnapshot: <T>() => read<T>(SNAPSHOT_KEY),
  writeSnapshot: (value: unknown) => write(SNAPSHOT_KEY, value),
  readOutbox: <T>() => read<T>(OUTBOX_KEY),
  writeOutbox: (value: unknown) => write(OUTBOX_KEY, value),
  readMeta: <T>() => read<T>(META_KEY),
  writeMeta: (value: unknown) => write(META_KEY, value),
  async clear(): Promise<void> {
    await write(SNAPSHOT_KEY, null);
    await write(OUTBOX_KEY, null);
    await write(META_KEY, null);
  },
};
