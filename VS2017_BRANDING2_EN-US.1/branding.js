var L_ShowLoc_Text = "Show";
var L_InheritedLoc_Text = "Inherited";
var L_ProtectedLoc_Text = "Protected";
var L_NoMemberMessage_Text = "No members matching the current filter";
var L_CopyAlertLoc_Text = "Permission denied. Enable copying to the clipboard.";

// Do not localize beyond this point

var isPrinterFriendly = false;
var userPreferenceLang = "JavaScript";
var userShowMembers = "inherited|protected";
var memberCheckboxCount = 0;
var init = true;

function setUserPreferenceLang(index) {
    if (index == 1) {
        userPreferenceLang = "C#";
        return;
    }
    if (index == 2) {
        userPreferenceLang = "C++";
        return;
    }
    if (index == 3) {
        userPreferenceLang = "F#"
        return;
    }
    if (index == 4) {
        userPreferenceLang = "JScript"
        return;
    }
    if (index == 5) {
        userPreferenceLang = "VB"
        return;
    }
}

function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(";");
    for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x == c_name) {
            return unescape(y);
        }
    }
}


function getElementsByClass(searchClass, node, tag) {
    var classElements = new Array();
    if (node == null) node = document;
    if (tag == null) tag = '*';
    var els = node.getElementsByTagName(tag.toUpperCase());
    var elsLen = els.length;
    var pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");
    for (var i = 0, j = 0; i < elsLen; i++) {
        if (pattern.test(els[i].className)) {
            classElements[j] = els[i];
            j++;
        }
    }
    return classElements;
}


function hasElementWithAttribute(attributeName, node, tag) {
    if (node == null) node = document;
    if (tag == null) tag = '*';
    var els = node.getElementsByTagName(tag);
    var elsLen = els.length;
    for (var i = 0; i < elsLen; i++) {
        if (els[i].getAttribute(attributeName))
            return true;
    }
    return false;
}


function changeMembersLabel() {
    var x;
    if (init) {
        memberCheckboxCount = -1;
        var ttIds = [];
        var ttPos = [];
        var ttPosSorted = [];
        var divs = getElementsByClass("sectionblock", null, "div")
        if (divs && divs.length > 0) {
            for (var i = 0; i < divs.length; i++) {
                var firstChild = divs[i].firstChild;
                if (!firstChild || firstChild.nodeName.toLowerCase() != 'a' || !firstChild.id)
                    continue;

                if (!hasElementWithAttribute("data", divs[i], "tr"))
                    continue;

                ttIds.push(firstChild.id);
                ttPos.push(firstChild.offsetTop);
                ttPosSorted.push(firstChild.offsetTop);
            }

            if (ttIds.length > 0) {
                ttPosSorted.sort(intSort);
                var ttIdsSorted = [];

                for (var i = 0; i < ttPosSorted.length; i++) {
                    for (var j = 0; j < ttPos.length; j++) {
                        if (ttPos[j] == ttPosSorted[i]) {
                            ttIdsSorted.push(ttIds[j]);
                            ttPos[j] = -1;
                            break;
                        }
                    }
                }

                for (var i = 0; i < ttPosSorted.length; i++) {
                    var toggleElement = document.getElementById(ttIdsSorted[i]);
                    if (toggleElement) {
                        memberCheckboxCount++;
                        var buffer = [];
                        buffer.push("<div>{1}: <span><input type='checkbox' name='inherited{0}' value='inherited{0}'");
                        buffer.push(userShowMembers.indexOf('inherited') > -1 ? " checked='checked'" : "");
                        buffer.push(" onclick='toggleMembers(this)'>{2}</span>");
                        buffer.push("<span style='margin-left: 20px;'><input type='checkbox' name='protected{0}' value='protected{0}'");
                        buffer.push(userShowMembers.indexOf('protected') > -1 ? " checked='checked'" : "");
                        buffer.push(" onclick='toggleMembers(this)'>{3}</span><div id='noMembersMessage{0}' style='display:none; margin-top:5px; margin-bottom:5px; color:red;'>{4}</div></div>");
                        var htmlOutput = buffer.join("");
                        htmlOutput = htmlOutput.replace(/\{0\}/g, memberCheckboxCount);
                        // localize the string
                        htmlOutput = htmlOutput.replace(/\{1\}/g, L_ShowLoc_Text);
                        htmlOutput = htmlOutput.replace(/\{2\}/g, L_InheritedLoc_Text);
                        htmlOutput = htmlOutput.replace(/\{3\}/g, L_ProtectedLoc_Text);
                        htmlOutput = htmlOutput.replace(/\{4\}/g, L_NoMemberMessage_Text);
                        toggleElement.innerHTML = htmlOutput;
                    }
                }

                if (memberCheckboxCount > -1)
                    toggleMembers(document.getElementById('inherited' + 0));
            }
        }
    } else {
        var inheritedCheck = userShowMembers.indexOf('inherited') > -1;
        var protectedCheck = userShowMembers.indexOf('protected') > -1;
        for (var i = 0; i <= memberCheckboxCount; i++) {
            var checkbox = document.getElementById('inherited' + i);
            checkbox.checked = inheritedCheck;
            checkbox = document.getElementById('protected' + i);
            checkbox.checked = protectedCheck;
        }

        setCookie("showMembers", userShowMembers, 365);
    }

    init = false;
}

