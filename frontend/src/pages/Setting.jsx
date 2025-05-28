import React, { useState, useEffect } from "react";
import { THEMES } from "../contants";
import { Send } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  {
    id: 2,
    content: "I'm doing great! Just working on some new features.",
    isSent: true,
  },
];

function Setting() {
  const [theme, setTheme] = useState("");

  const ChangeTheme = (t) => {
    const ui = t || localStorage.getItem("theme") || THEMES[0];
    setTheme(ui);
    localStorage.setItem("theme", ui);
    document.documentElement.setAttribute("data-theme", ui);
  };

  useEffect(() => {
    ChangeTheme();
  }, []);

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Theme</h2>
          <p className="text-sm text-base-content/70">
            Choose a theme for your chat interface
          </p>
        </div>

        {/* Theme Selection */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {THEMES.map((t) => (
            <button
              key={t}
              className={`
                group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
                ${theme === t ? "bg-base-200" : "hover:bg-base-200/50"}
              `}
              onClick={() => ChangeTheme(t)}
            >
              <div
                className="relative h-8 w-full rounded-md overflow-hidden"
                data-theme={t}
              >
                <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                  <div className="rounded bg-primary"></div>
                  <div className="rounded bg-secondary"></div>
                  <div className="rounded bg-accent"></div>
                  <div className="rounded bg-neutral"></div>
                </div>
              </div>
              <span className="text-[11px] font-medium truncate w-full text-center">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            </button>
          ))}
        </div>

        {/* Preview Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <div className="border rounded-lg p-4 space-y-4">
            {PREVIEW_MESSAGES.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isSent
                      ? "bg-primary text-primary-content"
                      : "bg-base-200 text-base-content"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="input input-bordered flex-1"
              disabled
            />
            <button className="btn btn-primary">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setting;
