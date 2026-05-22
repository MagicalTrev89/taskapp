-- AlterTable
-- Add nullable `position` column to tasks.
-- Null preserves existing ordering: tasks with position=null sort by createdAt DESC.
-- No backfill needed — null values maintain current behaviour.
ALTER TABLE "tasks" ADD COLUMN "position" INTEGER;
