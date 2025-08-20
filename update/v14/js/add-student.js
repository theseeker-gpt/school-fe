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
    console.log('Token found:', token ? 'Yes' : 'No');
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

    // Handle dependent dropdowns with detailed debugging
    document.getElementById('session-id').addEventListener('change', function() {
        const sessionId = this.value;
        console.log('Session changed to:', sessionId);
        console.log('Selected session text:', this.options[this.selectedIndex]?.text);
        if (sessionId) {
            loadSessionTermsIntoSelect(sessionId, 'term-id');
        } else {
            clearSelect('term-id', 'Please Select Term *');
        }
    });

    document.getElementById('class-id').addEventListener('change', function() {
        const classId = this.value;
        console.log('Class changed to:', classId);
        console.log('Selected class text:', this.options[this.selectedIndex].text);
        
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
    });

    document.getElementById('class-arm-id').addEventListener('change', function() {
        const classId = document.getElementById('class-id').value;
        const armId = this.value;
        console.log('Class Arm changed to:', armId, 'for class:', classId);
        
        if (armId && classId) {
            clearSelect('class-section-id', 'Please Select Section');
            loadClassArmSectionsIntoSelect(classId, armId, 'class-section-id');
        } else {
            clearSelect('class-section-id', 'Please Select Section');
        }
    });

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
        console.log(`Cleared select: ${selectId}`);
    } else {
        console.error(`Select element not found: ${selectId}`);
    }
}

// Load parents into select
async function loadParentsIntoSelect(selectId) {
    console.log('Loading parents...');
    try {
        const url = `${backend_url}/api/v1/all-parents`;
        console.log('Fetching parents from:', url);
        
        const response = await fetch(url, {
            headers: getHeaders()
        });
        
        console.log('Parents response status:', response.status);
        
        if (response.ok) {
            const parents = await response.json();
            console.log('Parents data:', parents);
            
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Please Select Parent *</option>';
                parents.forEach(parent => {
                    const option = new Option(`${parent.first_name} ${parent.last_name}`, parent.id);
                    select.add(option);
                });
                console.log(`Loaded ${parents.length} parents into ${selectId}`);
            }
        } else {
            const errorText = await response.text();
            console.error('Failed to load parents:', response.status, errorText);
        }
    } catch (error) {
        console.error('Error loading parents:', error);
    }
}

