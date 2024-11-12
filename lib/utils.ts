import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(fullName: string | null | undefined): string {
  let words = fullName?.split(" ");
  let initials = words?.map((word) => word.charAt(0));
  let result = initials?.join("");
  result = result?.toUpperCase();
  return result || "U";
}
