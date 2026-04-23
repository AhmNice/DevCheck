-- AlterTable
ALTER TABLE "Subtask" ADD COLUMN     "lastActiveAt" TIMESTAMP(3),
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3);
