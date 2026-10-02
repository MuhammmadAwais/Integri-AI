import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../hooks/useRedux';
import { cn } from '../lib/utils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'data-controller', title: 'Data Controller' },
  { id: 'data-collection', title: 'Data Collection' },
  { id: 'purpose', title: 'Purpose of Data Processing' },
  { id: 'legal-basis', title: 'Legal Basis for Processing' },
  { id: 'cookie-policy', title: 'Cookie Policy' },
  { id: 'openai', title: 'Use of OpenAI’s GPT Models' },
  { id: 'sharing', title: 'Data Sharing' },
  { id: 'retention', title: 'Data Retention' },
  { id: 'rights', title: 'Your Rights Under GDPR' },
  { id: 'security', title: 'Data Security' },
  { id: 'transfers', title: 'International Data Transfers' },
  { id: 'updates', title: 'Changes To Policy & Contact' },
];

interface CardProps {
  children: React.ReactNode;
  className?: string;
  isDark: boolean;
}

const Card = ({ children, className, isDark }: CardProps) => (
  <div className={cn(
    "p-6 rounded-2xl border backdrop-blur-md text-sm md:text-base leading-relaxed",
    isDark ? "bg-white/5 border-white/10" : "bg-white/50 border-gray-200 shadow-sm",
    className
  )}>
    {children}
  </div>
);

