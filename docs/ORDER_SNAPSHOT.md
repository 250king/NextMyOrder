# Order snapshot semantics

`List` is the user's editable requirement list. `Order` is the immutable business record created after a closed group is finalized.

When an order is created, product fields are copied from `Item` into the order record. The application must render and calculate historical orders from these snapshot fields, not by re-reading mutable `Item` data.

Snapshot fields:

- `groupId`
- `itemName`
- `itemUrl`
- `itemImage`
- `itemPrice`
- `itemWeight`
- `count`

`itemId` remains only as the source-item reference for traceability. It is not the source of truth for an existing order.

If an `Item` is edited after finalization, the existing order must not change. New orders created later use the then-current item data.