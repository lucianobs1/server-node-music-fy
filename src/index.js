const express = require('express');
const { v4: uuid } = require('uuid');

const app = express();

const users = [];

function verifyIfUserExists(request, response, next){

    const { username } = request.headers;

    const user = users.find(user => user.username === username);

    if(!user){
        return response.status(404).json({ error: 'middleware user not exists' });
    }

    request.user = user;

    return next();
}

app.get('/users', (request, response) => {
    if(users.length == 0){
        return response.json({ users: 'Empty users' });
    }

    return response.status(201).json(users);
});

app.post('/users', (request, response) => {
    const { name, username } = request.body;

    const userAlreadyExists = users.some(user => user.username == username);

    if(userAlreadyExists){
        return response.status(404).json({ error: 'username already exists '});
    }

    const user = {
        id: uuid(),
        name,
        username,
        pro: false,
        created_at: new Date(),
        playList: []
    }

    users.push(user);

    return response.json({ success: 'success on create account' });
});

app.put('/users/:id', verifyIfUserExists, (request, response) => {

    const { user } = request;
    const { name } = request.body;

    user.name = name;

    return response.json(user);
});

app.delete('/users/:id', verifyIfUserExists, (request, response) => {

    const { id } = request.params;
    const { user } = request;

    if(user.id !== id){
        return response.status(400).json({ error: 'Any error ocurred, user data conflict'});
    }

    const userIndex = users.findIndex(user => user.id === id);

    if(userIndex < 0){
        return response.status(404).json({ error: 'user does not exists '});
    }

    users.splice(userIndex,1);

    return response.status(200).json({ success: 'success on delete user' });

});

app.patch('/users/:id/activepro', verifyIfUserExists, (request, response) => {
    const { id } = request.params;
        
    const user = users.find(user => user.id === id);

    console.log(user);

    if(!user){
        return response.status(404).json({ error: 'user does not exists'});
    }

    user.pro = true;

    return response.status(200).json({ success: 'success on active pro mode'});

})

app.get('/music', verifyIfUserExists, (request, response) => {
    const { user } = request;

    return response.json(user.playList);
});

app.post('/music', verifyIfUserExists, (request, response) => {
    
    const { user } = request;
    const { band, musicName } = request.body;

    if(user.pro){

        const song = {
            id: uuid(),
            band,
            musicName
        }

        user.playList.push(song);
        return response.status(201).json({ success: 'success on add music'});
    }
    else if(!user.pro && user.playList.length < 5){

        const song = {
            id: uuid(),
            band,
            musicName
        }

        user.playList.push(song);

        return response.status(201).json({ success: 'success on add music'});
    }
    else{
        return response.status(401).json({ error: 'Active pro mode to add more musics' });
    }
});

app.delete('/music/:id', verifyIfUserExists, (request, response) => {
    const { user } = request;
    const { id } = request.params;

    const findMusicIndex = user.playList.findIndex(music => music.id === id);

    if(findMusicIndex < 0){
        return response.json({ error: 'any error ocurred or song does not exists' });
    }

    user.playList.splice(findMusicIndex, 1);

    return response.status(201).json({ sucess: 'success on delete music '});
});


module.exports =  app;