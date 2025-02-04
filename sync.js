const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 7070;
const filepath = path.join(__dirname, 'data.json');

function read(){
    return json.parse(fs.readFileSync (filepath,'utf-8'));
}
function write(){
    fs.writeFileSync(filepath, JSON.stringify(data));
}

//get data from data.json
function getdata(res){
    const data = read();
    sendresponse(res , 200 , data); 

}

function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
//post data from data.json
function post(res , body){
    const data = read();
    const bodydata = json.parse(body);
    const newpost = {
        id: data.length +1,
        title : bodydata.title,
        body : bodydata.body
    };
    data.push(newPost);
    writeData(data);
   sendResponse(res, 201, newPost);
}