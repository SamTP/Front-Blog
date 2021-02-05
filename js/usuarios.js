var url = 'http://localhost:8080';

function singup() {
    let username = document.getElementById('username').value;
    let pswd = document.getElementById('pswd').value;
    let pswdC = document.getElementById('pswdC').value;
    let correo = document.getElementById('email').value;
    // let roles = document.getElementById("roles");
    // let rol = roles.options[roles.selectedIndex].value;

    if (pswd == pswdC) {

        let body = JSON.stringify({ username: username, password: pswd, roles: ["LECTOR"], active: true, email: correo, suscripciones: [[], []] });

        let peticion = new XMLHttpRequest;

        peticion.open("POST", "http://localhost:8080/users");
        peticion.setRequestHeader('Content-Type', 'application/json');
        peticion.send(body);

        peticion.onreadystatechange = function () {
            if (peticion.readyState == 4 && peticion.status == 201) {
                alert('Registro exitoso');
                entrar();
            }
            if (peticion.readyState == 4 && peticion.status == 409) {
                alert('Ya hay un registro con ese nombre de usuario');
            }
        }


    } else {
        alert('Las contraseñas no coinciden');
    }

}

function verMiPerfil() {

    let user = localStorage.getItem('user');
    let peticion = new XMLHttpRequest;
    peticion.open('GET', url + '/users/' + user);
    peticion.setRequestHeader('Content-Type', 'application/json');
    peticion.send();
    let aux = "'temas'";
    let tmp = "'usuarios'";
    let sim = "'";
    peticion.onreadystatechange = function () {
        if (peticion.readyState == 4 && peticion.status == 200) {
            let info = JSON.parse(peticion.responseText);
            document.getElementById('perfil').innerHTML = '<h4 class="card-title">Mi Perfil</h4>' +
                '<div class="row">' +
                '<div class="col-sm-8">' +
                '<input type="text" class="form-control" readonly placeholder="' + info.username + '">' +
                '</div>' +
                '</div>' +
                '<div class="row">' +
                '<div class="col-sm-8">' +
                '<input type="text" class="form-control" readonly placeholder="' + info.email + '">' +
                '</div>' +
                '</div>' +
                '<div class="row" style="margin-top:1%;">' +
                '<div class="col-sm-2">' +
                '<h6>Suscripciones</h6>' +
                '</div>' +
                '</div>' +
                '<div class="row">' +
                '<div class="col-sm-6">' +
                '<p id="temas">' +
                '<small>Temas</small>' +
                '</p>' +
                '</div>' +
                '<div class="col-sm-6">' +
                '<p id="usuarios">' +
                '<small>Usuarios</small>' +
                '</p>' +
                '</div>' +
                '</div>' +
                '<div class="row">' +
                '<div class="col-sm-4">' +
                '<input type="text" class="form-control" placeholder="Agrega un nuevo tema" id="nuevoTema">' +
                '</div>' +
                '<div class="col-sm-2">' +
                '<button type="button" class="btn btn-primary btn-sm" onclick="modSus(null,' + aux + ')">Agregar</button>' +
                '</div>' +
                '</div>';
            if (info.suscripciones[0].length > 0) {
                for (let i = 0; i < info.suscripciones[0].length; i++) {
                    document.getElementById('temas').innerHTML += '<br>' + info.suscripciones[0][i] + '  <small><a href="#" onclick="modSus(' + sim + info.suscripciones[0][i] + sim + ',' + aux + ')">Eliminar</a></small>';
                }
            }
            if (info.suscripciones[1].length > 0) {
                for (let i = 0; i < info.suscripciones[1].length; i++) {
                    document.getElementById('usuarios').innerHTML += '<br>' + info.suscripciones[1][i] + '  <small><a href="#" onclick="modSus(' + sim + info.suscripciones[1][i] + sim + ',' + tmp + ')">Eliminar</a></small>';

                }
            }
        }
    }



}

