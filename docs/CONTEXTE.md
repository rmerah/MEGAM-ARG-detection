# CONTEXTE - Composants existants

> Documentation de compréhension des composants du pipeline ARG v3.2

---

## 📦 1. Pipeline Bash Principal

### Fichier
`pipeline/MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2.sh` (153 KB, ~2000+ lignes)

### Description
Script bash monolithique orchestrant toute l'analyse ARG (Antibiotic Resistance Genes).

### Fonctionnalités principales

#### Support multi-entrées
- **SRA** : `SRR*`, `ERR*`, `DRR*` (paired-end/single-end FASTQ)
- **GenBank** : `CP*`, `NC_*`, `NZ_*` (séquences assemblées)
- **NCBI Assembly** : `GCA_*`, `GCF_*` (assemblages complets)
- **Fichiers locaux** : `/path/to/assembly.fasta`

#### Modes d'exécution
```bash
# Exemples d'utilisation
./pipeline.sh SRR8618098                    # SRA
./pipeline.sh GCA_027890155.2               # Assembly
./pipeline.sh /path/to/assembly.fasta       # Local
./pipeline.sh SRR8618098 --prokka-mode auto -t 16
```

#### Options disponibles
- `--prokka-mode` : auto, generic, ecoli, custom
- `-t, --threads` : Nombre de threads (défaut: 8)
- `-f, --force` : Mode non-interactif
- `--prokka-genus`, `--prokka-species` : Pour mode custom

#### Architecture modulaire (7 modules)

| Module | Nom | Description | Outils |
|--------|-----|-------------|--------|
| **00** | Download | Téléchargement données | sra-tools, wget, datasets |
| **01** | QC | Contrôle qualité | FastQC, Fastp, MultiQC |
| **02** | Assembly | Assemblage génome | SPAdes, seqkit, QUAST |
| **03** | Annotation | Annotation gènes | Prokka, MLST |
| **04** | ARG Detection | Détection gènes résistance | AMRFinderPlus, ABRicate, RGI |
| **05** | Variants | Appel variants | Snippy, bcftools |
| **06** | Reports | Génération rapports | Scripts Python |

#### Système de versioning
- Timestamp automatique : `YYYYMMDD_HHMMSS`
- Répertoires versionnés : `outputs/${SAMPLE_ID}_v3.2_${TIMESTAMP}/`
- Gestion des anciens résultats

#### Variables d'environnement exportées
```bash
NCBI_DETECTED_SPECIES    # Espèce détectée via l'API NCBI
MLST_SCHEME              # Schéma MLST
MLST_ST                  # Sequence Type
MLST_ALLELES             # Profil allélique
```

### ⚠️ RÈGLE ABSOLUE
**Ce fichier NE DOIT JAMAIS être modifié**. L'interface web le pilote tel quel.

---

## 🐍 2. Scripts Python

### 2.1 `collect_features.py` (14 KB, 422 lignes)

**Rôle** : Extraction de features pour Machine Learning

#### Données collectées

**Métriques d'assemblage (QUAST)** :
- N50, L50
- Total length, nombre de contigs
- GC%, largest contig

**Métriques de qualité (Fastp)** :
- Total reads, total bases
- Q30 rate, GC content
- Duplication rate

**Gènes ARG détectés** :
- AMRFinderPlus (TSV)
- ABRicate ResFinder (TSV)
- RGI/CARD (TXT)
- VFDB virulence (TSV)

**Comptages** :
- Total ARG genes
- Total virulence genes
- Par base de données (AMRFinder, ResFinder, RGI, VFDB)

