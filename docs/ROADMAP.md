# ROADMAP - Plan de développement

> Feuille de route pour implémenter l'interface web ARG

---

## 🎯 Objectifs par phase

### Phase 1 : Backend minimal (MVP)
Créer un backend fonctionnel capable de lancer le pipeline et récupérer les résultats.

### Phase 2 : Frontend connecté
Connecter les maquettes HTML existantes au backend via API REST.

### Phase 3 : Monitoring temps réel
Implémenter WebSocket pour logs et progression en direct.

### Phase 4 : Polish & Production
Optimisations, tests, déploiement.

---

## 📋 Phase 1 : Backend minimal (MVP)

**Durée estimée** : 4-6 heures

### Tâches

#### 1.1 Configuration de base
- [ ] Créer `backend/requirements.txt`
  ```
  fastapi==0.109.0
  uvicorn[standard]==0.27.0
  pandas==2.2.0
  python-multipart==0.0.6
  watchdog==4.0.0
  ```
- [ ] Créer `backend/config.py`
  ```python
  PIPELINE_SCRIPT = Path("../pipeline/MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2.sh")
  WORK_DIR = Path("/path/to/project")
  OUTPUTS_DIR = WORK_DIR / "outputs"
  PORT = 5000
  ```
- [ ] Créer `backend/.gitignore`

#### 1.2 Point d'entrée FastAPI
- [ ] Créer `backend/app.py` avec FastAPI minimal
- [ ] Tester lancement : `python app.py`
- [ ] Vérifier accès : `http://localhost:5000/docs` (Swagger UI)

#### 1.3 Service PipelineRunner
- [ ] Créer `backend/services/pipeline_runner.py`
- [ ] Implémenter méthode `launch()`
  - subprocess.Popen()
  - Génération job_id (UUID)
  - Stockage metadata job
- [ ] Implémenter méthode `get_status()`
- [ ] Implémenter méthode `list_jobs()`
- [ ] Tester avec sample factice : `SRR8618098`

#### 1.4 Service DataParser
- [ ] Créer `backend/services/data_parser.py`
- [ ] Implémenter `parse_metadata()` (METADATA.json)
- [ ] Implémenter `parse_features_ml()` (CSV)
- [ ] Implémenter `parse_amrfinder()` (TSV)
- [ ] Implémenter `parse_abricate()` (TSV)
- [ ] Implémenter `aggregate_arg_results()` (fusion toutes sources)
- [ ] Tester avec résultats existants

#### 1.5 Routes API
- [ ] Créer `backend/routers/pipeline.py`
  - `POST /api/pipeline/launch` → Lance analyse
  - `GET /api/pipeline/status/{job_id}` → Statut
  - `GET /api/pipeline/list` → Liste jobs
  - `POST /api/pipeline/stop/{job_id}` → Arrête job
- [ ] Créer `backend/routers/results.py`
  - `GET /api/results/{sample_id}` → Résultats complets
  - `GET /api/results/{sample_id}/metadata` → Métadonnées
  - `GET /api/results/{sample_id}/features` → Features ML
  - `GET /api/results/{sample_id}/arg` → Gènes ARG
- [ ] Tester toutes les routes avec curl/Postman

#### 1.6 Validation
- [ ] Créer `backend/utils/validators.py`
  - Validation sample_id (regex SRR*, GCA_*, etc.)
  - Validation threads (1-32)
  - Validation prokka_mode (auto/generic/ecoli/custom)
- [ ] Ajouter validation dans routes

### Livrable Phase 1
✅ Backend fonctionnel capable de :
- Lancer une analyse ARG via API
- Récupérer le statut d'une analyse
- Parser et retourner les résultats JSON

---

## 📋 Phase 2 : Frontend connecté

**Durée estimée** : 3-4 heures

### Tâches

#### 2.1 Client API JavaScript
- [ ] Créer `frontend/assets/js/api-client.js`
  - Classe `PipelineAPI` avec méthodes :
    - `launchAnalysis()`
    - `getStatus()`
    - `getResults()`
    - `listAnalyses()`
  - Gestion erreurs (try/catch)
  - Export global `window.PipelineAPI`

