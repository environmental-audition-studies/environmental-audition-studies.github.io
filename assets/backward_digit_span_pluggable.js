/*
 * 
 * Usage Instructions
 * ------------------
 * 
 * 
 * Make sure that this script is in a folder called "assets" and that the following tags are in the <head> of your HTML file:
 * 
 *     <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
 *     <script src="jspsych-4.3/jspsych.js"></script>
 *     <script src="jspsych-4.3/plugins/jspsych-text.js"></script>
 *     <script src="jspsych-4.3/plugins/jspsych-single-audio.js"></script>
 *     <script src="jspsych-4.3/plugins/jspsych-single-stim.js"></script>
 *     <script src="jspsych-4.3/plugins/jspsych-multi-stim-multi-response.js"></script>
 *     <script src="jspsych-4.3/plugins/jspsych-survey-text.js"></script>
 *     <link href="jspsych-4.3/css/jspsych.css" rel="stylesheet" type="text/css">
 *     <script src="assets/backward_digit_span_pluggable.js"></script>
 * 
 * 
 * Make sure the following is at the top of your main experiment script for storing your trial structure:
 * 
 *     var experiment = [];
 * 
 * 
 * Include the following in your main experiment script wherever you want to add the backward digit span task:
 * 
 *     addDigitSpanTask();
 * 
 * 
 * If you want the audio version, use this instead:
 * 
 *     addDigitSpanTask(true);
 * 
 * To specify that you are not presenting the backward digit span for the first time, 
 * provide the useAudio parameter first, then pass true for the second parameter:
 * 
 *    addDigitSpanTask(true, true);
 */

function addDigitSpanTask(useAudio, afterFirstPresentation) {
  var currentDigitList;
  var reversedDigitString;
  var wasCorrect = true;
  var totalCorrect = 0;
  var totalTrials = 0;
  var folder = "digits/";

  if (useAudio) {
    var fileMap = {
      1: "one.wav",
      2: "two.wav",
      3: "three.wav",
      4: "four.wav",
      5: "five.wav",
      6: "six.wav",
      7: "seven.wav",
      8: "eight.wav",
      9: "nine.wav"
    };
    
    var digitToFile = function (digit) {
      return folder + fileMap[digit];
    };
  }

  function getRandDigit() {
    return Math.floor(Math.random() * 9) + 1;
  }

  function getDiffDigit(digit) {
    var newDigit = digit;
    while (newDigit === digit) {
      newDigit = getRandDigit();
    }
    return newDigit;
  }

  function getDigitList(len) {
    var digitList = [];
    var digit = getRandDigit();
    digitList.push(digit);
    for (var i = 0; i < len - 1; i += 1) {
      digit = getDiffDigit(digit);
      digitList.push(digit);
    }
    return digitList;
  }

  function getStimuli(numDigits) {
    var digit;
    var stimList = [];
    currentDigitList = getDigitList(numDigits);
    reversedDigitString = "";
    for (var i = 0; i < currentDigitList.length; i += 1) {
      if (useAudio) {
        digit = currentDigitList[i];
        stimList.push(digitToFile(digit));
        reversedDigitString = digit.toString() + reversedDigitString;
      } else {
        digit = currentDigitList[i].toString();
        stimList.push('<h1>' + digit + '</h1>');
        reversedDigitString = digit + reversedDigitString;
      }
    }
    return stimList;
  }
  
  /*
  if (useAudio) {
    var volumeTest = {
      type: "single-audio",
      stimuli: [folder + "volumetest.wav"],
      timing_response: 10000,
      response_ends_trial: false,
      prompt: "<p>Before we begin, please adjust your volume so that the sound currently being played is at a comfortable listening level.</p>",
      timing_post_trial: 0
    };
    
    experiment.push(volumeTest);
  }
  */
  
  var firstLine;
  if (afterFirstPresentation) {
    firstLine = '<p>Welcome again to the memory task.</p>';
  } else {
    firstLine = '<p>Welcome to the memory task.</p>';
  }
  
  var instructions;
  if (useAudio) {
    instructions = '<p>On each trial, you will hear a sequence of digits and be asked to type them back in reverse order.</p>';
  } else {
    instructions = '<p>On each trial, you will see a sequence of digits and be asked to type them back in reverse order.</p>';
  }
  
  var welcome = {
    type: "text",
    text: firstLine +
          instructions +
          '<p>To ensure high quality data, it is very important that you do not use any memory aid (e.g., pen and paper). Please do the task solely in your head.</p>' +
          '<p>When you are ready to begin, press Enter.</p>',
    timing_post_trial: 0,
    cont_key: [13]
  };

  experiment.push(welcome);

  var fixation = {
    type: "multi-stim-multi-response",
    stimuli: [["***", "**", "*"]],
    is_html: true,
    timing_stim: [500, 500, 500],
    timing_response: 1500,
    choices: [null, null, null],
    response_ends_trial: false,
    timing_post_trial: 1000
  };

  for (var i = 3; i < 10; i += 1) {
    for (var j = 0; j < 2; j += 1) {
      var stimSeq;
      var questions;
      var stimList = getStimuli(i);
      
      if (useAudio) {
        stimSeq = {
          type: "single-audio",
          stimuli: stimList,
          timing_response: 1000,
          response_ends_trial: false,
          timing_post_trial: 0
        };
        questions = [['Please type the digits you just heard in reverse order (starting from the last digit and ending on the first digit). Backspace has been disabled, so enter the digits carefully. You may press Enter to submit your response.']];
      } else {
        stimSeq = {
          type: "single-stim",
          stimuli: stimList,
          is_html: true,
          timing_response: 900,
          response_ends_trial: false,
          timing_post_trial: 100
        };
        questions = [['Please type the digits you just saw in reverse order (starting from the last digit and ending on the first digit). Backspace has been disabled, so enter the digits carefully. You may press Enter to submit your response.']];
      }
    
      var response = {
        type: "survey-text",
        questions: questions,
        data: [{
          correct_answer: reversedDigitString
        }],
        on_finish: function (trialData) {
          var answer = JSON.parse(trialData.responses).Q0;
          wasCorrect = (answer === trialData.correct_answer);
          if (wasCorrect) {
            totalCorrect += 1;
          }
          jsPsych.data.addDataToLastTrial({
            answer: answer,
            was_correct: (wasCorrect ? 1 : 0),
            total_correct: totalCorrect
          });
        },
        timing_post_trial: 0,
        submit_on_enter: true
      };
      
      var chunk = {
        chunk_type: "linear",
        timeline: [fixation, stimSeq, response],
      };
      
      experiment.push(chunk);
      
      totalTrials += 1;
    }
  }

  var goodbye = {
    type: "single-stim",
    stimuli: function () {
      var pageText = '<p>You got ' + totalCorrect + ' out of ' + totalTrials + ' correct.</p>' +
                     '<p>Please press Enter to continue.</p>';
      return [pageText];
    },
    is_html: true,
    response_ends_trial: true,
    choices: [13]
  };

  experiment.push(goodbye);
}
