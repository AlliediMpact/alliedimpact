'use client';

import { useEffect, useRef, useState } from 'react';

function CountUpNumber({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          // Animate counter
          let startTime: number;
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = (currentTime - startTime) / duration;
            
            if (progress < 1) {
              setCount(Math.floor(target * progress));
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return <div ref={ref}>{count}</div>;
}

export default function StatsSection() {
  const stats = [
    {
      value: 10000,
      suffix: '+',
      label: 'Active Users',
      description: 'Trust Allied iMpact',
    },
    {
      value: 50,
      suffix: 'M+',
      label: 'Total Transactions',
      description: 'Processed securely',
      isMoney: true,
    },
    {
      value: 6,
      suffix: '',
      label: 'Products',
      description: 'One platform',
    },
    {
      value: 99.9,
      suffix: '%',
      label: 'Uptime',
      description: 'Always available',
      isDecimal: true,
    },
  ];

  return (
    <section className="w-full py-20 bg-primary-blue text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center space-y-2 py-4 px-2 rounded-lg transition-transform duration-300 hover:scale-105"
            >
              <div className="text-4xl sm:text-5xl font-bold text-primary-purple">
                {stat.isDecimal ? (
                  <>
                    <CountUpNumber target={Math.floor(stat.value)} duration={1500} />
                    .9{stat.suffix}
                  </>
                ) : stat.isMoney ? (
                  <>
                    R<CountUpNumber target={stat.value} duration={1500} />
                    {stat.suffix}
                  </>
                ) : (
                  <>
                    <CountUpNumber target={stat.value} duration={1500} />
                    {stat.suffix}
                  </>
                )}
              </div>
              <div className="text-lg font-semibold">
                {stat.label}
              </div>
              <div className="text-sm text-white/70">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
