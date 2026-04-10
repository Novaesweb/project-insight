import type { NovaesFlowField } from "../types";

const CONTROL_CHARS_REGEX = new RegExp(
  `[${[
    [0x00, 0x08],
    [0x0b, 0x0c],
    [0x0e, 0x1f],
  ]
    .map(([start, end]) => `${String.fromCharCode(start)}-${String.fromCharCode(end)}`)
    .join("")}${String.fromCharCode(0x7f)}]`,
  "g",
);
const HTML_TAG_REGEX = /<[^>]*>/g;

function normalizeWhitespace(value: string) {
  return value.replace(/\r\n?/g, "\n").replace(/[^\S\n]+/g, " ").trim();
}

export function sanitizeNovaesFlowText(value: unknown, maxLength = 300) {
  const normalized = String(value ?? "")
    .replace(CONTROL_CHARS_REGEX, "")
    .replace(HTML_TAG_REGEX, "")
    .replace(/\u00A0/g, " ");

  return normalizeWhitespace(normalized).slice(0, maxLength);
}

export function sanitizeNovaesFlowEmail(value: unknown, maxLength = 160) {
  const normalized = sanitizeNovaesFlowText(value, maxLength).toLowerCase();
  if (!normalized) return "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : "";
}

export function sanitizeNovaesFlowPhone(value: unknown, maxLength = 32) {
  return String(value ?? "")
    .replace(CONTROL_CHARS_REGEX, "")
    .replace(/[^\d()+\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeNovaesFlowFieldValue(field: NovaesFlowField, value: unknown) {
  if (field.type === "email") {
    return sanitizeNovaesFlowEmail(value, field.maxLength ?? 160);
  }

  if (field.type === "tel") {
    return sanitizeNovaesFlowPhone(value, field.maxLength ?? 32);
  }

  return sanitizeNovaesFlowText(value, field.maxLength ?? 400);
}

export function sanitizeNovaesFlowFields(
  fields: NovaesFlowField[],
  values: Record<string, string>,
) {
  return fields.reduce<Record<string, string>>((accumulator, field) => {
    accumulator[field.id] = sanitizeNovaesFlowFieldValue(field, values[field.id] ?? "");
    return accumulator;
  }, {});
}
