/**
 * Prismora Multi-Domain Curriculum & Virtual Laboratory Inventory Types
 * Compliant with AICTE Model Undergraduate Curriculum, Virtual Labs (MHRD/NMEICT),
 * and Indian Technical University Syllabi (IITs, NITs, State Technical Universities).
 */

import type { LaboratoryId, SimulationDifficulty, SimulationStatus } from '../simulations/registry';

export type AcademicDomainId =
  | 'ece'
  | 'cse'
  | 'ee'
  | 'me'
  | 'che'
  | 'bt_bme'
  | 'ce'
  | 'physics'
  | 'chemistry'
  | 'math'
  | 'interdisciplinary';

export type AcademicDegree = 'B.Tech' | 'B.E.' | 'B.Sc' | 'M.Tech';
export type AcademicSemester = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type ExperimentLifecycleStatus =
  | 'discovered'
  | 'research_required'
  | 'designed'
  | 'in_development'
  | 'functional'
  | 'validated'
  | 'needs_maintenance'
  | 'blocked';

export interface AttributionSource {
  readonly portal: string;
  readonly institution: string;
  readonly labTitle: string;
  readonly accreditationSyllabus: string;
  readonly license: string;
}

export interface CurricularExperimentDef {
  readonly id: string;
  readonly title: string;
  readonly shortTitle: string;
  readonly domain: AcademicDomainId;
  readonly branch: string;
  readonly degree: AcademicDegree;
  readonly semester: AcademicSemester;
  readonly courseCode: string;
  readonly courseName: string;
  readonly unit: string;
  readonly topic: string;
  readonly description: string;
  readonly status: ExperimentLifecycleStatus;
  readonly route: string;
  readonly laboratoryId: LaboratoryId;
  readonly category: string;
  readonly difficulty: SimulationDifficulty;
  readonly featured?: boolean;
  readonly disciplineColor: string;
  readonly tags: readonly string[];
  readonly learningObjectives: readonly string[];
  readonly requiredInstruments: readonly string[];
  readonly equations: readonly string[];
  readonly prerequisites: readonly string[];
  readonly attribution: AttributionSource;
  readonly verifiedMapping: boolean;
}

export interface DomainMeta {
  readonly id: AcademicDomainId;
  readonly name: string;
  readonly shortName: string;
  readonly tagline: string;
  readonly description: string;
  readonly primaryColor: string;
  readonly benchmarkInstitutions: readonly string[];
  readonly totalDiscoveredLabs: number;
  readonly coreCourses: readonly { code: string; name: string; semester: AcademicSemester }[];
}
