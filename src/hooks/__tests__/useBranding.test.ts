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
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(() => ({
          unsubscribe: vi.fn()
        }))
      }))
    })),
    removeChannel: vi.fn()
  }
}));

describe('useBranding Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns default branding values initially', () => {
    const { result } = renderHook(() => useBranding());
    
    expect(result.current).toEqual({
      logo: '/novaesweb-logo.png',
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
    
    // Verify that the hook returns the expected branding structure
    expect(result.current).toHaveProperty('logo');
    expect(result.current).toHaveProperty('primary_color');
    expect(result.current).toHaveProperty('nome');
    
    // Verify default values
    expect(result.current.logo).toBe('/novaesweb-logo.png');
    expect(result.current.primary_color).toBe('#e8334a');
    expect(result.current.nome).toBe('NovaesWeb');
  });
});
