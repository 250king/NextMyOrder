# Source UI and implementation constraints

These rules apply to work under `src/`.

For any task that creates or changes user-visible UI, **read `../docs/UI_STYLE.md` before editing code**. The current NextMyOrder visual language is a product constraint, not a suggestion.

For any task that changes billing/payment data, **read `../docs/PAYMENT_MODEL.md` before editing code**. Payment aggregation and snapshot semantics are data-integrity constraints.

## Mandatory UI workflow

Before implementing a UI change:

1. Read `../docs/UI_STYLE.md`.
2. Inspect the closest existing page for the same kind of workflow.
3. Inspect the shared component(s) used by that page.
4. Follow the root `AGENTS.md` requirements for Next.js and HeroUI v3 documentation.
5. Reuse the closest existing layout/component pattern instead of generating a generic new design.

## Hard constraints

- Keep the existing continuous, low-segmentation page style.
- Use cards primarily for independently browsable/selectable business entities, not as generic section wrappers.
- Do not add Card/Surface/border/background/shadow merely to visually separate every section.
- Avoid nested cards/surfaces unless the inner element is genuinely a separate business entity.
- Prefer typography, spacing, alignment, grids, Tabs, Chip, Alert, and semantic structure for hierarchy.
- Prefer HeroUI semantic colors/tokens and the project's existing status/color maps over arbitrary Tailwind palette colors.
- Do not introduce gradients, decorative glass effects, oversized hero sections, KPI/dashboard blocks, or marketing-style layouts unless explicitly required.
- Preserve nearby spacing, typography, responsive breakpoints, and component variants when adding to an existing workflow.
- Reuse existing shared components before creating visually similar duplicates.
- Do not restyle unrelated UI as part of a functional task.

## Payment and snapshot constraints

- `Payment` is an aggregate and must not be tied to a single source entity.
- Never add `type` or `refId` back to `Payment`.
- Each charge line belongs in `PaymentItem` and carries its own `type + refId` reference.
- `PaymentItem` must keep an immutable snapshot of the billed description and money fields.
- Billing/history UI must read amount/name/description data from `PaymentItem`, not by re-reading the current referenced entity.
- `Payment.amount` is the settlement total of the whole bill; mixed charge types are allowed in one payment.
- `PaymentItem.settledTotal` is an accounting snapshot and must not be silently recomputed from a later entity value.
- Because `PaymentItem.refId` is polymorphic, code creating a line item must validate the source entity before insertion.

## Existing patterns to prefer

For detail pages, first compare against:

- `app/(private)/groups/[groupId]/page.tsx`
- `app/(private)/payments/[paymentId]/page.tsx`
- `app/(private)/deliveries/[deliveryId]/page.tsx`

For entity lists/cards, first compare against:

- `component/card/group.tsx`
- `component/card/payment.tsx`
- `component/card/delivery.tsx`

For global navigation, first compare against:

- `component/layout/navbar.tsx`

These references define the current design language. New code may improve on them, but should not silently establish an unrelated visual system.

## Review checklist

Before considering a UI change complete, verify that it does not introduce:

- unnecessary cards or section boxes
- arbitrary palette colors
- stronger/more numerous shadows than nearby UI
- inconsistent heading sizes or spacing
- duplicated controls that already exist as shared components
- a new navigation or layout paradigm without a concrete requirement

If a genuinely new interaction requires a new visual pattern, keep it compatible with `../docs/UI_STYLE.md` and make the deviation intentional and reusable.
