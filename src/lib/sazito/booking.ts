export type BookingStatus = "pending" | "confirmed" | "cancelled";

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "در انتظار تأیید",
  confirmed: "تأییدشده",
  cancelled: "لغوشده",
};

export function bookingStatusLabel(status: string) {
  return STATUS_LABELS[status as BookingStatus] ?? "وضعیت نامشخص";
}

export function formatBookingDateTime(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function bookingStatusClassName(status: string) {
  if (status === "confirmed") return "bg-primary/10 text-primary";
  if (status === "cancelled") return "bg-danger/10 text-danger";
  return "bg-highlight/15 text-highlight-foreground";
}
