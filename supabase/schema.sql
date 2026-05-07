-- =============================================================================
-- TitoVest — Schema Supabase/PostgreSQL
-- =============================================================================
-- Ordem de criação:
--   1. Utilitários (função updated_at)
--   2. profiles
--   3. monthly_data
--   4. transactions
--   5. fixed_costs
--   6. goals
--   7. investments
--   8. Índices
--   9. Row Level Security (RLS)
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. UTILITÁRIOS
-- -----------------------------------------------------------------------------

-- Função reutilizável para atualizar updated_at automaticamente em qualquer tabela
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------------------------------
-- 2. PROFILES
-- Extensão do usuário do Supabase Auth.
-- Criado automaticamente quando um novo usuário se registra.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- -----------------------------------------------------------------------------
-- 3. MONTHLY_DATA
-- Dados mensais do usuário: salário e reserva de emergência.
-- Um registro por usuário por mês — chave composta (user_id, month).
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS monthly_data (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month               char(7)     NOT NULL, -- formato: "2026-05"
  salary              numeric(12,2) NOT NULL DEFAULT 0,
  emergency_current   numeric(12,2) NOT NULL DEFAULT 0,
  emergency_target    numeric(12,2) NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  -- Um único registro por usuário/mês
  CONSTRAINT monthly_data_unique_user_month
    UNIQUE (user_id, month),

  -- Validação do formato do mês: YYYY-MM
  CONSTRAINT monthly_data_month_format
    CHECK (month ~ '^\d{4}-(0[1-9]|1[0-2])$'),

  -- Valores não podem ser negativos
  CONSTRAINT monthly_data_salary_non_negative
    CHECK (salary >= 0),

  CONSTRAINT monthly_data_emergency_non_negative
    CHECK (emergency_current >= 0 AND emergency_target >= 0)
);

CREATE TRIGGER monthly_data_updated_at
  BEFORE UPDATE ON monthly_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- -----------------------------------------------------------------------------
-- 4. TRANSACTIONS
-- Receitas e despesas do usuário, organizadas por mês.
-- O campo month é redundante mas garante filtros rápidos sem funções de data.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS transactions (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month       char(7)       NOT NULL, -- formato: "2026-05"
  name        text          NOT NULL CHECK (char_length(name) > 0),
  type        text          NOT NULL, -- 'in' ou 'out'
  amount      numeric(12,2) NOT NULL,
  occurred_at timestamptz   NOT NULL DEFAULT now(),
  created_at  timestamptz   NOT NULL DEFAULT now(),

  -- Tipo só pode ser entrada ou saída
  CONSTRAINT transactions_type_valid
    CHECK (type IN ('in', 'out')),

  -- Valor sempre positivo — o tipo determina a direção
  CONSTRAINT transactions_amount_positive
    CHECK (amount > 0),

  -- Validação do formato do mês
  CONSTRAINT transactions_month_format
    CHECK (month ~ '^\d{4}-(0[1-9]|1[0-2])$')
);


-- -----------------------------------------------------------------------------
-- 5. FIXED_COSTS
-- Custos fixos mensais: assinaturas, aluguel, academia, etc.
-- Escopados por mês para permitir variações ao longo do tempo.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fixed_costs (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month       char(7)       NOT NULL, -- formato: "2026-05"
  name        text          NOT NULL CHECK (char_length(name) > 0),
  amount      numeric(12,2) NOT NULL,
  due_day     smallint      NOT NULL, -- dia do mês: 1 a 31
  icon_name   text          NOT NULL DEFAULT 'CreditCard',
  created_at  timestamptz   NOT NULL DEFAULT now(),
  updated_at  timestamptz   NOT NULL DEFAULT now(),

  -- Valor sempre positivo
  CONSTRAINT fixed_costs_amount_positive
    CHECK (amount > 0),

  -- Dia de vencimento dentro do intervalo válido
  CONSTRAINT fixed_costs_due_day_range
    CHECK (due_day BETWEEN 1 AND 31),

  -- Ícones disponíveis no frontend (Lucide)
  CONSTRAINT fixed_costs_icon_valid
    CHECK (icon_name IN ('Zap', 'ShieldCheck', 'Wifi', 'MonitorPlay', 'CreditCard')),

  -- Validação do formato do mês
  CONSTRAINT fixed_costs_month_format
    CHECK (month ~ '^\d{4}-(0[1-9]|1[0-2])$')
);

