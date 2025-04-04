/*
  Warnings:

  - You are about to alter the column `quilometragem` on the `adverts` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "adverts" ALTER COLUMN "quilometragem" SET DATA TYPE INTEGER;
