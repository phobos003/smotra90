-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('ADULT', 'CHILD', 'FAMILY');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'PAID', 'USED', 'REFUNDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "TicketDate" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "capacity" INTEGER NOT NULL DEFAULT 50,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "type" "TicketType" NOT NULL,
    "price" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "visitDate" DATE NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TicketDate_date_key" ON "TicketDate"("date");

-- CreateIndex
CREATE INDEX "TicketDate_date_idx" ON "TicketDate"("date");

-- CreateIndex
CREATE INDEX "TicketDate_isActive_idx" ON "TicketDate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_paymentId_key" ON "Ticket"("paymentId");

-- CreateIndex
CREATE INDEX "Ticket_paymentId_idx" ON "Ticket"("paymentId");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_visitDate_idx" ON "Ticket"("visitDate");

-- CreateIndex
CREATE INDEX "Ticket_email_idx" ON "Ticket"("email");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_visitDate_fkey" FOREIGN KEY ("visitDate") REFERENCES "TicketDate"("date") ON DELETE RESTRICT ON UPDATE CASCADE;
