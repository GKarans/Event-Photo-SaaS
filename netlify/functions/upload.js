/*
=========================================
Dropbox Upload Function

Netlify Function
Digitālā Vienreizlietojamā Kamera
=========================================
*/


const Busboy = require("busboy");



exports.handler = async function(event) {


    if(event.httpMethod !== "POST"){


        return {

            statusCode:405,

            body:
            JSON.stringify({
                error:"Method not allowed"
            })

        };

    }





    try {


        const fileData =
            await parseMultipart(
                event
            );



        const accessToken =
            await getDropboxAccessToken();




        const uploadResult =
            await uploadToDropbox(
                accessToken,
                fileData
            );




        return {


            statusCode:200,


            body:
            JSON.stringify({

                success:true,

                result:uploadResult

            })


        };



    }

    catch(error){


        console.error(error);



        return {


            statusCode:500,


            body:
            JSON.stringify({

                error:
                error.message

            })


        };


    }


};









// =====================================
// Multipart faila nolasīšana
// =====================================


function parseMultipart(event){


    return new Promise(
        (resolve,reject)=>{


            const busboy =
                Busboy({

                    headers:
                    event.headers

                });



            let fileBuffer;

            let filename;



            busboy.on(
                "file",
                (
                    field,
                    file,
                    info
                )=>{


                    filename =
                        info.filename;



                    const chunks=[];



                    file.on(
                        "data",
                        chunk=>{

                            chunks.push(
                                chunk
                            );

                        }
                    );



                    file.on(
                        "end",
                        ()=>{


                            fileBuffer =
                                Buffer.concat(
                                    chunks
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

                        buffer:fileBuffer,

                        filename:filename

                    });


                }
            );





            busboy.on(
                "error",
                reject
            );




            const buffer = event.isBase64Encoded
    ? Buffer.from(event.body, "base64")
    : Buffer.from(event.body);

busboy.end(buffer);


        }
    );


}









// =====================================
// Dropbox Access Token iegūšana
// =====================================


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


            }

        );




    const data =
        await response.json();




    if(!data.access_token){


        throw new Error(
            "Neizdevās iegūt Dropbox token"
        );


    }



    return data.access_token;



}









// =====================================
// Faila augšupielāde Dropbox
// =====================================


async function uploadToDropbox(
    token,
    file
){



    const response =
        await fetch(
            "https://content.dropboxapi.com/2/files/upload",
            {


                method:"POST",


                headers:{


                    "Authorization":
                    `Bearer ${token}`,


                    "Content-Type":
                    "application/octet-stream",


                    "Dropbox-API-Arg":
                    JSON.stringify({

                        path:
                        `/WeddingCamera/${file.filename}`,

                        mode:
                        "add",

                        autorename:
                        true,

                        mute:
                        true

                    })


                },


                body:
                file.buffer


            }

        );





    const result =
        await response.json();




    if(!response.ok){


        throw new Error(
            result.error_summary ||
            "Dropbox upload kļūda"
        );


    }




    return result;



}