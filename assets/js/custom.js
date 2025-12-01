document.addEventListener('DOMContentLoaded', () => {
    console.log('custom.js loaded ✅');

    // Rating sliders -> live value labels
    setupRatingSlider('ratingProject', 'ratingProjectValue');
    setupRatingSlider('ratingTimeline', 'ratingTimelineValue');
    setupRatingSlider('ratingBudget', 'ratingBudgetValue');

    // Real-time validation for contact form fields
    setupRealTimeValidation();

    // Phone number masking for Lithuanian format
    setupPhoneMask();

    // Contact form submission handling
    setupContactFormHandler();
});

/* =========================================================
   SLIDER LABELS
   ========================================================= */
function setupRatingSlider(sliderId, outputId) {
    const slider = document.getElementById(sliderId);
    const output = document.getElementById(outputId);

    if (!slider || !output) return;

    output.textContent = slider.value;

    slider.addEventListener('input', () => {
        output.textContent = slider.value;
    });
}

/* =========================================================
   REAL-TIME VALIDATION HELPERS
   ========================================================= */

function showFieldError(input, message) {
    if (!input) return;

    let errorEl = input.parentElement.querySelector('.field-error');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'field-error';
        input.parentElement.appendChild(errorEl);
    }

    if (message) {
        errorEl.textContent = message;
        input.classList.add('field-invalid');
        input.classList.remove('field-valid');
    } else {
        errorEl.textContent = '';
        input.classList.remove('field-invalid');
        input.classList.add('field-valid');
    }
}

