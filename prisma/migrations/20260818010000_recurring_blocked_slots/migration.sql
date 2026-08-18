-- Weekly-recurring blocked slots ("every Monday 6-8pm"), on top of the
-- existing one-off date-specific BlockedSlot table.
CREATE TABLE "RecurringBlockedSlot" (
    "id" TEXT NOT NULL,
    "pitchId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringBlockedSlot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RecurringBlockedSlot_pitchId_dayOfWeek_idx" ON "RecurringBlockedSlot"("pitchId", "dayOfWeek");

CREATE UNIQUE INDEX "RecurringBlockedSlot_pitchId_dayOfWeek_startTime_key" ON "RecurringBlockedSlot"("pitchId", "dayOfWeek", "startTime");

ALTER TABLE "RecurringBlockedSlot" ADD CONSTRAINT "RecurringBlockedSlot_pitchId_fkey" FOREIGN KEY ("pitchId") REFERENCES "Pitch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
