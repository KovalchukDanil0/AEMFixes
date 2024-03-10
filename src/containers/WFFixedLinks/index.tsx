import React from "react";
import "../../assets/css/tailwind.css";
import "../../shared.css";

export default function WFFixedLinks({
  path,
}: Readonly<{
  path: string;
}>): React.ReactElement {
  return (
    <a
      className="my-3"
      href={`/cf#${path}.html`}
      target="_blank"
      rel="noreferrer"
    >
      {path}
    </a>
  );
}
