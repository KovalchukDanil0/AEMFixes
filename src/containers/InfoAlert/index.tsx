import React from "react";

export default function InfoAlert({
  message,
}: Readonly<{
  message: string;
}>): React.ReactElement {
  return (
    <div className="bg-gray-900 px-24 py-24" id="alertBanner">
      <h2 className="text-center text-2xl font-bold text-red-600">{message}</h2>
    </div>
  );
}
