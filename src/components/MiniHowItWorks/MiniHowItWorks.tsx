'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HandCoins } from 'lucide-react';
gsap.registerPlugin(ScrollTrigger);

interface Step {
  id: number;
  title: string;
  description?: string;
}
interface MiniHowItWorksProps {
  steps?: Step[];
  className?: string;
}

const defaultSteps: Step[] = [
  {
    id: 1,
    title: 'First session is Fit-or-Free',
    description: `If it doesn't feel right, you don't pay, no superbill needed.`,
  },
  {
    id: 2,
    title: `If it's a fit, sessions are $150`,
    description: 'Paid sessions are eligible for a superbill.',
  },
  {
    id: 3,
    title: 'We send your superbill',
    description: 'You can receive one after each session or monthly.',
  },
  {
    id: 4,
    title: `You submit to your insurer's portal`,
    description: 'Most plans have an out-of-network submission process.',
  },
  {
    id: 5,
    title: 'Reimbursement (varies by plan)',
    description: 'Coverage depends on your out-of-network benefits.',
  },
];

// Layout & scroll tuning
const CARD_HEIGHT = 500; // visual card height in px (the white box)
const CARD_HEIGHT_MOBILE = 450; // visual card height in px (the white box)

const SCROLL_DISTANCE = 2000; // scrub distance for steps in px
const HANDOFF = 400; // extra pinned distance after step 5 in px (desktop)

const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

