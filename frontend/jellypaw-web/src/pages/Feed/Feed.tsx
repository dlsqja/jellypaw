import BackHeader from '@/components/headers/BackHeader';
import Header from '@/components/headers/Header';

export default function Feed() {
  return (
    <div>
      <BackHeader title="피드" />
      <Header title="동물관리" />
      <Header title="검색" />
      <Header title="내 공간" />
    </div>
  );
}
