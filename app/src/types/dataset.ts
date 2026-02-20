export interface CsvRow {
  id: number;
  unique_id: string;
  ds: string;
  y: number;
}

export interface SeriesStats {
  uniqueId: string;
  nbPoints: number;
  dateRange: [string, string];
  min: number;
  max: number;
  mean: number;
}

export interface Dataset {
  id: string;
  name: string;
  importedAt: string;
  rows: CsvRow[];
  series: string[];
  selectedSeries: string[];
}
