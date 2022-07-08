javascript:(function(s){
    //Statements returning a non-undefined type, e.g. assignments
    document.getElementById('em-section-condition-basic-addbtn').click();
    document.querySelector('button.btn-primary.btn').click();
    document.querySelector('ul.em-categories li:nth-child(4)').click();
    var searchBox = document.querySelector('div.em-item-picker input[type=search]');
    searchBox.value = "Step - Target ID";
    searchBox.dispatchEvent(new InputEvent('input', { 'inputType': 'insertText', 'data': ' ' }));
    searchBox.dispatchEvent(new KeyboardEvent('keyup', { 'key': ' ' }));
    sleep(100);
    document.querySelector('#itemPickerList input[type=checkbox]').click();
    document.querySelector('div.tl-big-popup button[ng-click="select()"]').click();
})();