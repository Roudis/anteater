# Intro

You're going to build a compliance-as-code scanner — a real piece of
software that connects to live infrastructure, checks it against real
regulatory and security requirements, and tells you exactly what's wrong
and why. Not a checklist you fill in by hand. Not someone else's scanner
you run and trust. Yours, built from nothing, that you extend as you learn
more about what "compliant" actually means.

## The company: Acme Health B.V.

Acme Health is a (fictional) Dutch digital health-insurance claims
processor. Every exercise in this course is built against Acme Health's
infrastructure, because a health insurer's data is about as regulated as
data gets:

- **Policyholder health records** — diagnoses, treatment history, claims —
  are GDPR "special category" data (Article 9), a materially higher bar
  than ordinary personal data.
- **Claims and reimbursement payments** bring PCI-DSS into scope, and a
  genuine ICT-risk-management angle under DORA.
- **Acme Health processes claims for hospitals and health insurers** —
  healthcare is itself a regulated "essential entity" sector under NIS2,
  so Acme Health is a supplier other regulated organizations depend on.

Every exercise deploys a real, deliberately non-compliant piece of Acme
Health's infrastructure. Your job: build a tool that finds what's wrong,
explain which rule it breaks and why that rule exists, fix the
infrastructure, and prove — by running your own tool again — that it's
fixed.

## Why build your own tool instead of running an existing one?

Tools like Checkov and OPA/Rego already do parts of this job well, and
you'll meet them later in this book as reference points once you've built
your own version and have a real basis for comparison. But running someone
else's scanner teaches you to read its output, not to understand *why* a
piece of infrastructure is or isn't compliant well enough to write the
check yourself. That understanding is the actual skill.

## What your report should look like

This book doesn't dictate a specific report format — that's yours to
design. But if you want your output to look like something a real static
analysis tool would produce (readable by other tools, diffable, the kind
of thing a CI pipeline or a code-scanning dashboard could ingest directly),
look at **[SARIF](https://sarifweb.azurewebsites.net/)** (Static Analysis
Results Interchange Format) — an OASIS standard, and the format GitHub
Code Scanning and most modern static-analysis tools actually emit. Not a
requirement, just a real-world convention worth knowing about before you
invent your own report shape from nothing.

## No quizzes, no checklists, no answer key

This book doesn't test you with questions. Every exercise is: here's
non-compliant infrastructure, here's what regulation(s) it violates and
why, go build the code that proves it — then fix the infrastructure and
prove that too. Hints show up where a genuine dead end would waste your
time. Answers don't show up at all.
