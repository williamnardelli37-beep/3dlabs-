// Catálogo da loja e login do painel. Arquivo auxiliar (o "_" no nome impede que vire uma rota).
// Os anúncios publicados ficam no Vercel Blob, em um arquivo JSON público.
const crypto = require('crypto');
const { put, list } = require('@vercel/blob');
const LOJA = require('../produtos.js');

const CAMINHO = 'catalogo/produtos.json';

// Devolve a lista de anúncios, ou null se ainda não existe catálogo (nenhum anúncio publicado).
async function lerCatalogo() {
  const { blobs } = await list({ prefix: CAMINHO, limit: 1 });
  if (!blobs.length) return null;
  const r = await fetch(`${blobs[0].url}?t=${Date.now()}`);
  if (!r.ok) throw new Error('Falha ao ler o catálogo');
  const lista = await r.json();
  return Array.isArray(lista) ? lista : [];
}

async function salvarCatalogo(lista) {
  await put(CAMINHO, JSON.stringify(lista), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60
  });
}

// Catálogo em uso: os anúncios do painel; antes do primeiro anúncio, os produtos de exemplo.
async function getCatalogo() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { produtos: LOJA.produtos, origem: 'exemplo', frete: LOJA.frete };
  }
  const lista = await lerCatalogo();
  if (lista === null) return { produtos: LOJA.produtos, origem: 'exemplo', frete: LOJA.frete };
  return { produtos: lista, origem: 'loja', frete: LOJA.frete };
}

function senhaOk(req) {
  const esperado = process.env.ADMIN_PASSWORD || '';
  let enviado = '';
  try { enviado = decodeURIComponent(String(req.headers['x-admin-senha'] || '')); } catch { /* senha inválida */ }
  const a = crypto.createHash('sha256').update(enviado).digest();
  const b = crypto.createHash('sha256').update(esperado).digest();
  return esperado.length > 0 && crypto.timingSafeEqual(a, b);
}

module.exports = { lerCatalogo, salvarCatalogo, getCatalogo, senhaOk, LOJA };
