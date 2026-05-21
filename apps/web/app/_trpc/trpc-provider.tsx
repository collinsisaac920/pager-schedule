"use client";

import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./query-client";
import { trpc } from "./trpc";
import { trpcClient } from "./trpc-client";

type Props = {
  children: React.ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TrpcReactProvider = (trpc as any).Provider;

export const TrpcProvider = ({ children }: Props) => {
  return (
    <TrpcReactProvider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TrpcReactProvider>
  );
};
