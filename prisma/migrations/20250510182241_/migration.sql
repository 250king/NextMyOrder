/*
  Warnings:

  - Added the required column `name` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Delivery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;
