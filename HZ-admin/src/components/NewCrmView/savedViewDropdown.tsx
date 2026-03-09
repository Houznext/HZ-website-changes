import React, { useState } from "react";
import { FaSave, FaEye, FaTrash } from "react-icons/fa";
import Button from "@/src/common/Button";
import { SavedView } from "./types";
import CustomInput from "@/src/common/FormElements/CustomInput";

interface SavedViewsDropdownProps {
  savedViews: SavedView[];
  onSave: (name: string) => void;
  onApply: (view: SavedView) => void;
  onDelete: (id: string) => void;
  isSaveViewOpen: boolean;
  setIsSaveViewOpen: (open: boolean) => void;
}

export default function SavedViewsDropdown({
  savedViews,
  onSave,
  onApply,
  onDelete,
  isSaveViewOpen,
  setIsSaveViewOpen,
}: SavedViewsDropdownProps) {
  const [saveViewName, setSaveViewName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  const handleSave = () => {
    if (!saveViewName.trim()) {
      return;
    }
    onSave(saveViewName);
    setSaveViewName("");
    setShowNameInput(false);
  };

  return (
    <div className="relative w-full">
      <Button
        onClick={() => setIsSaveViewOpen(!isSaveViewOpen)}
        className="flex items-center text-gray-600 gap-2 bg-white border font-medium border-gray-300 md:text-[12px] text-[10px] text-nowrap md:py-[6px] py-[4px] md:px-4 px-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <FaEye />
        Saved Views
      </Button>

      {isSaveViewOpen && (
        <>
          <div
            className="fixed inset-0 z-40 max-w-full w-full"
            onClick={() => {
              setIsSaveViewOpen(false);
              setShowNameInput(false);
            }}
          />
          <div className="absolute top-full right-0 w-[500px] md:max-w-[220px] max-w-[280px] mt-2 bg-white border border-gray-200 shadow-2xl rounded-lg z-50 overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <h3 className="text-[14px] font-bold text-gray-800">
                Saved Filter Views
              </h3>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Save and quickly apply filter combinations
              </p>
            </div>

            {/* Save New View */}
            <div className="p-3 border-b border-gray-200 bg-blue-50">
              {!showNameInput ? (
                <Button
                  onClick={() => setShowNameInput(true)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md md:text-[12px] text-[10px] font-medium hover:bg-blue-700 transition-colors"
                >
                  <FaSave />
                  Save Current View
                </Button>
              ) : (
                <div className="space-y-2">
                  <CustomInput
                    type="text"
                    placeholder="Enter view name..."
                    value={saveViewName}
                    onChange={(e) => setSaveViewName(e.target.value)}
                    className="w-full px-2 py-0 border border-gray-300 rounded-md text-[12px]"
                    autoFocus
                    name={""}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={!saveViewName.trim()}
                      className="flex-1 bg-blue-600 text-white px-2 py-1.5 rounded-md text-[11px] font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setShowNameInput(false);
                        setSaveViewName("");
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 px-2 py-1.5 rounded-md text-[11px] font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Views List */}
            <div className="max-h-64 overflow-y-auto">
              {savedViews.length === 0 ? (
                <div className="p-6 text-center">
                  <FaEye className="text-gray-300 text-[32px] mx-auto mb-2" />
                  <p className="text-[12px] text-gray-500 font-medium">
                    No saved views yet
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Save your favorite filter combinations
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {savedViews.map((view) => (
                    <div
                      key={view.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group"
                    >
                      <Button
                        className="flex-1 text-left text-[12px] font-medium text-gray-700 hover:text-blue-600 transition-colors truncate"
                        onClick={() => {
                          onApply(view);
                          setIsSaveViewOpen(false);
                          setShowNameInput(false);
                        }}
                        title={view.name}
                      >
                        <div className="flex items-center gap-2">
                          <FaEye className="text-gray-400 group-hover:text-[#3586FF]  transition-colors flex-shrink-0" />
                          <span className="truncate">{view.name}</span>
                        </div>
                      </Button>
                      <Button
                        className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(view.id);
                        }}
                        title="Delete view"
                      >
                        <FaTrash className="text-[11px]" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Info */}
            {savedViews.length > 0 && (
              <div className="p-2 border-t border-gray-200 bg-gray-50">
                <p className="text-[10px] text-gray-500 text-center font-medium">
                  {savedViews.length} saved view
                  {savedViews.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
