#!/bin/bash
# =============================================================================
# MEGAM ARG Detection - Script de déploiement Docker
# =============================================================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Répertoire du script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "=============================================="
echo "  MEGAM ARG Detection - Déploiement Docker"
echo "=============================================="
echo ""

# Vérification de Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé. Veuillez l'installer d'abord."
    echo "  → https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "Docker Compose n'est pas installé."
    exit 1
fi

log_success "Docker détecté"

# Vérification des répertoires nécessaires
log_info "Création des répertoires de données..."
mkdir -p "$PROJECT_DIR/data"
mkdir -p "$PROJECT_DIR/pipeline/databases"
mkdir -p "$PROJECT_DIR/pipeline/data"
mkdir -p "$PROJECT_DIR/pipeline/outputs"
mkdir -p "$PROJECT_DIR/pipeline/references"
mkdir -p "$PROJECT_DIR/pipeline/ml_datasets"

log_success "Répertoires créés"

# Création du fichier .env si nécessaire
if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
    if [ -f "$PROJECT_DIR/backend/.env.example" ]; then
        cp "$PROJECT_DIR/backend/.env.example" "$PROJECT_DIR/backend/.env"
        log_success "Fichier .env créé depuis .env.example"
    fi
fi

# Création de la base de données vide si nécessaire
if [ ! -f "$PROJECT_DIR/data/jobs.db" ]; then
    touch "$PROJECT_DIR/data/jobs.db"
    log_success "Base de données jobs.db initialisée"
fi

# Menu d'options
echo ""
echo "Que souhaitez-vous faire ?"
echo "  1) Construire et démarrer les services"
echo "  2) Démarrer les services (sans rebuild)"
echo "  3) Arrêter les services"
echo "  4) Voir les logs"
echo "  5) Reconstruire complètement (supprime le cache)"
echo "  6) Vérifier le statut"
echo ""
read -p "Votre choix [1]: " choice
choice=${choice:-1}

# Détection de docker compose vs docker-compose
DOCKER_COMPOSE="docker compose"
if ! docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
fi

case $choice in
    1)
        log_info "Construction et démarrage des services..."
        $DOCKER_COMPOSE up --build -d
        log_success "Services démarrés !"
        echo ""
        echo "  → Frontend: http://localhost:8080"
        echo "  → API Backend: http://localhost:8000"
        echo "  → Documentation API: http://localhost:8000/docs"
        ;;
    2)
        log_info "Démarrage des services..."
        $DOCKER_COMPOSE up -d
        log_success "Services démarrés !"
        ;;
    3)
        log_info "Arrêt des services..."
        $DOCKER_COMPOSE down
        log_success "Services arrêtés"
        ;;
    4)
        log_info "Affichage des logs (Ctrl+C pour quitter)..."
        $DOCKER_COMPOSE logs -f
        ;;
    5)
        log_warning "Reconstruction complète (cela peut prendre du temps)..."
        $DOCKER_COMPOSE down
        $DOCKER_COMPOSE build --no-cache
        $DOCKER_COMPOSE up -d
        log_success "Services reconstruits et démarrés !"
        ;;
    6)
        log_info "Statut des services:"
        $DOCKER_COMPOSE ps
        ;;
    *)
        log_error "Choix invalide"
        exit 1
        ;;
esac

echo ""
log_success "Terminé !"
