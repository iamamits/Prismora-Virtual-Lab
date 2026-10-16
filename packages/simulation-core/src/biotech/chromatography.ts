/**
 * Prismora Biotechnology: Downstream Processing — Gel Filtration / Size Exclusion Chromatography (SEC)
 * Benchmark: IIT Delhi & IIT Kharagpur Biochemical Downstream Processing Lab
 *
 * Governing Equations:
 * 1. Total Column Volume V_t:
 *    V_t = V_0 + V_i + V_g = A \cdot L
 *    where V_0 = Void volume (elution volume of large excluded molecules, e.g. Blue Dextran)
 *    V_t = Total volume (elution volume of small salt marker, e.g. Acetone / NaCl)
 *
 * 2. Partition Coefficient K_av:
 *    K_{av} = \frac{V_e - V_0}{V_t - V_0} \quad (0 \le K_{av} \le 1)
 *
 * 3. Molecular Weight Log Calibration Curve:
 *    K_{av} = -m \cdot \log_{10}(\text{MW}) + c
 *
 * 4. Chromatographic Resolution R_s between two adjacent peaks 1 and 2:
 *    R_s = \frac{2 (V_{e,2} - V_{e,1})}{w_1 + w_2}
 *    Baseline separation achieved when R_s \ge 1.5.
 */

export interface ProteinSample {
  readonly name: string;
  readonly molecularWeightKda: number;
  readonly peakHeightAbs: number;
  readonly color: string;
}

export interface ChromatographyParameters {
  readonly columnLengthCm: number;       // Column height L (e.g. 30 cm)
  readonly columnDiameterCm: number;     // Diameter D (e.g. 1.6 cm)
  readonly flowRateMlPerMin: number;      // Elution flow rate (e.g. 0.8 mL/min)
  readonly beadsPoreSizeKda: number;      // Fractionation range upper limit (e.g. 150 kDa)
  readonly selectedProteins: readonly ProteinSample[];
}

export interface ElutedPeak {
  readonly name: string;
  readonly elutionVolumeMl: number;
  readonly kav: number;
  readonly peakWidthMl: number;
}

export interface ChromatographyResult {
  readonly voidVolumeV0Ml: number;
  readonly totalVolumeVtMl: number;
  readonly resolutionRs: number;
  readonly isBaselineSeparated: boolean;
  readonly peaks: readonly ElutedPeak[];
  readonly chromatogramUvCurve: readonly { volumeMl: number; absorbance280nm: number }[];
}

export const DEFAULT_PROTEINS: readonly ProteinSample[] = [
  { name: 'Thyroglobulin (669 kDa)', molecularWeightKda: 669, peakHeightAbs: 0.85, color: '#0284C7' },
  { name: 'Bovine Serum Albumin (66 kDa)', molecularWeightKda: 66, peakHeightAbs: 1.10, color: '#10B981' },
  { name: 'Cytochrome C (12.4 kDa)', molecularWeightKda: 12.4, peakHeightAbs: 0.95, color: '#F59E0B' },
];

export const DEFAULT_CHROMATOGRAPHY_PARAMS: ChromatographyParameters = {
  columnLengthCm: 30,
  columnDiameterCm: 1.6,
  flowRateMlPerMin: 0.8,
  beadsPoreSizeKda: 200,
  selectedProteins: DEFAULT_PROTEINS,
};

export class ChromatographyEngine {
  static compute(params: ChromatographyParameters = DEFAULT_CHROMATOGRAPHY_PARAMS): ChromatographyResult {
    const L = params.columnLengthCm;
    const D = params.columnDiameterCm;
    // Total geometric bed volume Vt in mL (cm³)
    const Vt = (Math.PI * (D / 2) * (D / 2) * L);
    // Void volume V0 approx 30% of bed volume for Sephadex / Sephacryl
    const V0 = 0.32 * Vt;
    const poreLimit = params.beadsPoreSizeKda;

    const peaks: ElutedPeak[] = [];
    const proteins = params.selectedProteins.length > 0 ? params.selectedProteins : DEFAULT_PROTEINS;

    proteins.forEach((p) => {
      let kav: number;
      if (p.molecularWeightKda >= poreLimit) {
        kav = 0; // completely excluded
      } else if (p.molecularWeightKda <= 1.0) {
        kav = 1.0; // totally included
      } else {
        // Linear relation with log10(MW)
        const logMw = Math.log10(p.molecularWeightKda);
        const logMax = Math.log10(poreLimit);
        const logMin = Math.log10(1.0);
        kav = Math.max(0, Math.min(1.0, (logMax - logMw) / (logMax - logMin)));
      }

      const Ve = V0 + kav * (Vt - V0);
      // Peak broadening width w ~ 0.08 * Ve
      const peakWidth = 0.08 * Ve;

      peaks.push({
        name: p.name,
        elutionVolumeMl: parseFloat(Ve.toFixed(1)),
        kav: parseFloat(kav.toFixed(3)),
        peakWidthMl: parseFloat(peakWidth.toFixed(2)),
      });
    });

    // Sort peaks by elution volume
    peaks.sort((a, b) => a.elutionVolumeMl - b.elutionVolumeMl);

    // Compute Resolution Rs between first two peaks
    let Rs = 2.0;
    if (peaks.length >= 2) {
      const p1 = peaks[0]!;
      const p2 = peaks[1]!;
      Rs = (2 * (p2.elutionVolumeMl - p1.elutionVolumeMl)) / (p1.peakWidthMl + p2.peakWidthMl);
    }

    // Generate UV 280nm Chromatogram curve over 0 to 1.2 * Vt mL
    const maxVol = Vt * 1.15;
    const chromatogram: Array<{ volumeMl: number; absorbance280nm: number }> = [];

    const numPoints = 80;
    for (let i = 0; i <= numPoints; i++) {
      const v = (i / numPoints) * maxVol;
      let totalAbs = 0.02; // baseline baseline drift

      proteins.forEach((prot) => {
        const pk = peaks.find((k) => k.name === prot.name);
        if (pk) {
          const sigma = pk.peakWidthMl / 4; // 4*sigma = peak width
          const delta = v - pk.elutionVolumeMl;
          const gaussian = prot.peakHeightAbs * Math.exp(-(delta * delta) / (2 * sigma * sigma));
          totalAbs += gaussian;
        }
      });

      chromatogram.push({
        volumeMl: parseFloat(v.toFixed(1)),
        absorbance280nm: parseFloat(totalAbs.toFixed(3)),
      });
    }

    return {
      voidVolumeV0Ml: parseFloat(V0.toFixed(1)),
      totalVolumeVtMl: parseFloat(Vt.toFixed(1)),
      resolutionRs: parseFloat(Rs.toFixed(2)),
      isBaselineSeparated: Rs >= 1.5,
      peaks,
      chromatogramUvCurve: chromatogram,
    };
  }
}