function onLoad() {
    // Read the query string to check if it's a print request
    var qs = window.location.search.substring(1);

    // Set all the codesnippets to focus the user preferred tab
    // As of now, we have fixed index value for a specific lang but we might make it dynamic, so passing both lang and index value.
    // find index of the lang in codesnippet collection
    var index = getIndexFromDevLang(userPreferenceLang);
    setCodesnippetLang(userPreferenceLang, index);

    // if it's a print request then set isPrinterFriendly to true    
    if (qs.toLowerCase().indexOf('print=true') != -1) {
        isPrinterFriendly = true;
    }

    // always show expanded for printer friendly pages.
    if (isPrinterFriendly) {
        // loop through the object and expand before printing.
        for (var lstMember in listCollapsibleArea) {
            var elem = document.getElementById(listCollapsibleArea[lstMember]);
            var content = document.getElementById(listCollapsibleArea[lstMember] + '_c');
            if (elem && content) {
                var img = document.getElementById(listCollapsibleArea[lstMember] + '_img');
                img.className = 'cl_CollapsibleArea_expanding';
                content.className = 'sectionblock';
            }
        }
    }

    // support highcontrast for VS logo
    // Check for high contrast mode
    if (isHighContrast()) {
        onHighContrast(isBlackBackground());
    }

    // initialize the inherited/protected checkbox's
    var showMembers = getCookie("showMembers");
    if (showMembers != null)
        userShowMembers = showMembers;
    changeMembersLabel();

    initTabs();

    makeCodeBlocks();
	
	
	// MAKING STUFF PRETTIER FOR DARK MODE
    try
    {
        // Adjust code-block syntax highlighting to dark mode
        var styled_code_elements = document.querySelectorAll("div.OH_CodeSnippetContainer [style]");
        for (var i = 0; i < styled_code_elements.length; ++i)
        {

            var clr = (styled_code_elements[i].style.color || "").replace(/\s/g, "").toLowerCase();
	        if (clr == "blue")
	        {
	        	styled_code_elements[i].style.color = "#569cd6";
	        }
            else if (clr == "green")
            {
                styled_code_elements[i].style.color = "#63b456";
            }
            else if (clr == "maroon" || clr == "rgb(86,156,214)")
            {
                styled_code_elements[i].style.color = "#ce9178";
            }
            else if (clr == "red")
            {
                styled_code_elements[i].style.color = "#9cdcfe";
            }

	        // Make bolded text a bit thinner
	        var font_weight = (styled_code_elements[i].style["font-weight"] || "").replace(/\s/g, "").toLowerCase();
	        if (font_weight == "bold")
	        {
	        	styled_code_elements[i].style["font-weight"] = "600";
	        }
        }

        // Removing empty rows from tables
        var table_rows = document.querySelectorAll("table tr");
        for (var i = 0; i < table_rows.length; ++i)
        {
            if (table_rows[i].textContent.trim().length == 0)
            {
                table_rows[i].parentNode.removeChild(table_rows[i]);
            }
        }
    }
    catch (err) {}
}

/****************************************************Codesnippet functionality*******************************************************/
// we stored the ids of code snippets of same pages so that we can do interaction between them when tab are selected
var snippetIdSets = new Array();

var allLanguageTagSets = new Array();

// We call this function from Redering-writeStandaloneCodeSnippet & writeCodeSnippet functions.
// The following method will fill up the snippetIdSets with codesnippet ids on the page and snippetIdSets with devlangs used in snippet collections, which will be used in LST control.
function addSpecificTextLanguageTagSet(codesnippetid) {
    var i = 1;
    while (i < 7) {
        var snippetObj = document.getElementById(codesnippetid + "_tab" + i);
        if (snippetObj == null) break;

        var tagSet = getDevLangFromCodeSnippet(snippetObj.innerHTML);
        var insert = true;
        var j = 0;
        while (j < allLanguageTagSets.length) {
            if (allLanguageTagSets[j] == tagSet) {
                insert = false;
                break;
            }
            j++;
        }
        if (insert) allLanguageTagSets.push(tagSet);
        i++;
    }
    snippetIdSets.push(codesnippetid);
}

function getIndexFromDevLang(lang) {
    var temp = lang.toLowerCase().replace(" ", "");
    if (temp.indexOf("javascript") != -1)
        return 1;
    if ((temp.indexOf("csharp") != -1) || (temp.indexOf("c#") != -1))
        return 2;
    // cppcx and cppwinrt display on C++ tab
    if ((temp.indexOf("cplusplus") != -1) || (temp.indexOf("visualc++") != -1) || (temp.indexOf("c++") != -1) || (temp.indexOf("cpp") != -1))
        return 3;
    if ((temp.indexOf("f#") != -1) || (temp.indexOf("fs") != -1) || (temp.indexOf("fsharp") != -1))
        return 4;
    if (temp.indexOf("jscript") != -1)
        return 5;
    if (temp.indexOf("visualbasic") != -1 || temp.indexOf("vb") != -1)
        return 6;
}

// Functions called from codesnippet.xslt
function ChangeTab(objid, lang, index, snippetCount) {
    setCodesnippetLang(lang, index);
    userPreferenceLang = lang;

    var currentLang = getDevLangFromCodeSnippet(lang);
    updateLST(currentLang);
}

var userPreferenceLangExists = false;
var firstSelectedLang = null;

function setCodesnippetLang(lang, index) {
    var i = 0;
    while (i < snippetIdSets.length) {
        // find if it's a solo snippet and if it a solo snippet then skip processing.
        var _tempSnippetCount = 6;
        if (document.getElementById(snippetIdSets[i] + "_tab5") == null) {
            i++;
            continue;
        }

        // check if the selected snippet is present in the snippet collection and if not present then set the index to 1
        if (document.getElementById(snippetIdSets[i] + "_tab" + index) == null) {
            index = 1;
        }

        setCurrentLang(snippetIdSets[i], lang, index, _tempSnippetCount);
        i++;
    }

    // Adjust the LST to the first code snippet group selected language if there is no active user prefered code snippet tab exists.
    if (userPreferenceLangExists == false && firstSelectedLang != null) {
        var currentLang = getDevLangFromCodeSnippet(firstSelectedLang);
        updateLST(currentLang);
    }
}

