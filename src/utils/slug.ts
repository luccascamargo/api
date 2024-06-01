export function CreateSlug(str: string) {
  // Converte a string para minúsculas
  str = str.toLowerCase()

  // Remove acentos e caracteres especiais
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // Substitui espaços em branco e caracteres não permitidos por hífens
  str = str.replace(/[^a-z0-9]+/g, '-')

  // Remove hífens duplicados ou no início/fim da string
  str = str.replace(/^-+|-+$/g, '')

  return str
}
