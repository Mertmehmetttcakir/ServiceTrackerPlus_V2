-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  vehicle_id uuid NOT NULL,
  technician_id uuid,
  service_type text NOT NULL,
  appointment_date timestamp with time zone NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'in-progress'::text, 'completed'::text, 'cancelled'::text])),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  total_cost numeric DEFAULT 0.00,
  amount_paid numeric DEFAULT 0.00,
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT appointments_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id),
  CONSTRAINT appointments_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.technicians(id)
);
CREATE TABLE public.company_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  email character varying NOT NULL CHECK (email::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'::text),
  phone character varying NOT NULL CHECK (phone::text ~ '^[\+]?[0-9\(\)\-\s]+$'::text),
  address text NOT NULL,
  city character varying NOT NULL,
  postal_code character varying,
  country character varying NOT NULL DEFAULT 'Türkiye'::character varying,
  tax_number character varying,
  logo_url text,
  website character varying,
  working_hours jsonb DEFAULT '{"friday": {"end": "18:00", "start": "09:00", "closed": false}, "monday": {"end": "18:00", "start": "09:00", "closed": false}, "sunday": {"end": "16:00", "start": "10:00", "closed": true}, "tuesday": {"end": "18:00", "start": "09:00", "closed": false}, "saturday": {"end": "17:00", "start": "09:00", "closed": false}, "thursday": {"end": "18:00", "start": "09:00", "closed": false}, "wednesday": {"end": "18:00", "start": "09:00", "closed": false}}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT company_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT company_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by_admin_id uuid DEFAULT auth.uid(),
  CONSTRAINT customers_pkey PRIMARY KEY (id),
  CONSTRAINT customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT customers_created_by_admin_id_fkey FOREIGN KEY (created_by_admin_id) REFERENCES auth.users(id)
);
CREATE TABLE public.error_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  error_type text NOT NULL,
  message text NOT NULL,
  stack_trace text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT error_logs_pkey PRIMARY KEY (id),
  CONSTRAINT error_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.financial_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  vehicle_id uuid,
  appointment_id uuid,
  transaction_type text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0::numeric),
  description text,
  transaction_date timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  job_id uuid,
  CONSTRAINT financial_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT financial_transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT financial_transactions_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id),
  CONSTRAINT financial_transactions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id),
  CONSTRAINT financial_transactions_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id)
);
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  service_history_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  invoice_number text NOT NULL,
  invoice_date timestamp with time zone NOT NULL,
  total_amount numeric NOT NULL,
  tax_amount numeric NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'cancelled'::text])),
  payment_method text,
  payment_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_service_history_id_fkey FOREIGN KEY (service_history_id) REFERENCES public.service_history(id),
  CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  vehicle_id uuid,
  job_description text NOT NULL,
  job_date timestamp with time zone NOT NULL DEFAULT now(),
  total_cost numeric NOT NULL CHECK (total_cost >= 0::numeric),
  status text NOT NULL DEFAULT 'Açık'::text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT jobs_pkey PRIMARY KEY (id),
  CONSTRAINT jobs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT jobs_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id)
);
CREATE TABLE public.service_history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  appointment_id uuid NOT NULL,
  vehicle_id uuid NOT NULL,
  technician_id uuid,
  service_date timestamp with time zone NOT NULL,
  service_type text NOT NULL,
  description text,
  cost numeric,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'in-progress'::text, 'completed'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT service_history_pkey PRIMARY KEY (id),
  CONSTRAINT service_history_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id),
  CONSTRAINT service_history_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id),
  CONSTRAINT service_history_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.technicians(id)
);
CREATE TABLE public.service_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  service_history_id uuid NOT NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT service_items_pkey PRIMARY KEY (id),
  CONSTRAINT service_items_service_history_id_fkey FOREIGN KEY (service_history_id) REFERENCES public.service_history(id)
);
CREATE TABLE public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  language character varying NOT NULL DEFAULT 'tr'::character varying CHECK (language::text = ANY (ARRAY['tr'::character varying, 'en'::character varying]::text[])),
  timezone character varying NOT NULL DEFAULT 'Europe/Istanbul'::character varying,
  currency character varying NOT NULL DEFAULT 'TRY'::character varying CHECK (currency::text = ANY (ARRAY['TRY'::character varying, 'USD'::character varying, 'EUR'::character varying]::text[])),
  date_format character varying NOT NULL DEFAULT 'DD/MM/YYYY'::character varying CHECK (date_format::text = ANY (ARRAY['DD/MM/YYYY'::character varying, 'MM/DD/YYYY'::character varying, 'YYYY-MM-DD'::character varying]::text[])),
  records_per_page integer NOT NULL DEFAULT 25 CHECK (records_per_page >= 10 AND records_per_page <= 100),
  email_notifications boolean NOT NULL DEFAULT true,
  sms_notifications boolean NOT NULL DEFAULT false,
  appointment_reminders boolean NOT NULL DEFAULT true,
  payment_reminders boolean NOT NULL DEFAULT true,
  session_timeout integer NOT NULL DEFAULT 60 CHECK (session_timeout >= 15 AND session_timeout <= 480),
  auto_logout boolean NOT NULL DEFAULT true,
  auto_backup boolean NOT NULL DEFAULT true,
  backup_frequency character varying NOT NULL DEFAULT 'weekly'::character varying CHECK (backup_frequency::text = ANY (ARRAY['daily'::character varying, 'weekly'::character varying, 'monthly'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT system_settings_pkey PRIMARY KEY (id),
  CONSTRAINT system_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.technicians (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  specialization ARRAY,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT technicians_pkey PRIMARY KEY (id),
  CONSTRAINT technicians_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  full_name text,
  phone text,
  role text CHECK (role = ANY (ARRAY['admin'::text, 'manager'::text, 'technician'::text, 'customer'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  email text,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'suspended'::text])),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.vehicles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  plate text NOT NULL,
  vin text,
  color text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  notes text,
  CONSTRAINT vehicles_pkey PRIMARY KEY (id),
  CONSTRAINT vehicles_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);