import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBranding } from '@/hooks/useBranding';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        in: vi.fn(() => ({
          data: [
            { key: 'logo', value: '/test-logo.png' },
            { key: 'primary_color', value: '#ff0000' },
            { key: 'nome', value: 'Test Brand' }
          ]
        }))
      }))
    }))
  }
}));

describe('useBranding Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns default branding values initially', () => {
    const { result } = renderHook(() => useBranding());
    
    expect(result.current).toEqual({
      logo: '/novaesweb-v10-seal-final.png',
      primary_color: '#e8334a',
      nome: 'NovaesWeb'
    });
  });

  it('fetches branding from Supabase on mount', async () => {
    const { result } = renderHook(() => useBranding());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current).toEqual({
      logo: '/test-logo.png',
      primary_color: '#ff0000',
      nome: 'Test Brand'
    });
  });

  it('applies theme correctly', () => {
    const mockSetProperty = vi.fn();
    Object.defineProperty(document.documentElement.style, 'setProperty', {
      value: mockSetProperty,
      writable: true
    });

    const { result } = renderHook(() => useBranding());
    
    act(() => {
      // Access the applyTheme function from the hook implementation
      const hookInstance = result.current as any;
      if (hookInstance.applyTheme) {
        hookInstance.applyTheme('#ff0000');
      }
    });
    
    expect(mockSetProperty).toHaveBeenCalledWith('--primary', '0 100% 50%');
    expect(mockSetProperty).toHaveBeenCalledWith('--ring', '0 100% 50%');
  });
});
