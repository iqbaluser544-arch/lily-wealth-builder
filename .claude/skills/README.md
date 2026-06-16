# Marketing Skills

44 AI agent skills for marketing — conversion optimization, copywriting, SEO,
paid ads, ad creative, retention, and growth. Claude Code (and other
Agent-Skills-compatible tools) discover these automatically from `.claude/skills/`.

## Source & attribution

Installed from [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)
v2.4.1, by Corey Haines. MIT licensed — see `LICENSE` in this folder. The `evals/`
test fixtures from the upstream repo were omitted; each skill keeps its `SKILL.md`
and `references/`.

## How to use

Invoke by natural language or directly by name:

- "Help me optimize this landing page for conversions" → `cro`
- "Write homepage copy for the app" → `copywriting`
- "Set up GA4 tracking for signups" → `analytics`
- Or directly: `/cro`, `/emails`, `/seo-audit`

## Product context (recommended first step)

Most skills look for a product-marketing context file before asking you questions.
Create one with the `product-marketing` skill, or add `.claude/product-marketing.md`
describing the product, audience, positioning, and pricing. Other skills read it
automatically so their output stays on-brand.

## Skills by domain

- **Conversion:** ab-testing, cro, onboarding, paywalls, popups, signup
- **Content & copy:** cold-email, copy-editing, copywriting, emails, sms, image, social, video
- **SEO & discovery:** ai-seo, aso, competitors, content-strategy, programmatic-seo, schema, seo-audit, site-architecture
- **Paid & measurement:** ad-creative, ads, analytics
- **Retention & growth:** churn-prevention, co-marketing, community-marketing, free-tools, lead-magnets, referrals
- **Strategy & monetization:** customer-research, directory-submissions, launch, marketing-ideas, marketing-plan, marketing-psychology, pricing, product-marketing
- **Sales & RevOps:** competitor-profiling, prospecting, public-relations, revops, sales-enablement
