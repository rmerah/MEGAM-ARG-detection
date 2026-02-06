# Backend API - Pipeline ARG

Backend FastAPI pour orchestrer le pipeline de détection de gènes de résistance antimicrobienne (ARG).

## Structure

```
backend/
├── main.py                 # Application FastAPI principale
├── models.py               # Modèles Pydantic (request/response)
├── database.py             # Gestion SQLite
├── pipeline_launcher.py    # Wrapper pour lancer le pipeline bash
├── output_parser.py        # Parser les résultats TSV/HTML
├── requirements.txt        # Dépendances Python
├── jobs.db                 # Base SQLite (créée automatiquement)
└── README.md              # Ce fichier
```

## Installation

### 1. Créer un environnement virtuel

```bash
cd ~/ncbi/public/pipelines/web_interface_arg/backend
python3 -m venv venv
source venv/bin/activate
```

### 2. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 3. Configuration (optionnel)

```bash
cp .env.example .env
# Éditer .env si nécessaire
```

## Démarrage

### Lancer le serveur en mode développement

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Lancer en mode production

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

Une fois lancé, l'API est accessible sur `http://localhost:8000`

### Documentation Interactive

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints Disponibles

#### 1. POST /api/launch - Lancer une analyse

**Request:**
```json
{
  "sample_id": "SRR28083254",
  "threads": 8,
  "prokka_mode": "auto",
  "force": true
}
```

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "sample_id": "SRR28083254",
  "status": "RUNNING",
  "created_at": "2026-01-30T14:30:00",
  "message": "Analyse lancée avec succès (Run #1)"
}
```

#### 2. GET /api/status/{job_id} - Statut d'un job

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "sample_id": "SRR28083254",
  "status": "RUNNING",
  "input_type": "sra",
  "run_number": 1,
  "progress": 45,
  "current_step": "Assemblage en cours",
  "created_at": "2026-01-30T14:30:00",
  "started_at": "2026-01-30T14:30:05",
  "logs_preview": "...",
  "completed_at": null,
  "exit_code": null,
  "error_message": null
}
```

#### 3. GET /api/results/{job_id} - Résultats d'une analyse

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "sample_id": "SRR28083254",
  "run_number": 1,
  "input_type": "sra",
  "assembly_stats": {
    "num_contigs": 245,
    "total_length": 4850000,
    "n50": 125000,
    "gc_percent": 51.2
  },
  "arg_detection": {
    "resfinder": {
      "tool": "ResFinder",
      "num_genes": 12,
      "genes": [...]
    },
    "amrfinderplus": {
      "tool": "AMRFinderPlus",
      "num_genes": 15,
      "genes": [...]
    }
  },
  "total_arg_genes": 12,
  "unique_resistance_types": ["Beta-lactam", "Aminoglycoside", "Tetracycline"],
  "report_html_path": "/path/to/report.html",
  "output_directory": "/path/to/outputs/SRR28083254_1",
  "completed_at": "2026-01-30T15:45:00"
}
```

#### 4. GET /api/jobs - Liste tous les jobs

**Query Parameters:**
- `status_filter`: PENDING, RUNNING, COMPLETED, FAILED (optionnel)
- `limit`: Nombre de résultats (défaut: 100)
- `offset`: Offset pagination (défaut: 0)

**Response:**
```json
{
  "total": 42,
  "jobs": [
    {
      "job_id": "...",
      "sample_id": "SRR28083254",
      "status": "COMPLETED",
      "input_type": "sra",
      "created_at": "2026-01-30T14:30:00",
      "completed_at": "2026-01-30T15:45:00"
    },
    ...
  ]
}
```

## Types d'Inputs Acceptés

Le pipeline détecte automatiquement le type d'input:

| Type | Pattern | Exemple | Description |
|------|---------|---------|-------------|
| **SRA** | `SRR*`, `ERR*`, `DRR*` | `SRR28083254` | Télécharge reads NCBI SRA |
| **GenBank** | `CP*`, `NC_*`, `NZ_*` | `CP133916.1` | Télécharge FASTA GenBank |
| **Assembly** | `GCA_*`, `GCF_*` | `GCA_000005845.2` | Télécharge assemblage NCBI |
| **Local** | `.fasta`, `.fna`, `.fa` | `/path/file.fasta` | Utilise fichier local |

## Modes Prokka

- **auto** (recommandé): Détection automatique de l'espèce via Kraken2
- **generic**: Mode universel pour toutes bactéries
- **ecoli**: Optimisé pour E. coli K-12
- **custom**: Spécification manuelle du genre et de l'espèce

## Base de Données

L'API utilise SQLite (`jobs.db`) pour tracker les jobs.

### Structure de la table `jobs`

```sql
CREATE TABLE jobs (
    id TEXT PRIMARY KEY,           -- UUID
    sample_id TEXT NOT NULL,       -- Identifiant échantillon
    input_type TEXT,               -- sra, genbank, assembly, local_fasta
    status TEXT NOT NULL,          -- PENDING, RUNNING, COMPLETED, FAILED
    run_number INTEGER,            -- Numéro d'exécution (1, 2, 3...)
    output_dir TEXT,               -- Chemin vers outputs/
    pid INTEGER,                   -- Process ID du pipeline
    threads INTEGER DEFAULT 8,
    prokka_mode TEXT DEFAULT 'auto',
    prokka_genus TEXT,
    prokka_species TEXT,
    created_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    exit_code INTEGER,             -- 0 = succès, 1 = erreur
    error_message TEXT
);
```

## Workflow

```
1. POST /api/launch
   ↓
