-- CreateTable
CREATE TABLE "AlertCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "detectionType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "owner" TEXT,
    "disposition" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AlertCase_alertKey_key" ON "AlertCase"("alertKey");
