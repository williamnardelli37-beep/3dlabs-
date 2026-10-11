// Lista pública de produtos para a vitrine.
const { getCatalogo } = require('./_catalogo.js');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido.' });
  try {
    const { produtos, origem } = await getCatalogo();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ produtos, origem });
  } catch (e) {
    console.error('Erro ao ler produtos:', e);
    return res.status(500).json({ erro: 'Não foi possível carregar os produtos.' });
  }
};
