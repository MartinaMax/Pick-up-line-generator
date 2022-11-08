// member 
const btnLogOut = document.querySelector('#btnLogOut');
const pickuplineSubmit = document.querySelector('#pickuplineSubmit');
const btnSubmit = document.querySelector('#btnSubmit');
const pickuplineText = document.querySelector('#pickuplineText');
const btnUpdate = document.querySelector('#btnUpdate');
const btnDelete = document.querySelector('#btnDelete');
const pickuplineID = document.querySelector('#pickuplineID');


const ls = window.localStorage;


const baseUrl = `https://wad-pupldb-group6.azurewebsites.net`;


window.addEventListener('DOMContentLoaded', (e) => {
    let account;
    if (ls.getItem('account')) {
        account = JSON.parse(ls.getItem('account'));
    }

    username.innerHTML = account.email;
})


//LogOut
btnLogOut.addEventListener('click', (e) => {
    ls.removeItem('account');

    window.location.replace('login.html');
})



//POST
btnSubmit.addEventListener('click', (e) => {
    const payload = {
        pickuplinequote: pickuplineSubmit.value
    }

    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(payload)
    }

    if (ls.getItem('token')) {
        fetchOptions.headers['x-authentication-token'] = ls.getItem('token');
    }

    fetch(`${baseUrl}/api/pickuplines`, fetchOptions)
    .then(response => response.json())
    .then(data => {
        alert(`Pickup line added: ${JSON.stringify(data)}`);
    })

})


// PUT
btnUpdate.addEventListener('click', (e) => {
    const payload = {
        pickuplinequote: pickuplineText.value
    }

    const fetchOptions = {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(payload)
    }

    if (ls.getItem('token')) {
        fetchOptions.headers['x-authentication-token'] = ls.getItem('token');
    }

    let value = document.getElementById("pickuplineID").value;
    
    fetch(`${baseUrl}/api/pickuplines/${value}`, fetchOptions)
    .then(response => response.json())
    .then(data => {
        alert(`Pickup line updated: ${JSON.stringify(data)}`);
    })

})



//DELETE
btnDelete.addEventListener('click', (e) => {
    const payload = {
        pickuplineid: pickuplineID.value
    }

    const fetchOptions = {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(payload)
    }

    if (ls.getItem('token')) {
        fetchOptions.headers['x-authentication-token'] = ls.getItem('token');
    }

    let value = document.getElementById("pickuplineID").value;
    
    fetch(`${baseUrl}/api/pickuplines/${value}`, fetchOptions)
    .then(response => response.json())
    .then(data => {
        alert(`Pickup line deleted: ${JSON.stringify(data)}`);
    })

})