function each(object, callback) {
	var result;
	for (i in object) {
		if (object.hasOwnProperty(i)) {
			result = callback(i, object[i]);
			if (result === false) {
				break;
			}
		}
	}
}

var quxFile;

test("Quxly.File function exists", function() {
	expect(1);
	ok(window.Quxly);
});

module("Empty qux file", {
	setup: function () {
		quxFile = Quxly.File("");
	}
});

var emptyTests = {
	noStates: function() {
		var i, foundState = false;
		expect(1);
		each(quxFile.states, function (index, state) {
			foundState = true;
		});
		ok(!foundState);
	},
	noMixins: function() {
		var i, foundMixin = false;
		expect(1);
		each(quxFile.mixins, function (index, mixin) {
			foundMixin = true;
		});
		ok(!foundMixin);
	},
	noStartState: function() {
		expect(1);
		ok(quxFile.startState == null);
	},
	defaultMetasetttings: function() {
		expect(1);
		ok(quxFile.metaSettings.tabSpacing == 4);
	}
};

test("empty lines", function() {
	expect(2);
	ok(quxFile.lines.length == 1);
	ok(quxFile.lines[0].length == 0);
});

test("no text", function() {
	expect(1);
	ok(quxFile.text.length == 0);
});

test("no states", emptyTests.noStates);

test("no mixins", emptyTests.noMixins);

test("no start state", emptyTests.noStartState);

test("default metasettings", emptyTests.defaultMetasetttings);

module("Empty qux file with passed in metasettings options", {
	setup: function () {
		quxFile = Quxly.File("", {tabSpacing: 5, foo: "bar"});
	}
});

test("custom metasettings", function() {
	expect(2);
	ok(quxFile.metaSettings.tabSpacing == 5);
	ok(quxFile.metaSettings.foo == "bar");
});

module("Blank line qux file", {
	setup: function () {
		quxFile = Quxly.File("  ");
	}
});

test("empty lines", function() {
	expect(2);
	ok(quxFile.lines.length == 1);
	ok(quxFile.lines[0].length == 2);
});

test("no text", function() {
	expect(1);
	ok(quxFile.text.length == 2);
});

test("no states", emptyTests.noStates);

test("no mixins", emptyTests.noMixins);

test("no start state", emptyTests.noStartState);

module("Multiple blank line qux file", {
	setup: function () {
		quxFile = Quxly.File("  \n   \n    ");
	}
});

test("empty lines", function() {
	expect(4);
	ok(quxFile.lines.length == 3);
	ok(quxFile.lines[0].length == 2);
	ok(quxFile.lines[1].length == 3);
	ok(quxFile.lines[2].length == 4);
});

test("no text", function() {
	expect(1);
	ok(quxFile.text.length == 11);
});

test("no states", emptyTests.noStates);

test("no mixins", emptyTests.noMixins);

test("no start state", emptyTests.noStartState);


module("Tabs in qux file", {
	setup: function () {
		quxFile = Quxly.File("\t@foo\n\t\tbar\n    \t  \tbaz");
	}
});

test("non-empty lines", function() {
	expect(3);
	ok(quxFile.lines.length == 3);
	ok(quxFile.lines[0].length == 5);
	ok(quxFile.lines[1].length == 5);
});

test("tabs expanded in descriptions", function() {
	expect(5);
	ok(quxFile.states.foo.description.length == 2);
	ok(quxFile.states.foo.description[0].text == "bar");
	ok(quxFile.states.foo.description[0].indentLevel == 7);
	ok(quxFile.states.foo.description[1].text == "baz");
	ok(quxFile.states.foo.description[1].indentLevel == 11);
});

test("has text", function() {
	expect(1);
	ok(quxFile.text == "\t@foo\n\t\tbar\n    \t  \tbaz");
});

module("Tabs in qux file with non-standard tab spacing ", {
	setup: function () {
		quxFile = Quxly.File("%% tabSpacing: 5\n\t@foo\n\t\tbar\n    \t  \tbaz");
	}
});

test("non-empty lines", function() {
	expect(4);
	ok(quxFile.lines.length == 4);
	ok(quxFile.lines[0].length == 16);
	ok(quxFile.lines[1].length == 5);
	ok(quxFile.lines[2].length == 5);
});

test("tabs expanded in descriptions", function() {
	expect(5);
	ok(quxFile.states.foo.description.length == 2);
	ok(quxFile.states.foo.description[0].text == "bar");
	ok(quxFile.states.foo.description[0].indentLevel == 9);
	ok(quxFile.states.foo.description[1].text == "baz");
	ok(quxFile.states.foo.description[1].indentLevel == 14);
});

module("Comment only qux file", {
	setup: function () {
		quxFile = Quxly.File("// this is a comment\n// this is another comment");
	}
});

test("two lines", function() {
	expect(1);
	ok(quxFile.lines.length == 2);
});

test("comment text", function() {
	expect(1);
	ok(quxFile.text == "// this is a comment\n// this is another comment");
});

