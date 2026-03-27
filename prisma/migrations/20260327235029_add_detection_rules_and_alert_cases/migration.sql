-- AlterTable
ALTER TABLE "AuditEvent" ADD COLUMN "tags" TEXT;

-- CreateTable
CREATE TABLE "DetectionRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "field" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "threshold" INTEGER,
    "timeWindow" INTEGER,
    "severity" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_RelatedEvents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RelatedEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "AuditEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RelatedEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "AuditEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_RelatedEvents_AB_unique" ON "_RelatedEvents"("A", "B");

-- CreateIndex
CREATE INDEX "_RelatedEvents_B_index" ON "_RelatedEvents"("B");
