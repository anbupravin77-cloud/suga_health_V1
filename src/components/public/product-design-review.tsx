"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { MotionLink } from "./motion-link";
import { rememberReturnPosition } from "./return-position";
import styles from "./product-design-review.module.css";

type Medicine = {
  id: string;
  name: string;
  category: string;
  activeIngredients: string;
  form: string;
  image: string;
  imageAlt: string;
};

const groups = [
  { id: "weight", name: "Weight Loss" },
  { id: "hair", name: "Hair Growth" },
  { id: "sexual", name: "Sexual Health" },
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
          sizes="(max-width: 700px) 64vw, (max-width: 1050px) 44vw, 29vw"
          className={styles.image}
        />
        <span className={styles.illustrative}>Illustrative image</span>
      </div>
      <div className={styles.info}>
        <span className={styles.category}>{treatment}</span>
        <h4 className={styles.name}>{product.activeIngredients}</h4>
        <p className={styles.ingredients}>{product.form}</p>
      </div>
      <div className={styles.footer}>
        <MotionLink
          href="/sign-up?next=%2Fconsultation%2Fstart"
          onClick={rememberReturnPosition}
          variant="morph"
          alternateLabel="Start Care"
          className={styles.primary}
        >
          Get Started
        </MotionLink>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => onLearnMore(product)}
          aria-label={`Learn more about ${product.activeIngredients}`}
        >
          Learn More
        </button>
      </div>
    </article>
  );
}


// Each treatment group owns its scroll position and arrow visibility.
// Swipe, trackpad, mouse-wheel horizontal scrolling, and arrow taps all
// synchronize the same navigation state.
function ProductRail<T extends Medicine>({
  title,
  products,
  onLearnMore,
}: {
  title: string;
  products: readonly T[];
  onLearnMore: (product: T) => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const syncArrows = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    setCanScrollLeft(rail.scrollLeft > 3);
    setCanScrollRight(maxScroll > 3 && rail.scrollLeft < maxScroll - 3);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    syncArrows();
    const observer = new ResizeObserver(syncArrows);
    observer.observe(rail);
    if (rail.firstElementChild) observer.observe(rail.firstElementChild);
    window.addEventListener("resize", syncArrows);
    const frame = window.requestAnimationFrame(syncArrows);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", syncArrows);
    };
  }, [syncArrows, products.length]);

  const navigate = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const first = rail.firstElementChild as HTMLElement | null;
    if (!first) return;
    const gap = Number.parseFloat(window.getComputedStyle(rail).columnGap) || 0;
    const distance = first.getBoundingClientRect().width + gap;
    rail.scrollBy({
      left: direction * distance,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  return (
    <div className={styles.railFrame}>
      <div
        ref={railRef}
        className={styles.cards}
        role="region"
        tabIndex={0}
        aria-label={`${title} medicines. Swipe or use the carousel arrows.`}
        onScroll={syncArrows}
      >
        {products.map((product) => (
          <MedicineCard key={product.id} product={product} onLearnMore={onLearnMore} />
        ))}
      </div>
      {canScrollLeft && (
        <button
          type="button"
          className={`${styles.railArrow} ${styles.railPrevious}`}
          aria-label={`Previous ${title} medicine`}
          onClick={() => navigate(-1)}
        >
          <ArrowRight size={19} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          className={`${styles.railArrow} ${styles.railNext}`}
          aria-label={`Next ${title} medicine`}
          onClick={() => navigate(1)}
        >
          <ArrowRight size={19} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </div>
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
                <h3 id={`showcase-${group.id}-title`}>{group.name}</h3>
              </div>
              <span className={styles.headingRule} aria-hidden="true" />
              <span className={styles.swipeHint} aria-hidden="true">
                Swipe to explore <ArrowRight size={14} />
              </span>
            </div>
            <ProductRail
              title={group.name}
              products={products.filter((product) => product.category === group.id)}
              onLearnMore={onLearnMore}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
