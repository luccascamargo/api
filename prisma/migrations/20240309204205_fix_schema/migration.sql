/*
  Warnings:

  - You are about to drop the column `id_ano_modelo` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `id_marca` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `id_modelo` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `id_tipo` on the `adverts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "adverts" DROP COLUMN "id_ano_modelo",
DROP COLUMN "id_marca",
DROP COLUMN "id_modelo",
DROP COLUMN "id_tipo";
