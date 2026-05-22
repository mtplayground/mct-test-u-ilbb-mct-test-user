import { forwardRef, useImperativeHandle, useState } from "react";

import { cn } from "@/lib/utils";

export type PreviewFrameHandle = {
  refresh: () => void;
};

export type PreviewFrameProps = {
  srcDoc: string;
  title?: string;
  className?: string;
};

export const PreviewFrame = forwardRef<PreviewFrameHandle, PreviewFrameProps>(
  ({ srcDoc, title = "Preview", className }, ref) => {
    const [refreshKey, setRefreshKey] = useState(0);

    useImperativeHandle(
      ref,
      () => ({
        refresh: () => setRefreshKey((current) => current + 1),
      }),
      [],
    );

    return (
      <iframe
        key={refreshKey}
        title={title}
        sandbox="allow-scripts"
        srcDoc={srcDoc}
        className={cn("h-full w-full border-0 bg-white", className)}
      />
    );
  },
);
PreviewFrame.displayName = "PreviewFrame";
