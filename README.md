# SEMH Free Tools (standalone, front-end only)

A self-contained React + Vite + TypeScript app with the five core questionnaires from the SEMH Toolkit:

1. Sensory Checklist
2. Behaviour (School)
3. Home Behaviour
4. Pupil Voice
5. Measure What Matters

Each tool ends with a **CSV download** instead of a PDF.

## Run and build

```bash
cd free-tools
npm install
npm run dev      # http://localhost:5180
npm run build    # type-check + static build into free-tools/dist
npm run preview
```

`dist/` is plain static output (`base: './'`, hash routing), so it can be hosted from any folder, bucket or static host without server rewrite rules.

## Privacy model

- No backend, no accounts, no network calls of any kind.
- Each questionnaire is labelled with a locally generated pseudonym (e.g. `brave-otter-42`).
- No names, initials or free-text fields about a child exist anywhere in the app.
- Answers autosave to `localStorage` under the `semh-free-tools:v1:` namespace and can be cleared per tool ("Start again") or all at once from the home page.

## Intentionally not included

Backend/database, authentication, PDF reports, adverts, analytics, saved young-person records, sharing links, comparison over time, reminder emails, and the Transition tool.

## Structure

```
src/data/        static copies of the question banks (incl. 35 MWM criteria / 175 statements)
src/lib/         storage, session hook, CSV builders, pseudonym generator
src/components/  shared UI primitives and the tool shell
src/tools/       the five questionnaires
src/pages/       home page
```

Question content is a point-in-time copy of the main toolkit's data; it does not update automatically.
