"use client";

import * as React from "react";
import type { SazitoClient } from "@sazito/client-sdk";
import {
  CalendarCheck2,
  CalendarDays,
  Clock3,
  Inbox,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  UserRound,
} from "lucide-react";

import { useAccount } from "@/components/account/account-provider";
import { AccountGate, AccountShell } from "@/components/account/account-shell";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  bookingListErrorMessage,
  bookingStatusClassName,
  bookingStatusLabel,
  formatBookingDateTime,
} from "@/lib/sazito/booking";
import { formatPrice } from "@/lib/sazito/presenters";
import { cn } from "@/lib/utils";

type BookingsResponse = Awaited<
  ReturnType<SazitoClient["booking"]["listBookings"]>
>;
type BookingsData = NonNullable<BookingsResponse["data"]>;
type BookingItem = BookingsData["items"][number];

function BookingCard({ booking }: { booking: BookingItem }) {
  const event = booking.event;
  const bookingTime = formatBookingDateTime(booking.bookingTime);
  const createdAt = formatBookingDateTime(booking.createdAt);
  const eventStart = formatBookingDateTime(event?.startTime);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="min-w-0">
          <Badge
            variant="outline"
            className={cn("border-transparent", bookingStatusClassName(booking.status))}
          >
            <CalendarCheck2 className="size-3.5" />
            {bookingStatusLabel(booking.status)}
          </Badge>
          <CardTitle className="mt-3 truncate">
            {event?.title || `رزرو شماره ${booking.id.toLocaleString("fa-IR")}`}
          </CardTitle>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
          <CalendarDays className="size-5" />
        </span>
      </CardHeader>

      <CardContent className="space-y-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {bookingTime || eventStart ? (
            <div className="flex items-start gap-2 rounded-2xl bg-background/70 p-3">
              <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <dt className="text-xs text-muted-foreground">زمان رزرو</dt>
                <dd className="mt-1 font-bold">{bookingTime || eventStart}</dd>
              </div>
            </div>
          ) : null}

          {event?.location ? (
            <div className="flex items-start gap-2 rounded-2xl bg-background/70 p-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">محل برگزاری</dt>
                <dd className="mt-1 break-words font-bold">{event.location}</dd>
              </div>
            </div>
          ) : null}
        </dl>

        <Separator />

        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {booking.attendeeName ? (
            <p className="flex items-center gap-2">
              <UserRound className="size-4 shrink-0" />
              <span className="truncate">{booking.attendeeName}</span>
            </p>
          ) : null}
          {booking.attendeePhone ? (
            <p className="flex items-center gap-2" dir="ltr">
              <Phone className="size-4 shrink-0" />
              <span className="truncate">{booking.attendeePhone}</span>
            </p>
          ) : null}
          {booking.attendeeEmail ? (
            <p className="flex items-center gap-2" dir="ltr">
              <Mail className="size-4 shrink-0" />
              <span className="truncate">{booking.attendeeEmail}</span>
            </p>
          ) : null}
          {createdAt ? (
            <p className="text-xs sm:text-left">ثبت‌شده در {createdAt}</p>
          ) : null}
        </div>

        {typeof event?.price === "number" && event.price > 0 ? (
          <p className="font-black text-primary">{formatPrice(event.price)}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function BookingsList() {
  const { client } = useCommerce();
  const { logout } = useAccount();
  const [bookings, setBookings] = React.useState<BookingItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadBookings = React.useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await client.booking.listBookings({
          cache: false,
          signal,
        });

        if (signal?.aborted) return;

        if (response.error || !response.data) {
          if (response.error?.status === 401) {
            logout();
            return;
          }

          setError(
            response.error
              ? bookingListErrorMessage(response.error)
              : "رزروها از فروشگاه دریافت نشد.",
          );
          return;
        }

        setBookings(response.data.items);
        setTotal(response.data.total ?? response.data.items.length);
      } catch {
        if (!signal?.aborted) {
          setError("ارتباط با فروشگاه برقرار نشد. دوباره تلاش کنید.");
        }
      } finally {
        if (!signal?.aborted) setIsLoading(false);
      }
    },
    [client, logout],
  );

  React.useEffect(() => {
    const controller = new AbortController();
    const frame = window.requestAnimationFrame(() => {
      void loadBookings(controller.signal);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      controller.abort();
    };
  }, [loadBookings]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-64 items-center justify-center gap-3 rounded-4xl border bg-card text-sm text-muted-foreground"
        role="status"
      >
        <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" />
        در حال دریافت رزروها…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-4xl border border-danger/25 bg-card p-8 text-center">
        <p role="alert" className="text-sm leading-7 text-danger">
          {error}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={() => void loadBookings()}
        >
          <RefreshCcw />
          تلاش دوباره
        </Button>
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-4xl border bg-card p-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Inbox className="size-7" />
        </span>
        <p className="mt-5 font-black">هنوز رزروی ثبت نشده است</p>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          رزروهای ثبت‌شده در حساب سازیتوی شما در این بخش نمایش داده می‌شوند.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground" role="status">
        {total.toLocaleString("fa-IR")} رزرو در حساب شما
      </p>
      <div className="grid gap-4 xl:grid-cols-2">
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </>
  );
}

export function BookingsPage() {
  return (
    <AccountGate>
      <AccountShell
        title="رزروهای من"
        description="رویدادها و زمان‌های رزروشده در حساب سازیتوی شما"
      >
        <BookingsList />
      </AccountShell>
    </AccountGate>
  );
}
