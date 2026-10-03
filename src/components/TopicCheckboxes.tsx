import { EXPERTISE_TOPICS } from "@/lib/expert-profile/topics";

export function TopicCheckboxes({
  selected = [],
}: {
  selected?: string[];
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-sm font-medium text-ink">
        Expertise topics
      </legend>
      <p className="text-xs text-ink-soft">
        Pick what you can speak to — Quotarly only sources queries in these
        areas.
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {EXPERTISE_TOPICS.map((topic) => (
          <label
            key={topic}
            className="flex items-center gap-2 rounded-md border border-rule bg-surface px-3 py-2 text-sm text-ink"
          >
            <input
              type="checkbox"
              name="expertise_topics"
              value={topic}
              defaultChecked={selected.includes(topic)}
              className="h-4 w-4 rounded border-rule text-brand focus:ring-brand/40"
            />
            {topic}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
