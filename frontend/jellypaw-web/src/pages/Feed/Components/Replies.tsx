import { Heart, MoreHorizontal } from 'lucide-react';

interface RepliesProps {
  profileImageUrl: string;
  name: string;
  content: string;
  createdAt: string;
  likeCount: number;
}

export default function Replies({ profileImageUrl, name, content, createdAt, likeCount }: RepliesProps) {
  return (
    <div className="w-full flex justify-start items-start gap-3 mt-2">
      {/* 프로필 이미지 */}
      <img className="w-8 h-8 rounded-full" src={profileImageUrl} />
      {/* 댓글 내용 */}
      <div className="w-full flex flex-col justify-start items-start gap-1.5">
        {/* 댓글 내용 컨테이너 */}
        <div className="w-full bg-white rounded-[16px] px-4 py-2 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center">
            <div className="text-aqua-500 p3-b">{name}</div>
            {/* 댓글 작성 시간, 더보기 버튼 */}
            <div className="flex justify-start items-center gap-2">
              <div className="text-gray-300 caption1">{createdAt}</div>
              <button type="button" className="h-5 w-5 flex justify-center items-center cursor-pointer ">
                <MoreHorizontal className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
          <div className="text-aqua-500 p3">{content}</div>
        </div>
        {/* 댓글 작성 시간, 좋아요, 댓글 보기, 댓글 달기 */}
        <div className="flex justify-start items-center">
          <div className="w-full flex justify-start items-center gap-4">
            <div className="flex items-center">
              <button type="button" className="flex items-center gap-1 ml-3 cursor-pointer">
                <Heart className="h-3 w-3 text-gray-300" />
                {likeCount > 0 && <span className="text-gray-300 caption1-b">{likeCount}</span>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
