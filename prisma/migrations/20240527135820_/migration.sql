/*
  Warnings:

  - Added the required column `slug` to the `adverts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "adverts" ADD COLUMN     "slug" TEXT NOT NULL;