**Vecteur binaire** :
- 50+ gènes de référence (blaTEM, aac(6'), qnrA, tetA, etc.)
- Présence/absence encodée (0/1)

#### Sorties
- `features_ml.csv` : Features de l'échantillon
- `global_dataset.csv` : Dataset cumulatif (optionnel)

#### Utilisation
```bash
python3 collect_features.py \
  --results-dir outputs/SRR8618098_v3.2_20260127_113045 \
  --sample-id SRR8618098 \
  --species "Escherichia coli" \
  --mlst-st 131 \
  --global-dataset dataset.csv
```

---

### 2.2 `generate_arg_report.py` (49 KB, 1106 lignes)

**Rôle** : Génération du rapport HTML professionnel ARG

#### Parsing des sources

**AMRFinderPlus** (TSV) :
- Gene symbol, element type (AMR/VIRULENCE/STRESS)
- Class, subclass
- Method (EXACTX, POINTX, etc.)
- Identity %

**ABRicate ResFinder/CARD/NCBI/VFDB** (TSV) :
- Gene, coverage %, identity %
- Product, resistance profile

**RGI/CARD** (TXT) :
- Best_Hit_ARO, model_type
- Drug class, resistance mechanism
- SNPs, percentage length

**PointFinder** (TXT) :
- Mutations chromosomiques
- Résistance fluoroquinolones/rifampicine

#### Classifications

**Gravité** (CRITICAL/HIGH/MEDIUM) :
- Basé sur classe antibiotique
- Coverage/identity threshold
- Score composite

**Type de résistance** :
- **Acquis** : Gènes mobiles (plasmides, transposons)
- **Mutation** : Mutations chromosomiques
- **Expression** : Surexpression/knockout

**Catégorie** :
- **AMR** : Résistance antibiotiques
- **VIRULENCE** : Facteurs de pathogénicité
- **STRESS** : Adaptation environnementale

#### Rapport HTML généré

**Sections** :
1. Header avec métadonnées (Sample ID, date, espèce, MLST)
2. Statistiques résumées (Total, CRITICAL, HIGH, MEDIUM)
3. Compteurs par catégorie (AMR/Virulence/Stress)
4. Compteurs par mécanisme (Acquis/Mutation/Expression)
5. Graphiques Chart.js (donut, bar)
6. Tableau détaillé avec onglets (Tous/AMR uniquement)
7. Métriques de qualité
8. Explication Acquis vs Mutation
9. Recommandations cliniques

#### Variables d'environnement utilisées
```bash
NCBI_DETECTED_SPECIES    # Affichée dans le header
MLST_SCHEME, MLST_ST, MLST_ALLELES  # Affichés si disponibles
```

#### Sortie
- `${SAMPLE_ID}_ARG_professional_report.html` dans `06_analysis/reports/`

---

### 2.3 `generate_metadata.py` (7.7 KB, 228 lignes)

**Rôle** : Création du fichier de traçabilité METADATA.json

#### Contenu du JSON

**Section pipeline** :
```json
{
  "name": "Pipeline ARG v3.2",
  "version": "3.2",
  "date": "2026-01-27 11:30:45",
  "script": "MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2.sh"
}
```

**Section sample** :
```json
{
  "sample_id": "SRR8618098",
  "input_type": "sra",
  "input_argument": "SRR8618098",
  "detected_species": "Escherichia coli"
}
```

**Section parameters** :
```json
{
  "threads": 8,
  "work_directory": "/path/to/pipeline",
  "force_mode": false
}
```

**Section tools** (versions) :
```json
{
  "fastqc": "0.12.1",
  "fastp": "0.23.4",
  "spades": "3.15.5",
  "prokka": "1.14.6",
  "amrfinderplus": "4.2",
  ...
}
```

**Section databases** :
- Chemins des bases de données
- Status (installed/not_installed)
- Versions si disponibles

**Section system** :
- Hostname, platform
- Python version

#### Utilisation
```bash
python3 generate_metadata.py \
  outputs/SRR8618098_v3.2_20260127_113045 \
  SRR8618098 \
  sra \
  SRR8618098 \
  8
```

#### Sortie
- `METADATA.json` à la racine du répertoire de résultats

---

## 🎨 3. Maquettes HTML (Vibe 3 - Academic Authority)

### 3.1 `dashboard_monitoring.html` (14 KB, 330 lignes)

**Fonctionnalités** :
- Header avec Sample ID et statut d'exécution
- 4 métriques système (Duration, Completion Rate, Modules Completed, System Load)
- Barre de progression globale
- 7 module cards avec statuts (pending/in_progress/completed/failed)
- Logs temps réel avec filtres (ALL/INFO/WARNING/ERROR)
- Recherche dans les logs
- Timer de session auto-incrémenté
- Footer institutionnel

**Mock data** :
- Modules simulés avec progression (68%)
- Logs générés aléatoirement toutes les 3 secondes
- Sample ID : HG002

**JavaScript** :
- Génération dynamique des cartes modules
- Streaming de logs simulé (setInterval)
- Filtrage et recherche en temps réel

---

### 3.2 `form_launch_analysis.html` (28 KB, 575 lignes)

**Wizard 3 étapes** :

**Étape 1 : Input Data**
- Sample ID avec auto-détection (SRA/Assembly/GenBank/Local)
- Badge visuel du type détecté
- Exemples cliquables (SRR8618098, GCA_027890155.2, etc.)
- Radio buttons pour forcer le type
- Upload fichier FASTA (drag & drop)

**Étape 2 : Parameters**
- Prokka Mode : auto, generic, ecoli, custom
- Threads : slider 1-32 (défaut 8)
- Sélection des 7 modules (checkboxes)
  - Module 04-ARG highlighted en bleu

**Étape 3 : Summary & Launch**
- Résumé de tous les paramètres
- Commande CLI générée (copiable)
- Estimation durée (20-30 min SRA, 10-15 min Assembly)
- Bouton "🚀 Launch Analysis"

**Historique** :
- Table des 10 dernières analyses
- 3 exemples pré-remplis

**JavaScript** :
- Navigation wizard (goToStep)
- Auto-détection type d'entrée (regex)
- Génération commande CLI dynamique
- Copy to clipboard

---

### 3.3 `page_results_arg.html` (29 KB, 632 lignes)

**Header** :
- Sample ID : SRR8618098
- Date, durée (22m 14s), espèce (E. coli), statut
- Bouton download PDF

**Summary Cards** (4 cards) :
- Total ARG Genes : 161 (highlighted)
- AMR Genes : 128
- Virulence Genes : 25
- Stress Genes : 8

**Databases Status** :
- 5 bases ✓ (AMRFinderPlus, ResFinder, CARD, NCBI, VFDB)
- 2 bases ⚠ (RGI not found, PointFinder not supported)

**Graphiques Chart.js** (3 charts) :
1. Donut : Répartition AMR/Virulence/Stress (128/25/8)
2. Bar : Gènes par database (AMRFinderPlus 45, ResFinder 9, CARD 52, etc.)
3. Line : Timeline détection par module (0→0→0→161→161→161)

**Filtres** :
- Par catégorie (AMR/Virulence/Stress)
- Par database
- Recherche par nom de gène

**Table détaillée** :
- 10 gènes échantillons avec données réalistes
- Colonnes : Gene, Category, Database, % Identity, % Coverage, Annotation, Contig
- Badges colorés par catégorie
- Pagination (showing 10 of 161)

**Métadonnées (collapsible)** :
- Paramètres pipeline
- Versions des outils
- Fichiers générés (6 fichiers)
- Références bibliographiques (3 citations)

**JavaScript** :
- Chart.js configuration (3 graphiques)
- Filtres mock
- Section collapsible (toggleCollapsible)

---

## 🔗 Flux de données

```
Pipeline Bash
    ↓
[00_download] → data/
    ↓
[01_qc] → 01_qc/fastqc_raw, fastp
    ↓
[02_assembly] → 02_assembly/spades, quast
    ↓
[03_annotation] → 03_annotation/prokka (GFF)
    ↓
[04_arg_detection] → 04_arg_detection/
    ├── amrfinderplus/*.tsv
    ├── resfinder/*.tsv
    ├── card/*.tsv
    ├── rgi/*.txt
    └── vfdb/*.tsv
    ↓
[05_variant_calling] → 05_variant_calling/snippy
    ↓
[06_reports]
    ├── python/generate_arg_report.py → HTML
    ├── python/generate_metadata.py → JSON
    └── python/collect_features.py → CSV
    ↓
Sorties finales:
    - 06_analysis/reports/${SAMPLE_ID}_ARG_professional_report.html
    - METADATA.json
    - features_ml.csv
```

---

## 📊 Formats de fichiers générés

### TSV (Tab-Separated Values)
- AMRFinderPlus : 17+ colonnes (Gene symbol, Class, Subclass, Method, Identity, etc.)
- ABRicate : 14 colonnes (#FILE, SEQUENCE, START, END, STRAND, GENE, COVERAGE, GAPS, %COVERAGE, %IDENTITY, DATABASE, ACCESSION, PRODUCT, RESISTANCE)

### JSON
- METADATA.json : Structure hiérarchique (pipeline, sample, parameters, tools, databases, system, results)

### CSV
- features_ml.csv : Features ML (métriques QUAST, Fastp, compteurs ARG, vecteur binaire)

### HTML
- Rapport ARG : Page autonome avec Chart.js, Tailwind CSS, JavaScript vanilla

### GFF (General Feature Format)
- Prokka annotation : Genes, CDS, tRNA, rRNA

### VCF (Variant Call Format)
- Snippy variants : SNPs, indels

---

## 🎯 Points clés pour l'interface web

### Données à récupérer
1. **Depuis METADATA.json** :
   - Sample ID, espèce détectée
   - Paramètres (threads, prokka mode)
   - Versions des outils
   - Timestamp, durée

2. **Depuis features_ml.csv** :
   - Métriques d'assemblage (N50, contigs, etc.)
   - Compteurs ARG (total, par DB)
   - Métriques qualité (Q30, GC%)

3. **Depuis fichiers TSV** (AMRFinder, ABRicate, RGI) :
   - Liste complète des gènes ARG
   - Classifications (gravité, type, catégorie)
   - Coverage, identity
   - Annotations

4. **Depuis logs du pipeline** :
   - Progression en temps réel
   - Messages INFO/WARNING/ERROR
   - Statut des modules

### Intégration avec frontend

**dashboard_monitoring.html** :
- Remplacer mock logs par vraie lecture `tail -f LOG_FILE`
- Mettre à jour progression via parsing du log
- WebSocket pour push temps réel

**form_launch_analysis.html** :
- Soumettre formulaire → API backend
- Backend lance `pipeline.sh` avec subprocess
- Redirection vers dashboard avec session ID

**page_results_arg.html** :
- Charger METADATA.json pour header
- Parser TSV pour remplir tableau
- Calculer statistiques pour graphiques
- Lire features_ml.csv pour métriques

---

## 🔧 Technologies utilisées

### Pipeline
- **Bash** : Script orchestration
- **Conda** : Gestion environnements (6 envs)
- **Python 3.11** : Scripts génération rapports

### Outils bioinformatiques
- **QC** : FastQC, Fastp, MultiQC
- **Assembly** : SPAdes, seqkit, QUAST
- **Annotation** : Prokka, MLST
- **ARG** : AMRFinderPlus, ABRicate (5 DB), RGI/CARD, PointFinder
- **Variants** : Snippy, bcftools, samtools

### Maquettes
- **CSS** : Tailwind CSS (via CDN)
- **JavaScript** : Vanilla ES6+
- **Graphiques** : Chart.js 4.4.1
- **Fonts** : Google Fonts (Merriweather, Inter, JetBrains Mono)

---

**Dernière mise à jour** : 2026-01-28
**Tokens utilisés pour compréhension** : ~95000
**Fichiers analysés** : 7 (1 bash, 3 python, 3 html)
