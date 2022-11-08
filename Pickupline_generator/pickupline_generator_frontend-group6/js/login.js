// login
const emailLogIn = document.querySelector('#emailLogIn');
const passwordLogIn = document.querySelector('#passwordLogIn');
const btnLogIn = document.querySelector('#btnLogIn');


const ls = window.localStorage;


const baseUrl = `https://wad-pupldb-group6.azurewebsites.net`;


//Login
btnLogIn.addEventListener('click', (e) => {
    const payload = {
        email: emailLogIn.value,
        password: passwordLogIn.value
    }

    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(payload)
    }

    fetch(`${baseUrl}/api/login`, fetchOptions)
        .then(response => { 
            if(response.ok) {
                window.location.replace('submit-page-member.html');
                
            }else {
            alert('401:Invalid email or password')
            }
        })
})