import BackHeader from '@/components/headers/BackHeader';
import Header from '@/components/headers/Header';
import { Input } from '@/components/ui/input';
import { FieldSet, FieldLabel, FieldGroup, Field, FieldContent, FieldDescription, FieldError } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
export default function Feed() {
  return (
    <div>
      <BackHeader title="피드" />
      <Header title="동물관리" />
      <Header title="검색" />
      <Header title="내 공간" />

      <Input type="search" placeholder="사용자 혹은 장소 검색" className="w-full mb-2" />

      <FieldGroup>
        <Field orientation="responsive">
          <FieldLabel>상세 요청사항</FieldLabel>
          <FieldContent>
            <Textarea placeholder="추가 요청사항이나 특이사항을 입력하세요" className="w-full" />
            <FieldDescription> 0/500</FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>

      <Input type="date" placeholder="날짜 선택" className="w-full mb-2" />
    </div>
  );
}
