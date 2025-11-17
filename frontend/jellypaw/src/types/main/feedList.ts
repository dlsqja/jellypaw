export interface FeedListItem {
  id?: number;
  boardUser?: {
    id?: number;
    nickname?: string;
    profileImg?: string | null;
  };
  title?: string;
  content?: string;
  placeId?: number | null;
  starRating?: number;
  createdAt?: string;
  images?: string[] | null;
  commentCount?: number;
  likeCount?: number;
  viewCount?: number;
  category?: string;
  visibility?: string;
}
