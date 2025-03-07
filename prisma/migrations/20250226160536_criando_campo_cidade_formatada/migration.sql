/*
  Warnings:

  - Added the required column `cidade_formatada` to the `adverts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "adverts" ADD COLUMN     "cidade_formatada" TEXT NOT NULL,
ADD COLUMN     "descricao_formatada" TEXT;
