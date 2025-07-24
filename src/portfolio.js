import React, { useState, useEffect } from 'react';
import { Github, Mail, ExternalLink, Code, Server, Smartphone, Globe, MapPin, ChevronDown, Phone, ArrowRight } from 'lucide-react';

const Portfolio = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isVisible, setIsVisible] = useState({});
  const [copied, setCopied] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.2 }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePhoneClick = () => {
    const phoneNumber = '+201061856523';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      navigator.clipboard.writeText(phoneNumber).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = phoneNumber;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
    }
  };

  const skills = [
    { 
      category: 'Backend & Server', 
      icon: Server, 
      items: ['Go (Golang)', 'Rust', 'System Planning', 'API Building'],
      description: 'Building solid backend systems that work reliably',
      primary: true 
    },
    { 
      category: 'Frontend & Mobile', 
      icon: Smartphone, 
      items: ['Flutter', 'Swift', 'Kotlin', 'React (JavaScript)'],
      description: 'Making apps that people actually want to use',
      primary: false 
    },
    { 
      category: 'Development', 
      icon: Code, 
      items: ['Full-Stack Work', 'Problem Solving', 'System Planning', 'Making Things Fast'],
      description: 'Complete solutions from start to finish',
      primary: false 
    },
  ];

  const projects = [
    {
      title: 'Apex Logistics System',
      description: 'A logistics platform I built for managing transport operations. It handles real-time tracking and fleet management. I worked on both the backend systems and the user interface.',
      link: 'https://apextransport.ddns.net/landing-page',
      tech: ['Backend Systems', 'Full-Stack', 'Logistics', 'Real-time'],
      status: 'Live',
      year: '2024',
      highlights: ['Real-time tracking', 'Fleet management', 'Fast performance']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 text-slate-800 overflow-x-hidden relative">
      {/* Subtle background animation */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Shawket Ibrahim
            </div>
            <div className="hidden md:flex items-center space-x-12">
              {['hero', 'about', 'skills', 'projects', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`relative capitalize text-sm font-medium transition-all duration-300 hover:text-blue-600 ${
                    activeSection === section ? 'text-blue-600' : 'text-slate-600'
                  }`}
                >
                  {section === 'hero' ? 'Home' : section}
                  {activeSection === section && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className={`transition-all duration-1000 transform ${isVisible.hero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* Profile Picture */}
            <div className="relative w-40 h-40 mx-auto mb-8 group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              <img 
                src="profile.jpg" 
                alt="Shawket Ibrahim" 
                className="relative w-full h-full rounded-full border-4 border-white shadow-xl object-cover"
              />
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent leading-tight tracking-tight">
              Shawket Ibrahim
            </h1>
            <p className="text-xl md:text-3xl text-slate-600 mb-8 font-light tracking-wide">
              Full-Stack Developer & Problem Solver from Cairo
            </p>
            
            <div className="flex items-center justify-center text-slate-500 mb-12 text-lg">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              <span>Cairo, Egypt</span>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-20">
              <button 
                onClick={() => scrollToSection('projects')}
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-blue-500/25 flex items-center space-x-2"
              >
                <span>View My Work</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="border-2 border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 backdrop-blur-sm"
              >
                Get In Touch
              </button>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <ChevronDown className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gradient-to-r from-white/80 to-blue-50/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`transition-all duration-1000 transform ${isVisible.about ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                About Me
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full" />
            </div>
            
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="prose prose-lg text-slate-600 leading-relaxed space-y-6">
                  <p className="text-xl leading-relaxed">
                    I'm a developer from Cairo who enjoys building software that actually works. I spend most of my time on backend stuff - the behind-the-scenes code that makes apps run smoothly.
                  </p>
                  <p className="text-lg leading-relaxed">
                    I mostly work with <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded">Go</span> and <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded">Rust</span> for backend projects. When I need to build mobile apps or frontends, I usually go with <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded">Flutter</span>, but I can also work with Swift, Kotlin, and React.
                  </p>
                  <p className="text-lg leading-relaxed">
                    What I really like is taking messy problems and turning them into clean code. Whether it's planning how a system should work or fixing bugs, I find the problem-solving part really satisfying.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                {[
                  { label: 'What I Focus On', value: 'Backend & Server Work', icon: Server },
                  { label: 'My Main Tools', value: 'Go, Rust, Dart', icon: Code },
                  { label: 'I Also Use', value: 'Swift, Kotlin, JavaScript', icon: Smartphone },
                  { label: 'Where I\'m Based', value: 'Cairo, Egypt', icon: MapPin }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="group p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="text-slate-600 font-medium">{item.label}</span>
                        </div>
                        <span className="text-blue-700 font-semibold">{item.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-24 bg-gradient-to-l from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`transition-all duration-1000 transform ${isVisible.skills ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                What I Work With
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full" />
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {skills.map((skill, index) => {
                const Icon = skill.icon;
                return (
                  <div
                    key={index}
                    className={`group p-8 rounded-3xl border transition-all duration-500 hover:transform hover:scale-105 ${
                      skill.primary 
                        ? 'bg-gradient-to-br from-blue-50/90 to-indigo-50/90 border-blue-200/60 hover:border-blue-300 shadow-lg hover:shadow-xl' 
                        : 'bg-white/90 border-slate-200/60 hover:border-slate-300 shadow-sm hover:shadow-lg'
                    } backdrop-blur-sm`}
                  >
                    <div className="flex items-center mb-6">
                      <div className={`p-4 rounded-2xl mr-4 ${skill.primary ? 'bg-blue-100' : 'bg-slate-100'} group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-8 h-8 ${skill.primary ? 'text-blue-600' : 'text-slate-600'}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1">{skill.category}</h3>
                        <p className="text-sm text-slate-500">{skill.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {skill.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center group/item">
                          <div className={`w-2 h-2 rounded-full mr-4 ${skill.primary ? 'bg-blue-500' : 'bg-slate-400'} group-hover/item:scale-125 transition-transform`} />
                          <span className="text-slate-700 group-hover/item:text-slate-900 transition-colors">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24 bg-gradient-to-r from-white/90 to-slate-50/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`transition-all duration-1000 transform ${isVisible.projects ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                My Recent Work
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full" />
            </div>
            
            <div className="space-y-8">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="group p-8 lg:p-10 bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-200/60 hover:border-blue-300 transition-all duration-500 hover:transform hover:scale-[1.01] shadow-lg hover:shadow-xl"
                >
                  <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-3xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                            {project.title}
                          </h3>
                          <div className="flex items-center space-x-3">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-200">
                              {project.status}
                            </span>
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                              {project.year}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                        {project.description}
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Key Features</h4>
                          <div className="flex flex-wrap gap-2">
                            {project.highlights.map((highlight, hIndex) => (
                              <span key={hIndex} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100">
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Technologies</h4>
                          <div className="flex flex-wrap gap-2">
                            {project.tech.map((tech, techIndex) => (
                              <span key={techIndex} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center lg:justify-end">
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/button inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                      >
                        <span>View Project</span>
                        <ExternalLink className="w-5 h-5 group-hover/button:scale-110 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Coming Soon Projects */}
              <div className="p-10 bg-slate-50/80 backdrop-blur-sm rounded-3xl border border-slate-200/40 border-dashed">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Globe className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-700 mb-3">More Projects Coming</h3>
                  <p className="text-slate-500 text-lg">I'm working on a few more projects right now. Will add them here once they're ready!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-blue-50/60 to-indigo-50/80">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className={`transition-all duration-1000 transform ${isVisible.contact ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Let's Work Together
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full mb-8" />
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Have a project in mind? Need help with backend work or full-stack development? 
                I'd love to chat about what you're building and see if I can help out.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <a
                href="mailto:shawketibrahim2@gmail.com"
                className="group p-8 bg-white/90 hover:bg-blue-50 rounded-3xl transition-all duration-300 transform hover:scale-105 border border-slate-200/60 hover:border-blue-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Email</h3>
                <p className="text-slate-600">Send me a message</p>
              </a>
              
              <a
                href="https://github.com/shawket4"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-8 bg-white/90 hover:bg-slate-50 rounded-3xl transition-all duration-300 transform hover:scale-105 border border-slate-200/60 hover:border-slate-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                <div className="w-16 h-16 bg-slate-100 group-hover:bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Github className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">GitHub</h3>
                <p className="text-slate-600">Check out my code</p>
              </a>
              
              <button
                onClick={handlePhoneClick}
                className="group p-8 bg-white/90 hover:bg-green-50 rounded-3xl transition-all duration-300 transform hover:scale-105 border border-slate-200/60 hover:border-green-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                <div className="w-16 h-16 bg-green-100 group-hover:bg-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Phone className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{copied ? 'Copied!' : 'Call'}</h3>
                <p className="text-slate-600">{copied ? 'Number copied' : 'Give me a call'}</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-500 mb-4 md:mb-0">
              © 2025 Shawket Ibrahim
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <span>Made in Cairo</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>Open for work</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;