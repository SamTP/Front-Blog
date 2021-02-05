var url = 'http://localhost:8080';

function permisos() {
    let user = localStorage.getItem('user');
    let peticion = new XMLHttpRequest;
    peticion.open("GET", url + '/users/' + user);
    peticion.send()
    peticion.onreadystatechange = function () {
        if (peticion.status == 200 && peticion.readyState == 4) {
            let respuesta = JSON.parse(peticion.responseText);
            if (!respuesta.roles.includes('ADMIN') && !respuesta.roles.includes('MODERADOR') && !respuesta.roles.includes('REDACTOR')) {
                inicio();
            } else {
                localStorage.setItem('superUser', peticion.responseText)
            }
        }
    }
}

function getAllUsers(page) {
    let peticion = new XMLHttpRequest;
    peticion.open("GET", url + "/users?size=10&page=" + page);
    peticion.send();
    let tipo = "'usuarios'";
    let sim = "'";
    peticion.onreadystatechange = function (params) {
        if (peticion.status == 200 && peticion.readyState == 4) {
            let usuarios = JSON.parse(peticion.responseText);
            document.getElementById('usuarios').innerHTML = '';
            for (let i = 0; i < usuarios.content.length; i++) {
                if (usuarios.content[i].active) {
                    document.getElementById('usuarios').innerHTML += '<tr>' +
                        '<th scope="row">' + usuarios.content[i].username + '</th>' +
                        '<th scope="row">' + usuarios.content[i].roles[usuarios.content[i].roles.length - 1] + '</th>' +
                        '<td>' +
                        '<button type="button" class="btn btn-secondary btn-sm" onclick="editarPerfil(' + sim + usuarios.content[i].username + sim + ')">Cambiar rol</button>' +
                        '<button type="button" class="btn btn-primary btn-sm" onclick="cuentaActiva(' + sim + usuarios.content[i].username + sim + ',false)" style="margin-left:1%">Suspender cuenta</button>' +
                        '<button type="button" class="btn btn-danger btn-sm" onclick="eliminarCuenta(' + sim + usuarios.content[i].username + sim + ',' + tipo + ')" style="margin-left:1%">Eliminar Cuenta</button>' +
                        '</td>' +
                        '</tr>'
                } else {
                    document.getElementById('usuarios').innerHTML += '<tr>' +
                        '<th scope="row">' + usuarios.content[i].username + '</th>' +
                        '<th scope="row">' + usuarios.content[i].roles[usuarios.content[i].roles.length - 1] + '</th>' +
                        '<td>' +
                        '<button type="button" class="btn btn-secondary btn-sm" onclick="editarPerfil(' + sim + usuarios.content[i].username + sim + ')">Cambiar rol</button>' +
                        '<button type="button" class="btn btn-primary btn-sm" onclick="cuentaActiva(' + sim + usuarios.content[i].username + sim + ',true)" style="margin-left:1%">Activar cuenta</button>' +
                        '<button type="button" class="btn btn-danger btn-sm" onclick="eliminarCuenta(' + sim + usuarios.content[i].username + sim + ',' + tipo + ')" style="margin-left:1%">Eliminar Cuenta</button>' +
                        '</td>' +
                        '</tr>'
                }


            }
            pagesUsers(usuarios);
        }
    }
}

function pagesUsers(post) {
    document.getElementById('pagesUsers').innerHTML = '<li class="page-item">' +
        '<a class="page-link" href="#redactores" onclick="verRedactores(' + 0 + ')">&laquo;</a>' +
        '</li>'
    for (let i = 1; i <= post.totalPages; i++) {
        document.getElementById('pagesUsers').innerHTML += '<li class="page-item active">' +
            '<a class="page-link" href="#redactores" onclick="verRedactores(' + (i - 1) + ')">' + i + '</a>' +
            '</li>'
    }
    document.getElementById('pagesUsers').innerHTML += '<li class="page-item">' +
        '<a class="page-link" href="#redactores" onclick="verRedactores(' + (parseInt(post.totalPages - 1)) + ')">&raquo;</a></li>'
}

