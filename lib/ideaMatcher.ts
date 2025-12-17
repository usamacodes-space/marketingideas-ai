export type CompanyProfile = {
  businessModel: string;
  audience: "b2b" | "b2c";
  channels: string[];
  maturity: "early" | "established";
  signals: {
    hasPricing: boolean;
    hasBlog: boolean;
    hasCareers: boolean;
    hasDemoCTA: boolean;
  };
};

export type Idea = {
  id: string;
  title: string;
  core_action: string;
  why_it_works: string;
  tags: string[];
  company_fit: string[];
  url: string;
};

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

export function profileToTags(p: CompanyProfile): string[] {
  const tags: string[] = [];

  tags.push(p.audience);
  tags.push(p.businessModel);
  tags.push(...p.channels);
  tags.push(p.maturity);

  if (p.signals.hasBlog) tags.push("content", "seo");
  if (p.signals.hasPricing) tags.push("conversion");
  if (p.signals.hasDemoCTA) tags.push("sales-led");

  return uniq(tags.map((t) => t.toLowerCase()));
}

function scoreIdea(idea: Idea, profile: CompanyProfile) {
  const reasons: string[] = [];
  const pTags = profileToTags(profile);

  let score = 0;

  // Company fit
  const fit = idea.company_fit.map((x) => x.toLowerCase());
  if (fit.includes("all")) {
    score += 2;
    reasons.push("company_fit: all");
  } else if (fit.includes(profile.businessModel.toLowerCase())) {
    score += 5;
    reasons.push(`company_fit match: ${profile.businessModel}`);
  } else {
    score -= 2;
    reasons.push("company_fit mismatch");
  }

  // Tag overlap
  const iTags = idea.tags.map((t) => t.toLowerCase());
  const overlap = iTags.filter((t) => pTags.includes(t));
  const overlapScore = Math.min(5, overlap.length);
  score += overlapScore;
  overlap.forEach((t) => reasons.push(`tag match: ${t}`));

  // Normalize 0..1
  const normalized = Math.max(0, Math.min(1, score / 10));
  return { score: normalized, reasons };
}

export function rankIdeas(ideas: Idea[], profile: CompanyProfile, limit = 10) {
  return ideas
    .map((idea) => {
      const { score, reasons } = scoreIdea(idea, profile);
      return { ...idea, score, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
