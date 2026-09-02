import Link from "next/link";
import { ExternalLink, Leaf, PhoneCall } from "lucide-react";

import { SocialIcon } from "@/components/store/social-icon";
import { Separator } from "@/components/ui/separator";
import type { StoreChrome } from "@/lib/sazito/types";

export function StoreFooter({ store }: { store: StoreChrome }) {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="site-container py-10 sm:py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_0.7fr] md:items-end">
          <div className="max-w-xl">
            <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
              <Leaf className="size-5" />
            </span>
            <h2 className="mt-5 text-xl font-black">{store.name}</h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
              {store.description}
            </p>
          </div>
          {store.phones.length || store.socials.length ? (
            <div className="flex flex-col gap-5 md:items-end">
              {store.phones.length ? (
                <div className="md:text-left">
                  <p className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-foreground">
                    <PhoneCall className="size-4 text-primary" aria-hidden="true" />
                    تماس با فروشگاه
                  </p>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end">
                    {store.phones.map((phone) => (
                      <a
                        key={phone.href}
                        href={phone.href}
                        dir="ltr"
                        className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                        aria-label={`تماس با شماره ${phone.value}`}
                      >
                        {phone.value}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
              {store.socials.length ? (
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {store.socials.map((social) => (
                    <a
                      key={`${social.label}-${social.href}`}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-xs font-semibold transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <SocialIcon type={social.type} />
                      {social.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>ویترین مستقل فروشگاه، متصل به زیرساخت سازیتو</p>
          <Link href="/" className="inline-flex items-center gap-1 font-semibold hover:text-primary">
            بازگشت به ابتدای فروشگاه
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
