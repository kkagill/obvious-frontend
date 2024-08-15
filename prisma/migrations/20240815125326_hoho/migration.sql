/*
  Warnings:

  - A unique constraint covering the columns `[fileName]` on the table `Clip` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Clip_fileName_key" ON "Clip"("fileName");
