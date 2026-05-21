import Image from "next/image";
import s from "./CardBlog.module.css";
import { truncateText } from "@/utils/text";
import { a } from "framer-motion/client";
import Link from "next/link";
import { BlogCardData } from "@/types/blog";
import { LocalizedLink } from "../LocalizedLink";

type CardBlogProps = BlogCardData & {
  variant?: 'default' | 'compact'; // на случай разных вариантов отображения
};

export default function CardBlog({ title, slug, img, date, excerpt }: CardBlogProps) {
  return (
   <LocalizedLink href={`/blog/${slug}`} >
     <article className={s.card}>
      <div className={s.cardImg}>
        <Image
          src={img}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <div className={s.cardData}>{date}</div>

      <h3 className={s.cardTitle}>{title}</h3>

      <p className={s.cardText}>{truncateText(excerpt, 150)}</p>
    </article>
   </LocalizedLink>
  );
}
