// ==UserScript==
// @name        Enhance! for Basecamp
// @description Adds various enhancements to Basecamp, includeing collapsable to-do lists, priority colouring and quick links
// @include     http://basecamphq.com/*
// @include     https://basecamphq.com/*
// @include     http://*.basecamphq.com/*
// @include     https://*.basecamphq.com/*
// @version     0.2
// @author      Mike Robinson
// @homepage    http://twitter.com/akamike
// ==/UserScript==

// ------------------------------------------------------------
// Configuration
// ------------------------------------------------------------
var config = {
  'todoCollapse': true, // Adds a handy button to collapse to-do lists on the overview
  'quickLinks': true,   // Adds quick links to the overview for timesheets and to-do comments
  'filters': true,      // Adds to-do list filters on the overview
  'forms': true,        // Adds select box time forms for common data entry
  'priorities': true,   // Add colour coded priorities to to-dos: prefix with [HOT], [WARM] or [COLD]
  'todoIDs': true,      // Add todo IDs and todo ID linking
  'colours': {          // colours for prioritised to-dos
    'hot': '#C00400',   // #C00400
    'warm': '#D96B00',  // #D96B00
    'cold': '#5BB0F2'   // #5BB0F2
  }
};

// ------------------------------------------------------------
// Enhance!
// ------------------------------------------------------------

