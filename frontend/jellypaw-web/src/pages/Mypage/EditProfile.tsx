import BackHeader from '@/components/headers/BackHeader';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
export default function EditProfile() {
  return (
    <>
      <BackHeader title="프로필 편집" />
      {/* 프로필 영역 */}
      <div className="w-full py-8 inline-flex flex-col justify-start items-center gap-4">
        <img className="w-28 h-28 rounded-full" src="/src/assets/pets/반려동물1.png" />
        <p className="text-aqua-300 p2">프로필 사진 제거</p>
      </div>
      {/* 개인 정보 영역 */}
      <div className="flex flex-col gap-6">
        <p className="text-aqua-500 h4-b">개인 정보</p>
        <div className="flex flex-col gap-2">
          <Label>닉네임</Label>
          <Input type="text" placeholder="닉네임" className="w-full h-11" value="멍멍이엄마" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>자기소개</Label>
          <Textarea placeholder="자기소개" value="초코와 함께하는 일상을 기록하고 있어요" />
        </div>
        <Button size="lg" shape="pillSolid" tone="aqua" className="w-full h-11">
          <span className="text-white p1-b">저장하기</span>
        </Button>
      </div>
    </>
  );
}
