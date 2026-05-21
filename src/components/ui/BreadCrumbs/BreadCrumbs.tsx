import Link from "next/link";
import s from "./BreadCrumbs.module.css";
import { LocalizedLink } from "../LocalizedLink";

export type Crumb = {
  title: string;
  href?: string; // если нет — текущая страница
};

type Props = {
  items: Crumb[];
  theme?:"dark";
};

export default function BreadCrumbs({ items, theme }: Props) {
  return (
    <nav className={s.BreadCrumbs} aria-label="Хлебные крошки">
      <div className="container">
        <ul className={s.list}>
          {/* Главная всегда первая */}
          <li className={s.item}>
            <LocalizedLink href="/" className={`${s.link} ${theme ? s.dark:''}` }>
              Главная
            </LocalizedLink>
          </li>

          {items.map((crumb, idx) => {
            const isLast = idx === items.length - 1;

            return (
              <li key={idx} className={s.item}>
                <span className={`${s.separator} ${theme ? s.dark:''}`}>•</span>

                {crumb.href && !isLast ? (
                  <LocalizedLink href={crumb.href} className={`${s.link} ${theme ? s.dark:''}` }>
                    {crumb.title}
                  </LocalizedLink>
                ) : (
                  <span  className={`${s.current} ${theme ? s.dark:''}`} aria-current="page">
                    {crumb.title}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
