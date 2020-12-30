/**
 * present-recall-cell
 *
 * Plugin for presenting a provided image for some specified duration.
 * Allows for attaching some identifying tag.
 * Does not accept responses of any kind.
 * */


jsPsych.plugins['present-recall-cell'] = (function() {

    var plugin = {};

    jsPsych.pluginAPI.registerPreload('present-recall-cell', 'image', 'image');

    plugin.info = {
        name: 'present-recall-cell',
        description: '',
        parameters: {
            image: {
                type: jsPsych.plugins.parameterType.IMAGE,
                pretty_name: 'Image',
                default: null,
                description: 'The image object to be displayed'
            },
            index: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Index',
                default: null,
                description: "Presented cell's serial position within grid (1:16; top-left to bottom-right)."
            },
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: "Prompt",
                default: '',
                description: "Any content here will be displayed above the presented image."
            },
            image_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "image duration",
                default: null,
                description: "How long to show image before removal, in milliseconds."
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: "Trial duration",
                default: null,
                description: "How long to show the trial, in milliseconds. Defaults to image_duration."
            }
        }
    }

    plugin.trial = function(display_element, trial) {


        $('#jspsych-loading-progress-bar-container').remove();

        let prompt = $('<div />').addClass('text-stim').css('grid-area', 'prompt').text(`${trial.prompt}`)
        let stim = $('<div />').addClass('symmetry-span-single-stim')
        $(stim).append(
            $('<div />').addClass('image-stim').css('background-image', `url('${trial.image}')`)
        )

        let container = $('<div />').addClass('symmetry-span-layout').append([prompt, stim])

        $(display_element).append(container)


        // function to end trial when it is time
        function end_trial() {

            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();

            // gather the data to store for the trial
            var trial_data = {
                // full path would be awful verbose, just return name of image.
                "image_name": trial.image.substring(trial.image.lastIndexOf('/') + 1),
                "image_index": trial.index
            };

            // clear the display
            display_element.innerHTML = '';

            // move on to the next trial
            jsPsych.finishTrial(trial_data);
        }

        // hide image if timing is set
        if (trial.image_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                $('symmetry-span-content-box').css('visibility', 'hidden');
            }, trial.image_duration);
        }

        // end trial if time limit is set
        if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                end_trial();
            }, trial.trial_duration);
        } else {
            jsPsych.pluginAPI.setTimeout(function() {
                end_trial();
            }, trial.image_duration);
        }


    };
    return plugin;
})();