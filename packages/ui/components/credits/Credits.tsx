"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CALCOM_VERSION, IS_SELF_HOSTED } from "@calcom/lib/constants";

const CalComVersion = `v.${CALCOM_VERSION}-${!IS_SELF_HOSTED ? "h" : "sh"}`;

export default function Credits() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <small className="text-default mx-3 mb-2 mt-1 hidden text-[0.5rem] opacity-50 lg:block">
      &copy; {new Date().getFullYear()}{" "}
      <Link href="https://pagerschedule.com" target="_blank" className="hover:underline">
        Pager Schedule
      </Link>{" "}
      {hasMounted && <>{CalComVersion}</>}
    </small>
  );
}
