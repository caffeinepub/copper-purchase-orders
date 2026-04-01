# Copper Purchase Orders

## Current State
App has order submission, admin panel, and tracking. No pricing/rates feature exists.

## Requested Changes (Diff)

### Add
- Backend: `setProductRate`, `getProductRates` functions to store per-product rates (price per kg/unit + currency)
- Admin panel: "Rates Management" section at top of dashboard where seller can view and update rates per product
- Order form: Display current rates table so buyers can see pricing before submitting

### Modify
- AdminPage.tsx: Add a Rates card above the orders table with inputs to update each product rate
- OrderFormPage.tsx: Show rates reference panel so buyers see pricing

### Remove
- Nothing removed

## Implementation Plan
1. Update backend main.mo to add rate storage and CRUD
2. Update frontend AdminPage.tsx with rates management card
3. Update OrderFormPage.tsx with rates display for buyers
