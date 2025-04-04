/*
  Warnings:

  - Added the required column `marca_slug` to the `adverts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelo_slug` to the `adverts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "adverts" ADD COLUMN     "marca_slug" TEXT NOT NULL,
ADD COLUMN     "modelo_slug" TEXT NOT NULL;
