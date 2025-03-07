/*
  Warnings:

  - Added the required column `estado_formatado` to the `adverts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "adverts" ADD COLUMN     "estado_formatado" TEXT NOT NULL;
