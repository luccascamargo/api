/*
  Warnings:

  - A unique constraint covering the columns `[inscricao_id]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_inscricao_id_key" ON "subscriptions"("inscricao_id");
