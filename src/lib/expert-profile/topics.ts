// The only topics Quotarly can realistically source journalist queries for,
// based on the newsletters/platforms we ingest (Source of Sources, Qwoted).
// Kept as a fixed list instead of free text so a profile's expertise always
// matches something the pipeline can actually find.
export const EXPERTISE_TOPICS = [
  "SaaS & Software",
  "Artificial Intelligence",
  "Startups & Entrepreneurship",
  "Venture Capital & Fundraising",
  "Marketing & Growth",
  "SEO & Content Marketing",
  "PR & Communications",
  "Business Strategy",
  "Small Business",
  "Product Management",
  "Fintech",
  "Technology",
  "Travel",
  "Lifestyle & Fitness",
  "Beauty & Wellness",
  "Cybersecurity",
] as const;
