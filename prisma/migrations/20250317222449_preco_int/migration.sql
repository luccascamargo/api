/*
  Warnings:

  - You are about to alter the column `preco` on the `adverts` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "adverts" ALTER COLUMN "preco" SET DATA TYPE INTEGER;
