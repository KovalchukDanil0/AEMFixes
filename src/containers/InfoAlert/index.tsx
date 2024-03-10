import React from "react";
import "../../assets/css/tailwind.css";

export default function InfoAlert({
  message,
}: Readonly<{
  message: string;
}>): React.ReactElement {
  return (
    <div
      className="bg-gradient-to-r from-black to-gray-600 px-24 py-24"
      id="alertBanner"
    >
      <h2 className="text-center text-2xl font-bold text-red-600">{message}</h2>
    </div>
  );
}
