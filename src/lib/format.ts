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

/**
 * Formats a date string or Date object into "dd-mm-yyyy" format.
 * Example: "2026-08-17" -> "17-08-2026"
 */
export function formatDateDDMMYYYY(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return '';
  }
}

/**
 * Formats a date/time string or Date object into combined "dd-mm-yyyy hh:mm AM/PM" format.
 * Example: "2026-07-31T14:30:00" -> "31-07-2026 02:30 PM"
 */
export function formatDateTimeDDMMYYYY12h(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';
    const datePart = formatDateDDMMYYYY(date);
    const timePart = formatTime12h(date);
    if (!datePart || timePart === '—') return '';
    return `${datePart} ${timePart}`;
  } catch {
    return '';
  }
}

/**
 * Formats activity type and JSON data into clean human-readable text
 * Example: type "task_moved", data '{"from":"Testing","to":"Done"}' -> "moved task from Testing to Done"
 */
export function formatActivityText(type: string, data?: string): string {
  if (!data) {
    if (type === 'task_archived') return 'archived task';
    if (type === 'task_created') return 'created task';
    return type.replace(/_/g, ' ');
  }

  if (data.startsWith('{') && data.endsWith('}')) {
    try {
      const parsed = JSON.parse(data);
      if (type === 'task_created') {
        return 'created task';
      }
      if (type === 'task_status_changed') {
        const from = (parsed.from || '').replace(/_/g, ' ');
        const to = (parsed.to || '').replace(/_/g, ' ');
        return `changed status from "${from}" to "${to}"`;
      }
      if (type === 'task_moved') {
        if (parsed.from && parsed.to) {
          return `moved task from "${parsed.from}" to "${parsed.to}"`;
        }
        if (parsed.to) {
          return `moved task to "${parsed.to}"`;
        }
        return 'moved task';
      }
    } catch {
      return data;
    }
  }

  return data;
}


