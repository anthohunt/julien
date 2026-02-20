import type { CsvRow } from '@/types/dataset';
import './DataTable.css';

interface DataTableProps {
  rows: CsvRow[];
}

export function DataTable({ rows }: DataTableProps) {
  if (rows.length === 0) {
    return <p className="data-table__empty">Aucune donnee a afficher</p>;
  }

  return (
    <div className="data-table__wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>id</th>
            <th>unique_id</th>
            <th>ds</th>
            <th>y</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>{row.id}</td>
              <td>{row.unique_id}</td>
              <td>{row.ds}</td>
              <td>{row.y}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
