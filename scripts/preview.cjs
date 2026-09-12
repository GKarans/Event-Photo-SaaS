const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const port = Number(process.env.PORT || 5604);
http.createServer((request,response) => {
    let pathname;
    try { pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname); }
    catch { response.writeHead(400);response.end();return; }
    if(pathname==='/' || pathname.startsWith('/event/') || pathname.startsWith('/auth/')) pathname='/index.html';
    const file=path.resolve(root,'.'+pathname);
    const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.wasm':'application/wasm'};
    const type=types[path.extname(file)];
    if(!file.startsWith(root+path.sep) || !type || /[\\/](node_modules|supabase|tests|scripts|\.git)[\\/]/.test(file)) {
        response.writeHead(404);response.end();return;
    }
    fs.readFile(file,(error,data)=>{
        if(error){response.writeHead(404);response.end();return;}
        response.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});response.end(data);
    });
}).listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}`));
