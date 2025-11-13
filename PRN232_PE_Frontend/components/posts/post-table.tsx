"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Eye, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Movie } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

const createColumns = (
  onEdit?: (movie: Movie) => void,
  onDeleteClick?: (movie: Movie) => void
): ColumnDef<Movie>[] => [
  {
    accessorKey: "posterImage",
    header: "Poster",
    cell: ({ row }) => {
      const posterImage = row.getValue("posterImage") as string;
      return (
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted/50 shadow-sm border border-border/40">
          {posterImage ? (
            <Image
              src={posterImage}
              alt="Movie poster"
              className="w-full h-full object-cover"
              width={56}
              height={56}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-xs font-medium">
              No Image
            </div>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return (
        <div 
          className="font-semibold text-foreground max-w-[200px] truncate cursor-help"
          title={title}
        >
          {title}
        </div>
      );
    },
  },
  {
    accessorKey: "genre",
    header: "Genre",
    cell: ({ row }) => {
      const genre = row.getValue("genre") as string;
      return (
        <div 
          className="max-w-[150px] truncate text-sm text-muted-foreground/80 cursor-help"
          title={genre || 'N/A'}
        >
          {genre || 'N/A'}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number;
      return (
        <div className="text-sm font-medium text-foreground">
          {rating !== null && rating !== undefined ? `⭐ ${rating}/5` : 'N/A'}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const movie = row.original;

      return (
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-9 px-3 text-xs font-medium border-border/60 hover:bg-green-50/50 hover:border-green-300/50 hover:text-green-700"
          >
            <Link href={`/movies/${movie.id}`}>
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">View</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 text-xs font-medium border-border/60 hover:bg-blue-50/50 hover:border-blue-300/50 hover:text-blue-700"
            onClick={() => onEdit?.(movie)}
          >
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 text-xs font-medium border-border/60 hover:bg-red-50/50 hover:border-red-300/50 hover:text-red-700"
            onClick={() => onDeleteClick?.(movie)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      );
    },
  },
];

interface PostTableProps {
  data: Movie[];
  loading?: boolean;
  onEdit?: (movie: Movie) => void;
  onDelete?: (id: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function PostTable({ data, loading = false, onEdit, onDelete, currentPage = 1, totalPages = 1, onPageChange }: PostTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const handleDeleteClick = (movie: Movie) => {
    if (onDelete) {
      onDelete(movie.id);
    }
  };

  const columns = createColumns(onEdit, handleDeleteClick);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });


  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center py-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32 ml-auto" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-12 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Table View for all screen sizes */}
      <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm overflow-x-auto overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-sm">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No movies found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Server-side Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            className="shadow-sm"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground font-medium">
            Page {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            className="shadow-sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

