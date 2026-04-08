import os
import uuid
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import asyncio
from typing import Dict, Optional

from models import UploadResponse, ExtractionResult, Attack, Severity
from extraction import extract_text_from_pdf, extract_text_from_docx, extract_all_attacks
from universe import fetch_universes, match_universes
from export import generate_xlsx

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Opposition Research Attack Extraction API",
    description="Extract and analyze attacks from opposition research documents",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job storage
jobs: Dict[str, dict] = {}

# Temporary file storage
TEMP_DIR = Path("/tmp/oppo_research")
TEMP_DIR.mkdir(exist_ok=True)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Opposition Research Attack Extraction API",
        "version": "1.0.0"
    }


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Accept PDF or DOCX file upload.
    Returns job_id, filename, page_count, and status.
    """
    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in [".pdf", ".docx"]:
        raise HTTPException(
            status_code=400,
            detail="File must be PDF or DOCX format"
        )

    # Generate job ID
    job_id = str(uuid.uuid4())

    # Save file temporarily
    temp_path = TEMP_DIR / f"{job_id}_{file.filename}"

    try:
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Extract metadata and get page count
    try:
        if file_ext == ".pdf":
            _, page_count = extract_text_from_pdf(str(temp_path))
        else:  # .docx
            _, page_count = extract_text_from_docx(str(temp_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

    # Store job info
    jobs[job_id] = {
        "filename": file.filename,
        "temp_path": str(temp_path),
        "file_ext": file_ext,
        "page_count": page_count,
        "status": "uploaded",
        "result": None
    }

    return UploadResponse(
        job_id=job_id,
        filename=file.filename,
        page_count=page_count,
        status="uploaded"
    )


@app.post("/api/extract")
async def extract(job_id: str, subject: str = "Subject"):
    """
    Trigger extraction for an uploaded file.
    Takes job_id and optional subject name.
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]

    if job["status"] != "uploaded":
        raise HTTPException(status_code=400, detail=f"Job is in {job['status']} status")

    # Update status
    job["status"] = "extracting"

    try:
        # Extract text from file
        temp_path = job["temp_path"]
        if job["file_ext"] == ".pdf":
            text, _ = extract_text_from_pdf(temp_path)
        else:  # .docx
            text, _ = extract_text_from_docx(temp_path)

        # Extract attacks using Claude
        attacks = extract_all_attacks(text, job["filename"])

        # Fetch universes
        sheet_url = os.getenv(
            "GOOGLE_SHEETS_URL",
            "https://docs.google.com/spreadsheets/d/1rV7Dgr72gE47MOcYzD9OsuA_f8eU4flA_iBMAgvQjps/export?format=csv&gid=0"
        )
        universes = await fetch_universes(sheet_url)

        # Match attacks to universes
        if universes:
            attacks = match_universes(attacks, universes)
        else:
            universes = []

        # Get unique universes used
        universes_used = set()
        for attack in attacks:
            if attack.best_universe:
                universes_used.add(attack.best_universe)
            if attack.secondary_universe:
                universes_used.add(attack.secondary_universe)
            if attack.tertiary_universe:
                universes_used.add(attack.tertiary_universe)

        # Create result
        result = ExtractionResult(
            job_id=job_id,
            filename=job["filename"],
            subject=subject,
            total_attacks=len(attacks),
            attacks=attacks,
            universes_used=sorted(list(universes_used))
        )

        job["result"] = result
        job["status"] = "completed"

        # Clean up temp file
        try:
            Path(temp_path).unlink()
        except:
            pass

        return {
            "job_id": job_id,
            "status": "completed",
            "total_attacks": len(attacks),
            "universes_used": sorted(list(universes_used))
        }

    except Exception as e:
        job["status"] = "error"
        job["error"] = str(e)
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


@app.get("/api/results/{job_id}")
async def get_results(job_id: str):
    """
    Get extraction results for a completed job.
    Returns structured JSON with all extracted attacks.
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]

    if job["status"] == "extracting":
        return {"status": "extracting", "message": "Extraction in progress"}

    if job["status"] == "error":
        return {"status": "error", "error": job.get("error", "Unknown error")}

    if job["status"] != "completed":
        return {"status": job["status"]}

    if not job["result"]:
        raise HTTPException(status_code=404, detail="Results not available")

    result = job["result"]
    return {
        "job_id": result.job_id,
        "filename": result.filename,
        "subject": result.subject,
        "total_attacks": result.total_attacks,
        "attacks": [attack.model_dump() for attack in result.attacks],
        "universes_used": result.universes_used
    }


@app.get("/api/universes")
async def get_universes():
    """
    Fetch and return current universe list from Google Sheets.
    """
    try:
        sheet_url = os.getenv(
            "GOOGLE_SHEETS_URL",
            "https://docs.google.com/spreadsheets/d/1rV7Dgr72gE47MOcYzD9OsuA_f8eU4flA_iBMAgvQjps/export?format=csv&gid=0"
        )
        universes = await fetch_universes(sheet_url)
        return {
            "count": len(universes),
            "universes": universes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch universes: {str(e)}")


@app.post("/api/export/{job_id}")
async def export_xlsx(job_id: str):
    """
    Generate and return XLSX file for completed extraction.
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]

    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job not completed yet")

    if not job["result"]:
        raise HTTPException(status_code=404, detail="Results not available")

    try:
        result = job["result"]
        xlsx_bytes = generate_xlsx(result)

        filename = f"oppo_research_{result.subject.replace(' ', '_')}_{job_id[:8]}.xlsx"

        return StreamingResponse(
            iter([xlsx_bytes.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
