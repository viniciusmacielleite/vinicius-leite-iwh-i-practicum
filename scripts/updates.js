window.onload = function() {
    var form = document.getElementById('skillsForm');
    var inputs = form.getElementsByTagName('input');
    var selectSkill = document.getElementsByName('selectedSkill')[0];
    var selects = form.getElementsByTagName('select');
    var button = document.getElementById('updateButton');

    button.disabled = true;

    for (var i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('change', function() {
            button.disabled = false;
        });
    }

    for (var i = 0; i < selects.length; i++) {
        if (selects[i] !== selectSkill) {
            selects[i].addEventListener('change', function() {
                button.disabled = false;
            });
        }
    }

    selectSkill.addEventListener('change', function() {
        button.disabled = true;
    });
}

function onSkillSelect() {
    var select = document.getElementById('skillSelect');
    var table = document.getElementById('skillsTable');
    var rows = table.getElementsByTagName('tr');
    var selectedSkill = select.options[select.selectedIndex].value;

    // Hides all rows
    for (var i = 0; i < rows.length; i++) {
        rows[i].style.display = 'none';
    }

    // Shows the row of the selected skill
    if (selectedSkill) {
        document.getElementById('skillsTableHead').style.display = '';
        document.getElementById(selectedSkill).style.display = '';
        table.style.display = '';
    } else {
        table.style.display = 'none';
    }
}