#!/bin/bash
# =============================================================================
# MEGAM ARG Detection Pipeline - Installation automatique
# Version 3.2
# =============================================================================

set -e

# ============= COULEURS ET ICÔNES =============
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
info() { echo -e "  ${BLUE}→${NC} $1"; }
step() { echo -e "\n${CYAN}${BOLD}[$1/$TOTAL_STEPS]${NC} ${BOLD}$2${NC}"; }

TOTAL_STEPS=8
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIPELINE_DIR="$SCRIPT_DIR/pipeline"
BACKEND_DIR="$SCRIPT_DIR/backend"

# ============= OPTIONS =============
SKIP_DATABASES=false
SKIP_BACKEND=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-databases) SKIP_DATABASES=true; shift ;;
        --skip-backend)   SKIP_BACKEND=true; shift ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --skip-databases   Installer sans télécharger les bases de données"
            echo "  --skip-backend     Installer uniquement le pipeline (sans interface web)"
            echo "  --help, -h         Afficher cette aide"
            exit 0
            ;;
        *) echo "Option inconnue: $1"; exit 1 ;;
    esac
done

# =============================================================================
# 1. BANNIÈRE
# =============================================================================
print_banner() {
    echo ""
    echo -e "${CYAN}${BOLD}"
    echo "  ╔═══════════════════════════════════════════════════════════╗"
    echo "  ║         MEGAM ARG Detection Pipeline                     ║"
    echo "  ║         Installation automatique - v3.2                  ║"
    echo "  ╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo -e "  Détection de gènes de résistance aux antimicrobiens (ARG)"
    echo -e "  Outils : AMRFinderPlus, ResFinder, CARD, Prokka, SPAdes"
    echo ""
}

# =============================================================================
# 2. VÉRIFICATION SYSTÈME
# =============================================================================
check_system() {
    step 1 "Vérification du système"

    local errors=0

    # OS compatible (Linux ou macOS)
    local os_name=$(uname -s)
    if [[ "$os_name" == "Linux" ]] || [[ "$os_name" == "Darwin" ]]; then
        ok "Système: $os_name $(uname -m)"
        if grep -qi microsoft /proc/version 2>/dev/null; then
            ok "WSL détecté"
        fi
    else
        fail "Linux ou macOS requis (détecté: $os_name)"
        fail "Sur Windows, installez WSL2 d'abord :"
        fail "  1. Ouvrez PowerShell en administrateur"
        fail "  2. Exécutez: wsl --install -d Ubuntu"
        fail "  3. Redémarrez, ouvrez Ubuntu, puis relancez ce script"
        exit 1
    fi

    # Bash 4+
    if [[ "${BASH_VERSINFO[0]}" -ge 4 ]]; then
        ok "Bash ${BASH_VERSION}"
    else
        fail "Bash 4+ requis (trouvé: ${BASH_VERSION})"
        errors=$((errors + 1))
    fi

    # Détection du gestionnaire de paquets
    local PKG_MANAGER=""
    if command -v apt-get &>/dev/null; then
        PKG_MANAGER="apt"
    elif command -v yum &>/dev/null; then
        PKG_MANAGER="yum"
    elif command -v brew &>/dev/null; then
        PKG_MANAGER="brew"
    fi

    # Liste des paquets manquants à installer
    local missing_pkgs=()

    # Python3
    if command -v python3 &>/dev/null; then
        local pyver=$(python3 --version 2>&1 | awk '{print $2}')
        ok "Python $pyver"
        # Vérifier que python3-venv est installé (souvent manquant sur Ubuntu/Debian)
        if ! python3 -m venv --help &>/dev/null; then
            warn "python3-venv non installé (requis pour le backend)"
            if [[ "$PKG_MANAGER" == "apt" ]]; then
                missing_pkgs+=("python3-venv")
            elif [[ "$PKG_MANAGER" == "yum" ]]; then
                missing_pkgs+=("python3-virtualenv")
            fi
        else
            ok "python3-venv disponible"
        fi
    else
        warn "Python3 non trouvé"
        missing_pkgs+=("python3" "python3-venv" "python3-pip")
    fi

    # Git
    if command -v git &>/dev/null; then
        ok "Git $(git --version | awk '{print $3}')"
    else
        warn "Git non trouvé"
        missing_pkgs+=("git")
    fi

    # wget
    if command -v wget &>/dev/null; then
        ok "wget disponible"
    else
        warn "wget non trouvé"
        missing_pkgs+=("wget")
    fi

    # curl
    if command -v curl &>/dev/null; then
        ok "curl disponible"
    else
        warn "curl non trouvé"
        missing_pkgs+=("curl")
    fi

    # Installation automatique des paquets manquants
    if [[ ${#missing_pkgs[@]} -gt 0 ]]; then
        echo ""
        warn "Paquets manquants: ${missing_pkgs[*]}"

        if [[ -n "$PKG_MANAGER" ]]; then
            read -p "  Installer automatiquement ? (o/n) [o]: " install_pkgs
            install_pkgs=${install_pkgs:-o}

            if [[ "$install_pkgs" =~ ^[oOyY]$ ]]; then
                info "Installation des paquets système..."
                case "$PKG_MANAGER" in
                    apt)
                        sudo apt-get update -qq && sudo apt-get install -y -qq "${missing_pkgs[@]}" 2>&1 | tail -3
                        ;;
                    yum)
                        sudo yum install -y "${missing_pkgs[@]}" 2>&1 | tail -3
                        ;;
                    brew)
                        brew install "${missing_pkgs[@]}" 2>&1 | tail -3
                        ;;
                esac
                ok "Paquets système installés"
            else
                fail "Paquets requis non installés: ${missing_pkgs[*]}"
                errors=$((errors + 1))
            fi
        else
            fail "Impossible de détecter le gestionnaire de paquets"
            fail "Installez manuellement: ${missing_pkgs[*]}"
            errors=$((errors + 1))
        fi
    fi

    # Espace disque (5 GB minimum)
    local available_gb=$(df -BG "$SCRIPT_DIR" 2>/dev/null | tail -1 | awk '{gsub("G",""); print $4}')
    if [[ -n "$available_gb" ]] && [[ "$available_gb" -ge 5 ]]; then
        ok "Espace disque: ${available_gb} GB disponibles"
    else
        warn "Espace disque faible: ${available_gb:-?} GB (recommandé: 5+ GB)"
    fi

    if [[ $errors -gt 0 ]]; then
        echo ""
        fail "Prérequis manquants ($errors erreurs). Installez les dépendances ci-dessus."
        exit 1
    fi
}

