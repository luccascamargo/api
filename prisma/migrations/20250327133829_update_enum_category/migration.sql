/*
  Warnings:

  - The values [CAMINHAO,MOTO] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Category_new" AS ENUM ('CARROS', 'CAMINHOES', 'MOTOS');
ALTER TABLE "brands" ALTER COLUMN "categoria" TYPE "Category_new" USING ("categoria"::text::"Category_new");
ALTER TABLE "models" ALTER COLUMN "categoria" TYPE "Category_new" USING ("categoria"::text::"Category_new");
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "Category_old";
COMMIT;
