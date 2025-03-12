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

    const API_ENDPOINT = 'YOUR_SERVER_API_ENDPOINT';  // **REPLACE THIS!**

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
            const spanElement = element.querySelector(SELECTORS.ANSWER_TEXT_ELEMENT); //Get the corresponding Span
            if (spanElement.textContent.trim() === correctAnswer.trim()) {
                element.style.backgroundColor = 'lightgreen'; // Highlight the radio button div
            } else {
                element.style.backgroundColor = ''; // Reset background color
            }
        });
    }

    function analyzeAndHighlight() {
      const data = extractQuestionAndAnswers();
      if (!data) return;

      GM_xmlhttpRequest({
          method: 'POST',
          url: API_ENDPOINT,
          headers: {
              'Content-Type': 'application/json'
          },
          data: JSON.stringify(data),
          onload: function(response) {
              if (response.status >= 200 && response.status < 300) {
                  const data = JSON.parse(response.responseText);
                  highlightCorrectAnswer(data.best_answer);
              } else {
                  console.error('Error from server:', response);
              }
          },
          onerror: function(error) {
              console.error('Error sending request:', error);
          }
      });
  }
     function observeDOM() {
        const targetNode = document.querySelector("#root > div > div.Uq4Vd > div.spmwg");  // Look for a very specific element near test content
        const config = { childList: true, subtree: true };

        const callback = function(mutationsList, observer) {
             if (document.querySelector("div[role='radio'] span")) { //If questions and answers present, disconnect the observer.
                analyzeAndHighlight();
                observer.disconnect();
             }

        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }

     window.addEventListener('load', (event) => {
        observeDOM();
     });
})();
