import { useEffect } from 'react';

const useInterceptCalendlyAnalytics = () => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://calendly.com') return;

      if (event.data?.event === 'calendly.event_scheduled') {
        window.gtag?.('event', 'calendly_event_scheduled', {
          event_category: 'Calendly',
          event_label: 'Scheduled via Embedded Calendly',
        });
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
};

export default useInterceptCalendlyAnalytics;
