import BackHeader from '@/components/headers/BackHeader';
import Header from '@/components/headers/Header';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldContent } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Feed() {
  return (
    <div>
      <BackHeader title="피드" />
      <Header title="동물관리" />

      <Input type="search" placeholder="사용자 혹은 장소 검색" className="w-full mb-2" />

      <FieldGroup>
        <Field orientation="responsive">
          <FieldLabel>상세 요청사항</FieldLabel>
          <FieldContent>
            <Textarea placeholder="추가 요청사항이나 특이사항을 입력하세요" />
            <FieldDescription> 0/500</FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="날짜 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="2024">오늘</SelectItem>
          <SelectItem value="2025">내일</SelectItem>
          <SelectItem value="2026">모레</SelectItem>
        </SelectContent>
      </Select>

      {/* <div className="grid grid-cols-3 gap-4">
        <Field>
          <FieldLabel htmlFor="checkout-exp-month-ts6">Month</FieldLabel>
          <Select defaultValue="">
            <SelectTrigger id="checkout-exp-month-ts6">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="01">01</SelectItem>
              <SelectItem value="02">02</SelectItem>
              <SelectItem value="03">03</SelectItem>
              <SelectItem value="04">04</SelectItem>
              <SelectItem value="05">05</SelectItem>
              <SelectItem value="06">06</SelectItem>
              <SelectItem value="07">07</SelectItem>
              <SelectItem value="08">08</SelectItem>
              <SelectItem value="09">09</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="11">11</SelectItem>
              <SelectItem value="12">12</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="checkout-7j9-exp-year-f59">Year</FieldLabel>
          <Select defaultValue="">
            <SelectTrigger id="checkout-7j9-exp-year-f59">
              <SelectValue placeholder="YYYY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2027">2027</SelectItem>
              <SelectItem value="2028">2028</SelectItem>
              <SelectItem value="2029">2029</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div> */}
    </div>
  );
}
