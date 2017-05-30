

const electron = window.require('electron');
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;

// Build our new menu
let menu = new Menu();

menu.append(new MenuItem({
  label: 'Delete',

  click: function() {
    // Trigger an alert when menu item is clicked
    alert('Deleted');
  }
}));

menu.append(new MenuItem({
  label: 'More Info...',

  click: function() {
    // Trigger an alert when menu item is clicked
    alert('Here is more information')
  }
}));

// Add the listener
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.js-context-menu').addEventListener('click', function (event) {
    menu.popup(remote.getCurrentWindow());
  });
});
