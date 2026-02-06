# Correction - Erreur abricate non accessible

**Date**: 2026-01-28  
**Auteur**: Rachid Merah (rachid.merah77@gmail.com)

---

## 🐛 Problème rencontré

Lors du lancement du pipeline avec un nouvel échantillon, l'erreur suivante se produisait :

```
Installation des bases abricate (ResFinder, PlasmidFinder, etc.)...

Installation des bases de données abricate...

❌ abricate n'est pas installé ou accessible
   Veuillez installer abricate d'abord:
   conda install -c bioconda abricate
```

**Cause**: Les fonctions `find_abricate_dbs()` et `setup_abricate_dbs()` vérifiaient si abricate était accessible **AVANT** d'activer un environnement conda.

Comme abricate est installé dans les environnements conda (et non globalement), la vérification échouait.

---

## ✅ Solution implémentée

### 1. Correction de `find_abricate_dbs()`

**Problème**: La fonction vérifie `command -v abricate` avant d'activer conda.

**Avant** (lignes 1553-1582):
```bash
find_abricate_dbs() {
    # Vérifier si abricate est installé ❌ AVANT d'activer conda
    if ! command -v abricate &> /dev/null; then
        echo ""
        return
    fi
    # ...
}
```

**Après** (lignes 1553-1604):
```bash
find_abricate_dbs() {
    local abricate_found=false
    local abricate_env=""

    # ✅ D'ABORD activer conda, PUIS vérifier
    for env in arg_detection megam_arg annotation_arg; do
        if conda activate $env 2>/dev/null; then
            if command -v abricate &> /dev/null; then
                abricate_found=true
                abricate_env=$env
                break
            fi
            conda deactivate 2>/dev/null || true
        fi
    done

    # Fallback: vérifier dans l'environnement actuel
    if [[ "$abricate_found" == false ]]; then
        if command -v abricate &> /dev/null; then
            abricate_found=true
        else
            echo ""
            return
        fi
    fi
    # ... suite de la fonction
}
```

---

### 2. Correction de `setup_abricate_dbs()`

**Problème**: Même erreur - vérifie abricate avant d'activer conda.

**Avant** (lignes 1585-1615):
```bash
setup_abricate_dbs() {
    # Vérifier si abricate est installé ❌ AVANT d'activer conda
    if ! command -v abricate &> /dev/null; then
        echo "❌ abricate n'est pas installé"
        return 1
    fi

    # Activer l'environnement... (trop tard)
    for env in arg_detection megam_arg annotation_arg; do
        # ...
    done
}
```

**Après** (lignes 1606-1650):
```bash
setup_abricate_dbs() {
    local abricate_env=""
    local abricate_found=false

    # ✅ D'ABORD activer conda, PUIS vérifier
    echo "  Recherche d'abricate dans les environnements conda..."
    for env in arg_detection megam_arg annotation_arg; do
        if conda activate $env 2>/dev/null; then
            if command -v abricate &> /dev/null; then
                abricate_env=$env
                abricate_found=true
                echo "  ✅ Environnement abricate trouvé: $env"
                break
            fi
            conda deactivate 2>/dev/null || true
        fi
    done

    # Fallback: vérifier dans l'environnement actuel
    if [[ "$abricate_found" == false ]]; then
        if command -v abricate &> /dev/null; then
            echo "  ✅ abricate trouvé dans l'environnement actuel"
            abricate_found=true
        fi
    fi

    # Si toujours pas trouvé, afficher un message détaillé
    if [[ "$abricate_found" == false ]]; then
        echo ""
        echo "❌ abricate n'est pas installé ou accessible"
        echo "   abricate n'a pas été trouvé dans les environnements conda suivants:"
        echo "   - arg_detection"
        echo "   - megam_arg"
        echo "   - annotation_arg"
        echo ""
        echo "   Solutions possibles:"
        echo "   1) Installer abricate dans un environnement existant:"
        echo "      conda activate arg_detection"
        echo "      conda install -c bioconda abricate"
        echo ""
        echo "   2) Créer un nouvel environnement avec abricate:"
        echo "      conda create -n abricate_env -c bioconda abricate"
        echo ""
        return 1
    fi
    # ... suite de la fonction
}
```

---

## 🧪 Test de validation

### Commande de test
```bash
echo "1" | ./MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2.sh SRR9999999
```

### Résultat AVANT la correction
```
❌ abricate n'est pas installé ou accessible
```

### Résultat APRÈS la correction
```
✅ Base Kraken2 trouvée: /path/to/databases/kraken2_db
⚠️  Base AMRFinder NON TROUVÉE
⚠️  Base CARD (RGI) NON TROUVÉE
✅ Base PointFinder trouvée: /path/to/project/pipeline/databases/pointfinder_db
✅ Base MLST trouvée: /path/to/project/pipeline/databases/mlst_db
✅ Bases Abricate trouvées (ResFinder, PlasmidFinder, CARD, NCBI, VFDB)  ← ✅ FONCTIONNE
```

---

## 📊 Comparaison avant/après

| Aspect | Avant | Après | Statut |
|--------|-------|-------|--------|
| Ordre de vérification | ❌ Vérifier → Activer conda | ✅ Activer conda → Vérifier | ✅ Corrigé |
| Détection abricate | ❌ Échoue | ✅ Réussit | ✅ Corrigé |
| Message d'erreur | ❌ Générique | ✅ Détaillé avec solutions | ✅ Amélioré |
| Environnements testés | - | `arg_detection`, `megam_arg`, `annotation_arg` | ✅ Exhaustif |

---

## 🎯 Leçon apprise

**Règle importante pour les outils conda**:

> Toujours activer l'environnement conda AVANT de vérifier si un outil existe.

**Pattern correct**:
```bash
# ✅ BON
for env in env1 env2 env3; do
    if conda activate $env 2>/dev/null; then
        if command -v tool &> /dev/null; then
            # Outil trouvé dans $env
            break
        fi
        conda deactivate 2>/dev/null || true
    fi
done

# ❌ MAUVAIS
if ! command -v tool &> /dev/null; then
    # Erreur: l'outil peut être dans conda mais pas encore activé
    return 1
fi
for env in env1 env2 env3; do
    conda activate $env
    # Trop tard...
done
```

---

## 📂 Fichiers modifiés

```
MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2.sh
├── Lignes 1553-1604: find_abricate_dbs() corrigée
│   └── Active conda AVANT de vérifier abricate
└── Lignes 1606-1650: setup_abricate_dbs() corrigée
    └── Active conda AVANT de vérifier abricate
```

---

## ✅ Validation finale

Le pipeline démarre maintenant correctement avec un nouvel échantillon :

```bash
./MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2.sh SRR9999999

✅ Nomenclature simplifiée: SRR9999999_1
✅ Bases abricate détectées automatiquement
✅ Aucune erreur "abricate non accessible"
✅ Installation des bases manquantes proposée
```

---

**Fin du document**
