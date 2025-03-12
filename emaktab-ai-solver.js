// emaktab-helper.js
(function() {
    'use strict';

    // --------------------------------------------------------------------------
    // Configuration - Add your CSS Selectors here
    // --------------------------------------------------------------------------
    const SELECTORS = {
        QUESTION_ELEMENT: "div.spmwg > div[role='presentation'] > div > div > div > span",
        ANSWER_ELEMENTS: "div[role='radio']",
        ANSWER_TEXT_ELEMENT: 'span' // Span containing the answer text inside radio buttons
    };

    // PLEASE READ THE SECURITY WARNING BELOW BEFORE USING THIS!
    const API_KEY = "220a1d391be94cfe95d903bc21df7aaa";  // **REPLACE THIS WITH YOUR TEST API KEY**
    const API_ENDPOINT = "https://generative-ai-fd.experimental.googleapis.com/v1beta/models/gemini-pro:generateContent";  // Replace the part of this URL after .com if needed.

    // --------------------------------------------------------------------------
    // Helper Functions
    // --------------------------------------------------------------------------

    function extractQuestionAndAnswers() {
        const questionElement = document.querySelector(SELECTORS.QUESTION_ELEMENT);
        const question = questionElement ? questionElement.textContent : null;

        const answerElements = Array.from(document.querySelectorAll(SELECTORS.ANSWER_ELEMENT));
        const answers = answerElements.map(element => element.querySelector(SELECTORS.ANSWER_TEXT_ELEMENT).textContent.trim());

        if (!question || answers.length === 0) {
            console.warn("Could not find question or answers.");
            return null;
        }

        return { question, answers };
    }

    function highlightCorrectAnswer(correctAnswer) {
        const answerElements = document.querySelectorAll(SELECTORS.ANSWER_ELEMENT);

        answerElements.forEach(element => {
            const spanElement = element.querySelector(SELECTORS.ANSWER_TEXT_ELEMENT);
            if (spanElement.textContent.trim() === correctAnswer.trim()) {
                element.style.backgroundColor = 'lightgreen'; // Highlight the radio button div
            } else {
                element.style.backgroundColor = ''; // Reset background color
            }
        });
    }

    function extractQuestionAndAnswers() {
        const questionElement = document.querySelector(SELECTORS.QUESTION_ELEMENT);
        const question = questionElement ? questionElement.textContent : null;

        const answerElements = Array.from(document.querySelectorAll(SELECTORS.ANSWER_ELEMENT));
        const answers = answerElements.map(element => element.querySelector(SELECTORS.ANSWER_TEXT_ELEMENT).textContent.trim());

        console.log("Question Element:", questionElement); //ADDED
        console.log("Answers Elements:", answerElements); //ADDED
        console.log("Answers:", answers); //ADDED

        if (!question || answers.length === 0) {
            console.warn("Could not find question or answers.");
            return null;
        }

        return { question, answers };
    }

    function analyzeAndHighlight() {
      const data = extractQuestionAndAnswers();
      if (!data) return;

      GM_xmlhttpRequest({
          method: 'POST',
          url: `${API_ENDPOINT}?key=${API_KEY}`,
          headers: {
              'Content-Type': 'application/json'
          },
          data: JSON.stringify(data),
          onload: function(response) {
              if (response.status >= 200 && response.status < 300) {
                  const geminiData = JSON.parse(response.responseText);
                   // **IMPORTANT:** Adapt this part to the REAL structure of Gemini API responses
                  const bestAnswer = geminiData.candidates[0].content.parts[0].text.trim();  // May need adjustments

                  highlightCorrectAnswer(bestAnswer);
              } else {
                  console.error('Error from server:', response);
              }
          },
          onerror: function(error) {
              console.error('Error sending request:', error);
          }
      });
    }

    // Add key press event listener
    document.addEventListener('keydown', function(event) {
        if (event.key === 'x' || event.key === 'X') {
            console.log("X key pressed. Running AI Solver...")
            analyzeAndHighlight();
        }
    });

    console.log("AI Solver script loaded. Press 'X' to activate on a test page.");


     function observeDOM() {
        const targetNode = document.querySelector("#root > div > div.Uq4Vd > div.spmwg");  // Look for a very specific element near test content
        const config = { childList: true, subtree: true };

        const callback = function(mutationsList, observer) {
             if (document.querySelector("div[role='radio'] span")) { //If questions and answers present, disconnect the observer.
                observer.disconnect();
             }

        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }

     window.addEventListener('load', (event) => {
       // observeDOM();  //Remove this so it only runs after we press the "X" key
     });
})();