var Enhance = function(){
  // Add custom styles
  var style = document.createElement('style');
  style.textContent = [
    '.quick_link { font-size:11px; font-weight:normal; text-decoration:none; background:transparent url(https://asset0.basecamphq.com/images/basecamp_sprites.png) no-repeat 0 0; width:17px; text-indent:-9999px; display:inline-block; line-height:17px; visibility:hidden; }',
    '.todo_list:hover h2 .quick_link, tr:hover .quick_link { visibility:visible; }',
    '.quick_link:hover { background-color:transparent; cursor:pointer; }',
    '.quick_link.time { background-position:-392px 0; }',
    '.quick_link.comments { background-position:-104px 0; width:13px; line-height:13px; margin:2px 0 0 5px; }',
    '.todo_id { padding-left:5px; font-size:11px; color:#999; }',
    '#collapse { position:absolute; left:30px; top:55px; }',
    'h2 button, #collapse button { background-color:#EEE; border:solid 1px #CCC; margin-left:-5px; width:17px; height:16px; text-align:center; line-height:14px; padding:0; position:relative; top:-2px; }',
    '#collapse button { width:85px; padding:0 5px; text-align:left; }',
    'h2 button:hover, #collapse button:hover { background-color:#FFF; cursor:pointer; }',
    '#filters { display:inline; font-size:11px; }',
    '#filters label { cursor:pointer; }',
    '.todo_cold { color:' + config.colours.cold + '; }',
    '.todo_warm { color:' + config.colours.warm + '; }',
    '.todo_hot { color:' + config.colours.hot + '; }',
    '.hidden { display:none; }'
  ].join('\n');

  document.getElementsByTagName('head')[0].appendChild(style);

  // Helper stuff
  var body = document.getElementsByTagName('body')[0];

  Element.prototype.hasClass = function() {
    if (this.className.indexOf(arguments[0]) != -1) {
      return true;
    }

    return false;
  }

  /*
   * Show the provided element
   */
  Object.prototype.eShow = function() {
    if (this.isArray() || this.isNodeList()) {
      for (var i = 0; i < this.length; i++) {
        this[i].eShow();
      }
    } else if (this.hasClass('hidden')) {
      this.className = this.className.replace(/ hidden/, '');
    }

    return this;
  }

  /*
   * Hide the provided element
   */
  Object.prototype.eHide = function() {
    if (this.isArray() || this.isNodeList()) {
      for (var i = 0; i < this.length; i++) {
        this[i].eHide();
      }
    } else if (!this.hasClass('hidden')) {
      this.className += ' hidden';
    }

    return this;
  }

  /*
   * Testing for Arrays and NodeLists
   */
  Object.prototype.isArray = function() {
    return this.constructor == Array;
  }

  Object.prototype.isNodeList = function() {
    return this.constructor == NodeList;
  }

  /*
   * Now let's add some features!
   */
  if (body.className.match('.todoglobal')) {
    var todoLists = body.querySelectorAll('.todo_list');

    if (todoLists.length > 0) {
      for (var i = 0; i < todoLists.length; i++) {
        var list = todoLists[i];
        var h2 = list.getElementsByTagName('h2')[0];

        if (config.todoCollapse) {
          var minButton = document.createElement('button');
              minButton.className = 'hide';
              minButton.title = 'Collapse';
              minButton.textContent = '-';
              minButton.addEventListener('click', function(e){
                e.target.parentNode.nextSibling.nextSibling.eHide();
                e.target.eHide()
                        .nextSibling.eShow();

                e.preventDefault();
              });

          var maxButton = document.createElement('button');
              maxButton.className = 'show hidden';
              maxButton.title = 'Expand';
              maxButton.textContent = '+';
              maxButton.addEventListener('click', function(e){
                [e.target.parentNode.nextSibling.nextSibling, e.target.previousSibling].eShow();
                e.target.eHide();

                e.preventDefault();
              });

          h2.insertBefore(maxButton, h2.firstChild);
          h2.insertBefore(minButton, maxButton);
        }

        // Quick links
        if (config.quickLinks) {
          // Timesheet
          var timesheet = document.createElement('a');
              timesheet.href = h2.getElementsByTagName('a')[0].href.replace('todo_lists', 'time_entries');
              timesheet.className = 'quick_link time';
              timesheet.textContent = 'Timesheet';
          h2.appendChild(timesheet);

          var proj = h2.getElementsByTagName('a')[0].href.replace('todo_lists', 'todo_items/');

          // Todo comments
          var rows = list.getElementsByTagName('tr');

          for (var x = 0; x < rows.length; x++) {
            var row = rows[x];
            var id = row.getElementsByTagName('small')[0].id.split('_');

            var comments = document.createElement('a');
                comments.href = proj + id[1] + '/comments';
                comments.className = 'quick_link comments';
                comments.textContent = 'Comments';
            row.querySelectorAll('td:last-child')[0].appendChild(comments);
          }
        }
      }

      if (config.todoCollapse) {
        // Expand/Collapse all buttons
        var inner = body.querySelectorAll('.Full .innercol')[0];
        var tables = inner.querySelectorAll('.todolist');
        var minButtons = inner.querySelectorAll('.todo_list .hide');
        var maxButtons = inner.querySelectorAll('.todo_list .show');

        var collapseButton = document.createElement('button');
            collapseButton.className = 'hide';
            collapseButton.textContent = '- Collapse All';
            collapseButton.addEventListener('click', function(e){
              [tables, minButtons].eHide();
              maxButtons.eShow();

              e.target.eHide()
                      .nextSibling.eShow();

              e.preventDefault();
            });

        var expandButton = document.createElement('button');
            expandButton.className = 'show hidden';
            expandButton.textContent = '+ Expand All';
            expandButton.addEventListener('click', function(e){
              [tables, minButtons].eShow();
              maxButtons.eHide();

              e.target.eHide()
                      .previousSibling.eShow();

              e.preventDefault();
            });

        var collapseExpand = document.createElement('div');
            collapseExpand.id = 'collapse';

        collapseExpand.appendChild(collapseButton);
        collapseExpand.appendChild(expandButton);

        inner.insertBefore(collapseExpand, inner.firstChild);
      }
    }

    // Todo IDs
    if (config.todoIDs) {
      j('.todo_list tr').each(function(){
        var id = j('small', this).attr('id').split('_');
        j('td:last-child .content', this).after('<span class="todo_id">[#' + id[1] + ']</span>');
      });
    }

    // Filters
    if (config.filters) {
      j('#responsible_party_form').append('<div id="filters"><label for="onhold"><input type="checkbox" name="onhold" id="onhold" value="On hold" checked="checked"/> On hold</label><label for="active"><input type="checkbox" name="active" id="active" value="Active" checked="checked"/> Active</label><label for="new"><input type="checkbox" name="new" id="new" value="New" checked="checked"/> New</label></div>');
      j('#filters input:checkbox').click(function(e){
        filterLists(j(this).val());
      });
      j('div.page_header_links').attr('style', 'width:600px !important');
    }
  }

  // Priorities
  if (config.priorities) {
    var todos = body.querySelectorAll('.todolist .content, .item .item_content, .items_wrapper .content span, .page_header .content .item, .event .item span');

    for (var i = 0; i < todos.length; i++) {
      var todo = todos[i];
      var t = todo.textContent.match(/\[(HOT|WARM|COLD)\]/g);

      if (t) {
        var classSuffix = false;

        switch (t[0]) {
          case '[COLD]':
            classSuffix = 'cold';
            break;
          case '[WARM]':
            classSuffix = 'warm';
            break;
          case '[HOT]':
            classSuffix = 'hot';
            break;
        }

        if (classSuffix) {
          todo.className += ' todo_' + classSuffix;
        }
      }
    }
  }

  // Overview Quick link
  if (config.quickLinks) {
    // Separating pipe
    var separator = document.createElement('span');
        separator.className = 'pipe';
        separator.textContent = '\|';

    // The actual link
    var overviewLink = document.createElement('a');
        overviewLink.href = '/todo_lists';
        overviewLink.textContent = 'Overview';

    // Adding required HTML and spaces
    var globalLinks = document.getElementById('settings_signout_and_help');
        globalLinks.insertBefore(overviewLink, globalLinks.childNodes[2]);
        globalLinks.insertBefore(document.createTextNode(' '), overviewLink);
        globalLinks.insertBefore(separator, overviewLink.previousSibling);
        globalLinks.insertBefore(document.createTextNode(' '), separator);
  }

  // Inline todo ID linking
  if (config.todoIDs) {
    j('.formatted_text_body p').each(function(){
      var t = j(this).html();
      j(this).html(
        t.replace(/\#([0-9]{1,})/g, '<a href="/todo_items/$1/comments">#$1</a>')
      );
    });
  }

  if (config.forms && j('body.time').length > 0) {
    // Time entry simple time select
    var time_select = '<select name="time_entry[hours]" id="time_entry_hours">'
                    + '<option value="0">0</option>'
                    + '<option value="0.25">15 mins</option>'
                    + '<option value="0.50">30 mins</option>'
                    + '<option value="0.45">45 mins</option>';

    for (var i = 1; i <= 8; i++) {
      time_select = time_select
                  + '<option value="' + i + '.00">' + i + ' hour' + (i > 1 ? 's' : '') + '</option>'
                  + '<option value="' + i + '.25">' + i + 'h 15m</option>'
                  + '<option value="' + i + '.50">' + i + 'h 30m</option>'
                  + '<option value="' + i + '.45">' + i + 'h 45m</option>'
    }

    time_select = time_select + '</select>';

    j('#time_entry_hours').addClass('remove_me').after(time_select);
    j('.remove_me').remove();
  }

  function filterLists(query) {
    j('.todo_list table tr[class]').each(function(){
      if (jQuery.trim(j('td:first-child', this).text()) == query) {
        j(this).toggle();

        j(this).nextUntil('tr[class]').each(function(){
          j(this).toggle();
        });
      }
    });
  }
}();
