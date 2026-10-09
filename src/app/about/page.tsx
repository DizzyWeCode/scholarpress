import type { Metadata } from "next";
import Image from "next/image";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/reveal";
import { NewsletterForm } from "@/components/newsletter-form";

export const metadata: Metadata = {
  title: "About",
  description: `About ${SITE.name} — ${SITE.tagline}.`,
};

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-xs uppercase tracking-[0.25em] text-ink-4">
      {children}
    </h2>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      {/* Identity block — replace the temporary field-notes image with a real portrait when available. */}
      <Reveal>
        <p className="text-xs uppercase tracking-[0.25em] text-ink-4">About</p>
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          <figure className="shrink-0">
            <span className="relative block h-40 w-32 overflow-hidden rounded border border-line bg-paper-2">
              <Image
                src={SITE.images.aboutPortrait.src}
                alt={SITE.images.aboutPortrait.alt}
                fill
                sizes="128px"
                className="object-cover"
              />
            </span>
            <figcaption className="mt-2 max-w-32 text-[11px] leading-snug text-ink-4">
              Dr Fraction Dzinjalamala
            </figcaption>
          </figure>
          <div>
            <h1 className="font-serif text-4xl tracking-tight text-ink sm:text-5xl">
              {SITE.name}
            </h1>
            <p className="mt-3 text-lg text-ink-3">{SITE.tagline}</p>
            <p className="mt-1 text-sm text-ink-4">{SITE.affiliation}</p>
          </div>
        </div>
        <p className="mt-6 text-sm leading-relaxed text-ink-2">
          <a
            href={`mailto:${SITE.email}`}
            className="underline underline-offset-2 transition-colors hover:text-ink"
          >
            {SITE.email}
          </a>
          <span className="mx-2 text-ink-4">·</span>
          <a
            href={SITE.researchgate}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 transition-colors hover:text-ink"
          >
            ResearchGate
          </a>
        </p>
      </Reveal>

      <Reveal delay={100}>
        <div className="mt-12 border-t border-line pt-10">
          <SectionTitle>Profile</SectionTitle>
          <div className="article-body mt-5">
            <p>
              Clinician, pharmacologist, and bioethicist with more than
              twenty years across malaria research, university teaching, and
              research ethics leadership. My work centres on keeping
              antimalarial drugs effective — from the molecular basis of
              resistance to how drugs behave in patients — alongside
              training the clinicians who will carry that work forward.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-12 border-t border-line pt-10">
          <SectionTitle>Education</SectionTitle>
          <dl className="mt-2">
            {[
              {
                title: "PhD in Pharmacology",
                meta: "University of Cape Town, South Africa",
              },
              {
                title: "MSc in Clinical Pharmacology",
                meta: "University of Glasgow, United Kingdom",
              },
              {
                title: "Diploma in Clinical Medicine",
                meta: "Malawi College of Health Sciences",
              },
              {
                title: "Fellow in Bioethics",
                meta: "Johns Hopkins Berman Institute of Bioethics, USA",
              },
            ].map((e) => (
              <div
                key={e.title}
                className="border-b border-line py-4 sm:flex sm:items-baseline sm:justify-between sm:gap-6"
              >
                <dt className="text-sm font-medium text-ink">{e.title}</dt>
                <dd className="mt-1 text-sm text-ink-3 sm:mt-0 sm:text-right">
                  {e.meta}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>

      <Reveal delay={140}>
        <div className="mt-12 border-t border-line pt-10">
          <SectionTitle>Appointments</SectionTitle>
          <dl className="mt-2">
            {[
              {
                title: "Senior Lecturer",
                meta: "Malawi University of Science and Technology · 2022 – present",
              },
              {
                title: "Acting Head, Department of Clinical Sciences",
                meta: "Malawi University of Science and Technology · 2024 – present",
              },
              {
                title: "Senior Lecturer in Pharmacology and Medicinal Chemistry",
                meta: "College of Medicine (now Kamuzu University of Health Sciences) · ten years",
              },
              {
                title: "Research Scientist",
                meta: "Blantyre Malaria Project / Malawi-Liverpool-Wellcome Trust · ten years",
              },
            ].map((e) => (
              <div
                key={e.title}
                className="border-b border-line py-4 sm:flex sm:items-baseline sm:justify-between sm:gap-6"
              >
                <dt className="text-sm font-medium text-ink">{e.title}</dt>
                <dd className="mt-1 text-sm text-ink-3 sm:mt-0 sm:text-right">
                  {e.meta}
                </dd>
              </div>
            ))}
          </dl>
          <div className="article-body mt-5">
            <p>
              A decade as a Research Scientist studying the molecular basis
              of antimalarial drug resistance, malaria pathogenesis in
              pregnancy, and the pharmacokinetics of antimicrobials and
              anticonvulsants — followed by ten years teaching pharmacology
              and medicinal chemistry, with a seat on the University Senate.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={160}>
        <div id="research" className="mt-12 scroll-mt-24 border-t border-line pt-10">
          <SectionTitle>Research interests</SectionTitle>
          <ul className="mt-5 grid gap-x-8 gap-y-3 text-sm leading-relaxed text-ink-2 sm:grid-cols-2">
            {[
              "Malaria chemotherapy",
              "Molecular basis of antimicrobial drug resistance",
              "Clinical pharmacokinetics",
              "Bioanalytical method development and validation",
              "Radiopharmacology and radiation safety",
              "Phytomedicine and ethnopharmacology",
            ].map((interest) => (
              <li key={interest} className="border-l-2 border-line pl-4">
                {interest}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal delay={180}>
        <div className="mt-12 border-t border-line pt-10">
          <SectionTitle>Research outputs</SectionTitle>
          <p className="mt-4 text-sm leading-relaxed text-ink-2">
            More than 28 peer-reviewed papers, book chapters on malaria and
            bioanalytical methods, and an edited medical book. A full,
            citable archive will live under{" "}
            <a
              href="/papers"
              className="underline underline-offset-2 transition-colors hover:text-ink"
            >
              Research
            </a>{" "}
            as papers are added; the existing record is on{" "}
            <a
              href={SITE.researchgate}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-ink"
            >
              ResearchGate
            </a>
            .
          </p>
        </div>
      </Reveal>

      <Reveal delay={200}>
        <div className="mt-12 border-t border-line pt-10">
          <SectionTitle>Service & leadership</SectionTitle>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ink-2">
            <li className="border-l-2 border-line pl-4">
              Member, MUST Research Ethics Committee (MUSTREC)
            </li>
            <li className="border-l-2 border-line pl-4">
              College of Medicine Research Ethics Committee — six years,
              including three as Vice Chair; three years representing the
              committee on the National Health Sciences Research Committee
            </li>
            <li className="border-l-2 border-line pl-4">
              Curriculum development and review for certificate, diploma,
              and BSc Clinical Medicine programmes
            </li>
          </ul>
        </div>
      </Reveal>

      <Reveal delay={220}>
        <div id="work-with-me" className="mt-12 scroll-mt-24 border-t border-line pt-10">
          <SectionTitle>Teaching & outreach</SectionTitle>
          <p className="mt-4 text-sm leading-relaxed text-ink-2">
            Pharmacology teaching across diploma programmes in nursing,
            anaesthesia, and clinical medicine at the Malawi College of
            Health Sciences — alongside undergraduate and postgraduate
            teaching at MUST and KuHeS.
          </p>
          <div className="mt-8">
            <NewsletterForm />
          </div>
        </div>
      </Reveal>

      <Reveal delay={240}>
        <div className="mt-12 border-t border-line pt-10">
          <SectionTitle>Contact</SectionTitle>
          <p className="mt-4 text-sm leading-relaxed text-ink-2">
            For collaborations, speaking invitations, supervision enquiries,
            or press:{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="underline underline-offset-2 transition-colors hover:text-ink"
            >
              {SITE.email}
            </a>
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {SITE.researchgate ? <a href={SITE.researchgate} target="_blank" rel="noreferrer" className="underline underline-offset-2 transition-colors hover:text-ink">ResearchGate</a> : null}
            {SITE.twitter ? <a href={SITE.twitter} target="_blank" rel="noreferrer" className="underline underline-offset-2 transition-colors hover:text-ink">X / Twitter</a> : null}
            {SITE.linkedin ? <a href={SITE.linkedin} target="_blank" rel="noreferrer" className="underline underline-offset-2 transition-colors hover:text-ink">LinkedIn</a> : null}
            {SITE.instagram ? <a href={SITE.instagram} target="_blank" rel="noreferrer" className="underline underline-offset-2 transition-colors hover:text-ink">Instagram</a> : null}
            {SITE.youtube ? <a href={SITE.youtube} target="_blank" rel="noreferrer" className="underline underline-offset-2 transition-colors hover:text-ink">YouTube</a> : null}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
