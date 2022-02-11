
let user = {name: ''};
let connectedInterval = null;
let loadMessageInterval = null;
let selectedUser = null
let selectedVisibility = 'message';

const LI_TODOS =    `<li onclick="selectUserSendMessage(this)">
                        <i>
                            <ion-icon name="people-sharp"></ion-icon>                
                            <p>Todos</p>
                        </i>
                        <ion-icon class="check" name="checkmark-sharp"></ion-icon>    
                    </li>`;

let lastMessage = null;

function loginUser(){
    user.name = document.querySelector('.login input').value;
    const promise = axios.post('https://mock-api.driven.com.br/api/v4/uol/participants', user);
    loading();
    promise.catch(userError);
    promise.then(verifyUser);
}

function verifyUser(answer){
    if(answer.status == 200) {
        loadMessage();
        loadUsers();
        setTimeout(hideLogin, 100);        
        connectedInterval = setInterval(keepConnected, 5000);
        loadMessageInterval = setInterval(loadMessage, 3000);
        setInterval(loadUsers, 3000);
    }
}


function userError(answer){
    const inputLogin = document.querySelector('.login input');
    inputLogin.setAttribute('placeholder','Usuário já existe');
    inputLogin.value = '';
    inputLogin.classList.add('erro');
    loading();
}


function keepConnected(){
    const repositorio = 'https://mock-api.driven.com.br/api/v4/uol/status';
    const promise = axios.post(repositorio, user);
}


function hideLogin(){
    document.querySelector('.loginScreen').classList.add('hide');
}

function loading(){
    const loginScreen = document.querySelector('.login');
    const loadingScreen = document.querySelector('.loading');

    loginScreen.classList.toggle('hide');
    loadingScreen.classList.toggle('hide');
}

function loadMessage(){
    const promise = axios.get('https://mock-api.driven.com.br/api/v4/uol/messages');
    promise.then(showMessage);
}


function loadUsers(){
    const promise = axios.get('https://mock-api.driven.com.br/api/v4/uol/participants');
    promise.then((userList)=>{
        const users = userList.data;
        const userArea = document.querySelector('.contacts ul');
        userArea.innerHTML = LI_TODOS;
        opcTodos = userArea.querySelector('.check');
        if(selectedUser === 'Todos') {
            opcTodos.classList.add('selected');
        }
        let find = false;
        for(let i = 0; i<users.length; i++){
            let toCheck = '';
            if(users[i].name === selectedUser){
                toCheck = 'selected';
                find = true;
            }
                
            userArea.innerHTML += 
                `<li onclick="selectUserSendMessage(this)">
                    <i>
                        <ion-icon name="people-sharp"></ion-icon>                
                        <p>${users[i].name}</p>
                    </i>
                    <ion-icon class="check ${toCheck}" name="checkmark-sharp"></ion-icon>    
                </li>`
        }

        if(!find){
            opcTodos.classList.add('selected');
            selectedUser = 'Todos';
        }

    });
}

function showMessage(answer){
    const messageList = answer.data;
    const mesageArea = document.querySelector('main');
    let auxMessageList='';
    for(let i = 0; i < messageList.length; i++){
        //console.log('carregando...' + i)
        const objMsg = messageList[i];   
        auxMessageList += assemblemessage(objMsg);
    }
    
    mesageArea.innerHTML = auxMessageList;
    const recentMessage = document.querySelector('main article:last-child');
    recentMessage.scrollIntoView();    
}

function assemblemessage(objMsg){
    let message = '';
    if(objMsg.type === 'message'){
        message = `<article>
                        <time>(${objMsg.time})</time>
                        <p>
                            <strong id="fromUser">${objMsg.from}</strong>
                            <p>para</p>
                            <strong id="toUser">${objMsg.to}</strong>
                            <p>: ${objMsg.text}</p>
                        </p>
                    </article>`;
    }

    else if(objMsg.type === 'status') {
        message = `<article class="in-out-msg">
                        <time>(${objMsg.time})</time>
                        <p>
                            <strong id="fromUser">${objMsg.from}</strong>
                            <p>${objMsg.text}</p>
                        </p>
                    </article>`;
    }

    else {
        message = `<article class="reserved-msg">
                        <time>(${objMsg.time})</time>
                        <p>
                            <strong id="fromUser">${objMsg.from}</strong>
                            <p>para</p>
                            <strong id="toUser">${objMsg.to}</strong>
                            <p>: ${objMsg.text}</p>
                        </p>
                    </article>`;
    }
    return message;
}

function sendMessage(){
    const labelMessage = document.querySelector('footer input');
    
    const message = {
        from: user.name,
        to: selectedUser,
        text: labelMessage.value,
        type: selectedVisibility
    }

    labelMessage.value = '';

    const promise = axios.post('https://mock-api.driven.com.br/api/v4/uol/messages', message);
    promise.then(()=>{
        clearInterval(loadMessageInterval);
        loadMessage();
        loadMessageInterval = setInterval(loadMessage, 3000);
    });
    promise.catch(()=>{window.location.reload});
}


function sidebar(status){
    const sidebarBG = document.querySelector('.sidebar');
    const background = document.querySelector('.sidebar .background');
    const nav = document.querySelector('nav');
    if(status){
        sidebarBG.classList.remove('hide');
        setTimeout(() => {
            background.classList.add('background-expand');
            nav.classList.add('nav-expand');
        }, 100);

    } else {
        background.classList.remove('background-expand');
        nav.classList.remove('nav-expand');
        setTimeout(() => {
            sidebarBG.classList.add('hide');
        }, 100);
    }
}



function selectUserSendMessage(opcUser){
    let checkIcon = document.querySelector('.contacts li .check.selected');
    if(!checkIcon){
        const opcTodos = document.querySelector('.contacts li ion-icon:first-child');
        opcTodos.classList.add('selected');
    }
    else {
        checkIcon.classList.remove('selected');
    }
    checkIcon = opcUser.querySelector('.check');
    checkIcon.classList.add('selected');
    selectedUser = opcUser.querySelector('p').innerHTML;
    console.log(selectedUser);
    console.log(opcUser);
    conflictVerify();
}


function messageVisibility(opc){
    selectedVisibility = opc.id;
    const checkIcon = document.querySelector('.visibility li .check.selected');
    checkIcon.classList.remove('selected');
    opc.querySelector('.check').classList.add('selected');
    conflictVerify();
}


function conflictVerify(){
    const publicVisibility = document.querySelector('#message .check');
    const privateVisibility = document.querySelector('#private_message .check');
    if(selectedUser === 'Todos'){
        publicVisibility.classList.add('selected');
        privateVisibility.classList.remove('selected')
        selectedVisibility = 'message'
    }
}