const PrivacyPolicy: React.FC = () => {
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(sections[0].id);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.privacy-section');
      
      cards.forEach((card: any) => {
        gsap.fromTo(
          card,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
              scroller: containerRef.current
            }
          }
        );
      });

      ScrollTrigger.create({
        scroller: containerRef.current,
        trigger: "#privacy-content-wrapper",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          gsap.to(progressBarRef.current, { scaleX: self.progress, duration: 0.1, ease: 'none' });
        }
      });
      
      cards.forEach((card: any) => {
        ScrollTrigger.create({
          scroller: containerRef.current,
          trigger: card,
          start: "top 50%",
          end: "bottom 50%",
          onEnter: () => setActiveSection(card.id),
          onEnterBack: () => setActiveSection(card.id),
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    const container = document.getElementById("privacy-scroll-container");
    if (el && container) {
      container.scrollTo({
        top: el.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      id="privacy-scroll-container"
      className={cn(
        "h-full w-full overflow-y-auto custom-scrollbar relative font-sans",
        isDark ? "bg-[#07060A] text-gray-300" : "bg-white text-slate-800"
      )}
    >
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-transparent">
        <div 
          ref={progressBarRef}
          className="h-full bg-blue-500 origin-left"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      <div id="privacy-content-wrapper" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col lg:flex-row gap-12">
        
        <div className="lg:w-1/4 sr-only lg:not-sr-only">
          <div className="sticky top-24">
            <h3 className={cn("text-xs font-semibold tracking-wider uppercase mb-6", isDark ? "text-gray-500" : "text-gray-400")}>Table of Contents</h3>
            <nav className="flex flex-col gap-1 relative border-l border-gray-200 dark:border-white/10">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "text-left text-sm py-2 pl-4 -ml-px border-l-2 transition-colors duration-200",
                    activeSection === section.id 
                      ? "border-blue-500 font-medium " + (isDark ? "text-gray-100" : "text-gray-900")
                      : "border-transparent " + (isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-500 hover:text-gray-800")
                  )}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="lg:hidden w-full overflow-x-auto pb-4 sticky top-0 z-40 backdrop-blur-md pt-4 custom-scrollbar"
             style={{ backgroundColor: isDark ? 'rgba(10,10,10,0.85)' : 'rgba(255,255,255,0.85)' }}>
          <div className="flex gap-2 w-max px-2">
            {sections.map((section) => (
              <button
                key={`mobile-${section.id}`}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors border",
                  activeSection === section.id
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-500"
                    : isDark 
                      ? "bg-white/5 border-white/10 text-gray-400"
                      : "bg-gray-100 border-transparent text-gray-600"
                )}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:w-3/4 pb-24 space-y-12">
           
           <div className="privacy-section scroll-mt-24" id="introduction">
             <h1 className={cn("text-4xl md:text-5xl font-bold tracking-tight mb-4", isDark ? "text-white" : "text-gray-900")}>
               Privacy Policy
             </h1>
             <p className="text-sm opacity-70 mb-8">Last Updated: October 2024</p>
             <Card isDark={isDark}>
               <p>This Privacy Policy outlines how we collect, use, and protect your personal data in compliance with the General Data Protection Regulation (GDPR).</p>
             </Card>
           </div>

           <section id="data-controller" className="privacy-section scroll-mt-24">
              <h2 className={cn("text-2xl font-semibold mb-6", isDark ? "text-gray-100" : "text-gray-800")}>Data Controller</h2>
              <Card isDark={isDark}>
                 <p className="mb-2">The data controller for the Website and App is:</p>
                 <p className="font-medium text-lg mb-1">Integri</p>
                 <p>Email: <a href="mailto:info@integri.app" className="text-blue-500 hover:underline">info@integri.app</a></p>
              </Card>
           </section>

           <section id="data-collection" className="privacy-section scroll-mt-24">
              <h2 className={cn("text-2xl font-semibold mb-6", isDark ? "text-gray-100" : "text-gray-800")}>Data Collection</h2>
              <div className="space-y-4">
                <Card isDark={isDark}>
                  <h3 className={cn("font-medium mb-2", isDark ? "text-gray-200" : "text-gray-800")}>User-provided data:</h3>
                  <p>Information you provide directly, such as your name, email address, and any other details you choose to share.</p>
                </Card>
                <Card isDark={isDark}>
                  <h3 className={cn("font-medium mb-2", isDark ? "text-gray-200" : "text-gray-800")}>Usage data:</h3>
                  <p>Information about how you interact with the Website and App, including device type, operating system, app version, session duration, features used, and general interaction patterns.</p>
                </Card>
                <Card isDark={isDark}>
                  <h3 className={cn("font-medium mb-2", isDark ? "text-gray-200" : "text-gray-800")}>Cookies and tracking data:</h3>
                  <p>Information collected through cookies and similar technologies as described below.</p>
                </Card>
              </div>
           </section>

           <section id="purpose" className="privacy-section scroll-mt-24">
              <h2 className={cn("text-2xl font-semibold mb-6", isDark ? "text-gray-100" : "text-gray-800")}>Purpose of Data Processing</h2>
              <Card isDark={isDark}>
                <p className="mb-4">We process your personal data for the following purposes:</p>
                <ul className="list-disc pl-5 space-y-2 marker:text-blue-500">
                  <li>Providing and improving the Website & App functionality</li>
                  <li>Delivering AI-powered services</li>
                  <li>Customer support</li>
                  <li>Analytics and performance monitoring</li>
                  <li>Advertising and monetization</li>
                  <li>Legal compliance</li>
                </ul>
              </Card>
           </section>

           <section id="legal-basis" className="privacy-section scroll-mt-24">
              <h2 className={cn("text-2xl font-semibold mb-6", isDark ? "text-gray-100" : "text-gray-800")}>Legal Basis for Processing</h2>
              <Card isDark={isDark}>
                <p className="mb-4">We process personal data based on:</p>
                <ul className="list-disc pl-5 space-y-2 marker:text-blue-500 mb-6">
                  <li><strong>Consent</strong> (e.g., cookies, personalized ads)</li>
                  <li><strong>Contractual necessity</strong> (to provide services you request)</li>
                  <li><strong>Legitimate interests</strong> (service improvement, fraud prevention, security)</li>
                </ul>
                <p className="text-sm italic opacity-80 border-t pt-4 border-gray-200 dark:border-gray-800">You may withdraw consent at any time where processing is based on consent.</p>
              </Card>
           </section>

           <section id="cookie-policy" className="privacy-section scroll-mt-24">
              <h2 className={cn("text-3xl font-bold mb-8", isDark ? "text-white" : "text-gray-900")}>Cookie Policy</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className={cn("text-xl font-semibold mb-4", isDark ? "text-gray-200" : "text-gray-800")}>What Are Cookies?</h3>
                  <Card isDark={isDark}>
                    <p className="mb-4">Cookies are small data files stored on your device when you visit a website. They help websites function properly, improve performance, and support analytics and advertising.</p>
                    <p className="mb-2">We may also use similar technologies such as:</p>
                    <ul className="list-disc pl-5 space-y-1 marker:text-blue-500">
                      <li>Local storage</li>
                      <li>Mobile advertising identifiers</li>
                      <li>Tracking pixels</li>
                      <li>Web beacons</li>
                    </ul>
                  </Card>
                </div>

                <div>
                  <h3 className={cn("text-xl font-semibold mb-4", isDark ? "text-gray-200" : "text-gray-800")}>Types of Cookies We Use</h3>
                  
                  <div className="space-y-4">
                    <Card isDark={isDark}>
                      <h4 className={cn("font-medium text-base mb-2", isDark ? "text-gray-200" : "text-gray-800")}>1. Essential Cookies</h4>
                      <p className="mb-3">These cookies are necessary for the Website to function properly. They enable:</p>
                      <ul className="list-disc pl-5 space-y-1 marker:text-blue-500 mb-3 text-sm">
                        <li>Secure login and sessions</li>
                        <li>Payment processing</li>
                        <li>Security and fraud prevention</li>
                      </ul>
                      <p className="text-xs font-medium text-red-500 dark:text-red-400">These cookies cannot be disabled.</p>
                    </Card>

                    <Card isDark={isDark}>
                      <h4 className={cn("font-medium text-base mb-2", isDark ? "text-gray-200" : "text-gray-800")}>2. Performance & Analytics Cookies</h4>
                      <p className="mb-3">These cookies help us understand how users interact with our Website and App, including:</p>
                      <ul className="list-disc pl-5 space-y-1 marker:text-blue-500 mb-3 text-sm">
                        <li>Pages visited</li>
                        <li>Time spent</li>
                        <li>Feature usage</li>
                        <li>Crash reports and diagnostics</li>
                      </ul>
                      <p className="text-sm">This data helps us improve performance and user experience.</p>
                    </Card>

                    <Card isDark={isDark}>
                      <h4 className={cn("font-medium text-base mb-2", isDark ? "text-gray-200" : "text-gray-800")}>3. Advertising Cookies and Identifiers</h4>
                      <p className="mb-3">We may use advertising cookies and mobile identifiers to:</p>
                      <ul className="list-disc pl-5 space-y-1 marker:text-blue-500 mb-4 text-sm">
                        <li>Display relevant advertisements</li>
                        <li>Limit repetitive ads</li>
                        <li>Measure advertising effectiveness</li>
                        <li>Detect fraud</li>
                      </ul>
                      <p className="mb-2">Third-party advertising partners (such as Google AdMob or similar providers) may collect:</p>
                      <ul className="list-disc pl-5 space-y-1 marker:text-blue-500 mb-4 text-sm">
                         <li>Device identifiers</li>
                         <li>Advertising IDs</li>
                         <li>IP address</li>
                         <li>App interaction data</li>
                      </ul>
                      <p className="text-sm italic opacity-80 border-t pt-3 border-gray-200 dark:border-gray-800">These partners process data according to their own privacy policies.</p>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className={cn("text-xl font-semibold mb-4", isDark ? "text-gray-200" : "text-gray-800")}>How You Can Control Cookies</h3>
                  <Card isDark={isDark}>
                    <p className="mb-4">You can control cookies by:</p>
                    <ul className="list-disc pl-5 space-y-2 marker:text-blue-500 mb-4">
                      <li>Using our cookie consent banner (for Website users)</li>
                      <li>Adjusting your browser settings</li>
                      <li>Managing advertising preferences in your device settings (e.g., limiting ad tracking)</li>
                    </ul>
                    <p className="text-sm italic">Disabling certain cookies may affect functionality.</p>
                  </Card>
                </div>
              </div>
           </section>

           <section id="openai" className="privacy-section scroll-mt-24">
              <h2 className={cn("text-2xl font-semibold mb-6", isDark ? "text-gray-100" : "text-gray-800")}>Use of OpenAI’s GPT Models</h2>
              <Card isDark={isDark}>
                <p className="mb-4">The App uses OpenAI’s GPT models to provide AI-driven services.</p>
                <ul className="list-disc pl-5 space-y-2 marker:text-blue-500">
                  <li>Input data is processed solely to generate responses.</li>
                  <li>API data is not used by OpenAI to train models.</li>
                  <li>We avoid unnecessary processing of sensitive personal data.</li>
                </ul>
              </Card>
           </section>

           <section id="sharing" className="privacy-section scroll-mt-24">
              <h2 className={cn("text-2xl font-semibold mb-6", isDark ? "text-gray-100" : "text-gray-800")}>Data Sharing</h2>
              <Card isDark={isDark}>
                <p className="font-semibold mb-4 text-red-500 dark:text-red-400">We do not sell your personal data.</p>
                <p className="mb-3">We may share data only as necessary to:</p>
                <ul className="list-disc pl-5 space-y-2 marker:text-blue-500 mb-6">
                  <li>Provide AI services</li>
                  <li>Process payments</li>
                  <li>Serve advertisements</li>
                  <li>Provide analytics</li>
                  <li>Comply with legal obligations</li>
                </ul>
                <p className="text-sm italic opacity-80 border-t pt-4 border-gray-200 dark:border-gray-800">All partners are required to comply with applicable data protection laws.</p>
              </Card>
           </section>

           <section id="retention" className="privacy-section scroll-mt-24">
              <h2 className={cn("text-2xl font-semibold mb-6", isDark ? "text-gray-100" : "text-gray-800")}>Data Retention</h2>
              <Card isDark={isDark}>
                <p className="mb-4">We retain personal data only as long as necessary for the purposes described in this Privacy Policy or as required by law.</p>
                <p>Advertising and analytics data retention may follow the policies of respective service providers.</p>
              </Card>
           </section>

           <section id="rights" className="privacy-section scroll-mt-24">
              <h2 className={cn("text-2xl font-semibold mb-6", isDark ? "text-gray-100" : "text-gray-800")}>Your Rights Under GDPR</h2>
              <Card isDark={isDark}>
                <p className="mb-4">You have the right to:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6 text-sm">
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Access your data</div>
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Correct inaccurate data</div>
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Request erasure ("right to be forgotten")</div>
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Restrict processing</div>
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Data portability</div>
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Object to processing</div>
                  <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Withdraw consent at any time</div>
                </div>
                
                <p className="mb-4">To exercise your rights, contact: <a href="mailto:info@integri.app" className="text-blue-500 hover:underline">info@integri.app</a></p>
                <p className="text-sm italic opacity-80 border-t pt-4 border-gray-200 dark:border-gray-800">You also have the right to lodge a complaint with your supervisory authority.</p>
              </Card>
           </section>

           <section id="security" className="privacy-section scroll-mt-24">
              <h2 className={cn("text-2xl font-semibold mb-6", isDark ? "text-gray-100" : "text-gray-800")}>Data Security</h2>
              <Card isDark={isDark}>
                <p>We implement appropriate technical and organizational measures to protect your data from unauthorized access, alteration, disclosure, or destruction.</p>
              </Card>
           </section>

           <section id="transfers" className="privacy-section scroll-mt-24">
              <h2 className={cn("text-2xl font-semibold mb-6", isDark ? "text-gray-100" : "text-gray-800")}>International Data Transfers</h2>
              <Card isDark={isDark}>
                <p className="mb-4">If data is transferred outside the European Economic Area (EEA), we ensure appropriate safeguards such as:</p>
                <ul className="list-disc pl-5 space-y-2 marker:text-blue-500">
                  <li>Standard Contractual Clauses (SCCs)</li>
                  <li>Adequacy decisions</li>
                  <li>Other lawful mechanisms</li>
                </ul>
              </Card>
           </section>

           <section id="updates" className="privacy-section scroll-mt-24">
              <h2 className={cn("text-2xl font-semibold mb-6", isDark ? "text-gray-100" : "text-gray-800")}>Changes to This Privacy Policy</h2>
              <div className="space-y-6">
                <Card isDark={isDark}>
                  <p>We may update this Privacy Policy from time to time. Updates will be published within the App and on the Website.</p>
                </Card>
                
                <div>
                   <h3 className={cn("text-xl font-semibold mb-4", isDark ? "text-gray-200" : "text-gray-800")}>Contact</h3>
                   <Card isDark={isDark}>
                     <p className="mb-2">If you have questions about this Privacy Policy or our data practices, contact:</p>
                     <p className="font-medium">Integri</p>
                     <p>Email: <a href="mailto:info@integri.app" className="text-blue-500 hover:underline">info@integri.app</a></p>
                   </Card>
                </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
