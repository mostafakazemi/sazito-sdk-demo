import { Circle } from "lucide-react";
import { Fragment } from "react";

const DEFAULT_MESSAGES = [
  "ارسال سریع و مطمئن",
  "تضمین اصالت کالا",
  "پرداخت امن و آسان",
  "پشتیبانی واقعی",
  "انتخابی برای هر سبک",
  "قیمت‌های به‌روز",
  "پیشنهادهای ویژه هر هفته",
  "ارسال به سراسر ایران",
  "خریدی ساده و مطمئن",
  "بازگشت آسان کالا",
] as const;

export function MetroBar({ messages = DEFAULT_MESSAGES }: { messages?: readonly string[] }) {
  if (!messages.length) return null;

  return (
    <section
      aria-label="مزایای خرید از فروشگاه"
      className="metro-bar mt-5 border-y border-primary/20 bg-secondary text-secondary-foreground sm:mt-8"
    >
      <p className="sr-only">{messages.join("، ")}</p>
      <div className="metro-bar-viewport" dir="ltr">
        <div className="metro-bar-track" aria-hidden="true">
          {[0, 1].map((copy) => (
            <div className="metro-bar-group" key={copy}>
              {messages.map((message, index) => (
                <Fragment key={`${copy}-${index}`}>
                  <span className="metro-bar-item">
                    <span className="whitespace-nowrap text-[0.7rem] font-bold tracking-wide sm:text-xs">
                      {message}
                    </span>
                  </span>
                  <Circle className="metro-bar-separator size-2 opacity-60" strokeWidth={1.5} aria-hidden="true" />
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
