import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../utils/auth';

const SLIDES = [
  {
    tag: '✦ Trusted Since 2008',
    line1: '16 Years of Shaping',
    line2: 'Brighter Futures',
    sub: "Empowering thousands of students across Tamil Nadu with expert guidance, proven methodologies, and a strict student-first approach to conquer their academic goals",
    cta: 'Explore Materials',
    board: null,
  },
  {
    tag: '✦ Complete Study Materials',
    line1: 'Excellence in CBSE &',
    line2: 'State Board Education',
    sub: "Gain unlimited access to expertly crafted notes, chapter-wise previous year question papers, and in-depth analytical tools tailored specifically for Grades 4 through 12.",
    cta: 'View Grades',
    board: 'cbse',
  },
  {
    tag: '✦ Proven Track Record',
    line1: 'Produced Outstanding',
    line2: 'Results for 16 Years',
    sub: "Fall in love with learning and join a rich legacy of state toppers. Our personalized coaching strategies and dedicated educators turn aspirations into top-tier academic achievements.",
    board: null,
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const goTo = (index) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 300);
  };

  const next = () => goTo((current + 1) % SLIDES.length);
  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [current]);

  const handleCTA = (board) => {
    clearInterval(timerRef.current);
    const session = getSession();
    if (!session) { navigate('/login'); return; }
    if (session.role === 'admin') { navigate('/admin/dashboard'); return; }
    navigate('/' + (board || session.assignedBoard || 'cbse'));
  };

  const slide = SLIDES[current];

  return (
    <section style={{
      position: 'relative', height: '100vh', overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f1b4c 0%, #1a237e 50%, #2c5282 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Animated background dots */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${20 + i * 15}px`, height: `${20 + i * 15}px`,
            borderRadius: '50%',
            background: `rgba(245, 197, 24, ${0.03 + (i % 4) * 0.02})`,
            top: `${(i * 37) % 100}%`,
            left: `${(i * 53 + 10) % 100}%`,
            animation: `heroFloat ${4 + (i % 5)}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
      `}</style>

      {/* Slide content */}
      <div style={{
        textAlign: 'center', padding: '0 24px', maxWidth: 800, zIndex: 1,
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(20px)' : 'translateY(0)',
        transition: 'all 0.3s ease',
      }}>
        <div style={{
          display: 'inline-block', background: 'rgba(245,197,24,0.15)',
          border: '1px solid rgba(245,197,24,0.4)', borderRadius: 20,
          padding: '6px 16px', color: '#f5c518', fontSize: 13,
          fontWeight: 600, letterSpacing: 1, marginBottom: 24,
        }}>
          {slide.tag}
        </div>
        <h1 style={{ margin: '0 0 8px', color: '#fff', fontSize: 'clamp(32px, 6vw, 60px)', fontWeight: 900, lineHeight: 1.1 }}>
          {slide.line1}
        </h1>
        <h1 style={{ margin: '0 0 24px', color: '#f5c518', fontSize: 'clamp(32px, 6vw, 60px)', fontWeight: 900, lineHeight: 1.1 }}>
          {slide.line2}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 18, marginBottom: 36, lineHeight: 1.6 }}>
          {slide.sub}
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {slide.cta && (
            <button
              onClick={() => handleCTA(slide.board)}
              style={{
                padding: '14px 32px', background: '#f5c518', color: '#0f1b4c',
                border: 'none', borderRadius: 50, fontWeight: 800, fontSize: 15,
                cursor: 'pointer', boxShadow: '0 8px 24px rgba(245,197,24,0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
            >
              {slide.cta} →
            </button>
          )}
          <button
            onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              padding: '14px 32px', background: 'transparent', color: '#fff',
              border: '2px solid rgba(255,255,255,0.5)', borderRadius: 50,
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
              transition: 'border-color 0.2s, background 0.2s',
            }}
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Arrow buttons */}
      <button onClick={prev} style={{
        position: 'absolute', left: 24, top: '50%',
        transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.3)', color: '#fff',
        width: 48, height: 48, borderRadius: '50%', fontSize: 24,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2,
      }}>‹</button>
      <button onClick={next} style={{
        position: 'absolute', right: 24, top: '50%',
        transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.3)', color: '#fff',
        width: 48, height: 48, borderRadius: '50%', fontSize: 24,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2,
      }}>›</button>

      {/* Dot indicators */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 10, zIndex: 2,
      }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            width: i === current ? 28 : 10, height: 10,
            borderRadius: 5, border: 'none',
            background: i === current ? '#f5c518' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer', padding: 0, transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
    </section>
  );
}
