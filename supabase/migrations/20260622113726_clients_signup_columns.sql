-- Capture the plan selection from the sign-up wizard. Two columns so we
-- can stash the chosen plan + billing period until Stripe is wired up.
alter table public.clients add column if not exists selected_plan text;
alter table public.clients add column if not exists selected_billing_period text;
