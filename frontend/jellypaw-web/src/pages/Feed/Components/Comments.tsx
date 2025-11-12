import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import Replies from './Replies';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FaPaw } from 'react-icons/fa';
import type { GetCommentsResponse } from '@/types/feed';
import { Button } from '@/components/ui/button';
import { IoClose } from 'react-icons/io5';
import { deleteComment } from '@/services/api/feed';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

interface CommentProps extends GetCommentsResponse {
  onReply?: (commentId: number | null) => void;
  onEdit?: (commentId: number | null) => void;
  boardId?: number | null;
}

export default function Comment({ id, userId, content, createdAt, replyCount, replies, onReply, onEdit, boardId }: CommentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(id ?? null);
      return;
    }
    alert('댓글 수정 기능이 준비 중입니다.');
  };

  return (
    <>
      <div className="w-full flex justify-start items-start gap-2 pb-2">
        {/* 프로필 이미지 */}
        {userId.profileImg ? (
          <img className="w-10 h-10 rounded-full" src={`${IMAGE_BASE_URL}${userId.profileImg}`} />
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
                {/* ... 버튼 */}
                <button
                  type="button"
                  className="h-7 w-7 flex justify-center items-center cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsActionModalOpen(true);
                  }}
                  aria-haspopup="dialog"
                  aria-expanded={isActionModalOpen}
                  aria-label="댓글 옵션 열기"
                >
                  <MoreHorizontal className="h-5 w-5 text-gray-300" />
                </button>
              </div>
            </div>
            <div className="text-aqua-500 p2">{content || ''}</div>
            {/* 댓글 작성 시간, 좋아요, 댓글 보기, 댓글 달기 */}
            <div className="flex justify-start items-center gap-4 ml-1 mt-1">
              <button type="button" className="flex items-center gap-1 cursor-pointer">
                <Heart className="h-4 w-4 text-gray-300" />
                {/* {likeCount && likeCount > 0 && <span className="text-gray-300 p3-b">{likeCount}</span>} */}
              </button>
              <button type="button" className="flex items-center gap-1 cursor-pointer" onClick={() => onReply?.(id ?? null)}>
                <MessageCircle className="h-4 w-4 text-gray-300" />
                <span className="text-gray-300 p3-b">답글 달기</span>
              </button>
            </div>
          </div>

          {/* 대댓글 자리 */}
        </div>
      </div>

      {/* 댓글 수정 / 삭제 모달 */}
      {isActionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsActionModalOpen(false)}
        >
          <div
            className="w-64 rounded-2xl bg-gray-100 p-4 shadow-lg"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-aqua-500 h6-b">댓글 관리</h3>
              <IoClose className="w-5 h-5 text-aqua-500 cursor-pointer" onClick={() => setIsActionModalOpen(false)} />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                tone="aqua"
                shape="pillSolid"
                size="default"
                onClick={() => {
                  setIsActionModalOpen(false);
                  handleEdit();
                }}
              >
                댓글 수정하기
              </Button>

              <Button
                type="button"
                tone="red"
                shape="pillSolid"
                size="default"
                onClick={async () => {
                  setIsActionModalOpen(false);
                  const confirmed = window.confirm('정말 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.');
                  if (!confirmed) {
                    return;
                  }
                  setIsActionModalOpen(false);
                  try {
                    const response = await deleteComment(Number(id), Number(boardId ?? 0));
                    console.log('댓글이 삭제되었습니다.', response);
                    window.location.reload();
                  } catch (error) {
                    console.error('댓글 삭제에 실패했습니다.', error);
                  }
                }}
              >
                댓글 삭제하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
