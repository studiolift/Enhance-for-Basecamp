// ==UserScript==
// @name           Basecamp Enhanced
// @include        *
// @description    Adds various config to basecamp, includeing collapsable to-do lists, priority colouring and quick links
// ==/UserScript==

// Last updated: 07-12-2010

// ------------------------------------------------------------
// Configuration
// ------------------------------------------------------------
var config = {
  'todoCollapse': true, // Adds a handy button to collapse to-do lists on the overview
  'quickLinks': true,   // Adds quick links to the overview for timesheets and to-do comments
  'priorities': true,   // Add colour coded priorities to to-dos: prefix with [HOT], [WARM] or [COLD]
  'colours': {          // colours for prioritised to-dos
    'hot': '#C00400',   // #C00400
    'warm': '#D96B00',  // #D96B00
    'cold': '#5BB0F2'   // #5BB0F2
  },
  'jqueryCDN': 'https://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js'
}

var jqueryCDN = '';

// ============================================================
// ============================================================
// You shouldn't need to edit anything beyond this line
// ============================================================
// ============================================================

// ------------------------------------------------------------
// Enhance!
// ------------------------------------------------------------

function enhance() {
  // Prevent conflicts with Basecamp's native JS
  $.noConflict();
  var j = jQuery;

  // install styles
  var css = [
    '.quick_link { font-size:11px; font-weight:normal; text-decoration:none; background:transparent url(https://asset0.basecamphq.com/images/basecamp_sprites.png) no-repeat 0 0; width:17px; text-indent:-9999px; display:inline-block; line-height:17px; }',
    '.quick_link:hover { background-color:transparent; cursor:pointer; }',
    '.quick_link.time { background-position:-392px 0; }',
    '.quick_link.comments { background-position:-104px 0; width:13px; line-height:13px; margin:2px 0 0 5px; }',
    'h2 button { background-color:#EEE; border:solid 1px #CCC; margin-left:-5px; width:21px; height:19px; text-align:center; line-height:14px; }',
    'h2 button:hover { background-color:#FFF; cursor:pointer; -webkit-box-shadow:inset 2px 2px 2px #DDD; }'
  ].join('\n');

  j('head').append('<style>' + css + '</style>');

  // only applies to the to-do overview page
  if (j('body.todoglobal').length > 0) {
    // Collapable global todo lists
    if (config.todoCollapse) {
      j('h2', '.todo_list').prepend('<button class="show" style="display:none">+</button>');
      j('h2', '.todo_list').prepend('<button class="hide">-</button>');

      j('h2 button').click(function(e){
        var btn = j(this);
        var parent = btn.closest('h2');

        parent.next('table').toggle();
        btn.siblings('button').toggle();
        btn.hide();

        e.preventDefault();
      });
    }

    // Quick links
    if (config.quickLinks) {
      j('.todo_list').each(function(){
        var h2 = j('h2', this);

        // Timesheet
        var url = j('a', h2).attr('href').replace('todo_lists', 'time_entries');
        h2.append('<a href="' + url + '" class="quick_link time">Timesheet</a>');

        var proj = j('a', h2).attr('href').replace('todo_lists', '');

        // Todo comments
        j('tr', this).each(function(){
          var id = j('small', this).attr('id').split('_');
          var url = proj + 'todo_items/' + id[1] + '/comments';

          j('.content', this).append('<a href="' + url + '" class="quick_link comments">Comments</a>');
        });
      });
    }
  }

  // Priorities
  if (config.priorities) {
    j('.todolist .content, .item .item_content, .items_wrapper .content span, .page_header .content .item').each(function(){
      var t = j(this).text().match(/\[(HOT|WARM|COLD)\]/g);

      if (t) {
        switch (t[0]) {
          case '[COLD]':
            j(this).css('color', config.colours.cold);
            break;
          case '[WARM]':
            j(this).css('color', config.colours.warm);
            break;
          case '[HOT]':
            j(this).css('color', config.colours.hot);
            break;
        }
      }
    });
  }
}

// ------------------------------------------------------------
// Load up jQuery from a CDN to start things up
// From http://www.phpied.com/preload-then-execute/
// ------------------------------------------------------------
var o = document.createElement('object');
o.data = config.jqueryCDN;
o.width = o.height = 0;

o.onload = function() {
  var s = document.createElement('script');
  s.src = config.jqueryCDN;

  s.onload = function() {
    enhance();
  };

  document.getElementsByTagName('head')[0].appendChild(s);
}

document.body.appendChild(o);