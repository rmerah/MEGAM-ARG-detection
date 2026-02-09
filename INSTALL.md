# Guide d'installation - MEGAM ARG Detection

Ce guide explique comment installer et exécuter le pipeline MEGAM ARG Detection sur un nouvel ordinateur.

## Prérequis

- **Python** >= 3.9
- **Conda/Miniconda**
- **Git**
- **Espace disque** : ~20 GB minimum
- **RAM** : 8 GB minimum (16 GB recommandé)
- Outils bioinformatiques (voir section dédiée)

---

## Installation

### Étape 1 : Installer les dépendances Python

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/macOS
# ou: venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### Étape 2 : Installer Conda et les outils bioinformatiques

```bash
# Installer Miniconda si pas déjà fait
# https://docs.conda.io/en/latest/miniconda.html

# Créer l'environnement avec tous les outils
conda create -n megam_arg -c bioconda -c conda-forge \
    fastqc fastp multiqc \
    spades megahit quast \
    prokka \
    ncbi-amrfinderplus abricate rgi \
    kraken2 bracken \
    snippy mlst \
    samtools bcftools bwa seqkit \
    sra-tools entrez-direct

conda activate megam_arg
```

### Étape 3 : Configurer les bases de données ARG

Les bases de données sont téléchargées automatiquement par le pipeline lors de la première exécution. Vous pouvez aussi les télécharger manuellement :

```bash
# AMRFinderPlus
amrfinder_update --database pipeline/databases/amrfinder_db

# Kraken2 (base standard ~8GB)
kraken2-build --standard --db pipeline/databases/kraken2_db

# CARD
cd pipeline/databases/card_db
wget https://card.mcmaster.ca/latest/data
tar -xjf data ./card.json
rgi load --card_json card.json --local

# Abricate databases
abricate --setupdb
```

### Étape 4 : Démarrer les services

**Terminal 1 - Backend :**
```bash
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend :**
```bash
cd maquettes
python3 -m http.server 8080
```

### Étape 5 : Accéder à l'application

- **Interface web** : http://localhost:8080
- **API (Swagger)** : http://localhost:8000/docs
- **API (ReDoc)** : http://localhost:8000/redoc

---

## Structure des répertoires

```
web_interface_arg_2/
├── backend/          # API FastAPI
├── maquettes/        # Frontend HTML/JS
├── pipeline/         # Pipeline bioinformatique
│   ├── data/         # Données d'entrée (FASTQ, FASTA)
│   ├── databases/    # Bases de données ARG
│   ├── outputs/      # Résultats des analyses
│   └── references/   # Génomes de référence
├── python/           # Scripts utilitaires
└── video/            # Vidéo guide d'installation
```

---

## Configuration

### Variables d'environnement

Créez un fichier `backend/.env` basé sur `.env.example` :

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Database
DATABASE_PATH=jobs.db

# Pipeline Configuration
PIPELINE_SCRIPT=../pipeline/MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2_WEB.sh
PIPELINE_WORK_DIR=../pipeline

# Logging
LOG_LEVEL=INFO
```

---

## Résolution de problèmes

### Erreur : "Permission denied" sur les scripts

```bash
chmod +x pipeline/*.sh
```

### Erreur : Base de données manquante

```bash
# Créer les répertoires
mkdir -p pipeline/databases/{kraken2_db,card_db,amrfinder_db}

# Mettre à jour les bases
./pipeline/MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2_WEB.sh update all
```

### Port déjà utilisé

Arrêtez le service qui utilise le port :

```bash
# Vérifier quel processus utilise le port 8000
lsof -i :8000
```

---

## Support

Pour toute question ou problème :
- Consultez la documentation dans le dossier `docs/`
- Vérifiez les logs du backend dans la console

---

## Licence

Ce projet est destiné à un usage de recherche et éducatif.
