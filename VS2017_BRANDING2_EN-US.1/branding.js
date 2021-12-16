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


// SIG // Begin signature block
// SIG // MIIj/gYJKoZIhvcNAQcCoIIj7zCCI+sCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // N4cBS+MaoDfnpTVSIW41HcXpmsy31zHTO+9mipSrE4Wg
// SIG // gg2TMIIGETCCA/mgAwIBAgITMwAAAI6HkaRXGl/KPgAA
// SIG // AAAAjjANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTE2MTExNzIyMDkyMVoX
// SIG // DTE4MDIxNzIyMDkyMVowgYMxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xDTALBgNVBAsTBE1PUFIxHjAcBgNVBAMTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjCCASIwDQYJKoZIhvcNAQEB
// SIG // BQADggEPADCCAQoCggEBANCH1EIrfp3ZxnrUosPjFZLS
// SIG // U52VF8lSNvpUv6sQr+nJ58wmU8PCc79t1gDlANzpamc0
// SIG // MPYWF7QBpZV8i7mkLOaLO3n2Iwx5j/NS30ABHMLGA53r
// SIG // Wc9z6dhxOZvwziVZLdLJWwrvftYyDl10EgTsngRTpmsC
// SIG // Z/hNWYt34Csh4O/ApEUSzwN7A8Y5w9Qi3FVcd0L/nLLl
// SIG // VWdoui12an9mU0fVRwrMON6Ne5cZfYLQJviljuWh8F5k
// SIG // EOT56yfG8uAI0A3yZ8DY8i/7idoV+a4PPgCXB9ELPnDU
// SIG // d6tyeEGYB7gXzKKxX+y981Bno9eU8NKLVY9TppWT5rJm
// SIG // z8k3aORjx88CAwEAAaOCAYAwggF8MB8GA1UdJQQYMBYG
// SIG // CisGAQQBgjdMCAEGCCsGAQUFBwMDMB0GA1UdDgQWBBSr
// SIG // yNbtshXSqo7xzO1sOPdFStCKuzBSBgNVHREESzBJpEcw
// SIG // RTENMAsGA1UECxMETU9QUjE0MDIGA1UEBRMrMjMwMDEy
// SIG // K2IwNTBjNmU3LTc2NDEtNDQxZi1iYzRhLTQzNDgxZTQx
// SIG // NWQwODAfBgNVHSMEGDAWgBRIbmTlUAXTgqoXNzcitW2o
// SIG // ynUClTBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8vd3d3
// SIG // Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NybC9NaWNDb2RT
// SIG // aWdQQ0EyMDExXzIwMTEtMDctMDguY3JsMGEGCCsGAQUF
// SIG // BwEBBFUwUzBRBggrBgEFBQcwAoZFaHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNDb2RT
// SIG // aWdQQ0EyMDExXzIwMTEtMDctMDguY3J0MAwGA1UdEwEB
// SIG // /wQCMAAwDQYJKoZIhvcNAQELBQADggIBAESJAqxpU/PE
// SIG // trvUjGBT58psqElpZr6lmkGZOtid0lcCUWr6v5uW26Ym
// SIG // fQlW6NztJXV6pUdSqB5LFlPz7g+awwSVKcGChKRWMfyg
// SIG // ipGVtb9azqkBH2RGoebK8dd0e7+SCFFefDMCXlE7m+XY
// SIG // Ll8CTAmcGkPace3k2eei2nQsF63lDLUY9VQJ1L4cc80g
// SIG // e6T6yNvY2zqu+pDFo72VZa5GLVcpWNaS8GzaY/GPM6J+
// SIG // OHZe3fM17ayaO2KB0E4ZfEh8sAuPOMwtvNU5ZamVwQPi
// SIG // ksm5q9JXCqrcUgsuViej4piXV468qVluJJKOguIJc4LZ
// SIG // NYPMn3/RBI6IuOKag1iw1JrmMfqUR459puJOefPY02oz
// SIG // FlBw8UK7mAnp/8yVVVsIv5JSqAjE8ejx/0DX+Zo2nf26
// SIG // kIXSVT5QrUYf7yUMuJ46SARj73iYol0DDQLY3CCr5la1
// SIG // 3u8WZsPXVYIeT4J4yZ5UGhBgtxerQBORrrAZwZozne4y
// SIG // cs1lzE9GmC0PUWAefPv+2+gHeQf3oTM4/gma2497tjq9
// SIG // hYa4zLx9ATC3ex2pXRu9zE0X925HM9VA32rKLlG4tbnP
// SIG // wwTTO+Xj6RCM66e63qQuM2opLxRK6h7BIjg1BYXvwgQA
// SIG // DWvB2JYUSBWvflKwuGDEUrVKgreFKgBJKiaDJ1pB3r3V
// SIG // Zkm8C5x4cAm8MIIHejCCBWKgAwIBAgIKYQ6Q0gAAAAAA
// SIG // AzANBgkqhkiG9w0BAQsFADCBiDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEyMDAGA1UEAxMpTWljcm9zb2Z0IFJvb3QgQ2Vy
// SIG // dGlmaWNhdGUgQXV0aG9yaXR5IDIwMTEwHhcNMTEwNzA4
// SIG // MjA1OTA5WhcNMjYwNzA4MjEwOTA5WjB+MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29k
// SIG // ZSBTaWduaW5nIFBDQSAyMDExMIICIjANBgkqhkiG9w0B
// SIG // AQEFAAOCAg8AMIICCgKCAgEAq/D6chAcLq3YbqqCEE00
// SIG // uvK2WCGfQhsqa+laUKq4BjgaBEm6f8MMHt03a8YS2Avw
// SIG // OMKZBrDIOdUBFDFC04kNeWSHfpRgJGyvnkmc6Whe0t+b
// SIG // U7IKLMOv2akrrnoJr9eWWcpgGgXpZnboMlImEi/nqwhQ
// SIG // z7NEt13YxC4Ddato88tt8zpcoRb0RrrgOGSsbmQ1eKag
// SIG // Yw8t00CT+OPeBw3VXHmlSSnnDb6gE3e+lD3v++MrWhAf
// SIG // TVYoonpy4BI6t0le2O3tQ5GD2Xuye4Yb2T6xjF3oiU+E
// SIG // GvKhL1nkkDstrjNYxbc+/jLTswM9sbKvkjh+0p2ALPVO
// SIG // VpEhNSXDOW5kf1O6nA+tGSOEy/S6A4aN91/w0FK/jJSH
// SIG // vMAhdCVfGCi2zCcoOCWYOUo2z3yxkq4cI6epZuxhH2rh
// SIG // KEmdX4jiJV3TIUs+UsS1Vz8kA/DRelsv1SPjcF0PUUZ3
// SIG // s/gA4bysAoJf28AVs70b1FVL5zmhD+kjSbwYuER8ReTB
// SIG // w3J64HLnJN+/RpnF78IcV9uDjexNSTCnq47f7Fufr/zd
// SIG // sGbiwZeBe+3W7UvnSSmnEyimp31ngOaKYnhfsi+E11ec
// SIG // XL93KCjx7W3DKI8sj0A3T8HhhUSJxAlMxdSlQy90lfdu
// SIG // +HggWCwTXWCVmj5PM4TasIgX3p5O9JawvEagbJjS4NaI
// SIG // jAsCAwEAAaOCAe0wggHpMBAGCSsGAQQBgjcVAQQDAgEA
// SIG // MB0GA1UdDgQWBBRIbmTlUAXTgqoXNzcitW2oynUClTAZ
// SIG // BgkrBgEEAYI3FAIEDB4KAFMAdQBiAEMAQTALBgNVHQ8E
// SIG // BAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAfBgNVHSMEGDAW
// SIG // gBRyLToCMZBDuRQFTuHqp8cx0SOJNDBaBgNVHR8EUzBR
// SIG // ME+gTaBLhklodHRwOi8vY3JsLm1pY3Jvc29mdC5jb20v
// SIG // cGtpL2NybC9wcm9kdWN0cy9NaWNSb29DZXJBdXQyMDEx
// SIG // XzIwMTFfMDNfMjIuY3JsMF4GCCsGAQUFBwEBBFIwUDBO
// SIG // BggrBgEFBQcwAoZCaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraS9jZXJ0cy9NaWNSb29DZXJBdXQyMDExXzIw
// SIG // MTFfMDNfMjIuY3J0MIGfBgNVHSAEgZcwgZQwgZEGCSsG
// SIG // AQQBgjcuAzCBgzA/BggrBgEFBQcCARYzaHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraW9wcy9kb2NzL3ByaW1h
// SIG // cnljcHMuaHRtMEAGCCsGAQUFBwICMDQeMiAdAEwAZQBn
// SIG // AGEAbABfAHAAbwBsAGkAYwB5AF8AcwB0AGEAdABlAG0A
// SIG // ZQBuAHQALiAdMA0GCSqGSIb3DQEBCwUAA4ICAQBn8oal
// SIG // mOBUeRou09h0ZyKbC5YR4WOSmUKWfdJ5DJDBZV8uLD74
// SIG // w3LRbYP+vj/oCso7v0epo/Np22O/IjWll11lhJB9i0ZQ
// SIG // VdgMknzSGksc8zxCi1LQsP1r4z4HLimb5j0bpdS1HXeU
// SIG // OeLpZMlEPXh6I/MTfaaQdION9MsmAkYqwooQu6SpBQyb
// SIG // 7Wj6aC6VoCo/KmtYSWMfCWluWpiW5IP0wI/zRive/DvQ
// SIG // vTXvbiWu5a8n7dDd8w6vmSiXmE0OPQvyCInWH8MyGOLw
// SIG // xS3OW560STkKxgrCxq2u5bLZ2xWIUUVYODJxJxp/sfQn
// SIG // +N4sOiBpmLJZiWhub6e3dMNABQamASooPoI/E01mC8Cz
// SIG // TfXhj38cbxV9Rad25UAqZaPDXVJihsMdYzaXht/a8/jy
// SIG // FqGaJ+HNpZfQ7l1jQeNbB5yHPgZ3BtEGsXUfFL5hYbXw
// SIG // 3MYbBL7fQccOKO7eZS/sl/ahXJbYANahRr1Z85elCUtI
// SIG // EJmAH9AAKcWxm6U/RXceNcbSoqKfenoi+kiVH6v7RyOA
// SIG // 9Z74v2u3S5fi63V4GuzqN5l5GEv/1rMjaHXmr/r8i+sL
// SIG // gOppO6/8MO0ETI7f33VtY5E90Z1WTk+/gFcioXgRMiF6
// SIG // 70EKsT/7qMykXcGhiJtXcVZOSEXAQsmbdlsKgEhr/Xmf
// SIG // wb1tbWrJUnMTDXpQzTGCFcMwghW/AgEBMIGVMH4xCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xKDAmBgNVBAMTH01pY3Jvc29m
// SIG // dCBDb2RlIFNpZ25pbmcgUENBIDIwMTECEzMAAACOh5Gk
// SIG // Vxpfyj4AAAAAAI4wDQYJYIZIAWUDBAIBBQCgga4wGQYJ
// SIG // KoZIhvcNAQkDMQwGCisGAQQBgjcCAQQwHAYKKwYBBAGC
// SIG // NwIBCzEOMAwGCisGAQQBgjcCARUwLwYJKoZIhvcNAQkE
// SIG // MSIEIMwA6h8ukP4W1RKN6nLHfecoup/6glZQNhdPZSQh
// SIG // 0UtdMEIGCisGAQQBgjcCAQwxNDAyoBiAFgBiAHIAYQBu
// SIG // AGQAaQBuAGcALgBqAHOhFoAUaHR0cDovL21pY3Jvc29m
// SIG // dC5jb20wDQYJKoZIhvcNAQEBBQAEggEAeoEUHE00khyt
// SIG // A2LPEWHxkD6TtkIMyXNx+OI6aF3lFV7suRuwzAVAlrJj
// SIG // ZXq6rNtj+6c6/kcZA0wx/GyaTYWuOv2JageaQUoadmnf
// SIG // naRFZLe62xHRDErecXYjaHuwry3ZLM3J8mHrCOo30bgK
// SIG // nQn8ee1i/FbFjQzpV2IIhblHs3KpEXLTr0lN14tswvnO
// SIG // n02VaRRX0+1ND/Dy7me2RJC321xFq2yOd9QyEHNRMMXq
// SIG // S55cf/eF8VYKYG7dcYbuYQwHFOlT4dFE3Zy0aQsHka4w
// SIG // vDSvYYU1eaiteFKYMRskT2SmGeZot+NxvHdIlxfnV6kU
// SIG // 5XOMTDYCwb66LozUp19SF6GCE00wghNJBgorBgEEAYI3
// SIG // AwMBMYITOTCCEzUGCSqGSIb3DQEHAqCCEyYwghMiAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggE9BgsqhkiG9w0BCRAB
// SIG // BKCCASwEggEoMIIBJAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCCtL7gRjglYQBkG7TN3V0nvrB8D
// SIG // d8J2JhNHNmRCup0U1QIGWIudXVkiGBMyMDE3MDIxNTIw
// SIG // MDYwNi4wOTZaMAcCAQGAAgH0oIG5pIG2MIGzMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMQ0wCwYDVQQLEwRNT1BSMScwJQYD
// SIG // VQQLEx5uQ2lwaGVyIERTRSBFU046NzI4RC1DNDVGLUY5
// SIG // RUIxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFNlcnZpY2Wggg7QMIIGcTCCBFmgAwIBAgIKYQmBKgAA
// SIG // AAAAAjANBgkqhkiG9w0BAQsFADCBiDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEyMDAGA1UEAxMpTWljcm9zb2Z0IFJvb3Qg
// SIG // Q2VydGlmaWNhdGUgQXV0aG9yaXR5IDIwMTAwHhcNMTAw
// SIG // NzAxMjEzNjU1WhcNMjUwNzAxMjE0NjU1WjB8MQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBQQ0EgMjAxMDCCASIwDQYJKoZIhvcN
// SIG // AQEBBQADggEPADCCAQoCggEBAKkdDbx3EYo6IOz8E5f1
// SIG // +n9plGt0VBDVpQoAgoX77XxoSyxfxcPlYcJ2tz5mK1vw
// SIG // FVMnBDEfQRsalR3OCROOfGEwWbEwRA/xYIiEVEMM1024
// SIG // OAizQt2TrNZzMFcmgqNFDdDq9UeBzb8kYDJYYEbyWEeG
// SIG // MoQedGFnkV+BVLHPk0ySwcSmXdFhE24oxhr5hoC732H8
// SIG // RsEnHSRnEnIaIYqvS2SJUGKxXf13Hz3wV3WsvYpCTUBR
// SIG // 0Q+cBj5nf/VmwAOWRH7v0Ev9buWayrGo8noqCjHw2k4G
// SIG // kbaICDXoeByw6ZnNPOcvRLqn9NxkvaQBwSAJk3jN/LzA
// SIG // yURdXhacAQVPIk0CAwEAAaOCAeYwggHiMBAGCSsGAQQB
// SIG // gjcVAQQDAgEAMB0GA1UdDgQWBBTVYzpcijGQ80N7fEYb
// SIG // xTNoWoVtVTAZBgkrBgEEAYI3FAIEDB4KAFMAdQBiAEMA
// SIG // QTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAf
// SIG // BgNVHSMEGDAWgBTV9lbLj+iiXGJo0T2UkFvXzpoYxDBW
// SIG // BgNVHR8ETzBNMEugSaBHhkVodHRwOi8vY3JsLm1pY3Jv
// SIG // c29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9NaWNSb29D
// SIG // ZXJBdXRfMjAxMC0wNi0yMy5jcmwwWgYIKwYBBQUHAQEE
// SIG // TjBMMEoGCCsGAQUFBzAChj5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpL2NlcnRzL01pY1Jvb0NlckF1dF8y
// SIG // MDEwLTA2LTIzLmNydDCBoAYDVR0gAQH/BIGVMIGSMIGP
// SIG // BgkrBgEEAYI3LgMwgYEwPQYIKwYBBQUHAgEWMWh0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9QS0kvZG9jcy9DUFMv
// SIG // ZGVmYXVsdC5odG0wQAYIKwYBBQUHAgIwNB4yIB0ATABl
// SIG // AGcAYQBsAF8AUABvAGwAaQBjAHkAXwBTAHQAYQB0AGUA
// SIG // bQBlAG4AdAAuIB0wDQYJKoZIhvcNAQELBQADggIBAAfm
// SIG // iFEN4sbgmD+BcQM9naOhIW+z66bM9TG+zwXiqf76V20Z
// SIG // MLPCxWbJat/15/B4vceoniXj+bzta1RXCCtRgkQS+7lT
// SIG // jMz0YBKKdsxAQEGb3FwX/1z5Xhc1mCRWS3TvQhDIr79/
// SIG // xn/yN31aPxzymXlKkVIArzgPF/UveYFl2am1a+THzvbK
// SIG // egBvSzBEJCI8z+0DpZaPWSm8tv0E4XCfMkon/VWvL/62
// SIG // 5Y4zu2JfmttXQOnxzplmkIz/amJ/3cVKC5Em4jnsGUpx
// SIG // Y517IW3DnKOiPPp/fZZqkHimbdLhnPkd/DjYlPTGpQqW
// SIG // hqS9nhquBEKDuLWAmyI4ILUl5WTs9/S/fmNZJQ96LjlX
// SIG // dqJxqgaKD4kWumGnEcua2A5HmoDF0M2n0O99g/DhO3EJ
// SIG // 3110mCIIYdqwUB5vvfHhAN/nMQekkzr3ZUd46PioSKv3
// SIG // 3nJ+YWtvd6mBy6cJrDm77MbL2IK0cs0d9LiFAR6A+xuJ
// SIG // KlQ5slvayA1VmXqHczsI5pgt6o3gMy4SKfXAL1QnIffI
// SIG // rE7aKLixqduWsqdCosnPGUFN4Ib5KpqjEWYw07t0Mkvf
// SIG // Y3v1mYovG8chr1m1rtxEPJdQcdeh0sVV42neV8HR3jDA
// SIG // /czmTfsNv11P6Z0eGTgvvM9YBS7vDaBQNdrvCScc1bN+
// SIG // NR4Iuto229Nfj950iEkSMIIE2jCCA8KgAwIBAgITMwAA
// SIG // ALI1BWg3IhwNpwAAAAAAsjANBgkqhkiG9w0BAQsFADB8
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNy
// SIG // b3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0xNjA5
// SIG // MDcxNzU2NTdaFw0xODA5MDcxNzU2NTdaMIGzMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMQ0wCwYDVQQLEwRNT1BSMScwJQYD
// SIG // VQQLEx5uQ2lwaGVyIERTRSBFU046NzI4RC1DNDVGLUY5
// SIG // RUIxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFNlcnZpY2UwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw
// SIG // ggEKAoIBAQCYSgG70Vj1f3SRQumhLlNd8iwgbxIum9PX
// SIG // lZXcnW+JfA5rcClNsC4PNVb2jwJL+HxVbVDNP8eqePIQ
// SIG // B6gHawO7/CvwqiWd3fzxY3AkZW+E+ktEXs5yKH3Csx/F
// SIG // b4ZqmYeuuv7MBZi+b74Vgkdlty91yrzaEHqbOzJP2h1I
// SIG // kg4i57GxQm1ZwmKeLCoK8DU3IAIJ7OEU47UX44B+VO5d
// SIG // UQ6T2ZpKM8mvJg3r9msjlS8/XRIhN0okz469D5tTP+7p
// SIG // 7oxwe9o79Wq5mTy32wF8Ess/Vc70r9YGuTo833wn1HKU
// SIG // za9KCTbGIuxdc7064oAaHfW9d3CNY3B7wMD27p40aYe3
// SIG // AgMBAAGjggEbMIIBFzAdBgNVHQ4EFgQUM2S+Z2sc3Plj
// SIG // RAZI5MVDyZD2gpUwHwYDVR0jBBgwFoAU1WM6XIoxkPND
// SIG // e3xGG8UzaFqFbVUwVgYDVR0fBE8wTTBLoEmgR4ZFaHR0
// SIG // cDovL2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJv
// SIG // ZHVjdHMvTWljVGltU3RhUENBXzIwMTAtMDctMDEuY3Js
// SIG // MFoGCCsGAQUFBwEBBE4wTDBKBggrBgEFBQcwAoY+aHR0
// SIG // cDovL3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9N
// SIG // aWNUaW1TdGFQQ0FfMjAxMC0wNy0wMS5jcnQwDAYDVR0T
// SIG // AQH/BAIwADATBgNVHSUEDDAKBggrBgEFBQcDCDANBgkq
// SIG // hkiG9w0BAQsFAAOCAQEAQeCyoKDK9ChvzI3d/tu9IFWJ
// SIG // bCApdnY/1CfJXnuD+8HCRzaN9nohTEQbOnFjqyMmv0Su
// SIG // ohnvJ9ZYhrp6cPovtEvkcUg6V9K1/6MQG5oJw18eCegw
// SIG // zZHrVFzBC1n+9OpSL6h6NWtgtoM4CaaadtuWs9c1h6hk
// SIG // OlwGz0wTDcYiGLcAY4y4dbFF4alHWtv//LsaHVQ52xVf
// SIG // 5lfkNJ54L/203CDf0hMQo849cdnhsF5lWXuObO6Vs5nf
// SIG // 8KgcYQ9MT1eq1sQx9nwNYutsawChCoTSfHEpJyKk2BMP
// SIG // wHrInd06OereJwbcBGGOPGqEmt9OtprtsEzh+lGNgEIF
// SIG // pib2g28B5qGCA3kwggJhAgEBMIHjoYG5pIG2MIGzMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMQ0wCwYDVQQLEwRNT1BSMScw
// SIG // JQYDVQQLEx5uQ2lwaGVyIERTRSBFU046NzI4RC1DNDVG
// SIG // LUY5RUIxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFNlcnZpY2WiJQoBATAJBgUrDgMCGgUAAxUAvf/F
// SIG // lWOQ8ROcYNYZwK/puJ4eIB2ggcIwgb+kgbwwgbkxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xDTALBgNVBAsTBE1PUFIxJzAl
// SIG // BgNVBAsTHm5DaXBoZXIgTlRTIEVTTjo0REU5LTBDNUUt
// SIG // M0UwOTErMCkGA1UEAxMiTWljcm9zb2Z0IFRpbWUgU291
// SIG // cmNlIE1hc3RlciBDbG9jazANBgkqhkiG9w0BAQUFAAIF
// SIG // ANxPBuAwIhgPMjAxNzAyMTUxNjU3MDRaGA8yMDE3MDIx
// SIG // NjE2NTcwNFowdzA9BgorBgEEAYRZCgQBMS8wLTAKAgUA
// SIG // 3E8G4AIBADAKAgEAAgIbTQIB/zAHAgEAAgIa6DAKAgUA
// SIG // 3FBYYAIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEE
// SIG // AYRZCgMBoAowCAIBAAIDFuNgoQowCAIBAAIDB6EgMA0G
// SIG // CSqGSIb3DQEBBQUAA4IBAQB3udZgFXBBYZB+9IZ+0xyg
// SIG // V7S58S9Pciv86fFCGVAPsKfBty3ygeIHe4Ec/0NNXvxp
// SIG // 0tmZjy4t5TeQ62yu+w7e4g3z5u0LLewQDmShO8zvV8GN
// SIG // rGJLnCKxSk0oAhtsaW3Zd4S0mTlBFo+ZLN0p/koXMjoR
// SIG // Sd5MywrePOIbW+gkXzGWeV1oBtwYy1FJXKTWErchzxXF
// SIG // T3eIIObFRlRr1Ik1AqrAEKin9G/y8Xx2H+5BgyJaDCMg
// SIG // xdeyGRXp+lsF6jfG9Udp7bUWOJWZ4ah88XX0/qYCpJts
// SIG // xcgiOjiaOyNOU1JPdlVtCa52doKfdspZt/6uUQO22eih
// SIG // Ul99Jm8QTYADMYIC9TCCAvECAQEwgZMwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTACEzMAAACyNQVoNyIcDacA
// SIG // AAAAALIwDQYJYIZIAWUDBAIBBQCgggEyMBoGCSqGSIb3
// SIG // DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQx
// SIG // IgQgQbTEALQp+ZtLdNSY76ZoGr40jizQ0aTIjZHRiqTe
// SIG // vTgwgeIGCyqGSIb3DQEJEAIMMYHSMIHPMIHMMIGxBBS9
// SIG // /8WVY5DxE5xg1hnAr+m4nh4gHTCBmDCBgKR+MHwxCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAAAsjUFaDci
// SIG // HA2nAAAAAACyMBYEFPOTfbxrnhty5CjCcwM1j54OvFFk
// SIG // MA0GCSqGSIb3DQEBCwUABIIBAHWwh93/bvtXFRx3cFsT
// SIG // 4qe98aK7h7Mo6wEogPgKijqsfL1UhK3fLbN6jNRJAZH4
// SIG // M81393qvPf+0+e5yOeDsr9EvClrG4O1UPAhGJ5SYeOcK
// SIG // tIKJoVI+w8nDRVxqzSo/s71E3OOXRyVRUTMUTjY45NhY
// SIG // f1MTJzHc+aRDIIwr9e3RLdaYY9RPkTXBZYdfgo5VZHKj
// SIG // IikzmkY5jtqJNjGIg/1mUeyJrpNCMZEXDHwi15G5z3yE
// SIG // m10p2+c2lxuV1ihzTXOU0r1sHov5tzxZ3IVXaUwGvWOe
// SIG // UG0wrjhfWBKT4tJ+ao3HuPagfR4x9IgEo9WeuwnDiMwT
// SIG // bZ91VBiTL1uTlVI=
// SIG // End signature block
