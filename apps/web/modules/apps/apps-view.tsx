"use client";

import { useState } from "react";

import { AllApps } from "@calcom/web/modules/apps/components/AllApps";
import type { AppCategories } from "@calcom/prisma/enums";
import type { AppFrontendPayload } from "@calcom/types/App";
import { PagerScheduleAppStoreDashboard } from "@components/dashboard/PagerScheduleAppStoreDashboard";

export type PageProps = {
  categories: {
    name: AppCategories;
    count: number;
  }[];
  appStore: AppFrontendPayload[];
  userAdminTeams: number[];
  isAdmin: boolean;
};

export default function Apps({ categories, appStore, userAdminTeams }: PageProps) {
  const [searchText, setSearchText] = useState("");

  return (
    <PagerScheduleAppStoreDashboard searchText={searchText} setSearchText={setSearchText}>
      <AllApps
        apps={appStore}
        searchText={searchText || undefined}
        categories={categories.map((category) => category.name)}
        userAdminTeams={userAdminTeams}
      />
    </PagerScheduleAppStoreDashboard>
  );
}
