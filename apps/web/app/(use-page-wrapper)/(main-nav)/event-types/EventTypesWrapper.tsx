"use client";

import { useDebounce } from "@calcom/lib/hooks/useDebounce";
import { PagerScheduleDashboard } from "@components/dashboard/PagerScheduleDashboard";
import type { ReactElement } from "react";
import { useState } from "react";

import EventTypes, { EventTypesCTA, SearchContext } from "~/event-types/views/event-types-listing-view";

type GetUserEventGroupsResponse = Parameters<typeof EventTypesCTA>[0]["userEventGroupsData"];

export function EventTypesWrapper({
  userEventGroupsData,
  user,
}: {
  userEventGroupsData: GetUserEventGroupsResponse;
  user: {
    id: number;
    completedOnboarding?: boolean;
  } | null;
}): ReactElement {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm, debouncedSearchTerm }}>
      <PagerScheduleDashboard
        userEventGroupsData={userEventGroupsData}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        hiddenSlot={<EventTypesCTA userEventGroupsData={userEventGroupsData} />}>
        <EventTypes userEventGroupsData={userEventGroupsData} user={user} />
      </PagerScheduleDashboard>
    </SearchContext.Provider>
  );
}
