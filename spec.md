# Copper Purchase Orders

## Current State
Fresh rebuild — no existing application files.

## Requested Changes (Diff)

### Add
- Full copper purchase order management app (complete rebuild)
- Buyer order submission flow: email entry, product selection (wire/sheet/pipe/rod), size/quantity per product, multi-item orders
- Order ID generation returned to buyer after submission
- `/track` page: buyer enters Order ID + email to see order status and seller reply
- Product rates display on order form (fetched from backend, shown in INR)
- `/admin` dashboard secured by email (dhairyashah1812@gmail.com) + password (Copper@1812)
- Admin order table: all products, sizes, quantities, units per order
- Admin reply buttons: Available / Partial / Not Available
- Admin product rates editor: set/save rates per product in INR
- Default rates pre-filled for each copper product
- Orders sorted by needs-reply status; awaiting reply counter shown
- All orders stored in backend and retrievable without auth wall blocking admin fetch

### Modify
- N/A (fresh rebuild)

### Remove
- N/A (fresh rebuild)

## Implementation Plan
1. Generate Motoko backend with:
   - `submitOrder(email, items)` → returns orderId
   - `getOrders()` → returns all orders (no auth gate)
   - `replyToOrder(orderId, status)` → sets availability reply
   - `getOrderStatus(orderId, email)` → returns order + reply for buyer tracking
   - `setProductRate(product, rate)` → sets rate per product
   - `getProductRates()` → returns all current rates
   - Stable storage for orders and rates (persist across upgrades)
   - Default rates pre-seeded in INR
   - Admin credentials validated in frontend (email + password check)
2. Build React frontend:
   - Home page: email entry → order form with product selector, size/quantity, add more items, show current rates, submit
   - `/track` page: order ID + email input → show order details and reply
   - `/admin` page: login with email+password, order management table, reply buttons, rates editor
   - All backend calls correctly wired to generated bindings
