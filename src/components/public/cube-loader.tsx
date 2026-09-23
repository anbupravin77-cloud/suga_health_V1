import type { CSSProperties } from "react";
import styles from "./cube-loader.module.css";

type LoaderStyle = CSSProperties & Record<`--${string}`, string>;

function positionVars(h: number, w: number, l: number): LoaderStyle {
  const pct = (value: number) => `${value}%`;

  return {
    "--x0": pct(50 * (l - w)),
    "--y0": pct(50 * h + 25 * w + 25 * l - 200),
    "--x14": pct(-50 * w + 100 * l - 100),
    "--y14": pct(50 * h + 25 * w + 50 * l - 250),
    "--x28": pct(100 * (l - w)),
    "--y28": pct(50 * h + 50 * w + 50 * l - 300),
    "--x43": pct(100 * (l - w)),
    "--y43": pct(100 * h + 50 * w + 50 * l - 400),
    "--x57": pct(-100 * w + 50 * l + 100),
    "--y57": pct(100 * h + 50 * w + 25 * l - 350),
    "--x71": pct(50 * (l - w)),
    "--y71": pct(100 * h + 25 * w + 25 * l - 300),
  };
}

export function CubeLoader() {
  const cubes = [];

  for (let h = 1; h <= 3; h += 1) {
    for (let w = 1; w <= 3; w += 1) {
      for (let l = 1; l <= 3; l += 1) {
        cubes.push(
          <div
            className={styles.cube}
            key={`${h}-${w}-${l}`}
            style={{ ...positionVars(h, w, l), zIndex: -h }}
            aria-hidden="true"
          >
            <span className={`${styles.face} ${styles.top}`} />
            <span className={`${styles.face} ${styles.left}`} />
            <span className={`${styles.face} ${styles.right}`} />
          </div>,
        );
      }
    }
  }

  return (
    <div className={styles.screen} role="status" aria-live="polite" aria-label="Loading Suga Health">
      <div className={styles.container}>{cubes}</div>
      <span className={styles.srOnly}>Loading Suga Health</span>
    </div>
  );
}
