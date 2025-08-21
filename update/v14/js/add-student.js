// Cookie function remains the same
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Helper function to get headers
function getHeaders() {
    const token = getCookie('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    };
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-student-form');

    // Load initial independent dropdowns
    loadParentsIntoSelect('parent-id');
    loadClassesIntoSelect('class-id');
    loadSessionsIntoSelect('session-id');

    // Handle dependent dropdowns
    const sessionSelect = document.getElementById('session-id');

    const handleSessionChange = function() {
        const sessionId = this.value;
        if (sessionId) {
            loadSessionTermsIntoSelect(sessionId, 'term-id');
        } else {
            clearSelect('term-id', 'Please Select Term *');
        }
    };

    if (sessionSelect) {
        // Standard change event
        sessionSelect.addEventListener('change', handleSessionChange);

        // Ensure Select2 plugin triggers also load terms
        if (typeof $ !== 'undefined' && $.fn && $.fn.select2) {
            $(sessionSelect).on('select2:select', function () {
                handleSessionChange.call(this);
            });
        }
    }

    const classSelect = document.getElementById('class-id');
    const classArmSelect = document.getElementById('class-arm-id');
    const classSectionSelect = document.getElementById('class-section-id');

    const handleClassChange = function() {
        const classId = this.value;

        if (classId) {
            // Clear dependent dropdowns first
            clearSelect('class-arm-id', 'Please Select Class Arm *');
            clearSelect('class-section-id', 'Please Select Section');

            // Then load class arms
            loadClassArmsIntoSelect(classId, 'class-arm-id');
        } else {
            clearSelect('class-arm-id', 'Please Select Class Arm *');
            clearSelect('class-section-id', 'Please Select Section');
        }
    };

    if (classSelect) {
        classSelect.addEventListener('change', handleClassChange);

        if (typeof $ !== 'undefined' && $.fn && $.fn.select2) {
            $(classSelect).on('select2:select', function () {
                handleClassChange.call(this);
            });
        }
    }

    const handleClassArmChange = function() {
        const classId = document.getElementById('class-id').value;
        const armId = this.value;

        if (armId && classId) {
            clearSelect('class-section-id', 'Please Select Section');
            loadClassArmSectionsIntoSelect(classId, armId, 'class-section-id');
        } else {
            clearSelect('class-section-id', 'Please Select Section');
        }
    };

    if (classArmSelect) {
        classArmSelect.addEventListener('change', handleClassArmChange);

        if (typeof $ !== 'undefined' && $.fn && $.fn.select2) {
            $(classArmSelect).on('select2:select', function () {
                handleClassArmChange.call(this);
            });
        }
    }

    const handleClassSectionChange = function() {
        const sectionId = this.value;
    };

    if (classSectionSelect) {
        classSectionSelect.addEventListener('change', handleClassSectionChange);

        if (typeof $ !== 'undefined' && $.fn && $.fn.select2) {
            $(classSectionSelect).on('select2:select', function () {
                handleClassSectionChange.call(this);
            });
        }
    }

    // Form submission handler (keeping original)
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            const formData = new FormData();
            formData.append('first_name', document.getElementById('first-name').value);
            formData.append('middle_name', document.getElementById('middle-name').value);
            formData.append('last_name', document.getElementById('last-name').value);
            formData.append('gender', document.getElementById('gender').value);
            formData.append('date_of_birth', document.getElementById('dob').value);
            formData.append('nationality', document.getElementById('nationality').value);
            formData.append('state_of_origin', document.getElementById('state-of-origin').value);
            formData.append('lga_of_origin', document.getElementById('lga-of-origin').value);
            formData.append('admission_date', document.getElementById('admission-date').value);
            formData.append('house', document.getElementById('house').value);
            formData.append('club', document.getElementById('club').value);
            formData.append('current_session_id', document.getElementById('session-id').value);
            formData.append('current_term_id', document.getElementById('term-id').value);
            formData.append('class_id', document.getElementById('class-id').value);
            formData.append('class_arm_id', document.getElementById('class-arm-id').value);
            formData.append('class_section_id', document.getElementById('class-section-id').value);
            formData.append('parent_id', document.getElementById('parent-id').value);
            formData.append('status', document.getElementById('status').value);
            formData.append('address', document.getElementById('address').value);
            formData.append('medical_information', document.getElementById('medical-info').value);

            const photoInput = document.getElementById('photo');
            if (photoInput.files[0]) {
                formData.append('photo', photoInput.files[0]);
            }

            fetch(`${backend_url}/api/v1/students`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getCookie('token')}`, 'Accept': 'application/json' },
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        if (response.status === 422 && err.errors) {
                            const errorMessages = Object.values(err.errors).flat().join('\n');
                            throw new Error(errorMessages);
                        }
                        throw new Error(err.message || 'Failed to register student');
                    });
                }
                return response.json();
            })
            .then(data => {
                alert('Student registered successfully!');
                form.reset();
                // Reset all dropdowns to initial state
                loadParentsIntoSelect('parent-id');
                loadClassesIntoSelect('class-id');
                loadSessionsIntoSelect('session-id');
                clearSelect('term-id', 'Please Select Term *');
                clearSelect('class-arm-id', 'Please Select Class Arm *');
                clearSelect('class-section-id', 'Please Select Section');
            })
            .catch(error => {
                alert(`Error: ${error.message}`);
            });
        });
    }
});

// Helper function to clear and reset select elements
function clearSelect(selectId, defaultText) {
    const select = document.getElementById(selectId);
    if (select) {
        select.innerHTML = `<option value="">${defaultText}</option>`;
    }
}

// Load parents into select
async function loadParentsIntoSelect(selectId) {
    try {
        const url = `${backend_url}/api/v1/all-parents`;
        
        const response = await fetch(url, {
            headers: getHeaders()
        });
        
        
        if (response.ok) {
            const parents = await response.json();

            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Please Select Parent *</option>';
                parents.forEach(parent => {
                    const option = new Option(`${parent.first_name} ${parent.last_name}`, parent.id);
                    select.add(option);
                });
            }
        }
    } catch (error) {
    }
}

// Load classes into select
async function loadClassesIntoSelect(selectId) {
    try {
        const url = `${backend_url}/api/v1/classes`;
        
        const response = await fetch(url, {
            headers: getHeaders()
        });
        
        
        if (response.ok) {
            const classes = await response.json();

            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Please Select Class *</option>';
                classes.forEach(_class => {
                    const option = new Option(_class.name, _class.id);
                    select.add(option);
                });
            }
        }
    } catch (error) {
    }
}

// Load sessions into select
async function loadSessionsIntoSelect(selectId) {
    try {
        const url = `${backend_url}/api/v1/sessions`;
        
        const response = await fetch(url, {
            headers: getHeaders()
        });
        
        
        if (response.ok) {
            const sessions = await response.json();

            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Please Select Session *</option>';
                sessions.forEach(session => {
                    const option = new Option(session.name, session.id);
                    select.add(option);
                });
            }
        }
    } catch (error) {
    }
}

// Load session terms into select
async function loadSessionTermsIntoSelect(sessionId, selectId) {

    const select = document.getElementById(selectId);
    if (select) {
        select.innerHTML = '<option value="">Loading terms...</option>';
    }

    try {
        const url = `${backend_url}/api/v1/sessions/${sessionId}/terms`;

        const response = await fetch(url, {
            headers: getHeaders()
        });


        if (!select) return;

        if (response.ok) {
            const data = await response.json();

            let terms = [];
            if (Array.isArray(data)) {
                terms = data;
            } else if (Array.isArray(data.data)) {
                terms = data.data;
            } else if (Array.isArray(data.terms)) {
                terms = data.terms;
            } else if (Array.isArray(data.data?.terms)) {
                terms = data.data.terms;
            }
            select.innerHTML = '<option value="">Please Select Term *</option>';
            if (terms.length > 0) {
                terms.forEach((term, idx) => {
                    const option = new Option(term.name, term.id);
                    select.add(option);
                });
            } else {
                const option = new Option('No terms available', '');
                select.add(option);
            }
        } else {
            select.innerHTML = '<option value="">No terms available</option>';
        }
    } catch (error) {
        if (select) {
            select.innerHTML = '<option value="">Failed to load terms</option>';
        }
    }
}

// Load class arms into select
async function loadClassArmsIntoSelect(classId, selectId) {
    
    // Show loading state
    const select = document.getElementById(selectId);
    if (select) {
        select.innerHTML = '<option value="">Loading arms...</option>';
    }
    
    try {
        const url = `${backend_url}/api/v1/classes/${classId}/arms`;
        
        const headers = getHeaders();
        
        const response = await fetch(url, { headers });
        
        
        if (response.ok) {
            const data = await response.json();

            let arms = [];
            if (Array.isArray(data)) {
                arms = data;
            } else if (Array.isArray(data.data)) {
                arms = data.data;
            } else if (Array.isArray(data.arms)) {
                arms = data.arms;
            } else if (Array.isArray(data.data?.arms)) {
                arms = data.data.arms;
            }

            if (select) {
                select.innerHTML = '<option value="">Please Select Class Arm *</option>';

                if (arms.length > 0) {
                    arms.forEach((arm, index) => {
                        const option = new Option(arm.name, arm.id);
                        select.add(option);
                    });
                } else {
                    const noDataOption = new Option('No arms available', '');
                    select.add(noDataOption);
                }
            }
        } else {
            
            if (select) {
                select.innerHTML = '<option value="">Failed to load arms</option>';
            }
        }
    } catch (error) {
        
        if (select) {
            select.innerHTML = '<option value="">Error loading arms</option>';
        }
    }
}

// Load class arm sections into select
async function loadClassArmSectionsIntoSelect(classId, armId, selectId) {
    
    // Show loading state
    const select = document.getElementById(selectId);
    if (select) {
        select.innerHTML = '<option value="">Loading sections...</option>';
    }
    
    try {
        const url = `${backend_url}/api/v1/classes/${classId}/arms/${armId}/sections`;
        
        const response = await fetch(url, {
            headers: getHeaders()
        });
        
        
        if (response.ok) {
            const data = await response.json();

            let sections = [];
            if (Array.isArray(data)) {
                sections = data;
            } else if (Array.isArray(data.data)) {
                sections = data.data;
            } else if (Array.isArray(data.sections)) {
                sections = data.sections;
            } else if (Array.isArray(data.data?.sections)) {
                sections = data.data.sections;
            }

            if (select) {
                select.innerHTML = '<option value="">Please Select Section</option>';

                if (sections.length > 0) {
                    sections.forEach(section => {
                        const option = new Option(section.name, section.id);
                        select.add(option);
                    });
                } else {
                    const noDataOption = new Option('No sections available', '');
                    select.add(noDataOption);
                }
            }
        } else {
            
            if (select) {
                select.innerHTML = '<option value="">Failed to load sections</option>';
            }
        }
    } catch (error) {
        
        if (select) {
            select.innerHTML = '<option value="">Error loading sections</option>';
        }
    }
}
