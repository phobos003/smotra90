-- Add email delivery tracking to Ticket
ALTER TABLE "Ticket" ADD COLUMN "emailSent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Ticket" ADD COLUMN "emailSentAt" TIMESTAMP(3);
ALTER TABLE "Ticket" ADD COLUMN "emailError" TEXT;
