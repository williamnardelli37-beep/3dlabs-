// Função serverless (Vercel) que cria o pagamento no Mercado Pago (Checkout Pro).
// O Access Token fica só aqui, no servidor, na variável de ambiente MP_ACCESS_TOKEN.
const { getCatalogo } = require('./_catalogo.js');

const digitos = (s) => String(s || '').replace(/\D/g, '');
const texto = (s, max = 120) => String(s || '').trim().slice(0, max);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return res.status(500).json({ erro: 'Pagamento ainda não configurado.' });

  const { itens, cliente } = req.body || {};
  if (!Array.isArray(itens) || itens.length === 0 || itens.length > 30 || !cliente) {
    return res.status(400).json({ erro: 'Pedido inválido.' });
  }

  // Preços vêm do catálogo do servidor, nunca do navegador.
  let cat;
  try { cat = await getCatalogo(); } catch (e) {
    console.error('Catálogo indisponível:', e);
    return res.status(502).json({ erro: 'Não foi possível confirmar os preços agora. Tente de novo.' });
  }
  const catalogo = Object.fromEntries(cat.produtos.map((p) => [p.id, p]));
  const mpItens = [];
  let subtotal = 0;
  for (const it of itens) {
    const p = catalogo[it && it.id];
    const qtd = Number(it && it.qtd);
    if (!p || !Number.isInteger(qtd) || qtd < 1 || qtd > 20) {
      return res.status(400).json({ erro: 'Item inválido no pedido.' });
    }
    mpItens.push({
      id: p.id, title: p.nome, description: p.spec || p.categoria || p.nome, category_id: 'others',
      quantity: qtd, unit_price: p.preco, currency_id: 'BRL'
    });
    subtotal += p.preco * qtd;
  }
  const frete = subtotal >= cat.frete.gratisAcima ? 0 : cat.frete.valor;

  const nome = texto(cliente.nome, 80);
  const email = texto(cliente.email, 120);
  const cep = digitos(cliente.cep);
  const fone = digitos(cliente.telefone);
  if (!nome || !/^\S+@\S+\.\S+$/.test(email) || cep.length !== 8 || !texto(cliente.endereco) || !texto(cliente.numero)) {
    return res.status(400).json({ erro: 'Confira seus dados de contato e de entrega.' });
  }
  const [primeiroNome, ...resto] = nome.split(/\s+/);

  const site = (process.env.SITE_URL || `https://${req.headers.host}`).replace(/\/$/, '');
  const publico = site.startsWith('https://');
  const pedido = '3DL-' + Date.now().toString(36).toUpperCase();

  const preferencia = {
    items: mpItens,
    payer: {
      name: primeiroNome, surname: resto.join(' '), email,
      phone: { area_code: fone.slice(0, 2), number: fone.slice(2) },
      address: { zip_code: cep, street_name: texto(cliente.endereco), street_number: texto(cliente.numero, 10) }
    },
    shipments: {
      cost: frete,
      mode: 'not_specified',
      receiver_address: {
        zip_code: cep, street_name: texto(cliente.endereco), street_number: texto(cliente.numero, 10),
        apartment: texto(cliente.complemento, 40),
        city_name: texto(cliente.cidade, 60), state_name: texto(cliente.uf, 2).toUpperCase()
      }
    },
    back_urls: {
      success: `${site}/?pedido=ok`,
      pending: `${site}/?pedido=pendente`,
      failure: `${site}/?pedido=erro`
    },
    external_reference: pedido,
    statement_descriptor: '3DLABS',
    payment_methods: { installments: 12 },
    metadata: { pedido, cliente: nome, telefone: fone, complemento: texto(cliente.complemento, 40) }
  };
  if (publico) {
    preferencia.auto_return = 'approved';
    preferencia.notification_url = `${site}/api/webhook`;
  }

  try {
    const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(preferencia)
    });
    const dados = await r.json();
    if (!r.ok || !dados.init_point) {
      console.error('Mercado Pago recusou a preferência:', r.status, JSON.stringify(dados));
      return res.status(502).json({ erro: 'Não foi possível iniciar o pagamento.' });
    }
    return res.status(200).json({ url: dados.init_point, pedido });
  } catch (e) {
    console.error('Falha ao falar com o Mercado Pago:', e);
    return res.status(502).json({ erro: 'Não foi possível iniciar o pagamento.' });
  }
};
