"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import * as React from "react";

const COLLAGE_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",
    alt: "کیف دستی چرمین",
  },
  {
    src: "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=1200&q=85",
    alt: "زیورآلات مینیمال آرا",
  },
  {
    src: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=85",
    alt: "عینک آفتابی ساحل",
  },
  {
    src: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=1200&q=85",
    alt: "عطر بهاری روژان",
  },
  {
    src: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=85&v=blue-1",
    alt: "کفش آبی روزمره",
  },
  {
    src: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85",
    alt: "کوله‌پشتی شهری کوشا",
  },
  {
    src: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=85",
    alt: "اسپیکر رومیزی موج",
  },
  {
    src: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=85",
    alt: "دفتر برنامه‌ریزی نوا",
  },
  {
    src: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=85",
    alt: "گلدان سرامیکی آذین",
  },
  {
    src: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85",
    alt: "کیف چرمی روزانه",
  },
  {
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
    alt: "ساعت مچی کلاسیک درسا",
  },
  {
    src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85",
    alt: "قهوه‌ساز خانگی باران",
  },
  {
    src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85",
    alt: "هدفون بی‌سیم آوا",
  },
  {
    src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=85",
    alt: "صندلی راحتی نیکا",
  },
  {
    src: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200&q=85",
    alt: "ست مراقبت پوست مهتاب",
  },
] as const;

const COLLAGE_COLUMNS = [
  [COLLAGE_IMAGES[0], COLLAGE_IMAGES[3], COLLAGE_IMAGES[6], COLLAGE_IMAGES[9], COLLAGE_IMAGES[12]],
  [COLLAGE_IMAGES[1], COLLAGE_IMAGES[4], COLLAGE_IMAGES[7], COLLAGE_IMAGES[10], COLLAGE_IMAGES[13]],
  [COLLAGE_IMAGES[2], COLLAGE_IMAGES[5], COLLAGE_IMAGES[8], COLLAGE_IMAGES[11], COLLAGE_IMAGES[14]],
] as const;

export function EditorialCollage() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "12% 0px -12%", threshold: 0 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      const bounds = section.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const distance = (viewportCenter - (bounds.top + bounds.height / 2)) / window.innerHeight;
      const tile = section.querySelector<HTMLElement>(".editorial-collage-tile");
      const column = section.querySelector<HTMLElement>(".editorial-collage-column");
      const grid = section.querySelector<HTMLElement>(".editorial-collage-grid");
      const tileHeight = tile?.getBoundingClientRect().height ?? 0;
      const gap = column ? Number.parseFloat(window.getComputedStyle(column).rowGap) || 0 : 0;
      const photoStep = tileHeight + gap;
      const gridHeight = grid?.getBoundingClientRect().height ?? 0;
      const stackHeight = column?.scrollHeight ?? 0;
      const safeTravel = Math.max(0, (stackHeight - gridHeight) / 2 - 12);
      const travel = Math.min(photoStep * 1.25, safeTravel);
      const baseOffset = (gridHeight - stackHeight) / 2;
      const offset = Math.max(-1, Math.min(1, distance)) * travel;
      section.style.setProperty("--collage-column-one", `${baseOffset + offset}px`);
      section.style.setProperty("--collage-column-two", `${baseOffset - offset}px`);
      section.style.setProperty("--collage-column-three", `${baseOffset + offset}px`);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="editorial-collage-title"
      className="editorial-collage"
      data-visible={isVisible}
    >
      <div className="editorial-collage-copy">
        <p className="inline-flex items-center gap-2 text-sm font-bold text-highlight">
          <Sparkles className="size-4" aria-hidden="true" />
          انتخاب‌های خاص این هفته
        </p>
        <h2 id="editorial-collage-title" className="mt-4 text-3xl leading-[1.3] font-black sm:text-5xl">
          جزئیاتی که سبک شما را کامل می‌کنند
        </h2>
        <p className="mt-5 max-w-lg text-sm leading-8 text-muted-foreground sm:text-base">
          مجموعه‌ای از انتخاب‌های چشم‌نواز برای ساختن یک تجربه خرید متفاوت؛ از اکسسوری‌های ظریف تا همراه‌های روزمره.
        </p>
        <Link
          href="#newest"
          className="group mt-7 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-5 py-3 text-sm font-bold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          دیدن مجموعه
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true" />
        </Link>
      </div>

      <div className="editorial-collage-grid" aria-label="تصاویر منتخب فروشگاه">
        {COLLAGE_COLUMNS.map((column, columnIndex) => (
          <div className={`editorial-collage-column editorial-collage-column-${columnIndex + 1}`} key={columnIndex}>
            {column.map((image) => (
              <div className="editorial-collage-tile" key={image.src}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 18vw, (min-width: 640px) 28vw, 30vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