test("no states", emptyTests.noStates);

test("no mixins", emptyTests.noMixins);

test("no start state", emptyTests.noStartState);

module("Metasettings only in qux file", {
	setup: function () {
		quxFile = Quxly.File("%% bar: baz");
	}
});

test("metasetting set", function () {
	expect(1);
	ok(quxFile.metaSettings.bar == "baz");
});

module("Invalid state declaration");

test("raises error", function () {
	raises(function () {
		quxFile = Quxly.File("@");
	}, /Invalid state declaration/, "Is invalid state declaration");
});

module("Invalid mixin declaration");

test("raises error", function () {
	raises(function () {
		quxFile = Quxly.File(".");
	}, /Invalid mixin declaration/, "Is invalid mixin declaration");
});

module("Single state with no title qux file", {
	setup: function () {
		quxFile = Quxly.File("@foo");
	}
});

test("foo state exists", function () {
	expect(1);
	ok(typeof quxFile.states.foo != "undefined");
});

test("foo state has no title", function () {
	expect(1);
	ok(quxFile.states.foo.title.length == 0);
});

test("foo state has no description", function () {
	expect(1);
	ok(quxFile.states.foo.description.length == 0);
});

test("foo state has no next states", function () {
	expect(1);
	ok(quxFile.states.foo.nextStates.length == 0);
});

module("Single mixin with no title qux file", {
	setup: function () {
		quxFile = Quxly.File(".foo");
	}
});

test("foo mixin exists", function () {
	expect(1);
	ok(typeof quxFile.mixins.foo != "undefined");
});

test("foo mixin has no title", function () {
	expect(1);
	ok(quxFile.mixins.foo.title.length == 0);
});

test("foo mixin has no description", function () {
	expect(1);
	ok(quxFile.mixins.foo.description.length == 0);
});

test("foo mixin has no next states", function () {
	expect(1);
	ok(quxFile.mixins.foo.nextStates.length == 0);
});

module("Single state with title, description and next states", {
	setup: function () {
		quxFile = Quxly.File("@foo Foo state\n  - description line 1\n  - description line 2\n  if bar => @bam");
	}
});

test("foo state exists", function () {
	expect(1);
	ok(typeof quxFile.states.foo != "undefined");
});

test("foo state has title", function () {
	expect(1);
	ok(quxFile.states.foo.title == "Foo state");
});

test("foo state has description", function () {
	expect(3);
	ok(quxFile.states.foo.description.length == 2);
	ok(quxFile.states.foo.description[0].text == "- description line 1");
	ok(quxFile.states.foo.description[1].text == "- description line 2");
});

test("foo state has no next states", function () {
	expect(3);
	ok(quxFile.states.foo.nextStates.length == 1);
	ok(quxFile.states.foo.nextStates[0].text == "if bar");
	ok(quxFile.states.foo.nextStates[0].name == "bam");
});

module("Single state with single mixin that is used", {
	setup: function () {
		quxFile = Quxly.File(".line2 \n  - description line 2\n\n@foo Foo state\n  - description line 1\n  += .line2 \n  if bar => @bam");
	}
});

test("foo state exists", function () {
	expect(1);
	ok(typeof quxFile.states.foo != "undefined");
});

test("line2 mixin exists", function () {
	expect(1);
	ok(typeof quxFile.mixins.line2 != "undefined");
});

test("foo state has two line description", function () {
	expect(3);
	ok(quxFile.states.foo.description.length == 2);
	ok(quxFile.states.foo.description[0].text == "- description line 1");
	ok(quxFile.states.foo.description[1].text == "- description line 2");
});

module("Single state with single mixin that is used with regex", {
	setup: function () {
		quxFile = Quxly.File(".line2 \n  - description line 2\n\n@foo Foo state\n  - description line 1\n  += .lin.* \n  if bar => @bam");
	}
});

test("foo state exists", function () {
	expect(1);
	ok(typeof quxFile.states.foo != "undefined");
});

test("line2 mixin exists", function () {
	expect(1);
	ok(typeof quxFile.mixins.line2 != "undefined");
});

test("foo state has two line description", function () {
	expect(3);
	ok(quxFile.states.foo.description.length == 2);
	ok(quxFile.states.foo.description[0].text == "- description line 1");
	ok(quxFile.states.foo.description[1].text == "- description line 2");
});

module("One normal state with wildcard state", {
	setup: function () {
		quxFile = Quxly.File("@foo Foo state\n  - description line 1\n  if bar => @bam\n\n@.*\n  - description line 2");
	}
});

test("foo state exists", function () {
	expect(1);
	ok(typeof quxFile.states.foo != "undefined");
});

test("foo state has two line description", function () {
	expect(3);
	ok(quxFile.states.foo.description.length == 2);
	ok(quxFile.states.foo.description[0].text == "- description line 1");
	ok(quxFile.states.foo.description[1].text == "- description line 2");
});
