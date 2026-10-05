import { updateExpertProfile } from "@/app/actions/expert-profile";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/session";
import { TopicCheckboxes } from "@/components/TopicCheckboxes";
import { redirect, notFound } from "next/navigation";

export default async function EditProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("expert_profiles")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!profile) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-6 py-12">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Edit profile
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Changes apply to every pitch Quotarly drafts from now on.
        </p>
      </div>

      {error && (
        <p className="rounded-md border border-wire/40 bg-wire/10 p-3 text-sm text-wire">
          {error}
        </p>
      )}

      <form action={updateExpertProfile} className="space-y-4">
        <input type="hidden" name="expert_profile_id" value={profile.id} />
        <Field
          label="Full name"
          name="display_name"
          required
          defaultValue={profile.display_name}
        />
        <Field
          label="Job title"
          name="job_title"
          placeholder="Founder & CEO"
          defaultValue={profile.job_title ?? ""}
        />
        <Field
          label="Company"
          name="company"
          defaultValue={profile.company ?? ""}
        />
        <Field
          label="Website URL"
          name="website_url"
          type="url"
          placeholder="https://yourcompany.com"
          defaultValue={profile.website_url ?? ""}
        />
        <Field
          label="Target URL (link destination — required so we can detect backlinks)"
          name="target_url"
          type="url"
          placeholder="https://yourcompany.com/pricing"
          defaultValue={profile.target_url ?? ""}
          required
        />
        <TextArea
          label="Bio (at least 40 words)"
          name="bio"
          placeholder="2-3 sentences about your background and expertise."
          defaultValue={profile.bio ?? ""}
        />
        <TopicCheckboxes selected={profile.expertise_topics ?? []} />
        <Field
          label="Excluded topics (comma-separated)"
          name="excluded_topics"
          placeholder="crypto, politics"
          defaultValue={(profile.excluded_topics ?? []).join(", ")}
        />
        <Field
          label="Tone of voice"
          name="tone"
          placeholder="friendly, authoritative, data-driven..."
          defaultValue={profile.tone ?? ""}
        />
        <TextArea
          label="Sample quotes (comma-separated)"
          name="sample_quotes"
          placeholder="Something you've said before that sounds like you"
          defaultValue={(profile.sample_quotes ?? []).join(", ")}
        />
        <Field
          label="LinkedIn URL"
          name="linkedin_url"
          type="url"
          placeholder="https://linkedin.com/in/..."
          defaultValue={profile.linkedin_url ?? ""}
        />

        <button
          type="submit"
          className="w-full rounded-full bg-brand-solid px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-solid/90"
        >
          Save changes
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
  defaultValue,
  accept,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
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
        defaultValue={defaultValue}
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
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={3}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-rule bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
    </label>
  );
}
