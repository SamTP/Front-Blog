var url = "http://localhost:8080";
var view = 'http://localhost/aos-views';

function perfil() {
    window.location = (view + '/views/perfil.html');
}

function registro() {
    window.location = (view + '/views/registro.html');
}

function inicio() {
    window.location = (view + '/index.html');
}

function entrar() {
    window.location = (view + '/views/login.html');
}

function admin() {
    window.location = (view + '/views/admin.html');
}

function login() {
    let username = document.getElementById('username').value;
    let pswd = document.getElementById('pswd').value;

    let body = JSON.stringify({ username: username, password: pswd });

    let peticion = new XMLHttpRequest;

    peticion.open("POST", "http://localhost:8080/login");
    peticion.setRequestHeader('Content-Type', 'application/json');
    peticion.send(body);

    peticion.onreadystatechange = function () {
        if (peticion.status == 401 && peticion.readyState == 4) {
            alert('Usuario o contraseña incorrectos');
        }

        if (peticion.status == 200 && peticion.readyState == 4) {
            localStorage.setItem('user', username);
            localStorage.setItem('token', peticion.getResponseHeader("Authorization"));
            inicio();
        }
    }
}


function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    inicio();
}

function nuevoPost() {
    window.location = view + '/views/nuevoPost.html';
}

function redactores() {
    window.location = view + '/views/todosRedactores.html'
}

function navbar() {
    var navbar = document.getElementById('navbar');
    if (localStorage.getItem('user') != null) {
        navbar.innerHTML = '<ul class="navbar-nav mr-auto">' +
            '<li class="nav-item">' +
            '<a class="nav-link active" href="#" onclick="inicio()">Inicio</a>' +
            '</li>' +
            '<li class="nav-item">' +
            '<a class="nav-link" href="#" onclick="logout()">Cerrar sesión</a>' +
            '</li>' +
            '<li class="nav-item">' +
            '<a class="nav-link" href="#" onclick="perfil()">Mi perfil</a>' +
            '</li>' +
            '<li class="nav-item">' +
            '<a class="nav-link" href="#" onclick="admin()">Herramienta Administrador</a>' +
            '</li>' +
            '</ul>' +
            '<form class="form-inline my-2 my-lg-0">' +
            '<input class="form-control mr-sm-2" type="text" placeholder="Buscar">' +
            '<button class="btn btn-secondary my-2 my-sm-0" type="button">Buscar</button>' +
            '</form>'
    } else {
        navbar.innerHTML = '<ul class="navbar-nav mr-auto">' +
            '<li class="nav-item">' +
            '<a class="nav-link active" href="#" onclick="inicio()">Inicio</a>' +
            '</li>' +
            '<li class="nav-item">' +
            '<a class="nav-link" href="#" onclick="entrar()">Iniciar sesión</a>' +
            '</li>' +
            '<li class="nav-item">' +
            '<a class="nav-link" href="#" onclick="registro()">Registro</a>' +
            '</li>' +
            '</ul>' +
            '<form class="form-inline my-2 my-lg-0">' +
            '<input class="form-control mr-sm-2" type="text" placeholder="Buscar">' +
            '<button class="btn btn-secondary my-2 my-sm-0" type="button">Buscar</button>' +
            '</form>'
    }
}

function verRedactores(page) {
    let peticion = new XMLHttpRequest;
    peticion.open("GET", url + "/users?rol=REDACTOR&page=" + page);
    peticion.send();
    let tipo = "'usuarios'";
    let sim = "'";
    peticion.onreadystatechange = function (params) {
        if (peticion.status == 200 && peticion.readyState == 4) {
            let redactores = JSON.parse(peticion.responseText);
            document.getElementById('redactores').innerHTML = '';
            for (let i = 0; i < redactores.content.length; i++) {
                document.getElementById('redactores').innerHTML += '<tr>' +
                    '<th scope="row">' + redactores.content[i].username + '</th>' +
                    '<td>' +
                    '<button type="button" class="btn btn-secondary" onclick="verRedactor(' + sim + redactores.content[i].username + sim + ')">Ver Perfil</button>' +
                    '<button type="button" class="btn btn-secondary" onclick="modSus(' + sim + redactores.content[i].username + sim + ',' + tipo + ',true)">Suscribirme</button>' +
                    '</td>' +
                    '</tr>'
            }
            pagesRedactores(redactores);
        }
    }
}

function pagesRedactores(post) {
    document.getElementById('pagesRedactores').innerHTML = '<li class="page-item">' +
        '<a class="page-link" href="#redactores" onclick="verRedactores(' + 0 + ')">&laquo;</a>' +
        '</li>'
    for (let i = 1; i <= post.totalPages; i++) {
        document.getElementById('pagesRedactores').innerHTML += '<li class="page-item active">' +
            '<a class="page-link" href="#redactores" onclick="verRedactores(' + (i - 1) + ')">' + i + '</a>' +
            '</li>'
    }
    document.getElementById('pagesRedactores').innerHTML += '<li class="page-item">' +
        '<a class="page-link" href="#redactores" onclick="verRedactores(' + (parseInt(post.totalPages - 1)) + ')">&raquo;</a></li>'
}

function verRedactor(username) {
    localStorage.setItem('redactor', username)
    window.location.replace('../views/redactor.html');
}

function loadRedactor() {
    let redactor = localStorage.getItem('redactor')
    let peticion = new XMLHttpRequest;
    peticion.open("GET", url + '/users/' + redactor)
    peticion.send()
    peticion.onreadystatechange = function () {
        if (peticion.readyState == 4 && peticion.status == 200) {
            let redactor = JSON.parse(peticion.responseText);
            document.getElementById('redactor').innerHTML = '<h4 class="card-title">' + redactor.username + '</h4> <br>' +
                '<h6 class="card-subtitle">Publicaciones</h6> <br>' +
                '<table class="table">' +
                '<thead>' +
                '<tr>' +
                '<th scope="col">Título</th>' +
                '<th scope="col">Resumen</th>' +
                '<th scope="col">Acciones</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody id="postsTabla">' +
                '</tbody>' +
                '</table>' +
                '<div style="margin-left: 40%;margin-top:5%;">' +
                '<ul class="pagination pagination-sm" id="pagesPost">' +
                '</ul>' +
                '</div>'
        }
    }

}

function postRedactor(page) {
    let ajax = new XMLHttpRequest;
    let redactor = localStorage.getItem('redactor')
    ajax.open("GET", url + "/posts?size=3&autor=" + redactor + "&page=" + page);
    ajax.setRequestHeader('Content-Type', 'application/json');
    ajax.send();

    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            let post = JSON.parse(ajax.responseText);
            pagesPost(post,true);
            fillPost(post,true);

        }

    }
}
