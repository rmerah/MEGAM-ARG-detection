# MEGAM ARG Detection WEB

**Interface web pour le pipeline de détection des gènes de résistance aux antimicrobiens (ARG)**

Développé par **Rachid Merah** - rachid.merah77@gmail.com

---

## Description

MEGAM ARG Detection est une interface web moderne permettant de lancer et monitorer des analyses de détection de gènes de résistance aux antimicrobiens. Elle s'appuie sur un pipeline bash puissant intégrant plusieurs outils de référence :

- **AMRFinderPlus** (NCBI) - Détection de gènes ARG
- **ResFinder** (via Abricate) - Base de données de résistance
- **CARD** (via Abricate) - Comprehensive Antibiotic Resistance Database
- **Prokka** - Annotation génomique
- **SPAdes/MEGAHIT** - Assemblage de novo
- **Kraken2** - Classification taxonomique

---

## Fonctionnalités

### Analyse
- Lancement d'analyses depuis une interface web intuitive
- Support de multiples types d'entrée : SRA, GenBank, Assembly NCBI, fichiers locaux
- Configuration des paramètres (threads, mode Prokka)
- Arrêt des analyses en cours

### Monitoring
- Dashboard temps réel avec progression
- Logs du pipeline en direct
- Indicateur de jobs en cours sur toutes les pages

### Résultats
- Affichage des gènes ARG détectés par outil (AMRFinder, ResFinder, CARD)
- Panel de priorité (CRITICAL, HIGH, MEDIUM)
- Graphiques de distribution des résistances
- Export CSV des résultats
- Accès à tous les fichiers générés (visualisation, téléchargement, impression)

### Gestion
- Historique complet des analyses
- Gestion des bases de données ARG
- Suppression des fichiers et jobs

---

## Architecture

```
MEGAM_ARG_Detection_WEB/
├── backend/                    # API FastAPI (Python)
│   ├── main.py                # Endpoints API
│   ├── models.py              # Modèles Pydantic
│   ├── database.py            # SQLite manager
│   ├── pipeline_launcher.py   # Wrapper pipeline bash
│   ├── output_parser.py       # Parser résultats TSV/HTML
│   ├── requirements.txt       # Dépendances Python
│   └── venv/                  # Environnement virtuel
│
├── maquettes/                  # Frontend HTML/JS/TailwindCSS
│   ├── form_launch_analysis.html    # Formulaire lancement
│   ├── dashboard_monitoring.html    # Dashboard monitoring
│   ├── page_results_arg.html        # Page résultats
│   ├── jobs_list.html               # Historique jobs
│   └── databases.html               # Gestion bases de données
│
├── pipeline/                   # Pipeline bash ARG
│   ├── MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2_WEB.sh
│   ├── data/                  # Données téléchargées
│   ├── outputs/               # Résultats analyses
│   └── databases/             # Bases de données ARG
│
└── README.md                   # Ce fichier
```

---

## Installation

### Prérequis

- Python 3.8+
- Conda (pour les outils bioinformatiques)
- Outils : SPAdes, Prokka, AMRFinderPlus, Abricate, Kraken2

### Installation du backend

```bash
cd backend

# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

### Bases de données

Les bases de données suivantes doivent être installées :

| Base | Description | Taille estimée |
|------|-------------|----------------|
| Kraken2 | Classification taxonomique | ~8 GB |
| AMRFinderPlus | Détection ARG (NCBI) | ~200 MB |
| CARD | Comprehensive Antibiotic Resistance Database | ~1 GB |
| ResFinder | Base de données de résistance | ~60 MB |
| PointFinder | Mutations de résistance | ~3 MB |
| MLST | Multi-Locus Sequence Typing | ~200 MB |

---

## Démarrage

### 1. Lancer le backend API (port 8000)

```bash
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Lancer le frontend (port 8080)

```bash
cd maquettes
python3 -m http.server 8080
```

### 3. Accéder à l'interface

Ouvrir dans un navigateur : http://localhost:8080/form_launch_analysis.html

---

## Utilisation

### Types d'entrée supportés

| Type | Format | Exemple | Pipeline exécuté |
|------|--------|---------|------------------|
| SRA | SRR*, ERR*, DRR* | SRR28083254 | Complet (QC → Assemblage → Annotation → ARG) |
| GenBank | CP*, NC*, NZ_* | CP133916.1 | Annotation → ARG |
| Assembly | GCA_*, GCF_* | GCA_025717695.1 | Annotation → ARG |
| Local | Chemin fichier | /data/genome.fasta | Selon extension |

### Workflow typique

1. **Lancer une analyse** : Entrer un identifiant (ex: GCA_025717695.1)
2. **Suivre la progression** : Le dashboard affiche l'avancement en temps réel
3. **Consulter les résultats** : Graphiques, tableaux, export CSV
4. **Télécharger les fichiers** : Accès à tous les fichiers générés

---

## API Endpoints

### Jobs

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/launch` | Lancer une analyse |
| GET | `/api/status/{job_id}` | Statut d'un job |
| GET | `/api/results/{job_id}` | Résultats d'un job |
| GET | `/api/jobs` | Liste des jobs |
| POST | `/api/jobs/{job_id}/stop` | Arrêter un job |
| DELETE | `/api/jobs/{job_id}` | Supprimer un job |
| GET | `/api/jobs/{job_id}/files` | Lister les fichiers |

### Bases de données

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/databases` | Liste des bases |
| POST | `/api/databases/{db_key}/update` | Mettre à jour une base |

---

## Stack technique

### Backend
- **FastAPI** - Framework API async
- **SQLite** - Base de données jobs
- **aiosqlite** - SQLite asynchrone
- **Pydantic** - Validation des données

### Frontend
- **HTML5 / JavaScript** (Vanilla)
- **TailwindCSS** (CDN)
- **Chart.js** - Graphiques

---

## Outils de détection ARG

### AMRFinderPlus (NCBI)
- Base de données curatée par le NCBI
- Détection de gènes, mutations et éléments de résistance

### ResFinder
- Base de données du Center for Genomic Epidemiology
- Focus sur les gènes de résistance acquis

### CARD (Comprehensive Antibiotic Resistance Database)
- Base de données la plus complète
- Inclut les mécanismes de résistance et les régulateurs

---

## Classification de priorité

Les gènes sont classés automatiquement par niveau de priorité :

| Niveau | Types de résistance |
|--------|---------------------|
| **CRITICAL** | Carbapénèmes, Colistine, Vancomycine, MRSA, Linézolide |
| **HIGH** | Bêta-lactamines, Fluoroquinolones, Aminoglycosides, ESBL |
| **MEDIUM** | Tétracyclines, Sulfamides, Triméthoprime, Chloramphénicol |

---

## Dépannage

### Le backend ne démarre pas
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### Les résultats ResFinder/CARD sont vides
Vérifier que les bases de données sont installées et que le pipeline s'exécute correctement.

### Erreur de connexion API
Vérifier que le backend tourne sur le port 8000.

### Cache navigateur
Utiliser Ctrl+Shift+R ou une navigation privée.

---

## Licence

Ce projet est développé pour un usage académique et de recherche.

---

## Contact

**Rachid Merah**
Email : rachid.merah77@gmail.com

---

*Version 3.2 - Janvier 2026*