const MiniHowItWorks: React.FC<MiniHowItWorksProps> = ({
  steps = defaultSteps,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(1);

  const [fadeOpacity, setFadeOpacity] = useState(1);
  const [prm, setPrm] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  // watch reduced motion + breakpoint
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

    // clean any previous triggers from this component
    ScrollTrigger.getAll().forEach(st => {
      if (
        (st as ScrollTrigger & { __miniHowItWorks?: boolean }).__miniHowItWorks
      )
        st.kill();
    });

    const n = steps.length;
    const seg = 1 / (n - 1);
    const snapToNearest = (val: number) => Math.round(val / seg) * seg;

    if (isDesktop) {
      // Desktop: pinned viewport (full screen height), no fades, fixed pin (no transform jitter)
      const st = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: `+=${SCROLL_DISTANCE + HANDOFF}`,
        pin: pinEl,
        pinType: 'fixed',
        pinSpacing: true,
        anticipatePin: 1,
        scrub: true,
        snap: {
          // snap across scrub portion only (exclude handoff)
          snapTo: val => {
            const usableRatio = SCROLL_DISTANCE / (SCROLL_DISTANCE + HANDOFF);
            const clamped = Math.min(val, usableRatio - 0.0001);
            return snapToNearest(clamped);
          },
          duration: 0.45,
          ease: 'power2.out',
        },
        onUpdate: self => {
          const total = self.end - self.start; // SCROLL_DISTANCE + HANDOFF
          const usable = total - HANDOFF; // scrub portion
          const sc = self.scroll() - self.start;
          const p = clamp(sc / usable, 0, 1);

          // map progress → step index 1..n
          const idx = Math.min(n, Math.max(1, Math.round(p * (n - 1)) + 1));
          setActiveStep(idx);

          // --- desktop fade only on the way OUT (scrolling down) ---
          const totalProgress = self.progress; // 0..1 over whole trigger
          const stepProgress = SCROLL_DISTANCE / (SCROLL_DISTANCE + HANDOFF); // ≈ 0.83

          if (totalProgress <= stepProgress || self.direction === -1) {
            // Before handoff OR scrolling back up → keep fully visible
            setFadeOpacity(1);
          } else {
            // In handoff AND scrolling down → fade from 1 → 0
            const t = (totalProgress - stepProgress) / (1 - stepProgress); // 0..1 in handoff
            setFadeOpacity(1 - t);
          }

          // keep pinned node free of fractional transforms
          gsap.set(pinEl, { x: 0, y: 0, force3D: false });
        },
      });
      (st as ScrollTrigger & { __miniHowItWorks?: boolean }).__miniHowItWorks =
        true;

      // avoid sub-pixel layout summary
      // gsap.config({ autoRound: true });
    } else {
      // Mobile: sticky viewport; “dead zone” at the start so Step 1 doesn't get skipped
      const DEAD_ZONE = 0.14; // first ~14% stays at step 1

      const st = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: `+=${SCROLL_DISTANCE}`,
        scrub: true,
        pin: false,
        snap: {
          snapTo: val => {
            if (val <= DEAD_ZONE) return 0; // lock to step 1 early
            const adj = (val - DEAD_ZONE) / (1 - DEAD_ZONE); // remap remaining [DEAD_ZONE..1] -> [0..1]
            return snapToNearest(adj) * (1 - DEAD_ZONE) + DEAD_ZONE;
          },
          duration: 0.35,
          ease: 'power2.out',
          inertia: false, // ignore touch momentum
        },
        onUpdate: self => {
          const pRaw = clamp(self.progress, 0, 1);
          const p =
            pRaw <= DEAD_ZONE ? 0 : (pRaw - DEAD_ZONE) / (1 - DEAD_ZONE);
          const idx = Math.min(n, Math.max(1, Math.round(p * (n - 1)) + 1));
          setActiveStep(idx);
        },
      });
      (st as ScrollTrigger & { __miniHowItWorks?: boolean }).__miniHowItWorks =
        true;
    }
  }, [steps.length, prm, isDesktop]);

  const isStepActive = (id: number) => prm || id <= activeStep;
  const isStepCurrent = (id: number) => !prm && id === activeStep;

  const ArrowIcon = ({ className = '' }) => (
    <svg
      className={`w-6 h-6 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5l7 7-7 7"
      />
    </svg>
  );

  // Reduced motion: simple static list
  if (prm) {
    return (
      <section className={className}>
        <div className="bg-white border-2 border-black shadow-brutalist rounded-lg mx-4 p-6 md:p-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-5xl font-bold">
              How Superbills Work
            </h2>
            <p className="text-md md:text-xl">We make superbills easy</p>
          </div>
          <ol className="max-w-3xl mx-auto px-4 space-y-6">
            {steps.map(s => (
              <li key={s.id} className="flex items-start gap-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-white shadow-brutalist font-bold flex-shrink-0">
                  {s.id}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold mb-1">
                    {s.title}
                  </h3>
                  {s.description && (
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                      {s.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      {/* Tall scroller that contains the pinned/sticky viewport */}
      <div
        ref={containerRef}
        style={{
          height: `calc(100vh + ${SCROLL_DISTANCE}px + ${isDesktop ? HANDOFF : 0}px)`,
        }}
      >
        {/* Viewport: pinned (desktop) / sticky (mobile) — always full screen height */}
        <div
          ref={pinRef}
          className={`flex items-center justify-center overflow-hidden ${isDesktop ? '' : 'sticky top-0'}`}
          style={{ height: '100vh' }}
        >
          {/* Center the fixed-height card inside the full-height viewport */}
          <div className="w-full flex items-center justify-center px-4">
            <div
              className="bg-white border-2 border-black shadow-brutalist rounded-lg
             w-full max-w-[1100px] mx-auto overflow-visible
             px-4 md:px-16 py-6 md:py-8"
              style={{
  minHeight: isDesktop ? CARD_HEIGHT : CARD_HEIGHT_MOBILE,
  opacity: fadeOpacity,
}}
            >
              <div className="text-center mb-6 md:mb-10">

               <div
  className={`max-w-18 inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-black bg-tst-green shadow-brutalist mb-4`}
>
  <span className="flex items-center justify-center gap-2 text-sm md:text-base font-medium">
    <HandCoins />
    <span>Insurance reimbursements</span>
  </span>
</div>

<h2 className="text-2xl sm:text-3xl md:text-5xl font-bold">
  How Superbills Work
</h2>
<p className="text-lg md:text-xl">We make superbills easy</p>
              </div>

              {/* Desktop row */}
              <div className="hidden md:block w-full">
                <div className="flex flex-wrap items-center justify-center gap-8 px-8">
                  {steps.map((step, idx) => (
                    <React.Fragment key={step.id}>
                      <div
                        className="w-48 text-center flex-shrink-0 flex flex-col items-center"
                        role="listitem"
                        aria-current={
                          isStepCurrent(step.id) ? 'step' : undefined
                        }
                      >
                        <div
                          className={`flex items-center justify-center w-20 h-20 rounded-full border-4 border-black mb-4 md:mb-6 text-3xl font-bold transition-[background-color,box-shadow] duration-200
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
                              style={{
                                opacity: isStepActive(step.id) ? 1 : 0.3,
                              }}
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
          {/* /card center */}
        </div>
      </div>
    </section>
  );
};

export default MiniHowItWorks;
