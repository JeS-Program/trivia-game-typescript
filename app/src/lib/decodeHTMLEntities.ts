export default function decodeHTMLEntities(text: string): string {
  if (typeof window === "undefined") return text; // Evita errores en SSR de Next.js
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  return doc.documentElement.textContent || "";
}