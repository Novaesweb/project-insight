// Accessibility utilities and constants

export const ARIA_LABELS = {
  navigation: {
    main: 'Navegação principal',
    menu: 'Menu principal',
    toggle: 'Alternar menu',
    close: 'Fechar menu',
    skip: 'Pular para o conteúdo principal',
  },
  forms: {
    required: 'Campo obrigatório',
    optional: 'Campo opcional',
    error: 'Erro no campo',
    success: 'Campo válido',
    loading: 'Carregando...',
  },
  buttons: {
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    add: 'Adicionar',
    search: 'Buscar',
    filter: 'Filtrar',
    close: 'Fechar',
    confirm: 'Confirmar',
  },
  tables: {
    sort: 'Ordenar',
    sortAsc: 'Ordenar crescente',
    sortDesc: 'Ordenar decrescente',
    previous: 'Página anterior',
    next: 'Próxima página',
    rows: 'Linhas por página',
  },
  status: {
    loading: 'Carregando',
    error: 'Erro',
    success: 'Sucesso',
    warning: 'Atenção',
    info: 'Informação',
  },
} as const;

export const KEYBOARD_NAVIGATION = {
  keys: {
    enter: 'Enter',
    space: ' ',
    escape: 'Escape',
    tab: 'Tab',
    arrows: {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
    },
    home: 'Home',
    end: 'End',
    pageUp: 'PageUp',
    pageDown: 'PageDown',
  },
  actions: {
    activate: ['Enter', ' '],
    close: ['Escape'],
    next: ['Tab', 'ArrowDown'],
    previous: ['Tab', 'ArrowUp'],
    first: ['Home'],
    last: ['End'],
  },
} as const;

// Focus management utilities
export const focusManagement = {
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  },

  restoreFocus: (element: HTMLElement) => {
    setTimeout(() => element.focus(), 100);
  },

  setFocus: (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  },
};

// Screen reader announcements
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Color contrast checker
export const checkColorContrast = (foreground: string, background: string): number => {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

export const hasGoodContrast = (foreground: string, background: string): boolean => {
  const ratio = checkColorContrast(foreground, background);
  return ratio >= 4.5; // WCAG AA standard
};

// Skip link generator
export const createSkipLink = (targetId: string, text: string = 'Pular para o conteúdo principal') => {
  const link = document.createElement('a');
  link.href = `#${targetId}`;
  link.textContent = text;
  link.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50';
  link.setAttribute('aria-label', text);
  
  return link;
};

// Heading level validator
export const validateHeadingLevels = (container: HTMLElement) => {
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const levels: number[] = [];
  
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    levels.push(level);
  });

  const issues: string[] = [];
  let previousLevel = 0;

  levels.forEach((level, index) => {
    if (index === 0 && level !== 1) {
      issues.push(`Primeiro heading deve ser h1, encontrado h${level}`);
    }
    
    if (level > previousLevel + 1) {
      issues.push(`Salto de nível detectado: h${previousLevel} para h${level}`);
    }
    
    previousLevel = level;
  });

  return issues;
};

// Alt text generator for images
export const generateAltText = (context: string, isDecorative: boolean = false): string => {
  if (isDecorative) return '';
  
  const altTexts: Record<string, string> = {
    logo: 'Logo da NovaesWeb',
    avatar: 'Foto de perfil do usuário',
    hero: 'Imagem principal ilustrando os serviços da NovaesWeb',
    chart: 'Gráfico mostrando dados e estatísticas',
    screenshot: 'Captura de tela da interface do sistema',
    icon: 'Ícone decorativo',
  };

  return altTexts[context] || 'Imagem ilustrativa';
};

// Form validation accessibility
export const createAccessibleValidation = (fieldName: string, isValid: boolean, message?: string) => {
  const validation = {
    'aria-invalid': (!isValid).toString(),
    'aria-describedby': isValid ? undefined : `${fieldName}-error`,
  };

  if (!isValid && message) {
    announceToScreenReader(`Erro no campo ${fieldName}: ${message}`, 'assertive');
  }

  return validation;
};

// Responsive table accessibility
export const makeTableAccessible = (tableId: string) => {
  const table = document.getElementById(tableId);
  if (!table) return;

  // Add table caption
  if (!table.querySelector('caption')) {
    const caption = document.createElement('caption');
    caption.textContent = 'Tabela de dados';
    caption.className = 'sr-only';
    table.insertBefore(caption, table.firstChild);
  }

  // Add scope to headers
  const headers = table.querySelectorAll('th');
  headers.forEach(header => {
    if (!header.hasAttribute('scope')) {
      header.setAttribute('scope', 'col');
    }
  });

  // Make table responsive
  const wrapper = document.createElement('div');
  wrapper.className = 'table-wrapper';
  wrapper.setAttribute('role', 'region');
  wrapper.setAttribute('aria-label', 'Tabela rolável');
  table.parentNode?.insertBefore(wrapper, table);
  wrapper.appendChild(table);
};
