'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Step { id: number; title: string; description?: string }
interface MiniHowItWorksProps { steps?: Step[]; className?: string }

const defaultSteps: Step[] = [
  { id: 1, title: 'First session is Fit-or-Free', description: `If it doesn't feel right, you don't pay, no superbill needed.` },
  { id: 2, title: `If it's a fit, sessions are $150`, description: 'Paid sessions are eligible for a superbill.' },
  { id: 3, title: 'We send your superbill', description: 'You can receive one after each session or monthly.' },
  { id: 4, title: `You submit to your insurer's portal`, description: 'Most plans have an out-of-network submission process.' },
  { id: 5, title: 'Reimbursement (varies by plan)', description: 'Coverage depends on your out-of-network benefits.' },
];

// Tweak these to taste
const VIEW_HEIGHT = 800;        // pinned/sticky viewport height (px)
const SCROLL_DISTANCE = 2000;   // scrub distance for steps (px)
const HANDOFF = 400;            // extra pinned distance after step 5 (px) — no fades, just “hold”

const MiniHowItWorks: React.FC<MiniHowItWorksProps> = ({
  steps = defaultSteps,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);  // tall scroller
  const pinRef = useRef<HTMLDivElement>(null);        // pinned/sticky viewport
  const [activeStep, setActiveStep] = useState(1);
  const [fadeOpacity, setFadeOpacity] = useState(1);

  const [prm, setPrm] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  // reduced motion + breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyPrm = () => setPrm(mq.matches);
    applyPrm();
    mq.addEventListener('change', applyPrm);

    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    onResize();
    window.addEventListener('resize', onResize);

    return () => {
      mq.removeEventListener('change', applyPrm);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useLayoutEffect(() => {
    if (prm || isDesktop === null) return;

    const container = containerRef.current;
    const pinEl = pinRef.current;
    if (!container || !pinEl) return;

    // cleanup any previous triggers from this component
    ScrollTrigger.getAll().forEach(st => {
      if ((st as ScrollTrigger & { __miniHowItWorks?: boolean }).__miniHowItWorks) st.kill();
    });

    const n = steps.length;
    const createSnap = (val: number) => {
      const seg = 1 / (n - 1);
      return Math.round(val / seg) * seg;
    };

    if (isDesktop) {
      // DESKTOP: pin with a “hold” tail (no opacity/transform changes)
      const st = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: `+=${SCROLL_DISTANCE + HANDOFF}`,
        pin: pinEl,
        pinType: 'fixed',     // no transform pinning → avoids sub-pixel jitter
        pinSpacing: true,
        anticipatePin: 1,
        scrub: true,
        snap: {
          // snap only across the usable scrub zone (exclude the handoff)
          snapTo: (val) => {
            const usableRatio = SCROLL_DISTANCE / (SCROLL_DISTANCE + HANDOFF);
            const clamped = Math.min(val, usableRatio - 0.0001);
            return createSnap(clamped);
          },
          duration: 0.45,
          ease: 'power2.out',
        },
        onUpdate: (self) => {
          // Compute progress only over the scrub zone (ignore handoff)
          const total = self.end - self.start;                         // SCROLL_DISTANCE + HANDOFF
          const usable = total - HANDOFF;                              // scrub portion
          const sc = self.scroll() - self.start;
          const p = Math.min(Math.max(sc / usable, 0), 1);

          // Map to step index (1..n)
          const idx = Math.min(n, Math.max(1, Math.round(p * (n - 1)) + 1));
          setActiveStep(idx);

          // Calculate fade opacity based on handoff zone
          const totalProgress = self.progress; // 0 to 1 across entire trigger
          const stepProgress = SCROLL_DISTANCE / (SCROLL_DISTANCE + HANDOFF); // ~0.83

          if (totalProgress > stepProgress) {
            // In handoff zone - fade out
            const handoffProgress = (totalProgress - stepProgress) / (1 - stepProgress);
            setFadeOpacity(1 - handoffProgress);
          } else {
            setFadeOpacity(1);
          }

          // Keep the pinned node free of fractional transforms
          gsap.set(pinEl, { x: 0, y: 0, force3D: false });
        },
      });
      (st as ScrollTrigger & { __miniHowItWorks?: boolean }).__miniHowItWorks = true;
    } else {
      // MOBILE: sticky only; ST just drives progress/snap
      const st = ScrollTrigger.create({
        trigger: container,
        start: 'top center',
        end: `+=${SCROLL_DISTANCE}`,
        scrub: true,
        pin: false,
        snap: {
          snapTo: (val) => {
            // Ensure we can always snap to step 1 (progress 0)
            if (val < 0.1) return 0;
            return createSnap(val);
          },
          duration: 0.6,
          ease: 'power2.out',
        },
        onUpdate: (self) => {
          // Ensure step 1 is shown at the beginning
          const progress = Math.max(0, self.progress);
          const idx = Math.min(n, Math.max(1, Math.round(progress * (n - 1)) + 1));
          setActiveStep(idx);
        },
      });
      (st as ScrollTrigger & { __miniHowItWorks?: boolean }).__miniHowItWorks = true;
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if ((st as ScrollTrigger & { __miniHowItWorks?: boolean }).__miniHowItWorks) st.kill();
      });
    };
  }, [steps.length, prm, isDesktop]);

  const isStepActive = (id: number) => prm || id <= activeStep;
  const isStepCurrent = (id: number) => !prm && id === activeStep;

  const ArrowIcon = ({ className = '' }) => (
    <svg className={`w-6 h-6 ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );

  // Reduced motion: simple static list
  if (prm) {
    return (
      <section className={className}>
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-5xl font-bold">How Superbills Work</h2>
          <p className="text-md md:text-xl">We make superbills easy</p>
        </div>
        <ol className="max-w-3xl mx-auto px-4 space-y-6">
          {steps.map((s) => (
            <li key={s.id} className="flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-white shadow-brutalist font-bold flex-shrink-0">
                {s.id}
              </span>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold mb-1">{s.title}</h3>
                {s.description && (
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    {s.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section className={className}>
      {/* Tall scroller that contains the pinned/sticky viewport */}
      <div
        ref={containerRef}
        style={{ height: VIEW_HEIGHT + SCROLL_DISTANCE + (isDesktop ? HANDOFF : 0) }}
      >
        {/* Viewport (sticky on mobile, pinned on desktop by GSAP) */}
        <div
          ref={pinRef}
          className={`flex flex-col items-center justify-center overflow-hidden ${isDesktop ? '' : 'sticky top-0'}`}
          style={{
            height: VIEW_HEIGHT,
            opacity: isDesktop ? fadeOpacity : 1,
            transition: isDesktop ? 'none' : 'opacity 0.3s ease-out'
          }}
        >
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold">How Superbills Work</h2>
            <p className="text-lg md:text-xl">We make superbills easy</p>
          </div>

          {/* Desktop row */}
          <div className="hidden md:block w-full">
            <div className="flex items-center justify-center gap-8 px-8 max-w-6xl mx-auto">
              {steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <div
                    className="w-48 text-center flex-shrink-0"
                    role="listitem"
                    aria-current={isStepCurrent(step.id) ? 'step' : undefined}
                  >
                    <div
                      className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-black mb-4 md:mb-6 text-3xl font-bold transition-[background-color,box-shadow] duration-200
                      ${isStepCurrent(step.id) ? 'bg-tst-yellow shadow-brutalistLg' : 'bg-white shadow-brutalist'}`}
                    >
                      {step.id}
                    </div>
                    <div className="min-h-24 flex flex-col items-center justify-center">
                      <h3
                        className={`text-lg md:text-xl leading-snug transition-opacity duration-150 mb-2
                        ${isStepCurrent(step.id) ? 'font-bold text-black' : 'font-medium text-gray-700'}`}
                        style={{ opacity: isStepActive(step.id) ? 1 : 0.4 }}
                      >
                        {step.title}
                      </h3>
                      {step.description && (
                        <p
                          className={`text-sm leading-snug transition-opacity duration-150 text-center
                          ${isStepCurrent(step.id) ? 'text-gray-700' : 'text-gray-500'}`}
                          style={{ opacity: isStepActive(step.id) ? 1 : 0.3 }}
                        >
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-shrink-0 text-gray-600 transition-opacity duration-150
                      ${activeStep > step.id ? 'opacity-100' : 'opacity-30'}`}
                      aria-hidden="true"
                    >
                      <ArrowIcon />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Mobile: single step */}
          <div className="md:hidden max-w-xl mx-auto px-4 flex items-center justify-center">
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-black mb-4 text-2xl font-bold
                ${isStepCurrent(activeStep) ? 'bg-tst-yellow shadow-brutalistLg' : 'bg-white shadow-brutalist'}`}
              >
                {activeStep}
              </div>
              <h3 className="text-xl leading-snug font-bold text-black mb-2">
                {steps[activeStep - 1]?.title}
              </h3>
              {steps[activeStep - 1]?.description && (
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {steps[activeStep - 1].description}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Step {activeStep} of {steps.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MiniHowItWorks;
