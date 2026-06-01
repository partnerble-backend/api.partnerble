-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "phone" DROP NOT NULL;

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "interestTags" TEXT[],
    "industry" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partners_accountId_key" ON "partners"("accountId");

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
