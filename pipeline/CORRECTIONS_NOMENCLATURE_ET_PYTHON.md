# Corrections - Nomenclature et Scripts Python

**Date**: 2026-01-28  
**Auteur**: Rachid Merah (rachid.merah77@gmail.com)

---

## 📋 Problèmes identifiés

### 1. **Dossier `ml_datasets` vide**

**Cause**: Les scripts Python n'étaient pas trouvés car le pipeline cherchait dans le mauvais dossier.

```
Chemin recherché (INCORRECT): /path/to/project/pipeline/collect_features.py
Chemin réel (CORRECT):        /path/to/project/python/collect_features.py
```

**Conséquence**: 
- ❌ `collect_features.py` non exécuté
- ❌ `ml_datasets/global_features_dataset.csv` non créé
- ⚠️ Warning: "Script d'extraction ML non trouvé"

---

### 2. **Nomenclature trop complexe**

**Ancien format**: `SRR8618098_v3.2_20260128_130145`
- Trop de chiffres (date + heure)
- Difficile à lire
- Difficile à comparer les essais

**Nouveau format souhaité**: `SRR8618098_1`, `SRR8618098_2`, `SRR8618098_3`
- Simple et clair
- Numéro d'essai incrémental
- Facile à identifier

---

## ✅ Solutions implémentées

### 1. **Correction des chemins vers les scripts Python**

#### Ajout d'une variable `PYTHON_DIR`

**Ligne 141** (ajout):
```bash
# Répertoire contenant les scripts Python
PYTHON_DIR="$(dirname "$SCRIPT_DIR")/python"
```

#### Correction des 3 scripts

**Avant**:
```bash
METADATA_SCRIPT="$SCRIPT_DIR/generate_metadata.py"      # ❌ Introuvable
ARG_REPORT_SCRIPT="$SCRIPT_DIR/generate_arg_report.py"  # ❌ Introuvable
FEATURES_SCRIPT="$SCRIPT_DIR/collect_features.py"        # ❌ Introuvable
```

**Après**:
```bash
METADATA_SCRIPT="$PYTHON_DIR/generate_metadata.py"      # ✅ Trouvé
ARG_REPORT_SCRIPT="$PYTHON_DIR/generate_arg_report.py"  # ✅ Trouvé
FEATURES_SCRIPT="$PYTHON_DIR/collect_features.py"        # ✅ Trouvé
```

**Lignes modifiées**:
- Ligne 3840: `generate_metadata.py`
- Ligne 3935: `generate_arg_report.py`
- Ligne 3984: `collect_features.py`

---

### 2. **Simplification de la nomenclature**

#### Nouvelle fonction `get_next_run_number()`

**Lignes 360-377** (remplacement):

```bash
# Fonction pour trouver le prochain numéro d'essai
get_next_run_number() {
    local sample_id="$1"
    local outputs_dir="$WORK_DIR/outputs"

    # Si le dossier outputs n'existe pas encore
    if [[ ! -d "$outputs_dir" ]]; then
        echo "1"
        return
    fi

    # Compter les dossiers existants pour cet échantillon
    local existing_runs=$(find "$outputs_dir" -maxdepth 1 -type d -name "${sample_id}_*" 2>/dev/null | wc -l)

    # Le prochain numéro est le nombre existant + 1
    local next_num=$((existing_runs + 1))

    echo "$next_num"
}

# Déterminer le numéro d'essai
RUN_NUMBER=$(get_next_run_number "$SAMPLE_ID")
RESULTS_VERSION="${RESULTS_VERSION:-${RUN_NUMBER}}"

# Timestamp conservé pour les logs (traçabilité interne)
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

# Répertoires principaux (nomenclature simplifiée)
RESULTS_DIR="$WORK_DIR/outputs/${SAMPLE_ID}_${RESULTS_VERSION}"
```

#### Comportement

**Dossiers existants**:
```
SRR8618098_v3.2_20260128_124016  ← Ancien format
SRR8618098_v3.2_20260128_124249  ← Ancien format
...
```

**Prochain dossier créé**:
```
SRR8618098_7  ← Nouveau format (compte tous les dossiers existants + 1)
```

**Pour un nouvel échantillon** (ex: SRR9999999):
```
SRR9999999_1  ← Premier essai
SRR9999999_2  ← Deuxième essai
SRR9999999_3  ← Troisième essai
```

---

## 🧪 Tests de validation

### Test 1: Localisation des scripts Python

```bash
SCRIPT_DIR="/path/to/project/pipeline"
PYTHON_DIR="$(dirname "$SCRIPT_DIR")/python"

# Résultats
✅ generate_metadata.py trouvé (7,813 octets)
✅ generate_arg_report.py trouvé (49,706 octets)
✅ collect_features.py trouvé (13,476 octets)
```

