import BackHeader from '@/components/headers/BackHeader';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { editMyProfile, checkNicknameDuplicate } from '@/services/api/mypage';
import { useState, useRef, useEffect } from 'react';
import { useProfile, useProfileQueryClient } from '@/hooks/queries/ProfileQuery';
import type { EditProfileRequest, EditProfileImageRequest, NicknameStatus } from '@/types/mypage';
import { useNavigate } from 'react-router-dom';
import { FiCamera } from 'react-icons/fi';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export default function EditProfile() {
  const { invalidateProfile } = useProfileQueryClient();
  const navigate = useNavigate();
  const { data: profileData } = useProfile();

  const [nickname, setNickname] = useState<string>('');
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>('idle');
  const [nicknameError, setNicknameError] = useState<string | undefined>();
  const [nicknameTouched, setNicknameTouched] = useState(false);

  const [description, setDescription] = useState<string>('');
  const [deleteProfileImg, setDeleteProfileImg] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 원래 닉네임 (프로필에서 온 값)
  const originalNickname = profileData?.nickname ?? '';

  // 프로필 데이터 로드 시 기본값 세팅
  useEffect(() => {
    if (profileData) {
      setNickname(profileData.nickname || '');
      setDescription(profileData.description || '');
      setNicknameTouched(false);
      setNicknameStatus('idle');
      setNicknameError(undefined);
    }
  }, [profileData]);

  // 닉네임 디바운스 + 중복 체크
  useEffect(() => {
    const trimmed = nickname.trim();
    const originalTrimmed = originalNickname.trim();

    // 아직 유저가 손 안 댔으면 검사 X
    if (!nicknameTouched) return;

    // 비어 있으면 에러
    if (!trimmed) {
      setNicknameStatus('idle');
      setNicknameError('닉네임을 입력하세요.');
      return;
    }

    // 기존 닉네임 그대로면 검사 없이 OK
    if (trimmed === originalTrimmed) {
      setNicknameStatus('available');
      setNicknameError(undefined);
      return;
    }

    setNicknameStatus('checking');
    setNicknameError(undefined);

    const timer = setTimeout(async () => {
      try {
        const duplicated = await checkNicknameDuplicate(trimmed);
        setNicknameStatus(duplicated ? 'duplicated' : 'available');
      } catch (e) {
        console.error('[EditProfile] checkNicknameDuplicate error', e);
        setNicknameStatus('error');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [nickname, nicknameTouched, originalNickname]);

  // 에러 / 헬퍼 텍스트 계산
  const trimmed = nickname.trim();
  const originalTrimmed = originalNickname.trim();
  const isNicknameChanged = trimmed !== originalTrimmed;

  let nicknameErrorText: string | undefined;
  let nicknameHelperText: string | undefined;
  let nicknameHelperClassName: string | undefined;

  if (nicknameTouched && isNicknameChanged) {
    if (nicknameStatus === 'idle' || nicknameStatus === 'checking') {
      nicknameHelperText = ' ';
    } else if (nicknameStatus === 'available') {
      nicknameHelperText = '사용 가능한 닉네임이에요.';
      nicknameHelperClassName = 'text-aqua-300';
    } else if (nicknameStatus === 'duplicated') {
      nicknameErrorText = '이미 사용 중인 닉네임이에요.';
    } else if (nicknameStatus === 'error') {
      nicknameErrorText =
        '닉네임 중복 확인 중 오류가 발생했어요. 다시 시도해 주세요.';
    }
  } else {
    // 메시지는 안 보이되, 레이아웃 유지용 공백
    nicknameHelperText = ' ';
  }

  // 저장 가능 여부
  const canSave =
    !!trimmed && (!isNicknameChanged || nicknameStatus === 'available');

  // 프로필 사진 추가 버튼 클릭
  const handleAddProfilePhoto = () => {
    fileInputRef.current?.click();
  };

  // 파일 선택 시
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 선택할 수 있습니다.');
        return;
      }
      setSelectedImage(file);
      setDeleteProfileImg(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
      };
      reader.onerror = () => {
        console.error('이미지 읽기 실패');
        alert('이미지를 읽을 수 없습니다.');
      };
      reader.readAsDataURL(file);
    }
  };

  // 프로필 사진 제거
  const handleRemoveProfilePhoto = () => {
    setDeleteProfileImg(true);
    setSelectedImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 저장하기
  const handleSave = async () => {
    try {
      const editData: EditProfileRequest = {
        nickname,
        description,
        deleteProfileImg,
      };
      const profileImg: EditProfileImageRequest = {
        profileImg: selectedImage,
      };

      await editMyProfile(editData, profileImg.profileImg ?? null);
      await invalidateProfile();

      alert('프로필이 수정되었습니다.');
      setDeleteProfileImg(false);
      setSelectedImage(null);
      setPreviewImage(null);
      navigate('/mypage');
    } catch (error) {
      alert('프로필 수정에 실패했습니다.');
    }
  };

  return (
    <>
      <BackHeader title="프로필 편집" />

      {/* 프로필 영역 */}
      <div className="w-full py-8 inline-flex flex-col justify-center items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="relative w-28 h-28">
          <button
            type="button"
            onClick={handleAddProfilePhoto}
            className="relative w-28 h-28 p-1 bg-aqua-100 rounded-full cursor-pointer"
          >
            <div className="w-full h-full bg-aqua-100 rounded-full overflow-hidden relative">
              {previewImage ? (
                <img
                  className="w-full h-full rounded-full object-cover"
                  src={previewImage}
                  alt="프로필 미리보기"
                />
              ) : profileData?.profileImg && !deleteProfileImg ? (
                <img
                  className="w-full h-full rounded-full object-cover"
                  src={`${IMAGE_BASE_URL}${profileData.profileImg}`}
                  alt="프로필"
                />
              ) : (
                <div className="w-full h-full flex justify-center items-center">
                  <FiCamera className="w-12 h-12 text-aqua-300" />
                </div>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={handleAddProfilePhoto}
            className="absolute right-0 bottom-0 w-9 h-9 bg-aqua-300 rounded-full flex justify-center items-center cursor-pointer shadow-lg z-10"
          >
            <FiCamera className="w-4.5 h-4.5 text-white" />
          </button>
        </div>

        {(previewImage || (profileData?.profileImg && !deleteProfileImg)) && (
          <div className="flex justify-center items-center gap-2">
            <p
              className="text-aqua-300 p2 cursor-pointer"
              onClick={handleRemoveProfilePhoto}
            >
              프로필 사진 제거
            </p>
          </div>
        )}
      </div>

      {/* 개인 정보 영역 */}
      <div className="flex flex-col gap-6">
        <p className="text-aqua-500 h4-b">개인 정보</p>

        {/* 닉네임 */}
        <div className="flex flex-col gap-2">
          <Label>닉네임</Label>
          <Input
            type="text"
            placeholder="닉네임"
            className="w-full h-11"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setNicknameTouched(true);
            }}
            errorText={nicknameErrorText}
            helperText={nicknameHelperText}
            helperTextClassName={nicknameHelperClassName}
            containerClassName="mb-0"
          />
        </div>

        {/* 자기소개 */}
        <div className="flex flex-col gap-2">
          <Label>자기소개</Label>
          <Textarea
            className="h-32"
            placeholder="자기소개"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Button
          size="lg"
          shape="pillSolid"
          tone="aqua"
          className="w-full h-11 mb-6"
          onClick={handleSave}
          disabled={!canSave}
        >
          <span className="text-white p1-b">저장하기</span>
        </Button>
      </div>
    </>
  );
}
