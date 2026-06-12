/**
 * Integração Multibanco — Eupago / Ifthenpay
 *
 * COMO USAR (produção):
 * 1. Escolha um dos dois provedores abaixo (Eupago ou Ifthenpay).
 * 2. Crie uma conta em eupago.pt ou ifthenpay.com.
 * 3. Obtenha as credenciais (API key / chave de entidade / sub-entidade).
 * 4. Adicione as variáveis ao backend/.env (veja exemplos abaixo).
 * 5. Substitua a função simulada `generateMultibancoRef` na rota POST /api/jewelry-orders
 *    por uma chamada a `createEupagoReference` ou `createIfthenpayReference`.
 *
 * Variáveis .env necessárias:
 *   MULTIBANCO_PROVIDER=eupago          # ou: ifthenpay
 *   EUPAGO_API_KEY=xxxxxxxxxxxxxxxx
 *   EUPAGO_ENTITY=21724                 # entidade fornecida pela Eupago
 *   IFTHENPAY_KEY=xxxx-xxxx-xxxx-xxxx
 *   IFTHENPAY_ENTITY=99999
 *   IFTHENPAY_SUBENTIDADE=999
 */

// ============================================================
// Opção 1 — EUPAGO  (https://eupago.pt/api)
// ============================================================

/**
 * Cria uma referência Multibanco via Eupago.
 * @param {object} opts
 * @param {number}  opts.amount   — valor em EUR (ex: 29.99)
 * @param {string}  opts.orderId  — identificador do pedido (para referência)
 * @param {number}  [opts.validDays=1] — dias de validade
 * @returns {Promise<{entity: string, reference: string, amount: number}>}
 */
export const createEupagoReference = async ({ amount, orderId, validDays = 1 }) => {
  const apiKey = process.env.EUPAGO_API_KEY;
  if (!apiKey) throw new Error('EUPAGO_API_KEY não definida no .env');

  const res = await fetch('https://clientes.eupago.pt/clientes/rest_api/multibanco/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `ApiKey ${apiKey}`,
    },
    body: JSON.stringify({
      payment_method: 'mb',
      amount: { currency: 'EUR', value: amount },
      customer: { notify: false },
      config: {
        generate_reference: true,
        days_due: validDays,
        identifier: orderId,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Eupago error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    entity: data.entity ?? process.env.EUPAGO_ENTITY,
    reference: data.reference,
    amount,
  };
};

// ============================================================
// Opção 2 — IFTHENPAY  (https://www.ifthenpay.com)
// ============================================================

/**
 * Cria uma referência Multibanco via Ifthenpay.
 * @param {object} opts
 * @param {number} opts.amount    — valor em EUR
 * @param {string} opts.orderId   — identificador do pedido
 * @param {string} [opts.expiryDate] — data de expiração 'DD-MM-YYYY' (default: amanhã)
 * @returns {Promise<{entity: string, reference: string, amount: number}>}
 */
export const createIfthenpayReference = async ({ amount, orderId, expiryDate }) => {
  const backofficeKey = process.env.IFTHENPAY_KEY;
  const entity = process.env.IFTHENPAY_ENTITY;
  const subEntidade = process.env.IFTHENPAY_SUBENTIDADE;
  if (!backofficeKey || !entity || !subEntidade) {
    throw new Error('Variáveis IFTHENPAY_KEY / IFTHENPAY_ENTITY / IFTHENPAY_SUBENTIDADE não definidas');
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultExpiry = `${String(tomorrow.getDate()).padStart(2, '0')}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${tomorrow.getFullYear()}`;

  const res = await fetch('https://ifthenpay.com/api/multibanco/reference/sandbox', {
    // Produção: https://ifthenpay.com/api/multibanco/reference/init
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      backofficeKey,
      entity,
      subEntidade,
      amount: amount.toFixed(2),
      orderId,
      expiryDate: expiryDate ?? defaultExpiry,
      description: `Pedido #${orderId}`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ifthenpay error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    entity: data.Entity ?? entity,
    reference: data.Reference,
    amount,
  };
};

// ============================================================
// Helper: formata referência para exibição (ex: "21724 123 456 789")
// ============================================================
export const formatMbReference = ({ entity, reference }) =>
  `${entity} ${reference}`.replace(/(.{5})(.{3})(.{3})(.{3})/, '$1 $2 $3 $4').trim();

// ============================================================
// COMO INTEGRAR em backend/server/index.mjs
// ============================================================
//
//   import { createEupagoReference, formatMbReference } from '../payments/multibanco.mjs';
//
//   // Dentro de POST /api/jewelry-orders, substituir:
//   //   const multibancoRef = safePayment === 'multibanco'
//   //     ? `21724 ${String(Math.floor(Math.random() * 999999999)).padStart(9, '0')}`
//   //     : null;
//   // Por:
//   let multibancoRef = null;
//   if (safePayment === 'multibanco') {
//     const mbData = await createEupagoReference({ amount: total, orderId });
//     multibancoRef = formatMbReference(mbData);
//   }