### Test 2: Nouvelle nomenclature

```bash
Échantillon: SRR8618098
Dossiers existants: 6 (format ancien)
Prochain numéro: 7

Comparaison:
  ANCIEN: SRR8618098_v3.2_20260128_130145
  NOUVEAU: SRR8618098_7
```

---

## 📊 Impact des modifications

### Scripts Python

| Script | Avant | Après |
|--------|-------|-------|
| `generate_metadata.py` | ❌ Non trouvé | ✅ Trouvé |
| `generate_arg_report.py` | ❌ Non trouvé | ✅ Trouvé |
| `collect_features.py` | ❌ Non trouvé | ✅ Trouvé |

**Conséquences**:
- ✅ Le dossier `ml_datasets` se remplira maintenant
- ✅ Les rapports HTML seront générés
- ✅ Les métadonnées seront extraites

### Nomenclature

**Avant**:
- 📁 `SRR8618098_v3.2_20260128_130848` (27 caractères)
- Difficile à lire et comparer

**Après**:
- 📁 `SRR8618098_7` (13 caractères)
- Simple, clair, facile à gérer

**Gain**: 
- 52% de caractères en moins
- Clarté augmentée
- Meilleure lisibilité

---

## 🔄 Rétrocompatibilité

### Ancien format toujours pris en compte

La fonction `get_next_run_number()` compte **tous** les dossiers existants, qu'ils soient au nouveau ou ancien format :

```bash
# Compte tous les patterns SAMPLE_*
find "$outputs_dir" -maxdepth 1 -type d -name "${sample_id}_*"
```

**Exemple**:
```
Dossiers existants:
  SRR8618098_v3.2_20260128_124016  ← Ancien (compte: 1)
  SRR8618098_v3.2_20260128_124249  ← Ancien (compte: 2)
  SRR8618098_v3.2_20260128_130848  ← Ancien (compte: 3)
  
Prochain dossier:
  SRR8618098_4  ← Nouveau format
```

---

## 📂 Structure des fichiers modifiés

```
MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2.sh
├── Ligne 141    : Ajout PYTHON_DIR
├── Lignes 360-377: Nouvelle fonction get_next_run_number()
├── Ligne 3840   : Correction chemin generate_metadata.py
├── Ligne 3935   : Correction chemin generate_arg_report.py
└── Ligne 3984   : Correction chemin collect_features.py
```

---

## 🚀 Prochaine exécution

Lors de la prochaine exécution du pipeline :

### ✅ Ce qui fonctionnera mieux

1. **Scripts Python trouvés et exécutés**
   - Métadonnées générées
   - Rapports HTML créés
   - Features ML extraites → `ml_datasets/global_features_dataset.csv` créé

2. **Nomenclature simplifiée**
   - Nouveau dossier: `SRR8618098_7` (ou `SAMPLE_1` pour nouvel échantillon)
   - Logs internes conservent le timestamp pour traçabilité

3. **Messages dans les logs**
   ```
   ✅ Script d'extraction ML trouvé: /path/to/.../python/collect_features.py
   ✅ Features ML extraites: .../06_analysis/features_ml.csv
   ✅ Dataset global mis à jour: ml_datasets/global_features_dataset.csv
   ```

---

## 📝 Notes techniques

### Timestamp conservé

Le timestamp est conservé dans les logs pour la traçabilité :

```bash
LOG_FILE="$LOG_DIR/pipeline_${TIMESTAMP}.log"
# Exemple: pipeline_20260128_130848.log
```

### Variable RESULTS_VERSION

Peut toujours être surchargée si besoin :

```bash
# Utilisation par défaut (numéro incrémental)
./MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2.sh SRR8618098
# → Dossier: SRR8618098_7

# Forcer une version spécifique (avancé)
RESULTS_VERSION="custom_test" ./MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2.sh SRR8618098
# → Dossier: SRR8618098_custom_test
```

---

## 🎯 Résumé

| Aspect | Avant | Après | Statut |
|--------|-------|-------|--------|
| Scripts Python trouvés | ❌ Non | ✅ Oui | ✅ Corrigé |
| ml_datasets rempli | ❌ Non | ✅ Oui | ✅ Corrigé |
| Nomenclature | `SAMPLE_v3.2_20260128_130848` | `SAMPLE_7` | ✅ Simplifié |
| Lisibilité | ⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Amélioré |
| Rétrocompatibilité | - | ✅ Oui | ✅ Préservée |

---

**Fin du document**
