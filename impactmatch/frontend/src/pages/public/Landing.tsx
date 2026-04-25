import { Link } from 'react-router-dom';
import { ArrowRight, Users, Zap, Shield, TrendingUp, MapPin, Clock, Star } from 'lucide-react';

const stats = [
  { value: '2,400+', label: 'Volunteers Matched' },
  { value: '180+', label: 'NGOs Onboarded' },
  { value: '12,000+', label: 'Hours of Impact' },
  { value: '94%', label: 'Match Accuracy' },
];

const features = [
  { icon: Zap, title: 'AI-Powered Extraction', desc: 'Paste plain English. Our AI structures it into actionable needs instantly.' },
  { icon: Users, title: 'Smart Matching Engine', desc: 'Score volunteers on skills, location, availability, and urgency—automatically.' },
  { icon: Shield, title: 'Social Credits System', desc: 'Reward volunteers with credits and badges that level up with every task.' },
  { icon: TrendingUp, title: 'Real-time Coordination', desc: 'Built-in group chat per task. No third-party tools needed.' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'NGO Director', text: 'ImpactMatch cut our volunteer coordination time by 80%. The AI extraction is magic.' },
  { name: 'Arjun Reddy', role: 'Volunteer, Champion ⭐', text: 'I love seeing my match score. I know exactly which tasks suit my skills.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-900 bg-mesh-gradient overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-surface-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm font-display">IM</span>
            </div>
            <span className="font-display font-bold text-lg text-white">ImpactMatch</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center relative">
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-64 h-64 bg-accent-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
            <span className="text-brand-400 text-xs font-semibold font-mono uppercase tracking-widest">AI-Powered Volunteer Coordination</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            The right volunteer,<br />
            <span className="text-gradient">at the right place,</span><br />
            at the right time.
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            ImpactMatch connects NGOs to skilled volunteers using AI extraction and intelligent scoring. Post a need in plain English. Get matched volunteers in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base">
              Start Matching <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-secondary text-base">
              Sign into Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className={`glass p-6 text-center animate-slide-up stagger-${i + 1}`}>
              <div className="font-display text-3xl font-bold text-gradient mb-1">{s.value}</div>
              <div className="text-slate-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-white mb-3">Built for real impact</h2>
            <p className="text-slate-400 text-lg">Every feature designed around coordination speed and volunteer experience.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={i} className={`card group hover:border-brand-500/30 hover:-translate-y-1 animate-slide-up stagger-${i + 1}`}>
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4 group-hover:bg-brand-500/25 transition-colors">
                  <f.icon size={20} className="text-brand-400" />
                </div>
                <h3 className="font-display font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold text-white mb-3">How it works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Zap, title: 'NGO posts a need', desc: 'Describe the need in plain English. AI extracts skills, urgency, location, and schedule.' },
              { step: '02', icon: Users, title: 'AI matches volunteers', desc: 'Our scoring engine ranks volunteers by skill overlap, proximity, and availability.' },
              { step: '03', icon: Star, title: 'Impact happens', desc: 'Volunteers accept, coordinate via chat, and earn social credits when tasks complete.' },
            ].map((s, i) => (
              <div key={i} className={`relative animate-slide-up stagger-${i + 1}`}>
                <div className="text-7xl font-display font-bold text-white/3 absolute -top-4 -left-2 select-none">{s.step}</div>
                <div className="card relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4">
                    <s.icon size={20} className="text-brand-400" />
                  </div>
                  <h3 className="font-display font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="card">
              <p className="text-slate-300 text-base leading-relaxed mb-4 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center">
                  <span className="text-brand-400 font-bold text-sm">{t.name[0]}</span>
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-slate-500 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center glass p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent pointer-events-none" />
          <h2 className="font-display text-4xl font-bold text-white mb-4 relative z-10">Ready to create impact?</h2>
          <p className="text-slate-400 mb-8 relative z-10">Join hundreds of NGOs and thousands of volunteers already using ImpactMatch.</p>
          <div className="flex gap-4 justify-center relative z-10">
            <Link to="/register?role=admin" className="btn-primary flex items-center gap-2">
              I'm an NGO <ArrowRight size={16} />
            </Link>
            <Link to="/register?role=volunteer" className="btn-accent flex items-center gap-2">
              I'm a Volunteer <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-brand-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">IM</span>
          </div>
          <span className="font-display font-bold text-white">ImpactMatch</span>
        </div>
        <p className="text-slate-600 text-sm">The right volunteer, at the right place, at the right time.</p>
      </footer>
    </div>
  );
}
