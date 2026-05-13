-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "address" TEXT,
ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "aiSummaryAt" TIMESTAMP(3),
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "trustCheckedAt" TIMESTAMP(3),
ADD COLUMN     "trustFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "trustScore" INTEGER;

-- CreateTable
CREATE TABLE "AdminCompany" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminCompany_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminCompany_adminId_idx" ON "AdminCompany"("adminId");

-- CreateIndex
CREATE INDEX "AdminCompany_companyId_idx" ON "AdminCompany"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminCompany_adminId_companyId_key" ON "AdminCompany"("adminId", "companyId");

-- AddForeignKey
ALTER TABLE "AdminCompany" ADD CONSTRAINT "AdminCompany_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminCompany" ADD CONSTRAINT "AdminCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
