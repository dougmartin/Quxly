$(function () {

	function closeModal() {
		try {
			$.modal.close();
		}
		catch (e) {
		}
	}

	function loadPresentation(start) {
		var container = $("#container")[0],
			converter = new Showdown.converter();
		
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
							closeModal();
							window.location.hash = "";
							return true;
						}
					})
				},
				descriptionGenerator: function (descriptionArray) {
					var html = [], minIndent = 999999999999999;
					
					// find the minimum indent
					$.each(descriptionArray, function (index, description) {
						minIndent = Math.max(minIndent, description.indentLevel);
					});
					
					// generate the plain text removing the min indent
					$.each(descriptionArray, function (index, description) {
						var text = [];
						for (i = minIndent; i < description.indentLevel; i++) {
							text.push(" ");
						}
						text.push(description.text);
						html.push(text.join(""));
					});
					
					return converter.makeHtml(html.join("\n"));
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
			closeModal();
		}
	});
	$(window).hashchange();			
	
	$("#viewSource").click(function () {
		window.location = "view-source:" + window.location.href;
	});
});
