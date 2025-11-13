'use client';

import { useState } from 'react';
import { Movie } from '@/lib/api';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { DeletePostDialog } from './delete-post-dialog';

interface PostCardProps {
  post: Movie;
  onEdit?: (movie: Movie) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  clickable?: boolean;
}

export function PostCard({ post, onEdit, onDelete, showActions = true, clickable = true }: PostCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async (movieId: string) => {
    if (onDelete) {
      await onDelete(movieId);
    }
  };

  const cardContent = (
    <Card className="group overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white">
      {/* Movie Poster */}
      <div className="relative aspect-video bg-gray-50 overflow-hidden">
        {post.posterImage ? (
          <Image
            src={post.posterImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            width={400}
            height={225}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <div className="text-center">
              <div className="text-4xl mb-2">🎬</div>
              <p className="text-sm">No poster</p>
            </div>
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
        
        {/* Quick actions overlay */}
        {showActions && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex flex-col gap-2">
              <Link href={`/movies/${post.id}`} onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0 shadow-lg">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              {onEdit && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(post);
                  }}
                  className="h-8 w-8 p-0 shadow-lg"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteClick}
                  className="h-8 w-8 p-0 shadow-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Movie Info */}
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Movie Title */}
          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
          
          {/* Genre and Rating */}
          <div className="flex flex-col gap-1">
            {post.genre && (
              <p className="text-sm text-gray-600 line-clamp-1">
                {post.genre}
              </p>
            )}
            {post.rating !== null && post.rating !== undefined && (
              <p className="text-sm font-medium text-gray-700">
                ⭐ {post.rating}/5
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (clickable && !showActions) {
    return (
      <>
        <Link href={`/movies/${post.id}`} className="block">
          {cardContent}
        </Link>
        <DeletePostDialog
          post={post}
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteConfirm}
        />
      </>
    );
  }

  return (
    <>
      {cardContent}
      <DeletePostDialog
        post={post}
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

