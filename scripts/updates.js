let textInputsValue = [];

function openTab(tabName) {
    document.getElementById('updateTab').style.display = 'none';
    document.getElementById('createTab').style.display = 'none';
    document.getElementById(tabName).style.display = 'block';
}

function setTextInputs() {
    let textInputs = document.querySelectorAll(`input[type=text][class^="update-name"]`);

    textInputs.forEach(function(input) {
        textInputsValue.push(input.value);
    });
    
    let textInputsCharacters = document.querySelectorAll(`input[type=text]`);
    var regex = /^[a-zA-Z0-9\s\-áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙâêîôûÂÊÎÔÛãõÃÕäëïöüÄËÏÖÜçÇ]*$/;
    
    textInputsCharacters.forEach(function(input) {
        input.addEventListener('input', function() {
            if (!regex.test(this.value)) {
                this.value = this.value.substring(0, this.value.length - 1);
            }
        });
        input.addEventListener('paste', function() {
            setTimeout(() => {
                this.blur();
            }, 0);
        });
    });
}

function setForms(operation) {
    setTextInputs();

    let forms = document.querySelectorAll(`form.form-${operation}`);

    forms.forEach((form, index) => {
        let nodeArray = Array.from(form);
        let nodeArrayMap = nodeArray.map(input => {
            return input.type === 'checkbox' || input.type === 'radio' ? input.checked : input.value;
        });
        let initialValues = Array.from(nodeArrayMap);
        let checkboxDivNames = ['technique', 'music_genre'];
        let radioDivNames = ['complexity_level', 'execution_level'];
        let textDivNames = ['name', 'description', 'operation'];
        let checkboxColumnsNotEmpty = true;

        if (operation == 'update')
        {
            checkboxDivNames.forEach(divName => {
                let div = document.getElementById(`${operation}-checkbox-${divName}-div-${index}`);
                let checkboxes = div.querySelectorAll(`input[type=checkbox].${operation}-checkbox`);

                for(let checkbox of checkboxes)
                {
                    let divNameAlert = null;
                    checkbox.addEventListener('click', () => {
                        let checkedCount = Array.from(checkboxes).filter(input => input.checked).length;

                        if (checkedCount === 0 && !checkbox.checked) {
                            let updateButton = document.getElementById(`${operation}-button-${index}`);
                            updateButton.disabled = true;
                            divNameAlert = divName.replace('_', ' ');
                            alert(`You can't let a ${divNameAlert} without any selected option(s)`);
                        }
                    });
                }
            });
        }

        nodeArray.forEach((nodeItem, nodeIndex) => {
            let isName = nodeItem.name === 'name';
            let isTextarea = nodeItem.name === 'description';

            nodeItem.addEventListener('change', () => {
                let nodeIndexEvent = nodeIndex;
                let textInputsValueEvent = textInputsValue;
                let isNameEvent = isName;
                let isTextareaEvent = isTextarea;
                let initialValuesEvent = initialValues;
                let currentValues = [];
                let formsEvent = document.querySelectorAll(`form.form-${operation}`);
                let updateButton = document.getElementById(`${operation}-button-${index}`);
                updateButton.disabled = true;

                formsEvent.forEach(formEvent => {
                    let nodeArrayEvent = Array.from(formEvent);
                    let nodeArrayMapEvent = nodeArrayEvent.map(inputEvent => {
                        return inputEvent.type === 'checkbox' || inputEvent.type === 'radio' ? inputEvent.checked : inputEvent.value;
                    });
                    let currentValue = Array.from(nodeArrayMapEvent);
                    currentValues.push(currentValue);
                });

                let areIdentical = identicalArrays(currentValues[index], initialValuesEvent);
                checkboxDivNames.forEach(divName => {
                    let div = document.getElementById(`${operation}-checkbox-${divName}-div-${index}`);
                    let checkboxes = div.querySelectorAll(`input[type=checkbox].${operation}-checkbox`);

                    for (let checkbox of checkboxes)
                    {
                        let checkedCount = Array.from(checkboxes).filter(input => input.checked).length;
                        if (checkedCount === 0 && !checkbox.checked) 
                        {
                            checkboxColumnsNotEmpty = false;
                            break;
                        }
                        else
                            checkboxColumnsNotEmpty = true;
                    }
                });

                if (isNameEvent)
                {
                    let currentValueValidation = currentValues[index][nodeIndexEvent];
                    let errorElement = document.getElementById(`${operation}-nameError-${index}`);

                    if(textInputsValueEvent.includes(currentValueValidation) && initialValuesEvent[nodeIndexEvent] != currentValueValidation)
                    {
                        alert('This skill name already exists and must be unique! Try another one.');
                        updateButton.disabled = true;
                        errorElement.textContent = '';
                    }
                    else
                    {
                        if (currentValueValidation == null || currentValueValidation == undefined || currentValueValidation.trim() == '')
                        { 
                            errorElement.textContent = 'This field is required.';
                            updateButton.disabled = true;
                        }
                        else
                        {
                            errorElement.textContent = '';
                            if (!areIdentical)
                            {
                                updateButton.disabled = false;
                            }
                            else
                            {
                                updateButton.disabled = true;
                            }
                        }
                    }
                }
                else if (isTextareaEvent)
                {
                    let errorElement = document.getElementById(`${operation}-textareaError-${index}`);
                    let currentValueValidation = currentValues[index][nodeIndexEvent];

                    if (currentValueValidation == null || currentValueValidation == undefined || currentValueValidation.trim() == '')
                    { 
                        errorElement.textContent = 'This field is required.';
                        updateButton.disabled = true;
                    }
                    else
                    {
                        errorElement.textContent = '';
                        if (!areIdentical)
                        {
                            updateButton.disabled = false;
                        }
                        else
                        {
                            updateButton.disabled = true;
                        }
                    }
                }
                else
                {
                    if (!areIdentical && checkboxColumnsNotEmpty)
                    {
                        updateButton.disabled = false;
                    }
                    else
                    {
                        updateButton.disabled = true;
                    }
                }
            });
        });

        $(`form-${operation}-${index}`).on('submit', function(event) {
            event.preventDefault();
            let operationEvent = operation;

            let formData = new FormData(event.target);
            let formDataObject = {};
            formDataObject.operation = operation;

            for (let [key, value] of formData.entries()) {
                if (formDataObject[key] !== undefined) 
                {
                    if (!Array.isArray(formDataObject[key]))
                    {
                        formDataObject[key] = [formDataObject[key]];
                    }
                    formDataObject[key].push(value);
                } 
                else 
                {
                    formDataObject[key] = value;
                }
            }

            let checkboxDivNamesEvent = checkboxDivNames;
            let radioDivNamesEvent = radioDivNames;
            let breakLoop = false;
            let divNameAlert = null;
            let notEmptyValidator = true;

            for (let divName of checkboxDivNamesEvent) 
            {
                let divCheckboxes = document.getElementById(`${operationEvent}-checkbox-${divName}-div-${index}`);
                let checkboxes = divCheckboxes.querySelectorAll(`input[type=checkbox].${operationEvent}-checkbox`);
                let checkedCount = Array.from(checkboxes).filter(input => input.checked).length;
                if (checkedCount === 0 && !this.checked)
                {
                    divNameAlert = divName.replace('_', ' ');
                    breakLoop = true;
                    break;
                }
            };

            if (breakLoop)
            {
                alert(`Please select at least one option of ${divNameAlert}!`);
                notEmptyValidator = false;
            }

            if (notEmptyValidator)
            {
                for (let divName of radioDivNamesEvent)
                {
                    let divRadios = document.getElementById(`${operationEvent}-radio-${divName}-div-${index}`);
                    let radios = divRadios.querySelectorAll(`input[type=radio].${operationEvent}-radio`);
                    let radiosCount = Array.from(radios).filter(input => input.checked).length;
                    if (radiosCount === 0 && !this.checked)
                    {
                        divNameAlert = divName.replace('_', ' ');
                        breakLoop = true;
                        break;
                    }
                }

                if (breakLoop)
                {
                    alert(`Please select at least one option of ${divNameAlert}!`);
                    notEmptyValidator = false;
                }

                if (notEmptyValidator)
                {
                    for (let item in formDataObject)
                    {
                        if (formDataObject[item] === null || formDataObject[item] === '' || formDataObject[item] === undefined) 
                        {
                            let message = '';
                            if(item == 'name' || item == 'description')
                                message = `The ${item} can't be empty!`;
                            else
                                message = `Please fill in at least one ${item.replace('_', ' ')}!`;
                
                            notEmptyValidator = false;
                            alert(message);
                            break;
                        }
                    }

                    if (notEmptyValidator)
                    {
                        $.ajax({
                            type: $(this).attr('method'),
                            url: $(this).attr('action'),
                            data: $(this).serialize(),
                            success: function(data) {

                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                console.log(errorThrown);
                            }
                        });
                    }
                }
            }
        });
    });
}

function identicalArrays(array1, array2) {
    if (array1.length !== array2.length) return false;
    return array1.every((value, index) => value === array2[index]);
}


function onSkillSelect() {
    var select = document.getElementById('skillSelect');
    var table = document.getElementById('updateSkillsTable');
    var rows = table.getElementsByTagName('tr');
    var selectedSkill = select.options[select.selectedIndex].value;

    // Hides all rows
    for (var i = 0; i < rows.length; i++) {
        rows[i].style.display = 'none';
    }

    // Shows the row of the selected skill
    if (selectedSkill) {
        document.getElementById('updateSkillsTableHead').style.display = '';
        document.getElementById(selectedSkill).style.display = '';
        table.style.display = '';
    } else {
        table.style.display = 'none';
    }
}