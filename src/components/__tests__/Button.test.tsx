import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { expect, describe, it } from 'vitest';

describe('Button Component', () => {
  it('renders correctly with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies variant styles correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is accessible with proper ARIA attributes', () => {
    render(
      <Button disabled aria-describedby="button-help">
        Submit
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-describedby', 'button-help');
  });
});
