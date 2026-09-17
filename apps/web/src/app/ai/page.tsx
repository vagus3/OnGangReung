import { AiCoursePage } from "@/views/ai";

// 생성 결과가 요청마다 달라 서버에서 미리 그릴 것이 없다.
export const dynamic = "force-dynamic";

export default function Page() {
  return <AiCoursePage />;
}
