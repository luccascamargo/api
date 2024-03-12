/*
  Warnings:

  - You are about to drop the column `board` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `board_value` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `condition` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `doors` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `mileage` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `model_value` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `plate` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `transmission` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `type_value` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `year_model` on the `adverts` table. All the data in the column will be lost.
  - You are about to drop the column `year_model_value` on the `adverts` table. All the data in the column will be lost.
  - Added the required column `ano_modelo` to the `adverts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cambio` to the `adverts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cidade` to the `adverts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cor` to the `adverts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_ano_modelo` to the `adverts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_marca` to the `adverts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_modelo` to the `adverts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_tipo` to the `adverts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marca` to the `adverts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelo` to the `adverts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placa` to the `adverts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `portas` to the `adverts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preco` to the `adverts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quilometragem` to the `adverts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stado` to the `adverts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `adverts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "adverts" DROP COLUMN "board",
DROP COLUMN "board_value",
DROP COLUMN "city",
DROP COLUMN "color",
DROP COLUMN "condition",
DROP COLUMN "created_at",
DROP COLUMN "description",
DROP COLUMN "doors",
DROP COLUMN "mileage",
DROP COLUMN "model",
DROP COLUMN "model_value",
DROP COLUMN "plate",
DROP COLUMN "price",
DROP COLUMN "state",
DROP COLUMN "transmission",
DROP COLUMN "type",
DROP COLUMN "type_value",
DROP COLUMN "updated_at",
DROP COLUMN "year_model",
DROP COLUMN "year_model_value",
ADD COLUMN     "ano_modelo" INTEGER NOT NULL,
ADD COLUMN     "cambio" TEXT NOT NULL,
ADD COLUMN     "cidade" TEXT NOT NULL,
ADD COLUMN     "condicao" "Condition" NOT NULL DEFAULT 'REQUESTED',
ADD COLUMN     "cor" TEXT NOT NULL,
ADD COLUMN     "data_atualizacao" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "data_cricao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "id_ano_modelo" TEXT NOT NULL,
ADD COLUMN     "id_marca" TEXT NOT NULL,
ADD COLUMN     "id_modelo" TEXT NOT NULL,
ADD COLUMN     "id_tipo" TEXT NOT NULL,
ADD COLUMN     "marca" TEXT NOT NULL,
ADD COLUMN     "modelo" TEXT NOT NULL,
ADD COLUMN     "placa" TEXT NOT NULL,
ADD COLUMN     "portas" TEXT NOT NULL,
ADD COLUMN     "preco" INTEGER NOT NULL,
ADD COLUMN     "quilometragem" INTEGER NOT NULL,
ADD COLUMN     "stado" TEXT NOT NULL,
ADD COLUMN     "tipo" TEXT NOT NULL;
