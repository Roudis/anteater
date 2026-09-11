# The Regulations and Standards, From Scratch

Every exercise in this book cites something — an article, a control number,
a criterion — and moves on quickly, because the point of each exercise is
the *infrastructure flaw*, not a law-school seminar. But citing "GDPR Art.
32(1)(a)" only means something if you know what GDPR actually is, who it
binds, and why Article 32 exists at all. This chapter is that context,
written once, for engineers with no prior compliance background — not
lawyers, not GRC people. Read it before Exercise One, or use it as a
reference to come back to whenever a citation in a later chapter doesn't
make sense on its own.

Five things show up across this book: **GDPR**, **ISO/IEC 27001**, **SOC
2**, **NIST SP 800-53**, and **PCI-DSS**. Two more — **DORA** and the **EU
Cloud Code of Conduct** — are relevant to Acme Health's business even
though no exercise cites them yet. They're not the same kind of thing,
and conflating them is a common, avoidable mistake. This chapter gives
you enough to place each one; it doesn't replace reading the primary
source, and every section below links to one.

## GDPR — a law, not a standard

Full text: [gdpr-info.eu](https://gdpr-info.eu/) (an accessible,
article-by-article rendering of the official regulation).

The **General Data Protection Regulation** is European Union law —
Regulation (EU) 2016/679, in force since 25 May 2018. Unlike everything
else in this chapter, GDPR isn't something a company chooses to comply
with for business reasons; it's binding on anyone processing personal
data of people in the EU, regardless of where the company itself is
based. Non-compliance carries real regulatory fines, up to €20 million or
4% of global annual revenue, whichever is higher, for the most serious
violations.

Two roles matter for this course:

- A **controller** decides *why* and *how* personal data is processed —
  Acme Health, deciding what claims data to collect and what it's used
  for, is a controller with respect to its own policyholders.
- A **processor** processes personal data *on behalf of* someone else,
  under instruction. A company can be both, depending on which
  relationship you're looking at — Acme Health also processes claims data
  on behalf of the hospitals and insurers that route claims through it,
  which makes it a processor in that relationship. This distinction
  matters because obligations differ: a processor's core duty is
  following the controller's documented instructions and helping the
  controller meet *its* obligations, not making independent decisions
  about the data.

Two articles recur in this book:

- **Article 9** — most personal data is just "personal data" under GDPR,
  but a narrower category, **special category data**, gets stricter
  treatment: health data, genetic data, biometric data, and a handful of
  others. Acme Health's claims data — diagnoses, treatment history — is
  squarely special category data. Processing it at all requires meeting
  one of a short list of specific legal conditions, not just "we have a
  legitimate business reason."
- **Article 32** — "Security of processing." This is GDPR's own security
  requirement, and it's deliberately broad rather than prescriptive: it
  doesn't say "use AES-256," it says the controller/processor must
  implement measures "appropriate to the risk," and it names four
  specific things such measures should be able to do — (a) ensure
  confidentiality/integrity/availability/resilience of processing
  systems, (b) restore availability and access to data in a timely manner
  after an incident, and so on (see each exercise's own citation for the
  exact sub-clause and its precise wording — don't assume you remember
  which letter covers which idea; every citation in this book was checked
  against the article text directly, and you should do the same before
  repeating one).

GDPR doesn't tell you *how* to secure a database. It tells you that you
must, and that regulators can fine you if you didn't and something goes
wrong. ISO 27001, SOC 2, and NIST 800-53 exist partly to answer the "how."

## ISO/IEC 27001 — a certifiable standard, with a companion, not a law

