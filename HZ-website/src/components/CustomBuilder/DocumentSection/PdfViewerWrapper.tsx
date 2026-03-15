import React from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const WORKER_URL = "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

interface PdfViewerWrapperProps {
  fileUrl: string;
  defaultScale?: number;
  className?: string;
}

export default function PdfViewerWrapper({
  fileUrl,
  defaultScale = 0.9,
  className,
}: PdfViewerWrapperProps) {
  return (
    <Worker workerUrl={WORKER_URL}>
      <Viewer
        fileUrl={fileUrl}
        defaultScale={defaultScale}
        plugins={[]}
      />
    </Worker>
  );
}