function setCurrentLang(objid, lang, index, snippetCount) {
    var _tab = document.getElementById(objid + "_tab" + index);
    if (_tab != null) {
        if (document.getElementById(objid + "_tab" + index).innerHTML.match("javascript:") == null) {

            //Select left most tab as fallback
            var i = 1;
            while (i < snippetCount + 1) {
                if (!document.getElementById(objid + "_tab" + i).getAttribute("disabled")) {
                    setCurrentLang(objid, document.getElementById(objid + "_tab" + i).innerHTML, i, snippetCount);
                    return;
                }
                i++;
            }
            return;
        }
        var langText = _tab.innerHTML;
        if (langText.indexOf(lang) != -1) {
            var i = 1;
            while (i < snippetCount + 1) {
                var tabtemp = document.getElementById(objid + "_tab" + i);
                if (tabtemp != null) {
                    if (isPrinterFriendly) {
                        tabtemp.style.display = 'none';
                    } else {
                        if (tabtemp.className == "OH_CodeSnippetContainerTabActive")
                            tabtemp.className = "OH_CodeSnippetContainerTabFirst";

                        if (tabtemp.className == "OH_CodeSnippetContainerTabActiveNotFirst")
                            tabtemp.className = "OH_CodeSnippetContainerTab";
                    }

                }
                // update the selected lang style from display none to display block.
                document.getElementById(objid + "_tab" + index).style.display = 'block';

                var codetemp = document.getElementById(objid + "_code_Div" + i);
                if (codetemp != null) {
                    if (codetemp.style.display != 'none')
                        codetemp.style.display = 'none';
                }
                i++;
            }
            document.getElementById(objid + "_tab" + index).className = "OH_CodeSnippetContainerTabActive";
            if (index != 1)
                document.getElementById(objid + "_tab" + index).className = "OH_CodeSnippetContainerTabActiveNotFirst";

            document.getElementById(objid + '_code_Div' + index).style.display = 'block';

            // change the css of the first/last image div according the current selected tab
            // if the first tab is selected
            if (index == 1)
                document.getElementById(objid + "_tabs").firstChild.className = "OH_CodeSnippetContainerTabLeftActive";
            else {
                if (document.getElementById(objid + "_tabs").firstChild.className != "OH_CodeSnippetContainerTabLeftDisabled")
                    document.getElementById(objid + "_tabs").firstChild.className = "OH_CodeSnippetContainerTabLeft";
            }

            // if the last tab is selected
            if (index == snippetCount)
                document.getElementById(objid + "_tabs").lastChild.className = "OH_CodeSnippetContainerTabRightActive";
            else {
                if (document.getElementById(objid + "_tabs").lastChild.className != "OH_CodeSnippetContainerTabRightDisabled")
                    document.getElementById(objid + "_tabs").lastChild.className = "OH_CodeSnippetContainerTabRight";
            }

            // show copy code button if EnableCopyCode is set to true 
            if (document.getElementById(objid + "_tab" + index).getAttribute("EnableCopyCode") == "true") {
                document.getElementById(objid + "_copycode").style.display = 'inline';
            } else {
                document.getElementById(objid + "_copycode").style.display = 'none';
            }
        }

        // record the very first code snippet selected lang
        if (firstSelectedLang == null) {
            firstSelectedLang = _tab.innerText;
        }

        if (_tab.innerText == userPreferenceLang) {
            userPreferenceLangExists = true;
        }
    }
}

function CopyToClipboard(objid, snippetCount) {
    var contentid;
    var i = 1;
    while (i <= snippetCount) {
        var obj = document.getElementById(objid + '_code_Div' + i);
        if ((obj != null) && (obj.style.display != 'none') && (document.getElementById(objid + '_code_Plain_Div' + i).innerText != '')) {
            contentid = objid + '_code_Plain_Div' + i;
            break;
        }

        obj = document.getElementById(objid + '_code_Plain_Div' + i);
        if ((obj != null) && (obj.style.display != 'none') && (document.getElementById(objid + '_code_Plain_Div' + i).innerText != '')) {
            contentid = objid + '_code_Plain_Div' + i;
            break;
        }
        i++;
    }
    if (contentid == null) return;
    if (window.clipboardData) {
        try {
            window.clipboardData.setData("Text", document.getElementById(contentid).innerText);
        } catch (e) {
            alert(L_CopyAlertLoc_Text);
        }
    } else {
        return;
    }
}

/****************************************************CollasibleArea functionality*******************************************************/

// write all the collapsiblecontrol object into this list.
var listCollapsibleArea = new Array();

function addToCollapsibleControlSet(id) {
    listCollapsibleArea.push(id);
}

// toggle on/off inherited and protected table rows
function toggleMembers(checkbox) {
    var checkboxNumber = 0;
    if (checkbox && (checkbox.value.indexOf("inherited") == 0 || checkbox.value.indexOf("protected") == 0))
        checkboxNumber = checkbox.value.substring(9);

    var showInherited = document.getElementById('inherited' + checkboxNumber).checked;
    var showProtected = document.getElementById('protected' + checkboxNumber).checked;

    var tables = document.getElementsByTagName("table");
    var tableCount = 0;
    for (var i = 0; i < tables.length; i++) {
        var id = tables[i].getAttribute('id');
        if (id.indexOf('memberList') == 0) {
            var count = 0;
            var rows = tables[i].getElementsByTagName("tr");
            for (var j = 0; j < rows.length; j++) {
                var hidden = false;
                var tr = rows[j].getAttribute("data");
                if (tr != null) {
                    if (showInherited != showProtected && tr.indexOf('inherited') > -1 && tr.indexOf('protected') > -1) {
                        rows[j].style.display = 'table-row';
                    } else {
                        if (tr.indexOf('inherited') > -1) {
                            if (showInherited) {
                                rows[j].style.display = 'table-row';
                            } else {
                                rows[j].style.display = 'none';
                                count++;
                                hidden = true;
                            }
                        }
                        if (tr.indexOf('protected') > -1 && !hidden) {
                            if (showProtected) {
                                rows[j].style.display = 'table-row';
                            } else {
                                rows[j].style.display = 'none';
                                count++;
                            }
                        }
                    }
                }
            }
            if (count > 0 && count == rows.length - 1) {
                tables[i].style.display = 'none';
                document.getElementById('noMembersMessage' + tableCount).style.display = 'block';
            } else {
                var noMsg = document.getElementById('noMembersMessage' + tableCount);
                if (noMsg)
                    noMsg.style.display = 'none';

                tables[i].style.display = 'table-row';
            }
            tableCount++;
        }
    }

    userShowMembers = "";
    if (!showInherited && !showProtected)
        userShowMembers = "empty";
    if (showInherited)
        userShowMembers = "inherited";
    if (showProtected)
        userShowMembers = userShowMembers + "|protected";

    if (!init) {
        changeMembersLabel();

        // with hiding/showing table rows the position of the html can change, this code scrolls the collapsibleArea back into view
        checkbox.scrollIntoView();
        window.scrollBy(0, -100);
    }
}

// Used by collapsibleArea
function CA_Click(id, ExpandName, CollapsName) {
    var elem = document.getElementById(id);
    var img = document.getElementById(id + '_img');
    var content = document.getElementById(id + '_c');
    if (elem && content) {
        if (content.className == 'sectionblock') {
            img.className = 'cl_CollapsibleArea_collapsing';
            elem.title = ExpandName;
            content.className = 'sectionnone';
        } else {
            img.className = 'cl_CollapsibleArea_expanding';
            elem.title = CollapsName;
            content.className = 'sectionblock';
        }
    }
};

/****************************************************LST functionality*******************************************************/

