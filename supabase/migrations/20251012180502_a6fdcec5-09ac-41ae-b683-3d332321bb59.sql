-- Add revisado and riscado columns to records table
ALTER TABLE public.records
ADD COLUMN revisado boolean NOT NULL DEFAULT false,
ADD COLUMN riscado boolean NOT NULL DEFAULT false;