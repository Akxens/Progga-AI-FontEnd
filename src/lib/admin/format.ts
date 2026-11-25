const BDT_FORMATTER = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a numeric or decimal string value into Bangladeshi Taka currency format:
 * e.g. "125000" -> "৳1,25,000.00"
 */
export function formatBdt(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "number" ? value : Number.parseFloat(value);
  if (Number.isNaN(num)) return "—";
  return `৳${BDT_FORMATTER.format(num)}`;
}

/**
 * Formats an ISO date/time into Asia/Dhaka date e.g. "25 Nov 2026"
 */
export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Formats an ISO date/time into Asia/Dhaka datetime e.g. "25 Nov 2026, 2:25 PM"
 */
export function formatDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * Formats an ISO date/time into relative human time (e.g. "5m ago", "2h ago", "yesterday")
 */
export function formatRelativeTime(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";

  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "yesterday";
  if (diffDay < 30) return `${diffDay}d ago`;
  return formatDate(d);
}

/**
 * Masks a mobile number: keeps prefix and last 3-4 digits, asterisks the rest.
 * e.g. "01712345678" -> "017***5678"
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const clean = phone.trim();
  if (clean.length < 8) return clean;
  const start = clean.slice(0, 5);
  const end = clean.slice(-4);
  return `${start}***${end}`;
}

/**
 * Masks an email: keeps first character and last character before @, domain visible.
 * e.g. "john.doe@example.com" -> "j***e@example.com"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes("@")) return email || "—";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/**
 * Masks full names: "Rahim Uddin" -> "R**** U****"
 */
export function maskName(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => {
      if (p.length <= 1) return p;
      return `${p[0]}${"*".repeat(Math.min(p.length - 1, 4))}`;
    })
    .join(" ");
}