// we store the ids of LST control as dictionary object key values, so that we can get access to them and update when user changes to a different programming language. 
// The values of this dictioanry objects are ';' separated languagespecific attributes of the mtps:languagespecific control in the content.
// This function is called from LanguageSpecificText.xslt
var lanSpecTextIdSet = new Object();

function addToLanSpecTextIdSet(id) {
    var key = id.split("?")[0];
    var value = id.split("?")[1];
    lanSpecTextIdSet[key] = value;
}

// The function executes on OnLoad event and Changetab action on Code snippets.
// The function parameter changeLang is the user choosen programming language, VB is used as default language if the app runs for the fist time.
// this function iterates through the 'lanSpecTextIdSet' dictionary object to update the node value of the LST span tag per user's choosen programming language.
function updateLST(currentLang) {
    if (lanSpecTextIdSet == null)
        return;
    for (var lstMember in lanSpecTextIdSet) {
        var devLangSpan = document.getElementById(lstMember);
        if (devLangSpan != null) {
            // There is a carriage return before the LST control in the content, so the replace function below is used to trim the white space(s) at the end of the previous node of the current LST node.
            if (devLangSpan.previousSibling != null && devLangSpan.previousSibling.nodeValue != null) devLangSpan.previousSibling.nodeValue = devLangSpan.previousSibling.nodeValue.replace(/\s+$/, "");
            var langs = lanSpecTextIdSet[lstMember].split("|");
            var k = 0;
            while (k < langs.length) {
                if (currentLang == langs[k].split("=")[0]) {
                    devLangSpan.innerHTML = langs[k].split("=")[1];
                    break;
                }
                k++;
            }
        }
    }
}

// We only care abour vb, cpp and cs to set LST values
function getDevLangFromCodeSnippet(lang) {
    var tagSet = "nu";
    if (lang != null) {
        var temp = lang.toLowerCase().replace(" ", "");
        if (temp.indexOf("visualbasic") != -1)
            tagSet = "vb";
        if ((temp.indexOf("csharp") != -1) || (temp.indexOf("c#") != -1))
            tagSet = "cs";
        if ((temp.indexOf("cplusplus") != -1) || (temp.indexOf("visualc++") != -1) || (temp.indexOf("c++") != -1))
            tagSet = "cpp";
    }
    return tagSet;
}

/****************************************************HighContrast support for VSlogo*******************************************************/

// Called to determine if background is black
// Only accurate when in high constrast mode
function isBlackBackground() {
    var color = '';
    if (document.body.currentStyle) {
        color = document.body.currentStyle.backgroundColor;
    }
    if (color == 'rgb(0, 0, 0)' || color == '#000000') {
        return true;
    }

    return false;
}

// We use a colored span to detect high contrast mode
function isHighContrast() {
    var elem = document.getElementById('HCColorTest');
    if (elem) {
        // Set SPAN text color - will not be applied if in contrast mode
        elem.style.color = '#ff00ff';
        if (elem.currentStyle) {
            if (elem.currentStyle.color != '#ff00ff') {
                return true;
            }
        }
    }

    return false;
}

// Called when high constrast is detected
function onHighContrast(black) {
    if (black) {
        // Black background, so use alternative images
        // VS logo
        var logo = document.getElementById('VSLogo');
        if (logo) {
            var logoHC = document.getElementById('VSLogoHC');
            if (logoHC) {
                logo.style.display = 'none';
                logoHC.style.display = '';
            }
        }
    }
}

/****************************************************MultiMedia functionality*******************************************************/
// these are arrays to support multiple play controls on the page
var playControls = new Array();
var captionStyles = new Array();
var captions = new Array();
var currentSubtitle = new Array();
var captionsOn = new Array();

// caption info container object
function caption(begin, end, text, style) {
    this.begin = begin;
    this.end = end;
    this.text = text;
    this.style = style;
}

function findAllMediaControls(normalizedId) {
    var foundPos = -1;
    var ttsPos = -1;

    // get all the video and audio tags on the page
    var tts = document.getElementsByTagName("video");
    ttsArr = [];
    for (var i = 0, n; n = tts[i]; ++i) ttsArr.push(n);
    tts = document.getElementsByTagName("audio");
    for (var i = 0, n; n = tts[i]; ++i) ttsArr.push(n);

    for (var i = 0; i < ttsArr.length; i++) {
        playControls[i] = ttsArr[i].id.toLowerCase();
        captions[i] = new Array();
        captionStyles[i] = {};
        currentSubtitle[i] = -1;
        captionsOn[i] = -1;
    }

    return foundPos;
}

function getActivePlayer(normalizedId) {
    var foundPos = -1;
    if (playControls.length == 0) {
        foundPos = findAllMediaControls(normalizedId);
    }

    for (var i = 0; i < playControls.length; i++) {
        if (playControls[i] == normalizedId) {
            foundPos = i;
            break;
        }
    }

    return foundPos;
}

function captionsOnOff(id) {
    var foundPos = getActivePlayer(id.toLowerCase());

    if (foundPos > -1) {
        captionsOn[foundPos] = captionsOn[foundPos] * -1;
        if (captionsOn[foundPos] == -1) {
            document.getElementById(id + "_subtitleText").innerHTML = "";
            document.getElementById(id + "_CCon").src = document.getElementById(id + "_CCon").src.replace("ccon.png", "ccoff.png");
        } else
            document.getElementById(id + "_CCon").src = document.getElementById(id + "_CCon").src.replace("ccoff.png", "ccon.png");
    }
}

// convert string time to seconds
function toSeconds(t) {
    var s = 0.0;
    if (t) {
        var p = t.split(':');
        for (i = 0; i < p.length; i++) {
            s = s * 60 + parseFloat(p[i].replace(',', '.'));
        }
    }
    return s;
}

function getAllComments(node) {
    exp = "<" + "!" + "--" + "([\\s\\S]+?)" + "--" + ">";
    rexComment = new RegExp(exp, "g");
    var result = [];
    var e;
    while (e = rexComment.exec(node.innerHTML)) {
        result.push(e[1]);
    }

    return result;
}

function styleRectify(styleName, styleValue) {
    var newStyle = "";
    switch (styleName.substring(4).toLowerCase()) {
        case "fontsize":
            newStyle = "font-size:" + styleValue + "px";
            break;
        case "fontweight":
            newStyle = "font-weight:" + styleValue;
            break;
        case "fontstyle":
            newStyle = "font-style:" + styleValue;
            break;
        case "fontfamily":
            newStyle = "font-family:" + styleValue;
            break;
        case "textdecoration":
            newStyle = "text-decoration:" + styleValue;
            break;
        default:
            newStyle = styleName.substring(4) + ":" + styleValue;
    }

    return newStyle;
}