function eliminarMiPerfil(params) {
    if (confirm('¿Quieres borrar tu cuenta')) {
        eliminarCuenta(localStorage.getItem('user'), true)
    }
}
function eliminarCuenta(username, flag) {
    if (confirm('¿Quieres eliminar esta cuenta?')) {
        let peticion = new XMLHttpRequest;
        peticion.open("DELETE", url + "/users/" + username);
        peticion.setRequestHeader("Content-Type", "application/json");
        peticion.setRequestHeader("Authorization", localStorage.getItem('token'))
        peticion.send()
        peticion.onreadystatechange = function () {
            if (peticion.readyState == 4 && peticion.status == 204) {
                if (flag)
                    logout();
                else
                    getAllUsers(0);
            }
            if (peticion.readyState == 4 && peticion.status == 403) {
                alert("No tienes permisos para realizar esa acción")
            }
            if (peticion.readyState == 4 && peticion.status == 401) {
                alert("Necesitas tener una sesión activa")
            }
        }
    }

}

function editarPerfil(username) {

    let aux = "'" + username + "'";
    document.getElementById('modalAdmin').innerHTML = '<button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>' +
        '<button type="button" class="btn btn-primary" onclick="cambiarRol(' + aux + ')">Guardar Cambios</button>'
    $("#modalEdicion").modal();
}

function cuentaActiva(username, active) {
    if (confirm('¿Quieres modificar el estado de esta cuenta?')) {
        let peticion = new XMLHttpRequest;
        peticion.open("PUT", url + "/users/" + username + "?mod=active");
        let body = JSON.stringify({
            username: username,
            active: active
        })
        peticion.setRequestHeader("Content-Type", "application/json");
        peticion.setRequestHeader("Authorization", localStorage.getItem('token'))
        peticion.send(body)
        peticion.onreadystatechange = function (params) {
            if (peticion.readyState == 4 && peticion.status == 200) {
                getAllUsers(0);
            }
            if (peticion.readyState == 4 && peticion.status == 403) {
                alert("No tienes permisos para realizar esa acción")
            }
            if (peticion.readyState == 4 && peticion.status == 401) {
                alert("Necesitas tener una sesión activa")
            }
        }
    }

}

function cambiarRol(username) {
    let e = document.getElementById("roles");
    let option = e.options[e.selectedIndex].value;
    let body;
    switch (option) {
        case "1":
            body = JSON.stringify({
                username: username,
                roles: ["LECTOR"]
            })
            break;
        case "2":
            body = JSON.stringify({
                username: username,
                roles: ["LECTOR", "REDACTOR"]
            })
            break;
        case "3":
            body = JSON.stringify({
                username: username,
                roles: ["LECTOR", "REDACTOR", "MODERADOR"]
            })
            break;
        case "4":
            body = JSON.stringify({
                username: username,
                roles: ["LECTOR", "REDACTOR", "MODERADOR", "ADMIN"]
            })
            break;

    }

    let peticion = new XMLHttpRequest;
    peticion.open("PUT", url + "/users/" + username + "?mod=roles");
    peticion.setRequestHeader("Content-Type", "application/json");
    peticion.setRequestHeader("Authorization", localStorage.getItem('token'))
    peticion.send(body)
    peticion.onreadystatechange = function (params) {
        if (peticion.readyState == 4 && peticion.status == 200) {
            getAllUsers(0);
            $("#modalEdicion").modal('hide');

        }
        if (peticion.readyState == 4 && peticion.status == 403) {
            $("#modalEdicion").modal('hide');
            alert("No tienes permisos para realizar esa acción")
        }
        if (peticion.readyState == 4 && peticion.status == 401) {
            $("#modalEdicion").modal('hide');
            alert("Necesitas tener una sesión activa")
        }

    }
}