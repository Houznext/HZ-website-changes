-- Rollback for invoice GST refactor
-- WARNING: Re-adds legacy items JSON from invoice_items where possible

ALTER TABLE invoice_estimator ADD COLUMN IF NOT EXISTS items jsonb;
ALTER TABLE invoice_estimator ADD COLUMN IF NOT EXISTS "subTotal" numeric(10,2);

UPDATE invoice_estimator inv
SET items = sub.items_json
FROM (
  SELECT
    invoice_id,
    jsonb_agg(
      jsonb_build_object(
        'item_name', item_name,
        'description', description,
        'quantity', COALESCE(quantity, 1),
        'price', COALESCE(unit_price, rate_per_unit, 0),
        'area', COALESCE(area_value, 1)
      ) ORDER BY sort_order
    ) AS items_json
  FROM invoice_items
  GROUP BY invoice_id
) sub
WHERE inv.id = sub.invoice_id;

UPDATE invoice_estimator
SET "subTotal" = grand_total
WHERE "subTotal" IS NULL;

DROP TABLE IF EXISTS invoice_audit_log;
DROP TABLE IF EXISTS invoice_payments;
DROP TABLE IF EXISTS invoice_items;

-- New columns left in place for safety; drop manually if needed:
-- ALTER TABLE invoice_estimator DROP COLUMN IF EXISTS status;
-- ... etc
