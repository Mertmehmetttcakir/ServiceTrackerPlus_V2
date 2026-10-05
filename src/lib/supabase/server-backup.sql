-- Supabase Storage + Server-side Backup Altyapısı

-- 1) Backups bucket'ını oluştur
-- Not: Daha önce oluşturduysanız ikinci kez çalıştırmak sorun çıkarmaz.
select
  storage.create_bucket(
    bucket_id := 'backups',
    public := false,
    file_size_limit := 1024 * 1024 * 20 -- 20 MB
  )
where
  not exists (
    select 1 from storage.buckets where id = 'backups'
  );

-- 2) RLS: Sadece service role (Edge Function) yazabilsin
alter table storage.objects enable row level security;

drop policy if exists "backups_service_role_full_access" on storage.objects;
create policy "backups_service_role_full_access"
on storage.objects
for all
using (
  bucket_id = 'backups'
  and auth.role() = 'service_role'
)
with check (
  bucket_id = 'backups'
  and auth.role() = 'service_role'
);

-- İsteğe bağlı: Admin kullanıcıların panelden listeleyebilmesi için ayrı bir SELECT policy eklenebilir.


-- 3) Belirli bir kullanıcı için tam JSON backup üreten fonksiyon

create or replace function public.get_user_full_backup(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customers jsonb;
  v_vehicles jsonb;
  v_appointments jsonb;
  v_financial jsonb;
  v_history jsonb;
  v_settings jsonb;
  v_profile jsonb;
  v_jobs jsonb;
begin
  -- Müşteriler
  select coalesce(jsonb_agg(c), '[]'::jsonb)
  into v_customers
  from customers c
  where c.user_id = p_user_id;

  -- Araçlar
  select coalesce(jsonb_agg(v), '[]'::jsonb)
  into v_vehicles
  from vehicles v
  where v.user_id = p_user_id;

  -- Randevular
  select coalesce(jsonb_agg(a), '[]'::jsonb)
  into v_appointments
  from appointments a
  where a.user_id = p_user_id;

  -- Finansal işlemler
  select coalesce(jsonb_agg(f), '[]'::jsonb)
  into v_financial
  from financial_transactions f
  where f.user_id = p_user_id;

  -- Servis geçmişi
  select coalesce(jsonb_agg(sh), '[]'::jsonb)
  into v_history
  from service_history sh
  where sh.user_id = p_user_id;

  -- Sistem ayarları
  select coalesce(jsonb_agg(s), '[]'::jsonb)
  into v_settings
  from system_settings s
  where s.user_id = p_user_id;

  -- Kullanıcı profili
  select coalesce(jsonb_agg(up), '[]'::jsonb)
  into v_profile
  from user_profiles up
  where up.id = p_user_id;

  -- Müşterilere bağlı işler
  select coalesce(jsonb_agg(j), '[]'::jsonb)
  into v_jobs
  from jobs j
  where j.customer_id in (
    select id from customers where user_id = p_user_id
  );

  return jsonb_build_object(
    'generated_at', now(),
    'user_id', p_user_id,
    'version', '1.0.0',
    'tables', jsonb_build_object(
      'customers', v_customers,
      'vehicles', v_vehicles,
      'jobs', v_jobs,
      'appointments', v_appointments,
      'financial_transactions', v_financial,
      'service_history', v_history,
      'system_settings', v_settings,
      'user_profiles', v_profile
    )
  );
end;
$$;


