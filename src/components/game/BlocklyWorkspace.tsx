"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { BlocklyWorkspaceInnerProps } from "./BlocklyWorkspaceInner";

const BlocklyWorkspaceInner = dynamic(
  () => import("./BlocklyWorkspaceInner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-90 w-full flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 shadow-inner">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
        <span className="text-sm font-medium">Memuat area kode Blockly...</span>
      </div>
    ),
  }
);

export function BlocklyWorkspace(props: BlocklyWorkspaceInnerProps) {
  return <BlocklyWorkspaceInner {...props} />;
}

export default BlocklyWorkspace;