// Load classes into select
async function loadClassesIntoSelect(selectId) {
    console.log('Loading classes...');
    try {
        const url = `${backend_url}/api/v1/classes`;
        console.log('Fetching classes from:', url);
        
        const response = await fetch(url, {
            headers: getHeaders()
        });
        
        console.log('Classes response status:', response.status);
        
        if (response.ok) {
            const classes = await response.json();
            console.log('Classes data:', classes);
            
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Please Select Class *</option>';
                classes.forEach(_class => {
                    const option = new Option(_class.name, _class.id);
                    select.add(option);
                });
                console.log(`Loaded ${classes.length} classes into ${selectId}`);
            }
        } else {
            const errorText = await response.text();
            console.error('Failed to load classes:', response.status, errorText);
        }
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

// Load sessions into select
async function loadSessionsIntoSelect(selectId) {
    console.log('Loading sessions...');
    try {
        const url = `${backend_url}/api/v1/sessions`;
        console.log('Fetching sessions from:', url);
        
        const response = await fetch(url, {
            headers: getHeaders()
        });
        
        console.log('Sessions response status:', response.status);
        
        if (response.ok) {
            const sessions = await response.json();
            console.log('Sessions data:', sessions);
            
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">Please Select Session *</option>';
                sessions.forEach(session => {
                    const option = new Option(session.name, session.id);
                    select.add(option);
                });
                console.log(`Loaded ${sessions.length} sessions into ${selectId}`);
            }
        } else {
            const errorText = await response.text();
            console.error('Failed to load sessions:', response.status, errorText);
        }
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
}

// Load session terms into select
async function loadSessionTermsIntoSelect(sessionId, selectId) {
    console.log('Loading terms for session:', sessionId);

    const select = document.getElementById(selectId);
    if (select) {
        select.innerHTML = '<option value="">Loading terms...</option>';
    }

    try {
        const url = `${backend_url}/api/v1/sessions/${sessionId}/terms`;
        console.log('Fetching terms from:', url);

        const response = await fetch(url, {
            headers: getHeaders()
        });

        console.log('Terms response status:', response.status);

        if (!select) return;

        if (response.ok) {
            const data = await response.json();
            console.log('Terms raw data:', data);

            let terms = [];
            if (Array.isArray(data)) {
                terms = data;
            } else if (Array.isArray(data.data)) {
                terms = data.data;
            } else if (Array.isArray(data.terms)) {
                terms = data.terms;
            } else if (Array.isArray(data.data?.terms)) {
                terms = data.data.terms;
            } else {
                console.warn('Unknown terms structure');
            }
            console.log('Parsed terms:', terms);
            select.innerHTML = '<option value="">Please Select Term *</option>';
            if (terms.length > 0) {
                terms.forEach((term, idx) => {
                    console.log(`Term ${idx}:`, term);
                    const option = new Option(term.name, term.id);
                    select.add(option);
                });
                console.log(`Loaded ${terms.length} terms into ${selectId}`);
            } else {
                const option = new Option('No terms available', '');
                select.add(option);
                console.log('No terms found');
            }
        } else {
            select.innerHTML = '<option value="">No terms available</option>';
            const errorText = await response.text();
            console.error('Failed to load terms:', response.status, errorText);
        }
    } catch (error) {
        if (select) {
            select.innerHTML = '<option value="">Failed to load terms</option>';
        }
        console.error('Error loading terms:', error);
    }
}

// Load class arms into select - WITH DETAILED DEBUGGING
async function loadClassArmsIntoSelect(classId, selectId) {
    console.log('=== LOADING CLASS ARMS ===');
    console.log('Class ID:', classId);
    console.log('Select ID:', selectId);
    
    // Show loading state
    const select = document.getElementById(selectId);
    if (select) {
        select.innerHTML = '<option value="">Loading arms...</option>';
    }
    
    try {
        const url = `${backend_url}/api/v1/classes/${classId}/arms`;
        console.log('Fetching class arms from:', url);
        
        const headers = getHeaders();
        console.log('Request headers:', headers);
        
        const response = await fetch(url, { headers });
        
        console.log('Class arms response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const arms = await response.json();
            console.log('Class arms data received:', arms);
            console.log('Arms array length:', arms.length);
            console.log('Arms structure:', arms.length > 0 ? arms[0] : 'No arms found');
            
            if (select) {
                select.innerHTML = '<option value="">Please Select Class Arm *</option>';
                
                if (arms && Array.isArray(arms) && arms.length > 0) {
                    arms.forEach((arm, index) => {
                        console.log(`Adding arm ${index}:`, arm);
                        const option = new Option(arm.name, arm.id);
                        select.add(option);
                    });
                    console.log(`Successfully loaded ${arms.length} arms into ${selectId}`);
                } else {
                    console.warn('No arms found or arms is not an array');
                    const noDataOption = new Option('No arms available', '');
                    select.add(noDataOption);
                }
            }
        } else {
            const errorText = await response.text();
            console.error('Failed to load class arms:', response.status, errorText);
            
            if (select) {
                select.innerHTML = '<option value="">Failed to load arms</option>';
            }
        }
    } catch (error) {
        console.error('Error loading class arms:', error);
        console.error('Error stack:', error.stack);
        
        if (select) {
            select.innerHTML = '<option value="">Error loading arms</option>';
        }
    }
    console.log('=== END LOADING CLASS ARMS ===');
}

// Load class arm sections into select
async function loadClassArmSectionsIntoSelect(classId, armId, selectId) {
    console.log('Loading sections for class:', classId, 'arm:', armId);
    
    // Show loading state
    const select = document.getElementById(selectId);
    if (select) {
        select.innerHTML = '<option value="">Loading sections...</option>';
    }
    
    try {
        const url = `${backend_url}/api/v1/classes/${classId}/arms/${armId}/sections`;
        console.log('Fetching sections from:', url);
        
        const response = await fetch(url, {
            headers: getHeaders()
        });
        
        console.log('Sections response status:', response.status);
        
        if (response.ok) {
            const sections = await response.json();
            console.log('Sections data:', sections);
            
            if (select) {
                select.innerHTML = '<option value="">Please Select Section</option>';
                
                if (sections && Array.isArray(sections) && sections.length > 0) {
                    sections.forEach(section => {
                        const option = new Option(section.name, section.id);
                        select.add(option);
                    });
                    console.log(`Loaded ${sections.length} sections into ${selectId}`);
                } else {
                    console.warn('No sections found');
                    const noDataOption = new Option('No sections available', '');
                    select.add(noDataOption);
                }
            }
        } else {
            const errorText = await response.text();
            console.error('Failed to load sections:', response.status, errorText);
            
            if (select) {
                select.innerHTML = '<option value="">Failed to load sections</option>';
            }
        }
    } catch (error) {
        console.error('Error loading sections:', error);
        
        if (select) {
            select.innerHTML = '<option value="">Error loading sections</option>';
        }
    }
}