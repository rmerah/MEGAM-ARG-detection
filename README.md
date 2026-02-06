<p align="center">
  <img src="maquettes/logo.png" alt="MEGAM ARG Detection" width="120">
</p>

<h1 align="center">MEGAM ARG Detection WEB</h1>

<p align="center">
  <strong>Antimicrobial Resistance Gene Detection Pipeline</strong><br>
  Web interface for ARG detection using AMRFinderPlus, ResFinder, CARD, Prokka, SPAdes/MEGAHIT & Kraken2
</p>

<p align="center">
  <a href="#-installation-guide-video">Video</a> &bull;
  <a href="#-fran%C3%A7ais">Fran&ccedil;ais</a> &bull;
  <a href="#-english">English</a>
</p>

---

## Installation Guide Video

https://github.com/rmerah/MEGAM-ARG-detection/raw/main/video_remotion/out/install-guide.mp4

---

<details open>
<summary><h2>Fran&ccedil;ais</h2></summary>

### Description

MEGAM ARG Detection est une interface web moderne permettant de lancer et monitorer des analyses de d&eacute;tection de g&egrave;nes de r&eacute;sistance aux antimicrobiens. Elle s'appuie sur un pipeline bash int&eacute;grant plusieurs outils de r&eacute;f&eacute;rence :

- **AMRFinderPlus** (NCBI) - D&eacute;tection de g&egrave;nes ARG
- **ResFinder** (via Abricate) - Base de donn&eacute;es de r&eacute;sistance
- **CARD** (via Abricate) - Comprehensive Antibiotic Resistance Database
- **Prokka** - Annotation g&eacute;nomique
- **SPAdes/MEGAHIT** - Assemblage de novo
- **Kraken2** - Classification taxonomique

### Fonctionnalit&eacute;s

- Lancement d'analyses depuis une interface web intuitive
- Support : SRA, GenBank, Assembly NCBI, fichiers locaux
- Dashboard monitoring temps r&eacute;el avec progression
- Affichage des g&egrave;nes ARG par outil avec classification de priorit&eacute; (CRITICAL, HIGH, MEDIUM)
- Graphiques, export CSV, acc&egrave;s aux fichiers g&eacute;n&eacute;r&eacute;s
- Gestion des bases de donn&eacute;es avec barres de progression
- Historique complet des analyses

### Installation

#### Pr&eacute;requis

- Python 3.8+
- Conda (pour les outils bioinformatiques)
- Outils : SPAdes, Prokka, AMRFinderPlus, Abricate, Kraken2

#### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Bases de donn&eacute;es

| Base | Description | Taille estim&eacute;e |
|------|-------------|----------------|
| Kraken2 | Classification taxonomique | ~8 GB |
| AMRFinderPlus | D&eacute;tection ARG (NCBI) | ~200 MB |
| CARD | Comprehensive Antibiotic Resistance Database | ~1 GB |
| ResFinder | Base de donn&eacute;es de r&eacute;sistance | ~60 MB |
| PointFinder | Mutations de r&eacute;sistance | ~3 MB |
| MLST | Multi-Locus Sequence Typing | ~200 MB |

Les bases peuvent &ecirc;tre t&eacute;l&eacute;charg&eacute;es depuis la page **Gestion des bases de donn&eacute;es** de l'interface web.

### D&eacute;marrage

```bash
# 1. Backend API (port 8000)
cd backend && source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 2. Frontend (port 8080)
cd maquettes
python3 -m http.server 8080

# 3. Ouvrir http://localhost:8080/form_launch_analysis.html
```

#### Docker (alternative)

```bash
docker compose up --build -d
# Frontend: http://localhost:8080
# API: http://localhost:8000/docs
```

### Types d'entr&eacute;e support&eacute;s

| Type | Format | Exemple |
|------|--------|---------|
| SRA | SRR*, ERR*, DRR* | SRR28083254 |
| GenBank | CP*, NC*, NZ_* | CP133916.1 |
| Assembly | GCA_*, GCF_* | GCA_027890155.2 |
| Local | Chemin fichier | /data/genome.fasta |

### API Endpoints

