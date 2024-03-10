import React from "react";
import "../../assets/css/tailwind.css";
import { ReferencesConfig, touch } from "../../shared";

export default function ReferencesBanner({
  pages,
}: Readonly<ReferencesConfig>): React.ReactElement {
  return (
    <div className="grid grid-rows-4 bg-gradient-to-r from-black to-gray-600 px-24 py-24">
      {pages
        .toSorted((a, b) => a.path.localeCompare(b.path))
        .map((page, i) => {
          const regexDetermineBeta =
            /(.+)?(\/content\/guxeu(?:-beta)?\/(?:.+)?)/gm;
          const linkBetaFix = page.path.replace(
            regexDetermineBeta,
            `$1/${touch}$2`,
          );
          return (
            <a
              key={i}
              href={linkBetaFix + ".html"}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-cyan-500 hover:underline"
            >
              {page.path}
            </a>
          );
        })}
    </div>
  );
}
