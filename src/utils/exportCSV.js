/**
 * Export data array as CSV and trigger file download
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the CSV file
 * @param {Array} columns - Array of { key, label } defining columns
 */
export function exportToCSV(data, filename, columns) {
  if (!data || !data.length) return;

  // Build CSV header
  const header = columns.map((col) => `"${col.label}"`).join(',');

  // Build CSV rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        let value = row[col.key];
        if (value === null || value === undefined) value = '';
        // Handle nested objects (e.g., pilot.name)
        if (col.key.includes('.')) {
          const keys = col.key.split('.');
          value = keys.reduce((obj, k) => obj?.[k], row) || '';
        }
        // Escape quotes and wrap in quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csv = [header, ...rows].join('\n');

  // Trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
