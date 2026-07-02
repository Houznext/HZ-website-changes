-- Invoice GST refactor — forward migration
-- Run after deploying new entities (TypeORM sync adds columns/tables)

-- ── 1. Backfill bill_to_mobile from customerMobile ──
UPDATE invoice_estimator
SET bill_to_mobile = customerMobile
WHERE bill_to_mobile IS NULL AND customerMobile IS NOT NULL;

-- ── 2. Copy subTotal → subtotal / grand_total for legacy rows ──
UPDATE invoice_estimator
SET
  subtotal = COALESCE(subtotal, 0),
  grand_total = CASE
    WHEN COALESCE(grand_total, 0) = 0 THEN COALESCE("subTotal", subtotal, 0)
    ELSE grand_total
  END,
  balance_due = CASE
    WHEN COALESCE(balance_due, 0) = 0 THEN COALESCE("subTotal", subtotal, 0)
    ELSE balance_due
  END,
  taxable_value = CASE
    WHEN COALESCE(taxable_value, 0) = 0 THEN COALESCE("subTotal", subtotal, 0)
    ELSE taxable_value
  END,
  status = COALESCE(status, 'paid'),
  invoice_type = COALESCE(invoice_type, 'interiors'),
  ship_to_same_as_bill = COALESCE(ship_to_same_as_bill, true)
WHERE id IS NOT NULL;

-- ── 3. Migrate legacy JSON items → invoice_items (skip if already migrated) ──
INSERT INTO invoice_items (
  id,
  invoice_id,
  sort_order,
  group_name,
  item_name,
  description,
  hsn_sac_code,
  pricing_mode,
  quantity,
  unit_label,
  unit_price,
  area_value,
  area_unit,
  rate_per_unit,
  gross_amount,
  item_discount_amount,
  taxable_amount,
  gst_rate,
  gst_amount,
  cgst_amount,
  sgst_amount,
  igst_amount,
  line_total,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  inv.id,
  (row_number() OVER (PARTITION BY inv.id ORDER BY ordinality) - 1)::int,
  'General',
  COALESCE(item->>'item_name', 'Item'),
  item->>'description',
  NULL,
  CASE
    WHEN COALESCE((item->>'area')::numeric, 1) > 1 THEN 'area'
    ELSE 'unit'
  END,
  CASE
    WHEN COALESCE((item->>'area')::numeric, 1) > 1 THEN NULL
    ELSE COALESCE((item->>'quantity')::numeric, 1)
  END,
  CASE WHEN COALESCE((item->>'area')::numeric, 1) <= 1 THEN 'nos' ELSE NULL END,
  CASE
    WHEN COALESCE((item->>'area')::numeric, 1) <= 1 THEN COALESCE((item->>'price')::numeric, 0)
    ELSE NULL
  END,
  CASE
    WHEN COALESCE((item->>'area')::numeric, 1) > 1 THEN COALESCE((item->>'area')::numeric, 1)
    ELSE NULL
  END,
  CASE WHEN COALESCE((item->>'area')::numeric, 1) > 1 THEN 'sqft' ELSE NULL END,
  CASE
    WHEN COALESCE((item->>'area')::numeric, 1) > 1 THEN COALESCE((item->>'price')::numeric, 0)
    ELSE NULL
  END,
  CASE
    WHEN COALESCE((item->>'area')::numeric, 1) > 1 THEN
      ROUND(COALESCE((item->>'area')::numeric, 1) * COALESCE((item->>'price')::numeric, 0), 2)
    ELSE
      ROUND(COALESCE((item->>'quantity')::numeric, 1) * COALESCE((item->>'price')::numeric, 0), 2)
  END,
  0,
  CASE
    WHEN COALESCE((item->>'area')::numeric, 1) > 1 THEN
      ROUND(COALESCE((item->>'area')::numeric, 1) * COALESCE((item->>'price')::numeric, 0), 2)
    ELSE
      ROUND(COALESCE((item->>'quantity')::numeric, 1) * COALESCE((item->>'price')::numeric, 0), 2)
  END,
  0,
  0, 0, 0, 0,
  CASE
    WHEN COALESCE((item->>'area')::numeric, 1) > 1 THEN
      ROUND(COALESCE((item->>'area')::numeric, 1) * COALESCE((item->>'price')::numeric, 0), 2)
    ELSE
      ROUND(COALESCE((item->>'quantity')::numeric, 1) * COALESCE((item->>'price')::numeric, 0), 2)
  END,
  NOW(),
  NOW()
FROM invoice_estimator inv
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(inv.items, '[]'::jsonb)) WITH ORDINALITY AS t(item, ordinality)
WHERE inv.items IS NOT NULL
  AND jsonb_array_length(inv.items) > 0
  AND NOT EXISTS (SELECT 1 FROM invoice_items ii WHERE ii.invoice_id = inv.id);

-- ── 4. Default supplier snapshot for rows missing it ──
UPDATE invoice_estimator
SET
  supplier_name = COALESCE(NULLIF(supplier_name, ''), 'Houznext Interiors Pvt Ltd'),
  supplier_state = COALESCE(NULLIF(supplier_state, ''), 'Telangana'),
  supplier_state_code = COALESCE(NULLIF(supplier_state_code, ''), '36')
WHERE supplier_name IS NULL OR supplier_name = '';

-- ── 5. Verification query (run manually — expect 0 rows) ──
-- SELECT inv.id FROM invoice_estimator inv
-- WHERE inv.items IS NOT NULL AND jsonb_array_length(inv.items) > 0
--   AND NOT EXISTS (SELECT 1 FROM invoice_items ii WHERE ii.invoice_id = inv.id);

-- ── 6. Drop legacy columns (ONLY after verification) ──
-- ALTER TABLE invoice_estimator DROP COLUMN IF EXISTS items;
-- ALTER TABLE invoice_estimator DROP COLUMN IF EXISTS "subTotal";
