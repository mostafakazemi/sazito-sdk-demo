"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Pause, Play, Sparkles } from "lucide-react";
import * as React from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/sazito/presenters";
import type { ProductCardView, StoreChrome } from "@/lib/sazito/types";

const AUTOPLAY_INTERVAL = 6000;

export function StoreHero({
  store,
  products,
}: {
  store: StoreChrome;
  products: ProductCardView[];
}) {
  const slides = products.length ? products.slice(0, 6) : [null];
  const [api, setApi] = React.useState<CarouselApi>();
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (!api) return;
    const updateActiveSlide = (carouselApi: CarouselApi) => {
      if (!carouselApi) return;
      setActiveSlide(carouselApi.selectedScrollSnap());
    };
    updateActiveSlide(api);
    api.on("select", updateActiveSlide);
    return () => {
      api.off("select", updateActiveSlide);
    };
  }, [api]);

  React.useEffect(() => {
    if (!api || isPaused || slides.length < 2) return;
    const timer = window.setInterval(() => api.scrollNext(), AUTOPLAY_INTERVAL);
    return () => window.clearInterval(timer);
  }, [api, isPaused, slides.length]);

  return (
    <section className="site-container pt-5 sm:pt-8">
      <Carousel
        setApi={setApi}
        opts={{ direction: "rtl", loop: slides.length > 1 }}
        className="group hero-mesh overflow-hidden rounded-4xl text-white shadow-[0_28px_80px_-38px_rgba(31,42,36,0.8)]"
      >
        <div className="hero-spotlight" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-32 left-16 size-96 rounded-full border border-white/10" />
        {slides.length > 1 ? (
          <button
            type="button"
            onClick={() => setIsPaused((paused) => !paused)}
            className="absolute left-5 top-5 z-20 inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white opacity-100 backdrop-blur transition-opacity hover:bg-black/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
            aria-label={isPaused ? "پخش خودکار اسلایدها" : "توقف خودکار اسلایدها"}
            title={isPaused ? "پخش" : "توقف"}
          >
            {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </button>
        ) : null}
        <CarouselContent className="-mr-0">
          {slides.map((product, index) => (
            <CarouselItem key={product?.id ?? `empty-${index}`} className="pr-0">
              <div data-active={index === activeSlide} className="hero-slide relative grid min-h-[32rem] items-center gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-14">
                <div className="hero-copy z-10 max-w-xl">
                  <Badge className="border border-white/20 bg-white/12 text-white backdrop-blur" variant="outline">
                    <Sparkles />
                    {index === 0 ? "پیشنهاد منتخب فروشگاه" : "انتخابی برای شما"}
                  </Badge>
                  <p className="mt-6 text-sm font-bold text-white/65">{store.name}</p>
                  <h1 className="mt-2 text-4xl leading-[1.35] font-black sm:text-5xl lg:text-6xl">
                    {product ? product.name : store.name}
                  </h1>
                  <p className="mt-5 max-w-lg text-base leading-8 text-white/78 sm:text-lg">
                    {product
                      ? product.category
                        ? `انتخابی تازه از دسته ${product.category} با کیفیتی که می‌توانید به آن اعتماد کنید.`
                        : "محصولی تازه برای تجربه خریدی ساده و مطمئن."
                      : store.description}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                      <a href="#newest">
                        دیدن محصولات
                        <ArrowLeft />
                      </a>
                    </Button>
                    {product ? (
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="border-white/25 bg-white/8 text-white hover:bg-white/15 hover:text-white"
                      >
                        <Link href={product.href}>مشاهده محصول</Link>
                      </Button>
                    ) : null}
                  </div>
                  <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/70">
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                      اطلاعات مستقیم از سازیتو
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                      قیمت و موجودی به‌روز
                    </span>
                  </div>
                </div>

                {product?.image ? (
                  <Link
                    href={product.href}
                    className="hero-product-image group/product relative mx-auto block w-full max-w-md rounded-4xl outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
                  >
                    <div className="hero-product-surface relative overflow-hidden rounded-4xl border border-white/30 shadow-2xl">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#f8f7f3]">
                    <Image
                      src={product.image.src}
                      alt={product.image.alt}
                      fill
                      sizes="(min-width: 1600px) 608px, (min-width: 1024px) 448px, (max-width: 640px) 85vw, 448px"
                      className="object-cover transition-transform duration-700 group-hover/product:scale-[1.04] group-focus-visible/product:scale-[1.04]"
                      loading={index === 0 ? "eager" : "lazy"}
                      priority={index === 0}
                    />
                    </div>
                    <div className="flex items-center justify-between gap-4 bg-[#172e26] px-5 py-4 text-white sm:px-6 sm:py-5">
                      <div className="min-w-0">
                      <p className="line-clamp-2 text-sm leading-6 font-bold">{product.name}</p>
                      <p className="mt-1 text-base font-bold text-[#b9e4ce]">
                        {product.price ? formatPrice(product.price.current) : "قیمت نامشخص"}
                      </p>
                      </div>
                    </div>
                    </div>
                  </Link>
                ) : (
                  <div className="mx-auto flex aspect-square w-full max-w-md items-center justify-center rounded-4xl border border-white/15 bg-white/8 p-10 text-center text-white/65">
                    محصولات تازه فروشگاه به‌زودی اینجا دیده می‌شوند.
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {slides.length > 1 ? (
          <>
            <CarouselPrevious
              aria-label="اسلاید قبلی"
              className="right-3 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:right-5"
            />
            <CarouselNext
              aria-label="اسلاید بعدی"
              className="left-3 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:left-5"
            />
            <div className="absolute inset-x-6 bottom-5 z-20 flex items-center justify-between gap-4 sm:inset-x-10">
              <div className="flex items-center gap-2" role="tablist" aria-label="انتخاب اسلاید">
                {slides.map((product, index) => (
                  <button
                    key={product?.id ?? `dot-${index}`}
                    type="button"
                    role="tab"
                    aria-selected={activeSlide === index}
                    aria-label={`نمایش اسلاید ${index + 1}`}
                    onClick={() => api?.scrollTo(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeSlide === index ? "w-10 bg-white" : "w-4 bg-white/35 hover:bg-white/65"
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        ) : null}
      </Carousel>
    </section>
  );
}
