import { supabase } from '../lib/supabase'

// ---------------------------------------------------------------------------
// MAPEAMENTO: DB → Frontend
//
// O banco armazena:
//   { id, user_id, month, salary, emergency_current, emergency_target }
//
// O frontend consume:
//   { salary, emergencyFund: { current, target } }
//
// A conversão é feita nos helpers abaixo para manter os serviços
// agnósticos à shape interna do componente.
// ---------------------------------------------------------------------------

function toFrontendShape(record) {
  return {
    salary: record.salary ?? 0,
    emergencyFund: {
      current: record.emergency_current ?? 0,
      target:  record.emergency_target  ?? 0,
    },
  }
}

function toDbShape({ userId, month, salary, emergencyCurrent, emergencyTarget }) {
  return {
    user_id:           userId,
    month,
    salary:            salary            ?? 0,
    emergency_current: emergencyCurrent  ?? 0,
    emergency_target:  emergencyTarget   ?? 0,
  }
}

// ---------------------------------------------------------------------------
// getMonthlyData
//
// Busca os dados mensais (salário e reserva de emergência) de um usuário
// para um mês específico. Retorna null em data quando o mês ainda não
// tem registro — estado normal no primeiro uso.
//
// @param {string} userId  — UUID do usuário autenticado
// @param {string} month   — formato 'YYYY-MM' (ex: '2026-05')
// @returns {{ data: Object|null, error: string|null }}
// ---------------------------------------------------------------------------

export async function getMonthlyData(userId, month) {
  try {
    const { data, error } = await supabase
      .from('monthly_data')
      .select('salary, emergency_current, emergency_target')
      .eq('user_id', userId)
      .eq('month', month)
      .maybeSingle()

    if (error) throw error

    return {
      data:  data ? toFrontendShape(data) : null,
      error: null,
    }
  } catch (err) {
    console.error('[monthlyData] getMonthlyData:', err.message)
    return { data: null, error: err.message }
  }
}

// ---------------------------------------------------------------------------
// upsertMonthlyData
//
// Cria ou atualiza os dados mensais do usuário.
// O conflito é resolvido pela chave única (user_id, month):
//   - se não existir registro → INSERT
//   - se já existir           → UPDATE dos campos fornecidos
//
// @param {{
//   userId:           string,
//   month:            string,   — 'YYYY-MM'
//   salary:           number,
//   emergencyCurrent: number,
//   emergencyTarget:  number,
// }} payload
//
// @returns {{ data: Object|null, error: string|null }}
// ---------------------------------------------------------------------------

export async function upsertMonthlyData(payload) {
  try {
    const { data, error } = await supabase
      .from('monthly_data')
      .upsert(toDbShape(payload), { onConflict: 'user_id,month' })
      .select('salary, emergency_current, emergency_target')
      .single()

    if (error) throw error

    return { data: toFrontendShape(data), error: null }
  } catch (err) {
    console.error('[monthlyData] upsertMonthlyData:', err.message)
    return { data: null, error: err.message }
  }
}
