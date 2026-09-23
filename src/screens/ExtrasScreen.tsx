import { motion, useReducedMotion } from "framer-motion";
import { useState, type CSSProperties } from "react";
import { BottomSheet } from "../components/BottomSheet";
import { Chip } from "../components/Controls";
import { Info } from "../components/Icons";
import { Display } from "../components/Typography";
import { BOOKS, BOOK_THEMES, type Book, type BookTheme } from "../data/content";

const themeOf = (id: BookTheme) => BOOK_THEMES.find((t) => t.id === id)!;

/** Extras, for everyone: short summaries of books and ideas worth living with. */
export function ExtrasScreen() {
  const [theme, setTheme] = useState<BookTheme | "all">("all");
  const [open, setOpen] = useState<Book | null>(null);
  const reduced = useReducedMotion();
  const list = BOOKS.filter((b) => theme === "all" || b.theme === theme);

  return (
    <div className="extras-screen">
      <header className="screen-head">
        <Display as="h1" className="t-title">
          Extras
        </Display>
        <p className="lede">Short summaries of books and ideas worth living with. Tap one to read.</p>
      </header>

      <div className="chip-row" role="group" aria-label="Filter books by theme">
        <Chip selected={theme === "all"} onClick={() => setTheme("all")}>
          All
        </Chip>
        {BOOK_THEMES.filter((t) => BOOKS.some((b) => b.theme === t.id)).map((t) => (
          <Chip key={t.id} selected={theme === t.id} onClick={() => setTheme(t.id)}>
            {t.label}
          </Chip>
        ))}
      </div>

      <ul className="book-grid">
        {list.map((b, i) => (
          <motion.li
            key={b.id}
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: reduced ? 0 : i * 0.04 }}
          >
            <button type="button" className="book-card glass" onClick={() => setOpen(b)} aria-haspopup="dialog">
              <span className="book-cover" style={{ "--cover": themeOf(b.theme).hue } as CSSProperties} aria-hidden="true">
                <span className="book-emoji">{b.icon}</span>
              </span>
              <span className="book-meta">
                <span className="book-theme">{themeOf(b.theme).label}</span>
                <span className="book-title">{b.title}</span>
                <span className="book-author">
                  {b.author} · {b.year}
                </span>
                <span className="book-line">{b.oneLine}</span>
              </span>
            </button>
          </motion.li>
        ))}
      </ul>

      <p className="footnote">
        <Info size={14} /> Summaries written for Vidura Life, in our own words. They're a taster, not a substitute for reading the books.
      </p>

      <BookSheet book={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function BookSheet({ book, onClose }: { book: Book | null; onClose: () => void }) {
  return (
    <BottomSheet open={!!book} onClose={onClose} title={book?.title ?? "Book"} className="book-sheet">
      {book && (
        <article className="book-read">
          <p className="book-byline">
            {book.author} · {book.year} · {book.origin}
          </p>
          <p className="book-summary">{book.summary}</p>

          {book.parts?.map((p) => (
            <section key={p.title} className="book-part" aria-label={p.title}>
              <h3 className="book-part-title">
                {p.title} {p.native && <span lang="ja">{p.native}</span>}
              </h3>
              <p className="book-part-sub">{p.subtitle}</p>
              <p className="book-part-summary">{p.summary}</p>
              <ul className="book-part-ideas">
                {p.ideas.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </section>
          ))}

          <h3 className="book-h">Key ideas</h3>
          <ul className="book-ideas">
            {book.ideas.map((i) => (
              <li key={i.title}>
                <strong>{i.title}</strong>
                <span>{i.body}</span>
              </li>
            ))}
          </ul>

          <h3 className="book-h">Try this today</h3>
          <ul className="book-try">
            {book.tryThis.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          {book.note && (
            <p className="book-note">
              <Info size={14} /> {book.note}
            </p>
          )}
        </article>
      )}
    </BottomSheet>
  );
}
