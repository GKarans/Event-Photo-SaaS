/*
=========================================
Digitālā Vienreizlietojamā Kamera

Dropbox Video Upload Function

Kāzas 08.10.2026
=========================================
*/


const Busboy = require("busboy");





exports.handler = async function(event){


    if(event.httpMethod !== "POST"){


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
            await uploadVideoToDropbox(
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


        console.error(
            error
        );



        return {


            statusCode:500,


            body:JSON.stringify({

                error:
                error.message

            })


        };


    }



};











// =================================
// Multipart nolasīšana
// =================================

function parseMultipart(event){


return new Promise(
(resolve,reject)=>{


    const busboy =
        Busboy({

            headers:
            event.headers

        });



    let chunks = [];

    let filename = "";




    busboy.on(
        "file",
        (
            field,
            file,
            info
        )=>{



            filename =
                info.filename;



            file.on(
                "data",
                chunk=>{


                    chunks.push(
                        chunk
                    );


                }
            );



        }
    );






    busboy.on(
        "field",
        (
            name,
            value
        )=>{


            if(name==="filename"){


                filename =
                    value;


            }


        }
    );






    busboy.on(
        "finish",
        ()=>{


            resolve({

                buffer:
                Buffer.concat(chunks),


                filename

            });



        }
    );





    busboy.on(
        "error",
        reject
    );






    const body =
        event.isBase64Encoded

        ?

        Buffer.from(
            event.body,
            "base64"
        )

        :

        Buffer.from(
            event.body
        );



    busboy.end(body);



});


}












// =================================
// Dropbox token
// =================================

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


body:
new URLSearchParams({


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



if(!data.access_token){


throw new Error(
"Dropbox token kļūda"
);


}



return data.access_token;


}











// =================================
// Dropbox video upload
// =================================

async function uploadVideoToDropbox(
token,
file
){



const path =
`/WeddingCamera/Videos/${file.filename}`;






// sāk upload session

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


body:
file.buffer


}

);





const startData =
await start.json();





if(!startData.session_id){


throw new Error(
"Dropbox upload session neizdevās"
);


}







// pabeidz upload

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


mode:"add",


autorename:true


}


})


},


body:
Buffer.alloc(0)


}

);






const result =
await finish.json();



return result;



}