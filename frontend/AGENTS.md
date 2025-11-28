# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the React/TypeScript source; pages live in `src/pages`, hooks in `src/hooks`, and shared UI pieces in `src/components`.
- `public/` stores static assets copied directly into the build, while `dist/` is the Vite output used for deployment previews.
- Config files such as `vite.config.ts`, `tsconfig*`, and `eslint.config.js` live at the repo root, where tooling can discover them automatically.

## Build, Test, and Development Commands
- `npm run dev` starts the Vite dev server with Fast Refresh for local experimentation.
- `npm run build` runs `tsc -b` for type checking and produces optimized assets via `vite build`.
- `npm run preview` serves the production bundle from `dist/` to validate the production output before deploying.
- `npm run lint` enforces the ESLint rules defined in `eslint.config.js`; run it before merging to catch stylistic or typing regressions.

## Coding Style & Naming Conventions
- Keep indentation to two spaces and prefer short, descriptive JSX fragments with Tailwind utility classes grouped logically (layout → spacing → color).
- Use PascalCase for React components/pages (`TimelinePage`), camelCase for hooks and utility functions (`useTimeline`, `dateFormatter`), and kebab-case for CSS class names when needed.
- Hooks must start with `use` and sit inside `src/hooks`; shared UI stays under `src/components/shared`.
- Run `npm run lint` whenever you touch TypeScript/JSX to respect the ESLint + TypeScript combo that protects this codebase.

## Testing Guidelines
- There are no automated tests yet; add unit or integration tests under `src/__tests__/` or alongside modules when introducing new logic.
- Favor React Testing Library for UI interactions and mock HTTP via adapters on `axios`, mirroring the existing fetch abstractions in hooks.
- Document new test suites in the same folder as the code they cover, and describe their purpose directly in the test file or a nearby README so reviewers understand why the coverage exists.

## Commit & Pull Request Guidelines
- Repository currently lacks commits, so follow a conventional-commit style (`feat:`, `fix:`, `docs:`) and keep messages under 72 characters for clarity.
- PRs should explain the change, list relevant issues or tickets, mention how to run affected scripts (e.g., `npm run dev`), and include screenshots only when UI changes require validation.
- Before merging, ensure `npm run lint` passes; note any manual verification steps (e.g., checking data polling) in the PR description for reviewers.

## Security & Configuration Tips
- Store secrets outside the repo; Vite environment variables must live in `.env` files excluded from source control.
- Update dependencies via `npm outdated` and test locally (`npm run build`) before bumping versions so you catch breaking changes early.
