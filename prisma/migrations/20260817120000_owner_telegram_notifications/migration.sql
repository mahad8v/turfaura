-- Lets an owner link a Telegram chat to receive an instant notification
-- whenever a new booking comes in for one of their pitches.
ALTER TABLE "Owner" ADD COLUMN "telegramChatId" TEXT;
ALTER TABLE "Owner" ADD COLUMN "telegramLinkToken" TEXT;

CREATE UNIQUE INDEX "Owner_telegramChatId_key" ON "Owner"("telegramChatId");
CREATE UNIQUE INDEX "Owner_telegramLinkToken_key" ON "Owner"("telegramLinkToken");
