
import { diffWords } from "diff";
import "./App.scss";
import React, { useEffect, useState, useRef } from "react";

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
        map.push([i, trimmed.length - 1]);
      }
      lastCharWasIgnored = true;
      continue;
    }

    trimmed += letter;
    map.push([i, trimmed.length - 1]);
    lastCharWasIgnored = false;
  }

  // map is a list of pairs: [index in original text, index in trimmed text]
  console.log(map);
  return { map, trimmed };
};

function App() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [textBoth, setTextBoth] = useState("");
  const [useTextBoth, setUseTextBoth] = useState(false);
  const [ignoreNewlines, setIgnoreNewlines] = useState(true);
  const [ignoreWhitespaces, setIgnoreWhitespaces] = useState(false);
  const [replaceTabs, setReplaceTabs] = useState(true);
  const [result, setResult] = useState(null);
  const isInited = useRef(false);

  //save settings and input
  useEffect(() => {
    console.log('useEffect', ignoreWhitespaces);
    if (!isInited.current) return;
    localStorage.setItem('ignoreNewlines', ignoreNewlines);
    localStorage.setItem('ignoreWhitespaces', ignoreWhitespaces);
    localStorage.setItem('replaceTabs', replaceTabs);
    localStorage.setItem('useTextBoth', useTextBoth);
    localStorage.setItem('textBoth', textBoth);
    localStorage.setItem('text1', text1);
    localStorage.setItem('text2', text2);
  }, [ignoreWhitespaces, ignoreNewlines, replaceTabs, text1, text2, textBoth, useTextBoth]);

  useEffect(() => {
    if (isInited.current) return;
    setIgnoreNewlines(localStorage.getItem('ignoreNewlines') === 'true');
    setIgnoreWhitespaces(localStorage.getItem('ignoreWhitespaces') === 'true');
    setReplaceTabs(localStorage.getItem('replaceTabs') === 'true');
    setText1(localStorage.getItem('text1') || '');
    setText2(localStorage.getItem('text2') || '');
    setTextBoth(localStorage.getItem('textBoth') || '');
    setUseTextBoth(localStorage.getItem('useTextBoth') === 'true');
    isInited.current = true;
  }, []);

  const onChangeBoth = (e) => {
    setTextBoth(e.target.value);
    const texts = e.target.value.split("=======");
    setText1(texts[0]);
    setText2(texts[1]);
  };

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
    
    let clonedArray = JSON.parse(JSON.stringify(differences))
    console.log('clonedArray', clonedArray);
    console.log('differences', differences);

    // Map differences back to original texts
    let lastIndexFirst = 0;
    let lastIndexSecond = 0;

    differences.forEach((difference) => {
      if (difference.added) {
        // Handle added text (from text2)
        let newIndexSecond = lastIndexSecond + difference.value.length;
        const origPart = text2.slice(
          map2[lastIndexSecond][0],
          map2[newIndexSecond] ? map2[newIndexSecond][0] : map2[newIndexSecond - 1][0] + 1
        );
        lastIndexSecond = newIndexSecond;
        difference.value = origPart;
      } else if (difference.removed) {
        // Handle removed text (from text1)
        let newIndexFirst = lastIndexFirst + difference.value.length;
        console.log('map1[lastIndexFirst]', map1[lastIndexFirst]);
        console.log('map1[newIndexFirst - 1]', map1[newIndexFirst - 1]);
        try {
        const origPart = text1.slice(
          map1[lastIndexFirst][0],
          map1[newIndexFirst] ? map1[newIndexFirst][0] : map1[newIndexFirst - 1][0] + 1
        );
        lastIndexFirst = newIndexFirst;
        difference.value = origPart;
      } catch (error) {
        console.log('lastIndexFirst', lastIndexFirst);
        if (map1[lastIndexFirst]) {
          const origPart = text1.slice(map1[lastIndexFirst][0]);
          lastIndexFirst = text1.length;
          difference.value = origPart;
        } else {
          const origPart = '';
          lastIndexFirst = text1.length;
          difference.value = origPart;
        }
       
      }
      
      } else {
        // Handle unchanged text
       // let newIndexFirst = lastIndexFirst + difference.value.length;
       let newIndexFirst = lastIndexFirst + difference.value.length;
        let newIndexSecond = lastIndexSecond + difference.value.length;

        let origPartFirst = "";
        let origPartSecond = "";

        if (map1[lastIndexFirst] && map1[newIndexFirst - 1]) {
          
          origPartFirst = text1.slice(
            map1[lastIndexFirst][0],
            map1[newIndexFirst] ? map1[newIndexFirst][0] : map1[newIndexFirst - 1][0] + 1
          );
          lastIndexFirst = newIndexFirst;
        } 
        else {
          origPartFirst = text1.slice(map1[lastIndexFirst][0]);
          lastIndexFirst = text1.length;
        }

        if (map2[lastIndexSecond] && map2[newIndexSecond - 1]) {
          origPartSecond = text2.slice(
            map2[lastIndexSecond][0],
            map2[newIndexSecond] ? map2[newIndexSecond][0] : map2[newIndexSecond - 1][0] + 1
          );
          lastIndexSecond = newIndexSecond;
        } 
        else {
          origPartSecond = text2.slice(map2[lastIndexSecond][0]);
          lastIndexSecond = text2.length;
        }

        difference.value = origPartFirst; 
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
          (replaceTabs
            ? replaceTabsWithSpaces(part.secondValue || part.value)
            : (part.secondValue || part.value))}
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
      <meta
        name="description"
        content="Use it to find real differences without getting distracted by newlines, tabs or spaces"
      />
      <h1>Text Comparison Tool</h1>
      <div className="options">
        <label>
          <input
            type="radio"
            checked={!useTextBoth}
            onChange={() => setUseTextBoth(false)}
          />
          Enter each text separately
        </label>
        <br />
        <label>
          <input
            type="radio"
            checked={useTextBoth}
            onChange={() => setUseTextBoth(true)}
          />
          Or enter both text at once, delimited by "=======" (like in git
          conflict markup)
        </label>
      </div>
      {useTextBoth ? (
        <div className="inputs">
          <textarea
            value={textBoth}
            onChange={onChangeBoth}
            placeholder="Enter both texts"
          />
        </div>
      ) : (
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
      )}
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
