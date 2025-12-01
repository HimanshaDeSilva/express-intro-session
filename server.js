// Import core modules
const http = require("http");
const path = require("path");
const fs = require("fs");
const fsPromise = require("fs").promises;

// Import custom modules
const logEvents = require("./logEvents");
const EventEmitter = require("events");

// Custom Event Emitter
class Emitter extends EventEmitter {}
const myEmitter = new Emitter();
 myEmitter.on('log', (msg,fileName)=> logEvents(msg, fileName));

// Server configuration
const PORT = process.env.PORT || 3500; // because we have to this somewhere or 35000

const serveFile = async (filePath, contentType, response) =>{
    try{
        const rawdata = await fsPromise.readFile(
            filePath,
            !contentType.includes('image') ?'utf-8' : '');
        const data = contentType === 'application/json'
            ? JSON.parse(rawdata) : rawdata ;
        response.writeHead(
            filePath.includes('404.html') ? 404 : 200 , 
            {'Content-Type':contentType}
        );
        response.end(
            contentType === 'application/json' ? JSON.stringify(data) : data
        );
    }catch(err){
        console.log(err);
        myEmitter.emit('log', `${err.name} : ${err.message}`, 'errLog.txt'); 
        response.statusCode = 500;
        response.end();
    }
}
//Create minimal server
const server = http.createServer( (req,res) => {
    console.log(req.url,req.method);
     myEmitter.emit('log', `${req.url}\t${req.method}`, 'reqLog.txt'); 

    const extension = path.extname(req.url);
    
    // Define MIME types for Content-Type
    let contentType;
    switch (extension) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.txt':
            contentType = 'text/plain';
            break;
        default:
            contentType = 'text/html';
    }

    let filePath =
    contentType === 'text/html' && req.url === '/'
            ? path.join(__dirname, 'views', 'index.html')
            : contentType === 'text/html' && req.url.slice(-1) === '/'
                ? path.join(__dirname, 'views', req.url, 'index.html')
                : contentType === 'text/html'
                    ? path.join(__dirname, 'views', req.url)
                    : path.join(__dirname, req.url);

    // makes .html extension not required in the browser
    if(!extension && req.url.slice(-1) !== '/') filePath += '.html';

    const fileExists = fs.existsSync(filePath);
    if(fileExists) {
        serveFile(filePath, contentType, res);
    }else{
        switch(path.parse(filePath).base){
            case 'old-page.html' : 
                res.writeHead(301, {'Location': '/new-page.html'});
                res.end();
                break;
            case 'www-page.html':
                res.writeHead(301, { 'Location': '/' });
                res.end();
                break;
            default:
                serveFile(path.join(__dirname, 'views', '404.html'), 'text/html', res); 

        }
    }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// 1st inefficient approach : If–else
/*const server = http.createServer((req, res) => {
  console.log(req.url, req.method);

  let filePath;
  if (req.url === "/" || req.url === "index.html") {
    res.statusCode = 200;
    res.setHeader("Conent-Type", "text/html");
    filePath = filePath.join(__dirname, "views", "index.html");
    fs.readFile(filePath, "utf-8", (err, data) => {
      res.end(data);
    });
  }
}); */

// 2nd inefficient approach : If–else
/*const server = http.createServer((req, res) => {
  console.log(req.url, req.method);

  let filePath;
    switch(req.url){
        case '/':
         res.statusCode = 200;
         filePath = filePath.join(__dirname, "views", "index.html");
         fs.readFile(filePath, "utf-8", (err, data) => {
      res.end(data);
    });
    break;
}});*/



