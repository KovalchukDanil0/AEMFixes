import React from "react";
import "../../assets/css/tailwind.css";
import { ShowroomCode } from "../../shared";

export default function ShowroomCodes({
  data,
}: Readonly<ShowroomCode>): React.ReactElement {
  return (
    <div className="bg-gradient-to-r from-black to-gray-600 px-24 py-24">
      {Object.keys(data).map((item, i) => {
        const dataElm = data[item as keyof typeof data];
        return (
          <div key={i} className="my-5">
            <h2 className="text-white">{dataElm.name}</h2>
            <h3 className="text-white">{dataElm.code}</h3>
          </div>
        );
      })}
    </div>
  );
}
