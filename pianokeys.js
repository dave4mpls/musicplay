//
//	PianoKeys piano key component in plain JavaScript!
//	Requires: pianokeys.css stylesheet.
//
"use strict";

var pianoKeyDisplay = new function() {

	var setupPianoKeyLogic = function(parentDiv, newKey, channel, velocity, heightVh, thisKeyNoteNumber, noteFunctionAttacherFunction) {
		// called by createPianoKeyboard to create the closures and internal functions that make piano keys go,
		// and call the higher-level functions passed in the note function attacher function (onNoteOn and onNoteOff).
		newKey.setAttribute("keyboardNote", "" + thisKeyNoteNumber);  // needed for glide feature, to identify other notes in same keyboard.
		var keyManager = { };
			// the key manager object contains all code necessary to make the keys work the way they should; when
			// the note function attacher function is called, it just needs to add functions to the keyManager called
			// onNoteOn and onNoteOff.
		var thisObject = keyManager;
		var lastKeyDown = -1, keyDownMap = { }, keyButtonMap = { };
		//-- the key manager should include some parameters so they are easy to reference
		thisObject.noteNumber = thisKeyNoteNumber;
		thisObject.keyButton = newKey;
		thisObject.keyDown = false;
		//-- these functions are mostly just translated out of React from the corresponding functions in Musical Playground
		thisObject.handleNoteDown = function(noteNumber, keyButton) { 
			// now can handle other notes down besides our own, due to dragging
			if (keyDownMap[noteNumber]) return;  // ignore double taps
			if (thisObject.onNoteOn) thisObject.onNoteOn(noteNumber, channel, velocity, keyButton);
			lastKeyDown = noteNumber; keyDownMap[noteNumber] = true;
			keyButtonMap[noteNumber] = keyButton;
		};
		thisObject.handleNoteUp = function(noteNumber) { 
			// now can handle other notes up besides our own, due to dragging
			if (thisObject.onNoteOff) thisObject.onNoteOff(noteNumber, channel, keyButtonMap[noteNumber]);
			keyDownMap[noteNumber] = false;
		};
		thisObject.handleAllNotesUp = function() {
			for (var noteNumber in keyDownMap) thisObject.onNoteOff(parseInt(noteNumber,10), channel, keyButtonMap[noteNumber]);
			keyDownMap = { };
		};
		thisObject.handleButtonDown = function(evt) {
			try { evt.preventDefault(); evt.stopPropagation(); } catch(e) { }
			thisObject.handleNoteDown(thisKeyNoteNumber, newKey);
		};
		thisObject.handleButtonUp = function(evt) { 
			try { evt.preventDefault(); evt.stopPropagation(); } catch(e) { }
			thisObject.handleAllNotesUp();
		};
		thisObject.handleMouseLeave = function(evt) {
			thisObject.handleAllNotesUp();
		};
		thisObject.handleMouseEnter = function(evt) {
			if (evt.buttons & 1 !== 0) thisObject.handleNoteDown(thisKeyNoteNumber, newKey);
		};
		thisObject.handleIgnoredEvent = function(evt) { try { evt.preventDefault(); evt.stopPropagation(); } catch(e) { } }
		thisObject.isMyKey = function(elem, noteNumber) {
			noteNumber = (typeof noteNumber !== 'undefined') ? noteNumber : -1;
			if (elem && elem.parentNode === parentDiv && elem.hasAttribute("keyboardNote")) {
				if (noteNumber===-1) return true;  // yes it's one of our keys
				else if (elem.getAttribute("keyboardNote") + "" === "" + noteNumber) return true;
				else return false;
			}
			else return false;
		};
		thisObject.handleKeyboardTouchDrag = function(evt) {
			for (var i = 0; i < evt.touches.length; i++) {
				var targetElement = evt.touches[i].target;
				if (thisObject.isMyKey(targetElement,thisKeyNoteNumber)) {
					var touchedElement = document.elementFromPoint(evt.touches[i].clientX, evt.touches[i].clientY);
					if (thisObject.isMyKey(touchedElement)) {
						if (touchedElement.getAttribute("keyboardNote") !== "" + lastKeyDown) {
							thisObject.handleAllNotesUp();
							thisObject.handleNoteDown(parseInt(""+touchedElement.getAttribute("keyboardNote"),10), touchedElement);
						}
					}
				}
			}
		};
		//--- now call the attacher function which attaches the onNoteOn and onNoteOff functions
		noteFunctionAttacherFunction(thisObject);
		//--- now attach all the low level event handlers to the key
		newKey.addEventListener("mousedown", thisObject.handleButtonDown);
		newKey.addEventListener("mouseup", thisObject.handleButtonUp);
		newKey.addEventListener("mouseenter", thisObject.handleMouseEnter);
		newKey.addEventListener("mouseleave",thisObject.handleMouseLeave);
		newKey.addEventListener("pointerdown",thisObject.handleButtonDown);
		newKey.addEventListener("pointerup",thisObject.handleButtonUp);
		newKey.addEventListener("pointerenter",thisObject.handleMouseEnter);
		newKey.addEventListener("pointerleave",thisObject.handleMouseLeave);
		newKey.addEventListener("touchstart",thisObject.handleButtonDown);
		newKey.addEventListener("touchend",thisObject.handleButtonUp);
		newKey.addEventListener("contextmenu",thisObject.handleIgnoredEvent);
		newKey.addEventListener("touchmove",thisObject.handleKeyboardTouchDrag);
		//--- done.
	}

	this.createPianoKeyboard = function(parentDiv, channel, velocity, heightVh, noteLow, noteHigh, noteFunctionAttacherFunction) {
		var lastKeyBlack = false;
		parentDiv.className = "piano-keyboard";
		parentDiv.style.height = (heightVh) + "vh";
		for (var i = noteLow; i <= noteHigh; i++) {
			var newKey = document.createElement("button");
			var keyClass = "piano-key";
			var isBlackKey = ([1,3,6,8,10]).indexOf(i % 12) !== -1;
			var keyHeight = (isBlackKey ? 0.5 : 1) * heightVh - 5;
			newKey.style.height = keyHeight + "vh";
			keyClass += (isBlackKey ? " piano-key-black" : " piano-key-white");
			keyClass += (((!isBlackKey) && lastKeyBlack) ? " piano-key-shiftback" : "");
			newKey.className = keyClass;
			setupPianoKeyLogic(parentDiv, newKey, channel, velocity, heightVh, i, noteFunctionAttacherFunction);
			parentDiv.appendChild(newKey);
			lastKeyBlack = isBlackKey;
		}
	}

	this.createDrumPad = function(parentDiv, channel, velocity, heightVh, noteLow, noteHigh,drumNameFunction, noteFunctionAttacherFunction) {
		var lastKeyBlack = false; 
		parentDiv.className = "piano-drumpad";
		parentDiv.style.height = (heightVh) + "vh";
		for (var i = noteLow; i <= noteHigh; i++) {
			var newKey = document.createElement("button");
			var keyClass = "piano-key";
			var keyHeight = (0.6) * heightVh - 5;
			newKey.style.height = keyHeight + "vh";
			newKey.textContent = drumNameFunction(i);
			keyClass += " piano-key-drums";
			newKey.className = keyClass;
			setupPianoKeyLogic(parentDiv, newKey, channel, velocity, heightVh, i, noteFunctionAttacherFunction);
			parentDiv.appendChild(newKey);
		}
	}

}();
