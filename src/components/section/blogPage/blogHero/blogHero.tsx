import { BlogArticle } from '@/types/blog';
import s from './style.module.css';
import BreadCrumbs from '@/components/ui/BreadCrumbs/BreadCrumbs';

interface BlogHeroProps {
    article: BlogArticle;
}

export default function BlogHero({ article }: BlogHeroProps) {


    return (
        <section style={{ background: `url(${article?.hero ? article.hero : article.img}) center / cover no-repeat` }} className={s.hero}>
            <BreadCrumbs items={[{ title: 'Полезные статьи', href: "/blog" }, { title: article.title }]} />

            <div className={'container ' + s.heroContent}>

                <time className={s.date} dateTime={article.date}>
                    {article.date}
                </time>
                <h1 className={'h2 ' + s.title}>
                    {article.title}
                </h1>
            </div>
        </section>
    )
}