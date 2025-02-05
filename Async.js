const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const PORT = 5001;
const filepath = path.join(__dirname, 'data.json');

async function readData() {
    try {
        const data = await fs.readFile(filepath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeData(data) {
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
}

function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

//get method
async function getData(res) {
    const data = await readData();
    sendResponse(res, 200, data);
}

//post method
async function postData(res, body) {
    const data = await readData();
    const bodyData = JSON.parse(body);
    const newPost = {
        id: data.length ? data[data.length - 1].id + 1 : 1,
        title: bodyData.title,
        body: bodyData.body
    };
    data.push(newPost);
    await writeData(data);
    sendResponse(res, 201, newPost);
}

//put method
async function updateData(res, id, body) {
    let data = await readData();
    const bodyData = JSON.parse(body);
    const index = data.findIndex(post => post.id === id);

    if (index !== -1) {
        data[index].title = bodyData.title;
        data[index].body = bodyData.body;
        await writeData(data);
        sendResponse(res, 200, data[index]);
    } else {
        const newPost = { id, title: bodyData.title, body: bodyData.body };
        data.push(newPost);
        await writeData(data);
        sendResponse(res, 201, newPost);
    }
}

//patch method
async function patchData(res, id, body) {
    let data = await readData();
    const bodyData = JSON.parse(body);
    const index = data.findIndex(post => post.id === id);

    if (index !== -1) {
        data[index] = { ...data[index], ...bodyData };
        await writeData(data);
        sendResponse(res, 200, data[index]);
    } else {
        sendResponse(res, 404, { message: 'Post not found' });
    }
}

//delete method
async function deleteData(res, id) {
    let data = await readData();
    const newData = data.filter(post => post.id !== id);
    if (newData.length === data.length) {
        sendResponse(res, 404, { message: 'Post not found' });
    } else {
        await writeData(newData);
        sendResponse(res, 200, { message: `Post with id ${id} deleted` });
    }
}

//server 
const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/posts') {
        await getData(res);
    } else if (req.method === 'POST' && req.url === '/posts') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => await postData(res, body));
    } else if (req.method === 'PUT' && req.url.startsWith('/posts/')) {
        const id = parseInt(req.url.split('/')[2]);
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => await updateData(res, id, body));
    } else if (req.method === 'PATCH' && req.url.startsWith('/posts/')) {
        const id = parseInt(req.url.split('/')[2]);
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => await patchData(res, id, body));
    } else if (req.method === 'DELETE' && req.url.startsWith('/posts/')) {
        const id = parseInt(req.url.split('/')[2]);
        await deleteData(res, id);
    } else {
        sendResponse(res, 404, { message: 'Route not found' });
    }
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
