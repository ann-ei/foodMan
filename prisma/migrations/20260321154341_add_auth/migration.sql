/*
  Warnings:

  - Made the column `userId` on table `CookingHistory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `MealPlan` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `PantryItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Recipe` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `ShoppingListItem` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CookingHistory" DROP CONSTRAINT "CookingHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "MealPlan" DROP CONSTRAINT "MealPlan_userId_fkey";

-- DropForeignKey
ALTER TABLE "PantryItem" DROP CONSTRAINT "PantryItem_userId_fkey";

-- DropForeignKey
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_userId_fkey";

-- DropForeignKey
ALTER TABLE "ShoppingListItem" DROP CONSTRAINT "ShoppingListItem_userId_fkey";

-- AlterTable
ALTER TABLE "CookingHistory" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "MealPlan" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PantryItem" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Recipe" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ShoppingListItem" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordHash" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CookingHistory" ADD CONSTRAINT "CookingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
