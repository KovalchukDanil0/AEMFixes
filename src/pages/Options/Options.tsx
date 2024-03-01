import { Checkbox, Label, Spinner } from "flowbite-react";
import React, { useEffect, useState } from "react";
import Browser from "webextension-polyfill";
import { loadSavedData } from "../SharedTools";
import "./Options.css";

let savedData: { [key: string]: boolean };

async function saveOptions(event: React.MouseEvent<HTMLInputElement>) {
  const elm = event.currentTarget;

  const data: { [key: string]: boolean } = {};
  data[elm.id] = elm.checked;

  Browser.storage.sync.set(data);
}

function Options(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);

  async function restoreOptions() {
    savedData = await loadSavedData();

    setIsLoading(false);
  }

  useEffect(() => {
    restoreOptions();
  });

  if (isLoading) {
    return (
      <div className="grid h-44 place-items-center">
        <Spinner aria-label="Default status example" />
      </div>
    );
  }

  return (
    <div className="mx-3 my-3">
      <div className="grid grid-rows-4 gap-5">
        <Label className="w-2/3 text-white">
          <Checkbox
            className="mr-2"
            id="disCreateWF"
            onClick={saveOptions}
            defaultChecked={savedData.disCreateWF}
          />
          Disable Create Workflow button
        </Label>

        <Label className="w-2/3 text-white">
          <Checkbox
            className="mr-2"
            id="disMothersiteCheck"
            onClick={saveOptions}
            defaultChecked={savedData.disMothersiteCheck}
          />
          Disable mothersite links checker
        </Label>

        <Label className="w-2/3 text-white">
          <Checkbox
            className="mr-2"
            id="enableFunErr"
            onClick={saveOptions}
            defaultChecked={savedData.enableFunErr}
          />
          Enable funny Error Replacement
        </Label>

        <Label className="w-2/3 text-white">
          <Checkbox
            className="mr-2"
            id="enableFiltreFix"
            onClick={saveOptions}
            defaultChecked={savedData.enableFiltreFix}
          />
          Enable attachments filters fix in Jira
        </Label>

        <Label className="w-2/3 text-white">
          <Checkbox
            className="mr-2"
            id="enableAutoLogin"
            onClick={saveOptions}
            defaultChecked={savedData.enableAutoLogin}
          />
          Enable auto login
        </Label>
      </div>
    </div>
  );
}

export default Options;
