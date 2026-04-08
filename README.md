# Poseidon — Opposition Research Attack Extraction Tool

Upload an opposition research book (PDF or DOCX), and Poseidon extracts every possible attack, then matches each one to the best off-the-shelf voter targeting universes from your Poseidon OTS Inventory.

## Architecture

- **Frontend:** Next.js 14 / TypeScript / Tailwind CSS (dark theme)
- **Backend:** Python FastAPI + Claude API (Anthropic)
- **Universe Source:** Live from Google Sheets (Poseidon OTS Inventory)
- **Export:** Professional XLSX with severity coding, universe matches, and metadata

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Anthropic API key

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

pip install -r requirements.txt
python main.py
```

Backend runs at `http://localhost:8000`. Health check: `GET /api/health`.

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local

npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

### Docker (both services)

```bash
# Create backend/.env with your ANTHROPIC_API_KEY first
docker compose up --build
```

## How It Works

1. **Upload** a PDF or DOCX opposition research book
2. **Extraction** — The document is chunked and sent to Claude, which extracts every attack across 20+ categories (voting record, campaign finance, associations, statements, etc.)
3. **Deduplication** — Overlapping chunk results are merged
4. **Universe Matching** — Each attack is matched to the best, secondary, and tertiary OTS universes from your live Google Sheets inventory
5. **Results Dashboard** — Browse, filter, and sort all attacks with severity badges and universe pills
6. **Export** — Download a formatted XLSX with all data

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload` | Upload PDF/DOCX file |
| POST | `/api/extract` | Trigger extraction (params: `job_id`, `subject`) |
| GET | `/api/results/{job_id}` | Get extraction results |
| GET | `/api/universes` | Fetch current universe list |
| POST | `/api/export/{job_id}` | Download XLSX export |
| GET | `/api/health` | Health check |

## Configuration

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | (required) |
| `GOOGLE_SHEETS_URL` | CSV export URL for OTS inventory | Poseidon sheet |
| `CLAUDE_MODEL` | Claude model to use | `claude-sonnet-4-20250514` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

## Project Structure

```
oppo-research-tool/
├── backend/
│   ├── main.py            # FastAPI app + endpoints
│   ├── extraction.py      # Claude-powered attack extraction
│   ├── universe.py        # Google Sheets fetch + universe matching
│   ├── export.py          # XLSX generation
│   ├── models.py          # Pydantic data models
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages + layout
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # API client + types
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```
