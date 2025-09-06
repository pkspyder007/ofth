import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Signal } from '@/types/signal';
import { 
  getSignalTypeLabel, 
  getUrgencyLabel, 
  getCompanySizeLabel 
} from './data-generator';

export interface ExportOptions {
  format: 'csv' | 'xlsx';
  includeProcessed: boolean;
  selectedOnly: boolean;
}

export function exportSignals(
  signals: Signal[], 
  selectedIds: string[] = [],
  options: ExportOptions = { format: 'csv', includeProcessed: true, selectedOnly: false }
) {
  let dataToExport = signals;

  // Filter based on options
  if (options.selectedOnly && selectedIds.length > 0) {
    dataToExport = signals.filter(signal => selectedIds.includes(signal.id));
  }

  if (!options.includeProcessed) {
    dataToExport = dataToExport.filter(signal => !signal.actionTaken);
  }

  // Transform data for export
  const exportData = dataToExport.map(signal => ({
    'Prospect Name': signal.prospectName,
    'Title': signal.title,
    'Company': signal.company,
    'Industry': signal.industry,
    'Signal Type': getSignalTypeLabel(signal.signalType),
    'Description': signal.description,
    'Urgency': getUrgencyLabel(signal.urgency),
    'Company Size': getCompanySizeLabel(signal.companySize),
    'Confidence': `${signal.confidence}%`,
    'Timestamp': signal.timestamp.toISOString(),
    'Processed': signal.actionTaken ? 'Yes' : 'No',
    'New Signal': signal.isNew ? 'Yes' : 'No'
  }));

  if (options.format === 'csv') {
    exportToCSV(exportData, `signals_${new Date().toISOString().split('T')[0]}.csv`);
  } else {
    exportToExcel(exportData, `signals_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}

function exportToCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes in CSV
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
}

function exportToExcel(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  // Set column widths
  const columnWidths = [
    { wch: 20 }, // Prospect Name
    { wch: 25 }, // Title
    { wch: 20 }, // Company
    { wch: 15 }, // Industry
    { wch: 15 }, // Signal Type
    { wch: 40 }, // Description
    { wch: 10 }, // Urgency
    { wch: 12 }, // Company Size
    { wch: 10 }, // Confidence
    { wch: 20 }, // Timestamp
    { wch: 10 }, // Processed
    { wch: 10 }  // New Signal
  ];
  
  worksheet['!cols'] = columnWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Signals');
  XLSX.writeFile(workbook, filename);
}

export function getExportStats(signals: Signal[], selectedIds: string[] = []) {
  const total = signals.length;
  const selected = selectedIds.length;
  const processed = signals.filter(s => s.actionTaken).length;
  const unprocessed = total - processed;
  const newSignals = signals.filter(s => s.isNew).length;

  return {
    total,
    selected,
    processed,
    unprocessed,
    newSignals
  };
}
