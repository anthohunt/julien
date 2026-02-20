import ReactECharts from 'echarts-for-react';
import type { CsvRow } from '@/types/dataset';
import './TimeseriesChart.css';

interface TimeseriesChartProps {
  rows: CsvRow[];
  series: string[];
}

export function TimeseriesChart({ rows, series }: TimeseriesChartProps) {
  if (series.length === 0) {
    return <p className="timeseries-chart__empty">Aucune serie a afficher</p>;
  }

  const allDates = [...new Set(rows.map((r) => r.ds))].sort();

  const chartSeries = series.map((uid) => {
    const seriesRows = rows.filter((r) => r.unique_id === uid);
    const dataMap = new Map(seriesRows.map((r) => [r.ds, r.y]));
    return {
      name: uid,
      type: 'line' as const,
      data: allDates.map((d) => dataMap.get(d) ?? null),
      smooth: true,
      connectNulls: true,
    };
  });

  const option = {
    tooltip: { trigger: 'axis' as const },
    legend: { data: series, textStyle: { color: '#8888aa' } },
    xAxis: {
      type: 'category' as const,
      data: allDates,
      axisLabel: { color: '#8888aa' },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: '#8888aa' },
      splitLine: { lineStyle: { color: '#2a2a4a' } },
    },
    series: chartSeries,
    backgroundColor: 'transparent',
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  };

  return (
    <div className="timeseries-chart">
      <ReactECharts option={option} style={{ height: '400px' }} />
    </div>
  );
}
