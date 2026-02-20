import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Navbar from "../Navbar.tsx";
import { BrowserRouter } from "react-router-dom";

// Mock useAuth
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    role: null,
    signOut: vi.fn(),
  }),
}));

describe("Navbar", () => {
  it("renders mobile menu button with accessible name", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // The button exists but is hidden on desktop via CSS.
    // In JSDOM with Tailwind, classes don't automatically hide elements unless we load the CSS and checking visibility is tricky.
    // However, we just want to check if the accessible name exists on the button that has the Menu icon.

    // This should FAIL because the button doesn't have an aria-label
    expect(screen.getByLabelText(/Toggle navigation menu/i)).toBeInTheDocument();
  });
});
