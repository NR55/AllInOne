const isDarkMode = localStorage.getItem('dark-mode') === 'true';
if (!isDarkMode) {
    document.body.classList.add('light-mode');
    document.querySelectorAll('.priority-list, h3, form input, form textarea, .modal-content, .priority-list button')
        .forEach(element => element.classList.add('light-mode'));
}

function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    document.querySelectorAll('.priority-list, h3, form input, form textarea, .modal-content, .priority-list button')
        .forEach(element => element.classList.toggle('light-mode'));
    localStorage.setItem('dark-mode', !document.body.classList.contains('light-mode'));
}