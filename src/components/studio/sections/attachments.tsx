"use client";

import * as React from "react";
import { Paperclip, Upload, Trash2, Loader2, Download, FileText } from "lucide-react";
import { fetchAttachments, uploadAttachment, deleteAttachment, getAttachmentUrl } from "@/lib/studio/queries";
import type { CourseAttachment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { StudioData } from "../builder-shell";

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentsSection({ data }: { data: StudioData }) {
  const { course } = data;
  const [files, setFiles] = React.useState<CourseAttachment[] | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const refresh = React.useCallback(async () => {
    setFiles(await fetchAttachments(course.id));
  }, [course.id]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(fileList)) {
        await uploadAttachment(course.id, file);
      }
      await refresh();
    } catch {
      setError("Upload failed — try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleOpen(a: CourseAttachment) {
    const url = await getAttachmentUrl(a.filePath);
    window.open(url, "_blank");
  }

  async function handleDelete(a: CourseAttachment) {
    if (!confirm(`Remove "${a.fileName}"?`)) return;
    await deleteAttachment(a);
    refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Paperclip className="size-4" /> Trainer Resources</CardTitle>
        <CardDescription>
          Reference documents for the trainer delivering this module — SOPs, menus, scripts, checklists. Visible
          only here in Module Studio, never shown to staff taking the course.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {uploading ? "Uploading…" : "Upload File"}
          </Button>
          {error && <p className="mt-2 text-xs text-rose">{error}</p>}
        </div>

        {files === null ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading files…
          </div>
        ) : files.length === 0 ? (
          <p className="rounded-[10px] border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            No files attached yet.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {files.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <button onClick={() => handleOpen(a)} className="flex min-w-0 items-center gap-2.5 text-left hover:text-brand">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.fileName}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(a.fileSize)}</p>
                  </div>
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleOpen(a)} title="Download">
                    <Download className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(a)} title="Remove">
                    <Trash2 className="size-4 text-rose" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
