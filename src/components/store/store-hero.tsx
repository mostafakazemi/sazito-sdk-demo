import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/sazito/presenters";
import type { ProductCardView, StoreChrome } from "@/lib/sazito/types";

export function StoreHero({
  store,
  product,
}: {
  store: StoreChrome;
  product: ProductCardView | null;
}) {
  return (
    <section className="site-container pt-5 sm:pt-8">
      <div className="hero-mesh relative isolate overflow-hidden rounded-4xl text-white shadow-[0_28px_80px_-38px_rgba(31,42,36,0.8)]">
        <div className="absolute -right-20 -top-24 size-80 rounded-full border border-white/10" />
        <div className="absolute -bottom-32 left-16 size-96 rounded-full border border-white/10" />
        <div className="relative grid min-h-[30rem] items-center gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-14">
          <div className="z-10 max-w-xl">
            <Badge className="border border-white/20 bg-white/12 text-white backdrop-blur" variant="outline">
              <Sparkles />
              یک ویترین تازه، ساده و زنده
            </Badge>
            <h1 className="mt-6 text-4xl leading-[1.35] font-black sm:text-5xl lg:text-6xl">
              {store.name}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-white/78 sm:text-lg">
              {store.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <a href="#newest">
                  دیدن محصولات
                  <ArrowLeft />
                </a>
              </Button>
              {product ? (
                <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/8 text-white hover:bg-white/15 hover:text-white">
                  <Link href={product.href}>انتخاب محبوب امروز</Link>
                </Button>
              ) : null}
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/70">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4" />اطلاعات مستقیم از سازیتو</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="size-4" />قیمت و موجودی به‌روز</span>
            </div>
          </div>

          {product?.image ? (
            <Link
              href={product.href}
              className="group relative mx-auto block aspect-square w-full max-w-md overflow-hidden rounded-4xl border border-white/20 bg-white/94 p-5 shadow-2xl"
            >
              <Image
                src={product.image.src}
                alt={product.image.alt}
                fill
                sizes="(max-width: 1024px) 80vw, 40vw"
                className="object-contain p-8 transition-transform duration-500 group-hover:scale-[1.03]"
                priority
              />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-foreground/88 p-4 text-white backdrop-blur">
                <p className="truncate font-bold">{product.name}</p>
                <p className="mt-1 text-sm text-white/75">
                  {product.price ? formatPrice(product.price.current) : "قیمت نامشخص"}
                </p>
              </div>
            </Link>
          ) : (
            <div className="mx-auto flex aspect-square w-full max-w-md items-center justify-center rounded-4xl border border-white/15 bg-white/8 p-10 text-center text-white/65">
              محصولات تازه فروشگاه به‌زودی اینجا دیده می‌شوند.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
