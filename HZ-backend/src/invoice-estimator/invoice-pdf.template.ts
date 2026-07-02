/** PDF styles — matches houznext_admin_invoice_pdf_design.html */
export const INVOICE_PDF_STYLES = `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;font-size:11px;color:#1f2933;background:#fff}
.pg{width:100%;background:#fff}
.mf{font-family:'Montserrat',sans-serif;letter-spacing:-.005em}
.header{background:#0f2a44;color:#fff;padding:22px 26px;display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
.h-l{display:flex;flex-direction:column;gap:7px}
.h-brand{display:flex;align-items:center;gap:9px}
.h-logo-img{height:44px;width:auto;max-width:210px;object-fit:contain;display:block}
.h-name{font-family:'Montserrat',sans-serif;font-size:20px;font-weight:800;letter-spacing:-.015em}
.h-tag{font-size:8.5px;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:.12em;font-family:'Montserrat',sans-serif;font-weight:600}
.h-contact{font-size:10.5px;color:rgba(255,255,255,.85);margin-top:6px;display:flex;flex-direction:column;gap:2px}
.h-r{text-align:right}
.h-doctype{font-size:9px;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:.14em;font-family:'Montserrat',sans-serif;font-weight:700;margin-bottom:6px}
.h-no{font-family:'Montserrat',sans-serif;font-size:30px;font-weight:800;letter-spacing:-.02em;line-height:1;margin-bottom:5px}
.h-meta{font-size:10px;color:rgba(255,255,255,.65);margin-top:6px;display:flex;flex-direction:column;gap:2px;text-align:right}
.h-status{display:inline-flex;align-items:center;gap:4px;font-size:9.5px;font-weight:700;font-family:'Montserrat',sans-serif;padding:3px 10px;border-radius:20px;margin-top:6px}
.h-status-paid{background:rgba(242,153,74,.18);color:#f2994a}
.h-status-partial{background:rgba(217,119,6,.18);color:#d97706}
.h-status-overdue{background:rgba(220,38,38,.18);color:#dc2626}
.h-status-due{background:rgba(47,128,237,.18);color:#93c5fd}
.parties{padding:18px 26px;background:#f8fafc;border-bottom:0.5px solid #e2e8f0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px}
.party-l{font-size:8.5px;font-weight:700;color:#5a6a7e;text-transform:uppercase;letter-spacing:.1em;font-family:'Montserrat',sans-serif;margin-bottom:5px}
.party-n{font-family:'Montserrat',sans-serif;font-size:13px;font-weight:800;color:#1f2933;margin-bottom:4px;letter-spacing:-.01em}
.party-d{font-size:10px;color:#5a6a7e;line-height:1.55}
.party-d strong{color:#1f2933;font-weight:600}
.scope{padding:18px 26px 9px}
.scope-h{font-size:9px;font-weight:700;color:#5a6a7e;text-transform:uppercase;letter-spacing:.12em;font-family:'Montserrat',sans-serif;margin-bottom:11px}
.tbl{width:100%;border-collapse:collapse;font-size:10px}
.tbl thead{display:table-header-group}
.tbl thead th{background:#f8fafc;padding:9px 8px;text-align:left;font-size:8.5px;font-weight:700;color:#5a6a7e;text-transform:uppercase;letter-spacing:.06em;font-family:'Montserrat',sans-serif;border-bottom:1px solid #e2e8f0}
.tbl thead th.right{text-align:right}
.tbl tbody td{padding:9px 8px;border-bottom:0.5px solid #f1f5f9;vertical-align:top}
.tbl tbody td.right{text-align:right;font-family:'Montserrat',sans-serif;font-weight:700;font-size:10.5px}
.tbl tbody td.amt{color:#2f80ed;font-family:'Montserrat',sans-serif;font-weight:700;font-size:10.5px;text-align:right}
.row-grp td{background:#f8fafc;padding:7px 8px;font-family:'Montserrat',sans-serif;font-size:9.5px;font-weight:700;color:#1f2933;letter-spacing:.05em;text-transform:uppercase}
.row-num{color:#5a6a7e;font-size:9px;font-family:'Montserrat',sans-serif;font-weight:600}
.item-name{font-weight:700;color:#1f2933;font-size:10.5px}
.item-desc{font-size:9.5px;color:#5a6a7e;margin-top:1px}
.totals-wrap{page-break-inside:avoid;break-inside:avoid}
.totals-box{margin:20px 26px;background:#0f2a44;color:#fff;border-radius:10px;padding:16px 18px}
.tot-r{display:flex;justify-content:space-between;padding:5px 0;font-size:11px;color:rgba(255,255,255,.75)}
.tot-r .v{font-family:'Montserrat',sans-serif;font-weight:700;color:#fff}
.tot-r.disc .v{color:#fbbf77}
.divider{height:0.5px;background:rgba(255,255,255,.18);margin:8px 0}
.grand-r{display:flex;justify-content:space-between;align-items:baseline;padding-top:8px;margin-top:4px;border-top:1px solid rgba(255,255,255,.25)}
.grand-r .l{font-family:'Montserrat',sans-serif;font-size:13px;font-weight:800;color:#fff;letter-spacing:.01em}
.grand-r .v{font-family:'Montserrat',sans-serif;font-size:23px;font-weight:800;color:#fff;letter-spacing:-.015em}
.words{margin:11px 26px 4px;padding:10px 14px;background:#fff7ed;border:0.5px solid #fed7aa;border-radius:8px;font-size:10px;color:#92400e;font-style:italic}
.words strong{font-weight:700;font-style:normal}
.pay-status{margin:11px 26px;padding:12px 14px;background:#f0fdf4;border:0.5px solid #bbf7d0;border-radius:8px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
.ps-l{font-size:8.5px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:.08em;font-family:'Montserrat',sans-serif;margin-bottom:3px}
.ps-v{font-family:'Montserrat',sans-serif;font-size:13px;font-weight:800;color:#15803d}
.work-details{margin:14px 26px;background:#f8fafc;border-radius:8px;padding:12px 14px}
.work-h{font-size:8.5px;font-weight:700;color:#5a6a7e;text-transform:uppercase;letter-spacing:.1em;font-family:'Montserrat',sans-serif;margin-bottom:6px}
.work-l{font-size:10px;color:#1f2933;line-height:1.7}
.bank{margin:11px 26px;background:#fff;border:0.5px solid #e2e8f0;border-radius:8px;padding:12px 14px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
.bank-h{font-size:8.5px;font-weight:700;color:#5a6a7e;text-transform:uppercase;letter-spacing:.1em;font-family:'Montserrat',sans-serif;margin-bottom:4px}
.bank-i{font-size:10.5px;color:#1f2933;line-height:1.7}
.bank-i strong{font-weight:700}
.terms{margin:14px 26px;padding:12px 14px}
.terms-h{font-family:'Montserrat',sans-serif;font-size:11.5px;font-weight:800;color:#1f2933;margin-bottom:9px}
.terms-l{display:flex;flex-direction:column;gap:6px}
.term-i{display:flex;gap:6px;font-size:9.5px;color:#3f4b5a;line-height:1.55}
.term-i::before{content:'•';color:#5a6a7e;flex-shrink:0}
.term-i strong{font-weight:700;color:#1f2933}
.promise{margin:11px 26px;background:#e8f1fd;border-radius:8px;padding:14px 16px}
.promise-h{font-family:'Montserrat',sans-serif;font-size:12px;font-weight:800;color:#1f2933;margin-bottom:8px}
.promise-l{display:flex;flex-direction:column;gap:4px}
.promise-i{display:flex;gap:6px;font-size:10px;color:#1f2933;align-items:center}
.check{color:#2f80ed;font-weight:700}
.footer{margin:20px 26px 22px;padding-top:14px;border-top:0.5px solid #e2e8f0;display:flex;justify-content:space-between;align-items:flex-end}
.foot-l{font-size:9.5px;color:#5a6a7e;line-height:1.5}
.foot-l strong{font-family:'Montserrat',sans-serif;font-weight:800;color:#1f2933;font-size:12px;display:block;margin-bottom:2px}
.foot-r{text-align:right}
.foot-thank{font-family:Georgia,serif;font-style:italic;font-size:18px;color:#1f2933;margin-bottom:3px}
.foot-sig{font-family:'Montserrat',sans-serif;font-size:11px;font-weight:800;color:#1f2933}
.foot-role{font-size:9.5px;color:#5a6a7e}
.computer-gen{text-align:center;padding:8px 26px 14px;font-size:8.5px;color:#94a3b8;font-style:italic}
.cancelled-wm{position:fixed;top:40%;left:10%;transform:rotate(-35deg);font-size:72px;font-weight:800;color:rgba(220,38,38,.2);font-family:'Montserrat',sans-serif;z-index:999;pointer-events:none}
`;

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtMoney(n: number, decimals = 2): string {
  return `₹${Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function fmtDate(d: string | undefined): string {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return d;
  }
}

function statusHtml(inv: Record<string, unknown>): { cls: string; label: string } {
  const status = inv.status as string;
  const grand = Number(inv.grand_total);
  const paid = Number(inv.total_paid);
  if (status === 'paid' || paid >= grand) {
    return { cls: 'h-status-paid', label: '✓ Paid in Full' };
  }
  if (status === 'partially_paid') {
    const pct = grand > 0 ? Math.round((paid / grand) * 100) : 0;
    return { cls: 'h-status-partial', label: `Partially Paid · ${pct}%` };
  }
  if (status === 'overdue') {
    const due = inv.invoice_due as string;
    const days = due
      ? Math.floor((Date.now() - new Date(due).getTime()) / 86400000)
      : 0;
    return { cls: 'h-status-overdue', label: `Overdue by ${days} days` };
  }
  if (status === 'cancelled') {
    return { cls: 'h-status-overdue', label: 'Cancelled' };
  }
  return { cls: 'h-status-due', label: 'Payment Due' };
}

function buildItemRows(items: Array<Record<string, unknown>>): string {
  let html = '';
  let group = '';
  let numInGroup = 0;

  for (const it of items) {
    const gn = String(it.group_name || 'General');
    if (gn !== group) {
      group = gn;
      numInGroup = 0;
      html += `<tr class="row-grp"><td colspan="7">${esc(gn)}</td></tr>`;
    }
    numInGroup++;
    const mode = it.pricing_mode as string;
    const qtyArea =
      mode === 'area'
        ? `${it.area_value} ${it.area_unit || 'sqft'}`
        : `${it.quantity} ${it.unit_label || 'nos'}`;
    const rate =
      mode === 'area' ? Number(it.rate_per_unit) : Number(it.unit_price);
    const desc = it.description
      ? `<div class="item-desc">${esc(it.description)}</div>`
      : '';
    const amt = Number(it.taxable_amount ?? it.gross_amount ?? 0);

    html += `<tr>
      <td class="row-num">${numInGroup}</td>
      <td><div class="item-name">${esc(it.item_name)}</div>${desc}</td>
      <td>${esc(it.hsn_sac_code || '—')}</td>
      <td class="right">${esc(qtyArea)}</td>
      <td class="right">${rate.toLocaleString('en-IN')}</td>
      <td class="right">${it.gst_rate ?? 0}%</td>
      <td class="amt">${fmtMoney(amt, 2)}</td>
    </tr>`;
  }
  return html;
}

const DEFAULT_TERMS = [
  {
    title: 'Payment terms',
    text: 'Payment is due as per the due date on this invoice unless already received in full.',
  },
  {
    title: 'Taxes',
    text: 'All amounts are inclusive of GST as itemised above. Tax invoice issued under GST Rules 2017.',
  },
  {
    title: 'Scope of work',
    text: 'This invoice covers work executed as per the approved BOQ and design drawings. Any changes after approval may be re-quoted.',
  },
  {
    title: 'Warranty',
    text: 'Houznext provides up to 10 years workmanship warranty on built-in interior components per company warranty policy.',
  },
  {
    title: 'Material substitution',
    text: 'Where a listed material was unavailable, an equivalent material was used with client approval and is reflected above.',
  },
  {
    title: 'Dispute resolution',
    text: 'Any disputes shall be subject to the exclusive jurisdiction of courts at Hyderabad, Telangana.',
  },
];

export function buildInvoicePdfHtml(
  inv: Record<string, unknown>,
  options?: { logoDataUrl?: string },
): string {
  const st = statusHtml(inv);
  const items = (inv.items as Array<Record<string, unknown>>) || [];
  const sameShip = inv.ship_to_same_as_bill !== false;
  const igst = Number(inv.igst_amount) > 0;
  const payments = (inv.payments as Array<Record<string, unknown>>) || [];
  const lastPay = payments[0];
  const lastPayLabel = lastPay
    ? `${fmtDate(lastPay.payment_date as string)} · ${esc(lastPay.payment_method)}`
    : inv.last_payment_date
      ? `${fmtDate(inv.last_payment_date as string)}${inv.last_payment_method ? ` · ${esc(inv.last_payment_method)}` : ''}`
      : '—';
  const roundSign = Number(inv.round_off) >= 0 ? '+' : '';

  const supplierName = inv.supplier_name || 'Houznext Interiors Pvt Ltd';
  const supplierGstin = inv.supplier_gstin || '';
  const supplierAddress = inv.supplier_address || '';
  const supplierState = inv.supplier_state || 'Telangana';
  const supplierStateCode = inv.supplier_state_code || '36';

  const termsText = inv.terms_and_conditions as string | undefined;
  const workDetails =
    (inv.additional_work_details as string) ||
    (inv.notes as string) ||
    '';

  const cancelled = inv.status === 'cancelled';
  const logoSrc = options?.logoDataUrl || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"/>
<style>${INVOICE_PDF_STYLES}</style>
</head>
<body>
${cancelled ? '<div class="cancelled-wm">CANCELLED</div>' : ''}
<div class="pg">
  <div class="header">
    <div class="h-l">
      <div class="h-brand">
        ${
          logoSrc
            ? `<img src="${logoSrc}" alt="Houznext" class="h-logo-img" />`
            : `<div class="h-name">Houznext</div>`
        }
      </div>
      <div class="h-tag">Buy Right · Build Strong · Design Beautiful</div>
      <div class="h-contact">
        <div>+91 97597 50770</div>
        <div>business@houznext.com</div>
      </div>
    </div>
    <div class="h-r">
      <div class="h-doctype">Tax Invoice</div>
      <div class="h-no">${esc(inv.invoice_number)}</div>
      <div class="h-meta">
        <div>Issued: ${fmtDate(inv.invoice_date as string)}</div>
        <div>Due: ${fmtDate(inv.invoice_due as string)}</div>
        <div>Place of Supply: ${esc(inv.bill_to_state || supplierState)} (${esc(inv.bill_to_state_code || supplierStateCode)})</div>
      </div>
      <div class="h-status ${st.cls}">${st.label}</div>
    </div>
  </div>

  <div class="parties">
    <div>
      <div class="party-l">Bill To</div>
      <div class="party-n">${esc(inv.bill_to_name)}</div>
      <div class="party-d">
        ${esc(inv.bill_to_address)}<br/>
        ${esc(inv.bill_to_city)}${inv.bill_to_state ? `, ${esc(inv.bill_to_state)}` : ''}${inv.bill_to_pincode ? ` — ${esc(inv.bill_to_pincode)}` : ''}<br/>
        <strong>Mobile:</strong> ${esc(inv.bill_to_mobile)}<br/>
        ${inv.bill_to_gstin ? `<strong>GSTIN:</strong> ${esc(inv.bill_to_gstin)}` : ''}
      </div>
    </div>
    <div>
      <div class="party-l">Ship To</div>
      <div class="party-d" style="margin-top:6px">${
        sameShip
          ? 'Same as billing address'
          : [
              inv.ship_to_name ? `<strong>${esc(inv.ship_to_name)}</strong>` : '',
              esc(inv.ship_to_address),
              [inv.ship_to_city, inv.ship_to_state, inv.ship_to_pincode]
                .filter(Boolean)
                .map((v) => esc(v))
                .join(', '),
            ]
              .filter(Boolean)
              .join('<br/>')
      }</div>
      <div class="party-l" style="margin-top:12px">Project</div>
      <div class="party-d">
        Work: ${esc(String(inv.invoice_type || 'interiors'))}<br/>
        ${inv.linked_quotation_id ? `Linked Quotation: ${esc(inv.linked_quotation_id)}` : ''}
      </div>
    </div>
    <div>
      <div class="party-l">Prepared By</div>
      <div class="party-n">${esc(inv.prepared_by_name || 'Houznext Team')}</div>
      <div class="party-d">
        ${esc(inv.prepared_by_role || '')}<br/>
        ${inv.prepared_by_email ? `${esc(inv.prepared_by_email)}<br/>` : ''}
        ${inv.prepared_by_phone ? esc(inv.prepared_by_phone) : ''}
      </div>
    </div>
  </div>

  <div class="scope">
    <div class="scope-h">Scope of Work &amp; Cost Breakdown</div>
    <table class="tbl">
      <thead>
        <tr>
          <th style="width:24px">#</th>
          <th>Item Description</th>
          <th style="width:60px">HSN</th>
          <th class="right" style="width:46px">Qty/Area</th>
          <th class="right" style="width:46px">Rate (₹)</th>
          <th class="right" style="width:42px">GST</th>
          <th class="right" style="width:78px">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>${buildItemRows(items)}</tbody>
    </table>
  </div>

  <div class="totals-wrap">
    <div class="totals-box">
      <div class="tot-r"><span>Subtotal (taxable value before invoice discount)</span><span class="v">${fmtMoney(Number(inv.subtotal), 2)}</span></div>
      <div class="tot-r disc"><span>Item-level discounts</span><span class="v">−${fmtMoney(Number(inv.total_item_discount), 2)}</span></div>
      <div class="tot-r disc"><span>Invoice discount</span><span class="v">−${fmtMoney(Number(inv.invoice_discount_amount), 2)}</span></div>
      <div class="divider"></div>
      <div class="tot-r"><span>Taxable value</span><span class="v">${fmtMoney(Number(inv.taxable_value), 2)}</span></div>
      ${igst
        ? `<div class="tot-r"><span>IGST @ ${items[0]?.gst_rate ?? 18}%</span><span class="v">${fmtMoney(Number(inv.igst_amount), 2)}</span></div>`
        : `<div class="tot-r"><span>CGST @ 9%</span><span class="v">${fmtMoney(Number(inv.cgst_amount), 2)}</span></div>
           <div class="tot-r"><span>SGST @ 9%</span><span class="v">${fmtMoney(Number(inv.sgst_amount), 2)}</span></div>`}
      <div class="tot-r"><span>Round off</span><span class="v">${roundSign}${fmtMoney(Number(inv.round_off), 2)}</span></div>
      <div class="grand-r">
        <span class="l">Grand Total</span>
        <span class="v">${fmtMoney(Number(inv.grand_total), 2)}</span>
      </div>
    </div>
  </div>

  <div class="words">
    <strong>Amount in words:</strong> ${esc(inv.amount_in_words)}
  </div>

  <div class="pay-status">
    <div>
      <div class="ps-l">Total Paid</div>
      <div class="ps-v">${fmtMoney(Number(inv.total_paid), 2)}</div>
    </div>
    <div>
      <div class="ps-l">Balance Due</div>
      <div class="ps-v">${fmtMoney(Number(inv.balance_due), 2)}</div>
    </div>
    <div>
      <div class="ps-l">Last Payment</div>
      <div class="ps-v" style="font-size:11px">${lastPayLabel}</div>
    </div>
  </div>

  <div class="bank">
    <div>
      <div class="bank-h">Bank Details for Payment</div>
      <div class="bank-i">
        <strong>${esc(supplierName)}</strong><br/>
        ${inv.supplier_bank_account ? `A/c: ${esc(inv.supplier_bank_account)}<br/>` : ''}
        ${inv.supplier_bank_ifsc ? `IFSC: ${esc(inv.supplier_bank_ifsc)}${inv.supplier_bank_name ? ` · ${esc(inv.supplier_bank_name)}` : ''}<br/>` : ''}
        ${inv.supplier_upi_id ? `UPI: ${esc(inv.supplier_upi_id)}` : ''}
      </div>
    </div>
    <div>
      <div class="bank-h">Supplier Identifiers</div>
      <div class="bank-i">
        <strong>GSTIN:</strong> ${esc(supplierGstin)}<br/>
        ${inv.supplier_pan ? `<strong>PAN:</strong> ${esc(inv.supplier_pan)}<br/>` : ''}
        <strong>State Code:</strong> ${esc(supplierStateCode)} (${esc(supplierState)})
      </div>
    </div>
  </div>

  ${workDetails ? `<div class="work-details"><div class="work-h">Additional Work Details</div><div class="work-l">${esc(workDetails).replace(/\n/g, '<br/>')}</div></div>` : ''}

  <div class="terms">
    <div class="terms-h">Terms &amp; Conditions</div>
    <div class="terms-l">
      ${(termsText
        ? termsText.split('\n').filter(Boolean).map((line) => `<div class="term-i"><span>${esc(line)}</span></div>`)
        : DEFAULT_TERMS.map((t) => `<div class="term-i"><span><strong>${t.title}:</strong> ${esc(t.text)}</span></div>`)
      ).join('')}
    </div>
  </div>

  <div class="promise">
    <div class="promise-h">Houznext Promise</div>
    <div class="promise-l">
      <div class="promise-i"><span class="check">✓</span>Free 3D Design</div>
      <div class="promise-i"><span class="check">✓</span>Transparent Pricing — fixed quote, fixed invoice</div>
      <div class="promise-i"><span class="check">✓</span>40+ Quality Checks</div>
      <div class="promise-i"><span class="check">✓</span>10-Year Workmanship Warranty</div>
      <div class="promise-i"><span class="check">✓</span>Real-time updates via LiveBuild</div>
    </div>
  </div>

  <div class="footer">
    <div class="foot-l">
      <strong>${esc(supplierName)}</strong>
      +91 97597 50770 · business@houznext.com<br/>
      For payment queries, reply to this email or call our team.
    </div>
    <div class="foot-r">
      <div class="foot-thank">Thank You</div>
      <div class="foot-sig">${esc(inv.authorised_signatory || inv.prepared_by_name || 'Houznext')}</div>
      <div class="foot-role">Authorised Signatory · Houznext</div>
    </div>
  </div>

  <div class="computer-gen">
    This is a computer-generated invoice. Generated on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST. Signature not required.
  </div>
</div>
</body>
</html>`;
}