| M&eacute;thode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/launch` | Lancer une analyse |
| GET | `/api/status/{job_id}` | Statut d'un job |
| GET | `/api/results/{job_id}` | R&eacute;sultats d'un job |
| GET | `/api/jobs` | Liste des jobs |
| POST | `/api/jobs/{job_id}/stop` | Arr&ecirc;ter un job |
| DELETE | `/api/jobs/{job_id}` | Supprimer un job |
| GET | `/api/databases` | Liste des bases |
| POST | `/api/databases/{db_key}/update` | Mettre &agrave; jour une base |
| GET | `/api/databases/{db_key}/progress` | Progression du t&eacute;l&eacute;chargement |

Documentation compl&egrave;te : http://localhost:8000/docs

### Classification de priorit&eacute;

| Niveau | Types de r&eacute;sistance |
|--------|---------------------|
| **CRITICAL** | Carbap&eacute;n&egrave;mes, Colistine, Vancomycine, MRSA, Lin&eacute;zolide |
| **HIGH** | B&ecirc;ta-lactamines, Fluoroquinolones, Aminoglycosides, ESBL |
| **MEDIUM** | T&eacute;tracyclines, Sulfamides, Trim&eacute;thoprime, Chloramph&eacute;nicol |

</details>

---

<details>
<summary><h2>English</h2></summary>

### Description

MEGAM ARG Detection is a modern web interface for launching and monitoring antimicrobial resistance gene detection analyses. It relies on a powerful bash pipeline integrating multiple reference tools:

- **AMRFinderPlus** (NCBI) - ARG gene detection
- **ResFinder** (via Abricate) - Acquired resistance genes database
- **CARD** (via Abricate) - Comprehensive Antibiotic Resistance Database
- **Prokka** - Genome annotation
- **SPAdes/MEGAHIT** - De novo assembly
- **Kraken2** - Taxonomic classification

### Features

- Launch analyses from an intuitive web interface
- Support: SRA, GenBank, NCBI Assembly, local files
- Real-time monitoring dashboard with progress tracking
- ARG genes display per tool with priority classification (CRITICAL, HIGH, MEDIUM)
- Charts, CSV export, access to generated files
- Database management with download progress bars
- Complete analysis history

### Installation

#### Prerequisites

- Python 3.8+
- Conda (for bioinformatics tools)
- Tools: SPAdes, Prokka, AMRFinderPlus, Abricate, Kraken2

#### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Databases

| Database | Description | Estimated size |
|----------|-------------|----------------|
| Kraken2 | Taxonomic classification | ~8 GB |
| AMRFinderPlus | ARG detection (NCBI) | ~200 MB |
| CARD | Comprehensive Antibiotic Resistance Database | ~1 GB |
| ResFinder | Resistance gene database | ~60 MB |
| PointFinder | Resistance mutations | ~3 MB |
| MLST | Multi-Locus Sequence Typing | ~200 MB |

Databases can be downloaded from the **Database Management** page in the web interface.

### Quick Start

```bash
# 1. Backend API (port 8000)
cd backend && source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 2. Frontend (port 8080)
cd maquettes
python3 -m http.server 8080

# 3. Open http://localhost:8080/form_launch_analysis.html
```

#### Docker (alternative)

```bash
docker compose up --build -d
# Frontend: http://localhost:8080
# API docs: http://localhost:8000/docs
```

### Supported input types

| Type | Format | Example |
|------|--------|---------|
| SRA | SRR*, ERR*, DRR* | SRR28083254 |
| GenBank | CP*, NC*, NZ_* | CP133916.1 |
| Assembly | GCA_*, GCF_* | GCA_027890155.2 |
| Local | File path | /data/genome.fasta |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/launch` | Launch an analysis |
| GET | `/api/status/{job_id}` | Job status |
| GET | `/api/results/{job_id}` | Job results |
| GET | `/api/jobs` | List all jobs |
| POST | `/api/jobs/{job_id}/stop` | Stop a job |
| DELETE | `/api/jobs/{job_id}` | Delete a job |
| GET | `/api/databases` | List all databases |
| POST | `/api/databases/{db_key}/update` | Update/download a database |
| GET | `/api/databases/{db_key}/progress` | Download progress |

Full documentation: http://localhost:8000/docs

### Priority Classification

| Level | Resistance types |
|-------|------------------|
| **CRITICAL** | Carbapenems, Colistin, Vancomycin, MRSA, Linezolid |
| **HIGH** | Beta-lactams, Fluoroquinolones, Aminoglycosides, ESBL |
| **MEDIUM** | Tetracyclines, Sulfonamides, Trimethoprim, Chloramphenicol |

</details>

---

## Architecture

```
MEGAM_ARG_Detection_WEB/
├── backend/                    # FastAPI API (Python)
│   ├── main.py                # API endpoints
│   ├── models.py              # Pydantic models
│   ├── database.py            # SQLite manager
│   ├── pipeline_launcher.py   # Pipeline wrapper
│   ├── output_parser.py       # TSV/HTML results parser
│   └── requirements.txt       # Dependencies
│
├── maquettes/                  # Frontend HTML/JS/TailwindCSS
│   ├── form_launch_analysis.html
│   ├── dashboard_monitoring.html
│   ├── page_results_arg.html
│   ├── jobs_list.html
│   ├── databases.html
│   └── api-client.js          # API client (auto URL detection)
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

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | FastAPI, SQLite (aiosqlite), Pydantic |
| **Frontend** | HTML5, Vanilla JS, TailwindCSS (CDN), Chart.js |
| **Pipeline** | Bash, Conda (bioinformatics tools) |
| **Deployment** | Docker, Docker Compose, nginx |

---

## Contact

**Rachid Merah** - rachid.merah77@gmail.com

*Version 3.2 - February 2026*
