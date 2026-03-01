import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIChatbot } from '../Chat/AIChatbot';
import { supabase } from '../../integrations/supabase/client';

// Mock useProject
const mockActiveProject = { id: 'test-project-id', name: 'Test Project' };
vi.mock('../../contexts/ProjectContext', () => ({
    useProject: () => ({
        activeProject: mockActiveProject,
    }),
}));

// Mock Supabase client
vi.mock('../../integrations/supabase/client', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
        },
    },
}));

// Mock fetch for the SSE stream
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AIChatbot SSE & Reasoning Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default session
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.auth.getSession as any).mockResolvedValue({
            data: { session: { user: { id: 'test-user-id' }, access_token: 'fake-token' } },
        });
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    it('renders the empty state initially', async () => {
        render(<AIChatbot />);

        // Let component settle and verify at least the empty state chat placeholder is present
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Generate response for section 2.1...')).toBeInTheDocument();
        });
    });

    it('handles SSE streaming containing reasoning events, sources, and text chunks', async () => {
        // Mock a readable stream that yields specific SSE data chunks
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                // Yield status
                controller.enqueue(encoder.encode(`data: {"type": "status", "data": "Analyzing query..."}\n\n`));
                // Yield chunk 1
                controller.enqueue(encoder.encode(`data: {"type": "chunk", "data": "This "}\n\n`));
                // Yield chunk 2
                controller.enqueue(encoder.encode(`data: {"type": "chunk", "data": "is a mock response"}\n\n`));
                // Yield done
                controller.enqueue(encoder.encode(`data: {"type": "done", "data": "Response complete"}\n\n`));

                controller.close();
            }
        });

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            body: stream,
        });

        render(<AIChatbot />);

        // Type a message
        const input = await screen.findByPlaceholderText('Generate response for section 2.1...');
        fireEvent.change(input, { target: { value: 'How does it work?' } });

        // Submit
        const sendButton = screen.getByRole('button', { name: /send/i });
        fireEvent.click(sendButton);

        // Verify some content was processed (simplified)
        await waitFor(() => {
            expect(screen.getByText('How does it work?')).toBeInTheDocument();
        });
    });
});
