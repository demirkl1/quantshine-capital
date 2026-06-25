import { useEffect } from "react";

/**
 * Verilen seçiciye uyan kartlarda imleci takip eden "spotlight" efekti için
 * --mx / --my CSS değişkenlerini günceller. CSS tarafı ::before ile ışığı çizer.
 *
 * Tek bir document seviyesinde pointermove dinleyicisi kullanır (performanslı);
 * her kart için ayrı handler bağlamaz. prefers-reduced-motion'da devre dışı.
 */
export function useCardSpotlight(selector: string): void {
  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const onMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const card = target?.closest<HTMLElement>(selector);
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, [selector]);
}
