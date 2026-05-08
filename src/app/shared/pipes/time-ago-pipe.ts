import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    // ─── Guard: handle null/undefined/empty ───────────────────────
    if (!value) {
      return '';
    }

    // ─── Parse the date ───────────────────────────────────────────
    const date = new Date(value);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return value; // Return original value if it can't be parsed
    }

    // ─── Calculate difference ─────────────────────────────────────
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime(); // Milliseconds
    const diffInSec = Math.floor(diffInMs / 1000); // Seconds
    const diffInMin = Math.floor(diffInSec / 60); // Minutes
    const diffInHrs = Math.floor(diffInMin / 60); // Hours
    const diffInDays = Math.floor(diffInHrs / 24); // Days
    const diffInWeeks = Math.floor(diffInDays / 7); // Weeks
    const diffInMonths = Math.floor(diffInDays / 30); // Months (approx)
    const diffInYears = Math.floor(diffInDays / 365); // Years (approx)

    // ─── Return human-readable string ────────────────────────────
    if (diffInSec < 60) {
      return 'Just now';
    }

    if (diffInMin < 60) {
      return diffInMin === 1 ? '1 min ago' : `${diffInMin} min ago`;
    }

    if (diffInHrs < 24) {
      return diffInHrs === 1 ? '1 hour ago' : `${diffInHrs} hours ago`;
    }

    if (diffInDays === 1) {
      return 'Yesterday';
    }

    if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    }

    if (diffInWeeks < 4) {
      return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks} weeks ago`;
    }

    if (diffInMonths < 12) {
      return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
    }

    return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
  }
}
