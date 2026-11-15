-- Interview mode: instead of writing a pitch, the AI asks the expert 2-3 short
-- questions about the journalist's request. The expert answers in their own
-- words, and the AI only orders and proofreads those answers into a pitch.
--
-- New status 'awaiting_answers': questions are ready, no answers yet. After
-- the expert answers, the pitch moves to 'pending_approval' as before.
alter table public.pitches
  add column if not exists interview_questions jsonb,
  add column if not exists interview_answers jsonb;

alter table public.pitches drop constraint if exists pitches_status_check;
alter table public.pitches add constraint pitches_status_check check (status in
  ('draft', 'awaiting_answers', 'pending_approval', 'approved', 'rejected',
   'sent', 'failed', 'expired'));
