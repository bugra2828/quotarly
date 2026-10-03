import { createExpertProfile } from "@/app/actions/expert-profile";
import { getSessionUser } from "@/lib/supabase/session";
import { TopicCheckboxes } from "@/components/TopicCheckboxes";
import { redirect } from "next/navigation";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-6 py-12">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Create your expert profile
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          This is what journalists will see quoted in their articles.
        </p>
      </div>

      {error && (
        <p className="rounded-md border border-wire/40 bg-wire/10 p-3 text-sm text-wire">
          {error}
        </p>
      )}

      <form action={createExpertProfile} className="space-y-4">
        <Field label="Full name" name="display_name" required />
        <Field label="Job title" name="job_title" placeholder="Founder & CEO" />
        <Field label="Company" name="company" />
        <Field
          label="Website URL"
          name="website_url"
          type="url"
          placeholder="https://yourcompany.com"
        />
        <Field
          label="Target URL (link destination)"
          name="target_url"
          type="url"
          placeholder="https://yourcompany.com/pricing"
        />
        <TextArea
          label="Bio (at least 40 words)"
          name="bio"
          placeholder="2-3 sentences about your background and expertise."
        />
        <Field
          label="Profile photo (optional)"
          name="headshot"
          type="file"
          accept="image/*"
        />
        <TopicCheckboxes />
        <Field
          label="Excluded topics (comma-separated)"
          name="excluded_topics"
          placeholder="crypto, politics"
        />
        <Field
          label="Tone of voice"
          name="tone"
          placeholder="friendly, authoritative, data-driven..."
        />
        <TextArea
          label="Sample quotes (comma-separated)"
          name="sample_quotes"
          placeholder="Something you've said before that sounds like you"
        />
        <Field
          label="LinkedIn URL"
          name="linkedin_url"
          type="url"
          placeholder="https://linkedin.com/in/..."
        />

        <button
          type="submit"
          className="w-full rounded-full bg-brand-solid px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-solid/90"
        >
          Save profile
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  accept,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  accept?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        accept={accept}
        className="w-full rounded-md border border-rule bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-md border border-rule bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
    </label>
  );
}