#### 2.2 Connexion formulaire lancement
- [ ] Copier `maquettes/form_launch_analysis.html` → `frontend/launch.html`
- [ ] Ajouter import `<script src="assets/js/api-client.js"></script>`
- [ ] Modifier fonction `launchAnalysis()` :
  ```javascript
  async function launchAnalysis() {
      const sampleId = document.getElementById('sample-id').value;
      const prokkaMode = document.getElementById('prokka-mode').value;
      const threads = document.getElementById('threads-slider').value;

      try {
          const result = await PipelineAPI.launchAnalysis(sampleId, prokkaMode, threads);
          alert(`Analyse lancée ! Job ID: ${result.job_id}`);
          window.location.href = `dashboard.html?job_id=${result.job_id}`;
      } catch (error) {
          alert(`Erreur : ${error.message}`);
      }
  }
  ```
- [ ] Tester lancement réel

#### 2.3 Connexion page résultats
- [ ] Copier `maquettes/page_results_arg.html` → `frontend/results.html`
- [ ] Ajouter import API client
- [ ] Remplacer données mock par vraies données :
  ```javascript
  async function loadResults() {
      const urlParams = new URLSearchParams(window.location.search);
      const sampleId = urlParams.get('sample_id');

      const data = await PipelineAPI.getResults(sampleId);

      // Header
      document.getElementById('sample-id').textContent = data.metadata.sample.sample_id;
      document.getElementById('species').textContent = data.metadata.sample.detected_species;

      // Cards
      document.getElementById('total-genes').textContent = data.arg_stats.total_genes;
      document.getElementById('amr-genes').textContent = data.arg_stats.amr_genes;

      // Graphiques
      createCategoryChart(data.arg_stats);
      createDatabaseChart(data.arg_stats);

      // Table
      populateGenesTable(data.arg_stats.genes);
  }

  loadResults();
  ```
- [ ] Créer `frontend/assets/js/chart-builder.js`
  - Fonction `createCategoryChart(data)`
  - Fonction `createDatabaseChart(data)`
  - Fonction `createTimelineChart(data)`
- [ ] Créer `frontend/assets/js/table-builder.js`
  - Fonction `populateGenesTable(genes)`
  - Fonction `applyFilters()`
- [ ] Tester avec résultats existants

#### 2.4 Page d'accueil
- [ ] Créer `frontend/index.html`
  - Menu avec 3 boutons :
    - "🚀 Launch New Analysis" → `launch.html`
    - "📊 View Results" → Formulaire input sample_id → `results.html?sample_id=XXX`
    - "📋 Analysis History" → Liste des analyses récentes
  - Style Academic Authority (Vibe 3)
- [ ] Connexion API pour liste analyses

### Livrable Phase 2
✅ Interface web fonctionnelle permettant de :
- Lancer une analyse via formulaire
- Visualiser les résultats avec graphiques réels
- Naviguer entre les pages

---

## 📋 Phase 3 : Monitoring temps réel

**Durée estimée** : 4-5 heures

### Tâches

#### 3.1 WebSocket Backend
- [ ] Installer `python-socketio` + `aiofiles`
- [ ] Modifier `backend/app.py` pour Socket.IO :
  ```python
  import socketio
  sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
  socket_app = socketio.ASGIApp(sio, app)
  ```
- [ ] Créer `backend/services/log_streamer.py`
  - Classe `LogStreamer` avec watchdog
  - Méthode `on_modified()` pour détecter changements log
  - Méthode `_send_new_logs()` pour émettre via Socket.IO
- [ ] Événements Socket.IO :
  - `connect` → Confirmer connexion
  - `log` → Envoyer ligne de log
  - `progress` → Envoyer progression modules
  - `disconnect` → Cleanup

#### 3.2 WebSocket Frontend
- [ ] Créer `frontend/assets/js/websocket-client.js`
  ```javascript
  class LogsWebSocket {
      constructor(url = 'http://localhost:5000') {
          this.socket = io(url);
      }

      connect() {
          this.socket.on('connect', () => console.log('WebSocket connecté'));
          this.socket.on('log', (data) => this.handleLog(data));
          this.socket.on('progress', (data) => this.handleProgress(data));
      }

      handleLog(data) {
          // Callback défini par utilisateur
      }

      onLog(callback) {
          this.handleLog = callback;
      }

      disconnect() {
          this.socket.disconnect();
      }
  }
  ```

