/**
 * Utility functions for handling images in the application
 */
import { environment } from '../../../environments/environment';

export const ImageUtils = {
  /**
   * Returns a base64-encoded transparent 1x1 pixel PNG
   */
  getPlaceholderImage(): string {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  },

  /**
   * Returns a placeholder URL for product images
   */
  getProductPlaceholder(): string {
    return this.getPlaceholderImage();
  },

  /**
   * Returns a placeholder URL for category icons
   */
  getCategoryPlaceholder(): string {
    return this.getPlaceholderImage();
  },

  /**
   * Handles image loading errors by replacing with a placeholder
   */
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = this.getPlaceholderImage();
      img.onerror = null; // Prevent infinite loop if placeholder fails
    }
  },

  /**
   * Gets the full image URL, falling back to a placeholder if needed
   */
  getImageUrl(url: string | undefined): string {
    if (!url) return this.getPlaceholderImage();
    if (url.startsWith('http')) return url;
    if (url.startsWith('data:')) return url;
    // Prefix API base URL when backend returns relative paths like "/Images/..."
    const base = environment.apiUrl?.replace(/\/$/, '') || '';
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${base}${path}`;
  }
};
