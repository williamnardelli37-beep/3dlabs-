/* Frete e produtos de EXEMPLO da 3D Labs.
   - Os produtos reais são publicados pelo painel (admin.html). Quando você publica o primeiro anúncio,
     estes exemplos saem do ar. Eles só aparecem na prévia local e antes do primeiro anúncio.
   - O frete daqui vale para todos os pedidos. O servidor ignora qualquer preço vindo do navegador. */
const LOJA = {
  frete: { valor: 18, gratisAcima: 199 },
  produtos: [
    { id: 'vaso-espiral', nome: 'Vaso Espiral', categoria: 'Casa', preco: 49.90, forma: 'vaso', cor: '#FF5A1F',
      desc: 'Vaso decorativo com as linhas de camada à mostra. Para flores secas e artificiais.', spec: 'PLA · 16 cm de altura' },
    { id: 'porta-lapis-colmeia', nome: 'Porta-lápis Colmeia', categoria: 'Escritório', preco: 39.90, forma: 'colmeia', cor: '#12A8BC',
      desc: 'Organizador hexagonal para canetas, lápis e pincéis.', spec: 'PLA · 10 cm de altura' },
    { id: 'suporte-celular-dobra', nome: 'Suporte de celular Dobra', categoria: 'Escritório', preco: 34.90, forma: 'dobra', cor: '#3D4852',
      desc: 'Apoio inclinado para celular. Cabe na mesa de trabalho e na mesa de cabeceira.', spec: 'PETG · 9 cm de altura' },
    { id: 'luminaria-lua', nome: 'Luminária Lua', categoria: 'Casa', preco: 129.90, forma: 'lua', cor: '#F6F7F5',
      desc: 'Luminária de mesa redonda com luz quente. Acompanha cabo USB e lâmpada de LED.', spec: 'PLA · 15 cm de diâmetro' },
    { id: 'chaveiro-hexa', nome: 'Chaveiro Hexa (kit com 3)', categoria: 'Acessórios', preco: 24.90, forma: 'chaveiro', cor: '#7C5CFF',
      desc: 'Três chaveiros leves e resistentes. Cores sortidas dentro da linha da semana.', spec: 'PLA · 4 cm cada' },
    { id: 'cachepo-faceta', nome: 'Cachepô Faceta', categoria: 'Casa', preco: 59.90, forma: 'faceta', cor: '#2FBF71',
      desc: 'Cachepô facetado para suculentas e cactos. Use com o vasinho de plástico dentro.', spec: 'PLA · 11 cm de altura' },
    { id: 'suporte-headset-arco', nome: 'Suporte de headset Arco', categoria: 'Escritório', preco: 79.90, forma: 'arco', cor: '#FFB400',
      desc: 'Arco de apoio para headset, com base larga que não tomba.', spec: 'PETG · 24 cm de altura' },
    { id: 'dado-d20', nome: 'Dado D20 de mesa', categoria: 'Jogos', preco: 29.90, forma: 'd20', cor: '#E23D5E',
      desc: 'Dado grande de vinte faces para RPG de mesa, com números em relevo.', spec: 'PLA · 5 cm' }
  ]
};
if (typeof module !== 'undefined') module.exports = LOJA;
