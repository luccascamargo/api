/*
  Warnings:

  - You are about to drop the column `field_name` on the `photos` table. All the data in the column will be lost.
  - You are about to drop the column `version_id` on the `photos` table. All the data in the column will be lost.
  - Added the required column `key` to the `photos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "photos" DROP COLUMN "field_name",
DROP COLUMN "version_id",
ADD COLUMN     "key" TEXT NOT NULL;
