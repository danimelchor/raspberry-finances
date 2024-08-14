"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

import AceEditor from "react-ace";
import "ace-builds/src-min-noconflict/mode-mysql";
import "ace-builds/src-min-noconflict/theme-github";
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-min-noconflict/keybinding-vim";
import { Button } from "@/components/ui/button";
import { format } from "sql-formatter";
import { useHotkeys } from "react-hotkeys-hook";
import { CommandShortcut } from "@/components/ui/command";

function QueryEditor({
  query,
  setQuery,
  onSubmit,
}: {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
}) {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    setIsTablet(window.innerWidth < 1024);
  }, []);

  const handleFormat = () => {
    setQuery((q) => {
      const formatted = format(q, {
        language: "postgresql",
      });
      return formatted;
    });
  };

  useHotkeys("mod+enter", onSubmit);
  useHotkeys("mod+;", handleFormat);

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
          minLines={20}
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
        <Button onClick={handleFormat} variant="secondary">
          <div className="flex items-center gap-1">
            Format
            <CommandShortcut>⌘+;</CommandShortcut>
          </div>
        </Button>
      </div>
    </div>
  );
}

export default QueryEditor;
