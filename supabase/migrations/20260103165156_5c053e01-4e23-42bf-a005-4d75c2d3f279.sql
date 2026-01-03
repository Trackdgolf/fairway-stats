-- Add RevenueCat columns to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS revenuecat_customer_id text,
ADD COLUMN IF NOT EXISTS revenuecat_product_id text;