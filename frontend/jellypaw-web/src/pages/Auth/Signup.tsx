// jellypaw-web/src/pages/Auth/Signup.tsx
import { useState } from 'react';
import Header from '@/components/headers/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Signup() {
  const [nickname, setNickname] = useState('');

  return (
    <main className="mx-auto w-full max-w-[375px] min-h-screen bg-gray-25">
      <Header title='추가 정보 입력'></Header>

      {/* 로고 섹션 */}
      <section className="flex items-center justify-center py-8">
        <img
          src="/logo-paw-95.png"
          alt="JellyPaw"
          className="w-[95px] h-[95px]"
        />
      </section>

      {/* 폼 */}
      <form
        className="flex flex-col gap-6 pb-8"
        onSubmit={(e) => e.preventDefault()}
        noValidate
      >
        {/* 이메일 (읽기 전용 표시) */}
        <div className="flex flex-col gap-2">
          <label className="p2-b text-aqua-900">이메일</label>
          <Input
            type="text"
            readOnly
            value="카카오톡 이메일 기본값"
            className=""
          />
          <p className="p3 text-gray-300">
            카카오에서 제공된 이메일이에요. 수정은 카카오 계정에서 가능합니다.
          </p>
        </div>

        {/* 닉네임 */}
        <div className="flex flex-col gap-2">
          <label className="p2-b text-gray-700">닉네임</label>
          <Input
            type="text"
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
          />
        </div>

        <div className="pt-2">
          <Button
            type="button"
            tone="aqua"
            shape="pillSolid"
            size="default"
            onClick={() => void 0}
            state={nickname.trim() ? 'enabled' : 'disabled'}
            disabled={!nickname.trim()}
          >
            회원 가입
          </Button>
        </div>

     
      </form>
    </main>
  );
}