# =============================================================================
# 3. INSTALLATION CONDA
# =============================================================================
install_conda() {
    step 2 "Vérification de Conda/Mamba"

    # Chercher conda (y compris dans les emplacements courants)
    if ! command -v conda &>/dev/null; then
        for conda_path in "$HOME/miniconda3" "$HOME/anaconda3" "/opt/conda"; do
            if [[ -f "$conda_path/etc/profile.d/conda.sh" ]]; then
                source "$conda_path/etc/profile.d/conda.sh"
                break
            fi
        done
    fi

    if command -v conda &>/dev/null; then
        ok "Conda trouvé: $(conda --version 2>&1)"
        CONDA_CMD="conda"

        # Vérifier mamba (plus rapide)
        if command -v mamba &>/dev/null; then
            ok "Mamba trouvé (sera utilisé pour la création d'environnements)"
            CONDA_CMD="mamba"
        fi
        return 0
    fi

    # Conda non trouvé - proposer l'installation
    warn "Conda non trouvé"
    echo ""
    read -p "  Installer Miniconda automatiquement ? (o/n) [o]: " install_conda_answer
    install_conda_answer=${install_conda_answer:-o}

    if [[ ! "$install_conda_answer" =~ ^[oOyY]$ ]]; then
        fail "Conda est requis. Installez-le manuellement depuis https://docs.conda.io/"
        exit 1
    fi

    info "Téléchargement de Miniconda..."
    local MINICONDA_URL=""
    local ARCH=$(uname -m)
    local OS=$(uname -s)

    if [[ "$OS" == "Linux" ]]; then
        MINICONDA_URL="https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-${ARCH}.sh"
    elif [[ "$OS" == "Darwin" ]]; then
        MINICONDA_URL="https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-${ARCH}.sh"
    else
        fail "OS non supporté: $OS"
        exit 1
    fi

    local INSTALLER="/tmp/miniconda_installer.sh"
    wget -q --show-progress -O "$INSTALLER" "$MINICONDA_URL" 2>&1 || \
        curl -fsSL -o "$INSTALLER" "$MINICONDA_URL"

    info "Installation de Miniconda dans ~/miniconda3..."
    bash "$INSTALLER" -b -p "$HOME/miniconda3"
    rm -f "$INSTALLER"

    # Initialiser conda dans le shell courant (pour que le reste du script fonctionne)
    eval "$("$HOME/miniconda3/bin/conda" shell.bash hook)"
    source "$HOME/miniconda3/etc/profile.d/conda.sh"

    # Configurer les canaux bioconda par défaut
    conda config --add channels defaults 2>/dev/null || true
    conda config --add channels bioconda 2>/dev/null || true
    conda config --add channels conda-forge 2>/dev/null || true

    # Initialiser conda pour le shell de l'utilisateur (pour les sessions futures)
    "$HOME/miniconda3/bin/conda" init bash 2>/dev/null || true

    CONDA_CMD="conda"
    ok "Miniconda installé avec succès"
    ok "Conda sera disponible automatiquement dans les futurs terminaux"
}

