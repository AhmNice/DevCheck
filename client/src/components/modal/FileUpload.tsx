import React, { useState, useCallback } from "react";
import { X, Upload, File, CheckCircle, AlertCircle, Trash2, Image, FileText, FileCode, FileArchive } from "lucide-react";

interface FileUploadProps {
  onClose: () => void;
  onFileUpload: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
}

interface FileWithPreview extends File {
  preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onClose,
  onFileUpload,
  acceptedFileTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain"],
  maxFileSize = 5 * 1024 * 1024,
  maxFiles = 5
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = useCallback((file: File): { isValid: boolean; error: string } => {
    if (!acceptedFileTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Please upload ${acceptedFileTypes.map(type => type.split("/")[1].toUpperCase()).join(", ")} files.`
      };
    }

    if (file.size > maxFileSize) {
      return {
        isValid: false,
        error: `${file.name} is too large. Maximum size is ${(maxFileSize / (1024 * 1024)).toFixed(2)}MB.`
      };
    }

    return { isValid: true, error: "" };
  }, [acceptedFileTypes, maxFileSize]);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const remainingSlots = maxFiles - selectedFiles.length;

    if (fileArray.length > remainingSlots) {
      setErrors([`You can only upload ${maxFiles} files at once. You have ${selectedFiles.length} file(s) already selected.`]);
      return;
    }

    const validFiles: FileWithPreview[] = [];
    const newErrors: string[] = [];

    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        if (file.type.startsWith("image/")) {
          const preview = URL.createObjectURL(file);
          validFiles.push({ ...file, preview });
        } else {
          validFiles.push(file);
        }
      } else {
        newErrors.push(validation.error);
      }
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
    } else {
      setErrors([]);
    }
  }, [selectedFiles.length, maxFiles, validateFile]);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
  }, [addFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
  };

  const removeFile = (index: number): void => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = (): void => {
    if (selectedFiles.length > 0) {
      onFileUpload(selectedFiles);
      onClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getAcceptAttribute = (): string => {
    return acceptedFileTypes.join(",");
  };

  // Fixed: Use conditional rendering instead of dynamic classes
  const getFileIcon = (fileType: string, filePreview?: string) => {
    if (filePreview) {
      return null; // Will render image preview instead
    }
    if (fileType.startsWith("image/")) return <Image size={16} className="text-blue-600" />;
    if (fileType === "application/pdf") return <FileText size={16} className="text-red-600" />;
    if (fileType.startsWith("text/")) return <FileCode size={16} className="text-gray-600" />;
    return <FileArchive size={16} className="text-purple-600" />;
  };

  // Fixed: Use predefined color classes
  const getFileBgColor = (fileType: string, hasPreview: boolean) => {
    if (hasPreview) return "";
    if (fileType.startsWith("image/")) return "bg-blue-100";
    if (fileType === "application/pdf") return "bg-red-100";
    if (fileType.startsWith("text/")) return "bg-gray-100";
    return "bg-purple-100";
  };

  React.useEffect(() => {
    return () => {
      selectedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [selectedFiles]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 border border-gray-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-gray-900 text-base font-semibold flex items-center gap-2">
            <Upload size={16} className="text-primary" />
            Upload Files ({selectedFiles.length}/{maxFiles})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-primary/50 bg-gray-50/30"
            } ${selectedFiles.length >= maxFiles ? "opacity-50 cursor-not-allowed" : ""}`}
            onDragEnter={selectedFiles.length < maxFiles ? handleDrag : undefined}
            onDragLeave={selectedFiles.length < maxFiles ? handleDrag : undefined}
            onDragOver={selectedFiles.length < maxFiles ? handleDrag : undefined}
            onDrop={selectedFiles.length < maxFiles ? handleDrop : undefined}
          >
            <input
              type="file"
              id="file-input"
              className="hidden"
              onChange={handleFileChange}
              accept={getAcceptAttribute()}
              multiple
              disabled={selectedFiles.length >= maxFiles}
            />

            <label
              htmlFor="file-input"
              className={`cursor-pointer flex flex-col items-center ${selectedFiles.length >= maxFiles ? "cursor-not-allowed" : ""}`}
            >
              <div className={`size-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                dragActive ? "bg-primary/15" : "bg-gray-100"
              }`}>
                <Upload size={20} className={dragActive ? "text-primary" : "text-gray-400"} />
              </div>

              <p className="text-gray-700 text-sm font-medium mb-1">
                {selectedFiles.length >= maxFiles
                  ? `Maximum ${maxFiles} files reached`
                  : "Drag & drop files here, or click to select"}
              </p>
              <p className="text-xs text-gray-500">
                {acceptedFileTypes.map(type => type.split("/")[1].toUpperCase()).join(", ")} •
                Max {formatFileSize(maxFileSize)} each • Up to {maxFiles} files
              </p>
            </label>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mt-3 space-y-2">
              {errors.map((error, idx) => (
                <div key={idx} className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* File List */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Selected Files ({selectedFiles.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedFiles.map((file, index) => {
                  const hasPreview = !!file.preview;
                  const bgColorClass = getFileBgColor(file.type, hasPreview);

                  return (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-2 p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      {/* File Icon / Preview */}
                      {hasPreview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="size-10 rounded object-cover"
                        />
                      ) : (
                        <div className={`size-10 rounded ${bgColorClass} flex items-center justify-center flex-shrink-0`}>
                          {getFileIcon(file.type, file.preview)}
                        </div>
                      )}

                      {/* File Info */}
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFile(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg text-red-600"
                        aria-label="Remove file"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Success Summary */}
          {selectedFiles.length > 0 && !errors.length && (
            <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle size={16} />
              <span>
                Ready to upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} ({formatFileSize(selectedFiles.reduce((acc, f) => acc + f.size, 0))} total)
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-gray-700 bg-gray-100 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || errors.length > 0}
            className={`px-4 py-1.5 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              selectedFiles.length > 0 && errors.length === 0
                ? "bg-primary hover:bg-primary/90"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <Upload size={12} />
            Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;