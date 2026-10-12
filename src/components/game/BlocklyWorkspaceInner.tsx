"use client";

import React, { useEffect, useRef } from "react";
import * as Blockly from "blockly";
import type { GameAction } from "@/game/types";
import { BLOCK_DEFINITIONS, BLOCK_IDS, createToolbox } from "@/game/parser/blocks";

export type BlocklyWorkspaceInnerProps = {
  availableBlocks: readonly GameAction[];
  onWorkspaceReady?: (workspace: Blockly.WorkspaceSvg) => void;
  onWorkspaceChange?: (workspace: Blockly.WorkspaceSvg) => void;
  className?: string;
};

export default function BlocklyWorkspaceInner({
  availableBlocks,
  onWorkspaceReady,
  onWorkspaceChange,
  className = "",
}: BlocklyWorkspaceInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Idempotently register custom blocks
    try {
      if (!Blockly.Blocks[BLOCK_IDS.MOVE]) {
        Blockly.common.defineBlocksWithJsonArray(BLOCK_DEFINITIONS);
      }
    } catch {
      // In case already registered in hot reload
    }

    // 2. Clear any lingering children to avoid duplicate SVG injection
    containerRef.current.innerHTML = "";

    // 3. Inject Blockly Workspace
    const workspace = Blockly.inject(containerRef.current, {
      toolbox: createToolbox(availableBlocks),
      scrollbars: true,
      trashcan: true,
      sounds: false,
      renderer: "zelos", // Kid-friendly Scratch-like rounded blocks if available, falls back to default
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 2.0,
        minScale: 0.5,
        scaleSpeed: 1.2,
      },
      grid: {
        spacing: 20,
        length: 3,
        colour: "#e2e8f0",
        snap: true,
      },
    });

    workspaceRef.current = workspace;
    onWorkspaceReady?.(workspace);

    // 4. Change listener
    const changeListener = () => {
      onWorkspaceChange?.(workspace);
    };
    workspace.addChangeListener(changeListener);

    // 5. Responsive ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current);
      }
    });
    resizeObserver.observe(containerRef.current);

    // Initial resize trigger
    setTimeout(() => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current);
      }
    }, 50);

    // 6. Cleanup on unmount to prevent duplicate workspace or memory leaks
    return () => {
      resizeObserver.disconnect();
      workspace.removeChangeListener(changeListener);
      workspace.dispose();
      workspaceRef.current = null;
    };
  }, [availableBlocks, onWorkspaceReady, onWorkspaceChange]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-90 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-inner ${className}`}
    />
  );
}
