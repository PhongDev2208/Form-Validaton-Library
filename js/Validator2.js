function Validator2(formSelector) {
  var formRules = {};
  var _this = this;

  var rulesValidator = {
    required: function (value) {
      if (typeof value === String) {
        value = value.trim();
      }
      return value ? undefined : "Vui lòng nhập trường này";
    },
    email: function (value) {
      let regrex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regrex.test(value) ? undefined : "Email không hợp lệ";
    },
    min: function (min) {
      return function (value) {
        return value.length >= min
          ? undefined
          : `Phải nhập ít nhất ${min} kí tự`;
      };
    },
    max: function (max) {
      return function (value) {
        return value.length <= max
          ? undefined
          : `Chỉ được nhập tối đa ${max} kí tự`;
      };
    },
  };

  const formElement = document.querySelector(formSelector);
  if (formElement) {
    var inputs = formElement.querySelectorAll("[name][rules]");
    for (var input of inputs) {
      let rules = input.getAttribute("rules").split("|");
      rules.forEach(function (rule) {
        var ruleHasValue = rule.includes(":");

        if (ruleHasValue) {
          var ruleInfo;
          ruleInfo = rule.split(":");
          rule = ruleInfo[0];
        }

        var ruleFunc = rulesValidator[rule];

        if (ruleHasValue) {
          ruleFunc = rulesValidator[rule](ruleInfo[1]);
        }

        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunc);
        } else {
          formRules[input.name] = [ruleFunc];
        }
      });

      //Handle events
      var inputsValidate = formElement.querySelectorAll(`[name="${input.name}"]`);
      for (let input of inputsValidate) {
        input.onblur = handleValidate;
        input.oninput = handleClearError;
      }
    }

    function handleValidate(event) {
      var errorMessage;
      var nameInput = event.target.name;

      formRules[nameInput].some(function (rule) {
        switch (event.target.type) {
          case "radio":
          case "checkbox":
            errorMessage = rule(
              formElement.querySelector(`[name="${nameInput}"]:checked`)
            )
            break;
          default:
            errorMessage = rule(event.target.value);
        }
        return errorMessage;
      });

      if (errorMessage) {
        var formGroup = event.target.closest(".form-group");
        if (formGroup) {
          var errorElement = formGroup.querySelector(".form-message");
          formGroup.classList.add("invalid");
          errorElement.innerText = errorMessage;
        }
      }

      return !errorMessage;
    }

    function handleClearError(event) {
      var formGroup = event.target.closest(".form-group");
      formGroup.classList.remove("invalid");
      var errorElement = formGroup.querySelector(".form-message");
      errorElement.innerText = "";
    }

    formElement.onsubmit = function (event) {
      event.preventDefault();

      var isFormValid = true;

      for (var input of inputs) {
        if (
          !handleValidate({
            target: input,
          })
        ) {
          isFormValid = false;
        }
      }

      if (isFormValid) {
        if (typeof _this.onsubmit === "function") {
          let enablesInput = formElement.querySelectorAll(
            "[name]:not([disabled])"
          );

          var formValues = Array.from(enablesInput).reduce(function (
            values,
            input
          ) {
            switch (input.type) {
              case "checkbox":
                if (!input.checked) {
                  if (values[input.name] === undefined) {
                    values[input.name] = "";
                  }
                  return values;
                }

                if (Array.isArray(values[input.name])) {
                  values[input.name].push(input.value);
                } else {
                  values[input.name] = [input.value];
                }
                break;
              case "radio":
                values[input.name] = formElement.querySelector(
                  `[name="${input.name}"]:checked`
                )?.value;
                break;
              case "file":
                values[input.name] = input.files;
                break;
              default:
                values[input.name] = input.value;
            }
            return values;
          },
          {});

          _this.onsubmit(formValues);
        } else {
          formElement.submit();
        }
      }
    };
  }
}
