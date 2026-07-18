/**
 * Picsum API response type.
 * Endpoint: https://picsum.photos/v2/list?page={page}&limit=20
 */

export interface PicsumImage {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}
