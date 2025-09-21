"use client";
import UploadForm from "../src/components/UploadForm";

export default function Ingest() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Documents</h1>
      <UploadForm />
    </main>
  );
}
