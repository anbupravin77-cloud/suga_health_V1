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

const groups = [
  { id: "weight", name: "Weight Loss", sequence: "01" },
  { id: "hair", name: "Hair Growth", sequence: "02" },
  { id: "sexual", name: "Sexual Health", sequence: "03" },
] as const;

function MedicineCard<T extends Medicine>({
  product,
  onLearnMore,
}: {
  product: T;
  onLearnMore: (product: T) => void;
}) {
  const treatment = product.category === "weight"
    ? "Weight management"
    : product.category === "hair" ? "Hair restoration" : "Sexual Health";

  return (
    <article className={styles.card} data-product={product.id}>
      <div className={styles.media}>
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          loading="lazy"
          sizes="(max-width: 700px) 84vw, (max-width: 1050px) 44vw, 29vw"
          className={styles.image}
        />
        <span className={styles.illustrative}>Illustrative image</span>
      </div>
      <div className={styles.info}>
        <span className={styles.category}>{treatment}</span>
        <h4 className={styles.name}>{product.name}</h4>
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

export function ProductShowcase<T extends Medicine>({
  products,
  onLearnMore,
}: {
  products: readonly T[];
  onLearnMore: (product: T) => void;
}) {
  return (
    <div className={styles.showcase} id="products-design-showcase">
      <div className={styles.categoryStack}>
        {groups.map((group) => (
          <section key={group.id} className={styles.categorySection}
            aria-labelledby={`showcase-${group.id}-title`}>
            <div className={styles.groupHeading}>
              <div className={styles.headingLabel}>
                <span className={styles.categoryIndex}>{group.sequence} / TREATMENT AREA</span>
                <h3 id={`showcase-${group.id}-title`}>{group.name}</h3>
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
              aria-label={`${group.name} medicines`}
            >
              {products.filter((product) => product.category === group.id).map((product) => (
                <MedicineCard key={product.id} product={product} onLearnMore={onLearnMore} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
