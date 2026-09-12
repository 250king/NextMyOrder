# Payment aggregate model

`Payment` is the payable aggregate. It must not represent one specific business entity.

The relationship is:

```text
Payment
  └─ PaymentItem[]
       ├─ snapshot fields
       └─ type + refId -> source business entity
```

This allows one payment to contain mixed charges, for example product amounts and domestic delivery fees in the same bill.

## Payment

`Payment` stores only payment-level facts:

- owner (`userId`)
- final settlement amount (`amount`)
- settlement currency (`currency`, currently CNY for the online payment channel)
- payment request id / method
- created / paid timestamps
- comment

Do not add `type` or `refId` back to `Payment`. A payment can contain multiple kinds of charges and multiple referenced entities.

`Payment.amount` is the immutable settlement total and should equal the sum of `PaymentItem.settledTotal` for the payment at creation time.

## PaymentItem

Every charged line is represented by a `PaymentItem`.

A payment item contains two separate concepts:

1. **Reference**: `type + refId` identifies the source entity.
2. **Snapshot**: name, image, description, price, count, total, unit, currency and currency rate preserve what was actually charged.

Current reference semantics:

- `LIST`: `refId` points to an `Order`; this represents product/order amount.
- `TAX`: `refId` points to a `Transit`.
- `TRANSIT`: `refId` points to a `Transit`.
- `DELIVERY`: `refId` points to a `Delivery`.

`PaymentItem` is intentionally a polymorphic reference, so `refId` is not a database foreign key. Code that creates payment items must validate that the referenced entity exists and belongs to the intended user/business flow before inserting the snapshot.

## Snapshot rule

After a payment is created, UI and accounting code must render monetary and descriptive information from `PaymentItem`, not from the current source entity.

For example, changing an `Order.itemPrice`, a transit fee, or a delivery record later must not rewrite an existing bill.

`PaymentItem.settledTotal` is the final amount contributed by that line to `Payment.amount` in the payment settlement currency. Keep it even though it can often be recomputed from `total * currencyRate`; historical rounding and settlement values are accounting facts and should not drift.

## Migration

Run `scripts/migrate-list-order.ts` first so legacy orders have snapshot fields and `groupId`, then run:

```bash
npx tsx scripts/migrate-payment-items.ts
npx tsx scripts/migrate-payment-items.ts --write
```

The payment migration preserves existing `PaymentItem` snapshot values where available, attaches line-level references, converts the payment header to a CNY settlement total, and finally removes legacy `Payment.type`, `Payment.refId` and `Payment.currencyRate`.
