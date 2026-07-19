const Busboy = require("busboy");

exports.handler = async function(event) {

    if(event.httpMethod !== "POST") {

        return {
            statusCode:405,
            body:"Method not allowed"
        };

    }

    try {

        const file = await parseMultipart(event);

        if(!file || !file.filename || !file.buffer){
            throw new Error("Faila saturs nav nolasīts");
        }

        const token = await getDropboxAccessToken();
        const result = await uploadDropbox(token, file);

        return {
            statusCode:200,
            body:JSON.stringify({
                success:true,
                result
            })
        };

    }
    catch(error){

        console.error(error);

        return {
            statusCode:500,
            body:JSON.stringify({
                error:error.message
            })
        };

    }

};

function parseMultipart(event){

    return new Promise((resolve,reject)=>{

        const busboy = Busboy({
            headers:event.headers
        });

        let buffer = Buffer.alloc(0);
        let filename = "";

        busboy.on("file", (field,file,info)=>{

            filename = info.filename || filename;
            const chunks = [];

            file.on("data", chunk => chunks.push(Buffer.from(chunk)));
            file.on("end", ()=>{
                buffer = Buffer.concat(chunks);
            });

        });

        busboy.on("field", (name,value)=>{
            if(name === "filename"){
                filename = value;
            }
        });

        busboy.on("finish", ()=>{
            resolve({buffer, filename});
        });

        busboy.on("error", reject);

        const body = event.body
            ? (event.isBase64Encoded ? Buffer.from(event.body, "base64") : Buffer.from(event.body))
            : Buffer.alloc(0);

        busboy.end(body);

    });

}

async function getDropboxAccessToken(){

    const required = [
        process.env.DROPBOX_REFRESH_TOKEN,
        process.env.DROPBOX_APP_KEY,
        process.env.DROPBOX_APP_SECRET
    ];

    if(required.some(value => !value)){
        throw new Error("Dropbox konfigurācija trūkst. Pārbaudi Netlify env mainīgos.");
    }

    const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
        method:"POST",
        headers:{
            "Content-Type":"application/x-www-form-urlencoded"
        },
        body:new URLSearchParams({
            refresh_token:process.env.DROPBOX_REFRESH_TOKEN,
            grant_type:"refresh_token",
            client_id:process.env.DROPBOX_APP_KEY,
            client_secret:process.env.DROPBOX_APP_SECRET
        })
    });

    if(!response.ok){
        const errorText = await response.text();
        throw new Error(`Dropbox token kļūda: ${errorText || response.status}`);
    }

    const data = await response.json();

    if(!data.access_token){
        throw new Error("Dropbox token kļūda");
    }

    return data.access_token;

}

async function uploadDropbox(token,file){

    let folder;

    if(file.filename.endsWith(".mp4")){
        folder = "Videos";
    }
    else{
        folder = "Photos";
    }

    const path = `/WeddingCamera/${folder}/${file.filename}`;

    if(file.buffer.length < 8 * 1024 * 1024){

        const response = await fetch("https://content.dropboxapi.com/2/files/upload", {
            method:"POST",
            headers:{
                Authorization:`Bearer ${token}`,
                "Content-Type":"application/octet-stream",
                "Dropbox-API-Arg":JSON.stringify({
                    path,
                    mode:"add",
                    autorename:true
                })
            },
            body:file.buffer
        });

        if(!response.ok){
            const errorText = await response.text();
            throw new Error(`Dropbox upload kļūda: ${errorText || response.status}`);
        }

        return await response.json();
    }

    const CHUNK_SIZE = 8 * 1024 * 1024;
    const firstChunk = file.buffer.slice(0, CHUNK_SIZE);

    const start = await fetch("https://content.dropboxapi.com/2/files/upload_session/start", {
        method:"POST",
        headers:{
            Authorization:`Bearer ${token}`,
            "Content-Type":"application/octet-stream",
            "Dropbox-API-Arg":JSON.stringify({close:false})
        },
        body:firstChunk
    });

    if(!start.ok){
        const errorText = await start.text();
        throw new Error(`Dropbox start kļūda: ${errorText || start.status}`);
    }

    const startData = await start.json();

    if(!startData.session_id){
        throw new Error("Dropbox upload session neizdevās");
    }

    let offset = firstChunk.length;

    while(offset < file.buffer.length){

        const chunk = file.buffer.slice(offset, Math.min(offset + CHUNK_SIZE, file.buffer.length));
        const isLast = offset + chunk.length >= file.buffer.length;

        if(isLast){

            const finish = await fetch("https://content.dropboxapi.com/2/files/upload_session/finish", {
                method:"POST",
                headers:{
                    Authorization:`Bearer ${token}`,
                    "Content-Type":"application/octet-stream",
                    "Dropbox-API-Arg":JSON.stringify({
                        cursor:{
                            session_id:startData.session_id,
                            offset
                        },
                        commit:{
                            path,
                            mode:"add",
                            autorename:true
                        }
                    })
                },
                body:chunk
            });

            if(!finish.ok){
                const errorText = await finish.text();
                throw new Error(`Dropbox finish kļūda: ${errorText || finish.status}`);
            }

            return await finish.json();
        }

        const append = await fetch("https://content.dropboxapi.com/2/files/upload_session/append_v2", {
            method:"POST",
            headers:{
                Authorization:`Bearer ${token}`,
                "Content-Type":"application/octet-stream",
                "Dropbox-API-Arg":JSON.stringify({
                    cursor:{
                        session_id:startData.session_id,
                        offset
                    }
                })
            },
            body:chunk
        });

        if(!append.ok){
            const errorText = await append.text();
            throw new Error(`Dropbox append kļūda: ${errorText || append.status}`);
        }

        offset += chunk.length;
    }

    throw new Error("Dropbox upload neizdevās");

}