export function formatedPrice(price: number): string {
  return price.toLocaleString('pt-BR', {
    currency: 'BRL',
  });
}
