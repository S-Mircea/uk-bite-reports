import { Timestamp } from "firebase/firestore";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { enGB } from "date-fns/locale";

export function formatDate(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  if (isToday(date)) {
    return `Today at ${format(date, "HH:mm", { locale: enGB })}`;
  }
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, "HH:mm", { locale: enGB })}`;
  }
  return format(date, "d MMM yyyy 'at' HH:mm", { locale: enGB });
}

export function formatTimeAgo(timestamp: Timestamp): string {
  return formatDistanceToNow(timestamp.toDate(), {
    addSuffix: true,
    locale: enGB,
  });
}

export function formatWeight(lb?: number, oz?: number): string {
  const parts: string[] = [];
  if (lb && lb > 0) parts.push(`${lb}lb`);
  if (oz && oz > 0) parts.push(`${oz}oz`);
  return parts.join(" ") || "Not recorded";
}

export function formatLength(inches?: number): string {
  if (!inches || inches <= 0) return "Not recorded";
  return `${inches}"`;
}
