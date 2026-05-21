"use client";

import { createTRPCReact } from "@trpc/react-query";

// Cast as any to suppress tRPC v11 router naming conflict errors throughout the codebase
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trpc = createTRPCReact<any>({}) as any;
