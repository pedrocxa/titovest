import { supabase } from '../lib/supabase'

// ---------------------------------------------------------------------------
// MAPEAMENTO: DB → Frontend
//
// O banco armazena:
//   { id, user_id, month, name, amount, due_day, icon_name }
//
// O frontend consome:
//   { id, name, amount, due, iconName }
//
// Conversões:
//   due_day (smallint 1–31) → due (string zero-padded, ex: '01', '15')
//   icon_name               → iconName
// ---------------------------------------------------------------------------

function toFrontendShape(record) {
  return {
    id:       record.id,
    name:     record.name,
    amount:   record.amount,
    due:      String(record.due_day).padStart(2, '0'),
    iconName: record.icon_name,
  }
}

function toDbShape({ userId, month, name, amount, dueDay, iconName }) {
  return {
    user_id:   userId,
    month,
    name,
    amount,
    due_day:   Number(dueDay),
    icon_name: iconName,
  }
}

// ---------------------------------------------------------------------------
// getFixedCosts
//
// Retorna todos os custos fixos do usuário em um determinado mês,
// ordenados pelo dia de vencimento (ascendente).
//
// @param {string} userId  — UUID do usuário autenticado
// @param {string} month   — Mês no formato 'YYYY-MM' (ex: '2026-05')
// @returns {{ data: Array|null, error: string|null }}
// ---------------------------------------------------------------------------

export async function getFixedCosts(userId, month) {
  try {
    const { data, error } = await supabase
      .from('fixed_costs')
      .select('id, name, amount, due_day, icon_name')
      .eq('user_id', userId)
      .eq('month', month)
      .order('due_day', { ascending: true })

    if (error) throw error

    return { data: data.map(toFrontendShape), error: null }
  } catch (err) {
    console.error('[fixedCosts] getFixedCosts:', err.message)
    return { data: null, error: err.message }
  }
}

// ---------------------------------------------------------------------------
// createFixedCost
//
// Insere um novo custo fixo no banco e retorna o registro criado
// no formato que o frontend já consome.
//
// @param {{
//   userId:   string,
//   month:    string,    — 'YYYY-MM'
//   name:     string,
//   amount:   number,
//   dueDay:   number,   — dia do mês (1–31)
//   iconName: string,   — deve ser um dos valores aceitos pelo DB
// }} payload
//
// @returns {{ data: Object|null, error: string|null }}
// ---------------------------------------------------------------------------

export async function createFixedCost(payload) {
  try {
    const { data, error } = await supabase
      .from('fixed_costs')
      .insert(toDbShape(payload))
      .select('id, name, amount, due_day, icon_name')
      .single()

    if (error) throw error

    return { data: toFrontendShape(data), error: null }
  } catch (err) {
    console.error('[fixedCosts] createFixedCost:', err.message)
    return { data: null, error: err.message }
  }
}

// ---------------------------------------------------------------------------
// deleteFixedCost
//
// Remove um custo fixo pelo seu ID.
// A RLS garante que apenas o dono do registro pode deletá-lo.
//
// @param {string} id — UUID do custo fixo
// @returns {{ error: string|null }}
// ---------------------------------------------------------------------------

export async function deleteFixedCost(id) {
  try {
    const { error } = await supabase
      .from('fixed_costs')
      .delete()
      .eq('id', id)

    if (error) throw error

    return { error: null }
  } catch (err) {
    console.error('[fixedCosts] deleteFixedCost:', err.message)
    return { error: err.message }
  }
}
