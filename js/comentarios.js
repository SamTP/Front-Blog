var url = "http://localhost:8080";

function loadCom(page) {
    let id = localStorage.getItem('aux');
    let peticion = new XMLHttpRequest;
    peticion.open("GET", url + "/posts/" + id + "/comments?size=4&page=" + page);
    peticion.send();
    peticion.onreadystatechange = function (params) {
        if (peticion.readyState == 4 && peticion.status == 200) {
            document.getElementById('comentarios').innerHTML = '';
            let respuesta = JSON.parse(peticion.responseText);
            let comments = respuesta.content;
            for (let i = 0; i < comments.length; i++) {
                document.getElementById('comentarios').innerHTML += '<small>' + comments[i].autor + '</small>' +
                    ', <small>' + comments[i].fecha + '</small><br>' + comments[i].cuerpo + '<br>' + '<small><a href="#cuerpo" onclick="eliminarCom(null,' + comments[i].identificador + ')">Eliminar</a></small><br>'
            }
            setTimeout(pagesComments(respuesta, true), 500);
        }
    }
}

function nuevoCom(params) {
    let user = localStorage.getItem('user');
    let d = new Date();
    let fecha = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDay();
    let cuerpo = document.getElementById('cuerpo').value;
    let post = localStorage.getItem('aux');
    let body = JSON.stringify({
        autor: user,
        fecha: fecha,
        cuerpo: cuerpo,
        post: post
    })

    let peticion = new XMLHttpRequest;
    peticion.open("POST", url + "/posts/" + post + "/comments");
    peticion.setRequestHeader("Content-Type", "application/json");
    peticion.setRequestHeader("Authorization", localStorage.getItem('token'))
    peticion.send(body)

    peticion.onreadystatechange = function () {
        if (peticion.readyState == 4 && peticion.status == 201) {
            setTimeout(getPublicacion(), 500)
            setTimeout(loadCom(0), 500);
            document.getElementById('cuerpo').value = '';
        }
        if (peticion.readyState == 4 && peticion.status == 403) {
            alert("No tienes permisos para realizar esa acción")
        }
        if (peticion.readyState == 4 && peticion.status == 401) {
            alert("Necesitas tener una sesión activa")
        }
    }


}

function eliminarCom(post, idC) {
    let aux = true;
    if (post == null)
        post = localStorage.getItem('aux');
    else
        aux = false;
    let peticion = new XMLHttpRequest;
    peticion.open("DELETE", url + "/posts/" + post + "/comments/" + idC);
    peticion.setRequestHeader("Content-Type", "application/json");
    peticion.setRequestHeader("Authorization", localStorage.getItem('token'))
    peticion.send()

    peticion.onreadystatechange = function () {
        if (peticion.readyState == 4 && peticion.status == 204) {
            if (aux) {
                loadCom(0);
                document.getElementById('cuerpo').value = '';
            } else {
                getComments(0);
            }

        }
        if (peticion.readyState == 4 && peticion.status == 403) {
            alert("No tienes permisos para realizar esa acción")
        }
        if (peticion.readyState == 4 && peticion.status == 401) {
            alert("Necesitas tener una sesión activa")
        }
    }
}