function getMisPost(page) {
    let ajax = new XMLHttpRequest;
    let user = localStorage.getItem('user');
    ajax.open("GET", url + "/posts?size=3&autor=" + user + "&page=" + page);
    ajax.setRequestHeader('Content-Type', 'application/json');
    ajax.send();

    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            let post = JSON.parse(ajax.responseText);

            pagesPost(post);
            fillPost(post);

        }

    }
}

function getComments(page) {
    let ajax = new XMLHttpRequest;
    let user = localStorage.getItem('user');
    ajax.open("GET", url + "/users/" + user + "/comments?size=3&page=" + page);
    ajax.setRequestHeader('Content-Type', 'application/json');
    ajax.send();

    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            let comments = JSON.parse(ajax.responseText);
            pagesComments(comments, false);
            fillComments(comments);
        }

    }
}

function fillPost(post, flag) {
    if (flag) {
        if (parseInt(post.content.length) > 0) {
            document.getElementById('postsTabla').innerHTML = '';
            for (let i = 0; i < post.content.length; i++) {
                document.getElementById('postsTabla').innerHTML += '<tr>' +
                    '<th scope="row">' + post.content[i].titulo + '</th>' +
                    '<td>' + post.content[i].resumen + '</td>' +
                    '<td><button type="button" class="btn btn-secondary btn-sm" onclick="verPublicacion(' + post.content[i].identificador + ',false)">Ver Publicación</button></td>' +
                    '</tr>'
            }
        } else {
            document.getElementById('postsTabla').innerHTML = '<tr><td>No hay publicaciones</td></tr>'
        }
    } else {
        if (parseInt(post.content.length) > 0) {
            document.getElementById('postsTabla').innerHTML = '';
            for (let i = 0; i < post.content.length; i++) {
                document.getElementById('postsTabla').innerHTML += '<tr>' +
                    '<th scope="row">' + post.content[i].titulo + '</th>' +
                    '<td>' + post.content[i].resumen + '</td>' +
                    '<td><button type="button" class="btn btn-secondary btn-sm" onclick="loadModal(' + post.content[i].identificador + ')">Editar</button><button class="btn btn-danger btn-sm" type="button" onclick="rmvPost(' + post.content[i].identificador + ',false)">Eliminar</button></td>' +
                    '</tr>'
            }
        } else {
            document.getElementById('postsTabla').innerHTML = '<tr><td>No hay publicaciones</td></tr>'
        }
    }
}

function pagesPost(post, flag) {
    if (flag) {
        document.getElementById('pagesPost').innerHTML = '<li class="page-item">' +
            '<a class="page-link" href="#posts" onclick="postRedactor(' + 0 + ')">&laquo;</a>' +
            '</li>'
        for (let i = 1; i <= post.totalPages; i++) {
            document.getElementById('pagesPost').innerHTML += '<li class="page-item active">' +
                '<a class="page-link" href="#posts" onclick="postRedactor(' + (i - 1) + ')">' + i + '</a>' +
                '</li>'
        }
        document.getElementById('pagesPost').innerHTML += '<li class="page-item">' +
            '<a class="page-link" href="#posts" onclick="postRedactor(' + (parseInt(post.totalPages - 1)) + ')">&raquo;</a></li>'
    } else {
        document.getElementById('pagesPost').innerHTML = '<li class="page-item">' +
            '<a class="page-link" href="#posts" onclick="getMisPost(' + 0 + ')">&laquo;</a>' +
            '</li>'
        for (let i = 1; i <= post.totalPages; i++) {
            document.getElementById('pagesPost').innerHTML += '<li class="page-item active">' +
                '<a class="page-link" href="#posts" onclick="getMisPost(' + (i - 1) + ')">' + i + '</a>' +
                '</li>'
        }
        document.getElementById('pagesPost').innerHTML += '<li class="page-item">' +
            '<a class="page-link" href="#posts" onclick="getMisPost(' + (parseInt(post.totalPages - 1)) + ')">&raquo;</a></li>'
    }

}

