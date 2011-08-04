$(function () {
	function loadPresentation(start) {
		var container = $("#container")[0];
		
		// the quxlyPresenter plugin is just a simple wrapper around Quxly that exposes a couple of callbacks
		// that are used to maintain a state history so the back/forward buttons work
		$.quxlyPresenter(
			{
				container: container,
				fromDOM: "qux",
				start: start,
				hideState: true,
				afterStateChange: function (state) {
					// keep the state in the history so we enable the back/forward buttons
					window.location.hash = state.name;
				},
				afterStartViewer: function () {
					$.modal(container, {
						close: true,
						overlayClose: true,
						onClose: function () {
							window.location.hash = "";
							$.modal.close();
							return true;
						}
					})
				}
			}
		);			
	}

	$(".presentationLink").click(function () {
		loadPresentation(this.id);
		return false;
	});
	
	$(window).hashchange(function () {
		var newStateName = window.location.hash.substr(1);
		if (newStateName.length > 0) {
			loadPresentation(newStateName);
		}
		else {
			$.modal.close();
		}
	});
	$(window).hashchange();			
	
	$("#viewSource").click(function () {
		window.location = "view-source:" + window.location.href;
	});
});
