import { MyPage } from "@/views/my";

// 저장·스탬프가 브라우저 보관이라 서버에서 미리 그릴 것이 없다.
export const dynamic = "force-dynamic";

export default function Page() {
  return <MyPage />;
}
