import { diffWords } from "diff";
import './App.scss';
import React, { useState } from "react";

const replaceTabsWithSpaces = (text, spacesPerTab = 1) => {
  const spaces = " ".repeat(spacesPerTab); // Generate the replacement spaces
  return text.replace(/\t/g, spaces);
};

// Trim with indices function
const trimWithIndices = (
  text,
  ignoreNewlines = false,
  ignoreWhitespaces = false
) => {
  if (!text) return { map: [], trimmed: "" };
  let map = [];
  let trimmed = "";
  let lastCharWasIgnored = false;

  for (let i = 0; i < text.length; i++) {
    let letter = text[i];

    if (
      (ignoreNewlines && letter.match(/\r?\n/)) || // Ignore newlines
      (ignoreWhitespaces && letter.match(/\s+/)) // Ignore spaces
    ) {
      if (!lastCharWasIgnored && trimmed.length > 0) {
        trimmed += " ";
        map.push([i, trimmed.length - 1]); // Map this space to the original index
      }
      lastCharWasIgnored = true;
      continue;
    }

    trimmed += letter;
    map.push([i, trimmed.length - 1]);
    lastCharWasIgnored = false;
  }

  return { map, trimmed };
};

function App() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [ignoreNewlines, setIgnoreNewlines] = useState(true);
  const [ignoreWhitespaces, setIgnoreWhitespaces] = useState(true);
  const [replaceTabs, setReplaceTabs] = useState(true);
  const [result, setResult] = useState(null);

  const compareTexts = () => {
    const { map: map1, trimmed: trimmed1 } = trimWithIndices(
      text1,
      ignoreNewlines,
      ignoreWhitespaces
    );
    const { map: map2, trimmed: trimmed2 } = trimWithIndices(
      text2,
      ignoreNewlines,
      ignoreWhitespaces
    );

    // Compute differences on trimmed texts
    const differences = diffWords(trimmed1, trimmed2);

    // Map differences back to original texts
    let lastIndexFirst = 0;
    let lastIndexSecond = 0;

    differences.forEach((difference) => {
      if (difference.added) {
        // Handle added text (from text2)
        let newIndexSecond = lastIndexSecond + difference.value.length;
        const origPart = text2.slice(
          map2[lastIndexSecond][0],
          map2[newIndexSecond - 1][0] + 1
        );
        lastIndexSecond = newIndexSecond;
        difference.value = origPart;
      } else if (difference.removed) {
        // Handle removed text (from text1)
        let newIndexFirst = lastIndexFirst + difference.value.length;
        const origPart = text1.slice(
          map1[lastIndexFirst][0],
          map1[newIndexFirst - 1][0] + 1
        );
        lastIndexFirst = newIndexFirst;
        difference.value = origPart;
      } else {
        // Handle unchanged text
        let newIndexFirst = lastIndexFirst + difference.value.length;
        let newIndexSecond = lastIndexSecond + difference.value.length;

        const origPartFirst = text1.slice(
          map1[lastIndexFirst][0],
          map1[newIndexFirst - 1][0] + 1
        );
        const origPartSecond = text2.slice(
          map2[lastIndexSecond][0],
          map2[newIndexSecond - 1][0] + 1
        );

        lastIndexFirst = newIndexFirst;
        lastIndexSecond = newIndexSecond;

        difference.value = origPartFirst; // Or origPartSecond — they are identical here
        difference.secondValue = origPartSecond;
      }
    });

    setResult(differences);
  };

  const renderFullTexts = () => {
    if (!result) return null;

    const leftSide = result.map((part, index) => (
      <span key={`left-${index}`} className={part.removed ? "removed" : ""}>
        {!part.added &&
          (replaceTabs ? replaceTabsWithSpaces(part.value) : part.value)}
      </span>
    ));

    const rightSide = result.map((part, index) => (
      <span key={`right-${index}`} className={part.added ? "added" : ""}>
        {!part.removed &&
          (replaceTabs ? replaceTabsWithSpaces(part.secondValue || part.value) : (part.secondValue || part.value))}
      </span>
    ));

    return (
      <div className="comparison">
        <div className="column left">{leftSide}</div>
        <div className="column right">{rightSide}</div>
      </div>
    );
  };

  return (
    <div className="container">
      <title>Text Comparison Tool</title>
      <meta name="description" content="Use it to find real differences without getting distracted by newlines, tabs or spaces" />
      <h1>Text Comparison Tool</h1>
      <div className="inputs">
        <textarea
          value={text1}
          onChange={(e) => setText1(e.target.value)}
          placeholder="Enter first text"
        />
        <textarea
          value={text2}
          onChange={(e) => setText2(e.target.value)}
          placeholder="Enter second text"
        />
      </div>
      <div className="options">
        <label>
          <input
            type="checkbox"
            checked={ignoreNewlines}
            onChange={() => setIgnoreNewlines(!ignoreNewlines)}
          />
          Ignore newlines
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={ignoreWhitespaces}
            onChange={() => setIgnoreWhitespaces(!ignoreWhitespaces)}
          />
          Ignore whitespaces change
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={replaceTabs}
            onChange={() => setReplaceTabs(!replaceTabs)}
          />
          Replace tabs with spaces in output (does not affect comparison result)
        </label>
      </div>
      <button onClick={compareTexts}>Compare</button>
      {renderFullTexts()}
    </div>
  );
}

export default App;
