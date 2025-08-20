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

document.addEventListener('DOMContentLoaded', function () {
    const token = getCookie('token');
    const form = document.getElementById('edit-student-form');
    const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');

    if (!studentId) {
        alert('No student ID provided!');
        window.location.href = 'all-students.html';
        return;
    }

    function populateDropdown(elementId, items, defaultOption, valueKey = 'id', nameKey = 'name') {
        const select = document.getElementById(elementId);
        if (!select) return;
        select.innerHTML = `<option value="">${defaultOption}</option>`;
        if (items && Array.isArray(items) && items.length > 0) {
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item[valueKey];
                option.textContent = typeof nameKey === 'function' ? nameKey(item) : item[nameKey];
                select.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No data found';
            select.appendChild(option);
        }
    }

    async function fetchAndPopulate(url, elementId, defaultOption, valueKey = 'id', nameKey = 'name') {
        const select = document.getElementById(elementId);
        if (select) select.innerHTML = `<option value="">Loading...</option>`;
        try {
            const response = await fetch(url, { headers });
            if (!response.ok) throw new Error(`Failed to fetch data from ${url} (status: ${response.status})`);
            const items = await response.json();
            populateDropdown(elementId, items, defaultOption, valueKey, nameKey);
            return items;
        } catch (error) {
            console.error(`Error populating ${elementId}:`, error);
            if (select) select.innerHTML = `<option value="">Failed to load</option>`;
        }
    }

    async function fetchStudentData() {
        try {
            const studentResponse = await fetch(`${backend_url}/api/v1/students/${studentId}`, { headers });
            if (!studentResponse.ok) throw new Error('Failed to fetch student data');
            const studentData = await studentResponse.json();
            const student = studentData.data;

            document.getElementById('first-name').value = student.first_name || '';
            document.getElementById('middle-name').value = student.middle_name || '';
            document.getElementById('last-name').value = student.last_name || '';
            document.getElementById('dob').value = student.date_of_birth || '';
            document.getElementById('nationality').value = student.nationality || '';
            document.getElementById('state-of-origin').value = student.state_of_origin || '';
            document.getElementById('lga-of-origin').value = student.lga_of_origin || '';
            document.getElementById('admission-date').value = student.admission_date || '';
            document.getElementById('admission-no').value = student.admission_no || '';
            document.getElementById('house').value = student.house || '';
            document.getElementById('club').value = student.club || '';
            document.getElementById('address').value = student.address || '';
            document.getElementById('medical-info').value = student.medical_information || '';
            document.getElementById('gender').value = student.gender || '';
            document.getElementById('status').value = student.status || '';

            await Promise.all([
                fetchAndPopulate(`${backend_url}/api/v1/all-parents`, 'parent-id', 'Please Select Parent *', 'id', item => item.first_name + ' ' + item.last_name),
                fetchAndPopulate(`${backend_url}/api/v1/classes`, 'class-id', 'Please Select Class *'),
                fetchAndPopulate(`${backend_url}/api/v1/sessions`, 'session-id', 'Please Select Session *')
            ]);

            document.getElementById('parent-id').value = student.parent_id;
            document.getElementById('class-id').value = student.class_id;
            document.getElementById('session-id').value = student.current_session_id;

            if (student.current_session_id) {
                await fetchAndPopulate(`${backend_url}/api/v1/sessions/${student.current_session_id}/terms`, 'term-id', 'Select Term *');
                document.getElementById('term-id').value = student.current_term_id;
            }
            if (student.class_id) {
                await fetchAndPopulate(`${backend_url}/api/v1/classes/${student.class_id}/arms`, 'class-arm-id', 'Select Arm *');
                document.getElementById('class-arm-id').value = student.class_arm_id;
            }
            if (student.class_id && student.class_arm_id) {
                await fetchAndPopulate(`${backend_url}/api/v1/classes/${student.class_id}/arms/${student.class_arm_id}/sections`, 'class-section-id', 'Select Section');
                document.getElementById('class-section-id').value = student.class_section_id;
            }

        } catch (error) {
            console.error('Error fetching student data:', error);
            alert('Could not load student data.');
        }
    }

    const sessionSelect = document.getElementById('session-id');
    const termSelect = document.getElementById('term-id');
    const classSelect = document.getElementById('class-id');
    const classArmSelect = document.getElementById('class-arm-id');

    sessionSelect.addEventListener('change', function() {
        const sessionId = this.value;
        termSelect.innerHTML = '<option value="">Please Select Term *</option>';
        if(sessionId) {
            fetchAndPopulate(`${backend_url}/api/v1/sessions/${sessionId}/terms`, 'term-id', 'Select Term *');
        }
    });

    classSelect.addEventListener('change', function() {
        const classId = this.value;
        classArmSelect.innerHTML = '<option value="">Please Select Class Arm *</option>';
        document.getElementById('class-section-id').innerHTML = '<option value="">Please Select Section</option>';
        if (classId) {
            fetchAndPopulate(`${backend_url}/api/v1/classes/${classId}/arms`, 'class-arm-id', 'Select Arm *');
        }
    });

    classArmSelect.addEventListener('change', function() {
        const classId = classSelect.value;
        const armId = this.value;
        document.getElementById('class-section-id').innerHTML = '<option value="">Please Select Section</option>';
        if (classId && armId) {
            fetchAndPopulate(`${backend_url}/api/v1/classes/${classId}/arms/${armId}/sections`, 'class-section-id', 'Select Section');
        }
    });

    fetchStudentData();

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
        formData.append('_method', 'PUT');

        const photoInput = document.getElementById('photo');
        if (photoInput.files[0]) {
            formData.append('photo', photoInput.files[0]);
        }

        fetch(`${backend_url}/api/v1/students/${studentId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    if (response.status === 422 && err.errors) {
                        const errorMessages = Object.values(err.errors).flat().join('\\n');
                        throw new Error(errorMessages);
                    }
                    throw new Error(err.message || 'Failed to update student');
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Student updated successfully!');
            window.location.href = `student-details.html?id=${studentId}`;
        })
        .catch(error => {
            console.error('Error updating student:', error);
            alert(`Error: ${error.message}`);
        });
    });
});
