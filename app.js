$(document).ready(function() {
    // Check if user is logged in
    if (localStorage.getItem('token')) {
        loadUser();
        loadNotes();
        $('#auth-container').hide();
    } else {
        $('#auth-container').show();
    }
    // Register new user
    $('#register-btn').click(function() {
        const username = $('#reg-username').val();
        const email = $('#reg-email').val();
        const password = $('#reg-password').val();
        registerUser(username, email, password);
    });

    // Login user
    $('#login-btn').click(function() {
        const email = $('#login-email').val();
        const password = $('#login-password').val();
        loginUser(email, password);
    });

    // Event listener for creating a new note
    $('#create-note').click(function() {
        createNewNote();
    });

    // Event listener for searching notes
    $('#search').on('input', function() {
        searchNotes($(this).val());
    });

    // Load labels from the backend
    loadLabels();
});

function registerUser(username, email, password) {
    $.ajax({
        url: 'http://localhost:3000/api/auth/register',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({username, email, password}),
        success: function(response) {
            alert(response.message);
        },
        error: function(xhr) {
            alert(xhr.responseJSON.error);
        }
    });
}

function loginUser(email, password) {
    $.ajax({
        url: 'http://localhost:3000/api/auth/login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({email, password}),
        success: function(response) {
            localStorage.setItem('token', response.token);
            $('#auth-container').hide();
            loadUser();
            loadNotes();
        },
        error: function(xhr) {
            alert(xhr.responseJSON.error);
        }
    });
}

function loadUser() {
    $.ajax({
        url: 'http://localhost:3000/api/auth/me',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ` + localStorage.getItem('token')
        },
        success: function(user) {
            console.log('Logged in user:', user);
        },
        error: function(xhr) {
            alert(xhr.responseJSON.error);
        }
    });
}

function loadNotes() {
    $.ajax({
        url: 'http://localhost:3000/api/notes',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function(notes) {
            renderNotes(notes);
        },
        error: function(xhr) {
            alert(xhr.responseJSON.error);
        }
    });
}

function renderNotes(notes) {
    $('#notes-container').empty();
    notes.forEach(note => {
        $('#notes-container').append(`
            <div class="note" style="background-color: ${note.color}">
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <div>${note.tags.join(',')}</div>
            </div>
            `);
    });
}

function createNewNote() {
    const title = prompt('Enter note title');
    const content = prompt('Enter note content');
    const tags = prompt('Enter tags (comma-separated)').split(',');
    const color = prompt('Enter background color');

    if (title && content && tags && color) {
        $.ajax({
            url: 'http://localhost:3000/api/notes',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            contentType: 'application/json',
            data: JSON.stringify({title, content, tags, color}),
            success: function(note) {
                renderNotes([note]);
            },
            error: function(xhr) {
                alert(xhr.responseJSON.error);
            }
        });
    }
}

function searchNotes(query) {
    const notes = $('.note');
    notes.each(function() {
        const note = $(this);
        if (note.text().toLowerCase().includes(query.toLowerCase())) {
            note.show();
        } else {
            note.hide();
        }
    });
}

function viewAllNotes() {
    loadNotes();
}

function viewArchivedNotes() {
    $.ajax({
        url: 'http://localhost:3000/api/notes/archived',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function(notes) {
            renderNotes(notes);
        },
        error: function(xhr) {
            alert(xhr.responseJSON.error);
        }
    });
}

function viewTrashNotes() {
    $.ajax({
        url: 'http://localhost:3000/api/notes/trashed',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function(notes) {
            renderNotes(notes);
        },
        error: function(xhr) {
            alert(xhr.responseJSON.error);
        }
    });
}

function loadLabels() {
    // Mock labels, in real implementation, load labels from the backend
    const labels = ['Work', 'Personal', 'Important'];
    const labelsContainer = $('#labels');
    labels.forEach(label => {
        labelsContainer.append(`<button onclick="viewLabel('${label}')">${label}</button>`);
    });
}

function viewLabel(label) {
    $.ajax({
        url: 'http://localhost:3000/api/notes',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function(notes) {
            const filteredNotes = notes.filter(note => note.tags.includes(label));
            renderNotes(filteredNotes);
        },
        error: function(xhr) {
            alert(xhr.responseJSON.error);
        }
    });
}
