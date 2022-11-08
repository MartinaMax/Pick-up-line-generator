// random generator
const btnGRandom = document.querySelector('#btnGRandom');
const btnGChoice = document.querySelector('#btnGChoice');


const ls = window.localStorage;


const baseUrl = `https://wad-pupldb-group6.azurewebsites.net`;


//GET random
btnGRandom.addEventListener('click', (e) => {
    pGRandom.classList.add('hide');
    const fetchOptions = {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        },
    }

    let divOutput = document.querySelector('#divOutput');

    fetch(`${baseUrl}/api/pickuplines/random`, fetchOptions) 
        .then(response => response.json())
        .then((data => {
            const obj = Object.values(data)
                .slice(Object.keys(data).indexOf('pickuplinequote'))
            divOutput.innerHTML = (obj);
                
        }))        
})
           

//GET random with themes 
btnGChoice.addEventListener('click', (e) => {
    pGChoice.classList.add('hide');
    const fetchOptions = {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        },
    }

    let divOutputR = document.querySelector('#divOutputR');
    let value = document.getElementById("themeSelect").value;

    fetch(`${baseUrl}/api/pickuplines?themename=${value}`, fetchOptions) 
        .then(response => response.json())
        .then((data => {
            const obj = Object.values(data)
                .slice(Object.keys(data).indexOf('pickuplinequote'))
            divOutputR.innerHTML = (obj);
                
        }))
})






