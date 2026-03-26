ALTER TYPE "RequestStatus" ADD VALUE IF NOT EXISTS 'ACCEPTED';

ALTER TABLE "Request"
  RENAME COLUMN "message" TO "description";

ALTER TABLE "Request"
  ALTER COLUMN "serviceId" DROP NOT NULL,
  ALTER COLUMN "companyId" DROP NOT NULL;

ALTER TABLE "Request"
  ADD COLUMN "category" "ServiceCategory",
  ADD COLUMN "city" TEXT,
  ADD COLUMN "imageUrl" TEXT;

ALTER TABLE "Request" DROP CONSTRAINT IF EXISTS "Request_serviceId_fkey";
ALTER TABLE "Request" DROP CONSTRAINT IF EXISTS "Request_companyId_fkey";

ALTER TABLE "Request"
  ADD CONSTRAINT "Request_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "Service"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;

ALTER TABLE "Request"
  ADD CONSTRAINT "Request_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "User"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "Request_category_idx" ON "Request"("category");
CREATE INDEX IF NOT EXISTS "Request_city_idx" ON "Request"("city");
