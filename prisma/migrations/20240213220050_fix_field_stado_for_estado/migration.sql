/*
  Warnings:

  - You are about to drop the column `stado` on the `adverts` table. All the data in the column will be lost.
  - Added the required column `estado` to the `adverts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "adverts" DROP COLUMN "stado",
ADD COLUMN     "estado" TEXT NOT NULL;
