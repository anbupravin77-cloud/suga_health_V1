# Suga.Health V1 | UI Design System

Effective: October 2026. This is the shared source of truth for typography, spacing, and interaction sizing. Implemented in `src/app/design-system.css`.

## Typography
The universal font is **Inter**. Mobile applies below 900px; desktop applies from 900px up.

| Purpose | Mobile | Desktop | Line-height | Weight |
|---|---:|---:|---:|---:|
| Main hero H1 | 36px | 56px | 1.15 | 700 |

**Homepage mobile hero exception:** The long “Clinically proven…” headline intentionally retains its earlier, more compact responsive scale: `clamp(1.95rem, 7.6vw, 2.6rem)` below 560px, `clamp(1.82rem, 7.9vw, 2.3rem)` below 430px, and `clamp(1.78rem, 8vw, 2rem)` below 360px, with 500 font weight. The other hero titles and standard typography tokens are unchanged.
| Main section H2 | 30px | 44px | 1.15 | 700 |
| Treatment H3 | 27px | 34px | 1.2 | 650 |
| Card H4 | 20px | 24px | 1.2 | 650 |
| Uppercase eyebrow | 13px | 13px | 1.4 | 700 |
| Main description | 17px | 19px | 1.55 | 400 |
| Body paragraph | 16px | 17px | 1.6 | 400 |
| Feature/bullet | 15px | 16px | 1.5 | 400 |
| Statistic value | 16px | 18px | 1.4 | 600 |
| Statistic label | 12px | 12px | 1.4 | 700 |
| Standard action | 15px | 16px | 1.2 | 600 |
| Form field label | 16px | 16px | 1.4 | 600 |
| Helper copy | 14px | 15px | 1.6 | 400 |
| Caption | 13px | 14px | 1.5 | 400 |

A compact 13/14px action label is permitted in a *narrow two-button product card*, where normal text would clip.

## Layout and geometry

- Treatment pathway images: same 1:1 square dimensions at the same viewport width, `object-fit: cover` for photographs, 20px radius. Existing video and pastel placeholder surfaces remain until appropriate imagery is available.
- Treatment pathway layout: equal columns on desktop; stack image above text on phones <=760px. Standardize heading/description/stat/list/action gaps across the three rows.
- Treatment section-to-section gap: 64px mobile, 96px desktop.
- Main description-to-statistics gap: 24px. Heading-to-description gap: 12px.
- Public CTAs: consistent Inter font, pill radius, >=44px touch target, similar hover/focus treatment. **Start Consultation** remains Suga crimson `#ED0723`.
- Cards are **purpose-specific**. Milestone cards retain timeline architecture, doctor cards retain carousel/profile treatment, product cards retain products and swipe rails, clinical cards retain safety/validation. Share semantic typography and predictable control sizing, **not one universal rectangle**.
- Avoid broad CSS selectors that style all `button`, `card`, or `h3` elements indiscriminately. Scope by feature and role.
- Do not change medical wording, role permissions, account flows, clinical validation or database structures as part of visual cleanup.

## QA checklist

Visually inspect 360px and 390px phones, tablet ~768px, and desktop ~1280px:
1. Same-size square images for Weight Loss, Hair Restoration and Sexual Health, with balanced text.
2. Section headings and body copy consistent across homepage, doctor, milestone, products, FAQ.
3. No clipped copy in product half-card swipe rail; functional carousel controls still visible.
4. Consultation fields and consents unaffected; save/submit gates work as before.
5. Buttons preserve crimson consultation CTA versus secondary role and remain keyboard-focusable.
6. Verify no horizontal overflow and no new spacing under the sticky header.