CREATE TRIGGER fixed_costs_updated_at
  BEFORE UPDATE ON fixed_costs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- -----------------------------------------------------------------------------
-- 6. GOALS
-- Metas de poupança — globais (sem escopo de mês).
-- Uma meta persiste até ser concluída, independente do mês atual.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS goals (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            text          NOT NULL CHECK (char_length(name) > 0),
  target_amount   numeric(12,2) NOT NULL,
  current_amount  numeric(12,2) NOT NULL DEFAULT 0,
  completed_at    timestamptz,  -- NULL = em andamento; preenchido = concluída
  created_at      timestamptz   NOT NULL DEFAULT now(),
  updated_at      timestamptz   NOT NULL DEFAULT now(),

  -- Meta deve ter valor alvo positivo
  CONSTRAINT goals_target_positive
    CHECK (target_amount > 0),

  -- Valor atual não pode ser negativo
  CONSTRAINT goals_current_non_negative
    CHECK (current_amount >= 0),

  -- Valor atual não pode ultrapassar o alvo (conclusão encerra a meta)
  CONSTRAINT goals_current_lte_target
    CHECK (current_amount <= target_amount)
);

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- -----------------------------------------------------------------------------
-- 7. INVESTMENTS
-- Investimentos externos do usuário (USD, EUR, outros).
-- Escopados por mês — o valor em R$ é registrado no momento do lançamento.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS investments (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month       char(7)       NOT NULL, -- formato: "2026-05"
  type        text          NOT NULL, -- moeda/tipo do investimento
  name        text          NOT NULL CHECK (char_length(name) > 0),
  amount_brl  numeric(12,2) NOT NULL, -- valor em R$ (já convertido pelo frontend)
  created_at  timestamptz   NOT NULL DEFAULT now(),
  updated_at  timestamptz   NOT NULL DEFAULT now(),

  -- Tipos permitidos de investimento
  CONSTRAINT investments_type_valid
    CHECK (type IN ('Dólar (USD)', 'Euro (EUR)', 'Outros')),

  -- Valor deve ser positivo
  CONSTRAINT investments_amount_positive
    CHECK (amount_brl > 0),

  -- Validação do formato do mês
  CONSTRAINT investments_month_format
    CHECK (month ~ '^\d{4}-(0[1-9]|1[0-2])$')
);

CREATE TRIGGER investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =============================================================================
-- 8. ÍNDICES
-- Otimizam as queries mais comuns: busca por usuário e por mês.
-- =============================================================================

-- monthly_data: busca por usuário e mês
CREATE INDEX IF NOT EXISTS idx_monthly_data_user_month
  ON monthly_data (user_id, month);

-- transactions: busca por usuário + mês (filtro principal)
CREATE INDEX IF NOT EXISTS idx_transactions_user_month
  ON transactions (user_id, month);

-- transactions: ordenação cronológica por ocorrência
CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at
  ON transactions (user_id, occurred_at DESC);

-- fixed_costs: busca por usuário + mês
CREATE INDEX IF NOT EXISTS idx_fixed_costs_user_month
  ON fixed_costs (user_id, month);

-- goals: busca por usuário, separando ativas das concluídas
CREATE INDEX IF NOT EXISTS idx_goals_user_id
  ON goals (user_id);

CREATE INDEX IF NOT EXISTS idx_goals_completed_at
  ON goals (user_id, completed_at)
  WHERE completed_at IS NULL; -- índice parcial: só metas ativas

-- investments: busca por usuário + mês
CREATE INDEX IF NOT EXISTS idx_investments_user_month
  ON investments (user_id, month);


-- =============================================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- Habilita RLS em todas as tabelas.
-- As policies e o trigger de auto-criação de profile estão em rls.sql.
-- Executar rls.sql após este arquivo.
-- =============================================================================

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_costs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments   ENABLE ROW LEVEL SECURITY;
