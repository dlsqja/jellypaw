import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';

interface CommentProps {
  profileImageUrl: string;
  name: string;
  content: string;
  createdAt: string;
  likeCount: number;
  replyCount: number;
}

export default function Comment({ profileImageUrl, name, content, createdAt, likeCount, replyCount }: CommentProps) {
  return (
    <div className="w-full flex justify-start items-start gap-3">
      {/* 프로필 이미지 */}
      <img className="w-10 h-10 rounded-full" src={profileImageUrl} />
      {/* 댓글 내용 */}
      <div className="w-full flex flex-col justify-start items-start gap-1.5">
        {/* 댓글 내용 컨테이너 */}
        <div className="w-full bg-aqua-100 rounded-[16px] px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="text-aqua-500 p2-b">{name}</div>
            {/* 댓글 작성 시간, 더보기 버튼 */}
            <div className="flex justify-start items-center gap-2">
              <div className="text-gray-300 p3">{createdAt}</div>
              <button type="button" className="h-7 w-7 flex justify-center items-center cursor-pointer ">
                <MoreHorizontal className="h-5 w-5 text-gray-300" />
              </button>
            </div>
          </div>
          <div className="text-aqua-500 p2">{content}</div>
        </div>
        {/* 댓글 작성 시간, 좋아요, 댓글 보기, 댓글 달기 */}
        <div className="flex justify-start items-center">
          <div className="w-full flex justify-start items-center gap-4">
            <div className="flex items-center">
              <button type="button" className="flex items-center gap-1 ml-3 cursor-pointer">
                <Heart className="h-4 w-4  text-gray-300" />
                <span className="text-gray-300 p3-b">{likeCount}</span>
              </button>
              <button type="button" className="flex items-center gap-1 ml-4 cursor-pointer">
                <MessageCircle className="h-4 w-4 text-gray-300" />
                <span className="text-gray-300 p3-b">답글 달기</span>
              </button>
            </div>
          </div>
        </div>
        {/* 대댓글 개수 */}
        <div className="w-40 inline-flex justify-start items-center gap-2 ml-3 cursor-pointer pt-1">
          <div className="w-7 h-0 border-b border-gray-300"></div>
          <div className="text-gray-300 p2-b">답글 {replyCount}개 더 보기</div>
        </div>
      </div>
    </div>
  );
}
