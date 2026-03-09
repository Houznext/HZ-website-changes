# Pricing & GST – When to Calculate

**Products (Electronics, Furniture, Home Decors)** store only the **inputs**:

- **Original price / MRP** (`price` or `originalPrice`)
- **Discount %** (`discount` or `baseDiscountPercent`)
- **Tax (GST) %** (`taxPercentage`)
- **HSN code**, **GST inclusive** flag

**Selling price and tax are not stored on the product.** They are:

1. **Calculated when rendering** – e.g. product card, PDP, cart line:  
   `sellingPrice = gstInclusive ? priceAfterDiscount : priceAfterDiscount + tax`  
   so the UI always shows the correct amount from current product data.

2. **Calculated and stored when the order is created** – order and order-items store the **final amounts** (subtotal, tax, discount, total) at that moment. That keeps the order immutable and audit-ready even if product price or tax changes later.

So: **product = inputs only; order = computed values stored.**
