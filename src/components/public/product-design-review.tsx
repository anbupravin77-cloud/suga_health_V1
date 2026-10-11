"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { MotionLink } from "./motion-link";
import { rememberReturnPosition } from "./return-position";
import styles from "./product-design-review.module.css";

type Medicine = {
  id: string;
  name: string;
  category: string;
  activeIngredients: string;
  image: string;
  imageAlt: string;
};

type Layout = "compact" | "editorial" | "showcase";

const layouts: { id: Layout; number: string; title: string; summary: string }[] = [
  {
    id: "compact",
    number: "01",
    title: "Compact Catalogue",
    summary: "Fast scanning, balanced imagery and essential treatment information.",
  },
  {
    id: "editorial",
    number: "02",
    title: "Editorial Split",
    summary: "Category-led storytelling with streamlined medicine rows.",
  },
  {
    id: "showcase",
    number: "03",
    title: "Product Showcase",
    summary: "Image-first medicine cards with spacious editorial typography.",
  },
];

const groups = [
  { id: "weight", title: "Weight Loss" },
  { id: "hair", title: "Hair Growth" },
  { id: "sexual", title: "Sexual Health" },
] as const;

function MedicineCard<T extends Medicine>({
  product,
  layout,
  onLearnMore,
}: {
  product: T;
  layout: Layout;
  onLearnMore: (product: T) => void;
}) {
  const categoryName = product.category === "weight"
    ? "Weight management"
    : product.category === "hair"
      ? "Hair restoration"
      : "Sexual Health";

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          loading="lazy"
          sizes={layout === "showcase"
            ? "(max-width: 700px) 79vw, (max-width: 1050px) 43vw, 29vw"
            : "(max-width: 700px) 39vw, (max-width: 1050px) 22vw, 14vw"}
          className={styles.image}
        />
        <span className={styles.illustrative}>Illustrative image</span>
      </div>
      <div className={styles.info}>
        <span className={styles.category}>{categoryName}</span>
        <h5 className={styles.name}>{product.name}</h5>
        <p className={styles.ingredients}>{product.activeIngredients}</p>
      </div>
      <div className={styles.footer}>
        <MotionLink
          href="/sign-up?next=%2Fconsultation%2Fstart"
          onClick={rememberReturnPosition}
          variant="morph"
          alternateLabel="Begin Your Care"
          className={styles.primary}
        >
          Get Started
        </MotionLink>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => onLearnMore(product)}
          aria-label={`Learn more about ${product.name}`}
        >
          Learn More
        </button>
      </div>
    </article>
  );
}

export function ProductDesignReview<T extends Medicine>({
  products,
  onLearnMore,
}: {
  products: readonly T[];
  onLearnMore: (product: T) => void;
}) {
  return (
    <div className={styles.reviewStack}>
      <div className={styles.reviewGuide}>
        <span className={styles.guideLabel}>Three live design directions</span>
        <span className={styles.guideNote}>Each displays the same nine medicines and working actions.</span>
        <nav className={styles.reviewNav} aria-label="Jump between product designs">
          {layouts.map((layout) => (
            <a key={layout.id} href={`#products-design-${layout.id}`} className={styles.jump}>
              {layout.number} <ArrowRight size={13} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>

      {layouts.map((layout) => (
        <section
          key={layout.id}
          id={`products-design-${layout.id}`}
          className={`${styles.design} ${styles[layout.id]}`}
          aria-labelledby={`design-title-${layout.id}`}
        >
          <header className={styles.designHeader}>
            <span className={styles.designNumber}>DESIGN {layout.number} / 03</span>
            <div className={styles.designHeading}>
              <h3 id={`design-title-${layout.id}`}>{layout.title}</h3>
              <p>{layout.summary}</p>
            </div>
          </header>

          <div className={styles.categoryStack}>
            {groups.map((group) => (
              <section
                key={group.id}
                className={styles.categorySection}
                aria-labelledby={`${layout.id}-${group.id}-title`}
              >
                <div className={styles.categoryHeading}>
                  <div className={styles.categoryHeadingCopy}>
                    <span className={styles.categoryIndex}>
                      {group.id === "weight" ? "01" : group.id === "hair" ? "02" : "03"} / TREATMENT AREA
                    </span>
                    <h4 id={`${layout.id}-${group.id}-title`}>{group.title}</h4>
                  </div>
                  <span className={styles.headingRule} aria-hidden="true" />
                  <span className={styles.swipeHint} aria-hidden="true">
                    Swipe to explore <ArrowRight size={14} />
                  </span>
                </div>

                <div
                  className={styles.cards}
                  role="region"
                  tabIndex={0}
                  aria-label={`${layout.title}: ${group.title} medicine gallery`}
                >
                  {products
                    .filter((product) => product.category === group.id)
                    .map((product) => (
                      <MedicineCard
                        key={product.id}
                        product={product}
                        layout={layout.id}
                        onLearnMore={onLearnMore}
                      />
                    ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
