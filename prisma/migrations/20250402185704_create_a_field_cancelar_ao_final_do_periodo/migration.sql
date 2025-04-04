/*
  Warnings:

  - Added the required column `cancelar_ao_final_do_periodo` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "cancelar_ao_final_do_periodo" BOOLEAN NOT NULL;
