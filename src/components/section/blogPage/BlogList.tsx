import { getLatestArticles } from "@/lib/blog";
import s from "./style.module.css";
import CardBlog from "@/components/ui/CardBlog/CardBlog";


export default async function BlogList() {
    const blogArticles = await getLatestArticles(6);

    // Преобразуем данные из нашей структуры в формат, который ожидает компонент Interesting
    const blogMock = blogArticles.map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        img: article.img,
        date: article.date,
        excerpt: article.excerpt // используем excerpt вместо полного текста
    }));


    return (
        <section className={s.blogList}>
            <div className="container">
                <div className={s.blogListContent}>
                    {
                        blogMock.map((e, i) => (
                            <CardBlog {...e} />
                        ))
                    }

                </div>
            </div>
        </section>
    )
}
