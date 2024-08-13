"use client";

import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrashIcon, FileSpreadsheetIcon } from "lucide-react";
import { useCallback, useState } from "react";
import {
  Accept,
  DropEvent,
  DropzoneOptions,
  FileRejection,
  useDropzone,
} from "react-dropzone";
import { toast } from "react-toastify";

function EditableFileName({
  file,
  saveName,
}: {
  file: File;
  saveName: (oldName: string, newName: string) => void;
}) {
  const [name, setName] = useState(file.name);

  return (
    <Input
      type="text"
      className="bg-transparent font-mono rounded-sm border-none w-full h-auto px-2 py-1"
      value={name}
      onChange={(e) => setName(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onBlur={() => saveName(file.name, name)}
    />
  );
}

function DroppedFile({
  file,
  removeFile,
  renameFile,
}: {
  file: File;
  removeFile: (file: File) => void;
  renameFile: (oldName: string, newName: string) => void;
}) {
  const handleRemove = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    removeFile(file);
  };

  return (
    <div className="flex justify-center items-center gap-2 w-full py-2">
      <FileSpreadsheetIcon size={20} color="green" />
      <EditableFileName file={file} saveName={renameFile} />
      <Button
        onClick={handleRemove}
        className="hover:text-red-500 hover:bg-transparent h-auto w-auto px-2 py-2"
        aria-label="Remove file"
        variant="ghost"
      >
        <TrashIcon className="h-4 w-4 p-0" />
      </Button>
    </div>
  );
}

type UploadStatusType = { [key: string]: boolean };

function Dropzone() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], _: FileRejection[], __: DropEvent) => {
      setFiles(acceptedFiles);
    },
    [],
  );

  const removeFile = useCallback(
    (file: File) => {
      setFiles(files.filter((f) => f !== file));
    },
    [files],
  );

  const renameFile = useCallback(
    (oldName: string, newName: string) => {
      const newFiles = files.map((file) => {
        if (file.name === oldName) {
          return new File([file], newName, { type: file.type });
        } else {
          return file;
        }
      });
      setFiles(newFiles);
    },
    [files],
  );

  const uploadFiles = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.stopPropagation();

      const uploadStatus: UploadStatusType = {};
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
        uploadStatus[file.name] = false;
      });

      setLoading(true);
      fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      }).then((res) => {
        if (res.ok) {
          setLoading(false);
          toast.success("Upload complete");
          setFiles([]);
        } else {
          res.text().then((text) => {
            toast.error(`Upload failed: ${text}`);
            setLoading(false);
          });
        }
      });
    },
    [files],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"],
    } as Accept,
  } as DropzoneOptions);

  if (loading) {
    return <Spinner msg="Uploading files..." />;
  }

  return (
    <div
      {...getRootProps()}
      className="w-3/5 h-4/5 border-2 border-dashed rounded-sm flex flex-col justify-center items-center"
    >
      <input
        {...(getInputProps() as React.InputHTMLAttributes<HTMLInputElement>)}
      />
      <div className="w-full h-full flex flex-col justify-center items-center">
        {files.length === 0 && (
          <div className="flex flex-col justify-center items-center gap-2 px-5">
            <p className="text-center">
              Drag and drop some files here, or click to select files
            </p>
            <p className="text-center">Only *.csv files will be accepted</p>
          </div>
        )}
        {files.length > 0 && (
          <div className="p-5 flex flex-col justify-between h-full w-full">
            <div className="flex flex-col w-full h-full overflow-y-auto divide-y">
              {files.map((file) => {
                return (
                  <DroppedFile
                    key={file.name}
                    file={file}
                    removeFile={removeFile}
                    renameFile={renameFile}
                  />
                );
              })}
            </div>
            <Button onClick={uploadFiles} className="mt-5">
              Upload
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dropzone;
