'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import { Virtuoso } from 'react-virtuoso';
import { Signal } from '@/types/signal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { 
  getSignalTypeLabel, 
  getUrgencyLabel, 
  getCompanySizeLabel 
} from '@/lib/data-generator';
import { exportSignals } from '@/lib/export-utils';
import { useSignalStore } from '@/store/signal-store';
import { 
  Clock, 
  Building2, 
  User, 
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Search,
  MoreHorizontal,
  Download,
  FileSpreadsheet,
  FileText,
  MessageSquare
} from 'lucide-react';

interface DataTableProps {
  data: Signal[];
  onSendMessage?: (selectedSignals: Signal[]) => void;
}

export function VirtualizedSignalTable({ data, onSendMessage }: DataTableProps) {
  const { markSignalAsProcessed, bulkDeleteSignals } = useSignalStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // URL state synchronization
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    // Parse sorting from URL
    const sortParam = params.get('sort');
    if (sortParam) {
      try {
        const parsedSort = JSON.parse(sortParam);
        setSorting(parsedSort);
      } catch {
        console.warn('Invalid sort parameter in URL');
      }
    }

    // Parse column filters from URL
    const filtersParam = params.get('filters');
    if (filtersParam) {
      try {
        const parsedFilters = JSON.parse(filtersParam);
        setColumnFilters(parsedFilters);
      } catch {
        console.warn('Invalid filters parameter in URL');
      }
    }

    // Parse column visibility from URL
    const visibilityParam = params.get('visibility');
    if (visibilityParam) {
      try {
        const parsedVisibility = JSON.parse(visibilityParam);
        setColumnVisibility(parsedVisibility);
      } catch {
        console.warn('Invalid visibility parameter in URL');
      }
    }
  }, [searchParams]);

  // Update URL when state changes
  const updateURL = useCallback((updates: {
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    columnVisibility?: VisibilityState;
  }) => {
    const params = new URLSearchParams(searchParams);
    
    if (updates.sorting) {
      params.set('sort', JSON.stringify(updates.sorting));
    }
    if (updates.columnFilters) {
      params.set('filters', JSON.stringify(updates.columnFilters));
    }
    if (updates.columnVisibility) {
      params.set('visibility', JSON.stringify(updates.columnVisibility));
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const handleGenerateOutreach = useCallback(async (signalId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    markSignalAsProcessed(signalId);
  }, [markSignalAsProcessed]);

  const handleExport = useCallback((format: 'csv' | 'xlsx', selectedOnly: boolean = false) => {
    const selectedIds = Object.keys(rowSelection);
    exportSignals(data, selectedIds, {
      format,
      includeProcessed: true,
      selectedOnly
    });
  }, [data, rowSelection]);

  const handleBulkProcess = useCallback(async () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;

    // Confirm processing
    if (window.confirm(`Are you sure you want to process ${selectedIds.length} signal(s)?`)) {
      // Simulate bulk processing
      for (const id of selectedIds) {
        await new Promise(resolve => setTimeout(resolve, 200));
        markSignalAsProcessed(id);
      }
      setRowSelection({}); // Clear selection after processing
    }
  }, [rowSelection, markSignalAsProcessed]);

  const handleBulkDelete = useCallback(() => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;

    // Confirm deletion
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} signal(s)?`)) {
      bulkDeleteSignals(selectedIds);
      setRowSelection({}); // Clear selection after deletion
    }
  }, [rowSelection, bulkDeleteSignals]);

  const handleSendMessage = useCallback(() => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0 || !onSendMessage) return;

    const selectedSignals = data.filter(signal => selectedIds.includes(signal.id));
    onSendMessage(selectedSignals);
  }, [rowSelection, data, onSendMessage]);

  const handleViewDetails = useCallback((signalId: string) => {
    // For now, just log the action - this could open a details modal
    console.log('View details for signal:', signalId);
    // TODO: Implement details modal
  }, []);

  const handleMarkAsProcessed = useCallback((signalId: string) => {
    markSignalAsProcessed(signalId);
  }, [markSignalAsProcessed]);

  const columns: ColumnDef<Signal>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
      },
      {
        accessorKey: 'prospectName',
        header: ({ column }) => {
          return (
            <div 
              className="flex items-center cursor-pointer hover:text-gray-700"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Prospect
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${
                column.getIsSorted() === "asc" ? "rotate-180" : 
                column.getIsSorted() === "desc" ? "rotate-0" : ""
              }`} />
            </div>
          );
        },
        cell: ({ row }) => {
          const signal = row.original;
          return (
            <div className="flex items-center space-x-3 min-w-0">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {signal.prospectName.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {signal.prospectName}
                  </p>
                  {signal.isNew && (
                    <Badge variant="default" className="text-xs bg-blue-100 text-blue-800 flex-shrink-0">
                      <Sparkles className="h-3 w-3 mr-1" />
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{signal.title}</p>
              </div>
            </div>
          );
        },
        size: 300,
      },
      {
        accessorKey: 'company',
        header: ({ column }) => {
          return (
            <div 
              className="flex items-center cursor-pointer hover:text-gray-700"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Company
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${
                column.getIsSorted() === "asc" ? "rotate-180" : 
                column.getIsSorted() === "desc" ? "rotate-0" : ""
              }`} />
            </div>
          );
        },
        cell: ({ row }) => {
          const signal = row.original;
          return (
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{signal.company}</p>
                <p className="text-xs text-gray-500">{signal.industry}</p>
              </div>
            </div>
          );
        },
        size: 200,
      },
      {
        accessorKey: 'signalType',
        header: ({ column }) => {
          return (
            <div 
              className="flex items-center cursor-pointer hover:text-gray-700"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Signal
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${
                column.getIsSorted() === "asc" ? "rotate-180" : 
                column.getIsSorted() === "desc" ? "rotate-0" : ""
              }`} />
            </div>
          );
        },
        cell: ({ row }) => {
          const signal = row.original;
          return (
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">
                {getSignalTypeLabel(signal.signalType)}
              </Badge>
              <p className="text-xs text-gray-600 line-clamp-2 max-w-full overflow-hidden">
                {signal.description}
              </p>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
        size: 250,
      },
      {
        accessorKey: 'urgency',
        header: ({ column }) => {
          return (
            <div 
              className="flex items-center cursor-pointer hover:text-gray-700"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Urgency
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${
                column.getIsSorted() === "asc" ? "rotate-180" : 
                column.getIsSorted() === "desc" ? "rotate-0" : ""
              }`} />
            </div>
          );
        },
        cell: ({ row }) => {
          const signal = row.original;
          const colorClass = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-gray-100 text-gray-800',
          }[signal.urgency];
          
          return (
            <Badge className={`text-xs ${colorClass}`}>
              {getUrgencyLabel(signal.urgency)}
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
        size: 100,
      },
      {
        accessorKey: 'companySize',
        header: ({ column }) => {
          return (
            <div 
              className="flex items-center cursor-pointer hover:text-gray-700"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Size
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${
                column.getIsSorted() === "asc" ? "rotate-180" : 
                column.getIsSorted() === "desc" ? "rotate-0" : ""
              }`} />
            </div>
          );
        },
        cell: ({ row }) => {
          const signal = row.original;
          return (
            <span className="text-sm text-gray-600">
              {getCompanySizeLabel(signal.companySize)}
            </span>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
        size: 100,
      },
      {
        accessorKey: 'confidence',
        header: ({ column }) => {
          return (
            <div 
              className="flex items-center cursor-pointer hover:text-gray-700"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Confidence
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${
                column.getIsSorted() === "asc" ? "rotate-180" : 
                column.getIsSorted() === "desc" ? "rotate-0" : ""
              }`} />
            </div>
          );
        },
        cell: ({ row }) => {
          const signal = row.original;
          return (
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${signal.confidence}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">{signal.confidence}%</span>
            </div>
          );
        },
        size: 120,
      },
      {
        accessorKey: 'timestamp',
        header: ({ column }) => {
          return (
            <div 
              className="flex items-center cursor-pointer hover:text-gray-700"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Time
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${
                column.getIsSorted() === "asc" ? "rotate-180" : 
                column.getIsSorted() === "desc" ? "rotate-0" : ""
              }`} />
            </div>
          );
        },
        cell: ({ row }) => {
          const signal = row.original;
          const timeAgo = Math.floor((Date.now() - signal.timestamp.getTime()) / (1000 * 60 * 60));
          return (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{timeAgo}h ago</span>
            </div>
          );
        },
        size: 100,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const signal = row.original;
          return (
            <div className="flex items-center justify-end">
              {signal.actionTaken ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs">Processed</span>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleGenerateOutreach(signal.id)}>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Generate Outreach
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewDetails(signal.id)}>
                      <User className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMarkAsProcessed(signal.id)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark as Processed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        },
        enableSorting: false,
        size: 80,
      },
    ],
    [handleGenerateOutreach, handleViewDetails, handleMarkAsProcessed]
  );

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      updateURL({ sorting: newSorting });
    },
    onColumnFiltersChange: (updater) => {
      const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
      setColumnFilters(newFilters);
      updateURL({ columnFilters: newFilters });
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: (updater) => {
      const newVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater;
      setColumnVisibility(newVisibility);
      updateURL({ columnVisibility: newVisibility });
    },
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9">
                All signals
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuCheckboxItem>All signals</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>New signals</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Processed</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search signals..."
              value={(table.getColumn("prospectName")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("prospectName")?.setFilterValue(event.target.value)
              }
              className="pl-8 w-64"
            />
          </div>

          {/* Bulk Actions - Show when rows are selected */}
          {Object.keys(rowSelection).length > 0 && (
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
              <span className="text-sm text-blue-700 font-medium">
                {Object.keys(rowSelection).length} selected
              </span>
              {onSendMessage && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleSendMessage}
                  className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Send Message
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkProcess}
                className="h-7 text-xs"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Process All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkDelete}
                className="h-7 text-xs text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv', false)}>
                <FileText className="mr-2 h-4 w-4" />
                Export All as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('xlsx', false)}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export All as Excel
              </DropdownMenuItem>
              {Object.keys(rowSelection).length > 0 && (
                <>
                  <DropdownMenuItem onClick={() => handleExport('csv', true)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export Selected as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('xlsx', true)}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export Selected as Excel
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columns
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center bg-gray-50 border-b min-w-max">
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex-shrink-0"
                style={{ 
                  width: header.column.getSize(),
                  minWidth: header.column.getSize()
                }}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </div>
            ))
          )}
        </div>
        
        {/* Virtualized Body */}
        {table.getRowModel().rows?.length ? (
          <div className="overflow-x-auto">
            <Virtuoso
              style={{ height: 600, minWidth: 'max-content' }}
              data={table.getRowModel().rows}
              itemContent={(index) => {
                const row = table.getRowModel().rows[index];
                return (
                  <div
                    key={row.id}
                    className={`flex items-center border-b border-gray-100 hover:bg-gray-50 min-w-max ${
                      row.original?.isNew ? 'bg-blue-50' : ''
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <div
                        key={cell.id}
                        className="px-4 py-3 flex-shrink-0"
                        style={{ 
                          width: cell.column.getSize(),
                          minWidth: cell.column.getSize()
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    ))}
                  </div>
                );
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <User className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium mb-2">No signals found</h3>
            <p className="text-sm">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>

      {/* Row Count */}
      <div className="flex items-center justify-between py-4 px-4 bg-gray-50 rounded-b-lg">
        <div className="text-sm text-gray-600">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="text-sm text-gray-600">
          Showing {table.getFilteredRowModel().rows.length} signals
        </div>
      </div>
    </div>
  );
}
