function Validator(options) {
  var selectorRules = {};

  function Validate(inputElement, rule) {
    var errorElement = inputElement
      .closest(options.formGroupSelector)
      .querySelector(options.errorSelector);
    var errorMessage = undefined;

    var rules = selectorRules[rule.selector];
    for (let i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "radio":
        case "checkbox":
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) {
        break;
      }
    }

    if (errorMessage) {
      inputElement.closest(options.formGroupSelector).classList.add("invalid");
      errorElement.innerText = errorMessage;
    } else {
      inputElement
        .closest(options.formGroupSelector)
        .classList.remove("invalid");
      errorElement.innerText = "";
    }
    return !errorMessage;
  }

  var formElement = document.querySelector(options.form);
  if (formElement) {
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        if (inputElement) {
          let isValid = Validate(inputElement, rule);
          if (!isValid) {
            isFormValid = false;
          }
        }
      });

      if (isFormValid) {
        if (typeof options.onsubmit === "function") {
          let enablesInput = formElement.querySelectorAll(
            "[name]:not([disabled])"
          );

          var formValues = Array.from(enablesInput).reduce((values, input) => {
            switch (input.type) {
              case "checkbox":
                 if(!input.checked) {
                  if(values[input.name] === undefined) {
                    values[input.name] = ''
                  }
                  return values;
                 }

                 if(!Array.isArray(values[input.name])) {
                  values[input.name] = []
                 }
                 values[input.name].push(input.value)
                break
              case "radio":
                  values[input.name] = formElement.querySelector(`input[name="${input.name}"]:checked`)?.value
                break
              case 'file':
                values[input.name] = input.files
                break
              default:
                values[input.name] = input.value;
            }
            return values;
          }, {});

          options.onsubmit(formValues);
        } else {
          formElement.submit();
        }
      }
    };

    options.rules.forEach(function (rule) {
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.Test);
      } else {
        selectorRules[rule.selector] = [rule.Test];
      }

      var inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach(function (inputElement) {
        if (inputElement) {
          inputElement.onblur = function () {
            Validate(inputElement, rule);
          };
  
          inputElement.oninput = function () {
            var errorElement = inputElement
              .closest(options.formGroupSelector)
              .querySelector(options.errorSelector);
            inputElement
              .closest(options.formGroupSelector)
              .classList.remove("invalid");
            errorElement.innerText = "";
          };
        }
      });
    });
  }
}

Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    Test(value) {
      if(typeof value === "string") {
        value = value.trim();
      }
      return value
        ? undefined
        : message || "Vui lòng nhập thông tin";
    },
  };
};

Validator.isEmail = function (selector) {
  return {
    selector: selector,
    Test(value) {
      let regrex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regrex.test(value) ? undefined : "Email không hợp lệ";
    },
  };
};

Validator.minLength = function (selector, min) {
  return {
    selector: selector,
    Test(value) {
      return value.length >= min
        ? undefined
        : `Độ dài phải ít nhất ${min} kí tự`;
    },
  };
};

Validator.isConfirm = function (selector, getPassword, message) {
  return {
    selector: selector,
    Test(value) {
      return value === getPassword()
        ? undefined
        : message || "Giá trị nhập vào không chính xác";
    },
  };
};
