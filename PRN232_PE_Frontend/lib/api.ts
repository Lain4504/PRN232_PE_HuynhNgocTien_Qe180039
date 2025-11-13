// API configuration and types
import { config } from './config';

const API_BASE_URL = config.api.baseUrl;

// Types based on backend DTOs
export interface Movie {
  id: string;
  title: string;
  genre?: string;
  rating?: number;
  posterImage?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
  error?: {
    errorCode?: string;
    errorMessage?: string;
    validationErrors?: Record<string, string[]>;
  };
  timestamp: string;
}

export interface CreateMovieData {
  title: string;
  genre?: string;
  rating?: number;
  posterImage?: File;
}

export interface UpdateMovieData extends CreateMovieData {
  id: string;
}

export type MovieSortBy = 'Title' | 'Rating';
export type SortDirection = 'Ascending' | 'Descending';

export interface SearchParams {
  searchTerm?: string;
  genre?: string;
  page?: number;
  pageSize?: number;
  sortBy?: MovieSortBy;
  sortDirection?: SortDirection;
}

// API functions
export class MovieAPI {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private static async requestWithFormData<T>(
    endpoint: string,
    formData: FormData,
    method: 'POST' | 'PUT' = 'POST'
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get all movies with pagination
  static async getMovies(params: SearchParams = {}): Promise<ApiResponse<PaginatedResponse<Movie>>> {
    const searchParams = new URLSearchParams();
    
    if (params.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    if (params.genre) searchParams.append('genre', params.genre);
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.pageSize !== undefined) searchParams.append('pageSize', params.pageSize.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortDirection) searchParams.append('sortDirection', params.sortDirection);

    const queryString = searchParams.toString();
    const endpoint = `/movies${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedResponse<Movie>>(endpoint);
  }

  // Get movie by ID
  static async getMovieById(id: string): Promise<ApiResponse<Movie>> {
    return this.request<Movie>(`/movies/${id}`);
  }

  // Create new movie
  static async createMovie(movieData: CreateMovieData): Promise<ApiResponse<Movie>> {
    const formData = new FormData();
    formData.append('title', movieData.title);
    
    if (movieData.genre) {
      formData.append('genre', movieData.genre);
    }
    
    if (movieData.rating !== undefined) {
      formData.append('rating', movieData.rating.toString());
    }
    
    if (movieData.posterImage) {
      formData.append('posterImage', movieData.posterImage);
    }

    return this.requestWithFormData<Movie>('/movies', formData, 'POST');
  }

  // Update movie
  static async updateMovie(movieData: UpdateMovieData): Promise<ApiResponse<Movie>> {
    const formData = new FormData();
    formData.append('title', movieData.title);
    
    if (movieData.genre) {
      formData.append('genre', movieData.genre);
    }
    
    if (movieData.rating !== undefined) {
      formData.append('rating', movieData.rating.toString());
    }
    
    if (movieData.posterImage) {
      formData.append('posterImage', movieData.posterImage);
    }

    return this.requestWithFormData<Movie>(`/movies/${movieData.id}`, formData, 'PUT');
  }

  // Delete movie
  static async deleteMovie(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/movies/${id}`, {
      method: 'DELETE',
    });
  }
}
