# Guide d'installation - MEGAM ARG Detection

Ce guide explique comment installer et exécuter le pipeline MEGAM ARG Detection sur un nouvel ordinateur.

## Prérequis systeme

### Systeme d'exploitation

**Linux ou macOS requis.** Les outils bioinformatiques (AMRFinderPlus, Prokka, ABRicate, etc.) ne sont disponibles que via Bioconda pour Linux et macOS.

**Utilisateurs Windows** : installez WSL2 (Windows Subsystem for Linux) avant de continuer :

```powershell
# Dans PowerShell en administrateur
wsl --install -d Ubuntu
```

Apres le redemarrage, ouvrez Ubuntu depuis le menu Demarrer et suivez les instructions ci-dessous dans le terminal WSL.

> **Note** : Tout le pipeline doit etre execute dans le terminal WSL/Linux, pas dans PowerShell ou CMD.

### Dependances

- **Bash** >= 4.0
- **Python** >= 3.9
- **Git**
- **wget** ou **curl**
- **Conda/Miniconda** (sera installe automatiquement si absent)
- **Espace disque** : ~5 GB minimum (sans bases de donnees)
- **RAM** : 8 GB minimum (16 GB recommande)

---

## Installation rapide (recommandee)

```bash
# Cloner le depot
git clone https://github.com/VOTRE_REPO/megam-arg-detection.git
cd megam-arg-detection

# Rendre le script executable et lancer l'installation
chmod +x setup.sh
./setup.sh
```

Le script `setup.sh` effectue automatiquement :
1. Verification des prerequis systeme
2. Installation de Conda si absent
3. Creation des repertoires du pipeline
4. Creation des 8 environnements Conda :
   - `qc_arg` : FastQC, fastp, MultiQC, SRA Toolkit
   - `assembly_arg` : SPAdes, QUAST, SeqKit
   - `variant_arg` : Snippy, SAMtools, BCFtools
   - `annotation_arg` : Prokka
   - `arg_detection` : AMRFinderPlus, KMA, BLAST
   - `abricate_env` : ABRicate (env separe, conflit de dependances avec AMRFinderPlus)
   - `mlst_env` : MLST (env separe, conflit de dependances avec Prokka)
   - `analysis_arg` : Python, pandas, matplotlib, seaborn, BioPython
5. Telechargement des bases de donnees (AMRFinder, CARD, PointFinder, MLST)
6. Configuration du backend Python (venv + dependances)
7. Validation de l'installation

### Options

```bash
# Installer sans telecharger les bases de donnees (reseau limite)
./setup.sh --skip-databases

# Installer uniquement le pipeline (sans interface web)
./setup.sh --skip-backend
```

---

## Installation manuelle

### Etape 1 : Installer les dependances Python (backend)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Etape 2 : Installer Conda et les outils bioinformatiques

```bash
# Installer Miniconda si pas deja fait
# https://docs.conda.io/en/latest/miniconda.html

# Creer les environnements conda
conda create -n qc_arg -c bioconda -c conda-forge fastqc=0.12.1 fastp multiqc=1.19 "sra-tools>=3.0" -y
conda create -n assembly_arg -c bioconda -c conda-forge spades=3.15.5 quast=5.2.0 seqkit=2.5.1 -y
conda create -n variant_arg -c bioconda -c conda-forge snippy=4.6.0 samtools=1.18 bcftools=1.18 -y
conda create -n annotation_arg -c bioconda -c conda-forge prokka=1.14.6 -y
conda create -n arg_detection -c bioconda -c conda-forge ncbi-amrfinderplus kma blast -y
conda create -n abricate_env -c bioconda -c conda-forge abricate -y
conda create -n mlst_env -c bioconda -c conda-forge mlst=2.23.0 -y
conda create -n analysis_arg -c bioconda -c conda-forge python=3.11 pandas matplotlib seaborn openpyxl biopython -y
```

### Etape 3 : Configurer les bases de donnees ARG

```bash
# AMRFinderPlus
conda run -n arg_detection amrfinder_update --force_update --database pipeline/databases/amrfinder_db

# CARD
mkdir -p pipeline/databases/card_db
cd pipeline/databases/card_db
wget https://card.mcmaster.ca/latest/data -O card.tar.bz2
tar -xjf card.tar.bz2
cd -

# PointFinder
git clone https://bitbucket.org/genomicepidemiology/pointfinder_db.git pipeline/databases/pointfinder_db
```

---

## Demarrage

### Backend API

```bash
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
python3 -m http.server 8080
```

### Acces

- **Interface web** : http://localhost:8080
- **API Swagger** : http://localhost:8000/docs

---

## Depannage

### Erreur : "Permission denied" sur les scripts

```bash
chmod +x pipeline/*.sh setup.sh
```

### Erreur : Base de donnees manquante

```bash
# Creer les repertoires
mkdir -p pipeline/databases/{card_db,amrfinder_db}

# Mettre a jour les bases
./pipeline/MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2_WEB.sh update all
```

### Port deja utilise

```bash
# Verifier quel processus utilise le port 8000
lsof -i :8000
```

### Windows : "bash: ./setup.sh: not found"

Assurez-vous d'executer les commandes dans le terminal WSL (Ubuntu), pas dans PowerShell ou CMD.

```powershell
# Ouvrir WSL
wsl
```

---

## Support

En cas de probleme, ouvrez une issue sur le depot GitHub du projet.
