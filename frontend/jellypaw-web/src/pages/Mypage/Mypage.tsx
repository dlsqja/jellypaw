import { Button } from '@/components/ui/button';

export default function Mypage() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-aqua-500">Mypage</h2>
      <Button tone="default">default</Button>
      <Button tone="default" shape="pillSolid">
        버튼
      </Button>
      <Button tone="lightAqua">버튼</Button>
      <Button tone="lightAqua" shape="pillOutline">
        버튼
      </Button>
      <Button tone="white" shape="outline" borderTone="gray">
        버튼
      </Button>
      <Button size="sm" shape="pillSolid">
        팔로우
      </Button>
      <Button size="lg" shape="solid">
        팔로우
      </Button>
      <Button tone="aqua" state="disabled" shape="pillSolid">
        비활성화
      </Button>
    </div>
  );
}
