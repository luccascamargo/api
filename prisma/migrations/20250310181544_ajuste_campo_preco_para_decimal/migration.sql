/*
  Warnings:

  - You are about to alter the column `preco` on the `adverts` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "adverts" ALTER COLUMN "preco" SET DATA TYPE DECIMAL(65,30);
