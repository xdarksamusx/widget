declare module "react-resizable" {
  import * as React from "react";

  export interface ResizeCallbackData {
    node: HTMLElement;
    size: { width: number; height: number };
    handle?: string;
  }

  export interface ResizableProps {
    width: number;
    height: number;
    onResize?: (event: React.SyntheticEvent, data: ResizeCallbackData) => void;
    onResizeStart?: (
      event: React.SyntheticEvent,
      data: ResizeCallbackData
    ) => void;
    onResizeStop?: (
      event: React.SyntheticEvent,
      data: ResizeCallbackData
    ) => void;
    draggableOpts?: object;
    minConstraints?: [number, number];
    maxConstraints?: [number, number];
    lockAspectRatio?: boolean;
    axis?: "both" | "x" | "y" | "none";
    resizeHandles?: Array<"s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne">;
    children?: React.ReactNode;
  }

  export class Resizable extends React.Component<ResizableProps> {}

  export interface ResizableBoxProps extends ResizableProps {
    resizeHandles?: Array<"s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne">;
  }

  export class ResizableBox extends React.Component<ResizableBoxProps> {}
}
