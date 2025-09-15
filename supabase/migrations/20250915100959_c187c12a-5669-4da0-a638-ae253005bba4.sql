-- Fix subscription data for bonioni.jeremy@gmail.com
UPDATE profiles 
SET 
  subscription_tier = 'pro',
  subscription_status = 'active',
  stripe_customer_id = 'cus_T3doADJPMuNbIe',
  stripe_subscription_id = 'sub_1S7WX2CwKhElNdgff5kqTniZ',
  stripe_product_id = 'prod_T3HDpk4FpT8mnu',
  current_period_end = '2025-02-26T04:02:17.000Z',
  updated_at = now()
WHERE email = 'bonioni.jeremy@gmail.com';

-- Add some logging to confirm the update
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % user profile(s) for subscription sync', updated_count;
END $$;