// Utility functions for Date and Time formatting across Meetings, Tasks, and Follow-ups

export function todayIso(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

export function nowTimeIso(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function nowDateTimeLocal(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

export function tomorrowDateTimeLocal(hour = 11, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, minute, 0, 0);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

export function formatTime12h(time24?: string): string {
  if (!time24) return '';
  // If already formatted with AM/PM
  if (time24.includes('AM') || time24.includes('PM') || time24.includes('am') || time24.includes('pm')) {
    return time24;
  }
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].slice(0, 2);
  if (isNaN(hours)) return time24;
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
}

export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return 'No date';
  const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.split(' ')[0];
  try {
    const [year, month, day] = cleanDate.split('-').map(Number);
    if (!year || !month || !day) return cleanDate;
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return cleanDate;
  }
}

export function formatDisplayDateTime(dateStr?: string, timeStr?: string): {
  dateFormatted: string;
  timeFormatted: string;
  combined: string;
} {
  if (!dateStr) {
    return {
      dateFormatted: 'No date',
      timeFormatted: timeStr ? formatTime12h(timeStr) : '',
      combined: timeStr ? formatTime12h(timeStr) : 'No date',
    };
  }

  let rawDate = dateStr;
  let rawTime = timeStr || '';

  if (dateStr.includes('T')) {
    const [dPart, tPart] = dateStr.split('T');
    rawDate = dPart;
    if (!rawTime) rawTime = tPart.slice(0, 5);
  } else if (dateStr.includes(' ')) {
    const [dPart, tPart] = dateStr.split(' ');
    rawDate = dPart;
    if (!rawTime) rawTime = tPart;
  }

  const dateFormatted = formatDisplayDate(rawDate);
  const timeFormatted = rawTime ? formatTime12h(rawTime) : '';

  const combined = timeFormatted
    ? `${dateFormatted} at ${timeFormatted}`
    : dateFormatted;

  return { dateFormatted, timeFormatted, combined };
}
