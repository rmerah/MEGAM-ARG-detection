# MEGAM ARG Detection WEB

**Web interface for the Antimicrobial Resistance Gene (ARG) detection pipeline**

Developed by **Rachid Merah** - rachid.merah77@gmail.com

> **[Version française (README.md)](README.md)**

---

## Installation Guide Video

https://github.com/rmerah/MEGAM-ARG-detection/raw/main/video_remotion/out/install-guide.mp4

---

## Description

MEGAM ARG Detection is a modern web interface for launching and monitoring antimicrobial resistance gene detection analyses. It relies on a powerful bash pipeline integrating multiple reference tools:

- **AMRFinderPlus** (NCBI) - ARG gene detection
- **ResFinder** (via Abricate) - Acquired resistance genes database
- **CARD** (via Abricate) - Comprehensive Antibiotic Resistance Database
- **Prokka** - Genome annotation
- **SPAdes/MEGAHIT** - De novo assembly
- **Kraken2** - Taxonomic classification

---

## Features

### Analysis
- Launch analyses from an intuitive web interface
- Multiple input types: SRA, GenBank, NCBI Assembly, local files
- Configurable parameters (threads, Prokka mode)
- Stop running analyses

### Monitoring
- Real-time dashboard with progress tracking
- Live pipeline logs
- Running jobs indicator on all pages

### Results
- ARG genes display per tool (AMRFinder, ResFinder, CARD)
- Priority panel (CRITICAL, HIGH, MEDIUM)
- Resistance distribution charts
- CSV export
- Access to all generated files (view, download, print)

### Management
- Complete analysis history
- ARG database management with download progress bars
- File and job deletion

---

## Architecture

```
MEGAM_ARG_Detection_WEB/
├── backend/                    # FastAPI API (Python)
│   ├── main.py                # API endpoints
│   ├── models.py              # Pydantic models
│   ├── database.py            # SQLite manager
│   ├── pipeline_launcher.py   # Bash pipeline wrapper
│   ├── output_parser.py       # TSV/HTML results parser
│   └── requirements.txt       # Python dependencies
│
├── maquettes/                  # Frontend HTML/JS/TailwindCSS
│   ├── form_launch_analysis.html    # Launch form
│   ├── dashboard_monitoring.html    # Monitoring dashboard
│   ├── page_results_arg.html        # Results page
│   ├── jobs_list.html               # Job history
│   ├── databases.html               # Database management
│   └── api-client.js                # API client (auto URL detection)
│
├── pipeline/                   # Bash ARG pipeline
│   ├── MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2_WEB.sh
│   ├── data/                  # Downloaded data
│   ├── outputs/               # Analysis results
│   └── databases/             # ARG databases
│
└── video_remotion/             # Installation guide video (Remotion)
    └── out/install-guide.mp4
```

---

## Installation

### Prerequisites

- Python 3.8+
- Conda (for bioinformatics tools)
- Tools: SPAdes, Prokka, AMRFinderPlus, Abricate, Kraken2

### Backend setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Databases

The following databases are required:

| Database | Description | Estimated size |
|----------|-------------|----------------|
| Kraken2 | Taxonomic classification | ~8 GB |
| AMRFinderPlus | ARG detection (NCBI) | ~200 MB |
| CARD | Comprehensive Antibiotic Resistance Database | ~1 GB |
| ResFinder | Resistance gene database | ~60 MB |
| PointFinder | Resistance mutations | ~3 MB |
| MLST | Multi-Locus Sequence Typing | ~200 MB |

Databases can be downloaded directly from the **Database Management** page in the web interface, with real-time progress tracking.

---

## Quick Start

### 1. Start the backend API (port 8000)

```bash
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start the frontend (port 8080)

```bash
cd maquettes
python3 -m http.server 8080
```

### 3. Open the interface

Open in your browser: http://localhost:8080/form_launch_analysis.html

### Docker deployment (alternative)

```bash
docker compose up --build -d
# Frontend: http://localhost:8080
# API docs: http://localhost:8000/docs
```

---

## Usage

### Supported input types

| Type | Format | Example | Pipeline executed |
|------|--------|---------|-------------------|
| SRA | SRR*, ERR*, DRR* | SRR28083254 | Full (QC → Assembly → Annotation → ARG) |
| GenBank | CP*, NC*, NZ_* | CP133916.1 | Annotation → ARG |
| Assembly | GCA_*, GCF_* | GCA_027890155.2 | Annotation → ARG |
| Local | File path | /data/genome.fasta | Depends on extension |

### Typical workflow

1. **Launch an analysis**: Enter an identifier (e.g., GCA_027890155.2)
2. **Monitor progress**: The dashboard shows real-time progress
3. **View results**: Charts, tables, CSV export
4. **Download files**: Access all generated files

---

## API Endpoints

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/launch` | Launch an analysis |
| GET | `/api/status/{job_id}` | Job status |
| GET | `/api/results/{job_id}` | Job results |
| GET | `/api/jobs` | List all jobs |
| POST | `/api/jobs/{job_id}/stop` | Stop a job |
| DELETE | `/api/jobs/{job_id}` | Delete a job |
| GET | `/api/jobs/{job_id}/files` | List job files |

### Databases

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/databases` | List all databases |
| POST | `/api/databases/{db_key}/update` | Update/download a database |
| GET | `/api/databases/{db_key}/progress` | Download progress |

Full API documentation: http://localhost:8000/docs (Swagger UI)

---

## Tech Stack

### Backend
- **FastAPI** - Async API framework
- **SQLite** (aiosqlite) - Job database
- **Pydantic** - Data validation

### Frontend
- **HTML5 / Vanilla JavaScript**
- **TailwindCSS** (CDN)
- **Chart.js** - Charts

### Pipeline
- **Bash** + **Conda** (bioinformatics tools)
- **Docker** / **Docker Compose** for deployment

---

## Priority Classification

Genes are automatically classified by priority level:

| Level | Resistance types |
|-------|------------------|
| **CRITICAL** | Carbapenems, Colistin, Vancomycin, MRSA, Linezolid |
| **HIGH** | Beta-lactams, Fluoroquinolones, Aminoglycosides, ESBL |
| **MEDIUM** | Tetracyclines, Sulfonamides, Trimethoprim, Chloramphenicol |

---

## Troubleshooting

### Backend won't start
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### ResFinder/CARD results are empty
Check that databases are installed from the Database Management page.

### API connection error
A red banner will appear on all pages if the backend is unreachable. Make sure the backend is running on port 8000.

### Browser cache
Use Ctrl+Shift+R or private browsing.

---

## License

This project is developed for academic and research use.

---

## Contact

**Rachid Merah**
Email: rachid.merah77@gmail.com

---

*Version 3.2 - February 2026*
