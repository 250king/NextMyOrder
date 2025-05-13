/*
  Warnings:

  - You are about to alter the column `price` on the `Item` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `weight` on the `Item` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "weight" SET DATA TYPE DECIMAL(65,30);
