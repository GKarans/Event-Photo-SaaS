const Busboy = require("busboy");


exports.handler = async function(event) {

    if(event.httpMethod !== "POST") {

        return {
            statusCode:405,
            body:"Method not allowed"
        };

    }


    try {


        const file =
            await parseMultipart(event);



        const token =
            await getDropboxAccessToken();



        const result =
            await uploadDropbox(
                token,
                file
            );



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


let buffer;
let filename;



busboy.on(
"file",
(field,file,info)=>{


filename = info.filename;


const chunks=[];


file.on(
"data",
chunk=>chunks.push(chunk)
);


file.on(
"end",
()=>{

buffer =
Buffer.concat(chunks);


});


});




busboy.on(
"field",
(name,value)=>{


if(name==="filename"){

filename=value;

}


});





busboy.on(
"finish",
()=>{


resolve({

buffer,

filename

});


});



busboy.on(
"error",
reject
);



const body =
event.isBase64Encoded
?
Buffer.from(event.body,"base64")
:
Buffer.from(event.body);



busboy.end(body);



});


}









async function getDropboxAccessToken(){


const response =
await fetch(
"https://api.dropboxapi.com/oauth2/token",
{

method:"POST",

headers:{

"Content-Type":
"application/x-www-form-urlencoded"

},


body:new URLSearchParams({

refresh_token:
process.env.DROPBOX_REFRESH_TOKEN,


grant_type:
"refresh_token",


client_id:
process.env.DROPBOX_APP_KEY,


client_secret:
process.env.DROPBOX_APP_SECRET


})


});


const data =
await response.json();


return data.access_token;


}









async function uploadDropbox(
token,
file
){



let folder;


if(
file.filename.endsWith(".mp4")
){

folder="Videos";

}
else{

folder="Photos";

}



const path =
`/WeddingCamera/${folder}/${file.filename}`;





// Mazākiem failiem parastais upload

if(file.buffer.length < 8 * 1024 * 1024){


const response =
await fetch(
"https://content.dropboxapi.com/2/files/upload",
{


method:"POST",

headers:{


Authorization:
`Bearer ${token}`,


"Content-Type":
"application/octet-stream",


"Dropbox-API-Arg":
JSON.stringify({

path,

mode:"add",

autorename:true

})


},


body:file.buffer


});


return await response.json();


}






// Lieliem failiem upload session


const start =
await fetch(

"https://content.dropboxapi.com/2/files/upload_session/start",

{

method:"POST",

headers:{


Authorization:
`Bearer ${token}`,


"Content-Type":
"application/octet-stream"


},


body:file.buffer

}

);



const startData =
await start.json();



const finish =
await fetch(

"https://content.dropboxapi.com/2/files/upload_session/finish",

{

method:"POST",

headers:{


Authorization:
`Bearer ${token}`,


"Content-Type":
"application/octet-stream",


"Dropbox-API-Arg":
JSON.stringify({

cursor:{

session_id:
startData.session_id,

offset:
file.buffer.length

},


commit:{

path,

mode:"add"

}

})


},


body:Buffer.alloc(0)


}

);



return await finish.json();


}