"use client";

import { useEffect, useState } from "react";

import AceEditor from "react-ace";
import "ace-builds/src-min-noconflict/mode-mysql";
import "ace-builds/src-min-noconflict/theme-github";
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-min-noconflict/keybinding-vim";
import { Button } from "@/components/ui/button";
import { useStorage } from "@/hooks/useStorage";

function QueryEditor({
  handleSubmit,
  handleFormat,
}: {
  handleSubmit: (query: string) => void;
  handleFormat: (query: string) => void;
}) {
  const [query, setQuery] = useStorage<string>(
    "dynamic-query",
    "SELECT merchant, date, amount\nFROM statements\nLIMIT 1",
  );
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    setIsTablet(window.innerWidth < 1024);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="border rounded-md">
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
        <Button onClick={() => handleSubmit(query)}>Run</Button>
        <Button onClick={() => handleFormat(query)} variant="secondary">
          Format
        </Button>
      </div>
    </div>
  );
}

export default QueryEditor;
