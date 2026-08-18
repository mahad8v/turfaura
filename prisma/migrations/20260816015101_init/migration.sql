-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_PAYMENT', 'AWAITING_CONFIRMATION', 'CONFIRMED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('NOT_APPLICABLE', 'REQUESTED', 'APPROVED', 'PAID', 'DENIED');

-- CreateEnum
CREATE TYPE "PaymentProviderKind" AS ENUM ('WAVE_MANUAL', 'WAVE_API');

-- CreateEnum
CREATE TYPE "DepositType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "OwnerRole" AS ENUM ('OWNER', 'ADMIN');

-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL,
    "supabaseUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" "OwnerRole" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pitch" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "basePricePerHour" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "depositType" "DepositType" NOT NULL DEFAULT 'PERCENTAGE',
    "depositValue" DECIMAL(10,2) NOT NULL,
    "slotDurationMinutes" INTEGER NOT NULL DEFAULT 60,
    "openTime" TEXT NOT NULL DEFAULT '06:00',
    "closeTime" TEXT NOT NULL DEFAULT '22:00',
    "wavePaymentLink" TEXT,
    "wavePhoneNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pitch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PitchPhoto" (
    "id" TEXT NOT NULL,
    "pitchId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PitchPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceOverride" (
    "id" TEXT NOT NULL,
    "pitchId" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "pricePerHour" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "PriceOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedSlot" (
    "id" TEXT NOT NULL,
    "pitchId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRule" (
    "id" TEXT NOT NULL,
    "pitchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefundRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundTier" (
    "id" TEXT NOT NULL,
    "refundRuleId" TEXT NOT NULL,
    "minHoursBefore" INTEGER NOT NULL,
    "refundPercent" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RefundTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "pitchId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "depositAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentProvider" "PaymentProviderKind" NOT NULL DEFAULT 'WAVE_MANUAL',
    "paymentReference" TEXT,
    "paymentSubmittedAt" TIMESTAMP(3),
    "paymentConfirmedAt" TIMESTAMP(3),
    "paymentConfirmedBy" TEXT,
    "holdExpiresAt" TIMESTAMP(3),
    "refundStatus" "RefundStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "refundPercent" INTEGER,
    "refundAmount" DECIMAL(10,2),
    "refundRequestedAt" TIMESTAMP(3),
    "refundProcessedAt" TIMESTAMP(3),
    "refundNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Owner_supabaseUserId_key" ON "Owner"("supabaseUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_email_key" ON "Owner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pitch_slug_key" ON "Pitch"("slug");

-- CreateIndex
CREATE INDEX "Pitch_ownerId_idx" ON "Pitch"("ownerId");

-- CreateIndex
CREATE INDEX "PitchPhoto_pitchId_idx" ON "PitchPhoto"("pitchId");

-- CreateIndex
CREATE INDEX "PriceOverride_pitchId_idx" ON "PriceOverride"("pitchId");

-- CreateIndex
CREATE INDEX "BlockedSlot_pitchId_date_idx" ON "BlockedSlot"("pitchId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RefundRule_pitchId_key" ON "RefundRule"("pitchId");

-- CreateIndex
CREATE INDEX "RefundTier_refundRuleId_idx" ON "RefundTier"("refundRuleId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_reference_key" ON "Booking"("reference");

-- CreateIndex
CREATE INDEX "Booking_pitchId_date_idx" ON "Booking"("pitchId", "date");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- AddForeignKey
ALTER TABLE "Pitch" ADD CONSTRAINT "Pitch_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PitchPhoto" ADD CONSTRAINT "PitchPhoto_pitchId_fkey" FOREIGN KEY ("pitchId") REFERENCES "Pitch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceOverride" ADD CONSTRAINT "PriceOverride_pitchId_fkey" FOREIGN KEY ("pitchId") REFERENCES "Pitch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedSlot" ADD CONSTRAINT "BlockedSlot_pitchId_fkey" FOREIGN KEY ("pitchId") REFERENCES "Pitch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRule" ADD CONSTRAINT "RefundRule_pitchId_fkey" FOREIGN KEY ("pitchId") REFERENCES "Pitch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundTier" ADD CONSTRAINT "RefundTier_refundRuleId_fkey" FOREIGN KEY ("refundRuleId") REFERENCES "RefundRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_pitchId_fkey" FOREIGN KEY ("pitchId") REFERENCES "Pitch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