Official standard (paywalled, as all ISO standards are):
[iso.org/standard/27001](https://www.iso.org/standard/27001.html). Free,
detailed Annex A control-by-control reference:
[isms.online/iso-27001/annex-a-2022](https://www.isms.online/iso-27001/annex-a-2022/).

**ISO/IEC 27001** is an international standard for an **Information
Security Management System (ISMS)** — not a specific set of technical
controls so much as a system for identifying risks and choosing controls
to address them. A company can be **certified** against ISO 27001 by an
accredited auditor; certification is voluntary, but often required
contractually — a customer, especially a large enterprise or public-sector
one, may simply refuse to sign a contract without it.

The standard's **Annex A** lists 93 controls (as of the 2022 revision),
organized into four themes (Organizational, People, Physical,
Technological). Each Annex A entry has a short, one-to-two sentence
"control" statement — not just a title, though it reads almost as tersely
as one. The real elaboration — *why* the control matters, *how* to
implement it, what else to consider — lives in a companion document,
**ISO/IEC 27002**, which expands each of the same 93 controls with a
Purpose, Guidance, and Other Information section, typically about a page
each. You certify against 27001; you *implement* using 27002's guidance.
This book cites specific Annex A control numbers (e.g., "8.24, Use of
cryptography") the same way a real audit would.

## SOC 2 — an attestation report, not a certification

AICPA's 2017 Trust Services Criteria (with the 2022 revised points of
focus) — a full-text mirror:
[arpio.io — Trust Services Criteria](https://arpio.io/wp-content/uploads/2020/08/trust-services-criteria.pdf).

**SOC 2** (System and Organization Controls 2) is different in kind from
ISO 27001: it's not a certification a company either has or doesn't have,
it's an **attestation report** — a CPA firm's opinion, following standards
published by the AICPA (the American Institute of CPAs), on whether a
company's controls meet the **Trust Services Criteria**. SOC 2 is
overwhelmingly a US-market mechanism (a European customer is more likely
to ask for ISO 27001), but it shows up constantly in vendor due-diligence
questionnaires for any company selling software or services to other
businesses.

The Trust Services Criteria has five categories: **Security** (the
"Common Criteria," labeled CC1 through CC9) is the only mandatory one;
**Availability**, **Confidentiality**, **Processing Integrity**, and
**Privacy** are optional, included only if relevant to what the company
actually does. This book only ever cites Common Criteria controls (e.g.,
"CC6.1," "CC6.3") — the mandatory ones every SOC 2 report addresses.

Reports come in two types: a **Type I** report is a point-in-time opinion
("were these controls suitably designed, as of this date?"); a **Type
II** report — the one that actually carries weight with sophisticated
customers — covers a period, usually 6–12 months, and opines on whether
the controls actually *operated effectively* throughout, not just whether
they existed on paper.

## NIST SP 800-53 — a US federal control catalog, adopted far beyond the government

Official publication, free:
[csrc.nist.gov/pubs/sp/800/53/r5/upd1/final](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final).

**NIST SP 800-53** is published by the U.S. National Institute of
Standards and Technology. It originated to help U.S. federal agencies
comply with **FISMA** (the Federal Information Security Management Act)
— it's mandatory for federal agencies and for cloud providers seeking
**FedRAMP** authorization to sell to the U.S. government. Well beyond that
mandatory scope, it's also one of the most widely *voluntarily* adopted
security control catalogs in the world, because it's free, exhaustive,
and well-maintained — plenty of companies with no U.S. federal
relationship at all use it as their internal control baseline.

It's organized into **control families** — two-letter prefixes grouping
related controls. This book cites the **AC** (Access Control) family
specifically: **AC-3** ("Access Enforcement") and **AC-6** ("Least
Privilege") both live here. A control's own text is usually one or two
sentences — deliberately general, the same way GDPR's Article 32 is —
with much more detailed discussion in the control's own extended guidance,
which this book doesn't reproduce; go to the source if you want the full
picture.

## PCI-DSS — a card-network standard, not a law or a voluntary framework

Official standard, free: [pcisecuritystandards.org/document_library](https://www.pcisecuritystandards.org/document_library/).

**PCI-DSS** (Payment Card Industry Data Security Standard) is different
again: it's not government law, and it's not something you sign up for —
it's a contractual requirement imposed by the payment card networks (Visa,
Mastercard, and the others) on anyone who stores, processes, or transmits
cardholder data. If you take card payments, PCI-DSS applies to you,
full stop, at a scope determined by how much of the cardholder-data
pipeline you actually touch.

Acme Health genuinely has PCI-DSS exposure *somewhere* — premiums are
collected by card, per this course's own business-fact table — but scope
is the entire point of PCI-DSS: it applies to systems that touch
cardholder data, not to a company's infrastructure in general. You'll see
this book's own exercises actively reject a PCI-DSS citation more than
once, precisely because the resource in question — an S3 bucket of health
records, an RDS instance of policyholder data, an IAM user for a claims
pipeline — doesn't itself hold cardholder data. Citing a framework because
it's thematically relevant to the *company*, rather than because it
actually governs the *resource* you're looking at, is exactly the kind of
imprecise reasoning a real audit would catch and this course is trying to
train you out of.

## NIS2 — an EU directive, not a regulation: it has to pass through national law first

Official text: [EUR-Lex — Directive (EU) 2022/2555](https://eur-lex.europa.eu/eli/dir/2022/2555).

Unlike GDPR and DORA, both EU **regulations** (directly binding across
every member state the moment they take effect), **NIS2** is a
**directive** — it entered into force on 16 January 2023, but it doesn't
bind anyone directly. Each EU member state had until 17 October 2024 to
transpose it into their own national law, and what you're actually bound
by is that national law, not the directive text itself (worth checking
which country's transposition applies to a given entity, rather than
citing the directive as if it were self-executing). NIS2 covers 18
critical sectors EU-wide, healthcare among them — Acme Health, processing
claims for hospitals and health insurers, sits inside NIS2's healthcare
essential-entity sector for real.

Article 21(2) sets out ten binding categories of cybersecurity
risk-management measures, lettered (a) through (j) — this book cites
**(g), "basic cyber hygiene practices,"** for Exercise Six. A specific
practice like network segmentation isn't named as its own letter in the
directive's operative text (checked directly at EUR-Lex, not assumed
from a secondary source that suggested otherwise) — cite the letter you
can verify, not a specific practice a blog post associates with it.

## DORA — EU financial-sector operational resilience, not yet exercised in this book

Official page: [eiopa.europa.eu — DORA](https://www.eiopa.europa.eu/digital-operational-resilience-act-dora_en).

The **Digital Operational Resilience Act** (Regulation (EU) 2022/2554)
applies from 17 January 2025 to a wide range of EU financial entities —
banks, insurers, payment institutions, investment firms, and more — plus
the ICT third parties they rely on. It's built around five pillars: ICT
risk management, incident reporting, resilience testing, third-party risk
management, and information-sharing. Acme Health, processing claims and
reimbursements for insurers, sits inside DORA's scope for real, not by
analogy — no exercise in this book has built against it yet, but read the
source if you want to get ahead of where this course is headed.

## The EU Cloud Code of Conduct — a code your *cloud provider* might follow, not Acme Health itself

Official page: [eucoc.cloud — About](https://eucoc.cloud/en/about/about-eu-cloud-coc).

This is a voluntary GDPR compliance code, formalized under GDPR Article
40, that cloud infrastructure providers (not their customers) can commit
to — a way for a provider like AWS or a European cloud vendor to
demonstrate its own infrastructure practices meet GDPR's requirements,
verified by independent monitoring bodies. It's relevant to Acme Health as
a *customer* consideration (does the cloud Acme Health builds on adhere to
it?), not something Acme Health itself certifies against — worth knowing
the code exists and who it actually binds.

## How to read a citation in this book

Each framework has its own citation shape:

- **GDPR**: `Art. X(Y)(Z)` — article, paragraph, point. Article text is
  public and short; always readable in a few minutes at the source.
- **ISO/IEC 27001**: `Annex A control N.NN` plus its short title — check
  whether a book chapter is quoting Annex A's own one-line control
  statement or 27002's longer guidance; this book is explicit about which
  is which every time, because they're easy to conflate.
- **SOC 2**: `CC N.N` — Common Criteria, category N, item N.
- **NIST SP 800-53**: `XX-N` — two-letter family, control number.
- **PCI-DSS**: has its own numbered requirements (1 through 12) and
  sub-requirements; this book hasn't needed to cite a specific one yet,
  since no exercise so far actually has cardholder data in scope.

None of these citations should ever be taken on faith — including the
ones in this book. Every specific quote or paraphrase in every exercise
chapter was checked against the framework's own published text before it
was written down; you're encouraged to build the same habit before you
repeat a compliance claim anywhere it matters.
