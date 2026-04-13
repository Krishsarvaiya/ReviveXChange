import { useRef, useState } from "react";

function PhotoUploader({ onFilesChange }) {
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  const addFiles = (list) => {
    const selected = Array.from(list || []).slice(0, 6);
    setFiles(selected);
    onFilesChange?.(selected);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  };

  return (
    <div className="uploader-wrap">
      <div
        className="upload-box"
        role="button"
        tabIndex={0}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter") inputRef.current?.click();
        }}
      >
        <p>Drag & drop product photos here</p>
        <small>or click to upload (up to 6 images)</small>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => addFiles(event.target.files)}
      />
      {files.length > 0 && (
        <ul className="upload-list">
          {files.map((file) => (
            <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PhotoUploader;
