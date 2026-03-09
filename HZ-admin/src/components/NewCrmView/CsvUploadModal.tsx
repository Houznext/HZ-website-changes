import React from "react";
import Modal from "@/src/common/Modal";
import Button from "@/src/common/Button";
import { FaFileCsv, FaUpload } from "react-icons/fa";
import Loader from "@/src/common/Loader";

interface CSVUploadModalProps {
  open: boolean;
  onClose: () => void;
  selectedFile: File | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isLoading: boolean;
}

export default function CSVUploadModal({
  open,
  onClose,
  selectedFile,
  onFileSelect,
  onUpload,
  fileInputRef,
  isLoading,
}: CSVUploadModalProps) {
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={open}
      closeModal={handleClose}
      isCloseRequired={!isLoading}
      className="md:max-w-[500px] max-w-[340px] bg-white rounded-xl shadow-lg"
      rootCls="z-[99999]"
    >
      {isLoading ? (
        <div className="p-8">
          <Loader />
          <p className="text-center mt-4 font-medium text-gray-600">
            Uploading leads...
          </p>
        </div>
      ) : (
        <div className="relative flex flex-col items-center w-full p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaFileCsv className="text-blue-600 text-[24px]" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-gray-800">
                Upload CSV File
              </h3>
              <p className="text-[12px] text-gray-600 font-medium">
                Import leads in bulk
              </p>
            </div>
          </div>

          {/* CSV Format Info */}
          <div className="w-full mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-[12px] font-bold text-blue-900 mb-2">
              Required CSV Columns:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-blue-800">
              <div>• Fullname (required)</div>
              <div>• Phonenumber (required)</div>
              <div>• email</div>
              <div>• city (required)</div>
              <div>• state (required)</div>
              <div>• propertytype</div>
              <div>• bhk</div>
              <div>• platform</div>
              <div>• serviceType</div>
              <div>• leadstatus</div>
            </div>
          </div>

          {/* File Input Area */}
          <div className="w-full mb-6">
            <input
              type="file"
              accept=".csv"
              onChange={onFileSelect}
              ref={fileInputRef}
              className="hidden"
              id="csv-file-input"
            />
            <label
              htmlFor="csv-file-input"
              className="w-full cursor-pointer block"
            >
              <div className="w-full px-6 py-8 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg text-center transition-colors bg-gray-50 hover:bg-blue-50">
                <FaUpload className="mx-auto text-gray-400 text-[32px] mb-3" />
                {selectedFile ? (
                  <div>
                    <p className="text-[14px] font-bold text-gray-800 mb-1">
                      {selectedFile.name}
                    </p>
                    <p className="text-[12px] text-gray-600 font-medium">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                    <p className="text-[11px] text-blue-600 font-medium mt-2">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-[14px] font-bold text-gray-700 mb-1">
                      Choose CSV file or drag here
                    </p>
                    <p className="text-[12px] text-gray-500 font-medium">
                      Maximum file size: 5MB
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Sample CSV Download */}
          <div className="w-full mb-6">
            <a
              href="data:text/csv;charset=utf-8,Fullname,Phonenumber,email,city,state,propertytype,bhk,platform,serviceType,leadstatus%0AJohn Doe,9876543210,john@example.com,Hyderabad,Telangana,Flat,3,Walkin,RealEstate,New%0AJane Smith,8765432109,jane@example.com,Bangalore,Karnataka,Villa,4,Facebook,Interiors,Contacted"
              download="sample_leads.csv"
              className="block w-full text-center py-2 text-[12px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              📥 Download Sample CSV Template
            </a>
          </div>

          {/* Important Notes */}
          <div className="w-full mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-[11px] font-bold text-yellow-900 mb-1">
              ⚠️ Important Notes:
            </p>
            <ul className="text-[10px] font-medium text-yellow-800 space-y-1">
              <li>• Phone numbers must be 10 digits starting with 6-9</li>
              <li>• Duplicate entries will be skipped</li>
              <li>• Invalid rows will be ignored</li>
              <li>• All leads will be assigned to your active branch</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex gap-3">
            <Button
              onClick={handleClose}
              className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={onUpload}
              disabled={!selectedFile}
              className={`flex-1 py-3 px-4 rounded-lg text-[14px] font-medium transition-colors flex items-center justify-center gap-2 ${
                selectedFile
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <FaUpload />
              Upload Leads
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}