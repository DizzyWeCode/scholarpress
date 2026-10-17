import { ResearchOutputEditor } from "@/components/research-output-editor";

export const dynamic = "force-dynamic";

export default function EditResearchOutputPage({ params }: { params: { id: string } }) {
  return <ResearchOutputEditor paperId={params.id} />;
}
