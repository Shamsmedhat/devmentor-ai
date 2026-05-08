"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputGroup } from "@/components/ui/input-group";
import { processPdfFileAction } from "@/lib/actions/documents.action";
import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    setSuccess(false);
    if (!file) {
      setError("No file selected");
      setIsLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    const response: { success: boolean; message?: string; error?: string } =
      await processPdfFileAction(formData);
    if (response.success) {
      setSuccess(true);
      setMessage(response.message ?? null);
    } else {
      setError(response.error ?? null);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-amber-100">
      <h1 className="text-2xl font-bold text-amber-100">Upload</h1>
      <InputGroup>
        <Input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-amber-100 text-  hover:bg-amber-200"
        >
          Upload
        </Button>
      </InputGroup>
      {isLoading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {message && <p>{message}</p>}
      {success && <p>Success</p>}
    </div>
  );
}
