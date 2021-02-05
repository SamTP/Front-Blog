var url = 'http://localhost:8080';

function getPublicaciones(page) {

    let peticion = new XMLHttpRequest;
    document.getElementById('pages').innerHTML = '';
    peticion.open("GET", url + "/posts?page=" + page);
    peticion.send();
    let temp = "'Roboto'";
    peticion.onreadystatechange = function () {
        if (peticion.status == 200 && peticion.readyState == 4) {
            let respuesta = peticion.responseText;
            let post = JSON.parse(respuesta).content;
            document.getElementById('pages').innerHTML += '<li class="page-item">' +
                '<a class="page-link" href="#" onclick="getPublicaciones(' + 0 + ')">&laquo;</a>' +
                '</li>'
            for (let i = 1; i <= JSON.parse(respuesta).totalPages; i++) {
                document.getElementById('pages').innerHTML += '<li class="page-item active">' +
                    '<a class="page-link" href="#" onclick="getPublicaciones(' + (i - 1) + ')">' + i + '</a>' +
                    '</li>'
            }
            document.getElementById('pages').innerHTML += '<li class="page-item">' +
                '<a class="page-link" href="#" onclick="getPublicaciones(' + (parseInt(JSON.parse(respuesta).totalPages) - 1) + ')">&raquo;</a>' +
                '</li>'
            if (post.length < 1) {
                console.log('No hay publicaciones');
            } else {
                document.getElementById('posts').innerHTML = '';
                for (let i = 0; i < post.length; i++) {
                    document.getElementById('posts').innerHTML += '<div class="col-4">' +
                        '<div class="card" style="width: 100%;margin-top:1%">' +
                        '<div class="card-body">' +
                        '<a href="#" onclick="verPublicacion(' + post[i].identificador + ',true)">' +
                        '<h5 class="card-title">' + post[i].titulo + '</h5>' +
                        '</a>' +
                        '<smal>Autor: ' + post[i].autor + '</smal>' +
                        '<p class="card-text" style="font-family:' + temp + ';font-size: 14px;">' +
                        post[i].resumen +
                        '</p>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                }
            }
        }

    }

}

function getPublicacion() {
    let peticion = new XMLHttpRequest;
    id = localStorage.getItem('aux');
    peticion.open("GET", url + "/posts/" + id);
    peticion.send();
    let temp = "'Roboto'";

    peticion.onreadystatechange = function (params) {
        if (peticion.readyState == 4 && peticion.status == 200) {
            let respuesta = JSON.parse(peticion.responseText);
            document.getElementById('btnEliminar').innerHTML = '<button class="btn btn-danger btn-sm" onclick="rmvPost(' + respuesta.identificador + ',true)">Eliminar Post</button>'
            document.getElementById('publicacion').innerHTML = '<div class="card-body">' +
                '<h5 class="card-title">' + respuesta.titulo + '</h5>' +
                '<smal>Autor: ' + respuesta.autor + '</smal> <br>' +
                '<smal>Fecha: ' + respuesta.fecha + '</smal>' +
                '<p id="palabras">Palabras Clave: </p>' +
                '<p class="card-text" style="font-family: ' + temp + ';font-size:15px;">' +
                respuesta.resumen +
                '<br>' +
                '</p>' +
                '<p class="card-text" style="text-aling:justify;font-family: ' + temp + ';font-size:20px;">' +
                respuesta.cuerpo +
                '</p>' +
                '<h6 class="card-subtitle">Comentarios</h6>' +
                '<p style="font-family: ' + temp + ';font-size:15px;" id="comentarios">' +

                '</p>' +
                '<div style="margin-left: 40%;margin-top:5%;">' +
                '<ul class="pagination pagination-sm" id="pagesComments">' +
                '</ul>' +
                '</div>' +
                '</div>'
            for (let i = 0; i < respuesta.palabrasClave.length; i++)
                document.getElementById('palabras').innerHTML += respuesta.palabrasClave[i] + ' '

        }
    }

}

function verPublicacion(id, flag) {
    localStorage.setItem('aux', id);
    if (flag)
        window.location.replace("./views/publicacion.html")
    else
        window.location.replace("../views/publicacion.html")

}


function nuevaPublicacion(params) {
    let d = new Date();
    let fecha = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDay();
    let titulo = document.getElementById('titulo').value;
    let resumen = document.getElementById('resumen').value;
    let cuerpo = document.getElementById('cuerpo').value;
    let autor = localStorage.getItem('user');
    let pClave = document.getElementById('palabras').innerHTML;
    let words = pClave.split(',')
    words.splice((words.length - 1), 1)

    let body = JSON.stringify({
        autor: autor,
        titulo: titulo,
        resumen: resumen,
        cuerpo: cuerpo,
        palabrasClave: words,
        fecha: fecha
    })

    let peticion = new XMLHttpRequest;
    peticion.open("POST", url + "/posts");
    peticion.setRequestHeader("Content-Type", "application/json");
    peticion.setRequestHeader("Authorization", localStorage.getItem('token'))
    peticion.send(body)

    peticion.onreadystatechange = function (params) {
        if (peticion.status == 201 && peticion.readyState == 4) {
            let uri = peticion.responseText.split('/');
            let id = uri[4].split('"');
            localStorage.setItem('aux', id[0]);
            window.location.replace('../views/publicacion.html');

        }
        if (peticion.readyState == 4 && peticion.status == 403) {
            alert("No tienes permisos para realizar esa acción")
        }
        if (peticion.readyState == 4 && peticion.status == 401) {
            alert("Necesitas tener una sesión activa")
        }
    }


}

function editarPost(idPost) {
    let titulo = document.getElementById('titulo').value;
    let cuerpo = document.getElementById('cuerpo').value;
    let resumen = document.getElementById('resumen').value;
    let body = JSON.stringify({
        titulo: titulo,
        cuerpo: cuerpo,
        resumen: resumen
    });

    let peticion = new XMLHttpRequest;

    peticion.open("PUT", url + "/posts/" + idPost);
    peticion.setRequestHeader("Content-Type", "application/json");
    peticion.setRequestHeader("Authorization", localStorage.getItem('token'))
    peticion.send(body);
    peticion.onreadystatechange = function (params) {
        if (peticion.status == 200 && peticion.readyState == 4) {
            getMisPost(0);
            $("#modalPost").modal('hide');
        }
    }

}

function rmvPost(idPost, flag) {

    if (confirm('¿Quieres eliminar esta publicación?')) {
        let peticion = new XMLHttpRequest;

        peticion.open("DELETE", url + "/posts/" + idPost);
        peticion.setRequestHeader("Content-Type", "application/json");
        peticion.setRequestHeader("Authorization", localStorage.getItem('token'))
        peticion.send();
        peticion.onreadystatechange = function (params) {
            if (peticion.readyState == 4 && peticion.status == 204) {
                if (flag)
                    inicio();
                else
                    getMisPost(0);
            }
        }
    }

}