// Points to the screen shown before the quiz starts.
const startScreen = document.getElementById("start-screen");

// Points to the screen that displays quiz questions and answers.
const quizScreen = document.getElementById("quiz-screen");

// Points to the screen that displays the final quiz result.
const resultScreen = document.getElementById("result-screen");

// Points to the button that starts the quiz.
const startButton = document.getElementById("start-btn");

// Points to the heading where the current question is displayed.
const questionText = document.getElementById("question-text");

// Points to the element that displays the current question number.
const questionNumber = document.getElementById("question-number");

// Points to the element that displays the total number of questions.
const totalQuestions = document.getElementById("total-questions");

// Points to the element that displays the player's current score.
const scoreElement = document.getElementById("score");

// Points to the container where answer buttons will be added.
const answersContainer = document.getElementById("answers-container");

// Points to the filled section of the quiz progress bar.
const progress = document.getElementById("progress");

// Points to the element that displays the player's final score.
const finalScore = document.getElementById("final-score");

// Points to the element that displays the total questions on the result screen.
const totalQuestionsResult = document.getElementById(
    "total-questions-result"
);

// Points to the message shown after the quiz is completed.
const resultMessage = document.getElementById("result-message");

// Points to the button that restarts the quiz.
const restartButton = document.getElementById("restart-btn");

const questions = [
    {
        question: "What is the capital of France?",
        answers: [
            { text: "Paris", correct: true },
            { text: "London", correct: false },
            { text: "Berlin", correct: false },
            { text: "Madrid", correct: false }
        ]
    },
    {
        question: "What is the capital of Germany?",
        answers: [
            { text: "Berlin", correct: true },
            { text: "London", correct: false },
            { text: "Paris", correct: false },
            { text: "Madrid", correct: false }
        ]
    },
    {
        question: "Which planet is known as the Red Planet?",
        answers: [
            { text: "Venus", correct: false },
            { text: "Mars", correct: true },
            { text: "Jupiter", correct: false },
            { text: "Saturn", correct: false }
        ]
    },
    {
        question: "What is the largest ocean on Earth?",
        answers: [
            { text: "Atlantic Ocean", correct: false },
            { text: "Indian Ocean", correct: false },
            { text: "Arctic Ocean", correct: false },
            { text: "Pacific Ocean", correct: true }
        ]
    },
    {
        question: "How many continents are there?",
        answers: [
            { text: "Five", correct: false },
            { text: "Six", correct: false },
            { text: "Seven", correct: true },
            { text: "Eight", correct: false }
        ]
    }
];

//quize state variables
let currentQuestionIndex = 0;
let score = 0;
let timer;
let answersDisabled = false;


totalQuestions.textContent = questions.length;
totalQuestionsResult.textContent = questions.length;



// event listebner
startButton.addEventListener("click", startQuiz);
restartButton.addEventListener("click", restartQuiz);



function startQuiz(){
    currentQuestionIndex = 0;
    score = 0;
    scoreElement.textContent = score;

    // Hide every other screen, then display the quiz screen.
    startScreen.classList.remove("active");
    resultScreen.classList.remove("active");
    quizScreen.classList.add("active");

    showQuestion();
}

function showQuestion(){
    answersDisabled = false;

    // Removes the exit state before the next question enters.
    quizScreen.classList.remove("question-exit");

    // Selects one complete question object from the questions array.
    // If currentQuestionIndex is 0, it selects questions[0].
    const currentQuestion = questions[currentQuestionIndex];

    // Shows the position of the selected question, such as "Question 1".
    questionNumber.textContent = `Question ${currentQuestionIndex + 1}`;

    // Calculates and displays the current quiz progress.
    const progressPercentage = (currentQuestionIndex / questions.length) * 100;
    progress.style.width = `${progressPercentage}%`;

    // currentQuestion is the selected object.
    // .question accesses that object's question property and displays its text.
    questionText.textContent = currentQuestion.question;


    // Removes answer buttons from the previous question.
    answersContainer.innerHTML = "";
    
    // Creates one button for every answer in the selected question.
    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.classList.add("answer-btn");
        button.textContent = answer.text;

        // dataset stores the answer's true or false value on its button.
        button.dataset.correct = answer.correct;
        button.addEventListener("click", checkAnswer);
        answersContainer.appendChild(button);
    });

    // Restarts the entrance animation each time new question content is added.
    quizScreen.classList.remove("question-enter");
    void quizScreen.offsetWidth;
    quizScreen.classList.add("question-enter");
}

function checkAnswer(event){
    // Prevents the player from selecting more than one answer.
    if(answersDisabled) return;

    answersDisabled = true;

    // event.target points to the answer button that was clicked.
    const selectedButton = event.target;
    const isCorrect = selectedButton.dataset.correct === "true";

    // dataset values are strings, so compare them with the string "true".
    Array.from(answersContainer.children).forEach(button => {
        const buttonIsCorrect = button.dataset.correct === "true";
        button.classList.add(buttonIsCorrect ? "correct" : "incorrect");
        button.disabled = true;
    });

    if(isCorrect){
        score++;

        // Updates the same score element selected at the top of this file.
        scoreElement.textContent = score;
    }

    // Keeps the answer colours visible briefly, then fades this question out.
    setTimeout(() => {
        quizScreen.classList.add("question-exit");

        // Waits for the exit animation before changing the question content.
        setTimeout(() => {
            currentQuestionIndex++;

            if(currentQuestionIndex < questions.length){
                showQuestion();
            } else {
                showResult();
            }
        }, 250);
    }, 700);
}

function showResult(){
    // Hides the quiz and displays the result screen.
    quizScreen.classList.remove("question-enter", "question-exit");
    quizScreen.classList.remove("active");
    resultScreen.classList.add("active");

    finalScore.textContent = score;
    totalQuestionsResult.textContent = questions.length;

    resultMessage.textContent =
        score === questions.length
            ? "Congratulations! You've answered all questions correctly!"
            : "Keep practising and try again!";
}

function restartQuiz(){
    // startQuiz resets the score and question index before showing question 1.
    startQuiz();
}
