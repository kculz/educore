import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Blog' };

const POSTS = [
  { author: 'Dr. Amina Odhiambo', role: 'Principal', initials: 'AO', date: 'July 18, 2026', readTime: '5 min read', cat: 'Leadership', title: 'Building Resilience in Adolescents: A School\'s Perspective', excerpt: 'The transition through secondary school is one of the most formative periods of a young person\'s life. At Kwenda High, we have long believed that resilience — the capacity to recover from difficulty — is as important as any academic subject…' },
  { author: 'Mr. David Otieno', role: 'Head of Humanities', initials: 'DO', date: 'July 12, 2026', readTime: '4 min read', cat: 'Education', title: 'Why Literature Still Matters in the Age of AI', excerpt: 'As artificial intelligence reshapes the world of work, some question the relevance of studying novels and poetry. The argument misses a fundamental truth: literature teaches us what it means to be human…' },
  { author: 'Ms. Sarah Njoroge', role: 'Student Counsellor', initials: 'SN', date: 'July 3, 2026', readTime: '6 min read', cat: 'Wellness', title: 'Managing Exam Anxiety: Practical Strategies for Form 4 Students', excerpt: 'With the national examinations approaching, it is normal to feel a heightened sense of pressure. In my years of counselling students at Kwenda High, I have seen that anxiety, managed correctly, can actually sharpen focus…' },
  { author: 'Dr. Peter Mwangi', role: 'Head of Sciences', initials: 'PM', date: 'June 25, 2026', readTime: '7 min read', cat: 'STEM', title: 'Our Science Olympiad Journey: Lessons from Champions', excerpt: 'When our Form 4 team stood on the podium in Mombasa, we knew it was not luck. It was the product of two years of disciplined preparation, creative thinking, and an unwavering belief in science as a path to solutions…' },
];

const CAT_COLORS: Record<string, string> = {
  Leadership: 'bg-navy text-gold',
  Education: 'bg-blue-100 text-blue-700',
  Wellness: 'bg-green-100 text-green-700',
  STEM: 'bg-purple-100 text-purple-700',
};

export default function BlogPage() {
  return (
    <>
      <Navbar />

      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="text-gold text-xs tracking-widest uppercase font-semibold mb-2">Perspectives</p>
        <h1 className="font-serif text-5xl font-bold text-white">The Kwenda Blog</h1>
        <p className="text-white/50 mt-4 max-w-md mx-auto text-sm">Insights, stories, and reflections from our teachers, students, and alumni.</p>
        <div className="w-16 h-1 gold-gradient mx-auto mt-6 rounded-full" />
      </div>

      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto space-y-8">
          {POSTS.map((post, i) => (
            <article
              key={post.title}
              className={`rounded-2xl overflow-hidden border transition-all hover:shadow-xl group ${
                i === 0 ? 'border-gold/30 bg-navy text-white' : 'border-slate-100 bg-white'
              }`}
            >
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${CAT_COLORS[post.cat] ?? 'bg-slate-100 text-slate-600'}`}>
                    {post.cat}
                  </span>
                  <span className={`text-xs ${i === 0 ? 'text-white/40' : 'text-slate-400'}`}>{post.date} · {post.readTime}</span>
                </div>
                <h2 className={`font-serif text-xl font-bold mb-3 group-hover:text-gold transition-colors leading-snug ${i === 0 ? 'text-white' : 'text-slate-900'}`}>
                  {post.title}
                </h2>
                <p className={`text-sm leading-relaxed line-clamp-3 ${i === 0 ? 'text-white/60' : 'text-slate-500'}`}>
                  {post.excerpt}
                </p>
                <div className={`flex items-center gap-3 mt-6 pt-5 border-t ${i === 0 ? 'border-white/10' : 'border-slate-100'}`}>
                  <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-xs font-bold" style={{ color: '#0a1628' }}>
                    {post.initials}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${i === 0 ? 'text-white' : 'text-slate-700'}`}>{post.author}</p>
                    <p className={`text-[11px] ${i === 0 ? 'text-white/40' : 'text-slate-400'}`}>{post.role}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
