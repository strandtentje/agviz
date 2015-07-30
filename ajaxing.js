var baseurl = "{% baseurl %}";
String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

function fixUrlBase (url, bustcache) {	
	if (bustcache) {
		if (url.contains("?")) {
			url = url.replace("?", "?d=" + Date.now() + "&");
		} else {
			url = url + "?d=" + Date.now();
		}
	}	

	if (url.startsWith(baseurl)) {
		url = baseurl + "/ajax" + url.substring(baseurl.length);
	}

	return url;
}

// biggie4Life
// https://code.google.com/p/form-serialize/source/browse/trunk/serialize-0.1.js
function serialize (form) {
        if (!form || form.nodeName !== "FORM") {
                return;
        }
        var i, j, q = [];
        for (i = form.elements.length - 1; i >= 0; i = i - 1) {
                if (form.elements[i].name === "") {
                        continue;
                }
                switch (form.elements[i].nodeName) {
                case 'INPUT':
                        switch (form.elements[i].type) {
                        case 'text':
                        case 'hidden':
                        case 'password':
                        case 'button':
                        case 'reset':
                        case 'submit':
                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                                break;
                        case 'checkbox':
                        case 'radio':
                                if (form.elements[i].checked) {
                                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                                }                                              
                                break;
                        }
                        break;
                        case 'file':
                        break;
                case 'TEXTAREA':
                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                        break;
                case 'SELECT':
                        switch (form.elements[i].type) {
                        case 'select-one':
                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                                break;
                        case 'select-multiple':
                                for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                                        if (form.elements[i].options[j].selected) {
                                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].options[j].value));
                                        }
                                }
                                break;
                        }
                        break;
                case 'BUTTON':
                        switch (form.elements[i].type) {
                        case 'reset':
                        case 'submit':
                        case 'button':
                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                                break;
                        }
                        break;
                }
        }
        return q.join("&");
}


function doRequest (method, url, requestFinished) {
	var xmlhttp = new XMLHttpRequest();

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {										
			requestFinished(xmlhttp.responseText);
		};
	};

	xmlhttp.open(method, fixUrlBase(url, method == "GET"), true);

	return xmlhttp;
}

function rewireFormSubmits(parent, form, url) {
	var handleFormSubmit = function(e) {
		if (e.preventDefault) e.preventDefault();

		var data = serialize(form);

		var postxmlhttp = doRequest("POST", url, function(serialdata) {
			parent.assumeData(serialdata);
		});

		postxmlhttp.setRequestHeader(
			'Content-type', 'application/x-www-form-urlencoded')

		postxmlhttp.send(data);

		return false;
	};

	if (form.attachEvent) {
		form.attachEvent("submit", handleFormSubmit);
	} else {
		form.addEventListener("submit", handleFormSubmit);
	}
}

function patchInnerFormActions (targetBlock, url) {
	var currentChildIx;

	Array.prototype.forEach.call(targetBlock.childNodes,
		function(currentChildNode) {
			if ((currentChildNode.nodeType == 1) && 
				currentChildNode.className.contains("fixajaxaction")) {
				rewireFormSubmits(targetBlock, currentChildNode, url);
			}
		}
	);
}

function getTarget (sourceId, url) {	
	var target = document.getElementById(sourceId + "_target");

	if (!target.assumeData) {
		target.assumeData = function(serialdata) {
			target.innerHTML = serialdata;

			if (!target.className.startsWith("opened")) {
				target.className = "opened " + target.className.trim();
			}

			patchInnerFormActions(target, url);

			causeInvalidate();
		}		
	}

	return target;
}

function activate (expandable) {		
	var url = expandable.getAttribute("href");
	var target = getTarget(expandable.id, url);

	expandable.onclick = function(e) {
		if (e.preventDefault) e.preventDefault();

		if (target.className.startsWith("opened")) {
			target.className = target.className.substring(6);
			target.innerHTML = ""; 
			causeInvalidate();
		} else {			
			doRequest("GET", url, function(serialdata) {
				target.assumeData(serialdata);
			}).send();
		}		

		return false;
	};
}

Array.prototype.forEach.call(
	document.getElementsByClassName("expandlink"), activate);
