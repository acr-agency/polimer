import BlogList from "@/components/section/blogPage/BlogList";
import HeroPages from "@/components/section/heroPages/HeroPages";



export default function BlogPage() {
    

    return (
        <main style={{background:'var(--temnyy-1)'}}>
            <HeroPages fon='/img/blog/fon.webp' title='Блог' h1="НОВОСТИ КОМПАНИИ" />
            <BlogList/>
        </main>
    )
}