# =============================================================================
# MEGAM ARG Detection - Backend + Pipeline Bioinformatique
# Image basée sur micromamba (mamba préinstallé, plus rapide)
# =============================================================================

FROM mambaorg/micromamba:1.5.6

LABEL maintainer="MEGAM ARG Detection Team"
LABEL description="Pipeline de détection des gènes de résistance aux antimicrobiens (ARG)"
LABEL version="3.2"

# Passer en root pour les installations système
USER root

# Variables d'environnement
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV MAMBA_DOCKERFILE_ACTIVATE=1

# Répertoire de travail
WORKDIR /app

# Installation des dépendances système
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    wget \
    curl \
    git \
    libz-dev \
    libbz2-dev \
    liblzma-dev \
    libncurses5-dev \
    libcurl4-openssl-dev \
    libssl-dev \
    procps \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configuration des canaux et installation des outils bioinformatiques
# Tout en une seule commande RUN pour optimiser le cache
RUN micromamba install -y -n base -c conda-forge -c bioconda -c defaults \
    # QC et prétraitement
    fastqc \
    fastp \
    multiqc \
    sra-tools \
    # Assemblage
    spades \
    megahit \
    quast \
    # Annotation
    prokka \
    # Détection ARG
    ncbi-amrfinderplus \
    abricate \
    # Taxonomie
    kraken2 \
    # Variant calling et outils
    snippy \
    mlst \
    samtools \
    bcftools \
    bwa \
    seqkit \
    # Python pour le backend
    python=3.11 \
    pip \
    && micromamba clean -afy

# Installation des dépendances Python pour le backend
COPY backend/requirements.txt /app/backend/requirements.txt
RUN /opt/conda/bin/pip install --no-cache-dir -r /app/backend/requirements.txt

# Copie du code source
COPY backend/ /app/backend/
COPY pipeline/ /app/pipeline/
COPY python/ /app/python/

# Création des répertoires nécessaires
RUN mkdir -p /app/pipeline/data \
    /app/pipeline/outputs \
    /app/pipeline/databases \
    /app/pipeline/references \
    /app/pipeline/archives \
    /app/pipeline/ml_datasets

# Permissions d'exécution pour les scripts
RUN chmod +x /app/pipeline/*.sh

# Variables d'environnement pour le pipeline
ENV PIPELINE_SCRIPT=/app/pipeline/MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2_WEB.sh
ENV PIPELINE_WORK_DIR=/app/pipeline
ENV DATABASE_PATH=/app/backend/jobs.db
ENV PATH="/opt/conda/bin:$PATH"

# Port exposé
EXPOSE 8000

# Répertoire de travail pour le backend
WORKDIR /app/backend

# Commande de démarrage
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
