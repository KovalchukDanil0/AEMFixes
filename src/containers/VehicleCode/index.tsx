import { Button } from "flowbite-react";
import React from "react";
import "../../assets/css/tailwind.css";

export default function VehicleCode({
  code,
}: Readonly<{
  code: string;
}>): React.ReactElement {
  return (
    <Button
      pill
      size="xl"
      className="bg-[#102b4e]"
      href={"?vehicleCode=" + code}
      id="carCode"
    >
      {code}
    </Button>
  );
}
