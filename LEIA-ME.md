# 3D Labs — loja de produtos 3D com painel e Mercado Pago

## O que tem na pasta
- `index.html` — a loja (vitrine, sacola, entrega e pagamento)
- `admin.html` — o painel: você envia foto + descrição e o anúncio aparece na loja
- `produtos.js` — regra de frete e produtos de exemplo
- `api/produtos.js` — entrega a lista de produtos para a loja
- `api/admin.js` — entrar, publicar e remover anúncios (protegido por senha)
- `api/checkout.js` — cria o pagamento no Mercado Pago
- `api/webhook.js` — recebe o aviso de pagamento
- `api/_catalogo.js` — arquivo interno (catálogo e senha)
- `logo.svg` e `icone.svg` — logo da 3D Labs

## Como a loja e o painel se ligam
O painel salva a foto e os dados do anúncio no **Vercel Blob** (armazenamento da Vercel).
A loja lê esses mesmos dados, então o anúncio aparece na hora. O checkout confere o preço
no servidor, usando esse mesmo catálogo.
Links: a loja tem "Painel do lojista" no rodapé e o painel tem "Ver a loja" no topo.

## Passo a passo (uma vez só)
1. **Hospedar:** envie esta pasta para um repositório no GitHub e importe em vercel.com.
2. **Armazenamento:** no projeto da Vercel, abra a aba **Storage**, crie um **Blob** com acesso
   **público** e conecte ao projeto. Isso cria a variável `BLOB_READ_WRITE_TOKEN` sozinha.
3. **Variáveis de ambiente** (Settings > Environment Variables):
   - `ADMIN_PASSWORD` — a senha do painel (use uma senha longa)
   - `MP_ACCESS_TOKEN` — Access Token do Mercado Pago (comece pelo de teste)
   - `SITE_URL` — endereço do site, ex.: `https://3dlabs.com.br` (sem barra no final)
   - `MP_WEBHOOK_SECRET` — opcional, assinatura secreta do Webhook
4. **Publicar de novo (redeploy)** para as variáveis valerem.
5. **Mercado Pago:** em Webhooks, cadastre `https://SEU-SITE/api/webhook` (evento "Pagamentos").
6. **Entrar no painel:** abra `https://SEU-SITE/admin.html`, digite a senha e publique o primeiro anúncio.

## Usando o painel
- **Publicar:** escolha a foto, escreva nome, descrição e preço. A foto é reduzida automaticamente.
- **Remover:** na lista "Anúncios na loja", botão Remover.
- Quando você publica o primeiro anúncio, os produtos de exemplo saem do ar.
- Para corrigir preço ou texto, remova o anúncio e publique de novo.

## Personalizar
- Frete: `produtos.js` (valor e "grátis acima de").
- WhatsApp e Instagram: bloco `CONFIG` no começo do script do `index.html`.
- Textos de prazo, devolução e material nas "Dúvidas" são exemplos: confirme com a sua política.

## Segurança
- Nunca coloque o Access Token do Mercado Pago nem a senha do painel em arquivos HTML.
- A senha só vale no servidor. Quem não souber a senha não consegue publicar nem remover.
- Os preços cobrados vêm sempre do catálogo no servidor, nunca do navegador.

## Testar no computador
Abrir o `index.html` direto mostra a loja com os produtos de exemplo, mas pagamento e painel
só funcionam com o servidor. Para testar tudo: `npm install` e `npx vercel dev` (com um arquivo `.env`
contendo as variáveis acima).
