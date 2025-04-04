/*
  Warnings:

  - Added the required column `categoria` to the `brands` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('CARRO', 'CAMINHAO', 'MOTO');

-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "categoria" "Category" NOT NULL;

-- AlterTable
ALTER TABLE "models" ADD COLUMN     "brandsId" TEXT;

-- AddForeignKey
ALTER TABLE "models" ADD CONSTRAINT "models_brandsId_fkey" FOREIGN KEY ("brandsId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
