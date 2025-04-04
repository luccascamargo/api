/*
  Warnings:

  - Added the required column `ciclo` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "ciclo" TEXT NOT NULL,
ALTER COLUMN "status" SET DATA TYPE TEXT;
