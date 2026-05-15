/*
  Warnings:

  - You are about to drop the column `recruitCompany` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `recruitTitle` on the `applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "applications" DROP COLUMN "recruitCompany",
DROP COLUMN "recruitTitle";
