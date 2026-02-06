#!/bin/bash
# =============================================================================
# MEGAM ARG Detection - Création d'archive portable
# =============================================================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# Répertoire du projet
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_NAME="megam_arg_detection"
DATE=$(date +%Y%m%d_%H%M%S)

cd "$PROJECT_DIR"

echo "=============================================="
echo "  MEGAM ARG Detection - Création d'archive"
echo "=============================================="
echo ""

# Menu de choix du type d'archive
echo "Type d'archive à créer :"
echo "  1) Minimal (~500 MB) - Code source seulement (bases à télécharger)"
echo "  2) Standard (~9 GB)  - Code + bases de données ARG"
echo "  3) Complet (~15 GB)  - Code + bases + données de test"
echo "  4) Full (~24 GB)     - Tout inclus avec résultats antérieurs"
echo ""
read -p "Votre choix [2]: " archive_type
archive_type=${archive_type:-2}

# Fichier d'exclusion temporaire
EXCLUDE_FILE=$(mktemp)

# Exclusions de base (toujours)
cat > "$EXCLUDE_FILE" << 'EOF'
backend/venv
*/__pycache__
*.pyc
*.pyo
.git
.vscode
.idea
*.swp
*.swo
*~
.DS_Store
Thumbs.db
*.log
*.tmp
.claude
backend/jobs.db
EOF

case $archive_type in
    1)
        ARCHIVE_NAME="${PROJECT_NAME}_minimal_${DATE}.tar.gz"
        log_info "Création archive MINIMALE..."
        # Exclure toutes les données volumineuses
        cat >> "$EXCLUDE_FILE" << 'EOF'
pipeline/databases
pipeline/data
pipeline/outputs
pipeline/references
pipeline/ml_datasets
pipeline/archives
EOF
        ;;
    2)
        ARCHIVE_NAME="${PROJECT_NAME}_standard_${DATE}.tar.gz"
        log_info "Création archive STANDARD (avec bases de données)..."
        # Exclure données de test et résultats
        cat >> "$EXCLUDE_FILE" << 'EOF'
pipeline/data/*.fastq
pipeline/data/*.fq
pipeline/data/*.fastq.gz
pipeline/outputs
pipeline/archives
EOF
        ;;
    3)
        ARCHIVE_NAME="${PROJECT_NAME}_complet_${DATE}.tar.gz"
        log_info "Création archive COMPLÈTE (avec données de test)..."
        # Exclure seulement les résultats antérieurs
        cat >> "$EXCLUDE_FILE" << 'EOF'
pipeline/outputs
pipeline/archives
EOF
        ;;
    4)
        ARCHIVE_NAME="${PROJECT_NAME}_full_${DATE}.tar.gz"
        log_info "Création archive FULL (tout inclus)..."
        # Exclure seulement les archives
        cat >> "$EXCLUDE_FILE" << 'EOF'
pipeline/archives
EOF
        ;;
    *)
        log_warning "Choix invalide, utilisation du mode standard"
        ARCHIVE_NAME="${PROJECT_NAME}_standard_${DATE}.tar.gz"
        ;;
esac

# Destination de l'archive
ARCHIVE_PATH="$PROJECT_DIR/../$ARCHIVE_NAME"

log_info "Création de l'archive: $ARCHIVE_NAME"
log_info "Cela peut prendre plusieurs minutes..."

# Création de l'archive
cd "$PROJECT_DIR/.."
tar --exclude-from="$EXCLUDE_FILE" \
    -czvf "$ARCHIVE_NAME" \
    "$(basename "$PROJECT_DIR")" \
    2>&1 | while read line; do
        # Afficher seulement tous les 100 fichiers pour ne pas spammer
        count=$((count + 1))
        if [ $((count % 100)) -eq 0 ]; then
            echo -ne "\r${BLUE}[INFO]${NC} Fichiers archivés: $count"
        fi
    done

echo ""

# Nettoyage
rm -f "$EXCLUDE_FILE"

# Informations sur l'archive
ARCHIVE_SIZE=$(du -h "$ARCHIVE_PATH" | cut -f1)
log_success "Archive créée: $ARCHIVE_PATH"
log_success "Taille: $ARCHIVE_SIZE"

echo ""
echo "=============================================="
echo "  Instructions d'installation"
echo "=============================================="
echo ""
echo "Sur la machine cible:"
echo ""
echo "  1. Extraire l'archive:"
echo "     tar -xzf $ARCHIVE_NAME"
echo ""
echo "  2. Se déplacer dans le répertoire:"
echo "     cd $(basename "$PROJECT_DIR")"
echo ""
echo "  3. Déployer avec Docker:"
echo "     chmod +x scripts/deploy.sh"
echo "     ./scripts/deploy.sh"
echo ""
echo "  4. Accéder à l'interface:"
echo "     → Frontend: http://localhost:8080"
echo "     → API: http://localhost:8000/docs"
echo ""
