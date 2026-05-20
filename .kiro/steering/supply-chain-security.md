---
description: Supply chain security policy for extensions, packages, and CI/CD dependencies
inclusion: auto
---

# Supply Chain Security Policy — Pantheon Insight

This policy governs all AI-assisted development across the Pantheon Insight organization.
It applies regardless of which AI tool is in use (Kiro, Claude Code, Copilot, Cursor, etc.).

Created May 2026 in response to the TeamPCP supply chain campaign which compromised VS Code
extensions, GitHub Actions, npm, PyPI, Docker images, and CRAN packages across thousands of
organizations.

---

## Core Rules for AI Agents

### Before recommending or installing ANY third-party dependency:

1. **Verify the canonical name** — typosquats are the #1 vector
2. **Confirm the publisher** — must be a verified/official publisher or well-known maintainer
3. **Check adoption** — packages with < 1,000 weekly downloads require explicit human approval
4. **Pin versions exactly** — never use open ranges in production code
5. **Flag it** — any new dependency recommendation must include: package name, publisher, weekly downloads, last publish date

### NEVER do the following without explicit human approval:

- Install VS Code/IDE extensions not on the approved list below
- Add Python, npm, or any other packages not on the approved list below
- Reference GitHub Actions by mutable tag — always use pinned commit SHAs
- Install from non-standard registries, mirrors, or forks
- Run `curl | bash`, `wget | sh`, or any pipe-to-shell install pattern

### ALWAYS do the following:

- When suggesting a new package, state clearly: "This is NOT on the approved list — requires team review"
- If you detect a reference to a known-compromised component, stop immediately and alert the user
- Prefer stdlib or already-approved packages over adding new dependencies

---

## Approved Dependencies — oppo-tool Repository

### Python Packages (approved — backend)

| Package | Version | Use Case |
|---------|---------|----------|
| fastapi | 0.115.0 | Web framework |
| uvicorn | 0.30.0 | ASGI server |
| anthropic | 0.39.0 | Claude API client |
| python-multipart | 0.0.9 | File upload handling |
| pdfplumber | 0.11.0 | PDF text extraction |
| python-docx | 1.1.0 | Word doc parsing |
| openpyxl | 3.1.5 | Excel parsing |
| httpx | 0.27.0 | HTTP client |
| python-dotenv | 1.0.1 | Environment config |

### npm Packages (approved — frontend)

| Package | Use Case |
|---------|----------|
| next | React framework |
| react / react-dom | UI library |
| typescript | Type checking |
| tailwindcss | CSS framework |
| postcss | CSS processing |
| autoprefixer | CSS processing |
| @types/node | Node type defs |
| @types/react | React type defs |
| @types/react-dom | React DOM type defs |

### GitHub Actions (approved)

| Action | Version |
|--------|---------|
| actions/checkout | @v4 |

**Approved namespaces:** `actions/*`, `aws-actions/*`, `github/*`

### Docker Base Images (approved)

| Image | Use Case |
|-------|----------|
| python:3.11-slim | Backend |
| node:20-alpine | Frontend |

### VS Code / IDE Extensions (approved)

| Extension ID | Name |
|-------------|------|
| ms-python.python | Python |
| ms-python.vscode-pylance | Pylance |
| ms-python.debugpy | Python Debugger |
| github.copilot | GitHub Copilot |
| github.copilot-chat | Copilot Chat |
| eamodio.gitlens | GitLens |
| dbaeumer.vscode-eslint | ESLint |
| esbenp.prettier-vscode | Prettier |
| bradlc.vscode-tailwindcss | Tailwind CSS IntelliSense |
| redhat.vscode-yaml | YAML |
| github.vscode-github-actions | GitHub Actions |
| ms-vscode-remote.remote-ssh | Remote SSH |
| ms-vscode-remote.remote-containers | Dev Containers |

---

## Known Compromised Components (block list)

If you encounter ANY reference to these — **stop and alert the user immediately**.

### VS Code Extensions (blocked)
- `nrwl.angular-console` — Nx Console v18.95.0 (TeamPCP credential stealer, May 2026)
- Any extension by publisher `oorzc` — GlassWorm malware (Jan 2026)
- 73+ fake cloned extensions (GlassWorm v2 campaign, Apr 2026)
- Any unverified publisher extension with < 10,000 installs

### GitHub Actions (blocked)
- `aquasecurity/trivy-action` — all tags force-pushed by TeamPCP (CVE-2026-33634)
- `aquasecurity/setup-trivy` — compromised alongside trivy-action
- `checkmarx/kics-github-action` — compromised by TeamPCP (Mar 2026)

### Python/npm Packages (blocked)
- `elementary-data` — compromised via credential theft
- Any package with a name suspiciously similar to an approved package

### Docker Images (blocked)
- Any image not from `docker.io/library/*`, `public.ecr.aws/*`, or a verified publisher

---

## CI/CD Security Rules

1. GitHub Actions should be pinned to commit SHAs
2. Workflow permissions: least-privilege only
3. No `pull_request_target` triggers without security review
4. No third-party actions from unvetted namespaces
5. This is a PUBLIC repo — extra caution with any secrets or credentials

## Credential Hygiene

- Never echo, log, or display secret values
- Reference secrets by key name only
- Treat `.env` as sensitive — never read into AI context
- This repo is PUBLIC — never commit API keys, tokens, or credentials

## Incident Response

If you detect signs of compromise:
1. Stop all operations
2. Alert the user with specifics
3. Do not attempt to fix — that's a human decision
4. Recommend: rotate credentials, audit git log, check GitHub audit log
