import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Footer from "../Footer.tsx";
import { BrowserRouter } from "react-router-dom";

describe("Footer", () => {
  it("renders social media links with accessible names", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    // We expect some links to exist, but specifically we want to check the icon-only ones.
    // The social links are usually the first ones or we can check by href if we knew it.
    // But better yet, we can try to find them by their accessible name and expect it to fail if missing.

    // These should FAIL currently
    expect(screen.getByLabelText(/LinkedIn/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Twitter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email us/i)).toBeInTheDocument();
  });

  it("renders newsletter subscription form with accessible labels", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    // This should FAIL currently
    expect(screen.getByLabelText(/Enter your email/i)).toBeInTheDocument(); // Input label
    expect(screen.getByLabelText(/Subscribe/i)).toBeInTheDocument(); // Button label
  });
});
