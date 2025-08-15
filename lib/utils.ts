import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function formatDatetime(datetime: string) {
  return dayjs(datetime).format("YYYY/MM/DD HH:mm");
}

export function formatTime(datetime: string) {
  return dayjs(datetime).format("HH:mm");
}
