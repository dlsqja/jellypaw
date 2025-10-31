import { Heart, MessageCircle } from 'lucide-react';

interface ArticleBoxProps {
  imageUrl: string;
  title: string;
  date: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

export default function ArticleBox({ imageUrl, title, date, content, likeCount, commentCount }: ArticleBoxProps) {
  return (
    <div className="py-2 px-6 border-b border-gray-200 last:border-b-0 flex items-start gap-4">
      {/* 이미지 */}
      <img className="w-20 h-20 rounded-lg object-cover flex-shrink-0" src={imageUrl} alt="article image" />
      <div className="flex-1 flex flex-col gap-1">
        {/* 제목 */}
        <div className="text-aqua-500 p2-b ">{title}</div>
        {/* 날짜 */}
        <div className="text-gray-300 caption1">{date}</div>
        {/* 본문 */}
        <div className="text-aqua-500 caption1 line-clamp-2">{content}</div>
        {/* 좋아요, 댓글 수 */}
        <div className="flex justify-end items-center">
          <div className="flex items-center">
            <button type="button" className="h-7 flex items-center gap-1 cursor-pointer ">
              <Heart className="h-3.5 w-3.5 text-gray-300" />
              <span className="text-aqua-500 caption1">{likeCount}</span>
            </button>
            <button type="button" className="h-7 flex items-center gap-1 ml-4 cursor-pointer ">
              <MessageCircle className="h-3.5 w-3.5 text-gray-300" />
              <span className="text-aqua-500 caption1">{commentCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
