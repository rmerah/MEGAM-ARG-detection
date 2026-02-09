# ARCHITECTURE - Interface Web Pipeline ARG

> Architecture technique backend + frontend pour le contrôle du pipeline

---

## 🏗️ Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                         UTILISATEUR                             │
│                    (Navigateur Web)                             │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTP + WebSocket
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (HTML/JS)                           │
│  ┌──────────────┬──────────────┬──────────────┐                │
│  │ launch.html  │dashboard.html│ results.html │                │
│  │ (Formulaire) │ (Monitoring) │(Visualisation)│               │
│  └──────────────┴──────────────┴──────────────┘                │
│         Tailwind CSS + Chart.js + Vanilla JS                   │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ REST API + WebSocket
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Python)                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Flask/FastAPI Application                  │   │
│  │  ┌──────────────┬──────────────┬────────────────┐      │   │
│  │  │ API REST     │ WebSocket    │ Background     │      │   │
│  │  │ Endpoints    │ Handler      │ Tasks          │      │   │
│  │  └──────────────┴──────────────┴────────────────┘      │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Modules métiers                            │   │
│  │  ┌──────────────────┬─────────────────┬─────────────┐  │   │
│  │  │ pipeline_runner  │ data_parser     │ file_watcher│  │   │
│  │  │ (Subprocess)     │ (JSON/CSV/TSV)  │ (Logs)      │  │   │
│  │  └──────────────────┴─────────────────┴─────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ subprocess.Popen()
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                PIPELINE BASH (NE PAS MODIFIER)                  │
│            MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2.sh              │
│  ┌──────┬─────┬──────────┬──────────┬─────┬──────────┬────┐   │
│  │ 00   │ 01  │ 02       │ 03       │ 04  │ 05       │ 06 │   │
│  │ Down │ QC  │ Assembly │ Annot    │ ARG │ Variants │ Rep│   │
│  └──────┴─────┴──────────┴──────────┴─────┴──────────┴────┘   │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ Génère fichiers
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│              SYSTÈME DE FICHIERS                                │
│  outputs/${SAMPLE_ID}_v3.2_${TIMESTAMP}/                       │
│  ├── 01_qc/                                                     │
│  ├── 02_assembly/                                               │
│  ├── 03_annotation/                                             │
│  ├── 04_arg_detection/                                          │
│  │   ├── amrfinderplus/*.tsv                                    │
│  │   ├── resfinder/*.tsv                                        │
│  │   └── rgi/*.txt                                              │
│  ├── 05_variant_calling/                                        │
│  ├── 06_analysis/reports/                                       │
│  │   └── ${SAMPLE_ID}_ARG_professional_report.html             │
│  ├── METADATA.json                                              │
│  ├── features_ml.csv                                            │
│  └── logs/pipeline_${TIMESTAMP}.log                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Backend - Architecture détaillée

### Stack technique

**Framework** : **FastAPI** (recommandé) ou Flask
- FastAPI : Performance, async/await, WebSocket natif, auto-docs
- Flask : Plus simple, mature, Socket.IO

**Dépendances principales** :
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-socketio==5.11.0
pandas==2.2.0
watchdog==4.0.0
python-multipart==0.0.6
```

---

### Structure des fichiers backend

```
backend/
├── app.py                      # Point d'entrée principal
├── requirements.txt            # Dépendances Python
├── config.py                   # Configuration (paths, ports)
├── models/
│   ├── analysis.py             # Modèle Analysis (session)
│   └── response.py             # Schémas API (Pydantic)
├── routers/
│   ├── pipeline.py             # Routes /api/pipeline/*
│   ├── results.py              # Routes /api/results/*
│   └── files.py                # Routes /api/files/*
├── services/
│   ├── pipeline_runner.py      # Lancement/contrôle pipeline
│   ├── data_parser.py          # Parsing JSON/CSV/TSV
│   ├── log_streamer.py         # Streaming logs temps réel
│   └── file_watcher.py         # Surveillance fichiers
├── utils/
│   ├── validators.py           # Validation input (SRR*, GCA_*)
│   └── helpers.py              # Fonctions utilitaires
└── static/
    └── frontend/               # Fichiers HTML/JS/CSS
```

---

### 1. Point d'entrée : `app.py`

```python
from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import socketio

# Initialisation FastAPI
app = FastAPI(
    title="ARG Pipeline API",
    version="0.1.0",
    description="API de contrôle du pipeline ARG v3.2"
)

# CORS (si frontend séparé)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Socket.IO pour WebSocket
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, app)

# Monter les routes
from routers import pipeline, results, files
app.include_router(pipeline.router, prefix="/api/pipeline", tags=["Pipeline"])
app.include_router(results.router, prefix="/api/results", tags=["Results"])
app.include_router(files.router, prefix="/api/files", tags=["Files"])

# Servir le frontend
app.mount("/", StaticFiles(directory="static/frontend", html=True), name="frontend")

# Événements WebSocket
@sio.on('connect')
async def connect(sid, environ):
    print(f"Client connecté: {sid}")

@sio.on('disconnect')
async def disconnect(sid):
    print(f"Client déconnecté: {sid}")

# Lancement
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:socket_app", host="0.0.0.0", port=5000, reload=True)
```

---

### 2. Service : `pipeline_runner.py`

```python
import subprocess
import threading
import uuid
from pathlib import Path
from typing import Dict, Optional
import time

class PipelineRunner:
    """Gestionnaire d'exécution du pipeline bash"""

    def __init__(self, pipeline_script: Path, work_dir: Path):
        self.pipeline_script = pipeline_script
        self.work_dir = work_dir
        self.active_jobs: Dict[str, subprocess.Popen] = {}
        self.job_metadata: Dict[str, dict] = {}

    def launch(
        self,
        sample_id: str,
        prokka_mode: str = "auto",
        threads: int = 8,
        force: bool = False
    ) -> str:
        """Lance une nouvelle analyse"""

        # Génération ID unique
        job_id = str(uuid.uuid4())

        # Construction de la commande
        cmd = [
            "bash",
            str(self.pipeline_script),
            sample_id,
            "--prokka-mode", prokka_mode,
            "-t", str(threads)
        ]
        if force:
            cmd.append("--force")

        # Lancement subprocess
        process = subprocess.Popen(
            cmd,
            cwd=self.work_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True
        )

        # Enregistrement
        self.active_jobs[job_id] = process
        self.job_metadata[job_id] = {
            "sample_id": sample_id,
            "start_time": time.time(),
            "status": "running",
            "pid": process.pid,
            "command": " ".join(cmd)
        }

        # Thread pour surveiller la fin
        threading.Thread(
            target=self._monitor_job,
            args=(job_id, process),
            daemon=True
        ).start()

        return job_id

    def _monitor_job(self, job_id: str, process: subprocess.Popen):
        """Surveille la fin d'un job"""
        returncode = process.wait()

        self.job_metadata[job_id]["status"] = "completed" if returncode == 0 else "failed"
        self.job_metadata[job_id]["end_time"] = time.time()
        self.job_metadata[job_id]["returncode"] = returncode

        # Cleanup
        if job_id in self.active_jobs:
            del self.active_jobs[job_id]

    def get_status(self, job_id: str) -> Optional[dict]:
        """Récupère le statut d'un job"""
        return self.job_metadata.get(job_id)

    def list_jobs(self) -> list:
        """Liste tous les jobs (actifs + terminés)"""
        return list(self.job_metadata.values())

    def stop(self, job_id: str) -> bool:
        """Arrête un job en cours"""
        if job_id in self.active_jobs:
            self.active_jobs[job_id].terminate()
            return True
        return False
```

---

### 3. Service : `data_parser.py`

```python
import json
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional

class DataParser:
    """Parser pour les fichiers de résultats du pipeline"""

    @staticmethod
    def parse_metadata(metadata_file: Path) -> Optional[dict]:
        """Parse METADATA.json"""
        if not metadata_file.exists():
            return None

        with open(metadata_file) as f:
            return json.load(f)

    @staticmethod
    def parse_features_ml(csv_file: Path) -> Optional[pd.DataFrame]:
        """Parse features_ml.csv"""
        if not csv_file.exists():
            return None

        return pd.read_csv(csv_file)

    @staticmethod
    def parse_amrfinder(tsv_file: Path) -> List[dict]:
        """Parse AMRFinderPlus TSV"""
        if not tsv_file.exists():
            return []

        df = pd.read_csv(tsv_file, sep='\t')

        genes = []
        for _, row in df.iterrows():
            genes.append({
                "gene": row.get("Gene symbol", "Unknown"),
                "element_type": row.get("Element type", "AMR"),
                "class": row.get("Class", ""),
                "subclass": row.get("Subclass", ""),
                "identity": float(row.get("% Identity to reference sequence", 100)),
                "method": row.get("Method", ""),
                "source": "AMRFinderPlus"
            })

        return genes

    @staticmethod
    def parse_abricate(tsv_file: Path, db_name: str) -> List[dict]:
        """Parse ABRicate TSV (ResFinder, CARD, NCBI, VFDB)"""
        if not tsv_file.exists():
            return []

        genes = []
        with open(tsv_file) as f:
            for line in f:
                if line.startswith('#'):
                    continue

                fields = line.strip().split('\t')
                if len(fields) >= 14:
                    genes.append({
                        "gene": fields[5],
                        "coverage": float(fields[9]),
                        "identity": float(fields[10]),
                        "product": fields[12],
                        "resistance": fields[13] if len(fields) > 13 else "",
                        "source": f"ABRicate {db_name}",
                        "contig": fields[1]
                    })

        return genes

    @staticmethod
    def aggregate_arg_results(results_dir: Path, sample_id: str) -> dict:
        """Agrège tous les résultats ARG"""

        arg_dir = results_dir / "04_arg_detection"

        all_genes = []

        # AMRFinderPlus
        amr_file = arg_dir / "amrfinderplus" / f"{sample_id}_amrfinderplus.tsv"
        all_genes.extend(DataParser.parse_amrfinder(amr_file))

        # ABRicate databases
        for db in ["resfinder", "card", "ncbi", "vfdb"]:
            db_file = arg_dir / db / f"{sample_id}_{db}.tsv"
            all_genes.extend(DataParser.parse_abricate(db_file, db.upper()))

        # Statistiques
        stats = {
            "total_genes": len(all_genes),
            "amr_genes": len([g for g in all_genes if g.get("element_type") == "AMR"]),
            "virulence_genes": len([g for g in all_genes if g.get("element_type") == "VIRULENCE"]),
            "stress_genes": len([g for g in all_genes if g.get("element_type") == "STRESS"]),
            "genes": all_genes
        }

        return stats
```

---

### 4. Service : `log_streamer.py`

```python
import asyncio
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import socketio

class LogStreamer(FileSystemEventHandler):
    """Stream logs en temps réel via WebSocket"""

    def __init__(self, sio: socketio.AsyncServer, log_file: Path):
        self.sio = sio
        self.log_file = log_file
        self.last_position = 0

        # Surveiller le fichier
        self.observer = Observer()
        self.observer.schedule(self, str(log_file.parent), recursive=False)
        self.observer.start()

    def on_modified(self, event):
        """Quand le fichier log est modifié"""
        if event.src_path == str(self.log_file):
            asyncio.create_task(self._send_new_logs())

    async def _send_new_logs(self):
        """Envoie les nouvelles lignes de log"""
        with open(self.log_file) as f:
            f.seek(self.last_position)
            new_lines = f.readlines()
            self.last_position = f.tell()

            for line in new_lines:
                await self.sio.emit('log', {
                    'message': line.strip(),
                    'timestamp': time.time()
                })

    def stop(self):
        """Arrête la surveillance"""
        self.observer.stop()
        self.observer.join()
```

---

### 5. Routes API : `routers/pipeline.py`

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.pipeline_runner import PipelineRunner
from services.log_streamer import LogStreamer
import config

router = APIRouter()
runner = PipelineRunner(
    pipeline_script=config.PIPELINE_SCRIPT,
    work_dir=config.WORK_DIR
)

class LaunchRequest(BaseModel):
    sample_id: str
    prokka_mode: str = "auto"
    threads: int = 8
    force: bool = False

@router.post("/launch")
async def launch_analysis(req: LaunchRequest):
    """Lance une nouvelle analyse"""
    try:
        job_id = runner.launch(
            sample_id=req.sample_id,
            prokka_mode=req.prokka_mode,
            threads=req.threads,
            force=req.force
        )
        return {
            "success": True,
            "job_id": job_id,
            "message": f"Analysis launched for {req.sample_id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{job_id}")
async def get_status(job_id: str):
    """Récupère le statut d'une analyse"""
    status = runner.get_status(job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Job not found")
    return status

@router.get("/list")
async def list_analyses():
    """Liste toutes les analyses"""
    return runner.list_jobs()

@router.post("/stop/{job_id}")
async def stop_analysis(job_id: str):
    """Arrête une analyse en cours"""
    success = runner.stop(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found or already stopped")
    return {"success": True, "message": "Job stopped"}
```

---

## 🎨 Frontend - Architecture détaillée

### Structure des fichiers frontend

```
frontend/
├── index.html                  # Page d'accueil (menu)
├── launch.html                 # Formulaire lancement
├── dashboard.html              # Monitoring temps réel
├── results.html                # Visualisation résultats
├── assets/
│   ├── css/
│   │   └── custom.css          # Styles supplémentaires
│   ├── js/
│   │   ├── api-client.js       # Client API REST
│   │   ├── websocket-client.js # Client WebSocket
│   │   ├── chart-builder.js    # Générateur graphiques
│   │   └── utils.js            # Utilitaires
│   └── images/
│       └── logo.png
└── components/
    ├── header.html             # Header réutilisable
    └── footer.html             # Footer réutilisable
```

---

### Exemple : `assets/js/api-client.js`

```javascript
class PipelineAPI {
    constructor(baseURL = 'http://localhost:5000/api') {
        this.baseURL = baseURL;
    }

    async launchAnalysis(sampleId, prokkaMode = 'auto', threads = 8) {
        const response = await fetch(`${this.baseURL}/pipeline/launch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sample_id: sampleId,
                prokka_mode: prokkaMode,
                threads: threads
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return await response.json();
    }

    async getStatus(jobId) {
        const response = await fetch(`${this.baseURL}/pipeline/status/${jobId}`);
        return await response.json();
    }

    async getResults(sampleId) {
        const response = await fetch(`${this.baseURL}/results/${sampleId}`);
        return await response.json();
    }

    async listAnalyses() {
        const response = await fetch(`${this.baseURL}/pipeline/list`);
        return await response.json();
    }
}

// Export pour utilisation globale
window.PipelineAPI = new PipelineAPI();
```

---

### Exemple : `assets/js/websocket-client.js`

```javascript
class LogsWebSocket {
    constructor(url = 'ws://localhost:5000') {
        this.socket = io(url);
        this.callbacks = [];
    }

    connect() {
        this.socket.on('connect', () => {
            console.log('WebSocket connecté');
        });

        this.socket.on('log', (data) => {
            this.callbacks.forEach(cb => cb(data));
        });
    }

    onLog(callback) {
        this.callbacks.push(callback);
    }

    disconnect() {
        this.socket.disconnect();
    }
}

// Export
window.LogsWebSocket = new LogsWebSocket();
```

---

### Intégration dans `dashboard.html`

```html
<script src="assets/js/api-client.js"></script>
<script src="assets/js/websocket-client.js"></script>
<script>
    // Récupérer job_id depuis URL
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('job_id');

    // Connecter WebSocket
    LogsWebSocket.connect();
    LogsWebSocket.onLog((data) => {
        addLogEntry(data.message);
    });

    // Polling statut
    setInterval(async () => {
        const status = await PipelineAPI.getStatus(jobId);
        updateProgressBar(status.progress);
        updateModuleCards(status.modules);
    }, 2000);
</script>
```

---

## 🔄 Flux complet d'une analyse

### 1. Lancement

**Frontend** (`launch.html`) :
```javascript
const result = await PipelineAPI.launchAnalysis('SRR8618098', 'auto', 8);
window.location.href = `dashboard.html?job_id=${result.job_id}`;
```

**Backend** (`routers/pipeline.py`) :
```python
job_id = runner.launch('SRR8618098', 'auto', 8)
# subprocess.Popen(['bash', 'pipeline.sh', 'SRR8618098', ...])
```

---

### 2. Monitoring

**Backend** (`log_streamer.py`) :
- Surveille `logs/pipeline_${TIMESTAMP}.log`
- Détecte nouvelles lignes (watchdog)
- Émet via WebSocket

**Frontend** (`dashboard.html`) :
- Reçoit logs via Socket.IO
- Affiche dans `#logs-container`
- Parse pour extraire progression modules

---

### 3. Visualisation résultats

**Frontend** (`results.html`) :
```javascript
const data = await PipelineAPI.getResults('SRR8618098');

// Charger métadonnées
document.getElementById('sample-id').textContent = data.metadata.sample.sample_id;
document.getElementById('species').textContent = data.metadata.sample.detected_species;

// Charger stats
document.getElementById('total-genes').textContent = data.arg_stats.total_genes;

// Créer graphiques
createDonutChart('chart-category', data.arg_stats);

// Remplir tableau
populateTable('genes-table', data.arg_stats.genes);
```

**Backend** (`routers/results.py`) :
```python
metadata = DataParser.parse_metadata(f'{results_dir}/METADATA.json')
features = DataParser.parse_features_ml(f'{results_dir}/features_ml.csv')
arg_stats = DataParser.aggregate_arg_results(results_dir, sample_id)

return {
    "metadata": metadata,
    "features": features.to_dict('records')[0],
    "arg_stats": arg_stats
}
```

---

## 🔐 Sécurité & Contraintes

### Validation des inputs
- **Sample ID** : Regex `^[SED]RR\d+$` ou `^GC[AF]_\d+\.\d+$`
- **Threads** : 1-32
- **Prokka mode** : auto|generic|ecoli|custom

### Gestion des erreurs
- Try/except dans tous les endpoints
- Logs structurés (JSON)
- HTTP status codes appropriés

### Limites
- 1 seule analyse par sample à la fois
- Timeout subprocess : 2 heures
- Taille max upload FASTA : 500 MB

---

## 📊 Performance & Scalabilité

### Asynchrone
- FastAPI async/await pour I/O
- WebSocket non-bloquant
- Background tasks pour jobs longs

### Cache
- Redis pour statuts jobs (optionnel)
- Cache fichiers parsés (TTL 5 min)

### Monitoring
- Logs centralisés (syslog)
- Métriques Prometheus (optionnel)

---

**Version** : 0.1.0-alpha
**Dernière mise à jour** : 2026-01-28
