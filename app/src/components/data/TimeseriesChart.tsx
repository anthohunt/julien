import { useRef, useEffect, useMemo } from 'react';
import * as echarts from 'echarts';
import type { CsvRow } from '@/types/dataset';
import './TimeseriesChart.css';

interface TimeseriesChartProps {
  rows: CsvRow[];
  series: string[];
}

/** Build the echarts option from rows + series. Exported for testing. */
export function buildChartOption(rows: CsvRow[], series: string[]) {
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

  return {
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
}

export function TimeseriesChart({ rows, series }: TimeseriesChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  const option = useMemo(
    () => (series.length === 0 ? null : buildChartOption(rows, series)),
    [rows, series]
  );

  useEffect(() => {
    if (!chartRef.current || !option) return;

    const instance = echarts.init(chartRef.current);
    instanceRef.current = instance;
    instance.setOption(option);

    const handleResize = () => instance.resize();
    window.addEventListener('resize', handleResize);

    const ro = new ResizeObserver(() => instance.resize());
    ro.observe(chartRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      ro.disconnect();
      instance.dispose();
      instanceRef.current = null;
    };
  }, [option]);

  if (series.length === 0) {
    return <p className="timeseries-chart__empty">Aucune serie a afficher</p>;
  }

  return (
    <div className="timeseries-chart">
      <div ref={chartRef} style={{ height: '400px', width: '100%' }} />
    </div>
  );
}
