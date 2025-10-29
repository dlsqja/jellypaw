import BackHeader from '@/components/headers/BackHeader';
import Header from '@/components/headers/Header';
import { Input } from '@/components/ui/input';
export default function Feed() {
  return (
    <div>
      <BackHeader title="피드" />
      <Header title="동물관리" />
      <Header title="검색" />
      <Header title="내 공간" />

      <Input type="search" placeholder="검색어 입력" />
      <Input type="text" placeholder="텍스트" />
      <Input type="email" placeholder="이메일" />
      <Input type="password" placeholder="비밀번호" />
      <Input type="number" placeholder="숫자" />
      <Input type="tel" placeholder="전화번호" />
      <Input type="url" placeholder="URL" />
    </div>
  );
}
