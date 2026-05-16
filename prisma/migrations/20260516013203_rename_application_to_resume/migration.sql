/*
  Warnings:

  - You are about to drop the `applications` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "resume_status" AS ENUM ('PENDING', 'REVIEWED', 'CONTACTED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_accountId_fkey";

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_recruitId_fkey";

-- DropTable
DROP TABLE "applications";

-- DropEnum
DROP TYPE "application_status";

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "recruitId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "introduction" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "attachmentKey" TEXT,
    "attachmentName" TEXT,
    "privacyAgreedAt" TIMESTAMP(3) NOT NULL,
    "status" "resume_status" NOT NULL DEFAULT 'PENDING',
    "emailNotifiedAt" TIMESTAMP(3),
    "smsNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_recruitId_fkey" FOREIGN KEY ("recruitId") REFERENCES "recruits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
