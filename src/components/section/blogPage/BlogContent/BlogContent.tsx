import Image from "next/image";
import s from "./style.module.css";
import { BlogContentItem } from "@/types/blog";

// Объект с компонентами заголовков
const HeadingComponents = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
    5: 'h5',
    6: 'h6',
} as const;

interface BlogContentProps {
    content: BlogContentItem[];
}

export default function BlogContent({ content }: BlogContentProps) {
    return (
        <article className={s.article}>
            <div className="container">
                <div className={s.content}>
                    {content.map((block, index) => {
                        switch (block.type) {
                            case 'heading': {
                                const level = block.level || 2;
                                const HeadingTag = HeadingComponents[level as keyof typeof HeadingComponents];

                                return (
                                    <HeadingTag key={index} className={s.heading}>
                                        {block.text}
                                    </HeadingTag>
                                );
                            }

                            case 'paragraph':
                                return (
                                    <p key={index} dangerouslySetInnerHTML={{__html:block.text}} className={s.paragraph}>
                                        
                                    </p>
                                );

                            case 'list':
                                const ListTag = block.ordered ? 'ol' : 'ul';
                                return (
                                    <ListTag key={index} className={s.list}>
                                        {block.items.map((item, i) => (
                                            <li key={i} className={s.listItem}>{item}</li>
                                        ))}
                                    </ListTag>
                                );

                            case 'image':
                                return (
                                    <figure key={index} className={s.figure}>
                                        <div className={s.imageWrapper}>
                                            <Image
                                                src={block.src}
                                                alt={block.alt}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 800px"
                                                className={s.image}
                                            />
                                        </div>
                                        {block.caption && (
                                            <figcaption className={s.caption}>
                                                {block.caption}
                                            </figcaption>
                                        )}
                                    </figure>
                                );

                            case 'quote':
                                return (
                                    <blockquote key={index} className={s.quote}>
                                        <p className={s.quoteText} dangerouslySetInnerHTML={{__html:block.text}}></p>
                                        {block.author && (
                                            <cite className={s.quoteAuthor}>— {block.author}</cite>
                                        )}
                                    </blockquote>
                                );

                            case 'link':
                                return (
                                    <p key={index} className={s.link}>
                                        <a
                                            href={block.href}
                                            target={block.target || '_blank'}
                                            rel="nofollow noopener noreferrer"
                                            className={s.linkAnchor}
                                        >
                                            {block.text}
                                        </a>
                                    </p>
                                );

                            case 'warning':
                                return (
                                    <div key={index} className={s.warning}>
                                        <p className={s.warningText} dangerouslySetInnerHTML={{__html:block.text}}></p>
                                        {block.author && (
                                            <cite className={s.warningAuthor}>— {block.author}</cite>
                                        )}
                                    </div>
                                );

                            default:
                                return null;
                        }
                    })}
                </div>
            </div>
        </article>
    );
}