function pagesComments(comments, flag) {
    if (flag) {
        document.getElementById('pagesComments').innerHTML = '<li class="page-item">' +
            '<a class="page-link" href="#comments" onclick="loadCom(' + 0 + ')">&laquo;</a>' +
            '</li>'
        for (let i = 1; i <= comments.totalPages; i++) {
            document.getElementById('pagesComments').innerHTML += '<li class="page-item active">' +
                '<a class="page-link" href="#comments" onclick="loadCom(' + (i - 1) + ')">' + i + '</a>' +
                '</li>'
        }
        document.getElementById('pagesComments').innerHTML += '<li class="page-item">' +
            '<a class="page-link" href="#comments" onclick="loadCom(' + (parseInt(comments.totalPages - 1)) + ')">&raquo;</a></li>'
    } else {
        document.getElementById('pagesComments').innerHTML = '<li class="page-item">' +
            '<a class="page-link" href="#comments" onclick="getComments(' + 0 + ')">&laquo;</a>' +
            '</li>'
        for (let i = 1; i <= comments.totalPages; i++) {
            document.getElementById('pagesComments').innerHTML += '<li class="page-item active">' +
                '<a class="page-link" href="#comments" onclick="getComments(' + (i - 1) + ')">' + i + '</a>' +
                '</li>'
        }
        document.getElementById('pagesComments').innerHTML += '<li class="page-item">' +
            '<a class="page-link" href="#comments" onclick="getComments(' + (parseInt(comments.totalPages - 1)) + ')">&raquo;</a></li>'
    }

}


function fillComments(comments) {
    if (parseInt(comments.content.length) > 0) {
        document.getElementById('commentsTabla').innerHTML = '';
        for (let i = 0; i < comments.content.length; i++) {
            document.getElementById('commentsTabla').innerHTML += '<tr>' +
                '<th scope="row">' + comments.content[i].post + '</th>' +
                '<td>' + comments.content[i].cuerpo + '</td>' +
                '<td><button class="btn btn-danger btn-sm" type="button" onclick="eliminarCom(' + comments.content[i].post + ',' + comments.content[i].identificador + ');getComments(0)">Eliminar</button></td>' +
                '</tr>'
        }
    } else {
        document.getElementById('commentsTabla').innerHTML = '<tr><td>No hay publicaciones</td></tr>'
    }
}

function modSus(sub, tipo, flag) {
    if (sub == null)
        sub = document.getElementById('nuevoTema').value;

    let ajax = new XMLHttpRequest;
    let user = localStorage.getItem('user');
    let body = JSON.stringify({ username: user })
    ajax.open("PUT", url + "/users/" + user + "?mod=subs&tipo=" + tipo + "&sub=" + sub);
    ajax.setRequestHeader('Content-Type', 'application/json');
    ajax.setRequestHeader('Authorization', localStorage.getItem('token'));
    ajax.send(body);

    ajax.onreadystatechange = function (params) {
        if (ajax.readyState == 4 && ajax.status == 200) {
            if (flag)
                alert('Suscripción agregada')
            verMiPerfil();
        }
    }
}

function loadModal(idPost) {
    console.log(idPost)
    let peticion = new XMLHttpRequest;
    peticion.open("GET", url + "/posts/" + idPost);
    peticion.send();
    peticion.onreadystatechange = function (params) {
        if (peticion.readyState == 4 && peticion.status == 200) {
            let post = JSON.parse(peticion.responseText);
            document.getElementById('resumen').value = post.resumen;
            document.getElementById('cuerpo').value = post.cuerpo;
            document.getElementById('titulo').value = post.titulo;
            document.getElementById('footerModal').innerHTML = '';
            document.getElementById('footerModal').innerHTML += '<button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>' +
                '<button type="button" class="btn btn-primary" onclick="editarPost(' + idPost + ')">Guardar Cambios</button>';
        }
    }
    $("#modalPost").modal()
}