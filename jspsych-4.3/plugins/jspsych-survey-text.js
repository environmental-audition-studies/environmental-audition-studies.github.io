/**
 * jspsych-survey-text
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */

(function($) {
  jsPsych['survey-text'] = (function() {

    var plugin = {};

    plugin.create = function(params) {

      //params = jsPsych.pluginAPI.enforceArray(params, ['data']);

      var trials = [];
      for (var i = 0; i < params.questions.length; i++) {
        var rows = [], cols = [];
        if(typeof params.rows == 'undefined' || typeof params.columns == 'undefined'){
          for(var j = 0; j < params.questions[i].length; j++){
            cols.push(40);
            rows.push(1);
          }
        }

        trials.push({
          preamble: typeof params.preamble == 'undefined' ? "" : params.preamble[i],
          questions: params.questions[i],
          rows: typeof params.rows == 'undefined' ? rows : params.rows[i],
          columns: typeof params.columns == 'undefined' ? cols : params.columns[i],
          submit_on_enter: params.submit_on_enter,
          hide_submit: params.hide_submit,
          timing_response: params.timing_response || -1
        });
      }
      return trials;
    };

    plugin.trial = function(display_element, trial) {

      // if any trial variables are functions
      // this evaluates the function and replaces
      // it with the output of the function
      trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

      // this array holds handlers from setTimeout calls
      // that need to be cleared if the trial ends early
      var setTimeoutHandlers = [];
      
      // show preamble text
      display_element.append($('<div>', {
        "id": 'jspsych-survey-likert-preamble',
        "class": 'jspsych-survey-likert-preamble'
      }));

      $('#jspsych-survey-likert-preamble').html(trial.preamble);

      // add questions
      for (var i = 0; i < trial.questions.length; i++) {
        // create div
        display_element.append($('<div>', {
          "id": 'jspsych-survey-text-' + i,
          "class": 'jspsych-survey-text-question'
        }));

        // add question text
        $("#jspsych-survey-text-" + i).append('<p class="jspsych-survey-text">' + trial.questions[i] + '</p>');

        // add text box
        if (i === 0) {
          $("#jspsych-survey-text-" + i).append('<textarea id="first-textarea" name="#jspsych-survey-text-response-' + i + '" cols="'+trial.columns[i]+'" rows="'+trial.rows[i]+'"></textarea>');
          $("#first-textarea").focus();
        } else {
          $("#jspsych-survey-text-" + i).append('<textarea name="#jspsych-survey-text-response-' + i + '" cols="'+trial.columns[i]+'" rows="'+trial.rows[i]+'"></textarea>');
        }
      }

      // add submit button
      display_element.append($('<button>', {
        'id': 'jspsych-survey-text-next',
        'class': 'jspsych-survey-text'
      }));
      $("#jspsych-survey-text-next").html('Submit');
      if (trial.hide_submit) {
        $("#jspsych-survey-text-next").hide();
      }
      
      $("#jspsych-survey-text-next").click(function() {
        // measure response time
        var endTime = (new Date()).getTime();
        var response_time = endTime - startTime;

        // kill any remaining setTimeout handlers
        for (var i = 0; i < setTimeoutHandlers.length; i++) {
          clearTimeout(setTimeoutHandlers[i]);
        }
        
        // create object to hold responses
        var question_data = {};
        $("div.jspsych-survey-text-question").each(function(index) {
          var id = "Q" + index;
          var val = $(this).children('textarea').val();
          var obje = {};
          obje[id] = val;
          $.extend(question_data, obje);
        });

        // save data
        jsPsych.data.write({
          "rt": response_time,
          "responses": JSON.stringify(question_data)
        });

        display_element.html('');

        // next trial
        jsPsych.finishTrial();
      });
      
      if (trial.submit_on_enter) {
        $(document).keypress(function(e) {
          if (e.which === 13) {
            $("#jspsych-survey-text-next").click();
          }
        });
      }
      
      // end trial if time limit is set
      if (trial.timing_response > 0) {
        var t2 = setTimeout(function() {
          $("#jspsych-survey-text-next").click();
        }, trial.timing_response);
        setTimeoutHandlers.push(t2);
      }

      var startTime = (new Date()).getTime();
    };

    return plugin;
  })();
})(jQuery);
