import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import Replies from './Replies';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FaPaw } from 'react-icons/fa';
import type { GetCommentsResponse } from '@/types/feed';
import { Button } from '@/components/ui/button';
import { IoClose } from 'react-icons/io5';
import { deleteComment } from '@/services/api/feed';
import { useProfile } from '@/hooks/queries/ProfileQuery';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '@/utils/timePassing';
import type { SearchUsersResponse } from '@/types/search';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

interface CommentProps extends GetCommentsResponse {
  onReply?: (commentId: number | null) => void;
  onEdit?: (commentId: number | null) => void;
  boardId?: number | null;
  onDeleteSuccess?: () => void;
}

export default function Comment({ id, userId, content, createdAt, childs, onReply, onEdit, boardId, onDeleteSuccess }: CommentProps) {
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isRepliesVisible, setIsRepliesVisible] = useState(false);
  const { data: myProfile } = useProfile();
  const navigate = useNavigate();

  const myUserId = myProfile?.userId ?? null;

  // 프로필 클릭 핸들러
  const handleProfileClick = () => {
    if (userId?.id && userId?.nickname) {
      // userId 정보를 SearchUsersResponse 형태로 변환
      const searchResult: SearchUsersResponse = {
        userId: userId.id,
        nickname: userId.nickname,
        profileImg: userId.profileImg ?? undefined,
      };
      navigate(`/search/person/${userId.id}`, {
        state: { searchResult },
      });
    }
  };

  // 댓글 작성 시간 포맷팅
  const formattedCreatedAt = formatRelativeTime(createdAt);

  // 댓글 소유자 확인
  const isOwner = myUserId !== null && !!userId?.id && userId.id === myUserId;

  // 댓글 수정 함수 - 준비중
  const handleEdit = () => {
    if (onEdit) {
      onEdit(id ?? null);
      return;
    }
    alert('댓글 수정 기능이 준비 중입니다.');
  };

  // 댓글 삭제 함수
  const handleRemove = async () => {
    setIsActionModalOpen(false);
    const confirmed = window.confirm('정말 댓글을 삭제하시겠습니까?\n삭제된 댓글은 복구할 수 없습니다.');
    if (!confirmed) {
      return;
    }
    try {
      await deleteComment(Number(id), Number(boardId));
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('댓글 삭제에 실패했습니다.', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  return (
    <>
      <div className="w-full flex justify-start items-start gap-2 pb-2">
        {/* 프로필 이미지 */}
        <button
          type="button"
          onClick={handleProfileClick}
          className="w-10 h-10 flex-shrink-0 cursor-pointer"
          aria-label={`${userId.nickname}의 프로필 보기`}
        >
          {userId.profileImg ? (
            <div className="w-10 h-10 relative rounded-full overflow-hidden">
              <img className="absolute inset-0 w-full h-full object-cover" src={`${IMAGE_BASE_URL}${userId.profileImg}`} alt={userId.nickname} />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full p-1.5 border-2 border-aqua-300 flex justify-center items-center">
              <FaPaw className="w-10 h-10 text-aqua-300" />
            </div>
          )}
        </button>
        {/* 댓글 내용 */}
        <div className="w-full flex flex-col justify-start items-start gap-1.5 ">
          {/* 댓글 내용 컨테이너 */}
          <div className="w-full bg-aqua-100 rounded-[16px] px-4 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center">
              <div className="text-aqua-500 p2-b">{userId.nickname}</div>
              {/* 댓글 작성 시간, 더보기 버튼 */}
              <div className="flex justify-start items-center gap-2">
                <div className="text-gray-300 p3">{formattedCreatedAt}</div>
                {/* ... 버튼 (내 댓글일 때만) */}
                {isOwner && (
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
                )}
              </div>
            </div>
            <div className="text-aqua-500 p2 whitespace-pre-line break-words">{content || ''}</div>
            {/* 댓글 작성 시간, 좋아요, 댓글 보기, 댓글 달기 */}
            <div className="flex mt-1">
              <button type="button" className="cursor-pointer"></button>
              <button
                type="button"
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => {
                  console.log('parentid:', id);
                  onReply?.(id ?? null);
                }}
              >
                <MessageCircle className="h-4 w-4 text-gray-300" />
                <span className="text-gray-300 p3-b">답글 달기</span>
              </button>
            </div>
          </div>
          {/* 대댓글 보기/접기 버튼 */}
          {Array.isArray(childs) && childs.length > 0 && (
            <div className="w-full flex items-center justify-start gap-2">
              <button type="button" className="ml-4 text-gray-300 p3-b cursor-pointer" onClick={() => setIsRepliesVisible(!isRepliesVisible)}>
                {isRepliesVisible ? '답글 접기' : `${childs.length}개 답글 보기 `}
              </button>
            </div>
          )}
          {/* 대댓글 자리 */}
          {Array.isArray(childs) && childs.length > 0 && isRepliesVisible && (
            <div className="mt-3 flex flex-col gap-3 pl-4 w-full ">
              {childs.map((child) => {
                const childTime = formatRelativeTime(child.createdAt);
                return (
                  <div key={child.id ?? `${child.userId.id}-${child.createdAt}`} className="flex items-start gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => {
                        if (child.userId?.id && child.userId?.nickname) {
                          // child.userId 정보를 SearchUsersResponse 형태로 변환
                          const searchResult: SearchUsersResponse = {
                            userId: child.userId.id,
                            nickname: child.userId.nickname,
                            profileImg: child.userId.profileImg ?? undefined,
                          };
                          navigate(`/search/person/${child.userId.id}`, {
                            state: { searchResult },
                          });
                        }
                      }}
                      className="w-8 h-8 flex-shrink-0 cursor-pointer"
                      aria-label={`${child.userId.nickname}의 프로필 보기`}
                    >
                      {child.userId.profileImg ? (
                        <img
                          className="w-8 h-8 rounded-full object-cover"
                          src={`${IMAGE_BASE_URL}${child.userId.profileImg}`}
                          alt={child.userId.nickname}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full p-1 border-2 border-aqua-300 flex justify-center items-center">
                          <FaPaw className="w-8 h-8 text-aqua-300" />
                        </div>
                      )}
                    </button>
                    <div className="flex-1 bg-gray-200/40 rounded-[16px] px-4 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                      <div className="flex justify-between items-center">
                        <div className="text-aqua-500 p2-b">{child.userId.nickname}</div>
                        <div className="text-gray-300 p3">{childTime}</div>
                      </div>
                      <div className="text-aqua-500 p2 mt-1 whitespace-pre-line break-words">{child.content || ''}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

              <Button type="button" tone="red" shape="pillSolid" size="default" onClick={handleRemove}>
                댓글 삭제하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
