"""
Parser pour les fichiers de résultats du pipeline ARG
"""
import csv
from pathlib import Path
from typing import Optional, List, Dict, Any
import logging
import re

from models import ARGGene, AssemblyStats, DetectionResults, DeduplicatedGene

logger = logging.getLogger(__name__)


class OutputParser:
    """Parser pour les fichiers de sortie du pipeline"""

    def __init__(self, output_dir: str):
        """
        Args:
            output_dir: Chemin vers outputs/{SAMPLE_ID}_{RUN_NUMBER}/
        """
        self.output_dir = Path(output_dir)

        if not self.output_dir.exists():
            raise FileNotFoundError(f"Répertoire output non trouvé: {output_dir}")

    def parse_resfinder(self) -> Optional[DetectionResults]:
        """
        Parse les résultats ResFinder (abricate)

        Returns:
            DetectionResults ou None si fichier non trouvé
        """
        # Chercher fichier ResFinder
        resfinder_files = list(self.output_dir.glob("04_arg_detection/resfinder/*_resfinder.tsv"))

        if not resfinder_files:
            logger.warning("Fichier ResFinder non trouvé")
            return None

        tsv_file = resfinder_files[0]
        logger.info(f"Parsing ResFinder: {tsv_file}")

        try:
            genes = []
            with open(tsv_file, 'r') as f:
                header_line = None
                data_lines = []

                for line in f:
                    # L'en-tête commence par #FILE - on la garde mais on enlève le #
                    if line.startswith('#FILE'):
                        header_line = line[1:]  # Enlever le # du début
                        continue

                    # Skip autres lignes de commentaire ou métadonnées
                    if line.startswith('#'):
                        continue
                    if line.startswith(('Using ', 'Processing:', 'Found ', 'Tip:', 'Done.')):
                        continue

                    # Garder les lignes avec des données (au moins quelques colonnes)
                    if line.count('\t') >= 5:
                        data_lines.append(line)

                if not data_lines:
                    logger.info(f"ResFinder: aucun gène trouvé dans {tsv_file}")
                    return DetectionResults(tool="ResFinder", num_genes=0, genes=[])

                # Si on a trouvé l'en-tête, l'ajouter au début
                if header_line:
                    data_lines.insert(0, header_line)

                reader = csv.DictReader(data_lines, delimiter='\t')

                for row in reader:
                    try:
                        gene = ARGGene(
                            gene=row.get('GENE', ''),
                            sequence=row.get('SEQUENCE', ''),
                            start=int(row.get('START', 0) or 0),
                            end=int(row.get('END', 0) or 0),
                            strand=row.get('STRAND', '+'),
                            coverage=float(row.get('%COVERAGE', 0) or 0),
                            identity=float(row.get('%IDENTITY', 0) or 0),
                            database=row.get('DATABASE', 'resfinder'),
                            accession=row.get('ACCESSION', ''),
                            product=row.get('PRODUCT') if row.get('PRODUCT') else None,
                            resistance=row.get('RESISTANCE') if row.get('RESISTANCE') else None
                        )
                        genes.append(gene)
                    except (ValueError, KeyError) as e:
                        logger.warning(f"Skip ligne invalide ResFinder: {e} - row: {row}")
                        continue

            logger.info(f"ResFinder: {len(genes)} gènes parsés")
            return DetectionResults(
                tool="ResFinder",
                num_genes=len(genes),
                genes=genes
            )

        except Exception as e:
            logger.error(f"Erreur parsing ResFinder: {e}")
            return None

    def parse_amrfinderplus(self, element_type_filter: str = None) -> Optional[DetectionResults]:
        """
        Parse les résultats AMRFinderPlus

        Args:
            element_type_filter: Filtrer par type d'élément (AMR, VIRULENCE, STRESS) ou None pour tous

        Returns:
            DetectionResults ou None si fichier non trouvé
        """
        amr_files = list(self.output_dir.glob("04_arg_detection/amrfinderplus/*_amrfinderplus.tsv"))

        if not amr_files:
            logger.warning("Fichier AMRFinderPlus non trouvé")
            return None

        tsv_file = amr_files[0]

        try:
            genes = []
            with open(tsv_file, 'r') as f:
                reader = csv.DictReader(f, delimiter='\t')

                for row in reader:
                    # Type d'élément: AMR, VIRULENCE, STRESS
                    element_type = row.get('Element type', 'AMR')

                    # Filtrer si demandé
                    if element_type_filter and element_type != element_type_filter:
                        continue

                    # Adapter au format ARGGene
                    gene = ARGGene(
                        gene=row.get('Gene symbol', row.get('Element symbol', '')),
                        sequence=row.get('Contig id', ''),
                        start=int(row.get('Start', 0)),
                        end=int(row.get('Stop', 0)),
                        strand=row.get('Strand', '+'),
                        coverage=100.0,  # AMRFinder ne donne pas de coverage explicite
                        identity=float(row.get('% Identity to reference sequence', 100.0)),
                        database="AMRFinderPlus",
                        accession=row.get('Accession of closest sequence', ''),
                        product=row.get('Sequence name') if row.get('Sequence name') else None,
                        resistance=row.get('Class') if row.get('Class') else None,
                        subclass=row.get('Subclass') if row.get('Subclass') else None,
                        element_type=element_type,
                        element_subtype=row.get('Element subtype', '')
                    )
                    genes.append(gene)

            tool_name = "AMRFinderPlus"
            if element_type_filter:
                tool_name = f"AMRFinderPlus ({element_type_filter})"

            return DetectionResults(
                tool=tool_name,
                num_genes=len(genes),
                genes=genes
            )

        except Exception as e:
            logger.error(f"Erreur parsing AMRFinderPlus: {e}")
            return None

    def parse_card(self) -> Optional[DetectionResults]:
        """
        Parse les résultats CARD (abricate)

        Returns:
            DetectionResults ou None
        """
        card_files = list(self.output_dir.glob("04_arg_detection/card/*_card.tsv"))

        if not card_files:
            logger.warning("Fichier CARD non trouvé")
            return None

        tsv_file = card_files[0]
        logger.info(f"Parsing CARD: {tsv_file}")

        try:
            genes = []
            with open(tsv_file, 'r') as f:
                header_line = None
                data_lines = []

                for line in f:
                    # L'en-tête commence par #FILE - on la garde mais on enlève le #
                    if line.startswith('#FILE'):
                        header_line = line[1:]  # Enlever le # du début
                        continue

                    # Skip autres lignes de commentaire ou métadonnées
                    if line.startswith('#'):
                        continue
                    if line.startswith(('Using ', 'Processing:', 'Found ', 'Tip:', 'Done.')):
                        continue

                    # Garder les lignes avec des données (au moins quelques colonnes)
                    if line.count('\t') >= 5:
                        data_lines.append(line)

                if not data_lines:
                    logger.info(f"CARD: aucun gène trouvé dans {tsv_file}")
                    return DetectionResults(tool="CARD", num_genes=0, genes=[])

                # Si on a trouvé l'en-tête, l'ajouter au début
                if header_line:
                    data_lines.insert(0, header_line)

                reader = csv.DictReader(data_lines, delimiter='\t')

                for row in reader:
                    try:
                        gene = ARGGene(
                            gene=row.get('GENE', ''),
                            sequence=row.get('SEQUENCE', ''),
                            start=int(row.get('START', 0) or 0),
                            end=int(row.get('END', 0) or 0),
                            strand=row.get('STRAND', '+'),
                            coverage=float(row.get('%COVERAGE', 0) or 0),
                            identity=float(row.get('%IDENTITY', 0) or 0),
                            database="CARD",
                            accession=row.get('ACCESSION', ''),
                            product=row.get('PRODUCT') if row.get('PRODUCT') else None,
                            resistance=row.get('RESISTANCE') if row.get('RESISTANCE') else None
                        )
                        genes.append(gene)
                    except (ValueError, KeyError) as e:
                        logger.warning(f"Skip ligne invalide CARD: {e} - row: {row}")
                        continue

            logger.info(f"CARD: {len(genes)} gènes parsés")
            return DetectionResults(
                tool="CARD",
                num_genes=len(genes),
                genes=genes
            )

        except Exception as e:
            logger.error(f"Erreur parsing CARD: {e}")
            return None

    def parse_vfdb(self) -> Optional[DetectionResults]:
        """
        Parse les résultats VFDB (Virulence Factor Database) via abricate

        Returns:
            DetectionResults ou None si fichier non trouvé
        """
        vfdb_files = list(self.output_dir.glob("04_arg_detection/vfdb/*_vfdb.tsv"))

        if not vfdb_files:
            logger.warning("Fichier VFDB non trouvé")
            return None

        tsv_file = vfdb_files[0]
        logger.info(f"Parsing VFDB: {tsv_file}")

        try:
            genes = []
            with open(tsv_file, 'r') as f:
                header_line = None
                data_lines = []

                for line in f:
                    # L'en-tête commence par #FILE - on la garde mais on enlève le #
                    if line.startswith('#FILE'):
                        header_line = line[1:]  # Enlever le # du début
                        continue

                    # Skip autres lignes de commentaire ou métadonnées
                    if line.startswith('#'):
                        continue
                    if line.startswith(('Using ', 'Processing:', 'Found ', 'Tip:', 'Done.')):
                        continue

                    # Garder les lignes avec des données (au moins quelques colonnes)
                    if line.count('\t') >= 5:
                        data_lines.append(line)

                if not data_lines:
                    logger.info(f"VFDB: aucun gène trouvé dans {tsv_file}")
                    return DetectionResults(tool="VFDB", num_genes=0, genes=[])

                # Si on a trouvé l'en-tête, l'ajouter au début
                if header_line:
                    data_lines.insert(0, header_line)

                reader = csv.DictReader(data_lines, delimiter='\t')

                for row in reader:
                    try:
                        gene = ARGGene(
                            gene=row.get('GENE', ''),
                            sequence=row.get('SEQUENCE', ''),
                            start=int(row.get('START', 0) or 0),
                            end=int(row.get('END', 0) or 0),
                            strand=row.get('STRAND', '+'),
                            coverage=float(row.get('%COVERAGE', 0) or 0),
                            identity=float(row.get('%IDENTITY', 0) or 0),
                            database="VFDB",
                            accession=row.get('ACCESSION', ''),
                            product=row.get('PRODUCT') if row.get('PRODUCT') else None,
                            resistance=row.get('RESISTANCE') if row.get('RESISTANCE') else "Virulence",
                            element_type="VIRULENCE"
                        )
                        genes.append(gene)
                    except (ValueError, KeyError) as e:
                        logger.warning(f"Skip ligne invalide VFDB: {e} - row: {row}")
                        continue

            logger.info(f"VFDB: {len(genes)} gènes parsés")
            return DetectionResults(
                tool="VFDB",
                num_genes=len(genes),
                genes=genes
            )

        except Exception as e:
            logger.error(f"Erreur parsing VFDB: {e}")
            return None

    def parse_ncbi(self) -> Optional[DetectionResults]:
        """
        Parse les résultats NCBI AMR via abricate

        Returns:
            DetectionResults ou None si fichier non trouvé
        """
        ncbi_files = list(self.output_dir.glob("04_arg_detection/ncbi/*_ncbi.tsv"))

        if not ncbi_files:
            logger.warning("Fichier NCBI non trouvé")
            return None

        tsv_file = ncbi_files[0]
        logger.info(f"Parsing NCBI: {tsv_file}")

        try:
            genes = []
            with open(tsv_file, 'r') as f:
                header_line = None
                data_lines = []

                for line in f:
                    if line.startswith('#FILE'):
                        header_line = line[1:]
                        continue
                    if line.startswith('#'):
                        continue
                    if line.startswith(('Using ', 'Processing:', 'Found ', 'Tip:', 'Done.')):
                        continue
                    if line.count('\t') >= 5:
                        data_lines.append(line)

                if not data_lines:
                    logger.info(f"NCBI: aucun gène trouvé dans {tsv_file}")
                    return DetectionResults(tool="NCBI", num_genes=0, genes=[])

                if header_line:
                    data_lines.insert(0, header_line)

                reader = csv.DictReader(data_lines, delimiter='\t')

                for row in reader:
                    try:
                        gene = ARGGene(
                            gene=row.get('GENE', ''),
                            sequence=row.get('SEQUENCE', ''),
                            start=int(row.get('START', 0) or 0),
                            end=int(row.get('END', 0) or 0),
                            strand=row.get('STRAND', '+'),
                            coverage=float(row.get('%COVERAGE', 0) or 0),
                            identity=float(row.get('%IDENTITY', 0) or 0),
                            database="NCBI",
                            accession=row.get('ACCESSION', ''),
                            product=row.get('PRODUCT') if row.get('PRODUCT') else None,
                            resistance=row.get('RESISTANCE') if row.get('RESISTANCE') else None
                        )
                        genes.append(gene)
                    except (ValueError, KeyError) as e:
                        logger.warning(f"Skip ligne invalide NCBI: {e} - row: {row}")
                        continue

            logger.info(f"NCBI: {len(genes)} gènes parsés")
            return DetectionResults(
                tool="NCBI",
                num_genes=len(genes),
                genes=genes
            )

        except Exception as e:
            logger.error(f"Erreur parsing NCBI: {e}")
            return None

    def parse_assembly_stats(self) -> Optional[AssemblyStats]:
        """
        Parse les statistiques d'assemblage (QUAST)

        Returns:
            AssemblyStats ou None
        """
        quast_report = self.output_dir / "02_assembly/quast/report.tsv"

        if not quast_report.exists():
            logger.warning("Fichier QUAST report.tsv non trouvé")
            return None

        try:
            # Lire QUAST TSV (format: metric \t value)
            stats = {}
            with open(quast_report, 'r') as f:
                reader = csv.reader(f, delimiter='\t')
                for row in reader:
                    if len(row) >= 2:
                        stats[row[0]] = row[1]

            return AssemblyStats(
                num_contigs=self._parse_int(stats.get('# contigs')),
                total_length=self._parse_int(stats.get('Total length')),
                largest_contig=self._parse_int(stats.get('Largest contig')),
                n50=self._parse_int(stats.get('N50')),
                l50=self._parse_int(stats.get('L50')),
                gc_percent=self._parse_float(stats.get('GC (%)'))
            )

        except Exception as e:
            logger.error(f"Erreur parsing QUAST: {e}")
            return None

    def get_report_html_path(self) -> Optional[str]:
        """
        Trouve le chemin vers le rapport HTML professionnel

        Returns:
            str: Chemin relatif ou None
        """
        report_files = list(self.output_dir.glob("06_analysis/reports/*_ARG_professional_report.html"))

        if report_files:
            return str(report_files[0])

        return None

    def parse_mlst(self) -> Optional[Dict[str, Any]]:
        """
        Parse les résultats MLST

        Returns:
            Dict avec schéma, ST, profil allélique, etc. ou None
        """
        # Chercher les fichiers MLST dans différents emplacements possibles
        mlst_files = (
            list(self.output_dir.glob("03_annotation/mlst/*_mlst.tsv")) +
            list(self.output_dir.glob("04_arg_detection/mlst/*_mlst.tsv")) +
            list(self.output_dir.glob("05_taxonomy/mlst/*_mlst.tsv")) +
            list(self.output_dir.glob("**/mlst/*_mlst.tsv")) +
            list(self.output_dir.glob("**/*mlst*.tsv"))
        )

        if not mlst_files:
            logger.warning("Fichier MLST non trouvé")
            return None

        tsv_file = mlst_files[0]
        logger.info(f"Parsing MLST: {tsv_file}")

        try:
            with open(tsv_file, 'r') as f:
                lines = f.readlines()

            if not lines:
                return None

            # Le format MLST typique: FILE\tSCHEME\tST\tallele1\tallele2\t...
            data_line = None

            for line in lines:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                data_line = line
                break

            if not data_line:
                return None

            parts = data_line.split('\t')
            if len(parts) < 3:
                return None

            # Format: FILE \t SCHEME \t ST \t allele1 \t allele2 ...
            mlst_data = {
                'scheme': parts[1] if len(parts) > 1 else None,
                'sequence_type': parts[2] if len(parts) > 2 else None,
                'source': 'MLST',
                'alleles': {}
            }

            # Si ST est '-' ou vide, pas de données valides
            if mlst_data['sequence_type'] in ['-', '', None]:
                logger.info("MLST: pas de ST détecté")
                return None

            # Les colonnes après ST sont les allèles
            # Format: Pas_cpn60(12) Pas_fusA(37) gltA(2) ou juste gene(num)
            if len(parts) > 3:
                genes = []
                allele_values = []
                for i in range(3, len(parts)):
                    allele_str = parts[i].strip()
                    if not allele_str or allele_str == '-':
                        continue

                    # Parser format gene(allele_num) - avec ou sans préfixe Pas_
                    match = re.match(r'(?:Pas_)?(\w+)\((\d+)\)', allele_str)
                    if match:
                        gene_name = match.group(1)
                        allele_num = match.group(2)
                        mlst_data['alleles'][gene_name] = allele_num
                        genes.append(gene_name)
                        allele_values.append(allele_num)
                    elif allele_str.isdigit():
                        mlst_data['alleles'][f'locus_{i-2}'] = allele_str
                        allele_values.append(allele_str)

                if genes:
                    mlst_data['genes'] = genes
                    mlst_data['profile'] = '-'.join(allele_values)

            logger.info(f"MLST parsé: ST{mlst_data.get('sequence_type', '?')} scheme={mlst_data.get('scheme', '?')}")
            return mlst_data

        except Exception as e:
            logger.error(f"Erreur parsing MLST: {e}")
            return None

    def parse_taxonomy(self) -> Optional[Dict[str, Any]]:
        """
        Parse les résultats de classification taxonomique (Kraken2)

        Returns:
            Dict avec espèce, confiance, etc. ou None
        """
        # Chercher les fichiers Kraken2 dans différents emplacements
        kraken_files = (
            list(self.output_dir.glob("01_qc/kraken2/*_kraken2.report")) +
            list(self.output_dir.glob("05_taxonomy/kraken2/*_kraken2.report")) +
            list(self.output_dir.glob("05_taxonomy/*_kraken2.report")) +
            list(self.output_dir.glob("**/kraken2/*_kraken2.report")) +
            list(self.output_dir.glob("**/*kraken2.report"))
        )

        if not kraken_files:
            logger.warning("Fichier Kraken2 non trouvé")
            return None

        report_file = kraken_files[0]
        logger.info(f"Parsing taxonomy: {report_file}")

        try:
            # Format Kraken2 report:
            # %reads  #reads_clade  #reads_direct  rank  taxid  name
            species_data = None
            genus_data = None

            with open(report_file, 'r') as f:
                for line in f:
                    parts = line.strip().split('\t')
                    if len(parts) >= 6:
                        try:
                            percent = float(parts[0].strip())
                        except ValueError:
                            continue

                        rank = parts[3].strip()
                        name = parts[5].strip()

                        # Chercher l'espèce (S) avec le plus haut pourcentage
                        if rank == 'S' and (species_data is None or percent > species_data['confidence']):
                            species_data = {
                                'species': name,
                                'confidence': percent,
                                'rank': 'species'
                            }
                        # Aussi garder le genre (G) le plus abondant
                        elif rank == 'G' and (genus_data is None or percent > genus_data['confidence']):
                            genus_data = {
                                'genus': name,
                                'confidence': percent
                            }

            if species_data:
                taxonomy_result = {
                    'species': species_data['species'],
                    'confidence': species_data['confidence'],
                    'source': 'Kraken2'
                }
                if genus_data:
                    taxonomy_result['genus'] = genus_data['genus']
                logger.info(f"Taxonomie parsée: {species_data['species']} ({species_data['confidence']:.1f}%)")
                return taxonomy_result

            return None

        except Exception as e:
            logger.error(f"Erreur parsing taxonomy: {e}")
            return None

    def parse_all_arg_detection(self) -> Dict[str, DetectionResults]:
        """
        Parse tous les outils de détection ARG disponibles

        Returns:
            Dict[str, DetectionResults]: Résultats par outil
        """
        results = {}

        # Parser ResFinder
        resfinder = self.parse_resfinder()
        if resfinder:
            results['resfinder'] = resfinder

        # Parser AMRFinderPlus (tous les types)
        amrfinder = self.parse_amrfinderplus()
        if amrfinder:
            results['amrfinderplus'] = amrfinder

        # Parser CARD
        card = self.parse_card()
        if card:
            results['card'] = card

        # Parser VFDB (Virulence)
        vfdb = self.parse_vfdb()
        if vfdb:
            results['vfdb'] = vfdb

        # Parser NCBI
        ncbi = self.parse_ncbi()
        if ncbi:
            results['ncbi'] = ncbi

        return results

    def get_unique_resistance_types(
        self,
        detection_results: Dict[str, DetectionResults]
    ) -> List[str]:
        """
        Extrait les types de résistance uniques de tous les outils

        Args:
            detection_results: Résultats de tous les outils

        Returns:
            Liste triée des types de résistance uniques
        """
        resistance_types = set()

        for tool_results in detection_results.values():
            for gene in tool_results.genes:
                if gene.resistance:
                    # Splitter si plusieurs résistances (ex: "Aminoglycoside;Fluoroquinolone")
                    for resistance in gene.resistance.split(';'):
                        resistance_types.add(resistance.strip())

        return sorted(list(resistance_types))

    def get_total_unique_genes(
        self,
        detection_results: Dict[str, DetectionResults]
    ) -> int:
        """
        Compte le nombre de gènes ARG uniques (dédupliqués par nom)

        Args:
            detection_results: Résultats de tous les outils

        Returns:
            int: Nombre de gènes uniques
        """
        unique_genes = set()

        for tool_results in detection_results.values():
            for gene in tool_results.genes:
                unique_genes.add(gene.gene.lower())

        return len(unique_genes)

    @staticmethod
    def _normalize_gene_name(gene_name: str) -> str:
        """
        Normalise le nom d'un gène pour la déduplication
        Enlève les suffixes _1, _2, etc. et met en minuscule

        Args:
            gene_name: Nom du gène original

        Returns:
            str: Nom normalisé
        """
        # Enlever suffixes comme _1, _2, etc.
        base_name = gene_name.split('_')[0]
        return base_name.lower()

    @staticmethod
    def _gene_matches(gene_name: str, existing_genes: List[Dict]) -> bool:
        """
        Vérifie si un gène est déjà présent dans la liste (par substring match)

        Args:
            gene_name: Nom du gène à vérifier
            existing_genes: Liste des gènes existants

        Returns:
            bool: True si le gène est déjà présent
        """
        base_name = gene_name.split('_')[0].lower()
        for existing in existing_genes:
            if base_name in existing['gene'].lower():
                return True
        return False

    def parse_all_arg_deduplicated(self) -> Dict[str, Any]:
        """
        Parse tous les outils ARG avec déduplication intelligente
        Reproduit la logique de generate_arg_report.py

        Ordre de priorité:
        1. AMRFinderPlus (source principale)
        2. ResFinder (fusionne si match)
        3. CARD/RGI (ajoute si unique)
        4. VFDB (ajoute si unique)
        5. NCBI (ajoute si unique)

        Returns:
            Dict avec:
                - 'genes': Liste dédupliquée de gènes
                - 'by_source': Dict des sources avec leurs gènes originaux
                - 'stats': Statistiques de déduplication
        """
        all_genes = []
        by_source = {}
        stats = {
            'total_raw': 0,
            'total_deduplicated': 0,
            'by_type': {'AMR': 0, 'VIRULENCE': 0, 'STRESS': 0, 'UNKNOWN': 0},
            'duplicates_removed': 0
        }

        # 1. Parser AMRFinderPlus (source principale)
        amrfinder = self.parse_amrfinderplus()
        if amrfinder and amrfinder.genes:
            for gene in amrfinder.genes:
                gene_dict = {
                    'gene': gene.gene,
                    'sequence': gene.sequence,
                    'start': gene.start,
                    'end': gene.end,
                    'strand': gene.strand,
                    'coverage': gene.coverage,
                    'identity': gene.identity,
                    'database': gene.database,
                    'accession': gene.accession,
                    'product': gene.product,
                    'resistance': gene.resistance,
                    'subclass': gene.subclass,
                    'element_type': gene.element_type or 'AMR',
                    'element_subtype': gene.element_subtype,
                    'source': 'AMRFinderPlus',
                    'sources': ['AMRFinderPlus']
                }
                all_genes.append(gene_dict)
            by_source['AMRFinderPlus'] = len(amrfinder.genes)
            stats['total_raw'] += len(amrfinder.genes)
            logger.info(f"Dédup: {len(amrfinder.genes)} gènes AMRFinderPlus ajoutés")

        # 2. Parser ResFinder (fusionner si match, sinon ajouter)
        resfinder = self.parse_resfinder()
        if resfinder and resfinder.genes:
            added = 0
            merged = 0
            for gene in resfinder.genes:
                rf_base = self._normalize_gene_name(gene.gene)

                # Chercher match dans AMRFinderPlus
                matched = False
                for existing in all_genes:
                    existing_base = self._normalize_gene_name(existing['gene'])
                    if rf_base == existing_base:
                        # Fusionner: ajouter source, garder meilleure identité
                        if 'ResFinder' not in existing['sources']:
                            existing['sources'].append('ResFinder')
                        if gene.identity > existing['identity']:
                            existing['identity'] = gene.identity
                            existing['coverage'] = gene.coverage
                        matched = True
                        merged += 1
                        break

                if not matched:
                    # Ajouter comme nouveau gène
                    gene_dict = {
                        'gene': gene.gene,
                        'sequence': gene.sequence,
                        'start': gene.start,
                        'end': gene.end,
                        'strand': gene.strand,
                        'coverage': gene.coverage,
                        'identity': gene.identity,
                        'database': gene.database,
                        'accession': gene.accession,
                        'product': gene.product,
                        'resistance': gene.resistance,
                        'subclass': None,
                        'element_type': 'AMR',
                        'element_subtype': None,
                        'source': 'ResFinder',
                        'sources': ['ResFinder']
                    }
                    all_genes.append(gene_dict)
                    added += 1

            by_source['ResFinder'] = len(resfinder.genes)
            stats['total_raw'] += len(resfinder.genes)
            stats['duplicates_removed'] += merged
            logger.info(f"Dédup: ResFinder - {added} ajoutés, {merged} fusionnés")

        # 3. Parser CARD (ajouter si unique)
        card = self.parse_card()
        if card and card.genes:
            added = 0
            for gene in card.genes:
                if not self._gene_matches(gene.gene, all_genes):
                    gene_dict = {
                        'gene': gene.gene,
                        'sequence': gene.sequence,
                        'start': gene.start,
                        'end': gene.end,
                        'strand': gene.strand,
                        'coverage': gene.coverage,
                        'identity': gene.identity,
                        'database': gene.database,
                        'accession': gene.accession,
                        'product': gene.product,
                        'resistance': gene.resistance,
                        'subclass': None,
                        'element_type': 'AMR',
                        'element_subtype': None,
                        'source': 'CARD',
                        'sources': ['CARD']
                    }
                    all_genes.append(gene_dict)
                    added += 1
                else:
                    # Ajouter la source aux gènes existants
                    for existing in all_genes:
                        if self._normalize_gene_name(gene.gene) in existing['gene'].lower():
                            if 'CARD' not in existing['sources']:
                                existing['sources'].append('CARD')
                            break

            by_source['CARD'] = len(card.genes)
            stats['total_raw'] += len(card.genes)
            stats['duplicates_removed'] += len(card.genes) - added
            logger.info(f"Dédup: CARD - {added} ajoutés, {len(card.genes) - added} doublons")

        # 4. Parser VFDB (ajouter si unique - Virulence)
        vfdb = self.parse_vfdb()
        if vfdb and vfdb.genes:
            added = 0
            for gene in vfdb.genes:
                if not self._gene_matches(gene.gene, all_genes):
                    gene_dict = {
                        'gene': gene.gene,
                        'sequence': gene.sequence,
                        'start': gene.start,
                        'end': gene.end,
                        'strand': gene.strand,
                        'coverage': gene.coverage,
                        'identity': gene.identity,
                        'database': gene.database,
                        'accession': gene.accession,
                        'product': gene.product,
                        'resistance': gene.resistance,
                        'subclass': None,
                        'element_type': 'VIRULENCE',
                        'element_subtype': None,
                        'source': 'VFDB',
                        'sources': ['VFDB']
                    }
                    all_genes.append(gene_dict)
                    added += 1
                else:
                    for existing in all_genes:
                        if self._normalize_gene_name(gene.gene) in existing['gene'].lower():
                            if 'VFDB' not in existing['sources']:
                                existing['sources'].append('VFDB')
                            break

            by_source['VFDB'] = len(vfdb.genes)
            stats['total_raw'] += len(vfdb.genes)
            stats['duplicates_removed'] += len(vfdb.genes) - added
            logger.info(f"Dédup: VFDB - {added} ajoutés, {len(vfdb.genes) - added} doublons")

        # 5. Parser NCBI (ajouter si unique)
        ncbi = self.parse_ncbi()
        if ncbi and ncbi.genes:
            added = 0
            for gene in ncbi.genes:
                if not self._gene_matches(gene.gene, all_genes):
                    gene_dict = {
                        'gene': gene.gene,
                        'sequence': gene.sequence,
                        'start': gene.start,
                        'end': gene.end,
                        'strand': gene.strand,
                        'coverage': gene.coverage,
                        'identity': gene.identity,
                        'database': gene.database,
                        'accession': gene.accession,
                        'product': gene.product,
                        'resistance': gene.resistance,
                        'subclass': None,
                        'element_type': 'AMR',
                        'element_subtype': None,
                        'source': 'NCBI',
                        'sources': ['NCBI']
                    }
                    all_genes.append(gene_dict)
                    added += 1
                else:
                    for existing in all_genes:
                        if self._normalize_gene_name(gene.gene) in existing['gene'].lower():
                            if 'NCBI' not in existing['sources']:
                                existing['sources'].append('NCBI')
                            break

            by_source['NCBI'] = len(ncbi.genes)
            stats['total_raw'] += len(ncbi.genes)
            stats['duplicates_removed'] += len(ncbi.genes) - added
            logger.info(f"Dédup: NCBI - {added} ajoutés, {len(ncbi.genes) - added} doublons")

        # Calculer les stats finales
        stats['total_deduplicated'] = len(all_genes)
        for gene in all_genes:
            element_type = gene.get('element_type', 'AMR')
            if element_type in stats['by_type']:
                stats['by_type'][element_type] += 1
            else:
                stats['by_type']['UNKNOWN'] += 1

        logger.info(f"Déduplication finale: {stats['total_raw']} bruts -> {stats['total_deduplicated']} uniques ({stats['duplicates_removed']} doublons retirés)")

        return {
            'genes': all_genes,
            'by_source': by_source,
            'stats': stats
        }

    # Helpers
    @staticmethod
    def _parse_int(value: Any) -> Optional[int]:
        """Parse une valeur en int, retourne None si impossible"""
        try:
            return int(value)
        except (ValueError, TypeError):
            return None

    @staticmethod
    def _parse_float(value: Any) -> Optional[float]:
        """Parse une valeur en float, retourne None si impossible"""
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
