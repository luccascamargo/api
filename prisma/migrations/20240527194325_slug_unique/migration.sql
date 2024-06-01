/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `adverts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "adverts_slug_key" ON "adverts"("slug");
