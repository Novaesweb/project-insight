// Sistema de Monitoramento - Performance e Error Tracking

// Configuração do monitoramento para produção
export const initMonitoring = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('Monitoring initialized in production');
    
    // Adicionar monitoramento de performance
    if ('performance' in window) {
      // Monitorar Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('Navigation Performance:', {
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['navigation'] });
    }
    
    // Error tracking global
    window.addEventListener('error', (event) => {
      console.error('Global error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });
  }
};

// Contexto do usuário para tracking
export const getUserContext = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return {
    id: user.id || 'anonymous',
    email: user.email || 'anonymous',
    role: user.role || 'guest',
    segment: user.segment || 'unknown'
  };
};

// Performance metrics customizadas
export const trackPerformance = (name: string, value: number, unit: string = 'ms') => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`Performance Metric: ${name}`, { value, unit });
    
    // Enviar para analytics quando disponível
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'performance_metric', {
        event_category: 'Performance',
        event_label: name,
        value: value,
        custom_parameter: unit
      });
    }
  }
};

// Track de eventos de negócio
export const trackBusinessEvent = (action: string, category: string, label?: string, value?: number) => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`Business Event: ${action}`, { category, label, value });
    
    // Google Analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  }
};

// Monitoramento de Web Vitals
export const reportWebVitals = (metric: any) => {
  if (process.env.NODE_ENV === 'production') {
    const { name, value, rating } = metric;
    console.log(`Web Vital: ${name}`, { value, rating });
    
    // Enviar para Google Analytics
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'web_vital', {
        event_category: 'Web Vitals',
        event_label: name,
        value: Math.round(value),
        custom_parameter: rating
      });
    }
  }
};
