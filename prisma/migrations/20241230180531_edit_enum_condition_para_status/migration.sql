/*
  Warnings:

  - You are about to drop the column `condicao` on the `adverts` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ATIVO', 'INATIVO', 'PENDENTE');

-- AlterTable
ALTER TABLE "adverts" DROP COLUMN "condicao",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDENTE';

-- DropEnum
DROP TYPE "Condition";
