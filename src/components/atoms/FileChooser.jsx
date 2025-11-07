import React, { useRef, useState } from "react";
import { Upload, File, X } from "lucide-react";

const FileChooser = ({
  value,
  onChange,
  accept,
  multiple = false,
  disabled = false,
  label = "Seleccionar archivo",
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      if (onChange) {
        onChange(multiple ? fileArray : files[0]);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (indexToRemove) => {
    const newFiles = selectedFiles.filter(
      (_, index) => index !== indexToRemove
    );
    setSelectedFiles(newFiles);
    if (onChange) {
      onChange(multiple ? newFiles : null);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row justify-center gap-2">
      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
      />

      {/* Botón personalizado */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed
          transition-all duration-200 font-medium
          ${
            disabled
              ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
              : "bg-white text-primary border-primary hover:bg-primary hover:text-white cursor-pointer"
          }
        `}
      >
        <Upload className="w-5 h-5" />
        <span>{label}</span>
      </button>

      {/* Lista de archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div className=" space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 p-3 lg:max-w-60 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <File className="text-primary shrink-0 w-4 h-4" />
                <span className="text-sm text-gray-700 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500 shrink-0">
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileChooser;
