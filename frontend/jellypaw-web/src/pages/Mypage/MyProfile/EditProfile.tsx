import BackHeader from '@/components/headers/BackHeader';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { editMyProfile } from '@/services/api/mypage';
import { useState, useRef, useEffect } from 'react';
import { useProfile, useProfileQueryClient } from '@/hooks/queries/ProfileQuery';
import { BsPersonCircle } from 'react-icons/bs';
import type { EditProfileRequest, EditProfileImageRequest } from '@/types/mypage';
import { useNavigate } from 'react-router-dom';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
export default function EditProfile() {
  const { invalidateProfile } = useProfileQueryClient();
  const navigate = useNavigate();
  // React Query로 캐싱된 프로필 데이터 가져오기
  const { data: profileData } = useProfile();

  // 닉네임과 자기소개 상태 기본 값은 지금 프로필 데이터의 값으로 설정
  const [nickname, setNickname] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  // 프로필 사진 제거 여부 - 기본은 false
  const [deleteProfileImg, setDeleteProfileImg] = useState<boolean>(false);
  // 선택된 프로필 이미지 파일
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  // 선택된 이미지 미리보기 URL
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // 파일 input 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 프로필 데이터가 로드되면 상태 초기화
  useEffect(() => {
    if (profileData) {
      setNickname(profileData.nickname || '');
      setDescription(profileData.description || '');
    }
  }, [profileData]);

  // 프로필 사진 추가 버튼 클릭
  const handleAddProfilePhoto = () => {
    // 파일 선택 다이얼로그 열기
    fileInputRef.current?.click();
  };

  // 파일 선택 시
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이미지 파일인지 확인
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 선택할 수 있습니다.');
        return;
      }
      // 선택된 파일 저장
      setSelectedImage(file);
      // deleteProfileImg를 false로 설정 (새 이미지 추가)
      setDeleteProfileImg(false);
      // 미리보기 URL 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 프로필 사진 제거 누르면
  const handleRemoveProfilePhoto = () => {
    // deleteProfileImg를 true로 설정
    setDeleteProfileImg(true);
    // 선택된 이미지 및 미리보기 초기화
    setSelectedImage(null);
    setPreviewImage(null);
    // 파일 input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 저장하기 버튼 누르면
  const handleSave = async () => {
    try {
      // 프로필 수정 요청 데이터 생성
      const editData: EditProfileRequest = {
        nickname: nickname,
        description: description,
        deleteProfileImg: deleteProfileImg, // 프로필 사진 제거 여부
      };
      // 프로필 이미지 수정 요청 데이터 생성
      const profileImg: EditProfileImageRequest = {
        profileImg: selectedImage as File | null,
      };
      console.log(editData, profileImg);
      // 프로필 수정 API 호출
      await editMyProfile(editData, profileImg.profileImg as File | null);
      // 쿼리 캐시 무효화하여 프로필 데이터 다시 가져오기
      await invalidateProfile();
      alert('프로필이 수정되었습니다.');
      setDeleteProfileImg(false); // 제거 상태 초기화
      setSelectedImage(null); // 선택된 이미지 초기화
      setPreviewImage(null); // 미리보기 초기화
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
        {/* 숨겨진 파일 input */}
        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
        {/* 프로필 이미지 표시 */}
        {previewImage ? (
          <img className="w-28 h-28 rounded-full object-cover" src={previewImage} alt="프로필 미리보기" />
        ) : profileData?.profileImg && !deleteProfileImg ? (
          <img className="w-28 h-28 rounded-full object-cover" src={`${IMAGE_BASE_URL}${profileData.profileImg}`} alt="프로필" />
        ) : (
          <BsPersonCircle className="w-28 h-28 text-aqua-300" />
        )}
        <div className="flex justify-center items-center gap-2">
          <p className="text-aqua-300 p2 cursor-pointer" onClick={handleAddProfilePhoto}>
            추가
          </p>
          {(previewImage || (profileData?.profileImg && !deleteProfileImg)) && (
            <p className="text-aqua-300 p2 cursor-pointer" onClick={handleRemoveProfilePhoto}>
              제거
            </p>
          )}
        </div>
      </div>
      {/* 개인 정보 영역 */}
      <div className="flex flex-col gap-6">
        <p className="text-aqua-500 h4-b">개인 정보</p>
        <div className="flex flex-col gap-2">
          <Label>닉네임</Label>
          <Input type="text" placeholder="닉네임" className="w-full h-11" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>자기소개</Label>
          <Textarea className="h-32" placeholder="자기소개" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <Button size="lg" shape="pillSolid" tone="aqua" className="w-full h-11 mb-6" onClick={handleSave}>
          <span className="text-white p1-b">저장하기</span>
        </Button>
      </div>
    </>
  );
}
