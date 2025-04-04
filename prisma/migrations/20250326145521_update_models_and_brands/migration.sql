/*
  Warnings:

  - You are about to drop the column `brandsId` on the `adverts` table. All the data in the column will be lost.
  - The primary key for the `brands` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `models` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `brandsId` column on the `models` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `modelo_id` on the `adverts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `brands` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `models` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "adverts" DROP CONSTRAINT "adverts_brandsId_fkey";

-- DropForeignKey
ALTER TABLE "adverts" DROP CONSTRAINT "adverts_modelo_id_fkey";

-- DropForeignKey
ALTER TABLE "models" DROP CONSTRAINT "models_brandsId_fkey";

-- AlterTable
ALTER TABLE "adverts" DROP COLUMN "brandsId",
ADD COLUMN     "marca_id" INTEGER,
DROP COLUMN "modelo_id",
ADD COLUMN     "modelo_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "brands" DROP CONSTRAINT "brands_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "brands_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "models" DROP CONSTRAINT "models_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
DROP COLUMN "brandsId",
ADD COLUMN     "brandsId" INTEGER,
ADD CONSTRAINT "models_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "adverts" ADD CONSTRAINT "adverts_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adverts" ADD CONSTRAINT "adverts_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "models" ADD CONSTRAINT "models_brandsId_fkey" FOREIGN KEY ("brandsId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
