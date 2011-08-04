(function () {
	var utils;
	
	function QUXNextState(indentLevel, text, name) {
		return {
			indentLevel: indentLevel, 
			text: text, 
			name: name
		};
	}
	
	function QUXDescription(indentLevel, text) {
		return {
			indentLevel: indentLevel, 
			text: text
		};
	}
	
	function QUXState(name, title) {
		var nextStates = [], description = [];
		
		return {
			name: name,
			title: title,
			nextStates: nextStates,
			description: description
		}
	}
	
	function QUXMixin(name, title) {
		var nextStates = [], description = [];
		
		return {
			name: name,
			title: title,
			nextStates: nextStates,
			description: description
		}
	}	
	
	function QUXFile(textOrLines, settings) {
		var lines, text, states, mixins, startState, metaSettings;

		function tokenize(textOrLines) {
			switch (utils.type(textOrLines)) {
				case "Array":
					return textOrLines;
					
				case "String":
					return  textOrLines.split("\n");
					
				default:
					throw "QUXFile() parameter needs to be a block of text or an array of lines";
			}		
		}
		
		function parse(lines) {
			var firstState = null,
				currentState = null,
				currentMixin = null;
			
			function mergeDescriptionAndNextStates(source, dest) {
				utils.each(source.description, function (index, description) {
					dest.description.push(description);
				});
				utils.each(source.nextStates, function (index, nextState) {
					dest.nextStates.push(nextState);
				});							
			}
			
			function checkForPatterns(currentItem, itemList) {
				var foundPattern = false,
					testPattern;
				
				if (currentItem != null) {
					foundPattern = false;
					testPattern = new RegExp("^" + currentItem.name + "$");
					utils.each(itemList, function (index, testItem) {
						if (testPattern.test(testItem.name) && (testItem != currentItem)) {
							mergeDescriptionAndNextStates(currentItem, testItem);
							foundPattern = true;
						}
					});
					
					// get rid of the pattern state
					if (foundPattern) {
						delete itemList[currentItem.name];
					}
				}					
			}
			
			utils.each(lines, function (index, line) {
				var trimmedLine = utils.trim(line),
					firstChar = trimmedLine.substr(0, 1),
					secondChar = trimmedLine.substr(1, 1),
					restOfLine, indentLevel, parts, testState, i, foundState, toAppend, appendFrom, testPattern, ch;
					
				// skip empty lines
				if (trimmedLine.length == 0) {
					return;
				}
				
				// skip line comments
				if ((firstChar == "/") && (secondChar == "/")) {
					return;
				}
				
				// parse meta settings
				if ((firstChar == "%") && (secondChar == "%")) {
					parts = utils.trim(trimmedLine.substr(2)).split(":");
					if (parts.length != 2) {
						throw "Invalid meta setting: '" + line + "'";
					}
					metaSettings[utils.trim(parts[0])] = utils.trim(parts[1]);
					return;
				}

				// see if we need to process any state or mixin patterns before we add the new state
				if ((firstChar == "@") || (firstChar == ".")) {
					checkForPatterns(currentState, states);
					checkForPatterns(currentMixin, mixins);
				}
				
				restOfLine = trimmedLine.substr(1);
				
				// parse the state declaration
				if (firstChar == "@") {
					if (restOfLine.length== 0) {
						throw "Invalid state declaration: '" + line + "'";
					}
					parts = restOfLine.split(/\s/);
					
					currentMixin = null;
					currentState = QUXState(parts[0], parts.slice(1).join(" "));
					firstState = firstState || currentState;
					
					states[currentState.name] = currentState;
					return;
				}
				
				// parse the mixin declaration
				if (firstChar == ".") {
					parts = restOfLine.split(/\s/);
					if (parts[0].length == 0) {
						throw "Invalid mixin declaration: '" + line + "'";
					}

					currentState = null;
					currentMixin = QUXMixin(parts[0], parts.length > 1 ? parts.slice(1).join(" ") : "");
					mixins[currentMixin.name] = currentMixin;
					return;
				}
				
				if (!currentState && !currentMixin) {
					throw "No state or mixin has been defined yet before: '" + line + "'";
				}
				
				// get the indent level
				i = indentLevel = 0;
				while (i < line.length) {
					ch = line.substr(i, 1);
					if (ch == "\t") {
						do {
							indentLevel++;
						} while (((indentLevel + 1) % metaSettings.tabSpacing) != 0);
					}
					else if (ch == " ") {
						indentLevel++;
					}
					else {
						break;
					}
					i++;
				}
				
				// parse the next state, append or description declaration
				if (/=>/.test(trimmedLine)) {
				
					// validate the next step syntax
					parts = trimmedLine.split("=>");
					if ((parts.length != 2) || (utils.trim(parts[1]).length == 0) || (utils.trim(parts[1])[0] != "@")) {
						throw "Invalid next state declaration: '" + line + "'";
					}
					
					// add the next state to the currene item
					(currentState || currentMixin).nextStates.push(QUXNextState(indentLevel, utils.trim(parts[0]), utils.trim(parts[1]).substr(1)));
				}
				else if (/^\+=/.test(trimmedLine)) {
				
					// validate the append syntax
					parts = trimmedLine.split("+=");
					if ((parts.length != 2) || (utils.trim(parts[0]).length != 0) || (utils.trim(parts[1]).length == 0)) {
						throw "Invalid append declaration: '" + line + "'";
					}
					toAppend = utils.trim(parts[1]);
					
					// find where to append from
					appendFrom = toAppend.substr(0, 1) == "." ? mixins : (toAppend.substr(0, 1) == "@" ? states : null);
					if (!appendFrom) {
						throw "Invalid append declaration: '" + line + "'";
					}
					
					// merge the mixin or state patterns found
					testPattern = new RegExp("^" + toAppend.substr(1) + "$");
					utils.each(appendFrom, function (index, testItem) {
						if (testPattern.test(testItem.name) && (testItem != currentState) && (testItem != currentMixin)) {
							mergeDescriptionAndNextStates(testItem, (currentState || currentMixin));
						}
					});					
				}
				else {
					// add the description line to the current item
					(currentState || currentMixin).description.push(QUXDescription(indentLevel, trimmedLine));
				}
			});
			
			// process the trailing state or mixin
			checkForPatterns(currentState, states);
			checkForPatterns(currentMixin, mixins);
			
			startState = firstState;
		}
		
		settings = settings || {};
		
		lines = tokenize(textOrLines);
		text = lines.join("\n");
		
		states = {};
		mixins = {};
		startState = null;
		
		metaSettings = {
			tabSpacing: 4
		};			
		utils.each(settings, function (key, value) {
			metaSettings[key] = value;
		});
		
		parse(lines);
	
		return {
			lines: lines,
			text: text,
			states: states,
			mixins: mixins,
			startState: startState,
			metaSettings: metaSettings
		};
	}

	function QUXViewer(quxFile, settings) {
		var outerContainer, container, stateName, title, description, buttons, currentStateName;
		
		function addButton(nextState, text, className, container) {
			var button = tag("button", className || "quxViewerButton");
			button.innerHTML = text || nextState.text || "Next";
			(container || buttons).appendChild(button);
			
			function buttonClicked() {
				showState(nextState.name);
			}
			
			if (button.attachEvent) {
				button.attachEvent("onclick", buttonClicked);
			}
			else {
				button.addEventListener("click", buttonClicked);
			}
		}
		
		settings = settings || {};
		settings.hideState = settings.hideState || false;
		
		outerContainer = settings.container || document.body;
	
		container = tag("div", settings.containerClass || "quxViewerContainer",
			stateName = tag("div", settings.stateClass || "quxViewerStateName"),
			title = tag("div", settings.titleClass || "quxViewerTitle"),
			description = tag("div", settings.descriptonClass || "quxViewerDescription"),
			buttons = tag("div", settings.buttonContainerClass || "quxViewerButtonContainer"));
			
		outerContainer.appendChild(container);

		// conditional support for jQuery hashchange plugin
		if (jQuery && jQuery.fn.hashchange) {
			jQuery(window).hashchange(function () {
				var newStateName = window.location.hash.substr(1);
				if ((currentStateName != newStateName) && (newStateName.length > 0)) {
					showState(newStateName);
				}
			});
			jQuery(window).hashchange();
		}
		
		function start(atState) {
			atState = atState || window.location.hash.substr(1) || quxFile.startState.name;
			if (!atState) {
				alert("No starting state found");
			}
			showState(atState);
		}
		
		function showState(newStateName) {
			var html;
			
			var state = quxFile.states[newStateName];
			if (!state) {
				alert("The '" + newStateName + "' state was not found");
				return;
			}			
			
			currentStateName = state.name;
			window.location.hash = state.name;
			
			stateName.innerHTML = "@" + state.name;
			stateName.style.display = settings.hideState ? "none" : "block";
			
			title.innerHTML = state.title;
			
			html = [];
			utils.each(state.description, function (index, description) {
				var i, spacing = [];
				for (i = 0; i <= description.indentLevel; i++) {
					spacing.push("&nbsp;");
				}
				html.push(spacing.join("") + description.text);
			});
			description.innerHTML = html.join("<br/>");
			
			buttons.innerHTML = "";
			utils.each(state.nextStates, function (index, nextState) {
				addButton(nextState);
			});
		}
		
		function tag(name) {
			var el = document.createElement(name),
				args = Array.prototype.slice.call(arguments),
				i;
				
			if (args.length > 1) {
				el.className = args[1];
			}
				
			for (i = 2; i < args.length; i++) {
				if (args[i]) {
					el.appendChild(args[i]);
				}
			}
			
			return el;
		}
	
		return {
			start: start
		}
	}
	
	function Utils() {
	
		return {
			trim: trim,
			type: type,
			each: each
		};

		function trim(s) {
			return s.replace(/^\s+|\s+$/g, "");
		}
		
		function type(obj) {
			return Object.prototype.toString.call(obj).match(/^\[object (\w*)\]$/)[1];
		} 
		
		function each(object, callback) {
			var i, result;
			
			for (i in object) {
				if (object.hasOwnProperty(i)) {
					result = callback(i, object[i]);
					if (result === false) {
						break;
					}
				}
			}
		}
		
	}

	utils = Utils();
	window.QUXFile = QUXFile;
	window.QUXViewer = QUXViewer;
	
})();

	