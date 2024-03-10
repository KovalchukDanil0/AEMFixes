import React from "react";
import "../../assets/css/tailwind.css";
import { regexRemoveCommas } from "../../shared";

export default function WFShowTicket({
  blockingTicket,
}: Readonly<{
  blockingTicket: string;
}>): React.ReactElement {
  const blockingTicketReplaced: string = blockingTicket.replace(
    regexRemoveCommas,
    "$1",
  );
  return (
    <a
      className="cursor-pointer font-medium text-blue-600 hover:underline dark:text-blue-500"
      href={`https://jira.uhub.biz/browse/GTBEMEA${blockingTicketReplaced}#view-subtasks`}
      target="_blank"
      rel="noreferrer"
    >
      {blockingTicket}
    </a>
  );
}
