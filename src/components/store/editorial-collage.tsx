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
] as const;

const COLLAGE_COLUMNS = [
  [COLLAGE_IMAGES[0], COLLAGE_IMAGES[3], COLLAGE_IMAGES[6]],
  [COLLAGE_IMAGES[1], COLLAGE_IMAGES[4], COLLAGE_IMAGES[7]],
  [COLLAGE_IMAGES[2], COLLAGE_IMAGES[5], COLLAGE_IMAGES[8]],
] as const;

const COLLAGE_TILE_FACTORS = [0.35, 0.65, 1, -0.45, -0.8, -1.1, 0.55, 0.9, 1.2] as const;

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
      const offset = Math.max(-1, Math.min(1, distance)) * 140;
      section.style.setProperty("--collage-column-one", `${-48 + offset * 0.55}px`);
      section.style.setProperty("--collage-column-two", `${24 - offset * 0.9}px`);
      section.style.setProperty("--collage-column-three", `${-72 + offset * 0.7}px`);
      section.querySelectorAll<HTMLElement>(".editorial-collage-tile").forEach((tile, index) => {
        tile.style.setProperty("--collage-tile-offset", `${offset * COLLAGE_TILE_FACTORS[index]}px`);
      });
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
