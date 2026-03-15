-- CreateTable
CREATE TABLE "MasterData" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataType" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "description" TEXT,
    "metadata" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "MasterData_dataType_idx" ON "MasterData"("dataType");

-- CreateIndex
CREATE INDEX "MasterData_isActive_idx" ON "MasterData"("isActive");

-- CreateIndex
CREATE INDEX "MasterData_dataType_isActive_idx" ON "MasterData"("dataType", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "MasterData_dataType_value_key" ON "MasterData"("dataType", "value");
