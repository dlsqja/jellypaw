export interface FeedWriteRequest {
  category: string;
  title: string;
  content: string;
  placeId: string;
  starRating: number;
  visibility: string;
  // newImages: string[]; // multi-part
}
