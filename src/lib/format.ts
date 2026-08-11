/**
 * Formats a date string or Date object into Indian Date format
 * Example: "2026-01-26" -> "26 January 2026"
 */
export function formatDateIndian(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '—';
  
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '—';
    
    // Format options for Indian style: "26 January 2026"
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return '—';
  }
}

/**
 * Formats a date/time string or Date object into 12-hour Time format
 * Example: "2026-07-31T14:30:00" -> "2:30 PM"
 */
export function formatTime12h(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '—';
  
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '—';
    
    // Format options for 12-hour format: "2:30 PM"
    return date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toUpperCase();
  } catch {
    return '—';
  }
}

/**
 * Formats a date and time string or Date object into combined Indian Date & Time format
 * Example: "2026-07-31T14:30:00" -> "31 July 2026, 2:30 PM"
 */
export function formatDateTimeIndian(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '—';
  const dateStr = formatDateIndian(dateInput);
  const timeStr = formatTime12h(dateInput);
  if (dateStr === '—') return '—';
  return `${dateStr}, ${timeStr}`;
}
