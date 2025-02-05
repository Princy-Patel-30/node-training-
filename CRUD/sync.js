const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 5000;
const filepath = path.join(__dirname, 'data.json');

function readData() {
    try {
        return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    } catch (error) {
        return [];
    }
}

function writeData(data) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

//get method
function getData(res) {
    const data = readData();
    sendResponse(res, 200, data);
}

//post method
function postData(res, body) {
    const data = readData();
    const bodyData = JSON.parse(body);
    const newPost = {
        id: data.length ? data[data.length - 1].id + 1 : 1,
        title: bodyData.title,
        body: bodyData.body
    };
    data.push(newPost);
    writeData(data);
    sendResponse(res, 201, newPost);
}

//put method
function updateData(res, id, body) {
    let data = readData();
    const bodyData = JSON.parse(body);
    const index = data.findIndex(post => post.id === id);

    if (index !== -1) {
        data[index].title = bodyData.title;
        data[index].body = bodyData.body;
        writeData(data);
        sendResponse(res, 200, data[index]);
    } else {
        const newPost = { id, title: bodyData.title, body: bodyData.body };
        data.push(newPost);
        writeData(data);
        sendResponse(res, 201, newPost);
    }
}

//patch method
function patchData(res, id, body) {
    let data = readData();
    const bodyData = JSON.parse(body);
    const index = data.findIndex(post => post.id === id);

    if (index !== -1) {
        data[index] = { ...data[index], ...bodyData };
        writeData(data);
        sendResponse(res, 200, data[index]);
    } else {
        sendResponse(res, 404, { message: 'Post not found' });
    }
}

//delete method
function deleteData(res, id) {
    let data = readData();
    const newData = data.filter(post => post.id !== id);
    if (newData.length === data.length) {
        sendResponse(res, 404, { message: 'Post not found' });
    } else {
        writeData(newData);
        sendResponse(res, 200, { message: `Post with id ${id} deleted` });
    }
}

//server 
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/posts') {
        getData(res);
    } else if (req.method === 'POST' && req.url === '/posts') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => postData(res, body));
    } else if (req.method === 'PUT' && req.url.startsWith('/posts/')) {
        const id = parseInt(req.url.split('/')[2]);
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => updateData(res, id, body));
    } else if (req.method === 'PATCH' && req.url.startsWith('/posts/')) {
        const id = parseInt(req.url.split('/')[2]);
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => patchData(res, id, body));
    } else if (req.method === 'DELETE' && req.url.startsWith('/posts/')) {
        const id = parseInt(req.url.split('/')[2]);
        deleteData(res, id);
    } else {
        sendResponse(res, 404, { message: 'Route not found' });
    }
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
