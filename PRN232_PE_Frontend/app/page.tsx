'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Movie, MovieAPI, PaginatedResponse, SearchParams } from '@/lib/api';
import { PostTable } from '@/components/posts/post-table';
import { PostSearch } from '@/components/posts/post-search';
import { DeletePostDialog } from '@/components/posts/delete-post-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function MoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMovies = async (page: number = 1, searchParams?: SearchParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await MovieAPI.getMovies({ 
        ...searchParams, 
        page, 
        pageSize: 10 
      });
      
      if (response.success) {
        const paginatedData = response.data as PaginatedResponse<Movie>;
        setMovies(paginatedData.data);
        setCurrentPage(paginatedData.currentPage);
        setTotalPages(paginatedData.totalPages);
        setIsSearching(!!(searchParams && Object.keys(searchParams).length > 0));
      } else {
        setError(response.message || 'Failed to fetch movies');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleDelete = async (id: string) => {
    const movie = movies.find(m => m.id === id);
    if (movie) {
      setMovieToDelete(movie);
      setShowDeleteDialog(true);
    }
  };

  const handleDeleteConfirm = async (movieId: string) => {
    try {
      const response = await MovieAPI.deleteMovie(movieId);
      if (response.success) {
        // Close dialog immediately on success  
        setShowDeleteDialog(false);
        setMovieToDelete(null);
        // Reset to page 1 and refresh the data
        setCurrentPage(1);
        await fetchMovies(1, isSearching ? searchParams : undefined);
      } else {
        setError(response.message || 'Failed to delete movie');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete movie');
    }
  };

  const handleEdit = (movie: Movie) => {
    router.push(`/movies/${movie.id}/edit`);
  };

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    setCurrentPage(1);
    fetchMovies(1, params);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchMovies(page, isSearching ? searchParams : undefined);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
      <div className="space-y-8 sm:space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight">Movies</h1>
            <p className="text-base sm:text-lg text-muted-foreground">Manage all movies in the system</p>
          </div>
          <Button onClick={() => router.push('/movies/new')} className="flex items-center gap-2 w-full sm:w-auto shadow-sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Movie</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Search Component */}
        <PostSearch onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-5 py-4 rounded-xl shadow-sm">
            {error}
          </div>
        )}

        <PostTable 
          data={movies} 
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Delete Confirmation Dialog */}
        <DeletePostDialog
          post={movieToDelete}
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setMovieToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  );
}
