import { randomBytes } from "node:crypto";
import { formatDateLong, formatMoney, formatTimeRange } from "@/lib/format";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME;

export function isTelegramConfigured(): boolean {
  return Boolean(BOT_TOKEN && BOT_USERNAME);
}

export function generateTelegramLinkToken(): string {
  return randomBytes(16).toString("hex");
}

/** Deep link that starts a chat with the bot and passes the one-time link token as the /start payload. */
export function buildTelegramConnectUrl(token: string): string {
  if (!BOT_USERNAME) throw new Error("TELEGRAM_BOT_USERNAME is not configured.");
  return `https://t.me/${BOT_USERNAME}?start=${token}`;
}

async function callTelegramApi(method: string, body: Record<string, unknown>): Promise<void> {
  if (!BOT_TOKEN) return; // not configured — notifications are best-effort, never block the caller

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Telegram API ${method} failed: ${res.status} ${detail}`);
  }
}

export async function sendTelegramMessage(chatId: string, text: string): Promise<void> {
  await callTelegramApi("sendMessage", { chat_id: chatId, text, parse_mode: "HTML" });
}

/** Best-effort — a Telegram outage should never block a booking from being created. */
export async function notifyOwnerOfNewBooking(
  chatId: string,
  booking: {
    pitchName: string;
    date: string;
    startTime: string;
    endTime: string;
    customerName: string;
    customerPhone: string;
    totalPrice: string;
    currency: string;
    reference: string;
  },
): Promise<void> {
  const text = [
    "🎉 <b>New booking request</b>",
    "",
    `🏟 ${escapeHtml(booking.pitchName)}`,
    `📅 ${escapeHtml(formatDateLong(booking.date))}`,
    `⏰ ${escapeHtml(formatTimeRange(booking.startTime, booking.endTime))}`,
    `👤 ${escapeHtml(booking.customerName)} (${escapeHtml(booking.customerPhone)})`,
    `💵 ${escapeHtml(formatMoney(booking.totalPrice, booking.currency))} — cash at the pitch`,
    `# ${escapeHtml(booking.reference)}`,
    "",
    "Open your TurfAura dashboard to message the customer on WhatsApp and approve it.",
  ].join("\n");

  try {
    await sendTelegramMessage(chatId, text);
  } catch (err) {
    console.error("Failed to send Telegram booking notification:", err);
  }
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
