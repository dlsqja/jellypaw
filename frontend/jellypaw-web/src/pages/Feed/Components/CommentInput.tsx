import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/queries/ProfileQuery';
import { FaPaw } from 'react-icons/fa';
import { useEffect, useState, useRef } from 'react';
import { createComment } from '@/services/api/feed';
import { useParams } from 'react-router-dom';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

// 댓글 입력창 컴포넌트 속성
interface CommentInputProps {
  parentId: number | null;
  onOptimisticSubmit?: () => void;
  onSubmitSuccess?: () => void;
  onSubmitError?: () => void;
  onCancelReply?: () => void;
}

// 댓글 입력창 컴포넌트
export default function CommentInput({ parentId, onOptimisticSubmit, onSubmitSuccess, onSubmitError, onCancelReply }: CommentInputProps) {
  const { data: profileData } = useProfile();
  const profileImageUrl = profileData?.profileImg ? `${IMAGE_BASE_URL}${profileData.profileImg}` : null;
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { boardId } = useParams();
  const inputRef = useRef<HTMLInputElement>(null);

  // 댓글 입력창 컴포넌트 속성 변경 시 댓글 내용 초기화 및 포커스
  useEffect(() => {
    setContent('');
    // parentId가 null이 아닐 때 (대댓글을 입력하려고 할 때) input에 포커스
    if (parentId !== null) {
      // 약간의 지연을 두어 DOM 업데이트 후 포커스
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [parentId]);

  // 댓글 내용 변경
  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  // 댓글 달기
  const handleCommentSubmit = async () => {
    // 게시글 ID가 없으면 종료
    if (!boardId) {
      return;
    }
    // 댓글 내용이 없으면 종료
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }
    if (isSubmitting) {
      return;
    }

    onOptimisticSubmit?.();
    setIsSubmitting(true);

    try {
      // 댓글 작성 호출
      if (parentId) {
        console.log('대댓글 작성 시도:', parentId);
        await createComment(Number(boardId), Number(parentId), trimmedContent);
        console.log('대댓글 작성 성공:', { boardId, parentId, content: trimmedContent });
      } else {
        console.log('댓글 작성 시도');
        await createComment(Number(boardId), null, trimmedContent);
        console.log('댓글 작성 성공:', { boardId, content: trimmedContent });
      }

      // 댓글 작성 성공 호출
      onSubmitSuccess?.();
      // 댓글 작성 취소 호출
      onCancelReply?.();
      // 댓글 입력 내용 초기화
      setContent('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      // 댓글 작성 실패 호출
      onSubmitError?.();
      alert('댓글 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      // 댓글 작성 중 상태 초기화
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="absolute bottom-0 left-1/2 z-40 w-full max-w-[360px] -translate-x-1/2 rounded-none border-t-2 border-x-0 border-b-0  border-gray-200 bg-gray-100">
      <CardContent className="gap-0 px-2 py-2">
        <div className="flex w-full items-center gap-3">
          {profileImageUrl ? (
            <img className="h-10 w-10 rounded-full object-cover" src={profileImageUrl} alt={profileData?.nickname ?? '프로필 이미지'} />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-aqua-300 p-1.5">
              <FaPaw className="h-7 w-7 text-aqua-300" />
            </div>
          )}
          <div className="flex flex-1 items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2">
            <Input
              ref={inputRef}
              value={content}
              onChange={handleCommentChange}
              placeholder={parentId ? '답글을 입력하세요...' : '댓글을 입력하세요...'}
              className="h-8 flex-1 border-0 bg-transparent px-0 py-0 p2-b text-aqua-500 placeholder:text-gray-300 placeholder:p2-b focus-visible:ring-0"
            />
            <Button tone="aqua" shape="pillSolid" size="sm" onClick={handleCommentSubmit} disabled={isSubmitting || !content.trim()}>
              게시
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
