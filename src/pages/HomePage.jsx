import { useNavigate, Link } from 'react-router-dom';
import { getSession } from '../utils/auth';
import HeroSlider from '../components/HeroSlider';

export default function HomePage() {
  const navigate = useNavigate();
  const session = getSession();

  const handleCTA = (board) => {
    try {
      if (!session) { navigate('/login'); return; }
      const targetBoard = board || session.assignedBoard || 'cbse';
      navigate('/' + targetBoard);
    } catch {
      navigate('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Section 1: Hero Slider */}
      <HeroSlider />

      {/* Section 2: Stats Bar */}
      <section className="bg-primary text-white py-4">
        <div className="container grid grid-cols-4 text-center">
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--golden-yellow)' }}>16+</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Years of Excellence</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--golden-yellow)' }}>1,000+</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Students Taught</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--golden-yellow)' }}>95%</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Success Rate</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--golden-yellow)' }}>2</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Boards Covered</div>
          </div>
        </div>
      </section>

      {/* Section 3: Guest Login Prompt */}
      {!session && (
        <section className="container py-8">
          <div className="card text-center" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', border: 'none', padding: '3rem 2rem' }}>
            <h2 className="mb-2" style={{ color: 'var(--primary-navy)' }}>🔒 Access Study Materials</h2>
            <p className="mb-4 text-muted text-center" style={{ fontSize: '1.1rem' }}>Log in to browse notes and question papers for your grade</p>
            <Link to="/login" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>Login Now →</Link>
          </div>
        </section>
      )}

      {/* Section 4: Select Your Board */}
      <section className="bg-white py-8">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="h2 mb-1">Select Your Board</h2>
            <p className="text-muted" style={{ fontSize: '1.1rem' }}>to explore study materials</p>
          </div>

          <div className="grid grid-cols-2">
            <div className="card text-center" style={{ padding: '3rem 2rem', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.2)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📘</div>
              <h3 className="h3 mb-2">CBSE</h3>
              <p className="text-muted mb-3">Comprehensive study materials tailored to the latest CBSE curriculum.</p>
              <div className="d-flex justify-center flex-wrap gap-1 mb-4">
                <span className="badge badge-blue">Notes</span>
                <span className="badge badge-yellow">Question Papers</span>
                <span className="badge badge-green">NCERT Solutions</span>
              </div>
              <button className="btn btn-primary w-full" onClick={() => handleCTA('cbse')}>Explore →</button>
            </div>

            <div className="card text-center" style={{ padding: '3rem 2rem', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.2)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📗</div>
              <h3 className="h3 mb-2">State Board</h3>
              <p className="text-muted mb-3">Expert-curated resources for the Tamil Nadu State Board syllabus.</p>
              <div className="d-flex justify-center flex-wrap gap-1 mb-4">
                <span className="badge badge-blue">Notes</span>
                <span className="badge badge-yellow">Question Papers</span>
                <span className="badge badge-green">Samacheer Kalvi</span>
              </div>
              <button className="btn btn-accent w-full" onClick={() => handleCTA('stateboard')}>Explore →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Meet Our Educator */}
      <section className="py-8" style={{ backgroundColor: 'var(--light-grey)' }}>
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="h2 mb-1">Meet Our Lead Educator</h2>
            <p className="text-muted">Guided by experience, driven by excellence.</p>
          </div>

          <div className="card glass d-flex align-center card-hover" style={{ padding: '3rem', maxWidth: '1000px', margin: '0 auto', gap: '3rem', flexWrap: 'wrap' }}>
            {/* Avatar & Badges (Left) */}
            <div style={{ flex: '1', minWidth: '300px', textAlign: 'center' }}>
              <div style={{
                width: '150px', height: '150px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--golden-yellow), var(--accent-blue))',
                margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '4.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}>
                👩‍🏫
              </div>
              <h3 className="h3 mb-2" style={{ color: 'var(--primary-navy)' }}>Mrs. Uma</h3>
              <div style={{ color: 'var(--golden-yellow)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>⭐⭐⭐⭐⭐</div>
              <div className="badge badge-yellow mb-2">Founder & Lead Educator</div>
              <br />
              <div className="badge badge-blue">10+ Years Experience</div>
            </div>

            {/* Bio & Stats (Right) */}
            <div style={{ flex: '2', minWidth: '300px' }}>
              <h4 className="mb-3" style={{ fontSize: '1.4rem', color: 'var(--accent-blue)' }}>Dual Mastery in CBSE & State Board Curriculam</h4>
              <p className="mb-4 text-muted" style={{ lineHeight: '1.6', fontSize: '1.05rem' }}>
                With a profound understanding of both CBSE and State Board educational frameworks, Mrs. Uma has developed highly effective teaching methods tailored to individual student needs. Her unwavering dedication to academic excellence empowers students to conquer complex concepts, secure top ranks, and confidently achieve their ultimate academic goals.
              </p>

              <div className="d-flex gap-3 flex-wrap">
                <div style={{ backgroundColor: 'var(--white)', padding: '1rem', borderRadius: '0.75rem', flex: 1, minWidth: '140px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.2rem' }}>10+</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Years Exp.</div>
                </div>
                <div style={{ backgroundColor: 'var(--white)', padding: '1rem', borderRadius: '0.75rem', flex: 1, minWidth: '140px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.2rem' }}>1000+</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Students Mentored</div>
                </div>
                <div style={{ backgroundColor: 'var(--white)', padding: '1rem', borderRadius: '0.75rem', flex: 1, minWidth: '140px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.2rem' }}>Dual</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Board Expert</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Section 6: Why Choose Us */}
      <section className="bg-white py-8">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="h2 mb-1">Why Choose Us</h2>
            <p className="text-muted">What makes Uma Tuition special</p>
          </div>

          <div className="grid grid-cols-4">
            <div className="card text-center card-hover border-light">
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📚</div>
              <h4 className="mb-1">Grade-wise Materials</h4>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Organized resources specifically for your grade level.</p>
            </div>
            <div className="card text-center card-hover border-light">
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
              <h4 className="mb-1">Notes & PDFs</h4>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>High-quality notes crafted by experts.</p>
            </div>
            <div className="card text-center card-hover border-light">
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📖</div>
              <h4 className="mb-1">Subject-wise Content</h4>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Focused learning paths for every individual subject.</p>
            </div>
            <div className="card text-center card-hover border-light">
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
              <h4 className="mb-1">Secure Viewing</h4>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Safe and secure platform to view and track progress.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: About Us */}
      <section className="py-8" style={{ backgroundColor: 'var(--light-grey)' }}>
        <div className="container grid grid-cols-2 align-center">
          <div style={{ borderRadius: '1rem', background: 'linear-gradient(135deg, #1a237e, #2c5282)', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: '8rem', opacity: 0.1, position: 'absolute', top: -20, right: -20 }}>🔥</div>
            <h2 style={{ fontSize: '3rem', zIndex: 10, textAlign: 'center' }}>Uma<br />Tuition</h2>
          </div>
          <div style={{ padding: '0 2rem' }}>
            <div className="badge badge-blue mb-2">About Us</div>
            <h2 className="h2 mb-3">16 Years of Academic Excellence</h2>
            <p className="text-muted mb-4" style={{ fontSize: '1.1rem' }}>
              Since 2008, Uma Tuition has been the guiding light for countless students, helping them achieve their academic dreams and secure top ranks in both CBSE and State Board examinations.
            </p>
            <ul className="mb-4 d-flex flex-column gap-2" style={{ fontSize: '1.1rem' }}>
              <li className="d-flex align-center gap-2">✅ <span>Personalized attention for every student</span></li>
              <li className="d-flex align-center gap-2">✅ <span>Regular mock tests and performance tracking</span></li>
              <li className="d-flex align-center gap-2">✅ <span>Doubt clearing sessions with expert faculty</span></li>
            </ul>
            <button className="btn btn-primary" onClick={() => handleCTA()}>Join Uma Tuition →</button>
          </div>
        </div>
      </section>

      {/* Section 8: Testimonials */}
      <section className="py-8" style={{ background: 'linear-gradient(to bottom, var(--white), #e0f2fe)' }}>
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="h2 mb-1">Student Success Stories</h2>
            <p className="text-muted">Hear from our achievers</p>
          </div>

          <div className="grid grid-cols-3">
            <div className="card card-hover" style={{ position: 'relative' }}>
              <div style={{ fontSize: '3rem', color: '#bae6fd', position: 'absolute', top: '10px', right: '20px', lineHeight: 1 }}>"</div>
              <div className="mb-3" style={{ color: 'var(--golden-yellow)', fontSize: '1.2rem' }}>⭐⭐⭐⭐⭐</div>
              <p className="text-muted mb-4" style={{ fontStyle: 'italic' }}>"Uma Tuition's materials were a lifesaver. The organized chapters and notes helped me score 98% in my CBSE boards."</p>
              <div>
                <h5 className="mb-1">Anjali Sharma</h5>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Class 10 CBSE</p>
              </div>
            </div>

            <div className="card card-hover" style={{ position: 'relative' }}>
              <div style={{ fontSize: '3rem', color: '#bae6fd', position: 'absolute', top: '10px', right: '20px', lineHeight: 1 }}>"</div>
              <div className="mb-3" style={{ color: 'var(--golden-yellow)', fontSize: '1.2rem' }}>⭐⭐⭐⭐⭐</div>
              <p className="text-muted mb-4" style={{ fontStyle: 'italic' }}>"The faculties here don't just teach, they inspire. The State Board resources perfectly aligned with our syllabus."</p>
              <div>
                <h5 className="mb-1">Karthik Raja</h5>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Class 12 State Board</p>
              </div>
            </div>

            <div className="card card-hover" style={{ position: 'relative' }}>
              <div style={{ fontSize: '3rem', color: '#bae6fd', position: 'absolute', top: '10px', right: '20px', lineHeight: 1 }}>"</div>
              <div className="mb-3" style={{ color: 'var(--golden-yellow)', fontSize: '1.2rem' }}>⭐⭐⭐⭐⭐</div>
              <p className="text-muted mb-4" style={{ fontStyle: 'italic' }}>"I struggled with Maths until I joined here. The question papers and solutions are incredibly well structured."</p>
              <div>
                <h5 className="mb-1">Meenakshi S.</h5>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Class 9 CBSE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
