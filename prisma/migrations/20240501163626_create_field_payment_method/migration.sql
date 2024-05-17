/*
  Warnings:

  - Added the required column `payment_method` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "payment_method" BOOLEAN NOT NULL;
