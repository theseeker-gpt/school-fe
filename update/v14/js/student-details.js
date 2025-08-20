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
    const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');

    if (!studentId) {
        alert('No student ID provided!');
        window.location.href = 'all-students.html';
        return;
    }

    async function fetchStudentDetails() {
        try {
            const response = await fetch(`${backend_url}/api/v1/students/${studentId}`, { headers });
            if (!response.ok) {
                throw new Error('Failed to fetch student details');
            }
            const data = await response.json();
            const student = data.data; // Assuming data is nested under a 'data' key

            const fullName = `${student.first_name || ''} ${student.middle_name || ''} ${student.last_name || ''}`.trim();
            document.getElementById('student-name-heading').textContent = fullName;
            document.getElementById('student-name').textContent = fullName;

            // Populate all fields from the student object
            document.getElementById('student-admission-no').textContent = student.admission_no || 'N/A';
            document.getElementById('student-status').textContent = student.status || 'N/A';
            document.getElementById('student-gender').textContent = student.gender || 'N/A';
            document.getElementById('student-dob').textContent = student.date_of_birth || 'N/A';
            document.getElementById('student-admission-date').textContent = student.admission_date || 'N/A';
            document.getElementById('student-nationality').textContent = student.nationality || 'N/A';
            document.getElementById('student-state-of-origin').textContent = student.state_of_origin || 'N/A';
            document.getElementById('student-lga-of-origin').textContent = student.lga_of_origin || 'N/A';
            document.getElementById('student-house').textContent = student.house || 'N/A';
            document.getElementById('student-club').textContent = student.club || 'N/A';
            document.getElementById('student-address').textContent = student.address || 'N/A';
            document.getElementById('student-medical').textContent = student.medical_information || 'N/A';

            // Populate fields from related, nested objects
            document.getElementById('student-session').textContent = student.current_session ? student.current_session.name : 'N/A';
            document.getElementById('student-term').textContent = student.current_term ? student.current_term.name : 'N/A';
            document.getElementById('student-class').textContent = student.class ? student.class.name : 'N/A';
            document.getElementById('student-class-arm').textContent = student.class_arm ? student.class_arm.name : 'N/A';
            document.getElementById('student-class-section').textContent = student.class_section ? student.class_section.name : 'N/A';
            document.getElementById('student-parent').textContent = student.parent ? `${student.parent.title} ${student.parent.first_name} ${student.parent.last_name}` : 'N/A';

            if (student.photo_url) {
                document.getElementById('student-photo').src = student.photo_url;
            } else {
                document.getElementById('student-photo').src = '../assets/img/figure/student.png'; // Default image
            }

            // Set up edit button link
            const editButton = document.getElementById('edit-button');
            if (editButton) {
                editButton.href = `edit-student.html?id=${student.id}`;
            }

        } catch (error) {
            console.error('Error fetching student details:', error);
            alert('Could not load student details.');
        }
    }

    fetchStudentDetails();
});
