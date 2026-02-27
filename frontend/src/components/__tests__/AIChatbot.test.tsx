import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIChatbot } from '../Chat/AIChatbot';
import { supabase } from '../../integrations/supabase/client';

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
        (supabase.auth.getSession as any).mockResolvedValue({
            data: { session: { user: { id: 'test-user-id' }, access_token: 'fake-token' } },
        });
    });

    it('renders the empty state initially', async () => {
        render(<AIChatbot />);

        // Wait for the initial project ID loading to settle
        await waitFor(() => {
            expect(screen.getByText('Project Context Initialized')).toBeInTheDocument();
            expect(screen.getByText(/Upload RFP documents/)).toBeInTheDocument();
        });
    });

    it('handles SSE streaming containing reasoning events, sources, and text chunks', async () => {
        // Mock a readable stream that yields specific SSE data chunks
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                // Yield status
                controller.enqueue(encoder.encode(`data: {"type": "status", "data": "Analyzing query..."}\n\n`));
                // Yield sources
                controller.enqueue(encoder.encode(`data: {"type": "sources", "data": [{"source": "test_doc.pdf", "snippet": "Test snippet info"}]}\n\n`));
                // Yield chunk 1
                controller.enqueue(encoder.encode(`data: {"type": "chunk", "data": "This "}\n\n`));
                // Yield chunk 2
                controller.enqueue(encoder.encode(`data: {"type": "chunk", "data": "is a mock "}\n\n`));
                // Yield chunk 3
                controller.enqueue(encoder.encode(`data: {"type": "chunk", "data": "response."}\n\n`));
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
        const input = screen.getByPlaceholderText('Generate response for section 2.1...');
        fireEvent.change(input, { target: { value: 'How does it work?' } });

        // Submit
        const sendButton = screen.getByRole('button', { name: /send/i }); // Fallback to accessible pattern or icon role if no explicit label. The actual button lacks an aria-label in the final iteration, wait, let me check the button content, it has an svg. Let's use getByPlaceholderText or fireEvent.keyDown instead.
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

        // User message should appear
        expect(screen.getByText('How does it work?')).toBeInTheDocument();

        // Wait for reasoning log to appear
        await waitFor(() => {
            expect(screen.getByText('Reasoning Trace')).toBeInTheDocument();
            expect(screen.getByText('Analyzing query...')).toBeInTheDocument();
        });

        // Wait for sources to appear
        await waitFor(() => {
            expect(screen.getByText('Sources Extracted From')).toBeInTheDocument();
            expect(screen.getByText('test_doc.pdf')).toBeInTheDocument();
        });

        // The chunks should be concatenated and rendered in the textarea (EditableResponse)
        await waitFor(() => {
            const textArea = screen.getAllByRole('textbox').find(t => t.textContent === 'This is a mock response.');
            // In React Testing Library, textareas might need slightly different querying depending on value vs textContent.
            // Let's just find by display value since it's an editable text area.
            expect(screen.getByDisplayValue('This is a mock response.')).toBeInTheDocument();
        });
    });
});