function showCC(id) {
    var foundPos = getActivePlayer(id.toLowerCase());
    document.getElementById(id + "_CCon").style.setAttribute("display", "block");

    var controlId = document.getElementById(id + "_group");

    // this is safe as identical event handlers are discarded
    controlId.addEventListener('mouseout', function hideCC(e) {
        if (e.toElement != null && e.toElement.id != id + "_CCon")
            document.getElementById(id + "_CCon").style.setAttribute("display", "none");
    }, true);
}

// load the DFXP content from the <tt> node
function loadDFXP(id) {
    var normalizedId = id.toLowerCase();
    var foundPos = -1;

    foundPos = getActivePlayer(normalizedId);

    var comments = getAllComments(document.getElementById(id)/*ttsArr[ttsPos]*/);

    // process the style lines
    parser = new DOMParser();
    var ttsNode = parser.parseFromString(comments[0].trim(), "text/xml");
    x = ttsNode.getElementsByTagName("style");
    for (var count = 0; count < x.length; count++) {
        var newStyle = "";
        for (var i = 0; i < x[count].attributes.length; i++) {
            if (x[count].attributes[i].name != "id")
                newStyle = newStyle + styleRectify(x[count].attributes[i].name, x[count].attributes[i].value) + ";";
        }
        captionStyles[foundPos][x[count].attributes["id"].value.toLowerCase()] = newStyle;
    }

    // process the caption lines
    x = ttsNode.getElementsByTagName("p");
    for (var count = 0; count < x.length; count++) {
        var content = "";
        // code handles the use of line break tags
        for (var i = 0; i < x[count].childNodes.length; i++) {
            if (x[count].childNodes[i].nodeType == 3)
                content = content + x[count].childNodes[i].textContent;
            else if (x[count].childNodes[i].nodeType == 1)
                content = content + "<" + x[count].childNodes[i].nodeName + "/>";
        }

        newCaption = new caption(toSeconds(x[count].getAttribute("begin")), toSeconds(x[count].getAttribute("end")), content, x[count].getAttribute("style"));
        captions[foundPos][count] = newCaption;
    }

    return foundPos;
}

// blat out the subtitles as the time rolls by
function subtitle(id) {
    // add cc button
    var foundPos = loadDFXP(id);
    var subtitle = -1
    var ival = setInterval(function () {
        if (captionsOn[foundPos] > 0) {
            var currentTime = document.getElementById(id).currentTime;
            if (currentTime != undefined) {
                for (var i = 0; i < captions[foundPos].length; i++) {
                    if (captions[foundPos][i].begin > currentTime) {
                        break;
                    }
                    subtitle = i;
                }
                if (subtitle != -1) {
                    if (currentSubtitle[foundPos] != subtitle) {
                        document.getElementById(id + "_subtitleText").innerHTML = "<span style=\"" + captionStyles[foundPos][captions[foundPos][subtitle].style] + "\">" + captions[foundPos][subtitle].text + "</span>";
                        currentSubtitle[foundPos] = subtitle;
                    } else {
                        if (captions[foundPos][subtitle].end < currentTime) {
                            document.getElementById(id + "_subtitleText").innerHTML = "";
                        }
                    }
                }
            }
        }
    }, 100);
}

function intSort(x, y) {
    return x - y;
}



//////////////////////////////////////////////////////////////////////////////
/// tabbed content
var globalWindow = window;
var window$1 = globalWindow;
var navigator$1 = globalWindow.navigator;
var document$1 = globalWindow.document;
var history = globalWindow.history;
var location$1 = globalWindow.location;

function parseQueryString(queryString) {
    var match;
    var pl = /\+/g;
    var search = /([^&=]+)=?([^&]*)/g;
    var decode = function(s) { return decodeURIComponent(s.replace(pl, ' ')); };
    if (queryString === undefined) {
        queryString = location$1.search;
    }
    queryString = queryString.substring(1);
    var urlParams = {};
    while (match = search.exec(queryString)) {
        urlParams[decode(match[1])] = decode(match[2]);
    }
    return urlParams;
}

function toQueryString(args) {
    var parts = [];
    for (var name_1 in args) {
        if (args.hasOwnProperty(name_1) && args[name_1] !== '' && args[name_1] !== null && args[name_1] !== undefined) {
            parts.push(encodeURIComponent(name_1) + '=' + encodeURIComponent(args[name_1]));
        }
    }
    return parts.join('&');
}

function updateQueryString(args, usePushState) {
    var current = parseQueryString();
    var changed = false;
    for (var name_2 in args) {
        if (args.hasOwnProperty(name_2) && current[name_2] !== args[name_2]) {
            current[name_2] = args[name_2];
            changed = true;
        }
    }
    if (!changed) {
        return;
    }
    var queryString = toQueryString(current);
    if (queryString.length > 0) {
        queryString = '?' + queryString;
    }
    var url = location$1.protocol + "//" + location$1.host + location$1.pathname + queryString + location$1.hash;
    if (usePushState) {
        history.pushState(current, document$1.title, url);
    } else {
        location$1.href = url;
    }
}

var contentTags = {
    id: 'id',
    name: 'name',
    type: 'type',
    scenario: 'scn',
    scenarioStep: 'scnstp',
    scenarioStepNumber: 'subnm'
};
var contentAttrs = {
    id: 'data-bi-id',
    name: 'data-bi-name',
    type: 'data-bi-type',
    scenario: 'data-bi-scn',
    scenarioStep: 'data-bi-scnstp',
    scenarioStepNumber: 'data-bi-subnm'
};

