/*
  Warnings:

  - You are about to drop the column `marca` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `marca_slug` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `modelo` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `modelo_slug` on the `adverts` table. All the data in the column will be lost.
  - Added the required column `modelo_id` to the `adverts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "adverts" DROP COLUMN "marca",
DROP COLUMN "marca_slug",
DROP COLUMN "modelo",
DROP COLUMN "modelo_slug",
ADD COLUMN     "brandsId" TEXT,
ADD COLUMN     "modelo_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "models" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "models_slug_key" ON "models"("slug");

-- AddForeignKey
ALTER TABLE "adverts" ADD CONSTRAINT "adverts_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adverts" ADD CONSTRAINT "adverts_brandsId_fkey" FOREIGN KEY ("brandsId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
