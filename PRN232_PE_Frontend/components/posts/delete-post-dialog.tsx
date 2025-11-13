'use client';

import { useState } from 'react';
import { Movie } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeletePostDialogProps {
  post: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (movieId: string) => Promise<void>;
}

export function DeletePostDialog({ 
  post, 
  isOpen, 
  onClose, 
  onConfirm 
}: DeletePostDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset loading state when dialog is closed
  const handleClose = () => {
    if (!isDeleting) {
      setIsDeleting(false);
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (!post || isDeleting) return;
    
    try {
      setIsDeleting(true);
      await onConfirm(post.id);
      // Success - dialog will be closed by parent component
      toast.success('Movie deleted successfully!');
      // Reset loading state after successful deletion
      setIsDeleting(false);
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast.error('Error deleting movie');
      setIsDeleting(false);
    }
  };

  if (!post) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Delete Movie
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogDescription className="text-left space-y-3">
          <p>
            Are you sure you want to delete the movie <strong>&ldquo;{post.title}&rdquo;</strong>?
          </p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The movie will be permanently deleted from the system.
          </p>
        </AlertDialogDescription>
        
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel 
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground flex-1 sm:flex-none"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Movie
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

