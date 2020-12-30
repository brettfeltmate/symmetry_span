/**
 * present-symmetry-judgement
 *
 * Plugin for presenting a provided image for some specified duration.
 * User indicates, via button press, whether image is symmetrical or not.
 * */


jsPsych.plugins['present-symmetry-judgement'] = (function() {

	var plugin = {};

	jsPsych.pluginAPI.registerPreload('present-symmetry-judgement', 'image', 'image');

	plugin.info = {
		name: 'present-symmetry-judgement',
		description: '',
		parameters: {
			image: {
				type: jsPsych.plugins.parameterType.IMAGE,
				pretty_name: 'Image',
				default: null,
				description: 'The image object to be displayed'
			},
			symmetrical: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: 'Symmetrical',
				default: undefined,
				description: "String specifying whether presented image is symmetrical or asymmetrical."
			},
			prompt: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: "Prompt",
				default: '',
				description: "Any content here will be displayed above the presented image."
			},
			trial_duration: {
				type: jsPsych.plugins.parameterType.INT,
				pretty_name: "Trial duration",
				default: null,
				description: "How long to show the trial, in milliseconds. Defaults to image_duration."
			},
			response_ends_trial: {
				type: jsPsych.plugins.parameterType.BOOL,
				pretty_name: 'Response ends trial',
				default: true,
				description: 'If true, then trial will end when user responds.'
			}
		}
	}

	plugin.log_response = function(e) {
		e.stopPropagation()
		console.log($(this).attr('id'))
		plugin.response.choice = $(this).attr('id');
		//TODO: remove border if choice changed
		$(this).css('border', '5px solid black')

		pr(plugin.response.choice)
	}

	plugin.submit_response = function(e) {
		e.stopPropagation()

		// measure rt
		plugin.response.rt = performance.now() - plugin.start_time;

		// disable all the buttons after a response
		$('button').attr('disabled', 'disabled');

		// log response accuracy
		plugin.response.accuracy = (plugin.response.choice == plugin.symmetrical) ? 1 : 0


		if (plugin.response_ends_trial) {
			plugin.end_trial();
		}

	}

	plugin.end_trial = function() {
		// ensure button has been disabled
		$('button').attr('disabled', 'disabled');

		// kill any remaining setTimeout handlers
		jsPsych.pluginAPI.clearAllTimeouts();

		// Aggregate relevant trial data
		plugin.trial_data = {
			"rt": plugin.response.rt,
			"image": plugin.image,
			"symmetrical": plugin.symmetrical,
			"response": plugin.response.choice,
			"accuracy": plugin.response.accuracy
		}

		pr(plugin.trial_data)

		// clear display
		$('.operation-span-layout').remove()

		// end & progress to next event
		jsPsych.finishTrial(plugin.trial_data);


	}

	plugin.trial = function(display_element, trial) {


		$('#jspsych-loading-progress-bar-container').remove();

		plugin.image = trial.image
		plugin.prompt = trial.prompt
		plugin.symmetrical = trial.symmetrical



		let prompt = $('<div />').addClass('text-stim').css('grid-area', 'prompt').text(`${trial.prompt}`)
		let stim = $('<div />').addClass('symmetry-span-single-stim')

		$(stim).append(
			$('<div />').addClass('image-stim').css('background-image', `url('${trial.image}')`)
		)

		let buttons = $('<div />').addClass('symmetry-span-button-bank')
		let symmetrical = $('<div />').attr('id', 'symmetrical').addClass('symmetry-span-button').text('SYMMETRICAL')
		let assymetrical = $('<div />').attr('id', 'asymmetrical').addClass('symmetry-span-button').text('ASYMMETRICAL')

		$(buttons).append([symmetrical, assymetrical])



		let container = $('<div />').addClass('symmetry-span-layout').append([prompt, stim, buttons])

		$(display_element).append(container)
		plugin.start_time = performance.now();



		// end trial if time limit is set
		if (trial.trial_duration !== null) {
			jsPsych.pluginAPI.setTimeout(function() {
				plugin.end_trial();
			}, trial.trial_duration);
		}


	};
	return plugin;
})();