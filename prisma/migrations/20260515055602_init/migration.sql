-- CreateEnum
CREATE TYPE "account_type" AS ENUM ('FOUNDER', 'PARTNER');

-- CreateEnum
CREATE TYPE "budget_unit" AS ENUM ('MONTHLY', 'DAILY', 'PER_PROJECT');

-- CreateEnum
CREATE TYPE "application_status" AS ENUM ('PENDING', 'REVIEWED', 'CONTACTED', 'REJECTED');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "type" "account_type" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruits" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "roleDesc" TEXT NOT NULL,
    "detailContent" TEXT NOT NULL,
    "budgetAmount" INTEGER NOT NULL,
    "budgetUnit" "budget_unit" NOT NULL,
    "duration" TEXT NOT NULL,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "recruitId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "recruitTitle" TEXT NOT NULL,
    "recruitCompany" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "introduction" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "attachmentKey" TEXT,
    "attachmentName" TEXT,
    "privacyAgreedAt" TIMESTAMP(3) NOT NULL,
    "status" "application_status" NOT NULL DEFAULT 'PENDING',
    "emailNotifiedAt" TIMESTAMP(3),
    "smsNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- AddForeignKey
ALTER TABLE "recruits" ADD CONSTRAINT "recruits_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_recruitId_fkey" FOREIGN KEY ("recruitId") REFERENCES "recruits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
