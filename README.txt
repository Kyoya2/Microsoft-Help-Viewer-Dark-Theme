How to apply:
1) Open the offline Microsot help viewer.
2) Open the "Manage Content" tab and navigate to the path sepcified under "Local storage path"
3) Save the file ".\ContentStore\EN-US\VS2017_BRANDING2_EN-US.1.mshc" in another location in case you would want to go back to the light theme.
4) Replace that file with the latest release of this repository.
5) Close visual studio and the help viewer and run "rmdir "%appdata%\..\Local\Microsoft\Windows\INetCache\IE" /S /Q" in cmd. This will force the help viewer to reload
its' cache.

How it works:
The file "VS2017_BRANDING2_EN-US.1.mshc" is a zip archive that contains js, css, htm and other files that make a generic template for all the documentation pages.
I simply copied some styles from the online microsoft documentation at http://docs.microsoft.com (which has a dark theme) over to the css file in that archive
to achieve the dark-theme look. Some things, such as the colors of a syntax-highlighted code in code-blocks, were just hard coded in each documentation page and were
not derived from the template. I solved this by ading my own snippet of code in the js file in the archive, this code will look for syntax-highlighted code in the
current page and replace it with colors fitting for dark mode.

Fun fact: the Microsoft help viewer uses Internet-Explorer to render its' pages, that means that we can use only the most basic JavaScript and CSS syntax when modifying
the template


This section is intended for people who want to edit the template.
How to make editing easier:
Suppose you made a change to the "branding.css" file and you want to see how the pages would look, it would be very tedious to zip-up the files and then perform all the steps
in the "How to apply" section every time that we want to make a small change. This is why I included the "Test files" directory that contains html files of random documentation
pages I found, simply drop those files into the "VS2017_BRANDING2_EN-US.1" folder and open them with Internet-Explorer, they will use the local files at their template and you can simply refresh the page to apply your edits.

If you want to do the same for a page that is not in the "Test files" directory:
1) Navigate to that page in the help viewer.
2) Right-click on the page > View Source. Save this file as an html document.
3) Open the html file in your favorite text editor and erase all occurrences of the string "ms-xhelp:///?76555C51-8CF1-4FEB-81C4-BED857D94EBB_EN-US_Microsoft;/".
4) Now, the file you have behaves the same as any other file in "Test files".