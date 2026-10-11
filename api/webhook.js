// Recebe os avisos do Mercado Pago quando um pagamento muda de status.
// Configure a URL em: Seu app > Webhooks > https://SEU-SITE/api/webhook (evento "Pagamentos").
const crypto = require('crypto');

function assinaturaValida(req, dataId) {
  const segredo = process.env.MP_WEBHOOK_SECRET;
  if (!segredo) return true; // sem segredo configurado, não valida (use o segredo em produção)
  const cabecalho = String(req.headers['x-signature'] || '');
  const requestId = String(req.headers['x-request-id'] || '');
  const partes = Object.fromEntries(cabecalho.split(',').map((p) => p.trim().split('=')));
  if (!partes.ts || !partes.v1) return false;
  const manifesto = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${partes.ts};`;
  const esperado = crypto.createHmac('sha256', segredo).update(manifesto).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(esperado), Buffer.from(partes.v1));
  } catch {
    return false;
  }
}

module.exports = async (req, res) => {
  const tipo = (req.query && req.query.type) || (req.body && req.body.type);
  const dataId = (req.query && req.query['data.id']) || (req.body && req.body.data && req.body.data.id);

  if (tipo !== 'payment' || !dataId) return res.status(200).end();
  if (!assinaturaValida(req, dataId)) return res.status(401).end();

  try {
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    });
    if (!r.ok) return res.status(500).end(); // o Mercado Pago tenta de novo
    const pagamento = await r.json();

    // Aqui você registra o pedido: planilha, banco de dados, e-mail ou WhatsApp.
    // status: approved (pago), pending (aguardando Pix/boleto), rejected, refunded...
    console.log('Pagamento', pagamento.id, '| pedido', pagamento.external_reference,
      '| status', pagamento.status, '| valor', pagamento.transaction_amount);

    return res.status(200).end();
  } catch (e) {
    console.error('Erro no webhook:', e);
    return res.status(500).end();
  }
};
