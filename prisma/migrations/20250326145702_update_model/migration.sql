/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `models` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "models_nome_key" ON "models"("nome");
