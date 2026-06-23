/**
 * This interface represents the structure of an image query object.
 * It is used for the query parameters in the image processing API.
 *
 * Properties:
 * - filename: The name of the image file (required [no extension]).
 * - width: The desired width of the processed image (optional).
 * - height: The desired height of the processed image (optional).
 */
export interface ImageQuery {
  filename: string;
  width?: number;
  height?: number;
}