function validateNameField(value) {
    const trimmed = value.trim();
    if (!trimmed) return 'This field is required.';
    if (!/^[A-Za-zÀ-ž\s'-]+$/.test(trimmed)) {
        return 'Use letters only (spaces, - and \' allowed).';
    }
    return '';
}

function validateEmailField(value) {
    const trimmed = value.trim();
    if (!trimmed) return 'Email is required.';
    const emailPattern = /^\S+@\S+\.\S+$/;
    if (!emailPattern.test(trimmed)) {
        return 'Enter a valid email address.';
    }
    return '';
}

function validateAddressField(value) {
    const trimmed = value.trim();
    if (!trimmed) return 'Address is required.';
    if (trimmed.length < 5) return 'Address is too short.';
    if (!/[A-Za-z]/.test(trimmed)) return 'Address must contain letters.';
    return '';
}

/**
 * Phone validation for Lithuanian format +370 6xx xxxxx
 */
function validatePhoneField(value) {
    const digits = value.replace(/\D/g, ''); // only digits

    if (!digits) return 'Phone number is required.';

    // Expect 11 digits total: 370 + 8-digit mobile starting with 6
    if (digits.length !== 11 || !digits.startsWith('3706')) {
        return 'Phone must be in Lithuanian format (+370 6xx xxxxx).';
    }

    return '';
}

/**
 * Check if entire form is valid right now (live validation)
 */
function isFormCompletelyValid() {
    const first = validateNameField(document.getElementById('firstName').value);
    const last = validateNameField(document.getElementById('lastName').value);
    const email = validateEmailField(document.getElementById('emailAddress').value);
    const address = validateAddressField(document.getElementById('addressField').value);
    const phone = validatePhoneField(document.getElementById('phoneNumber').value);

    return (!first && !last && !email && !address && !phone);
}

/**
 * Enables or disables the submit button based on form validity
 */
function updateSubmitState() {
    const btn = document.getElementById('submitButton');
    if (!btn) return;

    if (isFormCompletelyValid()) {
        btn.classList.remove('submit-disabled');
        btn.disabled = false;
    } else {
        btn.classList.add('submit-disabled');
        btn.disabled = true;
    }
}

/**
 * Attach real-time validation to Name, Surname, Email, Address
 * Phone is handled separately via masking + submit validation.
 */
function setupRealTimeValidation() {
    const fields = [
        { id: 'firstName', validator: validateNameField },
        { id: 'lastName', validator: validateNameField },
        { id: 'emailAddress', validator: validateEmailField },
        { id: 'addressField', validator: validateAddressField },
    ];

    fields.forEach(({ id, validator }) => {
        const input = document.getElementById(id);
        if (!input) return;

        const handler = () => {
            const error = validator(input.value);
            showFieldError(input, error);
        };

        // Validate as user types and when they leave the field
        input.addEventListener('input', () => {
            handler();
            updateSubmitState();
        });

            input.addEventListener('blur', () => {
            handler();
            updateSubmitState();
        });
    });
}

/**
 * Validate all fields at submit time, reusing same rules.
 */
function validateAllFieldsOnSubmit(form) {
    let allValid = true;

    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('emailAddress');
    const addressInput = document.getElementById('addressField');
    const phoneInput = document.getElementById('phoneNumber');

    const firstErr = validateNameField(firstNameInput.value);
    const lastErr = validateNameField(lastNameInput.value);
    const emailErr = validateEmailField(emailInput.value);
    const addrErr = validateAddressField(addressInput.value);
    const phoneErr = validatePhoneField(phoneInput.value);

    showFieldError(firstNameInput, firstErr);
    showFieldError(lastNameInput, lastErr);
    showFieldError(emailInput, emailErr);
    showFieldError(addressInput, addrErr);
    showFieldError(phoneInput, phoneErr);

    if (firstErr || lastErr || emailErr || addrErr || phoneErr) {
        allValid = false;
    }

    return allValid;
}

/* =========================================================
   PHONE MASKING – +370 6xx xxxxx
   ========================================================= */

function setupPhoneMask() {
  const phoneInput = document.getElementById('phoneNumber');
  if (!phoneInput) return;

  phoneInput.addEventListener('input', () => {
    let digits = phoneInput.value.replace(/\D/g, ''); // keep digits only

    if (!digits) {
      phoneInput.value = '';
      return;
    }

    // Normalize to Lithuanian pattern:
    // allow typing 6..., 86..., 3706..., etc.
    if (digits.startsWith('86')) {
      // 86xxxxxxx -> 3706xxxxxxx
      digits = '370' + digits.slice(1); // drop 8, keep 6xxxxxxx
    } else if (digits.startsWith('6')) {
      // 6xxxxxxx -> 3706xxxxxxx
      digits = '370' + digits;
    } else if (!digits.startsWith('370')) {
      // If user types something odd, just force starting with 370
      digits = '370' + digits;
    }

    // Limit to max 11 digits (370 + 8 digits)
    digits = digits.slice(0, 11);

    // If still typing country code
    if (digits.length <= 3) {
      phoneInput.value = '+' + digits;
      return;
    }

    // Split into +370 6xx xxxxx (after the first 3 digits)
    const rest = digits.slice(3);          // after "370"
    const part1 = rest.slice(0, 3);        // 6xx
    const part2 = rest.slice(3);           // xxxxx

    let formatted = '+370';
    if (part1) formatted += ' ' + part1;
    if (part2) formatted += ' ' + part2;

    phoneInput.value = formatted;
    updateSubmitState();
  });
}

/* =========================================================
   CONTACT FORM SUBMISSION + AVERAGE + POPUP
   ========================================================= */

function setupContactFormHandler() {
    const form = document.querySelector('.php-email-form');
    if (!form) {
        console.warn('php-email-form not found');
        return;
    }

    const output = document.getElementById('form-output');
    const popup = document.getElementById('success-popup');

    form.addEventListener(
        'submit',
        (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            const valid = validateAllFieldsOnSubmit(form);
            if (!valid) {
                alert('Please correct the highlighted fields before submitting.');
                return;
            }

            const ratingProject = Number(form.rating_project.value);
            const ratingTimeline = Number(form.rating_timeline.value);
            const ratingBudget = Number(form.rating_budget.value);

            const formData = {
                firstName: form.first_name.value.trim(),
                lastName: form.last_name.value.trim(),
                email: form.email.value.trim(),
                phone: form.phone.value.trim(),
                address: form.address.value.trim(),
                ratingProject,
                ratingTimeline,
                ratingBudget,
            };

            const sum = ratingProject + ratingTimeline + ratingBudget;
            const averageRaw = sum / 3;
            const average = Math.round(averageRaw * 10) / 10;

            let avgClass = 'avg-low';
            if (average > 4 && average <= 7) avgClass = 'avg-mid';
            else if (average > 7) avgClass = 'avg-high';

            console.log('Contact form data:', formData);
            console.log('Average rating:', average);

            if (output) {
                output.innerHTML = `
                <div><strong>Name:</strong> ${formData.firstName}</div>
                <div><strong>Surname:</strong> ${formData.lastName}</div>
                <div><strong>Email:</strong> ${formData.email}</div>
                <div><strong>Phone number:</strong> ${formData.phone}</div>
                <div><strong>Address:</strong> ${formData.address}</div>
                <div><strong>Project clarity (1-10):</strong> ${formData.ratingProject}</div>
                <div><strong>Timeline urgency (1-10):</strong> ${formData.ratingTimeline}</div>
                <div><strong>Budget readiness (1-10):</strong> ${formData.ratingBudget}</div>
                <div class="average-line ${avgClass}">
                    <strong>${formData.firstName} ${formData.lastName}:</strong> ${average}
                </div>
                `;
            }

            if (popup) {
                popup.classList.add('show');
                setTimeout(() => {
                    popup.classList.remove('show');
                }, 3000);
            }
        },
        true
    );
}

