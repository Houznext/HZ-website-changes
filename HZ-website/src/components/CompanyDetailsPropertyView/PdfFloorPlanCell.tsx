import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfFloorPlanCellProps {
  file: string;
}

export default function PdfFloorPlanCell({ file }: PdfFloorPlanCellProps) {
  return (
    <Document file={file}>
      <Page
        pageNumber={1}
        width={300}
        renderAnnotationLayer={false}
        renderTextLayer={false}
      />
    </Document>
  );
}