var ProtectedLocalStorage = (function() {
    function ProtectedLocalStorage() {}
    ProtectedLocalStorage.prototype.setItem = function(key, data) {
        try {
            return window$1.localStorage.setItem(key, data);
        } catch (e) {
            return undefined;
        }
    };

    ProtectedLocalStorage.prototype.setJsonItem = function(key, json) {
        try {
            return window$1.localStorage.setItem(key, JSON.stringify(json));
        } catch (e) {
            return undefined;
        }
    };

    ProtectedLocalStorage.prototype.getItem = function(key) {
        try {
            return window$1.localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    };

    ProtectedLocalStorage.prototype.getJsonItem = function(key) {
        try {
            return JSON.parse(window$1.localStorage.getItem(key));
        } catch (e) {
            return null;
        }
    };

    ProtectedLocalStorage.prototype.clear = function() {
        try {
            return window$1.localStorage.clear();
        } catch (e) {
            return undefined;
        }
    };

    ProtectedLocalStorage.prototype.removeItem = function(key) {
        try {
            return window$1.localStorage.removeItem(key);
        } catch (e) {
            return undefined;
        }
    };

    // Object.defineProperty(ProtectedLocalStorage.prototype, "length", {
    //     get: function() {
    //         try {
    //             return window$1.localStorage.length;
    //         } catch (e) {
    //             return 0;
    //         }
    //     },
    //     enumerable: true,
    //     configurable: true
    // });

    ProtectedLocalStorage.prototype.key = function(index) {
        try {
            return window$1.localStorage.key(index);
        } catch (e) {
            return null;
        }
    };

    return ProtectedLocalStorage;
}());
var localStorage$1 = new ProtectedLocalStorage();

function getPlatform$1() {
    var navigatorPlatforms = {
        'iPhone': 'ios',
        'iPad': 'ios',
        'iPod': 'ios',
        'Macintosh': 'macos',
        'MacIntel': 'macos',
        'MacPPC': 'macos',
        'Mac68K': 'macos',
        'Win32': 'windows',
        'Win64': 'windows',
        'Windows': 'windows',
        'WinCE': 'windows'
    };
    var platform = navigatorPlatforms[navigator.platform];
    if (platform !== undefined) {
        return platform;
    }
    if (/Android/.test(navigator.userAgent)) {
        return 'android';
    }
    if (/Linux/.test(navigator.platform)) {
        return 'linux';
    }
    return null;
}

function isPlatform(s) {
    return /android|ios|linux|macos|windows/.test(s);
}

var platform = getPlatform$1();
var platformStorageKey = 'preferred-platform';

function getPreferredPlatform() {
    var raw = localStorage$1.getItem(platformStorageKey);
    if (raw !== null && isPlatform(raw)) {
        return raw;
    }
    return null;
}

var preferredPlatform = getPreferredPlatform();

function setPreferredPlatform(platform) {
    localStorage$1.setItem(platformStorageKey, platform);
}

var Tab = (function() {
    function Tab(li, a, section) {
        this.li = li;
        this.a = a;
        this.section = section;
    }

    Tab.prototype.focus = function() {
        this.a.focus();
    };
    return Tab;
}());


function readTabsQueryStringParam() {
    // Read the query string to check if it's a print request
    var qs = window.location.search.substring(1);
    //var qs = parseQueryString();
    var t = qs.tabs;
    if (t === undefined || t === '') {
        return [];
    }
    return t.split(',');
}

function updateVisibilityAndSelection(group, state) {
    var anySelected = false;
    var platformTab;
    var firstVisibleTab;
    for (var _i = 0, _a = group.tabs; _i < _a.length; _i++) {
        var tab = _a[_i];
        tab.visible = tab.condition === null || state.selectedTabs.indexOf(tab.condition) !== -1;
        if (tab.visible) {
            if (!firstVisibleTab) {
                firstVisibleTab = tab;
            }
            if (!platformTab && tab.tabId === (preferredPlatform || platform)) {
                platformTab = tab;
            }
        }
        tab.selected = tab.visible && state.selectedTabs.indexOf(tab.tabId) !== -1;
        anySelected = anySelected || tab.selected;
    }
    if (!anySelected) {
        for (var _b = 0, _c = group.tabs; _b < _c.length; _b++) {
            var tab_1 = _c[_b];
            var index = state.selectedTabs.indexOf(tab_1.tabId);
            if (index === -1) {
                continue;
            }
            state.selectedTabs.splice(index, 1);
        }
        var tab = platformTab || firstVisibleTab;
        tab.selected = true;
        state.selectedTabs.push(tab.tabId);
    }
}

function initTabGroup(element, state) {
    var group = { tabs: [] };
    var li = element.firstElementChild.firstElementChild;
    while (li) {
        var a = li.firstElementChild;
        a.setAttribute(contentAttrs.name, 'tab');
        a.setAttribute('ms.cmpnm', 'tab');
        var section = document.getElementById(a.getAttribute('aria-controls'));
        var tab = new Tab(li, a, section);
        Object.defineProperty(tab, "tabId", {
            get: function() { return this.a.getAttribute('data-tab'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(tab, "condition", {
            get: function() { return this.a.getAttribute('data-condition'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(tab, "visible", {
            get: function() { return !this.li.hasAttribute('hidden'); },
            set: function(value) {
                if (value) {
                    this.li.removeAttribute('hidden');
                    this.li.removeAttribute('aria-hidden');
                } else {
                    this.li.setAttribute('hidden', 'hidden');
                    this.li.setAttribute('aria-hidden', 'true');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(tab, "selected", {
            get: function() { return !this.section.hasAttribute('hidden'); },
            set: function(value) {
                if (value) {
                    this.a.setAttribute('aria-selected', 'true');
                    this.a.tabIndex = 0;
                    this.section.removeAttribute('hidden');
                    this.section.removeAttribute('aria-hidden');
                } else {
                    this.a.setAttribute('aria-selected', 'false');
                    this.a.tabIndex = -1;
                    this.section.setAttribute('aria-hidden', 'true');
                    this.section.setAttribute('hidden', 'hidden');
                }
            },
            enumerable: true,
            configurable: true
        });


        group.tabs.push(tab);
        li = li.nextElementSibling;
    }
    updateVisibilityAndSelection(group, state);
    element.setAttribute(contentAttrs.name, 'tab-group');
    element.setAttribute('ms.cmpgrp', 'tab-group');
    element.tabGroup = group;
    state.groups.push(group);
}

function initTabs() {
    var hasTabGroup = false;
    var divs = document.getElementsByTagName("section"), item;
    for (var i = 0, len = divs.length; i < len; i++) {
        item = divs[i];
        if (item.id && item.id.indexOf("tabpanel_") == 0) {
            hasTabGroup = true;
            break;
        }
    }

    if (!hasTabGroup) {
        return;
    }

    var queryStringTabs = readTabsQueryStringParam();
    var elements = document.querySelectorAll('.tabGroup');
    //var elements = document.querySelector('.tabGroup');
    var state = { groups: [], selectedTabs: [] };
    for (var i = 0; i < elements.length; i++) {
        initTabGroup(elements.item(i), state);
    }
    //initTabGroup(elements, state);

    if (state.groups.length === 0) {
        return state;
    }
    document.body.addEventListener('click', function(event) { return handleClick(event, state); });
    document.body.addEventListener('keydown', function(event) { return handleKeyDown(event, state); });
    selectTabs(queryStringTabs);
    updateTabsQueryStringParam(state);
    return state;
}

function handleClick(event, state) {
    var info = getTabInfoFromEvent(event);
    if (info === null) {
        return;
    }
    event.preventDefault();
    var tabId = info.tabId,
        group = info.group;
    if (state.selectedTabs.indexOf(tabId) !== -1) {
        return;
    }
    var originalTop = info.anchor.getBoundingClientRect().top;
    var previousTabId = group.tabs.filter(function(t) { return t.selected; })[0].tabId;
    state.selectedTabs.splice(state.selectedTabs.indexOf(previousTabId), 1, tabId);
    updateTabsQueryStringParam(state);
    for (var _i = 0, _a = state.groups; _i < _a.length; _i++) {
        var group_1 = _a[_i];
        updateVisibilityAndSelection(group_1, state);
    }
    if (isPlatform(tabId)) {
        setPreferredPlatform(tabId);
    }
    var top = info.anchor.getBoundingClientRect().top;
    if (top !== originalTop && event instanceof MouseEvent) {
        window$1.scrollTo(0, window$1.pageYOffset + top - originalTop);
    }
}

function handleKeyDown(event, state) {
    var info = getTabInfoFromEvent(event);
    if (info === null) {
        return;
    }
    var tabId = info.tabId,
        group = info.group;
    var key = event.which;
    if (!event.altKey && (key === keyCodes.left || key === keyCodes.right || key === keyCodes.home || key === keyCodes.end)) {
        event.preventDefault();
        var isLeft = key === keyCodes.left || key === keyCodes.home;
        var index = void 0;
        if (event.ctrlKey || key === keyCodes.home || key === keyCodes.end) {
            var increment = isLeft ? 1 : -1;
            index = isLeft ? 0 : group.tabs.length - 1;
            while (!group.tabs[index].visible) {
                index += increment;
            }
        } else {
            var increment = isLeft ? -1 : 1;
            index = isLeft ? group.tabs.length - 1 : 0;
            while (group.tabs[index].tabId !== tabId || !group.tabs[index].visible) {
                index += increment;
            }
            do {
                index += increment;
                if (index === -1) {
                    index = group.tabs.length - 1;
                } else if (index === group.tabs.length) {
                    index = 0;
                }
            } while (!group.tabs[index].visible);
        }
        group.tabs[index].focus();
        return;
    }
}

function selectTabs(tabIds) {
    for (var _i = 0, tabIds_1 = tabIds; _i < tabIds_1.length; _i++) {
        var tabId = tabIds_1[_i];
        var a = document.querySelector(".tabGroup > ul > li > a[data-tab=\"" + tabId + "\"]:not([hidden])");
        if (a === null) {
            return;
        }
        a.dispatchEvent(new CustomEvent('click', { bubbles: true }));
    }
}

function updateTabsQueryStringParam(state) {
    //var qs = parseQueryString();
    var qs = window.location.search.substring(1);
    qs.tabs = state.selectedTabs.join();
    var url = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + toQueryString(qs) + window.location.hash;
    if (window.location.href === url) {
        return;
    }
    //history.replaceState({}, document$1.title, url);
}

function getTabInfoFromEvent(event) {
    if (!(event.target instanceof HTMLAnchorElement)) {
        return null;
    }
    var tabId = event.target.getAttribute('data-tab');
    if (tabId === null) {
        return null;
    }
    var group = event.target.parentElement.parentElement.parentElement.tabGroup;
    return { tabId: tabId, group: group, anchor: event.target };
}



/****************************************************** language selector ******************************************************************/

function getInternetExplorerVersion()
// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).
{
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    return rv;
}

function checkVersion() {
    var msg = "You're not using Internet Explorer.";
    var ver = getInternetExplorerVersion();

    if (ver > -1) {
        if (ver >= 8.0) {
            return true;
        } else {
            return false;
        }
    }
}

var preferenceStorageKey = 'proglang';
var languageConfig = {}
languageConfig.displayNameMap = {
    'aspx-csharp': 'ASP.NET (C#)',
    'aspx-vb': 'ASP.NET (VB)',
    'vb': 'VB',
    'csharp': 'C#',
    'cs': 'C#',
    'dotnetcli': '.NET Console',
    'fsharp': 'F#',
    'azurecli': 'Azure CLI',
    'azurepowershell': 'Azure PowerShell',
    'http': 'HTTP',
    'json': 'JSON',
    'cpp': 'C++',
    'java': 'Java',
    'objc': 'Objective-C',
    'ruby': 'Ruby',
    'php': 'PHP',
    'powershell': 'PowerShell',
    'js': 'JavaScript',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'azcopy': 'AzCopy',
    'python': 'Python',
    'nodejs': 'NodeJS',
    'xaml': 'XAML',
    'xml': 'XML',
    'sql': 'SQL',
    'swift': 'Swift',
    'md': 'Markdown',
    'cppcx': 'C++',
    'cppwinrt': 'C++'
};

languageConfig.visibilityMap = {
    'aspx-csharp': 'csharp',
    'aspx-vb': 'vb'
};

languageConfig.syntaxMap = {
    'azurepowershell': 'powershell'
};

languageConfig.visibilityMap = function() {
    var _preferred = '';

    return {
        prefered: function() {
            if (arguments.length === 1) {
                localStorage$1.setItem(preferenceStorageKey, 'lang-' + arguments[0]);
            } else {
                return (localStorage$1.getItem(preferenceStorageKey) || languageConfig.unset).substr(5);
            }
        }
    }

}

languageConfig.syntaxMap = {
    'azurepowershell': 'powershell'
};

var csharp = 'C#'
languageConfig.defaultLanguage = csharp;

var clipboardCopySupported = document$1.queryCommandSupported && document$1.queryCommandSupported('copy');

function clipboardCopy(text, owner) {
    if (!clipboardCopySupported) {
        return false;
    }
    var txt = document$1.createElement('textarea');
    txt.setAttribute(contentAttrs.name, getName(owner));
    txt.textContent = text;
    txt.classList.add('visually-hidden');
    document$1.body.appendChild(txt);
    txt.select();
    try {
        return document$1.execCommand('copy');
    } catch (ex) {
        return false;
    } finally {
        document$1.body.removeChild(txt);
    }
}
var unprintable = false;


function getLanguageNameRtlHtml(displayName, contentDir) {
    if (contentDir == 'rtl') {
        return escape$1(displayName).replace(/(^|\s|\>)(C#|F#|C\+\+)(\s*|[.!?;:]*)(\<|[\n\r]|$)/gi, '$1$2&lrm;$3$4');
    }
    return displayName;
}

function copyCodeBlockToClipboard(codeBlock, language) {
    var text = codeBlock.textContent.trim();
    if (language === 'powershell') {
        text = text.replace(/\bPS [a-z]:\\>\s?/gi, '');
    }
    return clipboardCopy(text, codeBlock);
}

function getElementLanguage(element, config) {
    for (var i = 0; i < element.classList.length; i++) {
        var name_1 = element.classList.item(i);
        if (/^lang-.+$/i.test(name_1)) {
            return name_1.substr(5);
        }
    }
    return config.unset;
}

function readGroupsFromContent(content, config, selectionOptions) {
    var selector = 'pre > code, span[class*="lang-"]';
    var elements = content.querySelectorAll(selector);
    var groups = [];
    var previous;
    for (var i = 0; i < elements.length; i++) {
        var element = elements.item(i);
        var language = getElementLanguage(element, config);
        var syntaxLanguage = config.syntaxMap[language] || language;
        var visibilityLanguage = config.visibilityMap[language] || language;
        var displayName = config.displayNameMap[language] || language || '';
        var code = element.textContent;
        var interactiveType = void 0;
        var highlightLines = '';
        var isPreCode = element.nodeName === 'CODE';
        if (isPreCode) {
            highlightLines = element.getAttribute('highlight-lines') || '';
            element = element.parentElement;
            interactiveType = interactiveTypes[element.getAttribute('data-interactive')];
        }
        var current = {
            type: isPreCode ? 'precode' : 'span',
            element: element,
            language: language,
            syntaxLanguage: syntaxLanguage,
            visibilityLanguage: visibilityLanguage,
            displayName: displayName,
            code: code,
            interactiveType: interactiveType,
            highlightLines: highlightLines,
            isEnhanced: false
        };
        var createNewGroup = !previous ||
            previous.type !== current.type ||
            previous.element !== current.element.previousElementSibling ||
            selectionOptions.indexOf(visibilityLanguage) === -1 ||
            selectionOptions.indexOf(previous.visibilityLanguage) === -1;
        if (createNewGroup) {
            var newGroup = { defaultLanguage: current, members: [current] };
            groups.push(newGroup);
        } else {
            var currentGroup = groups[groups.length - 1];
            currentGroup.members.push(current);
            if (current.visibilityLanguage === config.defaultLanguage) {
                currentGroup.visibilityLanguage = current;
            }
        }
        previous = current;
    }
    return groups;
}

function enhanceVisibleBlocks(groups, config, contentDir) {
    var toHighlight = [];
    for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
        var group = groups_1[_i];
        for (var _a = 0, _b = group.members; _a < _b.length; _a++) {
            var member = _b[_a];
            if (member.type === 'precode' && !member.isEnhanced && !member.element.hidden) {
                toHighlight.push(member);
                member.isEnhanced = true;
            }
        }
    }
    if (toHighlight.length === 0) {
        return;
    }
    var instructions = toHighlight.map(function(item) {
        return ({
            language: item.syntaxLanguage,
            code: item.code,
            highlightLines: item.highlightLines
        });
    });
    return syntaxHighlight(instructions).then(function(results) {
        for (var i = 0; i < results.length; i++) {
            var html = results[i].html;
            var item = toHighlight[i];
            //addCodeHeader(item, config, contentDir);
            item.element.firstElementChild.innerHTML = html;
        }
        //notifyContentUpdated();
    });
}

function setVisibility(groups, language) {
    var setBlockVisibility = function(block, visible) {
        block.element.hidden = !visible;
        if (block.header) {
            block.header.hidden = !visible;
        }
    };
    for (var _i = 0, groups_2 = groups; _i < groups_2.length; _i++) {
        var group = groups_2[_i];
        var anyVisible = false;
        for (var _a = 0, _b = group.members; _a < _b.length; _a++) {
            var member = _b[_a];
            var visible = member.visibilityLanguage === language;
            setBlockVisibility(member, visible);
            anyVisible = anyVisible || visible;
        }
        if (!anyVisible) {
            setBlockVisibility(group.defaultLanguage, true);
        }
    }
    //notifyContentUpdated();
}

function getInitialSelection(options, config) {
    var preferred = config.preferred;
    if (preferred !== config.unset && options.indexOf(preferred) !== -1) {
        return preferred;
    }
    if (config.defaultLanguage !== config.unset && options.indexOf(config.defaultLanguage) !== -1) {
        return config.defaultLanguage;
    }
    return options[0];
}

function syncCodeSnippetWithSelector(language) {
    var index = getIndexFromDevLang(language);
    setCodesnippetLang(languageConfig.displayNameMap[language], index);
    userPreferenceLang = languageConfig.displayNameMap[language];
    var currentLang = getDevLangFromCodeSnippet(languageConfig.displayNameMap[language]);
    updateLST(currentLang);
}

function makeCodeBlocks() {
    var selector = document$1.getElementById('lang-selector');
    if (selector == null) {
        return;
    }

    var hasSelector = selector !== null && selector.options.length > 0;

    var options = []
    for (var i = 0; i < selector.options.length; i++) {
        options.push(selector.options[i].value.substr(5));
    }

    var groups = readGroupsFromContent(document$1.body, languageConfig, options);
    if (hasSelector) {
        var language = getInitialSelection(options, languageConfig);
        selector.value = 'lang-' + language;
        setVisibility(groups, language);       
        syncCodeSnippetWithSelector(language);

        selector.onchange = function() {
            var language = selector.value.substr(5);
            languageConfig.preferred = language;
            setVisibility(groups, language);
            enhanceVisibleBlocks(groups, languageConfig, 'ltr'); 
            syncCodeSnippetWithSelector(language);
        };
    }
    return enhanceVisibleBlocks(groups, languageConfig, 'ltr');
}