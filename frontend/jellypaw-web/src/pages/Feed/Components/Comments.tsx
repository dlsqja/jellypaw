import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import Replies from './Replies';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { useProfile } from '@/hooks/queries/ProfileQuery';
import { FaPaw } from 'react-icons/fa';
import type { GetCommentsResponse } from '@/types/feed';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function Comment({ userId, content, createdAt }: GetCommentsResponse) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full flex justify-start items-start gap-2 pb-2">
      {/* 프로필 이미지 */}
      {userId.profileImg ? (
        <img className="w-10 h-10 rounded-full" src={userId.profileImg} />
      ) : (
        <div className="w-10 h-10 rounded-full p-1.5 border-2 border-aqua-300 flex justify-center items-center">
          <FaPaw className="w-10 h-10 text-aqua-300" />
        </div>
      )}
      {/* 댓글 내용 */}
      <div className="w-full flex flex-col justify-start items-start gap-1.5">
        {/* 댓글 내용 컨테이너 */}
        <div className="w-full bg-aqua-100 rounded-[16px] px-4 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center">
            <div className="text-aqua-500 p2-b">{userId.nickname}</div>
            {/* 댓글 작성 시간, 더보기 버튼 */}
            <div className="flex justify-start items-center gap-2">
              <div className="text-gray-300 p3">{createdAt}</div>
              <button type="button" className="h-5 w-5 flex justify-center items-center cursor-pointer ">
                <MoreHorizontal className=" text-gray-300" />
              </button>
            </div>
          </div>
          <div className="text-aqua-500 p2">{content || ''}</div>
        </div>
        {/* 댓글 작성 시간, 좋아요, 댓글 보기, 댓글 달기 */}
        <div className="flex justify-start items-center">
          <div className="w-full flex justify-start items-center gap-4">
            <div className="flex items-center">
              <button type="button" className="flex items-center gap-1 ml-3 cursor-pointer">
                <Heart className="h-4 w-4  text-gray-300" />
                {/* {likeCount && likeCount > 0 && <span className="text-gray-300 p3-b">{likeCount}</span>} */}
              </button>
              <button type="button" className="flex items-center gap-1 ml-4 cursor-pointer">
                <MessageCircle className="h-4 w-4 text-gray-300" />
                <span className="text-gray-300 p3-b">답글 달기</span>
              </button>
            </div>
          </div>
        </div>
        {/* 대댓글
        {replyCount && replyCount > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <div className="w-40 inline-flex justify-start items-center gap-2 ml-3 cursor-pointer pt-1">
                <div className="w-7 h-0 border-b border-gray-300"></div>
                <div className="text-gray-300 p2-b">{isOpen ? '답글 접기' : `답글 ${replyCount}개 더 보기`}</div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {replies &&
                replies.map((reply, index) => (
                  <Replies
                    key={index}
                    profileImageUrl={reply.profileImageUrl}
                    name={reply.name}
                    content={reply.content}
                    createdAt={reply.createdAt}
                    likeCount={reply.likeCount}
                  />
                ))}
            </CollapsibleContent>
          </Collapsible>
        )} */}
      </div>
    </div>
  );
}
