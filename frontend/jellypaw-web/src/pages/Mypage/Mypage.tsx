import  Button  from "@/components/ui/button";
import Badge  from "@/components/ui/badge";
import IconText from "@/components/texts/IconText";
import { FaStar } from "react-icons/fa6";

export default function Mypage() {
  return (
  <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-aqua-500">Mypage</h2>
      <Button tone="default">default</Button>
      <Button tone="default" shape="pillSolid">버튼</Button>
      <Button tone="lightAqua">버튼</Button>
      <Button tone="lightAqua" shape="pillOutline">버튼</Button>
      <Button tone="white" shape="outline" borderTone="gray">버튼</Button>
      <Button size="sm" shape="pillSolid">팔로우</Button>
      <Button size="lg" shape="solid">팔로우</Button>
      <Button tone="aqua" state="disabled" shape="pillSolid">비활성화</Button>
      <Badge >25.10.30</Badge>
      <Badge variant="pink">
        <FaStar className="text-pink-300 me-0.5"></FaStar> 5.0
        </Badge>
<IconText icon={FaStar} iconTone="gray300" label="기본 정보" textStyle="h6-b" textTone="aqua300"/>
<IconText icon={FaStar} label="계정" size="md" textStyle="h6" />

    </div>
    )
}
