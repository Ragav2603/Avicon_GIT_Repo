import { describe, it, expect } from "vitest";
import { cn } from "../utils.ts";

describe("cn utility", () => {
  it("should merge multiple string arguments", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("should handle conditional class objects", () => {
    expect(cn("class1", { class2: true, class3: false })).toBe("class1 class2");
  });

  it("should merge arrays of classes", () => {
    expect(cn(["class1", "class2"], "class3")).toBe("class1 class2 class3");
  });

  it("should handle falsy values", () => {
    expect(cn("class1", null, undefined, false, "")).toBe("class1");
  });

  it("should resolve Tailwind class conflicts with twMerge", () => {
    // twMerge should ensure that the last conflicting class wins
    expect(cn("p-2 p-4")).toBe("p-4");
    expect(cn("text-red-500 text-blue-500")).toBe("text-blue-500");
    expect(cn("px-2 p-4")).toBe("p-4"); // p-4 overrides px-2 and py-2 equivalent
  });

  it("should handle mixed inputs correctly", () => {
    expect(
      cn("base-class", { "conditional-true": true, "conditional-false": false }, [
        "array-class-1",
        "array-class-2",
      ], undefined, "final-class")
    ).toBe("base-class conditional-true array-class-1 array-class-2 final-class");
  });
});
