# Versions du Pipeline ARG

**Date:** 2026-01-31

## 📁 Fichiers

### 1. Version Originale (PROTÉGÉE)

**Fichier:** `MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2_ORIGINAL_BACKUP.zip`
- **Status:** Archive chiffrée ✅
- **Mot de passe:** `pipelineoriginal`
- **Utilisation:** Pipeline manuel complet avec interfaces interactives

**Déchiffrer l'archive:**
```bash
unzip -P "pipelineoriginal" MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2_ORIGINAL_BACKUP.zip
```

**Contenu original:**
- ✓ Menus interactifs pour confirmation
- ✓ Affichage automatique FastQC (`xdg-open`)
- ✓ Affichage automatique MultiQC (`xdg-open`)
- ✓ Confirmations manuelles pour résultats antérieurs
- ✓ Mode interactif par défaut

---

### 2. Version Web (MODIFIÉE)

**Fichier:** `MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2_WEB.sh`
- **Status:** Actif pour l'interface web 🌐
- **Backend:** Utilisé par `/backend/main.py`

**Modifications apportées:**

#### A. `xdg-open` désactivé
```bash
# Ligne 567 (et similaires)
# AVANT:
xdg-open "$file_path" 2>/dev/null

# APRÈS:
# xdg-open (disabled for web) "$file_path" 2>/dev/null
```

**Raison:** Éviter l'ouverture de navigateur qui bloque le pipeline

#### B. FORCE_MODE activé par défaut
```bash
# Ligne 142
# AVANT:
FORCE_MODE=false

# APRÈS:
FORCE_MODE=true  # Default true for web interface
```

**Raison:** Mode non-interactif pour exécution automatique via API

**Comportements avec FORCE_MODE=true:**
- ✅ Pas de prompts interactifs pour résultats antérieurs
- ✅ Création automatique de nouvelle version
- ✅ Téléchargement auto des bases de données manquantes
- ✅ Pas d'ouverture de rapports HTML

---

### 3. Version Originale (NON MODIFIÉE)

**Fichier:** `MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2.sh`
- **Status:** Conservé mais non utilisé ⚠️
- **Note:** Toujours présent mais peut contenir des blocages

⚠️ **Important:** Ne PAS utiliser cette version pour l'interface web sans modifications

---

## 🔄 Restaurer l'Original

Si besoin de revenir à la version originale complète:

```bash
cd ~/ncbi/public/pipelines/web_interface_arg/pipeline

# 1. Extraire l'archive
unzip -P "pipelineoriginal" MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2_ORIGINAL_BACKUP.zip

# 2. La version extraite écrasera MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2.sh

# 3. Si besoin pour l'interface web, refaire les modifications:
#    - Commenter xdg-open
#    - FORCE_MODE=true par défaut
```

---

## 📊 Comparaison des Versions

| Fonctionnalité | Original (Backup) | Web (WEB.sh) |
|----------------|-------------------|--------------|
| Menus interactifs | ✅ Activés | ❌ Désactivés (force) |
| xdg-open rapports | ✅ Activé | ❌ Commenté |
| Confirmations manuelles | ✅ Requises | ❌ Auto (force) |
| Mode par défaut | Interactif | Non-interactif |
| Usage | Terminal manuel | API backend |
| Bases de données | Menu installation | Auto-download |

---

## 🚨 Points d'Attention

### Problèmes Résolus (version WEB)

1. **Blocage menu résultats antérieurs**
   - Symptôme: Pipeline bloqué sur "Choisissez une option (1-5)"
   - Fix: FORCE_MODE=true → Sélection auto option 1

2. **Blocage xdg-open**
   - Symptôme: Pipeline attend fermeture navigateur
   - Fix: xdg-open commenté → Logs seulement

3. **Prompts Prokka/bases de données**
   - Symptôme: Attente entrée utilisateur
   - Fix: FORCE_MODE → Choix par défaut

### Limitations Version WEB

- ❌ Pas d'affichage interactif des rapports (QC, MultiQC)
- ❌ Pas de choix manuel de bases de données
- ❌ Toujours création nouvelle version (pas d'archivage interactif)

**Solution:** Rapports accessibles via:
- Dashboard web (interface)
- Fichiers dans `outputs/{sample_id}/`

---

## 🔧 Maintenance

### Mettre à Jour la Version WEB

Si le pipeline original est modifié:

```bash
cd ~/ncbi/public/pipelines/web_interface_arg/pipeline

# 1. Sauvegarder nouvelle version originale
zip -e -P "pipelineoriginal" MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2_ORIGINAL_BACKUP_v3.3.zip MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.3.sh

# 2. Créer nouvelle version WEB
cp MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.3.sh MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.3_WEB.sh

# 3. Appliquer modifications
sed -i 's/^\( *\)xdg-open /\1# xdg-open (disabled for web) /' MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.3_WEB.sh
sed -i 's/^FORCE_MODE=false/FORCE_MODE=true  # Default true for web interface/' MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.3_WEB.sh

# 4. Mettre à jour backend
# Éditer backend/main.py ligne ~39:
# PIPELINE_SCRIPT = PIPELINE_DIR / "MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.3_WEB.sh"
```

---

## 📝 Changelog

**2026-01-31:**
- ✅ Création version WEB sans blocages interactifs
- ✅ Archive chiffrée de l'original
- ✅ Backend configuré pour version WEB
- ✅ Tests validés avec GCA_047975945.1

---

**Contact:** Voir CLAUDE.md pour plus d'informations sur le projet