2. Création job en DB (status: PENDING)
   ↓
3. Lancement pipeline bash (subprocess)
   ↓
4. Update status → RUNNING (avec PID, run_number, output_dir)
   ↓
5. Pipeline s'exécute (monitoring via logs)
   ↓
6. Callback on_complete:
   - exit_code == 0 → status: COMPLETED
   - exit_code != 0 → status: FAILED
   ↓
7. GET /api/results → Parse outputs et retourne résultats
```

## Monitoring

L'API surveille la progression du pipeline en:
1. Parsant les logs en temps réel
2. Détectant les modules complétés
3. Estimant le % de progression

## Gestion des Erreurs

- **Exit code 0**: Pipeline terminé avec succès
- **Exit code 1**: Erreur (message capturé dans stderr)
- **Jobs zombies**: Nettoyés automatiquement après 24h (configurable)

## Logs

Les logs de l'API sont affichés dans la console. En production, utiliser un système de logging approprié.

```bash
# Voir les logs en temps réel
tail -f /path/to/api.log
```

## Testing

### Test manuel avec curl

```bash
# Lancer une analyse
curl -X POST http://localhost:8000/api/launch \
  -H "Content-Type: application/json" \
  -d '{"sample_id": "SRR28083254", "threads": 8}'

# Récupérer le statut
curl http://localhost:8000/api/status/{job_id}

# Récupérer les résultats
curl http://localhost:8000/api/results/{job_id}

# Lister les jobs
curl http://localhost:8000/api/jobs
```

### Test avec Swagger UI

Ouvrir http://localhost:8000/docs et tester directement depuis l'interface.

## Troubleshooting

### Le pipeline ne se lance pas

1. Vérifier que le script bash existe:
   ```bash
   ls -l ../pipeline/MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2.sh
   ```

2. Vérifier que conda est activé:
   ```bash
   conda info --base
   ```

3. Vérifier les logs de l'API

### Jobs restent en RUNNING

Si un job reste bloqué en RUNNING après arrêt du serveur:
```python
# Dans une console Python
from database import db
import asyncio

async def cleanup():
    await db.initialize()
    await db.cleanup_stale_jobs(max_age_hours=1)

asyncio.run(cleanup())
```

### Erreur parsing résultats

Vérifier que les fichiers de sortie existent:
```bash
ls -lh ../pipeline/outputs/{SAMPLE_ID}_{RUN_NUMBER}/04_arg_detection/
```

## Développement

### Ajouter un nouvel outil de détection ARG

1. Ajouter méthode de parsing dans `output_parser.py`:
   ```python
   def parse_new_tool(self) -> Optional[DetectionResults]:
       ...
   ```

2. Intégrer dans `parse_all_arg_detection()`:
   ```python
   new_tool = self.parse_new_tool()
   if new_tool:
       results['new_tool'] = new_tool
   ```

### Ajouter un endpoint

Dans `main.py`:
```python
@app.get("/api/my_endpoint")
async def my_endpoint():
    ...
```

## Production

Pour déployer en production:

1. Utiliser Gunicorn + Uvicorn workers
2. Configurer HTTPS (nginx reverse proxy)
3. Limiter les origines CORS
4. Ajouter authentification (JWT, OAuth2)
5. Migrer vers PostgreSQL si besoin
6. Mettre en place monitoring (Prometheus, Grafana)

## Licence

Voir LICENSE à la racine du projet.
