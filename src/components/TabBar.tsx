import { motion } from "framer-motion";
import { haptics } from "../lib/device";
import { Book, Cards, Chart, Sun } from "./Icons";

export type TabId = "now" | "tips" | "insights" | "extras";

const TABS: { id: TabId; label: string; Icon: typeof Sun }[] = [
  { id: "now", label: "Now", Icon: Sun },
  { id: "tips", label: "Tips", Icon: Cards },
  { id: "insights", label: "Insights", Icon: Chart },
  { id: "extras", label: "Extras", Icon: Book },
];

export function TabBar({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="tabbar glass-strong" aria-label="Main">
      {TABS.map(({ id, label, Icon }) => {
        const on = id === tab;
        return (
          <button
            key={id}
            type="button"
            className={`tab ${on ? "tab-on" : ""}`}
            aria-current={on ? "page" : undefined}
            onClick={() => {
              if (on) return;
              haptics.tap();
              onChange(id);
            }}
          >
            {on && <motion.span layoutId="tab-pill" className="tab-pill" transition={{ type: "spring", stiffness: 480, damping: 36 }} />}
            <Icon size={20} />
            <span className="tab-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
