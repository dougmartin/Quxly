$(function () {

	try {
		var converter = new Showdown.converter(),
			container = $("#container")[0],
			quxFile = Quxly.File($("#qux")[0].innerHTML),
			quxViewer;

		function closeModal() {
			try {
				$.modal.close();
			}
			catch (e) {
			}
		}

		$(window).hashchange(function () {
			var newStateName = window.location.hash.substr(1);
			if (newStateName.length == 0) {
				closeModal();
				return;
			}
			
			if (!quxViewer) {
				quxViewer = Quxly.Viewer(quxFile, {
				
					// were to add the elements
					container: container,
					
					// where to start
					start: newStateName,
					
					// don't show the state name at the top
					hideState: true,
					
					// keep the state in the history so we enable the back/forward buttons
					afterStateChange: function (state) {
						window.location.hash = state.name;
					},
					
					// markdown converter
					descriptionGenerator: function (descriptionArray) {
						var html = [], minIndent = 999999999999999;
						
						// find the minimum indent
						$.each(descriptionArray, function (index, description) {
							if (description.text.length > 0) {
								minIndent = Math.min(minIndent, description.indentLevel);
							}
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
				});
			}
			
			quxViewer.start(newStateName);
			
			$.modal(container, {
				close: true,
				overlayClose: true,
				onClose: function () {
					closeModal();
					window.location.hash = "";
					return true;
				}
			});
		});
		$(window).hashchange();			
		
		$(".viewSource").bind("click", function () {
			window.location = "view-source:" + window.location.href;
			return false;
		});
	}
	catch (e) {
		alert("OOPS! " + e);
	}
});
