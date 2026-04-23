import { useState, useCallback } from "react";
import DashboardLayout from "../Layout/DashboardLayout";
import {
  Upload,
  FileJson,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Download,
} from "lucide-react";
import { useTaskStore } from "../store/taskStore";
import { useAuthStore } from "../store/authstore";
import type { Task } from "../interface/task";

const Import = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const { uploadJsonTaskFile } = useTaskStore();
  const { user } = useAuthStore();

  const validateJSON = (
    jsonData: any,
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!Array.isArray(jsonData)) {
      errors.push("File must contain an array of tasks");
      return { isValid: false, errors };
    }

    if (jsonData.length === 0) {
      errors.push("File contains no tasks");
      return { isValid: false, errors };
    }

    // Validate each task has required fields
    jsonData.forEach((task, index) => {
      if (!task.title) {
        errors.push(`Task ${index + 1}: Missing title`);
      }
      if (!task.status) {
        errors.push(`Task ${index + 1}: Missing status`);
      }
      if (!task.priority) {
        errors.push(`Task ${index + 1}: Missing priority`);
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/json") {
      processFile(file);
    } else {
      setUploadStatus({
        type: "error",
        message: "Please upload a valid JSON file",
      });
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/json") {
      processFile(file);
    } else if (file) {
      setUploadStatus({
        type: "error",
        message: "Please upload a valid JSON file",
      });
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setUploadStatus({ type: null, message: "" });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const validation = validateJSON(jsonData);

        if (validation.isValid) {
          setPreview({
            data: jsonData,
            count: jsonData.length,
          });
          setUploadStatus({
            type: "success",
            message: `Successfully loaded ${jsonData.length} task${jsonData.length !== 1 ? "s" : ""}`,
          });
        } else {
          setPreview(null);
          setUploadStatus({
            type: "error",
            message: `Validation failed: ${validation.errors[0]}`,
          });
        }
      } catch (error) {
        setPreview(null);
        setUploadStatus({
          type: "error",
          message: "Invalid JSON format. Please check your file structure.",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!preview?.data || !user?._id) return;

    setIsUploading(true);
    setUploadStatus({ type: null, message: "" });

    const res = await uploadJsonTaskFile(selectedFile as File);
    if (res.success) {
      setSelectedFile(null);
      setPreview(null);
    } else {
      console.error("Import errors:", res.error);
    }

    setIsUploading(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadStatus({ type: null, message: "" });
  };

  const downloadTemplate = () => {
    const template = [
      {
        title: "",
        description: "",
        due_date: "",
        status: "PLANNED",
        priority: "MEDIUM",
        tags: [],
        attachments: [],
        subtasks: [
          {
            title: "",
            description: "",
            due_date: "",
            status: "PLANNED",
          },
        ],
        metadata: {
          source: "",
          import_id: null,
        },
      },
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks-template.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Import Tasks
          </h1>
          <p className="text-sm text-gray-500">
            Import tasks from a JSON file. Download the template to see the
            expected format.
          </p>
        </div>

        {/* Download Template Button */}
        <div className="mb-6">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 bg-blue-50 rounded-lg transition-colors"
          >
            <Download size={16} />
            Download JSON Template
          </button>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50/30"
          } ${selectedFile ? "bg-green-50/30" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-input"
            className="hidden"
            onChange={handleFileSelect}
            accept=".json,application/json"
          />

          <label
            htmlFor="file-input"
            className="cursor-pointer flex flex-col items-center"
          >
            <div className="size-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Upload size={24} className="text-gray-400" />
            </div>

            <p className="text-gray-700 text-sm font-medium mb-1">
              {selectedFile
                ? selectedFile.name
                : "Drag & drop your JSON file here, or click to select"}
            </p>
            <p className="text-xs text-gray-500">
              Only JSON files are accepted
            </p>
          </label>
        </div>

        {/* File Preview */}
        {selectedFile && preview && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <FileJson size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({(selectedFile.size / 1024).toFixed(2)} KB)
                </span>
              </div>
              <button
                onClick={removeFile}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-sm font-medium text-gray-900">
                    Ready to import {preview.count} task
                    {preview.count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(preview.data.slice(0, 2), null, 2)}
                    {preview.count > 2 && "\n\n... and more"}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Message */}
        {uploadStatus.type && (
          <div
            className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
              uploadStatus.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {uploadStatus.type === "success" ? (
              <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            )}
            <span className="text-sm">{uploadStatus.message}</span>
          </div>
        )}

        {/* Import Button */}
        {selectedFile && preview && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={removeFile}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={isUploading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Import {preview.count} Task{preview.count !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            JSON Format Instructions:
          </h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• File must contain an array of tasks</li>
            <li>
              • Required fields:{" "}
              <code className="bg-blue-100 px-1 rounded">title</code>,{" "}
              <code className="bg-blue-100 px-1 rounded">status</code>,{" "}
              <code className="bg-blue-100 px-1 rounded">priority</code>
            </li>
            <li>
              • Optional fields:{" "}
              <code className="bg-blue-100 px-1 rounded">description</code>,{" "}
              <code className="bg-blue-100 px-1 rounded">due_date</code>,{" "}
              <code className="bg-blue-100 px-1 rounded">tags</code>,{" "}
              <code className="bg-blue-100 px-1 rounded">attachments</code>,{" "}
              <code className="bg-blue-100 px-1 rounded">subtasks</code>,{" "}
              <code className="bg-blue-100 px-1 rounded">metadata</code>
            </li>
            <li>
              • Status options: BACKLOG, PLANNED, IN_PROGRESS, IN_REVIEW,
              SHIPPED, BLOCKED
            </li>
            <li>• Priority options: LOW, MEDIUM, HIGH</li>
            <li>
              • Download the template for an example structure with empty values
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Import;
