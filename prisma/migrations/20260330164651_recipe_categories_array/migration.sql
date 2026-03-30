/*
  Warnings:

  - You are about to drop the column `category` on the `Recipe` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "category",
ADD COLUMN     "categories" TEXT[] DEFAULT ARRAY[]::TEXT[];
