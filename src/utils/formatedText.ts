export function normalizeText(text: string): string {
  if (!text) return undefined;
  return text
    .normalize('NFD') // Decompõe os caracteres acentuados em caracteres base + acento
    .replace(/[\u0300-\u036f]/g, ''); // Remove os acentos
}
