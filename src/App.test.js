import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";

describe("Text Comparison Tool", () => {
  // Test for rendering the app and checking initial elements
  it("should render the text comparison tool", () => {
    render(<App />);

    // Check if the title is rendered
    expect(screen.getByText("Text Comparison Tool")).toBeInTheDocument();

    // Check if the textareas for input are present
    expect(screen.getByPlaceholderText("Enter first text")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter second text")
    ).toBeInTheDocument();

    // Check if the "Compare" button is present
    expect(screen.getByText("Compare")).toBeInTheDocument();

    // Check if the checkboxes are present
    expect(screen.getByLabelText("Ignore newlines")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Ignore whitespaces change")
    ).toBeInTheDocument();
  });

  // Test for comparing texts and displaying differences
  it("should show differences when comparing two different texts", () => {
    render(<App />);

    const text1 = "Hello World!";
    const text2 = "Hello React!";

    // Set the input values for text1 and text2
    fireEvent.change(screen.getByPlaceholderText("Enter first text"), {
      target: { value: text1 },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter second text"), {
      target: { value: text2 },
    });

    // Click the "Compare" button
    fireEvent.click(screen.getByText("Compare"));

    // Check that differences are shown
    expect(screen.getByText("World")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  // Test for ignoring newlines
  it("should ignore newlines when the checkbox is checked", () => {
    render(<App />);

    const text1 = "Hello\nWorld!";
    const text2 = "Hello World!";

    // Set the input values for text1 and text2
    fireEvent.change(screen.getByPlaceholderText("Enter first text"), {
      target: { value: text1 },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter second text"), {
      target: { value: text2 },
    });

    // Check the "Ignore newlines" checkbox
    fireEvent.click(screen.getByLabelText("Ignore newlines"));

    // Click the "Compare" button
    fireEvent.click(screen.getByText("Compare"));

    // Ensure that no newline differences are shown
    expect(screen.queryByText("\n")).toBeNull(); // Newline should be ignored
  });

  // Test for ignoring whitespaces change
  it("should ignore whitespace changes when the checkbox is checked", () => {
    render(<App />);

    const text1 = "Hello   World!";
    const text2 = "Hello World!";

    // Set the input values for text1 and text2
    fireEvent.change(screen.getByPlaceholderText("Enter first text"), {
      target: { value: text1 },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter second text"), {
      target: { value: text2 },
    });

    // Check the "Ignore whitespaces change" checkbox
    fireEvent.click(screen.getByLabelText("Ignore whitespaces change"));

    // Click the "Compare" button
    fireEvent.click(screen.getByText("Compare"));

    // Ensure that no differences due to whitespace are shown
    expect(screen.queryByText("   ")).toBeNull(); // Whitespace changes should be ignored
  });

  // Test for when the texts are identical
  it("should not show any differences if both texts are identical", () => {
    render(<App />);

    const text1 = "Hello World!";
    const text2 = "Hello World!";

    // Set the input values for text1 and text2
    fireEvent.change(screen.getByPlaceholderText("Enter first text"), {
      target: { value: text1 },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter second text"), {
      target: { value: text2 },
    });

    // Click the "Compare" button
    fireEvent.click(screen.getByText("Compare"));

    // Ensure no differences are displayed
    expect(screen.queryByText("World")).toBeNull();
  });

 
});
