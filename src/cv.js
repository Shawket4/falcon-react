import React from 'react';

const CV = () => {
  const skills = [
    { name: 'Go (Golang)', level: 5 },
    { name: 'Rust', level: 4 },
    { name: 'Flutter', level: 4 },
    { name: 'React', level: 3 }
  ];

  const technologies = [
    'API Development',
    'System Architecture', 
    'Database Design',
    'Real-time Systems',
    'Cloud Platforms',
    'DevOps'
  ];

  const SkillDots = ({ level }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((dot) => (
        <div
          key={dot}
          className={`w-1 h-1 rounded-full ${
            dot <= level ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const ContactIcon = ({ children }) => (
    <div className="w-3 h-3 mr-2 text-blue-600 flex-shrink-0">
      {children}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      <div className="grid grid-cols-12 min-h-screen">
        {/* Sidebar */}
        <div className="col-span-4 bg-gray-50 border-r-2 border-gray-200 p-5 relative">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800"></div>
          </div>
          
          <div className="relative z-10">
            {/* Profile Section */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full border-2 border-gray-200 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-light">
                SI
              </div>
              <h1 className="text-lg font-semibold text-gray-800 mb-1 tracking-tight">
                Shawket Ibrahim
              </h1>
              <p className="text-sm text-gray-600 mb-4">Software Developer</p>
              
              {/* Contact Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center mb-2 text-xs text-gray-700">
                  <ContactIcon>
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </ContactIcon>
                  Cairo, Egypt
                </div>
                <div className="flex items-center mb-2 text-xs text-gray-700">
                  <ContactIcon>
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                  </ContactIcon>
                  +20 106 185 6523
                </div>
                <div className="flex items-center mb-2 text-xs text-gray-700">
                  <ContactIcon>
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </ContactIcon>
                  shawketibrahim2@gmail.com
                </div>
                <div className="flex items-center text-xs text-gray-700">
                  <ContactIcon>
                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </ContactIcon>
                  github.com/shawket4
                </div>
              </div>
            </div>

            {/* Core Skills */}
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2">
                Core Skills
              </h3>
              {skills.map((skill, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded px-2 py-1 mb-1 text-xs text-gray-700">
                  <div className="flex justify-between items-center">
                    <span>{skill.name}</span>
                    <SkillDots level={skill.level} />
                  </div>
                </div>
              ))}
            </div>

            {/* Technologies */}
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2">
                Technologies
              </h3>
              {technologies.map((tech, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded px-2 py-1 mb-1 text-xs text-gray-700">
                  {tech}
                </div>
              ))}
            </div>

            {/* Languages */}
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2">
                Languages
              </h3>
              <div className="bg-white border border-gray-200 rounded px-2 py-1 mb-1 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Arabic</span>
                  <span className="opacity-70">(Native)</span>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>English</span>
                  <span className="opacity-70">(Fluent)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-8 p-6">
          {/* Professional Summary */}
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3 relative pb-1">
              Professional Summary
              <div className="absolute bottom-0 left-0 w-10 h-0.5 bg-gradient-to-r from-blue-600 to-blue-800 rounded"></div>
            </h2>
            <p className="text-xs leading-relaxed text-gray-700 text-justify">
              I'm a software developer from Cairo who builds backend systems and mobile applications. I work primarily with Go and Rust 
              for server development, and Flutter for mobile apps. I enjoy solving complex problems and creating solutions that work reliably.
            </p>
          </div>

          {/* Professional Experience */}
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3 relative pb-1">
              Professional Experience
              <div className="absolute bottom-0 left-0 w-10 h-0.5 bg-gradient-to-r from-blue-600 to-blue-800 rounded"></div>
            </h2>
            
            <div className="relative pl-4 mb-4">
              <div className="absolute left-0 top-1 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              <div className="flex justify-between items-start flex-wrap mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Full-Stack Developer</h3>
                  <p className="text-xs text-blue-600 font-medium">Apex Logistics Solutions</p>
                </div>
                <span className="text-xs text-gray-600 font-medium whitespace-nowrap">2024 - Present</span>
              </div>
              <p className="text-xs leading-snug mb-2 text-gray-700">
                I built a logistics platform for tracking vehicles and managing transport operations. 
                I developed both the backend systems and user interface components.
              </p>
              <ul className="space-y-1">
                {[
                  'I built a real-time vehicle tracking system handling hundreds of vehicles',
                  'I created APIs that serve thousands of requests daily with high uptime',
                  'I developed a dashboard that significantly reduced manual processing time',
                  'I optimized system performance, greatly improving response times',
                  'I implemented automated testing, dramatically reducing deployment issues'
                ].map((achievement, index) => (
                  <li key={index} className="text-xs leading-tight pl-3 relative text-gray-700">
                    <span className="absolute left-0 text-blue-600 font-bold">▸</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Featured Projects */}
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3 relative pb-1">
              Featured Projects
              <div className="absolute bottom-0 left-0 w-10 h-0.5 bg-gradient-to-r from-blue-600 to-blue-800 rounded"></div>
            </h2>
            
            <div className="bg-gray-50 rounded-md p-3 mb-3 border-l-3 border-blue-600">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-xs font-semibold text-gray-800">Apex Transport Platform</h3>
                <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide">
                  Live Production
                </span>
              </div>
              <p className="text-xs text-gray-600 font-medium mb-1">
                Go • Flutter • WebSocket • PostgreSQL • Redis • Docker
              </p>
              <p className="text-xs leading-snug text-gray-700">
                A production logistics platform serving transport companies. It features real-time tracking, route optimization, 
                and analytics dashboards. The system processes thousands of daily transactions with consistent performance.
              </p>
            </div>

            <div className="bg-gray-50 rounded-md p-3 border-l-3 border-blue-600">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-xs font-semibold text-gray-800">Cross-Platform Mobile Suite</h3>
                <span className="bg-yellow-600 text-white px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide">
                  Planning
                </span>
              </div>
              <p className="text-xs text-gray-600 font-medium mb-1">
                Flutter • Dart • Firebase • GraphQL
              </p>
              <p className="text-xs leading-snug text-gray-700">
                I'm developing mobile applications for logistics operations, including driver apps, customer tracking interfaces, 
                and management dashboards. The focus is on offline functionality and seamless data synchronization.
              </p>
            </div>
          </div>

          {/* Technical Expertise */}
          <div>
            <h2 className="text-sm font-semibold text-gray-800 mb-3 relative pb-1">
              Technical Expertise
              <div className="absolute bottom-0 left-0 w-10 h-0.5 bg-gradient-to-r from-blue-600 to-blue-800 rounded"></div>
            </h2>
            <p className="text-xs leading-relaxed text-gray-700">
              <strong>Backend Development:</strong> I specialize in Go and Rust for building high-performance servers. 
              I have experience with API design, database architecture, and distributed systems.<br /><br />
              
              <strong>Mobile Development:</strong> I use Flutter for cross-platform applications, with additional 
              experience in native iOS (Swift) and Android (Kotlin) development.<br /><br />
              
              <strong>System Design:</strong> I can architect scalable systems, optimize database performance, 
              and implement real-time data processing solutions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CV;