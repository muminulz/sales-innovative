import { ExtractedContact } from '../types';

export function cleanPhone(str: string): string {
  if (!str) return '';
  let cleaned = str.replace(/[\s\-()\\./]/g, '');
  cleaned = cleaned.replace(/[^+\d]/g, '');
  if (cleaned.includes('+')) {
    const parts = cleaned.split('+');
    if (parts.length > 1) {
      cleaned = '+' + parts.slice(1).join('').replace(/[^+\d]/g, '');
    }
  }
  return cleaned;
}

export function isValidPhone(str: string): boolean {
  if (!str) return false;
  const digits = str.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 16;
}

export function isValidEmail(str: string): boolean {
  if (!str) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str);
}

export function cleanName(str: string): string {
  if (!str) return '';
  let cleaned = str.replace(/[\u{1F000}-\u{1FFFF}]/gu, '');
  cleaned = cleaned.replace(/[\u2600-\u27BF]/g, '');
  cleaned = cleaned.replace(/[\uFE00-\uFEFF]/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/https?:\/\/\S+/gi, '');
  cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
  cleaned = cleaned.replace(/\+?\d[\d\s\-()]{6,18}\d/g, '');
  cleaned = cleaned.replace(/^[^\w\s\u0980-\u09FF]+/, '').replace(/[^\w\s\u0980-\u09FF]+$/, '');
  cleaned = cleaned.trim();
  if (cleaned.length < 2) return '';
  if (/^\d+$/.test(cleaned)) return '';
  return cleaned;
}

export function extractContact(text: string): ExtractedContact {
  if (!text || text.trim() === '') {
    return { phone: '', name: '', email: '' };
  }

  const lines = text.split(/\r?\n/);
  let phone = '';
  let name = '';
  let email = '';

  // 1. Phone extraction
  const phoneLabels = [
    /phone\s*number/i,
    /phone\s*[:：=-]/i,
    /mobile\s*number/i,
    /mobile\s*[:：=-]/i,
    /contact\s*number/i,
    /contact\s*[:：=-]/i,
    /whatsapp\s*number/i,
    /whatsapp\s*[:：=-]/i,
    /telephone/i,
    /ফোন\s*নম্বর/i,
    /ফোন\s*[:：=-]/i,
    /মোবাইল\s*নম্বর/i,
    /মোবাইল\s*[:：=-]/i,
    /যোগাযোগ\s*নম্বর/i,
    /যোগাযোগ\s*[:：=-]/i,
  ];
  const phoneRegex = /(\+?\d[\d\s\-()]{6,18}\d)/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let matched = false;
    for (const label of phoneLabels) {
      if (label.test(trimmed)) {
        const parts = trimmed.split(/[:：=-]/);
        if (parts.length >= 2) {
          let candidate = parts.slice(1).join(':').trim();
          candidate = cleanPhone(candidate);
          if (candidate && isValidPhone(candidate)) {
            phone = candidate;
            matched = true;
            break;
          }
        }
      }
    }
    if (matched) break;
  }

  if (!phone) {
    // Check line by line first
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length > 70) continue;
      const matches = trimmed.match(phoneRegex);
      if (matches) {
        for (const m of matches) {
          const cleaned = cleanPhone(m);
          if (cleaned && isValidPhone(cleaned)) {
            phone = cleaned;
            break;
          }
        }
        if (phone) break;
      }
    }
  }

  if (!phone) {
    const allMatches = text.match(phoneRegex);
    if (allMatches) {
      for (const m of allMatches) {
        const cleaned = cleanPhone(m);
        if (cleaned && isValidPhone(cleaned)) {
          phone = cleaned;
          break;
        }
      }
    }
  }

  // 2. Name extraction
  const nameLabels = [
    /full\s*name\s*[:：=-]/i,
    /student\s*name\s*[:：=-]/i,
    /customer\s*name\s*[:：=-]/i,
    /name\s*[:：=-]/i,
    /নাম\s*[:：=-]/i,
    /পুরো\s*নাম\s*[:：=-]/i,
    /শিক্ষার্থীর\s*নাম\s*[:：=-]/i,
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let found = false;
    for (const label of nameLabels) {
      if (label.test(trimmed)) {
        const parts = trimmed.split(/[:：=-]/);
        if (parts.length >= 2) {
          let candidate = parts.slice(1).join(':').trim();
          candidate = cleanName(candidate);
          if (candidate && candidate.length > 1) {
            name = candidate;
            found = true;
            break;
          }
        }
      }
    }
    if (found) break;
  }

  if (!name) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length > 50) continue;
      if (isValidPhone(cleanPhone(trimmed))) continue;
      if (isValidEmail(trimmed)) continue;
      if (/https?:\/\//i.test(trimmed)) continue;
      const words = trimmed.split(/\s+/).filter((w) => w.length > 1);
      if (words.length >= 2 && words.length <= 5) {
        const clean = cleanName(trimmed);
        if (clean && clean.length > 2 && !/^\d/.test(clean)) {
          name = clean;
          break;
        }
      }
    }
  }

  // 3. Email extraction
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatches = text.match(emailRegex);
  if (emailMatches && emailMatches.length > 0) {
    let bestEmail = emailMatches[0];
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        /email\s*[:：=-]/i.test(trimmed) ||
        /ইমেইল\s*[:：=-]/i.test(trimmed) ||
        /মেইল\s*[:：=-]/i.test(trimmed)
      ) {
        const parts = trimmed.split(/[:：=-]/);
        if (parts.length >= 2) {
          const candidate = parts.slice(1).join(':').trim();
          const found = candidate.match(emailRegex);
          if (found && found.length > 0) {
            bestEmail = found[0];
            break;
          }
        }
      }
    }
    if (isValidEmail(bestEmail)) {
      email = bestEmail.toLowerCase();
    } else {
      for (const e of emailMatches) {
        if (isValidEmail(e)) {
          email = e.toLowerCase();
          break;
        }
      }
    }
  }

  return { phone, name, email };
}
