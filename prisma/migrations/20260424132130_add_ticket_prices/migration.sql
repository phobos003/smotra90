-- CreateTable
CREATE TABLE "TicketPrice" (
    "type" "TicketType" NOT NULL,
    "label" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketPrice_pkey" PRIMARY KEY ("type")
);
