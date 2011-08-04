(function( $ ){
	var quxFile, quxViewer;
	
	$.quxlyPresenter = function (options) {  
		var $dom, settings, modalSettings;

		// set the defaults
		settings = {
			"hideState" : false
		};
		if (options) { 
			$.extend(settings, options);
		}
		
		function startViewer(source) {
		
			if (settings.beforeStartViewer) {
				settings.beforeStartViewer(source);
			}
		
			quxFile = Quxly.File(source);
			quxViewer = Quxly.Viewer(quxFile, settings);
			quxViewer.start(settings.start);
			
			if (settings.afterStartViewer) {
				settings.afterStartViewer(quxViewer, quxFile);
			}
		}

		// load the qux
		if (settings.fromDOM) {
			$dom = $(settings.fromDOM);
			if ($dom.length == 0) {
				$dom = $("#" + settings.fromDOM);
				if ($dom.length == 0) {
					throw "No DOM element id of '" + settings.fromDOM + "' was found";
				}
			}
			startViewer($dom[0].innerHTML);
		}
		else if (settings.fromURL) {
			$.get(settings.fromURL, function (data, textStatus) {
				startViewer(data);
			});
		}
		else if (settings.fromString) {
			startViewer(settings.fromString)
		}
	}

})( jQuery );