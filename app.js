// Đối tượng validator
function Validator(options){   //options: là một tham số

    function getParent(element, selector){
        while (element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            } 
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    // Hàm thực hiện hiện ra error or bỏ error
    function validata(inputElement, rule){
        // Lấy value người dùng nhập vào: inputElement.value
        // lấy text function: rule.text
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);  // form-group
        var errorMessage;

        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        // lặp qua từng rules và  (check)
        for(var i =0; i < rules.length; i++ ){
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default: 
                     errorMessage = rules[i](inputElement.value)
            }
            //nếu có lỗi thì dừng check
            if(errorMessage){
                break;
            }
        }

        if(errorMessage){
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');     // invalid: không hợp lệ

        }
        else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }               
        
        return !errorMessage;
    }
    



    // Lấy element của form
    var formElement = document.querySelector(options.form);

    

    if(formElement){

        // Khi submit form
        formElement.onsubmit = function(e){
            e.preventDefault();

            var isFormValid = true;

            // lawpj qua tuwngf rule vaf validate 
            options.rules.forEach (function(rule){
                var inputElement = formElement.querySelector(rule.selector);  // 2 thẻ input: name, email

                var isValid = validata(inputElement, rule);

                if (!isValid) {
                    isFormValid = false;
                }
            });

            


            if(isFormValid){

                // trường hợp ónubmit bằng javascript
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disables])');
                    var formValues = Array.from(enableInputs).reduce(function(values, input){
                        
                        switch (input.type) {
                            case 'radio':
                            case 'checkbox':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            default:
                                values[input.name] = input.value;
                        }

                        return values
                    }, {});

                    // console.log(formValues)

                    options.onSubmit(formValues)
                }
                // trương hợp submit với hành vi mặc định HTML
                else {
                    formElement.submit();
                }
            }
        }
    }
    
    // Nếu có formElement
    if(formElement){

        // Lặp qua mỗi rule và xử lí lắng nghe: blur, input, submit
        options.rules.forEach (function(rule){      //options.rules: #fullname,  #email

            //Lưu lại các rule cho lỗ ô input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.text);
            } else {
                selectorRules[rule.selector] = [rule.text];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);  // 2 thẻ input: name, email


            Array.from(inputElements).forEach(function(inputElement){
                // Xử lí trường hợp blur khỏi input
                inputElement.onblur = function(){
                    validata(inputElement, rule)
                }

                // Xử lí trương trường hợp khi người dùng nhập thì mất lỗi 
                inputElement.oninput = function(){
                     var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);  // form-group

                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            });
        });
    }
}





// Định nghĩa các rules 
Validator.isRequired = function(selector, message){    // selector === #fullname
    return {
        selector: selector,
        text: function(value){     // Kiểm tra người dùng nhập hay chưa
            
            // Nguyên tắc của các rule
            // 1. Khi có lỗi thì trả error message
            // 2. Khi không có lỗi thì trả về rỗng ''

            return value ? '' : message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function(selector, message){       // selector === #email
    return {
        selector: selector,
        text: function(value){     // Kiểm tra người dùng nhập hay chưa
            // Nguyên tắc của các rule
            // 1. Khi có lỗi thì trả error message
            // 2. Khi không có lỗi thì trả về rỗng ''
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? '' : message || 'Trường này phải là email'
        }
    }
}

Validator.passwordLength = function(selector, min, message){    // selector === #fullname
    return {
        selector: selector,
        text: function(value){     // Kiểm tra người dùng nhập hay chưa
            
            // Nguyên tắc của các rule
            // 1. Khi có lỗi thì trả error message
            // 2. Khi không có lỗi thì trả về rỗng ''

            return value.length >= min ? '' : message || `Vui lòng nhập tối thiểu ${min} ký tự `
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message){
    return {
        selector: selector,
        text: function(value){
            return value === getConfirmValue() ? '' : message || 'Giá trị nhập vào không chính xác'
        }
    }
}