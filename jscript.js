document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeToggleBtn = document.getElementById('theme-toggle');
    const startBtn = document.getElementById('start-btn');
    const backToFormBtn = document.getElementById('back-to-form-btn');
    const studentForm = document.getElementById('student-form');
    const welcomeSection = document.getElementById('welcome-section');
    const formSection = document.getElementById('form-section');
    const listSection = document.getElementById('list-section');
    const studentsTableBody = document.querySelector('#students-table tbody');
    const detailsSection = document.getElementById('details-section');
    const backToListBtn = document.getElementById('back-to-list-btn');
    const htmlElement = document.documentElement;

    // State
    let students = [];

    // Theme Logic
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Navigation Logic
    function switchSection(hideSection, showSection) {
        hideSection.classList.remove('active-section');
        hideSection.classList.add('hidden-section');

        // Wait for animation if needed, or just switch
        setTimeout(() => {
            hideSection.style.display = 'none';
            showSection.style.display = 'block';

            // Small delay to allow display:block to apply before adding opacity class
            requestAnimationFrame(() => {
                showSection.classList.remove('hidden-section');
                showSection.classList.add('active-section');
            });
        }, 300); // Match CSS transition time roughly
    }

    startBtn.addEventListener('click', () => {
        switchSection(welcomeSection, formSection);
    });

    backToFormBtn.addEventListener('click', () => {
        switchSection(listSection, formSection);
    });

    // Custom Dropdown Logic
    const customSelects = document.querySelectorAll('.custom-select');

    customSelects.forEach(customSelect => {
        const customSelectTrigger = customSelect.querySelector('.custom-select-trigger');
        const customOptions = customSelect.querySelectorAll('.custom-option');
        const customSelectSpan = customSelectTrigger.querySelector('span');
        const wrapper = customSelect.closest('.custom-select-wrapper');
        const hiddenInput = wrapper.querySelector('input[type="hidden"]');

        customSelectTrigger.addEventListener('click', () => {
            // Close other open dropdowns
            customSelects.forEach(select => {
                if (select !== customSelect) {
                    select.classList.remove('open');
                }
            });
            customSelect.classList.toggle('open');
        });

        customOptions.forEach(option => {
            option.addEventListener('click', function (e) {
                e.stopPropagation(); // Prevent bubbling to window click
                customSelect.classList.remove('open');
                customOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');

                const value = this.getAttribute('data-value');
                const text = this.textContent;

                customSelectSpan.textContent = text;
                hiddenInput.value = value;
            });
        });
    });

    window.addEventListener('click', (e) => {
        customSelects.forEach(select => {
            if (!select.contains(e.target)) {
                select.classList.remove('open');
            }
        });
    });

    // Form Handling
    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('student-name');
        const idInput = document.getElementById('student-id');
        const careerInput = document.getElementById('student-career');
        const periodInput = document.getElementById('student-period');
        const statusInput = document.getElementById('student-status');
        const shiftInput = document.getElementById('student-shift');
        const campusInput = document.getElementById('student-campus');

        // Manual validation for hidden inputs
        if (!careerInput.value || !statusInput.value || !shiftInput.value || !campusInput.value) {
            alert('Por favor complete todos los campos de selección.');
            return;
        }

        // Validate Student ID Format
        const idPattern = /^2025-\d{4}[A-Z]$/;
        if (!idPattern.test(idInput.value)) {
            alert('El carnet debe tener el formato 2025-XXXXL (ej. 2025-1234K)');
            return;
        }

        // Generate Current Date
        const now = new Date();
        const dateString = now.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const newStudent = {
            name: nameInput.value,
            id: idInput.value,
            career: careerInput.value,
            period: periodInput.value,
            status: statusInput.value,
            shift: shiftInput.value,
            campus: campusInput.value,
            date: dateString
        };

        students.push(newStudent);
        renderList();

        // Show "Show List" button if at least one student exists
        if (students.length >= 1) {
            const showListBtn = document.getElementById('show-list-btn');
            showListBtn.style.display = 'inline-block';
        }

        // Reset form
        studentForm.reset();
        customSelectSpan.textContent = 'Seleccione una carrera';
        customOptions.forEach(opt => opt.classList.remove('selected'));
        hiddenInput.value = '';

        // Reset all custom selects
        document.querySelectorAll('.custom-select').forEach(select => {
            select.querySelector('.custom-select-trigger span').textContent = select.querySelector('.custom-select-trigger span').getAttribute('data-default') || 'Seleccione una opción';
            select.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
            select.closest('.custom-select-wrapper').querySelector('input[type="hidden"]').value = '';
        });

        // Reset specific text content for triggers (hardcoded for simplicity or use data attributes)
        document.querySelector('#custom-career-select span').textContent = 'Seleccione una carrera';
        document.querySelector('#custom-status-select span').textContent = 'Seleccione un estado';
        document.querySelector('#custom-shift-select span').textContent = 'Seleccione una jornada';
        document.querySelector('#custom-campus-select span').textContent = 'Seleccione una sede';

        // Switch to list view
        switchSection(formSection, listSection);
    });

    // Show List Button Logic
    const showListBtn = document.getElementById('show-list-btn');
    showListBtn.addEventListener('click', () => {
        switchSection(formSection, listSection);
    });

    // Render List
    function renderList() {
        // Sort students alphabetically by name
        students.sort((a, b) => a.name.localeCompare(b.name));

        studentsTableBody.innerHTML = '';

        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.id}</td>
                <td>${student.career}</td>
                <td>${student.date}</td>
                <td><button class="secondary-btn view-details-btn" style="padding: 5px 15px; font-size: 0.8rem;">Ver más</button></td>
            `;
            row.querySelector('.view-details-btn').addEventListener('click', () => showDetails(student));
            studentsTableBody.appendChild(row);
        });
    }

    // Details View Logic
    function showDetails(student) {
        document.getElementById('detail-name').textContent = student.name;
        document.getElementById('detail-id').textContent = student.id;
        document.getElementById('detail-career').textContent = student.career;
        document.getElementById('detail-date').textContent = student.date;
        document.getElementById('detail-period').textContent = student.period;
        document.getElementById('detail-status').textContent = student.status;
        document.getElementById('detail-shift').textContent = student.shift;
        document.getElementById('detail-campus').textContent = student.campus;

        switchSection(listSection, detailsSection);
    }

    backToListBtn.addEventListener('click', () => {
        switchSection(detailsSection, listSection);
    });
});
