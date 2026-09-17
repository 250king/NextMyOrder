# NextMyOrder UI Style Guide

This document defines the visual and interaction language that already exists in NextMyOrder. It is not a redesign proposal. New UI should extend the current product instead of introducing a separate design style.

## Core principle

NextMyOrder uses a **continuous, low-segmentation application layout**.

Prefer hierarchy created by spacing, typography, alignment, semantic status components, and restrained surfaces. Do not divide every section into a separate card, bordered box, colored block, or shadowed panel.

A useful rule of thumb:

- **Business entities may be cards.** A group-buy item, product, payment, delivery, or transit record can be visually self-contained when it is an independently browsable object.
- **Ordinary page sections are not cards by default.** Basic information, explanatory text, metadata, filters, actions, and tab content should usually remain part of the page flow.

In short: **Entity-Card, not Section-Card.**

## Existing reference patterns

Before designing a new page, inspect the closest existing implementation and reuse its layout language.

Primary page references:

- `src/app/(private)/groups/[groupId]/page.tsx`
- `src/app/(private)/payments/[paymentId]/page.tsx`
- `src/app/(private)/deliveries/[deliveryId]/page.tsx`

Primary entity-card references:

- `src/component/card/group.tsx`
- `src/component/card/payment.tsx`
- `src/component/card/delivery.tsx`

Navigation reference:

- `src/component/layout/navbar.tsx`

These files are references for visual language, not templates that must be copied literally.

## Page layout

The established page shell is intentionally simple:

```tsx
<div className="container mx-auto p-6">
    <div className="flex flex-col gap-4">
        {/* page content */}
    </div>
</div>
```

Use the existing page rhythm unless the feature has a concrete reason not to.

Typical page hierarchy:

1. Page header
2. Status chips and/or contextual actions
3. Alert only when there is a meaningful business condition
4. Optional information surface for a compact summary
5. Main content, tabs, lists, tables, or entity cards

Do not add a hero section, dashboard statistic row, gradient banner, decorative KPI cards, or marketing-style header unless the product requirement explicitly needs one.

## Typography

Reuse the established hierarchy before inventing a new one.

Typical patterns:

- Page title: `text-2xl font-bold`
- Section title: `text-base font-semibold`
- Supporting/meta text: `text-sm` with semantic muted/default text colors
- Important values: `font-medium` or `font-bold` only when emphasis is meaningful
- IDs and machine-like values may use `font-mono`

Avoid creating many extra heading levels merely to make sections look different.

## Information fields

Metadata is usually presented through typography and grid alignment rather than mini-cards.

Preferred pattern:

```tsx
<div className="grid gap-4 text-sm md:grid-cols-3">
    <div className="min-w-0">
        <div className="text-muted">Label</div>
        <div className="font-medium">Value</div>
    </div>
</div>
```

Do not wrap each field in its own border, surface, or card unless the field itself is an independently actionable object.

## Surface usage

`Surface` is used for a small number of visually important summary areas, not for every section.

Existing default treatment:

```tsx
<Surface className="rounded-3xl p-4 shadow-sm">
```

Use it when an information group benefits from being gently lifted from the page. Prefer one coherent surface over several adjacent surfaces.

Avoid:

- nested surfaces
- surface-per-field layouts
- multiple adjacent surfaces that could be a single continuous section
- stronger shadows without a clear interaction or hierarchy reason

## Card usage

Cards are appropriate for independently browsable or selectable business entities.

Examples already present in the product:

- group-buy entries
- products/items
- deliveries
- transit records
- payments

Cards should not become a generic section wrapper.

Avoid:

- Card around a page header
- Card around ordinary explanatory text
- Card around tabs only to create a border
- Card inside Card unless the inner element is genuinely a separate entity
- adding cards solely because a generated design feels "more modern"

Interactive entity cards may use restrained hover feedback such as the existing shadow transition patterns.

## Color and theming

Prefer HeroUI semantic tokens and existing status maps.

Examples already used by the project:

- `text-muted`
- `text-default-500`
- `border-separator`
- `bg-background`
- `text-focus`
- HeroUI component `color` props driven by existing `colorMap` values

Do not introduce arbitrary Tailwind palette colors such as `bg-blue-50`, `text-purple-600`, or `border-slate-200` when a semantic token already expresses the intent.

Do not introduce gradients, glass effects, or decorative accent colors unless a requirement explicitly calls for them.

## Status and feedback

Use semantic components for semantic meaning:

- `Chip` for compact state/category labels
- `Alert` for important contextual conditions or warnings
- `toast` for transient operation feedback
- `Modal` / `Drawer` for focused interactions that should not become permanent page sections

Do not use colored cards as a substitute for `Alert` or `Chip`.

## Spacing and density

The current UI is moderately compact and relies heavily on `gap-4` and small local gaps.

Prefer consistency over novelty. Reuse existing spacing seen in nearby pages/components before introducing a new scale.

Avoid excessive whitespace intended only to imitate landing-page designs. This is an operational application, not a marketing site.

## Navigation and responsiveness

Preserve the existing responsive strategy:

- desktop navigation stays lightweight
- mobile navigation may use a Drawer
- entity grids can move from one column to multiple columns at established breakpoints
- information grids collapse naturally on small screens

Do not create a second navigation paradigm for a new feature unless the information architecture actually requires it.

## Component reuse

Before adding a new component, search for an existing component that already represents the same interaction or visual role.

Prefer reuse of:

- existing `LinkButton` / link helpers
- existing tabs helpers
- existing filters
- existing pagination
- existing image wrappers
- existing card patterns
- HeroUI components already used by the project

Do not duplicate an existing component with slightly different styling just because the new page was generated independently.

## AI / agent workflow for UI tasks

For any task that changes UI, the implementing agent must do the following **before writing code**:

1. Read this file.
2. Inspect at least one existing page closest to the requested feature.
3. Inspect the relevant shared component(s) used by that page.
4. Read the relevant HeroUI v3 documentation required by the root `AGENTS.md`.
5. State internally which existing pattern will be reused; do not start from a generic dashboard template.

When implementing:

- preserve the current continuous layout
- reuse existing semantic tokens
- reuse component variants already present in nearby code
- avoid visual changes outside the requested scope
- do not redesign unrelated existing pages while adding a feature

When reviewing the result, check specifically for accidental AI-style drift:

- unnecessary cards
- unnecessary section borders
- excessive shadows
- arbitrary palette colors
- gradients or decorative backgrounds
- oversized headings
- dashboard/KPI blocks that were not requested
- duplicated components with new styling
- inconsistent spacing compared with nearby pages

## Definition of done for UI changes

A UI task is not complete until all of the following are true:

- The new screen looks like it belongs to the same product as the reference pages.
- Page hierarchy is understandable without relying on a border/background around every section.
- Cards represent entities, not arbitrary sections.
- Semantic HeroUI colors/tokens are used where possible.
- Existing shared components were reused when applicable.
- Mobile layout remains usable.
- No unrelated visual redesign was introduced.
- Functional behavior remains the primary goal; decoration is secondary.

## When a new pattern is justified

A new visual pattern is allowed when the existing UI genuinely cannot express the required interaction well. In that case:

1. Keep it visually compatible with the rules above.
2. Prefer adding one reusable pattern instead of a one-off styling island.
3. Document the reason in the implementation or PR description when the deviation is substantial.

The goal is not to freeze the interface. The goal is to make intentional evolution distinguishable from accidental style drift.
