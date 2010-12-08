# Enhance! for Basecamp

A userscript for [Fluid.app](http://fluidapp.com/) and [basecamphq.com](http://basecamphq.com) with some stuff specific to how we work at Lift

## About

This userscript can be used with your basecamphq.com instance of Fluid.app (SSB) to add some handy extras to make your life a bit easier. This userscript adds:

* Colour coded to-dos, currently 3 levels labelled by [HOT], [WARM] and [COLD]
* (To-do overview only) Adds buttons to collapse project to-do lists if they distract you from today's priority, includes a collapse/expand all button
* (To-do overview only) Adds checkboxes to filter to-do lists based on their type (Active, On Hold and New)
* (To-do overview only) Adds quick links to a project's timesheet and individual to-do comment pages

Each of these features can be enabled or disabled though a simple config at the top of the script, and the colours for the 3 priority levels can also be set.

## Requirements

* [Fluid.app](http://fluidapp.com/)
* A [basecamphq.com](http://basecamphq.com) account.
* A Basecamp SSB created by Fluid.app.
* The Lift process!

## Install

1. Place the file into your Basecamp SSB's userscript folder located at ~/Library/Application Support/Fluid/SSB/<your-ssb-name>/Userscripts. You can also access this from your Basecamp SSB using Userscripts > Open Userscripts Folder.
2. In your Basecamp SSB, Userscripts > Reload All Userscripts, and then Userscripts > Enhance! for Basecamp.
3. Reload the page or restart your SSB to ensure it has been installed correctly.

And that's it! You may need to reload the page or restart your SSB to ensure it has been installed correctly.

## Usage

The quick links and to-do collapse features will automatically start working, check your To-Do overview page to try them out! As for colour coded to-dos you will need to do a little bit of set up on your to-do items. Don't worry, if a to-do item hasn't had a priority set it will still appear as normal, this is just a handy extra visual cue.

To colour code your to-dos, prefix the to-do text with one of the following priorities, including square brackets:

* [HOT]
* [WARM]
* [COLD]

Use [HOT] for your top priority items, [WARM] for medium and [COLD] for items that are in the not urgent, "when I can get to it" category. Edit your to-dos or create new ones, then when you view a following page with that to-do item listed it will be coloured coded.

## Configuration

This requires a little bit of tweaking of the JavaScript file. Open the userscript, `Enhance_for_Basecamp.user.js` in your chosen text editor, then look for the "Configuration" near the top. This section contains a config object, by default it should look like this:

`var config = {
  'todoCollapse': true, // Adds a handy button to collapse to-do lists on the overview
  'quickLinks': true,   // Adds quick links to the overview for timesheets and to-do comments
  'filters': true,      // Adds to-do list filters on the overview
  'priorities': true,   // Add colour coded priorities to to-dos: prefix with [HOT], [WARM] or [COLD]
  'colours': {          // colours for prioritised to-dos
    'hot': '#C00400',   // #C00400
    'warm': '#D96B00',  // #D96B00
    'cold': '#5BB0F2'   // #5BB0F2
  },
  'jqueryCDN': 'https://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js'
};`

The first three values are for enabling and disabling features. Change "true" to "false" to disable and then back to "true" to enable. The "colours" block is for setting the 3 priority colours for to-do items, just in case you don't like the defaults. These can contain any colour you would usually use in CSS, and if you accidentally get too carried away the original colours are included in a comment to the right of each value.

Finally, the last item is the URL to the jQuery CDN which you shouldn't need to change, but it is there if you really need to!

When you're done, save the file and reload your current Basecamp SSB page to see your changes.

