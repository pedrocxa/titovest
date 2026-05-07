-- =============================================================================
-- TitoVest — Segurança: Trigger de Profile + RLS Policies
-- =============================================================================
-- Pré-requisito: schema.sql já executado.
--
-- Ordem de execução:
--   1. Trigger de auto-criação de profile (auth.users → profiles)
--   2. Policies de profiles
--   3. Policies de monthly_data
--   4. Policies de transactions
--   5. Policies de fixed_costs
--   6. Policies de goals
--   7. Policies de investments
-- =============================================================================


-- =============================================================================
-- 1. TRIGGER: AUTO-CRIAÇÃO DE PROFILE
--
-- Quando um usuário se registra via Supabase Auth, um registro é criado
-- automaticamente em public.profiles sem intervenção do frontend.
--
-- SECURITY DEFINER: a função roda com privilégios do dono (postgres),
-- ignorando o RLS de profiles — necessário pois o novo usuário ainda
-- não possui auth.uid() válido no momento do INSERT em auth.users.
--
-- SET search_path = '': previne ataques de search_path injection em
-- funções SECURITY DEFINER (boa prática obrigatória no Supabase).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', '')
  );
  RETURN NEW;
EXCEPTION
  -- Garante que falha na criação do profile não bloqueie o cadastro
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: erro ao criar profile para uid=%: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Impede que usuários comuns chamem a função diretamente
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Dispara após cada novo usuário criado no Supabase Auth
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- =============================================================================
-- 2. POLICIES: PROFILES
--
-- INSERT: feito exclusivamente pelo trigger acima (SECURITY DEFINER).
--         Não existe policy de INSERT — nenhum cliente pode inserir diretamente.
-- DELETE: não permitido via client — exclusão de conta é gerenciada
--         pelo Supabase Auth (que propaga via ON DELETE CASCADE).
-- =============================================================================

-- Leitura: somente o próprio usuário vê seu profile
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (id = auth.uid());

-- Atualização: somente o próprio usuário edita seu profile (ex: nome)
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING     (id = auth.uid())   -- garante que o registro pertence ao usuário
  WITH CHECK (id = auth.uid()); -- garante que o novo valor também pertence


-- =============================================================================
-- 3. POLICIES: MONTHLY_DATA
-- =============================================================================

CREATE POLICY "monthly_data_select_own"
  ON public.monthly_data
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "monthly_data_insert_own"
  ON public.monthly_data
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "monthly_data_update_own"
  ON public.monthly_data
  FOR UPDATE
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "monthly_data_delete_own"
  ON public.monthly_data
  FOR DELETE
  USING (user_id = auth.uid());


-- =============================================================================
-- 4. POLICIES: TRANSACTIONS
-- =============================================================================

CREATE POLICY "transactions_select_own"
  ON public.transactions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "transactions_insert_own"
  ON public.transactions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "transactions_update_own"
  ON public.transactions
  FOR UPDATE
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "transactions_delete_own"
  ON public.transactions
  FOR DELETE
  USING (user_id = auth.uid());


-- =============================================================================
-- 5. POLICIES: FIXED_COSTS
-- =============================================================================

CREATE POLICY "fixed_costs_select_own"
  ON public.fixed_costs
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "fixed_costs_insert_own"
  ON public.fixed_costs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "fixed_costs_update_own"
  ON public.fixed_costs
  FOR UPDATE
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "fixed_costs_delete_own"
  ON public.fixed_costs
  FOR DELETE
  USING (user_id = auth.uid());


-- =============================================================================
-- 6. POLICIES: GOALS
-- =============================================================================

CREATE POLICY "goals_select_own"
  ON public.goals
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "goals_insert_own"
  ON public.goals
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "goals_update_own"
  ON public.goals
  FOR UPDATE
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "goals_delete_own"
  ON public.goals
  FOR DELETE
  USING (user_id = auth.uid());


-- =============================================================================
-- 7. POLICIES: INVESTMENTS
-- =============================================================================

CREATE POLICY "investments_select_own"
  ON public.investments
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "investments_insert_own"
  ON public.investments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "investments_update_own"
  ON public.investments
  FOR UPDATE
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "investments_delete_own"
  ON public.investments
  FOR DELETE
  USING (user_id = auth.uid());
