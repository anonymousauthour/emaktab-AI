// emaktab-helper.js
@grant        GM_xmlhttpRequest
(function() {
    'use strict';

    // --------------------------------------------------------------------------
    // Configuration - Add your CSS Selectors here
    // --------------------------------------------------------------------------
    const SELECTORS = {
        QUESTION_ELEMENT: "div.VQ5oZ > div.yoeer > span:first-child", //Targets the Question
        ANSWER_ELEMENTS: "div.VQ5oZ > div._ZhFj > div.YBX37",       //Targets the Answer divs
        ANSWER_TEXT_ELEMENT: 'div[aria-readonly="true"] > p',       //Gets text in the p inside of radio button divs.
        ANSWER_RADIO_BUTTON: 'input[type="radio"]' // Selector for radio buttons inside answer elements
    };

    // **Important:  This is a placeholder.  The actual API key should ONLY be on your server!**
    const API_KEY = "AIzaSyBk8ibWt_hjH4TsV0jt-bwQeTKGSDuDNjk";
    const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=GEMINI_API_KEY';

    // --------------------------------------------------------------------------
    // Helper Functions
    // --------------------------------------------------------------------------

    function extractQuestionAndAnswers() {
        const questionElement = document.querySelector(SELECTORS.QUESTION_ELEMENT);
        const question = questionElement ? questionElement.textContent : null;

        const answerElements = Array.from(document.querySelectorAll(SELECTORS.ANSWER_ELEMENTS));
        const answers = answerElements.map(element => element.querySelector(SELECTORS.ANSWER_TEXT_ELEMENT).textContent.trim());

        if (!question || answers.length === 0) {
            console.warn("Could not find question or answers.");
            return null;
        }

        return { question, answers };
    }

    function highlightCorrectAnswer(correctAnswer) {
        const answerElements = document.querySelectorAll(SELECTORS.ANSWER_ELEMENTS);

        answerElements.forEach(element => {
            const textContainer = element.querySelector(SELECTORS.ANSWER_TEXT_ELEMENT); // Get the actual answer text container.
            const radioButton = element.querySelector(SELECTORS.ANSWER_RADIO_BUTTON); // Find the radio button inside the answer element

            if (textContainer.textContent.trim() === correctAnswer.trim()) {
                element.style.backgroundColor = 'lightgreen'; // Highlight the answer div
                if (radioButton) {
                    radioButton.checked = true; // Select the radio button
                    // Optional: Dispatch events for better compatibility
                    // radioButton.dispatchEvent(new Event('click', { bubbles: true }));
                    // radioButton.dispatchEvent(new Event('change', { bubbles: true }));
                }
            } else {
                element.style.backgroundColor = ''; // Reset background color
                if (radioButton) {
                    radioButton.checked = false; // Unselect radio button for incorrect answers
                }
            }
        });
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
