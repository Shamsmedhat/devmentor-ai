import PdfUploadForm from "@/components/features/upload/pdf-upload-form";
import UrlIngestionForm from "@/components/features/upload/url-ingestion-form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function UploadPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6 text-amber-100">
      <h1 className="text-2xl font-bold">Upload</h1>

      <Tabs defaultValue="pdf">
        <TabsList>
          <TabsTrigger value="pdf">PDF</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>

        <TabsContent value="pdf" className="mt-4">
          <PdfUploadForm />
        </TabsContent>

        <TabsContent value="url" className="mt-4">
          <UrlIngestionForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