# =============================================================================
# 4. CRÉATION DES RÉPERTOIRES
# =============================================================================
create_directories() {
    step 3 "Création des répertoires"

    local dirs=(
        "$PIPELINE_DIR/data"
        "$PIPELINE_DIR/outputs"
        "$PIPELINE_DIR/databases"
        "$PIPELINE_DIR/references"
        "$PIPELINE_DIR/archives"
    )

    for dir in "${dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            ok "$(basename "$dir")/ existe déjà"
        else
            mkdir -p "$dir"
            ok "$(basename "$dir")/ créé"
        fi
    done
}

# =============================================================================
# 5. CRÉATION DES ENVIRONNEMENTS CONDA
# =============================================================================
create_conda_envs() {
    step 4 "Création des environnements Conda"

    # Initialiser conda si nécessaire
    if [[ -f "$HOME/miniconda3/etc/profile.d/conda.sh" ]]; then
        source "$HOME/miniconda3/etc/profile.d/conda.sh"
    elif [[ -f "$HOME/anaconda3/etc/profile.d/conda.sh" ]]; then
        source "$HOME/anaconda3/etc/profile.d/conda.sh"
    fi

    local envs=(
        "qc_arg:fastqc=0.12.1 fastp multiqc=1.19 sra-tools>=3.0"
        "assembly_arg:spades=3.15.5 quast=5.2.0 seqkit=2.5.1"
        "variant_arg:snippy=4.6.0 samtools=1.18 bcftools=1.18"
        "annotation_arg:prokka=1.14.6"
        "arg_detection:ncbi-amrfinderplus kma blast"
        "abricate_env:abricate"
        "mlst_env:mlst=2.23.0"
        "analysis_arg:python=3.11 pandas matplotlib seaborn openpyxl biopython"
    )

    local total=${#envs[@]}
    local current=0

    for env_spec in "${envs[@]}"; do
        current=$((current + 1))
        local env_name="${env_spec%%:*}"
        local packages="${env_spec#*:}"

        echo -e "\n  ${BLUE}[$current/$total]${NC} Environnement: ${BOLD}$env_name${NC}"

        # Vérifier si l'env existe déjà
        if conda env list 2>/dev/null | grep -q "^${env_name} "; then
            ok "$env_name existe déjà"
            continue
        fi

        info "Création de $env_name ($packages)..."
        set +e
        $CONDA_CMD create -n "$env_name" --override-channels -c conda-forge -c bioconda $packages -y 2>&1 | tail -5
        local conda_exit=${PIPESTATUS[0]}
        set -e
        if [[ $conda_exit -eq 0 ]]; then
            ok "$env_name créé avec succès"
        else
            warn "Échec de la création de $env_name (exit code: $conda_exit)"
            warn "Essayez manuellement: conda create -n $env_name --override-channels -c conda-forge -c bioconda $packages -y"
        fi
    done
}

# =============================================================================
# 6. TÉLÉCHARGEMENT DES BASES DE DONNÉES
# =============================================================================
setup_databases() {
    if [[ "$SKIP_DATABASES" == true ]]; then
        step 5 "Bases de données (ignoré: --skip-databases)"
        warn "Les bases de données devront être installées manuellement avant utilisation"
        return 0
    fi

    step 5 "Téléchargement des bases de données"

    local DB_DIR="$PIPELINE_DIR/databases"

    # AMRFinder
    echo -e "\n  ${BLUE}[1/4]${NC} ${BOLD}AMRFinderPlus${NC}"
    if [[ -f "$DB_DIR/amrfinder_db/latest/AMRProt" ]] || [[ -f "$DB_DIR/amrfinder_db/latest/AMR.LIB" ]]; then
        ok "Base AMRFinder déjà installée"
    else
        info "Téléchargement de la base AMRFinder (~200 MB)..."
        mkdir -p "$DB_DIR/amrfinder_db"
        set +e
        conda run -n arg_detection amrfinder_update --force_update --database "$DB_DIR/amrfinder_db" 2>&1 | tail -5
        local amrfinder_exit=${PIPESTATUS[0]}
        set -e
        if [[ $amrfinder_exit -eq 0 ]]; then
            ok "Base AMRFinder installée"
        else
            warn "Échec du téléchargement AMRFinder"
            warn "Essayez: conda activate arg_detection && amrfinder_update --force_update"
        fi
    fi

    # CARD
    echo -e "\n  ${BLUE}[2/4]${NC} ${BOLD}CARD${NC}"
    if [[ -f "$DB_DIR/card_db/card.json" ]]; then
        ok "Base CARD déjà installée"
    else
        info "Téléchargement de la base CARD (~1 GB)..."
        mkdir -p "$DB_DIR/card_db"
        if wget -q --show-progress -O "$DB_DIR/card_db/card.tar.bz2" "https://card.mcmaster.ca/latest/data" 2>&1; then
            tar -xjf "$DB_DIR/card_db/card.tar.bz2" -C "$DB_DIR/card_db" 2>/dev/null
            rm -f "$DB_DIR/card_db/card.tar.bz2"
            ok "Base CARD installée"
        else
            warn "Échec du téléchargement CARD"
        fi
    fi

    # PointFinder
    echo -e "\n  ${BLUE}[3/4]${NC} ${BOLD}PointFinder${NC}"
    if [[ -d "$DB_DIR/pointfinder_db/.git" ]]; then
        ok "Base PointFinder déjà installée"
    else
        info "Clonage de la base PointFinder (~3 MB)..."
        set +e
        git clone https://bitbucket.org/genomicepidemiology/pointfinder_db.git "$DB_DIR/pointfinder_db" 2>&1 | tail -5
        local pointfinder_exit=${PIPESTATUS[0]}
        set -e
        if [[ $pointfinder_exit -eq 0 ]]; then
            ok "Base PointFinder installée"
        else
            warn "Échec du clonage PointFinder"
        fi
    fi

    # MLST
    echo -e "\n  ${BLUE}[4/4]${NC} ${BOLD}MLST${NC}"
    if [[ -d "$DB_DIR/mlst_db/pubmlst" ]]; then
        ok "Base MLST déjà installée"
    else
        info "Configuration de la base MLST..."
        mkdir -p "$DB_DIR/mlst_db"
        set +e
        conda run -n mlst_env mlst --update 2>&1 | tail -5
        local mlst_exit=${PIPESTATUS[0]}
        set -e
        if [[ $mlst_exit -eq 0 ]]; then
            ok "Base MLST installée"
        else
            warn "La base MLST sera configurée au premier lancement"
        fi
    fi
}

# =============================================================================
# 7. INSTALLATION DU BACKEND
# =============================================================================
setup_backend() {
    if [[ "$SKIP_BACKEND" == true ]]; then
        step 6 "Backend Python (ignoré: --skip-backend)"
        return 0
    fi

    step 6 "Installation du backend Python"

    if [[ ! -d "$BACKEND_DIR" ]]; then
        warn "Répertoire backend non trouvé: $BACKEND_DIR"
        return 1
    fi

    # Créer le venv Python
    if [[ -d "$BACKEND_DIR/venv" ]] && [[ -f "$BACKEND_DIR/venv/bin/python" ]]; then
        ok "Environnement virtuel existe déjà"
    else
        # Supprimer un venv cassé s'il existe
        [[ -d "$BACKEND_DIR/venv" ]] && rm -rf "$BACKEND_DIR/venv"
        info "Création de l'environnement virtuel Python..."
        if ! python3 -m venv "$BACKEND_DIR/venv"; then
            fail "Impossible de créer le venv Python"
            fail "Installez python3-venv : sudo apt install python3-venv"
            return 1
        fi
        ok "Environnement virtuel créé"
    fi

    # Vérifier que pip existe dans le venv
    if [[ ! -f "$BACKEND_DIR/venv/bin/pip" ]]; then
        fail "pip non trouvé dans le venv (python3-venv probablement incomplet)"
        fail "Installez python3-venv : sudo apt install python3-venv"
        fail "Puis supprimez backend/venv et relancez ./setup.sh"
        return 1
    fi

    # Installer les dépendances
    info "Installation des dépendances Python..."
    "$BACKEND_DIR/venv/bin/pip" install --upgrade pip -q 2>&1
    if [[ -f "$BACKEND_DIR/requirements.txt" ]]; then
        "$BACKEND_DIR/venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt" -q 2>&1
        ok "Dépendances Python installées"
    else
        warn "requirements.txt non trouvé"
    fi
}

# =============================================================================
# 8. VALIDATION DE L'INSTALLATION
# =============================================================================
validate_install() {
    step 7 "Validation de l'installation"

    local errors=0
    local warnings=0

    # Initialiser conda
    if [[ -f "$HOME/miniconda3/etc/profile.d/conda.sh" ]]; then
        source "$HOME/miniconda3/etc/profile.d/conda.sh"
    elif [[ -f "$HOME/anaconda3/etc/profile.d/conda.sh" ]]; then
        source "$HOME/anaconda3/etc/profile.d/conda.sh"
    fi

    # Vérifier les environnements conda
    local envs=("qc_arg" "assembly_arg" "variant_arg" "annotation_arg" "arg_detection" "abricate_env" "mlst_env" "analysis_arg")
    for env in "${envs[@]}"; do
        if conda env list 2>/dev/null | grep -q "^${env} "; then
            ok "Environnement $env"
        else
            warn "Environnement $env manquant"
            warnings=$((warnings + 1))
        fi
    done

    # Vérifier les répertoires
    local dirs=("data" "outputs" "databases" "references")
    for dir in "${dirs[@]}"; do
        if [[ -d "$PIPELINE_DIR/$dir" ]]; then
            ok "Répertoire pipeline/$dir/"
        else
            warn "Répertoire pipeline/$dir/ manquant"
            warnings=$((warnings + 1))
        fi
    done

    # Vérifier le backend
    if [[ "$SKIP_BACKEND" != true ]]; then
        if [[ -f "$BACKEND_DIR/venv/bin/python" ]]; then
            ok "Backend Python venv"
        else
            warn "Backend venv manquant"
            warnings=$((warnings + 1))
        fi
    fi

    # Vérifier les bases de données
    if [[ "$SKIP_DATABASES" != true ]]; then
        if [[ -f "$PIPELINE_DIR/databases/amrfinder_db/latest/AMRProt" ]] || [[ -f "$PIPELINE_DIR/databases/amrfinder_db/latest/AMR.LIB" ]]; then
            ok "Base AMRFinder"
        else
            warn "Base AMRFinder manquante"
            warnings=$((warnings + 1))
        fi

        if [[ -f "$PIPELINE_DIR/databases/card_db/card.json" ]]; then
            ok "Base CARD"
        else
            warn "Base CARD manquante"
            warnings=$((warnings + 1))
        fi
    fi

    echo ""
    if [[ $warnings -eq 0 ]]; then
        ok "Toutes les vérifications sont passées"
    else
        warn "$warnings avertissement(s) - certains composants pourront être installés au premier lancement"
    fi
}

# =============================================================================
# 9. MESSAGE DE SUCCÈS
# =============================================================================
print_success() {
    step 8 "Installation terminée"

    echo ""
    echo -e "${GREEN}${BOLD}  ╔═══════════════════════════════════════════════════════════╗"
    echo "  ║         Installation terminée avec succès !               ║"
    echo -e "  ╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${BOLD}Pour démarrer le backend :${NC}"
    echo -e "    cd backend"
    echo -e "    source venv/bin/activate"
    echo -e "    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    echo ""
    echo -e "  ${BOLD}Pour démarrer le frontend :${NC}"
    echo -e "    cd frontend"
    echo -e "    python3 -m http.server 8080"
    echo ""
    echo -e "  ${BOLD}Pour lancer une analyse :${NC}"
    echo -e "    bash pipeline/MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2.sh SRR28083254"
    echo ""
    echo -e "  ${BOLD}Interface web :${NC}"
    echo -e "    Frontend : ${CYAN}http://localhost:8080${NC}"
    echo -e "    API docs : ${CYAN}http://localhost:8000/docs${NC}"
    echo ""
}

# =============================================================================
# EXÉCUTION
# =============================================================================
print_banner
check_system
install_conda
create_directories
create_conda_envs
setup_databases
setup_backend
validate_install
print_success