#### 3.3 Dashboard monitoring connecté
- [ ] Copier `maquettes/dashboard_monitoring.html` → `frontend/dashboard.html`
- [ ] Ajouter imports :
  ```html
  <script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>
  <script src="assets/js/api-client.js"></script>
  <script src="assets/js/websocket-client.js"></script>
  ```
- [ ] Connexion WebSocket :
  ```javascript
  const jobId = new URLSearchParams(window.location.search).get('job_id');

  // WebSocket pour logs
  LogsWebSocket.connect();
  LogsWebSocket.onLog((data) => {
      addLogEntry(data.message, data.level);
  });

  // Polling statut (toutes les 2s)
  setInterval(async () => {
      const status = await PipelineAPI.getStatus(jobId);
      updateProgressBar(status.progress);
      updateModuleCards(status.modules);
  }, 2000);
  ```
- [ ] Parser logs pour extraire :
  - Niveau (INFO/WARNING/ERROR)
  - Module (01_qc, 02_assembly, etc.)
  - Message
  - Timestamp
- [ ] Mettre à jour progression :
  - Barre globale
  - Cards modules (pending/in_progress/completed/failed)
  - Durée écoulée
- [ ] Tester avec analyse en cours

#### 3.4 Détection fin d'analyse
- [ ] Ajouter événement Socket.IO `analysis_completed`
- [ ] Frontend : Rediriger vers `results.html` automatiquement
  ```javascript
  LogsWebSocket.socket.on('analysis_completed', (data) => {
      setTimeout(() => {
          window.location.href = `results.html?sample_id=${data.sample_id}`;
      }, 3000);
  });
  ```

### Livrable Phase 3
✅ Dashboard temps réel fonctionnel :
- Logs streamés en direct
- Progression modules mise à jour
- Redirection automatique vers résultats

---

## 📋 Phase 4 : Polish & Production

**Durée estimée** : 3-4 heures

### Tâches

#### 4.1 Gestion d'erreurs robuste
- [ ] Try/catch dans toutes les fonctions async
- [ ] Messages d'erreur utilisateur-friendly
- [ ] Page 404 personnalisée
- [ ] Page 500 personnalisée
- [ ] Toasts/notifications pour feedback utilisateur

#### 4.2 Historique analyses
- [ ] Créer `backend/routers/history.py`
  - `GET /api/history` → Liste analyses (JSON)
  - Tri par date (DESC)
  - Filtres : status, sample_type, date_range
- [ ] Page `frontend/history.html`
  - Table interactive (tri, filtres)
  - Boutons actions : View Results, Relaunch, Delete
- [ ] Stockage persistant :
  - Option 1 : SQLite (`analyses.db`)
  - Option 2 : JSON file (`analyses_history.json`)

#### 4.3 Upload fichiers FASTA
- [ ] Route `POST /api/files/upload`
  - Accepter .fasta, .fa, .fna, .gz
  - Limite 500 MB
  - Stockage dans `data/uploads/`
- [ ] Frontend : Drag & drop fonctionnel
  - Progress bar upload
  - Validation format (magic bytes)

#### 4.4 Export résultats
- [ ] Routes export :
  - `GET /api/results/{sample_id}/export/json` → JSON complet
  - `GET /api/results/{sample_id}/export/csv` → Table gènes CSV
  - `GET /api/results/{sample_id}/export/pdf` → Rapport PDF (weasyprint)
- [ ] Boutons dans `results.html`

#### 4.5 Tests
- [ ] Tests unitaires backend (pytest)
  - `tests/test_pipeline_runner.py`
  - `tests/test_data_parser.py`
  - `tests/test_validators.py`
- [ ] Tests E2E (Playwright ou Selenium)
  - Lancement analyse
  - Monitoring
  - Visualisation résultats
- [ ] CI/CD (GitHub Actions)

