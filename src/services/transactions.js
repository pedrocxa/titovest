import { supabase } from '../lib/supabase'

// ---------------------------------------------------------------------------
// MAPEAMENTO: DB → Frontend
//
// O frontend atual espera esta shape:
//   { id, name, amount, type, time, status }
//
// O banco armazena:
//   { id, user_id, month, name, amount, type, occurred_at }
//
// Campos legado mantidos por compatibilidade temporária:
//   - time:   derivado de occurred_at (apenas HH:MM). Será removido quando
//             o frontend passar a consumir occurred_at diretamente.
//   - status: sempre 'Concluído'. Não é persistido no banco. Será removido
//             quando o frontend eliminar a dependência deste campo.
// ---------------------------------------------------------------------------

function toFrontendShape(record) {
  return {
    id:     record.id,
    name:   record.name,
    amount: record.amount,
    type:   record.type,

    // LEGADO TEMPORÁRIO — derivado de occurred_at para compatibilidade
    time: new Date(record.occurred_at).toLocaleTimeString('pt-BR', {
      hour:   '2-digit',
      minute: '2-digit',
    }),

    // LEGADO TEMPORÁRIO — campo morto, nunca persistido no banco
    status: 'Concluído',
  }
}

// ---------------------------------------------------------------------------
// getTransactions
//
// Retorna todas as transações do usuário em um determinado mês,
// ordenadas da mais recente para a mais antiga.
//
// @param {string} userId  — UUID do usuário autenticado
// @param {string} month   — Mês no formato 'YYYY-MM' (ex: '2026-05')
// @returns {{ data: Array|null, error: string|null }}
// ---------------------------------------------------------------------------

export async function getTransactions(userId, month) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, name, amount, type, occurred_at')
      .eq('user_id', userId)
      .eq('month', month)
      .order('occurred_at', { ascending: false })

    if (error) throw error

    return { data: data.map(toFrontendShape), error: null }
  } catch (err) {
    console.error('[transactions] getTransactions:', err.message)
    return { data: null, error: err.message }
  }
}

// ---------------------------------------------------------------------------
// createTransaction
//
// Insere uma nova transação no banco e retorna o registro criado
// no formato que o frontend já consome.
//
// @param {{
//   userId:      string,
//   month:       string,       — 'YYYY-MM'
//   name:        string,       — descrição
//   amount:      number,       — valor positivo
//   type:        'in'|'out',
//   occurredAt?: Date          — padrão: agora
// }} payload
//
// @returns {{ data: Object|null, error: string|null }}
// ---------------------------------------------------------------------------

export async function createTransaction({ userId, month, name, amount, type, occurredAt }) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id:     userId,
        month,
        name,
        amount,
        type,
        occurred_at: (occurredAt ?? new Date()).toISOString(),
      })
      .select('id, name, amount, type, occurred_at')
      .single()

    if (error) throw error

    return { data: toFrontendShape(data), error: null }
  } catch (err) {
    console.error('[transactions] createTransaction:', err.message)
    return { data: null, error: err.message }
  }
}

// ---------------------------------------------------------------------------
// deleteTransaction
//
// Remove uma transação pelo seu ID.
// A RLS garante que apenas o dono do registro pode deletá-lo.
//
// @param {string} id — UUID da transação
// @returns {{ error: string|null }}
// ---------------------------------------------------------------------------

export async function deleteTransaction(id) {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) throw error

    return { error: null }
  } catch (err) {
    console.error('[transactions] deleteTransaction:', err.message)
    return { error: err.message }
  }
}
