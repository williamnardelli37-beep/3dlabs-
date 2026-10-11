// Painel do lojista: entrar, publicar anúncio (imagem + descrição) e remover anúncio.
// Protegido pela senha da variável de ambiente ADMIN_PASSWORD.
const crypto = require('crypto');
const { put, del } = require('@vercel/blob');
const { lerCatalogo, salvarCatalogo, senhaOk } = require('./_catalogo.js');

const texto = (s, max) => String(s == null ? '' : s).trim().slice(0, max);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

function slug(nome) {
  const base = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'peca';
  return `${base}-${crypto.randomBytes(2).toString('hex')}`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });
  if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ erro: 'Defina a variável ADMIN_PASSWORD na Vercel.' });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(500).json({ erro: 'Armazenamento de imagens (Vercel Blob) ainda não configurado.' });

  if (!senhaOk(req)) {
    await espera(800); // atrasa tentativas de adivinhar a senha
    return res.status(401).json({ erro: 'Senha incorreta.' });
  }

  const corpo = req.body || {};

  try {
    if (corpo.acao === 'entrar') return res.status(200).json({ ok: true });

    if (corpo.acao === 'publicar') {
      const nome = texto(corpo.nome, 80);
      const desc = texto(corpo.desc, 600);
      const spec = texto(corpo.spec, 80);
      const categoria = texto(corpo.categoria, 30) || 'Geral';
      const preco = Math.round(Number(corpo.preco) * 100) / 100;

      if (nome.length < 3) return res.status(400).json({ erro: 'Escreva o nome da peça (mínimo 3 letras).' });
      if (desc.length < 10) return res.status(400).json({ erro: 'Escreva uma descrição um pouco maior.' });
      if (!(preco > 0 && preco <= 100000)) return res.status(400).json({ erro: 'Informe um preço válido.' });

      const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(corpo.imagem || ''));
      if (!m) return res.status(400).json({ erro: 'Envie uma imagem (JPG, PNG ou WebP).' });
      const bytes = Buffer.from(m[2], 'base64');
      if (bytes.length > 3 * 1024 * 1024) return res.status(400).json({ erro: 'A imagem ficou grande demais. Use uma foto menor.' });

      const id = slug(nome);
      const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
      const arquivo = await put(`produtos/${id}.${ext}`, bytes, {
        access: 'public',
        contentType: `image/${m[1]}`,
        addRandomSuffix: true,
        cacheControlMaxAge: 31536000
      });

      const lista = (await lerCatalogo()) || []; // o primeiro anúncio substitui os exemplos
      lista.unshift({ id, nome, categoria, preco, desc, spec, imagem: arquivo.url, criadoEm: new Date().toISOString() });
      await salvarCatalogo(lista);
      return res.status(200).json({ ok: true, id });
    }

    if (corpo.acao === 'remover') {
      const lista = await lerCatalogo();
      if (!lista) return res.status(400).json({ erro: 'Ainda não há anúncios publicados.' });
      const alvo = lista.find((p) => p.id === corpo.id);
      if (!alvo) return res.status(404).json({ erro: 'Anúncio não encontrado.' });
      await salvarCatalogo(lista.filter((p) => p.id !== corpo.id));
      if (alvo.imagem) { try { await del(alvo.imagem); } catch (e) { console.error('Imagem não apagada:', e); } }
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ erro: 'Ação desconhecida.' });
  } catch (e) {
    console.error('Erro no painel:', e);
    return res.status(500).json({ erro: 'Algo deu errado. Tente de novo.' });
  }
};
