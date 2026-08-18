import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";
import { Prisma } from "@/generated/prisma/client";

interface TelegramUpdate {
  message?: {
    text?: string;
    chat: { id: number };
  };
}

// Best-effort: a reply is a courtesy, not the point of this handler. If
// Telegram's API hiccups on the way out, we still want to return 200 for
// the DB work we already did — an error here would make Telegram retry the
// whole webhook delivery, re-processing an already-consumed /start token.
async function reply(chatId: string, text: string): Promise<void> {
  try {
    await sendTelegramMessage(chatId, text);
  } catch (err) {
    console.error("Failed to send Telegram reply:", err);
  }
}

/**
 * Receives updates from Telegram (registered once via the Bot API's
 * `setWebhook`, see README). The only thing this bot does is handle the
 * `/start <token>` deep link an owner opens from Settings to link their
 * Telegram chat for booking notifications.
 */
export async function POST(request: NextRequest) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret) {
    const secret = request.headers.get("x-telegram-bot-api-secret-token");
    if (secret !== expectedSecret) {
      return NextResponse.json({ error: "Invalid secret token." }, { status: 401 });
    }
  }

  const update: TelegramUpdate = await request.json();
  const message = update.message;
  const text = message?.text?.trim();
  if (!message || !text?.startsWith("/start")) {
    return NextResponse.json({ ok: true });
  }

  const chatId = String(message.chat.id);
  const token = text.slice("/start".length).trim();

  if (!token) {
    await reply(chatId, "Open the “Connect Telegram” link from your TurfAura settings to link this chat.");
    return NextResponse.json({ ok: true });
  }

  const owner = await prisma.owner.findUnique({ where: { telegramLinkToken: token } });
  if (!owner) {
    await reply(chatId, "This link has expired or was already used. Generate a new one from your TurfAura settings.");
    return NextResponse.json({ ok: true });
  }

  try {
    await prisma.owner.update({
      where: { id: owner.id },
      data: { telegramChatId: chatId, telegramLinkToken: null },
    });
    await reply(chatId, `✅ Telegram connected! You'll get a message here whenever a new booking comes in for ${owner.name}'s pitches.`);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      await reply(chatId, "This Telegram account is already linked to a different TurfAura account.");
    } else {
      throw err;
    }
  }

  return NextResponse.json({ ok: true });
}
