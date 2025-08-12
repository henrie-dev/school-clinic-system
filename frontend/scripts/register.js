//main ensures that script will run after all the html has been loaded
document.addEventListener('DOMContentLoaded', () => {
    const steps = [     //array registration form
        document.getElementById('step-1'),
        document.getElementById('step-2'),
        document.getElementById('step-3'),
        document.getElementById('step-4'),
        document.getElementById('confirmation-message')
    ];
    const pageTitle = document.getElementById('page-title');
    const backButtonText = document.getElementById('back-button-text');

    let currentStep = 0;    //tracks user current step
    let accountType = '';   //account type
    let formData = {};    //handles all the data submitted

    const showStep = (stepIndex) => {
        steps.forEach((step, index) => {
            step.classList.toggle('hidden-step', index !== stepIndex);
        });
        currentStep = stepIndex;

        if (currentStep > 0) {
            backButtonText.textContent = 'BACK';
        } else {
            backButtonText.textContent = 'CANCEL';
        }

        if (currentStep === 0) {
            pageTitle.textContent = 'REGISTER - SELECT TYPE';
        } else if (currentStep === 1) {
            pageTitle.textContent = 'REGISTER - PAGE 1';
        } else if (currentStep === 2) {
            pageTitle.textContent = 'REGISTER - PAGE 2';
        } else if (currentStep === 3) {
            pageTitle.textContent = 'REGISTER - PAGE 3';
        }
    };

    const updateSelectedCard = (cardId) => {
        document.querySelectorAll('.account-card').forEach(card => card.classList.remove('selected'));
        document.getElementById(cardId).classList.add('selected');
    };

    const handleAccountTypeSelection = (type, cardId) => {
        accountType = type;
        updateSelectedCard(cardId);
        setTimeout(() => showStep(1), 300);
    };

    const backToPreviousStep = () => {
        if (currentStep > 0) {
            showStep(currentStep - 1);
        } else {
            window.location.href = 'login.html';
        }
    };

    //account type is clicked, shows the appropriate registration form
    document.getElementById('student-card').addEventListener('click', () => handleAccountTypeSelection('student', 'student-card'));
    document.getElementById('personnel-card').addEventListener('click', () => handleAccountTypeSelection('personnel', 'personnel-card'));
    document.getElementById('clinic-card').addEventListener('click', () => handleAccountTypeSelection('clinic', 'clinic-card'));

    document.getElementById('back-button-text').parentElement.addEventListener('click', backToPreviousStep);

    //input
    document.getElementById('step2-next-btn').addEventListener('click', () => {
        const id = document.getElementById('id-number').value.trim();
        const reId = document.getElementById('re-id-number').value.trim();
        const email = document.getElementById('email').value.trim();
        const reEmail = document.getElementById('re-email').value.trim();
        const password = document.getElementById('password').value;
        const rePassword = document.getElementById('re-password').value;
        
        //checking
        if (!id || !reId || !email || !reEmail || !password || !rePassword) {
            showCustomAlert('PLEASE FILL OUT ALL FIELDS.');
            return;
        }

        //checking if it matches both fields
        if (id === reId && email.toLowerCase() === reEmail.toLowerCase() && password === rePassword) {
            formData = {
                accountType,
                'id-number': id.toUpperCase(),
                email: email.toLowerCase(),
                password
            };

            const studentFields = document.getElementById('student-fields');
            const personnelFields = document.getElementById('personnel-fields');

            if (accountType === 'student') {
                studentFields.classList.remove('hidden');
                personnelFields.classList.add('hidden');
            } else if (accountType === 'personnel') {
                personnelFields.classList.remove('hidden');
                studentFields.classList.add('hidden');
            }
            showStep(2);
        } else {
            showCustomAlert('PLEASE ENSURE ALL FIELDS MATCH!');
        }
    });

    //input
    document.getElementById('step3-back-btn').addEventListener('click', () => showStep(1));
    document.getElementById('step3-next-btn').addEventListener('click', () => {
        const requiredFields = [
            document.getElementById('last-name'),
            document.getElementById('first-name'),
            document.getElementById('city-address'),
            document.getElementById('tel-no'),
            document.getElementById('phone-no'),
            document.getElementById('date-of-birth'),
            document.getElementById('sex'),
            document.getElementById('religion'),
            document.getElementById('nationality'),
            document.getElementById('father-name'),
            document.getElementById('father-occupation'),
            document.getElementById('mother-name'),
            document.getElementById('mother-occupation')
        ];

        //checking
        let allFieldsFilled = true;
        for (const field of requiredFields) {
            if (field.id === 'middle-name') continue;
            if (!field.value.trim()) {
                allFieldsFilled = false;
                break;
            }
        }

        if (accountType === 'student') {
            const studentRequiredFields = [
                document.getElementById('department'),
                document.getElementById('level'),
                document.getElementById('section-program')
            ];
            for (const field of studentRequiredFields) {
                if (!field.value) {
                    allFieldsFilled = false;
                    break;
                }
            }
        } else if (accountType === 'personnel') {
            const personnelRequiredFields = [
                document.getElementById('personnel-type'),
                document.getElementById('personnel-dept-office')
            ];
            //if teaching is true, department will be shwon
            if (document.getElementById('personnel-type').value === 'teaching') {
                personnelRequiredFields.push(document.getElementById('personnel-department'));
            }
            for (const field of personnelRequiredFields) {
                if (!field.value) {
                    allFieldsFilled = false;
                    break;
                }
            }
        }

        const othersCheckbox = document.getElementById('living-others');
        const othersInput = document.getElementById('others-input');
        if (othersCheckbox.checked && !othersInput.value.trim()) {
            allFieldsFilled = false;
        }

        //checking
        if (!allFieldsFilled) {
            showCustomAlert('PLEASE FILL OUT ALL PERSONAL DATA FIELDS.');
            return;
        }

        const form = document.getElementById('fill-up-info-form');
        const formElements = form.querySelectorAll('input, select');
        formElements.forEach(element => {
            if (element.type === 'checkbox') {
                if (element.checked) {
                    formData[element.name] = formData[element.name] ? [...formData[element.name], element.value.toUpperCase()] : [element.value.toUpperCase()];
                }
            } else {
                if (element.type === 'text' || element.tagName.toLowerCase() === 'select') {
                    formData[element.name] = element.value.toUpperCase();
                } else {
                    formData[element.name] = element.value;
                }
            }
        });

        const reviewContainer = document.getElementById('review-info');
        reviewContainer.innerHTML = '';

        const addReviewItem = (label, value) => {
            const item = document.createElement('div');
            item.className = 'flex items-baseline mb-2';
            item.innerHTML = `
                <span class="font-bold w-1/2">${label}:</span>
                <span class="w-1/2">${value}</span>
            `;
            reviewContainer.appendChild(item);
        };

        //reviewing
        addReviewItem('ID NUMBER', formData['id-number']);
        addReviewItem('FIRST NAME', formData['first-name']);
        addReviewItem('MIDDLE NAME', formData['middle-name'] || 'N/A');
        addReviewItem('LAST NAME', formData['last-name']);
        addReviewItem('DATE OF BIRTH', formData['date-of-birth']);
        addReviewItem('SEX', formData['sex'] || 'N/A');
        addReviewItem('RELIGION', formData['religion'] || 'N/A');
        addReviewItem('NATIONALITY', formData['nationality'] || 'N/A');
        addReviewItem('LIVING WITH', (formData['living-with'] || []).join(', ') || 'N/A');
        if (formData['others-input']) {
            addReviewItem('OTHERS', formData['others-input']);
        }

        if (accountType === 'student') {
            addReviewItem('DEPARTMENT', formData['department'] || 'N/A');
            addReviewItem('LEVEL', formData['level'] || 'N/A');
            addReviewItem('SECTION/PROGRAM', formData['section-program'] || 'N/A');
        } else if (accountType === 'personnel') {
            addReviewItem('PERSONNEL TYPE', formData['personnel-type'] || 'N/A');
            if (formData['personnel-type'] === 'teaching') {
                addReviewItem('DEPARTMENT', formData['personnel-department'] || 'N/A');
            }
            addReviewItem('PERSONNEL DEPT. OR OFFICE', formData['personnel-dept-office'] || 'N/A');
        }

        showStep(3);
    });

    document.getElementById('step4-back-btn').addEventListener('click', () => showStep(2));

    //api calling
    document.getElementById('step4-create-btn').addEventListener('click', async () => {
        console.log('Final Registration Data:', formData);      //form data is all the input data goes

        //fetch post and convert to json
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            //error
            if (!response.ok) {
                const errorData = await response.json();
                showCustomAlert('Registration failed: ' + (errorData.message || 'Unknown error'));
                return;
            }

            //success
            const result = await response.json();
            showCustomAlert(result.message || 'Registration successful!');
            showStep(4); // show confirmation step
        } catch (error) {
            showCustomAlert('Registration error: ' + error.message);
        }
    });

    document.getElementById('living-others').addEventListener('change', (e) => {
        document.getElementById('others-input').disabled = !e.target.checked;
    });

    function showCustomAlert(message) {
        const customAlert = document.createElement('div');
        customAlert.className = "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center";
        customAlert.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm mx-auto">
                <p class="text-lg font-semibold mb-4">${message}</p>
                <button id="close-alert" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">OK</button>
            </div>
        `;
        document.body.appendChild(customAlert);
        document.getElementById('close-alert').addEventListener('click', () => {
            document.body.removeChild(customAlert);
        });
    }

    //dropdowns
    const departmentSelect = document.getElementById('department');
    const levelSelect = document.getElementById('level');
    const sectionSelect = document.getElementById('section-program');

    const personnelTypeSelect = document.getElementById('personnel-type');
    const personnelDepartmentContainer = document.getElementById('personnel-department-container');
    const personnelDepartmentSelect = document.getElementById('personnel-department');
    
    const sedPrograms = ['BSIT', 'BSCS', 'BSN', 'BSA', 'BScpE'];

    const departments = {
        'Grade School': {
            levels: ['1', '2', '3', '4', '5', '6'],
            sections: {
                '1': ['Joy', 'Peace', 'Piety'],
                '2': ['Kindness', 'Obedience', 'Humility'],
                '3': ['Gratitude', 'Honesty', 'Wisdom'],
                '4': ['Prudence', 'Fortitude', 'Justice'],
                '5': ['Patience', 'Providence', 'Modesty'],
                '6': ['Courage', 'Determination', 'Perseverance']
            }
        },
        'Junior High School': {
            levels: ['7', '8', '9', '10'],
            sections: {
                '7': ['Research Motivated', 'Proud Global Pinoy', 'Compassionate Christian', 'Service Oriented', 'Marian Devotee', 'Truth Seeker'],
                '8': ['Family Oriented', 'Music Enthusiast', 'Pro-life Advocate', 'Stewards of God\'s Creation', 'Technology Competent'],
                '9': ['Body Smart', 'Creative Learner', 'Number Smart', 'Gospel Preacher', 'People Smart', 'Self-Smart'],
                '10': ['Good Samaritan', 'Eucharist Centered', 'Critical Thinker', 'Life Long Learner', 'Integrity', 'Mission Oriented']
            }
        },
        'Senior High School': {
            levels: ['11', '12'],
            sections: {
                '11': ['St. Margaret', 'St. Albert', 'St. Martin', 'St. Rose', 'St. Lorenzo', 'St. Francis', 'St. Catherine of Siena', 'St. Thomas', 'St. Margaret (Second Session)', 'St. Dominic de Guzman', 'St. John Macias', 'St. Pius V', 'St. Louis the Montfort'],
                '12': ['HUMSS 1', 'STEM 1', 'STEM 3', 'STEM 4', 'CULINARY', 'TRAVEL SERVICES', 'HUMMS 2', 'STEM 2', 'STEM 5', 'ABM 1']
            }
        },
        'SED': {
            levels: ['13', '14', '15', '16', '17'],
            sections: {
                '13': sedPrograms,
                '14': sedPrograms,
                '15': sedPrograms,
                '16': sedPrograms,
                '17': sedPrograms
            }
        }
    };
    
    const populateDropdown = (dropdown, options) => {
        dropdown.innerHTML = '<option value="">Select...</option>';
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.toUpperCase();
            opt.textContent = option.toUpperCase();
            dropdown.appendChild(opt);
        });
    };

    departmentSelect.addEventListener('change', () => {
        const selectedDepartment = departmentSelect.value;
        if (selectedDepartment && departments[selectedDepartment]) {
            populateDropdown(levelSelect, departments[selectedDepartment].levels);
            sectionSelect.disabled = false;
            populateDropdown(sectionSelect, []);
        } else {
            populateDropdown(levelSelect, []);
            populateDropdown(sectionSelect, []);
            sectionSelect.disabled = true;
        }
    });

    levelSelect.addEventListener('change', () => {
        const selectedDepartment = departmentSelect.value;
        const selectedLevel = levelSelect.value;
        if (selectedDepartment && selectedLevel && departments[selectedDepartment].sections[selectedLevel]) {
            sectionSelect.disabled = false;
            populateDropdown(sectionSelect, departments[selectedDepartment].sections[selectedLevel]);
        } else {
            populateDropdown(sectionSelect, []);
            sectionSelect.disabled = true;
        }
    });

    personnelTypeSelect.addEventListener('change', () => {
        const selectedType = personnelTypeSelect.value;
        if (selectedType === 'teaching') {
            personnelDepartmentContainer.classList.remove('hidden');
        } else {
            personnelDepartmentContainer.classList.add('hidden');
            personnelDepartmentSelect.value = '';
        }
    });

    //uppercasing
    const allTextInputs = document.querySelectorAll('input[type="text"], input[type="tel"]');
    allTextInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    });

});
