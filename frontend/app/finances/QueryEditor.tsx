"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

import AceEditor from "react-ace";
import "ace-builds/src-min-noconflict/mode-mysql";
import "ace-builds/src-min-noconflict/theme-github";
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-min-noconflict/keybinding-vim";
import { Button } from "@/components/ui/button";
import { useHotkeys } from "react-hotkeys-hook";
import { CommandShortcut } from "@/components/ui/command";
import { type DisplayType } from "./QueryResults";
import DisplayTypeSelect from "./DisplayTypeSelect";

function QueryEditor({
  query,
  setQuery,
  onSubmit,
  onFormat,
  displayType,
  setDisplayType,
}: {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
  onFormat: () => void;
  displayType: DisplayType;
  setDisplayType: Dispatch<SetStateAction<DisplayType>>;
}) {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    setIsTablet(window.innerWidth < 1024);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="border rounded-md w-full h-full overflow-hidden">
        <AceEditor
          mode="mysql"
          theme="github"
          name="editor"
          width="100%"
          placeholder="Write your query here..."
          value={query}
          onChange={setQuery}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
          }}
          fontSize={16}
          showPrintMargin={false}
          style={{
            fontFamily: "monospace",
          }}
          keyboardHandler={!isTablet ? "vim" : undefined}
          minLines={10}
          maxLines={20}
        />
      </div>
      <div className="flex gap-3">
        <Button onClick={onSubmit}>
          <div className="flex items-center gap-1">
            Run
            <CommandShortcut className="text-gray-100">⌘+↵</CommandShortcut>
          </div>
        </Button>
        <Button onClick={onFormat} variant="secondary">
          <div className="flex items-center gap-1">
            Format
            <CommandShortcut>⌘+;</CommandShortcut>
          </div>
        </Button>
        <DisplayTypeSelect setValue={setDisplayType} value={displayType} />
      </div>
    </div>
  );
}

export default QueryEditor;