#### 4.6 Documentation
- [ ] README backend (installation, config, lancement)
- [ ] API documentation (Swagger enrichie)
- [ ] Guide utilisateur (captures d'écran)
- [ ] FAQ troubleshooting

#### 4.7 Déploiement
- [ ] Dockerfile backend
- [ ] docker-compose.yml (backend + nginx)
- [ ] Configuration production :
  - Gunicorn workers
  - Nginx reverse proxy
  - HTTPS (Let's Encrypt)
- [ ] Variables d'environnement (.env)
- [ ] Logs rotatifs (logrotate)

### Livrable Phase 4
✅ Application production-ready :
- Robuste, testée, documentée
- Déployable via Docker
- Interface complète et polie

---

## 📊 Récapitulatif par priorité

### 🔴 Priorité HAUTE (MVP fonctionnel)
1. ✅ Backend minimal (Phase 1)
2. ✅ Frontend connecté lancement (Phase 2.1-2.2)
3. ✅ Frontend connecté résultats (Phase 2.3-2.4)

### 🟡 Priorité MOYENNE (UX améliorée)
4. ✅ WebSocket monitoring (Phase 3)
5. ✅ Historique analyses (Phase 4.2)
6. ✅ Gestion erreurs (Phase 4.1)

### 🟢 Priorité BASSE (Production)
7. ✅ Upload FASTA (Phase 4.3)
8. ✅ Export PDF/CSV (Phase 4.4)
9. ✅ Tests automatisés (Phase 4.5)
10. ✅ Déploiement Docker (Phase 4.7)

---

## 🛠️ Stack technologique finale

### Backend
- **Framework** : FastAPI 0.109.0
- **WebSocket** : python-socketio 5.11.0
- **Data** : pandas 2.2.0
- **File watching** : watchdog 4.0.0
- **Tests** : pytest 8.0.0
- **Server** : uvicorn + gunicorn

### Frontend
- **CSS** : Tailwind CSS 3.4 (CDN)
- **Charts** : Chart.js 4.4.1
- **WebSocket** : Socket.IO client 4.6.0
- **JavaScript** : Vanilla ES6+
- **Icons** : SVG inline

### Infrastructure
- **Container** : Docker + docker-compose
- **Reverse proxy** : Nginx
- **Database** : SQLite (historique)
- **Logs** : Rotating file handler

---

## 📅 Timeline suggérée

| Semaine | Phase | Tâches | Livrable |
|---------|-------|--------|----------|
| **1** | Phase 1 | Backend MVP | API fonctionnelle |
| **2** | Phase 2 | Frontend connecté | Interface lancement + résultats |
| **3** | Phase 3 | WebSocket + monitoring | Dashboard temps réel |
| **4** | Phase 4 | Polish + tests | Application production-ready |

**Total** : ~4 semaines (temps partiel) ou ~2 semaines (temps plein)

---

## ✅ Checklist de démarrage (prochaine session)

### Pré-requis
- [ ] Vérifier Python 3.11+ installé : `python3 --version`
- [ ] Vérifier pip installé : `pip --version`
- [ ] Vérifier conda disponible : `conda --version`
- [ ] Vérifier pipeline fonctionnel : `./pipeline/MANUAL_MEGA_MONOLITHIC_PIPELINE_v3.2.sh --help`

### Installation backend
```bash
cd web_interface_arg/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Premier test
```bash
# Lancer backend
python app.py

# Dans un autre terminal, tester API
curl http://localhost:5000/docs
```

### Développement frontend
```bash
cd web_interface_arg/frontend
# Ouvrir dans navigateur
python3 -m http.server 8080
# Accéder : http://localhost:8080
```

---

## 🚨 Points d'attention

### Performances
- Pipeline peut durer 20-30 minutes (SRA)
- WebSocket doit gérer logs volumineux (>10k lignes)
- Parsing TSV peut être lent sur gros fichiers

### Sécurité
- **AUCUNE authentification** dans MVP (ajouter JWT en prod)
- Validation stricte des inputs (éviter injection commandes)
- Limiter taille uploads FASTA (500 MB max)

### Portabilité
- Chemins absolus/relatifs selon environnement
- Variables d'environnement pour configuration
- Docker pour isolation

---

**Version** : 0.1.0-alpha
**Dernière mise à jour** : 2026-01-28
**Prochaine étape** : Phase 1 - Backend minimal
