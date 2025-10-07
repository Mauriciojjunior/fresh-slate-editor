-- Add timestamp fields to drinks table to track when needs_to_buy and is_finished are marked/unmarked
ALTER TABLE public.drinks
ADD COLUMN needs_to_buy_marked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN needs_to_buy_unmarked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_finished_marked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_finished_unmarked_at TIMESTAMP WITH TIME ZONE;