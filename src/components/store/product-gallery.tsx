"use client";

import * as React from "react";
import Image from "next/image";

import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { ProductImageView } from "@/lib/sazito/types";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImageView[];
  productName: string;
}) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [selected, setSelected] = React.useState(0);
  const galleryImages = images.length
    ? images
    : [
        {
          id: -1,
          src: "/product-placeholder.svg",
          alt: `تصویر جایگزین ${productName}`,
          width: 800,
          height: 800,
        },
      ];

  React.useEffect(() => {
    if (!api) return;
    const updateSelected = () => setSelected(api.selectedScrollSnap());
    const frame = window.requestAnimationFrame(updateSelected);
    api.on("select", updateSelected);
    return () => {
      window.cancelAnimationFrame(frame);
      api.off("select", updateSelected);
    };
  }, [api]);

  return (
    <div className="min-w-0">
      <Carousel setApi={setApi} opts={{ direction: "rtl", loop: galleryImages.length > 1 }}>
        <CarouselContent>
          {galleryImages.map((image) => (
            <CarouselItem key={image.id}>
              <div className="relative aspect-square overflow-hidden rounded-4xl border bg-card">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-7 sm:p-10"
                  priority={image === galleryImages[0]}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {galleryImages.length > 1 ? (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        ) : null}
      </Carousel>

      {galleryImages.length > 1 ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1" aria-label="تصاویر محصول">
          {galleryImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => api?.scrollTo(index)}
              aria-label={`نمایش تصویر ${new Intl.NumberFormat("fa-IR").format(index + 1)}`}
              aria-current={selected === index}
              className={cn(
                "relative size-18 shrink-0 overflow-hidden rounded-xl border bg-card outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                selected === index ? "border-primary" : "hover:border-primary/40",
              )}
            >
              <Image src={image.src} alt="" fill sizes="72px" className="object-contain p-2" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
