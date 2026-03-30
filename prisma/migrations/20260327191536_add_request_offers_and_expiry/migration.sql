-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "RequestOffer" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequestOffer_requestId_idx" ON "RequestOffer"("requestId");

-- CreateIndex
CREATE INDEX "RequestOffer_companyId_idx" ON "RequestOffer"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestOffer_requestId_companyId_key" ON "RequestOffer"("requestId", "companyId");

-- CreateIndex
CREATE INDEX "Request_expiresAt_idx" ON "Request"("expiresAt");

-- AddForeignKey
ALTER TABLE "RequestOffer" ADD CONSTRAINT "RequestOffer_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestOffer" ADD CONSTRAINT "RequestOffer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
