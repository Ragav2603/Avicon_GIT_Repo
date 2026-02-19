import { renderHook, act } from '@testing-library/react';
import { useToast, toast } from '../use-toast.ts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should remove dismissed toast after delay', () => {
    const { result } = renderHook(() => useToast());

    // Add a toast
    let toastId: string;
    act(() => {
      const t = toast({ title: "Test Toast" });
      toastId = t.id;
    });

    // Verify it's there
    expect(result.current.toasts.find((t) => t.id === toastId)).toBeDefined();
    expect(result.current.toasts.find((t) => t.id === toastId)?.open).toBe(true);

    // Dismiss it
    act(() => {
      result.current.dismiss(toastId!);
    });

    // Verify it's closed but still there (waiting for animation/cleanup)
    expect(result.current.toasts.find((t) => t.id === toastId)).toBeDefined();
    expect(result.current.toasts.find((t) => t.id === toastId)?.open).toBe(false);

    // Fast forward 5000ms (the expected delay)
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Verify it's gone
    expect(result.current.toasts.find((t) => t.id === toastId)).toBeUndefined();
  });
});
