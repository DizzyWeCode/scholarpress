-- ============================================================
-- Sample content (optional)
-- Run AFTER supabase/schema.sql. Safe to delete/modify freely.
-- Covers: generated brand art in public/covers/ (no third-party images).
-- ============================================================

insert into public.posts (
  slug, title, excerpt, content, cover_image_url, cover_image_credit,
  cover_image_credit_url, tags, status, published_at,
  seo_title, seo_description, "references", reading_time_minutes
) values
(
  'why-open-access-still-matters',
  'Why Open Access Still Matters',
  'A decade into the open access movement, the gap between aspiration and reality remains wide. Here is what the evidence says — and what researchers can actually do.',
  '{
    "type": "doc",
    "content": [
      { "type": "paragraph", "content": [
        { "type": "text", "text": "The open access movement promised a simple thing: research funded by the public should be readable by the public. More than twenty years after the Budapest Open Access Initiative, that promise is only half kept." }
      ]},
      { "type": "heading", "attrs": { "level": 2 }, "content": [
        { "type": "text", "text": "The state of play" }
      ]},
      { "type": "paragraph", "content": [
        { "type": "text", "text": "Estimates suggest that roughly a third of newly published research is now openly available, with wide variation across disciplines and regions. Biomedicine leads; the humanities lag. The structural reasons are well documented: prestige economies, APC-based business models that shift costs rather than remove them, and evaluation systems that still reward journal brands over accessibility." }
      ]},
      { "type": "heading", "attrs": { "level": 2 }, "content": [
        { "type": "text", "text": "What actually moves the needle" }
      ]},
      { "type": "bulletList", "content": [
        { "type": "listItem", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "Funder mandates with teeth — Plan S showed that compliance follows enforcement." } ] } ] },
        { "type": "listItem", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "Institutional repositories that are genuinely easy to deposit into." } ] } ] },
        { "type": "listItem", "content": [ { "type": "paragraph", "content": [ { "type": "text", "text": "Hiring and promotion criteria that credit preprints and open data." } ] } ] }
      ]},
      { "type": "blockquote", "content": [ { "type": "paragraph", "content": [
        { "type": "text", "text": "Access is not a feature of publishing. It is the point of publishing." }
      ] } ] },
      { "type": "paragraph", "content": [
        { "type": "text", "text": "None of this is new. What is new is that the tooling, the policy landscape, and researcher expectations are finally aligned. The next decade will be decided by whether institutions treat openness as infrastructure or as marketing." }
      ]}
    ]
  }'::jsonb,
  '/covers/open-access.png',
  null,
  null,
  array['open access', 'scholarly communication', 'policy'],
  'published',
  now() - interval '6 days',
  null, null,
  '[
    { "label": "Budapest Open Access Initiative (2002). Declaration text.", "url": "https://www.budapestopenaccessinitiative.org/read/" },
    { "label": "Piwowar, H. et al. (2018). The state of OA: a large-scale analysis. PeerJ 6:e4375.", "url": "https://doi.org/10.7717/peerj.4375" },
    { "label": "cOAlition S. Plan S Principles.", "url": "https://www.coalition-s.org/" }
  ]'::jsonb,
  3
),
(
  'field-notes-research-in-the-open',
  'Field Notes: Doing Research in the Open',
  'Working openly changes more than where your PDF lives. Notes on preprints, public drafts, and the uncomfortable early visibility of half-formed ideas.',
  '{
    "type": "doc",
    "content": [
      { "type": "paragraph", "content": [
        { "type": "text", "text": "A year ago I started posting working drafts of my papers before submission. This is a short note on what changed — the good, the awkward, and the genuinely surprising." }
      ]},
      { "type": "heading", "attrs": { "level": 2 }, "content": [
        { "type": "text", "text": "The good" }
      ]},
      { "type": "paragraph", "content": [
        { "type": "text", "text": "Feedback arrived earlier, from people I would never have reached otherwise. Two methodological errors were caught by readers before peer review ever saw them. Citations to the preprint began accumulating months before the journal version existed." }
      ]},
      { "type": "heading", "attrs": { "level": 2 }, "content": [
        { "type": "text", "text": "The awkward" }
      ]},
      { "type": "paragraph", "content": [
        { "type": "text", "text": "Early drafts are early drafts. One was quoted out of context in a policy brief. Another circulated with a figure I later corrected. Versioning helps, but the internet does not always follow your retraction of a sentence." }
      ]},
      { "type": "paragraph", "content": [
        { "type": "text", "text": "On balance: worth it. Visibility of process is a form of accountability, and accountability is a form of rigour." }
      ]}
    ]
  }'::jsonb,
  '/covers/field-notes.png',
  null,
  null,
  array['open science', 'methods', 'notes'],
  'published',
  now() - interval '2 days',
  null, null,
  '[
    { "label": "Bourne, P. E. et al. (2017). Ten simple rules to consider regarding preprint submission. PLoS Comput Biol 13(5).", "url": "https://doi.org/10.1371/journal.pcbi.1005473" }
  ]'::jsonb,
  2
);

insert into public.papers (title, abstract, authors, venue, year, doi, url, tags, featured, status) values
(
  'Digital Platforms and the Reorganisation of Academic Labour',
  'This paper examines how platform logics — metrics, rankings, visibility regimes — are reshaping the daily work of researchers, drawing on 41 interviews across three university systems.',
  array['A. Moyo', 'J. K. Phiri'],
  'Journal of Digital Society',
  2025,
  '10.1000/example.2025.01',
  'https://example.org/papers/platforms-academic-labour',
  array['platforms', 'academic labour', 'qualitative'],
  true,
  'published'
),
(
  'Open Infrastructure for the Global South: Beyond Access',
  'Argues that open science infrastructure debates focus too narrowly on access to content, and too little on who governs the pipes. Proposes a framework for infrastructural sovereignty.',
  array['A. Moyo'],
  'Proceedings of the Open Scholarship Conference',
  2024,
  null,
  'https://example.org/papers/open-infrastructure-south',
  array['open science', 'infrastructure', 'policy'],
  true,
  'published'
);

insert into public.webinars (title, description, starts_at, duration_minutes, platform, registration_url, status) values
(
  'Publishing Your First Open Access Paper: A Practical Walkthrough',
  'A 60-minute session for early-career researchers: choosing a venue, understanding licences and APCs, depositing in repositories, and answering the questions supervisors rarely cover.',
  now() + interval '21 days',
  60,
  'Zoom',
  'https://example.org/register/oa-walkthrough',
  'upcoming'
);
