-- One YooKassa payment can now cover several tickets (mixed cart / multi-buy),
-- so tickets in the same order share a paymentId. Drop the unique constraint;
-- the plain index Ticket_paymentId_idx remains for lookups.
DROP INDEX "Ticket_paymentId_key";
