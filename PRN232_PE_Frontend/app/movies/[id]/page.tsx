'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Movie, MovieAPI } from '@/lib/api';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { DeletePostDialog } from '@/components/posts/delete-post-dialog';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const movieId = params.id as string;

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await MovieAPI.getMovieById(movieId);
        
        if (response.success) {
          setMovie(response.data);
        } else {
          setError(response.message || 'Movie not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovie();
    }
  }, [movieId]);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async (movieId: string) => {
    try {
      const response = await MovieAPI.deleteMovie(movieId);
      if (response.success) {
        // Close dialog first
        setShowDeleteDialog(false);
        // Navigate to movies list page
        router.push('/');
      } else {
        setError(response.message || 'Failed to delete movie');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete movie');
    }
  };


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-8 w-48 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="h-64 sm:h-80 lg:h-96 w-full rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4 rounded-xl" />
              <Skeleton className="h-6 w-1/2 rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-12 w-32 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="text-center py-12">
          <h1 className="text-2xl sm:text-3xl font-semibold text-destructive mb-4">Error</h1>
          <p className="text-base text-muted-foreground mb-6 px-4">{error || 'Movie not found'}</p>
          <Button onClick={() => router.push('/')} className="w-full sm:w-auto shadow-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="space-y-8 lg:space-y-12">
          {/* Header */}
          <div className="space-y-6">
            <Button variant="outline" onClick={() => router.push('/')} className="flex items-center gap-2 shadow-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Movies
            </Button>
          </div>

          {/* Movie Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Movie Poster */}
            <div className="space-y-6">
              <div className="relative">
                <div className="aspect-video bg-muted/50 rounded-2xl overflow-hidden shadow-lg border border-border/40">
                  {movie.posterImage ? (
                    <Image
                      src={movie.posterImage}
                      alt={movie.title}
                      className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                      width={800}
                      height={450}
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🎬</div>
                        <p className="text-lg font-medium">No poster</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Movie Information */}
            <div className="space-y-6 sm:space-y-8">
              {/* Movie Title */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground flex-1 tracking-tight leading-tight">{movie.title}</h1>
                </div>
                
                <div className="text-sm text-muted-foreground/70 font-mono">
                  ID: {movie.id}
                </div>
              </div>

              {/* Genre */}
              {movie.genre && (
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">Genre</h3>
                  <p className="text-base sm:text-lg text-foreground/80 leading-relaxed">{movie.genre}</p>
                </div>
              )}

              {/* Rating */}
              {movie.rating !== null && movie.rating !== undefined && (
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">Rating</h3>
                  <p className="text-base sm:text-lg text-foreground/80 leading-relaxed">
                    ⭐ {movie.rating}/5
                  </p>
                </div>
              )}

              {/* Admin Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/40">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/movies/${movieId}/edit`)}
                  className="flex items-center justify-center gap-2 shadow-sm border-border/60 hover:bg-blue-50/50 hover:border-blue-300/50 hover:text-blue-700 w-full sm:w-auto"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Movie
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDeleteClick}
                  className="flex items-center justify-center gap-2 shadow-sm border-border/60 hover:bg-red-50/50 hover:border-red-300/50 hover:text-red-700 w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Movie
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeletePostDialog
        post={movie}
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

