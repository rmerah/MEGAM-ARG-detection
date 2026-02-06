# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

**MEGAM ARG Detection WEB** - Interface web pour le pipeline de détection des gènes de résistance aux antimicrobiens (ARG). Utilise AMRFinderPlus, ResFinder, CARD, Prokka, SPAdes/MEGAHIT et Kraken2.

## Commandes de développement

### Démarrage du backend (port 8000)
```bash
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Démarrage du frontend (port 8080)
```bash
cd maquettes
python3 -m http.server 8080
```

### Installation des dépendances backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Documentation API
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Architecture

```
├── backend/                    # API FastAPI (Python)
│   ├── main.py                # Endpoints API principaux
│   ├── models.py              # Modèles Pydantic (request/response)
│   ├── database.py            # Gestion SQLite (jobs.db)
│   ├── pipeline_launcher.py   # Wrapper pour lancer le pipeline bash
│   └── output_parser.py       # Parser résultats TSV/HTML des outils ARG
│
├── maquettes/                  # Frontend HTML/JS/TailwindCSS (CDN)
│   ├── form_launch_analysis.html    # Formulaire lancement
│   ├── dashboard_monitoring.html    # Dashboard monitoring temps réel
│   ├── page_results_arg.html        # Affichage résultats ARG
│   ├── jobs_list.html               # Historique des jobs
│   ├── databases.html               # Gestion bases de données
│   └── api-client.js                # Client API JavaScript
│
├── pipeline/                   # Pipeline bash ARG
│   ├── MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2_WEB.sh  # Version web
│   ├── MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2.sh      # Version CLI
│   ├── data/                  # Données téléchargées (SRA, GenBank)
│   ├── outputs/               # Résultats analyses (sample_id_run_number/)
│   └── databases/             # Bases ARG (amrfinder, card, kraken2, etc.)
│
└── python/                     # Scripts Python auxiliaires
    ├── generate_arg_report.py # Génération rapport HTML
    └── collect_features.py    # Extraction features ML
```

## Workflow API

1. `POST /api/launch` → Crée job en DB (status: PENDING)
2. Pipeline bash lancé en subprocess (status: RUNNING)
3. Monitoring via parsing logs temps réel
4. Callback on_complete → status: COMPLETED ou FAILED
5. `GET /api/results/{job_id}` → Parse outputs et retourne résultats

## Types d'entrée supportés

| Type | Pattern | Exemple |
|------|---------|---------|
| SRA | `SRR*`, `ERR*`, `DRR*` | SRR28083254 |
| GenBank | `CP*`, `NC_*`, `NZ_*` | CP133916.1 |
| Assembly | `GCA_*`, `GCF_*` | GCA_000005845.2 |
| Local | `.fasta`, `.fna`, `.fa` | /path/file.fasta |

## Base de données jobs (SQLite)

Table `jobs` avec colonnes principales: `id`, `sample_id`, `input_type`, `status` (PENDING/RUNNING/COMPLETED/FAILED), `run_number`, `output_dir`, `pid`, `threads`, `prokka_mode`.

## Ajout nouvel outil ARG

1. Ajouter méthode de parsing dans `backend/output_parser.py`
2. Intégrer dans `parse_all_arg_detection()`

## Stack technique

- **Backend**: FastAPI, aiosqlite, Pydantic
- **Frontend**: HTML5, JavaScript vanilla, TailwindCSS (CDN), Chart.js
- **Pipeline**: Bash, conda (outils bioinformatiques)
- **Conteneurisation**: Docker, Docker Compose

## Déploiement Docker

### Démarrage rapide avec Docker Compose
```bash
./scripts/deploy.sh
# Choisir option 1 pour construire et démarrer
```

### Commandes Docker manuelles
```bash
# Construire et démarrer
docker compose up --build -d

# Voir les logs
docker compose logs -f

# Arrêter
docker compose down
```

### Fichiers Docker
- `Dockerfile` - Image backend avec outils bioinformatiques (conda)
- `Dockerfile.frontend` - Image nginx pour le frontend
- `docker-compose.yml` - Orchestration des services
- `docker/nginx.conf` - Configuration proxy nginx

### Création d'archive portable
```bash
./scripts/create_archive.sh
# Choisir le type d'archive souhaité
```

## Note importante :

Apres des changements majeurs, mets a jour ce fichier.
Garde ce fichier a jour avec l'etat du projet afin de le representer de facon precise.